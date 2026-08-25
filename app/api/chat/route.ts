import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent, logAiUsageEventForPhotos } from '@/app/lib/aiUsage'
import { isOverloadedError, withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, type RateLimitAction, BILLING_BLOCK_CODE, monthlyLimitResetNotice } from '@/app/lib/rateLimitMessages'
import { getUserBillingContext, getMonthlyActionCount, getMonthlyUniqueActionCount } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { createServiceClient } from '@/app/lib/billing/supabase'

const client = new Anthropic()
const MAX_IMAGE_PAYLOAD_CHARS = 8_000_000
const STREAM_TRUNCATION_SENTINEL = '[[KAIRO_TRUNCATED_7f3a9b2c]]'
const CHAT_RESPONSE_FORMAT_RULES = `Reglas de formato de respuesta:
- Usa Markdown claro con titulos, parrafos cortos y listas separadas por saltos de linea.
- No juntes listas como "1. ...2. ..." ni titulos con texto como "Definir las variablesAsignamos".
- No escribas valores visibles como undefined, null o NaN.
- Usa LaTeX solo para formulas: $...$ para inline. Para sistemas y matrices, usa \\begin{cases}...\\end{cases}, \\begin{pmatrix}...\\end{pmatrix} SIN $ externos — el renderizador los envuelve.
- No dejes comandos como \\frac, \\implies, \\cdot, \\begin{cases}, \\end{cases}, \\begin{matrix} o \\end{matrix} como texto plano fuera de delimitadores matematicos.
- NUNCA pongas \\begin{...} dentro de $...$. NUNCA mezcles delimitadores: si abres $ cierra con $; si abres $$ cierra con $$.
- Si el ejercicio o el usuario estan claramente en catalan, responde en catalan; si estan en castellano, responde en castellano.`
const IMAGE_CORRECTION_COMPACT_RULES = `Reglas de longitud para correcciones con imagen:
- Se especifico pero breve. Prioriza feedback accionable.
- No repitas el enunciado ni transcribas la respuesta del alumno.
- Maximo 3 puntos fuertes, 3 errores y 3 pasos de mejora.
- La teoria relacionada debe ocupar como maximo 2 lineas.
- Objetivo 350-500 palabras. No hagas explicaciones largas salvo que sea imprescindible.
- Si el usuario pide JSON estricto, conserva JSON valido y mantén cada campo textual compacto.`

const PREPARATION_TONE_GUIDANCE: Record<string, string> = {
  'Voy un poco perdido/a': 'Tono personalizado del onboarding: el alumno se siente perdido. Mantén el mismo rigor, pero empieza por los fundamentos, no asumas conocimiento previo, explica con pasos intermedios y comprueba comprensión antes de avanzar.',
  'Prefiero empezar desde lo básico': 'Tono personalizado del onboarding: el alumno quiere empezar desde lo básico. Mantén el mismo rigor, pero construye la explicación desde conceptos base, define términos antes de usarlos y evita saltos de razonamiento.',
  'Me cuesta organizarme': 'Tono personalizado del onboarding: al alumno le cuesta organizarse. Mantén el mismo rigor, ve al grano, estructura la respuesta en pasos accionables y evita explicaciones largas que puedan abrumar.',
  'Voy bien, pero quiero mejorar': 'Tono personalizado del onboarding: el alumno va bien y quiere mejorar. Mantén el mismo rigor, sé más exigente, señala matices, errores finos y consejos concretos para subir nota.',
  'Voy bastante bien': 'Tono personalizado del onboarding: el alumno va bastante bien. Mantén el mismo rigor, responde de forma directa y eficiente, sin sobreexplicar lo que probablemente ya domina.',
}

