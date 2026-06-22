import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, createUserSupabase, getAuthContext } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

type LeaderboardEntry = {
  id: string
  name: string
  community: string
  xp: number
  rank: number
  isCurrentUser: boolean
}

const DEFAULT_COMMUNITY = 'Sin comunidad'

function cleanCommunity(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 40) : DEFAULT_COMMUNITY
}

function safeName(value: unknown) {
  if (typeof value !== 'string') return ''
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, 32)
  if (!cleaned || cleaned.includes('@')) return ''
  return cleaned
}

function displayName(profile: Record<string, unknown> | undefined, fallback: string) {
  return safeName(profile?.display_name) || safeName(profile?.displayName) || safeName(profile?.nombre) || safeName(profile?.name) || fallback
}

function sortEntries(entries: Array<Omit<LeaderboardEntry, 'rank'>>) {
  return entries
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'es'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

async function getProfileMap(db: any, userIds: string[]): Promise<Map<string, Record<string, unknown>>> {
  if (!userIds.length) return new Map<string, Record<string, unknown>>()
  const { data } = await db.from('perfiles').select('*').in('id', userIds)
  return new Map<string, Record<string, unknown>>((data ?? []).map((row: Record<string, unknown>) => [String(row.id), row]))
}

async function getCommunityMap(db: any, userIds: string[]): Promise<Map<string, string>> {
  if (!userIds.length) return new Map<string, string>()
  const { data } = await db
    .from('billing_events')
    .select('user_id,payload,created_at')
    .eq('event_type', 'onboarding_completed')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  const communities = new Map<string, string>()
  for (const row of data ?? []) {
    const userId = String(row.user_id ?? '')
    if (!userId || communities.has(userId)) continue
    communities.set(userId, cleanCommunity((row.payload as Record<string, unknown> | null)?.community))
  }
  return communities
}

function buildPayload(entries: LeaderboardEntry[], currentUserId: string, community: string) {
  const currentGlobal = entries.find(entry => entry.id === currentUserId) ?? null
  const communityEntries = sortEntries(entries.filter(entry => entry.community === community).map(({ rank: _rank, ...entry }) => entry))
  const currentCommunity = communityEntries.find(entry => entry.id === currentUserId) ?? null

  return {
    global: {
      top: entries.slice(0, 5),
      current: currentGlobal,
    },
    community: {
      name: community,
      top: community === DEFAULT_COMMUNITY ? [] : communityEntries.slice(0, 5),
      current: community === DEFAULT_COMMUNITY ? null : currentCommunity,
    },
    currentXp: currentGlobal?.xp ?? 0,
    realUserCount: entries.length,
  }
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  const { user, accessToken } = authContext
  const requestedCommunity = cleanCommunity(request.nextUrl.searchParams.get('community'))
  const userSupabase = createUserSupabase(accessToken)
  const serviceDb = createServiceSupabase()

  if (!serviceDb) {
    const { data: currentProgress } = await userSupabase
      .from('camino_user_progress')
      .select('xp_total')
      .eq('user_id', user.id)
      .maybeSingle()

    const entries = sortEntries([{
      id: user.id,
      name: 'Tú',
      community: requestedCommunity,
      xp: Number(currentProgress?.xp_total ?? 0),
      isCurrentUser: true,
    }])

    return NextResponse.json(buildPayload(entries, user.id, requestedCommunity))
  }

  const { data: progressRows } = await serviceDb
    .from('camino_user_progress')
    .select('user_id,xp_total,updated_at')
    .order('xp_total', { ascending: false })
    .limit(500)

  const rows = progressRows ?? []
  const userIds = Array.from(new Set([...rows.map((row: any) => String(row.user_id)), user.id]))
  const [profiles, communities]: [Map<string, Record<string, unknown>>, Map<string, string>] = await Promise.all([
    getProfileMap(serviceDb, userIds).catch(() => new Map<string, Record<string, unknown>>()),
    getCommunityMap(serviceDb, userIds).catch(() => new Map<string, string>()),
  ])

  const currentProfile = profiles.get(user.id)
  const currentProgress = rows.find((row: any) => row.user_id === user.id)
  const baseRows = currentProgress ? rows : [...rows, { user_id: user.id, xp_total: 0 }]

  const entries = sortEntries(baseRows.map((row: any) => {
    const userId = String(row.user_id)
    const isCurrentUser = userId === user.id
    return {
      id: userId,
      name: isCurrentUser ? 'Tú' : displayName(profiles.get(userId), 'Alumno PAU'),
      community: isCurrentUser
        ? cleanCommunity(communities.get(userId) ?? requestedCommunity)
        : cleanCommunity(communities.get(userId) ?? profiles.get(userId)?.community),
      xp: Number(row.xp_total ?? 0),
      isCurrentUser,
    }
  }))

  return NextResponse.json(buildPayload(entries, user.id, cleanCommunity(communities.get(user.id) ?? requestedCommunity ?? currentProfile?.community)))
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const xpDelta = Number(body.xpDelta ?? 0)
  const sourceId = typeof body.sourceId === 'string' ? body.sourceId.slice(0, 120) : ''
  if (!sourceId || !Number.isFinite(xpDelta) || xpDelta <= 0 || xpDelta > 500) {
    return NextResponse.json({ error: 'XP inválido' }, { status: 400 })
  }

  const supabase = createUserSupabase(accessToken)
  const today = new Date().toISOString().slice(0, 10)
  const { data: inserted } = await supabase
    .from('camino_xp_events')
    .upsert(
      { user_id: user.id, source_type: 'calendar_mission', source_id: sourceId, xp_amount: xpDelta, mission_date: today },
      { onConflict: 'user_id,source_type,source_id,mission_date', ignoreDuplicates: true }
    )
    .select('id')

  if (!inserted || inserted.length === 0) {
    const { data: currentProgress } = await supabase
      .from('camino_user_progress')
      .select('xp_total')
      .eq('user_id', user.id)
      .maybeSingle()
    return NextResponse.json({ ok: true, alreadySynced: true, xpTotal: currentProgress?.xp_total ?? 0 })
  }

  const { data: currentProgress } = await supabase
    .from('camino_user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!currentProgress) {
    await supabase.from('camino_user_progress').insert({
      user_id: user.id,
      xp_total: xpDelta,
      streak_days: 0,
      longest_streak: 0,
      missions_completed: 0,
      level_mates: 1,
      level_historia: 1,
      level_ingles: 1,
      progress_towards_pau: 1,
      updated_at: new Date().toISOString(),
    })
  } else {
    await supabase
      .from('camino_user_progress')
      .update({
        xp_total: Number(currentProgress.xp_total ?? 0) + xpDelta,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
  }

  return NextResponse.json({ ok: true, alreadySynced: false })
}
