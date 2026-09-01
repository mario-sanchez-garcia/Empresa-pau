import type { AdmissionSubject, OrientationTarget, SavedOrientationTarget } from './data'

export function normalizeCatalogSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}

export function filterOrientationTargets(targets: OrientationTarget[], search: string, universityId = '') {
  const query = normalizeCatalogSearch(search)
  return targets.filter(target =>
    (!universityId || target.universityId === universityId)
    && (!query || normalizeCatalogSearch(`${target.degree} ${target.university} ${target.universityAcronym ?? ''}`).includes(query))
  )
}

/** Preserve a student's inputs by official subject code when the selected degree changes. */
export function mergeSubjectInputs(next: AdmissionSubject[], previous: AdmissionSubject[]) {
  const inputs = new Map(previous.map(subject => [subject.subjectCode, subject]))
  return next.map(subject => {
    const existing = inputs.get(subject.subjectCode)
    return existing ? { ...subject, defaultGrade: existing.defaultGrade, enabled: existing.enabled } : { ...subject }
  })
}

export function findSavedTarget(targets: OrientationTarget[], saved: SavedOrientationTarget | null) {
  if (!saved) return null
  if (saved.degreeId && saved.universityId) {
    const stableMatch = targets.find(target => target.degreeId === saved.degreeId && target.universityId === saved.universityId)
    if (stableMatch) return stableMatch
  }
  return targets.find(target =>
    target.degree === saved.degree && target.university === saved.university && target.source.type === saved.sourceType
  ) ?? null
}

export function availableCatalogTargets(official: OrientationTarget[], fixtures: OrientationTarget[]) {
  return official.length > 0 ? official : fixtures
}
