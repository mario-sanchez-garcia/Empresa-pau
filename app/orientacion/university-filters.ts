import type { OrientationTarget } from './data.ts'
import { buildCatalogSearchIndex, normalizeCatalogSearch, searchOrientationTargets, type CatalogSearchIndex } from './catalog.ts'
import { classifyOpportunity, type OpportunityCategory } from './opportunities.ts'

export type ReferenceBand = 'all' | 'up-to-8' | '8-10' | '10-12' | '12-13' | '13-plus'
export type SituationFilter = 'all' | Exclude<OpportunityCategory, 'unavailable'>

export type UniversityExplorerFilters = {
  search: string
  universityId: string
  referenceBand: ReferenceBand
  situation: SituationFilter
  subjectCode: string
}

export function matchesReferenceBand(score: number, band: ReferenceBand) {
  if (band === 'all') return true
  if (band === 'up-to-8') return score <= 8
  if (band === '8-10') return score > 8 && score <= 10
  if (band === '10-12') return score > 10 && score <= 12
  if (band === '12-13') return score > 12 && score < 13
  return score >= 13
}

export function filterUniversityExplorerIndex(index: CatalogSearchIndex, filters: UniversityExplorerFilters, estimatedScore: number | null) {
  const searched = searchOrientationTargets(index, filters.search, filters.universityId)
  const filtered = searched.filter(target =>
    matchesReferenceBand(target.referenceScore, filters.referenceBand)
    && (estimatedScore === null || filters.situation === 'all' || classifyOpportunity(estimatedScore, target.referenceScore) === filters.situation)
    && (!filters.subjectCode || target.subjects.some(subject => subject.subjectCode === filters.subjectCode && subject.weighting === 0.2))
  )
  if (normalizeCatalogSearch(filters.search)) return filtered
  if (estimatedScore === null) return filtered.sort((a, b) => a.degree.localeCompare(b.degree, 'es') || a.university.localeCompare(b.university, 'es'))
  return filtered.sort((a, b) => Math.abs(a.referenceScore - estimatedScore) - Math.abs(b.referenceScore - estimatedScore)
    || a.degree.localeCompare(b.degree, 'es')
    || a.university.localeCompare(b.university, 'es'))
}

export function filterUniversityExplorer(targets: OrientationTarget[], filters: UniversityExplorerFilters, estimatedScore: number | null) {
  return filterUniversityExplorerIndex(buildCatalogSearchIndex(targets), filters, estimatedScore)
}
