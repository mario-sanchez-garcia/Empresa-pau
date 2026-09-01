import assert from 'node:assert/strict'
import test from 'node:test'
import { availableCatalogTargets, filterOrientationTargets, findSavedTarget, mergeSubjectInputs } from './catalog.ts'
import { FIXTURE_SOURCE, type AdmissionSubject, type OrientationTarget } from './data.ts'

const subject = (subjectCode: string, grade: number): AdmissionSubject => ({
  id: `weight:${subjectCode}`, subjectCode, name: subjectCode, weighting: 0.2, defaultGrade: grade, enabled: true, source: FIXTURE_SOURCE,
})

const target = (id: string, degree: string, university: string, universityId: string): OrientationTarget => ({
  id, degreeId: `degree:${id}`, universityId, degreeCode: id, universityCode: universityId,
  degree, university, universityAcronym: universityId, community: 'Comunidad de Madrid', referenceScore: 10,
  referenceLabel: 'Referencia', source: FIXTURE_SOURCE, subjects: [],
})

const catalog = [
  target('uam-psi', 'Psicología', 'Universidad Autónoma de Madrid', 'UAM'),
  target('ucm-psi', 'Psicología', 'Universidad Complutense de Madrid', 'UCM'),
  target('upm-mat', 'Matemáticas', 'Universidad Politécnica de Madrid', 'UPM'),
]

test('buscar Psicología devuelve solo titulaciones reales coincidentes', () => {
  assert.deepEqual(filterOrientationTargets(catalog, 'psicologia').map(item => item.id), ['uam-psi', 'ucm-psi'])
})

test('el selector de universidad restringe el catálogo', () => {
  assert.deepEqual(filterOrientationTargets(catalog, '', 'UCM').map(item => item.id), ['ucm-psi'])
})

test('cambiar de grado conserva notas de asignaturas que siguen existiendo', () => {
  const merged = mergeSubjectInputs([subject('quimica', 0), subject('fisica', 0)], [subject('quimica', 8.5)])
  assert.equal(merged.find(item => item.subjectCode === 'quimica')?.defaultGrade, 8.5)
  assert.equal(merged.find(item => item.subjectCode === 'fisica')?.defaultGrade, 0)
})

test('el objetivo guardado usa ids estables antes que los textos antiguos', () => {
  const saved = { degreeId: 'degree:uam-psi', universityId: 'UAM', degree: 'Nombre antiguo', university: 'Nombre antiguo', admissionScore: 10, sourceType: 'official' as const, updatedAt: null }
  assert.equal(findSavedTarget(catalog, saved)?.id, 'uam-psi')
})

test('los fixtures desaparecen cuando existe catálogo oficial', () => {
  assert.deepEqual(availableCatalogTargets(catalog, [target('demo', 'Demo', 'Demo', 'DEMO')]), catalog)
})

test('el catálogo demo solo actúa como fallback vacío', () => {
  const fixtures = [target('demo', 'Demo', 'Demo', 'DEMO')]
  assert.deepEqual(availableCatalogTargets([], fixtures), fixtures)
})
