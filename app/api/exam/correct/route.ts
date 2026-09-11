import * as Sentry from '@sentry/nextjs'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent, logAiUsageEventForPhotos } from '@/app/lib/aiUsage'
import { isOverloadedError, withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, type RateLimitAction, BILLING_BLOCK_CODE, monthlyLimitResetNotice } from '@/app/lib/rateLimitMessages'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { getEffectivePlanLimits } from '@/app/lib/billing/limitOverrides'
import { buildBlockPrompt, buildCorrectionFormatRepairPrompt, combineCorrectionUsage, normalizeCorrectionForOfficialScores, parseCorrectionJson, scoreFromCorrection, shouldRepairCorrectionFormat, validateCorrectionJsonShape } from '@/app/lib/correctionPrompt'
import { getTheoryContextForExercise, theoryContextToPrompt } from '@/app/lib/whyItWorksTheory'
import { digestExamCorrection, isValidExamHistoryId, issueExamXpGrant } from '@/app/lib/camino/examXpGrant'
import { validateCorrectionTextPayload } from '@/app/lib/correctionRequestValidation'

// 55s SDK timeout leaves ~5s for the function to return a clean JSON error
// before Vercel's 60s maxDuration (Hobby plan ceiling) kills the process.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 55_000 })

export const maxDuration = 60

const MODEL = 'claude-sonnet-4-6'
// Simulacro's per-block budget (1800) is tuned for shorter blocks corrected in
// parallel; a single meaty exam exercise (e.g. a 3-variable Gauss system with
// verification + model answer + advice + theory) needs more room. Too tight a
// budget doesn't just truncate cleanly — it makes the model rush and blur field
// boundaries near the end (headers/content bleeding across JSON string values).
const MAX_TOKENS = 4000
// El tope agregado de imágenes vive en app/lib/imagePayloadLimits.ts:
// estaba duplicado en estas tres rutas y por encima del límite de
// transporte de la plataforma, así que su 413 era inalcanzable (A18).
import { validateCorrectionImagePayload } from '@/app/lib/imagePayloadLimits'

function examSystemLabel(comunidad: string) {
  return comunidad === 'Cataluña' ? 'PAU Catalunya' : 'EBAU Madrid'
}

type ExamCorrectBody = {
  subject?: unknown
  community?: unknown
  examLabel?: unknown
  option?: unknown
  maxScore?: unknown
  year?: unknown
  examCall?: unknown
  exerciseId?: unknown
  exerciseLabel?: unknown
  officialPrompt?: unknown
  criteria?: unknown
  sourceText?: unknown
  concepts?: unknown
  studentAnswer?: unknown
  imagen?: unknown
  imagenTipo?: unknown
  imagenes?: unknown
  creditKey?: unknown
  historyId?: unknown
}

export async function POST(request: NextRequest) {
  try {
    return await handlePost(request)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.status ?? (error as any)?.code ?? 'unknown'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorName = (error as any)?.name ?? (error as any)?.constructor?.name ?? 'Error'
    console.error('EXAM_CORRECTION_ERROR', {
      errorCode,
      errorName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (error as any)?.message?.slice(0, 200)
    })
    Sentry.captureException(error, { tags: { route: 'exam/correct', errorCode, errorName } })
    return NextResponse.json(
      { error: 'No hemos podido corregir este ejercicio ahora mismo. Inténtalo de nuevo en unos minutos.' },
      { status: 500 }
    )
  }
}

