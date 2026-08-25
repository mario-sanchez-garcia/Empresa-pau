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

// Approximate internal estimates for Claude Sonnet-class pricing.
// Keep in sync with adminMetrics.ts until pricing config is centralized.
const APPROX_INPUT_EUR_PER_TOKEN = 0.0000028
const APPROX_OUTPUT_EUR_PER_TOKEN = 0.000014

export function extractAnthropicTokenUsage(message: { usage?: { input_tokens?: number; output_tokens?: number } }) {
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

type LogPhotoUsageArgs = LogAiUsageArgs & {
  /** How many photos this single AI call actually corrected (0 for text-only, N for a multi-photo submission). */
  photoCount: number
}

// A multi-photo submission is still ONE Anthropic call, but must debit N
// units from the student's monthly "fotos/mes" quota — the quota check
// (getMonthlyActionCount/getMonthlyUniqueActionCount in serverUsage.ts)
// counts *rows* in ai_usage_events, so debiting N units means inserting N
// rows here, not one. Only the first row carries the call's real
// input/output tokens and cost; the rest are quota-only markers (tokens
// null, cost 0) so admin dashboards that sum every row's tokens/cost don't
// get inflated N-fold for what was actually a single Claude request.
//
// When metadata.creditKey is set, each extra row gets a distinct
// `${creditKey}::img${n}` suffix — the FIRST photo keeps the bare
// creditKey unchanged (so it still dedupes exactly like before this
// feature existed, for both pre-existing rows and single-photo callers).
// Repeating the same exercise with the same-or-fewer photos later
// reproduces the same suffixed keys and doesn't cost extra quota (matches
// the existing "repeating an exercise is free" design); only genuinely
// new additional photos mint a new unique key and cost quota.
export async function logAiUsageEventForPhotos({ photoCount, metadata, ...args }: LogPhotoUsageArgs) {
  const count = Math.max(1, Math.floor(photoCount) || 0)
  const baseCreditKey = typeof metadata?.creditKey === 'string' && metadata.creditKey.trim() ? metadata.creditKey.trim() : null

  await Promise.all(Array.from({ length: count }, (_, i) => {
    const creditKey = baseCreditKey && i > 0 ? `${baseCreditKey}::img${i + 1}` : baseCreditKey
    return logAiUsageEvent({
      ...args,
      inputTokens: i === 0 ? args.inputTokens : null,
      outputTokens: i === 0 ? args.outputTokens : null,
      totalTokens: i === 0 ? args.totalTokens : null,
      estimatedCostEur: i === 0 ? args.estimatedCostEur : 0,
      metadata: { ...(metadata ?? {}), ...(baseCreditKey ? { creditKey } : {}), photoIndex: i + 1, photoCount: count },
    })
  }))
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
      estimated_cost_eur: args.estimatedCostEur ?? estimateAnthropicCostEur(args.inputTokens, args.outputTokens),
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

function estimateAnthropicCostEur(inputTokens?: number | null, outputTokens?: number | null) {
  if (inputTokens == null || outputTokens == null) return null
  return inputTokens * APPROX_INPUT_EUR_PER_TOKEN + outputTokens * APPROX_OUTPUT_EUR_PER_TOKEN
}

function rateLimitUnavailable(limit: number): AiRateLimitResult {
  if (process.env.NODE_ENV === 'production') {
    return { allowed: false, count: limit, limit, retryAfterSeconds: 5 * 60 }
  }

  return { allowed: true, count: 0, limit }
}
