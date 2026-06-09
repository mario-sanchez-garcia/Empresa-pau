import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { buildCorrectionPrompt, parseCorrectionJson } from '@/app/lib/correctionPrompt'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bloques, respuestas, asignatura, opcion, tiempo_empleado, simulacro_id } = body
    const blocks = Array.isArray(bloques) ? bloques : []
    const elapsed = Number(tiempo_empleado ?? 0)

    if (!simulacro_id || !blocks.length) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'Faltan datos del simulacro para poder corregirlo.'
      }), { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const errorResult = createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'La corrección IA no está configurada en el servidor.'
      })
      await updateSimulacroError(simulacro_id, errorResult, elapsed)
      return NextResponse.json(errorResult, { status: 500 })
    }

    const prompt = buildCorrectionPrompt({
      subject: asignatura,
      simulacroId: simulacro_id,
      option: opcion,
      elapsedMinutes: elapsed,
      difficulty: 'Media',
      blocks: blocks.map((block: any, index: number) => {
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
    for (const block of blocks) {
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
      max_tokens: 6000,
      system: 'Eres Pausia, corrector experto de EvAU Madrid. Devuelve exclusivamente JSON válido cuando el usuario lo pida. No añadas markdown ni texto fuera del JSON.',
      messages: [{ role: 'user', content }]
    })

    const raw = message.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')
    const parsed = parseCorrectionJson(raw)

    if (!parsed) {
      console.error('SIMULACRO_CORRECTION_PARSE_ERROR_RAW', raw)
      const errorResult = createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'No hemos podido interpretar la corrección generada por la IA. Tus respuestas están guardadas.',
        raw
      })
      await updateSimulacroError(simulacro_id, errorResult, elapsed)
      return NextResponse.json(errorResult, { status: 502 })
    }

    const result = normalizeCorrectionResult(parsed, {
      simulacroId: simulacro_id,
      subject: asignatura,
      elapsed,
      blocks
    })

    await updateSimulacro(simulacro_id, result, elapsed)
    return NextResponse.json(result)
  } catch (error) {
    console.error('SIMULACRO_CORRECTION_ERROR', error)
    const errorResult = createCorrectionError({
      message: 'No hemos podido corregir este simulacro ahora mismo. Tus respuestas siguen guardadas.'
    })
    return NextResponse.json(errorResult, { status: 500 })
  }
}

