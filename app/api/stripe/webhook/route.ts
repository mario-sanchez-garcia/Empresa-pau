import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, getWebhookSecret, isStripeConfigured } from '@/app/lib/billing/stripe'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

// Stripe requires the raw body for signature verification.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, getWebhookSecret())
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, db)
    } else if (event.type === 'checkout.session.expired') {
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, db)
    } else if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db)
    } else if (event.type === 'invoice.payment_failed') {
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, db)
    } else if (event.type === 'invoice.paid') {
      await handleInvoicePaid(event.data.object as Stripe.Invoice, db)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('[stripe/webhook] handler threw — returning 500 for Stripe retry', {
      eventType: event.type,
      message,
    })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  db: ReturnType<typeof createServiceClient>
) {
  const sessionId = session.id
  const meta = session.metadata ?? {}
  const studentUserId = meta.student_user_id
  const parentCheckoutLinkId = meta.parent_checkout_link_id
  const planId = meta.plan_id

  if (!studentUserId || !planId) {
    console.error('[stripe/webhook] checkout.session.completed missing metadata', { sessionId })
    return
  }

  const now = new Date().toISOString()
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

  // For real Stripe subscriptions (mode:'subscription'), expires_at should mirror
  // the actual billing period end rather than a flat "+30 days" guess — this is
  // what keeps access in sync as the subscription auto-renews each month.
  let expiresAt: string | null = null
  if (subscriptionId) {
    try {
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
      expiresAt = stripeTimestampToIso((subscription as unknown as { current_period_end?: unknown }).current_period_end)
    } catch (err) {
      console.error('[stripe/webhook] could not retrieve subscription at checkout completion', {
        sessionId,
        subscriptionId,
        message: err instanceof Error ? err.message : 'unknown error',
      })
    }
  }
  if (!expiresAt) {
    expiresAt =
      planId === 'pack_curso_pau' ? cursoPauExpiresAt() :
      planId === 'premium' ? premiumExpiresAt() :
      null
  }

  // ── Step 1: Idempotency check ─────────────────────────────────────────────
  // If an entitlement already exists for this Stripe session, a prior webhook
  // call already succeeded (or partially succeeded). Treat as idempotent:
  // ensure the parent link is also marked paid in case a prior run created the
  // entitlement but then failed to update the link.
  const { data: existingEntitlement } = await db
    .from('user_entitlements')
    .select('id, status')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()

  if (existingEntitlement) {
    console.log('[stripe/webhook] idempotent: entitlement already exists', {
      sessionId,
      entitlementId: existingEntitlement.id,
      parentCheckoutLinkId: parentCheckoutLinkId ?? null,
    })
    // Ensure parent link is paid — handles partial-failure recovery where
    // entitlement was created but link update failed on a prior attempt.
    if (parentCheckoutLinkId) {
      await db
        .from('parent_checkout_links')
        .update({ status: 'paid', paid_at: now, stripe_customer_id: stripeCustomerId, updated_at: now })
        .eq('id', parentCheckoutLinkId)
        .neq('status', 'paid')
    }
    return
  }

  // ── Step 2: Create entitlement — must succeed before touching the link ────
  // This is the ONLY place premium access is activated.
  // If insert fails, throw so the main handler returns 500 and Stripe retries.
  const { error: entitlementError } = await db.from('user_entitlements').insert({
    user_id: studentUserId,
    plan_id: planId,
    source: parentCheckoutLinkId ? 'stripe_parent_checkout' : 'stripe_self_checkout',
    status: 'active',
    started_at: now,
    expires_at: expiresAt,
    stripe_checkout_session_id: sessionId,
      stripe_customer_id: stripeCustomerId,
      parent_checkout_link_id: parentCheckoutLinkId ?? null,
      metadata: {
        stripe_payment_intent: session.payment_intent,
        stripe_subscription_id: subscriptionId,
        amount_total: session.amount_total,
        currency: session.currency,
      }
  })

  if (entitlementError) {
    console.error('[stripe/webhook] entitlement creation failed', {
      sessionId,
      studentUserId,
      parentCheckoutLinkId: parentCheckoutLinkId ?? null,
      planId,
      error: entitlementError.message,
    })
    // Attempt a safe audit log — non-critical, do not let its failure mask the real error.
    try {
      await db.from('billing_events').insert({
        user_id: studentUserId,
        parent_checkout_link_id: parentCheckoutLinkId ?? null,
        stripe_checkout_session_id: sessionId,
        event_type: 'checkout_entitlement_failed',
        payload: { plan_id: planId, error: entitlementError.message },
      })
    } catch { /* non-critical */ }
    // Throw — causes 500 so Stripe retries. Parent link is NOT marked paid.
    throw new Error(`entitlement creation failed: ${entitlementError.message}`)
  }

  // ── Step 3: Entitlement created — now mark parent link as paid ────────────
  // If this update fails, the entitlement already exists and is the source of
  // truth. On Stripe retry, the idempotency check (Step 1) will find the
  // entitlement and repair the link without creating a duplicate.
  if (parentCheckoutLinkId) {
    const { error: linkError } = await db
      .from('parent_checkout_links')
      .update({
        status: 'paid',
        paid_at: now,
        stripe_customer_id: stripeCustomerId,
        updated_at: now,
      })
      .eq('id', parentCheckoutLinkId)

    if (linkError) {
      console.error('[stripe/webhook] parent link update failed after entitlement created', {
        sessionId,
        parentCheckoutLinkId,
        error: linkError.message,
      })
      // Do not throw — entitlement is the authoritative record. Stripe retry
      // will reach Step 1 and repair the link.
    }
  }

  // ── Step 4: Append-only audit event ──────────────────────────────────────
  await db.from('billing_events').insert({
    user_id: studentUserId,
    parent_checkout_link_id: parentCheckoutLinkId ?? null,
    stripe_checkout_session_id: sessionId,
    event_type: 'checkout_completed',
    payload: {
      plan_id: planId,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_intent: session.payment_intent,
    },
  })
}

