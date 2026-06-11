import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isInternalUser } from '@/app/lib/internalUsers'
import { fetchAdminMetrics } from '@/app/lib/adminMetrics'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await authSupabase.auth.getUser(accessToken)
  if (error || !data.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isInternalUser(data.user.email)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const metrics = await fetchAdminMetrics()
  return NextResponse.json(metrics)
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
