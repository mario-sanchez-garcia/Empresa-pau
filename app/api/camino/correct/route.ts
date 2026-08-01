import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { getMonthlyActionCount, getMonthlyUniqueActionCount, getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { createServiceSupabase, createUserSupabase, getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import {
  getTopic,
  getTopicByV2SortOrder,
  normalizeSubjectSlug,
  normalizeTopicSlug,
  subjectLabelFromSlug,
} from '@/app/lib/camino/caminoCurriculumPlan'
import { isOverloadedError, withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { buildCorrectionPrompt, normalizeCorrectionForOfficialScores, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { isInternalUser } from '@/app/lib/internalUsers'
import { BILLING_BLOCK_CODE, createRateLimitPayload, type RateLimitAction } from '@/app/lib/rateLimitMessages'

export const dynamic = 'force-dynamic'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 2200
const MAX_IMAGE_PAYLOAD_CHARS = 8_000_000

type CaminoCorrectBody = {
  topicId?: unknown
  subject?: unknown
  block?: unknown
  blockSlug?: unknown
  topic?: unknown
  topicSlug?: unknown
  sortOrder?: unknown
  v2SortOrder?: unknown
  studentResponse?: unknown
  responseMode?: unknown
  imageType?: unknown
}

type CurriculumV2Row = {
  sort_order: number
  title: string | null
  practice_prompt: string | null
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  let body: CaminoCorrectBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const responseMode = body.responseMode === 'image' ? 'image' : body.responseMode === 'text' ? 'text' : null
  if (!responseMode) {
    return NextResponse.json({ error: 'responseMode debe ser text o image.' }, { status: 400 })
  }

  const subject = normalizeSubjectSlug(asString(body.subject))
  const sortOrder = asNumber(body.sortOrder ?? body.v2SortOrder)
  const blockSlugInput = normalizeTopicSlug(asString(body.blockSlug ?? body.block))
  const topicSlugInput = normalizeTopicSlug(asString(body.topicSlug ?? body.topic))
  const topic = sortOrder != null
    ? getTopicByV2SortOrder(subject, sortOrder) ?? (blockSlugInput && topicSlugInput ? getTopic(subject, blockSlugInput, topicSlugInput) : null)
    : blockSlugInput && topicSlugInput
      ? getTopic(subject, blockSlugInput, topicSlugInput)
      : null

  if (!subject || !topic) {
    return NextResponse.json({ error: 'Tema no encontrado.' }, { status: 404 })
  }

  const studentResponse = asString(body.studentResponse)
  if (responseMode === 'text' && !studentResponse.trim()) {
    return NextResponse.json({ error: 'La respuesta no puede estar vacía.' }, { status: 400 })
  }
  if (responseMode === 'image' && !studentResponse.trim()) {
    return NextResponse.json({ error: 'La imagen no puede estar vacía.' }, { status: 400 })
  }

  const imageData = responseMode === 'image' ? stripDataUrlPrefix(studentResponse) : null
  if (imageData && imageData.length > MAX_IMAGE_PAYLOAD_CHARS) {
    return NextResponse.json({ error: 'La imagen es demasiado grande. Sube una imagen más ligera.' }, { status: 413 })
  }

  const userSupabase = createUserSupabase(authContext.accessToken)
  const hasAccess = await userCanAccessTopic({
    userSupabase,
    userId: authContext.user.id,
    subject: topic.subject,
    blockSlug: topic.blockSlug,
    sortOrder: sortOrder ?? topic.v2SortOrder ?? null,
  })
  if (!hasAccess) {
    return NextResponse.json({ error: 'No tienes acceso a este tema en tu Camino actual.' }, { status: 403 })
  }

  const row = sortOrder != null ? await loadCurriculumV2Row(topic.subject, sortOrder, authContext.accessToken) : null
  const statement = row?.practice_prompt ?? topic.practicePrompt ?? topic.guidedExample ?? `Ejercicio de ${row?.title ?? topic.title}`
  const maxScore = 10
  const subjectLabel = subjectLabelFromSlug(topic.subject)
  const monthKey = new Date().toISOString().slice(0, 7)
  const topicKey = `${topic.subject}:${topic.blockSlug}:${topic.topicSlug}:${sortOrder ?? topic.v2SortOrder ?? 'legacy'}`
  const creditKey = `${authContext.user.id}:${topicKey}:${monthKey}`
  const action: RateLimitAction = responseMode === 'image' ? 'image_correction' : 'chat'
  const metadata = {
    creditKey,
    topicId: typeof body.topicId === 'string' ? body.topicId.slice(0, 180) : topicKey,
    subject: topic.subject,
    blockSlug: topic.blockSlug,
    topicSlug: topic.topicSlug,
    sortOrder: sortOrder ?? topic.v2SortOrder ?? null,
    hasImage: responseMode === 'image',
    imageCount: responseMode === 'image' ? 1 : 0,
    imagePayloadChars: imageData?.length ?? 0,
    promptChars: statement.length,
  }

  const internalUser = isInternalUser(authContext.user.email)
  if (!internalUser) {
    const limitResponse = await enforceUsageLimits({
      userId: authContext.user.id,
      userCreatedAt: authContext.user.created_at,
      action,
      creditKey,
      accessToken: authContext.accessToken,
    })
    if (limitResponse) return limitResponse
  }

  const prompt = buildCorrectionPrompt({
    subject: subjectLabel,
    simulacroId: `Camino PAU · ${subjectLabel} · ${topic.blockTitle} · ${row?.title ?? topic.title}`,
    option: 'Curso',
    elapsedMinutes: 0,
    difficulty: 'Media',
    blocks: [{
      numeroBloque: 'Ejercicio de curso',
      tema: row?.title ?? topic.title,
      year: new Date().getFullYear(),
      convocatoria: 'Camino PAU',
      option: 'Curso',
      maxScore,
      officialPrompt: statement,
      criteria: buildPrivateCriteria(topic.guidedExample, topic.referenceSolution),
      studentAnswer: responseMode === 'image'
        ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.'
        : studentResponse,
    }],
  })

  const content: Anthropic.Messages.ContentBlockParam[] = []
  if (imageData) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: sanitizeImageType(body.imageType),
        data: imageData,
      },
    })
  }
  content.push({ type: 'text', text: prompt })

  let message
  try {
    // Reintenta ante 429/529 (cupo compartido de la organización agotado por
    // un pico de alumnos corrigiendo a la vez). Ver withAnthropicRetry.
    message = await withAnthropicRetry(
      () => client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content }],
      }),
      (intento, status) => console.warn('[camino/correct] reintento por saturación', { intento, status }),
    )
  } catch (error) {
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/camino/correct',
      action,
      model: MODEL,
      status: 'error',
      errorCode: getAiErrorCode(error),
      metadata,
      accessToken: authContext.accessToken,
    })
    // Saturación tras agotar los reintentos: el alumno tiene la foto hecha y
    // está esperando la nota, así que merece saber que es cuestión de esperar
    // y no que su respuesta esté mal. 503 + Retry-After para que el cliente
    // pueda ofrecer "reintentar" en vez de un error genérico.
    if (isOverloadedError(error)) {
      return NextResponse.json(
        {
          error: 'ai_overloaded',
          message: 'Hay mucha gente corrigiendo ahora mismo. Espera un minuto y vuelve a intentarlo — tu respuesta no se ha perdido.',
        },
        { status: 503, headers: { 'Retry-After': '60' } }
      )
    }
    throw error
  }

  const usage = extractAnthropicTokenUsage(message)
  await logAiUsageEvent({
    userId: authContext.user.id,
    route: '/api/camino/correct',
    action,
    model: MODEL,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: 'success',
    metadata: { ...metadata, truncated: message.stop_reason === 'max_tokens' },
    accessToken: authContext.accessToken,
  })

  const rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''
  const parsed = parseCorrectionJson(rawText)
  if (!parsed) {
    return NextResponse.json(
      { error: 'No hemos podido formatear la corrección. Inténtalo de nuevo.' },
      { status: 502 }
    )
  }

  const normalized = normalizeCorrectionForOfficialScores(parsed, [maxScore])
  const publicCorrection = stripPrivateCorrectionFields(normalized)
  return NextResponse.json({
    correction: publicCorrection,
    score: scoreFromCorrection(publicCorrection),
    truncated: message.stop_reason === 'max_tokens',
    finishReason: message.stop_reason ?? 'unknown',
  })
}

