import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// Misma señal autoritativa que /api/onboarding/me usa para decidir
// "onboarding: null" vs un perfil completado — el evento de negocio real
// (billing_events.event_type='onboarding_completed' con
// payload.onboarding_completed===true), no la fila de telemetría más
// reciente que comparta el mismo event_type (ver comentario en
// onboardingEvents.ts sobre por qué esas nunca llevan ese flag).
export async function hasCompletedOnboarding(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await db
    .from('billing_events')
    .select('payload')
    .eq('user_id', userId)
    .eq('event_type', 'onboarding_completed')
    .eq('payload->>onboarding_completed', 'true')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return Boolean(data)
}
