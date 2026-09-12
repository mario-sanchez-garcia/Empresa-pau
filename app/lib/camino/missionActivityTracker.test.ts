import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MissionActivityTracker, type TrackerEffect } from './missionActivityTracker.ts'

const T0 = Date.parse('2026-09-13T10:00:00Z')
const min = (n: number) => n * 60_000

function makeTracker(horizonMinutes = 5) {
  let counter = 0
  return new MissionActivityTracker({
    origin: 'tab-a',
    mintSegmentId: () => `auto-${++counter}`,
    inactivityHorizonMs: min(horizonMinutes),
  })
}

const opens = (effects: TrackerEffect[]) => effects.filter(e => e.kind === 'open')
const closes = (effects: TrackerEffect[]) => effects.filter(e => e.kind === 'close')

test('el clic desde Camino abre el tramo con la marca del CLIC, no la del montaje', () => {
  const tracker = makeTracker()
  // La página tarda dos segundos en arrancar: el tramo empieza en t0.
  const effects = tracker.handle({
    kind: 'pending_start',
    at: T0 + 2_000,
    segmentId: 'seg-1',
    t0: T0,
  })
  const [open] = opens(effects)
  assert.ok(open && open.kind === 'open')
  assert.equal(open.payload.occurredAt, T0)
  assert.equal(open.payload.openReason, 'camino_click')
  assert.equal(open.payload.segmentId, 'seg-1')
})

test('la carga de la página, por sí sola, no inicia medición', () => {
  const tracker = makeTracker()
  // Nada de pending_start (refresco o deep-link) y ningún engagement todavía.
  assert.equal(tracker.hasOpenSegment, false)
  assert.equal(tracker.handle({ kind: 'visibility', at: T0, visible: true }).length, 0)
  assert.equal(tracker.handle({ kind: 'tick', at: T0 + min(30) }).length, 0)
  assert.equal(tracker.hasOpenSegment, false)
})

test('sin clic observable, el primer engagement abre como fallback', () => {
  const tracker = makeTracker()
  const effects = tracker.handle({ kind: 'engagement', at: T0, marker: 'scroll' })
  const [open] = opens(effects)
  assert.ok(open && open.kind === 'open')
  assert.equal(open.payload.openReason, 'first_engagement')
})

test('un doble clic no abre dos tramos', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  const segundo = tracker.handle({ kind: 'pending_start', at: T0 + 500, segmentId: 'seg-1', t0: T0 })
  assert.equal(segundo.length, 0)
})

test('ocultar la pestaña cierra el tramo', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'engagement', at: T0 + min(4), marker: 'scroll' })
  const [close] = closes(tracker.handle({ kind: 'visibility', at: T0 + min(5), visible: false }))
  assert.ok(close && close.kind === 'close')
  assert.equal(close.payload.closeReason, 'hidden')
  assert.equal(close.payload.lastActivityAt, T0 + min(4))
  assert.equal(close.payload.closeDetectedAt, T0 + min(5))
  assert.equal(tracker.hasOpenSegment, false)
})

test('volver a ver la pestaña SIN tocar nada no reabre', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'visibility', at: T0 + min(3), visible: false })
  // Una ventana que pasa por delante al cambiar de aplicación no es estudiar.
  const vuelta = tracker.handle({ kind: 'visibility', at: T0 + min(10), visible: true })
  assert.equal(vuelta.length, 0)
  assert.equal(tracker.hasOpenSegment, false)
})

test('volver y TOCAR algo abre un tramo nuevo, marcado como reanudación', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'visibility', at: T0 + min(3), visible: false })
  tracker.handle({ kind: 'visibility', at: T0 + min(10), visible: true })
  const [open] = opens(tracker.handle({ kind: 'engagement', at: T0 + min(11), marker: 'card_nav' }))
  assert.ok(open && open.kind === 'open')
  assert.equal(open.payload.openReason, 'resumed')
  assert.notEqual(open.payload.segmentId, 'seg-1')
  assert.equal(open.payload.seq, 2)
})

test('la inactividad cierra donde venció el horizonte, no donde llegó el latido', () => {
  const tracker = makeTracker(5)
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'engagement', at: T0 + min(2), marker: 'scroll' })
  // El latido llega tarde, a los 12 minutos. No debe inflar la cota superior.
  const [close] = closes(tracker.handle({ kind: 'tick', at: T0 + min(12) }))
  assert.ok(close && close.kind === 'close')
  assert.equal(close.payload.closeReason, 'inactivity')
  assert.equal(close.payload.closeDetectedAt, T0 + min(7))
})

test('un latido dentro del horizonte no cierra nada', () => {
  const tracker = makeTracker(5)
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'engagement', at: T0 + min(2), marker: 'scroll' })
  assert.equal(tracker.handle({ kind: 'tick', at: T0 + min(6) }).length, 0)
  assert.equal(tracker.hasOpenSegment, true)
})

test('completar cierra el tramo abierto', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'engagement', at: T0 + min(8), marker: 'answer_input' })
  const [close] = closes(tracker.handle({ kind: 'complete', at: T0 + min(9) }))
  assert.ok(close && close.kind === 'close')
  assert.equal(close.payload.closeReason, 'completed')
  // Y después de completar ya no se abre nada más.
  assert.equal(tracker.handle({ kind: 'engagement', at: T0 + min(20), marker: 'scroll' }).length, 0)
})

test('el scroll limitado deja menos marcadores pero mantiene vivo el tramo', () => {
  const tracker = makeTracker(5)
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  // Scroll cada 5 segundos durante 4 minutos: mucha actividad, pocos marcadores.
  for (let second = 5; second <= 240; second += 5) {
    tracker.handle({ kind: 'engagement', at: T0 + second * 1000, marker: 'scroll' })
  }
  // Sigue vivo: la actividad cuenta siempre, aunque el marcador se limite.
  assert.equal(tracker.handle({ kind: 'tick', at: T0 + min(4) + 30_000 }).length, 0)
  const [close] = closes(tracker.handle({ kind: 'complete', at: T0 + min(5) }))
  assert.ok(close && close.kind === 'close')
  assert.equal(close.payload.lastActivityAt, T0 + 240_000)
  // 240 s a uno cada 20 s son 12 marcadores, no 48.
  assert.ok(close.payload.markers.length <= 13, `marcadores: ${close.payload.markers.length}`)
  assert.ok(close.payload.markers.length >= 11, `marcadores: ${close.payload.markers.length}`)
})

test('el snapshot describe el tramo vivo como un cierre recuperable', () => {
  const tracker = makeTracker()
  tracker.handle({ kind: 'pending_start', at: T0, segmentId: 'seg-1', t0: T0 })
  tracker.handle({ kind: 'engagement', at: T0 + min(3), marker: 'glossary' })
  const snapshot = tracker.snapshot()
  assert.ok(snapshot)
  assert.equal(snapshot.segmentId, 'seg-1')
  assert.equal(snapshot.startedAt, T0)
  assert.equal(snapshot.lastActivityAt, T0 + min(3))
  assert.equal(snapshot.closeReason, 'recovered_after_crash')
})

test('pagehide cierra, y sin tramo abierto no produce nada', () => {
  const tracker = makeTracker()
  assert.equal(tracker.handle({ kind: 'pagehide', at: T0 }).length, 0)
  tracker.handle({ kind: 'engagement', at: T0, marker: 'scroll' })
  const [close] = closes(tracker.handle({ kind: 'pagehide', at: T0 + min(2) }))
  assert.ok(close && close.kind === 'close')
  assert.equal(close.payload.closeReason, 'pagehide')
})
