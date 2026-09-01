import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const catalogPath = new URL('../../data/orientation/madrid/2026-2027/catalog.json', import.meta.url)
const sourcesPath = new URL('../../data/orientation/madrid/2026-2027/sources.json', import.meta.url)
const reportPath = new URL('../../data/orientation/madrid/2026-2027/validation-report.json', import.meta.url)
const sqlPath = new URL('../../supabase/migrations/20260831213000_seed_orientation_madrid_2026_2027.sql', import.meta.url)

const [catalog, sources, report, sql] = await Promise.all([
  readFile(catalogPath, 'utf8').then(JSON.parse),
  readFile(sourcesPath, 'utf8').then(JSON.parse),
  readFile(reportPath, 'utf8').then(JSON.parse),
  readFile(sqlPath, 'utf8'),
])

test('el catálogo tiene solo las seis universidades públicas previstas', () => {
  assert.deepEqual(catalog.universities.map(item => item.acronym).sort(), ['UAH', 'UAM', 'UC3M', 'UCM', 'UPM', 'URJC'])
  assert.equal(catalog.universities.length, 6)
})

test('el dataset conserva los totales validados de 2026-2027', () => {
  assert.equal(catalog.academic_year, '2026-2027')
  assert.equal(catalog.source_type, 'official')
  assert.equal(catalog.degrees.length, 554)
  assert.equal(catalog.degrees.reduce((total, degree) => total + degree.weightings.length, 0), 4473)
  assert.equal(report.status, 'passed')
})

test('no contiene fixtures, grados huérfanos ni claves duplicadas', () => {
  assert.equal(JSON.stringify(catalog).includes('fixture'), false)
  const universityIds = new Set(catalog.universities.map(item => item.id))
  assert.ok(catalog.degrees.every(degree => universityIds.has(degree.university_id)))
  assert.equal(new Set(catalog.degrees.map(degree => degree.id)).size, catalog.degrees.length)
  assert.equal(new Set(catalog.degrees.map(degree => degree.stable_code)).size, catalog.degrees.length)
  const weightings = catalog.degrees.flatMap(degree => degree.weightings)
  assert.equal(new Set(weightings.map(weighting => weighting.id)).size, weightings.length)
})

test('notas, ponderaciones y trazabilidad pertenecen al dominio oficial', () => {
  for (const degree of catalog.degrees) {
    assert.ok(degree.cutoff.cutoff_score >= 5 && degree.cutoff.cutoff_score <= 14)
    assert.equal(degree.cutoff.academic_year, '2026-2027')
    assert.match(degree.cutoff.source_url, /^https:\/\/www\.comunidad\.madrid\//)
    for (const weighting of degree.weightings) {
      assert.ok(weighting.weighting === 0.1 || weighting.weighting === 0.2)
      assert.equal(weighting.academic_year, '2026-2027')
      assert.match(weighting.source_url, /^https:\/\/www\.comunidad\.madrid\//)
    }
  }
})

test('el lookup de Psicología devuelve las universidades públicas presentes', () => {
  const universities = catalog.degrees
    .filter(degree => degree.official_name === 'Psicología')
    .map(degree => degree.university_code).sort()
  assert.deepEqual(universities, ['UAM', 'UCM'])
  assert.ok(catalog.degrees.some(degree => degree.university_code === 'URJC' && degree.official_name.startsWith('Psicología (')))
})

test('el manifiesto fija fuentes, hash y páginas oficiales', () => {
  assert.equal(sources.documents.length, 2)
  assert.deepEqual(sources.documents.map(item => item.pages), [18, 20])
  assert.ok(sources.documents.every(item => /^[A-F0-9]{64}$/.test(item.sha256)))
})

test('el SQL es idempotente y no contiene operaciones destructivas', () => {
  assert.match(sql, /on conflict \(id\) do update/)
  assert.match(sql, /source_type[^;]+official/s)
  assert.doesNotMatch(sql, /\btruncate\b|\bdelete\s+from\b|\bdrop\s+table\b/i)
  assert.match(sql, /numeric\(5,3\)/)
})
