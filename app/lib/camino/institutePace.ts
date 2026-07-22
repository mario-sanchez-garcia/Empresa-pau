import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

type InstituteSource = 'manual' | 'official' | 'admin'
type MembershipSource = 'onboarding' | 'manual' | 'admin'

export type InstituteMembership = {
  instituteId: string
  community: string
}

const PLACEHOLDER_SCHOOL_NAMES = new Set([
  'mi centro no aparece',
  'sin centro',
  'no aparece',
])

export function normalizeInstituteName(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function canPersistInstituteName(value?: string | null) {
  const normalized = normalizeInstituteName(value)
  return normalized.length >= 3 && !PLACEHOLDER_SCHOOL_NAMES.has(normalized)
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
  const normalizedName = normalizeInstituteName(name)
  const instituteSource: InstituteSource = input.schoolSource === 'dataset' ? 'official' : 'manual'
  const now = new Date().toISOString()

  const { data: existingInstitute, error: existingError } = await db
    .from('institutes')
    .select('id, community')
    .eq('community', community)
    .eq('normalized_name', normalizedName)
    .maybeSingle()

  if (existingError) throw existingError

  let institute = existingInstitute as { id: string; community: string } | null

  if (!institute) {
    const { data: insertedInstitute, error: insertError } = await db
      .from('institutes')
      .insert({
        community,
        name,
        normalized_name: normalizedName,
        source: instituteSource,
        verified: instituteSource === 'official',
        created_by: input.userId,
      })
      .select('id, community')
      .single()

    if (insertError) throw insertError
    institute = insertedInstitute as { id: string; community: string }
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
