// Rotación de asignaturas por TURNO DE ESTUDIO del alumno, compartida por la
// generación inicial (generateCaminoPlan), la extensión diaria
// (ensureCaminoCalendar) y la previsión del navegador.
//
// Dos fallos históricos, en capas:
//
//  1. Cada sitio hacía `ordered[(dow - 1) % ordered.length]`, con `dow` el día
//     de la semana (1=lunes … 5=viernes). Eso hace que el índice solo tome 5
//     valores distintos, así que con 6 o más asignaturas las posiciones ≥5
//     eran INALCANZABLES: un alumno con 6 asignaturas nunca recibía ni un solo
//     día de la sexta (reproducido: reparto de 14 días → Inglés 0 misiones).
//
//  2. Arreglado eso con un contador continuo de días L-V, seguía fallando para
//     quien NO estudia de lunes a viernes. El contador avanzaba por días
//     laborables transcurridos aunque el alumno no estudiara esos días: con 5
//     asignaturas y 2 días semanales (lunes y jueves), el lunes siempre caía
//     en el índice 0 y el jueves siempre en el 3 — las otras tres asignaturas
//     no aparecían NUNCA (reproducido: 8 semanas → A: 8, B: 0, C: 0, D: 8,
//     E: 0). Y con 7 días semanales, el fin de semana se descartaba aquí
//     aunque el alumno lo hubiera habilitado, tirando 4 de cada 14 días.
//
// El contador cuenta ahora TURNOS DE ESTUDIO REALES: solo avanza los días en
// los que el alumno estudia de verdad. Lunes y jueves de la misma semana son
// turnos consecutivos, así que la rotación recorre todas las asignaturas.

// Lunes de referencia. Cualquier lunes vale: solo fija el origen del
// contador para que la rotación sea determinista y estable entre ejecuciones.
const ROTATION_EPOCH_MONDAY = '2024-01-01'

const MS_PER_DAY = 86400000

/** Patrón semanal por defecto: L-V. 0 = lunes … 6 = domingo. */
export const DEFAULT_STUDY_DAY_INDEXES: readonly number[] = [0, 1, 2, 3, 4]

function utcNoon(dateStr: string): number {
  return Date.parse(`${dateStr}T12:00:00Z`)
}

/** 0 = lunes … 6 = domingo */
export function mondayIndex(dateStr: string): number {
  const dow = new Date(utcNoon(dateStr)).getUTCDay()
  return dow === 0 ? 6 : dow - 1
}

function isWeekend(dateStr: string): boolean {
  const idx = mondayIndex(dateStr)
  return idx === 5 || idx === 6
}

function normalizeStudyDayIndexes(indexes: readonly number[] | undefined): readonly number[] {
  if (!indexes || indexes.length === 0) return DEFAULT_STUDY_DAY_INDEXES
  const clean = [...new Set(indexes.filter(i => Number.isInteger(i) && i >= 0 && i <= 6))].sort((a, b) => a - b)
  return clean.length > 0 ? clean : DEFAULT_STUDY_DAY_INDEXES
}

/**
 * Número de TURNOS DE ESTUDIO transcurridos desde `ROTATION_EPOCH_MONDAY`,
 * según el patrón semanal del alumno.
 *
 * Con el patrón por defecto (L-V) devuelve exactamente lo mismo que el antiguo
 * `weekdayOrdinal`: semanas × 5 + día de la semana. Con 2 días semanales
 * (L y J) devuelve semanas × 2 + 0/1, que es lo que hace que la rotación
 * recorra TODAS las asignaturas en vez de repetir dos.
 *
 * Los festivos NO se descuentan a propósito: entran por el filtro de días de
 * quien llama, y meterlos aquí haría que el índice de un día dependiera del
 * calendario laboral de todo el año anterior — imposible de razonar y distinto
 * entre servidor y cliente si sus tablas de festivos divergen un solo día.
 */
