import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  ENTITLEMENT_ONLY_PLAN_IDS,
  PLAN_DEFINITIONS,
  PUBLIC_PLAN_IDS,
  PURCHASABLE_CHECKOUT_PLAN_IDS,
  getPlanDefinitionByCheckoutId,
  getPlanPriceCents,
  getPublicPlanDefinitions,
  getSuperpremiumPreviewPlan,
  normalizeCommercialPlanId,
} from './pricing.ts'
import { CAMINO_PLAN_LIMITS } from './camino/caminoPlanLimits.ts'

test('public catalogue only exposes free or operational checkout plans', () => {
  const publicPlans = getPublicPlanDefinitions(new Date('2026-09-04T12:00:00Z'))
  assert.deepEqual(publicPlans.map((plan) => plan.id), [...PUBLIC_PLAN_IDS])
  for (const plan of publicPlans) {
    if (plan.id === 'free') {
      assert.equal(plan.checkoutPlanId, null)
      assert.equal(plan.ctaHref, '/onboarding')
    } else {
      assert.ok(plan.checkoutPlanId)
      assert.ok(PURCHASABLE_CHECKOUT_PLAN_IDS.includes(plan.checkoutPlanId))
      assert.equal(getPlanDefinitionByCheckoutId(plan.checkoutPlanId)?.id, plan.id)
      assert.match(plan.ctaHref, /^\/checkout\?plan=/)
    }
    assert.equal(plan.availability, 'public')
  }
})

test('entitlement-only plans remain compatible but cannot leak into the purchasable catalogue', () => {
  for (const id of ENTITLEMENT_ONLY_PLAN_IDS) {
    const plan = PLAN_DEFINITIONS[id]
    assert.equal(plan.availability, 'entitlement_only')
    assert.equal(plan.checkoutPlanId, null)
    assert.ok(!PUBLIC_PLAN_IDS.includes(id as never))
  }
  assert.equal(normalizeCommercialPlanId('intensivo_pau'), 'intensivo')
  assert.equal(normalizeCommercialPlanId('super_premium'), 'superpremium')
})

// Superpremium is deliberately visible on /precios and the landing (a
// showcase card, not a hidden plan) while production Stripe is live and the
// user cannot legally invoice for it yet. This locks in the two properties
// that make that safe: it never joins the real purchasable catalogue, and
// its card has no ctaHref a UI could turn into a checkout link.
test('Superpremium preview card is visible but structurally unpurchasable', () => {
  assert.ok(!PUBLIC_PLAN_IDS.includes('superpremium' as never))
  assert.equal(getPublicPlanDefinitions().some((plan) => plan.id === 'superpremium'), false)
  assert.equal(PLAN_DEFINITIONS.superpremium.checkoutPlanId, null)
  assert.equal(PLAN_DEFINITIONS.superpremium.stripePricingMode, 'none')

  const preview = getSuperpremiumPreviewPlan()
  assert.equal(preview.comingSoon, true)
  assert.equal(preview.ctaHref, '')
  assert.equal(preview.checkoutPlanId, null)
})

test('legacy billing IDs keep their historical entitlement mapping', () => {
  assert.equal(normalizeCommercialPlanId('pack_curso_pau'), 'curso_pau')
  assert.equal(normalizeCommercialPlanId('curso_pau_early'), 'curso_pau')
  assert.equal(normalizeCommercialPlanId('premium_monthly'), 'premium')
  assert.equal(normalizeCommercialPlanId('unknown-plan'), 'free')
})

test('canonical prices preserve the verified commercial decisions', () => {
  assert.equal(getPlanPriceCents('free'), 0)
  assert.equal(getPlanPriceCents('premium'), 999)
  assert.equal(getPlanPriceCents('curso_pau', new Date('2026-08-31T12:00:00Z')), 5900)
  assert.equal(getPlanPriceCents('curso_pau', new Date('2026-09-04T12:00:00Z')), 7900)
})

test('backend Camino limits are derived exactly from the commercial catalogue', () => {
  for (const [id, plan] of Object.entries(PLAN_DEFINITIONS)) {
    const enforced = CAMINO_PLAN_LIMITS[id as keyof typeof CAMINO_PLAN_LIMITS]
    assert.deepEqual({
      correctionsPerMonth: enforced.correctionsPerMonth,
      photosPerMonth: enforced.photosPerMonth,
      partialsPerMonth: enforced.partialsPerMonth,
      fullMocksPerMonth: enforced.fullMocksPerMonth,
      caminoMode: enforced.caminoMode,
      maxStudyDaysPerWeek: enforced.maxStudyDaysPerWeek,
      includeBonusMissions: enforced.includeBonusMissions,
      maxFlashcardsPerDeck: enforced.maxFlashcardsPerDeck,
    }, plan.limits)
  }
})

test('Orientation and Ranking reflect the current ungated product', () => {
  for (const plan of getPublicPlanDefinitions()) {
    assert.match(plan.orientationLabel, /Madrid y Cataluña/)
    assert.equal(plan.rankingLabel, 'Ranking completo')
  }
})

test('public copy never sells unlimited usage', () => {
  const publicCopy = JSON.stringify(getPublicPlanDefinitions()).toLowerCase()
  assert.doesNotMatch(publicCopy, /ilimitad|unlimited|sin límites/)
})

test('landing consumes the catalogue instead of duplicating commercial limits', () => {
  const landing = fs.readFileSync(path.join(process.cwd(), 'app/landing/page.tsx'), 'utf8')
  assert.match(landing, /getPublicPlanDefinitions\(\)/)
  assert.doesNotMatch(landing, /\d+ correcciones\/mes/)
  assert.doesNotMatch(landing, /\d+ fotos\/mes/)
})
