export const BETA_METRIC_EVENTS = [
  'onboarding_completed',
  // Fase 0 de observabilidad del onboarding actual (medición pura, ver
  // AGENTS.md / plan de onboarding). Reutilizan billing_events porque
  // recordBetaMetric() ya es el patrón existente — no crear otra tabla
  // solo para esto todavía.
  'onboarding_started',
  'onboarding_step_viewed',
  'onboarding_step_completed',
  'onboarding_validation_failed',
  'onboarding_back_clicked',
  'onboarding_generation_started',
  'onboarding_generation_succeeded',
  'onboarding_generation_failed',
  'camino_opened',
  'mission_opened',
  'course_opened',
  'exercise_submitted',
  'correction_completed',
  'xp_awarded',
  'evau_exercise_opened',
  'partial_created',
  'simulation_started',
  'no_dado_en_clase_clicked',
  'day_2_return',
  'feedback_clicked',
  'camino_calendar_source_selected',
  'weak_review_injected',
  'weak_review_mapping_missed',
  'correction_score_unparseable',
] as const

export type BetaMetricEvent = typeof BETA_METRIC_EVENTS[number]

export async function recordBetaMetric(
  db: { from: (table: string) => { insert: (row: Record<string, unknown>) => unknown } },
  userId: string,
  eventType: BetaMetricEvent,
  payload: Record<string, unknown> = {},
) {
  try {
    await db.from('billing_events').insert({
      user_id: userId,
      event_type: eventType,
      payload: {
        ...payload,
        beta_private: true,
      },
    })
  } catch {
    // Metrics must never block the beta learning flow.
  }
}
