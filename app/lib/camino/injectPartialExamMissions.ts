import { type SupabaseClient } from '@supabase/supabase-js'

import { getCaminoPlanLimits } from './caminoPlanLimits'
import { computeExamCoverage, type ExamCoverage } from './examCoverage'
import { EXAM_SUBJECT_SLUG, SIMULACRO_SUBJECT } from './partialExamSubjects'
import { createDayScheduler, estimatedMinutesForMissionType } from './scheduleTimeSlot'
import { SIMULACRO_MINUTES } from './xpMap'
import type { ExamConfidence, ExamPriority, ExamScope, StudentExam } from './cleanStudentExams'

// Antes había 4 sub-tipos (conceptual_review/evau_practice/block_mock/
// final_mini_mock) — se fusionan los 3 de práctica en uno solo
// ('exercise_practice', misma sesión de 45 min de siempre) porque las 4 se
// generaban sin comprobar el Curso, rompiendo el orden Curso→Ejercicios→
// Simulacro. Ahora solo quedan 2, y AMBAS pasan por computeExamCoverage.
type PartialMissionType = 'exercise_practice' | 'final_mini_mock'
type MissionFate = 'generate' | 'delay' | 'cancelled' | 'monthly_limit'

const BLOCK_DISPLAY: Record<string, string> = {
  Algebra: 'Álgebra',
  Analisis: 'Análisis',
  Geometria: 'Geometría',
  Probabilidad: 'Probabilidad',
}

// Umbral de cobertura de Curso para generar el Simulacro (ver
// decideMissionFate) — mismo número usado para elegir EN QUÉ día de los
// últimos FINAL_MOCK_WINDOW_DAYS colocarlo (más abajo).
const MIN_COVERAGE_PCT_FOR_SIMULACRO = 80
// final_mini_mock nunca se coloca a más de esto de días hábiles del examen
// (nunca el día del examen en sí — weekdaysBefore ya lo excluye) —
// exercise_practice no tiene esta restricción, puede usar cualquier día
// libre del resto de la ventana de ≤10 días.
const FINAL_MOCK_WINDOW_DAYS = 3

export type PartialExamInput = {
  id: string
  subject: string
  date: string
  block: string
  topic?: string
  priority?: ExamPriority
  confidence?: ExamConfidence
  content?: string
  /** Ya no se consume — la secuencia se redujo a 2 misiones fijas (exercise_practice + final_mini_mock, ver missionSequence), así que ya no hay un "número de sesiones" que ajustar. Se mantiene en el tipo solo para no romper CaminoCalendarClient.tsx/examTimeNeed.ts ("Recalcular mi Camino"), que lo siguen enviando. */
  sessionOverride?: number
  /** How many of this exam's sessions may land on the same day (>1 = stacking, used when sessionOverride needs more depth than one slot/day gives — see examTimeNeed.ts). Defaults to 1. */
  maxSessionsPerDay?: number
  /** Free-text custom instructions from the student, passed through to mission metadata. */
  customInstructions?: string
  /** 'parcial' (default) or 'global' — needed so the final_mini_mock mission's Simulacro link carries the same examScope PartialExamBanner already sends. */
  examScope?: ExamScope
}

export function madridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function isWeekday(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow !== 0 && dow !== 6
}

export function weekdaysBefore(examDate: string, fromDate: string): string[] {
  const days: string[] = []
  let cur = fromDate
  while (cur < examDate) {
    if (isWeekday(cur)) days.push(cur)
    cur = shiftDate(cur, 1)
  }
  return days
}

