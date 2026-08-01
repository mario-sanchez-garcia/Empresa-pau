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
  username: string | null
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

// El servidor (billing_events.onboarding_completed) es la única fuente de
// verdad de si una cuenta completó onboarding. `kairo_onboarding_v1` vive en
// localStorage sin estar vinculado al usuario, así que en un navegador
// compartido entre cuentas (p.ej. varias cuentas de prueba) puede contener
// datos de OTRA cuenta. Por eso distinguimos "el servidor confirma que no
// hay onboarding" (status 'empty', autoritativo) de "no se pudo consultar"
// (status 'error', se ignora y se mantiene el estado local ya pintado).
export type OnboardingRestoreResult =
  | { status: 'found'; data: OnboardingData }
  | { status: 'empty' }
  | { status: 'error' }

export async function restoreOnboardingFromServer(accessToken: string): Promise<OnboardingRestoreResult> {
  if (typeof window === 'undefined') return { status: 'error' }
  try {
    const res = await fetch('/api/onboarding/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return { status: 'error' }
    const json = await res.json() as { onboarding?: Partial<OnboardingData> | null }
    if (!json.onboarding?.completedAt) return { status: 'empty' }
    saveOnboarding(json.onboarding)
    syncOnboardingCommunity(json.onboarding)
    return { status: 'found', data: loadOnboarding() }
  } catch {
    return { status: 'error' }
  }
}

export function markOnboardingComplete() {
  saveOnboarding({ completedAt: new Date().toISOString() })
}

export function isOnboardingComplete(): boolean {
  return Boolean(loadOnboarding().completedAt)
}

function emptyOnboarding(): OnboardingData {
  return {
    username: null,
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
