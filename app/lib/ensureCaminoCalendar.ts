import { type SupabaseClient } from '@supabase/supabase-js'

import { PRIVATE_BETA_SUBJECTS, isPrivateBetaSubject } from './camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from './camino/caminoCurriculumPlan'
import { cleanStudentExams } from './camino/cleanStudentExams'
import { estimatedMinutesForSlot, missionsPerDayForMinutes } from './camino/dailyTimeCapacity'
import { EXAM_SUBJECT_SLUG } from './camino/partialExamSubjects'
import { computeExamCoverage, reactivateAllInactiveQueueItems, reactivateQueueItems } from './camino/examCoverage'
import { FINAL_MOCK_WINDOW_DAYS, injectAllPartialExamMissions, resolveFinalMockSlot } from './camino/injectPartialExamMissions'
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

// `orderedSubjects` decide qué asignatura le toca cada día del ciclo
// rotativo (dow-1 % length) — el llamador la calcula una vez por ejecución
// de ensureCaminoCalendar, ordenando por backlog pendiente real (ver
// subjectsByBacklog más abajo) en vez de usar la posición fija de una
// asignatura en PRIVATE_BETA_SUBJECTS, que no tenía relación alguna con
// cuánto temario le quedaba a cada una.
function subjectForDay(dateStr: string, subjects: string[], orderedSubjects: string[], examSubjectsToday?: string[]): string | null {
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
  const ordered = orderedSubjects.filter(subject => subjects.includes(subject))
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
  // Límite generoso (muy por encima del temario más grande de una sola
  // asignatura) para que, además de listar qué asignaturas tienen algo
  // pendiente, esta misma consulta sirva para contar CUÁNTOS temas
  // pendientes tiene cada una — necesario para subjectsByBacklog, más abajo.
  const { data: subjectRows } = await supabase
    .from('user_learning_queue')
    .select('subject')
    .eq('user_id', userId)
    .eq('queue_status', 'pending')
    .limit(2000)

  const pendingCountBySubject: Record<string, number> = {}
  for (const row of subjectRows ?? []) {
    const subject = row.subject as string
    if (!isPrivateBetaSubject(subject)) continue
    pendingCountBySubject[subject] = (pendingCountBySubject[subject] ?? 0) + 1
  }
  const subjects = Object.keys(pendingCountBySubject)

  // Orden del ciclo rotativo de subjectForDay: la asignatura con MÁS temas
  // pendientes va primero, para que reciba más turnos reales por semana —
  // antes se usaba directamente el orden fijo de PRIVATE_BETA_SUBJECTS, que
  // no tenía ninguna relación con el backlog real de cada una (dos
  // asignaturas con 122 y 20 temas pendientes recibían el mismo número de
  // turnos solo por su posición en ese array). Se recalcula aquí, en cada
  // ejecución, a partir del estado actual de la cola — nunca se guarda, así
  // que si el backlog cambia (el alumno avanza, se añade una asignatura) el
  // reparto se ajusta solo en la próxima ejecución. El empate (mismo nº de
  // pendientes) se resuelve con el orden fijo de PRIVATE_BETA_SUBJECTS para
  // que el resultado sea 100% determinista para un mismo estado de cola —
  // nunca aleatorio entre dos ejecuciones con los mismos datos.
  const subjectsByBacklog = [...subjects].sort((a, b) => {
    const diff = pendingCountBySubject[b] - pendingCountBySubject[a]
    if (diff !== 0) return diff
    return (PRIVATE_BETA_SUBJECTS as readonly string[]).indexOf(a) - (PRIVATE_BETA_SUBJECTS as readonly string[]).indexOf(b)
  })

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
  // de su propia asignatura: un examen con Curso pendiente pausa
  // temporalmente el tema que tocaría por defecto. Se aplica SIEMPRE que
  // haya temas pendientes de un examen (reordena la cola, barato/inofensivo);
  // solo cuando además la ventana es justa (needsCompression) se fuerza
  // también el DÍA — quitándole turno a otras asignaturas — para maximizar
  // cuántos temas se completan a tiempo.
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
  // v2_sort_order -> fecha del Simulacro del examen al que pertenece ese
  // tema, para CUALQUIER tema de examen pendiente (no solo los que
  // needsCompression fuerza) — el reordenamiento de prioridad de más abajo
  // ("Prioridad absoluta de los temas de examen...") se aplica SIEMPRE que
  // haya algo pendiente, así que un tema puede acabar consumido por el
  // turno NORMAL de rotación (PASO 4+5), no solo por PASO 2.6. Sin este
  // mapa, ese turno normal podía aterrizar el mismo día o después del
  // Simulacro de su propio examen — el mismo bug que PASO 2.6 arregla, pero
  // por la otra vía. Se consulta en PASO 4+5 para saltar (no colocar todavía)
  // un tema cuyo examen ya tiene su Simulacro en esa fecha o antes.
  const historiaSortOrderMockDate = new Map<number, string>()
  try {
    const { data: profileForExams } = await supabase
      .from('perfiles')
      .select('student_exams, custom_instructions')
      .eq('id', userId)
      .maybeSingle()
    const activeExams = cleanStudentExams(profileForExams?.student_exams)
    // customInstructions se lee aquí (una sola vez, junto a student_exams) en
    // vez de que resolveFinalMockSlot invente su propio valor: tiene que ser
    // EXACTAMENTE el mismo que injectAllPartialExamMissions usará más abajo
    // (su propia lectura de perfiles.custom_instructions, sin escrituras de
    // por medio en este mismo run) para que la fecha de Simulacro que aquí
    // se calcula como límite de PASO 2.6 sea consistente con la que de
    // verdad se inserte después — si no coincidieran, PASO 2.6 podría
    // excluir la fecha equivocada.
    const customInstructions = profileForExams?.custom_instructions ?? undefined
    // Fechas reales de examen de TODOS los activos — mismo criterio que
    // injectAllPartialExamMissions usa para resolveFinalMockSlot (solo
    // evita que un Simulacro caiga en el día real de OTRO examen).
    const otherExamDates = new Set(activeExams.map(e => e.date))
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

      // Fecha del Simulacro de ESTE examen — se resuelve aquí, para
      // CUALQUIER examen con temas pendientes (no solo cuando needsCompression
      // fuerza el día), porque el reordenamiento de prioridad de más abajo se
      // aplica siempre que haya algo pendiente: un tema puede acabar
      // colocado por el turno NORMAL de rotación (PASO 4+5), no solo por el
      // forzado de PASO 2.6, y ambas vías deben respetar el mismo límite.
      // Se usa resolveFinalMockSlot (de solo lectura, ya usado por
      // injectAllPartialExamMissions para lo mismo) en vez de inventar un
      // segundo criterio — si el examen ya tiene un Simulacro agendado, se
      // reutiliza tal cual esa fecha.
      //
      // Si el examen todavía no entra en la ventana de inyección de
      // injectPartialExamMissions (>10 días hábiles), resolveFinalMockSlot
      // devuelve null — no hay una fecha de Simulacro que reutilizar porque
      // ese módulo ni siquiera ha llegado a calcularla todavía. En ese caso
      // se aplica un margen de seguridad conservador: se excluyen ya de
      // entrada los últimos FINAL_MOCK_WINDOW_DAYS días hábiles de la
      // ventana, porque se sabe que el Simulacro acabará cayendo ahí en
      // cuanto el examen entre en su ventana de ≤10 días — así ninguna
      // lección de HOY (forzada o de turno normal) queda plantada justo
      // donde el Simulacro aterrizará más adelante.
      const mockSlot = await resolveFinalMockSlot(userId, supabase, { ...exam, customInstructions }, otherExamDates)
      const mockDateBoundary = mockSlot
        ?? coverage.weekdaysUntilExam[Math.max(0, coverage.weekdaysUntilExam.length - FINAL_MOCK_WINDOW_DAYS)]
        ?? null
      // Si el Simulacro de este examen YA pasó (pero el examen en sí
      // todavía no — puede haber 1-3 días hábiles entre ambos), ya no tiene
      // sentido seguir bloqueando estos temas: no hay nada que proteger, y
      // dejarlos bloqueados los dejaría sin poder programarse hasta que el
      // examen entero pasara. `dateStr` en los bucles de abajo nunca es
      // anterior a `today`, así que un boundary ya pasado bloquearía para
      // siempre sin este chequeo.
      if (slug === 'historia_espana' && mockDateBoundary && mockDateBoundary >= today) {
        for (const so of coverage.pendingSortOrders) {
          // Si dos exámenes de Historia comparten un tema (mismo sort_order
          // en ambos exam_topics), se queda con la fecha de Simulacro MÁS
          // TEMPRANA de los dos — ese tema debe estar visto antes del
          // primero de los dos exámenes que lo necesita.
          const existingBoundary = historiaSortOrderMockDate.get(so)
          if (!existingBoundary || mockDateBoundary < existingBoundary) {
            historiaSortOrderMockDate.set(so, mockDateBoundary)
          }
        }
      }

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
        dateStr => subjectForDay(dateStr, subjects, subjectsByBacklog) === slug,
      ).length
      const needsCompression = normalRotationDays < coverage.pendingSortOrders.length
      if (needsCompression) {
        // Mismo límite que arriba (mockSlot, ya resuelto) — nunca se coloca
        // una lección forzada el mismo día ni después del Simulacro de este
        // examen.
        const candidateForcedDates = mockSlot
          ? coverage.weekdaysUntilExam.filter(dateStr => dateStr < mockSlot)
          : coverage.weekdaysUntilExam.slice(0, Math.max(0, coverage.weekdaysUntilExam.length - FINAL_MOCK_WINDOW_DAYS))

        const forcedDatesForSubject = examForcedDatesBySubject.get(slug) ?? new Set<string>()
        for (const dateStr of candidateForcedDates) {
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

  // PASO 2.6 — Días forzados por examen: para cada asignatura con fechas en
  // examForcedDatesBySubject, añade el Curso pendiente de ese examen como
  // misión EXTRA en esas fechas — sin desplazar ni tocar la misión que ya
  // hubiera ese día para otra asignatura (el calendario de 30 días suele
  // estar completo día a día, así que casi nunca hay un hueco totalmente
  // vacío que el bucle normal de PASO 4+5 pudiera aprovechar). Corre ANTES
  // del corte de presupuesto de PASO 3, sin condición: estas fechas son
  // aditivas y nunca cuentan contra el presupuesto de 30 días de las demás
  // asignaturas.
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
          // Cuando una asignatura tiene más de un examen activo a la vez
          // (p. ej. dos Parciales de Historia próximos entre sí), esta cola
          // combinada puede traer temas de DISTINTOS exámenes mezclados —
          // cada uno con su propio límite de Simulacro. Un tema cuyo límite
          // ya está superado para esta fecha (a diferencia de
          // retry_not_before, que solo pide esperar una fecha futura, este
          // límite nunca se cumple más tarde dentro de esta misma lista
          // ascendente de fechas) se salta de forma permanente — así el
          // resto de fechas disponibles no se desperdician esperando a un
          // tema que ya no puede colocarse antes de SU Simulacro.
          while (cursor < orderedQueue.length) {
            const candidateBoundary = historiaSortOrderMockDate.get(orderedQueue[cursor].v2_sort_order)
            if (candidateBoundary && dateStr >= candidateBoundary) { cursor++; continue }
            break
          }
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
  // propia ventana natural y acotada (≤10 días hábiles antes de cada examen,
  // ver injectPartialExamMissions.ts) y no cuentan aquí — así el Curso tiene
  // siempre sus 30 días completos de presupuesto propio, y las misiones de
  // examen conviven en las mismas fechas sin competir por el mismo contador.
  // Una misión de Curso degradada a is_bonus=true (cuando un examen le "roba"
  // el hueco visual ese día) sigue siendo source='algorithm' — sigue
  // contando aquí, correctamente, como parte del presupuesto de Curso.
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
  // itemsPerDay toma el MAYOR de dos señales independientes: el ritmo que
  // pide el backlog frente al examen (rescueMode/ratio) y el ritmo que el
  // propio alumno declaró en onboarding (declaredDailyMinutes, ya calculado
  // arriba, antes de PASO 2.5, para reutilizarlo también en PASO 2.6) — así
  // un backlog pesado puede empujar más items incluso con poco tiempo
  // diario declarado, pero el tiempo declarado por el alumno siempre se
  // respeta como mínimo.
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
  } else {
    // rescueMode no está activo este run — si el alumno había recuperado el
    // ritmo (el ratio bajó del umbral que lo dispara), cualquier tema que
    // quedó 'inactive' por un recorte de rescueMode anterior debe volver a
    // 'pending': ya no hay overflow real que justifique mantenerlo oculto.
    // Igual que con el reordenamiento de prioridad de examen (comentario de
    // abajo), lo reactivado aquí no entra en subjectQueues de ESTE run (ya se
    // calculó arriba) — queda disponible para el próximo, mismo patrón ya
    // aceptado en el resto de este archivo.
    await reactivateAllInactiveQueueItems(supabase, userId)
  }

  // Prioridad absoluta de los temas de examen sobre el orden lineal de su
  // asignatura — se aplica DESPUÉS de rescueMode a propósito: si rescueMode
  // está activo, su propio re-sort/recorte ya corrió arriba, y esto debe
  // ganar por encima, no al revés. Nota: si rescueMode cortó alguno de estos
  // temas fuera de subjectQueues (los movió a 'inactive') en ESTE mismo run,
  // ya no está en el array y este reordenamiento no puede resucitarlo desde
  // aquí — solo queda reactivado en BD para el próximo run. Limitación
  // conocida, no se corrige aquí.
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
    const subject = subjectForDay(dateStr, subjects, subjectsByBacklog, examSubjectsByDate.get(dateStr))
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
      // Mismo motivo, otro caso: este tema es de un examen cuyo Simulacro ya
      // cae en esta fecha o antes — el turno normal de rotación no debe
      // colocarlo aquí (rompería Curso→Simulacro), así que se deja pendiente
      // igual que retry_not_before, para que un día POSTERIOR al Simulacro
      // (donde el límite ya no aplica) lo recoja. PASO 2.6 ya respeta este
      // mismo límite para sus propias fechas forzadas; esto cubre el resto
      // de temas que ese forzado no alcanzó a colocar antes del Simulacro.
      const examMockBoundary = item.subject === 'historia_espana'
        ? historiaSortOrderMockDate.get(item.v2_sort_order)
        : undefined
      if (examMockBoundary && dateStr >= examMockBoundary) break
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
