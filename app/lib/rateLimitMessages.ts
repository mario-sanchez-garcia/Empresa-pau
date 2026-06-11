export type RateLimitAction = 'chat' | 'image_correction' | 'simulacro_correction' | 'planning_generation'

export const RATE_LIMIT_CODE = 'RATE_LIMIT_EXCEEDED'
export const RATE_LIMIT_BETA_NOTICE = 'Estamos usando límites durante la beta para mantener Pausia estable mientras seguimos mejorando.'

const RATE_LIMIT_MESSAGES: Record<RateLimitAction, string> = {
  chat: 'Has alcanzado el límite de mensajes de hoy. Vuelve mañana para seguir usando el chat de Pausia.',
  image_correction: 'Has usado tus correcciones disponibles por hoy. Vuelve mañana para seguir practicando con feedback.',
  simulacro_correction: 'Ya has completado el simulacro disponible de hoy. Vuelve mañana para hacer otro.',
  planning_generation: 'Ya has generado tu plan de esta semana. Puedes seguir usando el plan actual y volver a generarlo la próxima semana.'
}

export function getRateLimitMessage(action: RateLimitAction) {
  return RATE_LIMIT_MESSAGES[action]
}

export function createRateLimitPayload(action: RateLimitAction, result: { limit: number; count: number; retryAfterSeconds?: number }) {
  const message = getRateLimitMessage(action)
  return {
    error: message,
    message,
    code: RATE_LIMIT_CODE,
    betaNotice: RATE_LIMIT_BETA_NOTICE,
    limit: result.limit,
    used: result.count,
    retryAfterSeconds: result.retryAfterSeconds ?? null,
    resetAfterSeconds: result.retryAfterSeconds ?? null
  }
}

export function getApiErrorMessage(body: any, fallback = 'No hemos podido completar la acción. Inténtalo de nuevo.') {
  if (body?.code === RATE_LIMIT_CODE) {
    return [body.message || body.error || RATE_LIMIT_BETA_NOTICE, body.betaNotice || RATE_LIMIT_BETA_NOTICE]
      .filter(Boolean)
      .join('\n\n')
  }
  return body?.message || body?.error || fallback
}
