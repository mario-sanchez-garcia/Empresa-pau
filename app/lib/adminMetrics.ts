// Server-only. Never import this in client components.
import { createClient } from '@supabase/supabase-js'

// Approximate internal estimates. Update when provider pricing changes.
const APPROX_INPUT_EUR_PER_TOKEN = 0.0000028
const APPROX_OUTPUT_EUR_PER_TOKEN = 0.000014
const APPROX_AVG_EUR_PER_TOKEN = 0.000007

function estimateCost(
  inputTokens: number | null,
  outputTokens: number | null,
  totalTokens: number | null
): number {
  if (inputTokens != null && outputTokens != null) {
    return inputTokens * APPROX_INPUT_EUR_PER_TOKEN + outputTokens * APPROX_OUTPUT_EUR_PER_TOKEN
  }
  if (totalTokens != null) {
    return totalTokens * APPROX_AVG_EUR_PER_TOKEN
  }
  return 0
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey ?? anonKey
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function startOfDayUtc(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

function daysAgoUtc(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export type AdminMetrics = {
  summary: {
    callsToday: number
    tokensToday: number
    costTodayEur: number
    cost7dEur: number
    correctionsToday: number
    simulacrosToday: number
    plansThisWeek: number
    errorsLast24h: number
    activeUsersToday: number
    activeUsers7d: number
  }
  byRoute: Array<{
    route: string
    calls: number
    tokens: number
    costEur: number
    errors: number
  }>
  topUsers: Array<{
    userId: string
    calls: number
    tokens: number
    costEur: number
  }>
  recentEvents: Array<{
    createdAt: string
    route: string
    action: string
    model: string | null
    totalTokens: number | null
    status: string
    errorCode: string | null
  }>
  recentErrors: Array<{
    createdAt: string
    route: string
    action: string
    errorCode: string | null
    metadata: Record<string, unknown>
  }>
  productActivity: {
    recentCorrections: Array<{
      createdAt: string
      asignatura: string
      nota: number | null
      notaMaxima: number | null
    }>
    recentSimulacros: Array<{
      createdAt: string
      asignatura: string
      estado: string
      notaFinal: number | null
    }>
  }
  betaHealth: {
    aiActive: boolean
    trackingActive: boolean
    errors24h: number
    costToday: number
  }
  calculatedAt: string
}

const EMPTY: AdminMetrics = {
  summary: {
    callsToday: 0,
    tokensToday: 0,
    costTodayEur: 0,
    cost7dEur: 0,
    correctionsToday: 0,
    simulacrosToday: 0,
    plansThisWeek: 0,
    errorsLast24h: 0,
    activeUsersToday: 0,
    activeUsers7d: 0
  },
  byRoute: [],
  topUsers: [],
  recentEvents: [],
  recentErrors: [],
  productActivity: { recentCorrections: [], recentSimulacros: [] },
  betaHealth: { aiActive: false, trackingActive: false, errors24h: 0, costToday: 0 },
  calculatedAt: ''
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const db = adminClient()
  if (!db) return { ...EMPTY, calculatedAt: new Date().toISOString() }

  const todayStart = startOfDayUtc()
  const ago7d = daysAgoUtc(7)
  const ago30d = daysAgoUtc(30)
  const ago1d = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  try {
    const [todayRes, weekRes, last50Res, errorRes, allUsageRes] = await Promise.all([
      db
        .from('ai_usage_events')
        .select('route, action, status, total_tokens, input_tokens, output_tokens, user_id')
        .gte('created_at', todayStart),
      db
        .from('ai_usage_events')
        .select('route, action, status, total_tokens, input_tokens, output_tokens, user_id')
        .gte('created_at', ago7d),
      db
        .from('ai_usage_events')
        .select('created_at, route, action, model, total_tokens, status, error_code')
        .order('created_at', { ascending: false })
        .limit(50),
      db
        .from('ai_usage_events')
        .select('created_at, route, action, error_code, metadata')
        .eq('status', 'error')
        .gte('created_at', ago1d)
        .order('created_at', { ascending: false })
        .limit(25),
      db
        .from('ai_usage_events')
        .select('user_id, total_tokens, input_tokens, output_tokens')
        .gte('created_at', ago30d)
    ])

    const todayData = todayRes.data ?? []
    const weekData = weekRes.data ?? []
    const allUsage = allUsageRes.data ?? []

    // Summary
    const callsToday = todayData.length
    const tokensToday = todayData.reduce((s, r) => s + (r.total_tokens ?? 0), 0)
    const costTodayEur = todayData.reduce(
      (s, r) => s + estimateCost(r.input_tokens, r.output_tokens, r.total_tokens),
      0
    )
    const cost7dEur = weekData.reduce(
      (s, r) => s + estimateCost(r.input_tokens, r.output_tokens, r.total_tokens),
      0
    )
    const errorsLast24h = (errorRes.data ?? []).length
    const activeUsersToday = new Set(todayData.map(r => r.user_id)).size
    const activeUsers7d = new Set(weekData.map(r => r.user_id)).size
    const plansThisWeek = weekData.filter(
      r => r.action === 'planning_generation' && r.status === 'success'
    ).length

    // By route (7-day window)
    const routeMap = new Map<string, { calls: number; tokens: number; cost: number; errors: number }>()
    for (const row of weekData) {
      const cur = routeMap.get(row.route) ?? { calls: 0, tokens: 0, cost: 0, errors: 0 }
      cur.calls++
      cur.tokens += row.total_tokens ?? 0
      cur.cost += estimateCost(row.input_tokens, row.output_tokens, row.total_tokens)
      if (row.status === 'error') cur.errors++
      routeMap.set(row.route, cur)
    }
    const byRoute = Array.from(routeMap.entries())
      .map(([route, v]) => ({ route, calls: v.calls, tokens: v.tokens, costEur: v.cost, errors: v.errors }))
      .sort((a, b) => b.calls - a.calls)

    // Top users (30-day window)
    const userMap = new Map<string, { calls: number; tokens: number; cost: number }>()
    for (const row of allUsage) {
      const cur = userMap.get(row.user_id) ?? { calls: 0, tokens: 0, cost: 0 }
      cur.calls++
      cur.tokens += row.total_tokens ?? 0
      cur.cost += estimateCost(row.input_tokens, row.output_tokens, row.total_tokens)
      userMap.set(row.user_id, cur)
    }
    const topUsers = Array.from(userMap.entries())
      .map(([userId, v]) => ({ userId, calls: v.calls, tokens: v.tokens, costEur: v.cost }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10)

    const recentEvents = (last50Res.data ?? []).map(r => ({
      createdAt: r.created_at,
      route: r.route,
      action: r.action,
      model: r.model ?? null,
      totalTokens: r.total_tokens ?? null,
      status: r.status,
      errorCode: r.error_code ?? null
    }))

    const recentErrors = (errorRes.data ?? []).map(r => ({
      createdAt: r.created_at,
      route: r.route,
      action: r.action,
      errorCode: r.error_code ?? null,
      metadata: r.metadata ?? {}
    }))

    // Product activity — historial_examenes has no migration so wrap defensively
    let recentCorrections: AdminMetrics['productActivity']['recentCorrections'] = []
    let correctionsToday = 0
    try {
      const { data } = await db
        .from('historial_examenes')
        .select('created_at, asignatura, nota, nota_maxima')
        .order('created_at', { ascending: false })
        .limit(25)
      recentCorrections = (data ?? []).map((r: Record<string, unknown>) => ({
        createdAt: r.created_at as string,
        asignatura: (r.asignatura as string) ?? '',
        nota: (r.nota as number) ?? null,
        notaMaxima: (r.nota_maxima as number) ?? null
      }))
      correctionsToday = recentCorrections.filter(r => r.createdAt >= todayStart).length
    } catch {
      // historial_examenes may not exist; ignore
    }

    let recentSimulacros: AdminMetrics['productActivity']['recentSimulacros'] = []
    let simulacrosToday = 0
    try {
      const { data } = await db
        .from('historial_simulacros')
        .select('created_at, asignatura, estado, nota_final')
        .order('created_at', { ascending: false })
        .limit(25)
      recentSimulacros = (data ?? []).map(r => ({
        createdAt: r.created_at,
        asignatura: r.asignatura,
        estado: r.estado,
        notaFinal: r.nota_final ?? null
      }))
      simulacrosToday = recentSimulacros.filter(
        r => r.createdAt >= todayStart && r.estado === 'completado'
      ).length
    } catch {
      // ignore
    }

    return {
      summary: {
        callsToday,
        tokensToday,
        costTodayEur,
        cost7dEur,
        correctionsToday,
        simulacrosToday,
        plansThisWeek,
        errorsLast24h,
        activeUsersToday,
        activeUsers7d
      },
      byRoute,
      topUsers,
      recentEvents,
      recentErrors,
      productActivity: { recentCorrections, recentSimulacros },
      betaHealth: {
        aiActive: callsToday > 0 || allUsage.length > 0,
        trackingActive: allUsage.length > 0,
        errors24h: errorsLast24h,
        costToday: costTodayEur
      },
      calculatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[admin] fetchAdminMetrics error', err)
    return { ...EMPTY, calculatedAt: new Date().toISOString() }
  }
}
