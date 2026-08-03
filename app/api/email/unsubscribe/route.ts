import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { verifyUnsubscribeToken } from '@/app/lib/unsubscribeToken'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

function htmlPage(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Kairo</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:440px;background:#ffffff;border-radius:24px;padding:40px;box-shadow:0 4px 24px rgba(37,99,235,0.08)">
        <tr><td style="text-align:center">
          ${body}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')

  if (!token) {
    return htmlPage('Error', '<p style="color:#dc2626;font-weight:700">Token inválido.</p>')
  }

  const userId = verifyUnsubscribeToken(token)
  if (!userId) {
    return htmlPage('Error', '<p style="color:#dc2626;font-weight:700">Token inválido.</p>')
  }

  try {
    const db = createServiceClient()
    await db
      .from('perfiles')
      .upsert({ id: userId, email_notifications: false }, { onConflict: 'id' })
  } catch (err) {
    console.error('[unsubscribe] failed:', err)
    return htmlPage('Error', '<p style="color:#dc2626;font-weight:700">Error interno. Inténtalo de nuevo.</p>')
  }

  return htmlPage(
    'Baja confirmada',
    `<div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:26px;line-height:1">✓</div>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:900;color:#0f172a">Baja confirmada</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.6">
      Te has dado de baja de los recordatorios de Kairo.<br>Ya no recibirás más emails.
    </p>
    <a href="${APP_URL}/camino"
       style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:12px">
      Volver a Kairo →
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
      Puedes reactivar los recordatorios desde
      <a href="${APP_URL}/settings" style="color:#2563eb">Ajustes</a>.
    </p>`,
  )
}
