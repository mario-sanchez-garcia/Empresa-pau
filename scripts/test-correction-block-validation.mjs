import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CORRECTION_BLOCK_FALLBACK,
  sanitizeCorrectionDisplayText,
  sanitizeCorrectionListItem,
  validateCorrectionBlock,
} from '../app/lib/correctionBlockValidation.ts'

test('accepts a valid Markdown correction block', () => {
  const result = validateCorrectionBlock('aciertos-errores', [
    '## Puntos fuertes',
    '',
    '- Plantea bien el sistema.',
    '',
    '## Errores a corregir',
    '',
    '- Falta justificar la última ecuación.',
  ].join('\n'), false)

  assert.equal(result.valid, true)
  assert.deepEqual(result.missingFields, [])
})

test('rejects JSON inside fences because it does not satisfy the visible block contract', () => {
  const result = validateCorrectionBlock('nota-resumen', '```json\n{"nota": 1}\n```', false)

  assert.equal(result.valid, false)
  assert.equal(result.parseError, false)
  assert.ok(result.missingFields.includes('## Resumen y nota estimada'))
})

test('rejects missing mandatory fields', () => {
  const result = validateCorrectionBlock('paso-a-paso', '## Otro título\n\nTexto breve.', false)

  assert.equal(result.valid, false)
  assert.deepEqual(result.missingFields, ['## Corrección paso a paso'])
})

test('rejects null and undefined as visible text', () => {
  const result = validateCorrectionBlock('teoria-final', [
    '## ¿Por qué es así?',
    '',
    '**Dónde se ve en la solución**',
    '',
    'undefined',
    '',
    '## Recomendación final',
    '',
    'Repasa el planteamiento.',
  ].join('\n'), false)

  assert.equal(result.valid, false)
  assert.deepEqual(result.forbiddenLiterals, ['undefined'])
})

test('rejects truncated responses', () => {
  const result = validateCorrectionBlock('nota-resumen', [
    '## Resumen y nota estimada',
    '',
    'Nota: 1/2.5',
  ].join('\n'), true)

  assert.equal(result.valid, false)
  assert.equal(result.truncated, true)
})

test('preserves substantive Markdown text while cleaning side-panel labels', () => {
  assert.equal(
    sanitizeCorrectionListItem('- **Error:** falta resolver el sistema.'),
    'falta resolver el sistema.'
  )
  assert.equal(
    sanitizeCorrectionListItem('  **Corrección:** plantea $x+y=2$.'),
    'plantea $x+y=2$.'
  )
})

test('rejects incomplete JSON instead of accepting it as a complete correction', () => {
  const result = validateCorrectionBlock('nota-resumen', '{"nota": 1', false)

  assert.equal(result.valid, false)
  assert.equal(result.parseError, true)
})

test('fallback copy stays stable for invalid blocks', () => {
  assert.equal(CORRECTION_BLOCK_FALLBACK, 'Esta parte de la corrección no pudo generarse. Reinténtalo.')
})

test('removes visible technical literals from progressive display text', () => {
  const visible = sanitizeCorrectionDisplayText([
    'El sistema queda:',
    '',
    'undefined',
    '',
    '**Dónde se ve en la solución**',
    'Resultado: undefined',
    '',
    'Continúa la explicación.',
  ].join('\n'))

  assert.equal(visible.includes('undefined'), false)
  assert.equal(visible.includes('El sistema queda:'), true)
  assert.equal(visible.includes('Continúa la explicación.'), true)
})

test('repairs system placeholder from previous equations', () => {
  const visible = sanitizeCorrectionDisplayText([
    'Ecuación 1',
    '$4x + 5y + 6z = 400$',
    '',
    'Ecuación 2',
    '$3x - 5y + 3z = 0$',
    '',
    'Ecuación 3',
    '$x + y - 2z = 5$',
    '',
    'Sistema resultante',
    'undefined',
  ].join('\n'))

  assert.equal(visible.includes('undefined'), false)
  assert.equal(visible.includes('\\begin{cases}'), true)
  assert.equal(visible.includes('4x + 5y + 6z = 400'), true)
  assert.equal(visible.includes('x + y - 2z = 5'), true)
})

test('repairs why-section placeholder with a useful sentence', () => {
  const visible = sanitizeCorrectionDisplayText([
    '## ¿Por qué es así?',
    '',
    '**Dónde se ve en la solución**',
    '',
    'undefined',
  ].join('\n'))

  assert.equal(visible.includes('undefined'), false)
  assert.match(visible, /ecuaciones y pasos anteriores/i)
})
