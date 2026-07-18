import type { SupabaseClient } from '@supabase/supabase-js'
import { computeProjection } from '@/app/lib/proyeccion/computeProjection'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  firstName: string
  subjects: Array<{
    name: string
    projection: number | null
    trend7d: number | null
    confidence: 'low' | 'medium' | 'high'
  }>
  missionsCompleted: number
  streakDays: number
  bestBlock: { subject: string; block: string; nota: number } | null
  simulacrosCount: number
}

function getMadridWeekBounds(): { weekStart: string; weekEnd: string } {
  const madridDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const d = new Date(madridDate + 'T12:00:00Z')
  const dow = d.getUTCDay() // 0=Sun, 1=Mon … 6=Sat
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1))
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  }
}

export async function computeWeeklyReport(
  userId: string,
  db: SupabaseClient,
): Promise<WeeklyReport> {
  const { weekStart, weekEnd } = getMadridWeekBounds()

  const [
    simsResult,
    examResult,
    missionsResult,
    streakResult,
    simsWeekResult,
    userResult,
  ] = await Promise.all([
    db.from('historial_simulacros')
      .select('asignatura, nota_final, resultado_json, created_at')
      .eq('user_id', userId)
      .eq('estado', 'completado'),
    db.from('historial_examenes')
      .select('asignatura, nota, nota_maxima, bloque, created_at')
      .eq('user_id', userId),
    db.from('camino_calendar')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('scheduled_date', weekStart)
      .lte('scheduled_date', weekEnd),
    calcularRacha(userId, db),
    db.from('historial_simulacros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .gte('created_at', weekStart + 'T00:00:00Z')
      .lte('created_at', weekEnd + 'T23:59:59Z'),
    // Fetch first name from auth user metadata (service-role only)
    db.auth.admin.getUserById(userId).catch(() => ({ data: { user: null }, error: null })),
  ])

  // Extract first name
  const userMeta = userResult.data?.user?.user_metadata ?? {}
  const fullName: string =
    (typeof userMeta.full_name === 'string' ? userMeta.full_name : '') ||
    (typeof userMeta.name === 'string' ? userMeta.name : '') ||
    ''
  const firstName = fullName.split(' ')[0]?.trim() || 'Estudiante'

  const projections = computeProjection(simsResult.data ?? [], examResult.data ?? [])

  const subjects = projections
    .filter(p => p.confidence !== 'low' || p.num_entries > 0)
    .map(p => ({
      name: subjectLabelFromSlug(p.asignatura),
      projection: p.nota_proyectada,
      trend7d: p.trend_7d,
      confidence: p.confidence,
    }))

  // Best block: highest-scoring block from the subject with most total entries
  const heroProj = projections.length
    ? [...projections].sort((a, b) => b.num_entries - a.num_entries)[0]
    : null
  const bestBlock = (() => {
    const bloques = heroProj?.bloques ?? []
    if (!bloques.length) return null
    const best = [...bloques].sort((a, b) => b.nota_proyectada - a.nota_proyectada)[0]
    return best
      ? { subject: subjectLabelFromSlug(heroProj!.asignatura), block: best.bloque, nota: best.nota_proyectada }
      : null
  })()

  return {
    weekStart,
    weekEnd,
    firstName,
    subjects,
    missionsCompleted: missionsResult.count ?? 0,
    streakDays: streakResult,
    bestBlock,
    simulacrosCount: simsWeekResult.count ?? 0,
  }
}
