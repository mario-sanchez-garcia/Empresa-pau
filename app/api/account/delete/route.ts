import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'
import { getStripe, isStripeConfigured } from '@/app/lib/billing/stripe'
import { stripeId } from '@/app/lib/billing/stripeEvents'

export const dynamic = 'force-dynamic'

const USER_TABLES = [
  'historial_examenes',
  'historial_simulacros',
  'camino_calendar',
  'camino_xp_events',
  'user_learning_queue',
  'camino_user_progress',
  'flashcards',
  'canvases',
  'progreso',
  'tareas_completadas',
  'liga_miembros',
  'ai_usage_events',
  // user_entitlements se borra al final, después de cancelar en Stripe —
  // ver comentario más abajo.
]

// A02 de la auditoría del 7-8 de septiembre de 2026: este endpoint borraba
// derechos y usuario sin cancelar la suscripción en Stripe. Resultado
// posible: el alumno pierde acceso a Kairo mientras Stripe le sigue
// cobrando cada mes, porque ya no queda ningún registro que enlace su
// stripe_customer_id/subscription_id con nadie a quien avisar. Y al ignorar
// los errores de los `delete` por tabla, un fallo parcial se declaraba
// éxito igual.
//
// Orden nuevo, deliberado: cancelar en Stripe ANTES de borrar
// user_entitlements (de ahí sale el subscription_id) y antes de borrar
// cualquier otra cosa. Si Stripe falla de verdad (no "ya estaba
// cancelada"), se aborta sin borrar nada — es preferible que el alumno
// tenga que reintentar el borrado a que quede pagando una cuenta que ya no
// existe. billing_events registra el resultado en ambos casos.
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authResult = await getAuthUser(token)
  if (!authResult) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { data: { user }, error } = authResult
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = user.id
  const db = createServiceClient()

  // 1) Cancelar cualquier suscripción de Stripe activa antes de tocar datos.
  const { data: activeEntitlements, error: entitlementsError } = await db
    .from('user_entitlements')
    .select('id, plan_id, status, metadata')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (entitlementsError) {
    console.error('[account/delete] no se pudo leer user_entitlements', { userId, message: entitlementsError.message })
    return NextResponse.json({ error: 'No se pudo comprobar tu suscripción. Inténtalo de nuevo o contacta con soporte.' }, { status: 500 })
  }

  const subscriptionIds = Array.from(new Set(
    (activeEntitlements ?? [])
      .map((row) => {
        const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata as Record<string, unknown> : {}
        return stripeId(metadata.stripe_subscription_id)
      })
      .filter((id): id is string => Boolean(id))
  ))

  const cancelledSubscriptionIds: string[] = []

  if (subscriptionIds.length > 0) {
    if (!isStripeConfigured()) {
      // Entorno sin Stripe configurado (local/dev). No hay nada real que
      // cancelar; seguir, pero dejar constancia de que no se pudo verificar.
      console.warn('[account/delete] Stripe no configurado; no se pudo cancelar suscripción', { userId, subscriptionIds })
    } else {
      const stripe = getStripe()
      for (const subscriptionId of subscriptionIds) {
        try {
          await stripe.subscriptions.cancel(subscriptionId)
          cancelledSubscriptionIds.push(subscriptionId)
        } catch (stripeError) {
          // "resource_missing" = ya estaba cancelada/no existe: no es un
          // fallo, es el estado que queríamos. Cualquier otro error de
          // Stripe aborta el borrado — mejor pedir reintento que dejar a
          // alguien pagando una cuenta ya destruida.
          const code = (stripeError as { code?: string })?.code
          if (code === 'resource_missing') {
            cancelledSubscriptionIds.push(subscriptionId)
            continue
          }
          console.error('[account/delete] fallo cancelando suscripción de Stripe', {
            userId, subscriptionId, message: (stripeError as Error)?.message,
          })
          await db.from('billing_events').insert({
            user_id: userId,
            event_type: 'account_delete_stripe_cancel_failed',
            payload: { subscriptionId, message: (stripeError as Error)?.message ?? 'unknown' },
          })
          return NextResponse.json(
            { error: 'No se pudo cancelar tu suscripción de pago. No se ha borrado nada — contacta con soporte o inténtalo de nuevo en unos minutos.' },
            { status: 502 },
          )
        }
      }
    }
  }

  // 2) Borrar datos del alumno, comprobando cada error en vez de ignorarlo.
  const failedTables: { table: string; message: string }[] = []
  for (const table of USER_TABLES) {
    const { error: deleteError } = await db.from(table).delete().eq('user_id', userId)
    if (deleteError) failedTables.push({ table, message: deleteError.message })
  }

  // user_entitlements se borra aparte, ya con la suscripción cancelada.
  const { error: entitlementsDeleteError } = await db.from('user_entitlements').delete().eq('user_id', userId)
  if (entitlementsDeleteError) failedTables.push({ table: 'user_entitlements', message: entitlementsDeleteError.message })

  if (failedTables.length > 0) {
    console.error('[account/delete] borrado parcial de datos', { userId, failedTables })
    await db.from('billing_events').insert({
      user_id: userId,
      event_type: 'account_delete_partial_failure',
      payload: { failedTables, cancelledSubscriptionIds },
    })
    return NextResponse.json(
      { error: 'Se ha cancelado tu suscripción pero no se pudieron borrar todos tus datos. Contacta con soporte para completarlo — no reintentes desde aquí.' },
      { status: 500 },
    )
  }

  const { error: perfilError } = await db.from('perfiles').delete().eq('id', userId)
  if (perfilError) {
    console.error('[account/delete] no se pudo borrar perfil', { userId, message: perfilError.message })
    await db.from('billing_events').insert({
      user_id: userId,
      event_type: 'account_delete_partial_failure',
      payload: { failedTables: [{ table: 'perfiles', message: perfilError.message }], cancelledSubscriptionIds },
    })
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta. Contacta con soporte.' }, { status: 500 })
  }

  // billing_events.user_id referencia auth.users(id) — este insert tiene que
  // ir ANTES de borrar el usuario de auth, o la fila de auth.users a la que
  // apunta ya no existiría y el insert violaría la foreign key.
  await db.from('billing_events').insert({
    user_id: userId,
    event_type: 'account_deleted',
    payload: { cancelledSubscriptionIds },
  })

  const { error: deleteError } = await db.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('[account/delete] auth.admin.deleteUser failed', { userId, message: deleteError.message })
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta. Contacta con soporte.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