export function studySlotOrdinal(dateStr: string, studyDayIndexes?: readonly number[]): number {
  const pattern = normalizeStudyDayIndexes(studyDayIndexes)
  const days = Math.floor((utcNoon(dateStr) - utcNoon(ROTATION_EPOCH_MONDAY)) / MS_PER_DAY)
  const weeks = Math.floor(days / 7)
  const dayInWeek = days - weeks * 7 // 0 = lunes … 6 = domingo
  // Turnos ya consumidos en la semana en curso antes de este día.
  let consumedThisWeek = 0
  for (const idx of pattern) if (idx < dayInWeek) consumedThisWeek += 1
  return weeks * pattern.length + consumedThisWeek
}

/**
 * Compatibilidad: el contador L-V de siempre. Sigue existiendo porque hay
 * llamadores que razonan en días laborables y no en turnos del alumno.
 */
export function weekdayOrdinal(dateStr: string): number {
  return studySlotOrdinal(dateStr, DEFAULT_STUDY_DAY_INDEXES)
}

export type RotationOptions = {
  /**
   * Asignaturas que tienen examen ESE día y deben saltarse la rotación.
   * Se respeta el orden recibido; la primera que además tenga trabajo gana.
   */
  priority?: string[]
  /**
   * ¿Le queda temario pendiente a esta asignatura? Cuando la asignatura que
   * toca por rotación ya no tiene nada que aportar, el día se cedía y quedaba
   * VACÍO. Con esto la rotación avanza al siguiente candidato elegible en vez
   * de desperdiciar el día.
   */
  hasWork?: (subject: string) => boolean
  /** Permite programar en fin de semana (por defecto, no). Ignorado si se pasa `studyDayIndexes`. */
  allowWeekends?: boolean
  /**
   * Días de la semana en los que el alumno estudia DE VERDAD (0 = lunes …
   * 6 = domingo). Es la disponibilidad efectiva, y sobre ella se cuenta el
   * turno de rotación. Sin esto, el contador avanzaba por días laborables
   * transcurridos y un alumno de 2 días/semana solo veía 2 asignaturas.
   */
  studyDayIndexes?: readonly number[]
}

/**
 * Asignatura que le toca a `dateStr`, o null si ese día no es lectivo o
 * ninguna asignatura elegible tiene trabajo pendiente.
 */
export function rotateSubjectForDay(
  dateStr: string,
  orderedSubjects: string[],
  options: RotationOptions = {},
): string | null {
  const { priority, hasWork, allowWeekends = false, studyDayIndexes } = options
  // Solo se filtra el día. Los festivos ya los descarta quien llama
  // (studyDatesBetween / getStudyDays), que es donde vive el calendario
  // laboral — mantener este módulo sin esa dependencia lo deja testeable en
  // aislamiento.
  if (studyDayIndexes && studyDayIndexes.length > 0) {
    // Con patrón explícito, él manda: incluye el fin de semana si el alumno
    // lo eligió, y excluye los días laborables que no estudia.
    if (!normalizeStudyDayIndexes(studyDayIndexes).includes(mondayIndex(dateStr))) return null
  } else if (!allowWeekends && isWeekend(dateStr)) {
    return null
  }

  const eligible = orderedSubjects.filter(subject => subject.length > 0)
  if (eligible.length === 0) return null

  const canTake = (subject: string) => (hasWork ? hasWork(subject) : true)

  // Un examen ese mismo día manda sobre la rotación normal.
  if (priority && priority.length > 0) {
    const forced = priority.find(subject => eligible.includes(subject) && canTake(subject))
    if (forced) return forced
  }

  const ordinal = studySlotOrdinal(dateStr, studyDayIndexes)
  const start = ((ordinal % eligible.length) + eligible.length) % eligible.length
  for (let step = 0; step < eligible.length; step++) {
    const candidate = eligible[(start + step) % eligible.length]
    if (canTake(candidate)) return candidate
  }
  return null
}
