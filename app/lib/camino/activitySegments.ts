// Cuánto tiempo REAL dedicó un alumno a una misión. Puro, sin React y sin
// Supabase: entra la evidencia bruta (los eventos append-only que escribió el
// cliente) y salen minutos, incertidumbre y calidad.
//
// Existe porque `actual_duration_minutes` se venía calculando como
// `completed_at - started_at`, o sea reloj de pared con las pausas dentro. Una
// pestaña abierta y olvidada contaba como estudio. Medir por diferencia entre
// dos instantes no tiene arreglo ajustando cuál es el instante: hay que dejar
// de hacerlo.
//
// Tres decisiones que explican la forma de todo lo de abajo:
//
//  1. El final de un tramo NO es su último evento observado. Leer no produce
//     eventos: un alumno puede pasar cuatro minutos con una explicación
//     delante sin tocar nada, y eso es estudio. Cerrar en el último evento
//     contaría cero esos cuatro minutos — justo el caso que esto existe para
//     medir. Por eso se conservan las DOS cotas (last_activity_at y
//     close_detected_at) y `graceMinutes` decide después cuánto del hueco
//     cuenta. Mientras no haya datos para elegirlo, la diferencia viaja como
//     incertidumbre declarada en vez de esconderse en el número.
//
//  2. Los marcadores permiten bajar el horizonte de inactividad, no solo
//     subirlo. Con solo inicio y fin de cada tramo se pueden fundir tramos
//     contiguos (horizonte mayor), pero es imposible saber si dentro de un
//     tramo de 26 minutos hubo una pausa de 9 que un horizonte menor habría
//     cortado. Re-segmentar por marcadores es lo que hace esa promesa cierta
//     en ambas direcciones.
//
//  3. Los timestamps los pone el cliente y no son verdad revelada. No por
//     fraude: relojes mal puestos, cambios de hora, dos dispositivos. Cada
//     evento trae también su hora de recepción en servidor (created_at) y la
//     divergencia entre ambas es una señal de calidad, no un detalle.
//
// Estudiar en dos tandas NO degrada la calidad. Quince minutos, cierre limpio,
// vuelta dos horas después, doce minutos más y completar son 27 minutos
// perfectamente observados. Lo que degrada es incertidumbre, pérdida de
// eventos o incoherencia — nunca el simple hecho de haber estudiado a ratos.

export type MarkerType =
  | 'card_nav'
  | 'video_open'
  | 'video_tick'
  | 'glossary'
  | 'answer_input'
  | 'scroll'
  | 'visible'

/** [segundos desde el inicio del tramo, tipo]. Nunca contenido ni posición. */
export type ActivityMarker = [number, MarkerType]

export type OpenReason = 'camino_click' | 'first_engagement' | 'resumed'

export type CloseReason =
  | 'hidden'
  | 'pagehide'
  | 'inactivity'
  | 'completed'
  | 'recovered_after_crash'

export const SEGMENT_OPENED = 'activity_segment_opened'
export const SEGMENT_CLOSED = 'activity_segment_closed'

/** Tope duro de marcadores por tramo. Ver `truncateMarkers`. */
export const MAX_MARKERS = 120

/**
 * Una fila de `camino_mission_events` tal y como la devuelve Supabase. Se pide
 * `created_at` además de `occurred_at` a propósito: el primero lo pone el
 * servidor y es la única referencia temporal que el cliente no controla.
 */
export type SegmentEventRow = {
  event_type: string
  occurred_at: string
  created_at?: string | null
  metadata?: Record<string, unknown> | null
}

export type DerivationParams = {
  /** Hueco entre marcadores que parte un tramo en dos. */
  inactivityHorizonMinutes: number
  /** Cuánto del intervalo posterior al último marcador cuenta como estudio. */
  graceMinutes: number
  /** Ratio sobre lo planificado por encima del cual el total es absurdo. */
  maxPlausibleRatio: number
  /** Incertidumbre máxima, en tanto por uno sobre el total, para `observed`. */
  maxUncertaintyRatio: number
  /** Divergencia tolerada entre el reloj del cliente y el del servidor. */
  maxClockSkewMinutes: number
  /** Solape máximo entre orígenes, en tanto por uno, para `observed`. */
  maxOverlapRatio: number
}

/**
 * PROVISIONALES. Son parámetros, no verdades: se eligen con datos reales una
 * vez haya tramos que mirar. Están aquí para que la derivación corra desde el
 * primer día, no para zanjar el debate. Cambiarlos NO exige reprocesar nada a
 * mano: la derivación se reejecuta sobre los mismos eventos.
 */
