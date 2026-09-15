import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { coveredBlockCount, isStartMode, queueMetadataFor, type StartMode } from '@/app/lib/camino/startingPoint'
import { canRepositionAutomatically } from '@/app/lib/camino/automaticPlacement'
import { minutesForPlacement, placementDurationMetadata } from '@/app/lib/camino/placementDuration'
import { minutesBetweenTimes, normalizeTime, toMinutes } from '@/app/lib/camino/missionDuration'
import { loadStudentPlanContext } from '@/app/lib/camino/studentPlanContext'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'

export const dynamic = 'force-dynamic'

// Volver a declarar el punto de partida de UNA asignatura después del
// onboarding.
//
// Existe porque la previsión de Camino sabía decir "te quedan 102 horas
// fuera" y solo sabía proponer una salida: estudiar más horas al día. Para un
// alumno de cuatro asignaturas con el curso empezado esa no es una respuesta
// — la respuesta es que buena parte de ese temario ya lo ha dado en clase y
// no necesita verlo por primera vez.
//
// El alumno declara QUÉ LECCIONES ha dado, por su nombre. Ni una fracción del
// temario ("el primer bloque", "voy por la mitad") ni solo bloques enteros:
//
//  · La fracción da por hecho que todos los institutos recorren el temario en
//    NUESTRO orden, y no lo hacen. El primer bloque de la lista de Kairo no es
//    por donde empezó su clase, así que marcaba como vistos bloques que no ha
//    tocado y dejaba como nuevos los que sí.
//  · El bloque entero tampoco vale: haber dado media Álgebra es lo normal a
//    mitad de curso, no un caso raro.
//
// La lista la devuelve el GET de aquí mismo, sacada de su propia cola, que es
// el único sitio donde el temario es suyo y no nuestro.
//
// `mode` y `blocks` se siguen aceptando: `mode` porque el onboarding todavía
// declara así, `blocks` como atajo. La tarjeta manda lecciones.
//
// Se mantiene la regla de startingPoint.ts, que no se negocia: lo declarado
// NUNCA se marca como completado. Pasa de temario nuevo a repaso express, más
// corto, pero sigue en el plan y sigue contando en el denominador curricular.
// Declarar no es demostrar.
//
// Solo toca trabajo PENDIENTE y colocado automáticamente: una lección ya
// terminada no se reescribe, y una sesión que el alumno movió a mano se
// respeta igual que en cualquier otro pase.

