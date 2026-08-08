export type RateLimitAction = 'chat' | 'image_correction' | 'simulacro_correction' | 'parcial_correction' | 'planning_generation' | 'parciales_plan_intensity' | 'free_review_suggestion'

export const RATE_LIMIT_CODE = 'RATE_LIMIT_EXCEEDED'
export const BILLING_BLOCK_CODE = 'BILLING_REQUIRED'
export const RATE_LIMIT_BETA_NOTICE = 'Estamos usando límites durante la beta para mantener Kairo estable mientras seguimos mejorando.'

const RATE_LIMIT_MESSAGES: Record<RateLimitAction, string> = {
  chat: 'Has alcanzado el límite de mensajes de hoy. Vuelve mañana para seguir usando el chat de Kairo.',
  image_correction: 'Has usado tus correcciones disponibles por hoy. Vuelve mañana para seguir practicando con feedback.',
  simulacro_correction: 'Ya has completado el simulacro disponible de hoy. Vuelve mañana para hacer otro.',
  parcial_correction: 'Ya has completado la práctica parcial disponible de hoy. Vuelve mañana para hacer otra.',
  planning_generation: 'Ya has generado tu plan de esta semana. Puedes seguir usando el plan actual y volver a generarlo la próxima semana.',
  parciales_plan_intensity: 'Has ajustado muchos parciales hoy. El plan se ha creado con un cálculo estándar; vuelve mañana para que la IA lo ajuste de nuevo.',
  free_review_suggestion: 'Has pedido muchas sugerencias de repaso libre hoy. Vuelve mañana para pedir otra.'
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

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

// Los límites mensuales de plan (fotos, correcciones, parciales, simulacros)
// se reinician el día 1 de cada mes — sin decir cuándo, "has alcanzado el
// límite" es un callejón sin salida: el alumno no sabe si es para siempre o
// vuelve mañana. Se usa en el mensaje de cada límite mensual para que
// siempre quede claro cuándo puede volver a intentarlo.
export function monthlyLimitResetNotice(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return `Se renueva el 1 de ${MESES_ES[next.getMonth()]}.`
}

export function getApiErrorMessage(body: unknown, fallback = 'No hemos podido completar la acción. Inténtalo de nuevo.') {
  const b = body as Record<string, string | null | undefined>
  if (b?.code === RATE_LIMIT_CODE) {
    return [b.message || b.error || RATE_LIMIT_BETA_NOTICE, b.betaNotice || RATE_LIMIT_BETA_NOTICE]
      .filter(Boolean)
      .join('\n\n')
  }
  return b?.message || b?.error || fallback
}
