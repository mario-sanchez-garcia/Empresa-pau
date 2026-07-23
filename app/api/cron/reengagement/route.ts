import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { sendReengagementEmail } from '@/app/lib/email/sendReengagementEmail'
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
    console.error('[reengagement] CRON_SECRET is not configured')
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

  // Step 3: the target date is exactly 3 days ago
  const threeDaysAgo = addDays(today, -3)
  const yesterday = addDays(today, -1)

  const db = createServiceClient()

  // Step 4: users whose latest completed mission was exactly 3 days ago.
  // Fetch all completed rows, group by user_id in JS.
  const { data: completedRows, error: completedErr } = await db
    .from('camino_calendar')
    .select('user_id, scheduled_date')
    .eq('status', 'completed')
    .lte('scheduled_date', threeDaysAgo) // can't be from today or yesterday
    .limit(10000)

  if (completedErr) {
    console.error('[reengagement] completed query failed:', completedErr.message)
    return NextResponse.json({ error: completedErr.message }, { status: 500 })
  }

  // Max scheduled_date per user
  const lastByUser = new Map<string, string>()
  for (const row of completedRows ?? []) {
    const existing = lastByUser.get(row.user_id)
    if (!existing || row.scheduled_date > existing) lastByUser.set(row.user_id, row.scheduled_date)
  }

  // Only users whose last completion was exactly 3 days ago
  const candidateIds = [...lastByUser.entries()]
    .filter(([, lastDate]) => lastDate === threeDaysAgo)
    .map(([uid]) => uid)

  if (candidateIds.length === 0) return NextResponse.json({ sent: 0, skipped: 0, reason: 'no_candidates' })

  // Step 5: double-check no one completed yesterday or today
  const { data: recentCompleted } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'completed')
    .gte('scheduled_date', yesterday)
    .in('user_id', candidateIds)
  const recentSet = new Set((recentCompleted ?? []).map(r => r.user_id as string))
  const filtered = candidateIds.filter(id => !recentSet.has(id))
  if (filtered.length === 0) return NextResponse.json({ sent: 0, skipped: candidateIds.length, reason: 'all_recently_active' })

  // Step 6: filter opt-outs
  const { data: profileRows } = await db
    .from('perfiles')
    .select('id, email_notifications')
    .in('id', filtered)
  const optedOutSet = new Set(
    (profileRows ?? [])
      .filter((p: { id: string; email_notifications: boolean | null }) => p.email_notifications === false)
      .map((p: { id: string }) => p.id),
  )
  const afterOptOut = filtered.filter(id => !optedOutSet.has(id))
  if (afterOptOut.length === 0) return NextResponse.json({ sent: 0, skipped: filtered.length, reason: 'all_opted_out' })

  // Step 7: exclude users who already received a reengagement_d3 in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentEvents } = await db
    .from('email_events')
    .select('user_id')
    .eq('email_type', 'reengagement_d3')
    .gte('sent_at', thirtyDaysAgo)
    .in('user_id', afterOptOut)
  const recentlySentSet = new Set((recentEvents ?? []).map(r => r.user_id as string))
  const toContact = afterOptOut.filter(id => !recentlySentSet.has(id))
  if (toContact.length === 0) return NextResponse.json({ sent: 0, skipped: afterOptOut.length, reason: 'all_recent_reengagement' })

  // Step 8: fetch emails + names from auth.users
  const { data: usersData, error: usersErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) {
    console.error('[reengagement] listUsers failed:', usersErr.message)
    return NextResponse.json({ error: usersErr.message }, { status: 500 })
  }
  const toContactSet = new Set(toContact)
  const userMap = new Map(
    (usersData?.users ?? [])
      .filter(u => toContactSet.has(u.id) && u.email)
      .map(u => [u.id, u]),
  )

  // Step 9: completed mission count per user
  const { data: countRows } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'completed')
    .in('user_id', toContact)
  const countByUser = new Map<string, number>()
  for (const row of countRows ?? []) {
    countByUser.set(row.user_id, (countByUser.get(row.user_id) ?? 0) + 1)
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const userId of toContact) {
    const authUser = userMap.get(userId)
    if (!authUser?.email) { skipped++; continue }

    try {
      await sendReengagementEmail({
        userId,
        userEmail: authUser.email,
        userName: (authUser.user_metadata?.full_name as string | undefined) ?? authUser.email.split('@')[0],
        completedCount: countByUser.get(userId) ?? 0,
        unsubscribeToken: generateUnsubscribeToken(userId),
      })
      console.log('[reengagement] sent', { to: maskEmail(authUser.email) })
      sent++
    } catch (err) {
      console.error('[reengagement] failed', { to: maskEmail(authUser.email), error: err instanceof Error ? err.message : String(err) })
      failed++
    }
  }

  const skippedTotal = (candidateIds.length - filtered.length) + optedOutSet.size + recentlySentSet.size + skipped
  console.log('[reengagement] done', { sent, failed, skipped: skippedTotal })
  return NextResponse.json({ sent, failed, skipped: skippedTotal })
}
