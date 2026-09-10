import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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

// ── Disponibilidad excepcional: es del alumno, no de un paso ─────────────

test('sin ningún día del patrón antes del examen, se PROPONE abrir la semana', () => {
  // Sábado 05/06/2027, examen el lunes 07/06, patrón L/X/V: entre hoy y la
  // prueba no queda ni un día del patrón.
  //
  // La semana NO se abre sola. Programarle el fin de semana sin preguntar es
  // decidir por él algo que no ha aceptado: se marca la excepción como
  // disponible y el plan se queda vacío hasta que la acepte. Un plan vacío con
  // una explicación es más honesto que un plan que da por hecho su sábado.
  const ctx = context({ today: '2027-06-05', examDate: '2027-06-07', weeklyStudyDays: 3, holidays: NO_HOLIDAYS })
  assert.equal(ctx.emergencyAvailability, true, 'no se detecta que no le quedan días')
  assert.equal(ctx.emergencyAvailabilityAccepted, false, 'la excepción se ha aplicado sin aceptarla')
  assert.deepEqual(ctx.studyDayIndexes, [0, 2, 4], 'se le ha cambiado el patrón declarado')
  assert.deepEqual(planningDates(ctx, { includeFinalReviewWindow: true }), [])
})

test('aceptada la excepción, se abre la semana entera y hay fechas', () => {
  const ctx = buildStudentPlanContext({
    today: '2027-06-05', examDate: '2027-06-07', weeklyStudyDays: 3,
    dailyMinutes: 60, holidays: NO_HOLIDAYS, emergencyAvailabilityAccepted: true,
  })
  assert.equal(ctx.emergencyAvailabilityAccepted, true)
  assert.deepEqual(ctx.studyDayIndexes, [0, 1, 2, 3, 4, 5, 6])
  assert.deepEqual(planningDates(ctx, { includeFinalReviewWindow: true }), ['2027-06-05', '2027-06-06'])
})

test('la excepción solo se ofrece si de verdad no le queda ningún día', () => {
  const ctx = context({ today: '2026-05-17', examDate: '2026-06-07', weeklyStudyDays: 2, holidays: NO_HOLIDAYS })
  assert.equal(ctx.emergencyAvailability, false)
  assert.deepEqual(ctx.studyDayIndexes, [0, 3])
})

test('aceptar la excepción NO mete temario nuevo en la reserva final', () => {
  const ctx = buildStudentPlanContext({
    today: '2027-06-05', examDate: '2027-06-07', weeklyStudyDays: 3,
    dailyMinutes: 60, holidays: NO_HOLIDAYS, emergencyAvailabilityAccepted: true,
  })
  assert.deepEqual(planningDates(ctx), [], 'siembra temario nuevo en la víspera')
  assert.ok(planningDates(ctx, { includeFinalReviewWindow: true }).length > 0, 'y tampoco puede quedarse sin nada')
})

test('un alumno sin excepción aceptada puede terminar el onboarding igualmente', () => {
  // La salida de emergencia no es el plan: es que el registro no se bloquee.
  // /api/onboarding/finalize acepta el caso "temario válido, cero sesiones
  // disponibles" como estado honesto del plan, y el aviso de Camino ofrece
  // aceptar la excepción. Sin esto, la decisión de no imponer el fin de
  // semana dejaría al alumno sin poder registrarse.
  const finalize = readFileSync(join(process.cwd(), 'app', 'api', 'onboarding', 'finalize', 'route.ts'), 'utf8')
  assert.ok(finalize.includes('planningDates(context, { includeFinalReviewWindow: true }).length > 0'),
    'finalize no distingue "no caben sesiones" de "la generación falló"')
  assert.ok(finalize.includes('queue.error || unplaced.error'),
    'un fallo de base de datos podría pasar por plan vacío legítimo')

  const banner = readFileSync(join(process.cwd(), 'app', 'components', 'camino', 'UnscheduledWorkBanner.tsx'), 'utf8')
  assert.ok(banner.includes('needsAvailability'), 'el alumno no puede aceptar la excepción desde Camino')
})
