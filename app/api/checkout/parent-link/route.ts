import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_PLAN_ID, getLivePriceCents, getPlan } from '@/app/lib/billing/plans'
import { generateRawToken, hashToken, linkExpiresAt, CHECKOUT_STARTED_STALE_SECONDS } from '@/app/lib/billing/tokens'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'
import { getAppUrl } from '@/app/lib/billing/stripe'

export const dynamic = 'force-dynamic'

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? ''
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

export async function POST(request: NextRequest) {
  // Auth
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authResult = await getAuthUser(token)
  if (!authResult) return NextResponse.json({ error: 'Auth no configurada' }, { status: 500 })
  const { data, error: authError } = authResult
  if (authError || !data.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const user = data.user
  const userId = user.id

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* empty body ok */ }

  const planId = typeof body.planId === 'string' ? body.planId : DEFAULT_PLAN_ID
  const plan = getPlan(planId)
  if (!plan) return NextResponse.json({ error: 'Plan no reconocido' }, { status: 400 })

  const priceCents = getLivePriceCents(planId)
  if (!priceCents) return NextResponse.json({ error: 'Precio no disponible' }, { status: 500 })

  const studentDisplayName = typeof body.studentDisplayName === 'string'
    ? body.studentDisplayName.slice(0, 80)
    : null

  const parentEmail = typeof body.parentEmail === 'string'
    ? body.parentEmail.trim().toLowerCase().slice(0, 254)
    : null

  const db = createServiceClient()

  // Check if user already has an active entitlement for this plan
  const { data: existing } = await db
    .from('user_entitlements')
    .select('id, plan_id, status')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Ya tienes este plan activo' }, { status: 409 })
  }

  // Cancel previous created/opened links for this user+plan
  // Don't touch paid links. Handle checkout_started carefully.
  const now = new Date()
  const staleThreshold = new Date(now.getTime() - CHECKOUT_STARTED_STALE_SECONDS * 1000).toISOString()

  const { data: prevLinks } = await db
    .from('parent_checkout_links')
    .select('id, status, checkout_started_at')
    .eq('student_user_id', userId)
    .eq('plan_id', planId)
    .in('status', ['created', 'opened', 'checkout_started'])

  for (const link of prevLinks ?? []) {
    // If checkout_started recently, return it rather than creating a new one
    if (
      link.status === 'checkout_started' &&
      link.checkout_started_at &&
      link.checkout_started_at > staleThreshold
    ) {
      return NextResponse.json(
        { error: 'Hay un checkout activo reciente. Espera unos minutos antes de generar un nuevo enlace.' },
        { status: 409 }
      )
    }
    // Cancel stale links
    await db
      .from('parent_checkout_links')
      .update({ status: 'cancelled', cancelled_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', link.id)
  }

  // Generate token — only the hash is stored
  const rawToken = generateRawToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = linkExpiresAt()

  const { data: newLink, error: insertError } = await db
    .from('parent_checkout_links')
    .insert({
      student_user_id: userId,
      token_hash: tokenHash,
      plan_id: planId,
      price_cents: priceCents,
      currency: plan.currency,
      student_display_name: studentDisplayName,
      parent_email: parentEmail,
      expires_at: expiresAt.toISOString(),
      status: 'created',
      metadata: {}
    })
    .select('id')
    .single()

  if (insertError || !newLink) {
    return NextResponse.json({ error: 'Error al crear el enlace' }, { status: 500 })
  }

  // Billing event
  await db.from('billing_events').insert({
    user_id: userId,
    parent_checkout_link_id: newLink.id,
    event_type: 'parent_link_created',
    payload: { plan_id: planId, price_cents: priceCents }
  })

  const appUrl = getAppUrl()
  const checkoutUrl = `${appUrl}/parent-checkout/${rawToken}`

  return NextResponse.json({
    url: checkoutUrl,
    expiresAt: expiresAt.toISOString(),
    status: 'created'
  })
}
