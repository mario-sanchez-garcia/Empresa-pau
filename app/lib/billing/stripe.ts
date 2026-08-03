// Server-only. Never import in client components.
import 'server-only'

import Stripe from 'stripe'
import type { NextRequest } from 'next/server'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  return secret
}

// Single source of truth for the public base URL used in Stripe redirects
// (success_url, cancel_url, Billing Portal return_url, parent checkout
// links). Never hardcode a domain here — order matters:
//   1. NEXT_PUBLIC_APP_URL, explicitly configured (must be
//      https://kairo-pau.com in production — see Vercel env vars).
//   2. The incoming request's own origin, when available — safe because
//      it comes from Next's parsed URL, not a raw spoofable header, and it
//      naturally resolves to localhost in local dev too.
//   3. https://kairo-pau.com as a last-resort safety net, so a missing env
//      var can never silently fall back to an old/wrong deployment domain.
export function getAppUrl(request?: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL
  if (configured) return configured
  if (request) return request.nextUrl.origin
  return 'https://kairo-pau.com'
}
