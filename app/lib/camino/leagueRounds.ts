// Rondas mensuales y medallas del sistema de Ligas.
// Mismo patrón que DIVISIONS/divisionFor en leagues.ts: constante de
// código, fácil de ajustar y desplegar, sin tabla de configuración.

import type { SupabaseClient } from '@supabase/supabase-js'

export type ScopeType = 'personal' | 'comunidad_materia' | 'global'
export type Medal = 'oro' | 'plata' | 'bronce'

// Máximo de ligas simultáneas por alumno.
export const MAX_LIGAS_PER_USER = 3

// Cortes por percentil dentro del ámbito (liga/comunidad+materia/global).
// Ordenados de más exigente a menos — el primer corte que el alumno
// cumple es su medalla.
export const MEDAL_TIERS: Array<{ name: Medal; topPercentile: number }> = [
  { name: 'oro', topPercentile: 0.10 },
  { name: 'plata', topPercentile: 0.30 },
  { name: 'bronce', topPercentile: 0.60 },
]

// Peso de cada medalla para la clasificación "Etapas" (oro > plata > bronce).
export const ETAPA_MEDAL_WEIGHTS: Record<Medal, number> = {
  oro: 3,
  plata: 2,
  bronce: 1,
}

// Rango "de competición": los empates comparten el mismo puesto (tres
// alumnos empatados a 500 XP salen los tres como 3.º, no como 3.º/4.º/5.º) y
// el siguiente puesto distinto salta al que le tocaría por COUNT de gente
// por delante (6.º, no 4.º). Con XP gamificado los empates son constantes,
// así que esta debe ser la ÚNICA función que asigna `rank` en un ranking
// dado — usarla tanto para las filas visibles como para el puesto propio
// evita que ambas cifras se contradigan entre sí.
export function assignCompetitionRanks<T extends { xp: number }>(sortedDesc: T[]): (T & { rank: number })[] {
  let rank = 0
  let lastXp: number | null = null
  return sortedDesc.map((row, i) => {
    if (lastXp === null || row.xp !== lastXp) {
      rank = i + 1
      lastXp = row.xp
    }
    return { ...row, rank }
  })
}

export function medalForRank(rank: number, totalParticipants: number): Medal | null {
  if (totalParticipants <= 0 || rank < 1) return null
  const percentile = rank / totalParticipants
  return MEDAL_TIERS.find(tier => percentile <= tier.topPercentile)?.name ?? null
}

// Niveles "top %" de temporada — eje independiente del medallero
// oro/plata/bronce, calculado siempre sobre la población GLOBAL (todos los
// alumnos con actividad esa ronda, sin importar su liga). Ordenados de más
// exigente a menos, mismo patrón que MEDAL_TIERS: el primer corte que el
// alumno cumple es su nivel — top5% también implica top10/25/50 (anidados),
// pero solo se guarda el más exigente; la expansión se hace al leer
// (ver nestedTopPctTiers).
export type TopPctTier = 'top5' | 'top10' | 'top25' | 'top50'

export const TOP_PCT_TIERS: Array<{ tier: TopPctTier; topPercentile: number }> = [
  { tier: 'top5', topPercentile: 0.05 },
  { tier: 'top10', topPercentile: 0.10 },
  { tier: 'top25', topPercentile: 0.25 },
  { tier: 'top50', topPercentile: 0.50 },
]

// Mismo orden que TOP_PCT_TIERS, de más a menos exigente — usado para
// expandir un nivel guardado a todos los niveles anidados que implica.
const TOP_PCT_TIER_ORDER: TopPctTier[] = TOP_PCT_TIERS.map(t => t.tier)

// Con menos participantes que esto, un "top 5%" no significa nada de fiar
// (5% de 12 alumnos es "el primero") — mismo principio que
// MIN_PARTICIPANTS_FOR_PERCENTILE en FullRankingModal.tsx.
export const MIN_PARTICIPANTS_FOR_TOP_PCT = 50

export function topPctForRank(rank: number, totalParticipants: number): TopPctTier | null {
  if (totalParticipants < MIN_PARTICIPANTS_FOR_TOP_PCT || rank < 1) return null
  const percentile = rank / totalParticipants
  return TOP_PCT_TIERS.find(t => percentile <= t.topPercentile)?.tier ?? null
}

