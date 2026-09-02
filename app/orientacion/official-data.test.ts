import assert from 'node:assert/strict'
import test from 'node:test'
import { buildOfficialTargets, collectPaginatedRows, type OfficialCutoffRow, type OfficialDegreeRow, type OfficialUniversityRow, type OfficialWeightingRow } from './official-data.ts'

const university: OfficialUniversityRow = {
  id: 'university-1', name: 'Universidad Oficial', acronym: 'UO', stable_code: 'UO',
  community: 'Comunidad de Madrid', official_url: 'https://universidad.example/',
}
const degree: OfficialDegreeRow = {
  id: 'degree-1', university_id: university.id, name: 'Psicología', stable_code: 'UO:PSI',
  official_url: 'https://official.example/notas.pdf',
}
const cutoff: OfficialCutoffRow = {
  degree_id: degree.id, academic_year: '2026-2027', access_group: 'Grupo 1',
  admission_round: 'grupo_1_ordinaria', cutoff_score: '11.070', source_url: 'https://official.example/notas.pdf',
  source_label: 'Comunidad de Madrid · Notas de corte 2026-2027', source_document: 'Notas de corte 2026-2027',
  source_type: 'official', verified_at: '2026-08-31T00:00:00Z',
}
const weighting = (id: string, value: number, sourceType = 'official'): OfficialWeightingRow => ({
  id, degree_id: degree.id, academic_year: '2026-2027', subject: id, subject_code: id,
  official_subject_name: id, weighting: value, rule_note: null, source_url: 'https://official.example/ponderaciones.pdf',
  source_label: 'Comunidad de Madrid · Ponderaciones 2026-2027', source_document: 'Ponderaciones 2026-2027',
  source_type: sourceType, verified_at: '2026-08-31T00:00:00Z',
})

test('pagina y conserva las 4473 ponderaciones sin el límite de 1000', () => {
  const pages = [1000, 1000, 1000, 1000, 473].map((size, page) => Array.from({ length: size }, (_, index) => page * 1000 + index))
  const result = collectPaginatedRows(pages, 1000)
  assert.equal(result.rows.length, 4473)
  assert.equal(result.complete, true)
})

test('detecta una paginación potencialmente truncada', () => {
  assert.equal(collectPaginatedRows([Array.from({ length: 1000 }, (_, index) => index)], 1000).complete, false)
})

test('normaliza catálogo oficial, 0.1/0.2 y descarta ponderaciones no seguras', () => {
  const targets = buildOfficialTargets({
    universities: [university], degrees: [degree], cutoffs: [cutoff, { ...cutoff, cutoff_score: 13 }],
    weightings: [weighting('materia-01', 0.1), weighting('materia-02', 0.2), weighting('invalida', 0.3), weighting('fixture', 0.2, 'fixture')],
    academicYear: '2026-2027',
  })
  assert.equal(targets.length, 1)
  assert.equal(targets[0].referenceScore, 11.07)
  assert.deepEqual(targets[0].subjects.map(subject => subject.weighting), [0.2, 0.1])
  assert.equal(targets[0].source.type, 'official')
  assert.equal(targets[0].source.label, cutoff.source_label)
  assert.equal(targets[0].degreeId, degree.id)
  assert.equal(targets[0].universityId, university.id)
})

test('no convierte una nota no oficial en objetivo oficial', () => {
  const targets = buildOfficialTargets({
    universities: [university], degrees: [degree], cutoffs: [{ ...cutoff, source_type: 'fixture' }],
    weightings: [], academicYear: '2026-2027',
  })
  assert.deepEqual(targets, [])
})
