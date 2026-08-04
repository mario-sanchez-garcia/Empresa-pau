import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { PRIVATE_BETA_CURRICULUM_TOPICS, isPrivateBetaSubject } from '@/app/lib/camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from '@/app/lib/camino/caminoCurriculumPlan'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { injectAllPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { getMadridToday, getStudyDays } from '@/app/lib/camino/studyDays'
import { sendWelcomeEmail } from '@/app/lib/email/sendWelcomeEmail'
import { generateUnsubscribeToken } from '@/app/lib/unsubscribeToken'

export const dynamic = 'force-dynamic'

const VALID_START_MODES = ['zero', 'first_block', 'mid', 'review', 'unknown'] as const
type StartMode = typeof VALID_START_MODES[number]

// Private beta scope: Camino PAU is active only for the four core PAU subjects.
const ALLOWED_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana'])

function subjectForDay(dateStr: string, subjects: string[]): string | null {
  if (subjects.length === 1) return subjects[0]
  const ordered = ['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana']
    .filter(subject => subjects.includes(subject))
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  if (dow === 0 || dow === 6) return null
  return ordered[(dow - 1) % ordered.length] ?? subjects[0]
}

type QueueSourceItem = {
  sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
  subject: string
  topic_slug?: string | null
}

function queueTopicMeta(item: QueueSourceItem) {
  const subject = normalizeSubjectSlug(item.subject)
  const topic = CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    (candidate.v2SortOrder === item.sort_order || candidate.orderIndex === item.sort_order)
  ) ?? CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    normalizeTopicSlug(candidate.title) === normalizeTopicSlug(item.title)
  )
  const blockSlug = item.block_slug ?? topic?.blockSlug ?? null
  const rawTopicSlug = item.topic_slug ?? topic?.topicSlug ?? normalizeTopicSlug(item.title)
  return {
    blockSlug,
    topicSlug: blockSlug ? resolveTopicSlugAlias(subject, blockSlug, rawTopicSlug) : normalizeTopicSlug(rawTopicSlug),
  }
}

