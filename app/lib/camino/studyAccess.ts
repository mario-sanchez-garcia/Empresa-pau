import type { SupabaseClient } from '@supabase/supabase-js'
import { getCaminoPlanLimits } from './caminoPlanLimits.ts'
import { VALID_DAILY_MINUTES } from './dailyTimeCapacity.ts'

export type StudyEntitlement = {
  plan_id: string; status?: string; expires_at?: string | null; started_at?: string | null
  source?: string; metadata?: Record<string, unknown> | null
}

// El orden de las filas de Supabase nunca decide qué acceso tiene el alumno.
export function resolveStudyAccess(rows: readonly StudyEntitlement[], now = Date.now()) {
  const active = rows.filter(row => row.status === 'active'
    && (!row.expires_at || Date.parse(row.expires_at) > now)
    && (!row.started_at || Date.parse(row.started_at) <= now))
  const ranked = active.map(row => ({ row, limits: getCaminoPlanLimits(row.plan_id) }))
    .sort((a, b) => b.limits.maxStudyDaysPerWeek - a.limits.maxStudyDaysPerWeek
      || b.limits.fullMocksPerMonth - a.limits.fullMocksPerMonth
      || a.limits.id.localeCompare(b.limits.id))
  const selected = ranked[0]
  const limits = selected?.limits ?? getCaminoPlanLimits('free')
  return {
    planId: limits.id, label: limits.label, limits,
    maxStudyDaysPerWeek: limits.maxStudyDaysPerWeek,
    // La etiqueta beta requiere un acceso concedido, nunca un flag del navegador.
    beta: active.some(row => Boolean(row.metadata?.beta_cohort)),
    source: selected?.row.source ?? null,
    expiresAt: selected?.row.expires_at ?? null,
  }
}
export type StudyAccess = ReturnType<typeof resolveStudyAccess>

export async function loadStudyAccess(userId: string, db: SupabaseClient): Promise<StudyAccess> {
  const { data, error } = await db.from('user_entitlements')
    .select('plan_id, status, started_at, expires_at, source, metadata').eq('user_id', userId).eq('status', 'active')
  if (error) throw new Error(`No se pudo verificar tu acceso de estudio: ${error.message}`)
  return resolveStudyAccess(data ?? [])
}

export function studyDayOptions(maxDays: number) {
  return Array.from({ length: maxDays }, (_, i) => i + 1)
}

export function availabilityError(weekly: unknown, minutes: unknown, access: StudyAccess): string | null {
  if (typeof weekly !== 'number' || !Number.isInteger(weekly) || weekly < 1 || weekly > 7)
    return 'Elige un número exacto de días de estudio (entre 1 y 7).'
  if (weekly > access.maxStudyDaysPerWeek)
    return `Tu acceso ${access.label} permite hasta ${access.maxStudyDaysPerWeek} días por semana. Elige un valor permitido; no hemos recortado tu selección.`
  if (!VALID_DAILY_MINUTES.includes(minutes as typeof VALID_DAILY_MINUTES[number]))
    return 'Elige los minutos diarios que puedes dedicar al Camino.'
  return null
}
