import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getXpByUserInRange, currentRoundRange, assignCompetitionRanks, medalForRank, type Medal } from '@/app/lib/camino/leagueRounds'

export const dynamic = 'force-dynamic'

type RondaRow = { id: string; scope_type: 'personal' | 'comunidad_materia' | 'global'; scope_key: string; period_start: string; period_end: string }
type ResultadoRow = { ronda_id: string; round_xp: number; rank: number; medalla: Medal | null }

function scopeLabel(scopeType: RondaRow['scope_type'], scopeKey: string, ligaNombreById: Map<string, string>): string {
  if (scopeType === 'global') return 'Global'
  if (scopeType === 'personal') return ligaNombreById.get(scopeKey) ?? 'Mi liga'
  const [comunidad, materia] = scopeKey.split(':')
  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s
  return [cap(comunidad), cap(materia)].filter(Boolean).join(' · ') || 'Comunidad'
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

  let pastRounds: Array<{ periodStart: string; periodEnd: string; scopeType: string; label: string; roundXp: number; rank: number; medal: Medal | null }> = []
  if (resultados.length > 0) {
    const rondaIds = Array.from(new Set(resultados.map(r => r.ronda_id)))
    const { data: rondaRows } = await db
      .from('ligas_rondas')
      .select('id, scope_type, scope_key, period_start, period_end')
      .in('id', rondaIds)
    const rondas = (rondaRows ?? []) as RondaRow[]
    const rondaById = new Map(rondas.map(r => [r.id, r]))

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
        return {
          periodStart: ronda.period_start,
          periodEnd: ronda.period_end,
          scopeType: ronda.scope_type,
          label: scopeLabel(ronda.scope_type, ronda.scope_key, ligaNombreById),
          roundXp: r.round_xp,
          rank: r.rank,
          medal: r.medalla,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
  }

  return NextResponse.json({
    medals,
    currentRoundXp,
    currentRoundRange: range,
    currentRank,
    currentTotalParticipants: rankedCurrent.length,
    currentMedal,
    daysRemaining,
    pastRounds,
  })
}
