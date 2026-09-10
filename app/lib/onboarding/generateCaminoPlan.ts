import 'server-only'
import { checkedDb } from '@/app/lib/camino/checkedDb'
import { withPlanLock } from '@/app/lib/camino/planPersistence'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PRIVATE_BETA_CURRICULUM_TOPICS, isPrivateBetaSubject } from '@/app/lib/camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, getTopic, getTopicByV2SortOrder, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from '@/app/lib/camino/caminoCurriculumPlan'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { missionsPerDayForMinutes } from '@/app/lib/camino/dailyTimeCapacity'
import { injectAllPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'
import { cleanStudentExams, type StudentExam } from '@/app/lib/camino/cleanStudentExams'
import { getMadridToday } from '@/app/lib/camino/studyDays'
import { rotateSubjectForDay } from '@/app/lib/camino/subjectRotation'
import { buildPlanDays } from '@/app/lib/camino/planEngine'
import { FINAL_REVIEW_RESERVED_STUDY_DAYS } from '@/app/lib/camino/examDate'
import { SPAIN_HOLIDAYS } from '@/app/lib/camino/spainHolidays'
import { loadStudentPlanContext, planningDates, type StudentPlanContext } from '@/app/lib/camino/studentPlanContext'
import { coveredBlockCount, queueMetadataFor, resolveStartModes, type StartMode } from '@/app/lib/camino/startingPoint'
import { hasCompletedOnboarding } from '@/app/lib/onboarding/hasCompletedOnboarding'
import { sendWelcomeEmail } from '@/app/lib/email/sendWelcomeEmail'
import { generateUnsubscribeToken } from '@/app/lib/unsubscribeToken'

// Extracción literal del cuerpo de /api/onboarding/generate (Fase 0/1): la
// misma construcción de user_learning_queue + camino_calendar, reutilizada
// tal cual por el endpoint legacy y por el finalizer de Fase 2
// (/api/onboarding/finalize). NO reescribe el algoritmo — solo lo saca de la
// route handler para poder llamarlo desde dos sitios sin duplicar lógica.

export { VALID_START_MODES } from '@/app/lib/camino/startingPoint'
export type { StartMode } from '@/app/lib/camino/startingPoint'

// Private beta scope: Camino PAU is active only for these core PAU subjects.
export const ALLOWED_GENERATE_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana', 'fisica', 'quimica', 'ingles', 'historia_filosofia', 'economia'])

// El orden fijo por defecto solo decide QUIÉN empieza la rotación, no cuántos
// días recibe cada una: rotateSubjectForDay usa un índice continuo entre
// semanas (ver subjectRotation.ts), así que todas las asignaturas entran en el
// reparto por igual — incluida la 6ª y siguientes, que con el `(dow - 1) % n`
// anterior nunca llegaban a salir.
function addDaysIso(dateStr: string, n: number): string {
  return new Date(Date.parse(`${dateStr}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10)
}

const DEFAULT_SUBJECT_ORDER = ['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana', 'fisica', 'quimica', 'ingles', 'historia_filosofia', 'economia']

function subjectForDay(
  dateStr: string,
  subjects: string[],
  studyDayIndexes: readonly number[],
  hasWork?: (subject: string) => boolean,
): string | null {
  const ordered = DEFAULT_SUBJECT_ORDER.filter(subject => subjects.includes(subject))
  // Una asignatura fuera del orden por defecto (no debería pasar, pero no se
  // puede perder silenciosamente) se añade al final conservando su posición.
  for (const subject of subjects) if (!ordered.includes(subject)) ordered.push(subject)
  return rotateSubjectForDay(dateStr, ordered, { hasWork, studyDayIndexes })
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
  /** Modo global de respaldo, para las asignaturas sin declaración propia. */
  startMode: StartMode
  /** Punto de partida DECLARADO por el alumno en cada asignatura (slug → modo). */
  startModeBySubject?: Record<string, string> | null
  studentExams: unknown
  dailyMinutes: number | null
  /**
   * Días de estudio por semana declarados en ESTA petición.
   *
   * Va por parámetro y no se lee de `billing_events` porque el evento
   * `onboarding_completed` se escribe DESPUÉS de generar y verificar el
   * calendario. Sin esto, el primer plan de una cuenta nueva se construía
   * contra L-V aunque el alumno hubiera elegido dos días.
   */
  weeklyStudyDays?: number | null
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
  // skippedSubjects: asignaturas elegidas por el alumno que la base de datos
  // rechazó al sembrar la cola. El Camino se genera igual con las demás, pero
  // el llamador debe registrarlo — es la señal de que el check constraint de
  // user_learning_queue se ha quedado corto frente a ALLOWED_GENERATE_SUBJECTS.
  | { success: true; daysGenerated: number; firstMission: GenerateCaminoPlanMission | null; missions: GenerateCaminoPlanMission[]; skippedSubjects: string[] }
  | { success: false; errorCode: 'queue_insert_failed' | 'calendar_insert_failed' | 'queue_update_failed' | 'already_onboarded' | 'internal_error' }

export async function generateCaminoPlan(params: GenerateCaminoPlanParams): Promise<GenerateCaminoPlanResult> {
  try {
    return await withPlanLock(params.db, params.userId, () => generateCaminoPlanLocked({ ...params, db: checkedDb(params.db) }))
  } catch (error) {
    console.error('[camino/generate] unavailable:', error)
    return { success: false, errorCode: 'internal_error' }
  }
}

async function generateCaminoPlanLocked(params: GenerateCaminoPlanParams): Promise<GenerateCaminoPlanResult> {
  const { userId, db, startMode, dailyMinutes } = params
  const declaredAvailability = { weeklyStudyDays: params.weeklyStudyDays ?? null, dailyMinutes }
  const subjects = [...new Set(params.subjects.map(s => normalizeSubjectSlug(s)).filter(s => ALLOWED_GENERATE_SUBJECTS.has(s)))]

  try {
    // Guarda contra el reset destructivo de más abajo: esta función borra
    // TODO el user_learning_queue pendiente/futuro y el camino_calendar
    // futuro no completado de la cuenta — correcto la primera vez (onboarding
    // real), pero catastrófico si se dispara sobre una cuenta ya activa
    // (endpoint legacy /api/onboarding/generate sin guarda propia, o un
    // draft nuevo para un usuario que ya completó onboarding antes). Se
    // comprueba aquí, antes de tocar nada, con la misma señal autoritativa
    // que /api/onboarding/me usa para decidir si una cuenta ya terminó el
    // onboarding — así protege a CUALQUIER llamador presente o futuro, no
    // solo al que se conoce hoy.
    if (await hasCompletedOnboarding(db, userId)) {
      return { success: false, errorCode: 'already_onboarded' }
    }

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

    async function injectOnboardingPartials(planContext: StudentPlanContext) {
      const studentExams = await loadStudentExams()
      if (studentExams.length === 0) return
      // El mismo contexto que el resto del paso: la preparación de parciales
      // también tiene que caer en días que el alumno estudia y antes de su
      // fecha objetivo.
      await injectAllPartialExamMissions(userId, db, studentExams, { planContext })
    }

    // ── Reset: wipe old plan so subjects chosen in onboarding take effect ───
    // user_learning_queue protege queue_status='completed' con el mismo
    // criterio que camino_calendar ya protege status='completed' — antes
    // borraba también los temas completados, así que computeExamCoverage
    // (que lee solo esta tabla para contar cuántos temas de un examen ya se
    // vieron) podía caer a 0% de golpe tras un reset aunque el alumno
    // hubiera completado lecciones reales.
    const resetToday = getMadridToday()
    const resetResults = await Promise.all([
      db.from('user_learning_queue').delete().eq('user_id', userId).neq('queue_status', 'completed'),
      db.from('camino_calendar').delete().eq('user_id', userId).neq('status', 'completed').gte('scheduled_date', resetToday),
    ])

    for (const result of resetResults) {
      if (result.error) throw new Error(`Queue reset error: ${result.error.message}`)
    }

    // ── PASO 2: user_learning_queue ─────────────────────────────────────────
    const { data: existingQueueCheck } = await db
      .from('user_learning_queue')
      .select('subject')
      .eq('user_id', userId)
      .in('subject', subjects)

    const subjectsWithQueue = new Set((existingQueueCheck ?? []).map(r => r.subject))
    const subjectsToQueue = subjects.filter(s => !subjectsWithQueue.has(s))

    const insertedSubjects = new Set<string>()
    const failedSubjects: string[] = []

    if (subjectsToQueue.length > 0) {
      const { data: flashcards } = await db
        .from('curriculum_content_v2')
        .select('sort_order, title, block_key, block_slug, subject')
        .in('subject', subjectsToQueue)
        // Filas en borrador (review_status='draft', p.ej. el Curso de
        // Matemáticas CCSS pendiente de revisión) no deben sembrar la cola
        // de un alumno real todavía — sin este filtro caerían aquí en vez
        // de en el fallback de betaSequenceItems, más abajo.
        .eq('review_status', 'published')
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

      // Punto de partida declarado POR ASIGNATURA (ver camino/startingPoint.ts).
      // Antes era un único modo para todo el Camino y, además, el finalizador
      // enviaba siempre 'zero', así que el alumno que llegaba a mitad de curso
      // empezaba por el tema 1 de todo.
      const startModes = resolveStartModes(subjectsToQueue, params.startModeBySubject, startMode)

      const queueRowsBySubject: Record<string, object[]> = {}
      for (const subject of subjectsToQueue) {
        const items = bySubject[subject] ?? []
        const queueRows: object[] = []
        queueRowsBySubject[subject] = queueRows

        const subjectMode = startModes[subject] ?? startMode
        // Los bloques ya trabajados en clase se cuentan sobre el temario REAL
        // de esta asignatura, no como un número fijo de bloques.
        const uniqueBlocks = [...new Set(items.map(i => i.block_key))]
        const coveredBlocks = new Set(uniqueBlocks.slice(0, coveredBlockCount(subjectMode, uniqueBlocks.length)))

        for (let i = 0; i < items.length; i++) {
          const fc = items[i]
          const topicMeta = queueTopicMeta(fc)
          const metadata: Record<string, unknown> = queueMetadataFor(
            subjectMode,
            coveredBlocks.has(fc.block_key),
            topicMeta.topicSlug,
          )
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

      // Inserción POR ASIGNATURA, no en lotes mezclados. La cola tiene un
      // check constraint en `subject` mantenido a mano en la base de datos
      // (ver 20260729130000_fix_user_learning_queue_subject_check.sql) que
      // históricamente se ha quedado por detrás de
      // ALLOWED_GENERATE_SUBJECTS: cuando el alumno elegía una asignatura
      // aún no aceptada por el constraint, el lote entero —con las demás
      // asignaturas dentro— era rechazado y el onboarding moría con
      // queue_generation_failed, repitiéndose idéntico en cada "Reintentar"
      // (caso real: dos cuentas con Historia de la Filosofía, 09/09/2026).
      // Aislando cada asignatura, una que la base de datos rechace se
      // descarta y el Camino se construye igualmente con el resto.
      for (const subject of subjectsToQueue) {
        const queueRows = queueRowsBySubject[subject] ?? []
        if (queueRows.length === 0) continue

        let insertError: string | null = null
        for (let i = 0; i < queueRows.length; i += 100) {
          const { error } = await db.from('user_learning_queue').insert(queueRows.slice(i, i + 100))
          if (error) { insertError = error.message; break }
        }

        if (insertError) {
          console.error(`[generateCaminoPlan] queue insert failed for subject "${subject}":`, insertError)
          failedSubjects.push(subject)
          // Si falló un lote intermedio, la asignatura queda a medias: se
          // limpia para que el calendario no se construya sobre una cola
          // parcial (y para que un reintento parta de cero).
          await db.from('user_learning_queue')
            .delete()
            .eq('user_id', userId)
            .eq('subject', subject)
            .neq('queue_status', 'completed')
        } else {
          insertedSubjects.add(subject)
        }
      }

      // Solo se considera fallo real cuando NINGUNA asignatura pudo
      // sembrarse: con al menos una viva, el alumno tiene Camino.
      if (insertedSubjects.size === 0 && failedSubjects.length > 0) {
        throw new Error(`Queue insert error: ninguna asignatura pudo sembrarse (${failedSubjects.join(', ')})`)
      }
    }

    // ── PASO 3: camino_calendar (primeros días de plan) ─────────────────────
    //
    // Los días NO salen ya de `getStudyDays(today, 14)`, que no sabía nada del
    // alumno: proponía 14 días laborables aunque estudiara dos días a la
    // semana, y seguía proponiendo aunque la PAU cayera dentro de esos 14 días
    // (una cuenta creada el 31/05 recibía fechas hasta el 18/06, con el examen
    // el 07/06). Salen del mismo motor y del mismo contexto de disponibilidad
    // que usan la extensión diaria y la previsión del navegador.
    const today = getMadridToday()
    const planContext = await loadStudentPlanContext(userId, db, today, declaredAvailability)

    const ONBOARDING_PLAN_DAYS = 14
    const planDays = buildPlanDays({
      from: today,
      to: addDaysIso(today, ONBOARDING_PLAN_DAYS * 4),
      examDate: planContext.examDate,
      subjects: [],   // se rellena abajo, cuando ya se sabe qué colas existen
      weeklyStudyDays: planContext.weeklyStudyDays,
      dailyMinutes: planContext.dailyMinutes,
      holidays: SPAIN_HOLIDAYS,
      reservedFinalStudyDays: FINAL_REVIEW_RESERVED_STUDY_DAYS,
      origin: 'server',
    })
    const contentDays = planDays
      .filter(day => day.excludedReason == null || day.excludedReason === 'no_subject_available')
      .map(day => day.date)
      .slice(0, ONBOARDING_PLAN_DAYS)

    // ENTRADA MUY TARDÍA. Un alumno que se registra dentro de la ventana de
    // repaso final (p. ej. el 31/05 con la PAU el 07/06) no tiene NI UN día
    // para temario nuevo: el motor devuelve cero fechas, y eso es correcto.
    //
    // Lo que NO puede pasar es que se quede sin plan. Sin parciales añadidos
    // ni calendario previo, este generador no producía ninguna misión, y el
    // finalizador rechaza ese resultado (`calendar_verification_failed`): una
    // cuenta que entra en la última semana no llegaba a terminar el
    // onboarding. Reservar días para repaso obliga a CREAR el repaso.
    //
    // La rama tardía usa los días de la propia reserva y siembra repaso en vez
    // de lecciones completas: a una semana de la prueba, la primera acción
    // útil es volver sobre lo que ya se dio, no empezar temario nuevo.
    const finalSprint = contentDays.length === 0
    // Los días del sprint salen del MISMO contexto, no de una lista abierta
    // aquí. Cuando el patrón declarado no deja ni un día antes del examen, es
    // `buildStudentPlanContext` quien abre la semana entera
    // (`emergencyAvailability`), y por tanto lo saben todos los pasos: la
    // personalización usa esa misma disponibilidad y ya no puede deshacer lo
    // que este siembra. Abrir los días aquí y no allí dejaba el Camino vacío
    // en cuanto corría la personalización.
    const sprintDays = finalSprint
      ? planningDates(planContext, { limit: ONBOARDING_PLAN_DAYS, includeFinalReviewWindow: true })
      : []
    const studyDays = finalSprint ? sprintDays : contentDays
    const { data: existingCal } = studyDays.length > 0
      ? await db
        .from('camino_calendar')
        .select('scheduled_date, locked')
        .eq('user_id', userId)
        .gte('scheduled_date', studyDays[0])
        .lte('scheduled_date', studyDays[studyDays.length - 1])
      : { data: [] as Array<{ scheduled_date: string; locked: boolean | null }> }

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
    // Solo se reparten días entre asignaturas que de verdad tienen cola. Sin
    // esto, una asignatura descartada arriba (o sin temario publicado) seguía
    // recibiendo su turno en subjectForDay y esos días se quedaban vacíos.
    const scheduleSubjects = subjects.filter(s => (subjectQueues[s]?.length ?? 0) > 0)
    const cursors: Record<string, number> = Object.fromEntries(scheduleSubjects.map(s => [s, 0]))

    const slotsPerDay = missionsPerDayForMinutes(planContext.dailyMinutes)

    const calRows: object[] = []
    const scheduledQueueIds: string[] = []
    const now = new Date().toISOString()

    for (const dateStr of studyDays) {
      if (lockedDates.has(dateStr) || takenDates.has(dateStr)) continue

      // hasWork evita que un día lectivo se pierda porque a la asignatura que
      // le tocaba ya no le queda cola: la rotación cede el turno a la
      // siguiente asignatura que sí tenga temario pendiente.
      const subject = subjectForDay(dateStr, scheduleSubjects, planContext.studyDayIndexes, s => {
        const queue = subjectQueues[s] ?? []
        return (cursors[s] ?? 0) < queue.length
      })
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
        // En la rama de entrada muy tardía todo entra como REPASO: los días
        // disponibles son los de la reserva final, y ahí no se siembra
        // temario nuevo. El título lo dice, para que el alumno vea qué es.
        const missionType = finalSprint ? 'review' : ((itemMeta.mission_type as string) ?? 'concept')
        const baseMetadata = itemMeta.express
          ? { express: true, topic_slug: topicMeta.topicSlug }
          : { topic_slug: topicMeta.topicSlug }
        const calMetadata = finalSprint
          ? { ...baseMetadata, plan_mode: 'final_sprint', final_review_window: true, knowledge_verified: false }
          : baseMetadata

        calRows.push({
          user_id: userId,
          scheduled_date: dateStr,
          subject: item.subject,
          v2_sort_order: item.v2_sort_order,
          title: finalSprint
            ? `Práctica prioritaria: ${sanitizeLessonTitle(item.title)}`
            : sanitizeLessonTitle(item.title),
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

    await injectOnboardingPartials(planContext)
    // La personalización recibe el MISMO contexto: sin él reubicaba las filas
    // por patrón semanal sin saber que había una fecha de examen delante.
    const personalization = await applyCalendarPersonalization(userId, db, { planContext, declared: declaredAvailability })
    if (personalization.reason === 'error') throw new Error('Calendar insert error: personalization failed')

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

    return { success: true, daysGenerated: calRows.length, firstMission: missions[0] ?? null, missions, skippedSubjects: failedSubjects }
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
