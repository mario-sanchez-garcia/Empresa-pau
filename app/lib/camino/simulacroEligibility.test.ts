import assert from 'node:assert/strict'
import test from 'node:test'
import type { ExamCoverage } from './examCoverage.ts'
import { decideAutomaticExamMissionFate } from './examCoverage.ts'

function coverage(patch: Partial<ExamCoverage> = {}): ExamCoverage {
  return {
    computable: true,
    totalCount: 10,
    completedCount: 0,
    pendingSortOrders: [],
    inactiveQueueIdsToReactivate: [],
    weekdaysUntilExam: [],
    maxProjectedCoveragePct: 100,
    uncoveredCount: 0,
    maxPerDayCapacity: 1,
    ...patch,
  }
}

test('un alumno sin evidencia recibe preparación pero no simulacro automático', () => {
  const fresh = coverage({ completedCount: 0 })
  assert.equal(decideAutomaticExamMissionFate('exercise_practice', fresh, 'full', false), 'generate')
  assert.equal(decideAutomaticExamMissionFate('final_mini_mock', fresh, 'full', false), 'delay')
})

test('una cobertura baja conserva la práctica dirigida y retrasa el simulacro', () => {
  const low = coverage({ completedCount: 2, maxProjectedCoveragePct: 50 })
  assert.equal(decideAutomaticExamMissionFate('exercise_practice', low, 'cancelled', false), 'generate')
  assert.equal(decideAutomaticExamMissionFate('final_mini_mock', low, 'cancelled', false), 'delay')
})

test('progreso suficiente y examen próximo hacen elegible el simulacro', () => {
  const ready = coverage({ completedCount: 8, maxProjectedCoveragePct: 90 })
  assert.equal(decideAutomaticExamMissionFate('final_mini_mock', ready, 'partial', false), 'generate')
})

test('sin cobertura medible nunca se presume preparación para un simulacro', () => {
  const unknown = coverage({ computable: false, completedCount: 0 })
  assert.equal(decideAutomaticExamMissionFate('exercise_practice', unknown, null, false), 'generate')
  assert.equal(decideAutomaticExamMissionFate('final_mini_mock', unknown, null, false), 'delay')
})
