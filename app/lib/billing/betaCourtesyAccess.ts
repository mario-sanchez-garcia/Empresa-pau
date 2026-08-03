// Server-only: never import in client components.
//
// Temporary, time-boxed courtesy access for a handful of invited people
// (not a general mechanism — for recurring internal/admin access use
// app/lib/internalUsers.ts instead). Remove this file once
// BETA_COURTESY_EXPIRES_AT has passed and the entitlements it granted have
// naturally expired.
//
// Grants happen lazily: the first time one of these emails is seen with no
// active entitlement yet (via getUserBillingContext or /api/billing/me), a
// manual_admin entitlement is inserted for them automatically. No account
// creation, no emails sent — this only fires once the person has signed up
// themselves.

import type { SupabaseClient } from '@supabase/supabase-js'

const BETA_COURTESY_EMAILS = new Set(
  [
    'al.suarezmartinez@gmail.com',
    'martinezmartin.j@gmail.com',
    'andreasira1881@gmail.com',
    'ddiazpereztpr@gmail.com',
    'bmbeatriz08@gmail.com',
  ].map(e => e.toLowerCase())
)

const BETA_COURTESY_PLAN_ID = 'superpremium'
const BETA_COURTESY_STARTED_AT = '2026-08-03T00:00:00+02:00'
const BETA_COURTESY_EXPIRES_AT = '2026-08-09T23:59:59+02:00'

export interface CourtesyEntitlement {
  id: string
  plan_id: string
  status: string
  started_at: string
  expires_at: string | null
  source: string
}

// Call only when the caller has already confirmed there is no active
// entitlement for this user — returns the granted row, or null if the email
// isn't on the list, the beta window has passed, or the insert failed.
export async function grantCourtesyAccessIfEligible(
  db: SupabaseClient,
  userId: string,
  email: string | null | undefined
): Promise<CourtesyEntitlement | null> {
  if (!email || !BETA_COURTESY_EMAILS.has(email.toLowerCase())) return null
  if (Date.now() > new Date(BETA_COURTESY_EXPIRES_AT).getTime()) return null

  const { data, error } = await db
    .from('user_entitlements')
    .insert({
      user_id: userId,
      plan_id: BETA_COURTESY_PLAN_ID,
      source: 'manual_admin',
      status: 'active',
      started_at: BETA_COURTESY_STARTED_AT,
      expires_at: BETA_COURTESY_EXPIRES_AT,
      metadata: { note: 'Cortesía beta 5 personas — concedido automáticamente en el primer login' },
    })
    .select('id, plan_id, status, started_at, expires_at, source')
    .single()

  if (error) {
    console.error('[betaCourtesyAccess] grant failed:', error.message)
    return null
  }
  return data
}
