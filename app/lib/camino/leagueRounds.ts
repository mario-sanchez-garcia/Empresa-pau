// Rondas mensuales y medallas del sistema de Ligas.
// Mismo patrón que DIVISIONS/divisionFor en leagues.ts: constante de
// código, fácil de ajustar y desplegar, sin tabla de configuración.

import type { SupabaseClient } from '@supabase/supabase-js'

export type ScopeType = 'personal' | 'comunidad_materia' | 'global'
export type Medal = 'oro' | 'plata' | 'bronce'

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

export function medalForRank(rank: number, totalParticipants: number): Medal | null {
  if (totalParticipants <= 0 || rank < 1) return null
  const percentile = rank / totalParticipants
  return MEDAL_TIERS.find(tier => percentile <= tier.topPercentile)?.name ?? null
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
// que puede no coincidir con la fecha de la misión). Reutilizado por
// /api/ligas/rankings (ronda/top), /api/ligas y /api/ligas/[codigo] (antes
// cada uno recalculaba esto a su manera, con el riesgo de que divergieran).
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
