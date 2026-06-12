'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import type { CaminoRouteId, DailyCaminoTask } from '@/app/lib/camino/caminoData'
import { dailyTasks } from '@/app/lib/camino/caminoData'
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
  // Preserve any completed-mission history from today that may not be in todayMission
  if (data.todayMission.missionCompleted && !completedMissions.includes(dayKey)) {
    completedMissions.push(dayKey)
  }
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

export function useCaminoProgress() {
  const dayKey = useMemo(() => todayKey(), [])
  const [progress, setProgress] = useState<CaminoProgress>(() => createInitialProgress(dayKey))
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<CaminoSource>('local')
  const accessTokenRef = useRef<string | null>(null)

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
      return true
    } catch {
      return false
    }
  }, [dayKey])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) {
        setProgress(loadCaminoProgress(dayKey))
        setSource('local')
        setLoading(false)
        return
      }
      accessTokenRef.current = session.access_token
      fetchFromSupabase(session.access_token).finally(() => {
        setLoading(false)
      })
    }).catch(() => {
      setProgress(loadCaminoProgress(dayKey))
      setSource('local')
      setLoading(false)
    })
  }, [dayKey, fetchFromSupabase])

  // Guardar en localStorage cuando source='local' para que persista entre sesiones
  useEffect(() => {
    if (source === 'local' && !loading) {
      saveCaminoProgress(progress)
    }
  }, [progress, source, loading])

  const completeTask = useCallback(async (task: DailyCaminoTask) => {
    const token = accessTokenRef.current

    if (!token) {
      setProgress(current => {
        const next = completeCaminoTask(current, dayKey, task, dailyTasks)
        saveCaminoProgress(next)
        return next
      })
      return
    }

    // Optimistic update
    setProgress(current => completeCaminoTask(current, dayKey, task, dailyTasks))

    try {
      const res = await fetch('/api/camino/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskId: task.id,
          taskType: task.type,
          subjectKey: task.subjectKey ?? null,
          missionDate: dayKey,
          routeId: progress.selectedRouteId
        })
      })
      if (res.ok) {
        // Reconciliar con estado real del servidor
        await fetchFromSupabase(token)
      }
    } catch {
      // Fallo silencioso — el estado optimista local se mantiene
    }
  }, [dayKey, progress.selectedRouteId, fetchFromSupabase])

  const changeRoute = useCallback(async (routeId: CaminoRouteId) => {
    // Actualización inmediata local
    setProgress(current => setCaminoRoute(current, routeId))

    const token = accessTokenRef.current
    if (!token) return

    try {
      await fetch('/api/camino/route', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ routeId })
      })
    } catch {
      // Fallo silencioso — el cambio de ruta ya está en estado local
    }
  }, [])

  const resetProgress = useCallback(async () => {
    const token = accessTokenRef.current

    if (!token) {
      setProgress(resetCaminoProgress(dayKey))
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
        // Usuario no interno — reset solo local
        setProgress(resetCaminoProgress(dayKey))
      }
    } catch {
      setProgress(resetCaminoProgress(dayKey))
    }
  }, [dayKey, fetchFromSupabase])

  return {
    progress,
    loading,
    source,
    dayKey,
    completeTask,
    changeRoute,
    resetProgress
  }
}
