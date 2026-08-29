import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { recordMissionBehaviorEvent } from '@/app/lib/camino/missionBehavior'

export const dynamic = 'force-dynamic'

function isMissingTelemetrySchema(error: { code?: string; message?: string } | null | undefined) {
  return error?.code === '42703' || error?.code === '42P01'
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }
    const missionId = typeof body.calendarRowId === 'string'
      ? body.calendarRowId
      : typeof body.missionId === 'string'
        ? body.missionId
        : null
    if (!missionId) {
      return NextResponse.json({ error: 'mission_id_required' }, { status: 400 })
    }

    const db = createServiceClient()
    const now = new Date().toISOString()
    const { data: updated, error } = await db
      .from('camino_calendar')
      .update({ started_at: now, updated_at: now })
      .eq('id', missionId)
      .eq('user_id', auth.user.id)
      .is('started_at', null)
      .in('status', ['pending', 'missed'])
      .select('id, started_at')

    if (isMissingTelemetrySchema(error)) {
      console.warn('[camino/start-mission] telemetry schema unavailable, skipped')
      return NextResponse.json({ ok: true, started: false, telemetrySkipped: true })
    }
    if (error) throw error

    const startedNow = Boolean(updated?.[0]?.id)
    if (startedNow) {
      await recordMissionBehaviorEvent(db, auth.user.id, missionId, 'started', 'started', { source: 'explicit_mission_open' })
    }

    return NextResponse.json({ ok: true, started: startedNow })
  } catch (error) {
    console.error('[camino/start-mission]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
