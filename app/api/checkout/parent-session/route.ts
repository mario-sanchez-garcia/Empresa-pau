import { NextRequest, NextResponse } from 'next/server'
import { hashToken } from '@/app/lib/billing/tokens'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getStripe, isStripeConfigured, getAppUrl } from '@/app/lib/billing/stripe'
import { getLivePriceCents, getPlan } from '@/app/lib/billing/plans'
import { checkServerRateLimit, getClientIp } from '@/app/lib/serverRateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ipLimit = checkServerRateLimit({
    key: `parent-checkout-session:ip:${getClientIp(request.headers)}`,
    limit: 30,
    windowSeconds: 60
  })
  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds)
  }

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

  // Require explicit withdrawal waiver
  if (!body.withdrawal_accepted) {
    return NextResponse.json({ error: 'Debes aceptar la renuncia al desistimiento antes de pagar.' }, { status: 400 })
  }
  const withdrawalVersion = typeof body.withdrawal_version === 'string' ? body.withdrawal_version : 'unknown'

  const tokenHash = hashToken(rawToken)
  const tokenLimit = checkServerRateLimit({
    key: `parent-checkout-session:token:${tokenHash}`,
    limit: 8,
    windowSeconds: 15 * 60
  })
  if (!tokenLimit.allowed) {
    return rateLimitResponse(tokenLimit.retryAfterSeconds)
  }

  const db = createServiceClient()
  const now = new Date()

  const { data: link } = await db
    .from('parent_checkout_links')
    .select('id, student_user_id, plan_id, price_cents, currency, student_display_name, status, expires_at, checkout_started_at, stripe_checkout_session_id')
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

  if (link.status === 'checkout_started' && link.stripe_checkout_session_id && link.checkout_started_at) {
    const startedAt = new Date(link.checkout_started_at).getTime()
    const stillFresh = Number.isFinite(startedAt) && now.getTime() - startedAt < 30 * 60 * 1000
    if (stillFresh) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(link.stripe_checkout_session_id)
        if (existingSession.status === 'open' && existingSession.url) {
          return NextResponse.json({ checkoutUrl: existingSession.url })
        }
      } catch (error) {
        console.warn('[parent-session] could not reuse existing checkout session', {
          linkId: link.id,
          message: error instanceof Error ? error.message : 'unknown error'
        })
      }
    }
  }

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

  // Record withdrawal waiver — mandatory for the digital-content exception (TRLGDCU art. 103.m)
  await db.from('billing_events').insert({
    user_id: link.student_user_id,
    parent_checkout_link_id: link.id,
    stripe_checkout_session_id: session.id,
    event_type: 'withdrawal_waiver_accepted',
    payload: { plan_id: link.plan_id, withdrawal_version: withdrawalVersion, source: 'parent_checkout' },
  })

  return NextResponse.json({ checkoutUrl: session.url })
}

function rateLimitResponse(retryAfterSeconds?: number) {
  return NextResponse.json(
    {
      error: 'Demasiados intentos. Espera un momento y vuelve a probar.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: retryAfterSeconds ?? null
    },
    {
      status: 429,
      headers: retryAfterSeconds ? { 'Retry-After': String(retryAfterSeconds) } : undefined
    }
  )
}
