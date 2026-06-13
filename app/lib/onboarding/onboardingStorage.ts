'use client'

// Onboarding state persisted in localStorage.
// No new DB migration needed: route selection is saved via /api/camino/route
// and this metadata stays local (suitable for MVP).

export type OnboardingCommunity = 'Madrid' | 'Cataluña' | 'Andalucía' | 'Otra'
export type OnboardingDailyMinutes = 15 | 25 | 40
export type OnboardingStartMode = 'septiembre' | 'empezado' | 'retraso' | 'intensivo'

export interface OnboardingData {
  community: OnboardingCommunity | null
  subjects: string[]
  dailyMinutes: OnboardingDailyMinutes | null
  startMode: OnboardingStartMode | null
  completedAt: string | null
}

const KEY = 'pausia_onboarding_v1'

export const DEFAULT_SUBJECTS = ['Matemáticas II', 'Historia de España', 'Inglés']

export function loadOnboarding(): OnboardingData {
  if (typeof window === 'undefined') return emptyOnboarding()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return emptyOnboarding()
    return { ...emptyOnboarding(), ...(JSON.parse(raw) as Partial<OnboardingData>) }
  } catch {
    return emptyOnboarding()
  }
}

export function saveOnboarding(data: Partial<OnboardingData>) {
  if (typeof window === 'undefined') return
  const current = loadOnboarding()
  window.localStorage.setItem(KEY, JSON.stringify({ ...current, ...data }))
}

export function markOnboardingComplete() {
  saveOnboarding({ completedAt: new Date().toISOString() })
}

export function isOnboardingComplete(): boolean {
  return Boolean(loadOnboarding().completedAt)
}

function emptyOnboarding(): OnboardingData {
  return { community: null, subjects: DEFAULT_SUBJECTS, dailyMinutes: null, startMode: null, completedAt: null }
}

// Map startMode → CaminoRouteId
export function startModeToRouteId(mode: OnboardingStartMode | null): string {
  switch (mode) {
    case 'septiembre': return 'completa'
    case 'empezado':   return 'ajustada'
    case 'retraso':    return 'acelerada'
    case 'intensivo':  return 'intensiva'
    default:           return 'completa'
  }
}
