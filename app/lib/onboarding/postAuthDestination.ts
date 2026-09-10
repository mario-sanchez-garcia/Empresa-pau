// A dónde va el alumno JUSTO DESPUÉS de autenticarse, y qué hay que reclamar
// antes de llevarlo.
//
// Vivía dentro de /auth/callback. Se saca aquí porque ahora hay dos entradas
// a este mismo punto —el callback de OAuth y la pantalla de verificación por
// código— y duplicar la secuencia "reclama el draft, luego decide destino"
// es la forma más directa de que una de las dos pierda el draft del alumno.
//
// Las dependencias se inyectan para que la regla se pueda comprobar sin red:
// lo que importa aquí es el ORDEN (primero reclamar, luego decidir) y qué
// pasa cuando el claim falla.

import { resolveOnboardingDestination, type OnboardingMeResponse } from './resolveOnboardingDestination.ts'

export type PostAuthDeps = {
  /** POST /api/onboarding/draft/claim. true si el draft quedó reclamado. */
  claimDraft: (draftId: string) => Promise<boolean>
  /** GET /api/onboarding/me, o null si no se pudo consultar. */
  fetchOnboardingMe: () => Promise<OnboardingMeResponse | null>
}

export type PostAuthDestination = {
  destination: string
  /** ¿Se acaba de reclamar el draft en esta llamada? Sirve para la telemetría. */
  draftClaimed: boolean
}

/**
 * Destino post-auth.
 *
 * Con `draftId` (el alumno viene del onboarding anónimo) el destino es
 * SIEMPRE la pantalla de finalización de ese draft: no se pasa por la
 * comprobación de "onboarding completo", que es para el login clásico. Si el
 * claim falla, se vuelve al onboarding en vez de mandarlo a finalizar algo
 * que no le pertenece — el draft local sigue intacto y el propio paso de
 * signup lo reintenta al detectar que ya hay sesión.
 *
 * El finalizer reclama otra vez por su cuenta con el mismo helper
 * idempotente, así que reclamar aquí adelanta trabajo pero nunca lo duplica.
 */
export async function resolvePostAuthDestination(
  draftId: string | null,
  deps: PostAuthDeps,
  fallback = '/camino',
): Promise<PostAuthDestination> {
  if (draftId) {
    let claimed = false
    try {
      claimed = await deps.claimDraft(draftId)
    } catch {
      claimed = false
    }
    return claimed
      ? { destination: `/onboarding/finalizando?draft=${encodeURIComponent(draftId)}`, draftClaimed: true }
      : { destination: '/onboarding', draftClaimed: false }
  }

  try {
    const me = await deps.fetchOnboardingMe()
    if (me) {
      const destination = resolveOnboardingDestination(me)
      if (destination !== '/camino') return { destination, draftClaimed: false }
    }
  } catch {
    // Nunca bloquear el acceso por esta comprobación.
  }
  return { destination: fallback, draftClaimed: false }
}
