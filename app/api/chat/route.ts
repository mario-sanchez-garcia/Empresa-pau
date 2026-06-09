import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { pregunta, imagen, imagenTipo, imagenes } = await request.json()

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `Eres Pausia, asistente experto en las pruebas de acceso a la universidad en España. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales de la comunidad indicada y ayudas a estudiar con precisión. Si recibes imágenes, son partes de la respuesta manuscrita del estudiante: léelas y corrígelas en conjunto. Responde siempre en español. Respeta estrictamente el formato que pida el usuario: si pide JSON estricto, devuelve solo JSON válido sin markdown ni texto adicional; si pide markdown, usa markdown claro.`,
    messages: [{ role: 'user', content: contenido }]
  })

  const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ respuesta })
}
