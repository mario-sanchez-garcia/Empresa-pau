import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  clampClientTimestamp,
  deriveMissionDuration,
  durationForStorage,
  unionIntervals,
  SEGMENT_CLOSED,
  SEGMENT_OPENED,
  type SegmentEventRow,
} from './activitySegments.ts'

const T0 = Date.parse('2026-09-13T10:00:00Z')
const NOW = Date.parse('2026-09-13T18:00:00Z')
const min = (n: number) => n * 60_000
const iso = (ms: number) => new Date(ms).toISOString()

type SegmentSpec = {
  id: string
  startMs: number
  lastActivityMs: number
  closeMs?: number
  origin?: string
  closeReason?: string
  markers?: Array<[number, string]>
  omitOpen?: boolean
  omitClose?: boolean
  /** Desfase del reloj del cliente frente a la recepción del servidor. */
  skewMs?: number
}

function rows(specs: SegmentSpec[]): SegmentEventRow[] {
  const out: SegmentEventRow[] = []
  for (const spec of specs) {
    const origin = spec.origin ?? 'tab-a'
    const closeMs = spec.closeMs ?? spec.lastActivityMs
    const skew = spec.skewMs ?? 0
    if (!spec.omitOpen) {
      out.push({
        event_type: SEGMENT_OPENED,
        occurred_at: iso(spec.startMs),
        created_at: iso(spec.startMs + skew),
        metadata: { segment_id: spec.id, origin, open_reason: 'camino_click', seq: 1 },
      })
    }
    if (!spec.omitClose) {
      out.push({
        event_type: SEGMENT_CLOSED,
        occurred_at: iso(closeMs),
        created_at: iso(closeMs + skew),
        metadata: {
          segment_id: spec.id,
          origin,
          started_at: iso(spec.startMs),
          last_activity_at: iso(spec.lastActivityMs),
          close_reason: spec.closeReason ?? 'hidden',
          markers: spec.markers ?? [],
        },
      })
    }
  }
  return out
}

test('sin evidencia no hay duración — y desconocido nunca es cero', () => {
  const derived = deriveMissionDuration([], { nowMs: NOW })
  assert.equal(derived.quality, 'unobserved')
  assert.equal(durationForStorage(derived), null)
})

test('un tramo limpio de 11 minutos son 11 minutos', () => {
  const derived = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0, lastActivityMs: T0 + min(11) }]),
    { nowMs: NOW },
  )
  assert.equal(derived.quality, 'observed')
  assert.equal(derived.activeMinutes, 11)
  assert.equal(durationForStorage(derived), 11)
})

test('estudiar en dos tandas NO degrada la calidad', () => {
  // 15 minutos, cierre limpio, vuelta dos horas después, 12 minutos más.
  // Son 27 minutos perfectamente observados: que haya dos sesiones es
  // metadata, no un motivo para degradar a partial.
  const derived = deriveMissionDuration(
    rows([
      { id: 's1', startMs: T0, lastActivityMs: T0 + min(15) },
      { id: 's2', startMs: T0 + min(135), lastActivityMs: T0 + min(147) },
    ]),
    { nowMs: NOW },
  )
  assert.equal(derived.quality, 'observed')
  assert.equal(derived.activeMinutes, 27)
  assert.equal(derived.diagnostics.sessionCount, 2)
  assert.equal(durationForStorage(derived), 27)
})

test('la lectura silenciosa no se cuenta como cero, se declara como incertidumbre', () => {
  // Scroll a las 10:00, lectura quieta hasta las 10:04, cierre detectado a las
  // 10:09. La cota baja es 4 y la alta 9: el diseño anterior habría escrito 4
  // y lo habría dado por bueno.
  const derived = deriveMissionDuration(
    rows([{
      id: 's1',
      startMs: T0,
      lastActivityMs: T0 + min(4),
      closeMs: T0 + min(9),
      closeReason: 'inactivity',
      markers: [[60, 'scroll'], [180, 'scroll'], [240, 'scroll']],
    }]),
    { nowMs: NOW },
  )
  assert.equal(derived.activeMinutesLow, 4)
  assert.equal(derived.activeMinutesHigh, 9)
  assert.equal(derived.uncertaintyMinutes, 5)
  // 5 sobre 9 supera el máximo de incertidumbre: no es medición limpia.
  assert.equal(derived.quality, 'partial')
  assert.equal(durationForStorage(derived), null)
})

test('grace mueve el final efectivo entre las dos cotas, sin tocar la evidencia', () => {
  const evidence = rows([{
    id: 's1',
    startMs: T0,
    lastActivityMs: T0 + min(20),
    closeMs: T0 + min(24),
    // Marcadores cada 3 minutos: actividad continua, sin huecos que el
    // horizonte por defecto (5 min) deba partir.
    markers: [[180, 'scroll'], [360, 'scroll'], [540, 'scroll'], [720, 'scroll'], [900, 'scroll'], [1080, 'scroll'], [1200, 'scroll']],
  }])
  const conservador = deriveMissionDuration(evidence, { nowMs: NOW, params: { graceMinutes: 0 } })
  const generoso = deriveMissionDuration(evidence, { nowMs: NOW, params: { graceMinutes: 10 } })
  assert.equal(conservador.activeMinutes, 20)
  // El grace no puede inventar más allá del cierre detectado.
  assert.equal(generoso.activeMinutes, 24)
})

