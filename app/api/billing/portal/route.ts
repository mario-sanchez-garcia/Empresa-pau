import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createServiceClient } from '@/app/lib/billing/supabase'
import { getStripe, isStripeConfigured, getAppUrl } from '@/app/lib/billing/stripe'

export const dynamic = 'force-dynamic'

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? ''
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

// Opens Stripe's hosted Billing Portal so a user can cancel their subscription,
// update their card, or view invoices without emailing support — the
// self-service counterpart to premium becoming a real recurring subscription.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Facturación no configurada todavía.' }, { status: 503 })
  }

  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authResult = await getAuthUser(token)
  if (!authResult) return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  const { data, error: authError } = authResult
  if (authError || !data.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = createServiceClient()
  const { data: entitlement } = await db
    .from('user_entitlements')
    .select('stripe_customer_id')
    .eq('user_id', data.user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const stripeCustomerId = entitlement?.stripe_customer_id
  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'No hemos encontrado ninguna suscripción de pago asociada a tu cuenta.' }, { status: 404 })
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getAppUrl()}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