function betaSequenceItems(subject: string): QueueSourceItem[] {
  const normalized = normalizeSubjectSlug(subject)
  if (!isPrivateBetaSubject(normalized)) return []
  return PRIVATE_BETA_CURRICULUM_TOPICS
    .filter(topic => topic.subject === normalized)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(topic => ({
      sort_order: topic.orderIndex,
      title: topic.title,
      block_key: topic.blockTitle,
      block_slug: topic.blockSlug,
      subject: topic.subject,
      topic_slug: topic.topicSlug,
    }))
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
      ? [...new Set(body.subjects
        .filter((s): s is string => typeof s === 'string')
        .map(s => normalizeSubjectSlug(s))
        .filter(subject => ALLOWED_SUBJECTS.has(subject)))]
      : []
    if (subjects.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos una asignatura válida' }, { status: 400 })
    }

    const startMode: StartMode = VALID_START_MODES.includes(body.startMode as StartMode)
      ? (body.startMode as StartMode) : 'zero'

    const db = createServiceClient()
    const requestedStudentExams = cleanStudentExams(body.studentExams)

    async function loadStudentExams() {
      if (requestedStudentExams.length > 0) return requestedStudentExams
      const { data: profile } = await db
        .from('perfiles')
        .select('student_exams')
        .eq('id', user.id)
        .maybeSingle()
      return cleanStudentExams(profile?.student_exams)
    }

    async function injectOnboardingPartials() {
      const studentExams = await loadStudentExams()
      if (studentExams.length === 0) return
      await injectAllPartialExamMissions(user.id, db, studentExams)
    }

    // ── Reset: wipe old plan so subjects chosen in onboarding take effect ───
    // Keep completed calendar rows (user history). Wipe pending future plan
    // and the full queue so they get rebuilt with the correct subjects below.
    const resetToday = getMadridToday()
    await Promise.all([
      db.from('user_learning_queue').delete().eq('user_id', user.id),
      db.from('camino_calendar').delete().eq('user_id', user.id).neq('status', 'completed').gte('scheduled_date', resetToday),
    ])

    // ── PASO 2: user_learning_queue ─────────────────────────────────────────
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

      const bySubject: Record<string, QueueSourceItem[]> = {}
      for (const fc of (flashcards ?? [])) {
        if (isPrivateBetaSubject(fc.subject)) {
          if (!bySubject[fc.subject]) bySubject[fc.subject] = []
          bySubject[fc.subject].push(fc as QueueSourceItem)
        }
      }
      for (const subject of subjectsToQueue) {
        if (!bySubject[subject]?.length) bySubject[subject] = betaSequenceItems(subject)
      }

      const queueRows = []
      for (const subject of subjectsToQueue) {
        const items = bySubject[subject] ?? []

        // First 2 unique block_keys per subject (for 'mid' startMode)
        let earlyBlocks = new Set<string | null>()
        if (startMode === 'mid') {
          const uniqueBlocks = [...new Set(items.map(i => i.block_key))]
          earlyBlocks = new Set(uniqueBlocks.slice(0, 2))
        }

        for (let i = 0; i < items.length; i++) {
          const fc = items[i]
          const topicMeta = queueTopicMeta(fc)
          let metadata: Record<string, unknown>
          if (startMode === 'review') {
            metadata = { mission_type: 'review', topic_slug: topicMeta.topicSlug }
          } else if (startMode === 'mid') {
            metadata = earlyBlocks.has(fc.block_key)
              ? { mission_type: 'review', express: true, topic_slug: topicMeta.topicSlug }
              : { mission_type: 'concept', topic_slug: topicMeta.topicSlug }
          } else {
            // zero, first_block, unknown
            metadata = { mission_type: 'concept', beta_sequence: true, topic_slug: topicMeta.topicSlug }
          }
          queueRows.push({
            user_id: user.id,
            subject: fc.subject,
            block_key: fc.block_key,
            block_slug: topicMeta.blockSlug,
            v2_sort_order: fc.sort_order,
            title: sanitizeLessonTitle(fc.title),
            subject_position: i + 1,
            queue_status: 'pending',
            metadata,
          })
        }
      }

      if (queueRows.length > 0) {
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
        const topicMeta = queueTopicMeta({
          sort_order: item.v2_sort_order,
          title: item.title,
          block_key: item.block_key,
          block_slug: item.block_slug,
          subject: item.subject,
          topic_slug: typeof itemMeta.topic_slug === 'string' ? itemMeta.topic_slug : null,
        })
        const missionType = (itemMeta.mission_type as string) ?? 'concept'
        const calMetadata = itemMeta.express ? { express: true, topic_slug: topicMeta.topicSlug } : { topic_slug: topicMeta.topicSlug }

        calRows.push({
          user_id: user.id,
          scheduled_date: dateStr,
          subject: item.subject,
          v2_sort_order: item.v2_sort_order,
          title: sanitizeLessonTitle(item.title),
          block_key: item.block_key,
          block_slug: topicMeta.blockSlug,
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

    await injectOnboardingPartials()
    await applyCalendarPersonalization(user.id, db)

    // ── PASO 4: Response ────────────────────────────────────────────────────
    const first = calRows[0] as { title: string; subject: string; scheduled_date: string } | undefined

    // Email de bienvenida — fail-safe, nunca bloquea el onboarding
    try {
      const userEmail = user.email
      if (userEmail) {
        await sendWelcomeEmail({
          userId: user.id,
          userEmail,
          userName: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'estudiante',
          missionCount: calRows.length,
          firstSubject: first?.title ?? first?.subject ?? 'tu primera asignatura',
          unsubscribeToken: generateUnsubscribeToken(user.id),
        })
      }
    } catch (err) {
      console.error('[onboarding] welcome email failed silently:', err)
    }

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
