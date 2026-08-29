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

const route = read('app/api/camino/correct/route.ts')
const topicClient = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')

const mockStart = route.indexOf('if (DEV_MOCK_CORRECTIONS)')
const anthropicKey = route.indexOf('const anthropicApiKey = process.env.ANTHROPIC_API_KEY')
const limits = route.indexOf('const internalUser = isInternalUser')
const realClient = route.indexOf('const client = new Anthropic')
const mockBlock = route.slice(mockStart, anthropicKey)

assert(
  'dev mock is guarded by NODE_ENV and DEV_MOCK_CORRECTIONS',
  route.includes("process.env.NODE_ENV !== 'production' && process.env.DEV_MOCK_CORRECTIONS === 'true'") &&
    route.includes("process.env.NODE_ENV !== 'production' && process.env.DEV_MOCK_CORRECTIONS_ERROR === 'true'")
)

assert(
  'dev mock runs before Anthropic key lookup, limits and provider client',
  mockStart > 0 &&
    anthropicKey > mockStart &&
    limits > mockStart &&
    realClient > mockStart
)

assert(
  'dev mock block does not call Anthropic or usage billing',
  !mockBlock.includes('new Anthropic') &&
    !mockBlock.includes('client.messages.create') &&
    !mockBlock.includes('logAiUsageEvent') &&
    !mockBlock.includes('enforceUsageLimits')
)

assert(
  'dev mock returns canonical correction payload with mock flag',
  route.includes('buildDevMockCorrection') &&
    route.includes('validateCorrectionJsonShape(mockCorrection)') &&
    route.includes('normalizeCorrectionForOfficialScores(mockCorrection, [maxScore])') &&
    route.includes("finishReason: 'dev_mock'") &&
    route.includes('mock: true')
)

assert(
  'real correction flow still requires Anthropic when mock is disabled',
  route.includes('if (!anthropicApiKey)') &&
    route.includes('new Anthropic({ apiKey: anthropicApiKey')
)

const clientMockBranchStart = topicClient.indexOf("data.mock && process.env.NODE_ENV !== 'production'")
const repeatBranchStart = topicClient.indexOf('} else if (repeatOfId)', clientMockBranchStart)
const clientMockBranch = topicClient.slice(clientMockBranchStart, repeatBranchStart)

assert(
  'client recognizes mock corrections only outside production',
  topicClient.includes('mock?: boolean') &&
    topicClient.includes("data.mock && process.env.NODE_ENV !== 'production'") &&
    topicClient.includes('setMockCorrection(true)') &&
    topicClient.includes('Modo prueba')
)

assert(
  'client mock branch renders correction but skips persistence, completion and XP',
  clientMockBranch.includes('setScore(rawScore)') &&
    clientMockBranch.includes('setMissionXpStatus') &&
    clientMockBranch.includes('return') &&
    !clientMockBranch.includes("fetch('/api/camino/complete-mission'") &&
    !clientMockBranch.includes("supabase.from('historial_examenes')") &&
    !clientMockBranch.includes('recordConfirmedCorrectionXp') &&
    !clientMockBranch.includes('recordCorrectionWeakArea')
)

assert(
  'first-session side effect is skipped for mock corrections',
  topicClient.includes('!correction || mockCorrection || firstSessionMarked') &&
    topicClient.includes('score !== null && correction && !mockCorrection')
)
