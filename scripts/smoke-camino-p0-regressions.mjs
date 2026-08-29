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
  'Camino correction client parses empty or malformed bodies defensively',
  topicClient.includes('function parseCaminoCorrectionResponse') &&
    topicClient.includes('await response.text()') &&
    !topicClient.includes('const data = await response.json()')
)
