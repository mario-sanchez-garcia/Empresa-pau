import 'server-only'

import { createClient } from '@supabase/supabase-js'

type AiUsageStatus = 'success' | 'error'

type LogAiUsageArgs = {
  userId: string
  route: string
  action: string
  model?: string | null
  provider?: string
  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null
  estimatedCostEur?: number | null
  status?: AiUsageStatus
  errorCode?: string | null
  metadata?: Record<string, unknown>
  accessToken?: string | null
}

type CheckAiRateLimitArgs = {
  userId: string
  route: string
  action: string
  limit: number
  windowSeconds: number
  accessToken?: string | null
}

export type AiRateLimitResult = {
  allowed: boolean
  count: number
  limit: number
  retryAfterSeconds?: number
}

export function extractAnthropicTokenUsage(message: any) {
  const inputTokens = safeTokenCount(message?.usage?.input_tokens)
  const outputTokens = safeTokenCount(message?.usage?.output_tokens)
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens != null && outputTokens != null ? inputTokens + outputTokens : null
  }
}

export function getAiErrorCode(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as { status?: unknown; name?: unknown; type?: unknown }
    if (typeof candidate.type === 'string') return candidate.type
    if (typeof candidate.name === 'string') return candidate.name
    if (typeof candidate.status === 'number') return String(candidate.status)
  }
  return 'unknown_error'
}

export async function checkAiRateLimit(args: CheckAiRateLimitArgs): Promise<AiRateLimitResult> {
  try {
    const supabase = createUsageClient(args.accessToken)
    if (!supabase) {
      console.error('AI_RATE_LIMIT_ERROR', 'Supabase usage client is not configured')
      return rateLimitUnavailable(args.limit)
    }

    const since = new Date(Date.now() - args.windowSeconds * 1000).toISOString()
    const { data, count, error } = await supabase
      .from('ai_usage_events')
      .select('id, created_at', { count: 'exact' })
      .eq('user_id', args.userId)
      .eq('route', args.route)
      .eq('action', args.action)
      .eq('status', 'success')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('AI_RATE_LIMIT_ERROR', error)
      return rateLimitUnavailable(args.limit)
    }

    const currentCount = count ?? data?.length ?? 0
    if (currentCount < args.limit) {
      return { allowed: true, count: currentCount, limit: args.limit }
    }

    const oldestCreatedAt = data?.[0]?.created_at
    const retryAfterSeconds = oldestCreatedAt
      ? Math.max(1, Math.ceil((new Date(oldestCreatedAt).getTime() + args.windowSeconds * 1000 - Date.now()) / 1000))
      : undefined

    return {
      allowed: false,
      count: currentCount,
      limit: args.limit,
      retryAfterSeconds
    }
  } catch (error) {
    console.error('AI_RATE_LIMIT_ERROR', error)
    return rateLimitUnavailable(args.limit)
  }
}

export async function logAiUsageEvent(args: LogAiUsageArgs) {
  try {
    const supabase = createUsageClient(args.accessToken)
    if (!supabase) {
      console.error('AI_USAGE_LOG_ERROR', 'Supabase usage client is not configured')
      return
    }

    const { error } = await supabase.from('ai_usage_events').insert({
      user_id: args.userId,
      route: args.route,
      action: args.action,
      model: args.model ?? null,
      provider: args.provider ?? 'anthropic',
      input_tokens: args.inputTokens ?? null,
      output_tokens: args.outputTokens ?? null,
      total_tokens: args.totalTokens ?? null,
      estimated_cost_eur: args.estimatedCostEur ?? null,
      status: args.status ?? 'success',
      error_code: args.errorCode ?? null,
      metadata: args.metadata ?? {}
    })

    if (error) console.error('AI_USAGE_LOG_ERROR', error)
  } catch (error) {
    console.error('AI_USAGE_LOG_ERROR', error)
  }
}

function createUsageClient(accessToken?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey ?? anonKey
  if (!url || !key) return null

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: serviceKey || !accessToken ? undefined : { headers: { Authorization: `Bearer ${accessToken}` } }
  })
}

function safeTokenCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function rateLimitUnavailable(limit: number): AiRateLimitResult {
  if (process.env.NODE_ENV === 'production') {
    return { allowed: false, count: limit, limit, retryAfterSeconds: 5 * 60 }
  }

  return { allowed: true, count: 0, limit }
}
