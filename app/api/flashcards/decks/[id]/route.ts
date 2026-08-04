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

// GET — detalle de un mazo (propio o público) con sus tarjetas. RLS decide
// si el usuario puede verlo: dueño, o cualquiera si is_public.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext
  const { id } = await params

  const db = createUserSupabase(accessToken)
  const { data: deck, error: deckError } = await db
    .from('flashcard_decks')
    .select('id, user_id, subject, topic, title, is_public, published_at, created_at')
    .eq('id', id)
    .maybeSingle()

  if (deckError || !deck) {
    return NextResponse.json({ error: 'Mazo no encontrado' }, { status: 404 })
  }

  const { data: cards, error: cardsError } = await db
    .from('flashcards')
    .select('id, front, back')
    .eq('deck_id', id)
    .order('created_at', { ascending: true })

  if (cardsError) {
    console.error('[flashcards/decks/[id] GET] cards fetch failed', cardsError)
    return NextResponse.json({ error: 'Error al cargar las tarjetas del mazo' }, { status: 500 })
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
      isMine: deck.user_id === user.id,
    },
    cards: cards ?? [],
  })
}

// PATCH — el dueño edita título/tema/publicación y, opcionalmente,
// reemplaza el contenido completo de tarjetas (usado por edición/import
// posteriores a la creación). RLS ya impide que alguien que no sea el dueño
// actualice la fila del mazo.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext
  const { id } = await params

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const db = createUserSupabase(accessToken)
  const { data: existing } = await db
    .from('flashcard_decks')
    .select('id, user_id, subject, topic')
    .eq('id', id)
    .maybeSingle()

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Mazo no encontrado' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === 'string') updates.title = cleanString(body.title, 120)
  if (typeof body.topic === 'string') updates.topic = cleanString(body.topic, 120)
  if (isValidDeckSubject(body.subject)) updates.subject = body.subject
  if (typeof body.isPublic === 'boolean') {
    updates.is_public = body.isPublic
    updates.published_at = body.isPublic ? new Date().toISOString() : null
  }

  const { error: updateError } = await db.from('flashcard_decks').update(updates).eq('id', id)
  if (updateError) {
    console.error('[flashcards/decks/[id] PATCH] update failed', updateError)
    return NextResponse.json({ error: 'Error al actualizar el mazo' }, { status: 500 })
  }

  if (Array.isArray(body.cards)) {
    const planId = isInternalUser(user.email)
      ? 'superpremium'
      : (await getUserBillingContext(user.id, user.created_at, user.email)).planId
    const maxCards = getCaminoPlanLimits(planId).maxFlashcardsPerDeck
    const cards = cleanDeckCards(body.cards, maxCards)
    if (cards.length === 0) {
      return NextResponse.json({ error: 'El mazo necesita al menos una tarjeta válida' }, { status: 400 })
    }

    const subject = isValidDeckSubject(body.subject) ? body.subject : existing.subject
    const topic = typeof updates.topic === 'string' ? updates.topic : existing.topic

    await db.from('flashcards').delete().eq('deck_id', id)
    const { error: cardsError } = await db.from('flashcards').insert(
      cards.map(card => ({
        user_id: user.id,
        subject,
        topic,
        front: card.front,
        back: card.back,
        deck_id: id,
      })),
    )
    if (cardsError) {
      console.error('[flashcards/decks/[id] PATCH] cards replace failed', cardsError)
      return NextResponse.json({ error: 'Error al actualizar las tarjetas del mazo' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

// DELETE — el dueño borra el mazo; sus tarjetas quedan huérfanas (deck_id a
// null, on delete set null) en vez de borrarse, igual que cualquier
// flashcard suelta creada fuera de un mazo.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { accessToken } = authContext
  const { id } = await params

  const db = createUserSupabase(accessToken)
  const { error } = await db.from('flashcard_decks').delete().eq('id', id)
  if (error) {
    console.error('[flashcards/decks/[id] DELETE] failed', error)
    return NextResponse.json({ error: 'Error al borrar el mazo' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
