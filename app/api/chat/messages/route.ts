import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase } from '@/app/lib/camino/caminoProgressServer'
import { isValidChatSubject } from '@/app/lib/chat/chatSubjects'

export const dynamic = 'force-dynamic'

// Cuántos mensajes como máximo devuelve un GET — red de seguridad de payload,
// no un límite de producto: un hilo real de estudio no debería acercarse a
// esto. El recorte real de coste (cuántos mensajes se reenvían a Claude como
// contexto) vive en el cliente, en enviarChat() de page-client.tsx.
const MAX_MESSAGES_RETURNED = 500
const MAX_CONTENT_CHARS = 20000

// GET /api/chat/messages?subject=mates — historial del hilo fijo de esa
// asignatura para el alumno autenticado. Si nunca escribió en esa asignatura
// el hilo no existe todavía: se devuelve vacío, no se crea aquí (solo el
// primer POST crea el hilo).
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  const subject = request.nextUrl.searchParams.get('subject')
  if (!isValidChatSubject(subject)) {
    return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
  }

  const db = createUserSupabase(accessToken)

  const { data: thread, error: threadError } = await db
    .from('chat_threads')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject', subject)
    .maybeSingle()

  if (threadError) {
    console.error('[chat/messages GET] thread lookup failed', threadError)
    return NextResponse.json({ error: 'Error al cargar el historial' }, { status: 500 })
  }

  if (!thread) {
    return NextResponse.json({ threadId: null, messages: [] })
  }

  const { data: messages, error: messagesError } = await db
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })
    .limit(MAX_MESSAGES_RETURNED)

  if (messagesError) {
    console.error('[chat/messages GET] messages fetch failed', messagesError)
    return NextResponse.json({ error: 'Error al cargar el historial' }, { status: 500 })
  }

  return NextResponse.json({
    threadId: thread.id,
    messages: (messages ?? []).map(m => ({ role: m.role, content: m.content, createdAt: m.created_at })),
  })
}

// POST /api/chat/messages — guarda un mensaje (del alumno o de Kairo) en el
// hilo fijo de esa asignatura, creando el hilo si es el primer mensaje.
// No llama a Claude: page-client.tsx sigue usando /api/chat para eso y llama
// aquí por separado justo antes (mensaje del alumno) y justo después
// (respuesta ya completa de Kairo) — así /api/chat, reutilizado por varias
// pantallas de corrección con imagen, no cambia de contrato para nadie más.
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const subject = body.subject
  const role = body.role
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!isValidChatSubject(subject)) {
    return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
  }
  if (role !== 'usuario' && role !== 'kairo') {
    return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
  }
  if (!content) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
  }

  const db = createUserSupabase(accessToken)
  const now = new Date().toISOString()

  const { data: thread, error: threadError } = await db
    .from('chat_threads')
    .upsert({ user_id: user.id, subject, updated_at: now }, { onConflict: 'user_id,subject' })
    .select('id')
    .single()

  if (threadError || !thread) {
    console.error('[chat/messages POST] thread upsert failed', threadError)
    return NextResponse.json({ error: 'Error al guardar el mensaje' }, { status: 500 })
  }

  const { data: message, error: messageError } = await db
    .from('chat_messages')
    .insert({ thread_id: thread.id, role, content: content.slice(0, MAX_CONTENT_CHARS) })
    .select('role, content, created_at')
    .single()

  if (messageError || !message) {
    console.error('[chat/messages POST] message insert failed', messageError)
    return NextResponse.json({ error: 'Error al guardar el mensaje' }, { status: 500 })
  }

  return NextResponse.json({
    threadId: thread.id,
    message: { role: message.role, content: message.content, createdAt: message.created_at },
  })
}
