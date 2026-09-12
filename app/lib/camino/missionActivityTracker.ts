// El ciclo de vida de un tramo de actividad, como máquina de estados pura.
//
// No toca el DOM, no toca React y no toca la red: entran señales, salen efectos
// ("abre este tramo", "cierra este otro") que el adaptador de turno traduce a
// peticiones. Esa separación es lo que permite probar los casos que de verdad
// importan —volver a la pestaña sin tocar nada, un doble clic, un cierre por
// inactividad— sin levantar un navegador.
//
// La regla que gobierna todo: la VISIBILIDAD no reanuda por sí sola. Una
// ventana que pasa por delante al cambiar de aplicación no es volver a
// estudiar. Hace falta visibilidad MÁS un evento semántico. En cambio la
// visibilidad sí CIERRA, porque una pestaña oculta no se está leyendo.
//
// Los marcadores se acumulan en memoria y se envían al cerrar. No se escribe
// una fila por interacción: eso convertiría el scroll en tráfico de red. Con el
// scroll limitado a uno cada veinte segundos, un tramo de media hora produce
// como mucho unos noventa marcadores, que caben de sobra en el evento de cierre
// que ya se iba a escribir.

import {
  MAX_MARKERS,
  truncateMarkers,
  type ActivityMarker,
  type CloseReason,
  type MarkerType,
  type OpenReason,
} from './activitySegments.ts'

export type TrackerInput =
  /** El puente de sessionStorage entregó el clic deliberado desde Camino. */
  | { kind: 'pending_start'; at: number; segmentId: string; t0: number }
  /** Acción semántica del alumno dentro de la misión. */
  | { kind: 'engagement'; at: number; marker: MarkerType }
  | { kind: 'visibility'; at: number; visible: boolean }
  | { kind: 'pagehide'; at: number }
  /** Latido local para detectar inactividad. No produce escrituras por sí. */
  | { kind: 'tick'; at: number }
  | { kind: 'complete'; at: number }

export type OpenedPayload = {
  segmentId: string
  occurredAt: number
  openReason: OpenReason
  origin: string
  seq: number
}

export type ClosedPayload = {
  segmentId: string
  origin: string
  startedAt: number
  lastActivityAt: number
  closeDetectedAt: number
  closeReason: CloseReason
  markers: ActivityMarker[]
  markersTruncated: boolean
}

export type TrackerEffect =
  | { kind: 'open'; payload: OpenedPayload }
  | { kind: 'close'; payload: ClosedPayload }

export type TrackerOptions = {
  origin: string
  mintSegmentId: () => string
  inactivityHorizonMs?: number
}

/** Cada cuánto puede repetirse un marcador del mismo tipo, en ms. */
const MARKER_THROTTLE_MS: Partial<Record<MarkerType, number>> = {
  scroll: 20_000,
  answer_input: 20_000,
  video_tick: 30_000,
}

const DEFAULT_HORIZON_MS = 5 * 60 * 1000

type OpenSegment = {
  segmentId: string
  startedAt: number
  lastActivityAt: number
  markers: ActivityMarker[]
  lastMarkerAt: Partial<Record<MarkerType, number>>
}

export class MissionActivityTracker {
  private readonly origin: string
  private readonly mintSegmentId: () => string
  private readonly horizonMs: number

  private open: OpenSegment | null = null
  private seq = 0
  private closedAny = false
  private finished = false
  private visible = true

  constructor(options: TrackerOptions) {
    this.origin = options.origin
    this.mintSegmentId = options.mintSegmentId
    this.horizonMs = options.inactivityHorizonMs ?? DEFAULT_HORIZON_MS
  }

  /** Hay un tramo abierto ahora mismo. Para que el adaptador no tenga que espiar. */
  get hasOpenSegment(): boolean {
    return this.open !== null
  }

  /**
   * Foto del tramo vivo, con la forma de un cierre. Es lo que el adaptador
   * espeja en el diario local: si el navegador muere, la siguiente carga tiene
   * con qué cerrarlo en lugar de perder el tramo entero.
   */
  snapshot(): ClosedPayload | null {
    const segment = this.open
    if (!segment) return null
    const { markers, truncated } = truncateMarkers(segment.markers)
    return {
      segmentId: segment.segmentId,
      origin: this.origin,
      startedAt: segment.startedAt,
      lastActivityAt: segment.lastActivityAt,
      closeDetectedAt: segment.lastActivityAt,
      closeReason: 'recovered_after_crash',
      markers,
      markersTruncated: truncated,
    }
  }

