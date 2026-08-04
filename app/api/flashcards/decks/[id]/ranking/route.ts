import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthContext, createUserSupabase, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { resolveDisplayNames } from '@/app/lib/camino/rankingNames'

export const dynamic = 'force-dynamic'

function publicId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16)
}

// GET — ranking simple del mazo (mejor intento de cada alumno que lo ha
// resuelto) + estadísticas propias (historial de intentos, aciertos a la
// primera, tiempo total). Versión simple de "ranking/torneos" (tarea 7): un
// ranking por mazo, sin duelos 1v1 — ver nota en el resumen de la tarea.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext
  const { id: deckId } = await params

  const userDb = createUserSupabase(accessToken)
  const { data: deck } = await userDb
    .from('flashcard_decks')
    .select('id, user_id, is_public')
    .eq('id', deckId)
    .maybeSingle()

  if (!deck) {
    return NextResponse.json({ error: 'Mazo no encontrado' }, { status: 404 })
  }

  const { data: myAttempts } = await userDb
    .from('flashcard_deck_attempts')
    .select('id, total_cards, correct_first_try, duration_seconds, created_at')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const attempts = myAttempts ?? []
  const myStats = {
    attemptsCount: attempts.length,
    bestCorrectFirstTry: attempts.reduce((max, a) => Math.max(max, a.correct_first_try), 0),
    totalTimeSeconds: attempts.reduce((sum, a) => sum + a.duration_seconds, 0),
    attempts: attempts.map(a => ({
      id: a.id,
      totalCards: a.total_cards,
      correctFirstTry: a.correct_first_try,
      durationSeconds: a.duration_seconds,
      createdAt: a.created_at,
    })),
  }

  // El ranking entre alumnos solo tiene sentido en mazos públicos — en uno
  // privado solo el dueño tiene intentos de todas formas.
  if (!deck.is_public) {
    return NextResponse.json({ ranking: [], myStats })
  }

  const serviceDb = createServiceSupabase()
  if (!serviceDb) {
    return NextResponse.json({ ranking: [], myStats })
  }

  const { data: allAttempts } = await serviceDb
    .from('flashcard_deck_attempts')
    .select('user_id, total_cards, correct_first_try, duration_seconds')
    .eq('deck_id', deckId)

  const bestByUser = new Map<string, { correctFirstTry: number; totalCards: number; durationSeconds: number }>()
  for (const a of allAttempts ?? []) {
    const uid = String(a.user_id)
    const current = bestByUser.get(uid)
    const isBetter = !current
      || a.correct_first_try > current.correctFirstTry
      || (a.correct_first_try === current.correctFirstTry && a.duration_seconds < current.durationSeconds)
    if (isBetter) {
      bestByUser.set(uid, { correctFirstTry: a.correct_first_try, totalCards: a.total_cards, durationSeconds: a.duration_seconds })
    }
  }

  const userIds = Array.from(bestByUser.keys())
  const names = await resolveDisplayNames(serviceDb, userIds, user.id)

  const ranking = userIds
    .map(uid => {
      const best = bestByUser.get(uid)!
      return {
        id: publicId(uid),
        name: names.get(uid) ?? 'Alumno Kairo',
        isCurrentUser: uid === user.id,
        correctFirstTry: best.correctFirstTry,
        totalCards: best.totalCards,
        durationSeconds: best.durationSeconds,
      }
    })
    .sort((a, b) => b.correctFirstTry - a.correctFirstTry || a.durationSeconds - b.durationSeconds)
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return NextResponse.json({ ranking, myStats })
}
