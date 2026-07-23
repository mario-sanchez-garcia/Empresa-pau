import { Resend } from 'resend'
import { generateUnsubscribeToken } from './unsubscribeToken'

const APP_URL = 'https://empresa-pau.vercel.app'

function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  return new Resend(process.env.RESEND_API_KEY)
}

function formatResendError(error: unknown): string {
  if (!error) return 'Unknown Resend error'
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return JSON.stringify(error)
}

export async function sendEmail({
  to,
  subject,
  html,
  userId,
}: {
  to: string
  subject: string
  html: string
  userId?: string
}) {
  const unsubscribeFooter = userId
    ? `<p style="font-size:12px;color:#999;margin-top:24px;text-align:center">¿No quieres recibir estos recordatorios? <a href="${APP_URL}/api/email/unsubscribe?token=${generateUnsubscribeToken(userId)}" style="color:#999">Darse de baja</a></p>`
    : ''

  const finalHtml = unsubscribeFooter
    ? html.includes('</body>')
      ? html.replace('</body>', `${unsubscribeFooter}</body>`)
      : html + unsubscribeFooter
    : html

  const response = await getClient().emails.send({
    from: 'Kairo <noreply@kairo-pau.com>',
    to,
    subject,
    html: finalHtml,
  })

  if (response.error) {
    throw new Error(formatResendError(response.error))
  }

  if (!response.data?.id) {
    throw new Error('Resend did not return a message id')
  }

  return { id: response.data.id }
}
