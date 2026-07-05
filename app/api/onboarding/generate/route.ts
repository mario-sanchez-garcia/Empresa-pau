import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

const VALID_START_MODES = ['zero', 'first_block', 'mid', 'review', 'unknown'] as const
type StartMode = typeof VALID_START_MODES[number]

// Private beta scope: Camino PAU is active only for Matemáticas II and Matemáticas CCSS.
const ALLOWED_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss'])

const HOLIDAYS = new Set([
  '2026-10-12', '2026-11-01', '2026-11-02',
  '2026-12-06', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-01-06', '2027-04-01',
  '2027-04-02', '2027-04-03', '2027-04-04',
  '2027-04-17', '2027-04-18', '2027-06-07',
])

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function isStudyDay(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow !== 0 && dow !== 6 && !HOLIDAYS.has(dateStr)
}

function getStudyDays(startDate: string, n: number): string[] {
  const days: string[] = []
  let current = startDate
  while (days.length < n) {
    if (isStudyDay(current)) days.push(current)
    current = addDays(current, 1)
  }
  return days
}

// Private beta scheduler: alternate only between supported math tracks.
function subjectForDay(dateStr: string, subjects: string[]): string | null {
  if (subjects.length === 1) return subjects[0]
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  if (dow === 1 || dow === 2) {
    return subjects.includes('matematicas_ii') ? 'matematicas_ii' : subjects[0]
  }
  if (dow === 3 || dow === 4 || dow === 5) {
    return subjects.includes('matematicas_ccss') ? 'matematicas_ccss' : subjects[subjects.length - 1]
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    // ── Validate input ──────────────────────────────────────────────────────
    const subjects = Array.isArray(body.subjects)
      ? body.subjects.filter((s): s is string => typeof s === 'string' && ALLOWED_SUBJECTS.has(s))
      : []
    if (subjects.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos una asignatura válida' }, { status: 400 })
    }

    const startMode: StartMode = VALID_START_MODES.includes(body.startMode as StartMode)
      ? (body.startMode as StartMode) : 'zero'

    const db = createServiceClient()

    // ── PASO 4: Idempotency — already scheduled ─────────────────────────────
    const { count: scheduledCount } = await db
      .from('user_learning_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('subject', subjects)
      .eq('queue_status', 'scheduled')

    if (scheduledCount && scheduledCount > 0) {
      const todayIdempotent = getMadridToday()
      const { data: firstCal } = await db
        .from('camino_calendar')
        .select('title, subject, scheduled_date')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('scheduled_date', todayIdempotent)
        .order('scheduled_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      return NextResponse.json({
        success: true,
        daysGenerated: scheduledCount,
        firstMission: firstCal ?? null,
      })
    }

    // ── PASO 2: user_learning_queue ─────────────────────────────────────────
    // Check per subject — only insert for subjects that have no queue yet
    const { data: existingQueueCheck } = await db
      .from('user_learning_queue')
      .select('subject')
      .eq('user_id', user.id)
      .in('subject', subjects)

    const subjectsWithQueue = new Set((existingQueueCheck ?? []).map(r => r.subject))
    const subjectsToQueue = subjects.filter(s => !subjectsWithQueue.has(s))

    if (subjectsToQueue.length > 0) {
      const { data: flashcards } = await db
        .from('curriculum_content_v2')
        .select('sort_order, title, block_key, block_slug, subject')
        .in('subject', subjectsToQueue)
        .order('subject', { ascending: true })
        .order('sort_order', { ascending: true })

      if (flashcards && flashcards.length > 0) {
        const bySubject: Record<string, typeof flashcards> = {}
        for (const fc of flashcards) {
          if (!bySubject[fc.subject]) bySubject[fc.subject] = []
          bySubject[fc.subject].push(fc)
        }

        const queueRows = []
        for (const subject of subjectsToQueue) {
          const items = bySubject[subject] ?? []

          // First 2 unique block_keys per subject (for 'mid' startMode)
          let earlyBlocks = new Set<string>()
          if (startMode === 'mid') {
            const uniqueBlocks = [...new Set(items.map(i => i.block_key))]
            earlyBlocks = new Set(uniqueBlocks.slice(0, 2))
          }

          for (let i = 0; i < items.length; i++) {
            const fc = items[i]
            let metadata: Record<string, unknown>
            if (startMode === 'review') {
              metadata = { mission_type: 'review' }
            } else if (startMode === 'mid') {
              metadata = earlyBlocks.has(fc.block_key)
                ? { mission_type: 'review', express: true }
                : { mission_type: 'concept' }
            } else {
              // zero, first_block, unknown
              metadata = { mission_type: 'concept' }
            }
            queueRows.push({
              user_id: user.id,
              subject: fc.subject,
              block_key: fc.block_key,
              block_slug: fc.block_slug,
              v2_sort_order: fc.sort_order,
              title: fc.title,
              subject_position: i + 1,
              queue_status: 'pending',
              metadata,
            })
          }
        }

        // Batch insert in chunks of 100
        for (let i = 0; i < queueRows.length; i += 100) {
          const { error } = await db.from('user_learning_queue').insert(queueRows.slice(i, i + 100))
          if (error) throw new Error(`Queue insert error: ${error.message}`)
        }
      }
    }

    // ── PASO 3: camino_calendar (14 días hábiles) ───────────────────────────
    const today = getMadridToday()
    const studyDays = getStudyDays(today, 14)

    // Find existing calendar entries in the range
    const { data: existingCal } = await db
      .from('camino_calendar')
      .select('scheduled_date, locked')
      .eq('user_id', user.id)
      .gte('scheduled_date', studyDays[0])
      .lte('scheduled_date', studyDays[studyDays.length - 1])

    const lockedDates = new Set((existingCal ?? []).filter(r => r.locked).map(r => r.scheduled_date))
    const takenDates = new Set((existingCal ?? []).map(r => r.scheduled_date))

    // Load pending queue items per subject (ordered by subject_position)
    const { data: queueItems } = await db
      .from('user_learning_queue')
      .select('id, subject, v2_sort_order, title, block_key, block_slug, metadata')
      .eq('user_id', user.id)
      .eq('queue_status', 'pending')
      .in('subject', subjects)
      .order('subject', { ascending: true })
      .order('subject_position', { ascending: true })

    const subjectQueues: Record<string, NonNullable<typeof queueItems>> = {}
    for (const item of (queueItems ?? [])) {
      if (!subjectQueues[item.subject]) subjectQueues[item.subject] = []
      subjectQueues[item.subject].push(item)
    }
    const cursors: Record<string, number> = Object.fromEntries(subjects.map(s => [s, 0]))

    // 'review' startMode fills calendar more aggressively (2 missions/day)
    const slotsPerDay = startMode === 'review' ? 2 : 1

    const calRows: object[] = []
    const scheduledQueueIds: string[] = []
    const now = new Date().toISOString()

    for (const dateStr of studyDays) {
      if (lockedDates.has(dateStr) || takenDates.has(dateStr)) continue

      const subject = subjectForDay(dateStr, subjects)
      if (!subject) continue

      for (let slot = 0; slot < slotsPerDay; slot++) {
        const queue = subjectQueues[subject] ?? []
        const cursor = cursors[subject] ?? 0
        if (cursor >= queue.length) break

        const item = queue[cursor]
        cursors[subject] = cursor + 1

        const itemMeta = (item.metadata as Record<string, unknown> | null) ?? {}
        const missionType = (itemMeta.mission_type as string) ?? 'concept'
        const calMetadata = itemMeta.express ? { express: true } : {}

        calRows.push({
          user_id: user.id,
          scheduled_date: dateStr,
          subject: item.subject,
          v2_sort_order: item.v2_sort_order,
          title: item.title,
          block_key: item.block_key,
          block_slug: item.block_slug,
          mission_type: missionType,
          is_main: true,
          is_bonus: false,
          status: 'pending',
          source: 'algorithm',
          generated_by: 'algorithm_v1',
          queue_id: item.id,
          metadata: calMetadata,
        })
        scheduledQueueIds.push(item.id)
      }
    }

    if (calRows.length > 0) {
      const { error } = await db.from('camino_calendar').insert(calRows)
      if (error) throw new Error(`Calendar insert error: ${error.message}`)
    }

    if (scheduledQueueIds.length > 0) {
      const { error } = await db
        .from('user_learning_queue')
        .update({ queue_status: 'scheduled', scheduled_at: now })
        .in('id', scheduledQueueIds)
      if (error) throw new Error(`Queue update error: ${error.message}`)
    }

    // ── PASO 4: Response ────────────────────────────────────────────────────
    const first = calRows[0] as { title: string; subject: string; scheduled_date: string } | undefined
    return NextResponse.json({
      success: true,
      daysGenerated: calRows.length,
      firstMission: first ? {
        title: first.title,
        subject: first.subject,
        scheduled_date: first.scheduled_date,
      } : null,
    })
  } catch (err) {
    console.error('[onboarding/generate]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