export const DEFAULT_DERIVATION_PARAMS: DerivationParams = {
  inactivityHorizonMinutes: 5,
  graceMinutes: 0,
  maxPlausibleRatio: 4,
  maxUncertaintyRatio: 0.35,
  maxClockSkewMinutes: 10,
  maxOverlapRatio: 0.1,
}

export type DurationQuality = 'observed' | 'partial' | 'unobserved' | 'anomalous'

/** Motivos por los que una medición no llegó a `observed`. Para auditar. */
export type QualityFlag =
  | 'no_evidence'
  | 'dangling_open'
  | 'dangling_close'
  | 'recovered_after_crash'
  | 'high_uncertainty'
  | 'clock_skew'
  | 'inverted_timestamps'
  | 'future_timestamp'
  | 'marker_out_of_range'
  | 'implausible_total'
  | 'excessive_overlap'

export type DerivedInterval = { startMs: number; endMs: number; origin: string }

export type DerivedDuration = {
  quality: DurationQuality
  /** Minutos con la regla conservadora (final = último marcador). */
  activeMinutesLow: number
  /** Minutos con la regla generosa (final = cierre detectado). */
  activeMinutesHigh: number
  /** Minutos con `graceMinutes` aplicado. Es el que se ofrece al sistema. */
  activeMinutes: number
  /** Suma de las ambigüedades por tramo: `high - low`. */
  uncertaintyMinutes: number
  flags: QualityFlag[]
  diagnostics: {
    segmentCount: number
    /** Tramos tras re-segmentar por el horizonte de inactividad. */
    intervalCount: number
    /** Orígenes distintos (pestañas o dispositivos). Metadata, no castigo. */
    originCount: number
    /** Tramos separados por más de una hora: estudio en varias tandas. */
    sessionCount: number
    overlapMinutes: number
    maxClockSkewMinutes: number
    openReasons: OpenReason[]
  }
}

const MINUTE = 60_000
/** Separación a partir de la cual dos tramos se consideran tandas distintas. */
const SESSION_GAP_MS = 60 * MINUTE