test('bajar el horizonte re-segmenta gracias a los marcadores', () => {
  // Un tramo de 26 minutos con una pausa real de 9 entre marcadores. Con el
  // horizonte por defecto (5) se parte; con uno de 15 se mantiene entero. Esto
  // es lo que no era posible guardando solo inicio y fin.
  const evidence = rows([{
    id: 's1',
    startMs: T0,
    lastActivityMs: T0 + min(26),
    markers: [[0, 'scroll'], [300, 'scroll'], [840, 'scroll'], [1560, 'scroll']],
  }])
  const estrecho = deriveMissionDuration(evidence, { nowMs: NOW, params: { inactivityHorizonMinutes: 5 } })
  const ancho = deriveMissionDuration(evidence, { nowMs: NOW, params: { inactivityHorizonMinutes: 15 } })
  assert.equal(ancho.activeMinutes, 26)
  assert.ok(estrecho.activeMinutes < ancho.activeMinutes)
  assert.ok(estrecho.diagnostics.intervalCount > ancho.diagnostics.intervalCount)
})

test('dos pestañas solapadas no duplican minutos', () => {
  const derived = deriveMissionDuration(
    rows([
      { id: 's1', startMs: T0, lastActivityMs: T0 + min(20), origin: 'tab-a' },
      { id: 's2', startMs: T0 + min(5), lastActivityMs: T0 + min(15), origin: 'tab-b' },
    ]),
    { nowMs: NOW },
  )
  // 20 minutos de reloj, no 30.
  assert.equal(derived.activeMinutesHigh, 20)
  assert.equal(derived.diagnostics.originCount, 2)
  assert.ok(derived.diagnostics.overlapMinutes > 0)
})

test('un tramo sin cierre no produce duración fiable', () => {
  const derived = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0, lastActivityMs: T0 + min(10), omitClose: true }]),
    { nowMs: NOW },
  )
  assert.equal(derived.quality, 'partial')
  assert.ok(derived.flags.includes('dangling_open'))
  assert.equal(durationForStorage(derived), null)
})

test('un tramo recuperado tras un crash no finge ser limpio', () => {
  const derived = deriveMissionDuration(
    rows([{
      id: 's1',
      startMs: T0,
      lastActivityMs: T0 + min(12),
      closeReason: 'recovered_after_crash',
    }]),
    { nowMs: NOW },
  )
  assert.equal(derived.quality, 'partial')
  assert.ok(derived.flags.includes('recovered_after_crash'))
  assert.equal(durationForStorage(derived), null)
})

test('marcas de tiempo incoherentes son anómalas', () => {
  const invertido = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0 + min(30), lastActivityMs: T0, closeMs: T0 }]),
    { nowMs: NOW },
  )
  assert.equal(invertido.quality, 'anomalous')

  const futuro = deriveMissionDuration(
    rows([{ id: 's1', startMs: NOW + min(60), lastActivityMs: NOW + min(70) }]),
    { nowMs: NOW },
  )
  assert.equal(futuro.quality, 'anomalous')
  assert.equal(durationForStorage(futuro), null)
})

test('un reloj de cliente divergente del servidor degrada a anómalo', () => {
  // El cliente dice 10:00 pero el evento llega al servidor 40 minutos después
  // de la hora que él mismo declara. No es fraude: es un reloj mal puesto, y
  // hay que poder verlo.
  const derived = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0, lastActivityMs: T0 + min(10), skewMs: min(40) }]),
    { nowMs: NOW },
  )
  assert.ok(derived.diagnostics.maxClockSkewMinutes >= 40)
  assert.ok(derived.flags.includes('clock_skew'))
  assert.equal(derived.quality, 'anomalous')
  assert.equal(durationForStorage(derived), null)
})

test('un total desproporcionado frente a lo planificado es anómalo', () => {
  const derived = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0, lastActivityMs: T0 + min(300) }]),
    { nowMs: NOW, plannedMinutes: 30 },
  )
  assert.ok(derived.flags.includes('implausible_total'))
  assert.equal(durationForStorage(derived), null)
})

test('el cierre es autosuficiente: sin apertura sigue siendo derivable', () => {
  // Red caída justo en el clic: se perdió el opened. El tramo no se anula, se
  // degrada — y la ausencia del par queda declarada.
  const derived = deriveMissionDuration(
    rows([{ id: 's1', startMs: T0, lastActivityMs: T0 + min(9), omitOpen: true }]),
    { nowMs: NOW },
  )
  assert.equal(derived.activeMinutesLow, 9)
  assert.equal(derived.quality, 'partial')
  assert.ok(derived.flags.includes('dangling_close'))
})

test('unionIntervals funde en vez de sumar y reporta el solape', () => {
  const { merged, overlapMs } = unionIntervals([
    { startMs: 0, endMs: 100, origin: 'a' },
    { startMs: 50, endMs: 150, origin: 'b' },
    { startMs: 400, endMs: 450, origin: 'a' },
  ])
  assert.equal(merged.length, 2)
  assert.deepEqual(merged[0], { startMs: 0, endMs: 150 })
  assert.equal(overlapMs, 50)
})

test('clampClientTimestamp solo corrige el futuro, nunca el pasado', () => {
  // El pasado se respeta: la cola offline entrega tramos reales de hace horas
  // con sus marcas originales, y reescribirlas destruiría el dato.
  const viejo = clampClientTimestamp(NOW - min(180), NOW)
  assert.equal(viejo.ms, NOW - min(180))
  assert.equal(viejo.clamped, false)

  const futuro = clampClientTimestamp(NOW + min(60), NOW)
  assert.equal(futuro.ms, NOW)
  assert.equal(futuro.clamped, true)

  const basura = clampClientTimestamp('no es una fecha', NOW)
  assert.equal(basura.clamped, true)
})
