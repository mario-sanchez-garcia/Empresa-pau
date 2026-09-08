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

const curriculumSeed = JSON.parse(read('app/data/camino/curriculum_seed.json'))
const curriculumPlan = read('app/lib/camino/caminoCurriculumPlan.ts')
const courseRoute = read('app/camino-pau/curso/[subject]/[block]/[topic]/page.tsx')
const legacyRoute = read('app/camino/tema/[subject]/[block]/[topic]/page.tsx')
const calendarClient = read('app/components/camino/CaminoCalendarClient.tsx')
const topicClient = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')
const correctRoute = read('app/api/camino/correct/route.ts')
const completeMissionRoute = read('app/api/camino/complete-mission/route.ts')
const postponeMissionRoute = read('app/api/camino/postpone-mission/route.ts')
const awardXp = read('app/lib/camino/awardXp.ts')
const atomicXpMigration = read('supabase/migrations/20260908130000_atomic_camino_xp_award.sql')
const calendarEditorRoute = read('app/api/camino/calendar-editor/mission/route.ts')
const chatReorganizeRoute = read('app/api/camino/chat/reorganize/route.ts')
const simulacroRoute = read('app/api/simulacro/route.ts')
const calendarCompletion = read('app/lib/camino/markCalendarMissionCompleted.ts')
const simulacroResults = read('app/simulacros/[id]/results/page.tsx')

assert(
  'Historia mission canonical topic exists in Camino seed',
  curriculumSeed.some(topic =>
    topic.subject === 'historia_espana' &&
    topic.blockSlug === 'segunda-republica' &&
    topic.topicSlug === 'el-bienio-reformista-reforma-militar-y-r' &&
    topic.v2SortOrder === 91
  )
)

assert(
  'course route resolves through central curriculum before rendering',
  courseRoute.includes('getTopic(subject, block, topic)') &&
    courseRoute.includes('if (!curriculumTopic) notFound()') &&
    courseRoute.includes('CaminoTopicClient')
)

assert(
  'legacy topic route has the same resolver and missing-topic behavior',
  legacyRoute.includes('getTopic(subject, block, topic)') &&
    legacyRoute.includes('if (!curriculumTopic) notFound()') &&
    legacyRoute.includes('CaminoTopicClient')
)

assert(
  'legacy persisted Historia slugs have a controlled alias path',
  curriculumPlan.includes("'historia_espana:la-segunda-republica:la-segunda-republica': 'segunda-republica'") &&
    curriculumPlan.includes('export function resolveTopicSlugAlias') &&
    curriculumPlan.includes('export function resolveCaminoTopic')
)

assert(
  'calendar missions prefer canonical v2 topic links when possible',
  calendarClient.includes('const linkedTopic = getTopicByV2SortOrder(row.subject, row.v2_sort_order)') &&
    calendarClient.includes('linkedTopic ? buildTopicHref(linkedTopic)') &&
    calendarClient.includes('resolveCourseHref(rowSubjectSlug, blockSlug, topicSlug)')
)

assert(
  'start mission telemetry remains best-effort and outside correction critical path',
  topicClient.includes('void recordMissionStart(accessToken)') &&
    topicClient.includes("console.warn('[camino/topic] start mission telemetry skipped'")
)

assert(
  'Camino correction route checks Anthropic credentials before provider call',
  correctRoute.includes('process.env.ANTHROPIC_API_KEY') &&
    correctRoute.includes('anthropic_api_key_missing') &&
    correctRoute.includes('new Anthropic({ apiKey: anthropicApiKey')
)

assert(
  'Camino correction route returns structured JSON for provider failures',
  correctRoute.includes("error: 'correction_unavailable'") &&
    correctRoute.includes('CORRECTION_UNAVAILABLE_MESSAGE') &&
    correctRoute.includes('return correctionUnavailableResponse()') &&
    !correctRoute.includes('    throw error\n')
)

assert(
  'Camino correction route repairs only provider responses with invalid correction format',
  correctRoute.includes('validateCorrectionJsonShape(parsed)') &&
    correctRoute.includes('shouldRepairCorrectionFormat(rawText, parsed)') &&
    correctRoute.includes('buildCorrectionFormatRepairPrompt(rawText, validation)') &&
    correctRoute.includes("error: 'invalid_correction_format'")
)

assert(
  'Camino correction client parses empty or malformed bodies defensively',
  topicClient.includes('function parseCaminoCorrectionResponse') &&
    topicClient.includes('await response.text()') &&
    !topicClient.includes('const data = await response.json()')
)

assert(
  'XP ledger and both aggregates are awarded in one server-only transaction',
  awardXp.includes(".rpc('award_camino_xp'") &&
    atomicXpMigration.includes('insert into public.camino_xp_events') &&
    atomicXpMigration.includes('insert into public.camino_subject_xp') &&
    atomicXpMigration.includes('insert into public.camino_user_progress') &&
    atomicXpMigration.includes('on conflict (user_id, source_type, source_id, mission_date) do nothing') &&
    atomicXpMigration.includes('revoke all on function public.award_camino_xp')
)

assert(
  'completed calendar rows can repair an interrupted XP award idempotently',
  completeMissionRoute.includes("targetRow?.status === 'completed'") &&
    completeMissionRoute.includes('recovered: true') &&
    completeMissionRoute.includes('missionDate: targetRow?.scheduled_date ?? today')
)

assert(
  'complete-mission binds a supplied calendar id to the authenticated subject and topic',
  completeMissionRoute.match(/\.eq\('subject', subject\)/g)?.length >= 3 &&
    completeMissionRoute.match(/\.eq\('v2_sort_order', v2SortOrder\)/g)?.length >= 3
)

assert(
  'Camino completion and postpone use the Madrid academic date',
  completeMissionRoute.includes('const today = getMadridToday()') &&
    postponeMissionRoute.includes(".lte('scheduled_date', getMadridToday())") &&
    !postponeMissionRoute.includes("new Date().toISOString().slice(0, 10)")
)

assert(
  'postpone controls persist remotely and never claim success after an API failure',
  calendarClient.includes("fetch('/api/camino/calendar-editor/mission'") &&
    calendarClient.includes('if (!res.ok && !payload?.persisted)') &&
    calendarClient.includes('if (!res.ok && !json?.persisted)') &&
    calendarClient.includes(".in('status', ['pending', 'missed', 'completed'])") &&
    topicClient.indexOf("fetch('/api/camino/postpone-mission'") < topicClient.indexOf('saveJson(SCHOOL_FEEDBACK_KEY, next)')
)

assert(
  'calendar editor and chat reject impossible calendar dates before Postgres',
  calendarEditorRoute.includes('isValidIsoCalendarDate(scheduledDate)') &&
    chatReorganizeRoute.includes('isValidIsoCalendarDate(sourceDate)')
)

assert(
  'simulacro calendar completion failures are returned and shown honestly',
  calendarCompletion.includes('Promise<boolean>') &&
    calendarCompletion.includes('if (updateError) throw updateError') &&
    simulacroRoute.includes('calendarMissionCompletionPending') &&
    simulacroResults.includes('result.calendarMissionCompletionPending === true')
)
