import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const VALID_SCHOOL_SOURCES = ['dataset', 'manual'] as const

function cleanString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function cleanSubjects(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 12)
    : []
}

function cleanCommunity(value: unknown) {
  return VALID_COMMUNITIES.includes(value as typeof VALID_COMMUNITIES[number])
    ? value as typeof VALID_COMMUNITIES[number]
    : null
}

function cleanSchoolSource(value: unknown) {
  return VALID_SCHOOL_SOURCES.includes(value as typeof VALID_SCHOOL_SOURCES[number])
    ? value as typeof VALID_SCHOOL_SOURCES[number]
    : null
}

function cleanDailyMinutes(value: unknown) {
  return VALID_DAILY_MINUTES.includes(value as typeof VALID_DAILY_MINUTES[number])
    ? value as typeof VALID_DAILY_MINUTES[number]
    : null
}

function cleanWeeklyDays(value: unknown) {
  return VALID_WEEKLY_DAYS.includes(value as typeof VALID_WEEKLY_DAYS[number])
    ? value as typeof VALID_WEEKLY_DAYS[number]
    : null
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let db: ReturnType<typeof createServiceClient>
  try {
    db = createServiceClient()
  } catch {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
  }

  const { data, error } = await db
    .from('billing_events')
    .select('payload, created_at')
    .eq('user_id', user.id)
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'No se pudo recuperar el onboarding' }, { status: 500 })
  }

  const payload = data?.payload as Record<string, unknown> | null | undefined
  if (!data || !payload || payload.onboarding_completed !== true) {
    return NextResponse.json({ onboarding: null })
  }

  return NextResponse.json({
    onboarding: {
      community: cleanCommunity(payload.community),
      schoolName: cleanString(payload.school_name),
      schoolSource: cleanSchoolSource(payload.school_source),
      subjects: cleanSubjects(payload.subjects),
      preparationFeeling: cleanString(payload.preparation_feeling),
      dailyStudyTime: cleanString(payload.daily_study_time),
      dailyMinutes: cleanDailyMinutes(payload.daily_minutes),
      weeklyStudyDays: cleanString(payload.weekly_study_days),
      weeklyStudyDaysValue: cleanWeeklyDays(payload.weekly_study_days_value),
      completedAt: data.created_at,
      lastStep: null,
    },
  })
}
