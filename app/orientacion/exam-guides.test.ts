import assert from 'node:assert/strict'
import test from 'node:test'
import { CATALUNYA_GENERAL_CORRECTION_GUIDE, CATALUNYA_OFFICIAL_EXAM_GUIDES, GENERAL_CORRECTION_GUIDE, OFFICIAL_EXAM_GUIDES } from './exam-guides.ts'

test('cada guía oficial conserva trazabilidad y estructura mínima', () => {
  assert.ok(OFFICIAL_EXAM_GUIDES.length >= 7)
  for (const guide of OFFICIAL_EXAM_GUIDES) {
    assert.match(guide.sourceUrl, /^https:\/\/(www\.)?(ucm\.es|comunidad\.madrid)/)
    assert.equal(guide.academicYear, '2025-2026')
    assert.equal(guide.durationMinutes, 90)
    assert.equal(guide.totalPoints, 10)
    assert.ok(guide.structure.length > 0)
    assert.ok(guide.officialCriteria.length > 0)
    assert.ok(guide.kairoExplanation.length > 0)
  }
})

test('no etiqueta como rúbrica formal los criterios que el documento no llama rúbrica', () => {
  assert.equal(OFFICIAL_EXAM_GUIDES.every(guide => guide.formalRubric === false), true)
})

test('el acuerdo general se identifica como acuerdo y no como modelo', () => {
  assert.equal(GENERAL_CORRECTION_GUIDE.sourceType, 'official_agreement')
  assert.match(GENERAL_CORRECTION_GUIDE.sourceDocument, /Comisión Organizadora/)
})

test('Cataluña tiene guía territorial 2026 con enlaces exclusivos de la Generalitat', () => {
  const guides = [CATALUNYA_GENERAL_CORRECTION_GUIDE, ...CATALUNYA_OFFICIAL_EXAM_GUIDES]
  assert.ok(guides.length >= 4)
  assert.ok(guides.every(guide => guide.sourceUrl.startsWith('https://universitats.gencat.cat/')))
  assert.ok(guides.every(guide => guide.durationMinutes === 90 && guide.totalPoints === 10))
  assert.ok(guides.some(guide => guide.subject === 'Química'))
  assert.ok(guides.some(guide => guide.subject === 'Historia de la Filosofía'))
})
