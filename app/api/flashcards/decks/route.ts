import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getUserBillingContext } from '@/app/lib/billing/serverUsage'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'
import { isInternalUser } from '@/app/lib/internalUsers'
import { isValidDeckSubject, cleanDeckCards } from '@/app/lib/camino/flashcardDecks'

export const dynamic = 'force-dynamic'

function cleanString(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// GET /api/flashcards/decks — mazos propios (scope=mine, por defecto) o
// mazos públicos para explorar (scope=public).
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  const scope = request.nextUrl.searchParams.get('scope') === 'public' ? 'public' : 'mine'
  const db = createUserSupabase(accessToken)

  let query = db
    .from('flashcard_decks')
    .select('id, subject, topic, title, is_public, published_at, created_at, user_id, flashcards(count)')
    .order('created_at', { ascending: false })
    .limit(100)

  query = scope === 'public'
    ? query.eq('is_public', true).neq('user_id', user.id)
    : query.eq('user_id', user.id)

  const { data, error } = await query
  if (error) {
    console.error('[flashcards/decks GET]', error)
    return NextResponse.json({ error: 'Error al cargar mazos' }, { status: 500 })
  }

  const decks = (data ?? []).map((row) => ({
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    title: row.title,
    isPublic: row.is_public,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    isMine: row.user_id === user.id,
    cardCount: Array.isArray(row.flashcards) ? (row.flashcards[0] as { count: number } | undefined)?.count ?? 0 : 0,
  }))

  const planId = isInternalUser(user.email)
    ? 'superpremium'
    : (await getUserBillingContext(user.id, user.created_at, user.email)).planId
  const maxCardsForPlan = getCaminoPlanLimits(planId).maxFlashcardsPerDeck

  return NextResponse.json({ decks, maxCardsForPlan })
}

// POST /api/flashcards/decks — crea un mazo con sus tarjetas iniciales.
// El límite de tarjetas depende del plan del alumno (ver caminoPlanLimits) y
// se valida aquí, en servidor, para que no baste con manipular el cliente.
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const subject = body.subject
  const topic = cleanString(body.topic, 120)
  const title = cleanString(body.title, 120) || topic
  const isPublic = body.isPublic === true

  if (!isValidDeckSubject(subject)) {
    return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
  }
  if (!topic) {
    return NextResponse.json({ error: 'El tema es obligatorio' }, { status: 400 })
  }

  const planId = isInternalUser(user.email)
    ? 'superpremium'
    : (await getUserBillingContext(user.id, user.created_at, user.email)).planId
  const limits = getCaminoPlanLimits(planId)
  const maxCards = limits.maxFlashcardsPerDeck

  const cards = cleanDeckCards(body.cards, maxCards)
  if (cards.length === 0) {
    return NextResponse.json({ error: 'El mazo necesita al menos una tarjeta válida' }, { status: 400 })
  }

  const db = createUserSupabase(accessToken)

  const { data: deck, error: deckError } = await db
    .from('flashcard_decks')
    .insert({
      user_id: user.id,
      subject,
      topic,
      title,
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .select('id, subject, topic, title, is_public, published_at, created_at')
    .single()

  if (deckError || !deck) {
    console.error('[flashcards/decks POST] deck insert failed', deckError)
    return NextResponse.json({ error: 'Error al crear el mazo' }, { status: 500 })
  }

  const { error: cardsError } = await db.from('flashcards').insert(
    cards.map(card => ({
      user_id: user.id,
      subject,
      topic,
      front: card.front,
      back: card.back,
      deck_id: deck.id,
    })),
  )

  if (cardsError) {
    console.error('[flashcards/decks POST] cards insert failed', cardsError)
    await db.from('flashcard_decks').delete().eq('id', deck.id)
    return NextResponse.json({ error: 'Error al guardar las tarjetas del mazo' }, { status: 500 })
  }

  return NextResponse.json({
    deck: {
      id: deck.id,
      subject: deck.subject,
      topic: deck.topic,
      title: deck.title,
      isPublic: deck.is_public,
      publishedAt: deck.published_at,
      createdAt: deck.created_at,
      isMine: true,
      cardCount: cards.length,
    },
    maxCardsForPlan: maxCards,
  })
}
