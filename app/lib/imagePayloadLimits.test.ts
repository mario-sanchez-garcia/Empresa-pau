import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_IMAGES_PER_CORRECTION, validateCorrectionImagePayload } from './imagePayloadLimits.ts'

const validBase64 = Buffer.from('imagen de prueba').toString('base64')

test('valida imagen y conserva el orden de páginas', () => {
  const result = validateCorrectionImagePayload([
    { data: validBase64, mediaType: 'image/jpeg' },
    { data: validBase64, mediaType: 'image/png' },
  ])
  assert.equal(result.valid, true)
  if (result.valid) assert.deepEqual(result.images.map(image => image.mediaType), ['image/jpeg', 'image/png'])
})

test('rechaza MIME, base64 y demasiadas páginas manipuladas', () => {
  assert.equal(validateCorrectionImagePayload([{ data: validBase64, mediaType: 'text/html' }]).valid, false)
  assert.equal(validateCorrectionImagePayload([{ data: 'no-es-base64!', mediaType: 'image/jpeg' }]).valid, false)
  assert.equal(validateCorrectionImagePayload(Array.from({ length: MAX_IMAGES_PER_CORRECTION + 1 }, () => ({ data: validBase64, mediaType: 'image/jpeg' }))).valid, false)
})
