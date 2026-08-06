import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { awardXp } from '@/app/lib/camino/awardXp'
import { resolveMissionTypeXp } from '@/app/lib/camino/xpMap'

export const dynamic = 'force-dynamic'

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
    // Nota normalizada sobre 10, si el cliente ya corrigió esta misión con
    // rúbrica (ver /api/camino/correct) antes de marcarla completada — misma
    // confianza en el cliente que ya existe hoy en el resto de la app para
    // notas (p.ej. historial_examenes.nota se inserta directo desde cliente).
    const rawScore = typeof body.score === 'number' ? body.score : null
    const scoreOnTen = rawScore != null && Number.isFinite(rawScore) ? Math.min(10, Math.max(0, rawScore)) : null

    if (!subject || v2SortOrder == null) {
      return NextResponse.json(
        { error: 'subject y v2SortOrder son obligatorios' },
        { status: 400 },
      )
    }

    // PASO 1 — XP base siempre calculado en servidor; el bonus de calidad lo
    // añade awardXp() por encima según scoreOnTen.
    const xp = resolveMissionTypeXp(missionType)

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
      scoreOnTen,
    })

    // PASO 4b — El PASO 2 ya guardó xp_awarded=xp (solo la base, antes de
    // saber la nota) para poder marcar la fila como completada de forma
    // atómica sin esperar a la corrección. Ahora que awardXp() ya calculó el
    // bonus de calidad, se corrige ese valor al total real — si no, la
    // tarjeta de esta misión en Camino se queda mostrando para siempre el XP
    // base sin bonus aunque el alumno haya sacado buena nota. Best-effort:
    // si falla, el XP real ya está bien escrito en camino_xp_events/
    // camino_user_progress, solo se pierde la actualización de este badge.
    if (result.awarded && result.xpAwarded !== xp) {
      await db.from('camino_calendar').update({ xp_awarded: result.xpAwarded }).eq('id', updated[0].id)
    }

    // PASO 5 — Respuesta
    return NextResponse.json({ success: true, xpAwarded: result.xpAwarded, bonusXp: result.bonusXp, totalXp: result.totalXp, streakDays: result.streakDays, leagueUpgrade: result.leagueUpgrade })
  } catch (err) {
    console.error('[camino/complete-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
