import assert from 'node:assert/strict'
import test from 'node:test'
import { FIXTURE_SOURCE, type AdmissionSubject, type OrientationTarget } from '../data.ts'
import { createDefaultAccessScenarios, createEmptyStoredSubjectInputs } from './model.ts'
import { applyStoredSubjectInputs, createCaminoOrientationContext, parseAccessPathStorage, parseCaminoOrientationContext, subjectInputsFromScenarios } from './storage.ts'

const subjects: AdmissionSubject[] = [{ id: 'math', subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 7, enabled: true, source: FIXTURE_SOURCE }]

test('restaura vía, escenarios y materias sin mezclar datos incompatibles', () => {
  const scenarios = createDefaultAccessScenarios()
  scenarios.spanish_bachillerato.bachillerato = 9.1
  scenarios.ib.accreditedCau = 7.4
  const subjectInputs = createEmptyStoredSubjectInputs()
  subjectInputs.spanish_bachillerato['matematicas-ii'] = { grade: 9, enabled: true }
  subjectInputs.ib['matematicas-ii'] = { grade: 6, enabled: false }
  const restored = parseAccessPathStorage(JSON.stringify({ version: 1, selectedPath: 'ib', scenarios, subjectInputs }))
  assert.equal(restored?.selectedPath, 'ib')
  assert.equal(restored?.scenarios.spanish_bachillerato.bachillerato, 9.1)
  assert.equal(restored?.scenarios.ib.accreditedCau, 7.4)
  assert.deepEqual(applyStoredSubjectInputs(subjects, restored?.subjectInputs.spanish_bachillerato)[0], { ...subjects[0], defaultGrade: 9, enabled: true })
  assert.deepEqual(applyStoredSubjectInputs(subjects, restored?.subjectInputs.ib)[0], { ...subjects[0], defaultGrade: 6, enabled: false })
})

test('rechaza versiones o JSON inválidos y acota calificaciones manipuladas', () => {
  assert.equal(parseAccessPathStorage('{'), null)
  assert.equal(parseAccessPathStorage(JSON.stringify({ version: 2, selectedPath: 'ib' })), null)
  const scenarios = createDefaultAccessScenarios()
  scenarios.ib.subjectAverage = 99
  const restored = parseAccessPathStorage(JSON.stringify({ version: 1, selectedPath: 'ib', scenarios, subjectInputs: createEmptyStoredSubjectInputs() }))
  assert.equal(restored?.scenarios.ib.subjectAverage, 7)
})

test('conserva como vacíos los datos externos que el alumno todavía no tiene', () => {
  const scenarios = createDefaultAccessScenarios()
  const restored = parseAccessPathStorage(JSON.stringify({ version: 1, selectedPath: 'international', scenarios, subjectInputs: createEmptyStoredSubjectInputs() }))
  assert.equal(restored?.scenarios.ib.accreditedCau, null)
  assert.equal(restored?.scenarios.international.accreditedCau, null)
  assert.deepEqual(restored?.scenarios.international.pceGrades, [null, null, null, null])
})

test('serializa inputs por vía de forma aislada', () => {
  const stored = subjectInputsFromScenarios({ spanish_bachillerato: subjects, bachibac: [{ ...subjects[0], defaultGrade: 8 }], ib: [{ ...subjects[0], defaultGrade: 6 }], international: [] })
  assert.equal(stored.spanish_bachillerato['matematicas-ii'].grade, 7)
  assert.equal(stored.bachibac['matematicas-ii'].grade, 8)
  assert.equal(stored.ib['matematicas-ii'].grade, 6)
})

test('prepara un contexto mínimo y estable para la futura integración con Camino', () => {
  const target: OrientationTarget = { id: 'target', degreeId: 'degree', universityId: 'university', degreeCode: null, universityCode: null, degree: 'Psicología', university: 'UCM', universityAcronym: 'UCM', community: 'Madrid', referenceScore: 12, referenceLabel: 'Referencia', source: FIXTURE_SOURCE, subjects }
  const context = createCaminoOrientationContext('ib', target, 11.5, -0.5, subjects, { pathId: 'ib', inputMode: 'accredited_cau', accreditedCau: 9, subjectAverage: null }, true, new Date('2026-09-02T12:00:00.000Z'))
  assert.equal(context.accessPath, 'ib')
  assert.equal(context.route, 'ib_unedasiss')
  assert.equal(context.calculationComplete, true)
  assert.equal(context.target.degreeId, 'degree')
  assert.equal(context.estimatedScore, 11.5)
  assert.equal(context.impactSubjects[0].subjectCode, 'matematicas-ii')
  assert.equal(context.updatedAt, '2026-09-02T12:00:00.000Z')
})

test('valida el contexto de Camino y no inventa la ruta de contextos antiguos ambiguos', () => {
  assert.equal(parseCaminoOrientationContext('{'), null)
  assert.equal(parseCaminoOrientationContext(JSON.stringify({ version: 1, accessPath: 'unknown', target: {} })), null)
  const restored = parseCaminoOrientationContext(JSON.stringify({
    version: 1,
    accessPath: 'bachibac',
    target: { degreeId: 'degree', universityId: 'university', degree: 'Psicología', university: 'UCM', referenceScore: 12 },
    estimatedScore: 11.5,
    gap: -0.5,
    impactSubjects: [{ subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 99 }],
    updatedAt: '2026-09-02T12:00:00.000Z',
  }))
  assert.equal(restored?.route, undefined)
  assert.equal(restored?.calculationComplete, true)
  assert.equal(restored?.impactSubjects[0].defaultGrade, 10)
})
