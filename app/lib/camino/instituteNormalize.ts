// Pure normalization utilities — no 'server-only', safe to import from scripts and client components.
// institutePace.ts re-exports from here; backfill scripts and onboarding autocomplete import directly.

export const PLACEHOLDER_SCHOOL_NAMES = new Set([
  'mi centro no aparece',
  'sin centro',
  'no aparece',
])

// Ordered longest-first to avoid shorter prefix shadowing a longer one (e.g. "cp" vs "cpc").
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
 * Canonical normalization for institute names.
 *
 * Steps:
 *  1. Lowercase + remove diacritics + collapse punctuation/spaces
 *  2. Strip known school-type prefixes from the start
 *
 * Prefix-strip rule: if stripping would leave fewer than 3 characters (or an
 * empty string), the prefix is NOT removed — the result would be ambiguous
 * or meaningless (e.g. "IES" alone → keeps "ies"; "Colegio AB" → keeps
 * "colegio ab" because "ab" < 3 chars).
 *
 * Test cases (must all pass):
 *   normalizeInstituteName("IES Beatriz Galindo")          === "beatriz galindo"
 *   normalizeInstituteName("i.e.s. beatriz galindo")       === "beatriz galindo"
 *   normalizeInstituteName("Beatriz Galindo")              === "beatriz galindo"
 *   normalizeInstituteName("Instituto Cervantes")          === "cervantes"
 *   normalizeInstituteName("Colegio San José")             === "san jose"
 *   normalizeInstituteName("Centro Educativo Las Rosas")   === "las rosas"
 *   normalizeInstituteName("IES")                          === "ies"          // stripped result "" < 3 → keep
 *   normalizeInstituteName("Colegio AB")                   === "colegio ab"   // stripped result "ab" < 3 → keep
 *   normalizeInstituteName("CP Artes")                     === "artes"
 *   normalizeInstituteName("CEIPS La Paz")                 === "la paz"
 *   normalizeInstituteName("CPC El Pilar")                 === "el pilar"
 *   normalizeInstituteName("  IES  La  Blanca  ")          === "la blanca"    // extra spaces collapsed
 */
export function normalizeInstituteName(value?: string | null): string {
  const base = (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, ' ')    // replace punctuation/symbols with space
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim()

  for (const prefix of STRIP_PREFIXES) {
    if (base === prefix) {
      // Full match: stripping would leave nothing → keep as-is
      break
    }
    if (base.startsWith(prefix + ' ')) {
      const stripped = base.slice(prefix.length + 1).trim()
      if (stripped.length >= 3) return stripped
      // Stripped result too short — keep original
      break
    }
  }

  return base
}

export function canPersistInstituteName(value?: string | null): boolean {
  const normalized = normalizeInstituteName(value)
  return normalized.length >= 3 && !PLACEHOLDER_SCHOOL_NAMES.has(normalized)
}

/**
 * Legacy normalization used before Fase 1.5 (before prefix stripping was added).
 *
 * Institutes created by onboarding before the Fase 1.5 deploy have
 * normalized_name computed by THIS function — e.g. "ies beatriz galindo"
 * instead of the canonical "beatriz galindo".
 *
 * This function is exported so that ensureUserInstituteMembership and the
 * backfill script can search by BOTH forms before deciding to create a new
 * row, preventing duplicate institutes.
 *
 * Do NOT use this for new writes — always write with normalizeInstituteName.
 */
export function normalizeInstituteNameLegacy(value?: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
