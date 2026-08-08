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
import { enqueueOnboardingEvent, readQueuedEvents, removeQueuedEvents } from '@/app/lib/onboarding/onboardingEventQueue'

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
  // Fase 2 (signup al final): estos ocurren ANTES de que exista sesión, así
  // que sendOnboardingEvent() los encola en local (ver
  // onboardingEventQueue.ts) hasta que haya token para enviarlos de verdad.
  | 'onboarding_preview_viewed'
  | 'onboarding_signup_method_selected'
  | 'onboarding_signup_started'
  | 'onboarding_signup_completed'
  | 'email_confirmation_sent'
  | 'email_confirmation_completed'
  | 'onboarding_draft_created'
  | 'onboarding_draft_claimed'
  | 'onboarding_finalize_started'
  | 'onboarding_finalize_resumed'

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
  | 'preview'
  | 'signup'
  | 'finalizing'

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
  method?: 'google' | 'email'
}

function viewportType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

// Best-effort: la telemetría nunca debe bloquear ni romper el onboarding
// real. Fase 2: el onboarding ahora ocurre antes de autenticarse, así que
// sin token no se descarta el evento — se encola en local (ver
// onboardingEventQueue.ts) y se manda de verdad en el flush posterior al
// login/claim (ver flushQueuedOnboardingEvents).
export async function sendOnboardingEvent(
  traceId: string | null,
  eventType: OnboardingEventType,
  payload: OnboardingEventPayload = {},
) {
  if (!traceId || typeof window === 'undefined') return
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const eventId = crypto.randomUUID()
    if (!token) {
      enqueueOnboardingEvent({
        event_id: eventId,
        trace_id: traceId,
        event_type: eventType,
        occurred_at: new Date().toISOString(),
        flow_version: ONBOARDING_FLOW_VERSION,
        viewport_type: viewportType(),
        payload: { ...payload },
      })
      return
    }
    await fetch('/api/onboarding/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Kairo-Trace-Id': traceId,
      },
      body: JSON.stringify({
        event_id: eventId,
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

// Guarda si ya hay un flush en curso en esta misma pestaña/instancia del
// módulo. Sin esto, dos llamadas casi simultáneas (p.ej. React Strict Mode
// invocando el efecto de montaje dos veces en dev — encontrado en el E2E de
// Fase 2) leen la cola ANTES de que la primera termine de vaciarla, y cada
// evento se reenvía duplicado. No cubre dos pestañas distintas (procesos JS
// separados) — ahí la duplicación de analytics sigue siendo posible, pero
// es solo telemetría, nunca datos de negocio (perfil/Camino/XP), que están
// protegidos por el lock atómico de /api/onboarding/finalize.
let flushInFlight = false

// Se llama tras autenticarse (claim del draft) con el token ya disponible.
// Envía cada evento encolado y solo lo quita de la cola local si el server
// lo aceptó — un fallo de red deja el evento para el próximo flush en vez de
// perderlo.
export async function flushQueuedOnboardingEvents(accessToken: string) {
  if (typeof window === 'undefined' || flushInFlight) return
  const queued = readQueuedEvents()
  if (queued.length === 0) return
  flushInFlight = true
  try {
    await flushEvents(accessToken, queued)
  } finally {
    flushInFlight = false
  }
}

async function flushEvents(accessToken: string, queued: ReturnType<typeof readQueuedEvents>) {
  const sentIds: string[] = []
  for (const event of queued) {
    try {
      const res = await fetch('/api/onboarding/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Kairo-Trace-Id': event.trace_id,
        },
        body: JSON.stringify({
          event_id: event.event_id,
          event_type: event.event_type,
          trace_id: event.trace_id,
          flow_version: event.flow_version,
          viewport_type: event.viewport_type,
          occurred_at: event.occurred_at,
          ...event.payload,
        }),
      })
      if (res.ok || res.status === 400) {
        // 400 (p.ej. event_type ya no reconocido) no es recuperable
        // reintentando — se descarta para no atascar el flush para siempre.
        sentIds.push(event.event_id)
      }
    } catch {
      // Sin red: se deja en la cola para el próximo flush.
    }
  }
  removeQueuedEvents(sentIds)
}
