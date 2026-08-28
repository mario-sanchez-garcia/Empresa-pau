import { type SupabaseClient } from '@supabase/supabase-js'

import { getCaminoPlanLimits } from './caminoPlanLimits'
import { computeExamCoverage, type ExamCoverage } from './examCoverage'
import { EXAM_SUBJECT_SLUG, SIMULACRO_SUBJECT } from './partialExamSubjects'
import { createDayScheduler, estimatedMinutesForMissionType } from './scheduleTimeSlot'
import { SIMULACRO_MINUTES } from './xpMap'
import type { ExamConfidence, ExamPriority, ExamScope, StudentExam } from './cleanStudentExams'

// Un examen activo genera como mucho estas 2 misiones de preparación (ver
// missionSequence): una práctica de ejercicios (45 min) y el Simulacro
// completo (90 min, enlazado al examen real). Ambas pasan por
// computeExamCoverage antes de generarse, para respetar el orden
// Curso → Ejercicios → Simulacro (ver decideMissionFate).
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
export const FINAL_MOCK_WINDOW_DAYS = 3

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
// (null).
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

// Siempre las mismas 2 (una práctica de ejercicios + el Simulacro) cuando hay
// al menos 1 día hábil disponible. assignDatesForCount ya se encarga de
// dejar caer la primera (exercise_practice) si el hueco es tan justo que
// solo cabe una, quedándose con la más cercana al examen (final_mini_mock).
function missionSequence(daysAvailable: number): PartialMissionType[] {
  if (daysAvailable <= 0) return []
  return ['exercise_practice', 'final_mini_mock']
}

// exercise_practice usa mission_type: 'partial_practice' al insertarse más
// abajo, así que abre el flujo de 45 min de /simulacros/practica/[id]
// (PARCIAL_MINUTES) — su título nunca dice "Simulacro" (evita que el alumno
// espere una sesión de 90 min y el cronómetro le dé solo 45). final_mini_mock
// es la excepción: enlaza al Simulacro real de 90 min (mission_type:
// 'pau_practice', ver el bucle de inserción más abajo), así que su título
// SÍ debe decir "Simulacro".
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
//    'generate' siempre, sin ninguna restricción de cobertura.
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

// Coverage % if every weekday up to (and including) `dateStr` were spent
// entirely on this exam's pending topics, at the student's max declared
// daily mission count (coverage.maxPerDayCapacity). `allSlots` is the full
// list of weekdays before the exam date (weekdaysBefore's output) — used to
// find `dateStr`'s position (how many days of compression it would allow).
function projectedCoveragePctThrough(coverage: ExamCoverage, allSlots: string[], dateStr: string): number {
  if (coverage.totalCount === 0) return 100
  const daysThroughCandidate = allSlots.indexOf(dateStr) + 1
  const additional = Math.min(coverage.pendingSortOrders.length, coverage.maxPerDayCapacity * daysThroughCandidate)
  return Math.min(100, ((coverage.completedCount + additional) / coverage.totalCount) * 100)
}

// Finds the day to place final_mini_mock on: within the last
// FINAL_MOCK_WINDOW_DAYS weekdays of `allSlots`, the EARLIEST one (most
// margin for the student) whose projected coverage through that day already
// clears MIN_COVERAGE_PCT_FOR_SIMULACRO; if none clears it, the LATEST one
// (closest to the exam, maximum compression) — decideMissionFate elsewhere
// decides whether that's actually enough to generate the Simulacro. If every
// day in that 3-day window is excluded by `excludedDates` (e.g. all claimed
// by other exams), the search widens one day at a time until it finds a
// window with at least one available candidate, so the Simulacro lands as
// close to the exam as physically possible rather than jumping to the
// farthest free day in the whole ≤10-day window.
function findFinalMockSlotInWindow(allSlots: string[], excludedDates: Set<string> | undefined, coverage: ExamCoverage): string | null {
  for (let windowSize = Math.min(FINAL_MOCK_WINDOW_DAYS, allSlots.length); windowSize <= allSlots.length; windowSize++) {
    const candidates = allSlots.slice(-windowSize).filter(d => !excludedDates?.has(d))
    if (candidates.length === 0) continue
    return candidates.find(d => projectedCoveragePctThrough(coverage, allSlots, d) >= MIN_COVERAGE_PCT_FOR_SIMULACRO) ?? candidates[candidates.length - 1]
  }
  return null
}

