// Server-only: never import in client components.
// Single source of truth for all billing plan definitions.
// Los precios en sí viven en app/lib/pricing.ts (compartido con /pricing,
// /landing y /waitlist) — este archivo solo los reexporta para el checkout.

import {
  CURSO_PAU_EARLY_PRICE_CENTS,
  CURSO_PAU_STANDARD_PRICE_CENTS,
  getCursoPauPriceCents,
} from '@/app/lib/pricing'

export interface BillingPlan {
  id: string
  label: string
  description: string
  priceCents: number
  currency: string
  // How long the entitlement lasts. null = permanent (until explicitly revoked).
  accessDays: number | null
  // What's included — used on parent checkout page.
  features: string[]
}

// Founding price active until FOUNDING_DEADLINE (ver app/lib/pricing.ts).
// After that, use standardPriceCents.
export const PACK_CURSO_PAU_FOUNDING_PRICE_CENTS = CURSO_PAU_EARLY_PRICE_CENTS
export const PACK_CURSO_PAU_STANDARD_PRICE_CENTS = CURSO_PAU_STANDARD_PRICE_CENTS

export const getPackCursoPauPriceCents = getCursoPauPriceCents

export const PLANS: Record<string, BillingPlan> = {
  pack_curso_pau: {
    id: 'pack_curso_pau',
    label: 'Pack Curso PAU',
    description: 'Ruta de estudio PAU completa de septiembre a junio con misiones diarias, correcciones IA y simulacros.',
    priceCents: PACK_CURSO_PAU_FOUNDING_PRICE_CENTS,
    currency: 'eur',
    accessDays: null,
    features: [
      'Camino PAU: misiones diarias personalizadas',
      'Correcciones IA con uso razonable',
      'Simulacros completos con corrección automática',
      'Historial de progreso y análisis de errores',
      'Seguimiento semana a semana hasta la PAU',
      'Soporte prioritario',
    ],
  },
}

export function getPlan(planId: string): BillingPlan | null {
  return PLANS[planId] ?? null
}

// Returns the live price for a plan (may differ from PLANS[id].priceCents after founding period).
export function getLivePriceCents(planId: string): number | null {
  if (planId === 'pack_curso_pau') return getPackCursoPauPriceCents()
  const plan = PLANS[planId]
  return plan?.priceCents ?? null
}

export const DEFAULT_PLAN_ID = 'pack_curso_pau'
