import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { divisionFor } from '@/app/lib/camino/leagues'
import { calcularRacha } from '@/app/lib/calcularRacha'

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
    const { data: updated } = await db
      .from('camino_calendar')
      .update({
        status: 'completed',
        completed_at: now,
        xp_awarded: xp,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .eq('status', 'pending')
      .select('id')

    // PASO 4 — Idempotencia: 0 filas afectadas = ya completada o no existe
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, reason: 'already_completed' })
    }

    // PASO 2b — Marcar cola como completada (best-effort)
    await db
      .from('user_learning_queue')
      .update({ queue_status: 'completed' })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)

    // PASO 2c — Registrar XP event
    const { error: xpError } = await db.from('camino_xp_events').insert({
      user_id: user.id,
      xp_amount: xp,
      source_type: 'camino_mission',
      source_id: String(updated[0].id),
      mission_date: new Date().toISOString().slice(0, 10),
    })
    if (xpError) {
      console.error('[camino/complete-mission] xp_event insert failed', xpError)
    }
    await recordBetaMetric(db, user.id, 'correction_completed', {
      subject,
      v2_sort_order: v2SortOrder,
      mission_type: missionType,
      title,
    })
    await recordBetaMetric(db, user.id, 'xp_awarded', {
      subject,
      v2_sort_order: v2SortOrder,
      mission_type: missionType,
      xp,
    })

    // PASO 3 — Actualizar camino_user_progress
    const { data: currentProgress } = await db
      .from('camino_user_progress')
      .select('xp_total, missions_completed, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle()

    const oldXpTotal = Number(currentProgress?.xp_total) || 0
    const newXpTotal = oldXpTotal + xp
    const newMissionsCompleted = (Number(currentProgress?.missions_completed) || 0) + 1
    const newStreakDays = await calcularRacha(user.id, db).catch(() => null)
    const newLongestStreak = newStreakDays == null
      ? Number(currentProgress?.longest_streak ?? 0)
      : Math.max(Number(currentProgress?.longest_streak ?? 0), newStreakDays)
    const oldDivision = divisionFor(oldXpTotal)
    const newDivision = divisionFor(newXpTotal)
    const leagueUpgrade = newDivision.name !== oldDivision.name
      ? { from: oldDivision.name, to: newDivision.name }
      : null

    if (!currentProgress) {
      await db.from('camino_user_progress').insert({
        user_id: user.id,
        xp_total: xp,
        streak_days: newStreakDays ?? 0,
        longest_streak: newLongestStreak,
        missions_completed: 1,
        level_mates: 1,
        level_historia: 1,
        level_ingles: 1,
        progress_towards_pau: 1,
        updated_at: now,
      })
    } else {
      await db
        .from('camino_user_progress')
        .update({
          xp_total: newXpTotal,
          missions_completed: newMissionsCompleted,
          ...(newStreakDays == null ? {} : { streak_days: newStreakDays, longest_streak: newLongestStreak }),
          updated_at: now,
        })
        .eq('user_id', user.id)
    }

    // PASO 5 — Respuesta
    return NextResponse.json({ success: true, xpAwarded: xp, totalXp: newXpTotal, streakDays: newStreakDays, leagueUpgrade })
  } catch (err) {
    console.error('[camino/complete-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
