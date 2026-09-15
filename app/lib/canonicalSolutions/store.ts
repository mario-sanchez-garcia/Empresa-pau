import type { SupabaseClient } from '@supabase/supabase-js'
import type { CanonicalSolutionJson } from './generate.ts'

// Asignaturas donde la corrección oficial es un esquema de puntuación, no una
// solución objetiva (Matemáticas/Física sí lo son): "canonical" ahí implica
// más juicio editorial, así que necesitan un proceso de revisión más
// cuidadoso antes de publicar — ver docs/principio-canonical-solutions-2026-
// 09-05.md, "Las cuatro trampas reales" #1. Punto de extensión para cuando se
// aborde ese proceso; NO se activa en esta tarea (Pieza 2 solo cubre
// Matemáticas II).
export const SUBJECTS_REQUIRING_EXTRA_REVIEW = [
  'Historia de España',
  'Historia de la Filosofía',
  'Lengua Castellana y Literatura',
] as const

export type InsertCanonicalSolutionInput = {
  exerciseId: string
  subject: string
  officialSolution: string | null
  rubric: string | null
  language?: string
  canonicalSolution: CanonicalSolutionJson
  sourceHash: string
  generatedBy: string
}

export type InsertCanonicalSolutionResult =
  | { ok: true; id: string; solutionVersion: number }
  | { ok: false; error: string }

// Nunca actualiza una fila existente: siempre inserta una versión nueva
// (solution_version = máxima existente + 1 para ese exercise_id+language).
// Así una fila published nunca se sobreescribe, y ejecutar el pipeline dos
// veces sobre el mismo ejercicio crea dos filas en vez de pisar la primera.
export async function insertNewCanonicalSolutionVersion(
  db: SupabaseClient,
  input: InsertCanonicalSolutionInput
): Promise<InsertCanonicalSolutionResult> {
  const language = input.language ?? 'es'

  const { data: existingRows, error: readError } = await db
    .from('canonical_solutions')
    .select('solution_version')
    .eq('exercise_id', input.exerciseId)
    .eq('language', language)
    .order('solution_version', { ascending: false })
    .limit(1)

  if (readError) return { ok: false, error: readError.message }

  const nextVersion = (existingRows?.[0]?.solution_version ?? 0) + 1
  const now = new Date().toISOString()

  const { data: inserted, error: insertError } = await db
    .from('canonical_solutions')
    .insert({
      exercise_id: input.exerciseId,
      subject: input.subject,
      official_solution: input.officialSolution,
      canonical_solution: input.canonicalSolution,
      solution_version: nextVersion,
      rubric_version: input.rubric,
      language,
      review_status: 'generated',
      source_hash: input.sourceHash,
      generated_by: input.generatedBy,
      generated_at: now,
    })
    .select('id, solution_version')
    .single()

  if (insertError) return { ok: false, error: insertError.message }
  return { ok: true, id: inserted.id, solutionVersion: inserted.solution_version }
}
