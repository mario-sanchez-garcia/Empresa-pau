import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { sendEmail } from '@/app/lib/sendEmail'

export const dynamic = 'force-dynamic'

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dow = new Date().getUTCDay()
  if (dow === 0 || dow === 6) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: 'weekend' })
  }

  const db = createServiceClient()
  const today = getMadridToday()

  // Users registered >= 1 day ago with at least 1 pending mission (today or overdue)
  const { data: candidates, error: candidatesError } = await db
    .from('camino_calendar')
    .select('user_id')
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .limit(500)

  if (candidatesError) {
    console.error('[daily-reminder] candidates query failed:', candidatesError.message)
    return NextResponse.json({ error: candidatesError.message }, { status: 500 })
  }

  // Distinct user_ids with pending missions
  const candidateIds = [...new Set((candidates ?? []).map(r => r.user_id as string))]
  if (candidateIds.length === 0) {
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
  if (toNotify.length === 0) {
    return NextResponse.json({ sent: 0, skipped: candidateIds.length })
  }

  // Fetch emails from auth.users using service client
  const { data: usersData, error: usersError } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (usersError) {
    console.error('[daily-reminder] listUsers failed:', usersError.message)
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const notifySet = new Set(toNotify)
  const cutoff = new Date(Date.now() - 86400000).toISOString() // >= 1 day ago

  const targets = (usersData?.users ?? []).filter(u =>
    notifySet.has(u.id) &&
    u.email &&
    u.created_at <= cutoff
  )

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
  if (finalTargets.length === 0) {
    return NextResponse.json({ sent: 0, skipped: candidateIds.length })
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Camino PAU</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">Hoy tienes una misión pendiente</h1>
          <p style="margin:0 0 28px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Hola, hoy tienes una misión pendiente en Camino PAU.<br>
            Dedica 25 minutos y sigue avanzando hacia la selectividad.
          </p>
          <a href="https://empresa-pau.vercel.app/camino"
             style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:14px">
            Ver mi misión →
          </a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8">
            Recibes este email porque tienes Camino PAU activo.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  let sent = 0
  let failed = 0

  for (const user of finalTargets) {
    try {
      await sendEmail({
        to: user.email!,
        subject: 'Tu misión de hoy en Pausia te espera 📚',
        html,
        userId: user.id,
      })
      sent++
    } catch (err) {
      console.error('[daily-reminder] failed to send to', user.email, err)
      failed++
    }
  }

  const skipped = candidateIds.length - toNotify.length + optedOutSet.size
  console.log(`[daily-reminder] sent=${sent} failed=${failed} skipped=${skipped}`)
  return NextResponse.json({ sent, failed, skipped })
}
