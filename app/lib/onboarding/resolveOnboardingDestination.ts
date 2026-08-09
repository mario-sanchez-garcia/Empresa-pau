// Regla única de destino post-auth, reusada por /auth/callback, /login,
// la landing y el propio /onboarding (ver AGENTS.md / plan de auth-ux):
// completado -> /camino; borrador server-side sin terminar -> retomar la
// pantalla de finalización; nada -> empezar/retomar el onboarding.

export interface OnboardingMeResponse {
  onboarding?: { completedAt?: string | null; community?: unknown; subjects?: unknown[] } | null
  draft?: { id: string; status: 'claimed' | 'processing' | 'failed' } | null
}

export function resolveOnboardingDestination(json: OnboardingMeResponse): string {
  const completo = Boolean(
    json.onboarding?.completedAt &&
    json.onboarding?.community &&
    (json.onboarding?.subjects as unknown[] | undefined)?.length
  )
  if (completo) return '/camino'
  if (json.draft?.id) return `/onboarding/finalizando?draft=${encodeURIComponent(json.draft.id)}`
  return '/onboarding'
}
