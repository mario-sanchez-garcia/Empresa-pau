import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import {
  getXpByUserInRange,
  currentRoundRange,
  assignCompetitionRanks,
  medalForRank,
  topPctForRank,
  nestedTopPctTiers,
  type Medal,
  type TopPctTier,
} from '@/app/lib/camino/leagueRounds'

export const dynamic = 'force-dynamic'

type RondaRow = { id: string; scope_type: 'personal' | 'comunidad_materia' | 'global'; scope_key: string; period_start: string; period_end: string }
type ResultadoRow = { ronda_id: string; round_xp: number; rank: number; medalla: Medal | null }
type TopPctRow = { ronda_id: string; tier: TopPctTier; rank: number; total_participants: number }

function scopeLabel(scopeType: RondaRow['scope_type'], scopeKey: string, ligaNombreById: Map<string, string>): string {
  if (scopeType === 'global') return 'Global'
  if (scopeType === 'personal') return ligaNombreById.get(scopeKey) ?? 'Mi liga'
  const [comunidad, materia] = scopeKey.split(':')
  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s
  return [cap(comunidad), cap(materia)].filter(Boolean).join(' · ') || 'Comunidad'
}

// Bronce y plata NUNCA se combinan con un nivel top% — solo oro puede
// coexistir con haberlo alcanzado además (regla de negocio explícita, ver
// AGENTS/tarea). El top% en sí se calcula sobre la población GLOBAL
// (ligas_top_pct_resultados solo referencia rondas scope_type='global'),
// así que "coexistir con oro" se resuelve comparando periodos: si el
// alumno tiene medalla='oro' en CUALQUIERA de sus ligas (scope_type=
// 'personal', puede tener hasta MAX_LIGAS_PER_USER) ese mismo periodo,
// su top% de ese periodo cuenta; si no, se descarta aunque exista la fila.
function periodsWithPersonalOro(resultados: ResultadoRow[], rondaById: Map<string, RondaRow>): Set<string> {
  const periods = new Set<string>()
  for (const r of resultados) {
    const ronda = rondaById.get(r.ronda_id)
    if (ronda?.scope_type === 'personal' && r.medalla === 'oro') periods.add(ronda.period_start)
  }
  return periods
}

