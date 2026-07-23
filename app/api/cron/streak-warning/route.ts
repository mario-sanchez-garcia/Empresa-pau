import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { sendStreakEmail } from '@/app/lib/email/sendStreakEmail'
import { generateUnsubscribeToken } from '@/app/lib/unsubscribeToken'

export const dynamic = 'force-dynamic'

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@')
  return `${name.slice(0, 2)}***@${domain.replace(/^(.).*(\..+)$/, '$1***$2') || '***'}`
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[streak-warning] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = getMadridToday()
  const dow = new Date(today + 'T12:00:00Z').getUTCDay()
  if (dow === 6) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: 'saturday' })
  }

  const db = createServiceClient()

  // Step 4a: users with a pending mission today or overdue
  const { data: pendingRows, error: pendingErr } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .limit(500)

  if (pendingErr) {
    console.error('[streak-warning] pending query failed:', pendingErr.message)
    return NextResponse.json({ error: pendingErr.message }, { status: 500 })
  }

  const pendingIds = [...new Set((pendingRows ?? []).map(r => r.user_id as string))]
  if (pendingIds.length === 0) return NextResponse.json({ sent: 0, skipped: 0, reason: 'no_pending' })

  // Step 4b: exclude users who already completed a mission today
  const { data: completedToday } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'completed')
    .eq('scheduled_date', today)
    .in('user_id', pendingIds)

  const completedTodaySet = new Set((completedToday ?? []).map(r => r.user_id as string))
  const candidates = pendingIds.filter(id => !completedTodaySet.has(id))

  if (candidates.length === 0) return NextResponse.json({ sent: 0, skipped: 0, reason: 'all_completed_today' })

  // Step 5: per candidate, calculate streak — only proceed if >= 3
  const qualifiedByStreak: Array<{ userId: string; streakDays: number }> = []
  for (const userId of candidates) {
    const streak = await calcularRacha(userId, db)
    if (streak >= 1) qualifiedByStreak.push({ userId, streakDays: streak })
  }

  if (qualifiedByStreak.length === 0) return NextResponse.json({ sent: 0, skipped: 0, reason: 'no_streak_gte_1' })

  const qualifiedIds = qualifiedByStreak.map(u => u.userId)

  // Step 6: filter opt-outs
  const { data: profileRows } = await db
    .from('perfiles')
    .select('id, email_notifications')
    .in('id', qualifiedIds)
  const optedOutSet = new Set(
    (profileRows ?? [])
      .filter((p: { id: string; email_notifications: boolean | null }) => p.email_notifications === false)
      .map((p: { id: string }) => p.id),
  )
  const afterOptOut = qualifiedByStreak.filter(u => !optedOutSet.has(u.userId))
  if (afterOptOut.length === 0) return NextResponse.json({ sent: 0, skipped: qualifiedIds.length, reason: 'all_opted_out' })

  // Step 8: fetch emails from auth.users
  const { data: usersData, error: usersErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) {
    console.error('[streak-warning] listUsers failed:', usersErr.message)
    return NextResponse.json({ error: usersErr.message }, { status: 500 })
  }
  const afterOptOutIds = new Set(afterOptOut.map(u => u.userId))
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const userMap = new Map(
    (usersData?.users ?? [])
      .filter(u => afterOptOutIds.has(u.id) && u.email && u.created_at <= cutoff)
      .map(u => [u.id, u]),
  )

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const { userId, streakDays } of afterOptOut) {
    const authUser = userMap.get(userId)
    if (!authUser?.email) { skipped++; continue }

    // Step 7: dedup check via email_events lock
    const isNew = await logEmailEvent({
      userId,
      emailType: 'streak_warning',
      dedupeKey: today,
      status: 'skipped',
    })
    if (!isNew) { skipped++; continue }

    try {
      await sendStreakEmail({
        userId,
        userEmail: authUser.email,
        userName: (authUser.user_metadata?.full_name as string | undefined) ?? authUser.email.split('@')[0],
        streakDays,
        unsubscribeToken: generateUnsubscribeToken(userId),
      })
      console.log('[streak-warning] sent', { to: maskEmail(authUser.email), streakDays })
      sent++
    } catch (err) {
      console.error('[streak-warning] failed', { to: maskEmail(authUser.email), error: err instanceof Error ? err.message : String(err) })
      failed++
    }
  }

  console.log('[streak-warning] done', { sent, failed, skipped })
  return NextResponse.json({ sent, failed, skipped })
}
