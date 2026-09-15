export const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
export type DailyMinutes = typeof VALID_DAILY_MINUTES[number]

export type DailyMissionPlan = {
  count: number
  /** Sesiones que SUMAN el presupuesto del día. No es un límite del planificador. */
  slotMinutes: number[]
}

// Duración a la que se aspira para una sesión de estudio sin duración medida.
// No es la misión de referencia de XP (REFERENCE_MISSION_MINUTES, 25 min): esa
// es el ancla de la escala de puntos y no debe moverse. Esta es la diana del
// TAMAÑO de sesión, y existe para que las sesiones puedan embaldosar el día.
export const SESSION_TARGET_MINUTES = 30

/**
 * Reparte el presupuesto del día en sesiones que lo suman EXACTO.
 *
 * Antes la sesión era una constante de 25 min y el día un presupuesto suelto,
 * así que casi ningún presupuesto se dejaba embaldosar: con 60 min al día
 * entraban dos sesiones (50 min) y los 10 minutos restantes no le valían a
 * nadie, porque nada duraba menos. Diez minutos al día sobre un curso entero
 * son ~38 h que la previsión contaba como "no cabe" cuando en realidad era
 * "no encaja". El reparto desigual (45 min -> 23 + 22) es deliberado: preferimos
 * un minuto de diferencia entre sesiones a un minuto tirado del día.
 */
export function sessionSlotsForMinutes(dailyMinutes: number): number[] {
  const budget = Math.max(1, Math.round(dailyMinutes))
  const count = Math.max(1, Math.round(budget / SESSION_TARGET_MINUTES))
  const base = Math.floor(budget / count)
  const remainder = budget - base * count
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0))
}

/**
 * Duración de UNA sesión de estudio sin duración propia medida, para este
 * presupuesto diario. Es la más corta del reparto: usar la más larga haría que
 * la última sesión del día no cupiera en el resto que queda.
 */
export function sessionMinutesForMinutes(dailyMinutes: number | null | undefined): number {
  const slots = sessionSlotsForMinutes(dailyMinutes ?? 60)
  return slots[slots.length - 1]
}

const PLAN_BY_MINUTES: Record<number, DailyMissionPlan> = Object.fromEntries(
  VALID_DAILY_MINUTES.map(minutes => {
    const slotMinutes = sessionSlotsForMinutes(minutes)
    return [minutes, { count: slotMinutes.length, slotMinutes }]
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
