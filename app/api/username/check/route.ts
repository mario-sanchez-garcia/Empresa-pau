import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { validateUsername, normalizeUsername, generateCandidates } from '@/app/lib/username'

export const dynamic = 'force-dynamic'

// Per-instance in-memory rate limiter — good enough for private beta
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 30
const ipCounts = new Map<string, { count: number; reset: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_MAX) return true
  entry.count++
  return false
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas peticiones. Espera un momento.' }, { status: 429 })
  }

  const u = request.nextUrl.searchParams.get('u') ?? ''
  const validationError = validateUsername(u)
  if (validationError) {
    return NextResponse.json({ available: false, error: validationError, suggestions: [] })
  }

  const normalized = normalizeUsername(u)

  const db = createServiceClient()
  const { data, error } = await db
    .from('perfiles')
    .select('id')
    .eq('username_normalized', normalized)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ available: true })
  }

  // Taken — find free suggestions
  const candidates = generateCandidates(u)
  const freeSuggestions: string[] = []
  for (const c of candidates) {
    if (freeSuggestions.length >= 3) break
    const { data: taken } = await db
      .from('perfiles')
      .select('id')
      .eq('username_normalized', normalizeUsername(c))
      .maybeSingle()
    if (!taken) freeSuggestions.push(c)
  }

  return NextResponse.json({ available: false, suggestions: freeSuggestions })
}
