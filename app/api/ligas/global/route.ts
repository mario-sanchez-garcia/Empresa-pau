import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { cached } from '@/app/lib/cache/memoCache'

export const dynamic = 'force-dynamic'

const TOP_LIMIT = 500
const NEIGHBORHOOD_SIZE = 3
// Un ranking de XP acumulado no cambia de forma perceptible en un minuto.
const RANKING_TTL_SECONDS = 60

function safeName(v: unknown): string {
  const s = (typeof v === 'string' ? v : '').trim().slice(0, 40)
  return s.includes('@') ? '' : s
}

type ProgressRow = { user_id: string; xp_total: number }

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  // Top 500 y recuento de activos son IDÉNTICOS para todos los usuarios, así
  // que se cachean 60 s. Lo personalizado (myXp, myRank, vecindario) queda
  // fuera de la caché y se calcula siempre.
  const { top, activeCount } = await cached('ligas:global:top', RANKING_TTL_SECONDS, async () => {
    const [{ data: topRows }, { count: activeCountRaw }] = await Promise.all([
      db.from('camino_user_progress')
        .select('user_id, xp_total')
        .gt('xp_total', 0)
        .order('xp_total', { ascending: false })
        .limit(TOP_LIMIT),
      db.from('camino_user_progress')
        .select('*', { count: 'exact', head: true })
        .gt('xp_total', 0),
    ])
    return { top: (topRows ?? []) as ProgressRow[], activeCount: activeCountRaw ?? 0 }
  })

  const isInTop = top.some(r => r.user_id === user.id)

  // My own XP (0 if I've never scored / have no progress row yet).
  const { data: myRow } = await db
    .from('camino_user_progress')
    .select('xp_total')
    .eq('user_id', user.id)
    .maybeSingle()
  const myXp = Number(myRow?.xp_total ?? 0)

  // Real rank: 1 + everyone strictly ahead of me by XP. This is what makes
  // "aunque seas el 4.000, que salga tu puesto" work — it no longer depends
  // on being inside the top-500 page.
  const { count: aheadCountRaw } = await db
    .from('camino_user_progress')
    .select('*', { count: 'exact', head: true })
    .gt('xp_total', myXp)
  const myRank = (aheadCountRaw ?? 0) + 1

  // If I'm outside the top 500, fetch a small "neighborhood" around me —
  // two bounded queries by xp_total (not a scan of the top-500 array, which
  // wouldn't even contain me).
  let neighborhood: ProgressRow[] = []
  if (!isInTop) {
    const [{ data: aboveRows }, { data: belowRows }] = await Promise.all([
      db.from('camino_user_progress')
        .select('user_id, xp_total')
        .gt('xp_total', myXp)
        .order('xp_total', { ascending: true }) // closest above first
        .limit(NEIGHBORHOOD_SIZE),
      db.from('camino_user_progress')
        .select('user_id, xp_total')
        .lt('xp_total', myXp)
        .order('xp_total', { ascending: false }) // closest below first
        .limit(NEIGHBORHOOD_SIZE),
    ])

    const topIds = new Set(top.map(r => r.user_id))
    // Furthest-above → closest-above → me → closest-below → furthest-below.
    // Dedup against `top`: with a small active user base the top-500 page
    // can already contain everyone, and these neighborhood queries would
    // otherwise re-fetch the same rows and double them up in `entries`.
    neighborhood = [
      ...[...(aboveRows ?? [])].reverse().filter(r => !topIds.has(r.user_id)),
      { user_id: user.id, xp_total: myXp },
      ...(belowRows ?? []).filter(r => !topIds.has(r.user_id)),
    ]
  }

  // Los nombres del top también son compartidos: se cachean junto al top.
  // Los del vecindario (7 ids como mucho) se piden frescos, porque dependen
  // de quién esté consultando.
  const nameById = new Map<string, string>()

  const topNames = await cached('ligas:global:topNames', RANKING_TTL_SECONDS, async () => {
    const { data } = await db
      .from('perfiles')
      .select('id, username')
      .in('id', top.map(r => r.user_id))
    const pares: Array<[string, string]> = []
    for (const p of data ?? []) {
      const name = safeName(p.username)
      if (name) pares.push([p.id as string, name])
    }
    return pares
  })
  for (const [id, name] of topNames) nameById.set(id, name)

  const idsPendientes = neighborhood.map(r => r.user_id).filter(id => !nameById.has(id))
  if (idsPendientes.length > 0) {
    const { data } = await db
      .from('perfiles')
      .select('id, username')
      .in('id', idsPendientes)
    for (const p of data ?? []) {
      const name = safeName(p.username)
      if (name) nameById.set(p.id as string, name)
    }
  }

  function getName(uid: string): string {
    if (uid === user.id) return 'Tú'
    return nameById.get(uid) || 'Alumno Kairo'
  }

  const entries = top.map((row, i) => ({
    name: getName(row.user_id),
    xp: Number(row.xp_total),
    rank: i + 1,
    isCurrentUser: row.user_id === user.id,
  }))

  if (!isInTop) {
    // Ranks radiate out from my real rank (computed above via COUNT), not
    // from array position — e.g. the row directly above me is myRank - 1.
    // This assumes no XP ties right at my boundary; an acceptable
    // approximation for a "who's around me" strip, since the authoritative
    // number is myRank itself, not these neighbors' individual ranks.
    const myPosition = neighborhood.findIndex(r => r.user_id === user.id)
    neighborhood.forEach((row, i) => {
      entries.push({
        name: getName(row.user_id),
        xp: Number(row.xp_total),
        rank: myRank + (i - myPosition),
        isCurrentUser: row.user_id === user.id,
      })
    })
  }

  // Person just above me, for the "a X XP de adelantar a Y" hint.
  const myEntryIndex = entries.findIndex(e => e.isCurrentUser)
  const aboveEntry = myEntryIndex > 0 ? entries[myEntryIndex - 1] : null
  const nextTarget = aboveEntry && aboveEntry.xp > myXp
    ? { name: aboveEntry.name, xpNeeded: aboveEntry.xp - myXp }
    : null

  const currentUserNeedsUsername = !nameById.has(user.id)
  return NextResponse.json({ entries, nextTarget, activeCount, myRank, currentUserNeedsUsername })
}
