// La VENTANA DE PLANIFICACIÓN de un alumno: hasta cuándo llega su plan, qué
// días estudia de verdad y cuáles quedan reservados al repaso final.
//
// Pura y sin Supabase a propósito: la garantía que este módulo representa
// —"nadie propone una fecha posterior al examen del alumno"— tiene que poder
// comprobarse en aislamiento. La carga desde base de datos vive en
// studentPlanContext.ts, que reexporta todo esto.
//
// El problema que resuelve: la fecha objetivo y el patrón semanal existían,
// pero solo los consultaban algunos escritores. `buildPlanDays` cortaba antes
// del examen mientras `applyCalendarPersonalization` reubicaba filas sin saber
// que había examen (reproducido: 30 filas desde el 17/05 aterrizaban hasta el
// 08/07, con la PAU el 07/06) y los inyectores de repaso, diagnóstico y
// práctica de bloque elegían sus fechas con ventanas fijas de 14/30 días. Una
// garantía que solo cumple un componente no es una garantía del plan.

import { FINAL_REVIEW_RESERVED_STUDY_DAYS } from './examDate.ts'
import { SPAIN_HOLIDAYS } from './spainHolidays.ts'
import { planningCutoffDate, studyDatesBetween, studyDayIndexesFor } from './studyCapacity.ts'

export type StudentPlanContext = {
  /** Hoy en Madrid, YYYY-MM-DD. */
  today: string
  /** Fecha objetivo de la PAU. El plan no la cruza NUNCA. */
  examDate: string
  /**
   * Primer día de la ventana de repaso final: a partir de él no entra temario
   * nuevo. Sigue habiendo práctica y repaso — la reserva no es un vacío.
   */
  planningCutoff: string
  /** Días de estudio a la semana declarados (null = sin declarar, L-V). */
  weeklyStudyDays: number | null
  /** Minutos diarios declarados (null = sin declarar). */
  dailyMinutes: number | null
  /** Patrón semanal ya resuelto: 0 = lunes … 6 = domingo. */
  studyDayIndexes: number[]
  holidays: ReadonlySet<string>
  /**
   * El patrón declarado no dejaba NI UN día entre hoy y el examen, se propone disponibilidad excepcional. Solo se abre al aceptarla.
   *
   * Vive en el contexto —y no como un apaño dentro del generador— porque si
   * un paso abre los días y el siguiente sigue con el patrón original, el
   * segundo deshace al primero: el generador sembraba repaso en sábado y
   * domingo y la personalización, con el patrón L/X/V, los declaraba sin
   * sitio y dejaba el Camino vacío. La disponibilidad excepcional es del
   * ALUMNO, no de un paso.
   */
  emergencyAvailability: boolean
  emergencyAvailabilityAccepted: boolean
  /**
   * Días que el alumno pidió, cuando su acceso comercial no da para tantos.
   * El plan se calcula con el tope del acceso (`weeklyStudyDays`), pero lo
   * pedido viaja para poder DECIRLO en vez de recortar en silencio.
   */
  requestedWeeklyStudyDays?: number | null
  availabilityExceedsAccess?: boolean
  accessMaxStudyDaysPerWeek?: number
  accessLabel?: string
}

/** Opciones de disponibilidad listas para studyCapacity/planEngine. */
export function capacityOptionsFor(context: StudentPlanContext) {
  return {
    weeklyStudyDays: context.weeklyStudyDays,
    dailyMinutes: context.dailyMinutes,
    holidays: context.holidays,
  }
}

/**
 * Días de estudio REALES en los que se puede proponer trabajo nuevo, en orden.
 *
 * `limit` acota cuántos se devuelven; el corte por fecha de examen y por
 * ventana de repaso final no es opcional. Sustituye a los `getStudyDays(today,
 * 14 | 30 | 120)` sueltos, que no sabían nada del examen del alumno.
 */
export function planningDates(
  context: StudentPlanContext,
  options: { limit?: number; includeFinalReviewWindow?: boolean; from?: string } = {},
): string[] {
  const from = options.from && options.from > context.today ? options.from : context.today
  // El límite duro es SIEMPRE el examen; la ventana de repaso final se
  // respeta salvo que quien llame proponga trabajo que sí cabe ahí (práctica,
  // repaso, simulacro), no temario nuevo.
  const end = options.includeFinalReviewWindow ? context.examDate : context.planningCutoff
  const dates = studyDatesBetween(from, end, {
    weeklyStudyDays: context.weeklyStudyDays,
    holidays: context.holidays,
  })
  return options.limit != null ? dates.slice(0, Math.max(0, options.limit)) : dates
}

/**
 * Días de estudio que le quedan al alumno hasta su fecha objetivo, contando su
 * patrón semanal y sus festivos.
 *
 * Es la única medida honesta de "cuánto tiempo le queda": 40 días naturales
 * son 40 sesiones para quien estudia a diario y 11 para quien estudia dos días
 * por semana.
 */
export function studyDaysRemaining(context: StudentPlanContext): number {
  return studyDatesBetween(context.today, context.examDate, {
    weeklyStudyDays: context.weeklyStudyDays,
    holidays: context.holidays,
  }).length
}

/** ¿Cabe esta fecha dentro del plan del alumno? */
export function isWithinPlan(context: StudentPlanContext, dateStr: string): boolean {
  return dateStr < context.examDate
}

/** Versión pura, para tests y para quien ya tenga los datos leídos. */
export function buildStudentPlanContext(input: {
  today: string
  examDate: string
  weeklyStudyDays?: number | null
  dailyMinutes?: number | null
  holidays?: ReadonlySet<string>
  emergencyAvailabilityAccepted?: boolean
}): StudentPlanContext {
  const holidays = input.holidays ?? SPAIN_HOLIDAYS
  const declaredWeekly = input.weeklyStudyDays ?? null

  // ¿Le queda al alumno algún día de estudio con SU patrón antes del examen?
  // Con dos días a la semana y la prueba pasado mañana la respuesta puede ser
  // que no: entonces el patrón deja de mandar y valen todos los días que
  // quedan. Es esto o no darle plan ninguno.
  const hasOwnDays = studyDatesBetween(input.today, input.examDate, {
    weeklyStudyDays: declaredWeekly,
    holidays,
  }).length > 0
  const emergencyAvailability = !hasOwnDays && input.today < input.examDate
  const emergencyAvailabilityAccepted = emergencyAvailability && input.emergencyAvailabilityAccepted === true
  const weeklyStudyDays = emergencyAvailabilityAccepted ? 7 : declaredWeekly

  return {
    today: input.today,
    examDate: input.examDate,
    planningCutoff: planningCutoffDate(input.today, input.examDate, FINAL_REVIEW_RESERVED_STUDY_DAYS, {
      weeklyStudyDays,
      holidays,
    }),
    weeklyStudyDays,
    dailyMinutes: input.dailyMinutes ?? null,
    studyDayIndexes: studyDayIndexesFor(weeklyStudyDays),
    holidays,
    emergencyAvailability,
    emergencyAvailabilityAccepted,
  }
}
