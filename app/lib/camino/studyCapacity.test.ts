import assert from 'node:assert/strict'
import { test } from 'node:test'

import { allocateExamBudgets, computeStudyCapacity, studyDatesBetween, studyDayIndexesFor } from './studyCapacity.ts'

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

// ── Presupuesto de exámenes sobre la disponibilidad real ─────────────────

test('el reparto respeta los días semanales del alumno, no L-V', () => {
  // Reproducción del informe: una semana a 60 min/día repartía diez sesiones.
  // Para un alumno de dos días semanales son cuatro.
  const conLunesViernes = allocateExamBudgets(
    '2026-09-14',
    [{ id: 'a', date: '2026-09-21', pendingCount: 50 }],
    { dailyMinutes: 60 },
  )
  assert.equal(conLunesViernes.get('a')?.allocatedSessions, 10)

  const conDosDias = allocateExamBudgets(
    '2026-09-14',
    [{ id: 'a', date: '2026-09-21', pendingCount: 50 }],
    { dailyMinutes: 60, weeklyStudyDays: 2 },
  )
  assert.equal(conDosDias.get('a')?.allocatedSessions, 4)
})

test('tres exámenes el mismo día: ninguno se queda a cero por orden de id', () => {
  // Antes el desempate por id daba 10/0/0: dos exámenes sin una sola sesión.
  const budgets = allocateExamBudgets(
    '2026-09-14',
    [
      { id: 'a', date: '2026-09-21', pendingCount: 10 },
      { id: 'b', date: '2026-09-21', pendingCount: 10 },
      { id: 'c', date: '2026-09-21', pendingCount: 10 },
    ],
    { dailyMinutes: 60 },
  )
  for (const id of ['a', 'b', 'c']) {
    assert.ok((budgets.get(id)?.allocatedSessions ?? 0) > 0, `${id} se quedó sin preparación`)
  }
  // Y la capacidad total sigue sin inflarse.
  const total = ['a', 'b', 'c'].reduce((sum, id) => sum + (budgets.get(id)?.allocatedSessions ?? 0), 0)
  assert.equal(total, 10)
})

test('el mínimo garantizado no le quita días al examen más inminente', () => {
  // El mínimo se reserva de los días MÁS TARDÍOS, que el examen cercano no
  // podía usar de todos modos.
  const budgets = allocateExamBudgets(
    '2026-09-14',
    [
      { id: 'lejano', date: '2026-09-25', pendingCount: 10 },
      { id: 'proximo', date: '2026-09-16', pendingCount: 10 },
    ],
    { dailyMinutes: 60 },
  )
  assert.equal(budgets.get('proximo')?.allocatedSessions, 4, 'el examen inminente conserva todos sus días')
  assert.ok((budgets.get('lejano')?.allocatedSessions ?? 0) > 0)
})

test('el patrón semanal es el mismo para filtrar días y para rotar', () => {
  assert.deepEqual(studyDayIndexesFor(2), [0, 3])
  assert.deepEqual(studyDayIndexesFor(7), [0, 1, 2, 3, 4, 5, 6])
  // Sin declaración, L-V.
  assert.deepEqual(studyDayIndexesFor(null), [0, 1, 2, 3, 4])
  const dates = studyDatesBetween('2026-09-14', '2026-09-28', { weeklyStudyDays: 2 })
  const pattern = new Set(studyDayIndexesFor(2))
  for (const date of dates) {
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay()
    assert.ok(pattern.has(dow === 0 ? 6 : dow - 1), `${date} no está en el patrón declarado`)
  }
})
