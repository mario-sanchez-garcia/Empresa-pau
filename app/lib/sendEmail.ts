import { Resend } from 'resend'

const APP_URL = 'https://empresa-pau.vercel.app'

function getClient() {
  return new Resend(process.env.RESEND_API_KEY)
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
    ? `<p style="font-size:12px;color:#999;margin-top:24px;text-align:center">¿No quieres recibir estos recordatorios? <a href="${APP_URL}/api/email/unsubscribe?token=${Buffer.from(userId).toString('base64')}" style="color:#999">Darse de baja</a></p>`
    : ''

  const finalHtml = unsubscribeFooter
    ? html.includes('</body>')
      ? html.replace('</body>', `${unsubscribeFooter}</body>`)
      : html + unsubscribeFooter
    : html

  return getClient().emails.send({
    from: 'Pausia <onboarding@resend.dev>',
    to,
    subject,
    html: finalHtml,
  })
}
