import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { buildEmailHtml, unsubUrl } from '@/app/lib/email/emailTemplate'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

interface SendWeeklySummaryEmailParams {
  userId: string
  userEmail: string
  userName: string
  completedThisWeek: number
  streakDays: number
  unsubscribeToken: string
  mondayDedupeKey: string
}

export async function sendWeeklySummaryEmail(params: SendWeeklySummaryEmailParams): Promise<void> {
  const { userId, userEmail, userName, completedThisWeek, streakDays, unsubscribeToken, mondayDedupeKey } = params
  const firstName = userName.split(' ')[0] ?? userName

  const streakLine = streakDays >= 3
    ? `Llevas <strong style="color:#0f172a;">${streakDays} días seguidos</strong>. Sigue así el lunes.`
    : 'El lunes es un buen momento para retomar el ritmo.'

  const html = buildEmailHtml({
    number: '01',
    label: 'Camino PAU · Resumen semanal',
    headline: `${completedThisWeek}<br>MISIONES<br>ESTA SEMANA`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        <strong style="color:#0f172a;">${firstName}</strong>, esta semana has completado <strong style="color:#0f172a;">${completedThisWeek} misiones</strong> en Kairo.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#4b5563;">${streakLine}</p>
    `,
    ctaText: 'Ver mi Camino →',
    ctaUrl: `${APP_URL}/camino`,
    stats: [
      { label: 'Esta semana', value: `${completedThisWeek} misiones` },
      { label: 'Racha', value: streakDays >= 1 ? `${streakDays} días` : '—' },
      { label: 'XP', value: `+${completedThisWeek * 50}`, accent: true },
    ],
    unsubscribeUrl: unsubUrl(unsubscribeToken),
  })

  const subject = `Tu semana en Kairo — ${completedThisWeek} misiones completadas`

  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({ to: userEmail, subject, html })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendWeeklySummaryEmail] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({ userId, emailType: 'weekly_summary', dedupeKey: mondayDedupeKey, status, resendMessageId })
}
