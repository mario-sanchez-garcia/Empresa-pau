import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

type QueueRow = { user_id: string; subject: string; queue_status: string }
type CalRow = { user_id: string; status: string; scheduled_date: string; completed_at: string | null }
type ProgressRow = { user_id: string; xp_total: number; streak_days: number }
type EntitlementRow = { student_user_id: string }

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!isInternalUser(userData.user.email)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const db = createServiceClient()
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

  const [queueRes, calRes, progressRes] = await Promise.all([
    db.from('user_learning_queue').select('user_id, subject, queue_status'),
    db.from('camino_calendar').select('user_id, status, scheduled_date, completed_at'),
    db.from('camino_user_progress').select('user_id, xp_total, streak_days'),
  ])

  let premiumSet = new Set<string>()
  try {
    const entRes = await db.from('user_entitlements').select('student_user_id').eq('status', 'active')
    premiumSet = new Set((entRes.data as EntitlementRow[] ?? []).map(e => e.student_user_id))
  } catch { /* table may not exist in all envs */ }

  const queueRows = (queueRes.data ?? []) as QueueRow[]
  const calRows = (calRes.data ?? []) as CalRow[]
  const progressRows = (progressRes.data ?? []) as ProgressRow[]

  const allUserIds = new Set([
    ...queueRows.map(r => r.user_id),
    ...progressRows.map(r => r.user_id),
  ])
  const userIds = [...allUserIds]

  if (userIds.length === 0) {
    return NextResponse.json({ users: [], generatedAt: new Date().toISOString() })
  }

  // Fetch emails via auth admin API
  const emailMap = new Map<string, string>()
  try {
    const { data: listData } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const u of (listData?.users ?? [])) {
      if (u.email) emailMap.set(u.id, u.email)
    }
  } catch { /* admin API may not be available */ }

  const users = userIds.map(userId => {
    const uQueueRows = queueRows.filter(r => r.user_id === userId)
    const subjects = [...new Set(uQueueRows.map(r => r.subject))]
      .map(s => s === 'matematicas_ii' ? 'Mates' : s === 'historia_espana' ? 'Historia' : s)
      .join(' + ')

    const pending = uQueueRows.filter(r => r.queue_status === 'pending').length
    const scheduled = uQueueRows.filter(r => r.queue_status === 'scheduled').length
    const completed = uQueueRows.filter(r => r.queue_status === 'completed').length
    const postponed = uQueueRows.filter(r => r.queue_status === 'postponed').length

    const uCalRows = calRows.filter(r => r.user_id === userId)
    const futureDays = new Set(
      uCalRows
        .filter(r => r.status === 'pending' && r.scheduled_date >= today)
        .map(r => r.scheduled_date),
    ).size

    const completedCal = uCalRows
      .filter(r => r.status === 'completed' && r.completed_at)
      .sort((a, b) => (b.completed_at ?? '') > (a.completed_at ?? '') ? 1 : -1)
    const lastCompleted = completedCal[0]?.completed_at ?? null

    const progress = progressRows.find(r => r.user_id === userId)

    return {
      email: emailMap.get(userId) ?? userId.slice(0, 8) + '…',
      subjects: subjects || '—',
      queuePending: pending,
      queueScheduled: scheduled,
      queueCompleted: completed,
      queuePostponed: postponed,
      futureDays,
      lastCompleted,
      streak: progress?.streak_days ?? 0,
      xpTotal: Number(progress?.xp_total) || 0,
      plan: premiumSet.has(userId) ? 'premium' : 'free',
    }
  })

  users.sort((a, b) => b.xpTotal - a.xpTotal)

  return NextResponse.json({ users, generatedAt: new Date().toISOString() })
}
