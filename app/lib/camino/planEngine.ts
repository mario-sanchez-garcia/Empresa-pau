// Motor ÚNICO de decisiones de plan, compartido por servidor y cliente.
//
// El problema que resuelve: hasta ahora la generación inicial
// (generateCaminoPlan), la extensión diaria (ensureCaminoCalendar) y la
// previsión local del navegador (generateCalendar en CaminoCalendarClient)
// decidían por separado qué asignatura toca cada día, cuántas misiones caben
// y hasta dónde llega el plan. Con reglas distintas:
//
//  - El servidor rotaba por día de la semana; el cliente por un contador
//    propio con pesos de examen y bonus de Orientación que el servidor ni
//    siquiera importaba. Una recomendación de Orientación cambiaba la vista
//    previa pero NO las misiones persistidas.
//  - El servidor descontaba festivos; el cliente no.
//  - El cliente no sabía nada de la fecha de la PAU, así que su previsión
//    seguía proponiendo semanas más allá del examen.
//
// Resultado: lo que el alumno veía a dos semanas vista podía no parecerse a
// lo que luego se persistía, y podía variar entre dispositivos.
//
// Este módulo NO genera títulos ni contenidos: decide la ESTRUCTURA del plan
// (qué días, qué asignatura, cuántas misiones, hasta cuándo). Servidor y
// cliente construyen encima lo suyo, pero sobre las mismas decisiones.
//
// Es puro: sin Supabase, sin localStorage, sin `window`. Por eso puede correr
// en los dos lados y comprobarse en aislamiento.

import { missionPlanForMinutes } from './dailyTimeCapacity.ts'
import { rotateSubjectForDay } from './subjectRotation.ts'
import { planningCutoffDate, studyDatesBetween } from './studyCapacity.ts'

/**
 * Versión del motor. Va estampada en cada día que produce, para que una
 * previsión generada por una versión antigua del cliente sea distinguible de
 * lo que el servidor persiste hoy.
 */
export const PLAN_ENGINE_VERSION = 'plan_engine_v1'

export type PlanDayOrigin =
  /** Persistido por el servidor: idéntico en cualquier dispositivo. */
  | 'server'
  /** Previsión calculada: orientativa, puede cambiar. Siempre etiquetada como tal en la interfaz. */
  | 'forecast'

export type PlanDay = {
  date: string
  /** Asignatura que le toca, o null si ese día no entra en el plan. */
  subject: string | null
  /** Cuántas misiones principales caben ese día. */
  missionSlots: number
  /** Minutos objetivo de cada hueco. */
  slotMinutes: number[]
  origin: PlanDayOrigin
  planVersion: string
  /** Por qué el día quedó fuera del plan, cuando `subject` es null. */
  excludedReason?: 'after_exam' | 'final_review_window' | 'not_study_day' | 'no_subject_available'
}

export type PlanRequest = {
  /** Primer día a planificar (inclusive). */
  from: string
  /** Último día a planificar (inclusive). */
  to: string
  /** Fecha objetivo de la PAU — el plan no la cruza nunca. */
  examDate: string
  /** Asignaturas activas, en el orden de arranque de la rotación. */
  subjects: string[]
  weeklyStudyDays?: number | null
  dailyMinutes?: number | null
  holidays?: ReadonlySet<string>
  /** Días de estudio reservados al repaso final antes del examen. */
  reservedFinalStudyDays?: number
  /** Asignaturas con examen ese día concreto (fecha → slugs): ganan a la rotación. */
  examSubjectsByDate?: ReadonlyMap<string, string[]>
  /**
   * Peso extra de rotación por asignatura (examen próximo, prioridad de
   * Orientación…). Un peso de 2 hace que la asignatura aparezca el doble.
   * Vive aquí, y no solo en el cliente, para que la misma señal que mueve la
   * vista previa mueva también lo que el servidor persiste.
   */
  rotationWeights?: Readonly<Record<string, number>>
  /** ¿Le queda temario a esta asignatura? Un día no se pierde por que a la elegida no le quede cola. */
  hasWork?: (subject: string) => boolean
  origin: PlanDayOrigin
}

function addDays(dateStr: string, n: number): string {
  return new Date(Date.parse(`${dateStr}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10)
}

/**
 * Expande las asignaturas según su peso de rotación, conservando el orden.
 * Una asignatura con peso 3 ocupa tres posiciones, así que la rotación cae en
 * ella tres veces más a menudo — sin sacar a ninguna otra del reparto.
 */
export function weightedRotationOrder(
  subjects: string[],
  weights: Readonly<Record<string, number>> = {},
): string[] {
  const pool: string[] = []
  for (const subject of subjects) {
    const weight = Math.max(1, Math.floor(weights[subject] ?? 1))
    for (let i = 0; i < weight; i++) pool.push(subject)
  }
  return pool.length > 0 ? pool : subjects
}

/**
 * El plan, día a día. Misma respuesta en servidor y cliente para las mismas
 * entradas — que es justamente lo que no ocurría antes.
 */
export function buildPlanDays(request: PlanRequest): PlanDay[] {
  const {
    from, to, examDate, subjects,
    weeklyStudyDays = null, dailyMinutes = null, holidays,
    reservedFinalStudyDays = 0, examSubjectsByDate, rotationWeights, hasWork,
    origin,
  } = request

  const plan = missionPlanForMinutes(dailyMinutes)
  const cutoff = reservedFinalStudyDays > 0
    ? planningCutoffDate(from, examDate, reservedFinalStudyDays, { weeklyStudyDays, holidays })
    : examDate

  // Días de estudio reales dentro de la ventana pedida.
  const windowEnd = addDays(to, 1) // studyDatesBetween excluye el final
  const studyDates = new Set(studyDatesBetween(from, windowEnd, { weeklyStudyDays, holidays }))

  const rotationOrder = weightedRotationOrder(subjects, rotationWeights)

  const days: PlanDay[] = []
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const base = { date, missionSlots: 0, slotMinutes: [] as number[], origin, planVersion: PLAN_ENGINE_VERSION }

    if (date >= examDate) {
      days.push({ ...base, subject: null, excludedReason: 'after_exam' })
      continue
    }
    // El orden importa: un fin de semana dentro de la ventana de repaso final
    // es un día no lectivo, no un día de repaso reservado. Etiquetarlo al
    // revés inflaría la reserva con días que nunca iban a usarse.
    if (!studyDates.has(date)) {
      days.push({ ...base, subject: null, excludedReason: 'not_study_day' })
      continue
    }
    if (date >= cutoff) {
      // Ventana de repaso final: no entra temario nuevo, pero el día existe.
      days.push({ ...base, subject: null, excludedReason: 'final_review_window' })
      continue
    }

    const subject = rotateSubjectForDay(date, rotationOrder, {
      priority: examSubjectsByDate?.get(date),
      hasWork,
    })
    if (!subject) {
      days.push({ ...base, subject: null, excludedReason: 'no_subject_available' })
      continue
    }

    days.push({
      date,
      subject,
      missionSlots: plan.count,
      slotMinutes: plan.slotMinutes,
      origin,
      planVersion: PLAN_ENGINE_VERSION,
    })
  }

  return days
}

/** ¿Es este día una previsión (orientativa) y no plan confirmado? */
export function isForecastDay(day: Pick<PlanDay, 'origin'>): boolean {
  return day.origin === 'forecast'
}
