import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? ''
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authResult = await getAuthUser(token)
  if (!authResult) return NextResponse.json({ error: 'Auth no configurada' }, { status: 500 })
  const { data, error: authError } = authResult
  if (authError || !data.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = data.user.id
  const db = createServiceClient()
  const now = new Date().toISOString()

  // Active entitlements (not expired by time)
  const { data: entitlements } = await db
    .from('user_entitlements')
    .select('id, plan_id, status, started_at, expires_at, source')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })

  const active = entitlements ?? []

  // Pending parent checkout links (not paid, not expired, not cancelled)
  const { data: pendingLinks } = await db
    .from('parent_checkout_links')
    .select('id, plan_id, status, expires_at, created_at')
    .eq('student_user_id', userId)
    .in('status', ['created', 'opened', 'checkout_started'])
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)

  const pendingLink = pendingLinks?.[0] ?? null

  return NextResponse.json({
    hasActivePack: active.length > 0,
    activePlans: active.map(e => ({
      planId: e.plan_id,
      expiresAt: e.expires_at ?? null,
      startedAt: e.started_at,
      source: e.source,
    })),
    pendingParentCheckout: pendingLink
      ? {
          planId: pendingLink.plan_id,
          status: pendingLink.status,
          expiresAt: pendingLink.expires_at,
        }
      : null,
  })
}
