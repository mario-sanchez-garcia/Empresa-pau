// Canonical, client-safe commercial catalogue for Kairo.
//
// This module contains no Stripe secrets and can be imported from Server or
// Client Components. Product UI, checkout allowlists and backend enforcement
// derive from these definitions so prices, availability and limits cannot
// silently drift apart.

export type CommercialPlanId = 'free' | 'premium' | 'curso_pau' | 'intensivo' | 'superpremium'
export type CheckoutPlanId = 'premium' | 'pack_curso_pau'
export type PlanAvailability = 'public' | 'entitlement_only'
export type BillingPeriod = 'free' | 'monthly' | 'one_time' | 'fixed_term'

export interface CanonicalPlanLimits {
  correctionsPerMonth: number
  photosPerMonth: number
  partialsPerMonth: number
  fullMocksPerMonth: number
  caminoMode: 'limited' | 'complete' | 'intensive'
  maxStudyDaysPerWeek: number
  includeBonusMissions: boolean
  maxFlashcardsPerDeck: number
}

export interface PlanDefinition {
  id: CommercialPlanId
  persistentIds: readonly string[]
  name: string
  commercialName: string
  valueProposition: string
  description: string
  billingPeriod: BillingPeriod
  basePriceCents: number
  monthlyEquivalentCents: number
  durationMonths: number | null
  checkoutPlanId: CheckoutPlanId | null
  stripePriceId: null
  stripePricingMode: 'none' | 'inline_price_data'
  availability: PlanAvailability
  highlighted: boolean
  displayOrder: number
  limits: CanonicalPlanLimits
  caminoLabel: string
  orientationLabel: string
  rankingLabel: string
  reasonableUse: boolean
}

const COMMON_INCLUDED = {
  orientationLabel: 'Orientación de Madrid y Cataluña',
  rankingLabel: 'Ranking completo',
} as const

export const PLAN_DEFINITIONS: Record<CommercialPlanId, PlanDefinition> = {
  free: {
    id: 'free',
    persistentIds: ['free'],
    name: 'Free',
    commercialName: 'Free',
    valueProposition: 'Descubre cómo estudias mejor con Kairo.',
    description: 'Empieza con correcciones reales, Orientación y un Camino sencillo sin introducir una tarjeta.',
    billingPeriod: 'free',
    basePriceCents: 0,
    monthlyEquivalentCents: 0,
    durationMonths: null,
    checkoutPlanId: null,
    stripePriceId: null,
    stripePricingMode: 'none',
    availability: 'public',
    highlighted: false,
    displayOrder: 1,
    limits: {
      correctionsPerMonth: 25,
      photosPerMonth: 3,
      partialsPerMonth: 1,
      fullMocksPerMonth: 0,
      caminoMode: 'limited',
      maxStudyDaysPerWeek: 2,
      includeBonusMissions: false,
      maxFlashcardsPerDeck: 15,
    },
    caminoLabel: 'Camino esencial · hasta 2 días por semana',
    ...COMMON_INCLUDED,
    reasonableUse: false,
  },
  premium: {
    id: 'premium',
    persistentIds: ['premium', 'premium_monthly', 'mensual'],
    name: 'Premium',
    commercialName: 'Premium mensual',
    valueProposition: 'Tu preparación completa durante todo el curso.',
    description: 'Más práctica, un Camino completo y margen suficiente para mejorar cada semana.',
    billingPeriod: 'monthly',
    basePriceCents: 999,
    monthlyEquivalentCents: 999,
    durationMonths: 1,
    checkoutPlanId: 'premium',
    stripePriceId: null,
    stripePricingMode: 'inline_price_data',
    availability: 'public',
    highlighted: true,
    displayOrder: 2,
    limits: {
      correctionsPerMonth: 200,
      photosPerMonth: 80,
      partialsPerMonth: 12,
      fullMocksPerMonth: 5,
      caminoMode: 'complete',
      maxStudyDaysPerWeek: 6,
      includeBonusMissions: true,
      maxFlashcardsPerDeck: 40,
    },
    caminoLabel: 'Camino completo · hasta 6 días por semana',
    ...COMMON_INCLUDED,
    reasonableUse: false,
  },
  curso_pau: {
    id: 'curso_pau',
    persistentIds: ['curso_pau', 'pack_curso_pau', 'curso_pau_early', 'curso_pau_normal'],
    name: 'Curso PAU',
    commercialName: 'Curso PAU',
    valueProposition: 'Un solo pago para llegar acompañado hasta junio.',
    description: 'Incluye la experiencia Premium hasta el final del curso, sin renovación mensual.',
    billingPeriod: 'one_time',
    basePriceCents: 7900,
    monthlyEquivalentCents: 790,
    durationMonths: null,
    checkoutPlanId: 'pack_curso_pau',
    stripePriceId: null,
    stripePricingMode: 'inline_price_data',
    availability: 'public',
    highlighted: false,
    displayOrder: 3,
    limits: {
      correctionsPerMonth: 200,
      photosPerMonth: 80,
      partialsPerMonth: 12,
      fullMocksPerMonth: 5,
      caminoMode: 'complete',
      maxStudyDaysPerWeek: 6,
      includeBonusMissions: true,
      maxFlashcardsPerDeck: 40,
    },
    caminoLabel: 'Camino completo · hasta 6 días por semana',
    ...COMMON_INCLUDED,
    reasonableUse: false,
  },
  intensivo: {
    id: 'intensivo',
    persistentIds: ['intensivo', 'intensivo_pau'],
    name: 'Intensivo',
    commercialName: 'Intensivo PAU',
    valueProposition: 'Compatibilidad para sprints de preparación ya asignados.',
    description: 'El backend conserva sus límites, pero no existe una compra pública operativa.',
    billingPeriod: 'fixed_term',
    basePriceCents: 1999,
    monthlyEquivalentCents: 667,
    durationMonths: 3,
    checkoutPlanId: null,
    stripePriceId: null,
    stripePricingMode: 'none',
    availability: 'entitlement_only',
    highlighted: false,
    displayOrder: 4,
    limits: {
      correctionsPerMonth: 150,
      photosPerMonth: 60,
      partialsPerMonth: 12,
      fullMocksPerMonth: 6,
      caminoMode: 'intensive',
      maxStudyDaysPerWeek: 6,
      includeBonusMissions: true,
      maxFlashcardsPerDeck: 40,
    },
    caminoLabel: 'Camino intensivo · hasta 6 días por semana',
    ...COMMON_INCLUDED,
    reasonableUse: false,
  },
  superpremium: {
    id: 'superpremium',
    persistentIds: ['superpremium', 'super_premium'],
    name: 'Superpremium',
    commercialName: 'Superpremium',
    valueProposition: 'Compatibilidad para accesos intensivos ya concedidos.',
    description: 'El backend conserva sus límites, pero no existe una compra pública operativa.',
    billingPeriod: 'monthly',
    basePriceCents: 1799,
    monthlyEquivalentCents: 1799,
    durationMonths: 1,
    checkoutPlanId: null,
    stripePriceId: null,
    stripePricingMode: 'none',
    availability: 'entitlement_only',
    highlighted: false,
    displayOrder: 5,
    limits: {
      correctionsPerMonth: 600,
      photosPerMonth: 200,
      partialsPerMonth: 20,
      fullMocksPerMonth: 20,
      caminoMode: 'complete',
      maxStudyDaysPerWeek: 7,
      includeBonusMissions: true,
      maxFlashcardsPerDeck: 60,
    },
    caminoLabel: 'Camino completo · hasta 7 días por semana',
    ...COMMON_INCLUDED,
    reasonableUse: true,
  },
}

