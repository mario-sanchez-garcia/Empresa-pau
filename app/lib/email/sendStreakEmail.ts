import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { buildEmailHtml, unsubUrl } from '@/app/lib/email/emailTemplate'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

interface SendStreakEmailParams {
  userId: string
  userEmail: string
  userName: string
  streakDays: number
  unsubscribeToken: string
}

export async function sendStreakEmail(params: SendStreakEmailParams): Promise<void> {
  const { userId, userEmail, userName, streakDays, unsubscribeToken } = params
  const firstName = userName.split(' ')[0] ?? userName
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

  const html = buildEmailHtml({
    number: '0' + streakDays,
    label: 'Camino PAU · Racha activa',
    headline: `LLEVAS<br>${streakDays} DÍAS<br>SEGUIDOS`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        <strong style="color:#0f172a;">${firstName}</strong>, llevas ${streakDays} días estudiando consecutivos. No lo pierdas hoy.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#4b5563;">
        Son solo <strong style="color:#0f172a;">15 minutos</strong> para mantener la racha viva.
      </p>
    `,
    ctaText: 'Completar la misión de hoy →',
    ctaUrl: `${APP_URL}/camino`,
    stats: [
      { label: 'Racha actual', value: `${streakDays} días` },
      { label: 'Tiempo', value: '15 min' },
      { label: 'XP', value: '+50', accent: true },
    ],
    unsubscribeUrl: unsubUrl(unsubscribeToken),
  })

  const subject = `Llevas ${streakDays} días seguidos — no lo pierdas hoy`

  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({ to: userEmail, subject, html })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendStreakEmail] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({ userId, emailType: 'streak_warning', dedupeKey: today, status, resendMessageId })
}
