import type { SupabaseClient } from '@supabase/supabase-js'

import {
  ADAPTIVE_SLOT_SCORING_CONFIG,
  buildSchedulingBehaviorProfile,
  type BehaviorProfileSourceRow,
  type SchedulingBehaviorProfile,
} from './slotScoring'

const SELECT_COLUMNS = [
  'scheduled_date',
  'status',
  'start_time',
  'end_time',
  'started_at',
  'completed_at',
  'actual_duration_minutes',
  'completion_delay_minutes',
  'postpone_count',
  'last_postponed_at',
  'manual_reschedule_count',
  'conflict_reschedule_count',
  'subject',
  'mission_type',
].join(', ')

const LEGACY_SELECT_COLUMNS = [
  'scheduled_date',
  'status',
  'start_time',
  'end_time',
  'subject',
  'mission_type',
].join(', ')

function isMissingTelemetryColumn(error: { code?: string; message?: string } | null) {
  return error?.code === '42703' && (
    error.message?.includes('started_at') ||
    error.message?.includes('completed_at') ||
    error.message?.includes('actual_duration_minutes') ||
    error.message?.includes('completion_delay_minutes') ||
    error.message?.includes('postpone_count') ||
    error.message?.includes('last_postponed_at') ||
    error.message?.includes('manual_reschedule_count') ||
    error.message?.includes('conflict_reschedule_count')
  )
}

export async function loadSchedulingBehaviorProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<SchedulingBehaviorProfile | null> {
  if (!ADAPTIVE_SLOT_SCORING_CONFIG.enabled) return null

  const baseQuery = (columns: string) => supabase
    .from('camino_calendar')
    .select(columns)
    .eq('user_id', userId)
    .in('status', ['completed', 'missed', 'postponed'])
    .not('start_time', 'is', null)
    .not('end_time', 'is', null)
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(ADAPTIVE_SLOT_SCORING_CONFIG.historyLimit)

  let { data, error } = await baseQuery(SELECT_COLUMNS)

  if (isMissingTelemetryColumn(error)) {
    const legacyResult = await baseQuery(LEGACY_SELECT_COLUMNS)
    data = legacyResult.data
    error = legacyResult.error
  }

  if (error) {
    console.warn('[loadSchedulingBehaviorProfile] disabled_for_request', {
      code: error.code,
      message: error.message?.slice(0, 180),
    })
    return null
  }

  return buildSchedulingBehaviorProfile((data ?? []) as BehaviorProfileSourceRow[])
}
