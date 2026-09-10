import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DIAGNOSTIC_QUESTION_COUNT,
  MAX_DIAGNOSTICS_PER_MONTH,
  MAX_DIAGNOSTIC_SKIPS,
  MIN_COMPLETED_MISSIONS_BEFORE_DIAGNOSTIC,
  canPromoteToDominado,
  checkDiagnosticEligibility,
  evaluateDiagnostic,
  isDiagnosableMode,
  nextAverage,
  type BlockKnowledgeRow,
} from './knowledgeState.ts'

const TODAY = '2026-10-01'

function row(overrides: Partial<BlockKnowledgeRow> = {}): BlockKnowledgeRow {
  return {
    subject: 'matematicas_ii',
    blockSlug: 'algebra',
    state: 'declarado',
    declaredStartMode: 'mid',
    diagnosticMissionId: null,
    diagnosticOfferedAt: null,
    diagnosticSkippedCount: 0,
    ...overrides,
  }
}

function eligibility(overrides: Partial<Parameters<typeof checkDiagnosticEligibility>[0]> = {}) {
  return checkDiagnosticEligibility({
    row: row(),
    completedMissions: 10,
    liveDiagnostics: 0,
    diagnosticsThisMonth: 0,
    lastOfferedAt: null,
    today: TODAY,
    ...overrides,
  })
}

test('caso base: un bloque declarado y un alumno con ritmo es elegible', () => {
  assert.deepEqual(eligibility(), { eligible: true })
})

// ── Solo first_block / mid / review ──────────────────────────────────────
test('no hay diagnóstico para zero ni unknown: no declaran nada que confirmar', () => {
  for (const mode of ['zero', 'unknown'] as const) {
    assert.equal(isDiagnosableMode(mode), false)
    const result = eligibility({ row: row({ declaredStartMode: mode }) })
    assert.deepEqual(result, { eligible: false, reason: 'not_declared' })
  }
})

test('sí hay diagnóstico para first_block, mid y review', () => {
  for (const mode of ['first_block', 'mid', 'review'] as const) {
    assert.equal(isDiagnosableMode(mode), true)
    assert.deepEqual(eligibility({ row: row({ declaredStartMode: mode }) }), { eligible: true })
  }
})

// ── Umbral de activación ─────────────────────────────────────────────────
test('no se ofrece antes de 3 misiones completadas', () => {
  assert.equal(MIN_COMPLETED_MISSIONS_BEFORE_DIAGNOSTIC, 3)
  for (const completed of [0, 1, 2]) {
    assert.deepEqual(
      eligibility({ completedMissions: completed }),
      { eligible: false, reason: 'too_few_missions' },
      `no debería ofrecerse con ${completed} misiones`,
    )
  }
  assert.deepEqual(eligibility({ completedMissions: 3 }), { eligible: true })
})

// ── Uno vivo como máximo ─────────────────────────────────────────────────
test('máximo un diagnóstico vivo a la vez', () => {
  assert.deepEqual(eligibility({ liveDiagnostics: 1 }), { eligible: false, reason: 'already_live' })
  assert.deepEqual(eligibility({ liveDiagnostics: 0 }), { eligible: true })
})

// ── Cooldown ─────────────────────────────────────────────────────────────
test('cooldown de ~5 días entre diagnósticos ofrecidos', () => {
  // Ofrecido hace 4 días: todavía no.
  assert.deepEqual(
    eligibility({ lastOfferedAt: '2026-09-27T10:00:00.000Z' }),
    { eligible: false, reason: 'cooldown' },
  )
  // Hace 5: ya se puede.
  assert.deepEqual(eligibility({ lastOfferedAt: '2026-09-26T10:00:00.000Z' }), { eligible: true })
})

// ── Tope mensual propio ──────────────────────────────────────────────────
test('tope propio de 3 diagnósticos al mes', () => {
  assert.equal(MAX_DIAGNOSTICS_PER_MONTH, 3)
  assert.deepEqual(eligibility({ diagnosticsThisMonth: 2 }), { eligible: true })
  assert.deepEqual(
    eligibility({ diagnosticsThisMonth: 3 }),
    { eligible: false, reason: 'monthly_cap' },
  )
})

// ── Saltos ───────────────────────────────────────────────────────────────
test('tras 2 saltos ese bloque deja de ofrecerse', () => {
  assert.equal(MAX_DIAGNOSTIC_SKIPS, 2)
  assert.deepEqual(eligibility({ row: row({ diagnosticSkippedCount: 1 }) }), { eligible: true })
  assert.deepEqual(
    eligibility({ row: row({ diagnosticSkippedCount: 2 }) }),
    { eligible: false, reason: 'skipped_enough' },
  )
})

test('un bloque ya resuelto no se vuelve a diagnosticar', () => {
  for (const state of ['con_evidencia', 'refutado', 'dominado'] as const) {
    assert.deepEqual(
      eligibility({ row: row({ state }) }),
      { eligible: false, reason: 'already_resolved' },
    )
  }
})

// ── Resultado ────────────────────────────────────────────────────────────
test('aprobado → con_evidencia; suspendido → refutado', () => {
  assert.equal(evaluateDiagnostic(10), 'con_evidencia')
  assert.equal(evaluateDiagnostic(6), 'con_evidencia')
  assert.equal(evaluateDiagnostic(5.9), 'refutado')
  assert.equal(evaluateDiagnostic(0), 'refutado')
})

test('un diagnóstico solo puede producir esos dos estados, nunca dominado', () => {
  for (const score of [0, 2, 5, 5.9, 6, 8, 10]) {
    const outcome = evaluateDiagnostic(score)
    assert.ok(outcome === 'con_evidencia' || outcome === 'refutado')
    assert.notEqual(outcome, 'dominado')
    assert.notEqual(outcome, 'declarado')
  }
})

// ── Dominado: conservador y aislado ──────────────────────────────────────
test('dominado exige evidencia fuerte y sostenida', () => {
  const strong = {
    masteryAttempts: 3,
    avgScoreOnTen: 8.5,
    lastScoreOnTen: 9,
    firstAttemptAt: '2026-09-01',
    lastAttemptAt: '2026-10-01',
  }
  assert.equal(canPromoteToDominado(strong), true)

  // Pocos intentos.
  assert.equal(canPromoteToDominado({ ...strong, masteryAttempts: 2 }), false)
  // Media insuficiente.
  assert.equal(canPromoteToDominado({ ...strong, avgScoreOnTen: 7.9 }), false)
  // El último intento bajó del listón: buena media pero ya no lo tiene.
  assert.equal(canPromoteToDominado({ ...strong, lastScoreOnTen: 6.9 }), false)
  // Todo en el mismo día: es un buen día, no dominio sostenido.
  assert.equal(canPromoteToDominado({ ...strong, firstAttemptAt: '2026-10-01' }), false)
})

test('dos intentos buenos NO bastan para dominado', () => {
  assert.equal(canPromoteToDominado({
    masteryAttempts: 2,
    avgScoreOnTen: 10,
    lastScoreOnTen: 10,
    firstAttemptAt: '2026-01-01',
    lastAttemptAt: '2026-10-01',
  }), false)
})

// ── Muestra mínima ───────────────────────────────────────────────────────
test('la muestra es de 2 ejercicios', () => {
  assert.equal(DIAGNOSTIC_QUESTION_COUNT, 2)
})

test('la media acumulada se calcula bien desde cero', () => {
  assert.equal(nextAverage(null, 0, 7), 7)
  assert.equal(nextAverage(7, 1, 9), 8)
  assert.equal(nextAverage(8, 2, 5), 7)
})
