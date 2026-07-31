'use client'

// Onboarding state persisted in localStorage, with server recovery via /api/onboarding/me.
// No DB migration needed for beta: /api/onboarding/setup logs the same data in Supabase.

export type OnboardingCommunity = 'Madrid' | 'Cataluña' | 'Andalucía' | 'Otra'
export type OnboardingSchoolSource = 'dataset' | 'manual' | null
export type OnboardingExamPriority = 'baja' | 'normal' | 'alta' | 'muy_alta'

export interface OnboardingStudentExam {
  id: string
  subject: string
  date: string
  block: string
  topic: string
  name: string
  priority: OnboardingExamPriority
}

export interface OnboardingData {
  community: OnboardingCommunity | null
  schoolName: string | null
  schoolSource: OnboardingSchoolSource
  subjects: string[]
  studentExams: OnboardingStudentExam[]
  preparationFeeling: string | null
  dailyStudyTime: string | null
  dailyMinutes: number | null
  weeklyStudyDays: string | null
  weeklyStudyDaysValue: number | null
  completedAt: string | null
  lastStep: string | null
  firstSessionSeen: boolean
}

const KEY = 'kairo_onboarding_v1'

export const DEFAULT_SUBJECTS: string[] = []

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

export function clearOnboarding() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}

export function syncOnboardingCommunity(data: Partial<OnboardingData>) {
  if (typeof window === 'undefined') return
  if (data.community === 'Madrid' || data.community === 'Cataluña') {
    window.localStorage.setItem('kairo_ccaa', data.community)
  }
}

export async function restoreOnboardingFromServer(accessToken: string): Promise<OnboardingData | null> {
  if (typeof window === 'undefined') return null
  try {
    const res = await fetch('/api/onboarding/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const json = await res.json() as { onboarding?: Partial<OnboardingData> | null }
    if (!json.onboarding?.completedAt) return null
    saveOnboarding(json.onboarding)
    syncOnboardingCommunity(json.onboarding)
    return loadOnboarding()
  } catch {
    return null
  }
}

export function syncLocalOnboardingToServerIfMissing(accessToken: string, onboarding = loadOnboarding()) {
  if (typeof window === 'undefined' || !onboarding.completedAt) return
  void fetch('/api/onboarding/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then(async res => {
      if (!res.ok) return
      const json = await res.json() as { onboarding?: Partial<OnboardingData> | null }
      if (json.onboarding?.completedAt) return
      await fetch('/api/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          routeId: 'completa',
          community: onboarding.community,
          schoolName: onboarding.schoolName,
          schoolSource: onboarding.schoolSource,
          subjects: onboarding.subjects,
          studentExams: onboarding.studentExams,
          preparationFeeling: onboarding.preparationFeeling,
          dailyStudyTime: onboarding.dailyStudyTime,
          dailyMinutes: onboarding.dailyMinutes,
          weeklyStudyDays: onboarding.weeklyStudyDays,
          weeklyStudyDaysValue: onboarding.weeklyStudyDaysValue,
          onboardingCompleted: true,
        }),
      })
    })
    .catch(() => undefined)
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
    studentExams: [],
    preparationFeeling: null,
    dailyStudyTime: null,
    dailyMinutes: null,
    weeklyStudyDays: null,
    weeklyStudyDaysValue: null,
    completedAt: null,
    lastStep: null,
    firstSessionSeen: false,
  }
}
