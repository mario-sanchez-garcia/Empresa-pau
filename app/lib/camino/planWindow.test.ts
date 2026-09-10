import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildStudentPlanContext,
  isWithinPlan,
  planningDates,
  studyDaysRemaining,
} from './planWindow.ts'
import { FINAL_REVIEW_RESERVED_STUDY_DAYS } from './examDate.ts'

const NO_HOLIDAYS: ReadonlySet<string> = new Set()

const context = (overrides: Partial<Parameters<typeof buildStudentPlanContext>[0]> = {}) =>
  buildStudentPlanContext({
    today: '2026-05-17',
    examDate: '2026-06-07',
    weeklyStudyDays: 2,
    dailyMinutes: 60,
    holidays: NO_HOLIDAYS,
    ...overrides,
  })

test('ninguna fecha propuesta alcanza el día del examen', () => {
  // Reproducción del informe: 30 filas desde el 17/05 con dos días semanales
  // aterrizaban hasta el 08/07, un mes después de la PAU del 07/06.
  const dates = planningDates(context(), { limit: 30, includeFinalReviewWindow: true })
  assert.ok(dates.length > 0)
  for (const date of dates) {
    assert.ok(date < '2026-06-07', `${date} cae en o después del examen`)
    assert.ok(isWithinPlan(context(), date))
  }
})

test('el temario nuevo se corta antes que la práctica: la reserva final existe', () => {
  const ctx = context({ weeklyStudyDays: 5 })
  const conTemario = planningDates(ctx)
  const conPractica = planningDates(ctx, { includeFinalReviewWindow: true })
  assert.ok(conTemario.length < conPractica.length, 'la reserva final no está recortando nada')
  assert.equal(conPractica.length - conTemario.length, FINAL_REVIEW_RESERVED_STUDY_DAYS)
  // Y la reserva NO es un vacío: sigue habiendo días donde poner práctica.
  assert.equal(conPractica.at(-1)! >= ctx.planningCutoff, true)
})

test('las fechas propuestas están todas en el patrón semanal declarado', () => {
  const ctx = context({ weeklyStudyDays: 2 })
  for (const date of planningDates(ctx, { includeFinalReviewWindow: true })) {
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay()
    const mondayIdx = dow === 0 ? 6 : dow - 1
    assert.ok(ctx.studyDayIndexes.includes(mondayIdx), `${date} no es un día que el alumno estudie`)
  }
})

test('un alumno de 7 días recibe también sábados y domingos', () => {
  const ctx = context({ weeklyStudyDays: 7 })
  const dates = planningDates(ctx, { includeFinalReviewWindow: true })
  assert.ok(dates.some(date => {
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay()
    return dow === 0 || dow === 6
  }), 'ni un solo día de fin de semana en un plan de 7 días semanales')
})

test('los días restantes cuentan turnos del alumno, no días naturales', () => {
  // Mismo periodo, disponibilidad distinta: no es lo mismo "tres semanas"
  // para quien estudia a diario que para quien estudia dos días.
  assert.ok(studyDaysRemaining(context({ weeklyStudyDays: 7 })) > studyDaysRemaining(context({ weeklyStudyDays: 2 })))
  assert.equal(studyDaysRemaining(context({ weeklyStudyDays: 2 })), 6) // 3 semanas × 2 días
})

test('un alumno que entra dentro de la reserva final no recibe temario nuevo', () => {
  // Tres días antes del examen: la ventana entera es repaso.
  const ctx = context({ today: '2026-06-04', weeklyStudyDays: 5 })
  assert.deepEqual(planningDates(ctx), [], 'sigue sembrando temario nuevo en la víspera')
  assert.ok(planningDates(ctx, { includeFinalReviewWindow: true }).length > 0, 'tampoco puede quedarse sin práctica')
})

test('los festivos no cuentan como día de estudio', () => {
  const ctx = context({ weeklyStudyDays: 5, holidays: new Set(['2026-05-18']) })
  assert.ok(!planningDates(ctx, { includeFinalReviewWindow: true }).includes('2026-05-18'))
})

test('`from` nunca retrocede al pasado', () => {
  const ctx = context()
  const dates = planningDates(ctx, { from: '2020-01-01', includeFinalReviewWindow: true })
  assert.ok(dates.every(date => date >= ctx.today))
})
