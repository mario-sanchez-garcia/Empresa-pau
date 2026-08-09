import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { previousRoundRange, medalForRank, topPctForRank, scopeKeyForComunidadMateria, type ScopeType, type Medal, type TopPctTier } from '@/app/lib/camino/leagueRounds'

export const dynamic = 'force-dynamic'

type XpEventRow = { user_id: string; xp_amount: number; subject: string | null }

type RankedEntry = { userId: string; roundXp: number; rank: number; medalla: Medal | null }

function rankBySum(rowsByUser: Map<string, number>): RankedEntry[] {
  const sorted = Array.from(rowsByUser.entries())
    .filter(([, xp]) => xp > 0)
    .sort((a, b) => b[1] - a[1])
  const total = sorted.length
  return sorted.map(([userId, roundXp], index) => {
    const rank = index + 1
    return { userId, roundXp, rank, medalla: medalForRank(rank, total) }
  })
}

async function insertRoundResults(
  db: ReturnType<typeof createServiceClient>,
  scopeType: ScopeType,
  scopeKey: string,
  periodStart: string,
  periodEnd: string,
  ranked: RankedEntry[],
) {
  if (!ranked.length) return { created: false }

  const { data: ronda, error: rondaError } = await db
    .from('ligas_rondas')
    .insert({ scope_type: scopeType, scope_key: scopeKey, period_start: periodStart, period_end: periodEnd })
    .select('id')
    .single()

  if (rondaError || !ronda) {
    console.error('[close-liga-round] failed to create ronda', { scopeType, scopeKey, error: rondaError })
    return { created: false }
  }

  const rows = ranked.map(entry => ({
    ronda_id: ronda.id,
    user_id: entry.userId,
    round_xp: entry.roundXp,
    rank: entry.rank,
    medalla: entry.medalla,
  }))

  const { error: resultsError } = await db.from('ligas_rondas_resultados').insert(rows)
  if (resultsError) {
    console.error('[close-liga-round] failed to insert resultados', { scopeType, scopeKey, error: resultsError })
    return { created: false }
  }

  return { created: true, participants: ranked.length, rondaId: ronda.id as string }
}

