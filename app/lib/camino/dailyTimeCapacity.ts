// Single source of truth for turning a student's declared daily study time
// into how many main missions Camino generates for a day and how many
// minutes each one should target.
//
// Before this existed, every layer of the pipeline (the initial onboarding
// seed, the daily ensureCaminoCalendar fill, the after-the-fact
// applyCalendarPersonalization pass, and the client-side local preview)
// independently hardcoded its own cap — mostly "1 or 2 missions, ~25-60 min
// each" — regardless of what the student actually declared. A student who
// said "2-3 horas" (150 min) still only ever got up to ~90 min of content,
// and the very first seed (onboarding/generate) created exactly one mission
// per day no matter what, so in practice a lot of students just saw a
// single ~25 min mission. Every layer must use this table so "150 min/day"
// means the same thing everywhere.

export const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
export type DailyMinutes = typeof VALID_DAILY_MINUTES[number]

export type DailyMissionPlan = {
  count: number
  /** Target minutes per slot, index 0 = first/main mission of the day. Sums to the declared minutes. */
  slotMinutes: number[]
}

const PLAN_BY_MINUTES: Record<number, DailyMissionPlan> = {
  30: { count: 1, slotMinutes: [30] },
  45: { count: 1, slotMinutes: [45] },
  60: { count: 2, slotMinutes: [35, 25] },
  90: { count: 2, slotMinutes: [50, 40] },
  150: { count: 3, slotMinutes: [55, 50, 45] },
  180: { count: 4, slotMinutes: [50, 45, 45, 40] },
}

const DEFAULT_PLAN = PLAN_BY_MINUTES[60]

export function missionPlanForMinutes(dailyMinutes: number | null | undefined): DailyMissionPlan {
  if (dailyMinutes != null && PLAN_BY_MINUTES[dailyMinutes]) return PLAN_BY_MINUTES[dailyMinutes]
  return DEFAULT_PLAN
}

export function missionsPerDayForMinutes(dailyMinutes: number | null | undefined): number {
  return missionPlanForMinutes(dailyMinutes).count
}

export function estimatedMinutesForSlot(dailyMinutes: number | null | undefined, slot: number): number {
  const plan = missionPlanForMinutes(dailyMinutes)
  return plan.slotMinutes[slot] ?? plan.slotMinutes[plan.slotMinutes.length - 1] ?? 25
}

// Etiqueta en rango de tiempo (la que usa el selector de Onboarding) para
// cada valor válido de dailyMinutes — única fuente de verdad para ese texto,
// así el picker de Onboarding y el guardado desde Ajustes (que antes dejaba
// el campo de texto "daily_study_time" con el valor de cuando se hizo el
// onboarding, desincronizado del número real tras cualquier cambio
// posterior en Ajustes) siempre coinciden.
export const DAILY_MINUTES_LABELS: Record<number, string> = {
  30: '15-30 min',
  45: '30-45 min',
  60: '45-60 min',
  90: '1-2 horas',
  150: '2-3 horas',
  180: 'Más de 3 horas',
}

export function dailyMinutesLabel(dailyMinutes: number | null | undefined): string {
  if (dailyMinutes != null && DAILY_MINUTES_LABELS[dailyMinutes]) return DAILY_MINUTES_LABELS[dailyMinutes]
  return `${dailyMinutes ?? 60} min`
}

// Explica en una frase qué implica en la práctica elegir ese tiempo diario —
// calculado a partir del mismo PLAN_BY_MINUTES que de verdad genera las
// misiones, para que el texto nunca pueda desincronizarse de lo que Camino
// realmente hace con ese valor.
export function describeDailyPlan(dailyMinutes: number | null | undefined): string {
  const plan = missionPlanForMinutes(dailyMinutes)
  if (plan.count === 1) {
    return `Kairo te genera 1 misión de ~${plan.slotMinutes[0]} min al día — una sesión corta y directa al grano.`
  }
  const minutesList = plan.slotMinutes.join(' + ')
  return `Kairo te genera ${plan.count} misiones al día (~${minutesList} min) — sesiones más largas y completas para cubrir más contenido de una sentada.`
}
