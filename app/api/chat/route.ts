import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

  // TODO: enforce per-user chat/correction limits before calling Anthropic.
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `Eres Pausia, asistente experto en las pruebas de acceso a la universidad en España. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales de la comunidad indicada y ayudas a estudiar con precisión. Si recibes imágenes, son partes de la respuesta manuscrita del estudiante: léelas y corrígelas en conjunto. Responde siempre en español. Respeta estrictamente el formato que pida el usuario: si pide JSON estricto, devuelve solo JSON válido sin markdown ni texto adicional; si pide markdown, usa markdown claro.`,
    messages: [{ role: 'user', content: contenido }]
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

  return { user: data.user }
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
