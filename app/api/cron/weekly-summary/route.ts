import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { sendWeeklySummaryEmail } from '@/app/lib/email/sendWeeklySummaryEmail'
import { generateUnsubscribeToken } from '@/app/lib/unsubscribeToken'

export const dynamic = 'force-dynamic'

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@')
  return `${name.slice(0, 2)}***@${domain.replace(/^(.).*(\..+)$/, '$1***$2') || '***'}`
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[weekly-summary] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 2: only run on Fridays (Madrid time)
  const today = getMadridToday()
  const dow = new Date(today + 'T12:00:00Z').getUTCDay()
  if (dow !== 5) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: 'not_friday' })
  }

  // Step 3: Monday of the current week (today is Friday = dow 5, so -4 days)
  const monday = addDays(today, -(dow - 1)) // = today - 4

  const db = createServiceClient()

  // Step 4: users with at least 1 completed mission this week
  const { data: weekRows, error: weekErr } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'completed')
    .gte('scheduled_date', monday)
    .lte('scheduled_date', today)
    .limit(5000)

  if (weekErr) {
    console.error('[weekly-summary] week query failed:', weekErr.message)
    return NextResponse.json({ error: weekErr.message }, { status: 500 })
  }

  const candidateIds = [...new Set((weekRows ?? []).map(r => r.user_id as string))]
  if (candidateIds.length === 0) return NextResponse.json({ sent: 0, skipped: 0, reason: 'no_candidates' })

  // Step 5: filter opt-outs
  const { data: profileRows } = await db
    .from('perfiles')
    .select('id, email_notifications')
    .in('id', candidateIds)
  const optedOutSet = new Set(
    (profileRows ?? [])
      .filter((p: { id: string; email_notifications: boolean | null }) => p.email_notifications === false)
      .map((p: { id: string }) => p.id),
  )
  const afterOptOut = candidateIds.filter(id => !optedOutSet.has(id))
  if (afterOptOut.length === 0) return NextResponse.json({ sent: 0, skipped: candidateIds.length, reason: 'all_opted_out' })

  // Step 7: fetch emails from auth.users
  const { data: usersData, error: usersErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) {
    console.error('[weekly-summary] listUsers failed:', usersErr.message)
    return NextResponse.json({ error: usersErr.message }, { status: 500 })
  }
  const afterOptOutSet = new Set(afterOptOut)
  const userMap = new Map(
    (usersData?.users ?? [])
      .filter(u => afterOptOutSet.has(u.id) && u.email)
      .map(u => [u.id, u]),
  )

  // Step 8: completed count this week per user
  const countByUser = new Map<string, number>()
  for (const row of weekRows ?? []) {
    countByUser.set(row.user_id, (countByUser.get(row.user_id) ?? 0) + 1)
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const userId of afterOptOut) {
    const authUser = userMap.get(userId)
    if (!authUser?.email) { skipped++; continue }

    // Step 6: dedup check — skip if weekly_summary already sent for this Monday
    const isNew = await logEmailEvent({
      userId,
      emailType: 'weekly_summary',
      dedupeKey: monday,
      status: 'skipped',
    })
    if (!isNew) { skipped++; continue }

    // Step 8b: calculate streak (per user — acceptable for private beta scale)
    const streakDays = await calcularRacha(userId, db)

    try {
      await sendWeeklySummaryEmail({
        userId,
        userEmail: authUser.email,
        userName: (authUser.user_metadata?.full_name as string | undefined) ?? authUser.email.split('@')[0],
        completedThisWeek: countByUser.get(userId) ?? 0,
        streakDays,
        unsubscribeToken: generateUnsubscribeToken(userId),
        mondayDedupeKey: monday,
      })
      console.log('[weekly-summary] sent', { to: maskEmail(authUser.email), completedThisWeek: countByUser.get(userId) })
      sent++
    } catch (err) {
      console.error('[weekly-summary] failed', { to: maskEmail(authUser.email), error: err instanceof Error ? err.message : String(err) })
      failed++
    }
  }

  console.log('[weekly-summary] done', { sent, failed, skipped })
  return NextResponse.json({ sent, failed, skipped })
}
