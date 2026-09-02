import assert from 'node:assert/strict'
import test from 'node:test'
import { GENERAL_CORRECTION_GUIDE, OFFICIAL_EXAM_GUIDES } from './exam-guides.ts'

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
