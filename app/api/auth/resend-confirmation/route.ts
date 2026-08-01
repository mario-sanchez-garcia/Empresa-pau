import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limit: 1 resend per email per minute
const resendLog = new Map<string, number>()

export async function POST(req: NextRequest) {
  let body: { email?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  const lastSent = resendLog.get(email)
  if (lastSent && Date.now() - lastSent < 60_000) {
    return NextResponse.json(
      { error: 'Espera 1 minuto antes de volver a intentarlo.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Same emailRedirectTo as the original signUp() call — without it this
  // link falls back to the Supabase Site URL (the landing page) instead of
  // /auth/callback?next=/onboarding.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${appUrl}/auth/callback?next=%2Fonboarding` },
  })

  if (error) {
    console.error('[resend-confirmation] error:', error.message)
    return NextResponse.json({ error: 'No se pudo reenviar el correo. Inténtalo más tarde.' }, { status: 500 })
  }

  resendLog.set(email, Date.now())
  return NextResponse.json({ ok: true })
}