  handle(input: TrackerInput): TrackerEffect[] {
    if (this.finished) return []

    switch (input.kind) {
      case 'pending_start':
        return this.onPendingStart(input)
      case 'engagement':
        return this.onEngagement(input)
      case 'visibility':
        return this.onVisibility(input)
      case 'pagehide':
        return this.closeIfOpen(input.at, 'pagehide')
      case 'tick':
        return this.onTick(input)
      case 'complete':
        this.finished = true
        return this.closeIfOpen(input.at, 'completed')
      default:
        return []
    }
  }

  private onPendingStart(input: Extract<TrackerInput, { kind: 'pending_start' }>): TrackerEffect[] {
    // Un doble clic entrega el mismo pendiente dos veces en el peor caso. Con
    // un tramo ya abierto no se abre otro; y aunque se colara, el `unique` de
    // camino_mission_events sobre (mission, tipo, segment_id) lo absorbería.
    if (this.open) return []
    return this.openSegment(input.segmentId, input.t0, 'camino_click')
  }

  private onEngagement(input: Extract<TrackerInput, { kind: 'engagement' }>): TrackerEffect[] {
    if (!this.open) {
      // Sin clic observable (refresco, deep-link) el primer engagement abre.
      // Si ya hubo tramos antes, esto es una reanudación.
      const reason: OpenReason = this.closedAny ? 'resumed' : 'first_engagement'
      const effects = this.openSegment(this.mintSegmentId(), input.at, reason)
      this.pushMarker(input.at, input.marker)
      return effects
    }
    this.pushMarker(input.at, input.marker)
    return []
  }

  private onVisibility(input: Extract<TrackerInput, { kind: 'visibility' }>): TrackerEffect[] {
    this.visible = input.visible
    if (input.visible) {
      // Deliberadamente nada. Volver a ver la pestaña no es volver a estudiar:
      // hace falta un evento semántico, que entrará por 'engagement'.
      return []
    }
    return this.closeIfOpen(input.at, 'hidden')
  }

  private onTick(input: Extract<TrackerInput, { kind: 'tick' }>): TrackerEffect[] {
    if (!this.open) return []
    if (input.at - this.open.lastActivityAt <= this.horizonMs) return []
    // El cierre se fecha cuando venció el horizonte, no cuando el latido se
    // dio cuenta: un tick que llega tarde no debe inflar la cota superior.
    return this.closeIfOpen(this.open.lastActivityAt + this.horizonMs, 'inactivity')
  }

  private openSegment(segmentId: string, at: number, openReason: OpenReason): TrackerEffect[] {
    this.seq += 1
    this.open = {
      segmentId,
      startedAt: at,
      lastActivityAt: at,
      markers: [],
      lastMarkerAt: {},
    }
    return [{
      kind: 'open',
      payload: { segmentId, occurredAt: at, openReason, origin: this.origin, seq: this.seq },
    }]
  }

  private pushMarker(at: number, marker: MarkerType) {
    const segment = this.open
    if (!segment) return

    const throttle = MARKER_THROTTLE_MS[marker]
    const previous = segment.lastMarkerAt[marker]
    // La actividad cuenta SIEMPRE para mantener vivo el tramo; el límite solo
    // decide si además deja marcador. Si no, un alumno leyendo y haciendo
    // scroll despacio se cerraría por inactividad pese a estar trabajando.
    segment.lastActivityAt = Math.max(segment.lastActivityAt, at)
    if (throttle != null && previous != null && at - previous < throttle) return

    segment.lastMarkerAt[marker] = at
    if (segment.markers.length < MAX_MARKERS * 2) {
      segment.markers.push([Math.max(0, Math.round((at - segment.startedAt) / 1000)), marker])
    }
  }

  private closeIfOpen(at: number, closeReason: CloseReason): TrackerEffect[] {
    const segment = this.open
    if (!segment) return []
    this.open = null
    this.closedAny = true

    const closeDetectedAt = Math.max(at, segment.lastActivityAt)
    const { markers, truncated } = truncateMarkers(segment.markers)
    return [{
      kind: 'close',
      payload: {
        segmentId: segment.segmentId,
        origin: this.origin,
        startedAt: segment.startedAt,
        lastActivityAt: segment.lastActivityAt,
        closeDetectedAt,
        closeReason,
        markers,
        markersTruncated: truncated,
      },
    }]
  }
}
