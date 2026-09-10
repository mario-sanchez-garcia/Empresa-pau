// Máquina de estados del conocimiento por bloque, y las reglas del
// microdiagnóstico. Pura: sin Supabase, sin red, comprobable en aislamiento.
//
// Separa tres cosas que el planificador confundía:
//
//   DECLARADO     — el alumno dijo en onboarding que ya lo había dado.
//                   Es una autoevaluación. No demuestra nada.
//   CON EVIDENCIA — hizo una muestra corta de ejercicios y la superó.
//   DOMINADO      — rendimiento sostenido a lo largo del tiempo.
//
// Y una cuarta que hacía falta para poder ser honestos:
//
//   REFUTADO      — hizo la muestra y NO la superó. Su declaración era
//                   optimista, y el Camino tiene que corregir el rumbo.
//
// Nada de esto es "completado". Un tema se completa haciéndolo.

import type { StartMode } from './startingPoint.ts'

export const KNOWLEDGE_STATES = ['declarado', 'con_evidencia', 'refutado', 'dominado'] as const
export type KnowledgeState = typeof KNOWLEDGE_STATES[number]

/** Modos declarados que hay algo que confirmar. `zero`/`unknown` no declaran nada. */
export const DIAGNOSABLE_START_MODES: readonly StartMode[] = ['first_block', 'mid', 'review']

export function isDiagnosableMode(mode: StartMode): boolean {
  return DIAGNOSABLE_START_MODES.includes(mode)
}

// ── Parámetros del goteo ────────────────────────────────────────────────
/** Misiones completadas antes de ofrecer el primer diagnóstico: primero hábito, luego diagnóstico. */
export const MIN_COMPLETED_MISSIONS_BEFORE_DIAGNOSTIC = 3
/** Como mucho un diagnóstico vivo a la vez. Es goteo, no batería. */
export const MAX_LIVE_DIAGNOSTICS = 1
/** Días entre diagnósticos ofrecidos. */
export const DIAGNOSTIC_COOLDOWN_DAYS = 5
/** Tras estos saltos, ese bloque deja de ofrecerse. Nunca se insiste. */
export const MAX_DIAGNOSTIC_SKIPS = 2
/** Ejercicios de la muestra. Mínima a propósito: confirma o refuta, no examina. */
export const DIAGNOSTIC_QUESTION_COUNT = 2
/** Diagnósticos al mes. Tope propio, fuera del límite de prácticas del plan. */
export const MAX_DIAGNOSTICS_PER_MONTH = 3
/** Marca de origen. Viaja en resultado_json y es lo que excluye del límite normal. */
export const DIAGNOSTIC_SOURCE = 'camino_diagnostic'

/** Nota sobre 10 a partir de la cual la declaración queda confirmada. Mismo listón que el 60% de áreas débiles. */
export const DIAGNOSTIC_PASS_SCORE = 6

export type DiagnosticOutcome = 'con_evidencia' | 'refutado'

/**
 * Resultado de un microdiagnóstico. Solo puede producir estos dos estados:
 * un diagnóstico NUNCA promueve a 'dominado' (ver canPromoteToDominado).
 */
export function evaluateDiagnostic(scoreOnTen: number): DiagnosticOutcome {
  return scoreOnTen >= DIAGNOSTIC_PASS_SCORE ? 'con_evidencia' : 'refutado'
}

export type BlockKnowledgeRow = {
  subject: string
  blockSlug: string
  state: KnowledgeState
  declaredStartMode: StartMode | null
  diagnosticMissionId: string | null
  diagnosticOfferedAt: string | null
  diagnosticSkippedCount: number
}

export type DiagnosticEligibilityInput = {
  /** Estado actual del bloque candidato. */
  row: BlockKnowledgeRow
  /** Misiones que el alumno ya ha completado en total. */
  completedMissions: number
  /** Diagnósticos vivos (ofrecidos y sin resolver) ahora mismo. */
  liveDiagnostics: number
  /** Diagnósticos ya ofrecidos este mes natural. */
  diagnosticsThisMonth: number
  /** Fecha del último diagnóstico ofrecido (cualquier bloque), o null. */
  lastOfferedAt: string | null
  /** Hoy, YYYY-MM-DD. */
  today: string
}

export type DiagnosticEligibility =
  | { eligible: true }
  | { eligible: false; reason: DiagnosticSkipReason }

export type DiagnosticSkipReason =
  | 'not_declared'          // zero/unknown: no hay declaración que confirmar
  | 'already_resolved'      // ya tiene evidencia o ya fue refutado
  | 'already_live'          // ya hay un diagnóstico vivo
  | 'too_few_missions'      // aún no ha cogido ritmo
  | 'cooldown'              // demasiado pronto desde el anterior
  | 'monthly_cap'           // tope propio de diagnósticos del mes
  | 'skipped_enough'        // lo ha dejado pasar demasiadas veces

