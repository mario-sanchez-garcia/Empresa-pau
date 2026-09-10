// Cuánto dura de verdad una misión, en minutos. Puro y sin dependencias de
// servidor, para que "el resumen de Recalcular coincide con el calendario"
// sea comprobable y no una estimación enterrada en un mapa por tipo.
//
// La trampa: `mission_type` NO identifica la duración. `pau_practice` es a la
// vez el enlace al Simulacro real (90 min) y el microdiagnóstico (dos
// preguntas). Estimar los dos como la misión de referencia era lo que hacía
// que "Recalcular mi Camino" anunciara 70 minutos donde el calendario tenía
// 135 reservados.

import { PARCIAL_MINUTES, REFERENCE_MISSION_MINUTES, SIMULACRO_MINUTES } from './xpMap.ts'

// Duración estimada por mission_type para los tipos que no pasan por el
// cálculo por-slot de dailyTimeCapacity.ts (ese cubre las misiones
// principales concept/pau_practice/etc. según los minutos diarios
// declarados). Reutiliza las constantes ya existentes en xpMap.ts donde las
// hay (PARCIAL_MINUTES, REFERENCE_MISSION_MINUTES) para no duplicar la
// fuente de verdad de "cuánto dura de verdad" cada tipo de contenido.
const MISSION_TYPE_MINUTES: Record<string, number> = {
  review: 20,
  comment_text: 40,
  partial_practice: PARCIAL_MINUTES,
}

export function estimatedMinutesForMissionType(missionType: string): number {
  return MISSION_TYPE_MINUTES[missionType] ?? REFERENCE_MISSION_MINUTES
}

// Postgres/PostgREST devuelve `time` como "HH:MM:SS" — el resto de la app
// (inputs <input type="time">, comparaciones) trabaja en "HH:MM".
export function normalizeTime(value: string): string {
  return value.slice(0, 5)
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** Minutos entre dos "HH:MM"/"HH:MM:SS", o null si no son un rango válido. */
export function minutesBetweenTimes(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null
  const from = toMinutes(normalizeTime(start))
  const to = toMinutes(normalizeTime(end))
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return null
  return to - from
}

export type MissionDurationRow = {
  mission_type?: string | null
  metadata?: unknown
  start_time?: string | null
  end_time?: string | null
}

/**
 * Duración de una misión YA PERSISTIDA.
 *
 * Cuando la fila tiene hueco real reservado (start_time/end_time), esa es la
 * verdad: es lo que ocupa en el día del alumno, decidido por el scheduler al
 * insertarla. La estimación por tipo (afinada con los metadatos que
 * distinguen subtipos dentro de un mismo mission_type) solo cubre las filas
 * sin hueco.
 */
export function estimatedMinutesForMission(row: MissionDurationRow): number {
  const scheduled = minutesBetweenTimes(row.start_time, row.end_time)
  if (scheduled !== null) return scheduled

  const meta = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata as Record<string, unknown>
    : {}
  // El enlace al Simulacro real se persiste como `pau_practice` pero abre el
  // Simulacro de 90 min (ver injectPartialExamMissions).
  if (meta.links_to_simulacro_exam_id) return SIMULACRO_MINUTES
  if (typeof meta.estimated_minutes === 'number' && Number.isFinite(meta.estimated_minutes) && meta.estimated_minutes > 0) return meta.estimated_minutes
  // Un microdiagnóstico (metadata.diagnostic_for) también es `pau_practice`,
  // pero son dos preguntas sueltas: se queda en la estimación de referencia,
  // que es exactamente el hueco que le reserva injectDiagnosticMissions.
  return estimatedMinutesForMissionType(row.mission_type ?? '')
}
