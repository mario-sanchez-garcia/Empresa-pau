import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const SIGNUP_RATE_LIMIT = 10
const SIGNUP_WINDOW_SECONDS = 3600

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

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // IP-based rate limit: 10 successful signups per IP per hour
  const ip = getSignupIp(req.headers)
  const since = new Date(Date.now() - SIGNUP_WINDOW_SECONDS * 1000).toISOString()

  const { count, error: countError } = await adminSupabase
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since)

  if (!countError && (count ?? 0) >= SIGNUP_RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Demasiados registros desde esta IP. Inténtalo más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(SIGNUP_WINDOW_SECONDS) },
      }
    )
  }

  // Create user with email already confirmed (bypasses email confirmation requirement)
  const { error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Sign in immediately to get a session
  const { data: signInData, error: signInError } = await adminSupabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData.session) {
    return NextResponse.json({ error: 'Cuenta creada pero no se pudo iniciar sesión. Inténtalo manualmente.' }, { status: 500 })
  }

  // Record successful signup — inserted after success so errors don't consume quota
  await adminSupabase.from('signup_attempts').insert({ ip })

  return NextResponse.json({ session: signInData.session })
}
