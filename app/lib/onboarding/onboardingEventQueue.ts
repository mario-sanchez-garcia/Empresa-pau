'use client'

// Fase 2: antes de autenticarse, el alumno no tiene Bearer token, y
// /api/onboarding/event exige uno (billing_events no es público a
// propósito). sendOnboardingEvent() (ver onboardingEvents.ts) encola aquí en
// vez de descartar el evento cuando no hay sesión; tras el claim del draft
// se hace flush con el token ya disponible. Nunca PII — mismos payloads
// permitidos que ya valida /api/onboarding/event server-side.

export interface QueuedOnboardingEvent {
  event_id: string
  trace_id: string
  event_type: string
  occurred_at: string
  flow_version: string
  viewport_type?: 'mobile' | 'desktop'
  payload: Record<string, unknown>
}

const KEY = 'kairo_onboarding_events_v1'
// Red de seguridad barata: un intento de onboarding real no genera cientos
// de eventos. Si algo entra en bucle, esto evita que localStorage crezca sin
// límite en vez de intentar ser un event store de verdad.
const MAX_QUEUE_SIZE = 200

function readQueue(): QueuedOnboardingEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(events: QueuedOnboardingEvent[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_QUEUE_SIZE)))
  } catch {
    // Si localStorage está lleno/bloqueado, la telemetría se pierde — nunca
    // debe romper el onboarding real.
  }
}

export function enqueueOnboardingEvent(event: QueuedOnboardingEvent) {
  const queue = readQueue()
  if (queue.some(e => e.event_id === event.event_id)) return
  queue.push(event)
  writeQueue(queue)
}

export function readQueuedEvents(): QueuedOnboardingEvent[] {
  return readQueue()
}

export function removeQueuedEvents(eventIds: string[]) {
  if (eventIds.length === 0) return
  const toRemove = new Set(eventIds)
  writeQueue(readQueue().filter(e => !toRemove.has(e.event_id)))
}

export function clearQueuedEvents() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