// Distributes `count` sessions over `availableSlotsAscending` (chronological
// dates), packing sessions onto the days closest to the exam first — up to
// `maxPerDay` each — before spilling onto earlier days. This means a tight
// timeline concentrates the extra depth where it matters (right before the
// exam) instead of spreading thin across every day. When count exceeds
// availableSlotsAscending.length * maxPerDay, the earliest (lowest-priority,
// per missionSequence's ordering) sessions are the ones left unassigned
// (null) — mirrors the previous slice(-usableCount) behaviour for the
// maxPerDay=1 case exactly, so normal (non-recalculated) exams are
// unaffected.
function assignDatesForCount(count: number, availableSlotsAscending: string[], maxPerDay: number): (string | null)[] {
  const result: (string | null)[] = new Array(Math.max(0, count)).fill(null)
  const n = availableSlotsAscending.length
  if (count <= 0 || n === 0) return result
  const load = new Array(n).fill(0)
  let dayIdx = n - 1
  for (let i = count - 1; i >= 0; i--) {
    while (dayIdx >= 0 && load[dayIdx] >= maxPerDay) dayIdx--
    if (dayIdx < 0) break
    result[i] = availableSlotsAscending[dayIdx]
    load[dayIdx]++
  }
  return result
}

// Siempre las mismas 2 (una práctica de ejercicios + el Simulacro) cuando
// hay al menos 1 día hábil disponible — ya no escala con prioridad/
// confianza/días restantes como antes (eso decidía CUÁNTAS prácticas de 45
// min había, ahora solo hay una). assignDatesForCount ya se encarga de
// dejar caer la primera (exercise_practice) si el hueco es tan justo que
// solo cabe una, quedándose con la más cercana al examen (final_mini_mock).
function missionSequence(daysAvailable: number): PartialMissionType[] {
  if (daysAvailable <= 0) return []
  return ['exercise_practice', 'final_mini_mock']
}

// exercise_practice usa mission_type: 'partial_practice' al insertarse más
// abajo, así que abre el flujo de 45 min de /simulacros/practica/[id]
// (PARCIAL_MINUTES) — nunca dice "simulacro" en el título para no repetir la
// confusión que esto tuvo antes (el alumno leía "Simulacro" esperando 90 min
// y el cronómetro le daba 45). final_mini_mock es la excepción a propósito:
// desde que enlaza al Simulacro real de 90 min (mission_type: 'pau_practice',
// ver el bucle de inserción más abajo), su título SÍ debe decir "Simulacro".
function missionTitle(type: PartialMissionType, blockDisplay: string, topic?: string): string {
  const ctx = topic ? `${blockDisplay} — ${topic}` : blockDisplay
  switch (type) {
    case 'exercise_practice': return `Práctica de ejercicios: ${ctx}`
    case 'final_mini_mock':   return `Simulacro completo antes del examen: ${ctx}`
  }
}

// Límite mensual real de Simulacros completos (final_mini_mock) según el
// plan del alumno (+ ajuste puntual por alumno si lo hay) — mismas tablas
// que app/lib/billing/serverUsage.ts / limitOverrides.ts usan, pero
// consultadas aquí directo (sin pasar por esos módulos, que tienen efectos
// secundarios — cortesía de acceso — y una guarda 'server-only' que no hace
// falta arrastrar a un módulo de programación que también se usa desde
// scripts de verificación).
async function resolveFullMocksLimit(supabase: SupabaseClient, userId: string): Promise<number> {
  const now = new Date().toISOString()
  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)
    .maybeSingle()
  const baseLimit = getCaminoPlanLimits(entitlement?.plan_id as string | null | undefined).fullMocksPerMonth
  const { data: override } = await supabase
    .from('user_limit_overrides')
    .select('extra_mocks_per_month')
    .eq('user_id', userId)
    .maybeSingle()
  return baseLimit + ((override?.extra_mocks_per_month as number | null) ?? 0)
}

