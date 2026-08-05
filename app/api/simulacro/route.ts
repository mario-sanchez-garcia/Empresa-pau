import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkAiRateLimit, extractAnthropicTokenUsage, getAiErrorCode, logAiUsageEvent } from '@/app/lib/aiUsage'
import { buildBlockPrompt, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createRateLimitPayload, type RateLimitAction, BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { getUserBillingContext, getMonthlyActionCount } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { awardXp } from '@/app/lib/camino/awardXp'
import { caminoSubjectFromSimulacro } from '@/app/lib/camino/partialExamSubjects'
import { PARCIAL_COMPLETION_XP, SIMULACRO_COMPLETION_XP } from '@/app/lib/camino/xpMap'

// 50s SDK timeout leaves ~10s for the function to return a clean JSON error
// before Vercel's 60s maxDuration kills the process and returns an HTML 504.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 50_000 })

export const maxDuration = 60

type SimulacroBlock = {
  id: string
  tema: string
  comunidad?: string
  year: number | string
  convocatoria: string
  option: string
  puntuacion: number
  enunciado: string
  criterios?: string
  textoFuente?: string
  conceptos?: string[]
  puntos?: number
  pts?: number
}

function examSystemLabel(comunidad: string) {
  return comunidad === 'Cataluña' ? 'PAU Catalunya' : 'EBAU Madrid'
}

const SUBJECT_LABELS: Record<string, string> = {
  mates: 'Matemáticas II',
  matematicas_ccss: 'Matemáticas Aplicadas a las Ciencias Sociales',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
  ingles: 'Inglés',
  lengua: 'Lengua Castellana y Literatura II',
  historia: 'Historia de España'
}

export async function POST(request: NextRequest) {
  let capturedSimulacroId: string | undefined
  let capturedSupabase: SupabaseClient | undefined
  let capturedUserId: string | undefined
  let capturedElapsed = 0

  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response

    const body = await request.json()
    const { bloques, asignatura, comunidad, opcion, tiempo_empleado, simulacro_id } = body
    const elapsed = Number(tiempo_empleado ?? 0)

    capturedSimulacroId = typeof simulacro_id === 'string' ? simulacro_id : undefined
    capturedSupabase = authContext.supabase
    capturedUserId = authContext.user.id
    // Mismo tiempo real ya cronometrado por el cliente (elapsedMinutes en
    // app/simulacros/[id]/page.tsx y en práctica parcial) — antes el catch de
    // más abajo lo descartaba y mandaba 0 fijo si la corrección lanzaba una
    // excepción no controlada (más probable en Lengua: enunciados y textos
    // fuente mucho más largos que el resto de asignaturas), dejando
    // tiempo_empleado sin guardar y el resultado mostrando "Tiempo: 0 min".
    capturedElapsed = elapsed

    if (!simulacro_id) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject: asignatura,
        message: 'Falta el identificador del simulacro.'
      }), { status: 400 })
    }

    const { data: simulacroRecord, error: simulacroError } = await authContext.supabase
      .from('historial_simulacros')
      .select('id,user_id,estado,respuestas_parciales,resultado_json,asignatura,opcion,bloques,created_at')
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
    // practica-parcial marca sus sesiones con __practice_session al crearlas — así
    // distinguimos una práctica parcial de un simulacro completo para aplicar la
    // cuota mensual correcta (partialsPerMonth vs fullMocksPerMonth) por separado.
    const isPracticeSession = isPlainRecord(simulacroRecord.resultado_json) && simulacroRecord.resultado_json.__practice_session === true
    const correctionAction: RateLimitAction = isPracticeSession ? 'parcial_correction' : 'simulacro_correction'
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
        action: correctionAction,
        limit: 1,
        windowSeconds: 24 * 60 * 60,
        accessToken: authContext.accessToken
      })

      if (!rateLimit.allowed) {
        return rateLimitResponse(correctionAction, rateLimit)
      }

      const billing = await getUserBillingContext(authContext.user.id, authContext.user.created_at, authContext.user.email)

      if (!billing.hasActivePack && billing.daysSince >= 7) {
        return NextResponse.json(
          { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
          { status: 403 }
        )
      }

      const planLimits = getCaminoPlanLimits(billing.planId)
      const monthlyLimit = isPracticeSession ? planLimits.partialsPerMonth : planLimits.fullMocksPerMonth
      const monthlyUsed = await getMonthlyActionCount(authContext.user.id, [correctionAction])
      if (monthlyUsed >= monthlyLimit) {
        const noun = isPracticeSession ? 'práctica' : 'simulacro'
        // monthlyLimit=0 (p.ej. simulacros completos en el plan free) no es
        // un "límite alcanzado" — es que el plan actual no incluye esto, y
        // "el límite de 0 simulacros" se lee raro.
        const message = monthlyLimit === 0
          ? (isPracticeSession
            ? 'Las prácticas parciales no están disponibles en tu plan actual.'
            : 'Los simulacros completos no están disponibles en tu plan actual.')
          : `Has alcanzado el límite de ${monthlyLimit} ${noun}${monthlyLimit !== 1 ? 's' : ''} este mes.`
        return NextResponse.json(
          {
            error: isPracticeSession ? 'parcial_limit_reached' : 'simulacro_limit_reached',
            message,
            code: BILLING_BLOCK_CODE
          },
          { status: 429 }
        )
      }
    }

    const t0 = Date.now()
    const model = 'claude-sonnet-4-6'
    const imagePayloadChars = blocks.reduce((total: number, block: SimulacroBlock) => {
      const image = storedAnswers?.[block.id]?.image
      return total + (typeof image === 'string' ? image.length : 0)
    }, 0)
    const imageCount = blocks.reduce((total: number, block: SimulacroBlock) => {
      const image = storedAnswers?.[block.id]?.image
      return total + (typeof image === 'string' && image.length > 0 ? 1 : 0)
    }, 0)
    const usageMetadata = {
      asignatura: subject,
      comunidad: correctionCommunity,
      opcion: storedOption || opcion || null,
      bloquesCount: blocks.length,
      tiempoEmpleado: elapsed,
      hasImage: imageCount > 0,
      imageCount,
      imagePayloadChars
    }

    console.info('[simulacro] start', { simulacroId: simulacro_id, subject, blocksCount: blocks.length })

    // Correct each block with its own focused AI call; run all in parallel.
    // A single call for all blocks exceeded Vercel's 60 s function limit.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockResults: (any | null)[] = await Promise.all(
      blocks.map(async (block: SimulacroBlock, index: number) => {
        const answer = storedAnswers?.[block.id]
        console.info('[simulacro] correcting_block', { blockIndex: index })

        const blockContent: Extract<Anthropic.MessageParam['content'], unknown[]> = []
        const blockImagePayloadChars = typeof answer?.image === 'string' ? answer.image.length : 0
        const blockMetadata = {
          ...usageMetadata,
          blockIndex: index,
          blockHasImage: blockImagePayloadChars > 0,
          blockImageCount: blockImagePayloadChars > 0 ? 1 : 0,
          blockImagePayloadChars,
          answerTextChars: typeof answer?.text === 'string' ? answer.text.length : 0,
          officialPromptChars: typeof block.enunciado === 'string' ? block.enunciado.length : null
        }
        if (answer?.image) {
          blockContent.push({
            type: 'image',
            source: { type: 'base64', media_type: answer.imageType || 'image/jpeg', data: answer.image }
          })
        }
        blockContent.push({
          type: 'text',
          text: buildBlockPrompt({
            block: {
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
                ? `Respuesta manuscrita adjunta. Texto adicional: ${answer?.text ?? ''}`
                : (answer?.text ?? '')
            },
            blockIndex: index,
            totalBlocks: blocks.length,
            subject,
            community: correctionCommunity
          })
        })

        try {
          const msg = await client.messages.create({
            model,
            max_tokens: 1800,
            system: `Eres Kairo, corrector experto de ${examSystemLabel(correctionCommunity)}. Devuelve exclusivamente JSON válido. Sin texto fuera del JSON. Mantén la corrección compacta: nota, errores principales, feedback accionable y plan breve. No repitas el enunciado ni la respuesta del alumno. Máximo 3 aciertos, 3 errores y 3 mejoras por bloque.`,
            messages: [{ role: 'user', content: blockContent }]
          })

          const raw = msg.content.filter(item => item.type === 'text').map(item => item.text).join('\n')
          const parsed = parseCorrectionJson(raw)

          const usage = extractAnthropicTokenUsage(msg)
          if (msg.stop_reason === 'max_tokens') {
            console.warn('[simulacro] truncated: true', { blockIndex: index, outputTokens: usage.outputTokens })
          }
          logAiUsageEvent({
            userId: authContext.user.id,
            route: '/api/simulacro',
            action: correctionAction,
            model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            status: parsed ? 'success' : 'error',
            metadata: blockMetadata,
            accessToken: authContext.accessToken
          }).catch(() => {})

          if (!parsed) {
            console.error('[simulacro] failed', {
              phase: 'block_parse',
              blockIndex: index,
              ms: Date.now() - t0,
              rawPreview: raw.slice(0, 150)
            })
            return null
          }
          console.info('[simulacro] block_done', { blockIndex: index, ms: Date.now() - t0 })
          return parsed
        } catch (error: unknown) {
          console.error('[simulacro] failed', {
            phase: 'block_correction',
            blockIndex: index,
            ms: Date.now() - t0,
            message: (error as Error)?.message?.slice(0, 120)
          })
          logAiUsageEvent({
            userId: authContext.user.id,
            route: '/api/simulacro',
            action: correctionAction,
            model,
            status: 'error',
            errorCode: getAiErrorCode(error),
            metadata: blockMetadata,
            accessToken: authContext.accessToken
          }).catch(() => {})
          return null
        }
      })
    )

    // All blocks failed — hard error, nothing to show
    if (blockResults.every(r => r === null)) {
      console.error('[simulacro] failed', { phase: 'all_blocks_failed', ms: Date.now() - t0 })
      const errorResult = createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'No hemos podido corregir ningún bloque del simulacro. Tus respuestas están guardadas.'
      })
      await updateSimulacroError(authContext.supabase, simulacro_id, authContext.user.id, errorResult, elapsed)
      return NextResponse.json(errorResult, { status: 502 })
    }

    // Build desglose_bloques: successful blocks get parsed result; failed ones get error placeholder
    const failedCount = blockResults.filter(r => r === null).length
    const desglose_bloques = blockResults.map((br, i) => {
      if (!br) {
        return {
          numero_bloque: `Bloque ${i + 1}`,
          tema: blocks[i]?.tema ?? `Bloque ${i + 1}`,
          año_origen: blocks[i]?.year ?? null,
          convocatoria_origen: blocks[i]?.convocatoria ?? '',
          nota: 0,
          max_puntos: blocks[i]?.puntuacion ?? 0,
          puntos_conseguidos: 0,
          puntos_maximos: blocks[i]?.puntuacion ?? 0,
          porcentaje_logrado: 0,
          que_hizo_bien: 'No disponible: este bloque no pudo corregirse.',
          errores_detectados: ['La corrección de este bloque no se completó. Vuelve a intentarlo.'],
          que_faltaba: '',
          penalizaciones_aplicadas: [] as { motivo: string; puntos_descontados: number }[],
          correccion_detalle: 'Este bloque no se pudo corregir. Pulsa "Reintentar corrección" para volver a intentarlo.',
          solucion_orientativa: '',
          consejo_para_mejorar: 'Vuelve a entregar el simulacro para corregir este bloque.',
          porqueEsAsi: null
        }
      }
      return {
        ...br,
        numero_bloque: br.numero_bloque ?? `Bloque ${i + 1}`,
        tema: br.tema ?? blocks[i]?.tema ?? `Bloque ${i + 1}`,
        año_origen: br.año_origen ?? blocks[i]?.year ?? null,
        convocatoria_origen: br.convocatoria_origen ?? blocks[i]?.convocatoria ?? ''
      }
    })

    const feedback_general = failedCount > 0
      ? `Se corrigieron ${blocks.length - failedCount} de ${blocks.length} bloques. ${failedCount} bloque(s) no se completaron; pulsa "Reintentar corrección" para verlos.`
      : `Corrección completada para los ${blocks.length} bloques del simulacro.`

    const merged = {
      simulacro_id,
      asignatura: subject,
      nota_final: null as number | null,
      tiempo_empleado_minutos: elapsed,
      feedback_general,
      fortalezas: desglose_bloques
        .filter(b => b.que_hizo_bien && !(b.que_hizo_bien as string).startsWith('No disponible'))
        .map(b => (b.que_hizo_bien as string).slice(0, 120))
        .slice(0, 3),
      errores_principales: desglose_bloques
        .flatMap(b => Array.isArray(b.errores_detectados) ? (b.errores_detectados as string[]) : [])
        .filter(e => e && !e.startsWith('La corrección de este bloque'))
        .slice(0, 4),
      plan_repaso: [] as { prioridad: number; tema: string; accion: string; tiempo_recomendado: string; recurso_sugerido: string }[],
      desglose_bloques,
      resumen_por_bloque_tematico: [] as { bloque: string; puntos_conseguidos: number; puntos_maximos: number; porcentaje: number; nivel: string; aparece_en_plan_repaso: boolean }[]
    }

    const result = normalizeCorrectionResult(merged, {
      simulacroId: simulacro_id,
      subject,
      elapsed,
      blocks
    })

    console.info('[simulacro] saving_result')

    const updated = await updateSimulacro(authContext.supabase, simulacro_id, authContext.user.id, result, elapsed)
    if (!updated) {
      return NextResponse.json(createCorrectionError({
        simulacroId: simulacro_id,
        subject,
        message: 'No hemos podido guardar la corrección del simulacro.'
      }), { status: 500 })
    }

    // XP best-effort: si falla, la corrección ya está guardada y devuelta al
    // alumno — no tiene sentido convertir esto en un error 500 de la petición.
    // mission_date viene de la creación del simulacro (no "hoy") para que un
    // reintento en otro día natural no rompa la deduplicación por unique
    // constraint en camino_xp_events.
    let xpResult: Awaited<ReturnType<typeof awardXp>> | null = null
    try {
      const missionDate = typeof simulacroRecord.created_at === 'string'
        ? simulacroRecord.created_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
      xpResult = await awardXp(authContext.supabase, authContext.user.id, {
        xp: isPracticeSession ? PARCIAL_COMPLETION_XP : SIMULACRO_COMPLETION_XP,
        sourceType: isPracticeSession ? 'parcial_completion' : 'simulacro_completion',
        sourceId: simulacro_id,
        subject: caminoSubjectFromSimulacro(String(simulacroRecord.asignatura)),
        missionDate,
        scoreOnTen: result.nota_final
      })
    } catch (xpError) {
      console.error('[simulacro] xp_award_failed', { simulacroId: simulacro_id, message: (xpError as Error)?.message })
    }

    console.info('[simulacro] done', { totalMs: Date.now() - t0, failedBlocks: failedCount })
    return NextResponse.json({
      ...result,
      xpAwarded: xpResult?.xpAwarded ?? 0,
      bonusXp: xpResult?.bonusXp ?? 0,
      totalXp: xpResult?.totalXp ?? null,
      streakDays: xpResult?.streakDays ?? null,
      leagueUpgrade: xpResult?.leagueUpgrade ?? null
    })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.status ?? (error as any)?.code ?? 'unknown'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorName = (error as any)?.name ?? (error as any)?.constructor?.name ?? 'Error'
    console.error('SIMULACRO_CORRECTION_ERROR', {
      simulacroId: capturedSimulacroId,
      errorCode,
      errorName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: (error as any)?.message?.slice(0, 120)
    })
    const errorResult = createCorrectionError({
      simulacroId: capturedSimulacroId,
      message: 'No hemos podido corregir este simulacro ahora mismo. Tus respuestas siguen guardadas.'
    })
    if (capturedSimulacroId && capturedSupabase && capturedUserId) {
      await updateSimulacroError(capturedSupabase, capturedSimulacroId, capturedUserId, errorResult, capturedElapsed)
    }
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

