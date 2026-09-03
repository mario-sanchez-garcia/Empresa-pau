import assert from 'node:assert/strict'
import test from 'node:test'
import { availableCatalogTargets, buildCatalogSearchIndex, filterOrientationTargets, findSavedTarget, mergeSubjectInputs, normalizeCatalogSearch, searchOrientationTargets } from './catalog.ts'
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
  target('uc3m-business', 'Análisis de Datos en la Empresa / Business Analytics', 'Universidad Carlos III de Madrid', 'UC3M'),
  target('uc3m-economia', 'Economía', 'Universidad Carlos III de Madrid', 'UC3M'),
]

test('buscar Psicología devuelve solo titulaciones reales coincidentes', () => {
  assert.deepEqual(filterOrientationTargets(catalog, 'psicologia').map(item => item.id), ['uam-psi', 'ucm-psi'])
})

test('el selector de universidad restringe el catálogo', () => {
  assert.deepEqual(filterOrientationTargets(catalog, '', 'UCM').map(item => item.id), ['ucm-psi'])
})

test('normaliza tildes, mayúsculas, puntuación y espacios múltiples', () => {
  assert.equal(normalizeCatalogSearch('  PSICOLOGÍA,   UCM  '), 'psicologia ucm')
})

test('tolera consultas parciales y sin tildes', () => {
  assert.deepEqual(filterOrientationTargets(catalog, 'psicolo').map(item => item.id), ['uam-psi', 'ucm-psi'])
})

test('encuentra palabras en distinto orden mediante tokens', () => {
  assert.equal(filterOrientationTargets(catalog, 'datos analisis')[0]?.id, 'uc3m-business')
})

test('interpreta un alias universitario solo como token completo', () => {
  assert.deepEqual(filterOrientationTargets(catalog, 'economi uc3m').map(item => item.id), ['uc3m-economia'])
  assert.deepEqual(filterOrientationTargets(catalog, 'psicologia complutense').map(item => item.id), ['ucm-psi'])
})

test('reconoce alias oficiales de universidades catalanas', () => {
  const catalunya = [
    { ...target('ub-psi', 'Psicologia', 'Universitat de Barcelona', 'UB'), community: 'Cataluña' },
    { ...target('uab-psi', 'Psicologia', 'Universitat Autònoma de Barcelona', 'UAB'), community: 'Cataluña' },
  ]
  assert.deepEqual(filterOrientationTargets(catalunya, 'psicologia uab').map(item => item.id), ['uab-psi'])
  assert.deepEqual(filterOrientationTargets(catalunya, 'autonoma barcelona').map(item => item.id), ['uab-psi'])
  assert.deepEqual(filterOrientationTargets(catalunya, 'psicologia universitat de barcelona').map(item => item.id), ['ub-psi'])
})

test('prioriza coincidencia exacta, comienzo y después coincidencia parcial', () => {
  const extended = [
    target('exacta', 'Economía', 'Universidad Autónoma de Madrid', 'UAM'),
    target('comienza', 'Economía y Finanzas', 'Universidad Complutense de Madrid', 'UCM'),
    target('parcial', 'Doble Grado en Derecho y Economía', 'Universidad Carlos III de Madrid', 'UC3M'),
  ]
  assert.deepEqual(searchOrientationTargets(buildCatalogSearchIndex(extended), 'economia').map(item => item.id), ['exacta', 'comienza', 'parcial'])
})

test('cambiar de grado conserva notas de asignaturas que siguen existiendo', () => {
  const merged = mergeSubjectInputs([subject('quimica', 0), subject('fisica', 0)], [subject('quimica', 8.5)])
  assert.equal(merged.find(item => item.subjectCode === 'quimica')?.defaultGrade, 8.5)
  assert.equal(merged.find(item => item.subjectCode === 'fisica')?.defaultGrade, 0)
})

test('el objetivo guardado usa ids estables antes que los textos antiguos', () => {
  const saved = { degreeId: 'degree:uam-psi', universityId: 'UAM', degree: 'Nombre antiguo', university: 'Nombre antiguo', community: 'Comunidad de Madrid', admissionScore: 10, sourceType: 'official' as const, updatedAt: null }
  assert.equal(findSavedTarget(catalog, saved)?.id, 'uam-psi')
})

test('el objetivo oficial persiste tras serializar y recargar la respuesta', () => {
  const saved = JSON.parse(JSON.stringify({ degreeId: 'degree:uam-psi', universityId: 'UAM', degree: 'Psicología', university: 'Universidad Autónoma de Madrid', admissionScore: 11.07, sourceType: 'official', updatedAt: '2026-09-01T00:00:00Z' }))
  const restored = findSavedTarget(catalog, saved)
  assert.equal(restored?.id, 'uam-psi')
  assert.equal(restored?.degreeId, 'degree:uam-psi')
  assert.equal(restored?.universityId, 'UAM')
})

test('los fixtures desaparecen cuando existe catálogo oficial', () => {
  assert.deepEqual(availableCatalogTargets(catalog, [target('demo', 'Demo', 'Demo', 'DEMO')]), catalog)
})

test('el catálogo demo solo actúa como fallback vacío', () => {
  const fixtures = [target('demo', 'Demo', 'Demo', 'DEMO')]
  assert.deepEqual(availableCatalogTargets([], fixtures), fixtures)
})

test('un error del catálogo no expone fixtures como si no hubiera datos oficiales', () => {
  const fixtures = [target('demo', 'Demo', 'Demo', 'DEMO')]
  assert.deepEqual(availableCatalogTargets([], fixtures, false), [])
})
