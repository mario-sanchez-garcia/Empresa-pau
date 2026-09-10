import 'server-only'

import { type SupabaseClient } from '@supabase/supabase-js'

import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, sanitizeLessonTitle } from './caminoCurriculumPlan'
import { getWeakAreas, type WeakArea } from './caminoWeakAreasServer'
import { createDayScheduler, estimatedMinutesForMissionType, DayScheduler } from './scheduleTimeSlot'
import { addDays, getMadridToday } from './studyDays'
import { loadStudentPlanContext, planningDates } from './studentPlanContext'

const WEAK_REVIEW_VERSION = 'weak_review_v1'
const HORIZON_DAYS = 14
const MAX_REVIEW_MISSIONS = 2
const REVIEW_RATIO = 5
// Días que deben pasar desde que se completó un tema antes de que pueda
// volver a entrar como repaso.
//
// Antes, completar un tema lo excluía PARA SIEMPRE del repaso automático,
// aunque siguiera perteneciendo a un área débil: si el alumno hacía la
// lección y después suspendía ese bloque, el Camino no volvía a tocarlo
// nunca. Pero "completado" no es "dominado" — complete-mission marca la cola
// como completada sin ningún umbral de dominio. Un tema completado hace
// tiempo que sigue puntuando como área débil es exactamente el que hay que
// repasar; lo que había que evitar era repetir hoy lo que se hizo ayer.
const COMPLETED_REVIEW_COOLDOWN_DAYS = 21

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

function findReviewTopic(
  area: WeakArea,
  futureTopicKeys: Set<string>,
  existingReviewKeys: Set<string>,
  /** topicKey → fecha de la última finalización (YYYY-MM-DD). */
  completedTopicDates: Map<string, string>,
  cooldownCutoff: string,
) {
  const subject = normalizeSubjectSlug(area.subjectKey)
  const matchingTopics = CAMINO_CURRICULUM_TOPICS
    .filter(topic => topic.subject === subject)
    .filter(topic => weakBlockMatches(area, topic.blockSlug, topic.blockTitle))
    .sort((a, b) => (a.v2SortOrder ?? a.orderIndex) - (b.v2SortOrder ?? b.orderIndex))

  if (matchingTopics.length === 0) return { topic: null, isRetry: false, mappingMissed: true }

  const available = (candidate: typeof matchingTopics[number]) => {
    const sortOrder = candidate.v2SortOrder ?? candidate.orderIndex
    const topicKey = `${subject}:${sortOrder}`
    const key = reviewKey(subject, candidate.blockSlug, sortOrder)
    // Nunca se duplica algo ya programado por delante ni un repaso que ya existe.
    return !futureTopicKeys.has(topicKey) && !existingReviewKeys.has(key)
  }

  // 1ª vuelta: temas del área débil que aún no se han dado. Siguen teniendo
  // prioridad — contenido nunca visto pesa más que reforzar lo ya visto.
  const fresh = matchingTopics.find(candidate => {
    const sortOrder = candidate.v2SortOrder ?? candidate.orderIndex
    return available(candidate) && !completedTopicDates.has(`${subject}:${sortOrder}`)
  })
  if (fresh) return { topic: fresh, isRetry: false, mappingMissed: false }

  // 2ª vuelta: temas YA completados del área débil, siempre que la
  // finalización sea lo bastante antigua. Se prioriza el completado hace más
  // tiempo, que es el que más probablemente se ha olvidado.
  const stale = matchingTopics
    .filter(candidate => {
      const sortOrder = candidate.v2SortOrder ?? candidate.orderIndex
      const completedOn = completedTopicDates.get(`${subject}:${sortOrder}`)
      return available(candidate) && completedOn != null && completedOn <= cooldownCutoff
    })
    .sort((a, b) => {
      const da = completedTopicDates.get(`${subject}:${a.v2SortOrder ?? a.orderIndex}`) ?? ''
      const db = completedTopicDates.get(`${subject}:${b.v2SortOrder ?? b.orderIndex}`) ?? ''
      return da.localeCompare(db)
    })[0]

  if (stale) return { topic: stale, isRetry: true, mappingMissed: false }
  return { topic: null, isRetry: false, mappingMissed: false }
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
): Promise<{ inserted: number; mappingMisses: number; reason?: string }> {
  try {
    const weakAreas = await getWeakAreas(supabase, userId, { strict: true })
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

    // Historial de finalización de los temas de las asignaturas con áreas
    // débiles. Se conserva la FECHA, no solo el hecho de haberlo completado:
    // es lo que permite volver a repasar un tema olvidado pasado el cooldown
    // en vez de excluirlo para siempre.
    const weakSubjects = [...new Set(weakAreas.map(area => normalizeSubjectSlug(area.subjectKey)))]
    const { data: completedRows, error: completedError } = await supabase
      .from('camino_calendar')
      .select('subject, v2_sort_order, scheduled_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('subject', weakSubjects)
      .not('v2_sort_order', 'is', null)
      .limit(1000)
    if (completedError) throw new Error(`Calendar weak review completed-read error: ${completedError.message}`)
    const completedTopicDates = new Map<string, string>()
    for (const row of completedRows ?? []) {
      const key = `${normalizeSubjectSlug(row.subject as string)}:${row.v2_sort_order}`
      const date = row.scheduled_date as string
      const previous = completedTopicDates.get(key)
      // La finalización MÁS RECIENTE es la que manda para el cooldown.
      if (!previous || date > previous) completedTopicDates.set(key, date)
    }
    const cooldownCutoff = addDays(today, -COMPLETED_REVIEW_COOLDOWN_DAYS)
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

    // Días candidatos DEL ALUMNO: su patrón semanal, sus festivos y nunca
    // después de su fecha objetivo. `getStudyDays(today, HORIZON_DAYS * 2)`
    // devolvía días laborables sin más — a un alumno de dos días por semana le
    // proponía repasos los martes, y a dos semanas de la PAU seguía
    // proponiendo fechas posteriores al examen. Un repaso SÍ puede caer dentro
    // de la ventana de repaso final: es exactamente lo que va ahí.
    const planContext = await loadStudentPlanContext(userId, supabase, today)
    const candidateDates = planningDates(planContext, {
      limit: HORIZON_DAYS * 2,
      includeFinalReviewWindow: true,
    })
    if (candidateDates.length === 0) return { inserted: 0, mappingMisses: 0 }
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
      const { topic, isRetry, mappingMissed } = findReviewTopic(area, futureTopicKeys, existingReviewKeys, completedTopicDates, cooldownCutoff)
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
        // Un reintento tiene identidad propia en el título: el alumno debe ver
        // que no es la misma lección otra vez, sino una vuelta deliberada
        // sobre algo que las notas dicen que no quedó asentado.
        title: isRetry
          ? `Vuelta a repasar: ${sanitizeLessonTitle(topic.title)}`
          : `Repaso: ${sanitizeLessonTitle(topic.title)}`,
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
          /** true = el tema ya se había completado y vuelve por bajo rendimiento posterior (ver COMPLETED_REVIEW_COOLDOWN_DAYS). */
          weak_review_retry: isRetry,
          reason: isRetry
            ? `Ya diste este tema, pero tu media reciente en ${area.label} sigue en ${area.avgScore}%. Volvemos sobre él.`
            : `Repaso recomendado porque tu media reciente en ${area.label} está en ${area.avgScore}%.`,
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
    return { inserted: 0, mappingMisses: 0, reason: 'error' }
  }
}
