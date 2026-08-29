import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent, logAiUsageEventForPhotos } from '@/app/lib/aiUsage'
import { getMonthlyActionCount, getMonthlyUniqueActionCount, getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { getEffectivePlanLimits } from '@/app/lib/billing/limitOverrides'
import { createServiceSupabase, createUserSupabase, getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import {
  getTopic,
  getTopicByV2SortOrder,
  normalizeSubjectSlug,
  normalizeTopicSlug,
  subjectLabelFromSlug,
} from '@/app/lib/camino/caminoCurriculumPlan'
import { isOverloadedError, withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { buildCorrectionPrompt, normalizeCorrectionForOfficialScores, parseCorrectionJson, scoreFromCorrection, validateCorrectionJsonShape, type CorrectionSchemaValidation } from '@/app/lib/correctionPrompt'
import { isInternalUser } from '@/app/lib/internalUsers'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { BILLING_BLOCK_CODE, createRateLimitPayload, monthlyLimitResetNotice, type RateLimitAction } from '@/app/lib/rateLimitMessages'

export const dynamic = 'force-dynamic'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 2200
const MAX_IMAGE_PAYLOAD_CHARS = 8_000_000
const CORRECTION_UNAVAILABLE_MESSAGE = 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'

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
  studentResponseImages?: unknown
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

  // studentResponse carries the first (and, for older clients, only) image;
  // studentResponseImages carries any additional pages of the same answer.
  // Both combine into one ordered set of image blocks sent to Claude.
  const imageData = responseMode === 'image' ? stripDataUrlPrefix(studentResponse) : null
  const extraImages = responseMode === 'image' && Array.isArray(body.studentResponseImages)
    ? body.studentResponseImages
      .filter((item): item is { data: string; mediaType?: string } => Boolean(item && typeof (item as { data?: unknown }).data === 'string'))
      .map(item => ({ data: stripDataUrlPrefix(item.data), mediaType: typeof item.mediaType === 'string' && item.mediaType.trim() ? item.mediaType : undefined }))
    : []
  const allImages = [
    ...(imageData ? [{ data: imageData, mediaType: typeof body.imageType === 'string' ? body.imageType : undefined }] : []),
    ...extraImages,
  ]
  const imagePayloadChars = allImages.reduce((sum, img) => sum + img.data.length, 0)
  if (imagePayloadChars > MAX_IMAGE_PAYLOAD_CHARS) {
    return NextResponse.json({ error: 'Las imágenes son demasiado grandes en conjunto. Sube fotos más ligeras o menos páginas.' }, { status: 413 })
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

  // v2SortOrder solo es una referencia real a curriculum_content_v2 para temas
  // con contentStatus 'flashcard_v2' (así lo trata también el cliente en
  // CaminoTopicClient.tsx). Para los temas 'latex_notes' de la beta privada
  // (betaCurriculum.ts), v2SortOrder es un simple índice de orden por
  // asignatura reutilizado para el calendario/misiones — no una fila real de
  // curriculum_content_v2. Tratarlo como tal aquí hacía que se corrigiera con
  // el enunciado/rúbrica de OTRO ejercicio cuyo sort_order coincidía por
  // casualidad (bug confirmado: alumno viendo "Determinantes, inversa y
  // rango" corregido contra la rúbrica de "Multiplicación de Matrices").
  const row = sortOrder != null && topic.contentStatus === 'flashcard_v2'
    ? await loadCurriculumV2Row(topic.subject, sortOrder, authContext.accessToken)
    : null
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
    hasImage: allImages.length > 0,
    imageCount: allImages.length,
    imagePayloadChars,
    promptChars: statement.length,
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicApiKey) {
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/camino/correct',
      action,
      model: MODEL,
      status: 'error',
      errorCode: 'anthropic_api_key_missing',
      metadata,
      accessToken: authContext.accessToken,
    }).catch(error => console.warn('[camino/correct] usage log skipped after missing provider key', error))

    return correctionUnavailableResponse()
  }

  const internalUser = isInternalUser(authContext.user.email)
  if (!internalUser) {
    const limitResponse = await enforceUsageLimits({
      userId: authContext.user.id,
      userCreatedAt: authContext.user.created_at,
      email: authContext.user.email,
      action,
      creditKey,
      photoCount: allImages.length,
      accessToken: authContext.accessToken,
    })
    if (limitResponse) return limitResponse
  }

  const client = new Anthropic({ apiKey: anthropicApiKey, timeout: 55_000 })
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
      studentAnswer: allImages.length > 0
        ? `Respuesta manuscrita adjunta como ${allImages.length === 1 ? 'imagen' : `${allImages.length} imágenes — están en orden, léelas como páginas consecutivas de una misma respuesta`}. Corrígela leyendo la(s) imagen(es) enviada(s).`
        : studentResponse,
    }],
  })

  const content: Anthropic.Messages.ContentBlockParam[] = []
  for (const img of allImages) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: sanitizeImageType(img.mediaType),
        data: img.data,
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
    }).catch(logError => console.warn('[camino/correct] usage log skipped after provider error', logError))
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
    console.error('[camino/correct] provider correction unavailable', {
      errorCode: getAiErrorCode(error),
      status: typeof error === 'object' && error && 'status' in error ? (error as { status?: unknown }).status : undefined,
    })
    return correctionUnavailableResponse()
  }

  let usage = extractAnthropicTokenUsage(message)
  let rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''
  let parsed = parseCorrectionJson(rawText)
  let validation = validateCorrectionJsonShape(parsed)
  let repairedFormat = false

  if (!validation.valid && shouldRepairCorrectionFormat(rawText, parsed)) {
    try {
      const repairMessage = await withAnthropicRetry(
        () => client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: 'user', content: buildCorrectionFormatRepairPrompt(rawText, validation) }],
        }),
        (intento, status) => console.warn('[camino/correct] reintento de formato por saturación', { intento, status }),
      )
      repairedFormat = true
      usage = combineUsage(usage, extractAnthropicTokenUsage(repairMessage))
      rawText = repairMessage.content[0]?.type === 'text' ? repairMessage.content[0].text : ''
      parsed = parseCorrectionJson(rawText)
      validation = validateCorrectionJsonShape(parsed)
    } catch (error) {
      await logAiUsageEvent({
        userId: authContext.user.id,
        route: '/api/camino/correct',
        action,
        model: MODEL,
        status: 'error',
        errorCode: getAiErrorCode(error),
        metadata: { ...metadata, correctionFormatRepair: 'provider_error' },
        accessToken: authContext.accessToken,
      }).catch(logError => console.warn('[camino/correct] usage log skipped after format repair error', logError))

      if (isOverloadedError(error)) {
        return NextResponse.json(
          {
            error: 'ai_overloaded',
            message: 'Hay mucha gente corrigiendo ahora mismo. Espera un minuto y vuelve a intentarlo — tu respuesta no se ha perdido.',
          },
          { status: 503, headers: { 'Retry-After': '60' } }
        )
      }
      return correctionUnavailableResponse()
    }
  }

  if (!validation.valid || !parsed) {
    await logAiUsageEventForPhotos({
      userId: authContext.user.id,
      route: '/api/camino/correct',
      action,
      model: MODEL,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      status: 'error',
      errorCode: 'invalid_correction_format',
      metadata: {
        ...metadata,
        correctionParse: {
          reason: validation.valid ? 'parse_error' : validation.reason,
          rawLength: rawText.length,
          fieldNames: validation.fieldNames,
          missingFields: validation.valid ? [] : validation.missingFields,
          repairedFormat,
          providerStopReason: message.stop_reason ?? 'unknown',
        },
      },
      photoCount: allImages.length,
      accessToken: authContext.accessToken,
    }).catch(logError => console.warn('[camino/correct] usage log skipped after invalid format', logError))

    console.warn('[camino/correct] invalid correction format', {
      reason: validation.valid ? 'parse_error' : validation.reason,
      rawLength: rawText.length,
      fieldCount: validation.fieldNames.length,
      missingFields: validation.valid ? [] : validation.missingFields,
      repairedFormat,
      providerStopReason: message.stop_reason ?? 'unknown',
    })
    return NextResponse.json(
      {
        error: 'invalid_correction_format',
        message: 'No hemos podido generar la corrección en el formato esperado. Vuelve a intentarlo — tu respuesta está guardada.',
      },
      { status: 502 }
    )
  }

  await logAiUsageEventForPhotos({
    userId: authContext.user.id,
    route: '/api/camino/correct',
    action,
    model: MODEL,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: 'success',
    metadata: { ...metadata, truncated: message.stop_reason === 'max_tokens', repairedFormat },
    photoCount: allImages.length,
    accessToken: authContext.accessToken,
  })

  const normalized = normalizeCorrectionForOfficialScores(parsed, [maxScore])
  const publicCorrection = stripPrivateCorrectionFields(normalized)
  const score = scoreFromCorrection(publicCorrection, maxScore)
  if (score == null) {
    // scoreFromCorrection ya cae a nota_final cuando la IA deja
    // desglose_bloques vacío (frecuente en preguntas de desarrollo de una
    // sola pieza — Historia, Filosofía). Si TODAVÍA así no hay nota, algo
    // más raro está pasando en la respuesta de la IA — que quede registrado
    // en vez de fallar en silencio con un 0 sin contexto.
    console.error('[camino/correct] score unparseable after fallback', {
      userId: authContext.user.id,
      subject: topic.subject,
      sortOrder: sortOrder ?? topic.v2SortOrder ?? null,
      truncated: message.stop_reason === 'max_tokens',
    })
    const db = createServiceSupabase() ?? createUserSupabase(authContext.accessToken)
    await recordBetaMetric(db, authContext.user.id, 'correction_score_unparseable', {
      subject: topic.subject,
      blockSlug: topic.blockSlug,
      topicSlug: topic.topicSlug,
      sortOrder: sortOrder ?? topic.v2SortOrder ?? null,
      truncated: message.stop_reason === 'max_tokens',
    })
  }
  return NextResponse.json({
    correction: publicCorrection,
    score,
    notEvaluable: Boolean((normalized as { notEvaluable?: boolean })?.notEvaluable),
    truncated: message.stop_reason === 'max_tokens',
    finishReason: message.stop_reason ?? 'unknown',
  })
}

