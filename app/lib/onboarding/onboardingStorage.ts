'use client'

// Onboarding state persisted in localStorage.
// No DB migration needed for beta: /api/onboarding/setup logs the same data in Supabase.

export type OnboardingCommunity = 'Madrid' | 'Cataluña' | 'Andalucía' | 'Otra'
export type OnboardingSchoolSource = 'dataset' | 'manual' | null

export interface OnboardingData {
  community: OnboardingCommunity | null
  schoolName: string | null
  schoolSource: OnboardingSchoolSource
  subjects: string[]
  preparationFeeling: string | null
  dailyStudyTime: string | null
  dailyMinutes: number | null
  weeklyStudyDays: string | null
  weeklyStudyDaysValue: number | null
  completedAt: string | null
}

const KEY = 'pausia_onboarding_v1'

export const DEFAULT_SUBJECTS = ['Matemáticas II', 'Matemáticas CCSS', 'Historia de España', 'Inglés']

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
  return {
    community: null,
    schoolName: null,
    schoolSource: null,
    subjects: DEFAULT_SUBJECTS,
    preparationFeeling: null,
    dailyStudyTime: null,
    dailyMinutes: null,
    weeklyStudyDays: null,
    weeklyStudyDaysValue: null,
    completedAt: null,
  }
}
