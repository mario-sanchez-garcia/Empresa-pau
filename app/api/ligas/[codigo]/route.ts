import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { currentRoundRange } from '@/app/lib/camino/leagueRounds'

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

  // "weekStart" quedó como nombre por compatibilidad con el resto del
  // archivo — ahora es el inicio del mes natural (ronda), no de la semana.
  const weekStart = currentRoundRange().start
  const { data: xpRows } = await db
    .from('camino_xp_events')
    .select('user_id, xp_amount, source_id')
    .in('user_id', memberIds)
    .gte('created_at', weekStart)

  const xpByUser = new Map<string, number>()
  const xpEventKeys = new Set<string>()
  for (const row of xpRows ?? []) {
    const uid = row.user_id as string
    const sourceId = typeof row.source_id === 'string' ? row.source_id : ''
    xpByUser.set(uid, (xpByUser.get(uid) ?? 0) + Number(row.xp_amount ?? 0))
    if (sourceId) xpEventKeys.add(`${uid}:${sourceId}`)
  }

  const { data: completedMissions } = await db
    .from('camino_calendar')
    .select('id, user_id, xp_awarded')
    .in('user_id', memberIds)
    .eq('status', 'completed')
    .gte('completed_at', weekStart)

  for (const row of completedMissions ?? []) {
    const uid = row.user_id as string
    const missionId = row.id as string
    if (!uid || !missionId || xpEventKeys.has(`${uid}:${missionId}`)) continue
    const xpAwarded = Number(row.xp_awarded ?? 0)
    if (xpAwarded > 0) xpByUser.set(uid, (xpByUser.get(uid) ?? 0) + xpAwarded)
  }

  const { data: profiles } = await db.from('perfiles').select('id, display_name, nombre').in('id', memberIds)
  const nameById = new Map<string, string>()
  for (const p of profiles ?? []) {
    const name = ((p.display_name || p.nombre || '') as string).trim()
    if (name) nameById.set(p.id as string, name)
  }

  const miembros = memberIds
    .map(uid => ({
      user_id: uid,
      name: uid === currentUserId ? 'Tú' : (nameById.get(uid) || 'Alumno PAU'),
      weekly_xp: xpByUser.get(uid) ?? 0,
    }))
    .sort((a, b) => b.weekly_xp - a.weekly_xp)
    .map((m, i) => ({ ...m, rank: i + 1 }))

  return NextResponse.json({
    liga: { id: liga.id, codigo: liga.codigo, nombre: liga.nombre, miembros },
    isMember: currentUserId ? memberIds.includes(currentUserId) : false,
    isAuthenticated: Boolean(currentUserId),
    memberCount: memberIds.length,
  })
}
