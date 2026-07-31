'use client'

export const PROFILE_PREFERENCES_CHANGE_EVENT = 'kairo_profile_preferences_change'
const BASE_KEY = 'kairo_profile_preferences'

export type LocalProfilePreferences = {
  displayName?: string
  photo?: string
  dailyGoal?: number
  educationLevel?: string
  defaultSubject?: string
  correctionStyle?: 'breve' | 'normal' | 'detallado'
  longAdvice?: boolean
}

export function profilePreferencesKey(userId: string | null | undefined) {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY
}

export function loadProfilePreferences(userId: string | null | undefined): LocalProfilePreferences {
  if (typeof window === 'undefined' || !userId) return {}
  try {
    return JSON.parse(window.localStorage.getItem(profilePreferencesKey(userId)) ?? '{}') as LocalProfilePreferences
  } catch {
    return {}
  }
}

export function saveProfilePreferences(userId: string | null | undefined, preferences: LocalProfilePreferences) {
  if (typeof window === 'undefined' || !userId) return
  window.localStorage.setItem(profilePreferencesKey(userId), JSON.stringify(preferences))
  window.dispatchEvent(new Event(PROFILE_PREFERENCES_CHANGE_EVENT))
}
