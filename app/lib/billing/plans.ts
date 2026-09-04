// Server-only adapter from the canonical commercial catalogue to Stripe.
// Persistent checkout IDs stay unchanged for existing sessions and users.

import 'server-only'

import {
  CURSO_PAU_EARLY_PRICE_CENTS,
  CURSO_PAU_STANDARD_PRICE_CENTS,
  DEFAULT_CHECKOUT_PLAN_ID,
  PURCHASABLE_CHECKOUT_PLAN_IDS,
  getCursoPauPriceCents,
  getPlanDefinitionByCheckoutId,
  getPlanFeatureLabels,
  getPlanPriceCents,
  isPurchasableCheckoutPlanId,
  type CheckoutPlanId,
} from '@/app/lib/pricing'

export interface BillingPlan {
  id: CheckoutPlanId
  label: string
  description: string
  priceCents: number
  currency: 'eur'
  accessDays: number | null
  features: string[]
}

export const PACK_CURSO_PAU_FOUNDING_PRICE_CENTS = CURSO_PAU_EARLY_PRICE_CENTS
export const PACK_CURSO_PAU_STANDARD_PRICE_CENTS = CURSO_PAU_STANDARD_PRICE_CENTS
export const getPackCursoPauPriceCents = getCursoPauPriceCents

function toBillingPlan(checkoutPlanId: CheckoutPlanId): BillingPlan {
  const definition = getPlanDefinitionByCheckoutId(checkoutPlanId)
  if (!definition) throw new Error(`Missing canonical plan for checkout ID: ${checkoutPlanId}`)
  return {
    id: checkoutPlanId,
    label: definition.commercialName,
    description: definition.description,
    priceCents: getPlanPriceCents(definition.id),
    currency: 'eur',
    accessDays: definition.billingPeriod === 'monthly' ? 30 : null,
    features: getPlanFeatureLabels(definition.id),
  }
}

export const PLANS: Record<CheckoutPlanId, BillingPlan> = {
  premium: toBillingPlan('premium'),
  pack_curso_pau: toBillingPlan('pack_curso_pau'),
}

export function getPlan(planId: string): BillingPlan | null {
  return isPurchasableCheckoutPlanId(planId) ? PLANS[planId] : null
}

export function isRecurringPlan(planId: string): boolean {
  const definition = getPlanDefinitionByCheckoutId(planId)
  return definition?.billingPeriod === 'monthly'
}

export function getLivePriceCents(planId: string): number | null {
  const definition = getPlanDefinitionByCheckoutId(planId)
  return definition ? getPlanPriceCents(definition.id) : null
}

export { PURCHASABLE_CHECKOUT_PLAN_IDS, isPurchasableCheckoutPlanId }
export const DEFAULT_PLAN_ID = DEFAULT_CHECKOUT_PLAN_ID
