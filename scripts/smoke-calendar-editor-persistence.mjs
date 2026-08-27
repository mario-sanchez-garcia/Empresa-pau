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
    client.includes('<button type="button" data-calendar-editor-action="form-submit" onClick={handleFormSubmitClick} disabled={!safeSubjects.length || saveState === \'saving\'} title="Añade esta misión al día y con los ajustes configurados arriba."') &&
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

assert(
  'calendar editor PATCH does not overwrite camino_calendar source',
  existingMissionUpdatePayload.includes('scheduled_date: day.date') &&
    existingMissionUpdatePayload.includes('locked: true') &&
    !existingMissionUpdatePayload.includes('source:')
)
