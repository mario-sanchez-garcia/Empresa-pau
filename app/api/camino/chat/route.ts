import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { normalizeSubjectSlug, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { missionPriorityScore, priorityReasonsForMission } from '@/app/lib/camino/orientationPriority'
import { normalizeChatText, parseCaminoChatAction } from '@/app/lib/camino/chatActions'

export const dynamic = 'force-dynamic'

type MissionRow = {
  id: string
  scheduled_date: string
  subject: string
  title: string
  block_key: string | null
  block_slug: string | null
  mission_type: string
  is_main: boolean
  is_bonus: boolean
  status: string
  start_time: string | null
  end_time: string | null
  v2_sort_order: number | null
  metadata: Record<string, unknown> | null
}

type TopicRow = {
  id: string
  subject: string
  block_key: string
  block_title: string
  topic_slug: string
  title: string
}

export type CaminoChatPreview =
  | { kind: 'MOVE_MISSION'; missionId: string; missionTitle: string; subject: string; fromDate: string; toDate: string; startTime: string | null; durationMinutes: number }
  | { kind: 'CREATE_EXTRA_MISSION'; subject: string; subjectLabel: string; title: string; topicSlug: string | null; blockKey: string | null; blockSlug: string | null; scheduledDate: string; startTime: string | null; durationMinutes: number }
  | { kind: 'CREATE_EXAM'; subject: string; subjectLabel: string; topic: string; date: string }
  | { kind: 'POSTPONE_MISSION'; missionId: string; missionTitle: string; subject: string; v2SortOrder: number }
  | { kind: 'REORGANIZE_DAY'; sourceDate: string; missionIds: string[]; summary: string[] }

function madridToday() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function minutesBetween(start: string | null, end: string | null) {
  if (!start || !end) return 30
  const [sh, sm] = start.slice(0, 5).split(':').map(Number)
  const [eh, em] = end.slice(0, 5).split(':').map(Number)
  return Math.max(5, Math.min(180, eh * 60 + em - (sh * 60 + sm)))
}

function cleanMessage(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : ''
}

function relevance(query: string, ...values: Array<string | null | undefined>) {
  const haystack = normalizeChatText(values.filter(Boolean).join(' '))
  const tokens = normalizeChatText(query).split(/\s+/).filter(token => token.length >= 3 && !['mision', 'jueves', 'viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'manana', 'pasame'].includes(token))
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? token.length : 0), 0)
}

function resolveMission(query: string | undefined, missions: MissionRow[]) {
  if (!query) return missions.length === 1 ? missions[0] : null
  return missions
    .map(mission => ({ mission, score: relevance(query, mission.subject, subjectLabelFromSlug(mission.subject), mission.title, mission.block_key) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.mission.scheduled_date.localeCompare(b.mission.scheduled_date))[0]?.mission ?? null
}

function resolveSubject(query: string | undefined, subjects: string[]) {
  if (!query) return null
  const ranked = subjects
    .map(subject => ({ subject: normalizeSubjectSlug(subject), score: relevance(query, subject, normalizeSubjectSlug(subject), subjectLabelFromSlug(normalizeSubjectSlug(subject))) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.subject ?? null
}

function friendlyDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(`${date}T12:00:00+02:00`))
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const message = cleanMessage(body.message)
    if (!message) return NextResponse.json({ error: 'message_required' }, { status: 400 })

    const today = madridToday()
    const action = parseCaminoChatAction(message, today)
    const db = createServiceClient()
    const [calendarResult, profileResult] = await Promise.all([
      db.from('camino_calendar')
        .select('id, scheduled_date, subject, title, block_key, block_slug, mission_type, is_main, is_bonus, status, start_time, end_time, v2_sort_order, metadata')
        .eq('user_id', auth.user.id)
        .eq('status', 'pending')
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(90),
      db.from('perfiles').select('subjects, student_exams').eq('id', auth.user.id).maybeSingle(),
    ])
    if (calendarResult.error) throw calendarResult.error
    if (profileResult.error) throw profileResult.error
    const missions = (calendarResult.data ?? []) as MissionRow[]
    const profileSubjects = Array.isArray(profileResult.data?.subjects)
      ? profileResult.data.subjects.filter((value): value is string => typeof value === 'string')
      : []
    const subjects = [...new Set([...profileSubjects, ...missions.map(mission => mission.subject)])]

    if (action.intent === 'SUGGEST_STUDY' || action.intent === 'ASK_PRIORITY') {
      const candidates = missions.filter(mission => !action.targetDate || mission.scheduled_date === action.targetDate)
      const mission = [...(candidates.length ? candidates : missions)]
        .sort((a, b) => {
          const score = missionPriorityScore({ ...b, metadata: b.metadata ?? undefined }, null, today) - missionPriorityScore({ ...a, metadata: a.metadata ?? undefined }, null, today)
          return score || Number(b.is_main) - Number(a.is_main) || a.scheduled_date.localeCompare(b.scheduled_date)
        })[0]
      if (!mission) return NextResponse.json({ reply: 'Todavía no tienes misiones pendientes. Abre el calendario para preparar tu próxima semana.', mutates: false })
      const reasons = priorityReasonsForMission({ ...mission, metadata: mission.metadata ?? undefined }, null, today)
      const storedReasons = Array.isArray(mission.metadata?.priorityReasons)
        ? (mission.metadata?.priorityReasons as Array<{ label?: unknown }>).flatMap(reason => typeof reason.label === 'string' ? [reason.label] : [])
        : []
      const reason = reasons[0]?.label || storedReasons[0] || (mission.is_main ? 'es la misión principal que marca tu Camino para ese día.' : 'encaja con tu progreso y tu semana actual.')
      const when = mission.scheduled_date === today ? 'hoy' : friendlyDate(mission.scheduled_date)
      return NextResponse.json({
        reply: `Empieza por ${mission.title}, de ${subjectLabelFromSlug(mission.subject)}, ${when}. ${reason}`,
        mutates: false,
        evidence: { missionId: mission.id, scheduledDate: mission.scheduled_date },
      })
    }

    if (action.intent === 'MOVE_MISSION') {
      const mission = resolveMission(action.missionQuery, missions)
      if (!mission) return NextResponse.json({ reply: 'No encuentro una única misión pendiente con esa descripción. Dime la asignatura o el título.', mutates: false })
      const toDate = action.targetDate ?? mission.scheduled_date
      const startTime = action.targetTime ?? mission.start_time?.slice(0, 5) ?? null
      const durationMinutes = minutesBetween(mission.start_time, mission.end_time)
      const preview: CaminoChatPreview = { kind: 'MOVE_MISSION', missionId: mission.id, missionTitle: mission.title, subject: mission.subject, fromDate: mission.scheduled_date, toDate, startTime, durationMinutes }
      return NextResponse.json({
        reply: `Puedo mover ${mission.title} al ${friendlyDate(toDate)}${startTime ? ` a las ${startTime}` : ''}.`,
        mutates: true,
        requiresConfirmation: true,
        preview,
      })
    }

    if (action.intent === 'CREATE_EXTRA_MISSION') {
      if (!action.targetDate) return NextResponse.json({ reply: '¿Qué día quieres hacer ese repaso?', mutates: false })
      const { data: topicRows, error: topicsError } = await db
        .from('curriculum_topics')
        .select('id, subject, block_key, block_title, topic_slug, title')
        .limit(800)
      if (topicsError) throw topicsError
      const query = action.topicQuery ?? message
      const activeSubjects = new Set(subjects.map(normalizeSubjectSlug))
      const topic = ((topicRows ?? []) as TopicRow[])
        .filter(row => activeSubjects.has(normalizeSubjectSlug(row.subject)))
        .map(row => ({ row, score: relevance(query, row.title, row.topic_slug, row.block_title, subjectLabelFromSlug(row.subject)) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)[0]?.row
      const subject = topic?.subject ? normalizeSubjectSlug(topic.subject) : resolveSubject(query, subjects)
      if (!subject) return NextResponse.json({ reply: 'No puedo conectar ese repaso con una de tus asignaturas. Dime la asignatura y el tema.', mutates: false })
      const title = topic ? `Repaso extra: ${topic.title}` : `Repaso extra de ${subjectLabelFromSlug(subject)}`
      const preview: CaminoChatPreview = {
        kind: 'CREATE_EXTRA_MISSION', subject, subjectLabel: subjectLabelFromSlug(subject), title,
        topicSlug: topic?.topic_slug ?? null, blockKey: topic?.block_key ?? null, blockSlug: topic?.block_key ?? null,
        scheduledDate: action.targetDate, startTime: action.targetTime ?? null, durationMinutes: action.durationMinutes ?? 30,
      }
      return NextResponse.json({ reply: `Puedo añadir ${title}, ${action.durationMinutes ?? 30} min, el ${friendlyDate(action.targetDate)}${action.targetTime ? ` a las ${action.targetTime}` : ''}.`, mutates: true, requiresConfirmation: true, preview })
    }

    if (action.intent === 'CREATE_EXAM') {
      const subject = resolveSubject(action.subjectQuery ?? message, subjects)
      if (!subject) return NextResponse.json({ reply: '¿De qué asignatura es el examen?', mutates: false })
      if (!action.targetDate) return NextResponse.json({ reply: '¿Qué día es el examen?', mutates: false })
      if (!action.topicQuery) return NextResponse.json({ reply: `¿Qué tema o bloque entra en el examen de ${subjectLabelFromSlug(subject)}?`, mutates: false, pending: { kind: 'CREATE_EXAM', message } })
      const preview: CaminoChatPreview = { kind: 'CREATE_EXAM', subject, subjectLabel: subjectLabelFromSlug(subject), topic: action.topicQuery, date: action.targetDate }
      return NextResponse.json({ reply: `Puedo añadir el examen de ${subjectLabelFromSlug(subject)} del ${friendlyDate(action.targetDate)} sobre ${action.topicQuery}.`, mutates: true, requiresConfirmation: true, preview })
    }

    if (action.intent === 'POSTPONE_MISSION') {
      const mission = resolveMission(action.missionQuery, missions)
      if (!mission) return NextResponse.json({ reply: 'Dime qué misión quieres posponer.', mutates: false })
      if (mission.v2_sort_order == null) return NextResponse.json({ reply: 'Esa misión no pertenece a una lección de curso. Puedo moverla a otro día, pero no marcarla como contenido aún no dado.', mutates: false })
      const preview: CaminoChatPreview = { kind: 'POSTPONE_MISSION', missionId: mission.id, missionTitle: mission.title, subject: mission.subject, v2SortOrder: mission.v2_sort_order }
      return NextResponse.json({ reply: `Puedo marcar “${mission.title}” como contenido aún no dado y dejar que Camino lo reprograme.`, mutates: true, requiresConfirmation: true, preview })
    }

    if (action.intent === 'REORGANIZE_DAY') {
      const dayMissions = missions.filter(mission => mission.scheduled_date === action.sourceDate)
      if (dayMissions.length === 0) return NextResponse.json({ reply: `No tienes misiones pendientes el ${friendlyDate(action.sourceDate ?? today)}.`, mutates: false })
      const preview: CaminoChatPreview = { kind: 'REORGANIZE_DAY', sourceDate: action.sourceDate ?? today, missionIds: dayMissions.map(mission => mission.id), summary: dayMissions.map(mission => `${mission.title} → próximo hueco libre`) }
      return NextResponse.json({ reply: `Puedo reorganizar ${dayMissions.length === 1 ? 'esta misión' : `estas ${dayMissions.length} misiones`} en los próximos huecos libres.`, mutates: true, requiresConfirmation: true, preview })
    }

    return NextResponse.json({ reply: 'Puedo ayudarte con tus misiones, exámenes y calendario. Prueba con “¿qué estudio hoy?” o “mueve Física al viernes”.', mutates: false })
  } catch (error) {
    console.error('[camino/chat]', error)
    return NextResponse.json({ error: 'No he podido consultar tu Camino. Reintentar.' }, { status: 500 })
  }
}
