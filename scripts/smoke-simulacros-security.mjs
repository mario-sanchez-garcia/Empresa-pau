import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const active = read('app/simulacros/[id]/page.tsx')
const practice = read('app/simulacros/practica/[id]/page.tsx')
const listing = read('app/simulacros/page.tsx')
const session = read('app/api/simulacro/session/route.ts')
const correction = read('app/api/simulacro/route.ts')
const timer = read('app/api/simulacro/timer/route.ts')
const migration = read('supabase/migrations/20260909160000_secure_simulacro_lifecycle.sql')

for (const [name, source] of [['active attempt', active], ['partial practice', practice], ['listing', listing]]) {
  assert.equal(/from\('historial_simulacros'\)[\s\S]{0,180}\.(?:insert|update|upsert|delete)\(/.test(source), false, `${name} must not mutate protected attempts directly`)
}

assert.match(session, /\.eq\('user_id', userId\)/, 'session mutations must bind the authenticated owner')
assert.match(session, /\.eq\('answers_revision', expectedRevision\)/, 'autosave must use compare-and-swap')
assert.match(session, /async function deleteAttempt[\s\S]*\.eq\('user_id', userId\)[\s\S]*\.eq\('estado', 'en_progreso'\)/, 'delete must be server-side, owner-bound and limited to unfinished attempts')
assert.match(session, /canonicalizeOfficialSimulacroBlock/, 'new attempts must resolve official blocks server-side')
assert.match(session, /full-mission:[\s\S]*full-exam:/, 'Camino and exam entry points must derive an idempotent full-attempt identity')
assert.match(correction, /claimCorrection/, 'correction must atomically claim an attempt')
assert.match(correction, /\.eq\('correction_started_at', claimStartedAt\)/, 'only the worker owning the exact correction claim may finalize it')
assert.match(correction, /correction_status: 'partial'/, 'partial correction must be explicit')
assert.match(correction, /estado: 'en_progreso'/, 'failed/partial corrections must remain retryable')
assert.match(correction, /idempotentReplay/, 'completed submit retries must return the stored result')
assert.match(timer, /\.eq\('timer_revision', revision\)/, 'timer mutations must use compare-and-swap')
assert.match(migration, /drop policy if exists "Users can manage their own simulacros"/)
assert.doesNotMatch(migration, /for\s+(?:all|insert|update|delete)\b/i, 'browser RLS must not permit protected writes')

console.log('Simulacros security smoke checks passed')
