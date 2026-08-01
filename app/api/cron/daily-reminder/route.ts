import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { buildEmailHtml } from '@/app/lib/email/emailTemplate'
import { listAllUsers } from '@/app/lib/email/listAllUsers'
import { runInBatches } from '@/app/lib/email/runInBatches'

export const dynamic = 'force-dynamic'
// 60s is safe on Vercel Hobby without Fluid Compute. Raise to 300 once the
// project is confirmed on Pro with Fluid Compute enabled — batched sending
// below is resumable (email_events lock) so a mid-run cutoff at 60s just
// means the rest goes out on the next scheduled run, not silently dropped.
export const maxDuration = 60

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@')
  const visibleName = name.slice(0, 2)
  const visibleDomain = domain ? domain.replace(/^(.).*(\..+)$/, '$1***$2') : ''
  return `${visibleName}***@${visibleDomain || '***'}`
}

export async function GET(request: NextRequest) {
  const startedAt = new Date().toISOString()
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  console.log('[daily-reminder] cron started', {
    startedAt,
    method: request.method,
    userAgent,
    hasCronSecret: Boolean(process.env.CRON_SECRET),
  })

  if (!process.env.CRON_SECRET) {
    console.error('[daily-reminder] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[daily-reminder] unauthorized request', {
      hasAuthorization: Boolean(auth),
      userAgent,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dow = new Date().getUTCDay()
  if (dow === 6) {
    console.log('[daily-reminder] cron finished', { sent: 0, skipped: 0, reason: 'saturday' })
    return NextResponse.json({ sent: 0, skipped: 0, reason: 'saturday' })
  }
  const isSunday = dow === 0

  const db = createServiceClient()
  const today = getMadridToday()

  // Users registered >= 2 hours ago with at least 1 pending mission (today or overdue).
  // 10_000 matches the cap used elsewhere for this kind of full-table candidate
  // scan (reengagement's completed-missions query); comfortably above any
  // realistic beta/early-growth user count while still bounding worst case.
  const { data: candidates, error: candidatesError } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .limit(10_000)

  if (candidatesError) {
    console.error('[daily-reminder] candidates query failed:', candidatesError.message)
    return NextResponse.json({ error: candidatesError.message }, { status: 500 })
  }

  // Distinct user_ids with pending missions
  const candidateIds = [...new Set((candidates ?? []).map(r => r.user_id as string))]
  console.log('[daily-reminder] eligible users candidate count', {
    pendingMissionRows: candidates?.length ?? 0,
    candidateUsers: candidateIds.length,
    today,
  })
  if (candidateIds.length === 0) {
    console.log('[daily-reminder] cron finished', { sent: 0, skipped: 0, reason: 'no_candidates' })
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // Users who already completed a mission today
  const { data: completedToday } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'completed')
    .eq('scheduled_date', today)
    .in('user_id', candidateIds)

  const completedTodaySet = new Set((completedToday ?? []).map(r => r.user_id as string))

  // Filter out users who already studied today
  const toNotify = candidateIds.filter(id => !completedTodaySet.has(id))
  console.log('[daily-reminder] users after completed-today filter', {
    completedToday: completedTodaySet.size,
    toNotify: toNotify.length,
  })
  if (toNotify.length === 0) {
    console.log('[daily-reminder] cron finished', { sent: 0, skipped: candidateIds.length, reason: 'all_completed_today' })
    return NextResponse.json({ sent: 0, skipped: candidateIds.length })
  }

  // Fetch emails from auth.users using service client — paginated, so this
  // sees every user, not just the first 1000.
  let allUsers
  try {
    allUsers = await listAllUsers(db)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[daily-reminder] listAllUsers failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const notifySet = new Set(toNotify)
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // >= 2 hours ago

  const targets = [...allUsers.values()].filter(u =>
    notifySet.has(u.id) &&
    u.createdAt <= cutoff
  )
  console.log('[daily-reminder] users after account age/email filter', {
    listedUsers: allUsers.size,
    targets: targets.length,
  })

  // Filter users who opted out of email notifications
  const { data: profileRows } = await db
    .from('perfiles')
    .select('id, email_notifications')
    .in('id', targets.map(u => u.id))
  const optedOutSet = new Set(
    (profileRows ?? [])
      .filter((p: { id: string; email_notifications: boolean | null }) => p.email_notifications === false)
      .map((p: { id: string }) => p.id),
  )
  const finalTargets = targets.filter(u => !optedOutSet.has(u.id))
  console.log('[daily-reminder] users after opt-out filter', {
    optedOut: optedOutSet.size,
    finalTargets: finalTargets.length,
  })
  if (finalTargets.length === 0) {
    console.log('[daily-reminder] cron finished', { sent: 0, skipped: candidateIds.length, reason: 'no_final_targets' })
    return NextResponse.json({ sent: 0, skipped: candidateIds.length })
  }

  const emailSubject = isSunday
    ? 'Tu simulacro semanal te espera — 20 minutos que mueven tu nota'
    : 'Tu misión de hoy en Kairo te espera'

  const html = isSunday
    ? buildEmailHtml({
        number: '01',
        label: 'Camino PAU · Simulacro del domingo',
        headline: 'EL MOMENTO<br>QUE MÁS MUEVE<br>TU NOTA',
        bodyHtml: `
          <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
            Son solo <strong style="color:#0f172a;">3 ejercicios</strong> del bloque donde más puedes crecer — unos 20 minutos.
          </p>
          <p style="margin:0;font-size:15px;line-height:1.75;color:#4b5563;">
            El domingo es tu mejor oportunidad de la semana para mover la Nota Proyectada.
          </p>
        `,
        ctaText: 'Empezar simulacro →',
        ctaUrl: 'https://empresa-pau.vercel.app/camino',
        stats: [
          { label: 'Ejercicios', value: '3' },
          { label: 'Tiempo', value: '20 min' },
          { label: 'XP', value: '+150', accent: true },
        ],
        unsubscribeUrl: '',
      })
    : buildEmailHtml({
        number: '01',
        label: 'Camino PAU · Misión del día',
        headline: 'HOY TIENES<br>UNA MISIÓN<br>PENDIENTE',
        bodyHtml: `
          <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
            Dedica <strong style="color:#0f172a;">25 minutos</strong> a tu misión de hoy en Camino PAU y sigue avanzando hacia la selectividad.
          </p>
          <p style="margin:0;font-size:15px;line-height:1.75;color:#4b5563;">
            Tu progreso está guardado. Empieza cuando quieras.
          </p>
        `,
        ctaText: 'Ver mi misión →',
        ctaUrl: 'https://empresa-pau.vercel.app/camino',
        stats: [
          { label: 'Tiempo', value: '25 min' },
          { label: 'Tipo', value: 'Misión' },
          { label: 'XP', value: '+50', accent: true },
        ],
        unsubscribeUrl: '',
      })

  let sent = 0
  let failed = 0
  let skippedDedup = 0

  // Batches of 20 in parallel. The per-user lock (atomic insert into
  // email_events before sending) is what makes this resumable: if the
  // function gets cut off mid-run, whoever already got their lock row
  // written is skipped on the next invocation, and only the rest go out.
  await runInBatches(finalTargets, 20, async user => {
    const isNew = await logEmailEvent({
      userId: user.id,
      emailType: 'daily_reminder',
      dedupeKey: today,
      status: 'skipped',
    })
    if (!isNew) {
      skippedDedup++
      return
    }

    try {
      const result = await sendEmail({
        to: user.email,
        subject: emailSubject,
        html,
        userId: user.id,
      })
      console.log('[daily-reminder] resend accepted email', {
        to: maskEmail(user.email),
        resendMessageId: result.id,
      })
      await logEmailEvent({
        userId: user.id,
        emailType: 'daily_reminder',
        dedupeKey: today,
        status: 'sent',
        resendMessageId: result.id,
      })
      sent++
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('[daily-reminder] failed to send email', {
        to: maskEmail(user.email),
        error: errorMessage,
      })
      await logEmailEvent({
        userId: user.id,
        emailType: 'daily_reminder',
        dedupeKey: today,
        status: 'failed',
        metadata: { error: errorMessage },
      })
      failed++
    }
  })

  const skipped = candidateIds.length - toNotify.length + optedOutSet.size + skippedDedup
  console.log('[daily-reminder] cron finished', { sent, failed, skipped, skippedDedup })
  return NextResponse.json({ sent, failed, skipped, skippedDedup })
}
