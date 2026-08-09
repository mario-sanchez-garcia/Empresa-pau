import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { MAX_LIGAS_PER_USER } from '@/app/lib/camino/leagueRounds'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const codigo = typeof body.codigo === 'string' ? body.codigo.trim().toUpperCase().slice(0, 10) : ''
  if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  const { data: existing } = await db.from('liga_miembros').select('liga_id').eq('user_id', user.id)
  const existingLigaIds = new Set((existing ?? []).map(m => m.liga_id as string))
  if (existingLigaIds.size >= MAX_LIGAS_PER_USER) {
    return NextResponse.json({ error: `Ya perteneces al máximo de ${MAX_LIGAS_PER_USER} ligas` }, { status: 409 })
  }

  const { data: liga } = await db.from('ligas').select('id, codigo, nombre').eq('codigo', codigo).maybeSingle()
  if (!liga) return NextResponse.json({ error: 'Liga no encontrada' }, { status: 404 })
  if (existingLigaIds.has(liga.id)) return NextResponse.json({ error: 'Ya perteneces a esta liga' }, { status: 409 })

  const { count } = await db
    .from('liga_miembros')
    .select('id', { count: 'exact', head: true })
    .eq('liga_id', liga.id)
  if ((count ?? 0) >= 20) return NextResponse.json({ error: 'Liga llena (máximo 20 miembros)' }, { status: 409 })

  const { error } = await db.from('liga_miembros').insert({ liga_id: liga.id, user_id: user.id })
  if (error) return NextResponse.json({ error: 'Error al unirse' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
