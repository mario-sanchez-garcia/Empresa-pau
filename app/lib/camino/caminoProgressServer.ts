import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Mapa servidor de XP por tarea — el cliente no decide cuánto XP gana.
// Debe mantenerse sincronizado con app/lib/camino/caminoData.ts → dailyTasks[].xp
export const TASK_XP_MAP: Record<string, number> = {
  'flashcards-integrales': 25,
  'ejercicios-analisis': 30,
  'correccion-corta': 30,
  'repaso-areas': 20,
}

export const TASK_TYPE_MAP: Record<string, string> = {
  'flashcards-integrales': 'flashcard',
  'ejercicios-analisis': 'ejercicio_corto',
  'correccion-corta': 'correccion_ia',
  'repaso-areas': 'repaso_error',
}

export const DAILY_TASK_IDS = Object.keys(TASK_XP_MAP)

export const MISSION_COMPLETION_XP = 15

export const VALID_ROUTE_IDS = ['completa', 'ajustada', 'acelerada', 'sprint', 'intensiva'] as const

export function isValidRouteId(value: unknown): value is string {
  return typeof value === 'string' && VALID_ROUTE_IDS.includes(value as typeof VALID_ROUTE_IDS[number])
}

export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

// Verifica que missionDate esté dentro de ±1 día respecto a la fecha UTC del servidor
export function isDateWithinWindow(missionDate: string): boolean {
  const serverTs = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime()
  const missionTs = new Date(missionDate + 'T00:00:00Z').getTime()
  return Math.abs(missionTs - serverTs) <= 24 * 60 * 60 * 1000
}

export function getYesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Autenticación via Bearer token — patrón idéntico al resto de la app
export async function getAuthContext(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return {
      response: NextResponse.json({ error: 'Auth no configurada' }, { status: 500 })
    }
  }

  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return {
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await authClient.auth.getUser(accessToken)
  if (error || !data.user) {
    return {
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return { user: data.user, accessToken }
}

// Cliente Supabase con el token del usuario — RLS aplica automáticamente
export function createUserSupabase(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })
}

// Cliente con service role — solo para operaciones admin/reset que requieren bypass de RLS
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
