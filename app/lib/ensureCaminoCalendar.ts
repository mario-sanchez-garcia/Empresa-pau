import { type SupabaseClient } from '@supabase/supabase-js'

import { PRIVATE_BETA_SUBJECTS, isPrivateBetaSubject } from './camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from './camino/caminoCurriculumPlan'
import { cleanStudentExams } from './camino/cleanStudentExams'
import { estimatedMinutesForSlot, missionsPerDayForMinutes } from './camino/dailyTimeCapacity'
import { EXAM_SUBJECT_SLUG } from './camino/partialExamSubjects'
import { computeExamCoverage, reactivateQueueItems } from './camino/examCoverage'
import { injectAllPartialExamMissions } from './camino/injectPartialExamMissions'
import { resolveTopicIdentitiesBatch } from './camino/resolveTopicIdentity'
import { createDayScheduler, estimatedMinutesForMissionType } from './camino/scheduleTimeSlot'
import { SPAIN_HOLIDAYS } from './camino/spainHolidays'
import { addDays, countWorkingDays, getMadridToday, getStudyDays } from './camino/studyDays'

const EXAM_DATE = '2027-06-07'
// Cuántos días futuros (con misión pendiente/postpuesta) mantiene
// sembrados ensureCaminoCalendar en camino_calendar — todo lo que cae
// dentro de este horizonte es 100% servidor, idéntico en cualquier
// dispositivo. Más allá de esto, el cliente rellena una vista previa
// generada localmente (ver generateCalendar en CaminoCalendarClient.tsx)
// que SÍ puede divergir entre navegadores — subir este número reduce
// directamente cuánto del calendario que un alumno ve en sus primeras
// semanas depende de esa vista previa en vez del servidor. 30 días
// (~1 mes) cubre con margen la ventana de lanzamiento sin cambiar el
// resto de la lógica de programación (que ya escala con esta constante).
const CALENDAR_HORIZON = 30

function subjectForDay(dateStr: string, subjects: string[], examSubjectsToday?: string[]): string | null {
  if (subjects.length === 0) return null
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  if (dow === 0 || dow === 6) return null
  // A subject with an exam today takes priority over the plain weekday
  // rotation — otherwise the round-robin can land on an unrelated subject
  // (or even the subject that just had ITS OWN exam, per the day-of-week
  // rotation math) while a different subject's exam that same day goes
  // completely unaddressed.
  if (examSubjectsToday && examSubjectsToday.length > 0) {
    const examSubject = examSubjectsToday.find(s => subjects.includes(s))
    if (examSubject) return examSubject
  }
  if (subjects.length === 1) return subjects[0]
  const ordered = (PRIVATE_BETA_SUBJECTS as readonly string[]).filter(subject => subjects.includes(subject))
  return ordered[(dow - 1) % ordered.length] ?? subjects[0]
}


type QueueItem = {
  id: string
  subject: string
  v2_sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
  metadata: Record<string, unknown> | null
  retry_not_before: string | null
}

function queueTopicMeta(item: QueueItem) {
  const subject = normalizeSubjectSlug(item.subject)
  const fromMetadata = typeof item.metadata?.topic_slug === 'string' ? item.metadata.topic_slug : null
  const topic = CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    (candidate.v2SortOrder === item.v2_sort_order || candidate.orderIndex === item.v2_sort_order)
  ) ?? CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    normalizeTopicSlug(candidate.title) === normalizeTopicSlug(item.title)
  )
  const blockSlug = item.block_slug ?? topic?.blockSlug ?? null
  const rawTopicSlug = fromMetadata ?? topic?.topicSlug ?? normalizeTopicSlug(item.title)
  return {
    blockSlug,
    topicSlug: blockSlug ? resolveTopicSlugAlias(subject, blockSlug, rawTopicSlug) : normalizeTopicSlug(rawTopicSlug),
  }
}

