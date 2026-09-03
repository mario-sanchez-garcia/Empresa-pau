'use client'

import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { useLandingAuth } from './LandingAuthState'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const B = bebas.style.fontFamily
const M = dmMono.style.fontFamily

// CTAs de la landing sensibles a sesión/onboarding (ver LandingAuthState).
// Cada una conserva exactamente el markup/estilo original de app/landing/page.tsx,
// solo cambiando destino/etiqueta/visibilidad según el estado.

// Se muestra siempre, incluso con sesión activa: el dispositivo puede estar
// compartido (p. ej. dos hermanos con el mismo ordenador) y cada quien debe
// poder entrar con su propia cuenta sin que el link desaparezca solo porque
// ya hay una sesión distinta abierta.
export function NavLoginLink() {
  return (
    <Link href="/login" className="v4c-btn-nav" style={{ padding: '7px 16px', border: '1px solid rgba(255,255,255,.3)', fontSize: 11, color: '#fff', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase' }}>
      Iniciar sesión →
    </Link>
  )
}

export function HeroCta() {
  const { status, href, label } = useLandingAuth()
  const isAuthed = status === 'authed'
  const isLoading = status === 'loading'
  return (
    <Link
      href={isLoading ? '#' : href}
      aria-disabled={isLoading}
      onClick={e => { if (isLoading) e.preventDefault() }}
      className="v4c-cta-circle"
      style={{ width: 140, height: 140, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexDirection: 'column', gap: 4, opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'default' : 'pointer' }}
    >
      <span style={{ fontFamily: B, fontSize: 17, letterSpacing: '.06em', color: '#111', textAlign: 'center', lineHeight: 1.1, fontWeight: isAuthed ? 700 : undefined }}>
        {isAuthed ? label : <>Empieza<br />gratis</>}
      </span>
      {!isAuthed && (
        <span style={{ fontFamily: M, fontSize: 9, color: 'rgba(0,0,0,.45)', letterSpacing: '.1em', textTransform: 'uppercase' }}>sin tarjeta</span>
      )}
    </Link>
  )
}

export function BottomCta() {
  const { status, href, label } = useLandingAuth()
  const isAuthed = status === 'authed'
  const isLoading = status === 'loading'
  return (
    <Link
      href={isLoading ? '#' : href}
      aria-disabled={isLoading}
      onClick={e => { if (isLoading) e.preventDefault() }}
      className="v4c-cta-circle-inv"
      style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'default' : 'pointer' }}
    >
      <span style={{ fontFamily: B, fontSize: 16, letterSpacing: '.06em', color: '#fff', textAlign: 'center', lineHeight: 1.1, fontWeight: isAuthed ? 700 : undefined }}>
        {isAuthed ? label : <>Empieza<br />gratis</>}
      </span>
      {!isAuthed && (
        <span style={{ fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>sin tarjeta</span>
      )}
    </Link>
  )
}

// Fixed CTA bar pinned to the bottom of the viewport on mobile only (hidden on
// desktop via the .v4c-sticky-cta media query in app/landing/page.tsx), so the
// primary action stays reachable without scrolling back to the hero.
export function StickyMobileCta() {
  const { status, href, label } = useLandingAuth()
  const isAuthed = status === 'authed'
  const isLoading = status === 'loading'
  return (
    <div className="v4c-sticky-cta">
      <Link
        href={isLoading ? '#' : href}
        aria-disabled={isLoading}
        onClick={e => { if (isLoading) e.preventDefault() }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 48, borderRadius: 999, background: '#fff', textDecoration: 'none',
          opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'default' : 'pointer',
        }}
      >
        <span style={{ fontFamily: B, fontSize: 15, letterSpacing: '.04em', color: '#111', fontWeight: isAuthed ? 700 : undefined }}>
          {isAuthed ? label : 'Empieza gratis'}
        </span>
        {!isAuthed && (
          <span style={{ fontFamily: M, fontSize: 9, color: 'rgba(0,0,0,.45)', letterSpacing: '.08em', textTransform: 'uppercase' }}>sin tarjeta</span>
        )}
      </Link>
    </div>
  )
}

export function PricingPlanCta({ isFree, cta, checkoutPlan }: { isFree: boolean; cta: string; checkoutPlan?: string }) {
  const { status, href } = useLandingAuth()
  const isLoading = status === 'loading'
  // Para un plan de pago sin sesión, el destino es /checkout (no /login):
  // /checkout ya sabe redirigir a /login?returnTo=/checkout?plan=... y traer
  // de vuelta al alumno al checkout correcto tras loguearse (mismo patrón que
  // usa /pricing). Enlazar directo a /login perdía el plan elegido — tras
  // loguearse el alumno aterrizaba en /camino u /onboarding, no en el pago.
  const target = isLoading
    ? '#'
    : status === 'authed'
      ? href
      : isFree
        ? '/onboarding'
        : `/checkout?plan=${encodeURIComponent(checkoutPlan ?? '')}`
  return (
    <Link
      href={target}
      aria-disabled={isLoading}
      onClick={e => { if (isLoading) e.preventDefault() }}
      style={{ fontFamily: M, fontSize: 10, color: '#fff', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.3)', paddingBottom: 1, display: 'inline-block', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'default' : 'pointer' }}
    >
      {status === 'authed' && isFree ? (href === '/camino' ? 'Ir a mi Camino →' : 'Continuar →') : cta}
    </Link>
  )
}
