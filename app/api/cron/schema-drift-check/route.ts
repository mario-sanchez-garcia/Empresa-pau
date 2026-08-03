import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { runSchemaDriftCheck, type Hallazgo } from '@/app/lib/schema/checkDrift'
import { sendEmail } from '@/app/lib/sendEmail'

export const dynamic = 'force-dynamic'

// Corre a diario para que la desincronización de esquema (migraciones sin
// aplicar) se detecte sola en vez de depender de que alguien abra
// /admin/schema-drift a mano — ver checkDrift.ts para el porqué de este
// detector. Solo avisa por email cuando hay algo crítico; una ejecución
// limpia no manda nada.
function getInternalAlertEmails(): string[] {
  return (process.env.INTERNAL_USER_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
}

function renderAlertHtml(resumen: string, criticos: Hallazgo[]): string {
  const rows = criticos.map(h => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:#0f172a">${h.que}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#475569">${h.detalle}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#94a3b8;font-size:12px">${h.porque}</td>
    </tr>`).join('')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#dc2626">Schema drift detectado en producción</h2>
      <p>${resumen}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #0f172a">Qué</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #0f172a">Detalle</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #0f172a">Por qué importa</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:20px;font-size:13px;color:#64748b">Revisa /admin/schema-drift y aplica las migraciones pendientes.</p>
    </div>`
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[schema-drift-check] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const result = await runSchemaDriftCheck(db)

  if ('error' in result) {
    console.error('[schema-drift-check] no_snapshot', result.detalle)
    const recipients = getInternalAlertEmails()
    for (const to of recipients) {
      try {
        await sendEmail({
          to,
          subject: '[Kairo] El detector de schema drift está roto',
          html: `<p>El chequeo diario no pudo ejecutarse: <strong>${result.message}</strong></p><p>${result.detalle}</p>`,
        })
      } catch (err) {
        console.error('[schema-drift-check] alert email failed', err instanceof Error ? err.message : err)
      }
    }
    return NextResponse.json(result, { status: 503 })
  }

  console.log('[schema-drift-check]', result.resumen, { criticos: result.criticos.length, avisos: result.avisos.length })

  if (result.criticos.length > 0) {
    const recipients = getInternalAlertEmails()
    const html = renderAlertHtml(result.resumen, result.criticos)
    for (const to of recipients) {
      try {
        await sendEmail({ to, subject: `[Kairo] ${result.criticos.length} problema(s) crítico(s) de esquema en producción`, html })
      } catch (err) {
        console.error('[schema-drift-check] alert email failed', err instanceof Error ? err.message : err)
      }
    }
  }

  return NextResponse.json(result)
}
