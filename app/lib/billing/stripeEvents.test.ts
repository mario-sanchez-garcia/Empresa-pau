import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import {
  entitlementMatchesSubscription,
  invoiceSubscriptionId,
  subscriptionPeriodEndIso,
} from './stripeEvents.ts'

test('reads a subscription ID from the current Stripe invoice parent shape', () => {
  const invoice = {
    parent: {
      type: 'subscription_details',
      quote_details: null,
      subscription_details: { subscription: 'sub_current', metadata: null },
    },
  } as unknown as Stripe.Invoice

  assert.equal(invoiceSubscriptionId(invoice), 'sub_current')
  assert.equal(invoiceSubscriptionId({ parent: null } as unknown as Stripe.Invoice), null)
})

test('reads the current period end from Stripe subscription items', () => {
  const subscription = {
    items: {
      data: [
        { current_period_end: 1_800_000_000 },
        { current_period_end: 1_700_000_000 },
      ],
    },
  } as unknown as Stripe.Subscription

  assert.equal(subscriptionPeriodEndIso(subscription), '2023-11-14T22:13:20.000Z')
  assert.equal(
    subscriptionPeriodEndIso({ items: { data: [] } } as unknown as Stripe.Subscription),
    null
  )
})

test('subscription events cannot mutate another product or subscription', () => {
  assert.equal(entitlementMatchesSubscription({
    plan_id: 'premium',
    metadata: { stripe_subscription_id: 'sub_expected' },
  }, 'sub_expected'), true)
  assert.equal(entitlementMatchesSubscription({
    plan_id: 'premium',
    metadata: { stripe_subscription_id: 'sub_other' },
  }, 'sub_expected'), false)
  assert.equal(entitlementMatchesSubscription({ plan_id: 'premium_monthly' }, 'sub_expected'), true)
  assert.equal(entitlementMatchesSubscription({ plan_id: 'pack_curso_pau' }, 'sub_expected'), false)
})