/**
 * Resuelve SOLO el slot de final_mini_mock de un examen, de solo lectura
 * (sin escribir nada en camino_calendar). injectAllPartialExamMissions la usa
 * como "pasada 1": cada examen activo reserva primero su propio slot de
 * Simulacro con esta función, antes de repartir exercise_practice — así
 * ningún examen depende de si otro se procesó antes para quedarse con un
 * hueco cerca de su fecha. `otherExamDates` solo evita aterrizar en el día
 * real de OTRO examen — dos Simulacros de exámenes distintos SÍ pueden
 * coincidir en la misma fecha exacta (el scheduler de cada día, en
 * injectPartialExamMissions, coloca cada uno en su propio hueco de hora sin
 * pisarse).
 */
export async function resolveFinalMockSlot(
  userId: string,
  supabase: SupabaseClient,
  partialExam: PartialExamInput,
  otherExamDates: Set<string>,
  force = false,
): Promise<string | null> {
  const today = madridToday()
  if (partialExam.date <= today) return null

  // Mismo chequeo de estabilidad que injectPartialExamMissions más abajo —
  // si el examen no cambió, se reutiliza el Simulacro YA agendado en vez de
  // recalcularlo, para que esta resolución de solo lectura sea consistente
  // con lo que injectPartialExamMissions hará después con el mismo examen.
  const { data: existingRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date, status, metadata')
    .eq('user_id', userId)
    .eq('source', 'partial')
    .filter('metadata->>partial_exam_id', 'eq', partialExam.id)
    .order('scheduled_date', { ascending: true })

  if (!force && existingRows && existingRows.length > 0) {
    const existingSignature = signatureFromMetadata(existingRows[0].metadata)
    if (existingSignature && signaturesEqual(examSignature(partialExam), existingSignature)) {
      const existingMock = existingRows.find(row => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>
        return meta.partial_mission_type === 'final_mini_mock' && row.status === 'pending'
      })
      return (existingMock?.scheduled_date as string | undefined) ?? null
    }
  }

  const allSlots = weekdaysBefore(partialExam.date, today)
  const daysUntilExam = allSlots.length
  // Mismo corte que injectPartialExamMissions (> 10 días hábiles: todavía no
  // toca inyectar nada de este examen) — sin esto, un examen lejano
  // reservaría aquí un slot "fantasma" que injectPartialExamMissions ni
  // siquiera llegaría a insertar (corta antes por el mismo motivo),
  // bloqueándole sin razón una fecha a otro examen sí computable en la
  // pasada 2.
  if (daysUntilExam === 0 || daysUntilExam > 10 || missionSequence(daysUntilExam).length === 0) return null

  const subjectSlug = EXAM_SUBJECT_SLUG[partialExam.subject] ?? partialExam.subject
  const coverage = await computeExamCoverage(supabase, userId, partialExam.id, subjectSlug, partialExam.date, today)

  return findFinalMockSlotInWindow(allSlots, otherExamDates, coverage)
}

/**
 * Injects prep missions for a single exam. `reservedDates` are calendar dates
 * already claimed by a *different* (nearer) exam this run — this exam skips
 * them instead of double-booking the day, and returns the dates it claimed so
 * a caller iterating multiple exams (see `injectAllPartialExamMissions`) can
 * keep growing that reserved set. `finalMockSlot`, when provided (pasada 1 de
 * injectAllPartialExamMissions, vía resolveFinalMockSlot), se usa tal cual en
 * vez de recalcularse aquí — si se omite (undefined), se calcula
 * internamente con el algoritmo de siempre (compatibilidad para cualquier
 * llamada directa a esta función).
 */
