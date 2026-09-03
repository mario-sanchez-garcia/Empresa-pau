import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'
import { buildOfficialTargets, collectPaginatedRows, type OfficialCutoffRow, type OfficialDegreeRow, type OfficialUniversityRow, type OfficialWeightingRow } from '@/app/orientacion/official-data'
import { COMMUNITY_CONFIG, communityFromSearchParam, normalizeOrientationCommunity, type OrientationCommunity } from '@/app/orientacion/community'

export const dynamic = 'force-dynamic'
const CATALOG_YEAR = '2026-2027'
const WEIGHTING_PAGE_SIZE = 1000
const WEIGHTING_MAX_PAGES = 8

function bearer(request: NextRequest) {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isMissingCommunityColumn(error: { code?: string | null; message?: string | null } | null) {
  return Boolean(error && (error.code === '42703' || error.code === 'PGRST204') && /community/i.test(error.message ?? ''))
}

export async function GET(request: NextRequest) {
  const db = createServiceClient()
  const token = bearer(request)
  let savedTarget = null
  let profileCommunity: OrientationCommunity | null = null

  if (token) {
    const auth = await getAuthUser(token)
    const user = auth?.data.user
    if (user) {
      let profileResult = await db.from('perfiles')
        .select('comunidad,target_degree_id,target_university_id,target_degree,target_university,target_admission_score,target_orientation_source_type,target_orientation_updated_at,target_orientation_community')
        .eq('id', user.id).maybeSingle()
      if (profileResult.error) {
        profileResult = await db.from('perfiles')
          .select('comunidad,target_degree_id,target_university_id,target_degree,target_university,target_admission_score,target_orientation_source_type,target_orientation_updated_at')
          .eq('id', user.id).maybeSingle()
      }
      const data = profileResult.data as typeof profileResult.data & { target_degree_id?: string | null; target_university_id?: string | null; target_orientation_community?: string | null; comunidad?: string | null }
      profileCommunity = normalizeOrientationCommunity(data?.comunidad)
      if (data?.target_degree && data?.target_university && data?.target_admission_score != null) {
        savedTarget = {
          degreeId: data.target_degree_id ?? null,
          universityId: data.target_university_id ?? null,
          degree: data.target_degree,
          university: data.target_university,
          community: normalizeOrientationCommunity(data.target_orientation_community),
          admissionScore: Number(data.target_admission_score),
          sourceType: data.target_orientation_source_type === 'official' ? 'official' : 'fixture',
          updatedAt: data.target_orientation_updated_at,
        }
      }
    }
  }

  const requestedCommunity = communityFromSearchParam(request.nextUrl.searchParams.get('community'))
  const community = requestedCommunity ?? profileCommunity ?? 'Madrid'
  const config = COMMUNITY_CONFIG[community]

  const weightingRequests = Array.from({ length: WEIGHTING_MAX_PAGES }, (_, page) =>
    db.from('orientation_subject_weightings')
      .select('id,degree_id,academic_year,subject,subject_code,official_subject_name,weighting,rule_note,source_url,source_label,source_document,source_type,verified_at')
      .eq('community', config.databaseValue)
      .eq('academic_year', CATALOG_YEAR).eq('status', 'verified').eq('source_type', 'official')
      .not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '')
      .order('id').range(page * WEIGHTING_PAGE_SIZE, (page + 1) * WEIGHTING_PAGE_SIZE - 1)
  )
  const [universitiesResult, initialDegreesResult, initialCutoffsResult, initialWeightingPages, criteriaResult] = await Promise.all([
    db.from('orientation_universities').select('id,name,acronym,stable_code,community,official_url').eq('community', config.databaseValue).eq('active', true),
    db.from('orientation_degrees').select('id,university_id,name,official_code,stable_code,campus,official_url').eq('community', config.databaseValue).eq('active', true),
    db.from('orientation_admission_cutoffs').select('id,degree_id,academic_year,access_group,admission_round,cutoff_score,source_url,source_label,source_document,source_type,verified_at').eq('community', config.databaseValue).eq('academic_year', CATALOG_YEAR).eq('admission_round', config.admissionRound).eq('status', 'verified').eq('source_type', 'official').not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '').order('academic_year', { ascending: false }),
    Promise.all(weightingRequests),
    db.from('orientation_official_criteria').select('id,community,academic_year,subject,criterion_type,official_text,kairo_explanation,source_url,source_document,published_at,verified_at,version').eq('community', config.databaseValue).eq('status', 'verified').not('verified_at', 'is', null).neq('source_url', '').limit(50),
  ])
  let degreesResult = initialDegreesResult
  let cutoffsResult = initialCutoffsResult
  let weightingPages = initialWeightingPages

  // Despliegue tolerante: el código puede llegar unos minutos antes que la
  // migración que desnormaliza community. Madrid sigue disponible leyendo el
  // esquema anterior; los IDs de universidad/grado impiden mezclar territorios.
  const territorialQueryErrors = [degreesResult.error, cutoffsResult.error, ...weightingPages.map(result => result.error)].filter(error => error !== null)
  if (territorialQueryErrors.length > 0 && territorialQueryErrors.every(isMissingCommunityColumn)) {
    const fallbackWeightingRequests = Array.from({ length: WEIGHTING_MAX_PAGES }, (_, page) =>
      db.from('orientation_subject_weightings')
        .select('id,degree_id,academic_year,subject,subject_code,official_subject_name,weighting,rule_note,source_url,source_label,source_document,source_type,verified_at')
        .eq('academic_year', CATALOG_YEAR).eq('status', 'verified').eq('source_type', 'official')
        .not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '')
        .order('id').range(page * WEIGHTING_PAGE_SIZE, (page + 1) * WEIGHTING_PAGE_SIZE - 1)
    )
    ;[degreesResult, cutoffsResult, weightingPages] = await Promise.all([
      db.from('orientation_degrees').select('id,university_id,name,official_code,stable_code,campus,official_url').eq('active', true),
      db.from('orientation_admission_cutoffs').select('id,degree_id,academic_year,access_group,admission_round,cutoff_score,source_url,source_label,source_document,source_type,verified_at').eq('academic_year', CATALOG_YEAR).eq('admission_round', config.admissionRound).eq('status', 'verified').eq('source_type', 'official').not('verified_at', 'is', null).neq('source_url', '').neq('source_label', '').order('academic_year', { ascending: false }),
      Promise.all(fallbackWeightingRequests),
    ])
    const universityIds = new Set((universitiesResult.data ?? []).map(row => row.id))
    const territoryDegrees = (degreesResult.data ?? []).filter(row => universityIds.has(row.university_id))
    const degreeIds = new Set(territoryDegrees.map(row => row.id))
    degreesResult.data = territoryDegrees
    cutoffsResult.data = (cutoffsResult.data ?? []).filter(row => degreeIds.has(row.degree_id))
    for (const result of weightingPages) {
      if (!result.error) result.data = result.data.filter(row => degreeIds.has(row.degree_id))
    }
  }

  const weightingPagination = collectPaginatedRows(weightingPages.map(result => result.data ?? []), WEIGHTING_PAGE_SIZE)
  const weightingError = weightingPages.find(result => result.error)?.error ?? (!weightingPagination.complete ? new Error('Orientation weighting pagination limit reached') : null)
  const weightings = weightingPagination.rows
  const catalogError = universitiesResult.error || degreesResult.error || cutoffsResult.error || weightingError
  if (catalogError) {
    return NextResponse.json({ community, profileCommunity, targets: [], criteria: [], savedTarget, catalogAvailable: false })
  }

  const targets = buildOfficialTargets({
    universities: (universitiesResult.data ?? []) as OfficialUniversityRow[],
    degrees: (degreesResult.data ?? []) as OfficialDegreeRow[],
    cutoffs: (cutoffsResult.data ?? []) as OfficialCutoffRow[],
    weightings: weightings as OfficialWeightingRow[],
    academicYear: CATALOG_YEAR,
    admissionRound: config.admissionRound,
    accessGroup: config.accessGroup,
    referenceLabel: config.referenceLabel,
  })

  const criteria = criteriaResult.error ? [] : (criteriaResult.data ?? []).filter(row => row.verified_at).map(row => ({
    id: row.id, community: row.community, academicYear: row.academic_year, subject: row.subject,
    criterionType: row.criterion_type, officialText: row.official_text, kairoExplanation: row.kairo_explanation,
    sourceUrl: row.source_url, sourceDocument: row.source_document, publishedAt: row.published_at,
    verifiedAt: row.verified_at!, version: row.version,
  }))

  const universityOptions = (universitiesResult.data ?? []).map(row => ({ id: row.id, code: row.stable_code, acronym: row.acronym, name: row.name }))
  return NextResponse.json({ community, profileCommunity, targets, universities: universityOptions, criteria, savedTarget, catalogAvailable: targets.length > 0 })
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
  let canonicalCommunity: OrientationCommunity | null = normalizeOrientationCommunity(body.target_community)

  if (sourceType === 'official') {
    if (!isUuid(body.target_degree_id) || !isUuid(body.target_university_id)) {
      return NextResponse.json({ error: 'El objetivo oficial no tiene identificadores válidos.' }, { status: 400 })
    }
    const degreeResult = await db.from('orientation_degrees').select('id,name,university_id').eq('id', body.target_degree_id).eq('active', true).maybeSingle()
    if (degreeResult.error || !degreeResult.data || degreeResult.data.university_id !== body.target_university_id) {
      return NextResponse.json({ error: 'El grado oficial seleccionado no está disponible.' }, { status: 400 })
    }
    const universityResult = await db.from('orientation_universities').select('id,name,community').eq('id', body.target_university_id).eq('active', true).maybeSingle()
    if (universityResult.error || !universityResult.data) {
      return NextResponse.json({ error: 'No se pudo verificar la referencia oficial.' }, { status: 400 })
    }
    canonicalCommunity = normalizeOrientationCommunity(universityResult.data.community)
    if (!canonicalCommunity) return NextResponse.json({ error: 'La comunidad del objetivo no está disponible.' }, { status: 400 })
    const cutoffResult = await db.from('orientation_admission_cutoffs').select('cutoff_score')
      .eq('degree_id', body.target_degree_id).eq('academic_year', CATALOG_YEAR)
      .eq('admission_round', COMMUNITY_CONFIG[canonicalCommunity].admissionRound)
      .eq('status', 'verified').eq('source_type', 'official').not('verified_at', 'is', null).maybeSingle()
    if (cutoffResult.error || !cutoffResult.data) return NextResponse.json({ error: 'No se pudo verificar la referencia oficial.' }, { status: 400 })
    degreeId = degreeResult.data.id
    universityId = universityResult.data.id
    canonicalDegree = degreeResult.data.name
    canonicalUniversity = universityResult.data.name
    canonicalScore = Number(cutoffResult.data.cutoff_score)
  }

  const profileUpdate = {
    id: user.id,
    target_degree_id: degreeId,
    target_university_id: universityId,
    target_degree: canonicalDegree,
    target_university: canonicalUniversity,
    target_admission_score: canonicalScore,
    target_orientation_source_type: sourceType,
    target_orientation_community: canonicalCommunity ? COMMUNITY_CONFIG[canonicalCommunity].databaseValue : null,
    target_orientation_updated_at: now,
  }
  let { error } = await db.from('perfiles').upsert(profileUpdate, { onConflict: 'id' })
  if (error && canonicalCommunity === 'Madrid' && isMissingCommunityColumn(error) && /target_orientation_community/i.test(error.message)) {
    const legacyProfileUpdate = { ...profileUpdate } as Partial<typeof profileUpdate>
    delete legacyProfileUpdate.target_orientation_community
    ;({ error } = await db.from('perfiles').upsert(legacyProfileUpdate, { onConflict: 'id' }))
  }
  if (error) return NextResponse.json({ error: 'No se pudo guardar el objetivo. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true, updatedAt: now })
}
