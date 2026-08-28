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
const config = read('app/lib/camino/calendarEditorConfig.ts')
const availability = read('app/lib/calendar/availability.ts')
const scheduleTimeSlot = read('app/lib/camino/scheduleTimeSlot.ts')
const conflictRoute = read('app/api/camino/calendar-conflicts/route.ts')
const reorganizeRoute = read('app/api/camino/calendar-conflicts/reorganize/route.ts')
const calendarSync = read('app/lib/calendar/sync.ts')
const existingMissionUpdatePayload = client.slice(
  client.indexOf('const toUpdate = draft.flatMap'),
  client.indexOf('// INSERT new missions'),
)
const calendarEditorOverlay = client.slice(
  client.indexOf('function CalendarEditorOverlay'),
  client.indexOf('function formatBlockLabel'),
)
const addMissionFunction = calendarEditorOverlay.slice(
  calendarEditorOverlay.indexOf('async function addMission'),
  calendarEditorOverlay.indexOf('const kindOptions'),
)
const calendarWeekTimeline = client.slice(
  client.indexOf('function CalendarWeekTimeline'),
  client.indexOf('function CompactWeekView'),
)

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
  'calendar editor form button is the only new-mission submit path',
  addMissionFunction.includes("fetch('/api/camino/calendar-editor/mission'") &&
    client.includes('async function handleFormSubmitClick()') &&
    client.includes('await addMission()') &&
    client.includes('<button type="button" data-calendar-editor-action="form-submit" onClick={handleFormSubmitClick} disabled={!safeSubjects.length || saveState === \'saving\' || Boolean(timeConflictNotice)} title="Añade esta misión al día y con los ajustes configurados arriba."') &&
    client.includes('function handleTopAddClick()') &&
    client.includes('data-calendar-editor-action="top-add" onClick={handleTopAddClick}') &&
    client.includes("{missionPanelOpen ? 'Cerrar formulario' : 'Añadir misión'}") &&
    client.includes('function suggestTopicInForm()') &&
    client.includes('data-calendar-editor-action="suggested"') &&
    client.includes('onClick={suggestTopicInForm}') &&
    !client.includes('onClick={() => selectedDay && addMission(') &&
    !client.includes('Añadir aquí')
)

assert(
  'calendar editor exposes one traceable persistent submit control',
  (client.match(/data-calendar-editor-action="form-submit"/g) ?? []).length === 1 &&
    (client.match(/data-calendar-editor-action="top-add"/g) ?? []).length === 1 &&
    (client.match(/data-calendar-editor-action="suggested"/g) ?? []).length === 1
)

assert(
  'calendar editor dev trace covers real button path to fetch',
  client.includes("[calendar-editor] TOP_ADD_CLICK") &&
    client.includes("[calendar-editor] SUGGESTED_CLICK") &&
    client.includes("[calendar-editor] FORM_SUBMIT_CLICK") &&
    client.includes("[calendar-editor] ADD_MISSION_HANDLER_ENTER") &&
    client.includes("[calendar-editor] FETCH_START") &&
    client.includes("process.env.NODE_ENV !== 'production'")
)

assert(
  'calendar editor has unified Semana Mes calendar surface',
  client.includes('<CalendarDays size={13} /> Calendario') &&
    client.includes("const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')") &&
    client.includes("setCalendarView('week')") &&
    client.includes("setCalendarView('month')") &&
    client.includes('monthGrid.map(dateISO =>') &&
    client.includes('onClick={() => selectEditorDay(dateISO)}') &&
    !client.includes('<MonthCalendarButton') &&
    !client.includes('showMonthCalendar') &&
    !client.includes("import MonthCalendarOverlay")
)

