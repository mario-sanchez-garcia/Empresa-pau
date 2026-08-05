// Modelo de "pausar y continuar" para Simulacros y Prep. parcial. No hay
// migración: historial_simulacros.estado tiene un CHECK que solo permite
// 'en_progreso' | 'completado' (ver supabase/migrations/
// 20260608152000_create_historial_simulacros.sql) — añadir un tercer valor
// 'pausado' exigiría ensanchar ese constraint. En vez de eso, "en pausa" es
// un estado DERIVADO: la sesión sigue en 'en_progreso', pero
// resultado_json.time_segments no tiene ningún tramo abierto. Mismo patrón
// ya usado en esta app para mission_id/practica_simulacro_id: guardar en el
// JSON flexible en vez de tocar el esquema.
//
// Cada tramo de trabajo real es { startedAt, endedAt }. endedAt=null
// significa "en curso ahora mismo". El tiempo total consumido es la suma de
// todos los tramos cerrados más, si hay uno abierto, el tiempo transcurrido
// desde que se abrió — así que pausar y reanudar nunca reinicia el reloj a
// 0, solo dejan de sumar mientras está en pausa.

export type TimeSegment = { startedAt: string; endedAt: string | null }

export function isValidSegments(value: unknown): value is TimeSegment[] {
  return Array.isArray(value) && value.every(
    (s) => s && typeof s === 'object'
      && typeof (s as TimeSegment).startedAt === 'string'
      && ((s as TimeSegment).endedAt === null || typeof (s as TimeSegment).endedAt === 'string')
  )
}

export function hasOpenSegment(segments: TimeSegment[]): boolean {
  return segments.some(s => s.endedAt === null)
}

// Segundos reales trabajados: tramos cerrados + el tramo abierto (si lo hay)
// hasta `now`. Nunca negativo por tramo, por si el reloj del cliente que
// originó startedAt/endedAt estuviera ligeramente desincronizado.
export function totalElapsedSeconds(segments: TimeSegment[], now: number = Date.now()): number {
  let total = 0
  for (const segment of segments) {
    const start = Date.parse(segment.startedAt)
    if (!Number.isFinite(start)) continue
    const end = segment.endedAt ? Date.parse(segment.endedAt) : now
    if (!Number.isFinite(end)) continue
    total += Math.max(0, (end - start) / 1000)
  }
  return Math.round(total)
}

// Abre un tramo nuevo (reanudar). Si ya había uno abierto, no hace nada —
// reanudar dos veces seguidas no debe crear tramos duplicados.
export function openSegment(segments: TimeSegment[], now: string = new Date().toISOString()): TimeSegment[] {
  if (hasOpenSegment(segments)) return segments
  return [...segments, { startedAt: now, endedAt: null }]
}

// Cierra el último tramo abierto (pausar, o el cierre implícito al
// entregar). Si no había ninguno abierto, no hace nada — pausar dos veces
// seguidas es un no-op idempotente, no un error.
export function closeSegment(segments: TimeSegment[], now: string = new Date().toISOString()): TimeSegment[] {
  const openIndex = segments.findIndex(s => s.endedAt === null)
  if (openIndex === -1) return segments
  return segments.map((s, i) => i === openIndex ? { ...s, endedAt: now } : s)
}

// Límite razonable para poder reanudar una sesión pausada: 3 días desde que
// se creó. Para una práctica de parcial ligada a un examen real conocido
// (ver mission_id -> camino_calendar.metadata.partial_exam_date), el límite
// efectivo es el que llegue antes entre esos 3 días y el propio día del
// examen — no tiene sentido seguir "preparando" un parcial después de que
// ya ha pasado.
export const MAX_RESUME_DAYS = 3

export function resumeDeadline(createdAt: string, examDateISO?: string | null): Date {
  const created = new Date(createdAt)
  const defaultDeadline = new Date(created.getTime() + MAX_RESUME_DAYS * 24 * 60 * 60 * 1000)
  if (!examDateISO) return defaultDeadline
  // Fin del día del examen, no su medianoche — se puede seguir preparando
  // hasta el mismo día.
  const examEndOfDay = new Date(`${examDateISO}T23:59:59`)
  if (!Number.isFinite(examEndOfDay.getTime())) return defaultDeadline
  return examEndOfDay < defaultDeadline ? examEndOfDay : defaultDeadline
}

export function isResumeExpired(createdAt: string, now: Date, examDateISO?: string | null): boolean {
  return now.getTime() > resumeDeadline(createdAt, examDateISO).getTime()
}
