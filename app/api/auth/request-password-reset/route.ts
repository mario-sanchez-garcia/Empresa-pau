import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { reserveAuthEmailAttempt } from '@/app/lib/auth/durableRateLimit'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getRequestIp(headers: Headers): string {
  return headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Escribe un email válido.' }, { status: 400 })
  }

  const reservation = await reserveAuthEmailAttempt(createServiceClient(), {
    email,
    ip: getRequestIp(request.headers),
    action: 'password_recovery',
  })
  if (!reservation.ok) {
    return NextResponse.json({ error: 'La recuperación no está disponible ahora mismo. Inténtalo más tarde.' }, { status: 503 })
  }
  if (!reservation.allowed) {
    return NextResponse.json(
      { error: 'Espera antes de solicitar otro enlace.' },
      { status: 429, headers: { 'Retry-After': String(reservation.retryAfterSeconds) } },
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/login/reset-password`,
  })
  if (error) {
    console.error('[auth/password-reset] provider request failed', { status: error.status ?? null, code: error.code ?? null })
    return NextResponse.json({ error: 'No se pudo solicitar el enlace. Inténtalo más tarde.' }, { status: 503 })
  }

  // Deliberately generic: provider acceptance is not proof of delivery and
  // must not reveal whether the address belongs to an account.
  return NextResponse.json({ ok: true, delivery: 'requested' })
}
