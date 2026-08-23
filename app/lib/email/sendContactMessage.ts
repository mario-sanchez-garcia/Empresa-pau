import { sendEmail } from '@/app/lib/sendEmail'
import { SUPPORT_EMAIL } from '@/app/lib/support'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendContactMessage({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Nuevo mensaje de contacto</p>
          <h1 style="margin:0 0 20px;font-size:20px;font-weight:900;color:#0f172a;line-height:1.3">${escapeHtml(subject)}</h1>
          <p style="margin:0 0 4px;font-size:13px;color:#94a3b8">De</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p style="margin:0 0 4px;font-size:13px;color:#94a3b8">Mensaje</p>
          <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap">${escapeHtml(message)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await sendEmail({
    to: SUPPORT_EMAIL,
    subject: `[Contacto] ${subject} — ${name}`,
    html,
    replyTo: email,
  })
}
