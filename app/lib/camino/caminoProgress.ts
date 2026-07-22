import type { CaminoRouteId, DailyCaminoTask } from './caminoData'

export const CAMINO_PROGRESS_STORAGE_KEY = 'kairo_camino_progress_v1'

export interface CaminoProgress {
  xpTotal: number
  streakDays: number
  lastCompletedDate: string | null
  completedTasksByDate: Record<string, string[]>
  selectedRouteId: CaminoRouteId
  completedMissions: string[]
  levelBySubject: Record<'mates' | 'historia' | 'ingles', number>
  progressTowardsPau: number
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function createInitialProgress(_dayKey = todayKey()): CaminoProgress {
  return {
    xpTotal: 0,
    streakDays: 0,
    lastCompletedDate: null,
    completedTasksByDate: {},
    selectedRouteId: 'completa',
    completedMissions: [],
    levelBySubject: { mates: 1, historia: 1, ingles: 1 },
    progressTowardsPau: 0
  }
}

export function loadCaminoProgress(dayKey = todayKey()): CaminoProgress {
  if (typeof window === 'undefined') return createInitialProgress(dayKey)

  try {
    const raw = window.localStorage.getItem(CAMINO_PROGRESS_STORAGE_KEY)
    if (!raw) return createInitialProgress(dayKey)
    const parsed = JSON.parse(raw) as Partial<CaminoProgress>
    const fallback = createInitialProgress(dayKey)
    return {
      xpTotal: typeof parsed.xpTotal === 'number' ? parsed.xpTotal : fallback.xpTotal,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : fallback.streakDays,
      lastCompletedDate: typeof parsed.lastCompletedDate === 'string' ? parsed.lastCompletedDate : null,
      completedTasksByDate: parsed.completedTasksByDate && typeof parsed.completedTasksByDate === 'object' ? parsed.completedTasksByDate : fallback.completedTasksByDate,
      selectedRouteId: isRouteId(parsed.selectedRouteId) ? parsed.selectedRouteId : fallback.selectedRouteId,
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions.filter(isString) : [],
      levelBySubject: {
        mates: parsed.levelBySubject?.mates ?? fallback.levelBySubject.mates,
        historia: parsed.levelBySubject?.historia ?? fallback.levelBySubject.historia,
        ingles: parsed.levelBySubject?.ingles ?? fallback.levelBySubject.ingles
      },
      progressTowardsPau: typeof parsed.progressTowardsPau === 'number' ? parsed.progressTowardsPau : fallback.progressTowardsPau
    }
  } catch {
    return createInitialProgress(dayKey)
  }
}

export function saveCaminoProgress(progress: CaminoProgress) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CAMINO_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

export function resetCaminoProgress(dayKey = todayKey()) {
  const next = createInitialProgress(dayKey)
  saveCaminoProgress(next)
  return next
}

export function isTaskCompleted(progress: CaminoProgress, dayKey: string, taskId: string) {
  return (progress.completedTasksByDate[dayKey] ?? []).includes(taskId)
}

export function completedTasksForDate(progress: CaminoProgress, dayKey: string) {
  return progress.completedTasksByDate[dayKey] ?? []
}

export function completeCaminoTask(progress: CaminoProgress, dayKey: string, task: DailyCaminoTask, allTasks: DailyCaminoTask[]) {
  const currentTasks = progress.completedTasksByDate[dayKey] ?? []
  if (currentTasks.includes(task.id)) return progress

  const nextCompletedTasks = [...currentTasks, task.id]
  const allDone = allTasks.every(item => nextCompletedTasks.includes(item.id))
  const missionWasCompleted = progress.completedMissions.includes(dayKey)

  return {
    ...progress,
    xpTotal: progress.xpTotal + task.xp,
    streakDays: allDone && !missionWasCompleted ? progress.streakDays + 1 : progress.streakDays,
    lastCompletedDate: allDone ? dayKey : progress.lastCompletedDate,
    completedTasksByDate: {
      ...progress.completedTasksByDate,
      [dayKey]: nextCompletedTasks
    },
    completedMissions: allDone && !missionWasCompleted ? [...progress.completedMissions, dayKey] : progress.completedMissions,
    levelBySubject: {
      ...progress.levelBySubject,
      mates: Math.min(20, progress.levelBySubject.mates + (allDone && !missionWasCompleted ? 1 : 0))
    },
    progressTowardsPau: Math.min(100, progress.progressTowardsPau + (allDone && !missionWasCompleted ? 2 : 1))
  }
}

export function setCaminoRoute(progress: CaminoProgress, routeId: CaminoRouteId) {
  return { ...progress, selectedRouteId: routeId }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isRouteId(value: unknown): value is CaminoRouteId {
  return value === 'completa' || value === 'ajustada' || value === 'acelerada' || value === 'sprint' || value === 'intensiva'
}