function parseMs(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** Valida la forma de los marcadores y descarta lo que no encaje. */
export function parseMarkers(value: unknown): ActivityMarker[] {
  if (!Array.isArray(value)) return []
  const out: ActivityMarker[] = []
  for (const entry of value.slice(0, MAX_MARKERS)) {
    if (!Array.isArray(entry) || entry.length < 2) continue
    const [offset, type] = entry
    if (typeof offset !== 'number' || !Number.isFinite(offset) || offset < 0) continue
    if (typeof type !== 'string') continue
    out.push([offset, type as MarkerType])
  }
  return out.sort((a, b) => a[0] - b[0])
}

/**
 * Conserva los 60 primeros y los 60 últimos marcadores. Un tramo truncado no
 * puede sostener un recálculo fino del horizonte, y por eso quien trunca avisa
 * (`markers_truncated`) en vez de dejar un agujero silencioso.
 */
export function truncateMarkers(markers: ActivityMarker[]): {
  markers: ActivityMarker[]
  truncated: boolean
} {
  if (markers.length <= MAX_MARKERS) return { markers, truncated: false }
  const half = Math.floor(MAX_MARKERS / 2)
  return {
    markers: [...markers.slice(0, half), ...markers.slice(-half)],
    truncated: true,
  }
}

type PairedSegment = {
  segmentId: string
  origin: string
  openReason: OpenReason | null
  startMs: number
  lastActivityMs: number
  closeDetectedMs: number
  closeReason: CloseReason | null
  markers: ActivityMarker[]
  markersTruncated: boolean
  hasOpen: boolean
  hasClose: boolean
  clockSkewMinutes: number
}

/**
 * Empareja `opened` con `closed` por `segment_id`.
 *
 * El cierre lleva copia de `started_at` a propósito: hace que el evento sea
 * autosuficiente y que un tramo siga siendo derivable aunque su apertura se
 * perdiera (red caída justo en el clic). La ausencia del par se refleja en la
 * calidad en vez de anular el dato.
 */
function pairSegments(rows: readonly SegmentEventRow[]): PairedSegment[] {
  const bySegment = new Map<string, PairedSegment>()

  const ensure = (segmentId: string): PairedSegment => {
    let segment = bySegment.get(segmentId)
    if (!segment) {
      segment = {
        segmentId,
        origin: 'unknown',
        openReason: null,
        startMs: NaN,
        lastActivityMs: NaN,
        closeDetectedMs: NaN,
        closeReason: null,
        markers: [],
        markersTruncated: false,
        hasOpen: false,
        hasClose: false,
        clockSkewMinutes: 0,
      }
      bySegment.set(segmentId, segment)
    }
    return segment
  }

  for (const row of rows) {
    const metadata = asRecord(row.metadata)
    const segmentId = asString(metadata.segment_id)
    if (!segmentId) continue
    const occurredMs = parseMs(row.occurred_at)
    if (occurredMs == null) continue

    // La divergencia entre el reloj del cliente y la recepción en servidor es
    // la única señal que el cliente no puede falsear por descuido.
    const receivedMs = parseMs(row.created_at)
    const skew = receivedMs == null ? 0 : Math.abs(receivedMs - occurredMs) / MINUTE

    const segment = ensure(segmentId)
    segment.clockSkewMinutes = Math.max(segment.clockSkewMinutes, skew)
    const origin = asString(metadata.origin)
    if (origin) segment.origin = origin

    if (row.event_type === SEGMENT_OPENED) {
      segment.hasOpen = true
      segment.startMs = occurredMs
      const reason = asString(metadata.open_reason)
      if (reason === 'camino_click' || reason === 'first_engagement' || reason === 'resumed') {
        segment.openReason = reason
      }
      continue
    }

    if (row.event_type !== SEGMENT_CLOSED) continue

    segment.hasClose = true
    segment.closeDetectedMs = occurredMs
    const startedAt = parseMs(metadata.started_at)
    // El `opened` manda sobre la copia del cierre cuando ambos existen.
    if (!segment.hasOpen && startedAt != null) segment.startMs = startedAt
    else if (Number.isNaN(segment.startMs) && startedAt != null) segment.startMs = startedAt

    const lastActivity = parseMs(metadata.last_activity_at)
    if (lastActivity != null) segment.lastActivityMs = lastActivity
    const closeReason = asString(metadata.close_reason)
    if (closeReason) segment.closeReason = closeReason as CloseReason
    segment.markers = parseMarkers(metadata.markers)
    segment.markersTruncated = metadata.markers_truncated === true
  }

  return [...bySegment.values()]
}

/**
 * Parte un tramo donde el hueco entre dos marcadores consecutivos supera el
 * horizonte. Es el paso que hace recalculable un horizonte MENOR: sin los
 * marcadores, un tramo largo sería indivisible para siempre.
 */
function resegment(
  segment: PairedSegment,
  horizonMs: number,
): Array<{ startMs: number; lowMs: number; highMs: number }> {
  const startMs = segment.startMs
  const lastActivityMs = Number.isNaN(segment.lastActivityMs) ? startMs : segment.lastActivityMs
  const closeMs = Number.isNaN(segment.closeDetectedMs) ? lastActivityMs : segment.closeDetectedMs

  // Sin marcadores el tramo es INDIVISIBLE. El cliente ya aplicó su propio
  // horizonte en vivo —cierra al quedarse inactivo—, así que un tramo cerrado
  // no contiene huecos mayores que el horizonte con el que se midió. Partirlo
  // aquí por la distancia entre su inicio y su última actividad inventaría una
  // pausa que nadie observó, y dejaría en cero una misión de once minutos
  // perfectamente medida. Re-segmentar solo tiene sentido cuando hay
  // marcadores que justifiquen dónde cortar.
  if (segment.markers.length === 0) {
    return [{ startMs, lowMs: lastActivityMs, highMs: Math.max(lastActivityMs, closeMs) }]
  }

  // Instantes absolutos: inicio, cada marcador, y el último evento conocido.
  const points = [startMs]
  for (const [offsetSeconds] of segment.markers) {
    const at = startMs + offsetSeconds * 1000
    if (at > startMs && at <= closeMs) points.push(at)
  }
  points.push(lastActivityMs)
  points.sort((a, b) => a - b)

  const pieces: Array<{ startMs: number; lowMs: number; highMs: number }> = []
  let pieceStart = points[0]
  let pieceEnd = points[0]

  for (let index = 1; index < points.length; index += 1) {
    if (points[index] - pieceEnd > horizonMs) {
      pieces.push({ startMs: pieceStart, lowMs: pieceEnd, highMs: pieceEnd })
      pieceStart = points[index]
    }
    pieceEnd = points[index]
  }

  // Solo el último trozo hereda la ambigüedad del cierre: los cortes internos
  // los decidimos nosotros y no tienen hueco que conceder.
  pieces.push({ startMs: pieceStart, lowMs: pieceEnd, highMs: Math.max(pieceEnd, closeMs) })
  return pieces
}

/**
 * Une intervalos solapados. NUNCA suma: un alumno no estudia el doble por
 * tener dos pestañas abiertas. Devuelve también los minutos solapados, que son
 * señal de incoherencia cuando vienen de orígenes distintos.
 */
export function unionIntervals(intervals: readonly DerivedInterval[]): {
  merged: Array<{ startMs: number; endMs: number }>
  overlapMs: number
} {
  const sorted = [...intervals].sort((a, b) => a.startMs - b.startMs)
  const merged: Array<{ startMs: number; endMs: number }> = []
  let overlapMs = 0

  for (const interval of sorted) {
    const last = merged[merged.length - 1]
    if (last && interval.startMs <= last.endMs) {
      overlapMs += Math.min(last.endMs, interval.endMs) - interval.startMs
      last.endMs = Math.max(last.endMs, interval.endMs)
    } else {
      merged.push({ startMs: interval.startMs, endMs: interval.endMs })
    }
  }

  return { merged, overlapMs }
}

function totalMinutes(intervals: ReadonlyArray<{ startMs: number; endMs: number }>): number {
  return intervals.reduce((sum, item) => sum + (item.endMs - item.startMs), 0) / MINUTE
}

function emptyResult(quality: DurationQuality, flags: QualityFlag[]): DerivedDuration {
  return {
    quality,
    activeMinutesLow: 0,
    activeMinutesHigh: 0,
    activeMinutes: 0,
    uncertaintyMinutes: 0,
    flags,
    diagnostics: {
      segmentCount: 0,
      intervalCount: 0,
      originCount: 0,
      sessionCount: 0,
      overlapMinutes: 0,
      maxClockSkewMinutes: 0,
      openReasons: [],
    },
  }
}

export function deriveMissionDuration(
  rows: readonly SegmentEventRow[],
  options: {
    params?: Partial<DerivationParams>
    plannedMinutes?: number | null
    /** Instante de referencia para detectar marcas futuras. */
    nowMs?: number
  } = {},
): DerivedDuration {
  const params = { ...DEFAULT_DERIVATION_PARAMS, ...options.params }
  const nowMs = options.nowMs ?? Date.now()
  const segments = pairSegments(rows)

  if (segments.length === 0) return emptyResult('unobserved', ['no_evidence'])

  const flags = new Set<QualityFlag>()
  const horizonMs = params.inactivityHorizonMinutes * MINUTE
  const graceMs = params.graceMinutes * MINUTE

  const lowIntervals: DerivedInterval[] = []
  const highIntervals: DerivedInterval[] = []
  const graceIntervals: DerivedInterval[] = []
  const origins = new Set<string>()
  const openReasons = new Set<OpenReason>()
  let maxSkew = 0
  let usableSegments = 0

  for (const segment of segments) {
    maxSkew = Math.max(maxSkew, segment.clockSkewMinutes)
    if (segment.openReason) openReasons.add(segment.openReason)
    if (!segment.hasOpen) flags.add('dangling_close')
    if (!segment.hasClose) flags.add('dangling_open')
    if (segment.closeReason === 'recovered_after_crash') flags.add('recovered_after_crash')
    if (segment.clockSkewMinutes > params.maxClockSkewMinutes) flags.add('clock_skew')

    // Un tramo sin cierre no aporta minutos: sabemos que empezó, no cuánto
    // duró. Inventar un final aquí es exactamente lo que este módulo evita.
    if (!segment.hasClose || Number.isNaN(segment.startMs)) continue

    if (segment.startMs > nowMs || segment.closeDetectedMs > nowMs) {
      flags.add('future_timestamp')
      continue
    }
    if (segment.closeDetectedMs < segment.startMs) {
      flags.add('inverted_timestamps')
      continue
    }
    if (!Number.isNaN(segment.lastActivityMs) && segment.lastActivityMs < segment.startMs) {
      flags.add('inverted_timestamps')
      continue
    }
    const spanSeconds = (segment.closeDetectedMs - segment.startMs) / 1000
    if (segment.markers.some(([offset]) => offset > spanSeconds + 1)) {
      flags.add('marker_out_of_range')
    }

    usableSegments += 1
    origins.add(segment.origin)

    for (const piece of resegment(segment, horizonMs)) {
      const graceEnd = piece.lowMs + Math.min(graceMs, piece.highMs - piece.lowMs)
      lowIntervals.push({ startMs: piece.startMs, endMs: piece.lowMs, origin: segment.origin })
      highIntervals.push({ startMs: piece.startMs, endMs: piece.highMs, origin: segment.origin })
      graceIntervals.push({ startMs: piece.startMs, endMs: graceEnd, origin: segment.origin })
    }
  }

  if (usableSegments === 0) {
    const quality: DurationQuality = flags.has('future_timestamp')
      || flags.has('inverted_timestamps')
      ? 'anomalous'
      : 'partial'
    const result = emptyResult(quality, [...flags])
    result.diagnostics.segmentCount = segments.length
    result.diagnostics.maxClockSkewMinutes = maxSkew
    return result
  }

  const low = unionIntervals(lowIntervals)
  const high = unionIntervals(highIntervals)
  const grace = unionIntervals(graceIntervals)

  const activeMinutesLow = totalMinutes(low.merged)
  const activeMinutesHigh = totalMinutes(high.merged)
  const activeMinutes = totalMinutes(grace.merged)
  const uncertaintyMinutes = Math.max(0, activeMinutesHigh - activeMinutesLow)
  const overlapMinutes = high.overlapMs / MINUTE

  // Tandas: tramos separados por más de una hora. Es metadata — estudiar en
  // dos ratos no es peor medición que estudiar del tirón.
  let sessionCount = low.merged.length > 0 ? 1 : 0
  for (let index = 1; index < low.merged.length; index += 1) {
    if (low.merged[index].startMs - low.merged[index - 1].endMs > SESSION_GAP_MS) sessionCount += 1
  }

  const planned = options.plannedMinutes
  if (planned != null && planned > 0 && activeMinutesHigh > planned * params.maxPlausibleRatio) {
    flags.add('implausible_total')
  }
  if (activeMinutesHigh > 0 && uncertaintyMinutes / activeMinutesHigh > params.maxUncertaintyRatio) {
    flags.add('high_uncertainty')
  }
  if (origins.size > 1 && activeMinutesHigh > 0 && overlapMinutes / activeMinutesHigh > params.maxOverlapRatio) {
    flags.add('excessive_overlap')
  }

  const anomalous: QualityFlag[] = [
    'future_timestamp',
    'inverted_timestamps',
    'clock_skew',
    'marker_out_of_range',
    'implausible_total',
    'excessive_overlap',
  ]
  const degrading: QualityFlag[] = [
    'dangling_open',
    'dangling_close',
    'recovered_after_crash',
    'high_uncertainty',
  ]

  const quality: DurationQuality = anomalous.some(flag => flags.has(flag))
    ? 'anomalous'
    : degrading.some(flag => flags.has(flag))
      ? 'partial'
      : 'observed'

  return {
    quality,
    activeMinutesLow,
    activeMinutesHigh,
    activeMinutes,
    uncertaintyMinutes,
    flags: [...flags],
    diagnostics: {
      segmentCount: segments.length,
      intervalCount: grace.merged.length,
      originCount: origins.size,
      sessionCount,
      overlapMinutes,
      maxClockSkewMinutes: maxSkew,
      openReasons: [...openReasons],
    },
  }
}

/**
 * Tolerancia para una marca en el futuro. Un reloj adelantado unos segundos es
 * normal; dos minutos por delante del servidor ya no lo es.
 */
export const MAX_FUTURE_SKEW_MS = 2 * MINUTE

/**
 * Acota una marca de tiempo del cliente ANTES de guardarla.
 *
 * Solo se corrige lo imposible: una marca futura. El pasado se respeta aunque
 * sea viejo, porque la cola offline entrega tramos reales de hace horas con sus
 * marcas originales, y reescribirlas al momento del envío destruiría justo el
 * dato que se quería conservar. Todo lo demás lo juzga la derivación
 * comparando con el `created_at` que pone Postgres.
 */
export function clampClientTimestamp(
  value: unknown,
  nowMs: number,
): { ms: number; clamped: boolean } {
  const raw = typeof value === 'number' && Number.isFinite(value)
    ? value
    : parseMs(value)
  if (raw == null) return { ms: nowMs, clamped: true }
  if (raw > nowMs + MAX_FUTURE_SKEW_MS) return { ms: nowMs, clamped: true }
  return { ms: raw, clamped: false }
}

/**
 * Lo único que tiene derecho a entrar en `actual_duration_minutes`.
 *
 * La etiqueta de calidad no viaja junto al número: decide si hay número. Un
 * consumidor futuro no debería tener que acordarse de comprobar nada para no
 * envenenar un modelo, así que `NULL` pasa a significar una sola cosa, fuerte
 * y comprobable: no hay una duración apta para aprender de ella. Nunca cero
 * para desconocido — cero es una afirmación, y aquí no la tenemos.
 */
export function durationForStorage(derived: DerivedDuration): number | null {
  if (derived.quality !== 'observed') return null
  const minutes = Math.round(derived.activeMinutes)
  return minutes > 0 ? minutes : null
}
