import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase, isValidDateString } from '@/app/lib/camino/caminoProgressServer'
import { getWeakAreas } from '@/app/lib/camino/caminoWeakAreasServer'

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  const dateParam = request.nextUrl.searchParams.get('date')
  const date = isValidDateString(dateParam) ? dateParam : new Date().toISOString().slice(0, 10)

  const supabase = createUserSupabase(accessToken)

  const [progressResult, routeResult, completionsResult, missionResult, weakAreas] = await Promise.all([
    supabase.from('camino_user_progress').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('camino_route_settings').select('route_id, entry_date, pau_target_date').eq('user_id', user.id).maybeSingle(),
    supabase.from('camino_task_completions').select('task_id').eq('user_id', user.id).eq('mission_date', date),
    supabase.from('camino_daily_missions').select('completed').eq('user_id', user.id).eq('mission_date', date).maybeSingle(),
    getWeakAreas(supabase, user.id)
  ])

  const p = progressResult.data
  const r = routeResult.data
  const completedTaskIds = (completionsResult.data ?? []).map((c: { task_id: string }) => c.task_id)

  return NextResponse.json({
    progress: {
      xpTotal: p?.xp_total ?? 0,
      streakDays: p?.streak_days ?? 0,
      lastMissionDate: p?.last_mission_date ?? null,
      levelMates: p?.level_mates ?? 1,
      levelHistoria: p?.level_historia ?? 1,
      levelIngles: p?.level_ingles ?? 1,
      progressTowardsPau: p?.progress_towards_pau ?? 0,
      missionsCompleted: p?.missions_completed ?? 0
    },
    route: {
      routeId: r?.route_id ?? 'completa',
      entryDate: r?.entry_date ?? null,
      pauTargetDate: r?.pau_target_date ?? null
    },
    todayMission: {
      missionDate: date,
      completedTaskIds,
      missionCompleted: missionResult.data?.completed ?? false
    },
    weakAreas
  })
}
