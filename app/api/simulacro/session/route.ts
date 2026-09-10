import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { validateCorrectionImagePayload } from '@/app/lib/imagePayloadLimits'
import { canonicalizeOfficialSimulacroBlock } from '@/components/simulacros/data'
import type { SimulacroAnswer, SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroSubject } from '@/components/simulacros/types'
import type { User } from '@supabase/supabase-js'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { getEffectivePlanLimits } from '@/app/lib/billing/limitOverrides'
import { BILLING_BLOCK_CODE, monthlyLimitResetNotice } from '@/app/lib/rateLimitMessages'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createHash } from 'node:crypto'
import { caminoSubjectFromSimulacro } from '@/app/lib/camino/partialExamSubjects'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SUBJECTS = new Set<SimulacroSubject>(['mates', 'matematicas_ccss', 'fisica', 'quimica', 'biologia', 'ingles', 'lengua', 'historia'])
const DIFFICULTIES = new Set<SimulacroDifficulty>(['Fácil', 'Media', 'Difícil'])

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 })
  }

  try {
    if (body.action === 'start') return startAttempt(body, auth.user)
    if (body.action === 'repeat') return repeatAttempt(body, auth.user.id)
    if (body.action === 'save') return saveAnswers(body, auth.user.id)
    if (body.action === 'delete') return deleteAttempt(body, auth.user.id)
    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
  } catch (error) {
    console.error('[simulacro/session] failed', { action: body.action, message: (error as Error)?.message?.slice(0, 160) })
    return NextResponse.json({ error: 'No hemos podido guardar la sesión ahora mismo.' }, { status: 500 })
  }
}

