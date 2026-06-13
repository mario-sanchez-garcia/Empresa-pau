import { NextRequest, NextResponse } from 'next/server'
import { hashToken } from '@/app/lib/billing/tokens'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getStripe, isStripeConfigured, getAppUrl } from '@/app/lib/billing/stripe'
import { getLivePriceCents, getPlan } from '@/app/lib/billing/plans'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Pagos no configurados todavía. Contacta con soporte.' },
      { status: 503 }
    )
  }

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const rawToken = typeof body.token === 'string' ? body.token.trim() : null
  if (!rawToken || rawToken.length < 10) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
  }

  const tokenHash = hashToken(rawToken)
  const db = createServiceClient()
  const now = new Date()

  const { data: link } = await db
    .from('parent_checkout_links')
    .select('id, student_user_id, plan_id, price_cents, currency, student_display_name, status, expires_at, stripe_checkout_session_id')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!link) {
    return NextResponse.json({ error: 'Enlace no válido' }, { status: 404 })
  }

  if (link.status === 'paid') {
    return NextResponse.json({ error: 'Este pack ya está activado' }, { status: 409 })
  }

  if (link.status === 'cancelled' || link.status === 'failed') {
    return NextResponse.json({ error: 'Este enlace ya no está disponible' }, { status: 410 })
  }

  if (new Date(link.expires_at) < now) {
    await db
      .from('parent_checkout_links')
      .update({ status: 'expired', updated_at: now.toISOString() })
      .eq('id', link.id)
    return NextResponse.json({ error: 'Este enlace ha caducado' }, { status: 410 })
  }

  // Verify plan and get live price
  const plan = getPlan(link.plan_id)
  if (!plan) {
    return NextResponse.json({ error: 'Plan no reconocido' }, { status: 400 })
  }

  const livePriceCents = getLivePriceCents(link.plan_id) ?? link.price_cents
  const appUrl = getAppUrl()
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: link.currency,
          unit_amount: livePriceCents,
          product_data: {
            name: plan.label,
            description: `Camino PAU${link.student_display_name ? ` para ${link.student_display_name}` : ''}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      student_user_id: link.student_user_id,
      parent_checkout_link_id: link.id,
      plan_id: link.plan_id,
    },
    success_url: `${appUrl}/parent-checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/parent-checkout/${rawToken}`,
    // Stripe requires expires_at < 24h from now. The parent link may live 7 days,
    // but the Stripe session only needs to stay open long enough to complete payment.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  // Update link status
  await db
    .from('parent_checkout_links')
    .update({
      status: 'checkout_started',
      checkout_started_at: now.toISOString(),
      stripe_checkout_session_id: session.id,
      updated_at: now.toISOString()
    })
    .eq('id', link.id)

  // Mark as opened if not already
  if (link.status === 'created') {
    await db
      .from('parent_checkout_links')
      .update({ opened_at: now.toISOString() })
      .eq('id', link.id)
      .is('opened_at', null)
  }

  // Billing event
  await db.from('billing_events').insert({
    user_id: link.student_user_id,
    parent_checkout_link_id: link.id,
    stripe_checkout_session_id: session.id,
    event_type: 'checkout_session_created',
    payload: { plan_id: link.plan_id, price_cents: livePriceCents }
  })

  return NextResponse.json({ checkoutUrl: session.url })
}
