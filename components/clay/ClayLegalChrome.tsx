'use client'

import Link from 'next/link'

// Cromo compartido de las 5 páginas legales (antes duplicado byte a byte en
// cada page.tsx: LegalNav/LegalFooter/S/P/A). Se extrae aquí porque las 5 lo
// usan de forma idéntica y todas entran en el piloto clay a la vez — mantener
// 5 copias del mismo cambio habría sido más frágil que esta única fuente.
// Solo cromo (nav, pie, número/título de sección, párrafo, enlace): el
// contenido legal en sí sigue viviendo en cada page.tsx, sin tocar el texto.

const LEGAL_NAV_LINKS = [
  { href: '/legal/terminos', label: 'Términos', key: 'terminos' },
  { href: '/legal/privacidad', label: 'Privacidad', key: 'privacidad' },
  { href: '/legal/reembolsos', label: 'Reembolsos', key: 'reembolsos' },
  { href: '/legal/ia', label: 'IA', key: 'ia' },
  { href: '/legal/aviso-legal', label: 'Aviso', key: 'aviso' },
  { href: '/contacto', label: 'Contacto', key: 'contacto' },
]

const LEGAL_FOOTER_LINKS = [
  { href: '/legal/terminos', label: 'Términos', key: 'terminos' },
  { href: '/legal/privacidad', label: 'Privacidad', key: 'privacidad' },
  { href: '/legal/reembolsos', label: 'Reembolsos', key: 'reembolsos' },
  { href: '/legal/ia', label: 'Uso de IA', key: 'ia' },
  { href: '/legal/aviso-legal', label: 'Aviso legal', key: 'aviso' },
  { href: '/contacto', label: 'Contacto', key: 'contacto' },
]

export function ClayLegalNav({ M, active, theme }: { M: string; active: string; theme: 'light' | 'dark' | 'color' }) {
  // kairo-logo-white.png solo se lee bien sobre fondo oscuro; en claro/color
  // se usa la variante oscura (kairo-logo.png) en vez de un filtro CSS sobre
  // el PNG blanco, que podría desvirtuar el icono si no es monocromo puro.
  const logoSrc = theme === 'dark' ? '/brand/kairo-logo-white.png' : '/brand/kairo-logo.png'
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--clay-surface)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--clay-border)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <Link href="/" aria-label="Inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="Kairo" loading="eager" style={{ height: 28, width: 'auto', display: 'block' }} />
      </Link>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {LEGAL_NAV_LINKS.map(l => (
          <Link
            key={l.key}
            href={l.href}
            style={{
              fontFamily: M, fontSize: 9, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase',
              padding: '5px 10px', borderRadius: 6, textDecoration: 'none',
              color: active === l.key ? 'var(--clay-on-accent)' : 'var(--clay-text-muted)',
              background: active === l.key ? 'var(--clay-accent)' : 'transparent',
              transition: 'all 140ms',
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function ClayLegalFooter({ M, active }: { M: string; active: string }) {
  return (
    <footer style={{ borderTop: '1px solid var(--clay-border)', padding: '28px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: 6 }}>
      {LEGAL_FOOTER_LINKS.map((l, i) => (
        <span key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'var(--clay-border)', fontFamily: M, fontSize: 10 }}>·</span>}
          <Link href={l.href} style={{ fontFamily: M, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', color: active === l.key ? 'var(--clay-text)' : 'var(--clay-text-muted)', transition: 'color 140ms' }}>
            {l.label}
          </Link>
        </span>
      ))}
    </footer>
  )
}

export function ClayLegalSection({ n, title, children, M, last }: { n: string; title: string; children: React.ReactNode; M: string; last?: boolean }) {
  return (
    <section style={{ borderBottom: last ? 'none' : '1px solid var(--clay-border)', padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
        <span style={{ fontFamily: M, fontSize: 10, color: 'var(--clay-accent-text)', letterSpacing: '.2em', fontWeight: 500, flexShrink: 0 }}>{n}</span>
        <h2 style={{ fontFamily: M, fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--clay-text-muted)', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function ClayLegalP({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: 'var(--clay-text-muted)', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>
}

export function ClayLegalLink({ href, children, target, rel }: { href: string; children: React.ReactNode; target?: string; rel?: string }) {
  return <a href={href} target={target} rel={rel} style={{ color: 'var(--clay-accent-text)', textDecoration: 'none', fontWeight: 600 }}>{children}</a>
}

export const clayLegalUl: React.CSSProperties = { paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 6 }
export const clayLegalLi: React.CSSProperties = { fontSize: 15, color: 'var(--clay-text-muted)', lineHeight: 1.75, paddingLeft: 4 }
