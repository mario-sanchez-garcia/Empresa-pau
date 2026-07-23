import { sendEmail } from '@/app/lib/sendEmail'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'

const SITE_URL = 'https://kairo-pau.com'

// email_events.user_id is NOT NULL (uuid). Waitlist users have no auth UUID,
// so we generate a throwaway UUID per call. True dedup for waitlist_confirm
// is guaranteed by the UNIQUE constraint on waitlist.email — we only reach
// this function after a successful INSERT. For waitlist_referral, dedup is
// guaranteed in the API route via the price_locked comparison (price drops
// only once per tier: 59→49 and 49→39). logEmailEvent here serves as audit
// log, not a dedup lock.

export async function sendWaitlistConfirmation({
  email,
  referralCode,
  priceLocked,
}: {
  email: string
  referralCode: string
  priceLocked: number
}): Promise<void> {
  const shareUrl = `${SITE_URL}/waitlist?ref=${referralCode}`

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Early Bird</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">Tu plaza está reservada 🎟️</h1>
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Precio congelado: <strong style="color:#0f172a">${priceLocked} €</strong> hasta el 15 de octubre.
            Te avisaremos cuando abra el curso en septiembre.
          </p>
          <p style="margin:0 0 28px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Comparte tu link y baja el precio: 1 amigo = 49 €, 3 amigos = 39 €.
          </p>
          <a href="${shareUrl}"
             style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:14px">
            Compartir mi link →
          </a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8">
            Recibes este email porque reservaste plaza en kairo-pau.com.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const ephemeralId = crypto.randomUUID()
  let resendMessageId: string | undefined
  let status: 'sent' | 'failed' = 'failed'

  try {
    const result = await sendEmail({
      to: email,
      subject: `Plaza reservada — Curso PAU a ${priceLocked} €`,
      html,
    })
    resendMessageId = result.id
    status = 'sent'
  } catch (err) {
    console.error('[sendWaitlistConfirmation] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }

  await logEmailEvent({
    userId: ephemeralId,
    emailType: 'waitlist_confirm',
    dedupeKey: 'once',
    status,
    resendMessageId,
    metadata: { email },
  })
}

export async function sendReferralReward({
  email,
  newPrice,
  referralCount,
}: {
  email: string
  newPrice: number
  referralCount: number
}): Promise<void> {
  const extra =
    newPrice === 49
      ? '<p style="margin:0 0 0;font-size:14px;color:#64748b;line-height:1.6">Un amigo más... y con 3 llegas a 39 €.</p>'
      : newPrice === 39
      ? '<p style="margin:0 0 0;font-size:14px;color:#64748b;line-height:1.6">Has llegado al precio mínimo. Bien jugado.</p>'
      : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb">Early Bird</p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">Tu precio acaba de bajar.</h1>
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#475569;line-height:1.6">
            Ya llevas <strong style="color:#0f172a">${referralCount} amigo${referralCount === 1 ? '' : 's'}</strong>.
            Tu Curso PAU está congelado en <strong style="color:#0f172a">${newPrice} €</strong>.
          </p>
          ${extra}
          <div style="margin:28px 0">
            <a href="${SITE_URL}/waitlist"
               style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:14px">
              Ver mi reserva →
            </a>
          </div>
          <p style="margin:0;font-size:12px;color:#94a3b8">
            Recibes este email porque reservaste plaza en kairo-pau.com.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await sendEmail({
      to: email,
      subject: `🎉 Alguien usó tu link — tu Curso PAU ahora cuesta ${newPrice} €`,
      html,
    })
  } catch (err) {
    console.error('[sendReferralReward] sendEmail failed:', err instanceof Error ? err.message : String(err))
  }
}
