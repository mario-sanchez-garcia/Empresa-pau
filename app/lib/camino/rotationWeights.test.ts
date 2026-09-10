import assert from 'node:assert/strict'
import { test } from 'node:test'

import { examRotationWeight, examRotationWeights, priorityWeight } from './rotationWeights.ts'

const exam = (date: string, priority: 'baja' | 'normal' | 'alta' | 'muy_alta' = 'normal') =>
  ({ subjectSlug: 'mates', date, priority })

test('sin exámenes cerca, todas las asignaturas rotan por igual', () => {
  assert.equal(examRotationWeight('mates', '2026-09-14', []), 1)
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-12-01', 'muy_alta')]), 1)
})

test('un examen muy próximo da turnos extra según su prioridad', () => {
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-17', 'baja')]), 1)
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-17', 'normal')]), 2)
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-17', 'alta')]), 3)
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-17', 'muy_alta')]), 4)
})

test('un examen de otra asignatura no da turnos a esta', () => {
  assert.equal(examRotationWeight('lengua', '2026-09-14', [exam('2026-09-17', 'muy_alta')]), 1)
})

test('un examen ya pasado no cuenta', () => {
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-10', 'muy_alta')]), 1)
})

test('a media distancia solo pesan las prioridades altas', () => {
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-24', 'normal')]), 1)
  assert.equal(examRotationWeight('mates', '2026-09-14', [exam('2026-09-24', 'alta')]), 2)
})

test('el peso siempre deja turno a las demás asignaturas', () => {
  // Con 3 asignaturas y el peso máximo (4), la asignatura del examen ocupa 4
  // de 6 posiciones: las otras dos conservan la suya.
  const weights = examRotationWeights(['mates', 'lengua', 'fisica'], '2026-09-14', [exam('2026-09-15', 'muy_alta')])
  assert.equal(weights.mates, 4)
  assert.equal(weights.lengua, 1)
  assert.equal(weights.fisica, 1)
})

test('priorityWeight es la escala que espera el resto de la app', () => {
  assert.deepEqual(
    (['baja', 'normal', 'alta', 'muy_alta'] as const).map(priorityWeight),
    [1, 2, 3, 4],
  )
})
