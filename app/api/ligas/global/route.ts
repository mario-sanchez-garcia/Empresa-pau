import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { cached } from '@/app/lib/cache/memoCache'
import { getXpByUserInRange, getAllTimeXpByUser, currentRoundRange, currentWeekRange, currentDayRange } from '@/app/lib/camino/leagueRounds'
import { resolveDisplayNames, safeUsername } from '@/app/lib/camino/rankingNames'

export const dynamic = 'force-dynamic'

const TOP_LIMIT = 500
const NEIGHBORHOOD_SIZE = 3
// El XP de la ronda actual no cambia de forma perceptible en un minuto.
const RANKING_TTL_SECONDS = 60

type RankedRow = { user_id: string; xp: number }
type GlobalPeriod = 'total' | 'month' | 'week' | 'day'
const VALID_PERIODS: GlobalPeriod[] = ['total', 'month', 'week', 'day']

function sortRanked(xpByUser: Map<string, number>): RankedRow[] {
  return Array.from(xpByUser.entries())
    .filter(([, xp]) => xp > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([user_id, xp]): RankedRow => ({ user_id, xp }))
}

// Rango de fechas + clave de caché por periodo — la clave incluye el propio
// rango (día/semana/mes) así que rueda sola al cambiar de día/semana/ronda,
// sin necesidad de invalidar nada a mano.
function rangeForPeriod(period: Exclude<GlobalPeriod, 'total'>) {
  if (period === 'day') return currentDayRange()
  if (period === 'week') return currentWeekRange()
  return currentRoundRange()
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  // Global es, por defecto, de siempre (todo el histórico de Kairo) — día,
  // semana y mes son vistas adicionales dentro de la misma pestaña (top de
  // XP por periodo), no el comportamiento por defecto.
  const requestedPeriod = request.nextUrl.searchParams.get('period')
  const period: GlobalPeriod = VALID_PERIODS.includes(requestedPeriod as GlobalPeriod) ? (requestedPeriod as GlobalPeriod) : 'total'

  // El ranking (de cualquiera de los periodos) es IDÉNTICO para todos los
  // usuarios, así que se cachea 60 s. La clave de cada periodo incluye su
  // rango de fechas, así que rueda sola al cambiar de día/semana/ronda.
  const ranked = period === 'total'
    ? await cached('ligas:global:total', RANKING_TTL_SECONDS, async () => {
        const xpByUser = await getAllTimeXpByUser(db, null)
        return sortRanked(xpByUser)
      })
    : await cached(`ligas:global:${period}:${rangeForPeriod(period).start}`, RANKING_TTL_SECONDS, async () => {
        const xpByUser = await getXpByUserInRange(db, rangeForPeriod(period), null)
        return sortRanked(xpByUser)
      })

  // El ranking cacheado puede ir hasta 60 s por detrás para TODO el mundo
  // (aceptable: es un ranking, no cambia de golpe). Pero el propio XP del
  // alumno que está mirando la pantalla no puede ir por detrás de lo que
  // "Mi liga" le enseña justo al lado (esa vista siempre lee en caliente) —
  // si acaba de completar una misión y cambia de pestaña, debe ver el mismo
  // número. Se sobreescribe solo SU fila con una lectura fresca; el resto
  // del ranking (y su posición relativa) sigue viniendo del caché.
  const myFreshXp = period === 'total'
    ? (await getAllTimeXpByUser(db, [user.id])).get(user.id) ?? 0
    : (await getXpByUserInRange(db, rangeForPeriod(period), [user.id])).get(user.id) ?? 0

  const activeCount = ranked.length
  const myIndex = ranked.findIndex(r => r.user_id === user.id)
  const myXp = myIndex >= 0 ? myFreshXp : 0
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
    xp: row.user_id === user.id ? myFreshXp : row.xp,
    rank: i + 1,
    isCurrentUser: row.user_id === user.id,
  }))

  if (!isInTop) {
    const myPosition = neighborhood.findIndex(r => r.user_id === user.id)
    neighborhood.forEach((row, i) => {
      entries.push({
        name: nameById.get(row.user_id) ?? 'Alumno Kairo',
        xp: row.user_id === user.id ? myFreshXp : row.xp,
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

  return NextResponse.json({ entries, nextTarget, activeCount, myRank, currentUserNeedsUsername, period })
}
