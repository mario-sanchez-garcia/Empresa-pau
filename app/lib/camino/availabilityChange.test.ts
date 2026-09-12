// Cambiar la disponibilidad, de punta a punta: contexto → ventana de
// planificación → colocación → lo que el alumno acaba viendo.
//
// Los tests de planPlacement.test.ts comprueban la REGLA sobre una ventana
// dada. Este comprueba la CADENA: que el patrón semanal nuevo llegue de
// verdad hasta la fecha de cada misión, que es donde se rompía. El fallo
// reproducido: el alumno pasa a estudiar lunes y jueves y su misión de
// parcial se queda en el martes, porque la firma que decidía si recalcular
// solo miraba los datos del examen y nunca la disponibilidad.

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildStudentPlanContext, planningDates } from './planWindow.ts'
import { missionsPerDayForMinutes } from './dailyTimeCapacity.ts'
import { planPlacement, type PlacementRow, type PlacementWindow } from './planPlacement.ts'

const TODAY = '2026-05-11'   // lunes
const PAU = '2026-06-07'
const PARCIAL = '2026-05-15' // viernes: el examen de mates del alumno

/** Lo que hace la personalización: contexto del alumno → ventana real. */
function ventanaDe(weeklyStudyDays: number, dailyMinutes: number): PlacementWindow {
  const context = buildStudentPlanContext({ today: TODAY, examDate: PAU, weeklyStudyDays, dailyMinutes })
  return {
    dates: planningDates(context, { includeFinalReviewWindow: true }),
    capacityPerDay: missionsPerDayForMinutes(dailyMinutes),
    planningCutoff: context.planningCutoff,
    examDate: context.examDate,
  }
}

const leccion = (id: string, date: string): PlacementRow =>
  ({ id, missionType: 'concept', scheduledDate: date, queueId: `q-${id}`, source: 'algorithm' })
const preparacion = (id: string, date: string): PlacementRow =>
  ({ id, missionType: 'exercise_practice', scheduledDate: date, source: 'partial', deadlineDate: PARCIAL })

test('de lunes-a-viernes a lunes-y-jueves: el martes deja de recibir trabajo', () => {
  const antes = ventanaDe(5, 60)
  assert.ok(antes.dates.includes('2026-05-12'), 'con L-V el martes debería ser día de estudio')

  const despues = ventanaDe(2, 60)
  assert.ok(!despues.dates.includes('2026-05-12'), 'el martes sigue en la ventana tras cambiar a L y J')
  assert.deepEqual(despues.dates.slice(0, 4), ['2026-05-11', '2026-05-14', '2026-05-18', '2026-05-21'])
})

test('la preparación del parcial del martes no se queda en el martes', () => {
  const window = ventanaDe(2, 60)
  const { placements, unscheduled } = planPlacement([preparacion('prep', '2026-05-12')], window)

  assert.equal(unscheduled.length, 0, 'había días válidos antes de su examen y aun así no se colocó')
  assert.notEqual(placements[0].date, '2026-05-12')
  assert.ok(['2026-05-11', '2026-05-14'].includes(placements[0].date))
  assert.ok(placements[0].date < PARCIAL, 'preparar un examen después de haberlo hecho no sirve de nada')
})

test('el día del alumno no se estira para meter el parcial', () => {
  // 30 min declarados = 1 misión al día (dailyTimeCapacity). Ese lunes hay
  // preparación de parcial Y lección: una de las dos se va a otro día.
  const window = ventanaDe(2, 30)
  assert.equal(window.capacityPerDay, 1)
  const { placements } = planPlacement(
    [leccion('tema', '2026-05-11'), preparacion('prep', '2026-05-11')],
    window,
  )
  const eseLunes = placements.filter(p => p.date === '2026-05-11')
  assert.equal(eseLunes.length, 1, 'el lunes acabó con dos misiones y el alumno declaró una')
  assert.equal(eseLunes[0].id, 'prep', 'el parcial, que vence antes, es el que ocupa el hueco')

  const tema = placements.find(p => p.id === 'tema')
  assert.ok(tema, 'la lección desapareció del plan')
  assert.ok(tema!.date > '2026-05-11', 'la lección debería desplazarse, no quedarse encima')
})

test('ninguna fecha propuesta cruza la PAU, cambie lo que cambie la disponibilidad', () => {
  for (const dias of [1, 2, 3, 4, 5, 6, 7]) {
    const window = ventanaDe(dias, 180)
    for (const date of window.dates) assert.ok(date < PAU, `${date} cae en o después de la PAU con ${dias} días`)
  }
})

test('menos días es menos capacidad total, no días más cargados', () => {
  // La confusión que el selector tiene que evitar: bajar de días NO comprime
  // el temario en sesiones más densas.
  const seis = ventanaDe(6, 60)
  const dos = ventanaDe(2, 60)
  assert.equal(seis.capacityPerDay, dos.capacityPerDay, 'las misiones por día dependen solo de los minutos')
  assert.ok(dos.dates.length < seis.dates.length / 2.5, 'la capacidad total debería caer con los días')
})
