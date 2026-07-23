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
// Normalization — mirrors app/lib/camino/instituteNormalize.ts (cannot import
// due to 'server-only' in institutePace.ts; keep in sync manually).
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

/**
 * New (canonical) normalization: lowercase + remove diacritics + collapse
 * punctuation + strip known school-type prefixes.
 * This is the form we want going forward.
 */
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

/**
 * Legacy normalization (Phase 1, before prefix stripping was added).
 * Institutes created before this backfill have normalized_name computed by
 * this function, NOT the new one above.
 */
function normalizeInstituteNameLegacy(value) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
      const normalizedNameNew = normalizeInstituteName(name)      // new canonical (prefix-stripped)
      const normalizedNameLegacy = normalizeInstituteNameLegacy(name)  // old form (no strip)
      const formsAreIdentical = normalizedNameNew === normalizedNameLegacy

      // 4. Find or create institute, tolerating both legacy and new normalized_name.
      //    Institutes created before this backfill have the legacy form in the DB.
      //    We look for either form so we don't create duplicates.

      // 4a. Try the new canonical form first.
      let { data: existing } = await db
        .from('institutes')
        .select('id, normalized_name')
        .eq('community', comm)
        .eq('normalized_name', normalizedNameNew)
        .maybeSingle()

      let foundByLegacy = false
      // 4b. If not found and the two forms differ, try the legacy form.
      if (!existing && !formsAreIdentical) {
        const { data: legacyMatch } = await db
          .from('institutes')
          .select('id, normalized_name')
          .eq('community', comm)
          .eq('normalized_name', normalizedNameLegacy)
          .maybeSingle()
        if (legacyMatch) {
          existing = legacyMatch
          foundByLegacy = true
        }
      }

      let instituteId
      if (existing) {
        instituteId = existing.id
        // 4c. If we matched on the legacy form, migrate the row to the new canonical
        //     normalized_name so future lookups use the canonical form.
        if (foundByLegacy) {
          const { error: updateErr } = await db
            .from('institutes')
            .update({ normalized_name: normalizedNameNew })
            .eq('id', instituteId)
          if (updateErr) {
            // The new form might already exist (another row). Don't abort — just log.
            console.warn(`    [warn] could not migrate normalized_name for ${instituteId}: ${updateErr.message}`)
          } else {
            console.log(`    [migrated] ${normalizedNameLegacy} → ${normalizedNameNew}`)
          }
        }
      } else {
        // 4d. No existing institute in either form — create with the new canonical name.
        const { data: inserted, error: insertErr } = await db
          .from('institutes')
          .insert({
            community: comm,
            name,
            normalized_name: normalizedNameNew,
            source: 'manual',
            verified: false,
            created_by: userId,
          })
          .select('id')
          .single()

        if (insertErr) {
          // Race condition: another insert won the unique constraint. Retry lookup.
          const { data: retry } = await db
            .from('institutes')
            .select('id')
            .eq('community', comm)
            .eq('normalized_name', normalizedNameNew)
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
