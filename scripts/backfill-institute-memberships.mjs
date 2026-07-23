/**
 * One-shot backfill: create institute + user_institute_memberships for users
 * whose center came from onboarding_completed billing_events but who have no
 * membership row yet.
 *
 * Requires env vars (same as production):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage (load .env.local automatically via dotenv):
 *   node --env-file=.env.local scripts/backfill-institute-memberships.mjs
 *
 * Or without dotenv:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-institute-memberships.mjs
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// normalizeInstituteName — imported logic from app/lib/camino/instituteNormalize.ts
// This file cannot use tsx/import chains due to 'server-only' in institutePace.ts.
// The function below MUST be kept identical to instituteNormalize.ts.
// If you change normalizeInstituteName there, change it here too.
// ---------------------------------------------------------------------------
const PLACEHOLDER_SCHOOL_NAMES = new Set([
  'mi centro no aparece',
  'sin centro',
  'no aparece',
])

const STRIP_PREFIXES = [
  'centro educativo',
  'instituto',
  'colegio',
  'ceips',
  'i e s',
  'ies',
  'cpc',
  'cp',
]

function normalizeInstituteName(value) {
  const base = (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  for (const prefix of STRIP_PREFIXES) {
    if (base === prefix) break
    if (base.startsWith(prefix + ' ')) {
      const stripped = base.slice(prefix.length + 1).trim()
      if (stripped.length >= 3) return stripped
      break
    }
  }

  return base
}

function canPersistInstituteName(value) {
  const normalized = normalizeInstituteName(value)
  return normalized.length >= 3 && !PLACEHOLDER_SCHOOL_NAMES.has(normalized)
}

// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

async function main() {
  console.log('backfill-institute-memberships: starting...')

  // 1. Get the most recent onboarding_completed event per user that has a school_name.
  const { data: events, error: eventsError } = await db
    .from('billing_events')
    .select('user_id, payload, created_at')
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })

  if (eventsError) throw new Error(`billing_events query failed: ${eventsError.message}`)

  // Deduplicate: keep only the most recent event per user (already sorted desc).
  const latestByUser = new Map()
  for (const ev of events ?? []) {
    if (!latestByUser.has(ev.user_id)) latestByUser.set(ev.user_id, ev)
  }

  // 2. Filter users with a persistable school_name.
  const candidates = []
  for (const [userId, ev] of latestByUser) {
    const payload = ev.payload ?? {}
    const schoolName = payload.school_name ?? payload.schoolName ?? null
    const community = payload.community ?? 'Otra'
    if (canPersistInstituteName(schoolName)) {
      candidates.push({ userId, schoolName, community })
    }
  }

  console.log(`Found ${latestByUser.size} users with onboarding_completed; ${candidates.length} with persistable school.`)

  // 3. Check which users already have a membership.
  const allUserIds = candidates.map(c => c.userId)
  const { data: existingMemberships, error: membershipQueryError } = await db
    .from('user_institute_memberships')
    .select('user_id')
    .in('user_id', allUserIds)

  if (membershipQueryError) throw new Error(`membership query failed: ${membershipQueryError.message}`)

  const alreadyHasMembership = new Set((existingMemberships ?? []).map(m => m.user_id))

  const toProcess = candidates.filter(c => !alreadyHasMembership.has(c.userId))
  const skipped = candidates.length - toProcess.length

  console.log(`Skipping ${skipped} users who already have a membership. Processing ${toProcess.length}.`)

  let membershipsCreated = 0
  let errors = 0

  for (const { userId, schoolName, community } of toProcess) {
    try {
      const name = schoolName.trim().slice(0, 160)
      const comm = community.trim().slice(0, 80) || 'Otra'
      const normalizedName = normalizeInstituteName(name)

      // 4. Find or create institute (unique on community + normalized_name).
      const { data: existing } = await db
        .from('institutes')
        .select('id, community')
        .eq('community', comm)
        .eq('normalized_name', normalizedName)
        .maybeSingle()

      let instituteId
      if (existing) {
        instituteId = existing.id
      } else {
        const { data: inserted, error: insertErr } = await db
          .from('institutes')
          .insert({
            community: comm,
            name,
            normalized_name: normalizedName,
            source: 'manual',
            verified: false,
            created_by: userId,
          })
          .select('id')
          .single()

        if (insertErr) {
          // Race condition: another insert may have won the unique constraint.
          // Retry the lookup.
          const { data: retry } = await db
            .from('institutes')
            .select('id')
            .eq('community', comm)
            .eq('normalized_name', normalizedName)
            .maybeSingle()

          if (!retry) throw new Error(`institute insert failed: ${insertErr.message}`)
          instituteId = retry.id
        } else {
          instituteId = inserted.id
        }
      }

      // 5. Create membership only if not already present (ON CONFLICT DO NOTHING via upsert ignoreDuplicates).
      const { error: upsertErr } = await db
        .from('user_institute_memberships')
        .upsert({
          user_id: userId,
          institute_id: instituteId,
          community: comm,
          source: 'onboarding',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id', ignoreDuplicates: true })

      if (upsertErr) throw new Error(`membership upsert failed: ${upsertErr.message}`)

      membershipsCreated++
      console.log(`  ✓ ${userId.slice(0, 8)}… → "${name}" (${comm})`)
    } catch (err) {
      errors++
      console.error(`  ✗ ${userId.slice(0, 8)}…: ${err.message}`)
    }
  }

  console.log(`\nDone. ${membershipsCreated} memberships created, ${skipped} skipped (already had one), ${errors} errors.`)
}

main().catch(err => { console.error(err); process.exit(1) })
