'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import type { CaminoRouteId, DailyCaminoTask } from '@/app/lib/camino/caminoData'
import { dailyTasks as fallbackTasks } from '@/app/lib/camino/caminoData'
import {
  completeCaminoTask,
  createInitialProgress,
  loadCaminoProgress,
  resetCaminoProgress,
  saveCaminoProgress,
  setCaminoRoute,
  todayKey,
  type CaminoProgress
} from '@/app/lib/camino/caminoProgress'
import { getMissionForDate, type WeekContext } from '@/app/lib/camino/caminoMissionGenerator'

export type CaminoSource = 'local' | 'supabase'

interface SupabaseStateResponse {
  progress: {
    xpTotal: number
    streakDays: number
    lastMissionDate: string | null
    levelMates: number
    levelHistoria: number
    levelIngles: number
    progressTowardsPau: number
    missionsCompleted: number
  }
  route: {
    routeId: string
    entryDate: string | null
    pauTargetDate: string | null
  }
  todayMission: {
    missionDate: string
    completedTaskIds: string[]
    missionCompleted: boolean
  }
}

function mapToProgress(data: SupabaseStateResponse, dayKey: string): CaminoProgress {
  const completedByDate: Record<string, string[]> = {}
  if (data.todayMission.completedTaskIds.length > 0) {
    completedByDate[data.todayMission.missionDate] = data.todayMission.completedTaskIds
  }
  const completedMissions = data.todayMission.missionCompleted ? [data.todayMission.missionDate] : []
  return {
    xpTotal: data.progress.xpTotal,
    streakDays: data.progress.streakDays,
    lastCompletedDate: data.progress.lastMissionDate,
    completedTasksByDate: completedByDate,
    selectedRouteId: data.route.routeId as CaminoRouteId,
    completedMissions,
    levelBySubject: {
      mates: data.progress.levelMates,
      historia: data.progress.levelHistoria,
      ingles: data.progress.levelIngles
    },
    progressTowardsPau: data.progress.progressTowardsPau
  }
}

// Genera las tareas del día desde el currículum o usa fallback local.
function generateTasks(
  routeId: string,
  entryDate: string | null,
  today: string,
  weakBlocks: string[] = []
): { tasks: DailyCaminoTask[]; weekContext: WeekContext | null } {
  try {
    const result = getMissionForDate({ entryDate, routeId, today, weakBlocks })
    if (result.tasks.length > 0) return result
  } catch {
    // Fallback silencioso
  }
  return { tasks: fallbackTasks, weekContext: null }
}

export function useCaminoProgress() {
  const dayKey = useMemo(() => todayKey(), [])
  const [progress, setProgress] = useState<CaminoProgress>(() => createInitialProgress(dayKey))
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<CaminoSource>('local')
  const [weekContext, setWeekContext] = useState<WeekContext | null>(null)
  const [currentTasks, setCurrentTasks] = useState<DailyCaminoTask[]>(fallbackTasks)
  const accessTokenRef = useRef<string | null>(null)
  const entryDateRef = useRef<string | null>(null)
  const weakBlocksRef = useRef<string[]>([])

  const updateMission = useCallback((routeId: string, entryDate: string | null, weakBlocks: string[]) => {
    const { tasks, weekContext: ctx } = generateTasks(routeId, entryDate, dayKey, weakBlocks)
    setCurrentTasks(tasks)
    setWeekContext(ctx)
  }, [dayKey])

  const fetchFromSupabase = useCallback(async (token: string) => {
    try {
      const res = await fetch(`/api/camino/state?date=${dayKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return false
      const data: SupabaseStateResponse = await res.json()
      const mapped = mapToProgress(data, dayKey)
      setProgress(mapped)
      setSource('supabase')
      saveCaminoProgress(mapped)
      // Actualizar misión con datos reales de ruta + weak areas
      entryDateRef.current = data.route.entryDate
      updateMission(data.route.routeId, data.route.entryDate, weakBlocksRef.current)
      return true
    } catch {
      return false
    }
  }, [dayKey, updateMission])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) {
        const localProgress = loadCaminoProgress(dayKey)
        setProgress(localProgress)
        setSource('local')
        // Generar misión desde datos locales
        updateMission(localProgress.selectedRouteId, null, [])
        setLoading(false)
        return
      }
      accessTokenRef.current = session.access_token
      fetchFromSupabase(session.access_token).catch(() => {
        const localProgress = loadCaminoProgress(dayKey)
        setProgress(localProgress)
        updateMission(localProgress.selectedRouteId, null, [])
      }).finally(() => setLoading(false))
    }).catch(() => {
      const localProgress = loadCaminoProgress(dayKey)
      setProgress(localProgress)
      setSource('local')
      updateMission(localProgress.selectedRouteId, null, [])
      setLoading(false)
    })
  }, [dayKey, fetchFromSupabase, updateMission])

  // Guardar en localStorage cuando source='local'
  useEffect(() => {
    if (source === 'local' && !loading) {
      saveCaminoProgress(progress)
    }
  }, [progress, source, loading])

  const completeTask = useCallback(async (task: DailyCaminoTask) => {
    const token = accessTokenRef.current

    if (!token) {
      setProgress(current => {
        const next = completeCaminoTask(current, dayKey, task, currentTasks)
        saveCaminoProgress(next)
        return next
      })
      return
    }

    // Actualización optimista
    setProgress(current => completeCaminoTask(current, dayKey, task, currentTasks))

    try {
      const res = await fetch('/api/camino/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskId: task.id,
          taskType: task.type,
          subjectKey: task.subjectKey ?? null,
          missionDate: dayKey,
          routeId: progress.selectedRouteId,
          missionTaskIds: currentTasks.map(t => t.id)
        })
      })
      if (res.ok) {
        await fetchFromSupabase(token)
      }
    } catch {
      // Fallo silencioso — estado optimista local se mantiene
    }
  }, [dayKey, progress.selectedRouteId, currentTasks, fetchFromSupabase])

  const changeRoute = useCallback(async (routeId: CaminoRouteId) => {
    setProgress(current => setCaminoRoute(current, routeId))
    updateMission(routeId, entryDateRef.current, weakBlocksRef.current)

    const token = accessTokenRef.current
    if (!token) return

    try {
      await fetch('/api/camino/route', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ routeId })
      })
    } catch {
      // Fallo silencioso
    }
  }, [updateMission])

  const resetProgress = useCallback(async () => {
    const token = accessTokenRef.current

    if (!token) {
      const next = resetCaminoProgress(dayKey)
      setProgress(next)
      setSource('local')
      return
    }

    try {
      const res = await fetch('/api/camino/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ missionDate: dayKey })
      })
      if (res.ok) {
        await fetchFromSupabase(token)
      } else if (res.status === 403) {
        const next = resetCaminoProgress(dayKey)
        setProgress(next)
      }
    } catch {
      const next = resetCaminoProgress(dayKey)
      setProgress(next)
    }
  }, [dayKey, fetchFromSupabase])

  return {
    progress,
    loading,
    source,
    dayKey,
    currentTasks,
    weekContext,
    completeTask,
    changeRoute,
    resetProgress
  }
}
