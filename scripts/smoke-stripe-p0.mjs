import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

const webhookPath = 'app/api/stripe/webhook/route.ts'
const successPath = 'app/parent-checkout/success/page.tsx'
const plansPath = 'app/lib/billing/plans.ts'
const parentSessionPath = 'app/api/checkout/parent-session/route.ts'
const parentLinkPath = 'app/api/checkout/parent-link/route.ts'
const migrationPath = 'supabase/migrations/20260614120000_create_billing_tables.sql'

const webhook = read(webhookPath)
const success = read(successPath)
const plans = read(plansPath)
const parentSession = read(parentSessionPath)
const parentLink = read(parentLinkPath)
const migration = existsSync(join(root, migrationPath)) ? read(migrationPath) : ''

assert('Stripe webhook endpoint exists', existsSync(join(root, webhookPath)))
assert('Stripe webhook verifies raw-body signature', webhook.includes('request.text()') && webhook.includes('stripe-signature') && webhook.includes('constructEvent(rawBody, sig, getWebhookSecret())'))
assert('Stripe webhook handles checkout.session.completed', webhook.includes("event.type === 'checkout.session.completed'") && webhook.includes('handleCheckoutCompleted'))
assert('Stripe webhook creates entitlement only after verified event', webhook.includes(".from('user_entitlements').insert") && webhook.includes("source: 'stripe_parent_checkout'") && webhook.includes("status: 'active'"))
assert('Stripe webhook is idempotent by checkout session id', webhook.includes(".eq('stripe_checkout_session_id', sessionId)") && webhook.includes('existingEntitlement') && webhook.includes('idempotent'))
assert('Stripe webhook writes billing audit events', webhook.includes(".from('billing_events').insert") && webhook.includes("event_type: 'checkout_completed'"))
assert('Success page is passive and does not activate entitlement', success.includes('does NOT activate any entitlement') && !success.includes(".from('user_entitlements').insert") && !success.includes("status: 'active'"))
assert('Billing plan map exists for price_id to plan metadata', plans.includes('PLANS') && plans.includes('pack_curso_pau') && plans.includes('getPlan') && plans.includes('getLivePriceCents'))
assert('Parent checkout session uses Stripe checkout', parentSession.includes('stripe.checkout.sessions.create') && parentSession.includes('metadata') && parentSession.includes('plan_id'))
assert('Parent checkout link flow exists', parentLink.includes('parent_checkout_links') && parentLink.includes('plan_id'))
assert('Supabase billing tables migration exists', migration.includes('parent_checkout_links') && migration.includes('user_entitlements') && migration.includes('billing_events'))

if (process.exitCode) process.exit(process.exitCode)
