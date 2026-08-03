import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { withAnthropicRetry } from '@/app/lib/ai/withAnthropicRetry'
import { VALID_EXAM_CONFIDENCE, VALID_EXAM_PRIORITIES, type ExamConfidence, type ExamPriority } from '@/app/lib/camino/cleanStudentExams'

export const dynamic = 'force-dynamic'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-6'

function cleanString(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Deterministic fallback — mirrors the priority/confidence weighting in
// injectPartialExamMissions.ts's sessionCountFor(), used only if the AI call
// fails or times out so exam creation never blocks on it.
function fallbackSessionCount(priority: ExamPriority, confidence: ExamConfidence): number {
  const priorityBonus = priority === 'muy_alta' ? 2 : priority === 'alta' ? 1 : priority === 'baja' ? -1 : 0
  const confidenceBonus = confidence === 'bajo' ? 1 : confidence === 'alto' ? -1 : 0
  return Math.max(1, Math.min(3 + priorityBonus + confidenceBonus, 6))
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const subject = cleanString(body.subject, 80)
  const block = cleanString(body.block, 80)
  const topic = cleanString(body.topic, 120)
  const content = cleanString(body.content, 500)
  const priority: ExamPriority = (VALID_EXAM_PRIORITIES as readonly string[]).includes(body.priority as string)
    ? (body.priority as ExamPriority) : 'normal'
  const confidence: ExamConfidence = (VALID_EXAM_CONFIDENCE as readonly string[]).includes(body.confidence as string)
    ? (body.confidence as ExamConfidence) : 'medio'

  const fallback = fallbackSessionCount(priority, confidence)

  let customInstructions = ''
  try {
    const db = createServiceClient()
    const { data } = await db.from('perfiles').select('custom_instructions').eq('id', user.id).maybeSingle()
    customInstructions = cleanString(data?.custom_instructions, 600)
  } catch { /* instructions are optional context, never block on them */ }

  try {
    const prompt = `Eres el motor de planificación de Kairo (app de preparación PAU). Un alumno acaba de crear/editar un examen parcial con estos datos:
- Asignatura: ${subject || 'sin especificar'}
- Bloque: ${block || 'sin especificar'}
- Tema: ${topic || 'sin especificar'}
- Qué entra en el examen (texto libre del alumno): ${content || 'sin especificar'}
- Prioridad que le ha dado el alumno: ${priority}
- Cómo dice que va en la asignatura: ${confidence} (bajo = va mal, alto = va bien)
${customInstructions ? `- Instrucciones personalizadas activas del alumno: ${customInstructions}` : ''}

Decide cuántas sesiones de preparación dedicarle a este parcial (entero de 1 a 6: más si va mal o tiene prioridad alta/muy alta, menos si va bien o prioridad baja) y escribe una nota breve (máx 140 caracteres, en español, sin markdown) sobre en qué enfocar las sesiones dado el contenido que ha descrito. Responde ÚNICAMENTE con JSON válido, sin texto adicional: {"sessionCount": <entero>, "focusNote": "<string>"}`

    const response = await withAnthropicRetry(() => client.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }))

    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no_json_in_response')
    const parsed = JSON.parse(match[0]) as { sessionCount?: unknown; focusNote?: unknown }
    const sessionCount = typeof parsed.sessionCount === 'number' && Number.isFinite(parsed.sessionCount)
      ? Math.max(1, Math.min(Math.round(parsed.sessionCount), 6))
      : fallback
    const focusNote = typeof parsed.focusNote === 'string' ? parsed.focusNote.slice(0, 140) : ''

    return NextResponse.json({ sessionCount, focusNote, source: 'ai' })
  } catch (err) {
    console.error('[parciales/plan-intensity] falling back to deterministic sizing:', err)
    return NextResponse.json({ sessionCount: fallback, focusNote: '', source: 'fallback' })
  }
}
