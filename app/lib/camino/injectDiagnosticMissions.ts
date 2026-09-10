import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { getAvailabilityForDate } from '@/app/lib/calendar/availability'
import { normalizeSubjectSlug } from './caminoCurriculumPlan'
import {
  DIAGNOSTIC_QUESTION_COUNT,
  DIAGNOSTIC_SOURCE,
  MAX_DIAGNOSTIC_SKIPS,
  checkDiagnosticEligibility,
  diagnosticPacingFor,
  isDiagnosableMode,
  type BlockKnowledgeRow,
  type KnowledgeState,
} from './knowledgeState'
import { SIMULACRO_SUBJECT } from './partialExamSubjects'
import { createDayScheduler, estimatedMinutesForMissionType } from './scheduleTimeSlot'
import { normalizeStartMode, type StartMode } from './startingPoint'
import { getMadridToday } from './studyDays'
import { loadStudentPlanContext, planningDates, studyDaysRemaining } from './studentPlanContext'

// Microdiagnóstico: la segunda mitad de la confirmación del punto de partida.
//
// El onboarding pregunta por dónde va el alumno en cada asignatura y lo
// declarado entra como repaso express. Eso es una autoevaluación, y hasta
// ahora nadie la contrastaba: un alumno que creía tener Álgebra podía
// saltársela entera en repaso rápido y llegar a la PAU sin haberla trabajado.
//
// Esto NO es un examen inicial. Es un goteo:
//   · nada hasta que el alumno lleva ritmo (misiones completadas)
//   · como mucho un diagnóstico vivo a la vez, uno cada ~5 días
//   · dos ejercicios, no más
//   · saltable sin consecuencias, y tras 2 saltos ese bloque no se reofrece
//
// Reutiliza entero el flujo que ya existe para "ejercicios de bloque"
// (generateBlockPracticeMission.ts): una misión pau_practice enlazada a
// /simulacros/practica/nueva. Cero interfaz nueva.
//
// Lo que NUNCA hace: marcar temario como completado. Un diagnóstico solo
// mueve el punto de ENTRADA entre "repaso rápido" y "lección completa".

const DIAGNOSTIC_GENERATOR = 'diagnostic_v1'
const SCHEDULING_WINDOW_DAYS = 7

type QueueBlockRow = {
  subject: string
  block_slug: string | null
  block_key: string | null
  metadata: Record<string, unknown> | null
  subject_position: number | null
}

