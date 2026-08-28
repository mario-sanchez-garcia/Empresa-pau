import type { SupabaseClient } from '@supabase/supabase-js'

import {
  ADAPTIVE_SLOT_SCORING_CONFIG,
  buildSchedulingBehaviorProfile,
  type BehaviorProfileSourceRow,
  type SchedulingBehaviorProfile,
} from './slotScoring'

const SELECT_COLUMNS = 'scheduled_date, status, start_time, end_time, subject, mission_type'

export async function loadSchedulingBehaviorProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<SchedulingBehaviorProfile | null> {
  if (!ADAPTIVE_SLOT_SCORING_CONFIG.enabled) return null

  const { data, error } = await supabase
    .from('camino_calendar')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .in('status', ['completed', 'missed', 'postponed'])
    .not('start_time', 'is', null)
    .not('end_time', 'is', null)
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(ADAPTIVE_SLOT_SCORING_CONFIG.historyLimit)

  if (error) {
    console.warn('[loadSchedulingBehaviorProfile] disabled_for_request', {
      code: error.code,
      message: error.message?.slice(0, 180),
    })
    return null
  }

  return buildSchedulingBehaviorProfile((data ?? []) as BehaviorProfileSourceRow[])
}
