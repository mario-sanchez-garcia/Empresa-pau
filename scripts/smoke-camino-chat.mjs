import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
let failed = false
function check(name, condition) {
  if (!condition) failed = true
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${name}`)
}

const assistant = read('app/components/camino/CaminoAssistant.tsx')
const chat = read('app/api/camino/chat/route.ts')
const mission = read('app/api/camino/calendar-editor/mission/route.ts')
const exams = read('app/api/camino/exams/route.ts')
const reorganize = read('app/api/camino/chat/reorganize/route.ts')
const postpone = read('app/api/camino/postpone-mission/route.ts')
const weekly = read('app/components/camino/WeeklyCheckinBanner.tsx')
const camino = read('app/components/camino/CaminoCalendarClient.tsx')

check('chat separates questions from calendar organization', assistant.includes('Preguntar a Kairo') && assistant.includes('Organizar calendario'))
check('questions and mutations share a typed preview boundary', chat.includes('CaminoChatPreview') && assistant.includes('requiresConfirmation') && assistant.includes('executePreview'))
check('chat state is loaded only for the authenticated user', chat.includes(".eq('user_id', auth.user.id)") && chat.includes('getAuthContext(request)'))
check('move validates ownership and conflicts server-side', mission.includes(".eq('user_id', auth.user.id)") && mission.includes("code: 'TIME_CONFLICT'") && mission.includes('syncExistingKairoMissionToGoogle'))
check('extra missions use the calendar-editor persistence path', assistant.includes("'/api/camino/calendar-editor/mission'") && assistant.includes("source: 'kairo_chat'") && mission.includes('generated_by: sourceTag'))
check('exam creation reuses profile exams and partial mission injection', exams.includes("from('perfiles')") && exams.includes('cleanStudentExams') && exams.includes('injectAllPartialExamMissions'))
check('exam creation rolls back when plan injection fails', exams.includes("update({ student_exams: previous })"))
check('multiple moves roll back DB and Google on partial failure', reorganize.includes('originals.values()') && reorganize.includes('rolledBack: true') && reorganize.includes('syncExistingKairoMissionToGoogle'))
check('postpone removes the same linked Google event', postpone.includes('unlinkKairoMissionFromGoogle') && postpone.includes("source: actionSource"))
check('errors never render a success response', assistant.includes('if (!response.ok)') && assistant.includes('No he podido aplicar el cambio.') && assistant.includes('Reintentar'))
check('weekly same-answer does not regenerate the plan', weekly.includes('Entendido ✓') && !weekly.includes('ensure-calendar') && !weekly.includes('Recalculando'))
check('Camino keeps the week block and the hero', camino.includes('data-testid="camino-week-overview"') && camino.includes('Días hasta selectividad'))

if (failed) process.exitCode = 1
