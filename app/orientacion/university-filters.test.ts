import assert from 'node:assert/strict'
import test from 'node:test'
import { FIXTURE_SOURCE, type AdmissionSubject, type OrientationTarget } from './data.ts'
import { filterUniversityExplorer, matchesReferenceBand, type UniversityExplorerFilters } from './university-filters.ts'

const weighted = (code: string, weighting: 0.1 | 0.2): AdmissionSubject => ({
  id: code, subjectCode: code, name: code, weighting, defaultGrade: 7, enabled: true, source: FIXTURE_SOURCE,
})
const target = (id: string, universityId: string, referenceScore: number, subjects: AdmissionSubject[] = []): OrientationTarget => ({
  id, degreeId: id, universityId, degreeCode: id, universityCode: universityId, degree: id,
  university: universityId, universityAcronym: universityId, community: 'Madrid', referenceScore,
  referenceLabel: 'Referencia', source: FIXTURE_SOURCE, subjects,
})
const targets = [
  target('psicologia', 'UCM', 7.8, [weighted('matematicas-ii', 0.2)]),
  target('economia', 'UC3M', 10.4, [weighted('matematicas-ii', 0.2)]),
  target('medicina', 'UAM', 13.2, [weighted('quimica', 0.2), weighted('matematicas-ii', 0.1)]),
]
const defaults: UniversityExplorerFilters = { search: '', universityId: '', referenceBand: 'all', situation: 'all', subjectCode: '' }

test('filtra por universidad', () => {
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, universityId: 'UC3M' }, 10).map(item => item.id), ['economia'])
})

test('filtra los rangos de nota sin solapamientos', () => {
  assert.equal(matchesReferenceBand(8, 'up-to-8'), true)
  assert.equal(matchesReferenceBand(8, '8-10'), false)
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, referenceBand: '10-12' }, 10).map(item => item.id), ['economia'])
})

test('filtra una asignatura que pondera exactamente 0,2', () => {
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, subjectCode: 'quimica' }, 10).map(item => item.id), ['medicina'])
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, subjectCode: 'matematicas-ii' }, 10).map(item => item.id), ['economia', 'psicologia'])
})

test('filtra la situación con el umbral cercano de 0,50', () => {
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, situation: 'close' }, 10).map(item => item.id), ['economia'])
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, situation: 'above' }, 10).map(item => item.id), ['psicologia'])
})

test('una combinación sin resultados permanece vacía', () => {
  assert.deepEqual(filterUniversityExplorer(targets, { ...defaults, universityId: 'UCM', subjectCode: 'quimica' }, 10), [])
})
