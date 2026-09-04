'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ClayButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

const PRESS_OFFSET = 5

// Botón clay "real": un canto sólido de color (sin desenfoque) hace de
// relieve por debajo, como el borde de una pieza de plastilina — no una
// sombra gris difusa. Al pulsar, el canto se comprime a 1px y el botón baja
// esos mismos px, así que visualmente se "hunde" hasta tocar el canto.
export default function ClayButton({ children, variant = 'primary', style, ...props }: ClayButtonProps) {
  const isPrimary = variant === 'primary'
  const edgeColor = isPrimary ? 'var(--clay-accent-deep)' : 'var(--clay-surface-deep)'
  const restShadow = `0 ${PRESS_OFFSET}px 0 0 ${edgeColor}`
  const pressedShadow = `0 1px 0 0 ${edgeColor}`
  return (
    <button
      {...props}
      style={{
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 800,
        color: isPrimary ? 'var(--clay-on-accent)' : 'var(--clay-text)',
        background: isPrimary ? 'var(--clay-accent)' : 'var(--clay-surface-raised)',
        border: 'none',
        borderRadius: 18,
        padding: '13px 24px',
        cursor: 'pointer',
        boxShadow: restShadow,
        transform: 'translateY(0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        ...style,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = `translateY(${PRESS_OFFSET - 1}px)`
        e.currentTarget.style.boxShadow = pressedShadow
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = restShadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = restShadow
      }}
    >
      {children}
    </button>
  )
}
