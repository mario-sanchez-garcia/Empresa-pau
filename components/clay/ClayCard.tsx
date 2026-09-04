'use client'

import type { CSSProperties, ReactNode } from 'react'

// Tarjeta clay "real": canto sólido de color debajo (shelf, sin desenfoque)
// + sombra difusa de color para profundidad (elevate) + brillo interior
// arriba (inset) simulando luz rebotando en una superficie de plastilina.
export default function ClayCard({ children, style, padding = 24, radius = 22 }: { children: ReactNode; style?: CSSProperties; padding?: number; radius?: number }) {
  return (
    <div
      style={{
        background: 'var(--clay-surface)',
        borderRadius: radius,
        padding,
        boxShadow: [
          '0 10px 0 var(--clay-shadow-shelf)',
          '0 16px 28px var(--clay-shadow-elevate)',
          'inset 0 2px 3px var(--clay-shadow-light)',
        ].join(', '),
        color: 'var(--clay-text)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
