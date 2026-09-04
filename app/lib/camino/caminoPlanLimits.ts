import {
  PLAN_DEFINITIONS,
  normalizeCommercialPlanId,
  type CommercialPlanId,
} from '../pricing.ts'

export type CaminoPlanId = CommercialPlanId

export type CaminoPlanLimits = {
  id: CaminoPlanId
  label: string
  monthlyPriceEur: number
  correctionsPerMonth: number
  photosPerMonth: number
  partialsPerMonth: number
  fullMocksPerMonth: number
  caminoMode: 'limited' | 'complete' | 'intensive'
  maxStudyDaysPerWeek: number
  includeBonusMissions: boolean
  variableMarginFloor: 0.2
  maxFlashcardsPerDeck: number
}

export const CAMINO_VARIABLE_MARGIN_FLOOR = 0.2

// Enforcement consumes the same typed limits that power pricing copy. This
// adapter keeps the historical Camino API stable for every existing caller.
export const CAMINO_PLAN_LIMITS = Object.fromEntries(
  (Object.keys(PLAN_DEFINITIONS) as CaminoPlanId[]).map((id) => {
    const plan = PLAN_DEFINITIONS[id]
    return [id, {
      id,
      label: plan.name,
      monthlyPriceEur: plan.monthlyEquivalentCents / 100,
      ...plan.limits,
      variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    } satisfies CaminoPlanLimits]
  })
) as Record<CaminoPlanId, CaminoPlanLimits>

export function normalizeCaminoPlanId(planId?: string | null): CaminoPlanId {
  return normalizeCommercialPlanId(planId)
}

export function getCaminoPlanLimits(planId?: string | null): CaminoPlanLimits {
  return CAMINO_PLAN_LIMITS[normalizeCaminoPlanId(planId)]
}

export function monthlyToWeeklyLimit(monthlyLimit: number) {
  return Math.max(0, Math.floor(monthlyLimit / 4))
}
