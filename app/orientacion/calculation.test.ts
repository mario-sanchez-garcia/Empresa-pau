import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAdmissionScore, getTargetDifference } from './calculation.ts'
import { FIXTURE_SOURCE, type AdmissionSubject } from './data.ts'

const subject = (id: string, grade: number, weighting: 0.1 | 0.2, enabled = true): AdmissionSubject => ({
  id, subjectCode: id, name: id, defaultGrade: grade, weighting, enabled, source: FIXTURE_SOURCE,
})

test('calcula sin optativas', () => assert.equal(calculateAdmissionScore(8, 7, []), 7.6))
test('calcula una ponderada', () => assert.equal(calculateAdmissionScore(8, 7, [subject('a', 9, 0.2)]), 9.4))
test('calcula dos ponderadas', () => assert.equal(calculateAdmissionScore(8, 7, [subject('a', 9, 0.2), subject('b', 8, 0.2)]), 11))
test('con tres ponderadas escoge las dos aportaciones más altas', () => assert.equal(calculateAdmissionScore(8, 7, [subject('a', 10, 0.1), subject('b', 8, 0.2), subject('c', 9, 0.2)]), 11))
test('distingue ponderaciones 0.1 y 0.2', () => assert.equal(calculateAdmissionScore(5, 5, [subject('a', 10, 0.1), subject('b', 10, 0.2)]), 8))
test('limita la nota máxima a 14', () => assert.equal(calculateAdmissionScore(10, 10, [subject('a', 10, 0.2), subject('b', 10, 0.2)]), 14))
test('un cambio de slider recalcula la nota', () => assert.equal(calculateAdmissionScore(9, 7, []), 8.2))
test('una asignatura desactivada no aporta', () => assert.equal(calculateAdmissionScore(8, 7, [subject('a', 10, 0.2, false)]), 7.6))
test('una asignatura suspensa no aporta aunque esté activada', () => assert.equal(calculateAdmissionScore(8, 7, [subject('a', 4.99, 0.2)]), 7.6))
test('detecta objetivo superado', () => assert.ok(getTargetDifference(12.3, 12.1) > 0))
test('detecta objetivo pendiente', () => assert.ok(getTargetDifference(11.8, 12.1) < 0))
