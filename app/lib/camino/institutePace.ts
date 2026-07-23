import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeInstituteName, normalizeInstituteNameLegacy, canPersistInstituteName } from './instituteNormalize'

// Re-export so existing callers that import from institutePace keep working.
export { normalizeInstituteName, canPersistInstituteName }

type InstituteSource = 'manual' | 'official' | 'admin'
type MembershipSource = 'onboarding' | 'manual' | 'admin'

export type InstituteMembership = {
  instituteId: string
  community: string
}

export async function ensureUserInstituteMembership(
  db: SupabaseClient,
  input: {
    userId: string
    community: string
    schoolName?: string | null
    schoolSource?: string | null
    membershipSource?: MembershipSource
  },
): Promise<InstituteMembership | null> {
  if (!canPersistInstituteName(input.schoolName)) return null

  const name = input.schoolName!.trim().slice(0, 160)
  const community = input.community.trim().slice(0, 80) || 'Otra'
  const normalizedNameNew = normalizeInstituteName(name)
  // Institutes created before Fase 1.5 (before prefix stripping was added)
  // have normalized_name stored without stripping — e.g. "ies beatriz galindo"
  // instead of "beatriz galindo". We search by BOTH forms so we never create a
  // duplicate. If the legacy form matches, we migrate the row to the canonical
  // form so future lookups converge.
  const normalizedNameLegacy = normalizeInstituteNameLegacy(name)
  const formsIdentical = normalizedNameNew === normalizedNameLegacy
  const instituteSource: InstituteSource = input.schoolSource === 'dataset' ? 'official' : 'manual'
  const now = new Date().toISOString()

  type InstituteRow = { id: string; community: string }

  // 1. Look up by new canonical form first.
  const { data: byNew, error: byNewError } = await db
    .from('institutes')
    .select('id, community')
    .eq('community', community)
    .eq('normalized_name', normalizedNameNew)
    .maybeSingle()
  if (byNewError) throw byNewError

  let institute = byNew as InstituteRow | null
  let foundByLegacy = false

  // 2. If not found and the two forms differ, try the legacy form.
  if (!institute && !formsIdentical) {
    const { data: byLegacy, error: byLegacyError } = await db
      .from('institutes')
      .select('id, community')
      .eq('community', community)
      .eq('normalized_name', normalizedNameLegacy)
      .maybeSingle()
    if (byLegacyError) throw byLegacyError
    if (byLegacy) {
      institute = byLegacy as InstituteRow
      foundByLegacy = true
    }
  }

  if (institute) {
    // 3. Found an existing institute. If it was stored under the legacy form,
    //    migrate it to the canonical form in-place so future lookups hit step 1.
    //    Best-effort: a concurrent request may already have done this, so we
    //    ignore conflicts rather than throwing.
    if (foundByLegacy) {
      try {
        await db
          .from('institutes')
          .update({ normalized_name: normalizedNameNew })
          .eq('id', institute.id)
      } catch { /* best-effort: concurrent request may have already migrated this row */ }
    }
  } else {
    // 4. No match in either form — create a new institute with the canonical name.
    const { data: insertedInstitute, error: insertError } = await db
      .from('institutes')
      .insert({
        community,
        name,
        normalized_name: normalizedNameNew,
        source: instituteSource,
        verified: instituteSource === 'official',
        created_by: input.userId,
      })
      .select('id, community')
      .single()

    if (insertError) {
      // Race condition: a concurrent request won the unique constraint.
      // Re-run both lookups before giving up.
      const { data: retryNew } = await db
        .from('institutes')
        .select('id, community')
        .eq('community', community)
        .eq('normalized_name', normalizedNameNew)
        .maybeSingle()
      if (retryNew) {
        institute = retryNew as InstituteRow
      } else if (!formsIdentical) {
        const { data: retryLegacy } = await db
          .from('institutes')
          .select('id, community')
          .eq('community', community)
          .eq('normalized_name', normalizedNameLegacy)
          .maybeSingle()
        if (retryLegacy) institute = retryLegacy as InstituteRow
      }
      if (!institute) throw insertError
    } else {
      institute = insertedInstitute as InstituteRow
    }
  }

  const { error: membershipError } = await db
    .from('user_institute_memberships')
    .upsert({
      user_id: input.userId,
      institute_id: institute.id,
      community: institute.community,
      source: input.membershipSource ?? 'onboarding',
      updated_at: now,
    }, { onConflict: 'user_id' })

  if (membershipError) throw membershipError

  return { instituteId: institute.id, community: institute.community }
}

export async function getUserInstituteMembership(
  db: SupabaseClient,
  userId: string,
): Promise<InstituteMembership | null> {
  const { data, error } = await db
    .from('user_institute_memberships')
    .select('institute_id, community')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as { institute_id?: string | null; community?: string | null }
  if (!row.institute_id) return null

  return { instituteId: row.institute_id, community: row.community ?? 'Otra' }
}
