import type { AdmissionSubject, OrientationTarget, SavedOrientationTarget } from './data'

const UNIVERSITY_ALIASES: Record<string, string[]> = {
  UAH: ['uah', 'alcala', 'universidad de alcala'],
  UAM: ['uam', 'autonoma', 'universidad autonoma', 'universidad autonoma de madrid'],
  UC3M: ['uc3m', 'carlos iii', 'universidad carlos iii', 'universidad carlos iii de madrid'],
  UCM: ['ucm', 'complutense', 'universidad complutense', 'universidad complutense de madrid'],
  UPM: ['upm', 'politecnica', 'universidad politecnica', 'universidad politecnica de madrid'],
  URJC: ['urjc', 'rey juan carlos', 'universidad rey juan carlos'],
  UB: ['ub', 'universitat de barcelona', 'universidad de barcelona'],
  UAB: ['uab', 'autonoma de barcelona', 'universitat autonoma de barcelona', 'universidad autonoma de barcelona'],
  UPC: ['upc', 'politecnica de catalunya', 'politecnica de cataluna', 'universitat politecnica de catalunya'],
  UPF: ['upf', 'pompeu fabra', 'universitat pompeu fabra'],
  UdL: ['udl', 'universitat de lleida', 'universidad de lleida'],
  UdG: ['udg', 'universitat de girona', 'universidad de girona'],
  URV: ['urv', 'rovira i virgili', 'universitat rovira i virgili'],
  'UVic-UCC': ['uvic', 'uvic ucc', 'universitat de vic', 'universidad de vic'],
}

export function normalizeCatalogSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

type IndexedTarget = {
  target: OrientationTarget
  degree: string
  degreeWords: string[]
  university: string
  acronym: string
}

export type CatalogSearchIndex = IndexedTarget[]

export function buildCatalogSearchIndex(targets: OrientationTarget[]): CatalogSearchIndex {
  return targets.map(target => {
    const degree = normalizeCatalogSearch(target.degree)
    return {
      target,
      degree,
      degreeWords: degree.split(' ').filter(Boolean),
      university: normalizeCatalogSearch(target.university),
      acronym: normalizeCatalogSearch(target.universityAcronym ?? ''),
    }
  })
}

function detectUniversityAlias(query: string) {
  const padded = ` ${query} `
  const matches = Object.entries(UNIVERSITY_ALIASES)
    .flatMap(([code, aliases]) => aliases.map(alias => ({ code, alias: normalizeCatalogSearch(alias) })))
    .filter(({ alias }) => padded.includes(` ${alias} `))
    .sort((a, b) => b.alias.length - a.alias.length)
  const match = matches[0]
  if (!match) return null
  return {
    code: match.code,
    degreeQuery: normalizeCatalogSearch(padded.replace(` ${match.alias} `, ' ')),
  }
}

function scoreDegree(entry: IndexedTarget, degreeQuery: string) {
  if (!degreeQuery) return 1
  if (entry.degree === degreeQuery) return 500
  if (entry.degree.startsWith(degreeQuery)) return 400
  const tokens = degreeQuery.split(' ').filter(Boolean)
  if (tokens.every(token => entry.degreeWords.includes(token))) return 350
  if (tokens.every(token => entry.degreeWords.some(word => word.startsWith(token)))) return 300
  if (entry.degree.includes(degreeQuery)) return 250
  if (tokens.every(token => entry.degreeWords.some(word => word.includes(token)))) return 200
  if (tokens.some(token => token.length >= 3 && entry.degreeWords.some(word => word.startsWith(token) || word.includes(token)))) return 100
  return 0
}

export function searchOrientationTargets(index: CatalogSearchIndex, search: string, universityId = '') {
  const query = normalizeCatalogSearch(search)
  const inferredUniversity = detectUniversityAlias(query)
  const degreeQuery = inferredUniversity?.degreeQuery ?? query

  return index
    .filter(entry => !universityId || entry.target.universityId === universityId)
    .filter(entry => !inferredUniversity || entry.acronym === normalizeCatalogSearch(inferredUniversity.code))
    .map(entry => ({ entry, score: scoreDegree(entry, degreeQuery) + (inferredUniversity ? 25 : 0) }))
    .filter(result => !query || result.score > (inferredUniversity ? 25 : 0))
    .sort((a, b) => b.score - a.score
      || a.entry.target.degree.localeCompare(b.entry.target.degree, 'es')
      || a.entry.target.university.localeCompare(b.entry.target.university, 'es'))
    .map(result => result.entry.target)
}

export function filterOrientationTargets(targets: OrientationTarget[], search: string, universityId = '') {
  return searchOrientationTargets(buildCatalogSearchIndex(targets), search, universityId)
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

export function availableCatalogTargets(official: OrientationTarget[], fixtures: OrientationTarget[], allowFixtures = true) {
  if (official.length > 0) return official
  return allowFixtures ? fixtures : []
}
