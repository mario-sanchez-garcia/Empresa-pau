/**
 * One-shot backfill: populate perfiles.comunidad for existing users from
 * their most recent onboarding_completed billing_events payload.
 *
 * Needed because comunidad used to live only in billing_events.payload
 * (an event log), which is fragile to query as a join key for the new
 * Comunidad+Materia league scope. Going forward, /api/onboarding/setup
 * writes perfiles.comunidad directly — this script catches up users who
 * onboarded before that change.
 *
 * Requires env vars (same as production):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-perfiles-comunidad.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function main() {
  console.log('backfill-perfiles-comunidad: starting...')

  // 1. Most recent onboarding_completed event per user.
  const { data: events, error: eventsError } = await db
    .from('billing_events')
    .select('user_id, payload, created_at')
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })

  if (eventsError) throw new Error(`billing_events query failed: ${eventsError.message}`)

  const latestByUser = new Map()
  for (const ev of events ?? []) {
    if (!latestByUser.has(ev.user_id)) latestByUser.set(ev.user_id, ev)
  }

  const candidates = []
  for (const [userId, ev] of latestByUser) {
    const community = (ev.payload ?? {}).community
    if (typeof community === 'string' && community.trim()) {
      candidates.push({ userId, comunidad: community.trim().slice(0, 80) })
    }
  }

  console.log(`Found ${latestByUser.size} users with onboarding_completed; ${candidates.length} with a community value.`)

  // 2. Skip users who already have perfiles.comunidad set (don't overwrite
  //    anything a user may have changed since).
  const allUserIds = candidates.map(c => c.userId)
  const { data: existingProfiles, error: profilesError } = await db
    .from('perfiles')
    .select('id, comunidad')
    .in('id', allUserIds)

  if (profilesError) throw new Error(`perfiles query failed: ${profilesError.message}`)

  const alreadySet = new Set((existingProfiles ?? []).filter(p => p.comunidad).map(p => p.id))
  const toProcess = candidates.filter(c => !alreadySet.has(c.userId))
  const skipped = candidates.length - toProcess.length

  console.log(`Skipping ${skipped} users who already have perfiles.comunidad. Processing ${toProcess.length}.`)

  let updated = 0
  let errors = 0

  for (const { userId, comunidad } of toProcess) {
    const { error } = await db.from('perfiles').upsert({ id: userId, comunidad }, { onConflict: 'id' })
    if (error) {
      errors++
      console.error(`  ✗ ${userId.slice(0, 8)}…: ${error.message}`)
    } else {
      updated++
      console.log(`  ✓ ${userId.slice(0, 8)}… → ${comunidad}`)
    }
  }

  console.log(`\nDone. ${updated} profiles updated, ${skipped} skipped (already had comunidad), ${errors} errors.`)
}

main().catch(err => { console.error(err); process.exit(1) })
