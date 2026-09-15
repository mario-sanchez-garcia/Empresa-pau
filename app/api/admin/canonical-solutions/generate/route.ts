import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { findMatematicasIIExercise } from '@/app/lib/canonicalSolutions/exerciseSource'
import { computeCanonicalSolutionSourceHash, generateCanonicalSolutionWithClaude } from '@/app/lib/canonicalSolutions/generate'
import { insertNewCanonicalSolutionVersion } from '@/app/lib/canonicalSolutions/store'

export const dynamic = 'force-dynamic'

// Pieza 2 (pipeline de generación) arranca solo con Matemáticas II — ver
// docs/principio-canonical-solutions-2026-09-05.md, fase 3. Física, y luego
// Historia/Filosofía/Lengua con un proceso distinto, vienen después.
const SUPPORTED_SUBJECTS = ['Matemáticas II'] as const

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

type GenerateBody = {
  exercise_id?: unknown
  subject?: unknown
}

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!isInternalUser(userData.user.email)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  let body: GenerateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const exerciseId = typeof body.exercise_id === 'string' ? body.exercise_id.trim() : ''
  if (!exerciseId) return NextResponse.json({ error: 'Falta exercise_id.' }, { status: 400 })

  const subject = typeof body.subject === 'string' && body.subject.trim() ? body.subject.trim() : 'Matemáticas II'
  if (!SUPPORTED_SUBJECTS.includes(subject as (typeof SUPPORTED_SUBJECTS)[number])) {
    return NextResponse.json({ error: `Asignatura no soportada todavía por el pipeline: ${subject}.` }, { status: 400 })
  }

  const exercise = findMatematicasIIExercise(exerciseId)
  if (!exercise) return NextResponse.json({ error: `Ejercicio no encontrado: ${exerciseId}.` }, { status: 404 })

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicApiKey) return NextResponse.json({ error: 'Falta ANTHROPIC_API_KEY.' }, { status: 500 })

  const sourceHash = computeCanonicalSolutionSourceHash({
    enunciado: exercise.enunciado,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
  })

  const generation = await generateCanonicalSolutionWithClaude(anthropicApiKey, {
    subject: exercise.subject,
    enunciado: exercise.enunciado,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
  })

  if (!generation.ok) {
    console.error('[admin/canonical-solutions/generate] validación fallida, no se inserta', {
      exerciseId,
      reason: generation.reason,
      errors: generation.errors,
      attempts: generation.attempts,
    })
    return NextResponse.json({
      error: 'La generación no cumplió el contrato de formato/LaTeX exigido — no se guardó nada.',
      reason: generation.reason,
      details: generation.errors,
      attempts: generation.attempts,
    }, { status: 422 })
  }

  const db = createServiceClient()
  const insertResult = await insertNewCanonicalSolutionVersion(db, {
    exerciseId,
    subject: exercise.subject,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
    canonicalSolution: generation.data,
    sourceHash,
    generatedBy: userData.user.email ?? userData.user.id,
  })

  if (!insertResult.ok) {
    console.error('[admin/canonical-solutions/generate] insert falló', { exerciseId, error: insertResult.error })
    return NextResponse.json({ error: insertResult.error }, { status: 500 })
  }

  return NextResponse.json({
    id: insertResult.id,
    exerciseId,
    solutionVersion: insertResult.solutionVersion,
    reviewStatus: 'generated',
    attempts: generation.attempts,
    usage: generation.usage,
    canonicalSolution: generation.data,
  })
}
