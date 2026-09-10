// Reglas de conteo de sesiones de práctica. Puras, para que "un
// microdiagnóstico no gasta la cuota del alumno" sea comprobable y no una
// promesa enterrada en un filtro SQL.
//
// Un microdiagnóstico lo pide Kairo, no el alumno: descontarlo de su límite
// mensual de prácticas sería cobrarle por nuestra propia comprobación. Pero
// el origen tampoco puede ser una puerta trasera, así que tiene su propio
// tope y solo cuenta como diagnóstico si el servidor lo verificó contra la
// misión que lo originó (ver /api/practica-parcial).

import { DIAGNOSTIC_SOURCE } from './knowledgeState.ts'

export type PracticeSessionRow = {
  resultado_json?: unknown
}

function resultado(row: PracticeSessionRow): Record<string, unknown> {
  const value = row.resultado_json
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

/** Origen declarado de la sesión, o null. */
export function sessionSource(row: PracticeSessionRow): string | null {
  const source = resultado(row).source
  return typeof source === 'string' ? source : null
}

/** ¿Es un microdiagnóstico? */
export function isDiagnosticSession(row: PracticeSessionRow): boolean {
  return sessionSource(row) === DIAGNOSTIC_SOURCE
}

/**
 * ¿Consume esta sesión el límite mensual de prácticas del plan?
 *
 * Todo sí, EXCEPTO los microdiagnósticos. Ojo con la alternativa obvia en
 * SQL: `resultado_json->>source <> 'camino_diagnostic'` deja fuera las filas
 * con source NULL (en Postgres, NULL <> 'x' es NULL, no true), o sea la
 * mayoría de prácticas. Por eso el filtro se hace aquí y no en la consulta.
 */
export function countsTowardPartialLimit(row: PracticeSessionRow): boolean {
  return !isDiagnosticSession(row)
}

/** Prácticas del mes que sí gastan cuota del plan. */
export function countPartialLimitSessions(rows: PracticeSessionRow[]): number {
  return rows.filter(countsTowardPartialLimit).length
}

/** Microdiagnósticos del mes, para su tope propio. */
export function countDiagnosticSessions(rows: PracticeSessionRow[]): number {
  return rows.filter(isDiagnosticSession).length
}
