import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Bebas_Neue } from 'next/font/google'
import { hashToken } from '@/app/lib/billing/tokens'
import { getPlan } from '@/app/lib/billing/plans'
import ParentCheckoutClient from './ParentCheckoutClient'
import CheckoutShell from '@/components/shared/CheckoutShell'
import { CheckCircle2 } from 'lucide-react'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const B = bebas.style.fontFamily

// In Next.js App Router (v15+), params is a Promise — must be awaited.
interface Props {
  params: Promise<{ token: string }>
}

// Resolve the token server-side — never trust client to do this.
async function resolveLink(rawToken: string) {
  // Guard: never pass non-string to crypto
  if (!rawToken || typeof rawToken !== 'string') return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const tokenHash = hashToken(rawToken)

  const { data } = await db
    .from('parent_checkout_links')
    .select('id, plan_id, price_cents, currency, student_display_name, status, expires_at, metadata')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  return data ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const link = await resolveLink(token)
  const name = link?.student_display_name

  return {
    title: name ? `Plan de Estudio PAU de ${name}` : 'Plan de Estudio PAU · Kairo',
    description: 'Ruta personalizada para preparar la PAU con misiones diarias, correcciones IA y simulacros.',
    openGraph: {
      title: name ? `Plan de Estudio PAU de ${name}` : 'Plan de Estudio PAU · Kairo',
      description: 'Ruta personalizada para preparar la PAU con misiones diarias, correcciones IA y simulacros.',
      siteName: 'Kairo',
    },
  }
}

export default async function ParentCheckoutPage({ params }: Props) {
  const { token: rawToken } = await params

  if (!rawToken || typeof rawToken !== 'string') {
    return <ErrorPage message="Este enlace no está disponible." />
  }

  const link = await resolveLink(rawToken)

  // Invalid token
  if (!link) {
    return <ErrorPage message="Este enlace no está disponible." />
  }

  const now = new Date()

  // Expired
  if (new Date(link.expires_at) < now) {
    return <ErrorPage message="Este enlace ha caducado. Pide al alumno que genere uno nuevo." />
  }

  // Already paid
  if (link.status === 'paid') {
    return (
      <SuccessStaticPage name={link.student_display_name} />
    )
  }

  // Cancelled / failed
  if (link.status === 'cancelled' || link.status === 'failed') {
    return <ErrorPage message="Este enlace ya no está disponible." />
  }

  const plan = getPlan(link.plan_id)

  return (
    <ParentCheckoutClient
      token={rawToken}
      planId={link.plan_id}
      planLabel={plan?.label ?? 'Pack Curso PAU'}
      planFeatures={plan?.features ?? []}
      priceCents={link.price_cents}
      currency={link.currency}
      studentDisplayName={link.student_display_name ?? null}
      expiresAt={link.expires_at}
    />
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <CheckoutShell>
      <Logo />
      <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(248,113,113,.3)', color: '#f87171' }}>✕</div></div>
      <h1 style={{ ...styles.title, fontFamily: B }}>Enlace no disponible.</h1>
      <p style={styles.bodyText}>{message}</p>
    </CheckoutShell>
  )
}

function SuccessStaticPage({ name }: { name: string | null }) {
  return (
    <CheckoutShell>
      <Logo />
      <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}><CheckCircle2 size={26} strokeWidth={2.2} /></div></div>
      <h1 style={{ ...styles.title, fontFamily: B }}>Pack ya activado.</h1>
      <p style={styles.bodyText}>
        {name ? `El Pack Curso PAU de ${name} ya está activado.` : 'Este Pack Curso PAU ya está activado.'}
        {' '}Accede a Kairo para comenzar.
      </p>
    </CheckoutShell>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/kairo-logo-white.png" alt="Kairo" loading="eager" style={{ height: 26, width: 'auto', display: 'block' }} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  iconRow: { display: 'flex', justifyContent: 'center', marginBottom: 18 },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    fontSize: 20,
    fontWeight: 900,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.12)',
  },
  title: {
    fontSize: 'clamp(32px, 6vw, 44px)',
    lineHeight: .92,
    letterSpacing: '.01em',
    color: '#fff',
    margin: '0 0 16px',
    textAlign: 'center',
  },
  bodyText: { fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, margin: 0, textAlign: 'center' },
}
