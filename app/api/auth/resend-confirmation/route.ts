import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const RESEND_COOLDOWN_SECONDS = 60
const RESEND_IP_HOURLY_LIMIT = 12

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
  const nextPath = typeof body.next === 'string' && body.next.startsWith('/') ? body.next : '/onboarding'
  const draftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const ip = getRequestIp(req.headers)
  const cooldownSince = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000).toISOString()
  const hourSince = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const [recentEmail, hourlyIp] = await Promise.all([
    admin.from('auth_email_attempts').select('id', { count: 'exact', head: true }).eq('email', email).eq('action', 'signup_confirmation').gte('created_at', cooldownSince),
    admin.from('auth_email_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).eq('action', 'signup_confirmation').gte('created_at', hourSince),
  ])
  if ((!recentEmail.error && (recentEmail.count ?? 0) > 0) || (!hourlyIp.error && (hourlyIp.count ?? 0) >= RESEND_IP_HOURLY_LIMIT)) {
    // `retryAfterSeconds` en el cuerpo, además de la cabecera: la pantalla de
    // verificación enseña una cuenta atrás y el servidor es quien tiene el
    // registro real de envíos (auth_email_attempts). Sin esto, una pestaña
    // recién abierta creería que puede reenviar ya.
    return NextResponse.json(
      { error: 'Espera 1 minuto antes de volver a intentarlo.', retryAfterSeconds: RESEND_COOLDOWN_SECONDS },
      { status: 429, headers: { 'Retry-After': String(RESEND_COOLDOWN_SECONDS) } }
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
    console.error('[resend-confirmation] error:', error.message)
    return NextResponse.json({ error: 'No se pudo reenviar el correo. Inténtalo más tarde.' }, { status: 500 })
  }

  const { error: auditError } = await admin.from('auth_email_attempts').insert({ email, ip, action: 'signup_confirmation' })
  if (auditError) console.error('[resend-confirmation] failed to record attempt:', auditError.message)
  return NextResponse.json({ ok: true })
}
