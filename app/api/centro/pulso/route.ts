import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getTopicByV2SortOrder, subjectLabelFromSlug, normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'

export const dynamic = 'force-dynamic'

// --- Types ---

type PulsoResponse =
  | { enoughData: false }
  | {
      enoughData: true
      centroDisplay: string
      subject: string
      topicName: string
      position: 'ahead' | 'same' | 'behind'
      delta: number
      peers: number
    }

// --- In-memory cache: 1 hour per school:subject key ---

interface CacheEntry { data: PulsoResponse; expiresAt: number }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000

function getCached(key: string): PulsoResponse | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null }
  return entry.data
}

function setCached(key: string, data: PulsoResponse) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// --- Helpers ---

function normalizeSchool(raw: string): string {
  return raw.trim().toLowerCase()
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

// --- Handler ---

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })

  // 1. Get the user's own onboarding event (most recent)
  const { data: selfEvents } = await db
    .from('billing_events')
    .select('payload, created_at')
    .eq('user_id', user.id)
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(1)

  const selfPayload = (selfEvents?.[0]?.payload ?? {}) as Record<string, unknown>
  const rawSchool = typeof selfPayload.school_name === 'string' ? selfPayload.school_name : ''

  if (!rawSchool || normalizeSchool(rawSchool) === 'mi centro no aparece') {
    return NextResponse.json({ enoughData: false } satisfies PulsoResponse)
  }

  const centroDisplay = rawSchool.trim()
  const normalizedSchool = normalizeSchool(rawSchool)

  // 2. Determine the user's priority subject from onboarding, then refine with actual progress
  const onboardingSubjects = Array.isArray(selfPayload.subjects) ? (selfPayload.subjects as string[]) : []
  const firstSubjectSlug = onboardingSubjects.length
    ? normalizeSubjectSlug(onboardingSubjects[0])
    : null

  // Get user's own completed missions to find most-progressed subject
  const { data: selfMissions } = await db
    .from('camino_calendar')
    .select('subject, v2_sort_order')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('v2_sort_order', 'is', null)

  let prioritySubject: string | null = null
  let userMaxPosition = 0

  if (selfMissions && selfMissions.length > 0) {
    // Group by subject → find highest max(v2_sort_order)
    const bySubject = new Map<string, number>()
    for (const row of selfMissions as { subject: string; v2_sort_order: number }[]) {
      const cur = bySubject.get(row.subject) ?? 0
      if (row.v2_sort_order > cur) bySubject.set(row.subject, row.v2_sort_order)
    }
    // Pick subject with highest max
    let bestMax = -1
    for (const [subj, maxPos] of bySubject) {
      if (maxPos > bestMax) { bestMax = maxPos; prioritySubject = subj }
    }
    userMaxPosition = bestMax
  }

  if (!prioritySubject) prioritySubject = firstSubjectSlug
  if (!prioritySubject) return NextResponse.json({ enoughData: false } satisfies PulsoResponse)

  const cacheKey = `${normalizedSchool}:${prioritySubject}`
  const cached = getCached(cacheKey)
  if (cached) return NextResponse.json(cached)

  // 3. Get all onboarding_completed events to find users at same school
  const { data: allEvents } = await db
    .from('billing_events')
    .select('user_id, payload, created_at')
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })

  // Dedupe: most recent event per user
  const latestByUser = new Map<string, Record<string, unknown>>()
  for (const row of (allEvents ?? []) as { user_id: string; payload: Record<string, unknown>; created_at: string }[]) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row.payload)
  }

  // Filter by same normalized school
  const peerUserIds: string[] = []
  for (const [uid, payload] of latestByUser) {
    const school = typeof payload.school_name === 'string' ? normalizeSchool(payload.school_name) : ''
    if (school === normalizedSchool) peerUserIds.push(uid)
  }

  // Privacy threshold: need at least 3 peers (including the user themselves)
  if (peerUserIds.length < 3) {
    const result: PulsoResponse = { enoughData: false }
    setCached(cacheKey, result)
    return NextResponse.json(result)
  }

  // 4. Get max(v2_sort_order) per peer user for the priority subject
  const { data: peerMissions } = await db
    .from('camino_calendar')
    .select('user_id, v2_sort_order')
    .in('user_id', peerUserIds)
    .eq('subject', prioritySubject)
    .eq('status', 'completed')
    .not('v2_sort_order', 'is', null)

  // Build per-user max position
  const maxByUser = new Map<string, number>()
  for (const row of (peerMissions ?? []) as { user_id: string; v2_sort_order: number }[]) {
    const cur = maxByUser.get(row.user_id) ?? 0
    if (row.v2_sort_order > cur) maxByUser.set(row.user_id, row.v2_sort_order)
  }

  // Only include peers who have data for this subject
  const peerPositions = [...maxByUser.values()]

  if (peerPositions.length < 2) {
    // Not enough activity data for this subject → no useful comparison
    const result: PulsoResponse = { enoughData: false }
    setCached(cacheKey, result)
    return NextResponse.json(result)
  }

  // 5. Calculate median peer position
  const medianPosition = median(peerPositions)

  // 6. Get topic name for median position
  const medianTopic = getTopicByV2SortOrder(prioritySubject, medianPosition)
  const topicName = medianTopic?.title ?? `Tema ${medianPosition}`

  // 7. Compare user's position to median
  const delta = Math.abs(userMaxPosition - medianPosition)
  const position: 'ahead' | 'same' | 'behind' =
    delta <= 1 ? 'same' : userMaxPosition > medianPosition ? 'ahead' : 'behind'

  const result: PulsoResponse = {
    enoughData: true,
    centroDisplay,
    subject: subjectLabelFromSlug(prioritySubject),
    topicName,
    position,
    delta,
    peers: peerUserIds.length,
  }

  setCached(cacheKey, result)
  return NextResponse.json(result)
}
