import 'server-only'
import { MISSION_COMPLETION_XP } from '@/app/lib/camino/caminoProgressServer'
import { estimatedMinutesForSlot } from '@/app/lib/camino/dailyTimeCapacity'
import type { CleanPainType } from '@/app/lib/onboarding/saveOnboardingProfile'

// Construye la recompensa real que ve el alumno al terminar Fase 2 — nunca
// inventa misiones, XP ni fechas: todo sale de camino_calendar tal y como lo
// dejó generateCaminoPlan. Reutilizado por /api/onboarding/finalize (recién
// generado) y /api/onboarding/status (reconstrucción tras reload/reintento).

export interface RewardMissionRow {
  title: string
  subject: string
  scheduled_date: string
  mission_type: string
  supportsStepCorrection: boolean
}

export interface RewardMission {
  title: string
  subject: string
  scheduledDate: string
  missionType: string
  durationMinutes: number
  xp: number
  supportsStepCorrection: boolean
}

export interface OnboardingReward {
  title: string
  missions: RewardMission[]
  mirrorMessage: string | null
  mirrorBadge: string | null
}

// mission_type NO determina el badge de corrección — igual que en
// generateCaminoPlan, se confía solo en supportsStepCorrection ya calculado
// server-side (getTopicByV2SortOrder/getTopic).
export function buildOnboardingReward(
  missions: RewardMissionRow[],
  dailyMinutes: number | null,
  painType: CleanPainType | null,
): OnboardingReward {
  const slotByDate: Record<string, number> = {}
  const shaped: RewardMission[] = missions.slice(0, 3).map(row => {
    const slot = slotByDate[row.scheduled_date] ?? 0
    slotByDate[row.scheduled_date] = slot + 1
    return {
      title: row.title,
      subject: row.subject,
      scheduledDate: row.scheduled_date,
      missionType: row.mission_type,
      durationMinutes: estimatedMinutesForSlot(dailyMinutes, slot),
      xp: MISSION_COMPLETION_XP,
      supportsStepCorrection: row.supportsStepCorrection,
    }
  })

  const first = shaped[0]
  // Efecto espejo (Fase 1, preservado): el dolor cambia la presentación de
  // la recompensa, nunca qué misión eligió el generador.
  const mirrorMessage = painType === 'daily_plan'
    ? 'Tu primera tarea ya está decidida. Solo tienes que empezar.'
    : painType === 'procrastination' && first
      ? `Hoy solo necesitas ${first.durationMinutes} minutos.`
      : null
  const mirrorBadge = painType === 'correction_confidence' && first?.supportsStepCorrection
    ? 'Incluye corrección paso a paso'
    : painType === 'improve_grade'
      ? 'Enfocada en asegurar puntos'
      : null

  return {
    title: 'Tu Camino ya está preparado',
    missions: shaped,
    mirrorMessage,
    mirrorBadge,
  }
}