export const PUBLIC_PLAN_IDS = ['free', 'premium', 'curso_pau'] as const satisfies readonly CommercialPlanId[]
export const ENTITLEMENT_ONLY_PLAN_IDS = ['intensivo', 'superpremium'] as const satisfies readonly CommercialPlanId[]
export const PURCHASABLE_CHECKOUT_PLAN_IDS = ['premium', 'pack_curso_pau'] as const satisfies readonly CheckoutPlanId[]
export const DEFAULT_CHECKOUT_PLAN_ID: CheckoutPlanId = 'pack_curso_pau'
export const PRICING_PATH = '/precios'

export const CURSO_PAU_EARLY_PRICE_CENTS = 5900
export const CURSO_PAU_STANDARD_PRICE_CENTS = 7900
// Historical presentation reference retained for compatibility. It is never
// shown after the founding period and is not a Stripe price.
export const CURSO_PAU_FOMO_REFERENCE_PRICE_CENTS = 6900

export function formatEur(cents: number): string {
  const value = cents / 100
  const hasDecimals = cents % 100 !== 0
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`
}

export function getFoundingDeadline(): Date {
  const raw = process.env.FOUNDING_DEADLINE_DATE ?? '2026-09-01'
  return new Date(`${raw}T00:00:00Z`)
}

export function isCursoPauEarlyPeriod(now: Date = new Date()): boolean {
  return now.getTime() < getFoundingDeadline().getTime()
}

export function getCursoPauPriceCents(now: Date = new Date()): number {
  return isCursoPauEarlyPeriod(now)
    ? CURSO_PAU_EARLY_PRICE_CENTS
    : CURSO_PAU_STANDARD_PRICE_CENTS
}

export function getPriceLockDeadlineLabel(): string {
  return getFoundingDeadline().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid',
  })
}

export function getPlanDefinition(id: CommercialPlanId): PlanDefinition {
  return PLAN_DEFINITIONS[id]
}

export function getPlanDefinitionByCheckoutId(planId: string | null | undefined): PlanDefinition | null {
  if (!planId) return null
  return Object.values(PLAN_DEFINITIONS).find((plan) => plan.checkoutPlanId === planId) ?? null
}

export function isPurchasableCheckoutPlanId(planId: string | null | undefined): planId is CheckoutPlanId {
  return Boolean(planId && (PURCHASABLE_CHECKOUT_PLAN_IDS as readonly string[]).includes(planId))
}

export function getPlanPriceCents(id: CommercialPlanId, now: Date = new Date()): number {
  return id === 'curso_pau' ? getCursoPauPriceCents(now) : PLAN_DEFINITIONS[id].basePriceCents
}

export function getPlanPriceDisplay(id: CommercialPlanId, now: Date = new Date()): string {
  return formatEur(getPlanPriceCents(id, now))
}

export function normalizeCommercialPlanId(planId?: string | null): CommercialPlanId {
  const normalized = (planId ?? '').trim().toLowerCase()
  for (const plan of Object.values(PLAN_DEFINITIONS)) {
    if (plan.persistentIds.includes(normalized)) return plan.id
  }
  // Preserve compatibility with historical free-form IDs stored before the
  // catalogue existed. Unknown IDs remain least-privilege Free.
  if (normalized.includes('super')) return 'superpremium'
  if (normalized.includes('intensivo')) return 'intensivo'
  if (normalized.includes('curso') || normalized.includes('pack_curso')) return 'curso_pau'
  if (normalized.includes('premium') || normalized.includes('mensual')) return 'premium'
  return 'free'
}

export interface PublicPlanView extends PlanDefinition {
  priceCents: number
  priceDisplay: string
  periodDisplay: string
  ctaLabel: string
  ctaHref: string
  highlights: string[]
}

function getPeriodDisplay(plan: PlanDefinition): string {
  if (plan.billingPeriod === 'free') return 'Para siempre · sin tarjeta'
  if (plan.billingPeriod === 'monthly') return 'al mes · renovación mensual'
  if (plan.billingPeriod === 'fixed_term') return `por ${plan.durationMonths ?? 3} meses · pago único`
  return 'pago único · acceso hasta el 30 de junio'
}

export function getPlanFeatureLabels(id: CommercialPlanId): string[] {
  const plan = PLAN_DEFINITIONS[id]
  const limits = plan.limits
  const simulationLabel = limits.fullMocksPerMonth > 0
    ? `${limits.fullMocksPerMonth} simulacros completos/mes`
    : `${limits.partialsPerMonth} práctica parcial/mes`
  return [
    `${limits.correctionsPerMonth} correcciones/mes`,
    `${limits.photosPerMonth} fotos/mes`,
    simulationLabel,
    plan.caminoLabel,
    plan.orientationLabel,
    plan.rankingLabel,
  ]
}

export function getPublicPlanDefinitions(now: Date = new Date()): PublicPlanView[] {
  return PUBLIC_PLAN_IDS
    .map((id) => PLAN_DEFINITIONS[id])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((plan) => ({
      ...plan,
      priceCents: getPlanPriceCents(plan.id, now),
      priceDisplay: getPlanPriceDisplay(plan.id, now),
      periodDisplay: getPeriodDisplay(plan),
      ctaLabel: plan.id === 'free' ? 'Empezar gratis' : `Elegir ${plan.name}`,
      ctaHref: plan.id === 'free'
        ? '/onboarding'
        : `/checkout?plan=${encodeURIComponent(plan.checkoutPlanId ?? '')}`,
      highlights: getPlanFeatureLabels(plan.id),
    }))
}

// Backwards-compatible view for older imports. New UI should consume
// getPublicPlanDefinitions or PLAN_DEFINITIONS directly.
export interface PlanCopy {
  id: CommercialPlanId
  label: string
  periodDisplay: string
  description: string
  features: string[]
}

export const PLAN_COPY: Record<CommercialPlanId, PlanCopy> = Object.fromEntries(
  (Object.keys(PLAN_DEFINITIONS) as CommercialPlanId[]).map((id) => {
    const plan = PLAN_DEFINITIONS[id]
    return [id, {
      id,
      label: plan.name,
      periodDisplay: getPeriodDisplay(plan),
      description: plan.description,
      features: getPlanFeatureLabels(id),
    }]
  })
) as Record<CommercialPlanId, PlanCopy>

export const WAITLIST_REFERRAL_TIERS = [
  { minReferrals: 3, priceCents: 3900 },
  { minReferrals: 1, priceCents: 4900 },
  { minReferrals: 0, priceCents: CURSO_PAU_EARLY_PRICE_CENTS },
] as const

export function getWaitlistPriceCents(referralCount: number): number {
  const tier = WAITLIST_REFERRAL_TIERS.find((item) => referralCount >= item.minReferrals)
  return tier?.priceCents ?? CURSO_PAU_EARLY_PRICE_CENTS
}
