import { NextRequest, NextResponse } from 'next/server'

import { renewExpiringGoogleWatches } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

async function handleWatchRenew(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[calendar/watch-renew] CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[calendar/watch-renew] unauthorized request', {
      hasAuthorization: Boolean(request.headers.get('Authorization')),
      userAgent: request.headers.get('user-agent') ?? 'unknown',
    })
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    return NextResponse.json({ ok: true, ...(await renewExpiringGoogleWatches()) })
  } catch (error) {
    console.error('[calendar/watch-renew]', error)
    return NextResponse.json({ error: 'No se pudieron renovar los watches.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return handleWatchRenew(request)
}

export async function POST(request: NextRequest) {
  return handleWatchRenew(request)
}
