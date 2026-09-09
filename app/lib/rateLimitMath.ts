export function normalizeRateLimitUnits(value: number | undefined) {
  return Math.max(1, Math.floor(Number.isFinite(value) ? Number(value) : 1))
}

export function wouldExceedAiRateLimit(currentCount: number, units: number, limit: number) {
  return Math.max(0, Math.floor(currentCount)) + normalizeRateLimitUnits(units) > Math.max(0, Math.floor(limit))
}
