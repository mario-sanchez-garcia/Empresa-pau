import { type SupabaseClient } from '@supabase/supabase-js'
import { SPAIN_HOLIDAYS } from './camino/spainHolidays'

// Cuánto atrás miramos. Una racha más larga que esto es irrelevante en la
// práctica (el curso no dura tanto) y acotarlo mantiene las consultas baratas
// cuando el historial de un alumno crece.
const LOOKBACK_DAYS = 180

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** timestamptz → día natural en Madrid ('YYYY-MM-DD'). */
function madridDay(ts: string | null | undefined): string | null {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function isNonStudyDay(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow === 0 || dow === 6 || SPAIN_HOLIDAYS.has(dateStr)
}

/**
 * Días en los que el alumno hizo trabajo real. Cuenta tres cosas, no solo las
 * misiones del Camino: quien corrige ejercicios de examen o termina simulacros
 * está estudiando igual, y perder la racha por ello es desmotivador y falso.
 *
 * Se usa SIEMPRE la marca de tiempo real (`completed_at`, `created_at`), nunca
 * `scheduled_date`: esa es la fecha para la que la misión estaba PROGRAMADA, y
 * usarla rompía la racha de quien se pone al día con misiones atrasadas o
 * adelanta trabajo.
 */
async function getStudyDays(userId: string, supabase: SupabaseClient, since: string): Promise<Set<string>> {
  const sinceTs = since + 'T00:00:00Z'
  const days = new Set<string>()

  const [misiones, examenes, simulacros] = await Promise.all([
    supabase
      .from('camino_calendar')
      .select('completed_at, scheduled_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('scheduled_date', since),
    supabase
      .from('historial_examenes')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', sinceTs),
    supabase
      .from('historial_simulacros')
      .select('created_at')
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .gte('created_at', sinceTs),
  ])

  for (const row of misiones.data ?? []) {
    // Filas antiguas pueden no tener completed_at; ahí scheduled_date es lo
    // único disponible y sigue siendo mejor que descartarlas.
    const day = madridDay(row.completed_at as string | null) ?? (row.scheduled_date as string | null)
    if (day) days.add(day)
  }
  for (const row of examenes.data ?? []) {
    const day = madridDay(row.created_at as string)
    if (day) days.add(day)
  }
  for (const row of simulacros.data ?? []) {
    const day = madridDay(row.created_at as string)
    if (day) days.add(day)
  }

  return days
}

export async function calcularRacha(
  userId: string,
  supabase: SupabaseClient,
): Promise<number> {
  const today = getMadridToday()

  let studyDays: Set<string>
  try {
    studyDays = await getStudyDays(userId, supabase, addDays(today, -LOOKBACK_DAYS))
  } catch {
    return 0
  }
  if (studyDays.size === 0) return 0

  // Si hoy es lectivo y aún no has hecho nada, la racha previa sigue viva:
  // se empieza a contar desde ayer para no mostrar 0 durante todo el día.
  const start = !isNonStudyDay(today) && !studyDays.has(today)
    ? addDays(today, -1)
    : today

  let streak = 0
  let current = start

  // Cota dura: nunca caminamos más atrás de lo que hemos consultado. Evita
  // cualquier posibilidad de bucle infinito si el calendario de festivos
  // creciera de forma inesperada.
  for (let paso = 0; paso <= LOOKBACK_DAYS; paso++) {
    if (studyDays.has(current)) {
      // Trabajar en fin de semana o festivo suma. Antes ni siquiera se miraba.
      streak++
      current = addDays(current, -1)
      continue
    }
    if (isNonStudyDay(current)) {
      // No haber estudiado un sábado no rompe nada: se salta.
      current = addDays(current, -1)
      continue
    }
    break
  }

  return streak
}
