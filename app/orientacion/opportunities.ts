export const NEAR_THRESHOLD = 0.50

export type OpportunityCategory = 'above' | 'close' | 'improve' | 'unavailable'

export type OpportunityCandidate = {
  id: string
  degreeId?: string | null
  universityId?: string | null
  degree: string
  university: string
  referenceScore: number | null
}

export type SavedOpportunityTarget = {
  degreeId?: string | null
  universityId?: string | null
  degree: string
  university: string
} | null

export function classifyOpportunity(estimatedScore: number, referenceScore: number | null): OpportunityCategory {
  if (referenceScore == null || !Number.isFinite(referenceScore)) return 'unavailable'
  const missing = referenceScore - estimatedScore
  if (missing <= 0) return 'above'
  if (missing <= NEAR_THRESHOLD + Number.EPSILON * 10) return 'close'
  return 'improve'
}

export function opportunityDifference(estimatedScore: number, referenceScore: number | null) {
  return referenceScore == null || !Number.isFinite(referenceScore) ? null : estimatedScore - referenceScore
}

export function isSavedOpportunity(candidate: OpportunityCandidate, savedTarget: SavedOpportunityTarget) {
  if (!savedTarget) return false
  if (candidate.degreeId && candidate.universityId && savedTarget.degreeId && savedTarget.universityId) {
    return candidate.degreeId === savedTarget.degreeId && candidate.universityId === savedTarget.universityId
  }
  return candidate.degree === savedTarget.degree && candidate.university === savedTarget.university
}

/** Prioriza el objetivo guardado y después la cercanía real a la referencia. */
export function rankOpportunities<T extends OpportunityCandidate>(candidates: T[], estimatedScore: number, savedTarget: SavedOpportunityTarget) {
  return [...candidates].sort((a, b) => {
    const targetPriority = Number(isSavedOpportunity(b, savedTarget)) - Number(isSavedOpportunity(a, savedTarget))
    if (targetPriority) return targetPriority
    const differenceA = opportunityDifference(estimatedScore, a.referenceScore)
    const differenceB = opportunityDifference(estimatedScore, b.referenceScore)
    const distanceA = differenceA == null ? Number.POSITIVE_INFINITY : Math.abs(differenceA)
    const distanceB = differenceB == null ? Number.POSITIVE_INFINITY : Math.abs(differenceB)
    if (distanceA !== distanceB) return distanceA - distanceB
    const universityOrder = a.university.localeCompare(b.university, 'es')
    return universityOrder || a.degree.localeCompare(b.degree, 'es')
  })
}
