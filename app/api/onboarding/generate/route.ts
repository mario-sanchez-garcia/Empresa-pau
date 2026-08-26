import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { generateCaminoPlan, VALID_START_MODES, ALLOWED_GENERATE_SUBJECTS, type StartMode } from '@/app/lib/onboarding/generateCaminoPlan'
import { normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { extractTraceHeaders, logOnboardingStage } from '@/app/lib/onboarding/onboardingServerLog'
import { recordBetaMetric } from '@/app/lib/betaMetrics'

export const dynamic = 'force-dynamic'

// Debe coincidir con ONBOARDING_FLOW_VERSION en app/lib/onboarding/onboardingEvents.ts.
const FLOW_VERSION = 'current_v1'

export async function POST(request: NextRequest) {
  const { traceId, requestId } = extractTraceHeaders(request)
  const startedAt = Date.now()
  logOnboardingStage({ traceId, requestId, endpoint: 'generate', stage: 'start' })

  function respond(json: Record<string, unknown>, status?: number, errorCode?: string) {
    logOnboardingStage({
      traceId,
      requestId,
      endpoint: 'generate',
      result: errorCode ? 'failed' : 'success',
      errorCode,
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json({ ...json, request_id: requestId }, status ? { status } : undefined)
  }

  // Fase 0 de observabilidad: el servidor es la única fuente de verdad para
  // onboarding_generation_started/succeeded/failed — un fetch del cliente que
  // no llega a completarse (pestaña cerrada, red cortada) no debe poder
  // hacer parecer que la generación falló cuando en realidad tuvo éxito. Se
  // declaran fuera del try para que el catch pueda emitir el evento de fallo.
  let generationHasStarted = false
  let generationStartedAt = 0
  let eventUserId: string | null = null
  let eventDb: ReturnType<typeof createServiceClient> | null = null

  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext
    eventUserId = user.id

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    // ── Validate input ──────────────────────────────────────────────────────
    const subjects = Array.isArray(body.subjects)
      ? [...new Set(body.subjects
        .filter((s): s is string => typeof s === 'string')
        .map(s => normalizeSubjectSlug(s))
        .filter(subject => ALLOWED_GENERATE_SUBJECTS.has(subject)))]
      : []
    if (subjects.length === 0) {
      // Validación previa al inicio real de la generación — no debe emitir
      // generation_started/failed (ver auditoría Fase 0).
      return respond({ error: 'Se requiere al menos una asignatura válida' }, 400, 'invalid_subjects')
    }

    const startMode: StartMode = VALID_START_MODES.includes(body.startMode as StartMode)
      ? (body.startMode as StartMode) : 'zero'
    const dailyMinutes = typeof body.dailyMinutes === 'number' ? body.dailyMinutes : null

    const db = createServiceClient()
    eventDb = db

    generationHasStarted = true
    generationStartedAt = Date.now()
    await recordBetaMetric(db, user.id, 'onboarding_generation_started', {
      event_id: crypto.randomUUID(),
      trace_id: traceId,
      flow_version: FLOW_VERSION,
      request_id: requestId,
      subjects_count: subjects.length,
    })

    const result = await generateCaminoPlan({
      userId: user.id,
      db,
      subjects,
      startMode,
      studentExams: body.studentExams,
      dailyMinutes,
      userEmail: user.email,
      userFullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    })

    if (!result.success) {
      // Esta cuenta ya completó onboarding antes — generateCaminoPlan se
      // negó a ejecutar el reset destructivo (ver su propia guarda). No es
      // un fallo real de generación: se responde distinto, sin marcarlo
      // como error interno ni registrar onboarding_generation_failed.
      if (result.errorCode === 'already_onboarded') {
        return respond({ error: 'already_onboarded' }, 409, 'already_onboarded')
      }
      throw Object.assign(new Error(result.errorCode), { errorCode: result.errorCode })
    }

    const generationDurationMs = Date.now() - generationStartedAt
    await recordBetaMetric(db, user.id, 'onboarding_generation_succeeded', {
      event_id: crypto.randomUUID(),
      trace_id: traceId,
      flow_version: FLOW_VERSION,
      request_id: requestId,
      generation_duration_ms: generationDurationMs,
    })

    return respond({
      success: true,
      daysGenerated: result.daysGenerated,
      firstMission: result.firstMission ? {
        title: result.firstMission.title,
        subject: result.firstMission.subject,
        scheduled_date: result.firstMission.scheduled_date,
        missionType: result.firstMission.missionType,
        supportsStepCorrection: result.firstMission.supportsStepCorrection,
      } : null,
    })
  } catch (err) {
    console.error('[onboarding/generate]', err)
    const errorCode = (err && typeof err === 'object' && 'errorCode' in err) ? String((err as { errorCode: unknown }).errorCode) : 'internal_error'
    if (generationHasStarted && eventUserId) {
      try {
        const db = eventDb ?? createServiceClient()
        await recordBetaMetric(db, eventUserId, 'onboarding_generation_failed', {
          event_id: crypto.randomUUID(),
          trace_id: traceId,
          flow_version: FLOW_VERSION,
          request_id: requestId,
          generation_duration_ms: Date.now() - generationStartedAt,
          error_code: errorCode,
        })
      } catch { /* metrics must never mask the real error */ }
    }
    return respond({ error: 'Error interno del servidor' }, 500, errorCode)
  }
}
