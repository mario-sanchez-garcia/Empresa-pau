export type CorrectionOutcome = {
  status: 'failed' | 'partial' | 'completed'
  completedIndexes: number[]
  failedIndexes: number[]
  mayAwardXp: boolean
}

export function normalizeCompletedIndexes(value: unknown, blockCount: number): number[] {
  if (!Array.isArray(value) || !Number.isInteger(blockCount) || blockCount < 1) return []
  return [...new Set(value.filter((index): index is number => Number.isInteger(index) && index >= 0 && index < blockCount))].sort((a, b) => a - b)
}

export function correctionOutcome(genuineBlocks: boolean[]): CorrectionOutcome {
  const completedIndexes = genuineBlocks.flatMap((genuine, index) => genuine ? [index] : [])
  const failedIndexes = genuineBlocks.flatMap((genuine, index) => genuine ? [] : [index])
  return {
    status: completedIndexes.length === 0 ? 'failed' : failedIndexes.length > 0 ? 'partial' : 'completed',
    completedIndexes,
    failedIndexes,
    mayAwardXp: failedIndexes.length === 0 && completedIndexes.length > 0,
  }
}

export function isFreshCorrectionClaim(status: unknown, startedAt: unknown, now = Date.now(), ttlMs = 2 * 60_000) {
  if (status !== 'processing' || typeof startedAt !== 'string') return false
  const timestamp = Date.parse(startedAt)
  return Number.isFinite(timestamp) && now - timestamp >= 0 && now - timestamp < ttlMs
}
