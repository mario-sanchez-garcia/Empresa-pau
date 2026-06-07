import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: 'Eres un planificador de estudio para la EBAU. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código markdown, sin explicaciones.',
    messages: [{ role: 'user', content: prompt }]
  })
  const texto = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ respuesta: texto })
}
