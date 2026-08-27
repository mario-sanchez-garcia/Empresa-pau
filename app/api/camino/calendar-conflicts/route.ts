import { NextRequest, NextResponse } from 'next/server'

import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAvailability, busySlotsForMadridDate, hasTimeConflict } from '@/app/lib/calendar/availability'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

type MissionRow = {
  id: string
  scheduled_date: string
  title: string | null
  start_time: string | null
  end_time: string | null
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function cleanDate(value: string | null) {
  return value && isIsoDate(value) ? value : null
}

function normalizeTime(value: string | null) {
  return value ? value.slice(0, 5) : null
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function datesInRange(start: string, end: string) {
  const dates: string[] = []
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(cursor)
  }
  return dates
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response

    const start = cleanDate(request.nextUrl.searchParams.get('start'))
    const end = cleanDate(request.nextUrl.searchParams.get('end')) ?? start
    if (!start || !end || end < start) {
      return NextResponse.json({ error: 'date_range_invalid' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data, error } = await db
      .from('camino_calendar')
      .select('id, scheduled_date, title, start_time, end_time')
      .eq('user_id', auth.user.id)
      .eq('status', 'pending')
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)

    if (error) throw error

    const forceRefresh = request.nextUrl.searchParams.get('refresh') === '1'
    const busySlots = await getAvailability(auth.user.id, start, end, { forceRefresh })
    const busyByDate = Object.fromEntries(
      datesInRange(start, end).map(date => [date, busySlotsForMadridDate(busySlots, date)])
    )
    const conflicts = ((data ?? []) as MissionRow[]).flatMap(mission => {
      const startTime = normalizeTime(mission.start_time)
      const endTime = normalizeTime(mission.end_time)
      if (!startTime || !endTime) return []
      const externalBusy = busyByDate[mission.scheduled_date] ?? []
      const conflict = externalBusy.find(slot => hasTimeConflict({ start: startTime, end: endTime }, slot))
      if (!conflict) return []
      return [{
        missionId: mission.id,
        date: mission.scheduled_date,
        title: mission.title,
        start: startTime,
        end: endTime,
        busyStart: conflict.start,
        busyEnd: conflict.end,
      }]
    })

    return NextResponse.json({ conflicts, busyByDate })
  } catch (error) {
    console.warn('[camino/calendar-conflicts]', error)
    return NextResponse.json({ conflicts: [], busyByDate: {}, unavailable: true })
  }
}
