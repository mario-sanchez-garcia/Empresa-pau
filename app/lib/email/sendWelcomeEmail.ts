import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'

const APP_URL = 'https://empresa-pau.vercel.app'

interface SendWelcomeEmailParams {
  userId: string
  userEmail: string
  userName: string
  missionCount: number
  firstSubject: string
  unsubscribeToken: string
}

export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
  const { userId, userEmail, userName, missionCount, firstSubject, unsubscribeToken } = params

  const firstName = userName.split(' ')[0] ?? userName

  // Unsubscribe footer is embedded directly so we don't pass userId to sendEmail
  // (which would append a second footer).
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Camino PAU</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">Tu Camino ya está listo, ${firstName}.</h1>
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            ${missionCount} misiones generadas. Empezamos por ${firstSubject}.
          </p>
          <p style="margin:0 0 28px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Dedica 15 minutos hoy y desbloquea tu Nota Proyectada.
          </p>
          <a href="${APP_URL}/camino"
             style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:14px">
            Empezar mi primera misión →
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

  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({ to: userEmail, subject: 'Tu Camino ya está listo', html })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendWelcomeEmail] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({
    userId,
    emailType: 'welcome',
    dedupeKey: 'once',
    status,
    resendMessageId,
  })
}
