import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { ensureUserInstituteMembership } from '@/app/lib/camino/institutePace'

export const dynamic = 'force-dynamic'

const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const VALID_SCHOOL_SOURCES = ['dataset', 'manual'] as const
const VALID_EXAM_PRIORITIES = ['baja', 'normal', 'alta', 'muy_alta'] as const

function cleanString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 160) : fallback
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 12)
    : []
}

function cleanStudentExams(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .flatMap((raw, index) => {
      if (!raw || typeof raw !== 'object') return []
      const exam = raw as Record<string, unknown>
      const subject = cleanString(exam.subject, '').slice(0, 80)
      const date = cleanString(exam.date, '').slice(0, 10)
      if (!subject || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
      const priority = VALID_EXAM_PRIORITIES.includes(exam.priority as typeof VALID_EXAM_PRIORITIES[number])
        ? (exam.priority as string)
        : 'normal'
      return [{
        id: cleanString(exam.id, `onboarding-exam-${index + 1}`).slice(0, 80),
        subject,
        date,
        block: cleanString(exam.block, 'Repaso general').slice(0, 80) || 'Repaso general',
        topic: cleanString(exam.topic, '').slice(0, 120),
        name: cleanString(exam.name, `Parcial de ${subject}`).slice(0, 120) || `Parcial de ${subject}`,
        priority,
      }]
    })
    .slice(0, 8)
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
  const schoolName = cleanString(body.schoolName)
  const subjects = cleanStringArray(body.subjects)
  const preparationFeeling = cleanString(body.preparationFeeling)
  const dailyStudyTime = cleanString(body.dailyStudyTime)
  const weeklyStudyDays = cleanString(body.weeklyStudyDays)
  const studentExams = cleanStudentExams(body.studentExams)

  const entryDate = new Date().toISOString().slice(0, 10)

  const serviceDb = (() => {
    try { return createServiceClient() } catch { return null }
  })()

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
      })
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ ok: true, routeId, entryDate })
}
