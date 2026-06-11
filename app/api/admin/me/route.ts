import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isInternalUser } from '@/app/lib/internalUsers'

export const dynamic = 'force-dynamic'

// Returns { isAdmin: boolean } — never returns secrets, emails, or internal user lists.
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ isAdmin: false })
  }

  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return NextResponse.json({ isAdmin: false })
  }

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await authSupabase.auth.getUser(accessToken)
  if (error || !data.user) {
    return NextResponse.json({ isAdmin: false })
  }

  return NextResponse.json({ isAdmin: isInternalUser(data.user.email) })
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
