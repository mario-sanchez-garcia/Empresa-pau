import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'
const CATALOG_YEAR = '2026-2027'
const WEIGHTING_PAGE_SIZE = 1000
const WEIGHTING_MAX_PAGES = 6

function bearer(request: NextRequest) {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function GET(request: NextRequest) {
  const db = createServiceClient()
  const token = bearer(request)
  let savedTarget = null

  if (token) {
    const auth = await getAuthUser(token)
    const user = auth?.data.user
    if (user) {
      let profileResult = await db.from('perfiles')
        .select('target_degree_id,target_university_id,target_degree,target_university,target_admission_score,target_orientation_source_type,target_orientation_updated_at')
        .eq('id', user.id).maybeSingle()
      if (profileResult.error) {
        profileResult = await db.from('perfiles')
          .select('target_degree,target_university,target_admission_score,target_orientation_source_type,target_orientation_updated_at')
          .eq('id', user.id).maybeSingle()
      }
      const data = profileResult.data as typeof profileResult.data & { target_degree_id?: string | null; target_university_id?: string | null }
      if (data?.target_degree && data?.target_university && data?.target_admission_score != null) {
        savedTarget = {
          degreeId: data.target_degree_id ?? null,
          universityId: data.target_university_id ?? null,
          degree: data.target_degree,
          university: data.target_university,
          admissionScore: Number(data.target_admission_score),
          sourceType: data.target_orientation_source_type === 'official' ? 'official' : 'fixture',
          updatedAt: data.target_orientation_updated_at,
        }
      }
    }
  }

  const weightingRequests = Array.from({ length: WEIGHTING_MAX_PAGES }, (_, page) =>
    db.from('orientation_subject_weightings')
      .select('id,degree_id,academic_year,subject,subject_code,official_subject_name,weighting,rule_note,source_url,source_label,source_document,verified_at')
      .eq('academic_year', CATALOG_YEAR).eq('status', 'verified').eq('source_type', 'official')
      .not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '')
      .order('id').range(page * WEIGHTING_PAGE_SIZE, (page + 1) * WEIGHTING_PAGE_SIZE - 1)
  )
  const [universitiesResult, degreesResult, cutoffsResult, weightingPages, criteriaResult] = await Promise.all([
    db.from('orientation_universities').select('id,name,acronym,stable_code,community,official_url').eq('active', true),
    db.from('orientation_degrees').select('id,university_id,name,official_code,stable_code,campus,official_url').eq('active', true),
    db.from('orientation_admission_cutoffs').select('id,degree_id,academic_year,access_group,admission_round,cutoff_score,source_url,source_label,source_document,verified_at').eq('academic_year', CATALOG_YEAR).eq('admission_round', 'grupo_1_ordinaria').eq('status', 'verified').eq('source_type', 'official').not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '').order('academic_year', { ascending: false }),
    Promise.all(weightingRequests),
    db.from('orientation_official_criteria').select('id,community,academic_year,subject,criterion_type,official_text,kairo_explanation,source_url,source_document,published_at,verified_at,version').eq('status', 'verified').not('verified_at', 'is', null).neq('source_url', '').limit(50),
  ])

  const weightingError = weightingPages.find(result => result.error)?.error ?? null
  const weightings = weightingPages.flatMap(result => result.data ?? [])
  const catalogError = universitiesResult.error || degreesResult.error || cutoffsResult.error || weightingError
  if (catalogError) {
    return NextResponse.json({ targets: [], criteria: [], savedTarget, catalogAvailable: false })
  }

  const universities = new Map((universitiesResult.data ?? []).map(row => [row.id, row]))
  const degrees = new Map((degreesResult.data ?? []).map(row => [row.id, row]))
  const seenDegrees = new Set<string>()
  const targets = (cutoffsResult.data ?? []).flatMap(cutoff => {
    if (seenDegrees.has(cutoff.degree_id)) return []
    const degree = degrees.get(cutoff.degree_id)
    const university = degree ? universities.get(degree.university_id) : null
    if (!degree || !university || !cutoff.verified_at || !degree.official_url.trim() || !university.official_url.trim()) return []
    seenDegrees.add(cutoff.degree_id)
    const subjects = weightings
      .filter(row => row.degree_id === degree.id && row.academic_year === cutoff.academic_year && row.verified_at)
      .map(row => ({
        id: row.id, subjectCode: row.subject_code, name: row.official_subject_name || row.subject,
        weighting: Number(row.weighting), defaultGrade: 0, enabled: false, ruleNote: row.rule_note,
        source: { type: 'official', label: 'Comunidad de Madrid', documentLabel: row.source_document, url: row.source_url, academicYear: row.academic_year, verifiedAt: row.verified_at },
      }))
      .sort((a, b) => b.weighting - a.weighting || a.name.localeCompare(b.name, 'es'))
    return [{
      id: `official:${degree.id}`, degreeId: degree.id, universityId: university.id, degreeCode: degree.stable_code, universityCode: university.stable_code,
      degree: degree.name, university: university.name,
      universityAcronym: university.acronym, community: university.community, referenceScore: Number(cutoff.cutoff_score),
      referenceLabel: `Referencia · Grupo 1 ordinaria · ${cutoff.academic_year}`,
      source: { type: 'official', label: 'Comunidad de Madrid', documentLabel: cutoff.source_document, url: cutoff.source_url, academicYear: cutoff.academic_year, verifiedAt: cutoff.verified_at },
      subjects,
    }]
  }).sort((a, b) => a.university.localeCompare(b.university, 'es') || a.degree.localeCompare(b.degree, 'es'))

  const criteria = criteriaResult.error ? [] : (criteriaResult.data ?? []).filter(row => row.verified_at).map(row => ({
    id: row.id, community: row.community, academicYear: row.academic_year, subject: row.subject,
    criterionType: row.criterion_type, officialText: row.official_text, kairoExplanation: row.kairo_explanation,
    sourceUrl: row.source_url, sourceDocument: row.source_document, publishedAt: row.published_at,
    verifiedAt: row.verified_at!, version: row.version,
  }))

  const universityOptions = (universitiesResult.data ?? []).map(row => ({ id: row.id, code: row.stable_code, acronym: row.acronym, name: row.name }))
  return NextResponse.json({ targets, universities: universityOptions, criteria, savedTarget, catalogAvailable: true })
}

