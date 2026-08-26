import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getTopic, getTopicByV2SortOrder } from '@/app/lib/camino/caminoCurriculumPlan'
import { claimOnboardingDraft, type OnboardingDraftRow } from '@/app/lib/onboarding/claimOnboardingDraft'
import { hasCompletedOnboarding } from '@/app/lib/onboarding/hasCompletedOnboarding'
import { saveOnboardingProfile, type CleanedOnboardingProfile } from '@/app/lib/onboarding/saveOnboardingProfile'
import { generateCaminoPlan } from '@/app/lib/onboarding/generateCaminoPlan'
import { buildOnboardingReward, type RewardMissionRow } from '@/app/lib/onboarding/buildOnboardingReward'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { extractTraceHeaders, logOnboardingStage } from '@/app/lib/onboarding/onboardingServerLog'

export const dynamic = 'force-dynamic'

const FLOW_VERSION = 'current_v1'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Reemplaza, para el flujo Fase 2 (signup al final), la cadena client-side
// setup → generate → ensure calendar. El cliente NUNCA ejecuta esas tres
// fases manualmente: manda draft_id una vez, este endpoint hace todo el
// trabajo server-side y es seguro llamarlo varias veces con el mismo
// draft_id (reload, doble click, dos pestañas) — ver claimOnboardingDraft y
// la transición atómica claimed/failed → processing de aquí abajo.
export async function POST(request: NextRequest) {
  const { requestId } = extractTraceHeaders(request)
  const startedAt = Date.now()

  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const draftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null
  if (!draftId) return NextResponse.json({ status: 'failed', error_code: 'invalid_draft' }, { status: 400 })

  const db = createServiceClient()

  const claim = await claimOnboardingDraft(db, draftId, user.id)
  if (!claim.ok) {
    const status = claim.errorCode === 'draft_expired' ? 410 : claim.errorCode === 'draft_claim_conflict' ? 409 : 404
    return NextResponse.json({ status: 'failed', error_code: claim.errorCode }, { status })
  }

  if (claim.justClaimed) {
    void recordBetaMetric(db, user.id, 'onboarding_draft_claimed', {
      event_id: crypto.randomUUID(),
      trace_id: claim.draft.trace_id,
      flow_version: claim.draft.flow_version,
    })
  }

  logOnboardingStage({ traceId: claim.draft.trace_id, requestId, endpoint: 'finalize', stage: 'start' })

  const rewardFromCompleted = async (draft: OnboardingDraftRow) => {
    const payload = draft.payload as Record<string, unknown>
    const missions = await loadRewardMissions(db, user.id)
    const reward = buildOnboardingReward(
      missions,
      typeof payload.daily_minutes === 'number' ? payload.daily_minutes : null,
      isPainType(payload.pain_type) ? payload.pain_type : null,
    )
    return reward
  }

  if (claim.draft.status === 'completed') {
    const reward = await rewardFromCompleted(claim.draft)
    return NextResponse.json({ status: 'completed', reward, completed_at: claim.draft.completed_at })
  }

  if (claim.draft.status === 'processing') {
    return NextResponse.json({ status: 'processing', processing_stage: claim.draft.processing_stage })
  }

  // Transición atómica: solo una request concurrente puede pasar de
  // claimed/failed a processing — ver comentario en claimOnboardingDraft.
  const { data: locked } = await db
    .from('onboarding_drafts')
    .update({ status: 'processing', processing_stage: 'validating', last_error_code: null, updated_at: new Date().toISOString() })
    .eq('id', draftId)
    .in('status', ['claimed', 'failed'])
    .select('*')
    .maybeSingle()

  if (!locked) {
    const { data: current } = await db.from('onboarding_drafts').select('*').eq('id', draftId).maybeSingle()
    const row = current as OnboardingDraftRow | null
    if (row?.status === 'completed') {
      const reward = await rewardFromCompleted(row)
      return NextResponse.json({ status: 'completed', reward, completed_at: row.completed_at })
    }
    return NextResponse.json({ status: 'processing', processing_stage: row?.processing_stage ?? null })
  }

  const draft = locked as OnboardingDraftRow
  const payload = draft.payload as Record<string, unknown>

  async function fail(errorCode: string) {
    await db.from('onboarding_drafts').update({
      status: 'failed',
      processing_stage: 'failed',
      last_error_code: errorCode,
      updated_at: new Date().toISOString(),
    }).eq('id', draftId)
    logOnboardingStage({ traceId: draft.trace_id, requestId, endpoint: 'finalize', result: 'failed', errorCode, durationMs: Date.now() - startedAt })
    return NextResponse.json({ status: 'failed', error_code: errorCode })
  }

  // Este draft es genuinamente NUEVO (si fuera un reintento del mismo draft
  // ya completado, la comprobación de claim.draft.status==='completed' de
  // arriba ya habría devuelto antes de llegar aquí) — pero el USUARIO
  // autenticado detrás de él puede llevar tiempo con una cuenta activa (p.
  // ej. volvió a /onboarding por un marcador antiguo o el botón atrás). Se
  // comprueba aquí, ANTES de saveOnboardingProfile, porque esa función
  // sobrescribe perfiles.student_exams sin condición si el draft trae el
  // campo — generateCaminoPlan tiene su propia guarda equivalente para el
  // reset de queue/calendar, pero para cuando esta función la alcanzara el
  // perfil ya se habría sobrescrito.
  if (await hasCompletedOnboarding(db, user.id)) {
    return fail('already_onboarded')
  }

  // ── validating ───────────────────────────────────────────────────────────
  const username = typeof payload.username === 'string' ? payload.username : null
  const community = typeof payload.community === 'string' ? payload.community : null
  const subjects = Array.isArray(payload.subjects) ? payload.subjects.filter((s): s is string => typeof s === 'string') : []
  if (!username || !community || subjects.length === 0) {
    return fail('invalid_draft')
  }

  const cleaned: CleanedOnboardingProfile = {
    community,
    dailyMinutes: typeof payload.daily_minutes === 'number' ? payload.daily_minutes : null,
    weeklyStudyDaysValue: typeof payload.weekly_study_days_value === 'number' ? payload.weekly_study_days_value : null,
    schoolSource: typeof payload.school_source === 'string' ? payload.school_source : null,
    username,
    schoolName: typeof payload.school_name === 'string' ? payload.school_name : '',
    subjects,
    preparationFeeling: typeof payload.preparation_feeling === 'string' ? payload.preparation_feeling : '',
    dailyStudyTime: typeof payload.daily_study_time === 'string' ? payload.daily_study_time : '',
    weeklyStudyDays: typeof payload.weekly_study_days === 'string' ? payload.weekly_study_days : '',
    studentExams: Array.isArray(payload.upcoming_exams) ? payload.upcoming_exams : [],
    gradeThresholdMode: payload.grade_threshold_mode === 'general' || payload.grade_threshold_mode === 'per_subject' ? payload.grade_threshold_mode : null,
    gradeThreshold: typeof payload.grade_threshold === 'number' ? payload.grade_threshold : null,
    subjectGradeThresholds: (payload.subject_grade_thresholds && typeof payload.subject_grade_thresholds === 'object') ? payload.subject_grade_thresholds as Record<string, number> : {},
    painType: isPainType(payload.pain_type) ? payload.pain_type : null,
  }
  const rawBodyForSave: Record<string, unknown> = {
    studentExams: cleaned.studentExams,
    subjects: cleaned.subjects,
    gradeThreshold: cleaned.gradeThreshold,
    subjectGradeThresholds: cleaned.subjectGradeThresholds,
  }

  // ── saving_profile ──────────────────────────────────────────────────────
  await db.from('onboarding_drafts').update({ processing_stage: 'saving_profile', updated_at: new Date().toISOString() }).eq('id', draftId)

  const saveResult = await saveOnboardingProfile(user.id, db, rawBodyForSave, cleaned)
  if (!saveResult.ok) {
    if (saveResult.errorCode === 'username_taken') return fail('username_taken')
    return fail('profile_save_failed')
  }

  // ── building_queue / generating_calendar ────────────────────────────────
  await db.from('onboarding_drafts').update({ processing_stage: 'building_queue', updated_at: new Date().toISOString() }).eq('id', draftId)

  const generationStartedAt = Date.now()
  await recordBetaMetric(db, user.id, 'onboarding_generation_started', {
    event_id: crypto.randomUUID(),
    trace_id: draft.trace_id,
    flow_version: FLOW_VERSION,
    request_id: requestId,
    subjects_count: cleaned.subjects.length,
  })

  const genResult = await generateCaminoPlan({
    userId: user.id,
    db,
    subjects: cleaned.subjects,
    startMode: 'zero',
    studentExams: cleaned.studentExams,
    dailyMinutes: cleaned.dailyMinutes,
    userEmail: user.email,
    userFullName: (user.user_metadata?.full_name as string | undefined) ?? null,
  })

  if (!genResult.success) {
    // Defensa en profundidad: la comprobación de arriba (antes de
    // saveOnboardingProfile) ya debería haber cortado este caso — si de
    // todos modos llega aquí (p. ej. una carrera muy estrecha entre ambas
    // comprobaciones), se reporta igual como already_onboarded en vez de un
    // fallo genérico de generación.
    if (genResult.errorCode === 'already_onboarded') return fail('already_onboarded')
    await recordBetaMetric(db, user.id, 'onboarding_generation_failed', {
      event_id: crypto.randomUUID(),
      trace_id: draft.trace_id,
      flow_version: FLOW_VERSION,
      request_id: requestId,
      generation_duration_ms: Date.now() - generationStartedAt,
      error_code: genResult.errorCode,
    })
    const mapped = genResult.errorCode === 'calendar_insert_failed' ? 'calendar_generation_failed' : 'queue_generation_failed'
    return fail(mapped)
  }

  await recordBetaMetric(db, user.id, 'onboarding_generation_succeeded', {
    event_id: crypto.randomUUID(),
    trace_id: draft.trace_id,
    flow_version: FLOW_VERSION,
    request_id: requestId,
    generation_duration_ms: Date.now() - generationStartedAt,
  })

  // ── verifying_calendar ───────────────────────────────────────────────────
  await db.from('onboarding_drafts').update({ processing_stage: 'verifying_calendar', updated_at: new Date().toISOString() }).eq('id', draftId)

  const missions = await loadRewardMissions(db, user.id)
  if (missions.length === 0) {
    return fail('calendar_verification_failed')
  }

  // ── completed: SOLO ahora se declara el onboarding realmente terminado ──
  // event_type='onboarding_completed' + payload.onboarding_completed=true es
  // el evento de negocio del que depende /api/onboarding/me — nunca antes de
  // verificar que el Camino existe de verdad (ver auditoría del blocker de
  // Fase 1: declarar completed antes de tiempo deja cuentas "completadas"
  // sin Camino real).
  const { error: completedError } = await db.from('billing_events').insert({
    user_id: user.id,
    event_type: 'onboarding_completed',
    payload: {
      community: cleaned.community,
      school_name: cleaned.schoolName,
      school_source: cleaned.schoolSource,
      subjects: cleaned.subjects,
      preparation_feeling: cleaned.preparationFeeling,
      daily_study_time: cleaned.dailyStudyTime,
      daily_minutes: cleaned.dailyMinutes,
      weekly_study_days: cleaned.weeklyStudyDays,
      weekly_study_days_value: cleaned.weeklyStudyDaysValue,
      student_exams_count: cleaned.studentExams.length,
      route_id: 'completa',
      onboarding_completed: true,
      grade_threshold_mode: cleaned.gradeThresholdMode,
      grade_threshold: cleaned.gradeThreshold,
      subject_grade_thresholds: cleaned.subjectGradeThresholds,
      pain_type: cleaned.painType,
      draft_id: draftId,
      beta_private: true,
    },
  })
  if (completedError) return fail('internal_error')

  const completedAt = new Date().toISOString()
  await db.from('onboarding_drafts').update({
    status: 'completed',
    processing_stage: 'completed',
    completed_at: completedAt,
    last_error_code: null,
    updated_at: completedAt,
  }).eq('id', draftId)

  logOnboardingStage({ traceId: draft.trace_id, requestId, endpoint: 'finalize', result: 'success', durationMs: Date.now() - startedAt })

  const reward = buildOnboardingReward(missions, cleaned.dailyMinutes, cleaned.painType)
  return NextResponse.json({ status: 'completed', reward, completed_at: completedAt })
}

function isPainType(value: unknown): value is 'daily_plan' | 'correction_confidence' | 'procrastination' | 'improve_grade' {
  return value === 'daily_plan' || value === 'correction_confidence' || value === 'procrastination' || value === 'improve_grade'
}

async function loadRewardMissions(db: SupabaseClient, userId: string): Promise<RewardMissionRow[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await db
    .from('camino_calendar')
    .select('title, subject, scheduled_date, mission_type, v2_sort_order, block_slug, metadata, created_at')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(3)

  return (data ?? []).map(row => {
    const meta = row.metadata as { topic_slug?: string | null } | null
    const topic = getTopicByV2SortOrder(row.subject, row.v2_sort_order)
      ?? (row.block_slug && meta?.topic_slug ? getTopic(row.subject, row.block_slug, meta.topic_slug) : null)
    return {
      title: row.title,
      subject: row.subject,
      scheduled_date: row.scheduled_date,
      mission_type: row.mission_type,
      supportsStepCorrection: Boolean(topic),
    }
  })
}
