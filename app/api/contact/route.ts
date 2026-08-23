import { NextRequest, NextResponse } from 'next/server'
import { sendContactMessage } from '@/app/lib/email/sendContactMessage'

export const dynamic = 'force-dynamic'

// In-memory rate limiter: max 5 messages per IP per hour. Resets on server
// restart — sufficient for private-beta scale (same pattern as /api/waitlist).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_MAX = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (record.count >= RATE_MAX) return false
  record.count++
  return true
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Has enviado demasiados mensajes seguidos. Prueba de nuevo en un rato.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'No hemos podido leer el formulario. Recarga la página e inténtalo de nuevo.' }, { status: 400 })
  }

  const name = (body.name as string | undefined)?.trim() ?? ''
  const email = (body.email as string | undefined)?.trim().toLowerCase() ?? ''
  const subject = (body.subject as string | undefined)?.trim() ?? ''
  const message = (body.message as string | undefined)?.trim() ?? ''

  if (name.length < 2) {
    return NextResponse.json({ error: 'Escribe tu nombre.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Ese email no parece válido. Revísalo y vuelve a intentarlo.' }, { status: 400 })
  }
  if (subject.length < 3) {
    return NextResponse.json({ error: 'Cuéntanos brevemente el motivo en el asunto.' }, { status: 400 })
  }
  if (message.length < 10) {
    return NextResponse.json({ error: 'Tu mensaje es demasiado corto — danos un poco más de contexto.' }, { status: 400 })
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: 'Tu mensaje es demasiado largo (máx. 4000 caracteres).' }, { status: 400 })
  }

  try {
    await sendContactMessage({ name, email, subject, message })
  } catch (err) {
    console.error('[contact POST] sendContactMessage failed:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'No hemos podido enviar tu mensaje. Escríbenos directamente a hola@kairo.es mientras lo arreglamos.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
