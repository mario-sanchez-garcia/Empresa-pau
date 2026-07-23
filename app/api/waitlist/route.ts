import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { logEmailEvent } from '@/app/lib/email/logEmailEvent'
import { sendWaitlistConfirmation, sendReferralReward } from '@/app/lib/email/sendWaitlistEmails'

export const dynamic = 'force-dynamic'

// In-memory rate limiter: max 5 registrations per IP per hour.
// Resets on server restart. Sufficient for private beta scale.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_MAX = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (record.count >= RATE_MAX) return false
  record.count++
  return true
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_COMUNIDAD = new Set(['madrid', 'cataluna', 'otra'])
const VALID_CURSO = new Set(['1bach', '2bach'])
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomCode(): string {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
}

function calcPrice(referralCount: number): number {
  if (referralCount >= 3) return 39
  if (referralCount >= 1) return 49
  return 59
}

async function generateUniqueReferralCode(db: ReturnType<typeof createServiceClient>): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `KAIRO-${randomCode()}`
    const { data } = await db.from('waitlist').select('id').eq('referral_code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('Could not generate a unique referral code after 10 attempts')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body.email as string | undefined)?.trim().toLowerCase() ?? ''
  const comunidad = (body.comunidad as string | undefined) ?? ''
  const curso = (body.curso as string | undefined) ?? ''
  const ref = (body.ref as string | undefined)?.trim().toUpperCase() ?? null

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!VALID_COMUNIDAD.has(comunidad)) {
    return NextResponse.json({ error: 'Comunidad inválida' }, { status: 400 })
  }
  if (!VALID_CURSO.has(curso)) {
    return NextResponse.json({ error: 'Curso inválido' }, { status: 400 })
  }

  const db = createServiceClient()

  // Validate ref: only use it if the code actually exists in waitlist
  let validRef: string | null = null
  if (ref) {
    const { data: refRow } = await db.from('waitlist').select('referral_code').eq('referral_code', ref).maybeSingle()
    validRef = refRow ? ref : null
  }

  const referralCode = await generateUniqueReferralCode(db)

  const { data: inserted, error: insertErr } = await db
    .from('waitlist')
    .insert({
      email,
      comunidad,
      curso,
      referral_code: referralCode,
      referred_by: validRef,
      price_locked: 59,
    })
    .select('referral_code, price_locked')
    .single()

  if (insertErr) {
    // Email already registered — fetch existing record and return it
    if (insertErr.code === '23505') {
      const { data: existing } = await db
        .from('waitlist')
        .select('referral_code, price_locked')
        .eq('email', email)
        .single()

      return NextResponse.json({
        alreadyRegistered: true,
        referralCode: existing?.referral_code ?? '',
        priceLocked: existing?.price_locked ?? 59,
      })
    }
    console.error('[waitlist POST] insert error:', insertErr.message)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }

  // Handle referral reward for the referrer
  if (validRef) {
    const { data: referrerRow } = await db
      .from('waitlist')
      .select('email, referral_code, referral_count, price_locked')
      .eq('referral_code', validRef)
      .single()

    if (referrerRow) {
      const newCount = referrerRow.referral_count + 1
      const newPrice = calcPrice(newCount)
      const priceDropped = newPrice < referrerRow.price_locked

      await db
        .from('waitlist')
        .update({ referral_count: newCount, price_locked: newPrice })
        .eq('referral_code', validRef)

      // Send reward email only if price dropped; dedup by (code, newPrice)
      if (priceDropped) {
        const dedupeKey = `${referrerRow.referral_code}-${newPrice}`
        const ephemeralId = crypto.randomUUID()
        const isNew = await logEmailEvent({
          userId: ephemeralId,
          emailType: 'waitlist_referral',
          dedupeKey,
          status: 'skipped',
          metadata: { email: referrerRow.email, referralCode: validRef, newPrice },
        })
        if (isNew) {
          // Fire-and-forget; failure is non-critical
          sendReferralReward({
            email: referrerRow.email,
            newPrice,
            referralCount: newCount,
          }).catch((err) => console.error('[waitlist POST] sendReferralReward failed:', err))
        }
      }
    }
  }

  // Send confirmation email — fail-safe
  try {
    await sendWaitlistConfirmation({
      email,
      referralCode: inserted.referral_code,
      priceLocked: inserted.price_locked,
    })
  } catch (err) {
    console.error('[waitlist POST] sendWaitlistConfirmation failed:', err)
  }

  return NextResponse.json({
    ok: true,
    referralCode: inserted.referral_code,
    priceLocked: inserted.price_locked,
  })
}
