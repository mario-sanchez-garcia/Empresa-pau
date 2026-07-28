import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
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

// Returns a stable 16-char hex ID that doesn't expose the real UUID.
function publicId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16)
}

function sortEntries(entries: Array<Omit<LeaderboardEntry, 'rank'>>) {
  return entries
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'es'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

async function getProfileMap(db: SupabaseClient, userIds: string[]): Promise<Map<string, Record<string, unknown>>> {
  if (!userIds.length) return new Map<string, Record<string, unknown>>()
  const { data } = await db.from('perfiles').select('*').in('id', userIds)
  return new Map<string, Record<string, unknown>>((data ?? []).map((row: Record<string, unknown>) => [String(row.id), row]))
}

async function getCommunityMap(db: SupabaseClient, userIds: string[]): Promise<Map<string, string>> {
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

function buildPayload(entries: LeaderboardEntry[], community: string) {
  const currentGlobal = entries.find(entry => entry.isCurrentUser) ?? null
  const communityEntries = sortEntries(entries.filter(entry => entry.community === community).map(({ rank: _rank, ...entry }) => entry))
  const currentCommunity = communityEntries.find(entry => entry.isCurrentUser) ?? null

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
      id: publicId(user.id),
      name: 'Tú',
      community: requestedCommunity,
      xp: Number(currentProgress?.xp_total ?? 0),
      isCurrentUser: true,
    }])

    return NextResponse.json(buildPayload(entries, requestedCommunity))
  }

  const { data: progressRows } = await serviceDb
    .from('camino_user_progress')
    .select('user_id,xp_total,updated_at')
    .order('xp_total', { ascending: false })
    .limit(500)

  type ProgressRow = { user_id: unknown; xp_total: unknown }
  const rows = (progressRows ?? []) as ProgressRow[]
  const userIds = Array.from(new Set([...rows.map(row => String(row.user_id)), user.id]))
  const [profiles, communities]: [Map<string, Record<string, unknown>>, Map<string, string>] = await Promise.all([
    getProfileMap(serviceDb, userIds).catch(() => new Map<string, Record<string, unknown>>()),
    getCommunityMap(serviceDb, userIds).catch(() => new Map<string, string>()),
  ])

  const currentProfile = profiles.get(user.id)
  const currentProgress = rows.find(row => row.user_id === user.id)
  const baseRows = currentProgress ? rows : [...rows, { user_id: user.id, xp_total: 0 } as ProgressRow]

  // perfiles.comunidad es ahora la fuente de verdad (escrita en
  // /api/onboarding/setup); billing_events queda como fallback para
  // usuarios que onboardearon antes de ese cambio y aún no se han
  // backfillado (ver scripts/backfill-perfiles-comunidad.mjs).
  function resolveCommunity(userId: string) {
    return profiles.get(userId)?.comunidad ?? communities.get(userId)
  }

  const entries = sortEntries(baseRows.map(row => {
    const userId = String(row.user_id)
    const isCurrentUser = userId === user.id
    const publicName = displayName(profiles.get(userId), '')
    if (!isCurrentUser && !publicName) return null
    return {
      id: publicId(userId),
      name: isCurrentUser ? 'Tú' : publicName,
      community: isCurrentUser
        ? cleanCommunity(resolveCommunity(userId) ?? requestedCommunity)
        : cleanCommunity(resolveCommunity(userId)),
      xp: Number(row.xp_total ?? 0),
      isCurrentUser,
    }
  }).filter((entry): entry is Omit<LeaderboardEntry, 'rank'> => entry !== null))

  return NextResponse.json(buildPayload(entries, cleanCommunity(resolveCommunity(user.id) ?? requestedCommunity ?? currentProfile?.comunidad)))
}

// NOTA: este archivo tenía un POST que escribía XP de forma redundante
// (camino_xp_events + camino_user_progress), sin ningún caller en el
// cliente (confirmado por grep de xpDelta/sourceId). Se elimina como
// parte del rediseño de Ligas — complete-mission/route.ts es ahora el
// único punto de escritura de XP, para no arriesgar duplicados.