async function userCanAccessTopic({
  userSupabase,
  userId,
  subject,
  blockSlug,
  sortOrder,
}: {
  userSupabase: ReturnType<typeof createUserSupabase>
  userId: string
  subject: string
  blockSlug: string
  sortOrder: number | null
}) {
  const calendarQuery = userSupabase
    .from('camino_calendar')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', subject)
    .limit(1)

  const { data: exactCalendar } = sortOrder != null
    ? await calendarQuery.eq('v2_sort_order', sortOrder)
    : await calendarQuery.eq('block_slug', blockSlug)
  if (exactCalendar?.length) return true

  const { data: blockCalendar } = await userSupabase
    .from('camino_calendar')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('block_slug', blockSlug)
    .limit(1)
  if (blockCalendar?.length) return true

  const queueQuery = userSupabase
    .from('user_learning_queue')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', subject)
    .limit(1)

  const { data: exactQueue } = sortOrder != null
    ? await queueQuery.eq('v2_sort_order', sortOrder)
    : await queueQuery.eq('block_slug', blockSlug)
  if (exactQueue?.length) return true

  const { data: blockQueue } = await userSupabase
    .from('user_learning_queue')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('block_slug', blockSlug)
    .limit(1)

  return Boolean(blockQueue?.length)
}

async function loadCurriculumV2Row(subject: string, sortOrder: number, accessToken: string): Promise<CurriculumV2Row | null> {
  const serviceSupabase = createServiceSupabase()
  const db = serviceSupabase ?? createUserSupabase(accessToken)
  const { data } = await db
    .from('curriculum_content_v2')
    .select('sort_order, title, practice_prompt')
    .eq('subject', subject)
    .eq('sort_order', sortOrder)
    .maybeSingle()

  return data as CurriculumV2Row | null
}

