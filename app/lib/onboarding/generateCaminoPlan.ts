import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PRIVATE_BETA_CURRICULUM_TOPICS, isPrivateBetaSubject } from '@/app/lib/camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, getTopic, getTopicByV2SortOrder, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from '@/app/lib/camino/caminoCurriculumPlan'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { missionsPerDayForMinutes } from '@/app/lib/camino/dailyTimeCapacity'
import { injectAllPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'
import { cleanStudentExams, type StudentExam } from '@/app/lib/camino/cleanStudentExams'
import { getMadridToday, getStudyDays } from '@/app/lib/camino/studyDays'
import { sendWelcomeEmail } from '@/app/lib/email/sendWelcomeEmail'
import { generateUnsubscribeToken } from '@/app/lib/unsubscribeToken'

// Extracción literal del cuerpo de /api/onboarding/generate (Fase 0/1): la
// misma construcción de user_learning_queue + camino_calendar, reutilizada
// tal cual por el endpoint legacy y por el finalizer de Fase 2
// (/api/onboarding/finalize). NO reescribe el algoritmo — solo lo saca de la
// route handler para poder llamarlo desde dos sitios sin duplicar lógica.

export const VALID_START_MODES = ['zero', 'first_block', 'mid', 'review', 'unknown'] as const
export type StartMode = typeof VALID_START_MODES[number]

// Private beta scope: Camino PAU is active only for these core PAU subjects.
export const ALLOWED_GENERATE_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana', 'fisica'])

function subjectForDay(dateStr: string, subjects: string[]): string | null {
  if (subjects.length === 1) return subjects[0]
  const ordered = ['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana', 'fisica']
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

export interface GenerateCaminoPlanParams {
  userId: string
  db: SupabaseClient
  subjects: string[]
  startMode: StartMode
  studentExams: unknown
  dailyMinutes: number | null
  userEmail?: string | null
  userFullName?: string | null
}

export interface GenerateCaminoPlanMission {
  title: string
  subject: string
  scheduled_date: string
  missionType: string
  supportsStepCorrection: boolean
}

export type GenerateCaminoPlanResult =
  | { success: true; daysGenerated: number; firstMission: GenerateCaminoPlanMission | null; missions: GenerateCaminoPlanMission[] }
  | { success: false; errorCode: 'queue_insert_failed' | 'calendar_insert_failed' | 'queue_update_failed' | 'internal_error' }

export async function generateCaminoPlan(params: GenerateCaminoPlanParams): Promise<GenerateCaminoPlanResult> {
  const { userId, db, startMode, dailyMinutes } = params
  const subjects = [...new Set(params.subjects.map(s => normalizeSubjectSlug(s)).filter(s => ALLOWED_GENERATE_SUBJECTS.has(s)))]

  try {
    const requestedStudentExams: StudentExam[] = cleanStudentExams(params.studentExams)

    async function loadStudentExams() {
      if (requestedStudentExams.length > 0) return requestedStudentExams
      const { data: profile } = await db
        .from('perfiles')
        .select('student_exams')
        .eq('id', userId)
        .maybeSingle()
      return cleanStudentExams(profile?.student_exams)
    }

    async function injectOnboardingPartials() {
      const studentExams = await loadStudentExams()
      if (studentExams.length === 0) return
      await injectAllPartialExamMissions(userId, db, studentExams)
    }

    // ── Reset: wipe old plan so subjects chosen in onboarding take effect ───
    const resetToday = getMadridToday()
    await Promise.all([
      db.from('user_learning_queue').delete().eq('user_id', userId),
      db.from('camino_calendar').delete().eq('user_id', userId).neq('status', 'completed').gte('scheduled_date', resetToday),
    ])

    // ── PASO 2: user_learning_queue ─────────────────────────────────────────
    const { data: existingQueueCheck } = await db
      .from('user_learning_queue')
      .select('subject')
      .eq('user_id', userId)
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
            metadata = { mission_type: 'concept', beta_sequence: true, topic_slug: topicMeta.topicSlug }
          }
          queueRows.push({
            user_id: userId,
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
        for (let i = 0; i < queueRows.length; i += 100) {
          const { error } = await db.from('user_learning_queue').insert(queueRows.slice(i, i + 100))
          if (error) throw new Error(`Queue insert error: ${error.message}`)
        }
      }
    }

    // ── PASO 3: camino_calendar (14 días hábiles) ───────────────────────────
    const today = getMadridToday()
    const studyDays = getStudyDays(today, 14)

    const { data: existingCal } = await db
      .from('camino_calendar')
      .select('scheduled_date, locked')
      .eq('user_id', userId)
      .gte('scheduled_date', studyDays[0])
      .lte('scheduled_date', studyDays[studyDays.length - 1])

    const lockedDates = new Set((existingCal ?? []).filter(r => r.locked).map(r => r.scheduled_date))
    const takenDates = new Set((existingCal ?? []).map(r => r.scheduled_date))

    const { data: queueItems } = await db
      .from('user_learning_queue')
      .select('id, subject, v2_sort_order, title, block_key, block_slug, metadata')
      .eq('user_id', userId)
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

    const slotsPerDay = Math.max(startMode === 'review' ? 2 : 1, missionsPerDayForMinutes(dailyMinutes))

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
          user_id: userId,
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
    await applyCalendarPersonalization(userId, db)

    // ── PASO 4: leer el calendario REAL server-side ─────────────────────────
    // No confiar en calRows[0]: en un reintento idempotente (draft ya
    // procesado parcialmente) calRows puede llegar vacío porque las fechas ya
    // estaban ocupadas, y aun así el usuario SÍ tiene un Camino real que
    // devolver. Se relee camino_calendar para que la respuesta sea correcta
    // tanto en la primera ejecución como en un retry.
    const { data: realMissions } = await db
      .from('camino_calendar')
      .select('title, subject, scheduled_date, mission_type, v2_sort_order, block_slug, metadata, created_at')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(3)

    // Auditoría Fase 1: mission_type ('concept'/'review'/...) NO determina si
    // una misión admite corrección paso a paso — lo hace únicamente si su
    // tema resuelve en CAMINO_CURRICULUM_TOPICS, exactamente la misma
    // comprobación que hace /api/camino/correct (getTopicByV2SortOrder /
    // getTopic). Nunca se infiere del mission_type.
    const missions: GenerateCaminoPlanMission[] = (realMissions ?? []).map(row => {
      const meta = row.metadata as { topic_slug?: string | null } | null
      const topic = getTopicByV2SortOrder(row.subject, row.v2_sort_order)
        ?? (row.block_slug && meta?.topic_slug ? getTopic(row.subject, row.block_slug, meta.topic_slug) : null)
      return {
        title: row.title,
        subject: row.subject,
        scheduled_date: row.scheduled_date,
        missionType: row.mission_type,
        supportsStepCorrection: Boolean(topic),
      }
    })

    // Email de bienvenida — fail-safe, nunca bloquea el onboarding. Solo se
    // envía cuando esta ejecución insertó misiones de verdad (calRows.length
    // > 0): en un retry sobre un draft ya generado, calRows llega vacío y no
    // hay que reenviar el correo.
    if (calRows.length > 0) {
      try {
        if (params.userEmail) {
          await sendWelcomeEmail({
            userId,
            userEmail: params.userEmail,
            userName: params.userFullName ?? params.userEmail.split('@')[0] ?? 'estudiante',
            missionCount: calRows.length,
            firstSubject: missions[0]?.title ?? missions[0]?.subject ?? 'tu primera asignatura',
            unsubscribeToken: generateUnsubscribeToken(userId),
          })
        }
      } catch (err) {
        console.error('[generateCaminoPlan] welcome email failed silently:', err)
      }
    }

    return { success: true, daysGenerated: calRows.length, firstMission: missions[0] ?? null, missions }
  } catch (err) {
    console.error('[generateCaminoPlan]', err)
    const message = err instanceof Error ? err.message : ''
    const errorCode = message.startsWith('Queue insert error') ? 'queue_insert_failed'
      : message.startsWith('Calendar insert error') ? 'calendar_insert_failed'
      : message.startsWith('Queue update error') ? 'queue_update_failed'
      : 'internal_error'
    return { success: false, errorCode }
  }
}
