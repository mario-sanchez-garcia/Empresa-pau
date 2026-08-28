import { type TimeRange } from './scheduleTimeSlot'

export type MissionSlotScoringContext = {
  date?: string
  subject?: string | null
  missionType?: string | null
  daysUntilExam?: number | null
  deadlineDate?: string | null
  priority?: string | null
}

export type ScoredTimeSlot = TimeRange & { score: number; reasons: string[] }

export const SLOT_SCORING_WEIGHTS = {
  examWithin7Days: 42,
  examWithin14Days: 24,
  highPriorityExam: 12,
  mediumPriorityExam: 6,
  highLoadEarly: 18,
  highLoadLatePenalty: -16,
  lowLoadLate: 10,
  lowLoadEarlyPenalty: -4,
  mediumMiddle: 6,
  dailyLoadHourPenalty: -5,
  repeatedSubjectPenalty: -7,
  excessiveSubjectPenalty: -10,
  continuityBonus: 6,
  tinyGapPenalty: -8,
  deadlineProximityPenalty: -4,
  deterministicEarlyTieBreak: -0.01,
} as const

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number)
  return h * 60 + (m || 0)
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function scoringStudyWindowFor(dateStr: string): TimeRange {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return dow === 0 || dow === 6 ? { start: '10:00', end: '21:00' } : { start: '16:00', end: '22:00' }
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }) {
  return Math.max(a.start, b.start) < Math.min(a.end, b.end)
}

