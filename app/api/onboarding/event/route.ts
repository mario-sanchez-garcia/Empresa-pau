import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric, type BetaMetricEvent } from '@/app/lib/betaMetrics'
import { extractTraceHeaders, logOnboardingStage } from '@/app/lib/onboarding/onboardingServerLog'
import { checkServerRateLimit } from '@/app/lib/serverRateLimit'

export const dynamic = 'force-dynamic'

// Fase 0 de observabilidad del onboarding actual — endpoint único que recibe
// los eventos de embudo del wizard y los persiste en billing_events vía
// recordBetaMetric(). Ver AGENTS.md / plan de onboarding para el alcance.
//
// onboarding_generation_started/succeeded/failed NO están aquí a propósito:
// desde que el servidor es su única fuente de verdad (ver
// app/api/onboarding/generate/route.ts), este endpoint ya no debe aceptarlos
// — si lo hiciera, un cliente podría forjar un "succeeded" falso y anular la
// garantía que motivó moverlos a servidor.
const ONBOARDING_EVENT_TYPES = new Set<string>([
  'onboarding_started',
  'onboarding_step_viewed',
  'onboarding_step_completed',
  'onboarding_validation_failed',
  'onboarding_back_clicked',
  // 'onboarding_completed' NO está aquí a propósito: es el event_type del
  // evento de negocio que escribe /api/onboarding/setup (con
  // payload.onboarding_completed === true), del que depende
  // /api/onboarding/me. Este endpoint acepta 'onboarding_flow_completed'
  // (telemetría) en su lugar — ver comentario en onboardingEvents.ts.
  'onboarding_flow_completed',
  'onboarding_pain_selected',
  // Fase 2 (signup al final) — la mayoría ocurren antes de que exista
  // sesión y llegan aquí vía flush de la cola local (ver
  // onboardingEventQueue.ts), no en tiempo real.
  'onboarding_preview_viewed',
  'onboarding_signup_method_selected',
  'onboarding_signup_started',
  'onboarding_signup_completed',
  'email_confirmation_sent',
  'email_confirmation_completed',
  'onboarding_draft_created',
  'onboarding_draft_claimed',
  'onboarding_finalize_started',
  'onboarding_finalize_resumed',
])

// Límite generoso: un onboarding real (con vueltas atrás y validaciones
// fallidas) dispara unas 20-25 llamadas; 150/hora deja margen amplio sin
// permitir que una cuenta rellene billing_events de basura.
const RATE_LIMIT = 150
const RATE_WINDOW_SECONDS = 3600

// 16 KB es muchísimo más que cualquier payload real de este endpoint (unos
// pocos campos numéricos/booleanos/strings cortos). Es solo una red de
// seguridad barata — no sustituye la whitelist de campos de abajo.
const MAX_BODY_BYTES = 16 * 1024

// Lista blanca estricta: nunca persistir email, username, instituto, texto
// libre, fechas exactas de parcial, contenido académico ni stack traces.
const ALLOWED_PAYLOAD_KEYS = [
  'event_id',
  'trace_id',
  'flow_version',
  'step_id',
  'step_index',
  'viewport_type',
  'active_duration_ms',
  'elapsed_duration_ms',
  'is_revisit',
  'visit_number',
  'validation_attempts',
  'subjects_count',
  'has_upcoming_exam',
  'study_time_bucket',
  'study_days_count',
  'request_id',
  'generation_duration_ms',
  'error_code',
  'pain_type',
  // Fase 2: qué método de signup eligió (google|email) — no es PII.
  'method',
  // Fase 2: cuándo ocurrió el evento en el cliente (encolado pre-auth y
  // enviado más tarde en el flush) — distinto de created_at en servidor.
  'occurred_at',
] as const

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sanitizePayload(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of ALLOWED_PAYLOAD_KEYS) {
    if (body[key] !== undefined) out[key] = body[key]
  }
  return out
}

export async function POST(request: NextRequest) {
  const { traceId: headerTraceId, requestId } = extractTraceHeaders(request)

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }

  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const rateLimit = checkServerRateLimit({
    key: `onboarding_event:${user.id}`,
    limit: RATE_LIMIT,
    windowSeconds: RATE_WINDOW_SECONDS,
  })
  if (!rateLimit.allowed) {
    logOnboardingStage({ traceId: headerTraceId, requestId, endpoint: 'event', result: 'failed', errorCode: 'rate_limited' })
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const eventType = typeof body.event_type === 'string' ? body.event_type : ''
  if (!ONBOARDING_EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: 'invalid event_type' }, { status: 400 })
  }

  const traceId = typeof body.trace_id === 'string' && UUID_RE.test(body.trace_id) ? body.trace_id : headerTraceId
  const eventId = typeof body.event_id === 'string' && UUID_RE.test(body.event_id) ? body.event_id : crypto.randomUUID()

  const serviceDb = (() => {
    try { return createServiceClient() } catch { return null }
  })()

  if (serviceDb) {
    await recordBetaMetric(serviceDb, user.id, eventType as BetaMetricEvent, {
      ...sanitizePayload(body),
      trace_id: traceId,
      event_id: eventId,
    })
  }

  logOnboardingStage({ traceId, requestId, endpoint: 'event', stage: eventType })

  return NextResponse.json({ ok: true, request_id: requestId })
}