export async function injectPartialExamMissions(
  userId: string,
  supabase: SupabaseClient,
  partialExam: PartialExamInput,
  options: { reservedDates?: Set<string>; force?: boolean; finalMockSlot?: string | null } = {},
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
  // todavía, o examen sin exam_topics) deja coverageDecision en null, así que
  // ambas misiones se generan sin ninguna restricción de cobertura.
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

  // El slot de final_mini_mock normalmente ya viene resuelto por la pasada 1
  // de injectAllPartialExamMissions (resolveFinalMockSlot, que reserva la
  // ventana de cada examen antes de repartir nada más — ver su docstring).
  // Si esta función se llama sin `options.finalMockSlot` (fuera de ese
  // flujo), se calcula aquí mismo con el mismo criterio
  // (findFinalMockSlotInWindow), filtrando contra `reserved` en vez de
  // contra las fechas de otro examen.
  const finalMockSlot = options.finalMockSlot !== undefined
    ? options.finalMockSlot
    : findFinalMockSlotInWindow(allSlots, reserved, coverage)

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
    const scheduledMissionType = isFinalSimulacroLink ? 'pau_practice' : 'partial_practice'
    const timeSlot = scheduler.placeBest(isFinalSimulacroLink ? SIMULACRO_MINUTES : estimatedMinutesForMissionType('partial_practice'), {
      date: slot,
      subject: subjectSlug,
      missionType: scheduledMissionType,
      daysUntilExam,
      deadlineDate: partialExam.date,
      priority: partialExam.priority ?? 'normal',
    })

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
      mission_type: scheduledMissionType,
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
 * Processes ALL of a student's active exams together, in two passes, so that
 * two exams close in time don't fight over the same prep slots and so a
 * further-out exam never plants a mission on a day that is actually a
 * different subject's exam date.
 *
 * PASADA 1 resuelve el slot de final_mini_mock (Simulacro) de CADA examen
 * usando solo SU PROPIA ventana de FINAL_MOCK_WINDOW_DAYS días — cada examen
 * reserva su hueco de forma independiente, sin que otro examen activo se lo
 * pueda quitar por haberse procesado antes.
 *
 * PASADA 2 reparte exercise_practice (más cercano primero) evitando las
 * fechas de examen y TODOS los slots de Simulacro resueltos en la pasada 1
 * — de cualquier examen, no solo el suyo — para que una práctica de
 * ejercicios no aterrice el mismo día que un Simulacro ajeno.
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

  // Días de examen reales de TODOS los exámenes activos — solo esto excluye
  // el slot de Simulacro de un examen en la pasada 1 (no queremos que un
  // Simulacro caiga en el día real de otro examen); dos Simulacros SÍ pueden
  // coincidir entre sí en la misma fecha (ver comentario de la función).
  const examDates = new Set(upcoming.map(exam => exam.date))

  // PASADA 1
  const mockSlotByExamId = new Map<string, string | null>()
  for (const exam of upcoming) {
    const force = options.forceExamId != null && exam.id === options.forceExamId
    const slot = await resolveFinalMockSlot(userId, supabase, { ...exam, customInstructions }, examDates, force)
    mockSlotByExamId.set(exam.id, slot)
  }

  // PASADA 2
  const reservedDates = new Set<string>(examDates)
  for (const slot of mockSlotByExamId.values()) {
    if (slot) reservedDates.add(slot)
  }
  for (const exam of upcoming) {
    const force = options.forceExamId != null && exam.id === options.forceExamId
    const ownMockSlot = mockSlotByExamId.get(exam.id) ?? null
    // El Simulacro de ESTE examen no debe excluirse de su propio reparto de
    // exercise_practice sin condición — injectPartialExamMissions ya tiene
    // su propio filtro (`d !== finalMockSlot`, salvo maxSessionsPerDay > 1)
    // para decidir si puede apilar ambas misiones el mismo día. Si aquí
    // también lo metiéramos en reservedDates sin condición, ese filtro
    // interno dejaría de tener efecto nunca.
    const reservedForThisExam = ownMockSlot
      ? new Set([...reservedDates].filter(d => d !== ownMockSlot))
      : reservedDates
    const { claimedDates } = await injectPartialExamMissions(
      userId, supabase, { ...exam, customInstructions },
      { reservedDates: reservedForThisExam, force, finalMockSlot: ownMockSlot },
    )
    for (const d of claimedDates) reservedDates.add(d)
  }
}