// Returns a lower number = higher PAU priority
function rescuePriority(subject: string, sortOrder: number): number {
  if (subject === 'matematicas_ii') {
    if (sortOrder >= 35 && sortOrder <= 49) return 1 // Análisis
    if (sortOrder >= 50 && sortOrder <= 60) return 2 // Probabilidad
    if (sortOrder >= 1 && sortOrder <= 19) return 3  // Álgebra
    if (sortOrder >= 20 && sortOrder <= 34) return 4 // Geometría
    return 5
  }
  if (subject === 'historia_espana') {
    if (sortOrder >= 53 && sortOrder <= 79) return 1   // Siglo XIX y Restauración
    if (sortOrder >= 89 && sortOrder <= 106) return 2  // 2ª República y Guerra Civil
    if (sortOrder >= 107 && sortOrder <= 127) return 3 // Franquismo y Transición
    return 4 // Resto de bloques
  }
  return 10
}

function commentTextIntervalDays(today: string): number | null {
  if (today >= '2026-09-01' && today <= '2026-12-31') return 28
  if (today >= '2027-01-01' && today <= '2027-03-31') return 14
  if (today >= '2027-04-01' && today <= '2027-05-31') return 7
  return null
}

async function maybeInjectCommentText(
  userId: string,
  supabase: SupabaseClient,
  today: string,
): Promise<void> {
  const intervalDays = commentTextIntervalDays(today)
  if (intervalDays === null) return

  // Only for users who have historia_espana in their queue
  const { count: histCount } = await supabase
    .from('user_learning_queue')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('subject', 'historia_espana')
  if (!histCount) return

  // Skip if there's already a future comment_text scheduled
  const { data: futureRows } = await supabase
    .from('camino_calendar')
    .select('id')
    .eq('user_id', userId)
    .eq('mission_type', 'comment_text')
    .gte('scheduled_date', today)
    .limit(1)
  if (futureRows && futureRows.length > 0) return

  // Check interval since last past comment_text
  const { data: lastRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .eq('mission_type', 'comment_text')
    .lt('scheduled_date', today)
    .order('scheduled_date', { ascending: false })
    .limit(1)

  const lastDate: string | null = lastRows?.[0]?.scheduled_date ?? null
  if (lastDate) {
    const daysSinceLast = Math.floor(
      (new Date(today + 'T12:00:00Z').getTime() - new Date(lastDate + 'T12:00:00Z').getTime()) / 86400000,
    )
    if (daysSinceLast < intervalDays) return
  }

  // Get taken dates in the next 42 days to find a free slot
  const horizon = addDays(today, 42)
  const { data: existingDates } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .gte('scheduled_date', today)
    .lte('scheduled_date', horizon)
  const takenDates = new Set((existingDates ?? []).map(r => r.scheduled_date as string))

  // Candidatos: cada viernes libre del horizonte y, si está ocupado por otra
  // misión de Camino, su jueves. Se prueban en orden hasta encontrar uno con
  // hueco real en la agenda propia del alumno (cole/extraescolares) — un
  // viernes/jueves sin otra misión de Camino pero completo de eventos
  // propios no debe forzar esta misión ahí; se prueba el siguiente.
  const candidates: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = addDays(today, i)
    const dow = new Date(d + 'T12:00:00Z').getUTCDay()
    if (dow !== 5 || SPAIN_HOLIDAYS.has(d)) continue // only Fridays, non-holiday
    if (!takenDates.has(d)) candidates.push(d)
    else {
      const thu = addDays(d, -1)
      if (thu >= today && !SPAIN_HOLIDAYS.has(thu) && !takenDates.has(thu)) candidates.push(thu)
    }
  }
  if (candidates.length === 0) return

  let candidate: string | null = null
  let timeSlot: { start: string; end: string } | null = null
  for (const d of candidates) {
    const scheduler = await createDayScheduler(userId, supabase, d)
    const slot = scheduler.place(estimatedMinutesForMissionType('comment_text'))
    if (slot) { candidate = d; timeSlot = slot; break }
  }
  if (!candidate || !timeSlot) return

  await supabase.from('camino_calendar').upsert({
    user_id: userId,
    scheduled_date: candidate,
    subject: 'historia_espana',
    v2_sort_order: 128,
    title: 'Comentario de texto histórico',
    mission_type: 'comment_text',
    is_main: true,
    is_bonus: false,
    status: 'pending',
    source: 'algorithm',
    generated_by: 'algorithm_v1',
    start_time: timeSlot.start,
    end_time: timeSlot.end,
  }, { onConflict: 'user_id,scheduled_date,subject,v2_sort_order', ignoreDuplicates: true })
}

