import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { validateUsername, normalizeUsername } from '@/app/lib/username'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { MAX_GRADE_THRESHOLD, MIN_GRADE_THRESHOLD, type GradeThresholdMode } from '@/app/lib/camino/gradeThreshold'

export const dynamic = 'force-dynamic'

const VALID_SUBJECT_LEVELS = ['bajo', 'medio', 'alto'] as const
const VALID_GRADE_THRESHOLD_MODES = ['general', 'per_subject'] as const

// Same shape ExamModal already uses per-exam ("¿Cómo vas en esta
// asignatura?" bajo/medio/alto), here keyed by subject slug for a
// general, not-tied-to-one-exam self-assessment edited from Ajustes.
function cleanSubjectLevels(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] =>
      entry[0].length <= 40 &&
      typeof entry[1] === 'string' && (VALID_SUBJECT_LEVELS as readonly string[]).includes(entry[1]))
    .slice(0, 12)
  return Object.fromEntries(entries)
}

function cleanGradeThresholdMode(value: unknown): GradeThresholdMode | null {
  return (VALID_GRADE_THRESHOLD_MODES as readonly string[]).includes(value as string) ? (value as GradeThresholdMode) : null
}

// null explícito = "usa el valor por defecto de la app" (borra la
// personalización); cualquier otro valor no numérico se ignora sin error.
function cleanGradeThreshold(value: unknown): number | null | undefined {
  if (value === null) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return undefined
  return Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, n))
}

function cleanSubjectGradeThresholds(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, number] => {
      const n = Number(entry[1])
      return entry[0].length <= 40 && Number.isFinite(n)
    })
    .slice(0, 12)
    .map(([slug, raw]) => [slug, Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, Number(raw)))] as [string, number])
  return Object.fromEntries(entries)
}

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

async function getUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  return client.auth.getUser(token)
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: { user }, error } = await getUser(token)
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = createServiceClient()
  const { data, error: fetchError } = await db
    .from('perfiles')
    .select('email_notifications, student_exams, username, custom_instructions, subject_levels, last_weekly_checkin_at, grade_threshold_mode, grade_threshold, subject_grade_thresholds')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  return NextResponse.json({
    email_notifications: data?.email_notifications ?? true,
    student_exams: data?.student_exams ?? [],
    username: data?.username ?? '',
    custom_instructions: data?.custom_instructions ?? '',
    subject_levels: data?.subject_levels ?? {},
    last_weekly_checkin_at: data?.last_weekly_checkin_at ?? null,
    grade_threshold_mode: data?.grade_threshold_mode ?? 'general',
    grade_threshold: data?.grade_threshold ?? null,
    subject_grade_thresholds: data?.subject_grade_thresholds ?? {},
  })
}

export async function PATCH(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: { user }, error } = await getUser(token)
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const db = createServiceClient()
  const allowed: Record<string, unknown> = {}

  if (typeof body.email_notifications === 'boolean') allowed.email_notifications = body.email_notifications
  if (Array.isArray(body.student_exams)) allowed.student_exams = cleanStudentExams(body.student_exams)
  if (typeof body.custom_instructions === 'string') allowed.custom_instructions = body.custom_instructions.trim().slice(0, 600)
  if (body.subject_levels !== undefined) allowed.subject_levels = cleanSubjectLevels(body.subject_levels)
  if (body.mark_weekly_checkin === true) allowed.last_weekly_checkin_at = new Date().toISOString()
  if (body.grade_threshold_mode !== undefined) {
    const mode = cleanGradeThresholdMode(body.grade_threshold_mode)
    if (mode) allowed.grade_threshold_mode = mode
  }
  if (body.grade_threshold !== undefined) {
    const cleaned = cleanGradeThreshold(body.grade_threshold)
    if (cleaned !== undefined) allowed.grade_threshold = cleaned
  }
  if (body.subject_grade_thresholds !== undefined) allowed.subject_grade_thresholds = cleanSubjectGradeThresholds(body.subject_grade_thresholds)

  if (typeof body.username === 'string') {
    const u = body.username.trim()
    const validationError = validateUsername(u)
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

    const normalized = normalizeUsername(u)
    // Check uniqueness (excluding current user)
    const { data: existing } = await db
      .from('perfiles')
      .select('id')
      .eq('username_normalized', normalized)
      .neq('id', user.id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })

    allowed.username = u
    allowed.username_normalized = normalized
  }

  if (Object.keys(allowed).length === 0) return NextResponse.json({ error: 'Sin campos válidos' }, { status: 400 })

  const { error: upsertError } = await db
    .from('perfiles')
    .upsert({ id: user.id, ...allowed }, { onConflict: 'id' })

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