function dateDiffDays(from: string, to: string) {
  return Math.floor((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000)
}

function loadLevel(context: MissionSlotScoringContext): 'high' | 'medium' | 'low' {
  const missionType = context.missionType ?? ''
  const subject = context.subject ?? ''
  if (missionType === 'review') return 'low'
  if (missionType === 'comment_text') return 'medium'
  if (missionType === 'partial_practice' || missionType === 'pau_practice' || missionType === 'final_mini_mock' || missionType === 'mock_exam') return 'high'
  if (subject === 'matematicas_ii' || subject === 'matematicas_ccss' || subject === 'fisica' || subject === 'quimica') return 'high'
  return 'medium'
}

function tinyGapPenalty(candidate: { start: number; end: number }, busy: Array<{ start: number; end: number }>) {
  let penalty = 0
  for (const item of busy) {
    const before = candidate.start - item.end
    const after = item.start - candidate.end
    if (before > 0 && before < 15) penalty += SLOT_SCORING_WEIGHTS.tinyGapPenalty
    if (after > 0 && after < 15) penalty += SLOT_SCORING_WEIGHTS.tinyGapPenalty
  }
  return penalty
}

export function scoreCandidateSlot(input: {
  candidate: TimeRange
  busy: TimeRange[]
  window: TimeRange
  context?: MissionSlotScoringContext
}): { score: number; reasons: string[] } {
  const context = input.context ?? {}
  const reasons: string[] = []
  const start = toMinutes(input.candidate.start)
  const end = toMinutes(input.candidate.end)
  const windowStart = toMinutes(input.window.start)
  const windowEnd = toMinutes(input.window.end)
  const windowLength = Math.max(1, windowEnd - windowStart)
  const position = (start - windowStart) / windowLength
  const busyMinutes = input.busy.reduce((sum, item) => {
    const busyStart = Math.max(toMinutes(item.start), windowStart)
    const busyEnd = Math.min(toMinutes(item.end), windowEnd)
    return busyEnd > busyStart ? sum + (busyEnd - busyStart) : sum
  }, 0)
  const sameSubjectBusy = context.subject
    ? input.busy.filter(item => item.subject === context.subject).length
    : 0
  const load = loadLevel(context)
  let score = 100

  const daysUntilExam = context.daysUntilExam ?? (context.date && context.deadlineDate ? dateDiffDays(context.date, context.deadlineDate) : null)
  if (daysUntilExam != null) {
    if (daysUntilExam < 0) return { score: Number.NEGATIVE_INFINITY, reasons: ['after_deadline'] }
    if (daysUntilExam <= 7) { score += SLOT_SCORING_WEIGHTS.examWithin7Days; reasons.push('exam_within_7_days') }
    else if (daysUntilExam <= 14) { score += SLOT_SCORING_WEIGHTS.examWithin14Days; reasons.push('exam_within_14_days') }
    score += Math.max(-28, daysUntilExam * SLOT_SCORING_WEIGHTS.deadlineProximityPenalty)
    reasons.push('deadline_proximity')
  }

  if (context.priority === 'alta' || context.priority === 'high' || context.priority === 'urgente') {
    score += SLOT_SCORING_WEIGHTS.highPriorityExam
    reasons.push('high_priority_exam')
  } else if (context.priority === 'media' || context.priority === 'medium' || context.priority === 'normal') {
    score += SLOT_SCORING_WEIGHTS.mediumPriorityExam
    reasons.push('medium_priority_exam')
  }

  if (load === 'high') {
    if (position <= 0.35) { score += SLOT_SCORING_WEIGHTS.highLoadEarly; reasons.push('high_load_early_slot') }
    else if (position >= 0.72) { score += SLOT_SCORING_WEIGHTS.highLoadLatePenalty; reasons.push('high_load_late_penalty') }
  } else if (load === 'low') {
    if (position >= 0.62) { score += SLOT_SCORING_WEIGHTS.lowLoadLate; reasons.push('low_load_late_slot') }
    else if (position <= 0.25) { score += SLOT_SCORING_WEIGHTS.lowLoadEarlyPenalty; reasons.push('low_load_early_penalty') }
  } else if (position >= 0.28 && position <= 0.72) {
    score += SLOT_SCORING_WEIGHTS.mediumMiddle
    reasons.push('medium_load_middle_slot')
  }

  const dailyLoadPenalty = Math.floor(busyMinutes / 60) * SLOT_SCORING_WEIGHTS.dailyLoadHourPenalty
  if (dailyLoadPenalty) { score += dailyLoadPenalty; reasons.push('daily_load_penalty') }

  if (sameSubjectBusy >= 3 && !(daysUntilExam != null && daysUntilExam <= 7)) {
    score += SLOT_SCORING_WEIGHTS.excessiveSubjectPenalty
    reasons.push('excessive_same_subject_penalty')
  } else if (sameSubjectBusy >= 1 && !(daysUntilExam != null && daysUntilExam <= 7)) {
    score += sameSubjectBusy * SLOT_SCORING_WEIGHTS.repeatedSubjectPenalty
    reasons.push('repeated_subject_penalty')
  }

  const numericBusy = input.busy.map(item => ({ start: toMinutes(item.start), end: toMinutes(item.end), subject: item.subject }))
  if (context.subject && numericBusy.some(item => item.subject === context.subject && (item.end === start || item.start === end))) {
    score += SLOT_SCORING_WEIGHTS.continuityBonus
    reasons.push('same_subject_continuity')
  }

  const gapPenalty = tinyGapPenalty({ start, end }, numericBusy)
  if (gapPenalty) { score += gapPenalty; reasons.push('tiny_gap_penalty') }

  score += start * SLOT_SCORING_WEIGHTS.deterministicEarlyTieBreak
  reasons.push(`load_${load}`)
  return { score: Math.round(score * 100) / 100, reasons }
}

export function scoreCandidateSlots(durationMinutes: number, busy: TimeRange[], window: TimeRange, context: MissionSlotScoringContext = {}): ScoredTimeSlot[] {
  if (durationMinutes <= 0) return []
  const windowStart = toMinutes(window.start)
  const windowEnd = toMinutes(window.end)
  const numericBusy = busy
    .map(item => ({ start: toMinutes(item.start), end: toMinutes(item.end) }))
    .filter(item => item.end > windowStart && item.start < windowEnd)

  const candidates: ScoredTimeSlot[] = []
  for (let cursor = windowStart; cursor + durationMinutes <= windowEnd; cursor += 15) {
    const candidate = { start: cursor, end: cursor + durationMinutes }
    if (numericBusy.some(item => overlaps(candidate, item))) continue
    const slot = { start: toHHMM(candidate.start), end: toHHMM(candidate.end) }
    const scored = scoreCandidateSlot({ candidate: slot, busy, window, context })
    if (!Number.isFinite(scored.score)) continue
    candidates.push({ ...slot, score: scored.score, reasons: scored.reasons })
  }
  return candidates.sort((a, b) => b.score - a.score || a.start.localeCompare(b.start))
}

export function findBestScoredSlot(durationMinutes: number, busy: TimeRange[], window: TimeRange, context: MissionSlotScoringContext = {}): ScoredTimeSlot | null {
  const [best] = scoreCandidateSlots(durationMinutes, busy, window, context)
  return best
}

export function scoreDateSlot(input: {
  date: string
  slot: TimeRange
  busy: TimeRange[]
  context?: MissionSlotScoringContext
  dateIndex?: number
}) {
  const context = { ...(input.context ?? {}), date: input.date }
  const base = scoreCandidateSlot({ candidate: input.slot, busy: input.busy, window: scoringStudyWindowFor(input.date), context })
  const urgent = context.daysUntilExam != null && context.daysUntilExam <= 7
  const datePenalty = (input.dateIndex ?? 0) * (urgent ? 3 : 1)
  return {
    score: Math.round((base.score - datePenalty) * 100) / 100,
    reasons: datePenalty ? [...base.reasons, 'date_distance_penalty'] : base.reasons,
  }
}
