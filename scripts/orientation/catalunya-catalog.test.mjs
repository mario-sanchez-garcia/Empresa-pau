import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../../data/orientation/catalunya/2026-2027/', import.meta.url)
const [catalog, sources, report, manifest, migration] = await Promise.all([
  readFile(new URL('catalog.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('sources.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('validation-report.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('sql-manifest.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('../../../../supabase/migrations/20260913121000_seed_orientation_catalunya_2026_2027.sql', root), 'utf8'),
])

test('incluye exactamente las siete públicas y UVic-UCC', () => {
  assert.deepEqual(catalog.universities.map(item => item.acronym).sort(), ['UAB', 'UB', 'UPC', 'UPF', 'URV', 'UVic-UCC', 'UdG', 'UdL'])
})

test('conserva el catálogo oficial validado de la primera asignación de junio', () => {
  assert.equal(catalog.degrees.length, 560)
  assert.equal(catalog.degrees.reduce((sum, degree) => sum + degree.weightings.length, 0), 4797)
  assert.ok(catalog.degrees.every(degree => degree.cutoff.admission_round === 'primera_assignacio_juny'))
  assert.ok(catalog.degrees.every(degree => /^CAT:\d{5}$/.test(degree.stable_code)))
  assert.equal(report.status, 'passed')
})

test('une ponderaciones solo por código y documenta las excepciones', () => {
  assert.equal(report.matching.join_method, 'exact official five-digit code only')
  assert.deepEqual(report.matching.cutoff_codes_without_weightings, ['41066', '61057'])
  assert.deepEqual(report.matching.conflicting_codes_excluded.map(item => item.code), ['61057'])
  assert.equal(catalog.degrees.find(item => item.official_code === '61057').weightings.length, 0)
})

test('preserva códigos, centros y fuentes oficiales sin fixtures', () => {
  assert.equal(JSON.stringify(catalog).includes('fixture'), false)
  assert.equal(new Set(catalog.degrees.map(item => item.official_code)).size, 560)
  assert.ok(catalog.degrees.some(item => /Campus|\(|\"/.test(item.official_name)))
  assert.ok(catalog.degrees.every(item => item.cutoff.source_url.startsWith('https://universitats.gencat.cat/')))
  assert.ok(catalog.degrees.flatMap(item => item.weightings).every(item => item.source_url.startsWith('https://universitats.gencat.cat/')))
})

test('manifiesto, paquete manual y seed son reproducibles, idempotentes y no destructivos', async () => {
  assert.deepEqual(sources.documents.map(item => item.pages), [8, 28])
  assert.ok(sources.documents.every(item => /^[A-F0-9]{64}$/.test(item.sha256)))
  assert.equal(manifest.seed_chunks.length, 31)
  assert.deepEqual(manifest.apply_in_order.slice(0, 2), ['sql/01_schema.sql', 'sql/02_universities.sql'])
  assert.equal(manifest.apply_in_order.at(-1), 'sql/33_validation.sql')
  const manualFiles = await Promise.all([
    readFile(new URL('sql/00_LEEME.txt', root), 'utf8'),
    ...manifest.apply_in_order.map(path => readFile(new URL(path, root), 'utf8')),
  ])
  assert.match(manualFiles[0], /PASO 33: 33_validation\.sql/)
  assert.match(manualFiles.at(-1), /Cataluña · universidades[\s\S]*Madrid · ponderaciones/)
  assert.ok(manualFiles.slice(2, -1).every(sql => /on conflict \(id\) do update/.test(sql)))
  assert.match(migration, /on conflict \(id\) do update/)
  assert.doesNotMatch([migration, ...manualFiles].join('\n'), /\btruncate\b|\bdelete\s+from\b|\bdrop\s+table\b/i)
})
