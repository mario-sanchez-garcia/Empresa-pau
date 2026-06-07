import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { pregunta, imagen, imagenTipo } = await request.json()

  const contenido: any[] = []

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

  contenido.push({ type: 'text', text: pregunta })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: `Eres un corrector oficial de la EBAU de Madrid. Corriges exámenes de estudiantes de 2º de Bachillerato siguiendo los criterios oficiales. Si recibes una imagen, es la respuesta manuscrita del estudiante — léela y corrígela. Responde siempre en español usando markdown con ## headers y negritas.`,
    messages: [{ role: 'user', content: contenido }]
  })

  const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ respuesta })
}