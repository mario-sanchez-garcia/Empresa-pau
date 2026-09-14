import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'

async function authorize(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth
  if (!isInternalUser(auth.user.email)) return { response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
  return auth
}
export async function GET(request: NextRequest) {
  const auth = await authorize(request)
  if ('response' in auth) return auth.response
  const cursor = request.nextUrl.searchParams.get('before')
  const db = createServiceClient()
  let query = db.from('beta_incidents').select('id, user_id, source, code, route, description, severity, status, occurrences, created_at, last_seen_at')
    .order('last_seen_at', { ascending: false }).order('id').limit(201)
  if (cursor && !Number.isNaN(Date.parse(cursor))) query = query.lt('last_seen_at', cursor)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'No se pudieron cargar las incidencias' }, { status: 503 })
  const incidents = (data ?? []).slice(0,200)
  return NextResponse.json({ incidents, nextCursor: (data?.length ?? 0)>200 ? incidents.at(-1)?.last_seen_at : null }, { headers: { 'Cache-Control':'no-store' } })
}
export async function PATCH(request: NextRequest) {
  const auth = await authorize(request)
  if ('response' in auth) return auth.response
  const body = await request.json().catch(() => null)
  if (!body || !['open','investigating','resolved'].includes(body.status) || !/^[0-9a-f-]{36}$/i.test(body.id ?? '')) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }
  const { data, error } = await createServiceClient().from('beta_incidents')
    .update({ status: body.status, resolved_at: body.status === 'resolved' ? new Date().toISOString() : null }).eq('id', body.id).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 503 })
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
