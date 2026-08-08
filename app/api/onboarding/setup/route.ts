import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import {
  cleanOnboardingProfileBody,
  saveOnboardingProfile,
} from '@/app/lib/onboarding/saveOnboardingProfile'
import { extractTraceHeaders, logOnboardingStage } from '@/app/lib/onboarding/onboardingServerLog'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { traceId, requestId } = extractTraceHeaders(request)
  const startedAt = Date.now()
  logOnboardingStage({ traceId, requestId, endpoint: 'setup', stage: 'start' })

  function respond(json: Record<string, unknown>, status?: number, errorCode?: string) {
    logOnboardingStage({
      traceId,
      requestId,
      endpoint: 'setup',
      result: errorCode ? 'failed' : 'success',
      errorCode,
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json({ ...json, request_id: requestId }, status ? { status } : undefined)
  }

  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const routeId = isValidRouteId(body.routeId) ? (body.routeId as string) : 'completa'
  const cleaned = cleanOnboardingProfileBody(body)

  const serviceDb = (() => {
    try { return createServiceClient() } catch { return null }
  })()

  if (!serviceDb && cleaned.username) {
    return respond({ error: 'No se pudo guardar el nombre de usuario' }, 500, 'no_service_db')
  }

  if (serviceDb) {
    const saveResult = await saveOnboardingProfile(user.id, serviceDb, body, cleaned)
    if (!saveResult.ok) {
      if (saveResult.errorCode === 'invalid_username') {
        return respond({ error: saveResult.message }, 400, 'invalid_username')
      }
      const messages: Record<string, string> = {
        username_check_failed: 'No se pudo verificar el nombre de usuario',
        username_taken: 'Ese nombre de usuario ya está en uso',
        username_save_failed: 'No se pudo guardar el nombre de usuario',
      }
      const status = saveResult.errorCode === 'username_taken' ? 409 : 500
      return respond({ error: messages[saveResult.errorCode] }, status, saveResult.errorCode)
    }
  }

  const entryDate = new Date().toISOString().slice(0, 10)

  if (serviceDb) {
    // A diferencia del resto de métricas beta (ver recordBetaMetric), esta
    // fila SÍ es crítica: /api/onboarding/me y CaminoCalendarClient.hasProfile
    // dependen de que exista para no rebotar al alumno de vuelta a
    // /onboarding justo después de haber terminado. Tratarla como
    // "no crítica" (best-effort, error silenciado) permitía que setup
    // respondiera 200 sin haber persistido la finalización real — bug
    // encontrado en la primera prueba end-to-end de Fase 0.
    const { error: completedError } = await serviceDb.from('billing_events').insert({
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
        route_id: routeId,
        onboarding_completed: true,
        grade_threshold_mode: cleaned.gradeThresholdMode,
        grade_threshold: cleaned.gradeThreshold,
        subject_grade_thresholds: cleaned.subjectGradeThresholds,
        beta_private: true,
      },
    })
    if (completedError) {
      return respond({ error: 'No se pudo guardar tu onboarding. Prueba otra vez en unos segundos.' }, 500, 'onboarding_completed_write_failed')
    }
  }

  return respond({ ok: true, routeId, entryDate })
}
