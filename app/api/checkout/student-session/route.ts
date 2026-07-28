import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createServiceClient } from '@/app/lib/billing/supabase'
import { getStripe, isStripeConfigured, getAppUrl } from '@/app/lib/billing/stripe'
import { getPlan, getLivePriceCents } from '@/app/lib/billing/plans'
import { checkServerRateLimit, getClientIp } from '@/app/lib/serverRateLimit'

export const dynamic = 'force-dynamic'

const ALLOWED_PLAN_IDS = ['pack_curso_pau', 'premium'] as const

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? ''
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const ipLimit = checkServerRateLimit({ key: `student-checkout:ip:${ip}`, limit: 10, windowSeconds: 60 })
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un momento.', code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429, headers: ipLimit.retryAfterSeconds ? { 'Retry-After': String(ipLimit.retryAfterSeconds) } : {} }
    )
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Pagos no configurados todavía.' }, { status: 503 })
  }

  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authResult = await getAuthUser(token)
  if (!authResult) return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  const { data, error: authError } = authResult
  if (authError || !data.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = data.user.id

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const planId = typeof body.plan_id === 'string' ? body.plan_id.trim() : null
  if (!planId || !(ALLOWED_PLAN_IDS as readonly string[]).includes(planId)) {
    return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
  }

  const plan = getPlan(planId)
  if (!plan) return NextResponse.json({ error: 'Plan no reconocido' }, { status: 400 })

  // Block if already has an active entitlement to avoid double payment
  const db = createServiceClient()
  const now = new Date().toISOString()
  const { data: existing } = await db
    .from('user_entitlements')
    .select('id, plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Ya tienes un plan activo.' }, { status: 409 })
  }

  const priceCents = getLivePriceCents(planId) ?? plan.priceCents
  const appUrl = getAppUrl()
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          unit_amount: priceCents,
          product_data: {
            name: plan.label,
            description: plan.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      student_user_id: userId,
      plan_id: planId,
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  await db.from('billing_events').insert({
    user_id: userId,
    stripe_checkout_session_id: session.id,
    event_type: 'student_checkout_session_created',
    payload: { plan_id: planId, price_cents: priceCents },
  })

  return NextResponse.json({ checkoutUrl: session.url })
}
