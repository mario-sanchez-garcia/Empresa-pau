import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'

const APP_URL = 'https://empresa-pau.vercel.app'

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

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Camino PAU</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">Llevas ${streakDays} días seguidos, ${firstName}.</h1>
          <p style="margin:0 0 28px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Hoy tienes una misión pendiente. Son 15 minutos para mantener la racha viva.
          </p>
          <a href="${APP_URL}/camino"
             style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:14px">
            Completar la misión de hoy →
          </a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8">
            ¿No quieres recibir estos emails?
            <a href="${APP_URL}/api/email/unsubscribe?token=${unsubscribeToken}" style="color:#94a3b8">Darse de baja</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

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

  await logEmailEvent({
    userId,
    emailType: 'streak_warning',
    dedupeKey: today,
    status,
    resendMessageId,
  })
}
