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

// Contador ligero para el badge de notificación (SidebarNav "Panel interno"
// y el enlace "Mensajes de contacto" en /admin) — separado de GET
// /api/admin/contact-messages a propósito: ese trae el cuerpo completo de
// cada mensaje (y firma una URL por captura), demasiado para pedirlo solo
// para pintar un número en la barra de navegación de toda la app.
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ unreadCount: 0 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ unreadCount: 0 })

  const authSupabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await authSupabase.auth.getUser(accessToken)
  if (error || !data.user || !isInternalUser(data.user.email)) return NextResponse.json({ unreadCount: 0 })

  const db = createServiceClient()
  const { count, error: countError } = await db
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  if (countError) {
    console.error('[admin/contact-messages/unread-count] count failed:', countError.message)
    return NextResponse.json({ unreadCount: 0 })
  }

  return NextResponse.json({ unreadCount: count ?? 0 })
}
