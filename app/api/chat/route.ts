import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, type RateLimitAction } from '@/app/lib/rateLimitMessages'
import { createServiceClient } from '@/app/lib/billing/supabase'

const client = new Anthropic()
const MAX_IMAGE_PAYLOAD_CHARS = 8_000_000
const STREAM_TRUNCATION_SENTINEL = '[[PAUSIA_TRUNCATED_7f3a9b2c]]'
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

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  const { searchParams } = new URL(request.url)
  const wantsStream = searchParams.get('stream') === '1'

  const { pregunta, imagen, imagenTipo, imagenes, correctionMode, correctionBlock, correctionSessionId } = await request.json()

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
  const model = 'claude-sonnet-4-6'
  const maxTokens = correctionMode === 'chunked_correction' ? 5000
    : action === 'image_correction' ? 2200
    : 2200
  const responseFormatRules = action === 'image_correction'
    ? `${CHAT_RESPONSE_FORMAT_RULES}\n\n${IMAGE_CORRECTION_COMPACT_RULES}`
    : CHAT_RESPONSE_FORMAT_RULES
  const metadata = {
    hasImage: imageCount > 0,
    imageCount,
    imagePayloadChars: imagePayloadSize,
    promptChars: typeof pregunta === 'string' ? pregunta.length : null,
    correctionMode: typeof correctionMode === 'string' ? correctionMode : null,
    correctionBlock: typeof correctionBlock === 'string' ? correctionBlock : null,
    correctionSessionId: typeof correctionSessionId === 'string' ? correctionSessionId : null
  }
  const internalUser = isInternalUser(authContext.user.email)

  contenido.push({ type: 'text', text: `${responseFormatRules}\n\n${pregunta}` })

  if (!internalUser) {
    const billing = await getUserBilling(authContext.user.id)
    if (!billing.hasActivePack) {
      const daysSince = getDaysSince(authContext.user.created_at)
      if (daysSince >= 7) {
        return NextResponse.json(
          { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.' },
          { status: 403 }
        )
      }
      const monthlyCount = await getMonthlyCorrections(authContext.user.id)
      if (monthlyCount >= 25) {
        return NextResponse.json(
          { error: 'correction_limit_reached', message: 'Has alcanzado el límite de 25 correcciones este mes.' },
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
      return rateLimitResponse(
        action,
        rateLimit
      )
    }
  }

  const systemPrompt = `Eres Pausia, asistente experto en las pruebas de acceso a la universidad en España. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales de la comunidad indicada y ayudas a estudiar con precisión. Si recibes imágenes, son partes de la respuesta manuscrita del estudiante: léelas y corrígelas en conjunto. Responde siempre en español. Respeta estrictamente el formato que pida el usuario: si pide JSON estricto, devuelve solo JSON válido sin markdown ni texto adicional; si pide markdown, usa markdown claro. Cuando corrijas o expliques una duda académica y el formato lo permita, añade un bloque opcional titulado exactamente "¿Por qué es así?" con explicación específica del ejercicio, conexión con la respuesta del alumno, error típico PAU, mini ejemplo original y consejo para sacar puntos. No lo llames teoría, teoría desplegable ni más información. No copies materiales externos; redacta con palabras propias de Pausia. Usa $...$ para LaTeX inline y entornos \\begin{...}...\\end{...} sin $ externos para sistemas y matrices. NUNCA pongas \\begin{...} dentro de $...$. NUNCA mezcles delimitadores: si abres $ cierra con $, si abres $$ cierra con $$.${action === 'image_correction' ? ' En correcciones con imagen, se especifico pero compacto: nota clara, maximo 3 aciertos, 3 errores, 3 mejoras y teoria en 2 lineas. No repitas enunciado ni respuesta del alumno.' : ''}`
  const systemContent = [{ type: 'text' as const, text: systemPrompt, cache_control: { type: 'ephemeral' as const } }]

  if (wantsStream) {
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
          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          // All events consumed — finalMessage resolves immediately here
          const finalMsg = await anthropicStream.finalMessage()
          const usage = extractAnthropicTokenUsage(finalMsg)
          if (finalMsg.stop_reason === 'max_tokens') {
            console.warn('[chat] truncated: true (stream)', { action, maxTokens, outputTokens: usage.outputTokens })
            controller.enqueue(encoder.encode(STREAM_TRUNCATION_SENTINEL))
          }
          logAiUsageEvent({
            userId: authContext.user.id,
            route: '/api/chat',
            action,
            model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            status: 'success',
            metadata,
            accessToken: authContext.accessToken
          }).catch(() => {})
        } catch {
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
          controller.close()
        }
      }
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  let message
  try {
    message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemContent,
      messages: [{ role: 'user', content: contenido }]
    })
  } catch (error) {
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
    throw error
  }

  const usage = extractAnthropicTokenUsage(message)
  await logAiUsageEvent({
    userId: authContext.user.id,
    route: '/api/chat',
    action,
    model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: 'success',
    metadata,
    accessToken: authContext.accessToken
  })

  if (message.stop_reason === 'max_tokens') {
    console.warn('[chat] truncated: true', { action, maxTokens, outputTokens: usage.outputTokens })
  }
  const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''
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

function rateLimitResponse(action: RateLimitAction, result: { limit: number; count: number; retryAfterSeconds?: number }) {
  return NextResponse.json(
    createRateLimitPayload(action, result),
    {
      status: 429,
      headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : undefined
    }
  )
}

async function getUserBilling(userId: string): Promise<{ hasActivePack: boolean }> {
  try {
    const db = createServiceClient()
    const now = new Date().toISOString()
    const { data } = await db
      .from('user_entitlements')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .limit(1)
    return { hasActivePack: (data?.length ?? 0) > 0 }
  } catch {
    return { hasActivePack: false }
  }
}

function getDaysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000)
}

async function getMonthlyCorrections(userId: string): Promise<number> {
  try {
    const db = createServiceClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await db
      .from('ai_usage_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('action', ['chat', 'image_correction'])
      .eq('status', 'success')
      .gte('created_at', startOfMonth)
    return count ?? 0
  } catch {
    return 0
  }
}
