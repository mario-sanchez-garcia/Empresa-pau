import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'

// Ajuste puntual de límites por alumno concreto (ver migración
// 20260807120000_create_user_limit_overrides.sql) — para casos como "dale a
// este alumno unos simulacros extra este mes" sin subirlo de plan ni tocar
// los límites generales de nadie más. Una fila por alumno; sin fila = 0 en
// todo, comportamiento idéntico al de hoy.
export interface UserLimitOverride {
  extraCorrectionsPerMonth: number
  extraPhotosPerMonth: number
  extraPartialsPerMonth: number
  extraMocksPerMonth: number
}

const EMPTY_OVERRIDE: UserLimitOverride = {
  extraCorrectionsPerMonth: 0,
  extraPhotosPerMonth: 0,
  extraPartialsPerMonth: 0,
  extraMocksPerMonth: 0,
}

export async function getUserLimitOverride(db: SupabaseClient, userId: string): Promise<UserLimitOverride> {
  const { data } = await db
    .from('user_limit_overrides')
    .select('extra_corrections_per_month, extra_photos_per_month, extra_partials_per_month, extra_mocks_per_month')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return EMPTY_OVERRIDE
  return {
    extraCorrectionsPerMonth: (data.extra_corrections_per_month as number | null) ?? 0,
    extraPhotosPerMonth: (data.extra_photos_per_month as number | null) ?? 0,
    extraPartialsPerMonth: (data.extra_partials_per_month as number | null) ?? 0,
    extraMocksPerMonth: (data.extra_mocks_per_month as number | null) ?? 0,
  }
}

// Límites del plan + ajuste del alumno, listos para comparar contra el
// consumo del mes. Nunca modifica CAMINO_PLAN_LIMITS ni el plan_id del
// alumno — solo desplaza el número contra el que se compara en esta
// request, para este userId.
export function applyLimitOverride(planLimits: CaminoPlanLimits, override: UserLimitOverride): CaminoPlanLimits {
  return {
    ...planLimits,
    correctionsPerMonth: planLimits.correctionsPerMonth + override.extraCorrectionsPerMonth,
    photosPerMonth: planLimits.photosPerMonth + override.extraPhotosPerMonth,
    partialsPerMonth: planLimits.partialsPerMonth + override.extraPartialsPerMonth,
    fullMocksPerMonth: planLimits.fullMocksPerMonth + override.extraMocksPerMonth,
  }
}

// Atajo para los call sites: resuelve plan + override en un solo paso.
export async function getEffectivePlanLimits(
  db: SupabaseClient,
  userId: string,
  planLimits: CaminoPlanLimits
): Promise<CaminoPlanLimits> {
  const override = await getUserLimitOverride(db, userId)
  return applyLimitOverride(planLimits, override)
}