export async function POST(request: NextRequest) {
  const token = bearer(request)
  if (!token) return NextResponse.json({ error: 'Inicia sesión para guardar tu objetivo.' }, { status: 401 })
  const auth = await getAuthUser(token)
  const user = auth?.data.user
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Datos no válidos.' }, { status: 400 }) }
  const targetDegree = cleanText(body.target_degree, 180)
  const targetUniversity = cleanText(body.target_university, 220)
  const targetAdmissionScore = Number(body.target_admission_score)
  const sourceType = body.source_type === 'official' ? 'official' : body.source_type === 'fixture' ? 'fixture' : null
  if (!targetDegree || !targetUniversity || !Number.isFinite(targetAdmissionScore) || targetAdmissionScore < 5 || targetAdmissionScore > 14 || !sourceType) {
    return NextResponse.json({ error: 'Objetivo incompleto o no válido.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const db = createServiceClient()
  let degreeId: string | null = null
  let universityId: string | null = null
  let canonicalDegree = targetDegree
  let canonicalUniversity = targetUniversity
  let canonicalScore = targetAdmissionScore

  if (sourceType === 'official') {
    if (!isUuid(body.target_degree_id) || !isUuid(body.target_university_id)) {
      return NextResponse.json({ error: 'El objetivo oficial no tiene identificadores válidos.' }, { status: 400 })
    }
    const degreeResult = await db.from('orientation_degrees').select('id,name,university_id').eq('id', body.target_degree_id).eq('active', true).maybeSingle()
    if (degreeResult.error || !degreeResult.data || degreeResult.data.university_id !== body.target_university_id) {
      return NextResponse.json({ error: 'El grado oficial seleccionado no está disponible.' }, { status: 400 })
    }
    const [universityResult, cutoffResult] = await Promise.all([
      db.from('orientation_universities').select('id,name').eq('id', body.target_university_id).eq('active', true).maybeSingle(),
      db.from('orientation_admission_cutoffs').select('cutoff_score').eq('degree_id', body.target_degree_id).eq('academic_year', CATALOG_YEAR).eq('admission_round', 'grupo_1_ordinaria').eq('status', 'verified').maybeSingle(),
    ])
    if (universityResult.error || cutoffResult.error || !universityResult.data || !cutoffResult.data) {
      return NextResponse.json({ error: 'No se pudo verificar la referencia oficial.' }, { status: 400 })
    }
    degreeId = degreeResult.data.id
    universityId = universityResult.data.id
    canonicalDegree = degreeResult.data.name
    canonicalUniversity = universityResult.data.name
    canonicalScore = Number(cutoffResult.data.cutoff_score)
  }

  const { error } = await db.from('perfiles').upsert({
    id: user.id,
    target_degree_id: degreeId,
    target_university_id: universityId,
    target_degree: canonicalDegree,
    target_university: canonicalUniversity,
    target_admission_score: canonicalScore,
    target_orientation_source_type: sourceType,
    target_orientation_updated_at: now,
  }, { onConflict: 'id' })
  if (error) return NextResponse.json({ error: 'No se pudo guardar el objetivo. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true, updatedAt: now })
}
