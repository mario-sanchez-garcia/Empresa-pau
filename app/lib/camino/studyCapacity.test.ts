import assert from 'node:assert/strict'
import { test } from 'node:test'

import { allocateExamBudgets, computeStudyCapacity, studyDatesBetween } from './studyCapacity.ts'

test('studyDatesBetween excluye la fecha objetivo y los fines de semana', () => {
  // 2026-09-14 lunes … 2026-09-21 lunes
  const dates = studyDatesBetween('2026-09-14', '2026-09-21')
  assert.deepEqual(dates, ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'])
})

test('studyDatesBetween respeta los días semanales declarados', () => {
  const dates = studyDatesBetween('2026-09-14', '2026-09-21', { weeklyStudyDays: 2 })
  assert.deepEqual(dates, ['2026-09-14', '2026-09-17']) // lunes y jueves
})

test('studyDatesBetween descuenta festivos', () => {
  const dates = studyDatesBetween('2026-09-14', '2026-09-21', { holidays: new Set(['2026-09-16']) })
  assert.ok(!dates.includes('2026-09-16'))
  assert.equal(dates.length, 4)
})

test('C04: 500 temas en 184 días a 180 min/día SÍ caben — no debe haber rescate', () => {
  const capacity = computeStudyCapacity('2026-09-14', '2027-03-17', { dailyMinutes: 180 })
  // 180 min/día = 4 misiones/día en la tabla de capacidad.
  assert.equal(capacity.sessionsPerDay, 4)
  assert.ok(capacity.sessions > 500, `esperaba holgura para 500 temas, hay ${capacity.sessions}`)
})

test('C04: el mismo backlog con 30 min/día y 2 días a la semana NO cabe', () => {
  const capacity = computeStudyCapacity('2026-09-14', '2027-03-17', { dailyMinutes: 30, weeklyStudyDays: 2 })
  assert.equal(capacity.sessionsPerDay, 1)
  assert.ok(capacity.sessions < 500, `esperaba déficit real, hay ${capacity.sessions}`)
})

test('C03: tres exámenes no pueden reclamar la misma capacidad a la vez', () => {
  // Reproducción del informe: 3 exámenes, 10 temas pendientes cada uno,
  // 5 días hábiles por delante y 60 min/día (= 2 sesiones/día) → 10 sesiones
  // en total, no 10 para cada uno.
  const today = '2026-09-14' // lunes
  const examDate = '2026-09-21' // lunes siguiente: 5 días hábiles en medio
  const budgets = allocateExamBudgets(
    today,
    [
      { id: 'a', date: examDate, pendingCount: 10 },
      { id: 'b', date: examDate, pendingCount: 10 },
      { id: 'c', date: examDate, pendingCount: 10 },
    ],
    { dailyMinutes: 60 },
  )
  const total = ['a', 'b', 'c'].reduce((sum, id) => sum + (budgets.get(id)?.allocatedSessions ?? 0), 0)
  assert.equal(total, 10, 'la suma repartida no puede superar la capacidad real')
  // Y alguien se queda con temas sin cubrir — el dato honesto.
  const uncovered = ['a', 'b', 'c'].reduce((sum, id) => sum + (budgets.get(id)?.uncoveredCount ?? 0), 0)
  assert.equal(uncovered, 20)
})

test('C03: el examen más próximo se sirve primero', () => {
  const budgets = allocateExamBudgets(
    '2026-09-14',
    [
      { id: 'lejano', date: '2026-09-25', pendingCount: 10 },
      { id: 'proximo', date: '2026-09-16', pendingCount: 10 },
    ],
    { dailyMinutes: 60 },
  )
  // 'proximo' solo tiene 2 días hábiles (14 y 15) × 2 sesiones = 4.
  assert.equal(budgets.get('proximo')?.allocatedSessions, 4)
  assert.equal(budgets.get('proximo')?.uncoveredCount, 6)
  // 'lejano' conserva los días que 'proximo' no podía usar de todos modos.
  assert.ok((budgets.get('lejano')?.allocatedSessions ?? 0) > 0)
})

test('C03: un examen aislado con holgura se cubre entero', () => {
  const budgets = allocateExamBudgets(
    '2026-09-14',
    [{ id: 'solo', date: '2026-10-14', pendingCount: 10 }],
    { dailyMinutes: 60 },
  )
  assert.equal(budgets.get('solo')?.allocatedSessions, 10)
  assert.equal(budgets.get('solo')?.uncoveredCount, 0)
})

test('los exámenes ya pasados no consumen presupuesto', () => {
  const budgets = allocateExamBudgets(
    '2026-09-14',
    [{ id: 'viejo', date: '2026-09-01', pendingCount: 5 }],
    { dailyMinutes: 60 },
  )
  assert.equal(budgets.get('viejo')?.allocatedSessions, 0)
})
