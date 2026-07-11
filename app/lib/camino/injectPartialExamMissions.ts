import { type SupabaseClient } from '@supabase/supabase-js'

type PartialMissionType = 'conceptual_review' | 'evau_practice' | 'block_mock' | 'final_mini_mock'

const SUBJECT_SLUG: Record<string, string> = {
  'Matemáticas II': 'matematicas_ii',
  'Matemáticas CCSS': 'matematicas_ccss',
  'Historia de España': 'historia_espana',
  'Lengua Castellana': 'lengua',
  'Lengua Castellana y Literatura': 'lengua',
  'Física': 'fisica',
  'Química': 'quimica',
  'Biología': 'biologia',
  'Inglés': 'ingles',
}

const SIMULACRO_SUBJECT: Record<string, string> = {
  matematicas_ii: 'mates',
  matematicas_ccss: 'matematicas_ccss',
  historia_espana: 'historia',
  lengua: 'lengua',
  fisica: 'fisica',
  quimica: 'quimica',
  biologia: 'biologia',
  ingles: 'ingles',
}

const BLOCK_DISPLAY: Record<string, string> = {
  Algebra: 'Álgebra',
  Analisis: 'Análisis',
  Geometria: 'Geometría',
  Probabilidad: 'Probabilidad',
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

function missionSequence(count: number): PartialMissionType[] {
  if (count <= 0 || count > 10) return []
  if (count <= 2) return ['final_mini_mock']
  if (count <= 5) return ['evau_practice', 'block_mock', 'final_mini_mock']
  return ['conceptual_review', 'evau_practice', 'block_mock', 'evau_practice', 'final_mini_mock']
}

function missionTitle(type: PartialMissionType, blockDisplay: string, topic?: string): string {
  const ctx = topic ? `${blockDisplay} — ${topic}` : blockDisplay
  switch (type) {
    case 'conceptual_review': return `Repaso de conceptos: ${ctx}`
    case 'evau_practice':     return `Práctica EVAU: ${ctx}`
    case 'block_mock':        return `Mini-simulacro: ${ctx}`
    case 'final_mini_mock':   return `Simulacro final antes del parcial: ${ctx}`
  }
}

function toSlug(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function injectPartialExamMissions(
  userId: string,
  supabase: SupabaseClient,
  partialExam: { id: string; subject: string; date: string; block: string; topic?: string },
): Promise<void> {
  const today = madridToday()
  if (partialExam.date <= today) return

  // Idempotent: wipe any pending partial missions for this exam before re-inserting
  await supabase
    .from('camino_calendar')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'partial')
    .eq('status', 'pending')
    .filter('metadata->>partial_exam_id', 'eq', partialExam.id)

  const slots = weekdaysBefore(partialExam.date, shiftDate(today, 1))
  const daysUntilExam = slots.length
  const sequence = missionSequence(daysUntilExam)
  if (sequence.length === 0) return // > 10 days out: nothing to inject yet

  const subjectSlug = SUBJECT_SLUG[partialExam.subject] ?? partialExam.subject
  const simSubject = SIMULACRO_SUBJECT[subjectSlug] ?? subjectSlug
  const blockDisplay = BLOCK_DISPLAY[partialExam.block] ?? partialExam.block
  const blockSlug = toSlug(partialExam.block)
  const topic = partialExam.topic || undefined
  const now = new Date().toISOString()

  // Use the last N weekday slots (closest to the exam)
  const targetSlots = slots.slice(-sequence.length)

  for (let i = 0; i < sequence.length; i++) {
    const slot = targetSlots[i]
    const mType = sequence[i]
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
      metadata: {
        partial_exam_id: partialExam.id,
        partial_exam_date: partialExam.date,
        target_block_normalized: partialExam.block,
        target_block_display: blockDisplay,
        target_topic: topic ?? null,
        partial_mission_type: mType,
        days_until_exam: daysUntilExam,
        simulacro_block_filter: partialExam.block || null,
        simulacro_subject: simSubject,
      },
    })
  }
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
