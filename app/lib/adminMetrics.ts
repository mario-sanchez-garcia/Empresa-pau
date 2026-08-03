// Server-only. Never import this in client components.
import { createClient } from '@supabase/supabase-js'

// Approximate internal estimates. Update when provider pricing changes.
const APPROX_INPUT_EUR_PER_TOKEN = 0.0000028   // ~$3/M input tokens
const APPROX_OUTPUT_EUR_PER_TOKEN = 0.000014    // ~$15/M output tokens
const APPROX_AVG_EUR_PER_TOKEN = 0.000007       // fallback when only total_tokens known

export function estimateCostEur(
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

// Human-readable labels for route+action combinations
const ROUTE_ACTION_LABELS: Record<string, string> = {
  '/api/chat|chat': 'Chat con Kairo',
  '/api/chat|image_correction': 'Corrección imagen',
  '/api/chat|correction': 'Corrección texto',
  '/api/planning|planning_generation': 'Mi Plan',
  '/api/simulacro|simulacro_correction': 'Simulacro',
  '/api/simulacro|parcial_correction': 'Práctica parcial',
  '/api/parciales/plan-intensity|parciales_plan_intensity': 'Plan de parcial (IA)'
}

function routeActionLabel(route: string, action: string): string {
  return ROUTE_ACTION_LABELS[`${route}|${action}`] ?? `${route.replace('/api/', '')} / ${action}`
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

export type RangeSummary = {
  calls: number
  tokens: number
  costEur: number
  errors: number
  activeUsers: number
  corrections: number
  simulacros: number
  plans: number
}

export type AiCostSummary = {
  calls: number
  totalCostEur: number
  avgCostEur: number
  avgInputTokens: number
  avgOutputTokens: number
  avgTotalTokens: number
}

export type AiCostByRoute = {
  route: string
  action: string
  label: string
  calls: number
  totalCostEur: number
  avgCostEur: number
  avgInputTokens: number
  avgOutputTokens: number
  avgTotalTokens: number
}

export type AiImageCostComparison = {
  hasImage: boolean
  label: string
  calls: number
  avgInputTokens: number
  avgOutputTokens: number
  avgCostEur: number
  avgImagePayloadChars: number
}

export type AiExpensiveCall = {
  createdAt: string
  route: string
  action: string
  label: string
  model: string | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  estimatedCostEur: number
  imageCount: number | null
}

export type AdminMetrics = {
  summaryToday: RangeSummary
  summary7d: RangeSummary
  summary30d: RangeSummary
  aiCosts: {
    last7Days: AiCostSummary
    last30Days: AiCostSummary
    byRoute: AiCostByRoute[]
    imageVsText: AiImageCostComparison[]
    mostExpensiveCalls: AiExpensiveCall[]
  }
  byRouteAction: Array<{
    route: string
    action: string
    label: string
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
    lastActive: string | null
  }>
  simulacrosStats: {
    total: number
    completados: number
    enProgreso: number
    abandoned: number
    completionRate: number
  }
  recentEvents: Array<{
    createdAt: string
    route: string
    action: string
    label: string
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
  caminoMetrics: {
    activeUsers7d: number
    tasksCompleted7d: number
    tasksCompleted30d: number
    missionsCompleted7d: number
    xpGenerated7d: number
    avgStreak: number
    missionCompletionRate: number
    routeDistribution: Record<string, number>
  }
  billingMetrics: {
    linksCreated7d: number
    linksPaid7d: number
    linksCreated30d: number
    linksPaid30d: number
    activeEntitlements: number
    revenueEurCents7d: number
    recentLinks: Array<{
      id: string
      status: string
      planId: string
      priceCents: number
      studentUserId: string
      createdAt: string
      paidAt: string | null
    }>
  }
  calculatedAt: string
}

const EMPTY_RANGE: RangeSummary = {
  calls: 0, tokens: 0, costEur: 0, errors: 0,
  activeUsers: 0, corrections: 0, simulacros: 0, plans: 0
}

const EMPTY_AI_COST_SUMMARY: AiCostSummary = {
  calls: 0,
  totalCostEur: 0,
  avgCostEur: 0,
  avgInputTokens: 0,
  avgOutputTokens: 0,
  avgTotalTokens: 0
}

const EMPTY_BILLING = {
  linksCreated7d: 0,
  linksPaid7d: 0,
  linksCreated30d: 0,
  linksPaid30d: 0,
  activeEntitlements: 0,
  revenueEurCents7d: 0,
  recentLinks: [] as AdminMetrics['billingMetrics']['recentLinks'],
}

const EMPTY_CAMINO = {
  activeUsers7d: 0,
  tasksCompleted7d: 0,
  tasksCompleted30d: 0,
  missionsCompleted7d: 0,
  xpGenerated7d: 0,
  avgStreak: 0,
  missionCompletionRate: 0,
  routeDistribution: {}
}

const EMPTY: AdminMetrics = {
  summaryToday: { ...EMPTY_RANGE },
  summary7d: { ...EMPTY_RANGE },
  summary30d: { ...EMPTY_RANGE },
  aiCosts: {
    last7Days: { ...EMPTY_AI_COST_SUMMARY },
    last30Days: { ...EMPTY_AI_COST_SUMMARY },
    byRoute: [],
    imageVsText: [],
    mostExpensiveCalls: []
  },
  byRouteAction: [],
  topUsers: [],
  simulacrosStats: { total: 0, completados: 0, enProgreso: 0, abandoned: 0, completionRate: 0 },
  recentEvents: [],
  recentErrors: [],
  productActivity: { recentCorrections: [], recentSimulacros: [] },
  caminoMetrics: { ...EMPTY_CAMINO },
  billingMetrics: { ...EMPTY_BILLING },
  calculatedAt: ''
}

type UsageRow = {
  user_id: string
  route: string
  action: string
  status: string
  total_tokens: number | null
  input_tokens: number | null
  output_tokens: number | null
  estimated_cost_eur: number | null
  model: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type AiCostBucket = {
  route: string
  action: string
  calls: number
  cost: number
  input: number
  output: number
  total: number
}

function buildRangeSummary(
  rows: UsageRow[],
  since: string,
  correctionsSince: number,
  simulacrosSince: number,
  plansLabel = 'planning_generation'
): RangeSummary {
  const filtered = rows.filter(r => r.created_at >= since)
  return {
    calls: filtered.length,
    tokens: filtered.reduce((s, r) => s + (r.total_tokens ?? 0), 0),
    costEur: filtered.reduce((s, r) => s + estimateCostEur(r.input_tokens, r.output_tokens, r.total_tokens), 0),
    errors: filtered.filter(r => r.status === 'error').length,
    activeUsers: new Set(filtered.map(r => r.user_id)).size,
    corrections: correctionsSince,
    simulacros: simulacrosSince,
    plans: filtered.filter(r => r.action === plansLabel && r.status === 'success').length
  }
}

function rowCostEur(row: UsageRow) {
  return Number(row.estimated_cost_eur ?? estimateCostEur(row.input_tokens, row.output_tokens, row.total_tokens) ?? 0)
}

function buildAiCostSummary(rows: UsageRow[]): AiCostSummary {
  const calls = rows.length
  if (calls === 0) return { ...EMPTY_AI_COST_SUMMARY }
  const totalCostEur = rows.reduce((sum, row) => sum + rowCostEur(row), 0)
  return {
    calls,
    totalCostEur,
    avgCostEur: totalCostEur / calls,
    avgInputTokens: rows.reduce((sum, row) => sum + (row.input_tokens ?? 0), 0) / calls,
    avgOutputTokens: rows.reduce((sum, row) => sum + (row.output_tokens ?? 0), 0) / calls,
    avgTotalTokens: rows.reduce((sum, row) => sum + (row.total_tokens ?? 0), 0) / calls
  }
}

function metadataNumber(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function metadataBoolean(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key]
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

function buildAiCosts(rows: UsageRow[], ago7d: string, ago30d: string): AdminMetrics['aiCosts'] {
  const rows30d = rows.filter(row => row.created_at >= ago30d)
  const rows7d = rows30d.filter(row => row.created_at >= ago7d)

  const byRouteMap = new Map<string, AiCostBucket>()
  for (const row of rows7d) {
    const key = `${row.route}|${row.action}`
    const current = byRouteMap.get(key) ?? { route: row.route, action: row.action, calls: 0, cost: 0, input: 0, output: 0, total: 0 }
    current.calls++
    current.cost += rowCostEur(row)
    current.input += row.input_tokens ?? 0
    current.output += row.output_tokens ?? 0
    current.total += row.total_tokens ?? 0
    byRouteMap.set(key, current)
  }

  const byRoute = Array.from(byRouteMap.values())
    .map(item => ({
      route: item.route,
      action: item.action,
      label: routeActionLabel(item.route, item.action),
      calls: item.calls,
      totalCostEur: item.cost,
      avgCostEur: item.calls > 0 ? item.cost / item.calls : 0,
      avgInputTokens: item.calls > 0 ? item.input / item.calls : 0,
      avgOutputTokens: item.calls > 0 ? item.output / item.calls : 0,
      avgTotalTokens: item.calls > 0 ? item.total / item.calls : 0
    }))
    .sort((a, b) => b.totalCostEur - a.totalCostEur)

  const imageGroups = new Map<string, { hasImage: boolean; calls: number; input: number; output: number; cost: number; imagePayload: number }>()
  for (const row of rows7d) {
    const hasImage = metadataBoolean(row.metadata, 'hasImage') || metadataBoolean(row.metadata, 'blockHasImage')
    const key = hasImage ? 'image' : 'text'
    const current = imageGroups.get(key) ?? { hasImage, calls: 0, input: 0, output: 0, cost: 0, imagePayload: 0 }
    current.calls++
    current.input += row.input_tokens ?? 0
    current.output += row.output_tokens ?? 0
    current.cost += rowCostEur(row)
    current.imagePayload += metadataNumber(row.metadata, 'imagePayloadChars') ?? metadataNumber(row.metadata, 'blockImagePayloadChars') ?? 0
    imageGroups.set(key, current)
  }

  const imageVsText = Array.from(imageGroups.values())
    .map(item => ({
      hasImage: item.hasImage,
      label: item.hasImage ? 'Imagen' : 'Texto / sin imagen',
      calls: item.calls,
      avgInputTokens: item.calls > 0 ? item.input / item.calls : 0,
      avgOutputTokens: item.calls > 0 ? item.output / item.calls : 0,
      avgCostEur: item.calls > 0 ? item.cost / item.calls : 0,
      avgImagePayloadChars: item.calls > 0 ? item.imagePayload / item.calls : 0
    }))
    .sort((a, b) => Number(b.hasImage) - Number(a.hasImage))

  const mostExpensiveCalls = rows7d
    .map(row => ({
      createdAt: row.created_at,
      route: row.route,
      action: row.action,
      label: routeActionLabel(row.route, row.action),
      model: row.model ?? null,
      inputTokens: row.input_tokens ?? null,
      outputTokens: row.output_tokens ?? null,
      totalTokens: row.total_tokens ?? null,
      estimatedCostEur: rowCostEur(row),
      imageCount: metadataNumber(row.metadata, 'imageCount') ?? metadataNumber(row.metadata, 'blockImageCount')
    }))
    .sort((a, b) => b.estimatedCostEur - a.estimatedCostEur)
    .slice(0, 5)

  return {
    last7Days: buildAiCostSummary(rows7d),
    last30Days: buildAiCostSummary(rows30d),
    byRoute,
    imageVsText,
    mostExpensiveCalls
  }
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const db = adminClient()
  if (!db) return { ...EMPTY, calculatedAt: new Date().toISOString() }

  const todayStart = startOfDayUtc()
  const ago7d = daysAgoUtc(7)
  const ago30d = daysAgoUtc(30)
  const ago1d = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const ago2h = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  try {
    const [usageRes, last50Res, errorRes] = await Promise.all([
      // 30d of all usage events for range computations
      db
        .from('ai_usage_events')
        .select('user_id, route, action, status, total_tokens, input_tokens, output_tokens, estimated_cost_eur, model, metadata, created_at')
        .gte('created_at', ago30d)
        .order('created_at', { ascending: false }),
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
        .limit(25)
    ])

    const allUsage: UsageRow[] = usageRes.data ?? []

    // Corrections and simulacros counts per range (fetched separately for accuracy)
    let correctionsToday = 0, corrections7d = 0
    try {
      const { data } = await db
        .from('historial_examenes')
        .select('created_at')
        .gte('created_at', ago7d)
      const rows = data ?? []
      correctionsToday = rows.filter((r: { created_at: string }) => r.created_at >= todayStart).length
      corrections7d = rows.length
    } catch { /* historial_examenes may not exist */ }

    let simulacrosToday = 0, simulacros7d = 0
    let simulacrosStats: AdminMetrics['simulacrosStats'] = { total: 0, completados: 0, enProgreso: 0, abandoned: 0, completionRate: 0 }
    try {
      const { data } = await db
        .from('historial_simulacros')
        .select('created_at, estado')
      const all = data ?? []
      const completados = all.filter((r: { estado: string }) => r.estado === 'completado')
      const enProgreso = all.filter((r: { estado: string; created_at: string }) => r.estado === 'en_progreso')
      const abandoned = enProgreso.filter((r: { created_at: string }) => r.created_at < ago2h)
      simulacrosToday = completados.filter((r: { created_at: string }) => r.created_at >= todayStart).length
      simulacros7d = completados.filter((r: { created_at: string }) => r.created_at >= ago7d).length
      simulacrosStats = {
        total: all.length,
        completados: completados.length,
        enProgreso: enProgreso.length,
        abandoned: abandoned.length,
        completionRate: all.length > 0 ? completados.length / all.length : 0
      }
    } catch { /* ignore */ }

    // Range summaries
    const summaryToday = buildRangeSummary(allUsage, todayStart, correctionsToday, simulacrosToday)
    const summary7d = buildRangeSummary(allUsage, ago7d, corrections7d, simulacros7d)
    const summary30d = buildRangeSummary(allUsage, ago30d, 0, 0)
    const aiCosts = buildAiCosts(allUsage, ago7d, ago30d)

    // By route+action (7d window)
    const raMap = new Map<string, { route: string; action: string; calls: number; tokens: number; cost: number; errors: number }>()
    for (const row of allUsage.filter(r => r.created_at >= ago7d)) {
      const key = `${row.route}|${row.action}`
      const cur = raMap.get(key) ?? { route: row.route, action: row.action, calls: 0, tokens: 0, cost: 0, errors: 0 }
      cur.calls++
      cur.tokens += row.total_tokens ?? 0
      cur.cost += estimateCostEur(row.input_tokens, row.output_tokens, row.total_tokens)
      if (row.status === 'error') cur.errors++
      raMap.set(key, cur)
    }
    const byRouteAction = Array.from(raMap.values())
      .map(v => ({ ...v, costEur: v.cost, label: routeActionLabel(v.route, v.action) }))
      .sort((a, b) => b.calls - a.calls)

    // Top users (30d), with lastActive
    const userMap = new Map<string, { calls: number; tokens: number; cost: number; lastActive: string | null }>()
    for (const row of allUsage) {
      const cur = userMap.get(row.user_id) ?? { calls: 0, tokens: 0, cost: 0, lastActive: null }
      cur.calls++
      cur.tokens += row.total_tokens ?? 0
      cur.cost += estimateCostEur(row.input_tokens, row.output_tokens, row.total_tokens)
      if (!cur.lastActive || row.created_at > cur.lastActive) cur.lastActive = row.created_at
      userMap.set(row.user_id, cur)
    }
    const topUsers = Array.from(userMap.entries())
      .map(([userId, v]) => ({ userId, calls: v.calls, tokens: v.tokens, costEur: v.cost, lastActive: v.lastActive }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10)

    const recentEvents = (last50Res.data ?? []).map(r => ({
      createdAt: r.created_at,
      route: r.route,
      action: r.action,
      label: routeActionLabel(r.route, r.action),
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

    // Product activity (most recent for display)
    let recentCorrections: AdminMetrics['productActivity']['recentCorrections'] = []
    try {
      const { data } = await db
        .from('historial_examenes')
        .select('created_at, asignatura, nota, nota_maxima')
        .order('created_at', { ascending: false })
        .limit(20)
      recentCorrections = (data ?? []).map((r: Record<string, unknown>) => ({
        createdAt: r.created_at as string,
        asignatura: (r.asignatura as string) ?? '',
        nota: (r.nota as number) ?? null,
        notaMaxima: (r.nota_maxima as number) ?? null
      }))
    } catch { /* historial_examenes may not exist */ }

    let recentSimulacros: AdminMetrics['productActivity']['recentSimulacros'] = []
    try {
      const { data } = await db
        .from('historial_simulacros')
        .select('created_at, asignatura, estado, nota_final')
        .order('created_at', { ascending: false })
        .limit(20)
      recentSimulacros = (data ?? []).map(r => ({
        createdAt: r.created_at,
        asignatura: r.asignatura,
        estado: r.estado,
        notaFinal: r.nota_final ?? null
      }))
    } catch { /* ignore */ }

    // Camino PAU metrics — separate try/catch so Camino tables not existing doesn't break admin panel
    let caminoMetrics: AdminMetrics['caminoMetrics'] = { ...EMPTY_CAMINO }
    try {
      const [taskCompletionsRes, missionsRes, progressRes, routeSettingsRes] = await Promise.all([
        db.from('camino_task_completions')
          .select('user_id, completed_at')
          .gte('completed_at', ago30d),
        db.from('camino_daily_missions')
          .select('user_id, completed, mission_date')
          .gte('mission_date', ago7d),
        db.from('camino_user_progress')
          .select('streak_days'),
        db.from('camino_route_settings')
          .select('route_id')
      ])

      const allTaskCompletions = taskCompletionsRes.data ?? []
      const tasksCompleted7d = allTaskCompletions.filter(r => r.completed_at >= ago7d).length
      const tasksCompleted30d = allTaskCompletions.length
      const activeUsers7d = new Set(allTaskCompletions.filter(r => r.completed_at >= ago7d).map(r => r.user_id)).size

      const missions = missionsRes.data ?? []
      const completedMissions = missions.filter(r => r.completed)
      const missionsCompleted7d = completedMissions.length
      const missionCompletionRate = missions.length > 0 ? completedMissions.length / missions.length : 0

      const progressRows = progressRes.data ?? []
      const avgStreak = progressRows.length > 0
        ? Math.round(progressRows.reduce((s: number, r: { streak_days: number }) => s + (r.streak_days ?? 0), 0) / progressRows.length)
        : 0

      // XP generated in last 7d via xp_events (best effort)
      let xpGenerated7d = 0
      try {
        const { data: xpRows } = await db
          .from('camino_xp_events')
          .select('xp_amount')
          .gte('created_at', ago7d)
        xpGenerated7d = (xpRows ?? []).reduce((s: number, r: { xp_amount: number }) => s + (r.xp_amount ?? 0), 0)
      } catch { /* camino_xp_events may not exist */ }

      const routeDistribution: Record<string, number> = {}
      for (const r of routeSettingsRes.data ?? []) {
        const key = r.route_id ?? 'completa'
        routeDistribution[key] = (routeDistribution[key] ?? 0) + 1
      }

      caminoMetrics = {
        activeUsers7d,
        tasksCompleted7d,
        tasksCompleted30d,
        missionsCompleted7d,
        xpGenerated7d,
        avgStreak,
        missionCompletionRate,
        routeDistribution
      }
    } catch { /* camino tables may not exist — safe to skip */ }

    // Billing metrics — separate try/catch so missing tables don't break admin panel
    let billingMetrics: AdminMetrics['billingMetrics'] = { ...EMPTY_BILLING }
    try {
      const [linksRes, entitlementsRes, recentLinksRes] = await Promise.all([
        db.from('parent_checkout_links')
          .select('status, price_cents, created_at, paid_at')
          .gte('created_at', ago30d),
        db.from('user_entitlements')
          .select('id')
          .eq('status', 'active'),
        db.from('parent_checkout_links')
          .select('id, status, plan_id, price_cents, student_user_id, created_at, paid_at')
          .order('created_at', { ascending: false })
          .limit(20)
      ])

      const allLinks = linksRes.data ?? []
      const linksCreated7d = allLinks.filter(r => r.created_at >= ago7d).length
      const linksPaid7d = allLinks.filter(r => r.status === 'paid' && r.paid_at && r.paid_at >= ago7d).length
      const linksCreated30d = allLinks.length
      const linksPaid30d = allLinks.filter(r => r.status === 'paid').length
      const revenueEurCents7d = allLinks
        .filter(r => r.status === 'paid' && r.paid_at && r.paid_at >= ago7d)
        .reduce((s: number, r: { price_cents: number }) => s + (r.price_cents ?? 0), 0)

      billingMetrics = {
        linksCreated7d,
        linksPaid7d,
        linksCreated30d,
        linksPaid30d,
        activeEntitlements: entitlementsRes.data?.length ?? 0,
        revenueEurCents7d,
        recentLinks: (recentLinksRes.data ?? []).map(r => ({
          id: r.id,
          status: r.status,
          planId: r.plan_id,
          priceCents: r.price_cents,
          studentUserId: r.student_user_id,
          createdAt: r.created_at,
          paidAt: r.paid_at ?? null,
        }))
      }
    } catch { /* billing tables may not exist */ }

    return {
      summaryToday,
      summary7d,
      summary30d,
      aiCosts,
      byRouteAction,
      topUsers,
      simulacrosStats,
      recentEvents,
      recentErrors,
      productActivity: { recentCorrections, recentSimulacros },
      caminoMetrics,
      billingMetrics,
      calculatedAt: new Date().toISOString()
    }
  } catch (err) {
    console.error('[admin] fetchAdminMetrics error', err)
    return { ...EMPTY, calculatedAt: new Date().toISOString() }
  }
}
