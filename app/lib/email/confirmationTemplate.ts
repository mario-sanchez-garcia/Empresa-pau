export function confirmationEmailHtml(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirma tu cuenta en Kairo</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0f0f0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#161616;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 36px 24px;border-bottom:1px solid rgba(255,255,255,.06);">
              <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:.06em;color:#fff;text-transform:uppercase;">KAIRO</p>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;">Preparación PAU</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;line-height:1.3;">
                Confirma tu cuenta
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,.5);line-height:1.7;">
                Haz clic en el botón para activar tu cuenta y empezar a preparar la PAU.
                El enlace caduca en&nbsp;<strong style="color:rgba(255,255,255,.75);">24&nbsp;horas</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:12px;background:#f97316;">
                    <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:.02em;">
                      Confirmar cuenta →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,.25);line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${confirmUrl}" style="color:rgba(249,115,22,.7);word-break:break-all;">${confirmUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;border-top:1px solid rgba(255,255,255,.06);">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,.2);line-height:1.6;">
                Si no has creado ninguna cuenta en Kairo, ignora este correo.
                Nadie ha accedido a tu email ni a ninguna contraseña.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
