// Rondas mensuales y medallas del sistema de Ligas.
// Mismo patrón que DIVISIONS/divisionFor en leagues.ts: constante de
// código, fácil de ajustar y desplegar, sin tabla de configuración.

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
