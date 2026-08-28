import 'server-only'

import { type SupabaseClient } from '@supabase/supabase-js'

import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, sanitizeLessonTitle } from './caminoCurriculumPlan'
import { getWeakAreas, type WeakArea } from './caminoWeakAreasServer'
import { createDayScheduler, estimatedMinutesForMissionType, DayScheduler } from './scheduleTimeSlot'
import { addDays, getMadridToday, getStudyDays } from './studyDays'

const WEAK_REVIEW_VERSION = 'weak_review_v1'
const HORIZON_DAYS = 14
const MAX_REVIEW_MISSIONS = 2
const REVIEW_RATIO = 5

type CalendarRow = {
  id: string
  scheduled_date: string
  subject: string
  v2_sort_order: number | null
  status: string
  mission_type: string | null
  is_main: boolean | null
  metadata: Record<string, unknown> | null
}

function metadataObject(value: Record<string, unknown> | null | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function reviewKey(subject: string, blockSlug: string, sortOrder: number) {
  return `${normalizeSubjectSlug(subject)}:${normalizeTopicSlug(blockSlug)}:${sortOrder}`
}

function weakBlockMatches(area: WeakArea, blockSlug: string, blockTitle: string) {
  const weakValues = [area.blockSlug, area.label].map(normalizeTopicSlug).filter(Boolean)
  const topicValues = [blockSlug, blockTitle].map(normalizeTopicSlug).filter(Boolean)
  return weakValues.some(weak =>
    topicValues.some(topic =>
      weak === topic || weak.includes(topic) || topic.includes(weak)
    )
  )
}

function findReviewTopic(area: WeakArea, futureTopicKeys: Set<string>, existingReviewKeys: Set<string>, completedTopicKeys: Set<string>) {
  const subject = normalizeSubjectSlug(area.subjectKey)
  const matchingTopics = CAMINO_CURRICULUM_TOPICS
    .filter(topic => topic.subject === subject)
    .filter(topic => weakBlockMatches(area, topic.blockSlug, topic.blockTitle))
    .sort((a, b) => (a.v2SortOrder ?? a.orderIndex) - (b.v2SortOrder ?? b.orderIndex))

  if (matchingTopics.length === 0) return { topic: null, mappingMissed: true }

  const topic = matchingTopics.find(candidate => {
    const sortOrder = candidate.v2SortOrder ?? candidate.orderIndex
    const topicKey = `${subject}:${sortOrder}`
    const key = reviewKey(subject, candidate.blockSlug, sortOrder)
    // completedTopicKeys: este tema concreto ya se dio como misión normal
    // (en cualquier día, pasado o de hoy) — repasarlo vía "review" duplicaría
    // esa misión como si nunca se hubiera hecho. El único camino para
    // repasar contenido ya completado es a través de los cursos en La Zona,
    // no repitiendo la misión diaria.
    return !futureTopicKeys.has(topicKey) && !existingReviewKeys.has(key) && !completedTopicKeys.has(topicKey)
  })

  return { topic: topic ?? null, mappingMissed: false }
}

function pickDateForReview(candidateDates: string[], countByDate: Map<string, number>) {
  for (const date of candidateDates) {
    const count = countByDate.get(date) ?? 0
    if (count < 2) {
      countByDate.set(date, count + 1)
      return date
    }
  }
  return candidateDates[0] ?? null
}

export async function injectWeakReviewMissions(
  userId: string,
  supabase: SupabaseClient,
): Promise<{ inserted: number; mappingMisses: number }> {
  try {
    const weakAreas = await getWeakAreas(supabase, userId)
    if (weakAreas.length === 0) return { inserted: 0, mappingMisses: 0 }

    const today = getMadridToday()
    const horizon = addDays(today, HORIZON_DAYS)
    const { data, error } = await supabase
      .from('camino_calendar')
      .select('id, scheduled_date, subject, v2_sort_order, status, mission_type, is_main, metadata')
      .eq('user_id', userId)
      .gte('scheduled_date', today)
      .lte('scheduled_date', horizon)
      .in('status', ['pending', 'postponed'])

    if (error) throw new Error(`Calendar weak review read error: ${error.message}`)

    const futureRows = (data ?? []) as CalendarRow[]
    const existingReviewRows = futureRows.filter(row => metadataObject(row.metadata).weak_review === true)
    const nonReviewMainCount = futureRows.filter(row => row.is_main !== false && metadataObject(row.metadata).weak_review !== true).length
    const desiredReviews = Math.min(
      MAX_REVIEW_MISSIONS,
      Math.max(1, Math.floor(nonReviewMainCount / REVIEW_RATIO)),
    )
    const remainingSlots = Math.max(0, desiredReviews - existingReviewRows.length)
    if (remainingSlots === 0) return { inserted: 0, mappingMisses: 0 }

    const futureTopicKeys = new Set(
      futureRows
        .filter(row => row.v2_sort_order != null)
        .map(row => `${normalizeSubjectSlug(row.subject)}:${row.v2_sort_order}`),
    )

    // Un tema ya completado (cualquier fecha, pasada o de hoy) nunca debe
    // volver a programarse como misión de repaso — solo se consulta para las
    // asignaturas con áreas débiles, así el read se queda acotado.
    const weakSubjects = [...new Set(weakAreas.map(area => normalizeSubjectSlug(area.subjectKey)))]
    const { data: completedRows, error: completedError } = await supabase
      .from('camino_calendar')
      .select('subject, v2_sort_order')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('subject', weakSubjects)
      .not('v2_sort_order', 'is', null)
      .limit(1000)
    if (completedError) throw new Error(`Calendar weak review completed-read error: ${completedError.message}`)
    const completedTopicKeys = new Set(
      (completedRows ?? []).map(row => `${normalizeSubjectSlug(row.subject as string)}:${row.v2_sort_order}`),
    )
    const existingReviewKeys = new Set(
      existingReviewRows
        .map(row => metadataObject(row.metadata).weak_review_key)
        .filter((value): value is string => typeof value === 'string'),
    )
    const countByDate = new Map<string, number>()
    for (const row of futureRows) {
      if (row.is_main === false) continue
      countByDate.set(row.scheduled_date, (countByDate.get(row.scheduled_date) ?? 0) + 1)
    }

    const candidateDates = getStudyDays(today, HORIZON_DAYS * 2)
    const rowsToInsert: object[] = []
    let mappingMisses = 0
    // Un scheduler por fecha candidata, creado bajo demanda y reutilizado si
    // pickDateForReview elige el mismo día dos veces (hasta 2 repasos/día) —
    // así la segunda misión de repaso del mismo día no se pisa con la primera.
    const dayScheduler = new Map<string, DayScheduler>()
    async function schedulerFor(dateStr: string): Promise<DayScheduler> {
      const existing = dayScheduler.get(dateStr)
      if (existing) return existing
      const created = await createDayScheduler(userId, supabase, dateStr)
      dayScheduler.set(dateStr, created)
      return created
    }

    for (const area of weakAreas) {
      if (rowsToInsert.length >= remainingSlots) break
      const { topic, mappingMissed } = findReviewTopic(area, futureTopicKeys, existingReviewKeys, completedTopicKeys)
      if (mappingMissed) {
        mappingMisses += 1
        await recordBetaMetric(supabase, userId, 'weak_review_mapping_missed', {
          subject: normalizeSubjectSlug(area.subjectKey),
          weak_block: area.label,
          weak_block_slug: area.blockSlug,
          avg_score: area.avgScore,
          attempts: area.attempts,
        })
        continue
      }
      if (!topic) continue

      const sortOrder = topic.v2SortOrder ?? topic.orderIndex

      // Un día candidato sin hueco real en la agenda propia del alumno
      // (cole/extraescolares) no debe forzar el repaso ahí — se prueba el
      // siguiente candidato en vez de quedarse sin hora en un día completo.
      let scheduledDate: string | null = null
      let timeSlot: { start: string; end: string } | null = null
      const attemptedDates = new Set<string>()
      for (let attempt = 0; attempt < candidateDates.length; attempt += 1) {
        const candidate = pickDateForReview(candidateDates, countByDate)
        if (!candidate || attemptedDates.has(candidate)) break
        attemptedDates.add(candidate)
        const scheduler = await schedulerFor(candidate)
        const slot = scheduler.placeBest(estimatedMinutesForMissionType('review'), {
          date: candidate,
          subject: normalizeSubjectSlug(topic.subject),
          missionType: 'review',
        })
        if (slot) { scheduledDate = candidate; timeSlot = slot; break }
      }
      if (!scheduledDate || !timeSlot) continue

      const subject = normalizeSubjectSlug(topic.subject)
      const key = reviewKey(subject, topic.blockSlug, sortOrder)
      futureTopicKeys.add(`${subject}:${sortOrder}`)
      existingReviewKeys.add(key)

      rowsToInsert.push({
        user_id: userId,
        scheduled_date: scheduledDate,
        subject,
        v2_sort_order: sortOrder,
        title: `Repaso: ${sanitizeLessonTitle(topic.title)}`,
        block_key: topic.blockTitle,
        block_slug: topic.blockSlug,
        mission_type: 'review',
        is_main: true,
        is_bonus: false,
        status: 'pending',
        source: 'algorithm',
        generated_by: WEAK_REVIEW_VERSION,
        start_time: timeSlot.start,
        end_time: timeSlot.end,
        queue_id: null,
        metadata: {
          topic_slug: topic.topicSlug,
          weak_review: true,
          weak_review_key: key,
          weak_area_label: area.label,
          weak_area_avg_score: area.avgScore,
          weak_area_attempts: area.attempts,
          weak_review_version: WEAK_REVIEW_VERSION,
          reason: `Repaso recomendado porque tu media reciente en ${area.label} está en ${area.avgScore}%.`,
        },
      })
    }

    if (rowsToInsert.length === 0) return { inserted: 0, mappingMisses }

    const { error: insertError } = await supabase
      .from('camino_calendar')
      .upsert(rowsToInsert, {
        onConflict: 'user_id,scheduled_date,subject,v2_sort_order',
        ignoreDuplicates: true,
      })
    if (insertError) throw new Error(`Weak review insert error: ${insertError.message}`)

    await recordBetaMetric(supabase, userId, 'weak_review_injected', {
      count: rowsToInsert.length,
      max_review_missions: MAX_REVIEW_MISSIONS,
      horizon_days: HORIZON_DAYS,
    })

    return { inserted: rowsToInsert.length, mappingMisses }
  } catch (error) {
    console.warn('[camino/weak-review] skipped:', error)
    return { inserted: 0, mappingMisses: 0 }
  }
}
