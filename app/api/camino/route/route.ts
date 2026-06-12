import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase, isValidRouteId } from '@/app/lib/camino/caminoProgressServer'

export async function PATCH(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { routeId } = body
  if (!isValidRouteId(routeId)) {
    return NextResponse.json({ error: 'routeId inválido' }, { status: 400 })
  }

  const supabase = createUserSupabase(accessToken)

  const { error } = await supabase.from('camino_route_settings').upsert(
    {
      user_id: user.id,
      route_id: routeId,
      entry_date: new Date().toISOString().slice(0, 10),
      changed_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return NextResponse.json({ error: 'Error al guardar ruta' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, routeId })
}
