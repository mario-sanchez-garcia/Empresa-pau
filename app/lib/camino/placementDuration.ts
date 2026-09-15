import { estimatedMinutesForMission, estimatedMinutesForMissionType } from './missionDuration.ts'

export const CONTENT_DURATION_MODEL = 'content_v1'

type DurationSource = 'content' | 'declared' | 'reference' | 'simulacro'
const positiveMinutes = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 1

/** La carga pertenece a la actividad, nunca al presupuesto diario del alumno.
 * La excepción es la REFERENCIA de una sesión de estudio, que no tiene
 * duración natural: ahí `dailyMinutes` decide el tamaño para que las sesiones
 * embaldosen el día (ver dailyTimeCapacity.sessionSlotsForMinutes).
 * `estimated_minutes` antiguo puede ser el tamaño de un slot, no una medida
 * del contenido. Para teoría/repaso personalizados por el modelo anterior
 * se ignora ese valor; una duración de contenido explícita tiene prioridad. */
export function placementDuration(missionType: string | null, metadata: Record<string, unknown> | null, dailyMinutes?: number | null) {
  const type = missionType ?? 'concept'
  const meta = metadata ?? {}
  let minutes: number
  let source: DurationSource
  if (meta.links_to_simulacro_exam_id) {
    minutes = estimatedMinutesForMission({ mission_type: type, metadata: meta })
    source = 'simulacro'
  } else if (positiveMinutes(meta.content_estimated_minutes)) {
    minutes = meta.content_estimated_minutes
    source = meta.duration_source === 'reference' ? 'reference' : 'content'
  } else if (positiveMinutes(meta.estimated_minutes)
    && !((type === 'concept' || type === 'review') && meta.camino_personalization && meta.duration_model !== CONTENT_DURATION_MODEL)) {
    minutes = meta.estimated_minutes
    source = 'declared'
  } else {
    minutes = estimatedMinutesForMissionType(type, dailyMinutes)
    source = 'reference'
  }
  return { minutes, source, estimated: source === 'reference' }
}

export function minutesForPlacement(missionType: string | null, metadata: Record<string, unknown> | null, dailyMinutes?: number | null): number {
  return placementDuration(missionType, metadata, dailyMinutes).minutes
}

/** Conserva la estimación independiente y la duración reservada por separado. */
export function placementDurationMetadata(missionType: string | null, metadata: Record<string, unknown> | null, dailyMinutes?: number | null) {
  const estimate = placementDuration(missionType, metadata, dailyMinutes)
  return { content_estimated_minutes: estimate.minutes, estimated_minutes: estimate.minutes,
    duration_source: estimate.source, duration_model: CONTENT_DURATION_MODEL }
}