function correctionUnavailableResponse() {
  return NextResponse.json(
    { error: 'correction_unavailable', message: CORRECTION_UNAVAILABLE_MESSAGE },
    { status: 503 }
  )
}

function shouldRepairCorrectionFormat(rawText: string, parsed: unknown) {
  if (parsed && typeof parsed === 'object') return true
  return /```json/i.test(rawText) ||
    /^\s*\{/.test(rawText) ||
    /"(?:nota_final|feedback_general|desglose_bloques|errores_principales|plan_repaso)"\s*:/.test(rawText)
}

function buildCorrectionFormatRepairPrompt(rawText: string, validation: CorrectionSchemaValidation) {
  const missingFields = validation.valid ? [] : validation.missingFields
  return `La respuesta anterior de corrección no cumple el formato técnico esperado.

Tarea: reescribe la respuesta anterior como UN ÚNICO objeto JSON válido. No recalifiques desde cero, no cambies el criterio académico y no añadas explicación fuera del JSON.

Campos críticos que deben existir si la información aparece en la respuesta anterior:
- nota_final
- feedback_general
- desglose_bloques con al menos un bloque
- desglose_bloques[].puntos_conseguidos
- desglose_bloques[].puntos_maximos
- desglose_bloques[].correccion_detalle o feedback equivalente

Diagnóstico técnico:
- reason: ${validation.valid ? 'parse_error' : validation.reason}
- missingFields: ${missingFields.join(', ') || 'none'}
- receivedFields: ${validation.fieldNames.join(', ') || 'none'}

Devuelve únicamente JSON puro, sin markdown, sin \`\`\`, sin texto antes o después.

Respuesta anterior:
${rawText.slice(0, 12_000)}`
}

