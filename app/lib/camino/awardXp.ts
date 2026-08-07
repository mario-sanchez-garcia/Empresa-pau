import 'server-only'

import { type SupabaseClient } from '@supabase/supabase-js'
import { divisionFor } from './leagues'
import { calcularRacha } from '../calcularRacha'
import { computeFirstAttemptXp, computeRepeatImprovementXp } from './xpFormula'

// Único lugar donde se escribe XP de verdad — usado por complete-mission
// (misiones de Camino) y por cualquier otra acción que también deba dar XP
// (corrección de examen, simulacro, parcial). Nunca confíes en un XP que
// venga del cliente: cada llamador pasa un `effortXp` fijo decidido en su
// propio código de servidor (el "Esfuerzo" del documento de diseño del
// nuevo sistema de XP — ver xpFormula.ts para dificultad/nota/racha/mejora).
export type XpSourceType =
  | 'mission_completion'
  | 'exam_correction'
  | 'simulacro_completion'
  | 'parcial_completion'
  | 'flashcard_deck_completion'
  | 'flashcard_deck_author_bonus'
  // "Repetir para mejorar" — bonus de mejora al superar una nota anterior
  // (ver app/lib/camino/xpFormula.ts). Nunca reutiliza el sourceType del
  // intento original.
  | 'repeat_improvement'

export type AwardXpResult = {
  // false = esta fuente ya había dado XP antes (mismo user+source_type+source_id+mission_date);
  // no-op idempotente, no un error.
  awarded: boolean
  // XP total otorgado. Nombre mantenido por compatibilidad con el código
  // existente que ya lee xpAwarded.
  xpAwarded: number
  baseXp: number
  // Bonus combinado (nota + racha en un primer intento; bonus de mejora en
  // una repetición) — se mantiene un único número por compatibilidad con la
  // UI existente ("+X · +Y bonus"), con el desglose fino disponible aparte.
  bonusXp: number
  qualityBonusXp: number
  streakBonusXp: number
  totalXp: number
  streakDays: number | null
  leagueUpgrade: { from: string; to: string } | null
}

type WriteArgs = {
  sourceType: XpSourceType
  sourceId: string
  subject?: string | null
  missionDate: string
  missionsCompletedDelta?: number
}

