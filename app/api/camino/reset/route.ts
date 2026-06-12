import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase, isValidDateString } from '@/app/lib/camino/caminoProgressServer'
import { isInternalUser } from '@/app/lib/internalUsers'

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  if (!isInternalUser(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let missionDate: string
  try {
    const body = await request.json()
    missionDate = isValidDateString(body?.missionDate) ? body.missionDate : new Date().toISOString().slice(0, 10)
  } catch {
    missionDate = new Date().toISOString().slice(0, 10)
  }

  const adminSupabase = createServiceSupabase()
  if (!adminSupabase) {
    return NextResponse.json({ error: 'Service role no configurado' }, { status: 500 })
  }

  const userId = user.id

  // Borrar tareas, misión y XP del día actual
  await adminSupabase.from('camino_task_completions').delete().eq('user_id', userId).eq('mission_date', missionDate)
  await adminSupabase.from('camino_daily_missions').delete().eq('user_id', userId).eq('mission_date', missionDate)
  await adminSupabase.from('camino_xp_events').delete().eq('user_id', userId).eq('mission_date', missionDate)

  // Resetear agregados a cero
  const { data: existingProgress } = await adminSupabase
    .from('camino_user_progress')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingProgress) {
    await adminSupabase.from('camino_user_progress').update({
      xp_total: 0,
      streak_days: 0,
      longest_streak: 0,
      last_mission_date: null,
      missions_completed: 0,
      level_mates: 1,
      level_historia: 1,
      level_ingles: 1,
      progress_towards_pau: 0,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
