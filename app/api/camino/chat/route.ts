import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { normalizeSubjectSlug, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { withAnthropicRetry, isOverloadedError } from '@/app/lib/ai/withAnthropicRetry'
import { CAMINO_CHAT_TOOLS, type MoverMisionInput, type AnadirRepasoExtraInput, type AnadirExamenInput, type ReorganizarDiaInput } from '@/app/lib/camino/chatTools'

export const dynamic = 'force-dynamic'

// Capacidad nueva (tool calling sobre el calendario real) -- se pinneó al
// modelo más reciente y capaz a propósito, distinto del claude-sonnet-4-6
// ya estable que usa la corrección de exámenes (exam/correct, camino/correct):
// aquí no hay una regresión que temer sobre un pipeline ya probado, así que
// no hace falta quedarse en el modelo antiguo.
const MODEL = 'claude-sonnet-5'
const MAX_HISTORY_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 1000

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30_000 })

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

export type CaminoChatPreview =
  | { kind: 'MOVE_MISSION'; missionId: string; missionTitle: string; subject: string; fromDate: string; toDate: string; startTime: string | null; durationMinutes: number }
  | { kind: 'CREATE_EXTRA_MISSION'; subject: string; subjectLabel: string; title: string; topicSlug: string | null; blockKey: string | null; blockSlug: string | null; scheduledDate: string; startTime: string | null; durationMinutes: number }
  | { kind: 'CREATE_EXAM'; subject: string; subjectLabel: string; topic: string; date: string }
  | { kind: 'REORGANIZE_DAY'; sourceDate: string; missionIds: string[]; summary: string[] }

function madridToday() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function friendlyDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(`${date}T12:00:00+02:00`))
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^20\d{2}-\d{2}-\d{2}$/.test(value)
}

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function minutesBetween(start: string | null, end: string | null) {
  if (!start || !end) return 30
  const [sh, sm] = start.slice(0, 5).split(':').map(Number)
  const [eh, em] = end.slice(0, 5).split(':').map(Number)
  return Math.max(5, Math.min(180, eh * 60 + em - (sh * 60 + sm)))
}

type ChatTurn = { role: 'user' | 'assistant'; content: string }

