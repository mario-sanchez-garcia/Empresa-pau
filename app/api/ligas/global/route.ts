import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { cached } from '@/app/lib/cache/memoCache'
import { getXpByUserInRange, currentRoundRange } from '@/app/lib/camino/leagueRounds'
import { resolveDisplayNames, safeUsername } from '@/app/lib/camino/rankingNames'

export const dynamic = 'force-dynamic'

const TOP_LIMIT = 500
const NEIGHBORHOOD_SIZE = 3
// El XP de la ronda actual no cambia de forma perceptible en un minuto.
const RANKING_TTL_SECONDS = 60

type RankedRow = { user_id: string; xp: number }

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  const { start, end } = currentRoundRange()

  // El ranking de la ronda en curso es IDÉNTICO para todos los usuarios, así
  // que se cachea 60 s por ronda (la clave incluye el mes, así que rueda
  // sola al cerrar una ronda y abrir la siguiente).
  const ranked = await cached(`ligas:global:round:${start}`, RANKING_TTL_SECONDS, async () => {
    const xpByUser = await getXpByUserInRange(db, { start, end }, null)
    return Array.from(xpByUser.entries())
      .filter(([, xp]) => xp > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([user_id, xp]): RankedRow => ({ user_id, xp }))
  })

  const activeCount = ranked.length
  const myIndex = ranked.findIndex(r => r.user_id === user.id)
  const myXp = myIndex >= 0 ? ranked[myIndex].xp : 0
  const myRank = myIndex >= 0 ? myIndex + 1 : activeCount + 1

  const top = ranked.slice(0, TOP_LIMIT)
  const isInTop = myIndex >= 0 && myIndex < TOP_LIMIT

  // Si no estoy en el top, un pequeño "vecindario" alrededor de mi puesto —
  // ya lo tenemos todo en memoria (viene de un solo agregado acotado a
  // 50.000 eventos), así que es un slice, no queries nuevas.
  let neighborhood: RankedRow[] = []
  if (!isInTop) {
    if (myIndex >= 0) {
      neighborhood = ranked.slice(Math.max(0, myIndex - NEIGHBORHOOD_SIZE), Math.min(ranked.length, myIndex + NEIGHBORHOOD_SIZE + 1))
    } else {
      // Sin XP esta ronda todavía: me sitúo al final, sin vecinos.
      neighborhood = [{ user_id: user.id, xp: 0 }]
    }
  }

  const idsForNames = Array.from(new Set([...top, ...neighborhood].map(r => r.user_id)))
  const nameById = await resolveDisplayNames(db, idsForNames, user.id)

  const entries = top.map((row, i) => ({
    name: nameById.get(row.user_id) ?? 'Alumno Kairo',
    xp: row.xp,
    rank: i + 1,
    isCurrentUser: row.user_id === user.id,
  }))

  if (!isInTop) {
    const myPosition = neighborhood.findIndex(r => r.user_id === user.id)
    neighborhood.forEach((row, i) => {
      entries.push({
        name: nameById.get(row.user_id) ?? 'Alumno Kairo',
        xp: row.xp,
        rank: myRank + (i - myPosition),
        isCurrentUser: row.user_id === user.id,
      })
    })
  }

  const myEntryIndex = entries.findIndex(e => e.isCurrentUser)
  const aboveEntry = myEntryIndex > 0 ? entries[myEntryIndex - 1] : null
  const nextTarget = aboveEntry && aboveEntry.xp > myXp
    ? { name: aboveEntry.name, xpNeeded: aboveEntry.xp - myXp }
    : null

  const { data: myProfile } = await db.from('perfiles').select('username').eq('id', user.id).maybeSingle()
  const currentUserNeedsUsername = !safeUsername(myProfile?.username)

  return NextResponse.json({ entries, nextTarget, activeCount, myRank, currentUserNeedsUsername })
}
