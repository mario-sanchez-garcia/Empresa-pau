import { type SupabaseClient } from '@supabase/supabase-js'

import { EXAM_SUBJECT_SLUG, SIMULACRO_SUBJECT } from './partialExamSubjects'
import { createDayScheduler, estimatedMinutesForMissionType } from './scheduleTimeSlot'
import type { ExamConfidence, ExamPriority, StudentExam } from './cleanStudentExams'

type PartialMissionType = 'conceptual_review' | 'evau_practice' | 'block_mock' | 'final_mini_mock'

const BLOCK_DISPLAY: Record<string, string> = {
  Algebra: 'Álgebra',
  Analisis: 'Análisis',
  Geometria: 'Geometría',
  Probabilidad: 'Probabilidad',
}

export type PartialExamInput = {
  id: string
  subject: string
  date: string
  block: string
  topic?: string
  priority?: ExamPriority
  confidence?: ExamConfidence
  content?: string
  /** Overrides the computed session count (e.g. from an AI plan-intensity call). */
  sessionOverride?: number
  /** Free-text custom instructions from the student, passed through to mission metadata. */
  customInstructions?: string
}

function madridToday(): string {
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

function weekdaysBefore(examDate: string, fromDate: string): string[] {
  const days: string[] = []
  let cur = fromDate
  while (cur < examDate) {
    if (isWeekday(cur)) days.push(cur)
    cur = shiftDate(cur, 1)
  }
  return days
}

function priorityWeight(priority?: ExamPriority): number {
  if (priority === 'muy_alta') return 4
  if (priority === 'alta') return 3
  if (priority === 'baja') return 1
  return 2 // normal / unset
}

// Lower confidence ("voy mal") earns more prep sessions; high confidence needs fewer.
function confidenceBonus(confidence?: ExamConfidence): number {
  if (confidence === 'bajo') return 1
  if (confidence === 'alto') return -1
  return 0
}

function baseSessionCount(daysAvailable: number): number {
  if (daysAvailable <= 2) return 1
  if (daysAvailable <= 5) return 3
  return 4
}

// Priority/confidence modulate how many prep sessions an exam earns, but the
// count is always capped well below the available days so other active
// subjects keep their rotation slots instead of being crowded out entirely.
function sessionCountFor(daysAvailable: number, priority?: ExamPriority, confidence?: ExamConfidence, sessionOverride?: number): number {
  if (daysAvailable <= 0) return 0
  const weight = priorityWeight(priority)
  const priorityBonus = weight >= 4 ? 2 : weight === 3 ? 1 : weight === 1 ? -1 : 0
  const computed = baseSessionCount(daysAvailable) + priorityBonus + confidenceBonus(confidence)
  const requested = sessionOverride && sessionOverride > 0 ? sessionOverride : computed
  return Math.max(1, Math.min(requested, daysAvailable, 6))
}

function missionSequence(count: number): PartialMissionType[] {
  if (count <= 0) return []
  const seq: PartialMissionType[] = []
  if (count >= 4) seq.push('conceptual_review')
  const reserved = (count >= 2 ? 1 : 0) + 1 // block_mock (if any) + final_mini_mock
  const fillerCount = Math.max(0, count - seq.length - reserved)
  for (let i = 0; i < fillerCount; i++) seq.push('evau_practice')
  if (count >= 2) seq.push('block_mock')
  seq.push('final_mini_mock')
  return seq
}

function missionTitle(type: PartialMissionType, blockDisplay: string, topic?: string): string {
  const ctx = topic ? `${blockDisplay} — ${topic}` : blockDisplay
  switch (type) {
    case 'conceptual_review': return `Repaso de conceptos: ${ctx}`
    case 'evau_practice':     return `Práctica PAU: ${ctx}`
    case 'block_mock':        return `Mini-simulacro: ${ctx}`
    case 'final_mini_mock':   return `Simulacro final antes del parcial: ${ctx}`
  }
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
  options: { reservedDates?: Set<string> } = {},
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

  if (existingRows && existingRows.length > 0) {
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

  const count = sessionCountFor(daysUntilExam, partialExam.priority, partialExam.confidence, partialExam.sessionOverride)
  const sequence = missionSequence(count)
  if (sequence.length === 0 || availableSlots.length === 0) return { claimedDates: [] }

  const subjectSlug = EXAM_SUBJECT_SLUG[partialExam.subject] ?? partialExam.subject
  const simSubject = SIMULACRO_SUBJECT[subjectSlug] ?? subjectSlug
  const blockDisplay = BLOCK_DISPLAY[partialExam.block] ?? partialExam.block
  const blockSlug = toSlug(partialExam.block)
  const topic = partialExam.topic || undefined
  const now = new Date().toISOString()

  // Use the last N available slots (closest to the exam). When a nearer
  // exam has already reserved part of this window, availableSlots can be
  // shorter than the full sequence — slice(-sequence.length) on a shorter
  // array returns it unchanged from the start, silently pairing sequence[0..]
  // (the lowest-priority, earliest session types) with the few available
  // slots while dropping block_mock/final_mini_mock (the highest-priority
  // ones, meant to land right before the exam) entirely. Trim the sequence
  // from the front instead, so it's always the earliest/lowest-priority
  // session types that get dropped when slots are scarce, never the ones
  // closest to the exam.
  const usableCount = Math.min(sequence.length, availableSlots.length)
  const targetSequence = sequence.slice(-usableCount)
  const targetSlots = availableSlots.slice(-usableCount)
  const claimedDates: string[] = []

  for (let i = 0; i < targetSequence.length; i++) {
    const slot = targetSlots[i]
    const mType = targetSequence[i]
    if (!slot) continue

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

    const scheduler = await createDayScheduler(userId, supabase, slot)
    const timeSlot = scheduler.place(estimatedMinutesForMissionType('partial_practice'))

    await supabase.from('camino_calendar').insert({
      user_id: userId,
      scheduled_date: slot,
      subject: subjectSlug,
      title: missionTitle(mType, blockDisplay, topic),
      block_key: partialExam.block || null,
      block_slug: blockSlug || null,
      mission_type: 'partial_practice',
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
        simulacro_subject: simSubject,
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
  exams: (StudentExam & { sessionOverride?: number })[],
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
    const { claimedDates } = await injectPartialExamMissions(userId, supabase, { ...exam, customInstructions }, { reservedDates })
    for (const d of claimedDates) reservedDates.add(d)
    // Reserve the exam's own date too: a later exam's prep window shouldn't
    // claim what is actually a different subject's exam day.
    reservedDates.add(exam.date)
  }
}
