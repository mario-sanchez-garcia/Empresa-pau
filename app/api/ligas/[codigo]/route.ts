import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getXpByUserInRange, currentWeekRange } from '@/app/lib/camino/leagueRounds'
import { resolveDisplayNames } from '@/app/lib/camino/rankingNames'


export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo: rawCodigo } = await params
  const codigo = rawCodigo?.toUpperCase().slice(0, 10) ?? ''
  if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  // Optional auth — used to mark isMember and label "Tú"
  let currentUserId: string | null = null
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data } = await authClient.auth.getUser(token)
    if (data.user) currentUserId = data.user.id
  }

  const { data: liga } = await db.from('ligas').select('id, codigo, nombre').eq('codigo', codigo).maybeSingle()
  if (!liga) return NextResponse.json({ error: 'Liga no encontrada' }, { status: 404 })

  const { data: members } = await db.from('liga_miembros').select('user_id').eq('liga_id', liga.id)
  const memberIds = (members ?? []).map(m => m.user_id as string)
  const isMember = currentUserId ? memberIds.includes(currentUserId) : false

  if (!isMember) {
    return NextResponse.json({
      liga: { nombre: liga.nombre },
      isMember: false,
      isAuthenticated: Boolean(currentUserId),
      memberCount: memberIds.length,
    })
  }

  // Misma fuente que /api/ligas (Mi liga): XP semanal por rango de fechas
  // sobre camino_xp_events, y nombres resueltos vía resolveDisplayNames —
  // antes esta ruta leía camino_user_progress.xp_total (total histórico, no
  // semanal, pese a llamarse weekly_xp) y perfiles.display_name/nombre
  // (columnas que no existen), así que todo miembro sin ser "Tú" mostraba el
  // fallback fijo "Alumno PAU".
  const [xpByUser, nameById] = await Promise.all([
    getXpByUserInRange(db, currentWeekRange(), memberIds),
    resolveDisplayNames(db, memberIds, currentUserId ?? ''),
  ])

  const miembros = memberIds
    .map(uid => ({
      user_id: uid,
      name: nameById.get(uid) ?? 'Alumno Kairo',
      weekly_xp: xpByUser.get(uid) ?? 0,
    }))
    .sort((a, b) => b.weekly_xp - a.weekly_xp)
    .map((m, i) => ({ ...m, rank: i + 1 }))

  return NextResponse.json({
    liga: { id: liga.id, codigo: liga.codigo, nombre: liga.nombre, miembros },
    isMember: true,
    isAuthenticated: Boolean(currentUserId),
    memberCount: memberIds.length,
  })
}
