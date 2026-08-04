export type CaminoPlanId = 'free' | 'premium' | 'curso_pau' | 'intensivo' | 'superpremium'

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

export const CAMINO_PLAN_LIMITS: Record<CaminoPlanId, CaminoPlanLimits> = {
  free: {
    id: 'free',
    label: 'Free',
    monthlyPriceEur: 0,
    correctionsPerMonth: 25,
    photosPerMonth: 3,
    partialsPerMonth: 1,
    fullMocksPerMonth: 0,
    caminoMode: 'limited',
    maxStudyDaysPerWeek: 2,
    includeBonusMissions: false,
    variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    maxFlashcardsPerDeck: 15,
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    monthlyPriceEur: 9.99,
    correctionsPerMonth: 200,
    photosPerMonth: 80,
    partialsPerMonth: 12,
    fullMocksPerMonth: 5,
    caminoMode: 'complete',
    maxStudyDaysPerWeek: 6,
    includeBonusMissions: true,
    variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    maxFlashcardsPerDeck: 40,
  },
  curso_pau: {
    id: 'curso_pau',
    label: 'Curso PAU',
    monthlyPriceEur: 7.9,
    correctionsPerMonth: 200,
    photosPerMonth: 80,
    partialsPerMonth: 12,
    fullMocksPerMonth: 5,
    caminoMode: 'complete',
    maxStudyDaysPerWeek: 6,
    includeBonusMissions: true,
    variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    maxFlashcardsPerDeck: 40,
  },
  intensivo: {
    id: 'intensivo',
    label: 'Intensivo',
    monthlyPriceEur: 6.67,
    correctionsPerMonth: 150,
    photosPerMonth: 60,
    partialsPerMonth: 12,
    fullMocksPerMonth: 6,
    caminoMode: 'intensive',
    maxStudyDaysPerWeek: 6,
    includeBonusMissions: true,
    variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    maxFlashcardsPerDeck: 40,
  },
  superpremium: {
    id: 'superpremium',
    label: 'Superpremium',
    monthlyPriceEur: 17.99,
    correctionsPerMonth: 600,
    photosPerMonth: 200,
    partialsPerMonth: 20,
    fullMocksPerMonth: 20,
    caminoMode: 'complete',
    maxStudyDaysPerWeek: 7,
    includeBonusMissions: true,
    variableMarginFloor: CAMINO_VARIABLE_MARGIN_FLOOR,
    maxFlashcardsPerDeck: 60,
  },
}

export function normalizeCaminoPlanId(planId?: string | null): CaminoPlanId {
  const normalized = (planId ?? '').toLowerCase()
  if (normalized.includes('super')) return 'superpremium'
  if (normalized.includes('intensivo')) return 'intensivo'
  if (normalized.includes('curso') || normalized.includes('pack_curso')) return 'curso_pau'
  if (normalized.includes('premium') || normalized.includes('mensual')) return 'premium'
  return 'free'
}

export function getCaminoPlanLimits(planId?: string | null) {
  return CAMINO_PLAN_LIMITS[normalizeCaminoPlanId(planId)]
}

export function monthlyToWeeklyLimit(monthlyLimit: number) {
  return Math.max(0, Math.floor(monthlyLimit / 4))
}
