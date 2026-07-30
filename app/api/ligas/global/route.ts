import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

function safeName(v: unknown): string {
  const s = (typeof v === 'string' ? v : '').trim().slice(0, 40)
  return s.includes('@') ? '' : s
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  // Step 1: get current user's total XP
  const { data: myRow } = await db
    .from('camino_user_progress')
    .select('xp_total')
    .eq('user_id', user.id)
    .maybeSingle()
  const myXp = Number(myRow?.xp_total ?? 0)

  // Step 2: all dependent queries in parallel
  const [rankResult, top3Result, aboveResult, belowResult, activeResult] = await Promise.all([
    // Count users with strictly more XP → my rank = count + 1
    db.from('camino_user_progress').select('*', { count: 'exact', head: true }).gt('xp_total', myXp),
    // Top 3 globally
    db.from('camino_user_progress').select('user_id, xp_total').order('xp_total', { ascending: false }).limit(3),
    // 2 closest above me (ASC: [rank myRank-1, rank myRank-2])
    db.from('camino_user_progress').select('user_id, xp_total').gt('xp_total', myXp).order('xp_total', { ascending: true }).limit(2),
    // 2 closest below me (DESC: [rank myRank+1, rank myRank+2])
    db.from('camino_user_progress').select('user_id, xp_total').lt('xp_total', myXp).order('xp_total', { ascending: false }).limit(2),
    // Count users with any XP for empty-state check
    db.from('camino_user_progress').select('*', { count: 'exact', head: true }).gt('xp_total', 0),
  ])

  const myRank = (rankResult.count ?? 0) + 1
  const activeCount = activeResult.count ?? 0

  // Collect all user IDs for name lookup
  const allIds = Array.from(new Set([
    user.id,
    ...(top3Result.data ?? []).map(r => r.user_id as string),
    ...(aboveResult.data ?? []).map(r => r.user_id as string),
    ...(belowResult.data ?? []).map(r => r.user_id as string),
  ]))

  const { data: profiles } = await db
    .from('perfiles')
    .select('id, display_name, nombre')
    .in('id', allIds)

  const nameById = new Map<string, string>()
  for (const p of profiles ?? []) {
    const name = safeName(p.display_name) || safeName(p.nombre)
    if (name) nameById.set(p.id as string, name)
  }

  function getName(uid: string): string {
    if (uid === user.id) return 'Tú'
    return nameById.get(uid) || 'Alumno PAU'
  }

  const top3 = (top3Result.data ?? []).map((row, i) => ({
    name: getName(row.user_id as string),
    xp: Number(row.xp_total),
    rank: i + 1,
    isCurrentUser: row.user_id === user.id,
  }))

  // aboveResult sorted ASC: index 0 = rank myRank-1 (closest), index 1 = rank myRank-2
  // Display order: higher rank first → reverse for display
  const aboveData = aboveResult.data ?? []
  const belowData = belowResult.data ?? []

  const aboveNeighbors = aboveData
    .map((row, i) => ({
      name: getName(row.user_id as string),
      xp: Number(row.xp_total),
      rank: myRank - 1 - i,
      isCurrentUser: false,
    }))
    .reverse()

  const meEntry = { name: 'Tú', xp: myXp, rank: myRank, isCurrentUser: true }

  const belowNeighbors = belowData.map((row, i) => ({
    name: getName(row.user_id as string),
    xp: Number(row.xp_total),
    rank: myRank + 1 + i,
    isCurrentUser: false,
  }))

  const neighbors = [...aboveNeighbors, meEntry, ...belowNeighbors]

  // Person just above me is aboveData[0] (smallest xp still above mine)
  const justAbove = aboveData[0]
  const nextTarget = justAbove
    ? { name: getName(justAbove.user_id as string), xpNeeded: Number(justAbove.xp_total) - myXp }
    : null

  return NextResponse.json({ myRank, myXp, activeCount, top3, neighbors, nextTarget })
}
