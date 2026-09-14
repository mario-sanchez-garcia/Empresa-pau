import assert from 'node:assert/strict'
import test from 'node:test'

import { CONSOLIDATION_RESERVE_RATIO, contentPaceDates, dailyNewContentBudget } from './contentPace.ts'
import { buildStudentPlanContext, planningDates } from './planWindow.ts'

const dates = (n: number) => Array.from({ length: n }, (_, i) => `d${String(i).padStart(3, '0')}`)

test('el tramo final de consolidacion no recibe temario nuevo', () => {
  const all = dates(218)
  const pace = contentPaceDates(all)
  assert.equal(pace.length, 218 - Math.floor(218 * CONSOLIDATION_RESERVE_RATIO))
  assert.equal(pace[0], all[0])
  assert.ok(pace.at(-1)! < all.at(-1)!, 'el ultimo dia del curso no puede llevar temario nuevo')
})

test('un curso de un solo dia sigue teniendo donde colocar el temario', () => {
  assert.deepEqual(contentPaceDates(['solo']), ['solo'])
  assert.deepEqual(contentPaceDates([]), [])
})

test('el temario se reparte en vez de agotarse: 308 temas no caben en ocho semanas', () => {
  // Caso reproducido: 180 min x 6 dias, PAU 07/06/2027, temario real.
  const context = buildStudentPlanContext({
    today: '2026-09-14', examDate: '2027-06-07', dailyMinutes: 180, weeklyStudyDays: 6, holidays: new Set(),
  })
  const all = planningDates(context, { includeFinalReviewWindow: true })
  const pace = contentPaceDates(all)
  const pendingContentMinutes = 7740
  const perDay = dailyNewContentBudget({ pendingContentMinutes, paceStudyDays: pace.length, dailyMinutes: 180 })
  assert.ok(perDay < 180, 'a maxima velocidad el temario se agota antes de noviembre')
  // El reparto tiene que cubrir el temario entero dentro del tramo de ritmo.
  assert.ok(perDay * pace.length >= pendingContentMinutes, 'el reparto no puede dejar temario fuera')
  const daysUsed = Math.ceil(pendingContentMinutes / perDay)
  assert.ok(daysUsed > 45, `el temario seguia cabiendo en ${daysUsed} dias de estudio`)
})

test('el ritmo nunca frena a quien va justo de tiempo', () => {
  // Mas temario que capacidad: el tope se queda en el presupuesto completo.
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 9000, paceStudyDays: 20, dailyMinutes: 180 }), 180)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 1, paceStudyDays: 0, dailyMinutes: 180 }), 180)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 0, paceStudyDays: 100, dailyMinutes: 180 }), 180)
})

test('el reparto nunca baja de una mision: un dia de ritmo no puede quedar en cero', () => {
  const budget = dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 180 })
  assert.ok(budget >= 25, `un tope de ${budget} min deja dias sin una sola mision`)
  // ...salvo que el propio alumno declare menos que una mision de referencia.
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 20 }), 20)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 0 }), 0)
})
