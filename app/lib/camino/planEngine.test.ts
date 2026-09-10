import assert from 'node:assert/strict'
import { test } from 'node:test'

import { PLAN_ENGINE_VERSION, buildPlanDays, weightedRotationOrder } from './planEngine.ts'

const SUBJECTS = ['matematicas_ii', 'lengua', 'historia_espana', 'fisica', 'quimica', 'ingles']

function base(overrides: Partial<Parameters<typeof buildPlanDays>[0]> = {}) {
  return buildPlanDays({
    from: '2026-09-14',
    to: '2026-10-14',
    examDate: '2027-06-07',
    subjects: SUBJECTS,
    dailyMinutes: 60,
    origin: 'server' as const,
    ...overrides,
  })
}

test('C08: servidor y cliente producen el MISMO plan con las mismas entradas', () => {
  const server = base({ origin: 'server' })
  const client = base({ origin: 'forecast' })
  assert.equal(server.length, client.length)
  for (let i = 0; i < server.length; i++) {
    assert.equal(server[i].date, client[i].date)
    assert.equal(server[i].subject, client[i].subject, `divergen el ${server[i].date}`)
    assert.equal(server[i].missionSlots, client[i].missionSlots)
  }
})

test('C08: una previsión va siempre identificada como tal', () => {
  const forecast = base({ origin: 'forecast' })
  assert.ok(forecast.every(d => d.origin === 'forecast'))
  assert.ok(forecast.every(d => d.planVersion === PLAN_ENGINE_VERSION))
})

test('C08: el plan nunca cruza la fecha del examen', () => {
  const days = base({ from: '2027-05-17', to: '2027-06-28', examDate: '2027-06-07' })
  for (const day of days) {
    if (day.date >= '2027-06-07') {
      assert.equal(day.subject, null, `${day.date} tiene asignatura después del examen`)
      assert.equal(day.excludedReason, 'after_exam')
    }
  }
  assert.ok(days.some(d => d.subject != null), 'debería quedar plan antes del examen')
})

test('C08: la ventana de repaso final no recibe temario nuevo', () => {
  const days = base({ from: '2027-05-17', to: '2027-06-06', examDate: '2027-06-07', reservedFinalStudyDays: 5 })
  const reserved = days.filter(d => d.excludedReason === 'final_review_window')
  assert.equal(reserved.length, 5)
  assert.ok(days.some(d => d.subject != null))
})

test('C08: los festivos y el patrón semanal se respetan igual en ambos lados', () => {
  const days = base({
    from: '2026-09-14', to: '2026-09-18',
    weeklyStudyDays: 2,
    holidays: new Set(['2026-09-17']),
  })
  const planned = days.filter(d => d.subject != null).map(d => d.date)
  // weeklyStudyDays 2 = lunes y jueves; el jueves 17 es festivo.
  assert.deepEqual(planned, ['2026-09-14'])
})

test('las 6 asignaturas entran en el reparto', () => {
  const counts = new Map<string, number>()
  for (const day of base()) {
    if (day.subject) counts.set(day.subject, (counts.get(day.subject) ?? 0) + 1)
  }
  for (const subject of SUBJECTS) {
    assert.ok((counts.get(subject) ?? 0) > 0, `${subject} sin días: ${JSON.stringify([...counts])}`)
  }
})

test('C08: los pesos de rotación (examen/Orientación) valen en los dos lados', () => {
  const weights = { matematicas_ii: 3 }
  const withWeight = base({ rotationWeights: weights })
  const without = base()
  const count = (days: ReturnType<typeof base>) => days.filter(d => d.subject === 'matematicas_ii').length
  assert.ok(count(withWeight) > count(without),
    'una prioridad debe traducirse en más días, no solo en la vista previa')
})

test('un peso no expulsa a las demás asignaturas del reparto', () => {
  const days = base({ rotationWeights: { matematicas_ii: 3 } })
  const seen = new Set(days.map(d => d.subject).filter(Boolean))
  assert.equal(seen.size, SUBJECTS.length)
})

test('weightedRotationOrder conserva el orden y nunca vacía el reparto', () => {
  assert.deepEqual(weightedRotationOrder(['a', 'b'], { a: 2 }), ['a', 'a', 'b'])
  assert.deepEqual(weightedRotationOrder(['a', 'b'], { a: 0 }), ['a', 'b'])
  assert.deepEqual(weightedRotationOrder([]), [])
})

test('un examen ese día gana a la rotación', () => {
  const days = base({
    from: '2026-09-16', to: '2026-09-16',
    examSubjectsByDate: new Map([['2026-09-16', ['ingles']]]),
  })
  assert.equal(days[0].subject, 'ingles')
})

test('si a la asignatura elegida no le queda cola, el día no se pierde', () => {
  const dayFull = base({ from: '2026-09-14', to: '2026-09-14' })[0]
  const chosen = dayFull.subject
  assert.ok(chosen)
  const dayFallback = base({ from: '2026-09-14', to: '2026-09-14', hasWork: s => s !== chosen })[0]
  assert.ok(dayFallback.subject && dayFallback.subject !== chosen)
})

test('sin temario en ninguna asignatura el día queda explicado, no en silencio', () => {
  const day = base({ from: '2026-09-14', to: '2026-09-14', hasWork: () => false })[0]
  assert.equal(day.subject, null)
  assert.equal(day.excludedReason, 'no_subject_available')
})

test('los minutos declarados deciden los huecos por día', () => {
  assert.equal(base({ dailyMinutes: 30 })[0].missionSlots, 1)
  assert.equal(base({ dailyMinutes: 180 })[0].missionSlots, 4)
})
