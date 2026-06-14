import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { hashToken } from '@/app/lib/billing/tokens'
import { getPlan } from '@/app/lib/billing/plans'
import ParentCheckoutClient from './ParentCheckoutClient'

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
    title: name ? `Plan de Estudio PAU de ${name}` : 'Plan de Estudio PAU · Pausia',
    description: 'Ruta personalizada para preparar la PAU con misiones diarias, correcciones IA y simulacros.',
    openGraph: {
      title: name ? `Plan de Estudio PAU de ${name}` : 'Plan de Estudio PAU · Pausia',
      description: 'Ruta personalizada para preparar la PAU con misiones diarias, correcciones IA y simulacros.',
      siteName: 'Pausia',
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
    <main className="pau-bg-atmosphere" style={styles.page}>
      <div style={styles.card}>
        <Logo />
        <p style={styles.errorTitle}>Enlace no disponible</p>
        <p style={styles.errorText}>{message}</p>
      </div>
    </main>
  )
}

function SuccessStaticPage({ name }: { name: string | null }) {
  return (
    <main className="pau-bg-atmosphere" style={styles.page}>
      <div style={styles.card}>
        <Logo />
        <div style={{ fontSize: 40, textAlign: 'center' as const }}>✅</div>
        <p style={styles.successTitle}>Pack ya activado</p>
        <p style={styles.bodyText}>
          {name ? `El Pack Curso PAU de ${name} ya está activado.` : 'Este Pack Curso PAU ya está activado.'}
          {' '}Accede a Pausia para comenzar.
        </p>
      </div>
    </main>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #38bdf8 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 900, fontSize: 18
      }}>P</div>
      <span style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>Pausia</span>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '24px 16px',
  },
  card: {
    background: 'white',
    borderRadius: 28,
    boxShadow: '0 24px 64px rgba(37,99,235,0.12)',
    padding: '40px 36px',
    maxWidth: 440,
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 16,
  },
  errorTitle: { fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 },
  errorText: { fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0 },
  successTitle: { fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, textAlign: 'center' as const },
  bodyText: { fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0, textAlign: 'center' as const },
}
