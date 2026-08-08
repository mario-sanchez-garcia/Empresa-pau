import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { checkServerRateLimit, getClientIp } from '@/app/lib/serverRateLimit'
import { validateUsername } from '@/app/lib/username'
import {
  cleanGradeThresholdMode,
  cleanGradeThreshold,
  cleanSubjectGradeThresholds,
  cleanString,
  cleanStringArray,
  cleanPainType,
  VALID_COMMUNITIES,
  VALID_DAILY_MINUTES,
  VALID_WEEKLY_DAYS,
  VALID_SCHOOL_SOURCES,
} from '@/app/lib/onboarding/saveOnboardingProfile'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { extractTraceHeaders, logOnboardingStage } from '@/app/lib/onboarding/onboardingServerLog'

export const dynamic = 'force-dynamic'

// Fase 2 (signup al final): draft server-side ANÓNIMO. El alumno recorre
// todo el onboarding sin sesión — este es el único sitio donde sus
// respuestas quedan guardadas server-side antes de tener user_id. El
// finalizer (/api/onboarding/finalize) es quien las usa de verdad; este
// endpoint solo valida forma y persiste.

const FLOW_VERSION = 'current_v1'
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Generoso pero acotado — ver AGENTS.md / plan de onboarding Fase 2.
const DRAFT_RATE_LIMIT = 25
const DRAFT_WINDOW_SECONDS = 3600

function cleanUsername(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().slice(0, 20)
  if (!trimmed) return null
  return validateUsername(trimmed) ? null : trimmed
}

function cleanCommunity(value: unknown): string | null {
  return VALID_COMMUNITIES.includes(value as typeof VALID_COMMUNITIES[number]) ? (value as string) : null
}

export async function POST(request: NextRequest) {
  const { requestId } = extractTraceHeaders(request)

  const ip = getClientIp(request.headers)
  const rateLimit = checkServerRateLimit({ key: `onboarding_draft:${ip}`, limit: DRAFT_RATE_LIMIT, windowSeconds: DRAFT_WINDOW_SECONDS })
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? DRAFT_WINDOW_SECONDS) } })
  }

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const traceId = typeof body.trace_id === 'string' && UUID_RE.test(body.trace_id) ? body.trace_id : null
  if (!traceId) return NextResponse.json({ error: 'invalid_trace_id' }, { status: 400 })

  const flowVersion = typeof body.flow_version === 'string' ? body.flow_version.slice(0, 40) : FLOW_VERSION
  const rawPayload = (body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)) ? body.payload as Record<string, unknown> : {}

  // Lista blanca estricta: nunca username/password/tokens/email. Solo las
  // respuestas de onboarding que ya se validan/limpian en saveOnboardingProfile.
  // No se filtra aquí por ALLOWED_SUBJECTS (beta): el draft solo guarda la
  // respuesta tal cual; generateCaminoPlan ya aplica ese filtro real al
  // generar el Camino, y usarlo aquí también solo duplicaría esa lista.
  const subjects = cleanStringArray(rawPayload.subjects)
  const payload = {
    pain_type: cleanPainType(rawPayload.painType),
    username: cleanUsername(rawPayload.username),
    community: cleanCommunity(rawPayload.community),
    school_name: cleanString(rawPayload.schoolName),
    school_source: VALID_SCHOOL_SOURCES.includes(rawPayload.schoolSource as typeof VALID_SCHOOL_SOURCES[number]) ? rawPayload.schoolSource : null,
    subjects,
    upcoming_exams: cleanStudentExams(rawPayload.upcomingExams),
    preparation_feeling: cleanString(rawPayload.preparationLevel),
    daily_minutes: VALID_DAILY_MINUTES.includes(rawPayload.minutesPerSession as typeof VALID_DAILY_MINUTES[number]) ? rawPayload.minutesPerSession : null,
    weekly_study_days_value: VALID_WEEKLY_DAYS.includes(rawPayload.studyDays as typeof VALID_WEEKLY_DAYS[number]) ? rawPayload.studyDays : null,
    daily_study_time: cleanString(rawPayload.dailyStudyTime),
    weekly_study_days: cleanString(rawPayload.weeklyStudyDays),
    grade_threshold_mode: cleanGradeThresholdMode(rawPayload.gradeThresholdMode),
    grade_threshold: cleanGradeThreshold(rawPayload.gradeThreshold),
    subject_grade_thresholds: cleanSubjectGradeThresholds(rawPayload.subjectGradeThresholds),
  }

  const db = createServiceClient()
  const expiresAt = new Date(Date.now() + DRAFT_EXPIRY_MS).toISOString()

  const existingDraftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null

  if (existingDraftId) {
    const { data: existing } = await db
      .from('onboarding_drafts')
      .select('id, status, expires_at')
      .eq('id', existingDraftId)
      .maybeSingle()

    // Solo se puede actualizar in-place mientras siga pending_auth y no haya
    // caducado; en cualquier otro caso (ya reclamado, caducado, no existe)
    // se crea uno nuevo — no hay respuestas que perder porque el local draft
    // (ver onboardingDraftStorage.ts) sigue teniendo todo.
    if (existing && existing.status === 'pending_auth' && Date.parse(existing.expires_at) > Date.now()) {
      const { error: updateError } = await db
        .from('onboarding_drafts')
        .update({ trace_id: traceId, flow_version: flowVersion, payload, expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('id', existingDraftId)
      if (!updateError) {
        logOnboardingStage({ traceId, requestId, endpoint: 'draft', stage: 'updated' })
        return NextResponse.json({ draft_id: existingDraftId, expires_at: expiresAt })
      }
    }
  }

  const { data: created, error: insertError } = await db
    .from('onboarding_drafts')
    .insert({
      trace_id: traceId,
      flow_version: flowVersion,
      payload,
      status: 'pending_auth',
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    logOnboardingStage({ traceId, requestId, endpoint: 'draft', result: 'failed', errorCode: 'draft_create_failed' })
    return NextResponse.json({ error: 'No se pudo guardar tu preparación' }, { status: 500 })
  }

  // Best-effort, sin PII — el draft_id no es user_id así que se registra
  // aparte, sin recordBetaMetric (que exige un user_id de auth.users).
  void db.from('billing_events').insert({
    user_id: null,
    event_type: 'onboarding_draft_created',
    payload: { trace_id: traceId, draft_id: created.id, flow_version: flowVersion, beta_private: true },
  }).then(() => {}, () => {})

  logOnboardingStage({ traceId, requestId, endpoint: 'draft', stage: 'created' })
  return NextResponse.json({ draft_id: created.id, expires_at: expiresAt })
}
