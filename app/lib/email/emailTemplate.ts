const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

export interface EmailTemplateOptions {
  number: string
  label: string
  headline: string
  bodyHtml: string
  ctaText: string
  ctaUrl: string
  stats?: Array<{ label: string; value: string; accent?: boolean }>
  unsubscribeUrl: string
}

export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const { number, label, headline, bodyHtml, ctaText, ctaUrl, stats, unsubscribeUrl } = opts

  const statsRow = stats && stats.length > 0 ? `
    <div style="margin-top:28px;padding:16px 20px;background:#f4f6fb;border-left:3px solid #2563eb;border-radius:0 8px 8px 0;">
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          ${stats.map(s => `
            <td style="padding-right:24px;">
              <p style="margin:0;font-family:'DM Mono','Courier New',Courier,monospace;font-size:9px;color:#9ca3af;letter-spacing:.14em;text-transform:uppercase;">${s.label}</p>
              <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:${s.accent ? '#2563eb' : '#0f172a'};">${s.value}</p>
            </td>
          `).join('')}
        </tr>
      </table>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#e8e8ee;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="100%" style="max-width:520px;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.12);" cellpadding="0" cellspacing="0" role="presentation">

      <!-- MASTHEAD -->
      <tr>
        <td style="background:#0b0b10;padding:30px 40px 26px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td valign="middle">
                <span style="font-family:'Bebas Neue',Impact,'Arial Black',Helvetica,sans-serif;font-size:30px;letter-spacing:.08em;color:#ffffff;">KAIRO</span>
              </td>
              <td align="right" valign="middle">
                <span style="font-family:'DM Mono','Courier New',Courier,monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.28);">PAU 2026</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BLUE STRIPE -->
      <tr><td style="background:#2563eb;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- WHITE BODY -->
      <tr>
        <td style="background:#ffffff;padding:44px 40px 48px;">

          <!-- Ghost number accent -->
          <div style="overflow:hidden;line-height:1;margin-bottom:-4px;">
            <span style="font-family:'Bebas Neue',Impact,'Arial Black',Helvetica,sans-serif;font-size:110px;font-weight:400;color:#ddeaff;display:block;line-height:.85;">${number}</span>
          </div>

          <!-- Label -->
          <p style="margin:0 0 12px;font-family:'DM Mono','Courier New',Courier,monospace;font-size:9px;font-weight:500;letter-spacing:.25em;text-transform:uppercase;color:#2563eb;">${label}</p>

          <!-- Headline -->
          <h1 style="margin:0 0 20px;font-family:'Bebas Neue',Impact,'Arial Black',Helvetica,sans-serif;font-size:58px;font-weight:400;line-height:.9;color:#0b0b10;letter-spacing:.01em;">${headline}</h1>

          <!-- Hairline -->
          <div style="height:1px;background:#e5e7eb;margin-bottom:22px;font-size:0;line-height:0;">&nbsp;</div>

          <!-- Body content -->
          ${bodyHtml}

          <!-- CTA -->
          <div style="margin-top:28px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#0b0b10;color:#ffffff;font-family:'DM Mono','Courier New',Courier,monospace;font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;padding:16px 32px;border-radius:10px;">${ctaText}</a>
          </div>

          ${statsRow}

        </td>
      </tr>

      <!-- DARK FOOTER -->
      <tr>
        <td style="background:#0b0b10;padding:16px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <p style="margin:0;font-family:'DM Mono','Courier New',Courier,monospace;font-size:9px;letter-spacing:.1em;color:rgba(255,255,255,.2);">Recibes este email porque tienes Camino PAU activo.</p>
              </td>
              <td align="right">
                <a href="${unsubscribeUrl}" style="font-family:'DM Mono','Courier New',Courier,monospace;font-size:9px;letter-spacing:.1em;color:rgba(255,255,255,.22);text-decoration:none;">Darse de baja</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function unsubUrl(token: string): string {
  return `${APP_URL}/api/email/unsubscribe?token=${token}`
}
