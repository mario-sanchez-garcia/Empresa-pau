import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureUserInstituteMembership } from '@/app/lib/camino/institutePace'
import { normalizeUsername, validateUsername } from '@/app/lib/username'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { MAX_GRADE_THRESHOLD, MIN_GRADE_THRESHOLD, type GradeThresholdMode } from '@/app/lib/camino/gradeThreshold'

// Validación/limpieza + escritura de los campos de perfil del onboarding,
// compartida entre /api/onboarding/setup (flujo legacy — también lo llama
// /settings para actualizaciones parciales tras el onboarding) y el
// finalizer de Fase 2 (/api/onboarding/finalize). Es una extracción literal
// del cuerpo de /api/onboarding/setup: mismos campos, misma semántica de
// "solo escribe una columna si el campo vino en el body" para no romper las
// actualizaciones parciales que hace /settings.
//
// Opera sobre `body: Record<string, unknown>` (no sobre valores ya
// limpiados) precisamente para conservar esa semántica de presencia exacta.

export const VALID_COMMUNITIES = ['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as const
export const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
export const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
export const VALID_SCHOOL_SOURCES = ['dataset', 'manual'] as const
export const VALID_GRADE_THRESHOLD_MODES = ['general', 'per_subject'] as const
export const VALID_PAIN_TYPES = ['daily_plan', 'correction_confidence', 'procrastination', 'improve_grade'] as const
export type CleanPainType = typeof VALID_PAIN_TYPES[number]

export function cleanGradeThresholdMode(value: unknown): GradeThresholdMode | null {
  return (VALID_GRADE_THRESHOLD_MODES as readonly string[]).includes(value as string) ? (value as GradeThresholdMode) : null
}

export function cleanGradeThreshold(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, n)) : null
}

export function cleanSubjectGradeThresholds(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, number] => entry[0].length <= 40 && Number.isFinite(Number(entry[1])))
    .slice(0, 12)
    .map(([slug, raw]) => [slug, Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, Number(raw)))] as [string, number])
  return Object.fromEntries(entries)
}

export function cleanString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 160) : fallback
}

export function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 12)
    : []
}

export function cleanPainType(value: unknown): CleanPainType | null {
  return (VALID_PAIN_TYPES as readonly string[]).includes(value as string) ? (value as CleanPainType) : null
}

export interface CleanedOnboardingProfile {
  community: string
  dailyMinutes: number | null
  weeklyStudyDaysValue: number | null
  schoolSource: string | null
  username: string | null
  schoolName: string
  subjects: string[]
  preparationFeeling: string
  dailyStudyTime: string
  weeklyStudyDays: string
  studentExams: ReturnType<typeof cleanStudentExams>
  gradeThresholdMode: GradeThresholdMode | null
  gradeThreshold: number | null
  subjectGradeThresholds: Record<string, number>
  painType: CleanPainType | null
}

export function cleanOnboardingProfileBody(body: Record<string, unknown>): CleanedOnboardingProfile {
  return {
    community: VALID_COMMUNITIES.includes(body.community as typeof VALID_COMMUNITIES[number]) ? (body.community as string) : 'Otra',
    dailyMinutes: VALID_DAILY_MINUTES.includes(body.dailyMinutes as typeof VALID_DAILY_MINUTES[number]) ? (body.dailyMinutes as number) : null,
    weeklyStudyDaysValue: VALID_WEEKLY_DAYS.includes(body.weeklyStudyDaysValue as typeof VALID_WEEKLY_DAYS[number]) ? (body.weeklyStudyDaysValue as number) : null,
    schoolSource: VALID_SCHOOL_SOURCES.includes(body.schoolSource as typeof VALID_SCHOOL_SOURCES[number]) ? (body.schoolSource as string) : null,
    username: typeof body.username === 'string' ? body.username.trim().slice(0, 20) || null : null,
    schoolName: cleanString(body.schoolName),
    subjects: cleanStringArray(body.subjects),
    preparationFeeling: cleanString(body.preparationFeeling),
    dailyStudyTime: cleanString(body.dailyStudyTime),
    weeklyStudyDays: cleanString(body.weeklyStudyDays),
    studentExams: cleanStudentExams(body.studentExams),
    gradeThresholdMode: cleanGradeThresholdMode(body.gradeThresholdMode),
    gradeThreshold: body.gradeThreshold !== undefined ? cleanGradeThreshold(body.gradeThreshold) : null,
    subjectGradeThresholds: cleanSubjectGradeThresholds(body.subjectGradeThresholds),
    painType: cleanPainType(body.painType),
  }
}