function hhmm(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

type QueueRow = { id: string; title: string | null; block_key: string | null; metadata: Record<string, unknown> | null; subject_position: number | null }

async function readQueue(db: ReturnType<typeof createServiceClient>, userId: string, subject: string) {
  const { data, error } = await db
    .from('user_learning_queue')
    .select('id, title, block_key, metadata, subject_position')
    .eq('user_id', userId)
    .eq('subject', subject)
    // 'pending' es lo que aún no tiene misión y 'scheduled' lo que ya la
    // tiene. Hay que convertir las dos: si se dejara fuera 'scheduled', lo
    // declarado no tocaría precisamente las semanas que el alumno tiene ya
    // planificadas, que son las que está mirando cuando lo declara.
    // 'completed' nunca entra — eso ya está hecho y no se reescribe.
    .in('queue_status', ['pending', 'scheduled'])
    .order('subject_position', { ascending: true })
  if (error) throw new Error(`Queue read: ${error.message}`)
  return (data ?? []) as QueueRow[]
}

type LessonRow = { id: string; title: string; declared: boolean }

/**
 * Lo que el alumno tiene POR DELANTE en una asignatura, en su orden, agrupado
 * por bloque pero LECCIÓN A LECCIÓN.
 *
 * El bloque no es la unidad correcta para declarar: se puede haber dado media
 * Álgebra y no toda. Se sigue devolviendo el bloque porque es como el alumno
 * reconoce su temario y porque marcarlo entero de una vez es el caso rápido,
 * pero quien decide es la lección.
 */
function blocksOf(queue: readonly QueueRow[]) {
  const blocks = new Map<string, { key: string; lessons: LessonRow[] }>()
  for (const item of queue) {
    const key = item.block_key ?? 'Sin bloque'
    const block = blocks.get(key) ?? { key, lessons: [] }
    block.lessons.push({
      id: item.id,
      title: item.title ?? 'Lección sin título',
      declared: (item.metadata as Record<string, unknown> | null)?.mission_type === 'review',
    })
    blocks.set(key, block)
  }
  return [...blocks.values()]
}

/**
 * El temario por delante de cada asignatura del alumno, para que la tarjeta
 * pregunte por NOMBRE en vez de por fracción.
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    const db = createServiceClient()
    // Por defecto solo pendiente/programado: es lo que tiene sentido
    // declarar como "ya dado". `?status=any` amplía a CUALQUIER fila
    // (incluida completada) — lo usa "+ Añadir asignatura" para saber si
    // una asignatura tiene cola real y no confundir "100% terminada" con
    // "nunca se sembró" (esa sí hay que poder volver a pedirla).
    // request.url puede faltar en llamadas directas de test — sin URL no hay
    // query que leer, así que se queda en el comportamiento de siempre.
    const includeCompleted = typeof request.url === 'string' && new URL(request.url).searchParams.get('status') === 'any'
    let queueQuery = db.from('user_learning_queue').select('subject').eq('user_id', user.id)
    queueQuery = includeCompleted ? queueQuery : queueQuery.in('queue_status', ['pending', 'scheduled'])
    const { data: rows, error } = await queueQuery
    if (error) throw new Error(`Subjects read: ${error.message}`)

    const subjects = [...new Set((rows ?? []).map(row => normalizeSubjectSlug(row.subject)))]
    const bySubject: Record<string, ReturnType<typeof blocksOf>> = {}
    for (const subject of subjects) bySubject[subject] = blocksOf(await readQueue(db, user.id, subject))

    return NextResponse.json({ ok: true, subjects: bySubject })
  } catch (err) {
    console.error('[camino/start-mode GET]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* cuerpo vacío -> 400 abajo */ }

    const subject = typeof body.subject === 'string' ? normalizeSubjectSlug(body.subject) : ''
    if (!subject) return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })

    // Tres formas de declarar, de más precisa a menos:
    //   `lessons` — qué lecciones exactas ha dado. Es la que usa la tarjeta:
    //               media Álgebra es el caso normal, no la excepción.
    //   `blocks`  — bloques enteros, el atajo.
    //   `mode`    — una fracción del temario. Solo la usa todavía el
    //               onboarding, y da por hecho nuestro orden de bloques.
    const stringList = (value: unknown) => Array.isArray(value)
      ? value.filter((item: unknown): item is string => typeof item === 'string' && item.length > 0)
      : null
    const declaredLessons = stringList(body.lessons)
    const declaredBlocks = declaredLessons == null ? stringList(body.blocks) : null
    if (declaredLessons == null && declaredBlocks == null && !isStartMode(body.mode)) {
      return NextResponse.json({ error: 'Punto de partida no válido' }, { status: 400 })
    }
    const mode: StartMode = isStartMode(body.mode) ? body.mode : 'zero'

    const db = createServiceClient()

    const queue = await readQueue(db, user.id, subject)
    if (!queue.length) return NextResponse.json({ error: 'Esta asignatura no tiene temario por delante' }, { status: 409 })

    // Los bloques se cuentan sobre el temario que LE QUEDA, no sobre el de la
    // asignatura entera: lo ya completado no está en esta lista.
    const uniqueBlocks = [...new Set(queue.map(item => item.block_key))]
    // Lo que el alumno no tiene por delante no se puede declarar: si llega
    // algo así, es que la pantalla venía de una lista vieja.
    const queueIds = new Set(queue.map(item => item.id))
    const unknown = declaredLessons?.filter(id => !queueIds.has(id))
      ?? declaredBlocks?.filter(key => !uniqueBlocks.includes(key)) ?? []
    if (unknown.length > 0) {
      return NextResponse.json({ error: 'Ese temario ya no está en tu Camino; recarga la página' }, { status: 409 })
    }
    // La declaración es COMPLETA: lo que no viene marcado vuelve a ser temario
    // nuevo. Así desmarcar deshace en vez de dejar la declaración pegada para
    // siempre.
    const declaredIds = declaredLessons != null ? new Set(declaredLessons) : null
    const covered = new Set(declaredBlocks ?? uniqueBlocks.slice(0, coveredBlockCount(mode, uniqueBlocks.length)))
    const isDeclared = (item: QueueRow) => declaredIds != null ? declaredIds.has(item.id) : covered.has(item.block_key)

    const planContext = await loadStudentPlanContext(user.id, db)
    const dailyMinutes = planContext.dailyMinutes

    const changedById = new Map<string, { missionType: string; minutes: number; metadata: Record<string, unknown> }>()
    for (const item of queue) {
      const previous = (item.metadata as Record<string, unknown> | null) ?? {}
      const topicSlug = typeof previous.topic_slug === 'string' ? previous.topic_slug : ''
      const isCovered = isDeclared(item)
      // Declarando temario concreto no se toca nada más que el tipo: `mode`
      // traía consigo marcas de procedencia (`beta_sequence`) que aquí serían
      // falsas, porque este alumno no viene de una siembra nueva.
      const next = declaredIds != null || declaredBlocks != null
        ? (isCovered
            ? { mission_type: 'review' as const, express: true as const, topic_slug: topicSlug, declared_by_student: true }
            : { mission_type: 'concept' as const, topic_slug: topicSlug, declared_by_student: true })
        : queueMetadataFor(mode, isCovered, topicSlug)
      // `beta_sequence` y demás marcas de procedencia se conservan: solo se
      // reescribe lo que declara el punto de partida.
      const metadata: Record<string, unknown> = { ...previous, ...next }
      if (!('express' in next)) delete metadata.express
      if (previous.mission_type === next.mission_type && Boolean(previous.express) === Boolean(next.express)) continue
      changedById.set(item.id, {
        missionType: next.mission_type,
        minutes: minutesForPlacement(next.mission_type, metadata, dailyMinutes),
        metadata,
      })
    }

    if (changedById.size === 0) {
      return NextResponse.json({ ok: true, changedQueueItems: 0, changedMissions: 0 })
    }


    for (const [id, change] of changedById) {
      const { error } = await db.from('user_learning_queue')
        .update({ metadata: change.metadata })
        .eq('id', id).eq('user_id', user.id).in('queue_status', ['pending', 'scheduled'])
      if (error) throw new Error(`Queue update: ${error.message}`)
    }

    // Las misiones ya sembradas desde esas filas tienen que contar lo que
    // ahora son. Sin esto la cola decía "repaso de 20 min" y el calendario
    // seguía reservando el hueco de una lección nueva, así que la previsión no
    // se movía y el alumno no veía efecto ninguno.
    const { data: missions, error: missionError } = await db
      .from('camino_calendar')
      .select('id, status, source, locked, metadata, start_time, end_time, queue_id')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .in('status', ['pending', 'postponed', 'unscheduled'])
      .in('queue_id', [...changedById.keys()])
    if (missionError) throw new Error(`Calendar read: ${missionError.message}`)

    let changedMissions = 0
    for (const mission of missions ?? []) {
      if (!mission.queue_id || !canRepositionAutomatically(mission)) continue
      const change = changedById.get(mission.queue_id)
      if (!change) continue
      const previous = (mission.metadata as Record<string, unknown> | null) ?? {}
      const metadata: Record<string, unknown> = {
        ...previous,
        ...placementDurationMetadata(change.missionType, change.metadata, dailyMinutes),
      }
      if (change.metadata.express) metadata.express = true
      else delete metadata.express
      const update: Record<string, unknown> = { mission_type: change.missionType, metadata }
      // El hueco reservado se encoge desde su inicio; nunca se alarga ni se
      // mueve de día, para no empujar a otra misión fuera de su sitio.
      const reserved = minutesBetweenTimes(mission.start_time, mission.end_time)
      if (mission.start_time && reserved != null && change.minutes < reserved) {
        update.end_time = hhmm(toMinutes(normalizeTime(mission.start_time)) + change.minutes)
      }
      const { error } = await db.from('camino_calendar').update(update).eq('id', mission.id).eq('user_id', user.id)
      if (error) throw new Error(`Calendar update: ${error.message}`)
      changedMissions++
    }

    // El tiempo liberado tiene que llenarse con el temario que venía detrás:
    // si no, declarar "ya lo he dado" solo vaciaría el calendario.
    await ensureCaminoCalendar(user.id, db)
    await applyCalendarPersonalization(user.id, db)

    return NextResponse.json({ ok: true, changedQueueItems: changedById.size, changedMissions })
  } catch (err) {
    console.error('[camino/start-mode]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