// Niveles "top %" de temporada — SOLO para el ámbito global (población
// completa, no una liga concreta). Se guarda únicamente el nivel más
// exigente alcanzado; la expansión a niveles anidados (top5% -> también
// top10/25/50) se hace al leer, en /api/ligas/etapas. Por debajo de
// MIN_PARTICIPANTS_FOR_TOP_PCT, topPctForRank ya devuelve null para todos —
// nada que insertar, no hace falta comprobarlo aquí aparte.
async function insertTopPctResults(
  db: ReturnType<typeof createServiceClient>,
  rondaId: string,
  ranked: RankedEntry[],
) {
  const total = ranked.length
  const rows = ranked
    .map(entry => ({ userId: entry.userId, rank: entry.rank, tier: topPctForRank(entry.rank, total) }))
    .filter((entry): entry is { userId: string; rank: number; tier: TopPctTier } => entry.tier !== null)
    .map(entry => ({
      ronda_id: rondaId,
      user_id: entry.userId,
      tier: entry.tier,
      rank: entry.rank,
      total_participants: total,
    }))

  if (!rows.length) return

  const { error } = await db.from('ligas_top_pct_resultados').insert(rows)
  if (error) {
    console.error('[close-liga-round] failed to insert top_pct resultados', error)
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[close-liga-round] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { start: periodStart, end: periodEnd } = previousRoundRange()

  // Idempotencia: si el ámbito global de esta ronda ya está cerrado, no
  // repetir el trabajo (el cron puede reintentar tras un fallo parcial,
  // pero no debe duplicar resultados).
  const { data: existingGlobal } = await db
    .from('ligas_rondas')
    .select('id')
    .eq('scope_type', 'global')
    .eq('scope_key', 'global')
    .eq('period_start', periodStart)
    .maybeSingle()

  if (existingGlobal) {
    return NextResponse.json({ ok: true, alreadyClosed: true, periodStart, periodEnd })
  }

  // Todos los eventos de XP de la ronda que se cierra — una sola lectura,
  // reutilizada para los tres ámbitos (nada de queries repetidas por liga).
  const { data: xpRows, error: xpError } = await db
    .from('camino_xp_events')
    .select('user_id, xp_amount, subject')
    .gte('mission_date', periodStart)
    .lte('mission_date', periodEnd)
    .limit(50_000)

  if (xpError) {
    console.error('[close-liga-round] failed to read camino_xp_events', xpError)
    return NextResponse.json({ error: 'No se pudo leer camino_xp_events' }, { status: 500 })
  }

  const events = (xpRows ?? []) as XpEventRow[]

  // ---------------------------------------------------------------
  // 1. Global
  // ---------------------------------------------------------------
  const globalByUser = new Map<string, number>()
  for (const row of events) {
    globalByUser.set(row.user_id, (globalByUser.get(row.user_id) ?? 0) + Number(row.xp_amount ?? 0))
  }
  const globalRanked = rankBySum(globalByUser)
  const globalResult = await insertRoundResults(db, 'global', 'global', periodStart, periodEnd, globalRanked)
  if (globalResult.created && globalResult.rondaId) {
    await insertTopPctResults(db, globalResult.rondaId, globalRanked)
  }

  // ---------------------------------------------------------------
  // 2. Personal (ligas existentes)
  // ---------------------------------------------------------------
  const { data: ligasRows } = await db.from('ligas').select('id')
  let personalClosed = 0
  for (const liga of ligasRows ?? []) {
    const { data: miembros } = await db.from('liga_miembros').select('user_id').eq('liga_id', liga.id)
    const memberIds = new Set((miembros ?? []).map(m => m.user_id as string))
    if (!memberIds.size) continue

    const byUser = new Map<string, number>()
    for (const row of events) {
      if (!memberIds.has(row.user_id)) continue
      byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + Number(row.xp_amount ?? 0))
    }
    const result = await insertRoundResults(db, 'personal', liga.id, periodStart, periodEnd, rankBySum(byUser))
    if (result.created) personalClosed += 1
  }

  // ---------------------------------------------------------------
  // 3. Comunidad + Materia
  // ---------------------------------------------------------------
  const withSubject = events.filter((row): row is XpEventRow & { subject: string } => Boolean(row.subject))
  const userIds = Array.from(new Set(withSubject.map(row => row.user_id)))
  const comunidadByUser = new Map<string, string>()
  if (userIds.length) {
    const { data: perfiles } = await db.from('perfiles').select('id, comunidad').in('id', userIds)
    for (const p of perfiles ?? []) {
      if (p.comunidad) comunidadByUser.set(p.id as string, p.comunidad as string)
    }
  }

  const comunidadMateriaGroups = new Map<string, Map<string, number>>()
  for (const row of withSubject) {
    const comunidad = comunidadByUser.get(row.user_id)
    if (!comunidad) continue // sin comunidad conocida: no participa en este ámbito
    const scopeKey = scopeKeyForComunidadMateria(comunidad, row.subject)
    const byUser = comunidadMateriaGroups.get(scopeKey) ?? new Map<string, number>()
    byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + Number(row.xp_amount ?? 0))
    comunidadMateriaGroups.set(scopeKey, byUser)
  }

  let comunidadMateriaClosed = 0
  for (const [scopeKey, byUser] of comunidadMateriaGroups) {
    const result = await insertRoundResults(db, 'comunidad_materia', scopeKey, periodStart, periodEnd, rankBySum(byUser))
    if (result.created) comunidadMateriaClosed += 1
  }

  return NextResponse.json({
    ok: true,
    periodStart,
    periodEnd,
    global: globalResult.created ? globalResult.participants : 0,
    personalClosed,
    comunidadMateriaClosed,
  })
}
