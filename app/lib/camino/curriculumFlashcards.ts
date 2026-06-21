import type { SupabaseClient } from '@supabase/supabase-js'

export type CurriculumBlockKey = 'Álgebra' | 'Análisis' | 'Geometría' | 'Probabilidad'

export interface CurriculumFlashcardRow {
  sort_order: number
  order_label: string
  title: string
  concept_latex: string
  alert_title: string | null
  alert_latex: string | null
  worked_case_title: string | null
  worked_case_latex: string | null
}

const BLOCK_PATTERNS: [RegExp, CurriculumBlockKey][] = [
  [/^Álgebra/i, 'Álgebra'],
  [/^Análisis/i, 'Análisis'],
  [/^Geometría/i, 'Geometría'],
  [/^Estadística|^Probabilidad/i, 'Probabilidad'],
]

// Extracts the curriculum block_key from a week.mates description string.
// Returns null when the week is a repaso/simulacro/mixed (no single block maps).
export function extractBlockKey(matesDescription: string): CurriculumBlockKey | null {
  for (const [pattern, key] of BLOCK_PATTERNS) {
    if (pattern.test(matesDescription)) return key
  }
  return null
}

const SELECT_COLS = [
  'sort_order', 'order_label', 'title', 'concept_latex',
  'alert_title', 'alert_latex', 'worked_case_title', 'worked_case_latex',
].join(', ')

export async function fetchCurriculumFlashcards(
  client: SupabaseClient,
  blockKey: CurriculumBlockKey,
  limit = 5,
): Promise<CurriculumFlashcardRow[]> {
  const { data, error } = await client
    .from('curriculum_flashcards')
    .select(SELECT_COLS)
    .eq('subject', 'mates')
    .eq('region', 'ambas')
    .eq('block_key', blockKey)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (error || !data) return []
  return data as unknown as CurriculumFlashcardRow[]
}