// top5 implica top10/top25/top50 — devuelve `tier` y todos los niveles
// menos exigentes que alcanzar `tier` ya cumple automáticamente.
export function nestedTopPctTiers(tier: TopPctTier): TopPctTier[] {
  const idx = TOP_PCT_TIER_ORDER.indexOf(tier)
  return idx === -1 ? [] : TOP_PCT_TIER_ORDER.slice(idx)
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// Rango [inicio, fin] del mes natural al que pertenece `reference` (UTC).
export function currentRoundRange(reference: Date = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1))
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0))
  return { start: toDateOnly(start), end: toDateOnly(end) }
}

// Rango del mes natural anterior al de `reference` — usado por el cron
// de cierre, que corre el día 1 y cierra el mes que acaba de terminar.
export function previousRoundRange(reference: Date = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1))
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 0))
  return { start: toDateOnly(start), end: toDateOnly(end) }
}

export function scopeKeyForComunidadMateria(comunidad: string, subject: string): string {
  return `${comunidad.trim().toLowerCase()}:${subject.trim().toLowerCase()}`
}

// Prefijo compartido por todas las rondas comunidad+materia de una misma
// comunidad, sin importar la asignatura — usado para agregar "todas las
// asignaturas" (Etapas) sumando medallas de cada materia por separado.
export function scopeKeyPrefixForComunidad(comunidad: string): string {
  return `${comunidad.trim().toLowerCase()}:`
}

// Rango [lunes, domingo] de la semana natural a la que pertenece
// `reference` (UTC) — mismo criterio que currentRoundRange (límites en
// UTC, sin depender de la zona horaria del alumno).
export function currentWeekRange(reference: Date = new Date()): { start: string; end: string } {
  const isoDay = reference.getUTCDay() || 7 // lunes=1 ... domingo=7
  const monday = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate() - (isoDay - 1)))
  const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6))
  return { start: toDateOnly(monday), end: toDateOnly(sunday) }
}

// Rango de un único día natural (hoy, por defecto) — UTC.
export function currentDayRange(reference: Date = new Date()): { start: string; end: string } {
  const d = toDateOnly(reference)
  return { start: d, end: d }
}

function sumXpByUser(rows: Array<{ user_id: string; xp_amount?: number | null }>): Map<string, number> {
  const byUser = new Map<string, number>()
  for (const row of rows) {
    byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + Number(row.xp_amount ?? 0))
  }
  return byUser
}

// Fuente única para "cuánto XP ha ganado cada alumno en este rango de
// fechas" — usa siempre camino_xp_events.mission_date (nunca created_at,
// que puede no coincidir con la fecha de la misión).
export async function getXpByUserInRange(
  db: SupabaseClient,
  range: { start: string; end: string },
  memberIds: string[] | null,
  subject?: string | null,
): Promise<Map<string, number>> {
  let query = db
    .from('camino_xp_events')
    .select('user_id, xp_amount')
    .gte('mission_date', range.start)
    .lte('mission_date', range.end)
    .limit(50_000)
  if (memberIds) query = query.in('user_id', memberIds)
  if (subject) query = query.eq('subject', subject)
  const { data } = await query
  return sumXpByUser((data ?? []) as Array<{ user_id: string; xp_amount: number }>)
}

// Atajo para el caso más común: XP de la ronda (mes) en curso.
export async function getCurrentRoundXpByUser(
  db: SupabaseClient,
  memberIds: string[] | null,
  subject?: string | null,
): Promise<Map<string, number>> {
  return getXpByUserInRange(db, currentRoundRange(), memberIds, subject)
}

// Fuente única para "cuánto XP acumulado tiene cada alumno desde que existe
// Kairo" — a diferencia de getXpByUserInRange (que suma eventos por rango de
// fechas), esto lee el agregado que ya se mantiene en camino_user_progress
// en cada misión completada (ver complete-mission/route.ts), así que es
// barato incluso con historial largo.
export async function getAllTimeXpByUser(
  db: SupabaseClient,
  memberIds: string[] | null,
): Promise<Map<string, number>> {
  let query = db.from('camino_user_progress').select('user_id, xp_total').limit(50_000)
  if (memberIds) query = query.in('user_id', memberIds)
  const { data } = await query
  const byUser = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ user_id: string; xp_total: number | null }>) {
    byUser.set(row.user_id, Number(row.xp_total ?? 0))
  }
  return byUser
}
