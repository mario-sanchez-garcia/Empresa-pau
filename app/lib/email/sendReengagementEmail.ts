import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { buildEmailHtml, unsubUrl } from '@/app/lib/email/emailTemplate'

const APP_URL = 'https://empresa-pau.vercel.app'

interface SendReengagementEmailParams {
  userId: string
  userEmail: string
  userName: string
  completedCount: number
  unsubscribeToken: string
}

export async function sendReengagementEmail(params: SendReengagementEmailParams): Promise<void> {
  const { userId, userEmail, userName, completedCount, unsubscribeToken } = params
  const firstName = userName.split(' ')[0] ?? userName
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })

  const html = buildEmailHtml({
    number: '01',
    label: 'Camino PAU · Te echamos de menos',
    headline: `TU CAMINO<br>TE ESPERA`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        <strong style="color:#0f172a;">${firstName}</strong>, no pasa nada por parar unos días.
      </p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        Tu progreso sigue guardado: <strong style="color:#0f172a;">${completedCount} misiones completadas</strong>. Cuando quieras retomar, empezamos donde lo dejaste.
      </p>
    `,
    ctaText: 'Volver a mi Camino →',
    ctaUrl: `${APP_URL}/camino`,
    stats: [
      { label: 'Misiones completadas', value: String(completedCount) },
      { label: 'Estado', value: 'Guardado' },
    ],
    unsubscribeUrl: unsubUrl(unsubscribeToken),
  })

  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({ to: userEmail, subject: 'Tu Camino te espera donde lo dejaste', html })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendReengagementEmail] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({ userId, emailType: 'reengagement_d3', dedupeKey: today, status, resendMessageId })
}