async function startAttempt(body: Record<string, unknown>, user: User) {
  const userId = user.id
  const requestedAttemptId = validUuid(body.attemptId)
  const subject = SUBJECTS.has(body.subject as SimulacroSubject) ? body.subject as SimulacroSubject : null
  const option = body.option === 'A' || body.option === 'B' ? body.option as SimulacroOption : null
  const difficulty = DIFFICULTIES.has(body.difficulty as SimulacroDifficulty) ? body.difficulty as SimulacroDifficulty : null
  const community = body.community === 'Cataluña' ? 'Cataluña' : body.community === 'Madrid' ? 'Madrid' : null
  const suppliedBlocks = Array.isArray(body.blocks) ? body.blocks as SimulacroBlock[] : []
  if (!requestedAttemptId || !subject || !option || !difficulty || !community || suppliedBlocks.length < 1 || suppliedBlocks.length > 10) {
    return NextResponse.json({ error: 'Configuración de simulacro no válida.' }, { status: 400 })
  }

  const db = createServiceClient()
  const missionId = validUuid(body.missionId)
  const examId = typeof body.examId === 'string' && body.examId.trim().length <= 160 ? body.examId.trim() : null
  const sessionMetadata: Record<string, unknown> = {}

  if (missionId) {
    const { data: mission } = await db
      .from('camino_calendar')
      .select('id,mission_type,subject,status,metadata')
      .eq('id', missionId)
      .eq('user_id', userId)
      .maybeSingle()
    const metadata = asRecord(mission?.metadata) ?? {}
    if (!mission
      || mission.mission_type !== 'pau_practice'
      || mission.subject !== caminoSubjectFromSimulacro(subject)
      || metadata.partial_mission_type !== 'final_mini_mock'
      || metadata.simulacro_subject !== subject
      || (examId && metadata.links_to_simulacro_exam_id !== examId)) {
      return NextResponse.json({ error: 'La misión no corresponde a este simulacro.' }, { status: 403 })
    }
    sessionMetadata.mission_id = missionId
  }

  if (examId) {
    const { data: profile } = await db.from('perfiles').select('student_exams').eq('id', userId).maybeSingle()
    const exams = Array.isArray(profile?.student_exams) ? profile.student_exams as Array<{ id?: unknown }> : []
    if (!exams.some(exam => exam?.id === examId)) {
      return NextResponse.json({ error: 'Ese examen no existe o no es tuyo.' }, { status: 403 })
    }
    sessionMetadata.exam_id = examId
  }

  const idempotencySeed = missionId
    ? `full-mission:${userId}:${missionId}`
    : examId
      ? `full-exam:${userId}:${examId}`
      : null
  const attemptId = idempotencySeed ? deterministicUuid(idempotencySeed) : requestedAttemptId

  // Reuse legacy attempts that predate deterministic IDs as well. This check
  // also means reopening a Camino/exam entry continues its exact attempt.
  if (missionId || examId) {
    let linked = db.from('historial_simulacros').select('id').eq('user_id', userId).eq('asignatura', subject)
    linked = missionId ? linked.eq('resultado_json->>mission_id', missionId) : linked.eq('resultado_json->>exam_id', examId!)
    const { data: previous } = await linked.order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (previous) return NextResponse.json({ id: previous.id, reused: true })
  }

  const { data: existing } = await db.from('historial_simulacros').select('id,user_id').eq('id', attemptId).maybeSingle()
  if (existing) {
    return existing.user_id === userId
      ? NextResponse.json({ id: attemptId, reused: true })
      : NextResponse.json({ error: 'Identificador de intento no disponible.' }, { status: 409 })
  }

  if (!isInternalUser(user.email ?? '')) {
    const billing = await getUserBillingContext(userId, user.created_at, user.email)
    if (!billing.hasActivePack && billing.daysSince >= 7) {
      return NextResponse.json({ error: 'Tu prueba gratuita ha terminado.', code: BILLING_BLOCK_CODE }, { status: 403 })
    }
    const limits = await getEffectivePlanLimits(db, userId, getCaminoPlanLimits(billing.planId))
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const [{ count: total }, { count: partials }] = await Promise.all([
      db.from('historial_simulacros').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', monthStart),
      db.from('historial_simulacros').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', monthStart).contains('resultado_json', { __practice_session: true }),
    ])
    const fullMocks = Math.max(0, (total ?? 0) - (partials ?? 0))
    if (fullMocks >= limits.fullMocksPerMonth) {
      const message = limits.fullMocksPerMonth === 0
        ? 'Los simulacros completos no están disponibles en tu plan actual.'
        : `Has alcanzado el límite de ${limits.fullMocksPerMonth} simulacro${limits.fullMocksPerMonth === 1 ? '' : 's'} este mes. ${monthlyLimitResetNotice()}`
      return NextResponse.json({ error: message, code: BILLING_BLOCK_CODE }, { status: 429 })
    }
  }

  const canonicalBlocks: SimulacroBlock[] = []
  for (let index = 0; index < suppliedBlocks.length; index += 1) {
    const canonical = await canonicalizeBlock(db, userId, subject, community, suppliedBlocks[index], index + 1)
    if (!canonical) {
      return NextResponse.json({ error: `El bloque ${index + 1} no coincide con una fuente autorizada.` }, { status: 400 })
    }
    canonicalBlocks.push(canonical)
  }
  if (new Set(canonicalBlocks.map(blockIdentity)).size !== canonicalBlocks.length) {
    return NextResponse.json({ error: 'El simulacro contiene ejercicios duplicados.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await db.from('historial_simulacros').insert({
    id: attemptId,
    user_id: userId,
    asignatura: subject,
    opcion: option,
    dificultad: difficulty,
    dificultad_real: typeof body.difficultyLabel === 'string' ? body.difficultyLabel.slice(0, 120) : difficulty,
    bloques: canonicalBlocks,
    respuestas_parciales: {},
    resultado_json: Object.keys(sessionMetadata).length ? sessionMetadata : null,
    estado: 'en_progreso',
    correction_status: 'idle',
    created_at: now,
    updated_at: now,
  })
  if (error) {
    if (error.code === '23505') {
      const { data: raced } = await db.from('historial_simulacros').select('id').eq('id', attemptId).eq('user_id', userId).maybeSingle()
      if (raced) return NextResponse.json({ id: attemptId, reused: true })
    }
    throw error
  }
  return NextResponse.json({ id: attemptId })
}

async function repeatAttempt(body: Record<string, unknown>, userId: string) {
  const attemptId = validUuid(body.attemptId)
  const sourceId = validUuid(body.sourceId)
  if (!attemptId || !sourceId) return NextResponse.json({ error: 'Repetición no válida.' }, { status: 400 })
  const db = createServiceClient()
  const { data: existing } = await db.from('historial_simulacros').select('id,user_id').eq('id', attemptId).maybeSingle()
  if (existing) {
    return existing.user_id === userId
      ? NextResponse.json({ id: attemptId, reused: true })
      : NextResponse.json({ error: 'Identificador de intento no disponible.' }, { status: 409 })
  }
  const { data: source, error: sourceError } = await db
    .from('historial_simulacros')
    .select('id,asignatura,opcion,dificultad,dificultad_real,bloques,resultado_json,estado,correction_status')
    .eq('id', sourceId)
    .eq('user_id', userId)
    .maybeSingle()
  if (sourceError) throw sourceError
  if (!source || source.estado !== 'completado' || (source.correction_status && source.correction_status !== 'completed')) {
    return NextResponse.json({ error: 'Solo puedes repetir un simulacro corregido de tu historial.' }, { status: 409 })
  }
  const previousMetadata = asRecord(source.resultado_json) ?? {}
  const isPractice = previousMetadata.__practice_session === true
  const nextMetadata = isPractice ? {
    __practice_session: true,
    block: previousMetadata.block,
    subject: previousMetadata.subject,
    comunidad: previousMetadata.comunidad,
  } : null
  const now = new Date().toISOString()
  const { error } = await db.from('historial_simulacros').insert({
    id: attemptId,
    user_id: userId,
    asignatura: source.asignatura,
    opcion: source.opcion,
    dificultad: source.dificultad,
    dificultad_real: source.dificultad_real,
    bloques: source.bloques,
    respuestas_parciales: {},
    resultado_json: nextMetadata,
    estado: 'en_progreso',
    correction_status: 'idle',
    repeated_from_id: sourceId,
    created_at: now,
    updated_at: now,
  })
  if (error) throw error
  return NextResponse.json({ id: attemptId, practice: isPractice })
}

async function saveAnswers(body: Record<string, unknown>, userId: string) {
  const attemptId = validUuid(body.attemptId)
  const expectedRevision = Number(body.expectedRevision)
  const answers = asRecord(body.answers)
  if (!attemptId || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || !answers) {
    return NextResponse.json({ error: 'Guardado no válido.' }, { status: 400 })
  }
  const db = createServiceClient()
  const { data: record, error: readError } = await db
    .from('historial_simulacros')
    .select('id,bloques,estado,correction_status,answers_revision')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .maybeSingle()
  if (readError) throw readError
  if (!record) return NextResponse.json({ error: 'No hemos encontrado este intento para tu cuenta.' }, { status: 404 })
  if (record.estado !== 'en_progreso' || record.correction_status === 'processing') {
    return NextResponse.json({ error: 'Este intento ya no admite cambios.' }, { status: 409 })
  }

  const blockIds = new Set((Array.isArray(record.bloques) ? record.bloques : []).map((block: { id?: unknown }) => String(block.id ?? '')))
  const validation = validateAnswers(answers, blockIds)
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 413 })

  const nextRevision = expectedRevision + 1
  const { data: updated, error: updateError } = await db
    .from('historial_simulacros')
    .update({ respuestas_parciales: answers, answers_revision: nextRevision, updated_at: new Date().toISOString() })
    .eq('id', attemptId)
    .eq('user_id', userId)
    .eq('estado', 'en_progreso')
    .eq('answers_revision', expectedRevision)
    .select('answers_revision')
    .maybeSingle()
  if (updateError) throw updateError
  if (!updated) {
    const { data: latest } = await db.from('historial_simulacros').select('answers_revision').eq('id', attemptId).eq('user_id', userId).maybeSingle()
    return NextResponse.json({ error: 'Este intento cambió en otra pestaña. Recarga antes de seguir para no perder respuestas.', conflict: true, revision: latest?.answers_revision ?? null }, { status: 409 })
  }
  return NextResponse.json({ saved: true, revision: updated.answers_revision })
}