async function handlePost(request: NextRequest) {
  const totalStart = Date.now()
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  Sentry.setUser({ id: authContext.user.id, email: authContext.user.email ?? undefined })

  let body: ExamCorrectBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const subject = asString(body.subject) || 'Examen'
  const community = asString(body.community) || 'Madrid'
  const examLabel = asString(body.examLabel) || subject
  const option = asString(body.option)
  const requestedMaxScore = asNumber(body.maxScore) ?? 10
  const maxScore = requestedMaxScore > 0 && requestedMaxScore <= 10 ? requestedMaxScore : 10
  const officialPrompt = asString(body.officialPrompt)
  const studentAnswer = asString(body.studentAnswer)
  const historyId = isValidExamHistoryId(body.historyId) ? body.historyId : null
  const concepts = Array.isArray(body.concepts)
    ? body.concepts.filter((item): item is string => typeof item === 'string').slice(0, 30).map(item => item.slice(0, 200))
    : undefined
  const criteria = asString(body.criteria) || undefined
  const sourceText = asString(body.sourceText) || undefined

  const textValidation = validateCorrectionTextPayload({ officialPrompt, studentAnswer, criteria, sourceText })
  if (!textValidation.valid) {
    return NextResponse.json({ error: textValidation.error }, { status: textValidation.status })
  }

  // Legacy singular `imagen` still works (older clients / single-photo
  // callers); `imagenes` is the new multi-photo array. Both can combine —
  // the legacy field is just treated as photo #1 if present.
  const imagen = typeof body.imagen === 'string' && body.imagen.trim() ? body.imagen : null
  const imagenTipo = typeof body.imagenTipo === 'string' && body.imagenTipo.trim() ? body.imagenTipo : 'image/jpeg'
  const imagenes = Array.isArray(body.imagenes)
    ? body.imagenes.map(item => ({
      data: item && typeof (item as { data?: unknown }).data === 'string' ? (item as { data: string }).data : '',
      mediaType: item && typeof (item as { mediaType?: unknown }).mediaType === 'string' ? (item as { mediaType: string }).mediaType : 'image/jpeg',
    }))
    : []
  const unvalidatedImages = [
    ...(imagen ? [{ data: imagen, mediaType: imagenTipo }] : []),
    ...imagenes,
  ]
  const imageValidation = validateCorrectionImagePayload(unvalidatedImages)
  if (!imageValidation.valid) {
    return NextResponse.json({ error: imageValidation.error }, { status: imageValidation.status })
  }
  const allImages = imageValidation.images
  const imagePayloadChars = imageValidation.totalChars

  const action: RateLimitAction = allImages.length > 0 ? 'image_correction' : 'chat'
  const creditKey = typeof body.creditKey === 'string' && body.creditKey.trim() ? body.creditKey.trim().slice(0, 180) : null
  const metadata: Record<string, unknown> = {
    creditKey,
    subject,
    community,
    examLabel,
    option: option || null,
    year: body.year ?? null,
    examCall: asString(body.examCall) || null,
    exerciseId: asString(body.exerciseId) || null,
    exerciseLabel: asString(body.exerciseLabel) || null,
    hasImage: allImages.length > 0,
    imageCount: allImages.length,
    imagePayloadChars,
    promptChars: officialPrompt.length,
    answerChars: studentAnswer.length
  }

  const internalUser = isInternalUser(authContext.user.email)
  if (!internalUser) {
    // Comparte cupo con el chat general de Kairo (/api/chat): mismo action,
    // mismo route en checkAiRateLimit/logAiUsageEvent a propósito — ver nota
    // más abajo. Duplicar la ruta aquí crearía un cupo diario independiente.
    const limitResult = await enforceUsageLimits({
      userId: authContext.user.id,
      userCreatedAt: authContext.user.created_at,
      email: authContext.user.email,
      action,
      photoCount: allImages.length,
      accessToken: authContext.accessToken
    })
    if (limitResult.response) return limitResult.response
    if (limitResult.reservationId) metadata.usageReservationId = limitResult.reservationId
  }

  const theoryContext = getTheoryContextForExercise({
    subject,
    community,
    year: typeof body.year === 'number' || typeof body.year === 'string' ? body.year : undefined,
    examCall: asString(body.examCall) || undefined,
    exerciseId: asString(body.exerciseId) || undefined,
    exerciseLabel: asString(body.exerciseLabel) || undefined,
    exerciseText: officialPrompt,
    officialSolution: criteria,
    rubric: criteria,
    concepts
  })
  const combinedCriteria = [criteria, theoryContextToPrompt(theoryContext)].filter(Boolean).join('\n\n')

  const prompt = buildBlockPrompt({
    block: {
      numeroBloque: 'Ejercicio',
      tema: examLabel,
      community,
      year: (body.year as number | string | undefined) ?? new Date().getFullYear(),
      convocatoria: asString(body.examCall) || 'Examen',
      option: option || 'Curso',
      maxScore,
      officialPrompt,
      criteria: combinedCriteria,
      sourceText,
      concepts,
      studentAnswer: allImages.length > 0
        ? `Respuesta manuscrita adjunta como ${allImages.length === 1 ? 'imagen' : `${allImages.length} imágenes — están en orden, léelas como páginas consecutivas de una misma respuesta`}. Texto adicional: ${studentAnswer}`
        : studentAnswer
    },
    blockIndex: 0,
    totalBlocks: 1,
    subject,
    community,
  }) + `

Tienes espacio de sobra: prioriza una corrección completa y bien estructurada.
Nunca mezcles el contenido de un campo con el de otro ni escribas encabezados
Markdown (##, ###) dentro del valor de un campo — cada campo del JSON contiene
únicamente su propio contenido. Si un bloque LaTeX ocupa varias líneas dentro de
un valor de texto, escapa los saltos de línea correctamente para no romper el JSON.`

  const content: Anthropic.Messages.ContentBlockParam[] = []
  for (const img of allImages) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.data }
    })
  }
  content.push({ type: 'text', text: prompt })

  let message
  const llmStart = Date.now()
  try {
    message = await withAnthropicRetry(
      () => client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: `Eres Kairo, corrector experto de ${examSystemLabel(community)}. Devuelve exclusivamente JSON válido y completo. Sin texto fuera del JSON. No repitas el enunciado ni la respuesta del alumno, pero desarrolla el paso a paso con el detalle necesario para que el alumno aprenda: no lo recortes por brevedad. Cierra siempre el JSON correctamente con todas las claves, aunque eso signifique una respuesta larga.`,
        messages: [{ role: 'user', content }]
      }),
      (intento, status) => console.warn('[exam/correct] reintento por saturación', { intento, status })
    )
  } catch (error) {
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/chat',
      action,
      model: MODEL,
      status: 'error',
      errorCode: getAiErrorCode(error),
      metadata,
      accessToken: authContext.accessToken
    })
    if (isOverloadedError(error)) {
      return NextResponse.json(
        {
          error: 'ai_overloaded',
          message: 'Hay mucha gente corrigiendo ahora mismo. Espera un minuto y vuelve a intentarlo — tu respuesta no se ha perdido.'
        },
        { status: 503, headers: { 'Retry-After': '60' } }
      )
    }
    throw error
  }

  let usage = extractAnthropicTokenUsage(message)
  console.info('[exam/correct] llm_done', { ms: Date.now() - llmStart, stopReason: message.stop_reason ?? 'unknown' })

  // A10 de la auditoría del 7-8 de septiembre de 2026: este registro iba ANTES
  // de parsear, con status 'success' fijo. Si el parseo fallaba el alumno
  // recibía un 502 pero el evento ya constaba como corrección entregada: se le
  // gastaba crédito del mes (los contadores filtran por status 'success') y la
  // métrica de coste por corrección del panel se calculaba sobre entregas que
  // nunca existieron — justo el número con el que se van a decidir precios.
  //
  // Ahora se parsea primero y se registra un único evento con el estado real.
  // Los tokens se registran en los dos casos a propósito: el proveedor ha
  // cobrado igual y borrar ese rastro falsearía el coste hacia abajo, que es
  // el error contrario y peor.
  let rawText = message.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
  let parsed = parseCorrectionJson(rawText)
  let validation = validateCorrectionJsonShape(parsed)
  let repairedFormat = false
  let providerStopReason = message.stop_reason ?? 'unknown'

  // Un JSON sintácticamente válido no es necesariamente una corrección. Una
  // única reparación de FORMATO recupera respuestas casi completas sin
  // recalificar; si sigue faltando nota/desglose/feedback, se rechaza como
  // salida inválida y nunca se guarda ni firma para XP.
  if (!validation.valid && shouldRepairCorrectionFormat(rawText, parsed)) {
    try {
      const repairMessage = await withAnthropicRetry(
        () => client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: 'user', content: buildCorrectionFormatRepairPrompt(rawText, validation) }],
        }),
        (intento, status) => console.warn('[exam/correct] reintento de formato por saturación', { intento, status }),
      )
      repairedFormat = true
      usage = combineCorrectionUsage(usage, extractAnthropicTokenUsage(repairMessage))
      rawText = repairMessage.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
      parsed = parseCorrectionJson(rawText)
      validation = validateCorrectionJsonShape(parsed)
      providerStopReason = repairMessage.stop_reason ?? 'unknown'
    } catch (error) {
      await logAiUsageEvent({
        userId: authContext.user.id,
        route: '/api/chat',
        action,
        model: MODEL,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        status: 'error',
        errorCode: getAiErrorCode(error),
        metadata: { ...metadata, correctionFormatRepair: 'provider_error' },
        accessToken: authContext.accessToken,
      })
      if (isOverloadedError(error)) {
        return NextResponse.json(
          { error: 'ai_overloaded', message: 'Hay mucha gente corrigiendo ahora mismo. Espera un minuto y vuelve a intentarlo — tu respuesta no se ha perdido.' },
          { status: 503, headers: { 'Retry-After': '60' } },
        )
      }
      return NextResponse.json({ error: 'No hemos podido formatear la corrección. Inténtalo de nuevo.' }, { status: 502 })
    }
  }

  await logAiUsageEventForPhotos({
    userId: authContext.user.id,
    route: '/api/chat',
    action,
    model: MODEL,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: validation.valid ? 'success' : 'invalid_output',
    metadata: {
      ...metadata,
      truncated: providerStopReason === 'max_tokens',
      repairedFormat,
      ...(validation.valid ? {} : {
        invalidOutputReason: validation.reason,
        stopReason: providerStopReason,
        fieldNames: validation.fieldNames,
        missingFields: validation.missingFields,
      }),
    },
    photoCount: allImages.length,
    accessToken: authContext.accessToken
  })

  if (!validation.valid || !parsed) {
    console.error('[exam/correct] failed', {
      phase: 'parse',
      ms: Date.now() - totalStart,
      rawLength: rawText.length,
      reason: validation.valid ? 'parse_error' : validation.reason,
      fieldCount: validation.fieldNames.length,
      missingFields: validation.valid ? [] : validation.missingFields,
    })
    return NextResponse.json(
      { error: 'No hemos podido formatear la corrección. Inténtalo de nuevo.' },
      { status: 502 }
    )
  }

  const normalized = normalizeCorrectionForOfficialScores(parsed, [maxScore])
  const score = scoreFromCorrection(normalized, maxScore)
  const xpGrant = historyId && score != null && !(normalized as { notEvaluable?: boolean })?.notEvaluable
    ? issueExamXpGrant({ historyId, userId: authContext.user.id, score, maxScore, correctionDigest: digestExamCorrection(normalized) })
    : null
  // porqueEsAsi incluye studentConnection y por diseño depende del intento.
  // Nunca se comparte/cacha entre usuarios: solo viaja con esta corrección y
  // queda en el historial propio protegido por RLS.
  console.info('[exam/correct] done', { ms: Date.now() - totalStart })

  if ((normalized as { notEvaluable?: boolean })?.notEvaluable) {
    console.warn('[exam/correct] not_evaluable', { ms: Date.now() - totalStart, hasImage: allImages.length > 0, imageCount: allImages.length })
  }

  return NextResponse.json({
    correction: normalized,
    notEvaluable: Boolean((normalized as { notEvaluable?: boolean })?.notEvaluable),
    whyContext: theoryContext,
    truncated: providerStopReason === 'max_tokens',
    finishReason: providerStopReason,
    xpGrant,
  })
}

