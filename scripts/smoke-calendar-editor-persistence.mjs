import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

const client = read('app/components/camino/CaminoCalendarClient.tsx')
const route = read('app/api/camino/calendar-editor/mission/route.ts')

assert(
  'calendar editor creates missions through backend before painting them',
  client.includes("fetch('/api/camino/calendar-editor/mission'") &&
    client.includes('payload.mission?.id') &&
    client.includes('calRowToMission(payload.mission)') &&
    client.includes('setDraft(updatedDraft)') &&
    client.includes('onPersist(updatedDraft)') &&
    !client.includes("manual-${draft.reduce") &&
    !client.includes('<Field label="Termina">')
)

assert(
  'calendar editor backend validates payload and writes camino_calendar',
  route.includes('getAuthContext(request)') &&
    route.includes("from('camino_calendar')") &&
    route.includes('.insert({') &&
    route.includes('scheduled_date: scheduledDate') &&
    route.includes('subject,') &&
    route.includes('mission_type: missionType') &&
    route.includes('locked: true') &&
    route.includes("source: 'manual'") &&
    route.includes("generated_by: 'calendar_editor'") &&
    route.includes('.select(selectColumns)') &&
    route.includes(".eq('id', inserted.id)") &&
    route.includes('mission: verified')
)

assert(
  'calendar editor computes end_time from start_time plus duration',
  route.includes('function addMinutesToTime') &&
    route.includes('const endTime = addMinutesToTime(startTime, durationMinutes)') &&
    route.includes("return NextResponse.json({ error: 'end_time_after_midnight' }") &&
    route.includes('start_time: startTime') &&
    route.includes('end_time: endTime') &&
    client.includes('addMinutesToHHMM(effective.startTime || null, effective.minutes)') &&
    client.includes('La misión no puede terminar después de medianoche.')
)

assert(
  'calendar editor syncs Google only for timed persisted missions',
  route.includes('let calendarSync = startTime && endTime ?') &&
    route.includes('if (startTime && endTime)') &&
    route.includes('syncKairoMissionsToGoogle(auth.user.id, db)') &&
    route.includes("calendar_sync_status: startTime && endTime ? 'pending' : 'pending_no_time'")
)
