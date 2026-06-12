import { NextRequest, NextResponse } from 'next/server'
import {
  getAuthContext,
  createUserSupabase,
  TASK_XP_MAP,
  TASK_TYPE_MAP,
  DAILY_TASK_IDS,
  MISSION_COMPLETION_XP,
  isValidDateString,
  isDateWithinWindow,
  getYesterday
} from '@/app/lib/camino/caminoProgressServer'

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { taskId, subjectKey } = body
  const missionDate = typeof body.missionDate === 'string' ? body.missionDate : null
  const routeIdFromClient = typeof body.routeId === 'string' ? body.routeId : 'completa'

  if (typeof taskId !== 'string' || !TASK_XP_MAP[taskId]) {
    return NextResponse.json({ error: 'taskId inválido' }, { status: 400 })
  }

  if (!missionDate || !isValidDateString(missionDate) || !isDateWithinWindow(missionDate)) {
    return NextResponse.json({ error: 'missionDate inválida o fuera de ventana' }, { status: 422 })
  }

  const xpAmount = TASK_XP_MAP[taskId]
  const taskType = TASK_TYPE_MAP[taskId]
  const userId = user.id
  const supabase = createUserSupabase(accessToken)

  // 1. Asegurar que la misión del día existe (ON CONFLICT DO NOTHING)
  await supabase.from('camino_daily_missions').upsert(
    {
      user_id: userId,
      mission_date: missionDate,
      route_id: VALID_ROUTE_IDS.includes(routeIdFromClient as typeof VALID_ROUTE_IDS[number])
        ? routeIdFromClient
        : 'completa',
      task_ids: DAILY_TASK_IDS
    },
    { onConflict: 'user_id,mission_date', ignoreDuplicates: true }
  )

  // 2. Insertar completion — si ya existe, DO NOTHING
  const { data: inserted } = await supabase
    .from('camino_task_completions')
    .upsert(
      {
        user_id: userId,
        task_id: taskId,
        task_type: taskType,
        subject_key: typeof subjectKey === 'string' ? subjectKey : null,
        mission_date: missionDate,
        xp_earned: xpAmount
      },
      { onConflict: 'user_id,task_id,mission_date', ignoreDuplicates: true }
    )
    .select('id')

  const alreadyCompleted = !inserted || inserted.length === 0
  if (alreadyCompleted) {
    const { data: currentProgress } = await supabase
      .from('camino_user_progress')
      .select('streak_days')
      .eq('user_id', userId)
      .maybeSingle()
    return NextResponse.json({
      ok: true,
      alreadyCompleted: true,
      xpEarned: 0,
      missionCompleted: false,
      newStreak: currentProgress?.streak_days ?? 0
    })
  }

  // 3. Registrar XP event de la tarea
  await supabase.from('camino_xp_events').upsert(
    {
      user_id: userId,
      source_type: 'task_completion',
      source_id: taskId,
      xp_amount: xpAmount,
      mission_date: missionDate
    },
    { onConflict: 'user_id,source_type,source_id,mission_date', ignoreDuplicates: true }
  )

  // 4. ¿Están todas las tareas del día completadas?
  const { data: allCompleted } = await supabase
    .from('camino_task_completions')
    .select('task_id')
    .eq('user_id', userId)
    .eq('mission_date', missionDate)

  const completedIds = (allCompleted ?? []).map((r: { task_id: string }) => r.task_id)
  const allDone = DAILY_TASK_IDS.every(id => completedIds.includes(id))

  // 5. ¿La misión ya estaba marcada como completada?
  const { data: missionRow } = await supabase
    .from('camino_daily_missions')
    .select('completed')
    .eq('user_id', userId)
    .eq('mission_date', missionDate)
    .single()

  const missionWasCompleted = missionRow?.completed ?? false
  const missionJustCompleted = allDone && !missionWasCompleted

  let totalXp = xpAmount
  if (missionJustCompleted) {
    // XP de completar la misión
    await supabase.from('camino_xp_events').upsert(
      {
        user_id: userId,
        source_type: 'mission_completion',
        source_id: missionDate,
        xp_amount: MISSION_COMPLETION_XP,
        mission_date: missionDate
      },
      { onConflict: 'user_id,source_type,source_id,mission_date', ignoreDuplicates: true }
    )
    totalXp += MISSION_COMPLETION_XP

    await supabase
      .from('camino_daily_missions')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('mission_date', missionDate)
  }

  // 6. Actualizar progreso del usuario (read-modify-write)
  const { data: currentProgress } = await supabase
    .from('camino_user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  let newStreak = currentProgress?.streak_days ?? 0
  if (missionJustCompleted) {
    const lastMission = currentProgress?.last_mission_date as string | null
    if (!lastMission) {
      newStreak = 1
    } else if (lastMission === missionDate) {
      newStreak = currentProgress?.streak_days ?? 1
    } else if (lastMission === getYesterday(missionDate)) {
      newStreak = (currentProgress?.streak_days ?? 0) + 1
    } else {
      newStreak = 1
    }
  }

  if (!currentProgress) {
    await supabase.from('camino_user_progress').insert({
      user_id: userId,
      xp_total: totalXp,
      streak_days: missionJustCompleted ? newStreak : 0,
      longest_streak: missionJustCompleted ? newStreak : 0,
      last_mission_date: missionJustCompleted ? missionDate : null,
      missions_completed: missionJustCompleted ? 1 : 0,
      level_mates: 1,
      level_historia: 1,
      level_ingles: 1,
      progress_towards_pau: missionJustCompleted ? 2 : 1
    })
  } else {
    const updates: Record<string, unknown> = {
      xp_total: (currentProgress.xp_total as number) + totalXp,
      progress_towards_pau: Math.min(100, (currentProgress.progress_towards_pau as number) + (missionJustCompleted ? 2 : 1)),
      updated_at: new Date().toISOString()
    }
    if (missionJustCompleted) {
      updates.streak_days = newStreak
      updates.longest_streak = Math.max(currentProgress.longest_streak as number, newStreak)
      updates.last_mission_date = missionDate
      updates.missions_completed = (currentProgress.missions_completed as number) + 1
      updates.level_mates = Math.min(20, (currentProgress.level_mates as number) + 1)
    }
    await supabase.from('camino_user_progress').update(updates).eq('user_id', userId)
  }

  return NextResponse.json({
    ok: true,
    alreadyCompleted: false,
    xpEarned: xpAmount,
    missionCompleted: allDone,
    newStreak
  })
}

const VALID_ROUTE_IDS = ['completa', 'ajustada', 'acelerada', 'sprint', 'intensiva'] as const
