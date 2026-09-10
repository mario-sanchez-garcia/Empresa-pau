// Calcula cuánto tiempo de preparación necesita REALMENTE un examen parcial,
// para el flujo explícito "Recalcular mi Camino para este examen"
// (CaminoCalendarClient.tsx). A diferencia de sessionCountFor() en
// injectPartialExamMissions.ts (que reparte sesiones dentro de un tope fijo
// para no invadir el resto de asignaturas en el flujo normal de
// creación/edición), esto calcula el mínimo defendible dado lo que el
// alumno necesita y le añade un colchón real por encima — sin techo salvo
// los días realmente disponibles.
import { type SupabaseClient } from '@supabase/supabase-js'

import { PARCIAL_MINUTES } from './xpMap'
import type { ExamConfidence, ExamPriority } from './cleanStudentExams'

export type ExamNeedLevel = 'bajo' | 'medio' | 'alto'

export type ExamTimeNeedInput = {
  daysUntilExam: number
  priority?: ExamPriority
  confidence?: ExamConfidence
  historicalAvgScore?: number | null
  historicalAttempts?: number
  dailyMinutesOnboarding?: number | null
}

export type ExamTimeNeedResult = {
  needLevel: ExamNeedLevel
  marginPct: number
  baseSessions: number
  recommendedSessions: number
  maxSessionsPerDay: number
  exceedsOnboardingDaily: boolean
  reasoning: string[]
}

function worse(a: ExamNeedLevel, b: ExamNeedLevel): ExamNeedLevel {
  const rank: Record<ExamNeedLevel, number> = { bajo: 0, medio: 1, alto: 2 }
  return rank[a] >= rank[b] ? a : b
}

// Margen sobre el mínimo estimado: más margen cuanto peor esté el alumno,
// porque ahí es donde un colchón insuficiente pesa más. Todos dentro del
// 20-40% pedido.
const MARGIN_BY_NEED: Record<ExamNeedLevel, number> = { alto: 0.4, medio: 0.3, bajo: 0.2 }
// Nº de sesiones de 45 min "objetivo" antes de aplicar margen.
const TARGET_SESSIONS_BY_NEED: Record<ExamNeedLevel, number> = { alto: 8, medio: 5, bajo: 3 }
// Cuántas sesiones de este examen puede haber apiladas en un mismo día
// cuando quedan pocos días — nunca 1 para "alto"/"medio" porque si el
// examen está a la vuelta de la esquina, la única forma de llegar al tiempo
// necesario es más de una sesión el mismo día, no más días (no existen).
const MAX_PER_DAY_BY_NEED: Record<ExamNeedLevel, number> = { alto: 2, medio: 2, bajo: 1 }

/**
 * Determina el tiempo de preparación real necesario para un examen y el
 * margen de seguridad a aplicar, combinando prioridad, autoevaluación de
 * confianza e historial objetivo de notas en ese bloque (si lo hay). Cuando
 * el historial y la autoevaluación discrepan, se queda con el que pide más
 * preparación — nunca se resta necesidad por optimismo del alumno si las
 * notas dicen lo contrario.
 */
export function computeExamTimeNeed(input: ExamTimeNeedInput): ExamTimeNeedResult {
  const { priority, confidence, historicalAvgScore, historicalAttempts, dailyMinutesOnboarding } = input
  const daysAvailable = Math.max(1, input.daysUntilExam)
  const reasoning: string[] = []

  let needLevel: ExamNeedLevel = 'medio'
  const hasHistory = historicalAvgScore != null && (historicalAttempts ?? 0) >= 2
  if (hasHistory) {
    const score = historicalAvgScore as number
    needLevel = score < 50 ? 'alto' : score < 70 ? 'medio' : 'bajo'
    reasoning.push(`tu historial en este bloque tiene una media del ${Math.round(score)}% (${historicalAttempts} intentos)`)
  }

  const confidenceLevel: ExamNeedLevel = confidence === 'bajo' ? 'alto' : confidence === 'alto' ? 'bajo' : 'medio'
  reasoning.push(
    confidence === 'bajo' ? 'dices que vas mal en esta asignatura'
      : confidence === 'alto' ? 'dices que vas bien en esta asignatura'
        : 'dices que vas regular en esta asignatura'
  )
  needLevel = worse(needLevel, confidenceLevel)

  if (priority === 'muy_alta') {
    needLevel = worse(needLevel, 'medio')
    reasoning.push('le has puesto prioridad muy alta a este examen')
  }

  const maxSessionsPerDay = MAX_PER_DAY_BY_NEED[needLevel]
  const targetSessions = TARGET_SESSIONS_BY_NEED[needLevel]
  const dayCapacity = daysAvailable * maxSessionsPerDay
  const baseSessions = Math.max(1, Math.min(targetSessions, dayCapacity))
  const marginPct = MARGIN_BY_NEED[needLevel]
  const recommendedSessions = Math.max(
    baseSessions,
    Math.min(Math.ceil(baseSessions * (1 + marginPct)), dayCapacity, 12),
  )

  // Sesiones que caerían en el día más cargado si se reparten pegadas al
  // examen (igual que hará assignDatesForCount en injectPartialExamMissions):
  // primero se llena el día más próximo hasta el tope antes de repartir
  // hacia atrás.
  const worstDaySessions = Math.min(maxSessionsPerDay, Math.max(1, Math.ceil(recommendedSessions / daysAvailable)))
  const worstDayMinutes = worstDaySessions * PARCIAL_MINUTES
  const exceedsOnboardingDaily = dailyMinutesOnboarding != null
    ? worstDayMinutes > dailyMinutesOnboarding
    : worstDaySessions > 1

  return { needLevel, marginPct, baseSessions, recommendedSessions, maxSessionsPerDay, exceedsOnboardingDaily, reasoning }
}

