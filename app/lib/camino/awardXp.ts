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
  | 'flashcard_deck_completion'
  | 'flashcard_deck_author_bonus'

export type AwardXpResult = {
  // false = esta fuente ya había dado XP antes (mismo user+source_type+source_id+mission_date);
  // no-op idempotente, no un error.
  awarded: boolean
  // XP total otorgado (base + bonus de calidad). Nombre mantenido por
  // compatibilidad con el código existente que ya lee xpAwarded.
  xpAwarded: number
  baseXp: number
  bonusXp: number
  totalXp: number
  streakDays: number | null
  leagueUpgrade: { from: string; to: string } | null
}

// Bonus de calidad sobre el XP base garantizado: +25% si aprueba (nota >= 5),
// +75% si es >= 7, +125% si es >= 9. La base nunca se reduce por una nota
// baja — premiar acertar no debe castigar intentarlo, o el alumno
// racionalmente evitaría sus puntos débiles, justo lo contrario de lo que
// busca injectWeakReviewMissions. Los tramos (antes +50%/+100%, sin nada
// para un aprobado) se subieron para que la nota pese más que el simple
// hecho de completar la acción — el hueco entre "lo he hecho" (1x) y
// "lo he hecho muy bien" (2.25x) es ahora bastante mayor.
function applyQualityBonus(baseXp: number, scoreOnTen: number | null | undefined): { total: number; bonus: number } {
  if (scoreOnTen == null || !Number.isFinite(scoreOnTen)) return { total: baseXp, bonus: 0 }
  const multiplier = scoreOnTen >= 9 ? 1.25 : scoreOnTen >= 7 ? 0.75 : scoreOnTen >= 5 ? 0.25 : 0
  const bonus = Math.round(baseXp * multiplier)
  return { total: baseXp + bonus, bonus }
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
    // Nota normalizada sobre 10, si esta acción tiene una nota real (examen,
    // simulacro, parcial, corrección de Camino con rúbrica). undefined/null
    // = acción sin nota (p.ej. una flashcard) → solo se da el XP base, sin
    // bonus.
    scoreOnTen?: number | null
  },
): Promise<AwardXpResult> {
  const { total: xpTotal, bonus: bonusXp } = applyQualityBonus(args.xp, args.scoreOnTen)

  const { error: xpError } = await db.from('camino_xp_events').insert({
    user_id: userId,
    xp_amount: xpTotal,
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
      return { awarded: false, xpAwarded: 0, baseXp: 0, bonusXp: 0, totalXp: Number(progress?.xp_total) || 0, streakDays: null, leagueUpgrade: null }
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
      xp_total: (Number(currentSubjectXp?.xp_total) || 0) + xpTotal,
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
  const newXpTotal = oldXpTotal + xpTotal
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
      xp_total: xpTotal,
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

  return { awarded: true, xpAwarded: xpTotal, baseXp: args.xp, bonusXp, totalXp: newXpTotal, streakDays: newStreakDays, leagueUpgrade }
}