assert(
  'calendar editor hides duration and keeps end time automatic',
  config.includes('DEFAULT_MISSION_DURATION_MINUTES = 30') &&
    client.includes('minutes: DEFAULT_MISSION_DURATION_MINUTES') &&
    route.includes('DEFAULT_MISSION_DURATION_MINUTES') &&
    !calendarEditorOverlay.includes('<Field label="Duración') &&
    !calendarEditorOverlay.includes('<Field label="Termina">')
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
    route.includes('const requestedEndTime = addMinutesToTime(requestedStartTime, durationMinutes)') &&
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

assert(
  'calendar editor PATCH does not overwrite camino_calendar source',
  existingMissionUpdatePayload.includes('scheduled_date: day.date') &&
    existingMissionUpdatePayload.includes('locked: true') &&
    !existingMissionUpdatePayload.includes('source:')
)

assert(
  'calendar availability keeps external busy abstract and private',
  availability.includes('export type LocalBusyRange') &&
    availability.includes('export async function getAvailability(') &&
    availability.includes('forceRefresh?: boolean') &&
    availability.includes('!options.forceRefresh') &&
    availability.includes('busySlotsForMadridDate') &&
    availability.includes('hasTimeConflict') &&
    availability.includes("console.warn('[calendar/availability] freebusy skipped:'") &&
    !availability.includes('summary') &&
    calendarSync.includes("provider.getAvailability(['primary']")
)

assert(
  'day scheduler can receive external busy slots without importing server-only',
  scheduleTimeSlot.includes('externalBusy?: TimeRange[] | null') &&
    scheduleTimeSlot.includes('const externalBusy = options.externalBusy ?? []') &&
    scheduleTimeSlot.includes('const busy = [...localBusy, ...externalBusy]') &&
    !scheduleTimeSlot.includes("import 'server-only'") &&
    !scheduleTimeSlot.includes("from '@/app/lib/calendar/availability'")
)

assert(
  'calendar conflicts endpoint detects overlaps without exposing private titles',
  conflictRoute.includes("request.nextUrl.searchParams.get('refresh') === '1'") &&
    conflictRoute.includes('getAvailability(auth.user.id, start, end, { forceRefresh })') &&
    conflictRoute.includes('busySlotsForMadridDate') &&
    conflictRoute.includes('hasTimeConflict') &&
    conflictRoute.includes('busyStart') &&
    conflictRoute.includes('busyEnd') &&
    conflictRoute.includes('busyByDate') &&
    !conflictRoute.includes('description') &&
    !conflictRoute.includes('location')
)

assert(
  'Camino calendar warns about external conflicts without polling',
  client.includes("fetch(`/api/camino/calendar-conflicts?start=${selectedWeekStart}&end=${weekEnd}&refresh=1`") &&
    client.includes('Tu calendario ha cambiado ·') &&
    client.includes('Ocupado') &&
    client.includes('reorganizeCalendarConflicts') &&
    !client.includes('setInterval(')
)

assert(
  'Camino week view renders private busy slots and Kairo mission times',
  client.includes('type ExternalBusyByDate = Record<string, ExternalBusySlot[]>') &&
    client.includes('setExternalBusyByDate') &&
    client.includes('function formatTimeRange') &&
    client.includes('formatTimeRange(mission.startTime, mission.endTime)') &&
    client.includes('formatTimeRange(slot.start, slot.end)') &&
    client.includes('· Ocupado') &&
    client.includes('Sin hora') &&
    client.includes('missionConflictFor(mission, conflicts)') &&
    !client.includes('externalBusy.title') &&
    !client.includes('busy.summary')
)

assert(
  'Calendar editor overlay receives and renders conflict payload from parent state',
  client.includes('externalBusyByDate={externalBusyByDate}') &&
    client.includes('conflicts={calendarConflicts}') &&
    client.includes('onEditorWeekChange={weekStart =>') &&
    calendarEditorOverlay.includes('externalBusyByDate: ExternalBusyByDate') &&
    calendarEditorOverlay.includes('conflicts: CalendarConflict[]') &&
    calendarEditorOverlay.includes('const selectedDayBusy = selectedDay ? externalBusyByDate[selectedDay.date] ?? [] : []') &&
    calendarEditorOverlay.includes('const selectedDayConflicts = selectedDay ? conflicts.filter(conflict => conflict.date === selectedDay.date) : []') &&
    calendarEditorOverlay.includes('missionConflictFor(mission, selectedDayConflicts)') &&
    calendarEditorOverlay.includes('Tu calendario ha cambiado · {conflicts.length}') &&
    calendarEditorOverlay.includes('onClick={onReorganize}') &&
    calendarEditorOverlay.includes('formatTimeRange(slot.start, slot.end)} · Ocupado') &&
    calendarEditorOverlay.includes('formatTimeRange(mission.startTime, mission.endTime)')
)

assert(
  'Calendar editor week timeline maps real times into vertical positions',
  client.includes('function timeToMinutes') &&
    client.includes('function minutesToHHMM') &&
    client.includes('function snapMinutes') &&
    client.includes('const TIMELINE_PX_PER_MINUTE') &&
    client.includes('function buildTimelineRange') &&
    client.includes('function buildTimelineBlocks') &&
    client.includes('function positionTimelineBlocks') &&
    client.includes('(block.start - range.start) * TIMELINE_PX_PER_MINUTE') &&
    client.includes('(block.end - block.start) * TIMELINE_PX_PER_MINUTE') &&
    client.includes('TIMELINE_MIN_BLOCK_HEIGHT')
)

assert(
  'Calendar editor week timeline renders Kairo, busy, unprogrammed and overlaps',
  calendarWeekTimeline.includes('function CalendarWeekTimeline') &&
    client.includes("kind: 'mission'") &&
    client.includes("kind: 'busy'") &&
    calendarWeekTimeline.includes('positionTimelineBlocks(blocksByDate.get(day.date) ?? [])') &&
    calendarWeekTimeline.includes('left: `calc(${left}% + 4px)`') &&
    calendarWeekTimeline.includes('width: `calc(${width}% - 8px)`') &&
    calendarWeekTimeline.includes('Sin programar') &&
    calendarWeekTimeline.includes('Ocupado') &&
    calendarWeekTimeline.includes('Conflicto') &&
    calendarWeekTimeline.includes('formatTimeRange(block.mission.startTime, block.mission.endTime)') &&
    !calendarWeekTimeline.includes('summary') &&
    !calendarWeekTimeline.includes('location')
)

assert(
  'calendar editor prevents manual overlaps before creating duplicate Kairo missions',
  calendarEditorOverlay.includes('const newMissionKairoBusy = (newMissionDay?.missions ?? [])') &&
    calendarEditorOverlay.includes('const newMissionExternalBusy = externalBusyByDate[newMission.day] ?? []') &&
    calendarEditorOverlay.includes('const timeConflictNotice = (() => {') &&
    calendarEditorOverlay.includes('localTimeConflict(requested, slot)') &&
    calendarEditorOverlay.includes("disabled={!safeSubjects.length || saveState === 'saving' || Boolean(timeConflictNotice)}") &&
    calendarEditorOverlay.includes('Ese horario ya está ocupado.') &&
    calendarEditorOverlay.includes('Ese horario coincide con un evento de tu calendario.') &&
    calendarEditorOverlay.includes('Siguiente hueco disponible:') &&
    calendarEditorOverlay.includes('Usar {timeConflictNotice.suggestedStart}')
)

assert(
  'calendar editor backend rejects stale overlapping timed missions without inserting',
  route.includes(".eq('scheduled_date', scheduledDate)") &&
    route.includes(".eq('status', 'pending')") &&
    route.includes(".not('start_time', 'is', null)") &&
    route.includes('const kairoBusy = ((sameDayRows ?? [])') &&
    route.includes('const externalBusy = requestedStartTime && requestedEndTime') &&
    route.includes("code: 'TIME_CONFLICT'") &&
    route.includes("conflictType: kairoConflict ? 'kairo' : 'external'") &&
    route.includes('suggestedStart: findNextFreeStart(requestedStartTime, durationMinutes, [...kairoBusy, ...externalBusy])')
)

assert(
  'calendar editor time overlap logic allows exact boundaries and suggests next 15 minute slot',
  client.includes('return Math.max(aStart, bStart) < Math.min(aEnd, bEnd)') &&
    availability.includes('return Math.max(toMinutes(a.start), toMinutes(b.start)) < Math.min(toMinutes(a.end), toMinutes(b.end))') &&
    client.includes('for (let cursor = snapMinutes(start); cursor + durationMinutes <= 24 * 60; cursor += 15)') &&
    route.includes('for (let cursor = Math.ceil(minutesFromTime(startTime) / 15) * 15; cursor + durationMinutes <= MINUTES_PER_DAY; cursor += 15)')
)

assert(
  'calendar editor overlay is larger and scroll is contained inside the modal',
  client.includes('max-w-[1440px]') &&
    client.includes("width: 'min(96vw, 1440px)'") &&
    client.includes("height: '92dvh'") &&
    client.includes("maxHeight: '920px'") &&
    client.includes("document.body.style.overflow = 'hidden'") &&
    client.includes("overscrollBehavior: 'contain'") &&
    client.includes('px-5 py-4') &&
    client.includes('fontSize: 34') &&
    client.includes('const TIMELINE_PX_PER_MINUTE = 1.2')
)
assert(
  'Calendar editor empty slot click reuses existing add mission form with date and time',
  calendarEditorOverlay.includes('onEmptySlotClick={(date, startTime) => {') &&
    calendarEditorOverlay.includes('selectEditorDay(date)') &&
    calendarEditorOverlay.includes('openMissionForm(date)') &&
    calendarEditorOverlay.includes('setNewMission(current => ({ ...current, day: date, startTime }))') &&
    client.includes('onClick={event => {') &&
    client.includes('snapMinutes(range.start + ((event.clientY - rect.top) / TIMELINE_PX_PER_MINUTE))')
)

assert(
  'Camino availability refreshes on visible week interactions without aggressive polling',
  client.includes('calendarAvailabilityRefreshKey') &&
    client.includes("document.addEventListener('visibilitychange', refreshAvailability)") &&
    client.includes("window.addEventListener('focus', refreshAvailability)") &&
    client.includes('setCalendarAvailabilityRefreshKey(key => key + 1)') &&
    client.includes('externalBusyByDate={externalBusyByDate}') &&
    client.includes('conflicts={calendarConflicts}') &&
    client.includes('onEditorWeekChange(nextWeekStart)') &&
    !client.includes('setInterval(')
)

assert(
  'calendar conflict reorganize revalidates conflicts and only moves affected missions',
  reorganizeRoute.includes('const stillConflicts = currentBusy.some') &&
    reorganizeRoute.includes('if (!stillConflicts)') &&
    reorganizeRoute.includes('unchangedIds.push(mission.id)') &&
    reorganizeRoute.includes('excludeCalendarRowIds: new Set([mission.id])') &&
    reorganizeRoute.includes('start_time: null') &&
    reorganizeRoute.includes('pending_no_time') &&
    !reorganizeRoute.includes('.delete(')
)

assert(
  'calendar conflict reorganize updates existing Google events without creating duplicates',
  reorganizeRoute.includes('syncExistingKairoMissionToGoogle(auth.user.id, mission.id, db)') &&
    calendarSync.includes('export async function syncExistingKairoMissionToGoogle') &&
    calendarSync.includes('if (!link?.external_event_id)') &&
    calendarSync.includes("reason: 'no_existing_link'") &&
    calendarSync.includes('await provider.updateEvent(link.external_calendar_id, link.external_event_id, eventInput)') &&
    !calendarSync.slice(calendarSync.indexOf('export async function syncExistingKairoMissionToGoogle')).includes('provider.createEvent')
)

assert(
  'Camino conflict UI calls reorganize endpoint with clear states',
  client.includes("fetch('/api/camino/calendar-conflicts/reorganize'") &&
    client.includes('calendarReorganizeStatus') &&
    client.includes('Reorganizando...') &&
    client.includes('✓ Reorganizado') &&
    client.includes('Reintentar')
)