function combineUsage(
  first: { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null },
  second: { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null },
) {
  const inputTokens = sumNullable(first.inputTokens, second.inputTokens)
  const outputTokens = sumNullable(first.outputTokens, second.outputTokens)
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens != null && outputTokens != null
      ? inputTokens + outputTokens
      : sumNullable(first.totalTokens, second.totalTokens),
  }
}

function sumNullable(a: number | null, b: number | null) {
  return a == null && b == null ? null : (a ?? 0) + (b ?? 0)
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
  email,
  action,
  creditKey,
  photoCount,
  accessToken,
}: {
  userId: string
  userCreatedAt: string
  email: string | undefined
  action: RateLimitAction
  creditKey: string
  photoCount: number
  accessToken: string
}) {
  const billing = await getUserBillingContext(userId, userCreatedAt, email)
  if (!billing.hasActivePack && billing.daysSince >= 7) {
    return NextResponse.json(
      { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
      { status: 403 }
    )
  }

  const planLimits = await getEffectivePlanLimits(
    createServiceSupabase() ?? createUserSupabase(accessToken),
    userId,
    getCaminoPlanLimits(billing.planId)
  )
  if (action === 'image_correction') {
    const monthlyPhotos = creditKey
      ? await getMonthlyUniqueActionCount(userId, ['image_correction'])
      : await getMonthlyActionCount(userId, ['image_correction'])
    // Rejects up front if THIS submission's photos would push the student
    // over the limit, not just once already at/over it.
    if (monthlyPhotos + Math.max(1, photoCount) > planLimits.photosPerMonth) {
      return NextResponse.json(
        { error: 'photo_limit_reached', message: `Has alcanzado el límite de ${planLimits.photosPerMonth} correcciones con foto este mes. ${monthlyLimitResetNotice()}`, code: BILLING_BLOCK_CODE },
        { status: 429 }
      )
    }
  } else {
    const monthlyCorrections = creditKey
      ? await getMonthlyUniqueActionCount(userId, ['chat'])
      : await getMonthlyActionCount(userId, ['chat'])
    if (monthlyCorrections >= planLimits.correctionsPerMonth) {
      return NextResponse.json(
        { error: 'correction_limit_reached', message: `Has alcanzado el límite de ${planLimits.correctionsPerMonth} correcciones este mes. ${monthlyLimitResetNotice()}`, code: BILLING_BLOCK_CODE },
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