export type SaveOnboardingProfileResult =
  | { ok: true }
  | { ok: false; errorCode: 'invalid_username'; message: string }
  | { ok: false; errorCode: 'username_check_failed' | 'username_taken' | 'username_save_failed' }

// `body` es el body crudo (para conservar la semántica exacta de "solo
// escribe la columna si la clave vino en la petición", de la que depende
// /settings para no borrar campos que no está tocando). `cleaned` son los
// valores ya limpiados de ese mismo body (ver cleanOnboardingProfileBody) —
// se piden ambos para no tener que limpiar dos veces.
export async function saveOnboardingProfile(
  userId: string,
  db: SupabaseClient,
  body: Record<string, unknown>,
  cleaned: CleanedOnboardingProfile,
): Promise<SaveOnboardingProfileResult> {
  if (cleaned.username) {
    const validationError = validateUsername(cleaned.username)
    if (validationError) return { ok: false, errorCode: 'invalid_username', message: validationError }
  }

  try {
    await ensureUserInstituteMembership(db, {
      userId,
      community: cleaned.community,
      schoolName: cleaned.schoolName,
      schoolSource: cleaned.schoolSource,
      membershipSource: 'onboarding',
    })
  } catch { /* institute membership is non-critical during rollout */ }

  if (Array.isArray(body.studentExams)) {
    try {
      await db.from('perfiles').upsert({ id: userId, student_exams: cleaned.studentExams }, { onConflict: 'id' })
    } catch { /* optional upcoming exams must not block onboarding */ }
  }

  try {
    await db.from('perfiles').upsert({ id: userId, comunidad: cleaned.community }, { onConflict: 'id' })
  } catch { /* non-critical */ }

  if (cleaned.gradeThresholdMode || body.gradeThreshold !== undefined || body.subjectGradeThresholds !== undefined) {
    try {
      await db.from('perfiles').upsert({
        id: userId,
        ...(cleaned.gradeThresholdMode ? { grade_threshold_mode: cleaned.gradeThresholdMode } : {}),
        ...(body.gradeThreshold !== undefined ? { grade_threshold: cleaned.gradeThreshold } : {}),
        ...(body.subjectGradeThresholds !== undefined ? { subject_grade_thresholds: cleaned.subjectGradeThresholds } : {}),
      }, { onConflict: 'id' })
    } catch { /* non-critical: el alumno puede ajustarlo luego en Ajustes */ }
  }

  if (cleaned.painType) {
    try {
      await db.from('perfiles').upsert({ id: userId, pain_type: cleaned.painType }, { onConflict: 'id' })
    } catch { /* non-critical: no bloquea el onboarding */ }
  }

  if (cleaned.username) {
    const normalized = normalizeUsername(cleaned.username)
    const { data: existing, error: existingError } = await db
      .from('perfiles')
      .select('id')
      .eq('username_normalized', normalized)
      .neq('id', userId)
      .maybeSingle()

    if (existingError) return { ok: false, errorCode: 'username_check_failed' }
    if (existing) return { ok: false, errorCode: 'username_taken' }

    const { error: usernameError } = await db.from('perfiles').upsert(
      { id: userId, username: cleaned.username, username_normalized: normalized },
      { onConflict: 'id' }
    )
    if (usernameError) return { ok: false, errorCode: 'username_save_failed' }
  }

  if (Array.isArray(body.subjects)) {
    try {
      await db.from('perfiles').upsert({ id: userId, subjects: cleaned.subjects }, { onConflict: 'id' })
    } catch { /* non-critical: el snapshot de billing_events sigue funcionando como fallback */ }
  }

  return { ok: true }
}
