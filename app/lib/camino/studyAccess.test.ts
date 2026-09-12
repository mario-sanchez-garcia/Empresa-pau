import assert from 'node:assert/strict'
import { test } from 'node:test'

import { availabilityError, resolveStudyAccess, studyDayOptions, type StudyEntitlement } from './studyAccess.ts'

const NOW = Date.parse('2026-09-12T12:00:00Z')
const ent = (plan: string, extra: Partial<StudyEntitlement> = {}): StudyEntitlement =>
  ({ plan_id: plan, status: 'active', expires_at: null, started_at: null, ...extra })

test('sin acceso ninguno, el alumno es free — y free son 2 días', () => {
  const access = resolveStudyAccess([], NOW)
  assert.equal(access.planId, 'free')
  assert.equal(access.maxStudyDaysPerWeek, 2)
})

test('manda el acceso más generoso, no el orden en que llegan las filas', () => {
  // Reproducción: la consulta anterior hacía .limit(1) sobre un orden no
  // determinista, así que un alumno con premium Y una fila free podía
  // acabar planificando con 2 días según qué devolviera Supabase primero.
  const alRevés = resolveStudyAccess([ent('free'), ent('superpremium')], NOW)
  const enOrden = resolveStudyAccess([ent('superpremium'), ent('free')], NOW)
  assert.equal(alRevés.planId, 'superpremium')
  assert.equal(enOrden.planId, 'superpremium')
  assert.equal(alRevés.maxStudyDaysPerWeek, 7)
})

test('un acceso caducado o que aún no ha empezado no cuenta', () => {
  const caducado = ent('superpremium', { expires_at: '2026-08-09T23:59:59+02:00' })
  const futuro = ent('premium', { started_at: '2027-01-01T00:00:00Z' })
  assert.equal(resolveStudyAccess([caducado, futuro], NOW).planId, 'free')
})

test('el acceso de cortesía de la beta se etiqueta como beta', () => {
  // La etiqueta sale de un acceso concedido, nunca de un flag del navegador.
  const beta = ent('superpremium', { metadata: { beta_cohort: true } })
  assert.equal(resolveStudyAccess([beta], NOW).beta, true)
  assert.equal(resolveStudyAccess([ent('premium')], NOW).beta, false)
})

test('el selector ofrece exactamente los días que el acceso permite', () => {
  assert.deepEqual(studyDayOptions(resolveStudyAccess([], NOW).maxStudyDaysPerWeek), [1, 2])
  assert.deepEqual(studyDayOptions(resolveStudyAccess([ent('premium')], NOW).maxStudyDaysPerWeek), [1, 2, 3, 4, 5, 6])
})

test('pedir más días de los que da el acceso se RECHAZA, no se recorta', () => {
  // El fallo original: el formulario aceptaba 7, se guardaba 7, y el backend
  // planificaba con 6 (o con 2 en free) sin decir nada.
  const free = resolveStudyAccess([], NOW)
  const error = availabilityError(5, 60, free)
  assert.ok(error, 'se aceptaron 5 días con un acceso de 2')
  assert.match(error!, /no hemos recortado/i)
  assert.equal(availabilityError(2, 60, free), null)
})

test('los minutos también tienen que ser un valor que el motor sepa usar', () => {
  const premium = resolveStudyAccess([ent('premium')], NOW)
  assert.ok(availabilityError(4, 75, premium), '75 min no está en la tabla de capacidad')
  assert.equal(availabilityError(4, 90, premium), null)
})

test('"depende de la semana" ya no es una respuesta válida', () => {
  // El onboarding ofrecía rangos ("3-4 días") y un "depende", que luego se
  // convertían en un número distinto del que el alumno creía haber elegido.
  const premium = resolveStudyAccess([ent('premium')], NOW)
  assert.ok(availabilityError(null, 60, premium))
  assert.ok(availabilityError(4.5, 60, premium))
})
