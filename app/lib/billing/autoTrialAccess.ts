import 'server-only'

// Reemplaza el plan Free público (retirado de PUBLIC_PLAN_IDS en
// app/lib/pricing.ts): todo alumno nuevo recibe acceso a Premium sin pasar
// por Stripe, de una de estas dos formas —
//   - Antes de PREMIUM_FREE_BETA_DEADLINE_DATE (12 de octubre de 2026
//     inclusive): Premium gratis hasta esa fecha (promo de la beta pública).
//   - Después: una prueba de 7 días de Premium, concedida una única vez por
//     alumno (se comprueba por source='auto_trial' aunque ya haya expirado,
//     para no volver a concederla en bucle cada vez que se consulta el
//     billing context sin entitlement activa).
// Pasada cualquiera de las dos sin pagar, el alumno cae solo a Free: sin
// entitlement activa, normalizeCommercialPlanId(null) ya resuelve a 'free'
// (ver app/lib/pricing.ts) con sus límites de siempre, intactos.
//
// Mismo patrón perezoso que grantCourtesyAccessIfEligible en
// betaCourtesyAccess.ts (llamado desde los mismos dos sitios: GET
// /api/billing/me y getUserBillingContext) — cubre tanto el signup con
// email/contraseña (POST /api/auth/signup) como el de Google (que crea la
// cuenta client-side en /auth/callback y nunca pasa por esa ruta), porque
// ambos acaban resolviendo el billing context antes de poder usar la app.

import type { SupabaseClient } from '@supabase/supabase-js'
import { isPremiumFreeBetaPeriod, getPremiumFreeBetaDeadline } from '@/app/lib/pricing'

const TRIAL_DAYS = 7
const AUTO_GRANT_PLAN_ID = 'premium'

export interface AutoGrantedEntitlement {
  id: string
  plan_id: string
  status: string
  started_at: string
  expires_at: string | null
  source: string
}

// Llamar solo cuando el caller ya confirmó que no hay entitlement activa
// (y, si aplica, que grantCourtesyAccessIfEligible tampoco concedió nada) —
// devuelve la fila concedida, o null si no corresponde conceder nada ahora.
export async function grantAutoAccessIfEligible(
  db: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<AutoGrantedEntitlement | null> {
  if (isPremiumFreeBetaPeriod(now)) {
    const { data, error } = await db
      .from('user_entitlements')
      .insert({
        user_id: userId,
        plan_id: AUTO_GRANT_PLAN_ID,
        source: 'auto_promo_beta',
        status: 'active',
        started_at: now.toISOString(),
        expires_at: getPremiumFreeBetaDeadline().toISOString(),
        metadata: { note: 'Premium gratis durante la beta pública (promo con fecha límite, sin Stripe)' },
      })
      .select('id, plan_id, status, started_at, expires_at, source')
      .single()
    if (error) {
      console.error('[autoTrialAccess] promo grant failed:', error.message)
      return null
    }
    return data
  }

  const { data: priorTrial, error: priorTrialError } = await db
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'auto_trial')
    .limit(1)
  if (priorTrialError) {
    console.error('[autoTrialAccess] prior-trial lookup failed:', priorTrialError.message)
    return null
  }
  if (priorTrial && priorTrial.length > 0) return null

  // El trial cuenta desde este chequeo (now), no desde userCreatedAt: un
  // alumno que se registró durante la promo y vuelve semanas después de que
  // esta expire debe recibir 7 días de verdad, no un trial que nacería ya
  // caducado por fecharlo contra su alta original (ver decisión: "cae al
  // trial normal de 7 días" tras expirar la promo, no "cae a un trial ya
  // muerto"). Para un alumno nuevo sin promo, now y userCreatedAt están a
  // minutos de distancia en la práctica, así que no cambia nada real.
  const trialExpiresAt = new Date(now.getTime() + TRIAL_DAYS * 86400000)

  const { data, error } = await db
    .from('user_entitlements')
    .insert({
      user_id: userId,
      plan_id: AUTO_GRANT_PLAN_ID,
      source: 'auto_trial',
      status: 'active',
      started_at: now.toISOString(),
      expires_at: trialExpiresAt.toISOString(),
      metadata: { note: 'Prueba gratuita de 7 días de Premium tras el registro (sin Stripe)' },
    })
    .select('id, plan_id, status, started_at, expires_at, source')
    .single()
  if (error) {
    console.error('[autoTrialAccess] trial grant failed:', error.message)
    return null
  }
  return data
}
