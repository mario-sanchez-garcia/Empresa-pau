import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'

const client = new Anthropic()
const MAX_IMAGE_PAYLOAD_CHARS = 8_000_000

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  const { pregunta, imagen, imagenTipo, imagenes } = await request.json()

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

  contenido.push({ type: 'text', text: pregunta })

  const imageCount = (imagen ? 1 : 0) + (Array.isArray(imagenes) ? imagenes.filter(item => item?.data).length : 0)
  const action = imageCount > 0 ? 'image_correction' : 'chat'
  const model = 'claude-sonnet-4-6'
  const metadata = { hasImage: imageCount > 0, imageCount }

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
      action === 'image_correction'
        ? 'Has alcanzado el límite diario de correcciones con imagen. Vuelve a intentarlo mañana.'
        : 'Has alcanzado el límite diario de mensajes con Pausia. Vuelve a intentarlo mañana.',
      rateLimit
    )
  }

  let message
  try {
    message = await client.messages.create({
      model,
      max_tokens: 4000,
      system: `Eres Pausia, asistente experto en las pruebas de acceso a la universidad en España. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales de la comunidad indicada y ayudas a estudiar con precisión. Si recibes imágenes, son partes de la respuesta manuscrita del estudiante: léelas y corrígelas en conjunto. Responde siempre en español. Respeta estrictamente el formato que pida el usuario: si pide JSON estricto, devuelve solo JSON válido sin markdown ni texto adicional; si pide markdown, usa markdown claro.`,
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

  const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ respuesta })
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

function rateLimitResponse(message: string, result: { limit: number; count: number; retryAfterSeconds?: number }) {
  return NextResponse.json(
    {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      limit: result.limit,
      used: result.count,
      retryAfterSeconds: result.retryAfterSeconds ?? null
    },
    {
      status: 429,
      headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : undefined
    }
  )
}
