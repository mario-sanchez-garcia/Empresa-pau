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

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, db)
  } else if (event.type === 'checkout.session.expired') {
    await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session, db)
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

  // Idempotency: check if entitlement already exists for this session
  const { data: existingEntitlement } = await db
    .from('user_entitlements')
    .select('id')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()

  if (existingEntitlement) {
    // Already processed — safe to acknowledge
    return
  }

  const now = new Date().toISOString()

  // Create entitlement — this is the ONLY place premium is activated
  const { error: entitlementError } = await db.from('user_entitlements').insert({
    user_id: studentUserId,
    plan_id: planId,
    source: 'stripe_parent_checkout',
    status: 'active',
    started_at: now,
    expires_at: null,
    stripe_checkout_session_id: sessionId,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    parent_checkout_link_id: parentCheckoutLinkId ?? null,
    metadata: {
      stripe_payment_intent: session.payment_intent,
      amount_total: session.amount_total,
      currency: session.currency,
    }
  })

  if (entitlementError) {
    console.error('[stripe/webhook] failed to create entitlement', entitlementError)
    // Don't return — still try to update the link and log the event
  }

  // Update parent_checkout_link to paid
  if (parentCheckoutLinkId) {
    await db
      .from('parent_checkout_links')
      .update({
        status: 'paid',
        paid_at: now,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        updated_at: now
      })
      .eq('id', parentCheckoutLinkId)
  }

  // Billing event (append-only audit)
  await db.from('billing_events').insert({
    user_id: studentUserId,
    parent_checkout_link_id: parentCheckoutLinkId ?? null,
    stripe_checkout_session_id: sessionId,
    event_type: 'checkout_completed',
    payload: {
      plan_id: planId,
      amount_total: session.amount_total,
      currency: session.currency,
      customer: session.customer,
      payment_intent: session.payment_intent,
      entitlement_error: entitlementError?.message ?? null,
    }
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
    payload: { session_id: sessionId }
  })
}
