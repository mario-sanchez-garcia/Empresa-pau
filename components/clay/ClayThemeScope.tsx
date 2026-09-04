'use client'

import type { ReactNode } from 'react'
import type { ClayTheme } from '@/components/clay/useClayThemePreference'

// Envuelve una sección piloto y fija data-kairo-clay-theme en ese nodo — las
// variables --clay-* de app/globals.css solo existen bajo ese atributo, así
// que el resto de la app (que no lo tiene) es inmune a este piloto.
export default function ClayThemeScope({ theme, children, style, className }: { theme: ClayTheme; children: ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div data-kairo-clay-theme={theme} className={className} style={{ background: 'var(--clay-bg)', ...style }}>
      {children}
    </div>
  )
}