export type PersistedExamMissions = {
  count: number
  minutes: number
  hasSimulacro: boolean
  hasPractice: boolean
}

/**
 * Mensaje de "Recalcular mi Camino". Describe las misiones que se han
 * ESCRITO de verdad en el calendario, no `recommendedSessions`.
 *
 * Antes se mostraba `need.summary`, que anunciaba hasta 12 sesiones / 540 min
 * a partir de la recomendación teórica. La realidad es que `sessionOverride`
 * ya no se consume en injectPartialExamMissions y la secuencia son 2 misiones
 * fijas (práctica + Simulacro, 135 min como mucho), y ni siquiera esas dos
 * están garantizadas: las puertas de cobertura, fecha y límites de plan
 * pueden dejar una o ninguna. Prometer 12 sesiones y persistir 2 es la clase
 * de desajuste que hace que el alumno deje de fiarse del plan.
 */
export function buildRecalcMessage(need: ExamTimeNeedResult, persisted: PersistedExamMissions): string {
  const reasonText = need.reasoning.length ? ` (${need.reasoning.join(', ')})` : ''

  if (persisted.count === 0) {
    return `Hemos revisado este examen${reasonText}, pero no hemos podido añadir misiones de preparación nuevas: puede que ya las tengas programadas, que no queden días libres antes del examen o que aún te falte temario de Curso por cubrir. Revisa tu Camino en los días previos al examen.`
  }

  const piezas: string[] = []
  if (persisted.hasPractice) piezas.push('una práctica de ejercicios')
  if (persisted.hasSimulacro) piezas.push('un simulacro completo')
  const detalle = piezas.length > 0 ? ` (${piezas.join(' y ')})` : ''
  const plural = persisted.count === 1 ? 'misión' : 'misiones'

  const base = `Camino recalculado para este examen${reasonText}: ${persisted.count} ${plural} de preparación${detalle}, ~${persisted.minutes} min en total, en los días previos al examen.`

  if (need.exceedsOnboardingDaily) {
    return `${base} Algún día superarás tu ritmo diario habitual para llegar a tiempo.`
  }
  return base
}

/**
 * Rendimiento histórico del alumno en el bloque/asignatura de un examen
 * concreto, a partir de historial_examenes (mismas filas que alimentan
 * getWeakAreas en caminoWeakAreasServer.ts, pero sin el filtro "solo
 * bloques flojos" — aquí interesa la media exista o no supere el umbral).
 * Devuelve null si no hay suficientes intentos para que la media sea
 * fiable, nunca lanza.
 */
export async function getBlockPerformance(
  supabase: SupabaseClient,
  userId: string,
  subject: string,
  block: string,
): Promise<{ avgScore: number; attempts: number } | null> {
  if (!subject || !block) return null
  try {
    const { data, error } = await supabase
      .from('historial_examenes')
      .select('nota, nota_maxima')
      .eq('user_id', userId)
      .ilike('asignatura', subject)
      .ilike('bloque', block)
      .not('nota', 'is', null)
      .not('nota_maxima', 'is', null)
      .gt('nota_maxima', 0)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error || !data || data.length < 2) return null

    let sum = 0
    let max = 0
    for (const row of data as { nota: number; nota_maxima: number }[]) {
      sum += row.nota
      max += row.nota_maxima
    }
    if (max <= 0) return null
    return { avgScore: (sum / max) * 100, attempts: data.length }
  } catch {
    return null
  }
}
