import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { buildEmailHtml, unsubUrl } from '@/app/lib/email/emailTemplate'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

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

  const html = buildEmailHtml({
    number: '01',
    label: 'Kairo · Bienvenida',
    headline: `TU CAMINO<br>YA ESTÁ<br>LISTO`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        Hola <strong style="color:#0f172a;">${firstName}</strong>, tu plan de estudio está generado y listo para empezar.
      </p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#4b5563;">
        <strong style="color:#0f172a;">${missionCount} misiones generadas.</strong> Empezamos por <strong style="color:#0f172a;">${firstSubject}</strong>.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#4b5563;">
        Dedica 15 minutos hoy y desbloquea tu Nota Proyectada.
      </p>
    `,
    ctaText: 'Empezar mi primera misión →',
    ctaUrl: `${APP_URL}/camino`,
    stats: [
      { label: 'Misiones', value: String(missionCount) },
      { label: 'Primera asignatura', value: firstSubject },
      { label: 'Tiempo estimado', value: '15 min' },
    ],
    unsubscribeUrl: unsubUrl(unsubscribeToken),
  })

  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({ to: userEmail, subject: `Tu Camino ya está listo, ${firstName}`, html })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendWelcomeEmail] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({ userId, emailType: 'welcome', dedupeKey: 'once', status, resendMessageId })
}
