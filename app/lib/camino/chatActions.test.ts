import test from 'node:test'
import assert from 'node:assert/strict'
import { actionNeedsConfirmation, isValidFutureDate, parseCaminoChatAction } from './chatActions.ts'

const TODAY = '2026-09-07'

test('interpreta mover una misión con fecha y hora', () => {
  const action = parseCaminoChatAction('Pásame la misión de física del jueves al viernes a las 18:00', TODAY)
  assert.equal(action.intent, 'MOVE_MISSION')
  assert.equal(action.targetDate, '2026-09-11')
  assert.equal(action.targetTime, '18:00')
  assert.equal(actionNeedsConfirmation(action), true)
})

test('interpreta una misión extra real', () => {
  const action = parseCaminoChatAction('Añádeme 30 minutos de matrices el sábado', TODAY)
  assert.equal(action.intent, 'CREATE_EXTRA_MISSION')
  assert.equal(action.durationMinutes, 30)
  assert.equal(action.targetDate, '2026-09-12')
})

test('un examen sin temario pide solo el dato imprescindible', () => {
  const action = parseCaminoChatAction('Tengo examen de química el 17 de septiembre', TODAY)
  assert.equal(action.intent, 'CREATE_EXAM')
  assert.equal(action.targetDate, '2026-09-17')
  assert.deepEqual(action.missing, ['topic'])
})

test('una recomendación nunca muta', () => {
  const action = parseCaminoChatAction('¿Qué debería estudiar hoy?', TODAY)
  assert.equal(action.intent, 'SUGGEST_STUDY')
  assert.equal(action.mutates, false)
  assert.equal(actionNeedsConfirmation(action), false)
})

test('reorganizar hoy requiere confirmación', () => {
  const action = parseCaminoChatAction('Hoy no puedo estudiar, reorganiza lo de hoy', TODAY)
  assert.equal(action.intent, 'REORGANIZE_DAY')
  assert.equal(action.sourceDate, TODAY)
  assert.equal(action.mutates, true)
})

test('rechaza fechas inexistentes y demasiado lejanas', () => {
  assert.equal(isValidFutureDate('2026-02-30', TODAY), false)
  assert.equal(isValidFutureDate('2028-09-07', TODAY), false)
})

test('una acción ajena al alcance queda sin mutación', () => {
  const action = parseCaminoChatAction('Manda un email a mi profesor', TODAY)
  assert.equal(action.intent, 'UNSUPPORTED')
  assert.equal(action.mutates, false)
})
