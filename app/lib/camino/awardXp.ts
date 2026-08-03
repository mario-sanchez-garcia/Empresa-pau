import 'server-only'

import { type SupabaseClient } from '@supabase/supabase-js'
import { divisionFor } from './leagues'
import { calcularRacha } from '../calcularRacha'

// Único lugar donde se escribe XP de verdad — usado por complete-mission
// (misiones de Camino) y por cualquier otra acción que también deba dar XP
// (corrección de examen, simulacro, parcial). Nunca confíes en un XP que
// venga del cliente: cada llamador pasa un `xp` fijo decidido en su propio
// código de servidor, igual que ya hacía complete-mission con su XP_MAP.
export type XpSourceType =
  | 'mission_completion'
  | 'exam_correction'
  | 'simulacro_completion'
  | 'parcial_completion'

export type AwardXpResult = {
  // false = esta fuente ya había dado XP antes (mismo user+source_type+source_id+mission_date);
  // no-op idempotente, no un error.
  awarded: boolean
  xpAwarded: number
  totalXp: number
  streakDays: number | null
  leagueUpgrade: { from: string; to: string } | null
}

export async function awardXp(
  db: SupabaseClient,
  userId: string,
  args: {
    xp: number
    sourceType: XpSourceType
    sourceId: string
    subject?: string | null
    // Fecha estable del evento origen (p.ej. la fecha de creación del examen/
    // simulacro), NUNCA "hoy" — si un reintento de corrección cae otro día
    // natural, "hoy" cambiaría y el unique constraint (user,source_type,
    // source_id,mission_date) dejaría de detectar el duplicado.
    missionDate: string
    missionsCompletedDelta?: number
  },
): Promise<AwardXpResult> {
  const { error: xpError } = await db.from('camino_xp_events').insert({
    user_id: userId,
    xp_amount: args.xp,
    source_type: args.sourceType,
    source_id: args.sourceId,
    mission_date: args.missionDate,
    subject: args.subject ?? null,
  })

  if (xpError) {
    if (xpError.code === '23505') {
      // Ya se otorgó XP para este source_id — no-op idempotente, no error.
      const { data: progress } = await db
        .from('camino_user_progress')
        .select('xp_total')
        .eq('user_id', userId)
        .maybeSingle()
      return { awarded: false, xpAwarded: 0, totalXp: Number(progress?.xp_total) || 0, streakDays: null, leagueUpgrade: null }
    }
    throw new Error(`awardXp: xp_event insert failed: ${xpError.message}`)
  }

  if (args.subject) {
    const { data: currentSubjectXp } = await db
      .from('camino_subject_xp')
      .select('xp_total')
      .eq('user_id', userId)
      .eq('subject', args.subject)
      .maybeSingle()

    const { error: subjectXpError } = await db.from('camino_subject_xp').upsert({
      user_id: userId,
      subject: args.subject,
      xp_total: (Number(currentSubjectXp?.xp_total) || 0) + args.xp,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,subject' })
    if (subjectXpError) {
      console.error('[awardXp] camino_subject_xp upsert failed', subjectXpError)
    }
  }

  const now = new Date().toISOString()
  const { data: currentProgress } = await db
    .from('camino_user_progress')
    .select('xp_total, missions_completed, longest_streak')
    .eq('user_id', userId)
    .maybeSingle()

  const oldXpTotal = Number(currentProgress?.xp_total) || 0
  const newXpTotal = oldXpTotal + args.xp
  const newMissionsCompleted = (Number(currentProgress?.missions_completed) || 0) + (args.missionsCompletedDelta ?? 0)
  const newStreakDays = await calcularRacha(userId, db).catch(() => null)
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
      user_id: userId,
      xp_total: args.xp,
      streak_days: newStreakDays ?? 0,
      longest_streak: newLongestStreak,
      missions_completed: args.missionsCompletedDelta ?? 0,
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
      .eq('user_id', userId)
  }

  return { awarded: true, xpAwarded: args.xp, totalXp: newXpTotal, streakDays: newStreakDays, leagueUpgrade }
}
