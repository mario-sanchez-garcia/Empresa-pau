// Presupuesto real de estudio de un alumno entre dos fechas, en días,
// sesiones y minutos.
//
// Existe porque varias capas del planificador estimaban "cuánto cabe" con
// reglas propias e incompatibles entre sí:
//
//  - ensureCaminoCalendar disparaba el modo rescate con
//    `pendientes / díasHábilesHastaExamen > 2`, un cociente que ignora tanto
//    los días semanales que el alumno eligió como si estudia 30 o 180 minutos
//    al día. Con 500 temas, 184 días y 180 min/día el rescate se activaba y
//    recortaba la cola aunque la propia tabla de capacidad permitía 736
//    sesiones — más que de sobra.
//  - computeExamCoverage calculaba el techo de CADA examen como "todos los
//    días hábiles restantes × capacidad diaria", sin descontar los demás
//    exámenes. Tres exámenes con 10 temas pendientes cada uno y hueco para 10
//    sesiones daban 100% de cobertura los tres a la vez.
//
// Aquí el presupuesto se calcula UNA vez y se reparte; nadie puede volver a
// gastarse el mismo día dos veces.

import { missionPlanForMinutes } from './dailyTimeCapacity.ts'

const MS_PER_DAY = 86400000

function utcNoon(dateStr: string): number {
  return Date.parse(`${dateStr}T12:00:00Z`)
}

function addDays(dateStr: string, n: number): string {
  return new Date(utcNoon(dateStr) + n * MS_PER_DAY).toISOString().slice(0, 10)
}

/** 0 = lunes … 6 = domingo */
function mondayIndex(dateStr: string): number {
  const dow = new Date(utcNoon(dateStr)).getUTCDay()
  return dow === 0 ? 6 : dow - 1
}

// Mismo reparto semanal que studyDays.studyDayIndexesFor — duplicado aquí a
// propósito para que este módulo no arrastre el calendario laboral y siga
// siendo comprobable en aislamiento. Los festivos entran por parámetro.
function weekdayIndexesFor(weeklyStudyDays: number): number[] {
  if (weeklyStudyDays <= 2) return [0, 3]
  if (weeklyStudyDays === 3) return [0, 2, 4]
  if (weeklyStudyDays === 4) return [0, 1, 3, 5]
  if (weeklyStudyDays === 5) return [0, 1, 2, 4, 5]
  if (weeklyStudyDays === 6) return [0, 1, 2, 3, 4, 5]
  return [0, 1, 2, 3, 4, 5, 6]
}

export type StudyDatesOptions = {
  /** Días de estudio por semana declarados por el alumno. null = L-V. */
  weeklyStudyDays?: number | null
  /** Festivos que no cuentan como día de estudio. */
  holidays?: ReadonlySet<string>
  /** Tope duro de días a devolver, por seguridad ante rangos enormes. */
  maxDays?: number
}

/**
 * Fechas de estudio reales en `[from, to)` — respetando el patrón semanal del
 * alumno y los festivos. `to` es EXCLUSIVO: el día del examen no es un día de
 * preparación.
 */
