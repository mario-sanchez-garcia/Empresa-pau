import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

// Marca como leidas las respuestas que el propio alumno acaba de ver en
// Ayuda -> Contactanos. No usamos una politica RLS de UPDATE para esto: el
// ownership se verifica aqui (email de la fila == email verificado del JWT)
// y se usa el service client, igual que el resto de rutas de contact_messages.
export async function PATCH(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData, error: userError } = await authSupabase.auth.getUser(accessToken)
  if (userError || !userData.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)) : []
  if (ids.length === 0) return NextResponse.json({ error: 'ids inválido' }, { status: 400 })

  // El email se guarda siempre en minusculas al insertar (ver POST
  // /api/contact), asi que comparar en minusculas es un match exacto —
  // evitamos ilike porque trata "_" como wildcard y hay emails con guion bajo.
  const db = createServiceClient()
  const { error } = await db
    .from('contact_messages')
    .update({ respuesta_leida: true })
    .in('id', ids)
    .eq('email', userData.user.email.toLowerCase())
    .not('respuesta', 'is', null)

  if (error) {
    console.error('[contact-messages PATCH] update failed:', error.message)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