// El cliente manda el historial completo cada turno (sin sesión server-side)
// -- reemplaza al pendingContext de un solo string que usaba el parser
// anterior: con conversación real, si a Kairo le falta un dato simplemente
// lo pregunta en texto y el turno siguiente ya trae la respuesta en el
// historial, sin ningún mecanismo especial de "pendiente".
function cleanHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((m): m is { role: string; content: unknown } => Boolean(m) && typeof m === 'object')
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: typeof m.content === 'string' ? m.content.trim().slice(0, MAX_MESSAGE_LENGTH) : '' }))
    .filter(m => m.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const history = cleanHistory(body.messages)
    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'message_required' }, { status: 400 })
    }

    const today = madridToday()
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
    const subjects = [...new Set([...profileSubjects, ...missions.map(mission => mission.subject)])].map(normalizeSubjectSlug)
    const exams = cleanStudentExams(profileResult.data?.student_exams)

    // Contexto real para que Claude pueda referenciar misiones/asignaturas
    // EXISTENTES en vez de inventarlas -- listado acotado (60 misiones) para
    // no disparar el tamaño del prompt en alumnos con muchas semanas por delante.
    const missionLines = missions.slice(0, 60).map(mission =>
      `- id=${mission.id} | ${mission.scheduled_date} (${friendlyDate(mission.scheduled_date)})${mission.start_time ? ` a las ${mission.start_time.slice(0, 5)}` : ' sin hora fija'} | ${subjectLabelFromSlug(mission.subject)} | "${mission.title}"${mission.is_bonus ? ' [bonus]' : ''}`
    ).join('\n') || '(el alumno no tiene misiones pendientes)'
    const subjectLines = subjects.map(subject => `- ${subject} (${subjectLabelFromSlug(subject)})`).join('\n') || '(sin asignaturas activas)'
    const examLines = exams.length
      ? exams.map(exam => `- ${subjectLabelFromSlug(normalizeSubjectSlug(exam.subject))}: ${exam.topic} el ${exam.date}`).join('\n')
      : '(sin exámenes registrados)'

    const systemPrompt = `Eres Kairo, el asistente del "Camino PAU" dentro de la app Kairo. Ayudas al alumno a entender su plan de estudio y, cuando lo pide, a proponer cambios seguros en su calendario real.

Hoy es ${friendlyDate(today)} (${today}), zona horaria Europe/Madrid.

Asignaturas del alumno:
${subjectLines}

Misiones pendientes (usa el id EXACTO si vas a mover alguna):
${missionLines}

Exámenes ya registrados:
${examLines}

REGLAS ESTRICTAS, sin excepción:
1. Nunca inventes ni asumas un dato que el alumno no ha dado explícitamente (hora, asignatura, duración, tema, fecha exacta). Si falta algo necesario para ejecutar una acción con seguridad, PREGÚNTALO en una respuesta de texto normal -- no llames a ninguna herramienta todavía.
2. Cada llamada a una herramienta es solo una PROPUESTA: el alumno tiene que confirmarla aparte antes de que se aplique de verdad. Nunca digas que un cambio "ya se ha hecho" o "ya está aplicado".
3. missionId debe copiarse literalmente del listado de misiones pendientes de arriba. Si no encuentras una misión que encaje con lo que pide el alumno, dilo y pide más detalle (asignatura o título) en vez de adivinar.
4. subject debe ser uno de los slugs exactos de la lista de asignaturas de arriba. Nunca inventes una asignatura que el alumno no tenga activa.
5. No tienes ninguna herramienta para marcar contenido como "no dado en clase" ni para crear Simulacros. Si el alumno lo pide, explica que eso se hace desde la propia pantalla del tema o de Simulacros, no desde este chat.
6. Sé breve, cercano y en español, tuteando al alumno. Nunca menciones nombres de herramientas, ids internos ni detalles técnicos en lo que le dices.`

    const messages: Anthropic.MessageParam[] = history.map(turn => ({ role: turn.role, content: turn.content }))

    const response = await withAnthropicRetry(() => anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools: CAMINO_CHAT_TOOLS,
      messages,
    }))

    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text')
    const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
    const claudeText = textBlock?.text?.trim() || ''

    if (!toolUse) {
      return NextResponse.json({ reply: claudeText || 'No te he entendido bien. ¿Puedes explicármelo de otra forma?', mutates: false })
    }

    if (toolUse.name === 'moverMision') {
      const input = toolUse.input as MoverMisionInput
      const mission = missions.find(candidate => candidate.id === input.missionId)
      if (!mission) return NextResponse.json({ reply: 'No encuentro esa misión en tu calendario. ¿Me dices la asignatura o el título exacto?', mutates: false })
      if (!isValidDate(input.nuevaFecha)) return NextResponse.json({ reply: 'No he entendido bien la fecha nueva. ¿Puedes decírmela otra vez?', mutates: false })
      const startTime = isValidTime(input.nuevaHora) ? input.nuevaHora : mission.start_time?.slice(0, 5) ?? null
      const durationMinutes = minutesBetween(mission.start_time, mission.end_time)
      const preview: CaminoChatPreview = { kind: 'MOVE_MISSION', missionId: mission.id, missionTitle: mission.title, subject: mission.subject, fromDate: mission.scheduled_date, toDate: input.nuevaFecha, startTime, durationMinutes }
      const reply = claudeText || `Puedo mover "${mission.title}" al ${friendlyDate(input.nuevaFecha)}${startTime ? ` a las ${startTime}` : ''}. ¿Lo confirmas?`
      return NextResponse.json({ reply, mutates: true, requiresConfirmation: true, preview })
    }

    if (toolUse.name === 'anadirRepasoExtra') {
      const input = toolUse.input as AnadirRepasoExtraInput
      const subject = normalizeSubjectSlug(input.subject)
      if (!subjects.includes(subject)) return NextResponse.json({ reply: `No veo "${input.subject}" entre tus asignaturas activas. ¿De cuál es el repaso?`, mutates: false })
      if (!isValidDate(input.fecha)) return NextResponse.json({ reply: 'No he entendido bien la fecha del repaso. ¿Qué día quieres hacerlo?', mutates: false })
      if (typeof input.duracionMin !== 'number' || !Number.isFinite(input.duracionMin)) {
        return NextResponse.json({ reply: '¿Cuántos minutos quieres dedicarle a este repaso?', mutates: false })
      }
      const durationMinutes = Math.max(5, Math.min(180, Math.round(input.duracionMin)))
      const startTime = isValidTime(input.hora) ? input.hora : null
      const title = `Repaso extra: ${input.tema}`.slice(0, 200)
      // topicSlug/blockKey siempre null: la IA describe el tema en lenguaje
      // natural, nunca intenta enlazarlo a una fila real de curriculum_topics.
      const preview: CaminoChatPreview = { kind: 'CREATE_EXTRA_MISSION', subject, subjectLabel: subjectLabelFromSlug(subject), title, topicSlug: null, blockKey: null, blockSlug: null, scheduledDate: input.fecha, startTime, durationMinutes }
      const reply = claudeText || `Puedo añadir "${title}" (${durationMinutes} min) el ${friendlyDate(input.fecha)}${startTime ? ` a las ${startTime}` : ''}. ¿Lo confirmas?`
      return NextResponse.json({ reply, mutates: true, requiresConfirmation: true, preview })
    }

    if (toolUse.name === 'anadirExamen') {
      const input = toolUse.input as AnadirExamenInput
      const subject = normalizeSubjectSlug(input.subject)
      if (!subjects.includes(subject)) return NextResponse.json({ reply: `No veo "${input.subject}" entre tus asignaturas activas. ¿De qué asignatura es el examen?`, mutates: false })
      if (!isValidDate(input.fecha) || input.fecha < today) return NextResponse.json({ reply: 'Necesito una fecha futura válida para el examen. ¿Qué día es?', mutates: false })
      if (!input.temario?.trim()) return NextResponse.json({ reply: `¿Qué tema o bloque entra en el examen de ${subjectLabelFromSlug(subject)}?`, mutates: false })
      const preview: CaminoChatPreview = { kind: 'CREATE_EXAM', subject, subjectLabel: subjectLabelFromSlug(subject), topic: input.temario.trim().slice(0, 120), date: input.fecha }
      const reply = claudeText || `Puedo añadir el examen de ${subjectLabelFromSlug(subject)} del ${friendlyDate(input.fecha)} sobre ${preview.topic}. ¿Lo confirmas?`
      return NextResponse.json({ reply, mutates: true, requiresConfirmation: true, preview })
    }

    if (toolUse.name === 'reorganizarDia') {
      const input = toolUse.input as ReorganizarDiaInput
      if (!isValidDate(input.fecha)) return NextResponse.json({ reply: 'No he entendido bien qué día quieres reorganizar.', mutates: false })
      const dayMissions = missions.filter(mission => mission.scheduled_date === input.fecha)
      if (dayMissions.length === 0) return NextResponse.json({ reply: `No tienes misiones pendientes el ${friendlyDate(input.fecha)}.`, mutates: false })
      const preview: CaminoChatPreview = { kind: 'REORGANIZE_DAY', sourceDate: input.fecha, missionIds: dayMissions.map(mission => mission.id), summary: dayMissions.map(mission => `${mission.title} → próximo hueco libre`) }
      const reply = claudeText || `Puedo reorganizar ${dayMissions.length === 1 ? 'esta misión' : `estas ${dayMissions.length} misiones`} del ${friendlyDate(input.fecha)} en los próximos huecos libres. ¿Lo confirmas?`
      return NextResponse.json({ reply, mutates: true, requiresConfirmation: true, preview })
    }

    return NextResponse.json({ reply: claudeText || 'No he podido procesar esa acción. ¿Puedes reformularlo?', mutates: false })
  } catch (error) {
    if (isOverloadedError(error)) {
      return NextResponse.json({ error: 'Kairo está saturado ahora mismo. Reintenta en unos segundos.' }, { status: 503 })
    }
    console.error('[camino/chat]', error)
    return NextResponse.json({ error: 'No he podido consultar tu Camino. Reintentar.' }, { status: 500 })
  }
}
