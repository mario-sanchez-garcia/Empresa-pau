import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
const VALID_DAILY_MINUTES = [15, 25, 40] as const
const VALID_START_MODES = ['septiembre', 'empezado', 'retraso', 'intensivo'] as const

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const routeId = isValidRouteId(body.routeId) ? (body.routeId as string) : 'completa'
  const community = VALID_COMMUNITIES.includes(body.community as typeof VALID_COMMUNITIES[number])
    ? (body.community as string) : 'Otra'
  const dailyMinutes = VALID_DAILY_MINUTES.includes(body.dailyMinutes as typeof VALID_DAILY_MINUTES[number])
    ? (body.dailyMinutes as number) : 25
  const startMode = VALID_START_MODES.includes(body.startMode as typeof VALID_START_MODES[number])
    ? (body.startMode as string) : 'septiembre'

  const entryDate = new Date().toISOString().slice(0, 10)
  const userSupabase = createUserSupabase(accessToken)

  // Upsert route settings with entry date
  await userSupabase.from('camino_route_settings').upsert(
    {
      user_id: user.id,
      route_id: routeId,
      entry_date: entryDate,
      changed_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  )

  // Log onboarding event (reuse billing_events as generic event log)
  try {
    const serviceDb = createServiceClient()
    await serviceDb.from('billing_events').insert({
      user_id: user.id,
      event_type: 'onboarding_completed',
      payload: { community, daily_minutes: dailyMinutes, start_mode: startMode, route_id: routeId }
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, routeId, entryDate })
}
