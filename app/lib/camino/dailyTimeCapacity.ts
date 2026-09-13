export const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
export type DailyMinutes = typeof VALID_DAILY_MINUTES[number]

export type DailyMissionPlan = {
  count: number
  /** Sesiones de referencia de 25 min, solo para previsiones sin contenido. No es un límite del planificador. */
  slotMinutes: number[]
}

// El número de actividades reales depende de sus duraciones. Esta tabla
// solo conserva una estimación nominal para rotación y vistas sin cola.
const PLAN_BY_MINUTES: Record<number, DailyMissionPlan> = Object.fromEntries(
  VALID_DAILY_MINUTES.map(minutes => {
    const count = Math.max(1, Math.floor(minutes / 25))
    return [minutes, { count, slotMinutes: Array.from({ length: count }, () => 25) }]
  }),
)

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
  30: '30 min',
  45: '45 min',
  60: '1 hora',
  90: '1 h 30 min',
  150: '2 h 30 min',
  180: '3 horas',
}

export function dailyMinutesLabel(dailyMinutes: number | null | undefined): string {
  if (dailyMinutes != null && DAILY_MINUTES_LABELS[dailyMinutes]) return DAILY_MINUTES_LABELS[dailyMinutes]
  return `${dailyMinutes ?? 60} min`
}

export function describeDailyPlan(dailyMinutes: number | null | undefined): string {
  return `Tu presupuesto es de ${dailyMinutes ?? 60} min al día. El número de actividades depende de lo que dure cada una; las más cortas dejan sitio para avanzar más.`
}
