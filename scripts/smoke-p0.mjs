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

const page = read('app/page.tsx')
const chatRoute = read('app/api/chat/route.ts')
const mathFormatting = read('app/lib/mathFormatting.ts')
const signupRoute = read('app/api/auth/signup/route.ts')
const signupMigration = read('supabase/migrations/20260621130000_create_signup_attempts.sql')
const pricing = read('app/pricing/page.tsx')
const landing = read('app/landing/page.tsx')

assert(
  'streaming correction hides raw partial text before final renderer',
  page.includes('<CorrectionLoadingState />') &&
    page.includes('{!correccion && (streamText || cargando) ? (') &&
    !page.includes('<SafeStreamingText text={streamText} />') &&
    page.includes('correction={correccion}')
)

assert(
  'chat streaming uses safe text for active assistant message',
  page.includes('const isStreamingMessage = cargandoChat && i === mensajes.length - 1') &&
    page.includes('if (isStreamingMessage) return <SafeStreamingText text={msg.texto} />')
)

assert(
  'truncation sentinel is propagated by stream and parsed by client',
  chatRoute.includes('STREAM_TRUNCATION_SENTINEL') &&
    chatRoute.includes("finalMsg.stop_reason === 'max_tokens'") &&
    page.includes('readSafeStreamText')
)

assert(
  'non-stream chat exposes truncation metadata',
  chatRoute.includes('truncated: message.stop_reason ===') &&
    chatRoute.includes('finishReason:')
)

assert(
  'truncated corrections are not saved as final history',
  page.includes('if (!isTruncated)') &&
    page.includes("supabase.from('historial_examenes').insert") &&
    page.includes('No la hemos guardado en Historial') &&
    page.includes('Reintentar corrección')
)

assert(
  'correction LaTeX normalizer covers orphan tfrac fragments',
  mathFormatting.includes('wrapOrphanLatexFragments') &&
    mathFormatting.includes('tfrac') &&
    mathFormatting.includes(String.raw`[A-Z]\^\{-?1\}`)
)

assert(
  'signup has durable IP and email rate limits',
  signupRoute.includes('SIGNUP_IP_RATE_LIMIT') &&
    signupRoute.includes('SIGNUP_EMAIL_RATE_LIMIT') &&
    signupRoute.includes(".eq('email', normalizedEmail)") &&
    signupMigration.includes('email TEXT')
)

assert(
  'pricing and landing do not advertise unlimited AI usage',
  !/ilimitad/i.test(pricing) &&
    !/ilimitad/i.test(landing)
)

if (process.exitCode) {
  process.exit(process.exitCode)
}