// Cuenta por CREACIÓN (created_at), no por fecha programada — mismo criterio
// que ya usa /api/practica-parcial para su propio tope mensual. Solo cuenta
// Simulacros de examen reales (mission_type='pau_practice' Y
// links_to_simulacro_exam_id) — nunca las misiones de "ejercicios de
// bloque" de generateBlockPracticeMission.ts, que comparten mission_type
// pero no cuentan contra este cupo.
async function countFullMocksThisMonth(supabase: SupabaseClient, userId: string): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('camino_calendar')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mission_type', 'pau_practice')
    .not('metadata->>links_to_simulacro_exam_id', 'is', null)
    .gte('created_at', startOfMonth)
  return count ?? 0
}

// Decide qué pasa con cada misión de la secuencia según la cobertura de
// Curso (y, solo para el Simulacro, el cupo mensual del plan):
//  - exercise_practice: 'delay' si aún no se ha completado NINGÚN tema del
//    examen (practicar ejercicios sin haber visto nada de Curso no tiene
//    sentido) — se reintentará en una ejecución futura, no es un "no" final.
//    'cancelled' si, comprimiendo al máximo, no se llegaría al 80% a tiempo.
//  - final_mini_mock: 'monthly_limit' si ya no quedan Simulacros este mes
//    (chequeo aparte, antes que el de cobertura). 'cancelled' con el mismo
//    umbral del 80% que ya existía.
//  - computable=false (asignatura sin topic_id, examen sin exam_topics) ->
//    'generate' siempre, comportamiento idéntico al de antes de esta regla.
function decideMissionFate(
  mType: PartialMissionType,
  coverage: ExamCoverage,
  coverageDecision: 'full' | 'partial' | 'cancelled' | null,
  monthlyLimitReached: boolean,
): MissionFate {
  if (mType === 'final_mini_mock') {
    if (monthlyLimitReached) return 'monthly_limit'
    if (coverageDecision === 'cancelled') return 'cancelled'
    return 'generate'
  }
  if (!coverage.computable) return 'generate'
  if (coverage.completedCount === 0) return 'delay'
  if (coverageDecision === 'cancelled') return 'cancelled'
  return 'generate'
}

