import assert from 'node:assert/strict'
import { test } from 'node:test'

import { coveredBlockCount, normalizeStartMode, queueMetadataFor, resolveStartModes } from './startingPoint.ts'

test('C02: los bloques dados se cuentan sobre el temario real de cada asignatura', () => {
  // "Voy por la mitad" no puede significar lo mismo en 4 bloques que en 12.
  assert.equal(coveredBlockCount('mid', 4), 2)
  assert.equal(coveredBlockCount('mid', 12), 6)
  // Antes `mid` daba por repaso "los dos primeros bloques" en absoluto,
  // sin relación con el tamaño de la asignatura.
  assert.notEqual(coveredBlockCount('mid', 12), 2)
})

test('C02: cada modo produce un resultado distinto', () => {
  const total = 8
  const counts = (['zero', 'first_block', 'mid', 'review'] as const).map(m => coveredBlockCount(m, total))
  assert.deepEqual(counts, [0, 1, 4, 8])
  // Regresión: varios modos acababan comportándose igual que 'zero'.
  assert.equal(new Set(counts).size, 4)
})

test('unknown programa todo: ante la duda, no se da nada por sabido', () => {
  assert.equal(coveredBlockCount('unknown', 10), 0)
})

test('C02: lo declarado entra como REPASO, nunca como completado', () => {
  const covered = queueMetadataFor('mid', true, 'derivadas')
  assert.equal(covered.mission_type, 'review')
  assert.equal(covered.express, true)
  assert.equal(covered.declared_start_mode, 'mid')
  // Lo importante: sigue en la cola, con su tema. No se marca completado ni
  // desaparece del denominador curricular.
  assert.equal(covered.topic_slug, 'derivadas')
})

test('lo no declarado sigue entrando como concepto nuevo', () => {
  const fresh = queueMetadataFor('mid', false, 'integrales')
  assert.equal(fresh.mission_type, 'concept')
  assert.equal(fresh.express, undefined)
})

test('el modo zero conserva la secuencia beta original', () => {
  const meta = queueMetadataFor('zero', false, 'limites')
  assert.equal(meta.mission_type, 'concept')
  assert.equal(meta.beta_sequence, true)
})

test('C02: el punto de partida es POR ASIGNATURA, no global', () => {
  // El caso del informe: llega en abril con Álgebra dominada y Análisis sin
  // empezar. Un único modo global no puede expresar esto.
  const modes = resolveStartModes(
    ['matematicas_ii', 'fisica', 'lengua'],
    { matematicas_ii: 'review', fisica: 'zero' },
  )
  assert.equal(modes.matematicas_ii, 'review')
  assert.equal(modes.fisica, 'zero')
  // Sin declaración propia cae al respaldo.
  assert.equal(modes.lengua, 'zero')
})

test('un modo inválido nunca rompe el plan', () => {
  assert.equal(normalizeStartMode('marciano'), 'zero')
  assert.equal(normalizeStartMode(null), 'zero')
  assert.equal(normalizeStartMode(42), 'zero')
  const modes = resolveStartModes(['lengua'], { lengua: 'inventado' }, 'mid')
  assert.equal(modes.lengua, 'mid')
})

test('una asignatura sin bloques no rompe el conteo', () => {
  assert.equal(coveredBlockCount('review', 0), 0)
  assert.equal(coveredBlockCount('mid', 0), 0)
})
