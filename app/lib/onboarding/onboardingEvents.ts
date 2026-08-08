'use client'

// Fase 0 de observabilidad del onboarding actual. Envía eventos de embudo a
// /api/onboarding/event, que los persiste vía recordBetaMetric() en
// billing_events — reutilizado temporalmente como event store de métricas
// beta/producto para no introducir otra infraestructura en esta fase.
//
// Nunca incluir aquí PII (email, username, instituto, texto libre, etc.) —
// ver la lista blanca de campos en app/api/onboarding/event/route.ts.
import { supabase } from '@/app/lib/supabase'
import type { PainType } from '@/app/lib/onboarding/onboardingStorage'

export const ONBOARDING_FLOW_VERSION = 'current_v1'

// onboarding_generation_started/succeeded/failed NO viven aquí: el servidor
// (app/api/onboarding/generate/route.ts) es su única fuente de verdad — un
// fetch de cliente que no llega a completarse no debe poder falsear el
// resultado de una generación que en realidad sí funcionó. Ver auditoría
// Fase 0 y app/api/onboarding/event/route.ts (que además los rechaza).
export type OnboardingEventType =
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_step_completed'
  | 'onboarding_validation_failed'
  | 'onboarding_back_clicked'
  // NUNCA 'onboarding_completed' aquí — ese event_type es el evento de
  // negocio que escribe /api/onboarding/setup (payload.onboarding_completed
  // === true) y que /api/onboarding/me usa para decidir si el usuario
  // terminó el onboarding. Reutilizarlo para telemetría del cliente rompió
  // esa detección para todo el mundo (la fila de telemetría, al ser más
  // reciente, ganaba la query de "última fila onboarding_completed" sin
  // llevar el flag de negocio). Este es el evento equivalente pero seguro.
  | 'onboarding_flow_completed'
  // Fase 1 (rediseño emocional): dolor principal elegido en la portada.
  | 'onboarding_pain_selected'

export type OnboardingStepId =
  | 'welcome'
  | 'pain'
  | 'pain_result'
  | 'username'
  | 'community'
  | 'school'
  | 'subjects'
  | 'upcoming_exam'
  | 'preparation'
  | 'study_time'
  | 'study_days'
  | 'grade_threshold'
  | 'confirmation'
  | 'saving'
  | 'done'

export interface OnboardingEventPayload {
  step_id?: OnboardingStepId
  step_index?: number
  active_duration_ms?: number
  elapsed_duration_ms?: number
  is_revisit?: boolean
  visit_number?: number
  validation_attempts?: number
  subjects_count?: number
  has_upcoming_exam?: boolean
  study_time_bucket?: string
  study_days_count?: number | null
  error_code?: string
  pain_type?: PainType
}

function viewportType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

// Best-effort: la telemetría nunca debe bloquear ni romper el onboarding real.
export async function sendOnboardingEvent(
  traceId: string | null,
  eventType: OnboardingEventType,
  payload: OnboardingEventPayload = {},
) {
  if (!traceId || typeof window === 'undefined') return
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) return
    await fetch('/api/onboarding/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Kairo-Trace-Id': traceId,
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        event_type: eventType,
        trace_id: traceId,
        flow_version: ONBOARDING_FLOW_VERSION,
        viewport_type: viewportType(),
        ...payload,
      }),
      keepalive: true,
    })
  } catch {
    // Telemetry must never block the onboarding flow.
  }
}