async function deleteAttempt(body: Record<string, unknown>, userId: string) {
  const attemptId = validUuid(body.attemptId)
  if (!attemptId) return NextResponse.json({ error: 'Intento no válido.' }, { status: 400 })
  const db = createServiceClient()
  const { data, error } = await db
    .from('historial_simulacros')
    .delete()
    .eq('id', attemptId)
    .eq('user_id', userId)
    .eq('estado', 'en_progreso')
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) return NextResponse.json({ error: 'No hemos encontrado un intento sin terminar para borrar.' }, { status: 404 })
  return NextResponse.json({ deleted: true })
}

async function canonicalizeBlock(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
  subject: SimulacroSubject,
  community: string,
  supplied: SimulacroBlock,
  numero: number,
) {
  if (!supplied || typeof supplied !== 'object') return null
  if (typeof supplied.id === 'string' && supplied.id.startsWith('historial-')) {
    const historyId = validUuid(supplied.id.slice('historial-'.length))
    if (!historyId) return null
    const { data: row } = await db
      .from('historial_examenes')
      .select('*')
      .eq('id', historyId)
      .eq('user_id', userId)
      .maybeSingle()
    if (!row || !historySubjectMatches(row.asignatura, subject)) return null
    const max = Number(row.nota_maxima ?? 2.5)
    const canonical: SimulacroBlock = {
      id: `historial-${row.id}`,
      numero,
      tema: row.bloque || row.tipo || subject,
      year: Number(row.año ?? new Date().getFullYear()),
      convocatoria: row.tipo || 'Corrección previa',
      option: row.opcion === 'B' ? 'B' : 'A',
      puntuacion: Number.isFinite(max) && max > 0 ? max : 2.5,
      enunciado: row.enunciado || 'Ejercicio recuperado de tu historial de correcciones.',
      comunidad: community,
    }
    return sameAcademicBlock(canonical, supplied) ? canonical : null
  }
  const canonical = canonicalizeOfficialSimulacroBlock(subject, community, supplied)
  return canonical ? { ...canonical, numero } : null
}

