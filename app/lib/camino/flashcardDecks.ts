import 'server-only'

// Mismo conjunto de valores que el check constraint de flashcards.subject
// (ver supabase/migrations/20260611120500_allow_historia_filosofia_flashcards.sql)
// — flashcard_decks.subject usa el mismo constraint, así que validamos aquí
// contra la misma lista para devolver un 400 legible en vez de un error de
// Postgres.
export const FLASHCARD_DECK_SUBJECTS = [
  'mates',
  'fisica',
  'quimica',
  'biologia',
  'ingles',
  'lengua',
  'historia',
  'historia_filosofia',
] as const

export type FlashcardDeckSubject = typeof FLASHCARD_DECK_SUBJECTS[number]

export function isValidDeckSubject(value: unknown): value is FlashcardDeckSubject {
  return typeof value === 'string' && (FLASHCARD_DECK_SUBJECTS as readonly string[]).includes(value)
}

export type DeckCardInput = { front: string; back: string }

export function cleanDeckCards(raw: unknown, maxCards: number): DeckCardInput[] {
  if (!Array.isArray(raw)) return []
  const cleaned: DeckCardInput[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const front = typeof (item as Record<string, unknown>).front === 'string' ? (item as Record<string, unknown>).front as string : ''
    const back = typeof (item as Record<string, unknown>).back === 'string' ? (item as Record<string, unknown>).back as string : ''
    const trimmedFront = front.trim().slice(0, 500)
    const trimmedBack = back.trim().slice(0, 500)
    if (!trimmedFront || !trimmedBack) continue
    cleaned.push({ front: trimmedFront, back: trimmedBack })
    if (cleaned.length >= maxCards) break
  }
  return cleaned
}
