import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const authContext = await getAuthContext(req)
  if ('response' in authContext) return authContext.response

  const { prompt } = await req.json()

  // TODO: enforce per-user planning generation limits before calling Anthropic.
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: 'Eres un planificador de estudio para la EBAU. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código markdown, sin explicaciones.',
    messages: [{ role: 'user', content: prompt }]
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

  return { user: data.user }
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
