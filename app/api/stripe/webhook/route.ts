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
    source: 'stripe_parent_checkout',
    status: 'active',
    started_at: now,
    expires_at: null,
    stripe_checkout_session_id: sessionId,
    stripe_customer_id: stripeCustomerId,
    parent_checkout_link_id: parentCheckoutLinkId ?? null,
    metadata: {
      stripe_payment_intent: session.payment_intent,
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