function toSlug(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// The part of an exam a student would recognize as "I changed something" —
// deliberately excludes anything derived from "today" (days-until-exam, and
// therefore session count) so routine daily reruns never look like a change.
type ExamSignature = {
  date: string
  block: string
  topic: string | null
  priority: ExamPriority
  confidence: ExamConfidence | null
  content: string | null
  customInstructions: string | null
}

function examSignature(partialExam: PartialExamInput): ExamSignature {
  return {
    date: partialExam.date,
    block: partialExam.block,
    topic: partialExam.topic || null,
    priority: partialExam.priority ?? 'normal',
    confidence: partialExam.confidence ?? null,
    content: partialExam.content ?? null,
    customInstructions: partialExam.customInstructions ?? null,
  }
}

function signatureFromMetadata(metadata: unknown): ExamSignature | null {
  if (!metadata || typeof metadata !== 'object') return null
  const m = metadata as Record<string, unknown>
  return {
    date: typeof m.partial_exam_date === 'string' ? m.partial_exam_date : '',
    block: typeof m.target_block_normalized === 'string' ? m.target_block_normalized : '',
    topic: typeof m.target_topic === 'string' ? m.target_topic : null,
    priority: (m.priority as ExamPriority | undefined) ?? 'normal',
    confidence: (m.confidence as ExamConfidence | null | undefined) ?? null,
    content: typeof m.target_content === 'string' ? m.target_content : null,
    customInstructions: typeof m.custom_instructions === 'string' ? m.custom_instructions : null,
  }
}

function signaturesEqual(a: ExamSignature, b: ExamSignature): boolean {
  return a.date === b.date && a.block === b.block && a.topic === b.topic &&
    a.priority === b.priority && a.confidence === b.confidence &&
    a.content === b.content && a.customInstructions === b.customInstructions
}

/**
 * Injects prep missions for a single exam. `reservedDates` are calendar dates
 * already claimed by a *different* (nearer) exam this run — this exam skips
 * them instead of double-booking the day, and returns the dates it claimed so
 * a caller iterating multiple exams (see `injectAllPartialExamMissions`) can
 * keep growing that reserved set.
 */
export async function injectPartialExamMissions(
  userId: string,
  supabase: SupabaseClient,
  partialExam: PartialExamInput,
  options: { reservedDates?: Set<string>; force?: boolean } = {},
): Promise<{ claimedDates: string[] }> {
  const today = madridToday()
  if (partialExam.date <= today) return { claimedDates: [] }

  // This runs at most once a day from ensureCaminoCalendar's throttle, so
  // without this check every single run would wipe and recompute — and
  // since the session count formula is driven by days-until-exam, which
  // shrinks every day even though nothing about the exam changed, that
  // reshuffled which calendar days already shown to the student carried a
  // prep mission. Missions must only move for a real reason (exam edited,
  // exam removed, instructions changed) — never as a side effect of "today"
  // having advanced. So: look at what's already scheduled for this exam
  // (any status, so a fully-completed prep plan isn't re-injected either)
  // and skip the wipe/reinsert entirely if nothing that matters changed.
  const { data: existingRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date, status, metadata')
    .eq('user_id', userId)
    .eq('source', 'partial')
    .filter('metadata->>partial_exam_id', 'eq', partialExam.id)
    .order('scheduled_date', { ascending: true })

  // `force` (set by the explicit "Recalcular mi Camino para este examen"
  // action) skips this stability check on purpose: the student asked for a
  // fresh calculation right now, even if nothing in the exam's own fields
  // changed — e.g. new grades came in, or more days have passed and the
  // margin needs revisiting.
  if (!options.force && existingRows && existingRows.length > 0) {
    const existingSignature = signatureFromMetadata(existingRows[0].metadata)
    if (existingSignature && signaturesEqual(examSignature(partialExam), existingSignature)) {
      return {
        claimedDates: existingRows
          .filter(r => r.status === 'pending')
          .map(r => r.scheduled_date as string),
      }
    }
  }

  // Idempotent: wipe any pending partial missions for this exam before re-inserting
  await supabase
    .from('camino_calendar')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'partial')
    .eq('status', 'pending')
    .filter('metadata->>partial_exam_id', 'eq', partialExam.id)

  // Include TODAY as a candidate slot (previously started from tomorrow),
  // otherwise an exam added during onboarding never got a mission scheduled
  // for the student's very first day in Camino.
  const allSlots = weekdaysBefore(partialExam.date, today)
  const daysUntilExam = allSlots.length
  if (daysUntilExam === 0 || daysUntilExam > 10) return { claimedDates: [] } // > 10 weekdays out: nothing to inject yet

  const reserved = options.reservedDates
  const availableSlots = reserved ? allSlots.filter(d => !reserved.has(d)) : allSlots

  const maxSessionsPerDay = Math.max(1, Math.min(partialExam.maxSessionsPerDay ?? 1, 3))
  const sequence = missionSequence(daysUntilExam)
  if (sequence.length === 0 || availableSlots.length === 0) return { claimedDates: [] }

  const subjectSlug = EXAM_SUBJECT_SLUG[partialExam.subject] ?? partialExam.subject
  const simSubject = SIMULACRO_SUBJECT[subjectSlug] ?? subjectSlug
  const blockDisplay = BLOCK_DISPLAY[partialExam.block] ?? partialExam.block
  const blockSlug = toSlug(partialExam.block)
  const topic = partialExam.topic || undefined
  const now = new Date().toISOString()

  // Regla de negocio: ambas misiones (práctica de ejercicios Y Simulacro) de
  // un examen solo se generan si el Curso de sus temas está — o,
  // comprimiendo al máximo el ritmo, PUEDE llegar a estar — razonablemente
  // cubierto antes de la fecha. computable=false (asignatura sin topic_id
  // todavía, o examen sin exam_topics) deja coverageDecision en null ->
  // comportamiento idéntico al de siempre, sin ningún cambio (ver regla 4/6).
  const coverage = await computeExamCoverage(supabase, userId, partialExam.id, subjectSlug, partialExam.date, today)
  const coverageDecision: 'full' | 'partial' | 'cancelled' | null = !coverage.computable
    ? null
    : coverage.maxProjectedCoveragePct >= 100
      ? 'full'
      : coverage.maxProjectedCoveragePct >= MIN_COVERAGE_PCT_FOR_SIMULACRO
        ? 'partial'
        : 'cancelled'

  // Cupo mensual de Simulacros — solo importa si esta secuencia incluye
  // final_mini_mock, pero siempre la incluye (missionSequence ya solo
  // devuelve [] o las 2), así que se resuelve una vez por examen.
  const fullMocksLimit = await resolveFullMocksLimit(supabase, userId)
  const fullMocksUsedThisMonth = await countFullMocksThisMonth(supabase, userId)
  const monthlyLimitReached = fullMocksUsedThisMonth >= fullMocksLimit

  // final_mini_mock: restringido a los últimos FINAL_MOCK_WINDOW_DAYS días
  // hábiles del examen (nunca más lejos, y nunca el mismo día del examen —
  // weekdaysBefore ya lo excluye) — antes se colocaba junto con
  // exercise_practice vía el empaquetado genérico de assignDatesForCount, lo
  // que con varios exámenes próximos reservándose días entre sí podía
  // empujarlo hasta 6-9 días antes en vez de quedarse cerca de SU examen.
  // Dentro de esos 1-3 días, se elige el MÁS TEMPRANO (más margen para el
  // alumno) en el que la cobertura proyectada hasta ese punto ya alcanzaría
  // el umbral; si ni siquiera el más tardío lo alcanza, se usa igualmente
  // el más tardío (lo más cerca posible del examen, comprimiendo al
  // máximo) — decideMissionFate ya decide aparte si con eso basta para
  // generar el Simulacro o no.
  function projectedPctThrough(dateStr: string): number {
    if (coverage.totalCount === 0) return 100
    const daysThroughCandidate = allSlots.indexOf(dateStr) + 1
    const additional = Math.min(coverage.pendingSortOrders.length, coverage.maxPerDayCapacity * daysThroughCandidate)
    return Math.min(100, ((coverage.completedCount + additional) / coverage.totalCount) * 100)
  }

  // Con varios exámenes próximos reservándose días entre sí, los últimos
  // FINAL_MOCK_WINDOW_DAYS días pueden estar TODOS ya reservados por otro
  // examen (visto con datos reales: 3 exámenes de Historia/Mates
  // encadenados en la misma semana). En vez de caer directo al hueco
  // disponible más lejano de toda la ventana de 10 días (lo que
  // reintroducía el mismo problema que esta regla arregla), se amplía la
  // ventana de búsqueda de 1 en 1 día hasta encontrar el primer tamaño con
  // al menos un hueco libre — así el Simulacro se queda tan cerca del
  // examen como sea físicamente posible, no en el otro extremo.
  let finalMockSlot: string | null = null
  for (let windowSize = Math.min(FINAL_MOCK_WINDOW_DAYS, allSlots.length); windowSize <= allSlots.length; windowSize++) {
    const candidates = allSlots.slice(-windowSize).filter(d => !reserved?.has(d))
    if (candidates.length === 0) continue
    finalMockSlot = candidates.find(d => projectedPctThrough(d) >= MIN_COVERAGE_PCT_FOR_SIMULACRO) ?? candidates[candidates.length - 1]
    break
  }

  // exercise_practice usa el resto de la ventana de ≤10 días (sin la
  // restricción de los últimos 1-3) — mismo empaquetado "más cercano
  // primero" de siempre, excluyendo el día ya asignado al Simulacro salvo
  // que el alumno permita apilar varias sesiones el mismo día.
  const availableForPractice = availableSlots.filter(d => d !== finalMockSlot || maxSessionsPerDay > 1)
  const exercisePracticeSlot = assignDatesForCount(1, availableForPractice, maxSessionsPerDay)[0] ?? null

  const targetSequence = sequence
  const targetSlots: (string | null)[] = sequence.map(mType =>
    mType === 'final_mini_mock' ? finalMockSlot : exercisePracticeSlot,
  )
  const claimedDates: string[] = []

  for (let i = 0; i < targetSequence.length; i++) {
    const slot = targetSlots[i]
    const mType = targetSequence[i]
    if (!slot) continue

    const fate = decideMissionFate(mType, coverage, coverageDecision, monthlyLimitReached)
    // 'delay': ni siquiera se crea un aviso — no es un "no" definitivo, solo
    // "todavía no hay nada de Curso hecho de este examen", y se reintenta en
    // una ejecución futura (misma cadencia que el resto de esta función:
    // solo se recalcula si el examen cambia o hay force, ver arriba).
    if (fate === 'delay') continue

    // Skip slot if there's already a locked mission
    const { data: locked } = await supabase
      .from('camino_calendar')
      .select('id')
      .eq('user_id', userId)
      .eq('scheduled_date', slot)
      .eq('locked', true)
      .limit(1)
    if (locked && locked.length > 0) continue

    // Demote existing algorithm mission on this slot to bonus
    const { data: existing } = await supabase
      .from('camino_calendar')
      .select('id')
      .eq('user_id', userId)
      .eq('scheduled_date', slot)
      .eq('source', 'algorithm')
      .eq('status', 'pending')
      .limit(1)
    if (existing && existing.length > 0) {
      await supabase
        .from('camino_calendar')
        .update({ is_bonus: true, updated_at: now })
        .eq('id', existing[0].id as string)
    }

    // final_mini_mock enlaza al Simulacro real de 90 min (ver más abajo), no
    // al flujo de práctica de 45 — su hueco en el día debe reservar la
    // duración real, no la de partial_practice. Si fate no es 'generate'
    // (cobertura <80% o cupo mensual agotado), esta fila se convierte en un
    // aviso claro en vez de desaparecer sin explicación.
    const isFinalSimulacroLink = mType === 'final_mini_mock' && fate === 'generate'
    const scheduler = await createDayScheduler(userId, supabase, slot)
    const timeSlot = scheduler.place(isFinalSimulacroLink ? SIMULACRO_MINUTES : estimatedMinutesForMissionType('partial_practice'))

    const title = fate === 'monthly_limit'
      ? `Simulacro pospuesto: ya usaste tus Simulacros de este mes`
      : fate === 'cancelled'
        ? `${mType === 'final_mini_mock' ? 'Simulacro' : 'Práctica'} pospuesta: no ha dado tiempo a completar el Curso de ${blockDisplay}`
        : missionTitle(mType, blockDisplay, topic)

    // El motivo real de esta fila (para el banner de aviso) — 'monthly_limit'
    // pisa a coverageDecision cuando ES la razón real, para que el banner no
    // diga "no dio tiempo" cuando en realidad sí daba tiempo y lo que faltó
    // fue cupo del plan.
    const rowDecision: 'full' | 'partial' | 'cancelled' | 'monthly_limit' | null =
      fate === 'monthly_limit' ? 'monthly_limit' : coverageDecision

    await supabase.from('camino_calendar').insert({
      user_id: userId,
      scheduled_date: slot,
      subject: subjectSlug,
      title,
      block_key: partialExam.block || null,
      block_slug: blockSlug || null,
      // pau_practice (ya permitido por el constraint de BD, ya con XP
      // definido) en vez de partial_practice para que esta misión concreta
      // abra el Simulacro real de 90 min en vez del flujo de práctica de 45
      // — ver hrefForMission en CaminoCalendarClient.tsx, que decide la URL
      // mirando mission_type + metadata.links_to_simulacro_exam_id.
      mission_type: isFinalSimulacroLink ? 'pau_practice' : 'partial_practice',
      is_main: true,
      is_bonus: false,
      status: 'pending',
      source: 'partial',
      generated_by: 'partial_exam_v1',
      start_time: timeSlot?.start ?? null,
      end_time: timeSlot?.end ?? null,
      metadata: {
        partial_exam_id: partialExam.id,
        partial_exam_date: partialExam.date,
        target_block_normalized: partialExam.block,
        target_block_display: blockDisplay,
        target_topic: topic ?? null,
        target_content: partialExam.content ?? null,
        partial_mission_type: mType,
        days_until_exam: daysUntilExam,
        priority: partialExam.priority ?? 'normal',
        confidence: partialExam.confidence ?? null,
        custom_instructions: partialExam.customInstructions ?? null,
        simulacro_block_filter: partialExam.block || null,
        ...(isFinalSimulacroLink ? {
          links_to_simulacro_exam_id: partialExam.id,
          links_to_simulacro_exam_scope: partialExam.examScope ?? 'parcial',
        } : {}),
        ...(fate === 'cancelled' ? { simulacro_cancelled: true } : {}),
        ...(fate === 'monthly_limit' ? { simulacro_monthly_limit_reached: true } : {}),
        simulacro_subject: simSubject,
        // Presente en TODAS las misiones de este examen (no solo en
        // final_mini_mock) cuando hay un motivo real que reportar, para que
        // el banner de aviso pueda encontrar la señal leyendo cualquier fila
        // de este partial_exam_id, sin depender de si el Simulacro se llegó
        // a generar o no.
        ...(rowDecision ? {
          exam_coverage_pct: Math.round(coverage.maxProjectedCoveragePct ?? 100),
          exam_coverage_decision: rowDecision,
        } : {}),
      },
    })
    claimedDates.push(slot)
  }

  return { claimedDates }
}

export async function deletePartialExamMissions(
  userId: string,
  supabase: SupabaseClient,
  examId: string,
): Promise<void> {
  await supabase
    .from('camino_calendar')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'partial')
    .eq('status', 'pending')
    .filter('metadata->>partial_exam_id', 'eq', examId)
}

