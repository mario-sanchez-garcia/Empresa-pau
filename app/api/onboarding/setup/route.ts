import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const VALID_SCHOOL_SOURCES = ['dataset', 'manual'] as const

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
  const { user, accessToken } = authContext

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

  const entryDate = new Date().toISOString().slice(0, 10)
  const userSupabase = createUserSupabase(accessToken)

  await userSupabase.from('camino_route_settings').upsert(
    {
      user_id: user.id,
      route_id: routeId,
      entry_date: entryDate,
      changed_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  )

  try {
    const serviceDb = createServiceClient()
    await serviceDb.from('billing_events').insert({
      user_id: user.id,
      event_type: 'onboarding_completed',
      payload: {
        community,
        school_name: schoolName,
        school_source: schoolSource,
        subjects,
        preparation_feeling: preparationFeeling,
        daily_study_time: dailyStudyTime,
        daily_minutes: dailyMinutes,
        weekly_study_days: weeklyStudyDays,
        weekly_study_days_value: weeklyStudyDaysValue,
        route_id: routeId,
        onboarding_completed: true,
      }
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, routeId, entryDate })
}
