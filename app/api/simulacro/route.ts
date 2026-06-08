import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { buildCorrectionPrompt, parseCorrectionJson } from '@/app/lib/correctionPrompt'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { bloques, respuestas, asignatura, opcion, tiempo_empleado, simulacro_id } = body

  const prompt = buildCorrectionPrompt({
    subject: asignatura,
    simulacroId: simulacro_id,
    option: opcion,
    elapsedMinutes: Number(tiempo_empleado ?? 0),
    difficulty: 'Media',
    blocks: (bloques ?? []).map((block: any, index: number) => {
      const answer = respuestas?.[block.id]
      return {
        numeroBloque: `Bloque ${index + 1}`,
        tema: block.tema,
        year: block.year,
        convocatoria: block.convocatoria,
        option: block.option,
        maxScore: block.puntuacion,
        officialPrompt: block.enunciado,
        criteria: block.criterios,
        sourceText: block.textoFuente,
        concepts: block.conceptos,
        studentAnswer: answer?.image
          ? `Respuesta manuscrita adjunta como imagen para el ${block.tema}. Texto adicional: ${answer?.text ?? ''}`
          : (answer?.text ?? '')
      }
    })
  })

  const content: any[] = []
  for (const block of bloques ?? []) {
    const answer = respuestas?.[block.id]
    if (answer?.image) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: answer.imageType || 'image/jpeg',
          data: answer.image
        }
      })
    }
  }
  content.push({ type: 'text', text: prompt })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: 'Eres Pausia, corrector experto de EvAU Madrid. Devuelve exclusivamente JSON válido cuando el usuario lo pida. No añadas markdown ni texto fuera del JSON.',
    messages: [{ role: 'user', content }]
  })

  const raw = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
  const result = parseCorrectionJson(raw) ?? {
    simulacro_id,
    asignatura,
    nota_final: 0,
    nota_sobre_14: 0,
    feedback_general: 'No se pudo parsear la corrección automática. Reintenta la entrega.',
    raw
  }

  await updateSimulacro(simulacro_id, result, Number(tiempo_empleado ?? 0))
  return NextResponse.json(result)
}

async function updateSimulacro(id: string, result: any, tiempo: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return
  const supabase = createClient(url, key)
  await supabase
    .from('historial_simulacros')
    .update({
      nota_final: result?.nota_final ?? null,
      resultado_json: result,
      estado: 'completado',
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
}
