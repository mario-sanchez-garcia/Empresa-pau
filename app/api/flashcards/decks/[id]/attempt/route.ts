import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { awardXp } from '@/app/lib/camino/awardXp'
import { FLASHCARD_DECK_COMPLETION_XP, FLASHCARD_DECK_AUTHOR_BONUS_XP } from '@/app/lib/camino/xpMap'

export const dynamic = 'force-dynamic'

// Nota mínima sobre la que el autor de un mazo público recibe bonus por un
// intento ajeno bien resuelto — "buena acogida", no cualquier intento.
const AUTHOR_BONUS_MIN_SCORE = 7

// POST — registra un intento de estudio completado de un mazo (propio o
// público) y da XP con el sistema ya existente (awardXp), nunca uno
// paralelo. El XP del alumno se limita a un intento por mazo y día (mismo
// patrón de idempotencia por source_id+mission_date que usa el resto de la
// app) para que repetir el mazo varias veces no infle el XP sin límite.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext
  const { id: deckId } = await params

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const totalCards = typeof body.totalCards === 'number' && Number.isFinite(body.totalCards) ? Math.max(0, Math.round(body.totalCards)) : 0
  const correctFirstTry = typeof body.correctFirstTry === 'number' && Number.isFinite(body.correctFirstTry) ? Math.max(0, Math.round(body.correctFirstTry)) : 0
  const durationSeconds = typeof body.durationSeconds === 'number' && Number.isFinite(body.durationSeconds) ? Math.max(0, Math.round(body.durationSeconds)) : 0

  if (totalCards === 0) {
    return NextResponse.json({ error: 'totalCards es obligatorio' }, { status: 400 })
  }

  const db = createUserSupabase(accessToken)
  const { data: deck, error: deckError } = await db
    .from('flashcard_decks')
    .select('id, user_id, subject, is_public')
    .eq('id', deckId)
    .maybeSingle()

  if (deckError || !deck) {
    return NextResponse.json({ error: 'Mazo no encontrado' }, { status: 404 })
  }

  const { data: attempt, error: attemptError } = await db
    .from('flashcard_deck_attempts')
    .insert({
      deck_id: deckId,
      user_id: user.id,
      total_cards: totalCards,
      correct_first_try: Math.min(correctFirstTry, totalCards),
      duration_seconds: durationSeconds,
    })
    .select('id, created_at')
    .single()

  if (attemptError || !attempt) {
    console.error('[flashcards/decks/[id]/attempt POST] insert failed', attemptError)
    return NextResponse.json({ error: 'Error al registrar el intento' }, { status: 500 })
  }

  const scoreOnTen = Math.min(10, (Math.min(correctFirstTry, totalCards) / totalCards) * 10)
  const missionDate = new Date().toISOString().slice(0, 10)

  const serviceDb = createServiceClient()
  const studentResult = await awardXp(serviceDb, user.id, {
    xp: FLASHCARD_DECK_COMPLETION_XP,
    sourceType: 'flashcard_deck_completion',
    sourceId: deckId,
    subject: deck.subject,
    missionDate,
    scoreOnTen,
  })

  let authorBonusAwarded = false
  if (deck.is_public && deck.user_id !== user.id && scoreOnTen >= AUTHOR_BONUS_MIN_SCORE) {
    const authorResult = await awardXp(serviceDb, deck.user_id, {
      xp: FLASHCARD_DECK_AUTHOR_BONUS_XP,
      sourceType: 'flashcard_deck_author_bonus',
      sourceId: `${deckId}:${user.id}`,
      subject: deck.subject,
      missionDate,
    })
    authorBonusAwarded = authorResult.awarded
  }

  return NextResponse.json({
    success: true,
    attempt: {
      id: attempt.id,
      createdAt: attempt.created_at,
      totalCards,
      correctFirstTry: Math.min(correctFirstTry, totalCards),
      durationSeconds,
    },
    xpAwarded: studentResult.xpAwarded,
    bonusXp: studentResult.bonusXp,
    totalXp: studentResult.totalXp,
    authorBonusAwarded,
  })
}
