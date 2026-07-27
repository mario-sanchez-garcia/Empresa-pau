import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthUser } from '@/app/lib/billing/supabase'

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
  'user_entitlements',
]

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

  for (const table of USER_TABLES) {
    await db.from(table).delete().eq('user_id', userId)
  }

  await db.from('perfiles').delete().eq('id', userId)

  const { error: deleteError } = await db.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('[account/delete] auth.admin.deleteUser failed', { userId, message: deleteError.message })
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta. Contacta con soporte.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