async function getAuthContext(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return {
      response: NextResponse.json({ error: 'La autenticación no está configurada en el servidor.' }, { status: 500 })
    }
  }

  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return {
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await authSupabase.auth.getUser(accessToken)
  if (error || !data.user) {
    return {
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return { user: data.user, accessToken }
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

async function enforceUsageLimits({
  userId,
  userCreatedAt,
  email,
  action,
  photoCount,
  accessToken
}: {
  userId: string
  userCreatedAt: string
  email: string | undefined
  action: RateLimitAction
  photoCount: number
  accessToken: string
}) {
  const billing = await getUserBillingContext(userId, userCreatedAt, email)
  if (!billing.hasActivePack && billing.daysSince >= 7) {
    return { response: NextResponse.json(
      { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
      { status: 403 }
    ) }
  }

  const planLimits = await getEffectivePlanLimits(createServiceClient(), userId, getCaminoPlanLimits(billing.planId))

  // route: '/api/chat' a propósito — checkAiRateLimit filtra por (userId, route,
  // action), y este endpoint sustituye al flujo de corrección que antes vivía en
  // /api/chat. Usar la ruta nueva aquí crearía un cupo diario independiente del
  // chat general y duplicaría el límite del usuario.
  const rateLimit = await checkAiRateLimit({
    userId,
    route: '/api/chat',
    action,
    limit: action === 'image_correction' ? 5 : 20,
    windowSeconds: 24 * 60 * 60,
    units: action === 'image_correction' ? Math.max(1, photoCount) : 1,
    monthlyLimit: action === 'image_correction' ? planLimits.photosPerMonth : planLimits.correctionsPerMonth,
    accessToken
  })

  if (!rateLimit.allowed) {
    const monthly = rateLimit.blockedBy === 'monthly'
    return { response: NextResponse.json(
      monthly
        ? {
          error: action === 'image_correction' ? 'photo_limit_reached' : 'correction_limit_reached',
          message: `Has alcanzado el límite de ${rateLimit.limit} ${action === 'image_correction' ? 'correcciones con foto' : 'correcciones'} este mes. ${monthlyLimitResetNotice()}`,
          code: BILLING_BLOCK_CODE,
        }
        : createRateLimitPayload(action, rateLimit),
      {
        status: 429,
        headers: rateLimit.retryAfterSeconds ? { 'Retry-After': String(rateLimit.retryAfterSeconds) } : undefined
      }
    ) }
  }

  return { reservationId: rateLimit.reservationId }
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown) {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(numeric) ? numeric : null
}