function daysBetween(from: string, to: string): number {
  return Math.floor((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000)
}

/**
 * ¿Se le puede ofrecer AHORA el microdiagnóstico de este bloque?
 *
 * El orden de las comprobaciones es el orden en que queremos leer el motivo
 * en telemetría: primero lo estructural (no hay nada que diagnosticar),
 * luego lo temporal (todavía no toca).
 */
export function checkDiagnosticEligibility(input: DiagnosticEligibilityInput): DiagnosticEligibility {
  const { row, completedMissions, liveDiagnostics, diagnosticsThisMonth, lastOfferedAt, today } = input

  if (!row.declaredStartMode || !isDiagnosableMode(row.declaredStartMode)) {
    return { eligible: false, reason: 'not_declared' }
  }
  // Un bloque ya confirmado o ya refutado no se vuelve a diagnosticar: su
  // declaración ya se contrastó una vez, que es todo lo que promete esto.
  if (row.state !== 'declarado') {
    return { eligible: false, reason: 'already_resolved' }
  }
  if (row.diagnosticSkippedCount >= MAX_DIAGNOSTIC_SKIPS) {
    return { eligible: false, reason: 'skipped_enough' }
  }
  if (completedMissions < MIN_COMPLETED_MISSIONS_BEFORE_DIAGNOSTIC) {
    return { eligible: false, reason: 'too_few_missions' }
  }
  if (liveDiagnostics >= MAX_LIVE_DIAGNOSTICS) {
    return { eligible: false, reason: 'already_live' }
  }
  if (diagnosticsThisMonth >= MAX_DIAGNOSTICS_PER_MONTH) {
    return { eligible: false, reason: 'monthly_cap' }
  }
  if (lastOfferedAt) {
    const since = daysBetween(lastOfferedAt.slice(0, 10), today)
    if (since < DIAGNOSTIC_COOLDOWN_DAYS) return { eligible: false, reason: 'cooldown' }
  }
  return { eligible: true }
}

// ── Promoción a DOMINADO ────────────────────────────────────────────────
//
// AISLADA A PROPÓSITO, en su propia función y con sus propias constantes,
// por dos motivos:
//
//  1. Un microdiagnóstico de dos ejercicios NO puede producir dominio. La
//     función ni siquiera recibe los intentos diagnósticos: quien la llama
//     debe pasarle `masteryAttempts`, que los excluye por construcción.
//  2. Todavía no sabemos qué es "dominio real". La regla de aquí es
//     deliberadamente exigente y está pensada para endurecerse o cambiarse
//     sin tocar nada más del sistema.
//
// Hoy NINGUNA ruta de escritura la invoca: el estado y la evidencia quedan
// preparados, pero la promoción automática no está activada. Activarla es
// una decisión aparte y consciente.

/** Intentos NO diagnósticos mínimos. */
export const MASTERY_MIN_ATTEMPTS = 3
/** Media mínima sobre 10 en esos intentos. */
export const MASTERY_MIN_AVG_SCORE = 8
/** El intento más reciente no puede haber bajado del listón. */
export const MASTERY_MIN_LAST_SCORE = 7
/** Días mínimos entre el primer y el último intento: dominio es sostenido, no un buen día. */
export const MASTERY_MIN_SPAN_DAYS = 14

export type MasteryEvidence = {
  /** Intentos que cuentan para dominio. NUNCA incluye microdiagnósticos. */
  masteryAttempts: number
  avgScoreOnTen: number
  lastScoreOnTen: number
  firstAttemptAt: string
  lastAttemptAt: string
}

/**
 * ¿Hay evidencia suficiente para llamar a esto dominio?
 *
 * Conservadora a propósito. Ante la duda, NO. Un falso "dominado" saca
 * temario del foco del alumno justo antes de la PAU; un falso "con
 * evidencia" solo hace que repase algo que ya sabía.
 */
export function canPromoteToDominado(evidence: MasteryEvidence): boolean {
  if (evidence.masteryAttempts < MASTERY_MIN_ATTEMPTS) return false
  if (evidence.avgScoreOnTen < MASTERY_MIN_AVG_SCORE) return false
  if (evidence.lastScoreOnTen < MASTERY_MIN_LAST_SCORE) return false
  const span = daysBetween(evidence.firstAttemptAt.slice(0, 10), evidence.lastAttemptAt.slice(0, 10))
  return span >= MASTERY_MIN_SPAN_DAYS
}

/** Media acumulada tras añadir un intento nuevo. */
export function nextAverage(currentAvg: number | null, currentAttempts: number, newScore: number): number {
  if (currentAttempts <= 0 || currentAvg == null) return newScore
  return ((currentAvg * currentAttempts) + newScore) / (currentAttempts + 1)
}