/**
 * Processes ALL of a student's active exams together (nearest date first) so
 * that two exams close in time don't silently overwrite each other's prep
 * slots, and so a further-out exam never plants a mission on a day that is
 * actually a different subject's exam date.
 */
export async function injectAllPartialExamMissions(
  userId: string,
  supabase: SupabaseClient,
  exams: (StudentExam & { sessionOverride?: number; maxSessionsPerDay?: number })[],
  options: { forceExamId?: string } = {},
): Promise<void> {
  const today = madridToday()
  const upcoming = exams
    .filter(exam => exam.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length === 0) return

  // Fetched here (not passed in) so every caller — the client saving/
  // deleting an exam, onboarding, and ensureCaminoCalendar's daily throttle
  // — compares against the exact same live value. Two callers used to pass
  // this inconsistently (some omitted it entirely), which, now that
  // injectPartialExamMissions skips reinjection when nothing changed, would
  // otherwise look like custom_instructions flip-flopping between "set" and
  // "unset" on every other run and defeat that stability check.
  const { data: profile } = await supabase
    .from('perfiles')
    .select('custom_instructions')
    .eq('id', userId)
    .maybeSingle()
  const customInstructions = profile?.custom_instructions ?? undefined

  const reservedDates = new Set<string>()
  for (const exam of upcoming) {
    const force = options.forceExamId != null && exam.id === options.forceExamId
    const { claimedDates } = await injectPartialExamMissions(userId, supabase, { ...exam, customInstructions }, { reservedDates, force })
    for (const d of claimedDates) reservedDates.add(d)
    // Reserve the exam's own date too: a later exam's prep window shouldn't
    // claim what is actually a different subject's exam day.
    reservedDates.add(exam.date)
  }
}
