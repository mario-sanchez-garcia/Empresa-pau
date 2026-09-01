import type { AdmissionSubject, OrientationTarget } from './data'

export type OfficialUniversityRow = {
  id: string
  name: string
  acronym: string | null
  stable_code: string | null
  community: string | null
  official_url: string | null
}

export type OfficialDegreeRow = {
  id: string
  university_id: string
  name: string
  stable_code: string | null
  official_url: string | null
}

export type OfficialCutoffRow = {
  degree_id: string
  academic_year: string
  access_group: string | null
  admission_round: string
  cutoff_score: number | string
  source_url: string | null
  source_label: string | null
  source_document: string | null
  source_type: string | null
  verified_at: string | null
}

export type OfficialWeightingRow = {
  id: string
  degree_id: string
  academic_year: string
  subject: string
  subject_code: string | null
  official_subject_name: string | null
  weighting: number | string
  rule_note: string | null
  source_url: string | null
  source_label: string | null
  source_document: string | null
  source_type: string | null
  verified_at: string | null
}

export function collectPaginatedRows<T>(pages: T[][], pageSize: number) {
  const rows = pages.flat()
  const lastPage = pages.at(-1)
  return { rows, complete: !lastPage || lastPage.length < pageSize }
}

function normalizedWeighting(row: OfficialWeightingRow): AdmissionSubject | null {
  const weighting = Number(row.weighting)
  const name = (row.official_subject_name || row.subject).trim()
  const subjectCode = row.subject_code?.trim()
  const sourceUrl = row.source_url?.trim()
  const sourceLabel = row.source_label?.trim()
  if (
    (weighting !== 0.1 && weighting !== 0.2)
    || !name || !subjectCode || !sourceUrl || !sourceLabel || !row.verified_at
    || row.source_type !== 'official'
  ) return null

  return {
    id: row.id,
    subjectCode,
    name,
    weighting,
    defaultGrade: 0,
    enabled: false,
    ruleNote: row.rule_note,
    source: {
      type: 'official',
      label: sourceLabel,
      documentLabel: row.source_document,
      url: sourceUrl,
      academicYear: row.academic_year,
      verifiedAt: row.verified_at,
    },
  }
}

export function buildOfficialTargets({
  universities: universityRows,
  degrees: degreeRows,
  cutoffs,
  weightings,
  academicYear,
}: {
  universities: OfficialUniversityRow[]
  degrees: OfficialDegreeRow[]
  cutoffs: OfficialCutoffRow[]
  weightings: OfficialWeightingRow[]
  academicYear: string
}): OrientationTarget[] {
  const universities = new Map(universityRows.map(row => [row.id, row]))
  const degrees = new Map(degreeRows.map(row => [row.id, row]))
  const weightingsByDegree = new Map<string, AdmissionSubject[]>()

  for (const row of weightings) {
    if (row.academic_year !== academicYear) continue
    const subject = normalizedWeighting(row)
    if (!subject) continue
    const current = weightingsByDegree.get(row.degree_id)
    if (current) current.push(subject)
    else weightingsByDegree.set(row.degree_id, [subject])
  }
  for (const subjects of weightingsByDegree.values()) {
    subjects.sort((a, b) => b.weighting - a.weighting || a.name.localeCompare(b.name, 'es'))
  }

  const seenDegrees = new Set<string>()
  const targets: OrientationTarget[] = []
  for (const cutoff of cutoffs) {
    if (
      seenDegrees.has(cutoff.degree_id)
      || cutoff.academic_year !== academicYear
      || cutoff.admission_round !== 'grupo_1_ordinaria'
      || (cutoff.access_group !== null && cutoff.access_group !== 'grupo_1_ordinaria')
      || cutoff.source_type !== 'official'
      || !cutoff.verified_at
    ) continue

    const degree = degrees.get(cutoff.degree_id)
    const university = degree ? universities.get(degree.university_id) : null
    const sourceUrl = cutoff.source_url?.trim()
    const sourceLabel = cutoff.source_label?.trim()
    const referenceScore = Number(cutoff.cutoff_score)
    if (
      !degree || !university || !sourceUrl || !sourceLabel
      || !degree.official_url?.trim() || !university.official_url?.trim()
      || !Number.isFinite(referenceScore) || referenceScore < 5 || referenceScore > 14
    ) continue

    seenDegrees.add(cutoff.degree_id)
    targets.push({
      id: `official:${degree.id}`,
      degreeId: degree.id,
      universityId: university.id,
      degreeCode: degree.stable_code,
      universityCode: university.stable_code,
      degree: degree.name,
      university: university.name,
      universityAcronym: university.acronym,
      community: university.community,
      referenceScore,
      referenceLabel: `Referencia · Grupo 1 ordinaria · ${cutoff.academic_year}`,
      source: {
        type: 'official',
        label: sourceLabel,
        documentLabel: cutoff.source_document,
        url: sourceUrl,
        academicYear: cutoff.academic_year,
        verifiedAt: cutoff.verified_at,
      },
      subjects: weightingsByDegree.get(degree.id) ?? [],
    })
  }

  return targets.sort((a, b) => a.university.localeCompare(b.university, 'es') || a.degree.localeCompare(b.degree, 'es'))
}
