import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { awardXp } from '@/app/lib/camino/awardXp'

export const dynamic = 'force-dynamic'

const XP_MAP: Record<string, number> = {
  concept: 20,
  review: 10,
  pau_practice: 30,
  comment_text: 30,
  mock_exam: 50,
  bonus: 10,
  recovery: 10,
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subject = typeof body.subject === 'string' ? body.subject : null
    const v2SortOrder = typeof body.v2SortOrder === 'number' ? body.v2SortOrder : null
    const calendarRowId = typeof body.calendarRowId === 'string' ? body.calendarRowId : null
    const missionType = typeof body.missionType === 'string' ? body.missionType : 'concept'
    const title = typeof body.title === 'string' ? body.title : null

    if (!subject || v2SortOrder == null) {
      return NextResponse.json(
        { error: 'subject y v2SortOrder son obligatorios' },
        { status: 400 },
      )
    }

    // PASO 1 — XP siempre calculado en servidor
    const xp = XP_MAP[missionType] ?? 20

    const db = createServiceClient()
    const now = new Date().toISOString()

    // PASO 2 — Marcar calendario como completado y detectar si ya estaba
    let updateQuery = db
      .from('camino_calendar')
      .update({
        status: 'completed',
        completed_at: now,
        xp_awarded: xp,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    updateQuery = calendarRowId
      ? updateQuery.eq('id', calendarRowId)
      : updateQuery.eq('subject', subject).eq('v2_sort_order', v2SortOrder)

    const { data: updated } = await updateQuery
      .select('id')

    // PASO 4 — Idempotencia: 0 filas afectadas = ya completada o no existe
    if (!updated || updated.length === 0) {
      let existingQuery = db
        .from('camino_calendar')
        .select('id, status')
        .eq('user_id', user.id)

      existingQuery = calendarRowId
        ? existingQuery.eq('id', calendarRowId)
        : existingQuery.eq('subject', subject).eq('v2_sort_order', v2SortOrder)

      const { data: existing } = await existingQuery.limit(10)

      const reason = existing?.some(row => row.status === 'completed')
        ? 'already_completed'
        : 'no_pending_mission'

      return NextResponse.json({ success: false, reason })
    }

    // PASO 2b — Marcar cola como completada (best-effort)
    await db
      .from('user_learning_queue')
      .update({ queue_status: 'completed' })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)

    await recordBetaMetric(db, user.id, 'correction_completed', {
      subject,
      v2_sort_order: v2SortOrder,
      calendar_row_id: calendarRowId,
      mission_type: missionType,
      title,
    })
    await recordBetaMetric(db, user.id, 'xp_awarded', {
      subject,
      v2_sort_order: v2SortOrder,
      calendar_row_id: calendarRowId,
      mission_type: missionType,
      xp,
    })

    // PASO 3 — Registrar XP y actualizar camino_user_progress (un mismo
    // helper compartido con exam_correction/simulacro_completion/parcial_completion)
    const result = await awardXp(db, user.id, {
      xp,
      sourceType: 'mission_completion',
      sourceId: String(updated[0].id),
      subject,
      missionDate: now.slice(0, 10),
      missionsCompletedDelta: 1,
    })

    // PASO 5 — Respuesta
    return NextResponse.json({ success: true, xpAwarded: result.xpAwarded, totalXp: result.totalXp, streakDays: result.streakDays, leagueUpgrade: result.leagueUpgrade })
  } catch (err) {
    console.error('[camino/complete-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
