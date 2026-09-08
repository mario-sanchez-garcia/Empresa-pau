import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { busySlotsForMadridDate, getAvailability } from '@/app/lib/calendar/availability'
import { syncExistingKairoMissionToGoogle } from '@/app/lib/calendar/sync'
import { estimatedMinutesForMissionType, placeBestAcrossDates, type TimeRange } from '@/app/lib/camino/scheduleTimeSlot'
import { recordMissionBehaviorEvent } from '@/app/lib/camino/missionBehavior'
import { isValidIsoCalendarDate } from '@/app/lib/camino/madridDate'

export const dynamic = 'force-dynamic'

type MissionRow = {
  id: string
  scheduled_date: string
  subject: string
  title: string
  mission_type: string
  status: string
  start_time: string | null
  end_time: string | null
  metadata: Record<string, unknown> | null
}

const COLUMNS = 'id, scheduled_date, subject, title, mission_type, status, start_time, end_time, metadata'

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function uniqueIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))].slice(0, 10)
    : []
}

function durationFor(mission: MissionRow) {
  if (!mission.start_time || !mission.end_time) return estimatedMinutesForMissionType(mission.mission_type)
  const minutes = (value: string) => {
    const [hours, mins] = value.slice(0, 5).split(':').map(Number)
    return hours * 60 + mins
  }
  return Math.max(5, minutes(mission.end_time) - minutes(mission.start_time))
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const missionIds = uniqueIds(body.missionIds)
    const sourceDate = typeof body.sourceDate === 'string' ? body.sourceDate.slice(0, 10) : ''
    if (missionIds.length === 0 || !isValidIsoCalendarDate(sourceDate)) {
      return NextResponse.json({ error: 'invalid_reorganization' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data, error } = await db.from('camino_calendar')
      .select(COLUMNS)
      .eq('user_id', auth.user.id)
      .eq('status', 'pending')
      .eq('scheduled_date', sourceDate)
      .in('id', missionIds)
    if (error) throw error
    const missions = (data ?? []) as MissionRow[]
    if (missions.length !== missionIds.length) return NextResponse.json({ error: 'mission_not_found' }, { status: 404 })

    const candidateDates = Array.from({ length: 8 }, (_, index) => addDays(sourceDate, index + 1))
    const busySlots = await getAvailability(auth.user.id, candidateDates[0], candidateDates.at(-1)!)
    const externalBusyByDate = new Map<string, TimeRange[]>(candidateDates.map(date => [date, busySlotsForMadridDate(busySlots, date)]))
    const originals = new Map(missions.map(mission => [mission.id, mission]))
    const updated: Array<{ id: string; title: string; scheduledDate: string; startTime: string | null }> = []

    try {
      for (const mission of missions) {
        const placed = await placeBestAcrossDates(auth.user.id, db, candidateDates, durationFor(mission), {
          excludeCalendarRowIds: new Set([mission.id]),
          externalBusyByDate,
          context: {
            subject: mission.subject,
            missionType: mission.mission_type,
            deadlineDate: typeof mission.metadata?.partial_exam_date === 'string' ? mission.metadata.partial_exam_date : null,
            priority: typeof mission.metadata?.priority === 'string' ? mission.metadata.priority : null,
          },
        })
        if (!placed) throw new Error('no_available_slot')
        const changedAt = new Date().toISOString()
        const metadata = {
          ...(mission.metadata ?? {}),
          action_source: 'kairo_chat',
          calendar_reorganized_at: changedAt,
          calendar_reorganized_from: { date: mission.scheduled_date, start: mission.start_time, end: mission.end_time },
          calendar_sync_status: 'pending',
        }
        const { error: updateError } = await db.from('camino_calendar').update({
          scheduled_date: placed.date,
          start_time: placed.start,
          end_time: placed.end,
          metadata,
          updated_at: changedAt,
        }).eq('id', mission.id).eq('user_id', auth.user.id)
        if (updateError) throw updateError
        updated.push({ id: mission.id, title: mission.title, scheduledDate: placed.date, startTime: placed.start })
      }

      for (const mission of missions) {
        const sync = await syncExistingKairoMissionToGoogle(auth.user.id, mission.id, db)
        if (!sync.updated && sync.reason !== 'not_connected' && sync.reason !== 'no_time') throw new Error(`google_sync_${sync.reason}`)
      }
    } catch (operationError) {
      for (const mission of originals.values()) {
        await db.from('camino_calendar').update({
          scheduled_date: mission.scheduled_date,
          start_time: mission.start_time,
          end_time: mission.end_time,
          metadata: mission.metadata,
        }).eq('id', mission.id).eq('user_id', auth.user.id)
        await syncExistingKairoMissionToGoogle(auth.user.id, mission.id, db).catch(() => undefined)
      }
      console.warn('[camino/chat/reorganize] rolled back', operationError)
      return NextResponse.json({ ok: false, rolledBack: true, error: 'No se han podido aplicar todos los cambios.' }, { status: 409 })
    }

    for (const item of updated) {
      const original = originals.get(item.id)!
      await recordMissionBehaviorEvent(db, auth.user.id, item.id, 'rescheduled_manual', `kairo_chat:${item.id}:${item.scheduledDate}:${item.startTime}`, {
        source: 'kairo_chat',
        from: { date: original.scheduled_date, start: original.start_time, end: original.end_time },
        to: { date: item.scheduledDate, start: item.startTime },
      }).catch(error => console.warn('[camino/chat/reorganize] audit skipped', error))
    }
    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    console.error('[camino/chat/reorganize]', error)
    return NextResponse.json({ error: 'No se han podido reorganizar las misiones.' }, { status: 500 })
  }
}
