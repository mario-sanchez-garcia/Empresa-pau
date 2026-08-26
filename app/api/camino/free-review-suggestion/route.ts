import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getWeakAreas } from '@/app/lib/camino/caminoWeakAreasServer'
import { normalizeSubjectSlug, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { caminoSubjectFromSimulacro } from '@/app/lib/camino/partialExamSubjects'

export const dynamic = 'force-dynamic'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-6'
const OPTIONS_COUNT = 3

type SuggestionOption = { subject: string; focusNote: string }
type StudentExamRow = { subject?: unknown; date?: unknown; name?: unknown; block?: unknown; topic?: unknown; content?: unknown; priority?: unknown }
type UpcomingExam = { subjectLabel: string; name: string; date: string; focus: string; days: number; priority: string }

function cleanString(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Cualquier fila real (historial_examenes.asignatura, getWeakAreas().subjectKey)
// puede venir en el vocabulario corto de Exámenes ('mates', 'historia', ver
// SIMULACRO_SUBJECT) o ya en el slug canónico de Camino ('matematicas_ii',
// 'historia_espana', usado por user_learning_queue/camino_calendar y por las
// labels de perfiles.subjects vía normalizeSubjectSlug). Encadenar ambos
// normaliza cualquier fuente al mismo slug canónico para poder cruzarlas.
function toCaminoSlug(raw: string): string {
  return normalizeSubjectSlug(caminoSubjectFromSimulacro(raw))
}

// Deterministic fallback: rotate through the student's active subjects by
// day of week so repeated "sin IA" suggestions on different free days don't
// all land on the same subject. Never blocks — a free-review day should
// always get *something* to suggest, AI or not.
function fallbackSubject(subjects: string[], offset = 0): string {
  if (subjects.length === 0) return ''
  const dow = new Date().getDay()
  return subjects[(dow + offset) % subjects.length]
}

function daysUntil(dateStr: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z')
  const target = new Date(dateStr + 'T00:00:00Z')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function examPriorityScore(priority: string): number {
  if (priority === 'muy_alta') return 4
  if (priority === 'alta') return 3
  if (priority === 'normal') return 2
  return 1
}

function examUrgencyScore(exam: UpcomingExam): number {
  const dayScore = exam.days <= 7 ? 100 : exam.days <= 14 ? 70 : exam.days <= 30 ? 35 : 10
  return dayScore + examPriorityScore(exam.priority) * 8 + (exam.focus ? 10 : 0)
}

function examFocusText(exam: StudentExamRow): string {
  return cleanString(exam.topic, 120)
    || cleanString(exam.block, 120)
    || cleanString(exam.content, 140)
    || cleanString(exam.name, 120)
}

function optionFromExam(exam: UpcomingExam): SuggestionOption {
  const when = exam.days <= 0 ? 'hoy o ya pasó' : exam.days === 1 ? 'mañana' : `en ${exam.days} días`
  return { subject: exam.subjectLabel, focusNote: `Parcial ${when}: ${exam.focus || exam.name}`.slice(0, 140) }
}

// Construye 3 opciones reales sin IA — usado tanto como fallback si la IA
// falla como base que la IA nunca puede contradecir con datos inventados:
// 1) el bloque con peor nota, 2) la asignatura con el parcial más próximo,
// 3) la asignatura con menos progreso de curso — completando con rotación
// determinista si algún alumno todavía no tiene suficiente historial/ligas
// como para llenar las tres.
function deterministicOptions(
  activeSubjects: string[],
  weakAreas: Array<{ subjectKey: string; label: string; avgScore: number }>,
  upcomingExams: UpcomingExam[],
  progressBySlug: Map<string, { completed: number; total: number }>,
): SuggestionOption[] {
  const options: SuggestionOption[] = []
  const usedSubjects = new Set<string>()

  const urgentExam = [...upcomingExams]
    .filter(e => e.days <= 14)
    .sort((a, b) => examUrgencyScore(b) - examUrgencyScore(a) || a.date.localeCompare(b.date))[0]
  if (urgentExam) {
    const option = optionFromExam(urgentExam)
    options.push(option)
    usedSubjects.add(option.subject)
  }

  const worst = weakAreas.find(w => activeSubjects.some(s => normalizeSubjectSlug(s) === toCaminoSlug(w.subjectKey)))
  if (worst) {
    const label = activeSubjects.find(s => normalizeSubjectSlug(s) === toCaminoSlug(worst.subjectKey)) ?? subjectLabelFromSlug(toCaminoSlug(worst.subjectKey))
    options.push({ subject: label, focusNote: `Tu bloque más flojo: ${worst.label} (${worst.avgScore}% de media)` })
    usedSubjects.add(label)
  }

  const nextExam = upcomingExams.find(e => !usedSubjects.has(e.subjectLabel))
  if (nextExam) {
    const option = optionFromExam(nextExam)
    options.push(option)
    usedSubjects.add(option.subject)
  }

  const leastProgress = [...activeSubjects]
    .filter(s => !usedSubjects.has(s))
    .map(s => {
      const p = progressBySlug.get(normalizeSubjectSlug(s))
      const ratio = p && p.total > 0 ? p.completed / p.total : 1
      return { subject: s, ratio, total: p?.total ?? 0 }
    })
    .filter(s => s.total > 0)
    .sort((a, b) => a.ratio - b.ratio)[0]
  if (leastProgress) {
    options.push({ subject: leastProgress.subject, focusNote: `Vas más atrás aquí que en el resto de tu Camino — dale un empujón` })
    usedSubjects.add(leastProgress.subject)
  }

  // Prefiere una asignatura todavía no usada; una vez se han agotado todas
  // las distintas (p.ej. un alumno con una sola asignatura activa), sigue
  // rellenando repitiendo — mejor una asignatura repetida que quedarse con
  // menos de 3 opciones. offset<20 acota el bucle sin depender de
  // activeSubjects.length (que rompía este límite con solo 1 asignatura).
  let offset = 0
  while (options.length < OPTIONS_COUNT && activeSubjects.length > 0 && offset < 20) {
    const pick = fallbackSubject(activeSubjects, offset)
    offset += 1
    if (usedSubjects.has(pick) && usedSubjects.size < activeSubjects.length) continue
    options.push({ subject: pick, focusNote: 'Un repaso general no viene mal — mantén el ritmo' })
    usedSubjects.add(pick)
  }

  return options.slice(0, OPTIONS_COUNT)
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const requestedSubjects = Array.isArray(body.subjects)
    ? body.subjects.filter((s): s is string => typeof s === 'string').map(s => cleanString(s, 80)).filter(Boolean).slice(0, 12)
    : []

  const db = createServiceClient()
  const { data: profile } = await db
    .from('perfiles')
    .select('subjects, custom_instructions, subject_levels, student_exams')
    .eq('id', user.id)
    .maybeSingle()

  // perfiles.subjects is the server source of truth (see /api/onboarding/me) —
  // fall back to whatever the client sent only if it's missing.
  const activeSubjects = (Array.isArray(profile?.subjects) && profile.subjects.length > 0
    ? profile.subjects.filter((s: unknown): s is string => typeof s === 'string')
    : requestedSubjects)
  const customInstructions = cleanString(profile?.custom_instructions, 600)
  const subjectLevels = (profile?.subject_levels && typeof profile.subject_levels === 'object')
    ? profile.subject_levels as Record<string, string>
    : {}

  if (activeSubjects.length === 0) {
    return NextResponse.json({ options: [], source: 'fallback' })
  }

  if (!isInternalUser(user.email)) {
    const billing = await getUserBillingContext(user.id, user.created_at, user.email)
    if (!billing.hasActivePack && billing.daysSince >= 7) {
      return NextResponse.json(
        { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
        { status: 403 }
      )
    }

    const rateLimit = await checkAiRateLimit({
      userId: user.id,
      route: '/api/camino/free-review-suggestion',
      action: 'free_review_suggestion',
      limit: 20,
      windowSeconds: 24 * 60 * 60,
      accessToken: authContext.accessToken,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(createRateLimitPayload('free_review_suggestion', rateLimit), {
        status: 429,
        headers: rateLimit.retryAfterSeconds ? { 'Retry-After': String(rateLimit.retryAfterSeconds) } : undefined,
      })
    }
  }

  const activeSlugs = activeSubjects.map(normalizeSubjectSlug)
  const todayStr = new Date().toISOString().slice(0, 10)

  // Mismo acceso de solo lectura al historial que ya usa Chat con Kairo
  // (ver getHistorialResumen en app/page-client.tsx) — aquí en versión
  // servidor, agregada para las 3 sugerencias en vez de para un hilo de chat.
  const [weakAreasRaw, queueRows, recentHistorial] = await Promise.all([
    getWeakAreas(db, user.id),
    db.from('user_learning_queue').select('subject, queue_status').eq('user_id', user.id).in('subject', activeSlugs).limit(2000),
    db.from('historial_examenes').select('asignatura, nota, nota_maxima, created_at').eq('user_id', user.id).not('nota', 'is', null).order('created_at', { ascending: false }).limit(150),
  ])

  const progressBySlug = new Map<string, { completed: number; total: number }>()
  for (const row of (queueRows.data ?? []) as Array<{ subject: string; queue_status: string }>) {
    const slug = normalizeSubjectSlug(row.subject)
    const entry = progressBySlug.get(slug) ?? { completed: 0, total: 0 }
    entry.total += 1
    if (row.queue_status === 'completed') entry.completed += 1
    progressBySlug.set(slug, entry)
  }

  const recentBySlug = new Map<string, { count: number; sum: number; max: number; lastDate: string }>()
  for (const row of (recentHistorial.data ?? []) as Array<{ asignatura: string; nota: number; nota_maxima: number; created_at: string }>) {
    if (!row.nota_maxima || row.nota_maxima <= 0) continue
    const slug = toCaminoSlug(row.asignatura)
    const entry = recentBySlug.get(slug) ?? { count: 0, sum: 0, max: 0, lastDate: row.created_at }
    entry.count += 1
    entry.sum += row.nota
    entry.max += row.nota_maxima
    if (row.created_at > entry.lastDate) entry.lastDate = row.created_at
    recentBySlug.set(slug, entry)
  }

  const upcomingExamsRaw: UpcomingExam[] = (Array.isArray(profile?.student_exams) ? profile.student_exams as StudentExamRow[] : [])
    .filter((e): e is StudentExamRow & { subject: string; date: string } => typeof e?.subject === 'string' && typeof e?.date === 'string' && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
    .map(e => {
      const focus = examFocusText(e)
      const name = cleanString(e.name, 60) || focus.slice(0, 60) || 'Parcial'
      return {
        subjectLabel: activeSubjects.find(s => normalizeSubjectSlug(s) === normalizeSubjectSlug(e.subject)) ?? e.subject,
        name,
        date: e.date,
        focus,
        days: daysUntil(e.date),
        priority: cleanString(e.priority, 20) || 'normal',
      }
    })
    .sort((a, b) => examUrgencyScore(b) - examUrgencyScore(a) || a.date.localeCompare(b.date))

  const fallbackOptions = deterministicOptions(activeSubjects, weakAreasRaw, upcomingExamsRaw, progressBySlug)

  try {
    const perSubjectLines = activeSubjects.map(label => {
      const slug = normalizeSubjectSlug(label)
      const progress = progressBySlug.get(slug)
      const recent = recentBySlug.get(slug)
      const weak = weakAreasRaw.filter(w => toCaminoSlug(w.subjectKey) === slug).slice(0, 2)
      const exams = upcomingExamsRaw.filter(e => e.subjectLabel === label)
      const parts: string[] = []
      if (progress && progress.total > 0) parts.push(`progreso del curso ${progress.completed}/${progress.total} temas`)
      if (recent) parts.push(`media reciente ${Math.round((recent.sum / recent.max) * 100)}% (${recent.count} correcciones)`)
      if (weak.length) parts.push(`bloques flojos: ${weak.map(w => `${w.label} (${w.avgScore}%)`).join(', ')}`)
      if (exams.length) parts.push(`parcial próximo: "${exams[0].name}" en ${exams[0].days} días`)
      if (subjectLevels[label]) parts.push(`el alumno dice que va "${subjectLevels[label]}"`)
      return `- ${label}: ${parts.length ? parts.join(' · ') : 'sin datos todavía'}`
    }).join('\n')

    const prompt = `Eres el motor de recomendaciones de Kairo (app de preparación PAU). Un alumno tiene un día de "repaso libre" — sin misión asignada por Kairo — y quiere que le sugieras qué repasar.

Datos reales de cada asignatura activa (progreso de curso, parciales próximos, historial de correcciones y bloques con peor nota):
${perSubjectLines}
${customInstructions ? `- Instrucciones personalizadas activas del alumno: ${customInstructions}` : ''}

Elige TRES opciones de repaso DISTINTAS entre sí, basadas ÚNICAMENTE en los datos reales de arriba — nunca inventes una nota, un parcial o un progreso que no aparezca en la lista. Si hay un parcial en 7 días o menos, debe pesar más que un bloque flojo antiguo; si hay un parcial en 8-14 días, trátalo como prioridad alta antes de temas lejanos. Prioriza cubrir asignaturas distintas solo después de respetar esa urgencia. Cada opción es una asignatura (EXACTAMENTE como aparece en la lista) y una nota breve (máx 100 caracteres, en español, sin markdown) que mencione el motivo real (parcial próximo, nota floja en un bloque concreto, poco progreso, etc.). Responde ÚNICAMENTE con JSON válido, sin texto adicional: {"options": [{"subject": "<asignatura>", "focusNote": "<string>"}, {"subject": "<asignatura>", "focusNote": "<string>"}, {"subject": "<asignatura>", "focusNote": "<string>"}]}`

    const response = await withAnthropicRetry(() => client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }))

    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no_json_in_response')
    const parsed = JSON.parse(match[0]) as { options?: unknown }

    const parsedOptions: SuggestionOption[] = Array.isArray(parsed.options)
      ? parsed.options
        .filter((o): o is { subject: unknown; focusNote: unknown } => typeof o === 'object' && o !== null)
        .filter(o => typeof o.subject === 'string' && activeSubjects.includes(o.subject))
        .map(o => ({ subject: o.subject as string, focusNote: typeof o.focusNote === 'string' ? o.focusNote.slice(0, 140) : '' }))
      : []

    // La IA puede devolver menos de 3 válidas (subject inventado, JSON
    // parcial) — se completa con las candidatas deterministas reales en vez
    // de dejar el panel con menos de 3 opciones.
    const options = [...parsedOptions]
    for (const fb of fallbackOptions) {
      if (options.length >= OPTIONS_COUNT) break
      if (options.some(o => o.subject === fb.subject && o.focusNote === fb.focusNote)) continue
      options.push(fb)
    }
    const urgentExam = upcomingExamsRaw.find(e => e.days <= 14)
    if (urgentExam && options[0]?.subject !== urgentExam.subjectLabel) {
      const urgentOption = optionFromExam(urgentExam)
      const rest = options.filter(o => o.subject !== urgentOption.subject || o.focusNote !== urgentOption.focusNote)
      options.splice(0, options.length, urgentOption, ...rest)
    }

    const usage = extractAnthropicTokenUsage(response)
    logAiUsageEvent({
      userId: user.id,
      route: '/api/camino/free-review-suggestion',
      action: 'free_review_suggestion',
      model: MODEL,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      status: 'success',
      metadata: { subjectCount: activeSubjects.length, optionsCount: options.length },
      accessToken: authContext.accessToken,
    }).catch(() => {})

    return NextResponse.json({ options: options.slice(0, OPTIONS_COUNT), source: 'ai' })
  } catch (err) {
    console.error('[camino/free-review-suggestion] falling back to deterministic pick:', err)
    logAiUsageEvent({
      userId: user.id,
      route: '/api/camino/free-review-suggestion',
      action: 'free_review_suggestion',
      model: MODEL,
      status: 'error',
      errorCode: getAiErrorCode(err),
      metadata: { subjectCount: activeSubjects.length },
      accessToken: authContext.accessToken,
    }).catch(() => {})
    return NextResponse.json({ options: fallbackOptions, source: 'fallback' })
  }
}
