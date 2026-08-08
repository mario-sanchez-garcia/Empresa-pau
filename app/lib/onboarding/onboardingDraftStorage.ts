'use client'

// Fase 2 (signup al final): borrador local INDEPENDIENTE del antiguo
// `kairo_onboarding_v1` (ver onboardingStorage.ts). Nace justo antes de que
// el alumno abandone la pestaña para autenticarse (Google OAuth o enlace de
// confirmación por email) y debe sobrevivir ese viaje de ida y vuelta —
// clearOnboarding() (llamado desde /login y /auth/callback para descartar
// onboarding de OTRA cuenta en el mismo navegador) NUNCA debe poder
// destruirlo, por eso vive bajo una clave distinta y con su propio ciclo de
// vida.
//
// No es la fuente de verdad — el server draft (tabla onboarding_drafts) lo
// es en cuanto existe. Este local draft es solo la copia de respaldo que
// permite reconstruir la pantalla de signup si el usuario recarga antes de
// autenticarse, y guardar el draft_id opaco devuelto por
// POST /api/onboarding/draft.

import type {
  OnboardingCommunity,
  OnboardingData,
  OnboardingGradeThresholdMode,
  OnboardingSchoolSource,
  OnboardingStudentExam,
} from '@/app/lib/onboarding/onboardingStorage'
import type { PainType } from '@/app/lib/onboarding/onboardingStorage'

export interface LocalOnboardingDraft {
  version: 1
  draftId: string | null
  traceId: string | null
  createdAt: string
  expiresAt: string
  painType: PainType | null
  username: string | null
  community: OnboardingCommunity | null
  schoolName: string | null
  schoolSource: OnboardingSchoolSource
  subjects: string[]
  upcomingExams: OnboardingStudentExam[]
  preparationLevel: string | null
  minutesPerSession: number | null
  studyDays: number | null
  gradeThresholdMode: OnboardingGradeThresholdMode
  gradeThreshold: number | null
  subjectGradeThresholds: Record<string, number>
  lastStep: string | null
}

const KEY = 'kairo_onboarding_draft_v1'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

function isExpired(draft: LocalOnboardingDraft): boolean {
  const expiresAt = Date.parse(draft.expiresAt)
  return Number.isFinite(expiresAt) && Date.now() > expiresAt
}

export function saveLocalDraft(data: OnboardingData, draftId?: string | null): LocalOnboardingDraft {
  const existing = loadLocalDraft()
  const now = new Date()
  const draft: LocalOnboardingDraft = {
    version: 1,
    draftId: draftId !== undefined ? draftId : existing?.draftId ?? null,
    traceId: data.traceId,
    createdAt: existing?.createdAt ?? now.toISOString(),
    expiresAt: new Date(now.getTime() + EXPIRY_MS).toISOString(),
    painType: data.painType,
    username: data.username,
    community: data.community,
    schoolName: data.schoolName,
    schoolSource: data.schoolSource,
    subjects: data.subjects,
    upcomingExams: data.studentExams ?? [],
    preparationLevel: data.preparationFeeling,
    minutesPerSession: data.dailyMinutes,
    studyDays: data.weeklyStudyDaysValue,
    gradeThresholdMode: data.gradeThresholdMode,
    gradeThreshold: data.gradeThreshold,
    subjectGradeThresholds: data.subjectGradeThresholds,
    lastStep: data.lastStep,
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(draft))
  }
  return draft
}

export function setLocalDraftId(draftId: string) {
  const existing = loadLocalDraft()
  if (!existing) return
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify({ ...existing, draftId }))
}

export function loadLocalDraft(): LocalOnboardingDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LocalOnboardingDraft
    if (parsed.version !== 1) return null
    if (isExpired(parsed)) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearLocalDraft() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
