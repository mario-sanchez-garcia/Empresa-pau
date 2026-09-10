// Rotación de asignaturas por día lectivo, compartida por la generación
// inicial (generateCaminoPlan) y la extensión diaria (ensureCaminoCalendar).
//
// Antes cada uno de esos dos sitios hacía `ordered[(dow - 1) % ordered.length]`,
// con `dow` el día de la semana (1=lunes … 5=viernes). Eso hace que el índice
// solo tome 5 valores distintos, así que con 6 o más asignaturas las
// posiciones ≥5 eran INALCANZABLE: un alumno con 6 asignaturas nunca recibía
// ni un solo día de la sexta (reproducido: reparto de 14 días → Inglés 0
// misiones). El índice tiene que ser continuo ENTRE SEMANAS, no reiniciarse
// cada lunes.

// Lunes de referencia. Cualquier lunes vale: solo fija el origen del
// contador para que la rotación sea determinista y estable entre ejecuciones.
const ROTATION_EPOCH_MONDAY = '2024-01-01'

const MS_PER_DAY = 86400000

function utcNoon(dateStr: string): number {
  return Date.parse(`${dateStr}T12:00:00Z`)
}

function isWeekend(dateStr: string): boolean {
  const dow = new Date(utcNoon(dateStr)).getUTCDay()
  return dow === 0 || dow === 6
}

/**
 * Número de días lectivos (L-V) transcurridos desde `ROTATION_EPOCH_MONDAY`.
 * Crece de forma continua semana a semana (lunes de la semana siguiente al
 * viernes 4 → 5), que es justo lo que `dow - 1` no hacía. Los sábados y
 * domingos comparten el valor del viernes anterior; da igual, porque nunca se
 * consulta para un fin de semana (rotateSubjectForDay los descarta antes).
 */
export function weekdayOrdinal(dateStr: string): number {
  const days = Math.floor((utcNoon(dateStr) - utcNoon(ROTATION_EPOCH_MONDAY)) / MS_PER_DAY)
  const weeks = Math.floor(days / 7)
  const dayInWeek = days - weeks * 7 // 0 = lunes … 6 = domingo
  return weeks * 5 + Math.min(dayInWeek, 4)
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
  /** Permite programar en fin de semana (por defecto, no). */
  allowWeekends?: boolean
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
  const { priority, hasWork, allowWeekends = false } = options
  // Solo se filtra el fin de semana. Los festivos ya los descarta quien
  // llama (getStudyDays / studyDays), que es donde vive el calendario
  // laboral — mantener este módulo sin esa dependencia lo deja testeable
  // en aislamiento.
  if (!allowWeekends && isWeekend(dateStr)) return null

  const eligible = orderedSubjects.filter(subject => subject.length > 0)
  if (eligible.length === 0) return null

  const canTake = (subject: string) => (hasWork ? hasWork(subject) : true)

  // Un examen ese mismo día manda sobre la rotación normal.
  if (priority && priority.length > 0) {
    const forced = priority.find(subject => eligible.includes(subject) && canTake(subject))
    if (forced) return forced
  }

  const start = ((weekdayOrdinal(dateStr) % eligible.length) + eligible.length) % eligible.length
  for (let step = 0; step < eligible.length; step++) {
    const candidate = eligible[(start + step) % eligible.length]
    if (canTake(candidate)) return candidate
  }
  return null
}
