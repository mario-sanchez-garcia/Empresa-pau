'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

const PRESS_OFFSET = 4

// Mismo relieve que ClayButton pero para navegación (next/link) en vez de
// una acción — botones como "Practicar PAU" o "Abrir Chat con Kairo" son
// enlaces reales, no <button>, así que no pueden reutilizar ClayButton.
export default function ClayLinkButton({ href, children, variant = 'primary', style }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary'; style?: CSSProperties }) {
  const isPrimary = variant === 'primary'
  const edgeColor = isPrimary ? 'var(--clay-accent-deep)' : 'var(--clay-surface-deep)'
  const restShadow = `0 ${PRESS_OFFSET}px 0 0 ${edgeColor}`
  const pressedShadow = `0 1px 0 0 ${edgeColor}`
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        fontSize: 12,
        fontWeight: 800,
        color: isPrimary ? 'var(--clay-on-accent)' : 'var(--clay-text)',
        background: isPrimary ? 'var(--clay-accent)' : 'var(--clay-surface-raised)',
        borderRadius: 14,
        padding: '10px 14px',
        textDecoration: 'none',
        boxShadow: restShadow,
        transform: 'translateY(0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        ...style,
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = `translateY(${PRESS_OFFSET - 1}px)`
        e.currentTarget.style.boxShadow = pressedShadow
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = restShadow
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = restShadow
      }}
    >
      {children}
    </Link>
  )
}
