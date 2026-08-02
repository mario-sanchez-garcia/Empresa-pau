import 'server-only'
import { type SupabaseClient } from '@supabase/supabase-js'

/**
 * Precio efectivo respetando el precio bloqueado en la lista de espera.
 *
 * Contexto del fallo que esto arregla: la waitlist guardaba `price_locked` por
 * persona (59 € de base, 49 € con 1 referido, 39 € con 3) y se lo comunicaba
 * al alumno **por email**, con asunto "Plaza reservada — Curso PAU a X €" y el
 * texto "Precio congelado: X €". Pero ningún checkout leía esa columna: ambos
 * cobraban `getLivePriceCents()`, que solo depende de la fecha.
 *
 * Es decir, se prometía un precio por escrito y se cobraba otro. Con los
 * referidos siempre, y tras la fecha límite fundacional para todos.
 *
 * Regla: el alumno paga SIEMPRE el menor entre el precio vigente y el que se
 * le prometió. Nunca puede salir perdiendo por haber reservado plaza.
 */

// La waitlist solo cubre el Curso PAU. El resto de planes no tienen reserva.
const PLANES_CON_RESERVA = new Set(['pack_curso_pau', 'curso_pau'])

export type PrecioResuelto = {
  priceCents: number
  /** Para dejar rastro en billing_events de por qué se cobró esa cifra. */
  origen: 'precio_vigente' | 'precio_bloqueado_waitlist'
  lockedCents: number | null
}

export async function resolverPrecioConReserva(
  db: SupabaseClient,
  email: string | null | undefined,
  planId: string,
  livePriceCents: number,
): Promise<PrecioResuelto> {
  const sinReserva: PrecioResuelto = { priceCents: livePriceCents, origen: 'precio_vigente', lockedCents: null }

  if (!email || !PLANES_CON_RESERVA.has(planId)) return sinReserva

  try {
    const { data } = await db
      .from('waitlist')
      .select('price_locked')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    // price_locked se guarda en EUROS enteros, no en céntimos — convención de
    // la tabla waitlist. Ver el comentario en /api/waitlist/route.ts.
    const euros = Number(data?.price_locked)
    if (!Number.isFinite(euros) || euros <= 0) return sinReserva

    const lockedCents = Math.round(euros * 100)
    if (lockedCents >= livePriceCents) return { ...sinReserva, lockedCents }

    return { priceCents: lockedCents, origen: 'precio_bloqueado_waitlist', lockedCents }
  } catch {
    // Nunca bloquear un pago por esto: si la consulta falla se cobra el precio
    // vigente, que es el comportamiento anterior.
    return sinReserva
  }
}
