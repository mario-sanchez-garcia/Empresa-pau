export type OrientationSourceType = 'fixture' | 'official'
export type OrientationSource = { type: OrientationSourceType; label: string; documentLabel?: string | null; url: string | null; academicYear: string | null; verifiedAt: string | null }
export type AdmissionSubject = { id: string; subjectCode: string; name: string; weighting: 0.1 | 0.2; defaultGrade: number; enabled: boolean; ruleNote?: string | null; source: OrientationSource }
export type OrientationTarget = {
  id: string; degreeId: string | null; universityId: string | null; degreeCode: string | null; universityCode: string | null
  degree: string; university: string; universityAcronym: string | null
  community: string | null; referenceScore: number; referenceLabel: string; source: OrientationSource; subjects: AdmissionSubject[]
}
export type SavedOrientationTarget = { degreeId: string | null; universityId: string | null; degree: string; university: string; admissionScore: number; sourceType: OrientationSourceType; updatedAt: string | null }
export type OfficialCriterion = {
  id: string; community: string; academicYear: string; subject: string; criterionType: string
  officialText: string; kairoExplanation: string | null; sourceUrl: string; sourceDocument: string | null
  publishedAt: string | null; verifiedAt: string; version: string
}

export const FIXTURE_SOURCE: OrientationSource = { type: 'fixture', label: 'Datos de demostración', url: null, academicYear: null, verifiedAt: null }

// Datos exclusivamente visuales. Nunca se mezclan ni se etiquetan como oficiales.
export const ORIENTATION_FIXTURES: OrientationTarget[] = [
  {
    id: 'fixture:psicologia-demo', degreeId: null, universityId: null, degreeCode: null, universityCode: null, degree: 'Psicología', university: 'Universidad de ejemplo · Madrid', universityAcronym: null, community: null,
    referenceScore: 12.12, referenceLabel: 'Referencia de demostración', source: FIXTURE_SOURCE,
    subjects: [
      { id: 'matematicas', subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 7.5, enabled: true, source: FIXTURE_SOURCE },
      { id: 'biologia', subjectCode: 'biologia', name: 'Biología', weighting: 0.2, defaultGrade: 6.5, enabled: true, source: FIXTURE_SOURCE },
      { id: 'quimica', subjectCode: 'quimica', name: 'Química', weighting: 0.2, defaultGrade: 7, enabled: false, source: FIXTURE_SOURCE },
    ],
  },
  {
    id: 'fixture:ingenieria-demo', degreeId: null, universityId: null, degreeCode: null, universityCode: null, degree: 'Ingeniería Informática', university: 'Universidad de ejemplo · Barcelona', universityAcronym: null, community: null,
    referenceScore: 11.46, referenceLabel: 'Referencia de demostración', source: FIXTURE_SOURCE,
    subjects: [
      { id: 'matematicas', subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 8, enabled: true, source: FIXTURE_SOURCE },
      { id: 'fisica', subjectCode: 'fisica', name: 'Física', weighting: 0.2, defaultGrade: 7, enabled: true, source: FIXTURE_SOURCE },
      { id: 'dibujo', subjectCode: 'dibujo-tecnico-ii', name: 'Dibujo Técnico II', weighting: 0.1, defaultGrade: 6.5, enabled: false, source: FIXTURE_SOURCE },
    ],
  },
]
