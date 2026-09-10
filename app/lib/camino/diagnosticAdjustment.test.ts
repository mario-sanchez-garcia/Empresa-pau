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
test('no toca trabajo completado, pospuesto ni apartado', () => {
  const rows = [
    declaredReview({ id: 'completado', queueStatus: 'completed' }),
    declaredReview({ id: 'pospuesto', queueStatus: 'postponed' }),
    declaredReview({ id: 'inactivo', queueStatus: 'inactive' }),
  ]
  assert.deepEqual(planQueueAdjustment(rows, CONTEXT), [])
})

test('una fila YA PROGRAMADA pero sin empezar sí se corrige', () => {
  // El calendario siembra 30 días por delante, así que al diagnosticar un
  // bloque la mayoría de sus temas ya están 'scheduled' sin empezar. Dejarlos
  // como repaso express era ignorar el resultado del diagnóstico justo en las
  // misiones que el alumno va a ver primero.
  const rows = [declaredReview({ id: 'programado', queueStatus: 'scheduled' })]
  const result = planQueueAdjustment(rows, CONTEXT)
  assert.deepEqual(result.map(r => r.id), ['programado'])
  assert.equal(result[0].metadata.mission_type, 'concept')
  assert.equal(result[0].queueStatus, 'scheduled')
})

test('el ajuste es idempotente: aplicarlo dos veces no cambia nada la segunda', () => {
  const row = declaredReview({ id: 'x', queueStatus: 'scheduled' })
  const first = planQueueAdjustment([row], CONTEXT)
  assert.equal(first.length, 1)
  const afterFirst = { ...row, metadata: first[0].metadata }
  assert.deepEqual(planQueueAdjustment([afterFirst], CONTEXT), [])
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

test('el ajuste solo devuelve id, metadata y estado: no puede borrar ni recrear filas', () => {
  // `queueStatus` viaja para que el llamador sepa si además hay una misión de
  // calendario que corregir. Es de LECTURA: nunca se escribe de vuelta.
  const result = planQueueAdjustment([declaredReview()], CONTEXT)
  assert.deepEqual(Object.keys(result[0]).sort(), ['id', 'metadata', 'queueStatus'])
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
