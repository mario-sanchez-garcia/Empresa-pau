import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { buildCorrectionPrompt, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, type RateLimitAction } from '@/app/lib/rateLimitMessages'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 60

const SUBJECT_LABELS: Record<string, string> = {
  mates: 'Matemáticas II',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
  ingles: 'Inglés',
  lengua: 'Lengua Castellana y Literatura II',
  historia: 'Historia de España'
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response

    const body = await request.json()
    const { bloques, asignatura, comunidad, opcion, tiempo_empleado, simulacro_id } = body
    const elapsed = Number(tiempo_empleado ?? 0)

    if (!simulacro_id) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'Falta el identificador del simulacro.'
      }), { status: 400 })
    }

    const { data: simulacroRecord, error: simulacroError } = await authContext.supabase
      .from('historial_simulacros')
      .select('id,user_id,estado,respuestas_parciales,resultado_json,asignatura,opcion,bloques')
      .eq('id', simulacro_id)
      .eq('user_id', authContext.user.id)
      .maybeSingle()

    if (simulacroError) {
      console.error('SIMULACRO_OWNERSHIP_CHECK_ERROR', simulacroError)
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'No hemos podido validar este simulacro ahora mismo.'
      }), { status: 500 })
    }

    if (!simulacroRecord) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'No hemos encontrado este simulacro para tu cuenta.'
      }), { status: 404 })
    }

    const blocks = Array.isArray(simulacroRecord.bloques) ? simulacroRecord.bloques : Array.isArray(bloques) ? bloques : []
    const storedAnswers = isPlainRecord(simulacroRecord.respuestas_parciales) ? simulacroRecord.respuestas_parciales : {}
    const correctionCommunity = getCorrectionCommunity(comunidad, blocks)
    const storedCommunity = getCorrectionCommunity(null, blocks)
    const subject = SUBJECT_LABELS[String(simulacroRecord.asignatura)] ?? String(asignatura ?? simulacroRecord.asignatura ?? 'Simulacro')
    const storedOption = String(simulacroRecord.opcion ?? '')

    if (!blocks.length) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'Faltan datos del simulacro para poder corregirlo.'
      }), { status: 400 })
    }

    if (typeof comunidad === 'string' && comunidad.trim() && comunidad.trim() !== storedCommunity) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'La comunidad del simulacro no coincide con el registro guardado.'
      }), { status: 400 })
    }

    if (typeof opcion === 'string' && opcion.trim() && storedOption && opcion.trim() !== storedOption) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'La opción del simulacro no coincide con el registro guardado.'
      }), { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const errorResult = createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'La corrección IA no está configurada en el servidor.'
      })
      await updateSimulacroError(authContext.supabase, simulacro_id, authContext.user.id, errorResult, elapsed)
      return NextResponse.json(errorResult, { status: 500 })
    }

    const internalUser = isInternalUser(authContext.user.email)
    if (!internalUser) {
      const rateLimit = await checkAiRateLimit({
        userId: authContext.user.id,
        route: '/api/simulacro',
        action: 'simulacro_correction',
        limit: 1,
        windowSeconds: 24 * 60 * 60,
        accessToken: authContext.accessToken
      })

      if (!rateLimit.allowed) {
        return rateLimitResponse(
          'simulacro_correction',
          rateLimit
        )
      }
    }

    const prompt = buildCorrectionPrompt({
      subject,
      community: correctionCommunity,
      simulacroId: simulacro_id,
      option: storedOption || opcion,
      elapsedMinutes: elapsed,
      difficulty: 'Media',
      blocks: blocks.map((block: any, index: number) => {
        const answer = storedAnswers?.[block.id]
        return {
          numeroBloque: `Bloque ${index + 1}`,
          tema: block.tema,
          community: block.comunidad ?? correctionCommunity,
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
      const answer = storedAnswers?.[block.id]
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

    const model = 'claude-sonnet-4-6'
    const usageMetadata = {
      asignatura: subject,
      comunidad: correctionCommunity,
      opcion: storedOption || opcion || null,
      bloquesCount: blocks.length,
      tiempoEmpleado: elapsed
    }
    let message
    try {
      message = await client.messages.create({
        model,
        max_tokens: 6000,
        system: 'Eres Pausia, corrector experto de EvAU Madrid. Devuelve exclusivamente JSON válido cuando el usuario lo pida. No añadas markdown ni texto fuera del JSON.',
        messages: [{ role: 'user', content }]
      })
    } catch (error) {
      await logAiUsageEvent({
        userId: authContext.user.id,
        route: '/api/simulacro',
        action: 'simulacro_correction',
        model,
        status: 'error',
        errorCode: getAiErrorCode(error),
        metadata: usageMetadata,
        accessToken: authContext.accessToken
      })
      throw error
    }

    const usage = extractAnthropicTokenUsage(message)
    await logAiUsageEvent({
      userId: authContext.user.id,
      route: '/api/simulacro',
      action: 'simulacro_correction',
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      status: 'success',
      metadata: usageMetadata,
      accessToken: authContext.accessToken
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
        subject,
        message: 'No hemos podido interpretar la corrección generada por la IA. Tus respuestas están guardadas.',
        raw
      })
      await updateSimulacroError(authContext.supabase, simulacro_id, authContext.user.id, errorResult, elapsed)
      return NextResponse.json(errorResult, { status: 502 })
    }

    const result = normalizeCorrectionResult(parsed, {
      simulacroId: simulacro_id,
      subject,
      elapsed,
      blocks
    })

    const updated = await updateSimulacro(authContext.supabase, simulacro_id, authContext.user.id, result, elapsed)
    if (!updated) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'No hemos podido guardar la corrección del simulacro.'
      }), { status: 500 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('SIMULACRO_CORRECTION_ERROR', error)
    const errorResult = createCorrectionError({
      message: 'No hemos podido corregir este simulacro ahora mismo. Tus respuestas siguen guardadas.'
    })
    return NextResponse.json(errorResult, { status: 500 })
  }
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(url, serviceKey ?? anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: serviceKey ? undefined : { headers: { Authorization: `Bearer ${accessToken}` } }
  })

  return { user: data.user, supabase, accessToken }
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

function rateLimitResponse(action: RateLimitAction, result: { limit: number; count: number; retryAfterSeconds?: number }) {
  return NextResponse.json(
    createRateLimitPayload(action, result),
    {
      status: 429,
      headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : undefined
    }
  )
}

async function updateSimulacro(supabase: any, id: string, userId: string, result: any, tiempo: number) {
  const { data, error } = await supabase
    .from('historial_simulacros')
    .update({
      nota_final: result?.nota_final ?? null,
      resultado_json: result,
      estado: 'completado',
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('SIMULACRO_UPDATE_ERROR', error)
    return false
  }
  return Boolean(data)
}

async function updateSimulacroError(supabase: any, id: string, userId: string, result: any, tiempo: number) {
  if (!id) return false
  const { data, error } = await supabase
    .from('historial_simulacros')
    .update({
      resultado_json: result,
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('SIMULACRO_ERROR_UPDATE_ERROR', error)
    return false
  }
  return Boolean(data)
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

function isPlainRecord(value: any): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getCorrectionCommunity(value: any, blocks: any[]) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  const blockCommunity = blocks.find(block => typeof block?.comunidad === 'string' && block.comunidad.trim())?.comunidad
  return typeof blockCommunity === 'string' && blockCommunity.trim() ? blockCommunity.trim() : 'Madrid'
}