export function studyDatesBetween(from: string, to: string, options: StudyDatesOptions = {}): string[] {
  const { weeklyStudyDays = null, holidays, maxDays = 1000 } = options
  if (!(from < to)) return []

  const allowed = weeklyStudyDays != null
    ? new Set(weekdayIndexesFor(weeklyStudyDays))
    : new Set([0, 1, 2, 3, 4])

  const dates: string[] = []
  let current = from
  while (current < to && dates.length < maxDays) {
    const idx = mondayIndex(current)
    if (allowed.has(idx) && !(holidays?.has(current) ?? false)) dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

export type StudyCapacity = {
  /** Días de estudio disponibles antes de la fecha objetivo. */
  days: number
  /** Misiones principales que caben en un día, según los minutos declarados. */
  sessionsPerDay: number
  /** Sesiones totales que caben en el periodo. */
  sessions: number
  /** Minutos totales que caben en el periodo. */
  minutes: number
}

export type CapacityOptions = StudyDatesOptions & {
  /** Minutos diarios declarados en onboarding. */
  dailyMinutes?: number | null
}

/**
 * Cuánto trabajo cabe DE VERDAD entre `from` y `to`, en la unidad que usa el
 * planificador (misiones principales) y en minutos.
 */
export function computeStudyCapacity(from: string, to: string, options: CapacityOptions = {}): StudyCapacity {
  const plan = missionPlanForMinutes(options.dailyMinutes)
  const days = studyDatesBetween(from, to, options).length
  const minutesPerDay = plan.slotMinutes.reduce((a, b) => a + b, 0)
  return {
    days,
    sessionsPerDay: plan.count,
    sessions: days * plan.count,
    minutes: days * minutesPerDay,
  }
}

export type ExamBudgetInput = {
  id: string
  /** Fecha del examen (YYYY-MM-DD). */
  date: string
  /** Temas de este examen que aún no están cubiertos. */
  pendingCount: number
}

export type ExamBudget = {
  /** Sesiones que este examen puede reclamar SIN pisar a los demás. */
  allocatedSessions: number
  /** Temas que se quedan fuera del presupuesto compartido. */
  uncoveredCount: number
}

/**
 * Reparte el presupuesto de estudio entre TODOS los exámenes activos, de modo
 * que ninguno cuente como suyo un día que otro ya va a gastar.
 *
 * Los exámenes se sirven por orden de fecha (el más próximo primero) y cada
 * uno consume los días disponibles MÁS TEMPRANOS anteriores a su fecha: un
 * examen posterior siempre conserva los días que caen entre el examen previo
 * y el suyo, que son los únicos que el anterior no podía usar de todos modos.
 *
 * Devuelve, por id de examen, cuántas sesiones le corresponden realmente y
 * cuántos temas quedan sin sitio — el dato honesto que el alumno necesita
 * para saber si le da tiempo, en vez de tres "100%" simultáneos.
 */
export function allocateExamBudgets(
  today: string,
  exams: ExamBudgetInput[],
  options: CapacityOptions = {},
): Map<string, ExamBudget> {
  const result = new Map<string, ExamBudget>()
  const upcoming = exams
    .filter(exam => exam.date > today)
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)))

  for (const exam of exams) {
    result.set(exam.id, { allocatedSessions: 0, uncoveredCount: Math.max(0, exam.pendingCount) })
  }
  if (upcoming.length === 0) return result

  const lastDate = upcoming[upcoming.length - 1].date
  const dates = studyDatesBetween(today, lastDate, options)
  const sessionsPerDay = missionPlanForMinutes(options.dailyMinutes).count

  // Capacidad restante de cada día, consumible una sola vez.
  const remaining = new Map<string, number>(dates.map(date => [date, sessionsPerDay]))

  for (const exam of upcoming) {
    let needed = Math.max(0, exam.pendingCount)
    let allocated = 0
    for (const date of dates) {
      if (needed <= 0) break
      if (date >= exam.date) break
      const free = remaining.get(date) ?? 0
      if (free <= 0) continue
      const take = Math.min(free, needed)
      remaining.set(date, free - take)
      allocated += take
      needed -= take
    }
    result.set(exam.id, { allocatedSessions: allocated, uncoveredCount: needed })
  }

  return result
}

/**
 * Primera fecha de la ventana reservada al repaso/práctica final: a partir de
 * ella el plan deja de sembrar temario NUEVO.
 *
 * Devuelve `examDate` cuando no hay días suficientes como para reservar nada
 * (el corte sigue siendo el examen), y `today` cuando el periodo entero cabe
 * dentro de la reserva — en ese caso no debe entrar ni una lección nueva.
 */
export function planningCutoffDate(
  today: string,
  examDate: string,
  reservedStudyDays: number,
  options: StudyDatesOptions = {},
): string {
  if (reservedStudyDays <= 0) return examDate
  const dates = studyDatesBetween(today, examDate, options)
  if (dates.length === 0) return examDate
  if (dates.length <= reservedStudyDays) return today
  return dates[dates.length - reservedStudyDays]
}
