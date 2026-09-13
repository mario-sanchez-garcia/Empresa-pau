import { estimatedMinutesForSlot } from './dailyTimeCapacity.ts'
import { estimatedMinutesForMission } from './missionDuration.ts'

/** Duración al COLOCAR trabajo: las sesiones de teoría/repaso dependen del
 * hueco del día. Los parciales y simulacros conservan su duración propia.
 * Una fila ya calendarizada se mide con estimatedMinutesForMission. */
export function minutesForPlacement(
  dailyMinutes: number | null | undefined,
  slot: number,
  missionType: string | null,
  metadata: Record<string, unknown> | null,
): number {
  return missionType === 'concept' || missionType === 'review'
    ? estimatedMinutesForSlot(dailyMinutes, slot)
    : estimatedMinutesForMission({ mission_type: missionType, metadata })
}
