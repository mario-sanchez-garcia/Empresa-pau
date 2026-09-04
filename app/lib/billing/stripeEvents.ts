import type Stripe from 'stripe'

type EntitlementSubscriptionReference = {
  plan_id?: unknown
  metadata?: unknown
}

export function stripeId(value: unknown): string | null {
  if (typeof value === 'string' && value) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' && id ? id : null
  }
  return null
}

export function stripeTimestampToIso(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null
}

/**
 * Since Stripe API 2025-03-31.basil, subscription billing periods live on
 * subscription items instead of the Subscription object itself. Kairo creates
 * one recurring item, but taking the earliest end is safe if more are added.
 */
export function subscriptionPeriodEndIso(subscription: Stripe.Subscription): string | null {
  const periodEnds = subscription.items?.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value)) ?? []

  return periodEnds.length > 0
    ? stripeTimestampToIso(Math.min(...periodEnds))
    : null
}

/**
 * Since Stripe API 2025-03-31.basil, invoices expose their originating
 * subscription under parent.subscription_details.
 */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  return stripeId(invoice.parent?.subscription_details?.subscription)
}

/**
 * Stripe customer IDs are not specific enough when a customer owns more than
 * one Kairo product. Prefer the stored subscription ID and only fall back to a
 * legacy Premium entitlement that predates that metadata.
 */
export function entitlementMatchesSubscription(
  entitlement: EntitlementSubscriptionReference,
  subscriptionId: string
): boolean {
  const metadata = entitlement.metadata && typeof entitlement.metadata === 'object'
    ? entitlement.metadata as Record<string, unknown>
    : {}
  const storedSubscriptionId = stripeId(metadata.stripe_subscription_id)

  if (storedSubscriptionId) return storedSubscriptionId === subscriptionId
  return entitlement.plan_id === 'premium' || entitlement.plan_id === 'premium_monthly'
}
