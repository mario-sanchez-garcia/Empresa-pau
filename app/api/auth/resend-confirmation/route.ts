import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { safeLocalRedirect } from '@/app/lib/auth/safeRedirect'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { reserveAuthEmailAttempt } from '@/app/lib/auth/durableRateLimit'

function getRequestIp(headers: Headers): string {
  return headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  let body: { email?: unknown; next?: unknown; draft_id?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }
  // Fase 2: preserva next/draft_id igual que /api/auth/signup, para que un
  // reenvío desde /onboarding/revisa-tu-email siga apuntando a
  // /onboarding/finalizando?draft=... en vez de caer al /onboarding genérico.
  const nextPath = safeLocalRedirect(body.next, '/onboarding')
  const draftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null

  const admin = createServiceClient()
  const ip = getRequestIp(req.headers)
  const reservation = await reserveAuthEmailAttempt(admin, { email, ip, action: 'signup_confirmation' })
  if (!reservation.ok) {
    return NextResponse.json({ error: 'El reenvío no está disponible ahora mismo. Inténtalo más tarde.' }, { status: 503 })
  }
  if (!reservation.allowed) {
    return NextResponse.json(
      { error: 'Espera 1 minuto antes de volver a intentarlo.', retryAfterSeconds: reservation.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(reservation.retryAfterSeconds) } }
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
  //
  // Sigue enviándose aunque el flujo nuevo sea por código: durante el rollout
  // la plantilla de Supabase lleva {{ .Token }} Y el enlace, y el mismo token
  // sirve para las dos vías. Quitar esto rompería el enlace de respaldo.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'
  const redirectQuery = new URLSearchParams({ next: nextPath })
  if (draftId) {
    redirectQuery.set('draft', draftId)
    redirectQuery.set('method', 'email')
  }
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${appUrl}/auth/callback?${redirectQuery.toString()}` },
  })

  if (error) {
    if (error.code === 'user_not_found' || /user not found/i.test(error.message)) {
      return NextResponse.json({ ok: true, delivery: 'requested' })
    }
    console.error('[resend-confirmation] provider request failed', { status: error.status ?? null, code: error.code ?? null })
    return NextResponse.json({ error: 'No se pudo reenviar el correo. Inténtalo más tarde.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, delivery: 'requested' })
}
