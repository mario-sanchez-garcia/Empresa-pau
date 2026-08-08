import type { NextRequest } from 'next/server'

// Fase 0 de observabilidad del onboarding: trace_id/request_id propagados
// desde el cliente por headers, y un formato de log de servidor estable para
// poder cruzar fallos de /api/onboarding/* sin guardar PII en logs.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function extractTraceHeaders(request: NextRequest): { traceId: string | null; requestId: string } {
  const rawTrace = request.headers.get('x-kairo-trace-id')
  const rawRequest = request.headers.get('x-kairo-request-id')
  const traceId = rawTrace && UUID_RE.test(rawTrace) ? rawTrace : null
  const requestId = rawRequest && UUID_RE.test(rawRequest) ? rawRequest : crypto.randomUUID()
  return { traceId, requestId }
}

export function logOnboardingStage(params: {
  traceId: string | null
  requestId: string
  endpoint: string
  stage?: string
  result?: 'success' | 'failed'
  errorCode?: string
  durationMs?: number
}) {
  const { traceId, requestId, endpoint, stage, result, errorCode, durationMs } = params
  const parts = [`trace_id=${traceId ?? 'none'}`, `request_id=${requestId}`, `endpoint=${endpoint}`]
  if (stage) parts.push(`stage=${stage}`)
  if (result) parts.push(`result=${result}`)
  if (errorCode) parts.push(`error_code=${errorCode}`)
  if (durationMs !== undefined) parts.push(`duration_ms=${durationMs}`)
  console.log(`[onboarding] ${parts.join(' ')}`)
}