function metadataObject(value: Record<string, unknown> | null | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function startOfMonthISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

/**
 * Bloques que el alumno DECLARÓ haber dado, leídos de la propia cola: las
 * filas que generateCaminoPlan marcó como repaso express llevan
 * `declared_start_mode` en metadata. Es la huella de la declaración, y evita
 * tener que duplicarla en otro sitio.
 *
 * Se devuelve el bloque declarado más CERCANO a entrar en el plan primero
 * (menor subject_position): es donde equivocarse cuesta más caro, porque es
 * lo que el alumno está a punto de saltarse.
 */
async function declaredBlocks(
  db: SupabaseClient,
  userId: string,
): Promise<Array<{ subject: string; blockSlug: string; blockKey: string | null; mode: StartMode; position: number }>> {
  const { data, error } = await db
    .from('user_learning_queue')
    .select('subject, block_slug, block_key, metadata, subject_position')
    .eq('user_id', userId)
    .in('queue_status', ['pending', 'scheduled'])
    .order('subject_position', { ascending: true })
    .limit(2000)

  if (error) throw new Error(`Diagnostic queue read: ${error.message}`)
  const byBlock = new Map<string, { subject: string; blockSlug: string; blockKey: string | null; mode: StartMode; position: number }>()
  for (const row of (data ?? []) as QueueBlockRow[]) {
    const meta = metadataObject(row.metadata)
    const declared = meta.declared_start_mode
    if (typeof declared !== 'string') continue
    const mode = normalizeStartMode(declared)
    if (!isDiagnosableMode(mode)) continue
    // Solo interesa lo que entró como repaso por la declaración; un
    // 'concept' con declared_start_mode es temario que el alumno dijo NO
    // haber dado todavía, y ahí no hay nada que confirmar.
    if (meta.mission_type !== 'review') continue

    const subject = normalizeSubjectSlug(row.subject)
    const blockSlug = row.block_slug
    if (!blockSlug) continue
    const key = `${subject}:${blockSlug}`
    const position = row.subject_position ?? Number.MAX_SAFE_INTEGER
    const existing = byBlock.get(key)
    if (!existing || position < existing.position) {
      byBlock.set(key, { subject, blockSlug, blockKey: row.block_key, mode, position })
    }
  }

  return [...byBlock.values()].sort((a, b) => a.position - b.position)
}

async function loadKnowledgeRows(db: SupabaseClient, userId: string) {
  const { data, error } = await db
    .from('student_block_knowledge')
    .select('subject, block_slug, state, declared_start_mode, diagnostic_mission_id, diagnostic_offered_at, diagnostic_completed_at, diagnostic_skipped_count')
    .eq('user_id', userId)
  if (error) throw new Error(`Knowledge read: ${error.message}`)
  return (data ?? []) as Array<{
    subject: string
    block_slug: string
    state: KnowledgeState
    declared_start_mode: string | null
    diagnostic_mission_id: string | null
    diagnostic_offered_at: string | null
    diagnostic_completed_at: string | null
    diagnostic_skipped_count: number
  }>
}

/**
 * Ofrece como mucho UN microdiagnóstico. Best-effort: cualquier fallo deja el
 * Camino exactamente como estaba, nunca lo bloquea.
 */
export async function injectDiagnosticMissions(
  userId: string,
  db: SupabaseClient,
): Promise<{ offered: number; reason?: string }> {
  try {
    const today = getMadridToday()

    const declared = await declaredBlocks(db, userId)
    if (declared.length === 0) return { offered: 0, reason: 'no_declared_blocks' }

    // Antes de ofrecer nada: cerrar los diagnósticos que el alumno dejó
    // pasar. Libera el hueco de "uno vivo a la vez" y cuenta el salto.
    await reconcileSkippedDiagnostics(db, userId)

    // ── Señales de goteo ──
    const { count: completedMissions } = await db
      .from('camino_calendar')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    const knowledgeRows = await loadKnowledgeRows(db, userId)
    const byKey = new Map(knowledgeRows.map(r => [`${r.subject}:${r.block_slug}`, r]))

    // Un diagnóstico "vivo" es uno ofrecido y todavía sin resolver.
    const liveDiagnostics = knowledgeRows.filter(r => r.diagnostic_offered_at && !r.diagnostic_completed_at && r.state === 'declarado').length

    const monthStart = startOfMonthISO()
    const diagnosticsThisMonth = knowledgeRows.filter(r => r.diagnostic_offered_at && r.diagnostic_offered_at >= monthStart).length

    // Ritmo según el tiempo REAL que le queda: el goteo de septiembre (tres
    // misiones de espera, cinco días entre diagnósticos, tres al mes) deja a
    // un alumno que entra en mayo planificando sobre declaraciones que nunca
    // llegan a contrastarse.
    const pacing = diagnosticPacingFor(studyDaysRemaining(await loadStudentPlanContext(userId, db, today)))

    const lastOfferedAt = knowledgeRows
      .map(r => r.diagnostic_offered_at)
      .filter((v): v is string => typeof v === 'string')
      .sort()
      .pop() ?? null

    let lastReason: string | undefined
    for (const candidate of declared) {
      const key = `${candidate.subject}:${candidate.blockSlug}`
      const existing = byKey.get(key)
      const row: BlockKnowledgeRow = {
        subject: candidate.subject,
        blockSlug: candidate.blockSlug,
        state: existing?.state ?? 'declarado',
        declaredStartMode: existing?.declared_start_mode
          ? normalizeStartMode(existing.declared_start_mode)
          : candidate.mode,
        diagnosticMissionId: existing?.diagnostic_mission_id ?? null,
        diagnosticOfferedAt: existing?.diagnostic_offered_at ?? null,
        diagnosticSkippedCount: existing?.diagnostic_skipped_count ?? 0,
      }

      const eligibility = checkDiagnosticEligibility({
        row,
        completedMissions: completedMissions ?? 0,
        liveDiagnostics,
        diagnosticsThisMonth,
        lastOfferedAt,
        today,
        pacing,
      })
      if (!eligibility.eligible) {
        lastReason = eligibility.reason
        // Los motivos globales (no dependen del bloque) cortan el bucle: no
        // tiene sentido seguir probando bloques si el tope es del alumno.
        if (['already_live', 'too_few_missions', 'monthly_cap', 'cooldown'].includes(eligibility.reason)) break
        continue
      }

      const missionId = await scheduleDiagnosticMission(db, userId, candidate)
      if (!missionId) { lastReason = 'no_free_slot'; continue }

      await db.from('student_block_knowledge').upsert({
        user_id: userId,
        subject: candidate.subject,
        block_slug: candidate.blockSlug,
        state: 'declarado',
        declared_start_mode: candidate.mode,
        diagnostic_mission_id: missionId,
        diagnostic_offered_at: new Date().toISOString(),
        diagnostic_completed_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,subject,block_slug' })

      await recordBetaMetric(db, userId, 'diagnostic_offered', {
        subject: candidate.subject,
        block_slug: candidate.blockSlug,
        declared_start_mode: candidate.mode,
        queue_position: candidate.position,
        completed_missions: completedMissions ?? 0,
        diagnostics_this_month: diagnosticsThisMonth + 1,
      })

      return { offered: 1 }
    }

    return { offered: 0, reason: lastReason ?? 'no_candidate' }
  } catch (error) {
    console.warn('[camino/diagnostic] inject skipped:', (error as Error)?.message?.slice(0, 200))
    return { offered: 0, reason: 'error' }
  }
}

async function scheduleDiagnosticMission(
  db: SupabaseClient,
  userId: string,
  candidate: { subject: string; blockSlug: string; blockKey: string | null },
): Promise<string | null> {
  const today = getMadridToday()
  // Mismo criterio que el resto del plan: días que el alumno estudia de
  // verdad y nunca después de su fecha objetivo. Un diagnóstico sí puede caer
  // en la ventana de repaso final — comprobar el punto de partida es
  // exactamente lo que hay que hacer si queda poco.
  const planContext = await loadStudentPlanContext(userId, db, today)
  const candidateDates = planningDates(planContext, {
    limit: SCHEDULING_WINDOW_DAYS,
    includeFinalReviewWindow: true,
  })
  for (const dateStr of candidateDates) {
    const scheduler = await createDayScheduler(userId, db, dateStr, {
      externalBusy: await getAvailabilityForDate(userId, dateStr),
    })
    const timeSlot = scheduler.placeBest(estimatedMinutesForMissionType('pau_practice'), {
      date: dateStr,
      subject: candidate.subject,
      missionType: 'pau_practice',
    })
    if (!timeSlot) continue

    const { data, error } = await db.from('camino_calendar').insert({
      user_id: userId,
      scheduled_date: dateStr,
      subject: candidate.subject,
      v2_sort_order: null,
      title: `Comprobación rápida: ${candidate.blockKey ?? candidate.blockSlug}`,
      block_key: candidate.blockKey,
      block_slug: candidate.blockSlug,
      mission_type: 'pau_practice',
      is_main: true,
      is_bonus: false,
      status: 'pending',
      source: 'algorithm',
      generated_by: DIAGNOSTIC_GENERATOR,
      start_time: timeSlot.start,
      end_time: timeSlot.end,
      metadata: {
        // Marca de diagnóstico: la leen /api/practica-parcial (para el tope
        // propio y la exclusión del límite del plan) y applyDiagnosticOutcome.
        diagnostic_for: candidate.blockSlug,
        diagnostic_source: DIAGNOSTIC_SOURCE,
        diagnostic_question_count: DIAGNOSTIC_QUESTION_COUNT,
        simulacro_subject: SIMULACRO_SUBJECT[candidate.subject] ?? candidate.subject,
        skippable: true,
        reason: 'Dijiste que ya habías dado este bloque. Dos ejercicios para confirmarlo — si va bien, seguimos en repaso rápido.',
      },
    }).select('id').single()

    if (error) throw new Error(`Diagnostic insert: ${error.message}`)
    if (!data?.id) throw new Error('Diagnostic insert returned no mission')
    return data.id as string
  }
  return null
}

/**
 * Cierra los diagnósticos vivos cuya misión ya no está pendiente ni hecha:
 * el alumno la dejó pasar (quedó 'missed') o la borró del calendario.
 *
 * Dejarlo pasar no penaliza nada y no altera el plan — el bloque se queda en
 * 'declarado', exactamente como estaba. Solo se cuenta el salto para no
 * insistir eternamente.
 */
async function reconcileSkippedDiagnostics(db: SupabaseClient, userId: string): Promise<void> {
  const rows = await loadKnowledgeRows(db, userId)
  const live = rows.filter(r => r.diagnostic_mission_id && r.diagnostic_offered_at && !r.diagnostic_completed_at)
  if (live.length === 0) return

  const { data: missions } = await db
    .from('camino_calendar')
    .select('id, status')
    .eq('user_id', userId)
    .in('id', live.map(r => r.diagnostic_mission_id as string))

  const statusById = new Map((missions ?? []).map(m => [m.id as string, m.status as string]))

  for (const row of live) {
    const status = statusById.get(row.diagnostic_mission_id as string)
    // 'pending' sigue viva; 'completed' la resuelve applyDiagnosticOutcome.
    // Cualquier otra cosa (missed, o la fila ya no existe) es un salto.
    if (status === 'pending' || status === 'postponed' || status === 'unscheduled' || status === 'completed') continue
    await recordDiagnosticSkip(db, userId, row.subject, row.block_slug, row.diagnostic_skipped_count ?? 0)
  }
}

/**
 * Cuenta un salto: el alumno dejó pasar el diagnóstico (misión perdida o
 * borrada). No penaliza nada — solo evita insistir eternamente.
 */
export async function recordDiagnosticSkip(
  db: SupabaseClient,
  userId: string,
  subject: string,
  blockSlug: string,
  currentSkips: number,
): Promise<void> {
  const nextSkips = currentSkips + 1
  await db.from('student_block_knowledge').update({
    diagnostic_mission_id: null,
    diagnostic_offered_at: null,
    diagnostic_skipped_count: nextSkips,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId).eq('subject', subject).eq('block_slug', blockSlug)

  await recordBetaMetric(db, userId, 'diagnostic_skipped', {
    subject,
    block_slug: blockSlug,
    skip_count: nextSkips,
    will_reoffer: nextSkips < MAX_DIAGNOSTIC_SKIPS,
  })
}
