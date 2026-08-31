import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function bearer(request: NextRequest) {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function GET(request: NextRequest) {
  const db = createServiceClient()
  const token = bearer(request)
  let savedTarget = null

  if (token) {
    const auth = await getAuthUser(token)
    const user = auth?.data.user
    if (user) {
      const { data } = await db.from('perfiles')
        .select('target_degree,target_university,target_admission_score,target_orientation_source_type,target_orientation_updated_at')
        .eq('id', user.id).maybeSingle()
      if (data?.target_degree && data?.target_university && data?.target_admission_score != null) {
        savedTarget = {
          degree: data.target_degree,
          university: data.target_university,
          admissionScore: Number(data.target_admission_score),
          sourceType: data.target_orientation_source_type === 'official' ? 'official' : 'fixture',
          updatedAt: data.target_orientation_updated_at,
        }
      }
    }
  }

  const [universitiesResult, degreesResult, cutoffsResult, weightingsResult, criteriaResult] = await Promise.all([
    db.from('orientation_universities').select('id,name,acronym,community,official_url').eq('active', true),
    db.from('orientation_degrees').select('id,university_id,name,campus,official_url').eq('active', true),
    db.from('orientation_admission_cutoffs').select('id,degree_id,academic_year,cutoff_score,source_url,source_label,verified_at').eq('status', 'verified').not('verified_at', 'is', null).order('academic_year', { ascending: false }),
    db.from('orientation_subject_weightings').select('id,degree_id,academic_year,subject,weighting,source_url,source_label,verified_at').eq('status', 'verified').not('verified_at', 'is', null),
    db.from('orientation_official_criteria').select('id,community,academic_year,subject,criterion_type,official_text,kairo_explanation,source_url,source_document,published_at,verified_at,version').eq('status', 'verified').not('verified_at', 'is', null).limit(50),
  ])

  const catalogError = universitiesResult.error || degreesResult.error || cutoffsResult.error || weightingsResult.error
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
    if (!degree || !university || !cutoff.verified_at) return []
    seenDegrees.add(cutoff.degree_id)
    const subjects = (weightingsResult.data ?? [])
      .filter(row => row.degree_id === degree.id && row.academic_year === cutoff.academic_year && row.verified_at)
      .map(row => ({
        id: row.id, name: row.subject, weighting: Number(row.weighting), defaultGrade: 0, enabled: false,
        source: { type: 'official', label: row.source_label, url: row.source_url, academicYear: row.academic_year, verifiedAt: row.verified_at },
      }))
    return [{
      id: `official:${degree.id}`, degree: degree.name, university: university.name,
      universityAcronym: university.acronym, referenceScore: Number(cutoff.cutoff_score),
      referenceLabel: `Nota de corte histórica · ${cutoff.academic_year}`,
      source: { type: 'official', label: cutoff.source_label, url: cutoff.source_url, academicYear: cutoff.academic_year, verifiedAt: cutoff.verified_at },
      subjects,
    }]
  })

  const criteria = criteriaResult.error ? [] : (criteriaResult.data ?? []).filter(row => row.verified_at).map(row => ({
    id: row.id, community: row.community, academicYear: row.academic_year, subject: row.subject,
    criterionType: row.criterion_type, officialText: row.official_text, kairoExplanation: row.kairo_explanation,
    sourceUrl: row.source_url, sourceDocument: row.source_document, publishedAt: row.published_at,
    verifiedAt: row.verified_at!, version: row.version,
  }))

  return NextResponse.json({ targets, criteria, savedTarget, catalogAvailable: true })
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
  const { error } = await db.from('perfiles').upsert({
    id: user.id,
    target_degree: targetDegree,
    target_university: targetUniversity,
    target_admission_score: targetAdmissionScore,
    target_orientation_source_type: sourceType,
    target_orientation_updated_at: now,
  }, { onConflict: 'id' })
  if (error) return NextResponse.json({ error: 'No se pudo guardar el objetivo. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true, updatedAt: now })
}
