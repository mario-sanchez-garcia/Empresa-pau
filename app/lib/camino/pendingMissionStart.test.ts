import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  PENDING_START_TTL_MS,
  consumePendingStart,
  readOrCreateOrigin,
  writePendingStart,
  type StorageLike,
} from './pendingMissionStart.ts'

const NOW = Date.parse('2026-09-13T10:00:00Z')

function memoryStorage(): StorageLike & { dump: () => Record<string, string> } {
  const map = new Map<string, string>()
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
    removeItem: key => { map.delete(key) },
    dump: () => Object.fromEntries(map),
  }
}

/** Modo privado: el navegador lanza en cuanto se toca el storage. */
function throwingStorage(): StorageLike {
  return {
    getItem: () => { throw new Error('bloqueado') },
    setItem: () => { throw new Error('bloqueado') },
    removeItem: () => { throw new Error('bloqueado') },
  }
}

test('el clic sobrevive a la navegación y llega con su t0 intacto', () => {
  const storage = memoryStorage()
  writePendingStart(storage, { missionId: 'm1', segmentId: 'seg-1', t0: NOW })
  const pending = consumePendingStart(storage, 'm1', NOW + 1_500)
  assert.deepEqual(pending, { missionId: 'm1', segmentId: 'seg-1', t0: NOW })
})

test('se consume UNA sola vez: un refresco ya no lo encuentra', () => {
  const storage = memoryStorage()
  writePendingStart(storage, { missionId: 'm1', segmentId: 'seg-1', t0: NOW })
  assert.ok(consumePendingStart(storage, 'm1', NOW + 1_000))
  assert.equal(consumePendingStart(storage, 'm1', NOW + 2_000), null)
})

test('el pendiente de una misión no puede iniciar otra', () => {
  const storage = memoryStorage()
  writePendingStart(storage, { missionId: 'm1', segmentId: 'seg-1', t0: NOW })
  assert.equal(consumePendingStart(storage, 'm2', NOW + 1_000), null)
  // Y el de m1 sigue ahí: leer el de otra misión no se lo lleva por delante.
  assert.ok(consumePendingStart(storage, 'm1', NOW + 1_000))
})

test('un clic olvidado caduca en vez de fechar un tramo falso más tarde', () => {
  const storage = memoryStorage()
  writePendingStart(storage, { missionId: 'm1', segmentId: 'seg-1', t0: NOW })
  assert.equal(consumePendingStart(storage, 'm1', NOW + PENDING_START_TTL_MS + 1_000), null)
})

test('un pendiente corrupto o con t0 futuro se descarta y se limpia', () => {
  const storage = memoryStorage()
  storage.setItem('kairo:pending-mission-start:m1', 'no es json')
  assert.equal(consumePendingStart(storage, 'm1', NOW), null)
  assert.deepEqual(storage.dump(), {})

  writePendingStart(storage, { missionId: 'm1', segmentId: 'seg-1', t0: NOW + 60_000 })
  assert.equal(consumePendingStart(storage, 'm1', NOW), null)
})

test('sin storage (modo privado) no se rompe nada: se cae al fallback', () => {
  assert.equal(writePendingStart(null, { missionId: 'm1', segmentId: 's', t0: NOW }), false)
  assert.equal(writePendingStart(throwingStorage(), { missionId: 'm1', segmentId: 's', t0: NOW }), false)
  assert.equal(consumePendingStart(null, 'm1', NOW), null)
  assert.equal(consumePendingStart(throwingStorage(), 'm1', NOW), null)
})

test('el origen identifica la pestaña y se mantiene estable dentro de ella', () => {
  const storage = memoryStorage()
  let n = 0
  const mint = () => `origin-${++n}`
  const primero = readOrCreateOrigin(storage, mint)
  const segundo = readOrCreateOrigin(storage, mint)
  assert.equal(primero, segundo)
  // Otra pestaña tiene su propio sessionStorage: otro origen.
  assert.notEqual(readOrCreateOrigin(memoryStorage(), mint), primero)
})
