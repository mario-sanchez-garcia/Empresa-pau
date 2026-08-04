import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'

export const dynamic = 'force-dynamic'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-6'

function cleanString(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Deterministic fallback: rotate through the student's active subjects by
// day of week so repeated "sin IA" suggestions on different free days don't
// all land on the same subject. Never blocks — a free-review day should
// always get *something* to suggest, AI or not.
function fallbackSubject(subjects: string[]): string {
  if (subjects.length === 0) return ''
  const dow = new Date().getDay()
  return subjects[dow % subjects.length]
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
    .select('subjects, custom_instructions, subject_levels')
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

  const fallback = fallbackSubject(activeSubjects)
  if (activeSubjects.length === 0) {
    return NextResponse.json({ subject: '', focusNote: '', source: 'fallback' })
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

  try {
    const levelsLines = activeSubjects
      .filter(s => subjectLevels[s])
      .map(s => `  · ${s}: ${subjectLevels[s]}`)
      .join('\n')

    const prompt = `Eres el motor de recomendaciones de Kairo (app de preparación PAU). Un alumno tiene un día de "repaso libre" — sin misión asignada por Kairo — y quiere que le sugieras qué repasar.
- Asignaturas activas: ${activeSubjects.join(', ')}
${levelsLines ? `- Cómo dice que va en cada una:\n${levelsLines}` : ''}
${customInstructions ? `- Instrucciones personalizadas activas del alumno: ${customInstructions}` : '- Sin instrucciones personalizadas activas.'}

Elige UNA asignatura de la lista de asignaturas activas (prioriza una en la que vaya peor si lo ha dicho, y respeta cualquier instrucción personalizada que mencione una asignatura o tema concreto) y escribe una nota breve (máx 100 caracteres, en español, sin markdown) de en qué enfocar el repaso ese día. Responde ÚNICAMENTE con JSON válido, sin texto adicional: {"subject": "<una asignatura EXACTAMENTE como aparece en la lista de asignaturas activas>", "focusNote": "<string>"}`

    const response = await withAnthropicRetry(() => client.messages.create({
      model: MODEL,
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }))

    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no_json_in_response')
    const parsed = JSON.parse(match[0]) as { subject?: unknown; focusNote?: unknown }
    const subject = typeof parsed.subject === 'string' && activeSubjects.includes(parsed.subject)
      ? parsed.subject
      : fallback
    const focusNote = typeof parsed.focusNote === 'string' ? parsed.focusNote.slice(0, 140) : ''

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
      metadata: { subjectCount: activeSubjects.length },
      accessToken: authContext.accessToken,
    }).catch(() => {})

    return NextResponse.json({ subject, focusNote, source: 'ai' })
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
    return NextResponse.json({ subject: fallback, focusNote: '', source: 'fallback' })
  }
}
