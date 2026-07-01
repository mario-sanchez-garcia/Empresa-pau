import { Resend } from 'resend'

function getClient() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  return getClient().emails.send({
    from: 'Pausia <onboarding@resend.dev>',
    to,
    subject,
    html,
  })
}
