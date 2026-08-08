export const BETA_METRIC_EVENTS = [
  // 'onboarding_completed' es EL evento de negocio (lo escribe únicamente
  // /api/onboarding/setup con payload.onboarding_completed === true — es lo
  // único que /api/onboarding/me acepta como "onboarding realmente
  // terminado"). NUNCA reutilizar este event_type para telemetría — ver
  // 'onboarding_flow_completed' más abajo y el bug que causó reutilizarlo.
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
  // Evento de telemetría del cierre del wizard (distinto del evento de
  // negocio 'onboarding_completed' de arriba — antes colisionaban con el
  // mismo nombre, y /api/onboarding/me acababa leyendo esta fila de
  // telemetría en vez de la de negocio, rompiendo la detección de
  // "onboarding completado" para cualquier cuenta que terminara el wizard).
  'onboarding_flow_completed',
  // Fase 1 (rediseño emocional): dolor principal elegido en la portada.
  'onboarding_pain_selected',
  // Fase 2 (signup al final, ver app/api/onboarding/draft, /claim y
  // /finalize). La mayoría de los "onboarding_*" de aquí abajo llegan desde
  // el cliente vía flush de la cola pre-auth (ver onboardingEventQueue.ts);
  // draft_created/claimed/finalize_* se escriben directamente server-side.
  'onboarding_preview_viewed',
  'onboarding_signup_method_selected',
  'onboarding_signup_started',
  'onboarding_signup_completed',
  'email_confirmation_sent',
  'email_confirmation_completed',
  'onboarding_draft_created',
  'onboarding_draft_claimed',
  'onboarding_finalize_started',
  'onboarding_finalize_resumed',
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
