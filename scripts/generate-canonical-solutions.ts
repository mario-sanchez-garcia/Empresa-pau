// Pieza 2 — pipeline batch de canonical_solutions, arranque acotado a los 30
// ejercicios de Matemáticas II más corregidos (ver docs/principio-canonical-
// solutions-2026-09-05.md y docs/consulta-top-ejercicios-mate2-2026-09-06.sql,
// cuya lógica de conteo replica este script contra la tabla real en vez de
// contra una copia de la consulta en SQL suelto).
//
// Uso:
//   node --env-file=.env.local --experimental-strip-types scripts/generate-canonical-solutions.ts
//
// Requiere en el entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// ANTHROPIC_API_KEY.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { findMatematicasIIExercise } from '../app/lib/canonicalSolutions/exerciseSource.ts'
import { computeCanonicalSolutionSourceHash, generateCanonicalSolutionWithClaude } from '../app/lib/canonicalSolutions/generate.ts'
import { insertNewCanonicalSolutionVersion } from '../app/lib/canonicalSolutions/store.ts'

const GENERATED_BY = 'batch:generate-canonical-solutions'
const SUBJECT = 'Matemáticas II'
const TOP_N = 30
// Antes de esta fecha la mayoría de filas no tenían exerciseId en metadata
// (ver hallazgo documentado el 5 de septiembre de 2026) — contar desde antes
// saldría corto, no por falta de tráfico real sino por falta del campo.
const COUNT_SINCE = '2026-09-05T00:00:00.000Z'

type AiUsageRow = {
  metadata: { exerciseId?: string | null; subject?: string | null } | null
}

async function getTopMatematicasIIExerciseIds(db: SupabaseClient): Promise<{ exerciseId: string; timesCorregido: number }[]> {
  const { data, error } = await db
    .from('ai_usage_events')
    .select('metadata')
    .eq('status', 'success')
    .eq('metadata->>subject', SUBJECT)
    .not('metadata->>exerciseId', 'is', null)
    .gte('created_at', COUNT_SINCE)

  if (error) throw new Error(`No se pudo leer ai_usage_events: ${error.message}`)

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as AiUsageRow[]) {
    const exerciseId = row.metadata?.exerciseId
    if (!exerciseId) continue
    counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([exerciseId, timesCorregido]) => ({ exerciseId, timesCorregido }))
    .sort((a, b) => b.timesCorregido - a.timesCorregido)
    .slice(0, TOP_N)
}

async function generateOne(db: SupabaseClient, apiKey: string, exerciseId: string) {
  const exercise = findMatematicasIIExercise(exerciseId)
  if (!exercise) {
    console.warn(`[skip] ${exerciseId}: no encontrado en el banco de Matemáticas II`)
    return { exerciseId, ok: false, reason: 'exercise_not_found' as const }
  }

  const sourceHash = computeCanonicalSolutionSourceHash({
    enunciado: exercise.enunciado,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
  })

  const generation = await generateCanonicalSolutionWithClaude(apiKey, {
    subject: exercise.subject,
    enunciado: exercise.enunciado,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
  })

  if (!generation.ok) {
    console.error(`[fail] ${exerciseId}: ${generation.reason} — ${generation.errors.join(', ')} (intentos: ${generation.attempts})`)
    return { exerciseId, ok: false, reason: generation.reason as string }
  }

  const insertResult = await insertNewCanonicalSolutionVersion(db, {
    exerciseId,
    subject: exercise.subject,
    officialSolution: exercise.officialSolution,
    rubric: exercise.rubric,
    canonicalSolution: generation.data,
    sourceHash,
    generatedBy: GENERATED_BY,
  })

  if (!insertResult.ok) {
    console.error(`[fail] ${exerciseId}: insert falló — ${insertResult.error}`)
    return { exerciseId, ok: false, reason: 'insert_failed' as const }
  }

  console.log(`[ok] ${exerciseId}: fila ${insertResult.id}, solution_version ${insertResult.solutionVersion}`)
  return { exerciseId, ok: true, id: insertResult.id, solutionVersion: insertResult.solutionVersion }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!url || !serviceKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.')
    process.exit(1)
  }
  if (!apiKey) {
    console.error('Falta ANTHROPIC_API_KEY en el entorno.')
    process.exit(1)
  }

  const db: SupabaseClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const top = await getTopMatematicasIIExerciseIds(db)
  if (top.length === 0) {
    console.log(`Sin ejercicios de ${SUBJECT} con exerciseId registrado en ai_usage_events desde ${COUNT_SINCE}. Nada que generar.`)
    return
  }

  console.log(`${top.length} ejercicio(s) de ${SUBJECT} a procesar (de un objetivo de ${TOP_N}, limitado por el tráfico real disponible):`)
  for (const { exerciseId, timesCorregido } of top) console.log(`  - ${exerciseId} (${timesCorregido} corrección/es)`)

  const results: Awaited<ReturnType<typeof generateOne>>[] = []
  for (const { exerciseId } of top) {
    try {
      results.push(await generateOne(db, apiKey, exerciseId))
    } catch (error) {
      // Un fallo por ejercicio no debe abortar el resto del lote.
      console.error(`[fail] ${exerciseId}: excepción inesperada — ${error instanceof Error ? error.message : String(error)}`)
      results.push({ exerciseId, ok: false, reason: 'unexpected_error' })
    }
  }

  const okCount = results.filter(r => r.ok).length
  console.log(`\nHecho: ${okCount}/${results.length} generadas y guardadas (review_status='generated', pendientes de revisión humana).`)
}

main().catch(error => {
  console.error('Fallo no controlado:', error)
  process.exit(1)
})