function premiumExpiresAt(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString()
}

function cursoPauExpiresAt(): string {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12; July = 7
  const year = month >= 7 ? now.getFullYear() + 1 : now.getFullYear()
  return `${year}-06-30T23:59:59.000Z`
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  db: ReturnType<typeof createServiceClient>
) {
  const sessionId = session.id
  const meta = session.metadata ?? {}
  const parentCheckoutLinkId = meta.parent_checkout_link_id
  const studentUserId = meta.student_user_id

  // Only transition links that have NOT been paid — never downgrade a paid link.
  if (parentCheckoutLinkId) {
    await db
      .from('parent_checkout_links')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', parentCheckoutLinkId)
      .in('status', ['checkout_started', 'opened', 'created'])
  }

  await db.from('billing_events').insert({
    user_id: studentUserId ?? null,
    parent_checkout_link_id: parentCheckoutLinkId ?? null,
    stripe_checkout_session_id: sessionId,
    event_type: 'checkout_expired',
    payload: { session_id: sessionId },
  })
}

function stripeId(value: unknown): string | null {
  if (typeof value === 'string' && value) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' && id ? id : null
  }
  return null
}

function stripeTimestampToIso(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null
}

function latestIsoDate(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null
  if (!b) return a
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  db: ReturnType<typeof createServiceClient>
) {
  const subscriptionId = subscription.id
  const stripeCustomerId = stripeId(subscription.customer)
  if (!stripeCustomerId) {
    console.error('[stripe/webhook] customer.subscription.deleted missing customer', { subscriptionId })
    return
  }

  const now = new Date().toISOString()
  const paidThrough = stripeTimestampToIso((subscription as unknown as { current_period_end?: unknown }).current_period_end)
    ?? stripeTimestampToIso(subscription.ended_at)
    ?? stripeTimestampToIso(subscription.canceled_at)
    ?? now

  const { data: entitlements, error } = await db
    .from('user_entitlements')
    .select('id, user_id, expires_at, metadata')
    .eq('stripe_customer_id', stripeCustomerId)
    .eq('status', 'active')

  if (error) throw new Error(`subscription deleted entitlement lookup failed: ${error.message}`)

  for (const entitlement of entitlements ?? []) {
    const metadata = (entitlement.metadata && typeof entitlement.metadata === 'object')
      ? entitlement.metadata as Record<string, unknown>
      : {}
    const accessUntil = latestIsoDate(entitlement.expires_at as string | null, paidThrough)

    const { error: updateError } = await db
      .from('user_entitlements')
      .update({
        expires_at: accessUntil,
        updated_at: now,
        metadata: {
          ...metadata,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: subscription.status,
          stripe_subscription_deleted_at: now,
          access_until_after_subscription_deleted: accessUntil,
        },
      })
      .eq('id', entitlement.id)

    if (updateError) throw new Error(`subscription deleted entitlement update failed: ${updateError.message}`)

    await db.from('billing_events').insert({
      user_id: entitlement.user_id,
      stripe_checkout_session_id: null,
      event_type: 'subscription_deleted_access_until_period_end',
      payload: {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: subscriptionId,
        access_until: accessUntil,
        stripe_status: subscription.status,
      },
    })
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  db: ReturnType<typeof createServiceClient>
) {
  const invoiceId = invoice.id
  const stripeCustomerId = stripeId(invoice.customer)
  if (!stripeCustomerId) {
    console.error('[stripe/webhook] invoice.payment_failed missing customer', { invoiceId })
    return
  }

  const subscriptionId = stripeId((invoice as unknown as { subscription?: unknown }).subscription)
  const now = new Date().toISOString()
  const { data: entitlements, error } = await db
    .from('user_entitlements')
    .select('id, user_id, metadata')
    .eq('stripe_customer_id', stripeCustomerId)
    .eq('status', 'active')

  if (error) throw new Error(`payment failed entitlement lookup failed: ${error.message}`)

  for (const entitlement of entitlements ?? []) {
    const metadata = (entitlement.metadata && typeof entitlement.metadata === 'object')
      ? entitlement.metadata as Record<string, unknown>
      : {}

    const { error: updateError } = await db
      .from('user_entitlements')
      .update({
        updated_at: now,
        metadata: {
          ...metadata,
          stripe_payment_status: 'payment_failed',
          stripe_payment_failed_at: now,
          stripe_latest_invoice_id: invoiceId,
          stripe_subscription_id: subscriptionId ?? metadata.stripe_subscription_id ?? null,
        },
      })
      .eq('id', entitlement.id)

    if (updateError) throw new Error(`payment failed entitlement update failed: ${updateError.message}`)

    await db.from('billing_events').insert({
      user_id: entitlement.user_id,
      stripe_checkout_session_id: null,
      event_type: 'invoice_payment_failed',
      payload: {
        stripe_customer_id: stripeCustomerId,
        stripe_invoice_id: invoiceId,
        stripe_subscription_id: subscriptionId,
      },
    })
  }
}

// Fires on every successful invoice for a subscription — both the first one
// (roughly simultaneous with checkout.session.completed, handled there) and
// every monthly renewal after that (the only place renewals get applied,
// since Stripe auto-charges the card with no further checkout session).
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  db: ReturnType<typeof createServiceClient>
) {
  const invoiceId = invoice.id
  const stripeCustomerId = stripeId(invoice.customer)
  if (!stripeCustomerId) {
    console.error('[stripe/webhook] invoice.paid missing customer', { invoiceId })
    return
  }

  const subscriptionId = stripeId((invoice as unknown as { subscription?: unknown }).subscription)
  if (!subscriptionId) return // one-off (non-subscription) invoice — nothing to renew

  let periodEndIso: string | null = null
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
    periodEndIso = stripeTimestampToIso((subscription as unknown as { current_period_end?: unknown }).current_period_end)
  } catch (err) {
    console.error('[stripe/webhook] could not retrieve subscription for renewal', {
      subscriptionId,
      invoiceId,
      message: err instanceof Error ? err.message : 'unknown error',
    })
  }
  if (!periodEndIso) return // can't safely extend access without a real period end

  const now = new Date().toISOString()
  const { data: entitlements, error } = await db
    .from('user_entitlements')
    .select('id, user_id, expires_at, metadata')
    .eq('stripe_customer_id', stripeCustomerId)
    .eq('status', 'active')

  if (error) throw new Error(`invoice paid entitlement lookup failed: ${error.message}`)

  // If checkout.session.completed hasn't created the entitlement yet (event
  // ordering isn't guaranteed), there's nothing to extend yet — it will be
  // created with the correct period end there. Not an error, just a no-op.
  for (const entitlement of entitlements ?? []) {
    const metadata = (entitlement.metadata && typeof entitlement.metadata === 'object')
      ? entitlement.metadata as Record<string, unknown>
      : {}

    const { error: updateError } = await db
      .from('user_entitlements')
      .update({
        expires_at: periodEndIso,
        updated_at: now,
        metadata: {
          ...metadata,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: 'active',
          stripe_payment_status: 'paid',
          stripe_latest_invoice_id: invoiceId,
          stripe_payment_failed_at: null,
        },
      })
      .eq('id', entitlement.id)

    if (updateError) throw new Error(`invoice paid entitlement update failed: ${updateError.message}`)

    await db.from('billing_events').insert({
      user_id: entitlement.user_id,
      stripe_checkout_session_id: null,
      event_type: 'subscription_renewed',
      payload: {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: subscriptionId,
        stripe_invoice_id: invoiceId,
        expires_at: periodEndIso,
      },
    })
  }
}
