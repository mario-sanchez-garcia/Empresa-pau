import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { ensureUserInstituteMembership } from '@/app/lib/camino/institutePace'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { normalizeUsername, validateUsername } from '@/app/lib/username'
import { MAX_GRADE_THRESHOLD, MIN_GRADE_THRESHOLD, type GradeThresholdMode } from '@/app/lib/camino/gradeThreshold'

export const dynamic = 'force-dynamic'

const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const VALID_SCHOOL_SOURCES = ['dataset', 'manual'] as const
const VALID_GRADE_THRESHOLD_MODES = ['general', 'per_subject'] as const

function cleanGradeThresholdMode(value: unknown): GradeThresholdMode | null {
  return (VALID_GRADE_THRESHOLD_MODES as readonly string[]).includes(value as string) ? (value as GradeThresholdMode) : null
}

function cleanGradeThreshold(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, n)) : null
}

function cleanSubjectGradeThresholds(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, number] => entry[0].length <= 40 && Number.isFinite(Number(entry[1])))
    .slice(0, 12)
    .map(([slug, raw]) => [slug, Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, Number(raw)))] as [string, number])
  return Object.fromEntries(entries)
}

function cleanString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 160) : fallback
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 12)
    : []
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const routeId = isValidRouteId(body.routeId) ? (body.routeId as string) : 'completa'
  const community = VALID_COMMUNITIES.includes(body.community as typeof VALID_COMMUNITIES[number])
    ? (body.community as string) : 'Otra'
  const dailyMinutes = VALID_DAILY_MINUTES.includes(body.dailyMinutes as typeof VALID_DAILY_MINUTES[number])
    ? (body.dailyMinutes as number) : null
  const weeklyStudyDaysValue = VALID_WEEKLY_DAYS.includes(body.weeklyStudyDaysValue as typeof VALID_WEEKLY_DAYS[number])
    ? (body.weeklyStudyDaysValue as number) : null
  const schoolSource = VALID_SCHOOL_SOURCES.includes(body.schoolSource as typeof VALID_SCHOOL_SOURCES[number])
    ? (body.schoolSource as string) : null
  const username = typeof body.username === 'string' ? body.username.trim().slice(0, 20) || null : null
  const schoolName = cleanString(body.schoolName)
  const subjects = cleanStringArray(body.subjects)
  const preparationFeeling = cleanString(body.preparationFeeling)
  const dailyStudyTime = cleanString(body.dailyStudyTime)
  const weeklyStudyDays = cleanString(body.weeklyStudyDays)
  const studentExams = cleanStudentExams(body.studentExams)
  const gradeThresholdMode = cleanGradeThresholdMode(body.gradeThresholdMode)
  const gradeThreshold = body.gradeThreshold !== undefined ? cleanGradeThreshold(body.gradeThreshold) : null
  const subjectGradeThresholds = cleanSubjectGradeThresholds(body.subjectGradeThresholds)

  if (username) {
    const validationError = validateUsername(username)
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const entryDate = new Date().toISOString().slice(0, 10)

  const serviceDb = (() => {
    try { return createServiceClient() } catch { return null }
  })()

  if (!serviceDb && username) {
    return NextResponse.json({ error: 'No se pudo guardar el nombre de usuario' }, { status: 500 })
  }

  if (serviceDb) {
    try {
      await ensureUserInstituteMembership(serviceDb, {
        userId: user.id,
        community,
        schoolName,
        schoolSource,
        membershipSource: 'onboarding',
      })
    } catch { /* institute membership is non-critical during rollout */ }
  }

  if (serviceDb) {
    if (Array.isArray(body.studentExams)) {
      try {
        await serviceDb
          .from('perfiles')
          .upsert({ id: user.id, student_exams: studentExams }, { onConflict: 'id' })
      } catch { /* optional upcoming exams must not block onboarding */ }
    }

    try {
      await serviceDb.from('perfiles').upsert({ id: user.id, comunidad: community }, { onConflict: 'id' })
    } catch { /* non-critical */ }

    if (gradeThresholdMode || body.gradeThreshold !== undefined || body.subjectGradeThresholds !== undefined) {
      try {
        await serviceDb.from('perfiles').upsert({
          id: user.id,
          ...(gradeThresholdMode ? { grade_threshold_mode: gradeThresholdMode } : {}),
          ...(body.gradeThreshold !== undefined ? { grade_threshold: gradeThreshold } : {}),
          ...(body.subjectGradeThresholds !== undefined ? { subject_grade_thresholds: subjectGradeThresholds } : {}),
        }, { onConflict: 'id' })
      } catch { /* non-critical: el alumno puede ajustarlo luego en Ajustes */ }
    }

    if (username) {
      const normalized = normalizeUsername(username)
      const { data: existing, error: existingError } = await serviceDb
        .from('perfiles')
        .select('id')
        .eq('username_normalized', normalized)
        .neq('id', user.id)
        .maybeSingle()

      if (existingError) {
        return NextResponse.json({ error: 'No se pudo verificar el nombre de usuario' }, { status: 500 })
      }
      if (existing) {
        return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
      }

      const { error: usernameError } = await serviceDb.from('perfiles').upsert(
        { id: user.id, username, username_normalized: normalized },
        { onConflict: 'id' }
      )
      if (usernameError) {
        return NextResponse.json({ error: 'No se pudo guardar el nombre de usuario' }, { status: 500 })
      }
    }

    if (Array.isArray(body.subjects)) {
      try {
        // Fuente de verdad server-side de "qué asignaturas tiene el
        // alumno" — antes solo vivía en el snapshot de billing_events
        // (ver /api/onboarding/me), lo que dejaba a cada navegador con su
        // propia copia local sin forma de reconciliarse con el servidor.
        await serviceDb.from('perfiles').upsert({ id: user.id, subjects }, { onConflict: 'id' })
      } catch { /* non-critical: el snapshot de billing_events de abajo sigue funcionando como fallback */ }
    }
  }

  if (serviceDb) {
    try {
      await recordBetaMetric(serviceDb, user.id, 'onboarding_completed', {
        community,
        school_name: schoolName,
        school_source: schoolSource,
        subjects,
        preparation_feeling: preparationFeeling,
        daily_study_time: dailyStudyTime,
        daily_minutes: dailyMinutes,
        weekly_study_days: weeklyStudyDays,
        weekly_study_days_value: weeklyStudyDaysValue,
        student_exams_count: studentExams.length,
        route_id: routeId,
        onboarding_completed: true,
        grade_threshold_mode: gradeThresholdMode,
        grade_threshold: gradeThreshold,
        subject_grade_thresholds: subjectGradeThresholds,
      })
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ ok: true, routeId, entryDate })
}
