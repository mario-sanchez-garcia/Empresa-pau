// TEMPORAL -- solo para depurar el 500 de /api/camino/chat, se borra antes de commitear.
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30_000 })
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'di hola' }],
    })
    return NextResponse.json({ ok: true, response })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : null,
      status: (error as { status?: unknown })?.status ?? null,
      details: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error instanceof Error ? error : {}))),
    })
  }
}