export async function ensureCaminoCalendar(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const today = getMadridToday()

  // PASO 1 — Marcar misiones pasadas pendientes (no bonus) como missed
  await supabase
    .from('camino_calendar')
    .update({ status: 'missed', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .lt('scheduled_date', today)
    .eq('status', 'pending')
    .eq('is_bonus', false)

  // PASO 2 — Devolver a pending los items de la cola asociados a misiones missed
  const { data: missedRows } = await supabase
    .from('camino_calendar')
    .select('queue_id')
    .eq('user_id', userId)
    .eq('status', 'missed')
    .not('queue_id', 'is', null)

  const missedQueueIds = (missedRows ?? [])
    .map(r => r.queue_id as string)
    .filter(Boolean)

  if (missedQueueIds.length > 0) {
    await supabase
      .from('user_learning_queue')
      .update({ queue_status: 'pending', scheduled_at: null, calendar_id: null })
      .eq('user_id', userId)
      .in('id', missedQueueIds)
      .eq('queue_status', 'scheduled')
  }

  // Asignaturas activas del alumno (con algo pendiente en la cola de Curso)
  // — se calcula aquí, antes de PASO 2.5, porque el forzado de prioridad de
  // examen (más abajo) necesita saber cuántas asignaturas se reparten los
  // días de la semana para poder comparar "turno normal" vs. "lo que hace
  // falta". Nota: el early-return por subjects.length===0 se mantiene más
  // abajo, en su sitio original (antes de PASO 5) — un alumno sin nada
  // pendiente de Curso en NINGUNA asignatura no debe cortar PASO 2.5/3, que
  // siguen aplicando igual (un examen puede necesitar sus misiones aunque el
  // Curso de esa asignatura esté momentáneamente vacío).
  const { data: subjectRows } = await supabase
    .from('user_learning_queue')
    .select('subject')
    .eq('user_id', userId)
    .eq('queue_status', 'pending')
    .limit(500)

  const subjectSet = new Set(
    (subjectRows ?? [])
      .map(r => r.subject as string)
      .filter(isPrivateBetaSubject),
  )
  const subjects = [...subjectSet]

  // Minutos diarios declarados en onboarding — se calcula aquí (antes de
  // PASO 2.5) porque PASO 2.6, más abajo, ya necesita estimar duración de
  // misión al colocar días forzados por examen; PASO 5 reutiliza el mismo
  // valor más tarde en vez de repetir la consulta.
  const { data: prefsRow } = await supabase
    .from('billing_events')
    .select('payload')
    .eq('user_id', userId)
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const declaredDailyMinutes = (prefsRow?.payload as Record<string, unknown> | null | undefined)?.daily_minutes
  const dailyMinutesForSlots = typeof declaredDailyMinutes === 'number' ? declaredDailyMinutes : null

  // PASO 2.5 — Parciales: procesar TODOS los exámenes activos juntos (fechas +
  // asignaturas), no uno a uno, para que dos exámenes próximos no se pisen
  // los huecos de repaso y para que un examen que acaba de entrar en su
  // ventana de preparación (≤10 días hábiles) reciba sus misiones sin que el
  // alumno tenga que volver a tocarlo. Corre dentro del throttle diario de
  // ensure-calendar, así que es como mucho una vez al día — y es idempotente
  // para el mismo listado de exámenes, así que el plan no cambia si nada
  // cambió de verdad.
  const horizonEnd = addDays(today, CALENDAR_HORIZON)
  const examSubjectsByDate = new Map<string, string[]>()
  // Temas de examen que deben ganar prioridad absoluta sobre el orden lineal
  // de su propia asignatura (regla de negocio nueva: un examen con Curso
  // pendiente pausa temporalmente el tema que tocaría por defecto). Se
  // aplica SIEMPRE que haya temas pendientes de un examen (reordena la cola,
  // barato/inofensivo); solo cuando además la ventana es justa
  // (needsCompression) se fuerza también el DÍA — quitándole turno a otras
  // asignaturas — para maximizar cuántos temas se completan a tiempo.
  const examPrioritySortOrdersBySubject = new Map<string, Set<number>>()
  // Fechas que needsCompression (más abajo) marcó como imprescindibles para
  // que un examen llegue a tiempo, agrupadas por asignatura — a diferencia
  // de examSubjectsByDate (que también incluye el día del examen en sí,
  // usado solo como desempate de subjectForDay), estas SÍ deben poder
  // generar una misión de Curso de esa asignatura aunque el presupuesto
  // general de CALENDAR_HORIZON esté lleno (PASO 2.6, más abajo, corre ANTES
  // del corte de PASO 3 justo por eso). Es un subconjunto, agrupado por
  // asignatura, de las claves de examSubjectsByDate.
  const examForcedDatesBySubject = new Map<string, Set<string>>()
  try {
    const { data: profileForExams } = await supabase
      .from('perfiles')
      .select('student_exams')
      .eq('id', userId)
      .maybeSingle()
    const activeExams = cleanStudentExams(profileForExams?.student_exams)
    for (const exam of activeExams) {
      if (exam.date < today || exam.date > horizonEnd) continue
      const slug = EXAM_SUBJECT_SLUG[exam.subject] ?? exam.subject
      const existing = examSubjectsByDate.get(exam.date) ?? []
      existing.push(slug)
      examSubjectsByDate.set(exam.date, existing)

      // computable=false (asignatura sin topic_id, o examen sin exam_topics)
      // -> sin cambios, exactamente el comportamiento de siempre.
      const coverage = await computeExamCoverage(supabase, userId, exam.id, slug, exam.date, today)
      if (!coverage.computable || coverage.pendingSortOrders.length === 0) continue

      // rescueMode pudo haber marcado alguno de estos temas 'inactive' en un
      // run anterior — para un examen real no puede quedar "no contado" solo
      // porque el recorte de rescueMode lo tocó; se reactiva a 'pending'
      // para que vuelva a aparecer en subjectQueues más abajo. No se toca
      // nada más de rescueMode (su propio límite/bug de "borra temas para
      // siempre" sigue igual, fuera de esta tarea).
      await reactivateQueueItems(supabase, userId, coverage.inactiveQueueIdsToReactivate)

      const prioritySet = examPrioritySortOrdersBySubject.get(slug) ?? new Set<number>()
      for (const so of coverage.pendingSortOrders) prioritySet.add(so)
      examPrioritySortOrdersBySubject.set(slug, prioritySet)

      // Solo forzar el día si el turno NORMAL (sin forzar nada) no llegaría
      // a cubrir los temas pendientes a tiempo — cuántos días de la ventana
      // le tocarían a esta asignatura por el reparto rotativo puro
      // (subjectForDay sin examSubjectsToday), comparado con cuántos temas
      // hacen falta. Si el reparto normal ya alcanza, no hace falta
      // quitarle turno a otras asignaturas — el reordenamiento de arriba
      // (que sí se aplica siempre que haya algo pendiente) ya se encarga de
      // que, cuando le toque su turno, la asignatura empiece por los temas
      // del examen.
      const normalRotationDays = coverage.weekdaysUntilExam.filter(
        dateStr => subjectForDay(dateStr, subjects) === slug,
      ).length
      const needsCompression = normalRotationDays < coverage.pendingSortOrders.length
      if (needsCompression) {
        const forcedDatesForSubject = examForcedDatesBySubject.get(slug) ?? new Set<string>()
        for (const dateStr of coverage.weekdaysUntilExam) {
          const forced = examSubjectsByDate.get(dateStr) ?? []
          if (!forced.includes(slug)) forced.push(slug)
          examSubjectsByDate.set(dateStr, forced)
          forcedDatesForSubject.add(dateStr)
        }
        examForcedDatesBySubject.set(slug, forcedDatesForSubject)
      }
    }
    if (activeExams.length > 0) {
      await injectAllPartialExamMissions(userId, supabase, activeExams)
    }
  } catch { /* parciales scheduling is best-effort; never blocks the base calendar fill */ }

  // PASO 2.6 — Días forzados por examen, procesados aparte del bucle
  // principal de 30 días (PASO 4+5): el bug que esto arregla es que
  // examForcedDatesBySubject se calculaba (arriba) pero nunca se llegaba a
  // usar en la práctica, porque el corte de PASO 3 (source='algorithm' >=
  // CALENDAR_HORIZON) salía de toda la función antes de llegar a PASO 4+5 en
  // cuanto el Curso normal llenaba sus 30 días — y para un alumno con algo de
  // antigüedad eso pasa casi siempre. Además, aunque PASO 3 no cortara, esas
  // fechas forzadas casi siempre YA tienen una misión de OTRA asignatura ese
  // mismo día (el calendario de 30 días suele estar completo día a día), así
  // que el bucle de PASO 4+5 — que solo rellena fechas totalmente vacías y
  // reparte una única asignatura por fecha — tampoco serviría: hace falta
  // añadir el Curso de la asignatura con examen como misión EXTRA ese mismo
  // día, sin desplazar ni tocar la que ya hubiera. Por eso esto corre aquí,
  // ANTES del corte de PASO 3, incondicionalmente (no consume ni cuenta
  // contra el presupuesto de 30 días de las demás asignaturas — es aditivo).
  if (examForcedDatesBySubject.size > 0) {
    try {
      const now = new Date().toISOString()
      for (const [subj, forcedDatesSet] of examForcedDatesBySubject) {
        const sortedDates = [...forcedDatesSet].sort()
        if (sortedDates.length === 0) continue

        // Fechas de esta lista que YA tienen una misión de Curso de ESTA
        // asignatura (de un run anterior, o porque el bucle normal ya la
        // hubiera colocado ahí) — no se duplican.
        const { data: existingForSubject } = await supabase
          .from('camino_calendar')
          .select('scheduled_date')
          .eq('user_id', userId)
          .eq('subject', subj)
          .eq('source', 'algorithm')
          .in('scheduled_date', sortedDates)
          .in('status', ['pending', 'postponed'])
        const coveredDates = new Set((existingForSubject ?? []).map(r => r.scheduled_date as string))
        const stillNeeded = sortedDates.filter(d => !coveredDates.has(d))
        if (stillNeeded.length === 0) continue

        const prioritySet = examPrioritySortOrdersBySubject.get(subj) ?? new Set<number>()
        const { data: subjQueueRows } = await supabase
          .from('user_learning_queue')
          .select('id, subject, v2_sort_order, title, block_key, block_slug, metadata, retry_not_before')
          .eq('user_id', userId)
          .eq('subject', subj)
          .eq('queue_status', 'pending')
          .order('subject_position', { ascending: true })
        const subjQueue = (subjQueueRows ?? []) as QueueItem[]
        // Mismo criterio de prioridad que PASO 4+5 aplica más abajo para el
        // resto del calendario: los temas del examen primero.
        const orderedQueue = [
          ...subjQueue.filter(item => prioritySet.has(item.v2_sort_order)),
          ...subjQueue.filter(item => !prioritySet.has(item.v2_sort_order)),
        ]
        if (orderedQueue.length === 0) continue

        const topicIdBySortOrder = subj === 'historia_espana'
          ? await resolveTopicIdentitiesBatch(supabase, 'historia_espana', orderedQueue.map(item => item.v2_sort_order))
          : new Map<number, string>()

        const forcedRows: object[] = []
        const forcedScheduledQueueIds: string[] = []
        let cursor = 0
        for (const dateStr of stillNeeded) {
          if (cursor >= orderedQueue.length) break
          const item = orderedQueue[cursor]
          if (item.retry_not_before && item.retry_not_before > dateStr) continue
          // Scheduler del día: ya cuenta como "ocupado" cualquier misión de
          // camino_calendar que ese día tenga hora asignada (incluida la de
          // otra asignatura) — ver getBusyIntervalsForDate en
          // scheduleTimeSlot.ts — así que esto añade la misión forzada en el
          // primer hueco libre que quede, sin pisar la que ya hubiera. Un
          // día genuinamente sin hueco (agenda propia + otra misión ya lo
          // llenan) se salta sin avanzar el cursor, igual que el bucle
          // principal.
          const scheduler = await createDayScheduler(userId, supabase, dateStr)
          const timeSlot = scheduler.place(estimatedMinutesForSlot(dailyMinutesForSlots, 0))
          if (!timeSlot) continue
          const itemMeta = item.metadata ?? {}
          const topicMeta = queueTopicMeta(item)
          const missionType = (itemMeta.mission_type as string) ?? 'concept'
          const calMetadata: Record<string, unknown> = { topic_slug: topicMeta.topicSlug, exam_forced: true }
          const topicId = topicIdBySortOrder.get(item.v2_sort_order)
          if (topicId) calMetadata.topic_id = topicId
          if (itemMeta.express) calMetadata.express = true
          forcedRows.push({
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
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            metadata: calMetadata,
          })
          forcedScheduledQueueIds.push(item.id)
          cursor++
        }

        if (forcedRows.length > 0) {
          await supabase.from('camino_calendar').upsert(forcedRows, {
            onConflict: 'user_id,scheduled_date,subject,v2_sort_order',
            ignoreDuplicates: true,
          })
        }
        if (forcedScheduledQueueIds.length > 0) {
          await supabase
            .from('user_learning_queue')
            .update({ queue_status: 'scheduled', scheduled_at: now })
            .in('id', forcedScheduledQueueIds)
            .eq('user_id', userId)
        }
      }
    } catch { /* best-effort, igual que PASO 2.5 — nunca debe bloquear el resto del calendario */ }
  }

  // PASO 3 — Contar días futuros pendientes (distintos) — SOLO source='algorithm'
  // (Curso normal). Las misiones de examen (source='partial') tienen su
  // propia ventana natural y acotada (≤10 días hábiles antes de cada
  // examen, ver injectPartialExamMissions.ts) — antes competían por el
  // mismo presupuesto de CALENDAR_HORIZON=30 días que el Curso, así que con
  // 1-2 exámenes activos podían llegar a ocupar casi la mitad de esos 30
  // días sin dejar sitio a ninguna lección de Curso nueva. Al no contarlas
  // aquí, el Curso vuelve a tener sus 30 días completos de presupuesto
  // propio, y las misiones de examen (ya con su propio corte de ≤10 días)
  // conviven en las mismas fechas sin competir por el mismo contador. Una
  // misión de Curso degradada a is_bonus=true (cuando un examen le "roba" el
  // hueco visual ese día) sigue siendo source='algorithm' — sigue contando
  // aquí, correctamente, como parte del presupuesto de Curso.
  const { data: futureDayRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .eq('source', 'algorithm')
    .gte('scheduled_date', today)
    .in('status', ['pending', 'postponed'])

  const futureDaySet = new Set((futureDayRows ?? []).map(r => r.scheduled_date as string))
  if (futureDaySet.size >= CALENDAR_HORIZON) return

  // PASO 4+5 — Generar días hasta completar CALENDAR_HORIZON

  // Private beta scope: the Supabase calendar engine only schedules the
  // active core PAU subjects. `subjects` ya se calculó arriba, antes de
  // PASO 2.5, para el forzado de prioridad de examen.
  if (subjects.length === 0) return

  // PASO 5 — Ratio de velocidad
  const { count: remainingQueue } = await supabase
    .from('user_learning_queue')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('queue_status', 'pending')

  const workingDaysUntilExam = countWorkingDays(today, EXAM_DATE)
  const ratio = workingDaysUntilExam > 0 ? (remainingQueue ?? 0) / workingDaysUntilExam : 0
  const rescueMode = ratio > 2
  // itemsPerDay used to come ONLY from the backlog-vs-exam ratio, completely
  // ignoring how much daily time the student actually declared — a student
  // with a light backlog who said "2-3 horas/día" still only ever got 1
  // item/day. Take the larger of the two signals: rescue mode (heavy
  // backlog) can still push extra items even for a modest daily time, but a
  // student's declared time is always at least respected. (declaredDailyMinutes
  // ya se calculó arriba, antes de PASO 2.5, para reutilizarlo en PASO 2.6.)
  const ratioItemsPerDay = rescueMode || ratio > 1.5 ? 2 : 1
  const itemsPerDay = Math.max(ratioItemsPerDay, missionsPerDayForMinutes(typeof declaredDailyMinutes === 'number' ? declaredDailyMinutes : null))

  // Obtener items pendientes de la cola ordenados por posición
  // queue_status='pending' excluye automáticamente postponed/scheduled/completed
  const { data: queueItems } = await supabase
    .from('user_learning_queue')
    .select('id, subject, v2_sort_order, title, block_key, block_slug, metadata, retry_not_before')
    .eq('user_id', userId)
    .eq('queue_status', 'pending')
    .in('subject', subjects)
    .order('subject', { ascending: true })
    .order('subject_position', { ascending: true })

  const subjectQueues: Record<string, QueueItem[]> = {}
  for (const item of (queueItems ?? []) as QueueItem[]) {
    if (!subjectQueues[item.subject]) subjectQueues[item.subject] = []
    subjectQueues[item.subject].push(item)
  }

  // Rescue mode: re-sort by PAU priority and mark overflow items inactive
  if (rescueMode) {
    const inactiveIds: string[] = []
    const perSubjectCap = Math.ceil((CALENDAR_HORIZON * 2) / subjects.length)

    for (const subj of subjects) {
      const queue = subjectQueues[subj] ?? []
      queue.sort((a, b) => {
        const pa = rescuePriority(a.subject, a.v2_sort_order)
        const pb = rescuePriority(b.subject, b.v2_sort_order)
        return pa !== pb ? pa - pb : a.v2_sort_order - b.v2_sort_order
      })
      if (queue.length > perSubjectCap) {
        for (const item of queue.slice(perSubjectCap)) inactiveIds.push(item.id)
        subjectQueues[subj] = queue.slice(0, perSubjectCap)
      } else {
        subjectQueues[subj] = queue
      }
    }

    if (inactiveIds.length > 0) {
      await supabase
        .from('user_learning_queue')
        .update({ queue_status: 'inactive' })
        .in('id', inactiveIds)
        .eq('user_id', userId)
    }
  }

  // Prioridad absoluta de los temas de examen sobre el orden lineal de su
  // asignatura (regla de negocio nueva) — se aplica DESPUÉS de rescueMode a
  // propósito: si rescueMode está activo, su propio re-sort/recorte ya
  // corrió arriba, y esto debe ganar por encima, no al revés. Nota: si
  // rescueMode cortó alguno de estos temas fuera de subjectQueues (los movió
  // a 'inactive') en ESTE mismo run, ya no está en el array y este
  // reordenamiento no puede resucitarlo desde aquí — solo queda reactivado
  // en BD para el próximo run. Riesgo conocido, no se corrige aquí (ver
  // comentario en la sección de arriba).
  for (const [subj, prioritySet] of examPrioritySortOrdersBySubject) {
    const queue = subjectQueues[subj]
    if (!queue || prioritySet.size === 0) continue
    const priority: QueueItem[] = []
    const rest: QueueItem[] = []
    for (const item of queue) {
      if (prioritySet.has(item.v2_sort_order)) priority.push(item)
      else rest.push(item)
    }
    subjectQueues[subj] = [...priority, ...rest]
  }

  const cursors: Record<string, number> = Object.fromEntries(subjects.map(s => [s, 0]))

  // Días hábiles vacíos que necesitan misión (ventana amplia para cubrir gaps)
  const candidateDays = getStudyDays(today, CALENDAR_HORIZON * 4)
  const emptyDays = candidateDays
    .filter(d => !futureDaySet.has(d))
    .slice(0, CALENDAR_HORIZON - futureDaySet.size)

  if (emptyDays.length === 0) return

  const calendarRows: object[] = []
  const scheduledQueueIds: string[] = []
  const now = new Date().toISOString()

  // Historia only (curriculum_content_v2.topic_id, migration 20260825220000) —
  // batched once up front instead of per-row so a normal ensure-calendar run
  // doesn't add dozens of extra queries. Purely additive: v2_sort_order
  // keeps being the identity every downstream reader (complete-mission,
  // /api/camino/correct, etc.) already uses; this only attaches the real
  // curriculum_topics.id alongside it when one exists.
  const historiaTopicIdBySortOrder = await resolveTopicIdentitiesBatch(
    supabase,
    'historia_espana',
    (subjectQueues['historia_espana'] ?? []).map(item => item.v2_sort_order),
  )

  for (const dateStr of emptyDays) {
    const subject = subjectForDay(dateStr, subjects, examSubjectsByDate.get(dateStr))
    if (!subject) continue

    const queue = subjectQueues[subject] ?? []
    let cursor = cursors[subject] ?? 0
    // Un scheduler por día, sembrado con el horario propio del alumno
    // (camino_custom_events, incluidas sus recurrencias semanales) — cada
    // misión que coloca este bucle ocupa el hueco elegido antes de buscar el
    // siguiente, así dos misiones del mismo día tampoco se pisan entre sí.
    const scheduler = await createDayScheduler(userId, supabase, dateStr)

    for (let slot = 0; slot < itemsPerDay; slot++) {
      if (cursor >= queue.length) break
      const item = queue[cursor]
      // "No lo he dado" a mitad de bloque deja la tarjeta en 'pending' pero
      // con retry_not_before en el futuro (ver postpone-mission/route.ts) —
      // mientras dure la espera, esta asignatura no aporta nada ese día
      // (rota a las demás) en vez de forzar la misma tarjeta o saltarla.
      if (item.retry_not_before && item.retry_not_before > dateStr) break
      const itemMeta = item.metadata ?? {}
      const topicMeta = queueTopicMeta(item)
      const missionType = (itemMeta.mission_type as string) ?? 'concept'
      const calMetadata: Record<string, unknown> = {}
      calMetadata.topic_slug = topicMeta.topicSlug
      const topicId = item.subject === 'historia_espana' ? historiaTopicIdBySortOrder.get(item.v2_sort_order) : null
      if (topicId) calMetadata.topic_id = topicId
      if (itemMeta.express) calMetadata.express = true
      if (rescueMode) calMetadata.plan_mode = 'rescue'
      const timeSlot = scheduler.place(estimatedMinutesForSlot(dailyMinutesForSlots, slot))
      // Sin hueco libre en la ventana de estudio de este día (agenda propia
      // — cole/extraescolares — ya lo llena) -> no se fuerza la misión aquí.
      // Se deja en la cola sin avanzar el cursor, así un día futuro con
      // menos ocupación la recoge en vez de aterrizar sin hora en un día ya
      // completo.
      if (!timeSlot) break
      calendarRows.push({
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
        start_time: timeSlot.start,
        end_time: timeSlot.end,
        metadata: calMetadata,
      })
      scheduledQueueIds.push(item.id)
      cursor++
    }
    cursors[subject] = cursor
  }

  if (calendarRows.length > 0) {
    await supabase.from('camino_calendar').upsert(calendarRows, {
      onConflict: 'user_id,scheduled_date,subject,v2_sort_order',
      ignoreDuplicates: true,
    })
  }

  if (scheduledQueueIds.length > 0) {
    await supabase
      .from('user_learning_queue')
      .update({ queue_status: 'scheduled', scheduled_at: now })
      .in('id', scheduledQueueIds)
      .eq('user_id', userId)
  }

  await maybeInjectCommentText(userId, supabase, today)
}
