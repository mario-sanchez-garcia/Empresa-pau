import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const SIGNUP_IP_RATE_LIMIT = 10
const SIGNUP_EMAIL_RATE_LIMIT = 5
const SIGNUP_WINDOW_SECONDS = 3600
const SIGNUP_FAILED_ERROR =
  'No se pudo crear la cuenta. Si ya tienes una cuenta, inicia sesión.'

// x-real-ip is set by Vercel's edge to the actual connecting client IP and cannot
// be injected by clients. x-forwarded-for[0] is spoofable, so it is only used as
// a fallback for local dev where x-real-ip is not present.
function getSignupIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function isAlreadyRegisteredError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('already been registered') ||
    message.includes('already registered') ||
    message.includes('user already exists')
  )
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { email, password } = body
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const normalizedPassword = typeof password === 'string' ? password : ''

  if (!normalizedEmail || !normalizedPassword) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Durable signup rate limit: 10 attempts per IP/hour and 5 per email/hour.
  const ip = getSignupIp(req.headers)
  const since = new Date(Date.now() - SIGNUP_WINDOW_SECONDS * 1000).toISOString()

  try {
    const [ipLimit, emailLimit] = await Promise.all([
      adminSupabase
        .from('signup_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('ip', ip)
        .gte('created_at', since),
      adminSupabase
        .from('signup_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('email', normalizedEmail)
        .gte('created_at', since)
    ])

    if (
      (!ipLimit.error && (ipLimit.count ?? 0) >= SIGNUP_IP_RATE_LIMIT) ||
      (!emailLimit.error && (emailLimit.count ?? 0) >= SIGNUP_EMAIL_RATE_LIMIT)
    ) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Prueba de nuevo más tarde.' },
        {
          status: 429,
          headers: { 'Retry-After': String(SIGNUP_WINDOW_SECONDS) },
        }
      )
    }

    // Create user with email already confirmed (bypasses email confirmation requirement)
    const { error: createError } = await adminSupabase.auth.admin.createUser({
      email: normalizedEmail,
      password: normalizedPassword,
      email_confirm: true,
    })

    if (createError) {
      if (isAlreadyRegisteredError(createError)) {
        return NextResponse.json({ error: SIGNUP_FAILED_ERROR }, { status: 409 })
      }

      return NextResponse.json({ error: SIGNUP_FAILED_ERROR }, { status: 400 })
    }

    // Sign in immediately to get a session
    const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    })

    if (signInError || !signInData.session) {
      return NextResponse.json({ error: 'Cuenta creada pero no se pudo iniciar sesión. Inténtalo manualmente.' }, { status: 500 })
    }

    return NextResponse.json({ session: signInData.session })
  } finally {
    const { error } = await adminSupabase.from('signup_attempts').insert({ ip, email: normalizedEmail })
    if (error) console.error('[auth/signup] failed to record signup attempt:', error.message)
  }
}
