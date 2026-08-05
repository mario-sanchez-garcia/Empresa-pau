import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { generatePracticeSession } from '@/components/simulacros/data'
import type { SimulacroSubject } from '@/components/simulacros/types'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { isInternalUser } from '@/app/lib/internalUsers'

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
    const { data: existing } = await db
      .from('historial_simulacros')
      .select('id')
      .eq('user_id', user.id)
      .eq('estado', 'completado')
      .eq('resultado_json->>mission_id', missionId)
      .limit(1)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ id: existing.id as string, alreadyCompleted: true })
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

    const planLimits = getCaminoPlanLimits(billing.planId)
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
          message: `Has alcanzado el límite de ${planLimits.partialsPerMonth} práctica${planLimits.partialsPerMonth !== 1 ? 's' : ''} parcial${planLimits.partialsPerMonth !== 1 ? 'es' : ''} este mes.`,
          code: BILLING_BLOCK_CODE
        },
        { status: 429 }
      )
    }
  }

  const subject = String(body.subject ?? 'mates')
  const block = String(body.block ?? '')
  const comunidad = String(body.comunidad ?? 'Madrid')
  const numQuestions = typeof body.numQuestions === 'number' ? body.numQuestions : 3
  const source = typeof body.source === 'string' ? body.source.slice(0, 64) : null
  const weekStart = typeof body.weekStart === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.weekStart) ? body.weekStart : null

  if (!VALID_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
  }
  if (!block) {
    return NextResponse.json({ error: 'Bloque requerido' }, { status: 400 })
  }

  const session = generatePracticeSession(subject as SimulacroSubject, block, comunidad, numQuestions)
  if (!session) {
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
      resultado_json: { __practice_session: true, block, subject, comunidad, ...(source ? { source } : {}), ...(weekStart ? { week_start: weekStart } : {}), ...(missionId ? { mission_id: missionId } : {}) },
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