async function enforceUsageLimits({
  userId,
  userCreatedAt,
  action,
  creditKey,
  accessToken,
}: {
  userId: string
  userCreatedAt: string
  action: RateLimitAction
  creditKey: string
  accessToken: string
}) {
  const billing = await getUserBillingContext(userId, userCreatedAt)
  if (!billing.hasActivePack && billing.daysSince >= 7) {
    return NextResponse.json(
      { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
      { status: 403 }
    )
  }

  const planLimits = getCaminoPlanLimits(billing.planId)
  if (action === 'image_correction') {
    const monthlyPhotos = creditKey
      ? await getMonthlyUniqueActionCount(userId, ['image_correction'])
      : await getMonthlyActionCount(userId, ['image_correction'])
    if (monthlyPhotos >= planLimits.photosPerMonth) {
      return NextResponse.json(
        { error: 'photo_limit_reached', message: `Has alcanzado el límite de ${planLimits.photosPerMonth} correcciones con foto este mes.`, code: BILLING_BLOCK_CODE },
        { status: 429 }
      )
    }
  } else {
    const monthlyCorrections = creditKey
      ? await getMonthlyUniqueActionCount(userId, ['chat'])
      : await getMonthlyActionCount(userId, ['chat'])
    if (monthlyCorrections >= planLimits.correctionsPerMonth) {
      return NextResponse.json(
        { error: 'correction_limit_reached', message: `Has alcanzado el límite de ${planLimits.correctionsPerMonth} correcciones este mes.`, code: BILLING_BLOCK_CODE },
        { status: 429 }
      )
    }
  }

  const rateLimit = await checkAiRateLimit({
    userId,
    route: '/api/camino/correct',
    action,
    limit: action === 'image_correction' ? 5 : 20,
    windowSeconds: 24 * 60 * 60,
    accessToken,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      createRateLimitPayload(action, rateLimit),
      {
        status: 429,
        headers: rateLimit.retryAfterSeconds ? { 'Retry-After': String(rateLimit.retryAfterSeconds) } : undefined,
      }
    )
  }

  return null
}

function buildPrivateCriteria(guidedExample?: string, referenceSolution?: string) {
  if (referenceSolution?.trim()) return `Solución orientativa del curso:\n${referenceSolution}`
  if (guidedExample?.trim()) return `Solución orientativa del curso:\n${guidedExample}`
  return 'Corrección orientativa de curso. No hay rúbrica oficial asociada a este ejercicio.'
}

function stripPrivateCorrectionFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPrivateCorrectionFields)
  if (!value || typeof value !== 'object') return value

  const privateKeys = new Set([
    'solucion_orientativa',
    'solucion_correcta_corta',
    'rubrica',
    'rúbrica',
    'criterios',
    'criterios_oficiales_disponibles',
    'officialSolution',
    'referenceSolution',
  ])

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !privateKeys.has(key))
      .map(([key, item]) => [key, stripPrivateCorrectionFields(item)])
  )
}

function scoreFromCorrection(value: unknown) {
  const data = value as { desglose_bloques?: Array<{ puntos_conseguidos?: number | string }> } | null
  const numeric = Number(data?.desglose_bloques?.[0]?.puntos_conseguidos)
  return Number.isFinite(numeric) ? Math.min(10, Math.max(0, numeric)) : null
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown) {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(numeric) ? numeric : null
}

function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
}

function sanitizeImageType(value: unknown): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  if (value === 'image/png' || value === 'image/gif' || value === 'image/webp') return value
  return 'image/jpeg'
}