// Escribe el XP ya calculado (camino_xp_events + camino_subject_xp +
// increment_camino_progress) — awardXp() y awardRepeatImprovementXp()
// calculan el número por caminos distintos (primer intento vs repetición)
// pero ambos terminan aquí para no duplicar la parte que sí debe seguir
// exactamente igual (infraestructura ya validada, ver
// increment_camino_progress/camino_xp_events).
async function writeXpAward(
  db: SupabaseClient,
  userId: string,
  args: WriteArgs & {
    xpTotal: number
    baseXp: number
    bonusXp: number
    qualityBonusXp: number
    streakBonusXp: number
    streakDays: number
    // false cuando calcularRacha falló (ver awardXp/awardRepeatImprovementXp
    // más abajo) — en ese caso streakDays ya se trató como 0 solo para el
    // cálculo del bonus (nunca se penaliza al alumno por un fallo nuestro),
    // pero increment_camino_progress no debe SOBRESCRIBIR la racha real ya
    // guardada con ese 0: p_has_streak=false dice a la función SQL que deje
    // streak_days/longest_streak tal cual están.
    streakDaysKnown: boolean
  },
): Promise<AwardXpResult> {
  const { error: xpError } = await db.from('camino_xp_events').insert({
    user_id: userId,
    xp_amount: args.xpTotal,
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
      return { awarded: false, xpAwarded: 0, baseXp: 0, bonusXp: 0, qualityBonusXp: 0, streakBonusXp: 0, totalXp: Number(progress?.xp_total) || 0, streakDays: null, leagueUpgrade: null }
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
      xp_total: (Number(currentSubjectXp?.xp_total) || 0) + args.xpTotal,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,subject' })
    if (subjectXpError) {
      console.error('[awardXp] camino_subject_xp upsert failed', subjectXpError)
    }
  }

  // Incremento atómico en una sola sentencia SQL (ver migración
  // 20260806120000) — antes esto era un read-modify-write en dos pasos
  // desde aquí, vulnerable a perder XP si dos acciones del mismo alumno
  // escribían casi a la vez (el evento en camino_xp_events quedaba bien,
  // pero el agregado que lee el ranking podía quedarse corto). streakDays ya
  // se calculó ANTES de escribir el evento (lo necesita el propio cálculo
  // del bonus de racha), así que aquí solo se reutiliza — sin una segunda
  // llamada a calcularRacha.
  const { data: progressRow, error: progressError } = await db
    .rpc('increment_camino_progress', {
      p_user_id: userId,
      p_xp_delta: args.xpTotal,
      p_missions_delta: args.missionsCompletedDelta ?? 0,
      p_streak_days: args.streakDays,
      p_longest_streak: args.streakDays,
      p_has_streak: args.streakDaysKnown,
    })
    .single()

  if (progressError || !progressRow) {
    throw new Error(`awardXp: increment_camino_progress failed: ${progressError?.message}`)
  }

  const progress = progressRow as { old_xp_total: number; new_xp_total: number }
  const oldXpTotal = Number(progress.old_xp_total) || 0
  const newXpTotal = Number(progress.new_xp_total) || 0
  const oldDivision = divisionFor(oldXpTotal)
  const newDivision = divisionFor(newXpTotal)
  const leagueUpgrade = newDivision.name !== oldDivision.name
    ? { from: oldDivision.name, to: newDivision.name }
    : null

  return {
    awarded: true,
    xpAwarded: args.xpTotal,
    baseXp: args.baseXp,
    bonusXp: args.bonusXp,
    qualityBonusXp: args.qualityBonusXp,
    streakBonusXp: args.streakBonusXp,
    totalXp: newXpTotal,
    streakDays: args.streakDaysKnown ? args.streakDays : null,
    leagueUpgrade,
  }
}

// calcularRacha puede fallar (error de red/DB puntual) — en vez de propagar
// esa excepción y perder el XP de la actividad entera, se trata como "racha
// desconocida ahora mismo": 0 solo para el cálculo del bonus (nunca se
// inventa ni se penaliza), y known=false para que writeXpAward NO sobrescriba
// la racha real ya guardada en camino_user_progress con ese 0.
async function resolveStreakDays(db: SupabaseClient, userId: string): Promise<{ days: number; known: boolean }> {
  try {
    const days = await calcularRacha(userId, db)
    return { days, known: true }
  } catch {
    return { days: 0, known: false }
  }
}

// Primer intento de una actividad. XP = (Esfuerzo × Dificultad) ×
// (1 + Bonus_nota) × (1 + Bonus_racha) — ver xpFormula.ts.
export async function awardXp(
  db: SupabaseClient,
  userId: string,
  args: WriteArgs & {
    // "Esfuerzo real" del documento de diseño — el XP base ya existente por
    // duración/tipo de actividad (xpForDuration, resolveMissionTypeXp...),
    // SIN aplicar todavía dificultad/nota/racha.
    effortXp: number
    // Etiqueta de dificultad ya existente en el contenido (p.ej.
    // historial_simulacros.dificultad: 'Fácil'|'Media'|'Difícil'). Si el
    // contenido no la tiene (Camino, Exámenes, flashcards), se omite y se
    // usa 'Media' (×1,00) por defecto — ver resolveDifficultyMultiplier.
    difficultyLabel?: string | null
    // Nota normalizada sobre 10, si esta acción tiene una nota real (examen,
    // simulacro, parcial, corrección de Camino con rúbrica). undefined/null
    // = acción sin nota (p.ej. una flashcard) → solo Esfuerzo × Dificultad,
    // sin bonus de nota (el de racha sí puede aplicar igualmente).
    scoreOnTen?: number | null
  },
): Promise<AwardXpResult> {
  // streakDays se calcula ANTES de insertar el evento de hoy: calcularRacha
  // lee camino_calendar/historial_examenes/historial_simulacros (nunca
  // camino_xp_events), y el caller ya deja escrita la actividad de hoy en
  // esas tablas antes de llamar a awardXp — así que esta racha YA incluye
  // hoy, el mismo número que luego se guarda en camino_user_progress y se
  // le muestra al alumno.
  const { days: streakDays, known: streakDaysKnown } = await resolveStreakDays(db, userId)
  const calc = computeFirstAttemptXp({
    effortXp: args.effortXp,
    difficultyLabel: args.difficultyLabel,
    scoreOnTen: args.scoreOnTen,
    streakDays,
  })

  return writeXpAward(db, userId, {
    ...args,
    xpTotal: calc.totalXp,
    baseXp: calc.baseXp,
    bonusXp: calc.qualityBonusXp + calc.streakBonusXp,
    qualityBonusXp: calc.qualityBonusXp,
    streakBonusXp: calc.streakBonusXp,
    streakDays,
    streakDaysKnown,
  })
}

// "Repetir para mejorar": XP = [(Esfuerzo × Dificultad) × (1 + Bonus_nota) ×
// (1 + Bonus_racha) × Reducción_repetición] + Bonus_mejora — ver
// xpFormula.ts. A diferencia de antes, SIEMPRE otorga XP (el suelo de
// REPEAT_XP_MIN de la reducción garantiza al menos 1 XP) — repetir sin
// mejorar ya no da 0, solo se queda sin el bonus de mejora. sourceType es
// siempre 'repeat_improvement'.
export async function awardRepeatImprovementXp(
  db: SupabaseClient,
  userId: string,
  args: Omit<WriteArgs, 'sourceType'> & {
    effortXp: number
    difficultyLabel?: string | null
    // Nota del intento INMEDIATAMENTE ANTERIOR de este mismo contenido
    // (nunca el primer intento histórico) — resuelta por el caller vía
    // repeated_from_id. null = no hay intento anterior comparable → se
    // trata como si fuera la primera vez (XP completo, sin reducción ni
    // bonus de mejora).
    previousScoreOnTen: number | null
    newScoreOnTen: number | null
    // 1 = primera repetición, 2 = repetición de una repetición, etc. (ver
    // countRepeatDepth en repeatImprovement.ts).
    repeatGeneration: number
  },
): Promise<AwardXpResult & { improved: boolean }> {
  const { days: streakDays, known: streakDaysKnown } = await resolveStreakDays(db, userId)
  const calc = computeRepeatImprovementXp({
    effortXp: args.effortXp,
    difficultyLabel: args.difficultyLabel,
    previousScoreOnTen: args.previousScoreOnTen,
    newScoreOnTen: args.newScoreOnTen,
    streakDays,
    repeatGeneration: args.repeatGeneration,
  })

  const result = await writeXpAward(db, userId, {
    ...args,
    sourceType: 'repeat_improvement',
    xpTotal: calc.totalXp,
    baseXp: calc.reducedBaseXp,
    bonusXp: calc.improvementBonusXp,
    qualityBonusXp: 0,
    streakBonusXp: 0,
    streakDays,
    streakDaysKnown,
  })

  return { ...result, improved: calc.improved }
}
