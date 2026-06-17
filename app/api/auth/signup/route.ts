import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  // Create user with email already confirmed (bypasses email confirmation requirement)
  const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
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

  return NextResponse.json({ session: signInData.session })
}
