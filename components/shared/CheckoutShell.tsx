import type { CSSProperties, ReactNode } from 'react'

// Shared dark-editorial atmosphere for the checkout funnel (student + parent
// confirmation/status screens) — same visual world as /login and /pricing
// (Bebas Neue headlines, DM Mono labels, #0d0d0d canvas), just without the
// 46/54 split-image layout those two use for their larger content. A single
// confirmation card doesn't need a dedicated image column, so the same
// photograph runs full-bleed and dimmed behind the centered content instead.
export default function CheckoutShell({ children, maxWidth = 440 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <div style={styles.page}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/checkout-bg.webp" alt="" aria-hidden loading="eager" style={styles.bg} />
      <div style={styles.vignette} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth }}>
        {children}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    minHeight: '100dvh',
    width: '100%',
    background: '#0d0d0d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    overflow: 'hidden',
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 30%',
    opacity: 0.5,
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 38%, rgba(13,13,13,.72) 0%, rgba(13,13,13,.93) 55%, #0d0d0d 100%)',
  },
}