// Vista en vivo (ronda todavía sin cerrar) de "¿tiene el alumno oro en
// ALGUNA de sus ligas ahora mismo?" — mismo criterio que
// periodsWithPersonalOro pero calculado en caliente sobre camino_xp_events,
// igual que currentMedal/currentRank más abajo. Hasta 3 ligas por alumno,
// así que como mucho son 3 consultas adicionales.
async function hasLiveOroInAnyLiga(
  db: NonNullable<ReturnType<typeof createServiceSupabase>>,
  userId: string,
  range: { start: string; end: string },
): Promise<boolean> {
  const { data: memberships } = await db.from('liga_miembros').select('liga_id').eq('user_id', userId)
  const ligaIds = Array.from(new Set((memberships ?? []).map(m => m.liga_id as string)))
  if (!ligaIds.length) return false

  for (const ligaId of ligaIds) {
    const { data: miembros } = await db.from('liga_miembros').select('user_id').eq('liga_id', ligaId)
    const memberIds = (miembros ?? []).map(m => m.user_id as string)
    if (!memberIds.length) continue

    const xpByUser = await getXpByUserInRange(db, range, memberIds)
    const ranked = assignCompetitionRanks(
      Array.from(xpByUser.entries())
        .filter(([, xp]) => xp > 0)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([user_id, xp]) => ({ user_id, xp }))
    )
    const mine = ranked.find(r => r.user_id === userId)
    if (mine && medalForRank(mine.rank, ranked.length) === 'oro') return true
  }
  return false
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  // El XP de la ronda EN CURSO nunca se guarda en una columna (ver
  // ligas_rondas: "no se crean filas para rondas en curso") — siempre se
  // calcula en caliente sobre camino_xp_events. Si esto leyera de
  // ligas_rondas_resultados para el mes actual, se quedaría a 0 todo el mes
  // porque esa fila todavía no existe (solo la crea el cron al cerrar).
  //
  // Se calcula sobre TODOS los usuarios (no solo el propio) para poder dar
  // también el puesto y la medalla provisionales del global de este mes —
  // antes esta ruta solo mostraba medallero de rondas YA cerradas, así que
  // se veía vacía todo el mes hasta que el cron cerraba la ronda el día 1.
  const range = currentRoundRange()
  const allCurrentRoundXp = await getXpByUserInRange(db, range, null)
  const rankedCurrent = assignCompetitionRanks(
    Array.from(allCurrentRoundXp.entries())
      .filter(([, xp]) => xp > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([user_id, xp]) => ({ user_id, xp }))
  )
  const myCurrentEntry = rankedCurrent.find(r => r.user_id === user.id)
  const currentRoundXp = myCurrentEntry?.xp ?? 0
  const currentRank = myCurrentEntry?.rank ?? null
  const currentMedal = currentRank != null ? medalForRank(currentRank, rankedCurrent.length) : null
  // Top% en vivo: mismo corte que se guardará al cerrar la ronda, pero solo
  // se muestra si además el alumno tiene oro en vivo en alguna de sus
  // ligas — igual regla de combinación que las rondas ya cerradas.
  const liveTopPctTier = currentRank != null ? topPctForRank(currentRank, rankedCurrent.length) : null
  const currentTopPct = liveTopPctTier && await hasLiveOroInAnyLiga(db, user.id, range) ? liveTopPctTier : null
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(range.end + 'T23:59:59Z').getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  ))

  // Medallero: se agrega en caliente sobre ligas_rondas_resultados — sigue
  // en 0/0/0 mientras no se haya cerrado ninguna ronda todavía (cron
  // mensual, día 1 de cada mes), que es el estado esperado hoy.
  const { data: resultRows } = await db
    .from('ligas_rondas_resultados')
    .select('ronda_id, round_xp, rank, medalla')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const resultados = (resultRows ?? []) as ResultadoRow[]
  const medals = { oro: 0, plata: 0, bronce: 0 }
  for (const r of resultados) {
    if (r.medalla) medals[r.medalla] += 1
  }

  const { data: topPctResultRows } = await db
    .from('ligas_top_pct_resultados')
    .select('ronda_id, tier, rank, total_participants')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)
  const topPctResultados = (topPctResultRows ?? []) as TopPctRow[]

  let pastRounds: Array<{ periodStart: string; periodEnd: string; scopeType: string; label: string; roundXp: number; rank: number; medal: Medal | null; topPct: TopPctTier | null }> = []
  const topPctCounts: Record<TopPctTier, number> = { top5: 0, top10: 0, top25: 0, top50: 0 }

  const rondaIds = Array.from(new Set([
    ...resultados.map(r => r.ronda_id),
    ...topPctResultados.map(r => r.ronda_id),
  ]))

  if (rondaIds.length > 0) {
    const { data: rondaRows } = await db
      .from('ligas_rondas')
      .select('id, scope_type, scope_key, period_start, period_end')
      .in('id', rondaIds)
    const rondas = (rondaRows ?? []) as RondaRow[]
    const rondaById = new Map(rondas.map(r => [r.id, r]))

    // Solo cuenta el top% de un periodo si ese mismo periodo tiene además
    // una medalla de oro personal (cualquiera de las hasta 3 ligas del
    // alumno) — bronce/plata nunca se combinan con top%.
    const oroPeriods = periodsWithPersonalOro(resultados, rondaById)
    const topPctByPeriod = new Map<string, TopPctRow>()
    for (const r of topPctResultados) {
      const ronda = rondaById.get(r.ronda_id)
      if (ronda) topPctByPeriod.set(ronda.period_start, r)
    }

    // Los niveles top% se acumulan temporada a temporada: cada periodo con
    // oro + top% cuenta, y anidado (top5 también suma a top10/25/50).
    for (const [period, row] of topPctByPeriod) {
      if (!oroPeriods.has(period)) continue
      for (const tier of nestedTopPctTiers(row.tier)) topPctCounts[tier] += 1
    }

    const personalScopeKeys = Array.from(new Set(rondas.filter(r => r.scope_type === 'personal').map(r => r.scope_key)))
    const ligaNombreById = new Map<string, string>()
    if (personalScopeKeys.length > 0) {
      const { data: ligasRows } = await db.from('ligas').select('id, nombre').in('id', personalScopeKeys)
      for (const l of ligasRows ?? []) ligaNombreById.set(l.id as string, l.nombre as string)
    }

    pastRounds = resultados
      .map(r => {
        const ronda = rondaById.get(r.ronda_id)
        if (!ronda) return null
        const topPctRow = ronda.scope_type === 'global' ? topPctByPeriod.get(ronda.period_start) : undefined
        const topPct = topPctRow && oroPeriods.has(ronda.period_start) ? topPctRow.tier : null
        return {
          periodStart: ronda.period_start,
          periodEnd: ronda.period_end,
          scopeType: ronda.scope_type,
          label: scopeLabel(ronda.scope_type, ronda.scope_key, ligaNombreById),
          roundXp: r.round_xp,
          rank: r.rank,
          medal: r.medalla,
          topPct,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
  }

  return NextResponse.json({
    medals,
    topPctCounts,
    currentRoundXp,
    currentRoundRange: range,
    currentRank,
    currentTotalParticipants: rankedCurrent.length,
    currentMedal,
    currentTopPct,
    daysRemaining,
    pastRounds,
  })
}
