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

  // All users with XP, sorted by total desc
  const { data: rows } = await db
    .from('camino_user_progress')
    .select('user_id, xp_total')
    .gt('xp_total', 0)
    .order('xp_total', { ascending: false })
    .limit(500)

  let allRows = rows ?? []

  // Ensure current user appears even if they have 0 XP
  if (!allRows.some(r => r.user_id === user.id)) {
    const { data: myRow } = await db
      .from('camino_user_progress')
      .select('xp_total')
      .eq('user_id', user.id)
      .maybeSingle()
    allRows = [...allRows, { user_id: user.id, xp_total: Number(myRow?.xp_total ?? 0) }]
  }

  const allIds = allRows.map(r => r.user_id as string)

  // Profile names
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
    return nameById.get(uid) || 'Alumno Kairo'
  }

  const entries = allRows.map((row, i) => ({
    name: getName(row.user_id as string),
    xp: Number(row.xp_total),
    rank: i + 1,
    isCurrentUser: row.user_id === user.id,
  }))

  // Person just above current user in the full list
  const myIndex = entries.findIndex(e => e.isCurrentUser)
  const above = myIndex > 0 ? entries[myIndex - 1] : null
  const myXp = entries[myIndex]?.xp ?? 0
  const nextTarget = above && above.xp > myXp
    ? { name: above.name, xpNeeded: above.xp - myXp }
    : null

  return NextResponse.json({ entries, nextTarget, activeCount: entries.length })
}
