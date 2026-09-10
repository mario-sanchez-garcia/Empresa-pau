import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  countDiagnosticSessions,
  countPartialLimitSessions,
  countsTowardPartialLimit,
  isDiagnosticSession,
} from './diagnosticLimits.ts'
import { DIAGNOSTIC_SOURCE, MAX_DIAGNOSTICS_PER_MONTH } from './knowledgeState.ts'

const diagnostic = { resultado_json: { __practice_session: true, source: DIAGNOSTIC_SOURCE } }
const caminoPartial = { resultado_json: { __practice_session: true, source: 'camino_partial' } }
const noSource = { resultado_json: { __practice_session: true } }
const blockPractice = { resultado_json: { __practice_session: true, source: 'camino_block_practice' } }

test('un microdiagnóstico NO consume el límite mensual de prácticas del plan', () => {
  assert.equal(countsTowardPartialLimit(diagnostic), false)
  assert.equal(isDiagnosticSession(diagnostic), true)
})

test('el resto de prácticas sí lo consumen — incluidas las que no declaran origen', () => {
  for (const row of [caminoPartial, noSource, blockPractice]) {
    assert.equal(countsTowardPartialLimit(row), true, `${JSON.stringify(row)} debería contar`)
  }
})

test('regresión: una práctica sin origen nunca puede quedar fuera del conteo', () => {
  // El filtro SQL "source <> 'camino_diagnostic'" habría descartado esta fila
  // (NULL <> 'x' es NULL en Postgres), regalando prácticas ilimitadas.
  const rows = [noSource, noSource, noSource]
  assert.equal(countPartialLimitSessions(rows), 3)
})

test('un mes mixto se reparte correctamente entre los dos contadores', () => {
  const rows = [diagnostic, caminoPartial, noSource, diagnostic, blockPractice]
  assert.equal(countPartialLimitSessions(rows), 3)
  assert.equal(countDiagnosticSessions(rows), 2)
  // Ninguna sesión cuenta en los dos sitios a la vez.
  assert.equal(countPartialLimitSessions(rows) + countDiagnosticSessions(rows), rows.length)
})

test('el tope propio de diagnósticos es 3 al mes', () => {
  assert.equal(MAX_DIAGNOSTICS_PER_MONTH, 3)
  const rows = Array.from({ length: 3 }, () => diagnostic)
  assert.equal(countDiagnosticSessions(rows), 3)
  assert.ok(countDiagnosticSessions(rows) >= MAX_DIAGNOSTICS_PER_MONTH, 'al tercero se debe bloquear')
  // Y no han tocado la cuota del plan.
  assert.equal(countPartialLimitSessions(rows), 0)
})

test('un resultado_json corrupto no rompe el conteo ni regala prácticas', () => {
  for (const row of [{}, { resultado_json: null }, { resultado_json: 'texto' }, { resultado_json: [1, 2] }]) {
    assert.equal(isDiagnosticSession(row), false)
    assert.equal(countsTowardPartialLimit(row), true)
  }
})

test('un origen falsificado con otro nombre no se cuela como diagnóstico', () => {
  const fake = { resultado_json: { __practice_session: true, source: 'camino_diagnostic_x' } }
  assert.equal(isDiagnosticSession(fake), false)
  assert.equal(countsTowardPartialLimit(fake), true)
})
