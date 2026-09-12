import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { recordMissionBehaviorEvent } from '@/app/lib/camino/missionBehavior'
import {
  SEGMENT_CLOSED,
  SEGMENT_OPENED,
  clampClientTimestamp,
  parseMarkers,
  truncateMarkers,
} from '@/app/lib/camino/activitySegments'

export const dynamic = 'force-dynamic'

function isMissingTelemetrySchema(error: { code?: string; message?: string } | null | undefined) {
  return error?.code === '42703' || error?.code === '42P01'
}

/**
 * Ingesta de tramos de actividad. Dos tipos de evento, append-only, unidos por
 * `segmentId`: la apertura se escribe en cuanto se conoce el clic y el cierre
 * cuando el tramo acaba.
 *
 * Sobre los timestamps: los pone el cliente porque son los únicos que saben
 * cuándo ocurrió de verdad (la cola offline puede entregar un tramo de hace
 * horas con sus marcas originales, y reescribirlas al momento del envío
 * destruiría el dato). Pero no se aceptan a ciegas. Aquí solo se corrige lo
 * imposible —una marca en el futuro— y el resto de la validación la hace la
 * derivación comparando `occurred_at` con el `created_at` que pone Postgres,
 * que es la única referencia temporal que el cliente no controla.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const missionId = typeof body.missionId === 'string' ? body.missionId : null
    const segmentId = typeof body.segmentId === 'string' ? body.segmentId : null
    const type = body.type === 'opened' ? 'opened' : body.type === 'closed' ? 'closed' : null
    if (!missionId || !segmentId || !type) {
      return NextResponse.json({ error: 'missionId, segmentId y type son obligatorios' }, { status: 400 })
    }

    const db = createServiceClient()
    const nowMs = Date.now()

    // El cliente marca sobre qué misión escribe, así que hay que comprobar que
    // es suya: se escribe con service role, que se salta RLS.
    const { data: mission, error: missionError } = await db
      .from('camino_calendar')
      .select('id, started_at')
      .eq('id', missionId)
      .eq('user_id', auth.user.id)
      .maybeSingle()
    if (missionError && !isMissingTelemetrySchema(missionError)) throw missionError
    if (!mission) return NextResponse.json({ error: 'mission_not_found' }, { status: 404 })

    const occurred = clampClientTimestamp(body.occurredAt, nowMs)
    const origin = typeof body.origin === 'string' ? body.origin.slice(0, 64) : 'unknown'

    if (type === 'opened') {
      const openReason = body.openReason === 'camino_click'
        || body.openReason === 'first_engagement'
        || body.openReason === 'resumed'
        ? body.openReason
        : 'first_engagement'

      await recordMissionBehaviorEvent(db, auth.user.id, missionId, SEGMENT_OPENED, segmentId, {
        segment_id: segmentId,
        open_reason: openReason,
        origin,
        seq: typeof body.seq === 'number' && Number.isFinite(body.seq) ? body.seq : 1,
        ...(occurred.clamped ? { t0_clamped: true } : {}),
      }, new Date(occurred.ms).toISOString())

      // `started_at` conserva su significado —primer indicio de actividad— y
      // ahora lo escribe la apertura del primer tramo, en esta misma petición:
      // no añade escrituras y deja de depender de que la página cargara.
      if (!mission.started_at) {
        const startedIso = new Date(occurred.ms).toISOString()
        const { error } = await db
          .from('camino_calendar')
          .update({ started_at: startedIso, updated_at: new Date(nowMs).toISOString() })
          .eq('id', missionId)
          .eq('user_id', auth.user.id)
          .is('started_at', null)
        if (error && !isMissingTelemetrySchema(error)) throw error
        await recordMissionBehaviorEvent(db, auth.user.id, missionId, 'started', 'started', {
          source: 'activity_segment',
        }, startedIso)
      }

      return NextResponse.json({ ok: true })
    }

    const { markers, truncated } = truncateMarkers(parseMarkers(body.markers))
    const startedAt = clampClientTimestamp(body.startedAt, nowMs)
    const lastActivityAt = clampClientTimestamp(body.lastActivityAt ?? body.occurredAt, nowMs)
    const closeReason = typeof body.closeReason === 'string' ? body.closeReason : 'hidden'

    await recordMissionBehaviorEvent(db, auth.user.id, missionId, SEGMENT_CLOSED, segmentId, {
      segment_id: segmentId,
      origin,
      started_at: new Date(startedAt.ms).toISOString(),
      last_activity_at: new Date(lastActivityAt.ms).toISOString(),
      close_reason: closeReason,
      markers,
      markers_truncated: truncated || body.markersTruncated === true,
      ...(occurred.clamped || startedAt.clamped || lastActivityAt.clamped ? { t0_clamped: true } : {}),
    }, new Date(occurred.ms).toISOString())

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[camino/mission-activity]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
