import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const authContext = await getAuthContext(req)
  if ('response' in authContext) return authContext.response

  const { prompt } = await req.json()

  const model = 'claude-sonnet-4-6'

  const rateLimit = await checkAiRateLimit({
    userId: authContext.user.id,
    route: '/api/planning',
    action: 'planning_generation',
    limit: 1,
    windowSeconds: 7 * 24 * 60 * 60,
    accessToken: authContext.accessToken
  })

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      'Ya has generado un plan de estudio esta semana. Podrás generar otro más adelante.',
      rateLimit
    )
  }

  let message
  try {
    message = await client.messages.create({
      model,
      max_tokens: 2000,
      system: 'Eres un planificador de estudio para la EBAU. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código markdown, sin explicaciones.',
      messages: [{ role: 'user', content: prompt }]
    })
  } catch (error) {
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/planning',
      action: 'planning_generation',
      model,
      status: 'error',
      errorCode: getAiErrorCode(error),
      metadata: {},
      accessToken: authContext.accessToken
    })
    throw error
  }

  const usage = extractAnthropicTokenUsage(message)
  await logAiUsageEvent({
    userId: authContext.user.id,
    route: '/api/planning',
    action: 'planning_generation',
    model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    status: 'success',
    metadata: {},
    accessToken: authContext.accessToken
  })

  const texto = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ respuesta: texto })
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
