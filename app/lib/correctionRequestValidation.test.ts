import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_CORRECTION_ANSWER_CHARS,
  MAX_CORRECTION_PROMPT_CHARS,
  validateAiPrompt,
  validateCorrectionTextPayload,
} from './correctionRequestValidation.ts'

test('acepta una corrección de texto normal', () => {
  assert.equal(validateCorrectionTextPayload({ officialPrompt: 'Enunciado', studentAnswer: 'Respuesta' }).valid, true)
})

test('rechaza vacío y payloads de texto abusivos', () => {
  assert.equal(validateCorrectionTextPayload({ officialPrompt: '', studentAnswer: 'Respuesta' }).valid, false)
  assert.equal(validateCorrectionTextPayload({ officialPrompt: 'E'.repeat(MAX_CORRECTION_PROMPT_CHARS + 1), studentAnswer: 'R' }).valid, false)
  assert.equal(validateCorrectionTextPayload({ officialPrompt: 'E', studentAnswer: 'R'.repeat(MAX_CORRECTION_ANSWER_CHARS + 1) }).valid, false)
  assert.equal(validateAiPrompt(undefined).valid, false)
})
