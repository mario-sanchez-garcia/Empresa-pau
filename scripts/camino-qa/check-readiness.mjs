#!/usr/bin/env node
// Read-only compatibility checks. No accounts, missions or migrations are changed.
// node --env-file=/path/to/.env.local scripts/camino-qa/check-readiness.mjs \
//   --subjects=fisica,quimica --app-url=https://www.kairo-pau.com
// Output contains counts and schema checks, never credentials or student records.
import { parseArgs } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const { values } = parseArgs({ options: { subjects: { type: 'string' }, 'app-url': { type: 'string' } } })
const subjects = [...new Set((values.subjects ?? '').split(',').filter(Boolean))]
if (!subjects.length || subjects.some(s => !/^[a-z_]+$/.test(s))) throw new Error('Specify --subjects with the subjects enabled for this beta')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase configuration; provide it through environment variables')
const timedFetch = (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) })
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } })
const checks = []
const check = async (name, run) => {
  try { checks.push({ name, ok: true, ...await run() }) }
  catch (error) { checks.push({ name, ok: false, error: error instanceof Error ? error.message : 'Check failed' }) }
}
const schemas = {
  camino_calendar: 'id,queue_id,subject,scheduled_date,status,source,locked,mission_type,start_time,end_time,metadata,actual_duration_minutes',
  user_learning_queue: 'id,subject,subject_position,queue_status,retry_not_before,metadata',
  camino_custom_events: 'id,event_date,recurrence,recurrence_until,day_of_week,start_time,end_time',
}
await Promise.all(Object.entries(schemas).map(([table, columns]) => check(`schema:${table}`, async () => {
  const { error } = await db.from(table).select(columns).limit(0)
  if (error) throw new Error(error.message)
})))
await check('published-curriculum', async () => {
  const counts = Object.fromEntries(subjects.map(subject => [subject, 0]))
  for (let from = 0; ; from += 500) {
    const { data, error } = await db.from('curriculum_content_v2').select('subject')
      .eq('review_status', 'published').in('subject', subjects).order('id').range(from, from + 499)
    if (error) throw new Error(error.message)
    for (const row of data ?? []) counts[row.subject]++
    if (!data || data.length < 500) break
  }
  const missing = subjects.filter(subject => counts[subject] === 0)
  return { ok: missing.length === 0, counts, missing }
})
await check('planning-rpc-exposure', async () => {
  // Inspect PostgREST's service-role OpenAPI definition. Never invoke an RPC.
  const response = await timedFetch(new URL('/rest/v1/', url), { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/openapi+json' } })
  if (!response.ok) throw new Error(`OpenAPI returned HTTP ${response.status}`)
  const schema = await response.json()
  if (!schema.paths) throw new Error('OpenAPI paths unavailable: RPC compatibility unverified')
  const required = ['camino_claim_plan','camino_release_plan','camino_reconcile_work','camino_apply_placements']
  const missing = required.filter(name => !schema.paths[`/rpc/${name}`])
  return { ok: missing.length === 0, missing }
})
if (values['app-url']) {
  const origin = new URL(values['app-url'])
  if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('Use an HTTPS app URL without credentials')
  for (const path of ['/api/camino/plan-overview', '/api/camino/ensure-calendar']) {
    await check(`unauthenticated:${path}`, async () => {
      const response = await timedFetch(new URL(path, origin), { method: path.endsWith('ensure-calendar') ? 'POST' : 'GET', redirect: 'manual' })
      return { ok: response.status === 401, status: response.status }
    })
  }
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), compatible: checks.every(c => c.ok),
  scope: 'Read-only schema, published-content presence, RPC exposure and unauthenticated endpoint checks. Does not certify deployment version, RLS, academic completeness, real-user flows or load capacity.', checks }, null, 2))
if (checks.some(c => !c.ok)) process.exitCode = 1
