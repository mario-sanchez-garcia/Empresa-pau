import 'server-only'

export function isInternalUser(email?: string | null) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false

  return getInternalUserEmails().has(normalizedEmail)
}

function getInternalUserEmails() {
  return new Set(
    (process.env.INTERNAL_USER_EMAILS ?? '')
      .split(',')
      .map(normalizeEmail)
      .filter((email): email is string => Boolean(email))
  )
}

function normalizeEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase()
  return normalized || null
}