async function updateSimulacro(id: string, result: any, tiempo: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return
  const supabase = createClient(url, key)
  const { error } = await supabase
    .from('historial_simulacros')
    .update({
      nota_final: result?.nota_final ?? null,
      resultado_json: result,
      estado: 'completado',
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
  if (error) console.error('SIMULACRO_UPDATE_ERROR', error)
}

async function updateSimulacroError(id: string, result: any, tiempo: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !id) return
  const supabase = createClient(url, key)
  const { error } = await supabase
    .from('historial_simulacros')
    .update({
      resultado_json: result,
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
  if (error) console.error('SIMULACRO_ERROR_UPDATE_ERROR', error)
}

function createCorrectionError({ simulacroId, subject, message, raw }: { simulacroId?: string; subject?: string; message: string; raw?: string }) {
  return {
    simulacro_id: simulacroId ?? null,
    asignatura: subject ?? null,
    correction_error: true,
    estado_correccion: 'error',
    nota_final: null,
    nota_sobre_14: null,
    feedback_general: message,
    mensaje_usuario: 'No hemos podido corregir este simulacro. Inténtalo de nuevo desde el examen; tus respuestas están guardadas.',
    raw: raw ?? null
  }
}

function normalizeCorrectionResult(result: any, context: { simulacroId: string; subject: string; elapsed: number; blocks: any[] }) {
  const normalizedBlocks = context.blocks.map((source, index) => {
    const block = Array.isArray(result?.desglose_bloques) ? result.desglose_bloques[index] ?? {} : {}
    const max = safeNumber(source.puntuacion ?? source.puntos ?? source.pts ?? block.max_puntos ?? block.puntos_maximos, 0)
    const score = clamp(safeNumber(block.nota ?? block.puntos_conseguidos, 0), 0, max)
    const percentage = max > 0 ? Math.round(score / max * 100) : 0
    return {
      ...block,
      numero_bloque: block.numero_bloque || `Bloque ${index + 1}`,
      tema: block.tema || source.tema || `Bloque ${index + 1}`,
      año_origen: block.año_origen ?? source.year ?? null,
      convocatoria_origen: block.convocatoria_origen ?? source.convocatoria ?? '',
      nota: score,
      max_puntos: max,
      puntos_conseguidos: score,
      puntos_maximos: max,
      porcentaje_logrado: safeNumber(block.porcentaje_logrado ?? block.porcentaje, percentage),
      que_hizo_bien: textOrFallback(block.que_hizo_bien, 'No se han identificado aciertos concretos en la respuesta.'),
      errores_detectados: normalizeList(block.errores_detectados),
      que_faltaba: textOrFallback(block.que_faltaba, 'Faltaba justificar mejor el procedimiento o completar partes del enunciado.'),
      penalizaciones_aplicadas: Array.isArray(block.penalizaciones_aplicadas) ? block.penalizaciones_aplicadas : [],
      correccion_detalle: textOrFallback(block.correccion_detalle, 'Corrección no detallada por la IA. Revisa la solución orientativa.'),
      solucion_correcta_corta: textOrFallback(block.solucion_correcta_corta ?? block.solucion_orientativa, 'No hay solución orientativa disponible.'),
      solucion_orientativa: textOrFallback(block.solucion_orientativa ?? block.solucion_correcta_corta, 'No hay solución orientativa disponible.'),
      consejo_especifico: textOrFallback(block.consejo_especifico ?? block.consejo_para_mejorar, 'Repite este bloque explicando cada paso y comparándolo con el criterio oficial.'),
      consejo_para_mejorar: textOrFallback(block.consejo_para_mejorar ?? block.consejo_especifico, 'Repite este bloque explicando cada paso y comparándolo con el criterio oficial.')
    }
  })

  const totalMax = normalizedBlocks.reduce((sum, block) => sum + safeNumber(block.puntos_maximos, 0), 0)
  const totalScore = normalizedBlocks.reduce((sum, block) => sum + safeNumber(block.puntos_conseguidos, 0), 0)
  const computedNota = totalMax > 0 ? totalScore / totalMax * 10 : 0
  const nota = clamp(computedNota, 0, 10)
  const resumen = Array.isArray(result?.resumen_por_bloque_tematico) && result.resumen_por_bloque_tematico.length
    ? result.resumen_por_bloque_tematico
    : normalizedBlocks.map(block => ({
      bloque: block.tema,
      puntos_conseguidos: block.puntos_conseguidos,
      puntos_maximos: block.puntos_maximos,
      porcentaje: block.porcentaje_logrado,
      nivel: block.porcentaje_logrado >= 80 ? 'Domina' : block.porcentaje_logrado >= 50 ? 'En progreso' : 'Necesita refuerzo urgente',
      aparece_en_plan_repaso: block.porcentaje_logrado < 80
    }))

  return {
    ...result,
    simulacro_id: result?.simulacro_id ?? context.simulacroId,
    asignatura: result?.asignatura ?? context.subject,
    estado_correccion: 'ok',
    correction_error: false,
    nota_final: Number(nota.toFixed(2)),
    nota_sobre_14: null,
    tiempo_empleado_minutos: safeNumber(result?.tiempo_empleado_minutos, context.elapsed),
    feedback_general: textOrFallback(result?.feedback_general, 'Corrección completada. Revisa el desglose por bloques para ver los errores concretos.'),
    fortalezas: normalizeList(result?.fortalezas ?? result?.puntos_fuertes),
    errores_principales: normalizeList(result?.errores_principales ?? result?.puntos_mejora),
    puntos_fuertes: textOrFallback(result?.puntos_fuertes ?? listToText(result?.fortalezas), 'Revisa los bloques con mayor puntuación para identificar tus aciertos.'),
    puntos_mejora: textOrFallback(result?.puntos_mejora ?? listToText(result?.errores_principales), 'Prioriza los bloques con menor puntuación y rehace sus apartados.'),
    plan_repaso: Array.isArray(result?.plan_repaso) ? result.plan_repaso.slice(0, 3) : [],
    desglose_bloques: normalizedBlocks,
    resumen_por_bloque_tematico: resumen
  }
}

function normalizeList(value: any) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function listToText(value: any) {
  return normalizeList(value).join(' ')
}

function textOrFallback(value: any, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNumber(value: any, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
