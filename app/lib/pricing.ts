// Single source of truth for Kairo pricing: el precio único de Curso PAU,
// la escalera de precio por referidos de la waitlist, y el copy de planes
// que se muestra en /pricing, /landing y /waitlist.
//
// Seguro de importar desde cliente o servidor: no contiene secretos.
// Los límites numéricos (correcciones/fotos/simulacros) siguen viviendo en
// app/lib/camino/caminoPlanLimits.ts (fuente de verdad para el gating de
// negocio) — este archivo solo compone copy a partir de esos números, no
// los duplica a mano.
//
// Regla de copy: nunca escribir "ilimitado" ni "sin límites" para ningún
// plan. Usar siempre "uso intensivo" o "política de uso razonable".

import { CAMINO_PLAN_LIMITS, type CaminoPlanId } from '@/app/lib/camino/caminoPlanLimits'

export function formatEur(cents: number): string {
  const value = cents / 100
  const hasDecimals = cents % 100 !== 0
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })} €`
}

// ---- Curso PAU (pago único) — el único plan con checkout Stripe real ----
export const CURSO_PAU_EARLY_PRICE_CENTS = 5900    // 59 €, precio fundador
export const CURSO_PAU_STANDARD_PRICE_CENTS = 7900 // 79 €, precio estándar tras la fecha límite

// ISO date string. Configurable vía env var; por defecto 2026-09-01.
export function getFoundingDeadline(): Date {
  const raw = process.env.FOUNDING_DEADLINE_DATE ?? '2026-09-01'
  return new Date(raw + 'T00:00:00Z')
}

export function getCursoPauPriceCents(): number {
  return Date.now() < getFoundingDeadline().getTime()
    ? CURSO_PAU_EARLY_PRICE_CENTS
    : CURSO_PAU_STANDARD_PRICE_CENTS
}

// ---- Precio estático del resto de planes (en céntimos) ----
const STATIC_PLAN_PRICE_CENTS: Partial<Record<CaminoPlanId, number>> = {
  free: 0,
  premium: 999,
  intensivo: 1999,
  superpremium: 1799,
}

export function getPlanPriceCents(id: CaminoPlanId): number {
  if (id === 'curso_pau') return getCursoPauPriceCents()
  return STATIC_PLAN_PRICE_CENTS[id] ?? 0
}

export function getPlanPriceDisplay(id: CaminoPlanId): string {
  return formatEur(getPlanPriceCents(id))
}

// ---- Waitlist: precio bloqueado que baja con referidos, anclado al precio Early ----
export const WAITLIST_REFERRAL_TIERS = [
  { minReferrals: 3, priceCents: 3900 },
  { minReferrals: 1, priceCents: 4900 },
  { minReferrals: 0, priceCents: CURSO_PAU_EARLY_PRICE_CENTS },
] as const

export function getWaitlistPriceCents(referralCount: number): number {
  const tier = WAITLIST_REFERRAL_TIERS.find((t) => referralCount >= t.minReferrals)
  return tier?.priceCents ?? CURSO_PAU_EARLY_PRICE_CENTS
}

// ---- Copy por plan (label, periodo, descripción, features) ----
// Los números de cada feature vienen de CAMINO_PLAN_LIMITS — un solo lugar
// define cuántas correcciones/fotos/simulacros tiene cada plan.

const RANKING_LABEL: Record<CaminoPlanId, string> = {
  free: 'Preview de ranking',
  premium: 'Ranking completo',
  curso_pau: 'Ranking completo',
  intensivo: 'Ranking completo',
  superpremium: 'Ranking avanzado',
}

const CAMINO_MODE_LABEL: Record<CaminoPlanId, string> = {
  free: 'Camino PAU limitado',
  premium: 'Camino PAU completo',
  curso_pau: 'Camino PAU completo',
  intensivo: 'Camino PAU intensivo',
  superpremium: 'Camino PAU avanzado',
}

function planFeatures(id: CaminoPlanId): string[] {
  const l = CAMINO_PLAN_LIMITS[id]
  const mockOrPartial =
    l.fullMocksPerMonth > 0
      ? `${l.fullMocksPerMonth} simulacros/mes`
      : `${l.partialsPerMonth} parcial${l.partialsPerMonth === 1 ? '' : 'es'}/mes`

  const features = [
    `${l.correctionsPerMonth} correcciones/mes`,
    `${l.photosPerMonth} fotos/mes`,
    mockOrPartial,
    CAMINO_MODE_LABEL[id],
    RANKING_LABEL[id],
  ]

  if (id === 'superpremium') {
    features.push('Uso intensivo con política de uso razonable')
  }

  return features
}

export interface PlanCopy {
  id: CaminoPlanId
  label: string
  periodDisplay: string
  description: string
  features: string[]
}

export const PLAN_COPY: Record<CaminoPlanId, PlanCopy> = {
  free: {
    id: 'free',
    label: 'Free',
    periodDisplay: 'sin tarjeta de crédito',
    description: 'Para probar Kairo y vivir el momento mágico de tu primera corrección.',
    features: planFeatures('free'),
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    periodDisplay: '/mes · cancela cuando quieras',
    description: 'El plan principal para preparar la PAU durante todo el curso.',
    features: planFeatures('premium'),
  },
  curso_pau: {
    id: 'curso_pau',
    label: 'Curso PAU',
    periodDisplay: 'pago único · sept → junio',
    description: 'Acceso completo hasta junio. Precio de lanzamiento por tiempo limitado.',
    features: planFeatures('curso_pau'),
  },
  intensivo: {
    id: 'intensivo',
    label: 'Intensivo',
    periodDisplay: '/ 3 meses',
    description: 'Recta final antes de la PAU: más simulacros, más ritmo.',
    features: planFeatures('intensivo'),
  },
  superpremium: {
    id: 'superpremium',
    label: 'Superpremium',
    periodDisplay: '/mes',
    description: 'Para quien quiere el máximo acompañamiento posible.',
    features: planFeatures('superpremium'),
  },
}