function validateAnswers(answers: Record<string, unknown>, blockIds: Set<string>): { ok: true } | { ok: false; error: string } {
  if (Object.keys(answers).some(key => !blockIds.has(key))) return { ok: false, error: 'Una respuesta no pertenece a este intento.' }
  const allImages: Array<{ data: string; mediaType?: string }> = []
  for (const value of Object.values(answers)) {
    const answer = asRecord(value) as SimulacroAnswer | null
    if (!answer || typeof answer.text !== 'string' || answer.text.length > 60_000) return { ok: false, error: 'Una respuesta no tiene un formato válido.' }
    if (typeof answer.image === 'string' && answer.image) allImages.push({ data: answer.image, mediaType: answer.imageType ?? undefined })
    if (Array.isArray(answer.images)) allImages.push(...answer.images)
  }
  const images = validateCorrectionImagePayload(allImages, { maxImages: Math.min(30, Math.max(5, blockIds.size * 5)) })
  return images.valid ? { ok: true } : { ok: false, error: images.error }
}

function sameAcademicBlock(a: SimulacroBlock, b: SimulacroBlock) {
  return a.id === b.id && Number(a.year) === Number(b.year) && a.convocatoria === b.convocatoria
    && a.option === b.option && Number(a.puntuacion) === Number(b.puntuacion) && a.enunciado === b.enunciado
}

function blockIdentity(block: SimulacroBlock) {
  return `${block.id}:${block.year}:${block.convocatoria}:${block.option}`
}

function historySubjectMatches(value: unknown, subject: SimulacroSubject) {
  const normalized = String(value ?? '').toLowerCase()
  return subject === 'mates' ? ['mates', 'matematicas', 'matemáticas'].includes(normalized) : normalized === subject
}

function validUuid(value: unknown) {
  return typeof value === 'string' && UUID.test(value) ? value : null
}

function deterministicUuid(seed: string) {
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 32).split('')
  hex[12] = '4'
  hex[16] = ['8', '9', 'a', 'b'][Number.parseInt(hex[16], 16) % 4]
  const value = hex.join('')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}
