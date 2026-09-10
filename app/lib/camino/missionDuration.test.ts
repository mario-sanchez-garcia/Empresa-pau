import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  estimatedMinutesForMission,
  estimatedMinutesForMissionType,
  minutesBetweenTimes,
} from './missionDuration.ts'
import { PARCIAL_MINUTES, REFERENCE_MISSION_MINUTES, SIMULACRO_MINUTES } from './xpMap.ts'

test('el hueco realmente reservado manda sobre cualquier estimación', () => {
  assert.equal(
    estimatedMinutesForMission({
      mission_type: 'pau_practice',
      start_time: '16:00:00',
      end_time: '17:30:00',
    }),
    90,
  )
})

test('un rango inválido cae en la estimación en vez de dar negativo o cero', () => {
  assert.equal(minutesBetweenTimes('17:00', '16:00'), null)
  assert.equal(minutesBetweenTimes('16:00', '16:00'), null)
  assert.equal(minutesBetweenTimes(null, '16:00'), null)
  assert.equal(
    estimatedMinutesForMission({ mission_type: 'partial_practice', start_time: '17:00', end_time: '16:00' }),
    PARCIAL_MINUTES,
  )
})

test('el enlace al Simulacro real dura 90, no los 25 de la misión de referencia', () => {
  // Regresión del mensaje de "Recalcular mi Camino": comparte mission_type
  // con el resto de pau_practice, así que estimarlo por tipo lo dejaba en
  // REFERENCE_MISSION_MINUTES.
  assert.equal(estimatedMinutesForMissionType('pau_practice'), REFERENCE_MISSION_MINUTES)
  assert.equal(
    estimatedMinutesForMission({
      mission_type: 'pau_practice',
      metadata: { links_to_simulacro_exam_id: 'exam-1' },
    }),
    SIMULACRO_MINUTES,
  )
})

test('un microdiagnóstico NO se cuenta como un Simulacro completo', () => {
  // Mismo mission_type, dos preguntas: se queda en la misión de referencia,
  // que es el hueco que le reserva injectDiagnosticMissions.
  assert.equal(
    estimatedMinutesForMission({
      mission_type: 'pau_practice',
      metadata: { diagnostic_for: 'limites-continuidad' },
    }),
    REFERENCE_MISSION_MINUTES,
  )
})

test('práctica + Simulacro suman los minutos reales del calendario', () => {
  // El caso exacto del informe: el resumen decía 70 minutos donde el
  // calendario tenía 135.
  const rows = [
    { mission_type: 'partial_practice', metadata: {} },
    { mission_type: 'pau_practice', metadata: { links_to_simulacro_exam_id: 'exam-1' } },
  ]
  const total = rows.reduce((sum, row) => sum + estimatedMinutesForMission(row), 0)
  assert.equal(total, PARCIAL_MINUTES + SIMULACRO_MINUTES)
  assert.equal(total, 135)
})

test('metadata basura no rompe el cálculo', () => {
  for (const metadata of [null, undefined, 'texto', 42, ['a']]) {
    assert.equal(
      estimatedMinutesForMission({ mission_type: 'review', metadata }),
      20,
      `metadata ${JSON.stringify(metadata)} debería caer en la estimación por tipo`,
    )
  }
})
