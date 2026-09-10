import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

async function authorize(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return { ok: false as const, status: 500, error: 'Config error' }

  const accessToken = getBearerToken(request)
  if (!accessToken) return { ok: false as const, status: 401, error: 'No autorizado' }

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await authSupabase.auth.getUser(accessToken)
  if (error || !data.user) return { ok: false as const, status: 401, error: 'No autorizado' }
  if (!isInternalUser(data.user.email)) return { ok: false as const, status: 403, error: 'Acceso denegado' }

  return { ok: true as const }
}

export async function GET(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const db = createServiceClient()
  const { data, error } = await db
    .from('contact_messages')
    .select('id, name, email, subject, message, created_at, is_read')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/contact-messages GET] select failed:', error.message)
    return NextResponse.json({ error: 'No se pudieron cargar los mensajes' }, { status: 500 })
  }

  return NextResponse.json({ messages: data ?? [], generatedAt: new Date().toISOString() })
}

export async function PATCH(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const id = typeof body.id === 'number' ? body.id : Number(body.id)
  const isRead = typeof body.is_read === 'boolean' ? body.is_read : true
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  const db = createServiceClient()
  const { error } = await db.from('contact_messages').update({ is_read: isRead }).eq('id', id)
  if (error) {
    console.error('[admin/contact-messages PATCH] update failed:', error.message)
    return NextResponse.json({ error: 'No se pudo actualizar el mensaje' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