function makeRequestId(request: NextRequest) {
  return request.headers.get('x-kairo-request-id') ?? `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function logCorrectionTiming(requestId: string, label: string, startedAt: number, extra: Record<string, unknown> = {}) {
  console.info(`[correction-timing] ${label}`, {
    requestId,
    ms: Date.now() - startedAt,
    ...extra
  })
}

export async function POST(request: NextRequest) {
  try {
    return await handlePost(request)
  } catch (error) {
    // A diferencia de /api/exam/correct, esta ruta nunca tuvo un try/catch
    // exterior — el único try/catch de abajo cubre la llamada a Claude y
    // vuelve a lanzar (throw error) cualquier fallo que no sea de saturación
    // (429/503/529, ver withAnthropicRetry), así que un error de validación
    // real de la API de Anthropic (petición mal formada, etc.) escapaba sin
    // controlar. Next.js entonces devolvía su propia respuesta de error por
    // defecto, cuyo cuerpo no sigue el formato { error, message } que
    // getApiErrorMessage() espera en el cliente — el alumno veía el texto
    // técnico crudo del error en vez de "no hemos podido corregir".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.status ?? (error as any)?.code ?? 'unknown'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorName = (error as any)?.name ?? (error as any)?.constructor?.name ?? 'Error'
    console.error('CHAT_CORRECTION_ERROR', {
      errorCode,
      errorName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (error as any)?.message?.slice(0, 200)
    })
    return NextResponse.json(
      { error: 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.' },
      { status: 500 }
    )
  }
}

async function handlePost(request: NextRequest) {
  const requestId = makeRequestId(request)
  const totalStart = Date.now()
  const authStart = Date.now()
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  logCorrectionTiming(requestId, 'auth_ms', authStart)

  const { searchParams } = new URL(request.url)
  const wantsStream = searchParams.get('stream') === '1'

  const { pregunta, imagen, imagenTipo, imagenes, correctionMode, correctionBlock, correctionSessionId, creditKey } = await request.json()

  const promptBuildStart = Date.now()
  const imagePayloadSize =
    (typeof imagen === 'string' ? imagen.length : 0) +
    (Array.isArray(imagenes)
      ? imagenes.reduce((total, item) => total + (typeof item?.data === 'string' ? item.data.length : 0), 0)
      : 0)

  if (imagePayloadSize > MAX_IMAGE_PAYLOAD_CHARS) {
    return NextResponse.json(
      { error: 'La imagen es demasiado grande. Sube una imagen más ligera.' },
      { status: 413 }
    )
  }

  const contenido: Anthropic.Messages.ContentBlockParam[] = []

  if (imagen) {
    contenido.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imagenTipo || 'image/jpeg',
        data: imagen,
      }
    })
  }

  if (Array.isArray(imagenes)) {
    for (const item of imagenes) {
      if (!item?.data) continue
      contenido.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: item.mediaType || 'image/jpeg',
          data: item.data,
        }
      })
    }
  }

  const imageCount = (imagen ? 1 : 0) + (Array.isArray(imagenes) ? imagenes.filter(item => item?.data).length : 0)
  const action = imageCount > 0 ? 'image_correction' : 'chat'
  const isChunkedCorrection = correctionMode === 'chunked_correction'
  const model = 'claude-sonnet-4-6'
  const maxTokens = isChunkedCorrection ? 8192
    : action === 'image_correction' ? 2200
    : 2200
  const responseFormatRules = action === 'image_correction' && !isChunkedCorrection
    ? `${CHAT_RESPONSE_FORMAT_RULES}\n\n${IMAGE_CORRECTION_COMPACT_RULES}`
    : CHAT_RESPONSE_FORMAT_RULES
  const metadata = {
    hasImage: imageCount > 0,
    imageCount,
    imagePayloadChars: imagePayloadSize,
    promptChars: typeof pregunta === 'string' ? pregunta.length : null,
    correctionMode: typeof correctionMode === 'string' ? correctionMode : null,
    correctionBlock: typeof correctionBlock === 'string' ? correctionBlock : null,
    correctionSessionId: typeof correctionSessionId === 'string' ? correctionSessionId : null,
    creditKey: typeof creditKey === 'string' && creditKey.trim() ? creditKey.trim().slice(0, 180) : null
  }
  const internalUser = isInternalUser(authContext.user.email)

  contenido.push({ type: 'text', text: `${responseFormatRules}\n\n${pregunta}` })
  logCorrectionTiming(requestId, 'prompt_build_ms', promptBuildStart, {
    action,
    imageCount,
    promptChars: metadata.promptChars,
    imagePayloadChars: imagePayloadSize,
    maxTokens,
    model
  })

  const dataFetchStart = Date.now()
  if (!internalUser) {
    const billing = await getUserBillingContext(authContext.user.id, authContext.user.created_at, authContext.user.email)

    if (!billing.hasActivePack && billing.daysSince >= 7) {
      return NextResponse.json(
        { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
        { status: 403 }
      )
    }

    const planLimits = getCaminoPlanLimits(billing.planId)

    if (action === 'image_correction') {
      const monthlyPhotos = metadata.creditKey
        ? await getMonthlyUniqueActionCount(authContext.user.id, ['image_correction'])
        : await getMonthlyActionCount(authContext.user.id, ['image_correction'])
      // Rejects up front if THIS submission's photos would push the student
      // over the limit, not just once already at/over it — a 3-photo
      // submission with only 1 slot left must be blocked entirely.
      if (monthlyPhotos + Math.max(1, imageCount) > planLimits.photosPerMonth) {
        return NextResponse.json(
          { error: 'photo_limit_reached', message: `Has alcanzado el límite de ${planLimits.photosPerMonth} correcciones con foto este mes. ${monthlyLimitResetNotice()}`, code: BILLING_BLOCK_CODE },
          { status: 429 }
        )
      }
    } else {
      const monthlyChats = metadata.creditKey
        ? await getMonthlyUniqueActionCount(authContext.user.id, ['chat'])
        : await getMonthlyActionCount(authContext.user.id, ['chat'])
      if (monthlyChats >= planLimits.correctionsPerMonth) {
        return NextResponse.json(
          { error: 'correction_limit_reached', message: `Has alcanzado el límite de ${planLimits.correctionsPerMonth} correcciones este mes. ${monthlyLimitResetNotice()}`, code: BILLING_BLOCK_CODE },
          { status: 429 }
        )
      }
    }

    const rateLimit = await checkAiRateLimit({
      userId: authContext.user.id,
      route: '/api/chat',
      action,
      limit: action === 'image_correction' ? 5 : 20,
      windowSeconds: 24 * 60 * 60,
      accessToken: authContext.accessToken
    })

    if (!rateLimit.allowed) {
      return rateLimitResponse(action, rateLimit)
    }
  }

  const preparationFeeling = await getPreparationFeeling(authContext.user.id)
  logCorrectionTiming(requestId, 'data_fetch_ms', dataFetchStart, {
    internalUser,
    hasPreparationFeeling: Boolean(preparationFeeling)
  })
  const toneGuidance = preparationFeeling ? PREPARATION_TONE_GUIDANCE[preparationFeeling] : ''
  const systemPrompt = `Eres Kairo, asistente experto en las pruebas de acceso a la universidad en España. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales de la comunidad indicada y ayudas a estudiar con precisión. Si recibes imágenes, son partes de la respuesta manuscrita del estudiante: léelas y corrígelas en conjunto. Responde siempre en español. Respeta estrictamente el formato que pida el usuario: si pide JSON estricto, devuelve solo JSON válido sin markdown ni texto adicional; si pide markdown, usa markdown claro. Cuando corrijas o expliques una duda académica y el formato lo permita, añade un bloque opcional titulado exactamente "¿Por qué es así?" con explicación específica del ejercicio, conexión con la respuesta del alumno, error típico PAU, mini ejemplo original y consejo para sacar puntos. No lo llames teoría, teoría desplegable ni más información. No copies materiales externos; redacta con palabras propias de Kairo. Usa $...$ para LaTeX inline y entornos \\begin{...}...\\end{...} sin $ externos para sistemas y matrices. NUNCA pongas \\begin{...} dentro de $...$. NUNCA mezcles delimitadores: si abres $ cierra con $, si abres $$ cierra con $$. Si el mensaje incluye un bloque "HISTORIAL DEL ALUMNO", es un resumen real y de solo lectura de sus correcciones guardadas (Exámenes y Simulacros) — úsalo para responder con precisión a preguntas como "¿por qué me pusiste esta nota?" o "¿qué tal voy en esta asignatura?". Nunca inventes ni supongas datos de correcciones que no aparezcan en ese resumen o en el CONTEXTO del mensaje; si te preguntan por algo que no está ahí, dilo con claridad en vez de inventarlo. Tú NUNCA puedes cambiar una nota, una corrección guardada o el XP de un alumno — eso lo decide únicamente el motor de corrección real, no el chat. Si el alumno te pide que le subas la nota, corrijas de nuevo con otro resultado, o le des puntos, explícale con amabilidad que tú no tienes esa capacidad, dile por qué (evita manipular notas manualmente) y anímale a usar el botón "Reportar error" de la corrección en cuestión, o a escribir a hola@kairo.es, si de verdad cree que hubo un fallo técnico. El nivel de exigencia y la nota deben ser los mismos para todos; solo puede cambiar el modo de explicar.${toneGuidance ? ` ${toneGuidance}` : ''}${action === 'image_correction' && !isChunkedCorrection ? ' En correcciones con imagen, se especifico pero compacto: nota clara, maximo 3 aciertos, 3 errores, 3 mejoras y teoria en 2 lineas. No repitas enunciado ni respuesta del alumno.' : ''}${isChunkedCorrection ? ' En correcciones por bloques de Exámenes, prioriza completar todas las secciones pedidas aunque la respuesta sea algo más larga. No dejes apartados a medias y no uses placeholders visibles.' : ''}`
  const systemContent = [{ type: 'text' as const, text: systemPrompt, cache_control: { type: 'ephemeral' as const } }]

  if (wantsStream) {
    const llmStart = Date.now()
    const anthropicStream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemContent,
      messages: [{ role: 'user', content: contenido }]
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let firstTokenLogged = false
          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              if (!firstTokenLogged) {
                firstTokenLogged = true
                logCorrectionTiming(requestId, 'llm_first_token_ms', llmStart)
              }
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          // All events consumed — finalMessage resolves immediately here
          const finalMsg = await anthropicStream.finalMessage()
          const usage = extractAnthropicTokenUsage(finalMsg)
          logCorrectionTiming(requestId, 'llm_total_ms', llmStart, {
            stopReason: finalMsg.stop_reason ?? 'unknown',
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens
          })
          if (finalMsg.stop_reason === 'max_tokens') {
            console.warn('[chat] truncated: true (stream)', { action, maxTokens, outputTokens: usage.outputTokens })
            controller.enqueue(encoder.encode(STREAM_TRUNCATION_SENTINEL))
          }
          logAiUsageEventForPhotos({
            userId: authContext.user.id,
            route: '/api/chat',
            action,
            model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            status: 'success',
            metadata,
            photoCount: imageCount,
            accessToken: authContext.accessToken
          }).catch(() => {})
        } catch {
          logCorrectionTiming(requestId, 'llm_total_ms', llmStart, { status: 'error' })
          logAiUsageEvent({
            userId: authContext.user.id,
            route: '/api/chat',
            action,
            model,
            status: 'error',
            metadata,
            accessToken: authContext.accessToken
          }).catch(() => {})
        } finally {
          logCorrectionTiming(requestId, 'total_ms', totalStart, { stream: true })
          controller.close()
        }
      }
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  let message
  const llmStart = Date.now()
  try {
    // Mismo cupo compartido de organización que las correcciones: 429/529 son
    // transitorios y se reintentan. Ver withAnthropicRetry.
    message = await withAnthropicRetry(
      () => client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemContent,
        messages: [{ role: 'user', content: contenido }]
      }),
      (intento, status) => console.warn('[chat] reintento por saturación', { intento, status }),
    )
  } catch (error) {
    logCorrectionTiming(requestId, 'llm_total_ms', llmStart, { status: 'error' })
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/chat',
      action,
      model,
      status: 'error',
      errorCode: getAiErrorCode(error),
      metadata,
      accessToken: authContext.accessToken
    })
    if (isOverloadedError(error)) {
      return NextResponse.json(
        {
          error: 'ai_overloaded',
          message: 'El tutor está saturado ahora mismo. Espera un minuto y vuelve a preguntar.',
        },
        { status: 503, headers: { 'Retry-After': '60' } }
      )
    }
    throw error
  }

  const usage = extractAnthropicTokenUsage(message)
  logCorrectionTiming(requestId, 'llm_first_token_ms', llmStart, { nonStream: true })
  logCorrectionTiming(requestId, 'llm_total_ms', llmStart, {
    stopReason: message.stop_reason ?? 'unknown',
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens
  })
  await logAiUsageEventForPhotos({
    userId: authContext.user.id,
    route: '/api/chat',
    action,
    model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: 'success',
    photoCount: imageCount,
    metadata,
    accessToken: authContext.accessToken
  })

  if (message.stop_reason === 'max_tokens') {
    console.warn('[chat] truncated: true', { action, maxTokens, outputTokens: usage.outputTokens })
  }
  const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''
  logCorrectionTiming(requestId, 'total_ms', totalStart, { stream: false })
  return NextResponse.json({
    respuesta,
    truncated: message.stop_reason === 'max_tokens',
    finishReason: message.stop_reason ?? 'unknown'
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

async function getPreparationFeeling(userId: string): Promise<string | null> {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('billing_events')
      .select('payload')
      .eq('user_id', userId)
      .eq('event_type', 'onboarding_completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return null
    const payload = data?.payload as Record<string, unknown> | null | undefined
    const feeling = typeof payload?.preparation_feeling === 'string' ? payload.preparation_feeling.trim() : ''
    return PREPARATION_TONE_GUIDANCE[feeling] ? feeling : null
  } catch {
    return null
  }
}

function rateLimitResponse(action: RateLimitAction, result: { limit: number; count: number; retryAfterSeconds?: number }) {
  return NextResponse.json(
    createRateLimitPayload(action, result),
    {
      status: 429,
      headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : undefined
    }
  )
}
