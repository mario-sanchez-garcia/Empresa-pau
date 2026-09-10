// Verified against the linked Supabase Auth configuration during the audit.
export const MIN_PASSWORD_LENGTH = 6

export function isPasswordLongEnough(value: string) {
  return value.length >= MIN_PASSWORD_LENGTH
}
