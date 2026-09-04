'use client'

import type { ReactNode } from 'react'

// Insignia "cápsula": relleno sólido + canto inferior de su propio color,
// no un círculo/píldora plana con borde. tone='accent' usa el color de marca
// del tema; tone='neutral' usa la superficie para insignias secundarias.
export default function ClayBadge({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'neutral' }) {
  const isAccent = tone === 'accent'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 800,
        color: isAccent ? 'var(--clay-on-accent)' : 'var(--clay-text-muted)',
        background: isAccent ? 'var(--clay-accent)' : 'var(--clay-surface-raised)',
        borderRadius: 999,
        padding: '6px 14px',
        boxShadow: `0 3px 0 0 ${isAccent ? 'var(--clay-accent-deep)' : 'var(--clay-surface-deep)'}`,
      }}
    >
      {children}
    </span>
  )
}
