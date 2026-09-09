import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { digestExamCorrection, isValidExamHistoryId, verifyExamXpGrant } from '@/app/lib/camino/examXpGrant'

export const dynamic = 'force-dynamic'

const OPTIONAL_FIELDS = ['why_it_works', 'why_it_works_context', 'detected_concepts', 'curriculum_source_ids'] as const

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const historyId = isValidExamHistoryId(body.historyId) ? body.historyId : null
  const xpGrant = typeof body.xpGrant === 'string' ? body.xpGrant : null
  const source = isRecord(body.payload) ? body.payload : null
  const score = finiteNumber(source?.nota)
  const maxScore = finiteNumber(source?.nota_maxima)
  if (!historyId || !source || score == null || maxScore == null || maxScore <= 0 || maxScore > 10) {
    return NextResponse.json({ error: 'La corrección no contiene una nota válida.' }, { status: 400 })
  }
  const correctionText = typeof source.correccion === 'string' ? source.correccion : ''
  if (!verifyExamXpGrant(xpGrant, {
    historyId,
    userId: auth.user.id,
    score,
    maxScore,
    correctionDigest: digestExamCorrection(correctionText),
  })) {
    return NextResponse.json({ error: 'La corrección no tiene una autorización válida.' }, { status: 403 })
  }

  const repeatedFromId = isValidExamHistoryId(source.repeated_from_id) ? source.repeated_from_id : null
  const db = createServiceClient()
  if (repeatedFromId) {
    const { data: previous, error } = await db
      .from('historial_examenes')
      .select('id')
      .eq('id', repeatedFromId)
      .eq('user_id', auth.user.id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: 'No hemos podido validar el intento anterior.' }, { status: 500 })
    if (!previous) return NextResponse.json({ error: 'El intento anterior no pertenece a tu historial.' }, { status: 400 })
  }

  const payload = {
    id: historyId,
    user_id: auth.user.id,
    asignatura: boundedText(source.asignatura, 120),
    tipo: boundedText(source.tipo, 120),
    año: boundedYear(source.año),
    bloque: nullableText(source.bloque, 300),
    opcion: nullableText(source.opcion, 120),
    nota: score,
    nota_maxima: maxScore,
    enunciado: boundedText(source.enunciado, 6_000),
    respuesta: boundedText(source.respuesta, 4_000),
    correccion: boundedText(source.correccion, 100_000),
    repeated_from_id: repeatedFromId,
    v2_sort_order: finiteInteger(source.v2_sort_order),
    why_it_works: nullableText(source.why_it_works, 50_000),
    why_it_works_context: jsonWithin(source.why_it_works_context, 20_000),
    detected_concepts: stringArray(source.detected_concepts, 40, 200),
    curriculum_source_ids: stringArray(source.curriculum_source_ids, 40, 200),
  }

  if (!payload.asignatura || !payload.correccion) {
    return NextResponse.json({ error: 'Faltan datos de la corrección.' }, { status: 400 })
  }

  let result = await db.from('historial_examenes').insert(payload).select('id').single()
  if (result.error && isMissingOptionalColumn(result.error)) {
    const legacy = { ...payload } as Record<string, unknown>
    for (const field of OPTIONAL_FIELDS) delete legacy[field]
    result = await db.from('historial_examenes').insert(legacy).select('id').single()
  }
  if (result.error || !result.data?.id) {
    console.error('[exam/history] insert_failed', { code: result.error?.code ?? 'unknown' })
    return NextResponse.json({ error: 'No hemos podido guardar la corrección en Historial.' }, { status: 500 })
  }

  return NextResponse.json({ id: result.data.id }, { status: 201 })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function finiteNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

function finiteInteger(value: unknown) {
  const parsed = finiteNumber(value)
  return parsed == null ? null : Math.trunc(parsed)
}

function boundedYear(value: unknown) {
  const year = finiteInteger(value)
  return year != null && year >= 1900 && year <= 2100 ? year : null
}

function boundedText(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function nullableText(value: unknown, max: number) {
  const text = boundedText(value, max)
  return text || null
}

function stringArray(value: unknown, maxItems: number, maxChars: number) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').slice(0, maxItems).map(item => item.slice(0, maxChars))
    : []
}

function jsonWithin(value: unknown, maxChars: number) {
  if (value == null) return null
  try {
    return JSON.stringify(value).length <= maxChars ? value : null
  } catch {
    return null
  }
}

function isMissingOptionalColumn(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ''
  return error?.code === 'PGRST204' && OPTIONAL_FIELDS.some(field => message.includes(field))
}
