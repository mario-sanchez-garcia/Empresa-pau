import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'

export const dynamic = 'force-dynamic'

const SOURCES = new Set(['server', 'client', 'cache', 'server_empty', 'server_error'])
const CONTEXTS = new Set(['initial_load', 'week_navigation', 'exam_change', 'postpone'])

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const source = typeof body.source === 'string' && SOURCES.has(body.source) ? body.source : null
    const context = typeof body.context === 'string' && CONTEXTS.has(body.context) ? body.context : null
    if (!source || !context) {
      return NextResponse.json({ error: 'source y context son obligatorios' }, { status: 400 })
    }

    const missionCount = typeof body.missionCount === 'number' ? body.missionCount : null
    const weekStart = typeof body.weekStart === 'string' ? body.weekStart : null
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 80) : null

    await recordBetaMetric(createServiceClient(), user.id, 'camino_calendar_source_selected', {
      source,
      context,
      mission_count: missionCount,
      week_start: weekStart,
      reason,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[camino/calendar-source]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
