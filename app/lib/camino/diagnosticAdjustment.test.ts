import assert from 'node:assert/strict'
import { test } from 'node:test'

import { planQueueAdjustment, type QueueRowForAdjustment } from './diagnosticAdjustment.ts'

const AT = '2026-10-01T10:00:00.000Z'
const CONTEXT = { subject: 'matematicas_ii', blockSlug: 'algebra', at: AT }

function declaredReview(overrides: Partial<QueueRowForAdjustment> = {}): QueueRowForAdjustment {
  return {
    id: 'q1',
    subject: 'matematicas_ii',
    blockSlug: 'algebra',
    queueStatus: 'pending',
    metadata: { mission_type: 'review', express: true, declared_start_mode: 'mid', topic_slug: 'matrices' },
    ...overrides,
  }
}

test('refutado: el repaso express declarado vuelve a lección completa', () => {
  const result = planQueueAdjustment([declaredReview()], CONTEXT)
  assert.equal(result.length, 1)
  assert.equal(result[0].metadata.mission_type, 'concept')
  // El atajo desaparece: ya no es un repaso rápido.
  assert.equal(result[0].metadata.express, undefined)
  // Y queda rastro de por qué cambió.
  assert.equal(result[0].metadata.reverted_by_diagnostic, true)
  assert.equal(result[0].metadata.reverted_at, AT)
  // El tema se conserva: no se recrea nada.
  assert.equal(result[0].metadata.topic_slug, 'matrices')
})

// ── Solo el bloque diagnosticado ─────────────────────────────────────────
test('refutado solo modifica el bloque correspondiente', () => {
  const rows = [
    declaredReview({ id: 'mismo-bloque' }),
    declaredReview({ id: 'otro-bloque', blockSlug: 'analisis' }),
    declaredReview({ id: 'otra-asignatura', subject: 'fisica' }),
    declaredReview({ id: 'sin-bloque', blockSlug: null }),
  ]
  const result = planQueueAdjustment(rows, CONTEXT)
  assert.deepEqual(result.map(r => r.id), ['mismo-bloque'])
})

// ── Nunca destruye trabajo del alumno ────────────────────────────────────
test('no toca trabajo completado, programado ni apartado', () => {
  const rows = [
    declaredReview({ id: 'completado', queueStatus: 'completed' }),
    declaredReview({ id: 'programado', queueStatus: 'scheduled' }),
    declaredReview({ id: 'pospuesto', queueStatus: 'postponed' }),
    declaredReview({ id: 'inactivo', queueStatus: 'inactive' }),
  ]
  assert.deepEqual(planQueueAdjustment(rows, CONTEXT), [])
})

test('un repaso que NO viene de la declaración se respeta', () => {
  // Un repaso por área débil, por ejemplo: no es asunto de este diagnóstico.
  const rows = [declaredReview({ id: 'area-debil', metadata: { mission_type: 'review', weak_review: true } })]
  assert.deepEqual(planQueueAdjustment(rows, CONTEXT), [])
})

test('un tema que ya era lección completa no se toca', () => {
  const rows = [declaredReview({ id: 'concepto', metadata: { mission_type: 'concept', declared_start_mode: 'mid' } })]
  assert.deepEqual(planQueueAdjustment(rows, CONTEXT), [])
})

// ── La invariante que no se puede romper ─────────────────────────────────
test('ninguna ruta de diagnóstico puede marcar currículo como completed', () => {
  const rows = [
    declaredReview({ id: 'a' }),
    declaredReview({ id: 'b', metadata: { mission_type: 'review', express: true, declared_start_mode: 'review' } }),
    declaredReview({ id: 'c', metadata: { mission_type: 'review', express: true, declared_start_mode: 'first_block' } }),
  ]
  const result = planQueueAdjustment(rows, CONTEXT)
  assert.equal(result.length, 3)
  for (const adjustment of result) {
    const keys = Object.keys(adjustment.metadata)
    assert.ok(!keys.includes('queue_status'), 'un ajuste jamás escribe queue_status')
    for (const value of Object.values(adjustment.metadata)) {
      assert.notEqual(value, 'completed', 'nada dentro del ajuste puede valer "completed"')
    }
    assert.equal(adjustment.metadata.mission_type, 'concept')
  }
})

test('el ajuste solo devuelve id y metadata: no puede borrar ni recrear filas', () => {
  const result = planQueueAdjustment([declaredReview()], CONTEXT)
  assert.deepEqual(Object.keys(result[0]).sort(), ['id', 'metadata'])
})

test('sin filas candidatas no se ajusta nada', () => {
  assert.deepEqual(planQueueAdjustment([], CONTEXT), [])
})

test('metadata corrupta no provoca cambios', () => {
  const rows = [
    declaredReview({ id: 'null', metadata: null }),
    declaredReview({ id: 'vacia', metadata: {} }),
  ]
  assert.deepEqual(planQueueAdjustment(rows, CONTEXT), [])
})