async function updateSimulacro(supabase: SupabaseClient, id: string, userId: string, result: unknown, tiempo: number) {
  // No .select().maybeSingle(): Boolean(data) would return false on 0 rows even on success
  // (e.g. when service role is absent and RLS SELECT returns empty after UPDATE).
  // Trust the error check instead.
  const { error } = await supabase
    .from('historial_simulacros')
    .update({
      nota_final: (result as Record<string, unknown>)?.nota_final ?? null,
      resultado_json: result,
      estado: 'completado',
      tiempo_empleado: tiempo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) {
    console.error('SIMULACRO_UPDATE_ERROR', { simulacroId: id, code: error.code, message: error.message })
    return false
  }
  return true
}

async function updateSimulacroError(supabase: SupabaseClient, id: string, userId: string, result: unknown, tiempo: number) {
  if (!id) return false
  const { error } = await supabase
    .from('historial_simulacros')
    .update({
      resultado_json: result,
      estado: 'completado',
      tiempo_empleado: tiempo > 0 ? tiempo : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) {
    console.error('SIMULACRO_ERROR_UPDATE_ERROR', { simulacroId: id, code: error.code, message: error.message })
    return false
  }
  return true
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCorrectionResult(result: any, context: { simulacroId: string; subject: string; elapsed: number; blocks: SimulacroBlock[] }) {
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
      consejo_para_mejorar: textOrFallback(block.consejo_para_mejorar ?? block.consejo_especifico, 'Repite este bloque explicando cada paso y comparándolo con el criterio oficial.'),
      porqueEsAsi: block.porqueEsAsi ?? block.whyExplanation ?? null
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

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function listToText(value: unknown) {
  return normalizeList(value).join(' ')
}

function textOrFallback(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNumber(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlainRecord(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getCorrectionCommunity(value: unknown, blocks: SimulacroBlock[]) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  const blockCommunity = blocks.find(block => typeof block?.comunidad === 'string' && block.comunidad.trim())?.comunidad
  return typeof blockCommunity === 'string' && blockCommunity.trim() ? blockCommunity.trim() : 'Madrid'
}
