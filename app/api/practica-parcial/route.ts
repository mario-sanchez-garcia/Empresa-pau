import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { generatePracticeSession } from '@/components/simulacros/data'
import type { SimulacroSubject } from '@/components/simulacros/types'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { getEffectivePlanLimits } from '@/app/lib/billing/limitOverrides'
import { BILLING_BLOCK_CODE, monthlyLimitResetNotice } from '@/app/lib/rateLimitMessages'
import { isInternalUser } from '@/app/lib/internalUsers'
import { resolveExamHistoriaTopics } from '@/app/lib/camino/resolveExamHistoriaTopics'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

async function getUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  return client.auth.getUser(token)
}

const VALID_SUBJECTS = new Set<string>([
  'mates', 'matematicas_ccss', 'fisica', 'quimica', 'biologia', 'ingles', 'lengua', 'historia',
])

export async function POST(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: { user }, error } = await getUser(token)
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = createServiceClient()

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }
  const missionId = typeof body.missionId === 'string' && body.missionId.trim() ? body.missionId.trim() : null
  const subject = String(body.subject ?? 'mates')
  const block = String(body.block ?? '')
  const source = typeof body.source === 'string' ? body.source.slice(0, 64) : null
  const weekStart = typeof body.weekStart === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.weekStart) ? body.weekStart : null
  const examId = typeof body.examId === 'string' && body.examId.trim() ? body.examId.trim() : null

  // examId ties this request to a real Parcial (student_exams.id) — same
  // ownership check as /api/parciales/exam-topics and /api/parciales/exam-
  // simulacro, since exam_id is free text (student_exams is a jsonb array,
  // not a table), not a real FK.
  let examOwned = false
  let examScope: 'parcial' | 'global' | undefined
  if (examId) {
    const { data: profile } = await db.from('perfiles').select('student_exams').eq('id', user.id).maybeSingle()
    const exams = Array.isArray(profile?.student_exams) ? profile.student_exams as Array<{ id?: unknown; examScope?: unknown }> : []
    const matched = exams.find(e => e?.id === examId)
    examOwned = Boolean(matched)
    examScope = matched?.examScope === 'global' ? 'global' : 'parcial'
  }

  // El alumno puede volver a pulsar la misión de "Prep. parcial" del
  // calendario después de ya haberla entregado (el enlace del calendario a
  // veces tarda en reflejar el estado, o simplemente reintenta). Antes esto
  // generaba una sesión de práctica nueva — que se entregaba sin problema,
  // pero al corregirla /api/simulacro respondía "ya se otorgó XP para este
  // source_id" y el alumno se enteraba de que la sesión no contaba solo al
  // final. Si esta missionId ya tiene una práctica completada, se devuelve
  // esa directamente en vez de crear otra — el cliente redirige a sus
  // resultados ya hechos sin pasar por el examen entero de nuevo. Se
  // comprueba antes que nada, incluso antes de los límites de plan: no es
  // una sesión nueva, así que no debe consumir cupo ni bloquearse por él.
  if (missionId) {
    // `.eq('asignatura', subject)` es una red de seguridad, no solo una
    // optimización: si missionId llegara apuntando a la misión de OTRO
    // examen/asignatura (p. ej. un bug de cliente mezclando la misión de
    // "hoy" de un parcial de Mates con el banner de un parcial de
    // Historia), sin este filtro se devolvía esa sesión ajena tal cual —
    // "pulso Empezar en Historia y carga Mates". Con el filtro, una
    // coincidencia de mission_id en la asignatura equivocada simplemente no
    // cuenta como reutilizable y se sigue con el flujo normal de abajo, que
    // sí crea/reutiliza correctamente en la asignatura pedida.
    const { data: existing } = await db
      .from('historial_simulacros')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'completado')
      .eq('asignatura', subject)
      .eq('resultado_json->>mission_id', missionId)
      .limit(1)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ id: existing.id as string, alreadyCompleted: true })
    }

    // Mismo problema que arriba pero para una sesión en pausa, no entregada:
    // el enlace de la misión de "Prep. parcial" (y el banner de parcial
    // próximo) siempre apuntan a /simulacros/practica/nueva, sin distinguir
    // "nunca empezada" de "ya empezada y pausada" — así que reabrir la misma
    // misión creaba una fila historial_simulacros nueva (otros ejercicios al
    // azar, cronómetro a 45:00 desde cero) y la sesión en pausa quedaba
    // huérfana para siempre, aunque sus respuestas siguieran bien guardadas
    // en su fila original. Se reutiliza la sesión en_progreso existente en
    // vez de crear otra, igual que ya se hace arriba con las completadas.
    const { data: inProgress } = await db
      .from('historial_simulacros')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'en_progreso')
      .eq('asignatura', subject)
      .eq('resultado_json->>mission_id', missionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (inProgress) {
      return NextResponse.json({ id: inProgress.id as string })
    }
  }

  // Bug reportado: el mismo Parcial da dos "prácticas" distintas el mismo
  // día cuando se entra por dos sitios que no comparten missionId (p. ej.
  // la misión de calendario de hoy con un id, y el banner "Empezar
  // práctica ahora" del propio Parcial sin — o con otro — missionId). La
  // comprobación de arriba solo encuentra una completada si el missionId
  // coincide EXACTO; aquí se reutiliza cualquier práctica de hoy para este
  // mismo examen (completada o en curso), missionId aparte. Solo hoy, no
  // "siempre" — los días siguientes de preparación de este mismo Parcial sí
  // deben traer ejercicios nuevos (ver injectPartialExamMissions.ts).
  if (examId && examOwned) {
    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()
    const { data: sameExamToday } = await db
      .from('historial_simulacros')
      .select('id, estado')
      .eq('user_id', user.id)
      .eq('asignatura', subject)
      .eq('resultado_json->>exam_id', examId)
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (sameExamToday) {
      return NextResponse.json({
        id: sameExamToday.id as string,
        alreadyCompleted: sameExamToday.estado === 'completado',
      })
    }
  }

  // Red de seguridad para cuando el missionId no coincide con nada (o no
  // llega ninguno): el calendario de Camino PAU puede regenerar y reemplazar
  // la fila de camino_calendar de una misión "Prep. parcial" todavía
  // pendiente (mismo contenido lógico, id nuevo), y algún enlace puede
  // llegar sin missionId. Sin esto, cada entrada con un identificador
  // distinto para la MISMA asignatura+bloque+origen creaba una sesión nueva
  // e independiente en vez de continuar la que ya está en curso — el
  // síntoma exacto reportado ("entra por un lado, es un ejercicio; entra
  // por otro, es otro"). Se reutiliza la más reciente en_progreso que
  // coincida en asignatura, bloque y origen (sunday_mock y camino_partial no
  // se mezclan entre sí), y se le actualiza mission_id al recibido para que
  // futuras reentradas por ese mismo id ya encuentren coincidencia directa.
  if (block) {
    const containsFilter: Record<string, unknown> = { __practice_session: true, block }
    if (source) containsFilter.source = source
    // sunday_mock reutiliza subject+block cada semana — sin esto, la sesión
    // abandonada de la semana pasada se reutilizaría en vez de crear la de
    // esta semana.
    if (weekStart) containsFilter.week_start = weekStart
    const { data: sameContentInProgress } = await db
      .from('historial_simulacros')
      .select('id, resultado_json')
      .eq('user_id', user.id)
      .eq('estado', 'en_progreso')
      .eq('asignatura', subject)
      .contains('resultado_json', containsFilter)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (sameContentInProgress) {
      if (missionId) {
        const currentResultado = (sameContentInProgress.resultado_json ?? {}) as Record<string, unknown>
        if (currentResultado.mission_id !== missionId) {
          await db
            .from('historial_simulacros')
            .update({ resultado_json: { ...currentResultado, mission_id: missionId } })
            .eq('id', sameContentInProgress.id as string)
            .eq('user_id', user.id)
        }
      }
      return NextResponse.json({ id: sameContentInProgress.id as string })
    }
  }

  if (!isInternalUser(user.email ?? '')) {
    const billing = await getUserBillingContext(user.id, user.created_at ?? new Date().toISOString(), user.email)

    if (!billing.hasActivePack && billing.daysSince >= 7) {
      return NextResponse.json(
        { error: 'free_plan_expired', message: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE },
        { status: 403 }
      )
    }

    const planLimits = await getEffectivePlanLimits(db, user.id, getCaminoPlanLimits(billing.planId))
    // Cuenta prácticas CREADAS este mes, no corregidas — contar
    // 'parcial_correction' aquí siempre daba 0 (esa acción solo se registra
    // al corregir en /api/simulacro, nunca al crear), así que este bloqueo
    // nunca se disparaba de verdad: un alumno free podía crear tantas
    // prácticas parciales como quisiera y solo se topaba con el límite al
    // intentar corregir la segunda.
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { count: monthlyParciales } = await db
      .from('historial_simulacros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth)
      .contains('resultado_json', { __practice_session: true })
    if ((monthlyParciales ?? 0) >= planLimits.partialsPerMonth) {
      return NextResponse.json(
        {
          error: 'parcial_limit_reached',
          message: `Has alcanzado el límite de ${planLimits.partialsPerMonth} práctica${planLimits.partialsPerMonth !== 1 ? 's' : ''} parcial${planLimits.partialsPerMonth !== 1 ? 'es' : ''} este mes. ${monthlyLimitResetNotice()}`,
          code: BILLING_BLOCK_CODE
        },
        { status: 429 }
      )
    }
  }

  const comunidad = String(body.comunidad ?? 'Madrid')
  const numQuestions = typeof body.numQuestions === 'number' ? body.numQuestions : 3

  if (!VALID_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
  }
  if (!block) {
    return NextResponse.json({ error: 'Bloque requerido' }, { status: 400 })
  }

  // Historia only, and only once this exam has real exam_topics rows (chip
  // selection, examScope='parcial') or completed camino_calendar topics
  // (examScope='global') — filters by those topics instead of the free-text
  // block match inside generatePracticeSession. Parciales without either
  // (created before exam_topics/examScope existed, or other subjects, which
  // don't have topicSlugs populated in their exercise data yet) fall
  // straight through unaffected.
  let historiaTopicSlugs: string[] | undefined
  if (subject === 'historia' && examId && examOwned) {
    historiaTopicSlugs = await resolveExamHistoriaTopics(db, user.id, examId, examScope)
  }

  // Only a Historia Parcial's own practice request (real, owned examId,
  // 'parcial' scope) should be blocked outright when there's nothing to
  // filter by — 'global' scope has no chip set to require, and non-exam
  // Historia practice (e.g. sunday_mock) never had topic filtering to begin
  // with, so neither should suddenly start failing here.
  const strictHistoriaMatch = subject === 'historia' && Boolean(examId && examOwned) && examScope !== 'global'
  const session = generatePracticeSession(subject as SimulacroSubject, block, comunidad, numQuestions, historiaTopicSlugs, strictHistoriaMatch)
  if (!session) {
    if (strictHistoriaMatch && !historiaTopicSlugs?.length) {
      return NextResponse.json({ error: 'needs_topics', message: 'Este examen necesita que elijas los temas.', examId }, { status: 422 })
    }
    return NextResponse.json({ error: 'No hay preguntas disponibles para este bloque' }, { status: 422 })
  }

  const avgYear = session.questions.reduce((sum, q) => sum + q.year, 0) / Math.max(1, session.questions.length)
  const dificultadReal = avgYear >= 2023 ? 'Difícil' : avgYear >= 2019 ? 'Media' : 'Fácil'

  const { data: inserted, error: insertError } = await db
    .from('historial_simulacros')
    .insert({
      id: session.id,
      user_id: user.id,
      asignatura: subject,
      opcion: 'A',
      dificultad: 'Media',
      dificultad_real: dificultadReal,
      bloques: session.questions,
      estado: 'en_progreso',
      // mission_id: enlaza esta sesión a la fila de camino_calendar que la
      // originó (si vino del calendario) — /api/simulacro lo lee al
      // completarla para marcar esa misión como hecha, y esta misma ruta lo
      // usa arriba para detectar reintentos de una misión ya completada.
      // exam_id: enlaza con el Parcial real (student_exams.id) — esta misma
      // ruta lo usa arriba para el reuso "misma práctica hoy para este
      // examen" sin depender de que el missionId coincida exacto.
      resultado_json: { __practice_session: true, block, subject, comunidad, ...(source ? { source } : {}), ...(weekStart ? { week_start: weekStart } : {}), ...(missionId ? { mission_id: missionId } : {}), ...(examId && examOwned ? { exam_id: examId } : {}) },
      created_at: session.created_at,
      updated_at: session.created_at,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: insertError?.message ?? 'Error al crear la sesión' }, { status: 500 })
  }

  return NextResponse.json({ id: inserted.id as string })
}
