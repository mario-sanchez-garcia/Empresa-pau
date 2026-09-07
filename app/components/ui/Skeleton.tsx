// Primitivos de skeleton. No llevan 'use client': son marcado estático y toda
// la animación vive en .kairo-skeleton (app/globals.css), así que pueden
// renderizarse desde los loading.tsx del servidor sin arrastrar JS al cliente.
//
// La regla al usarlos: el skeleton calca la SILUETA real de la pantalla que
// sustituye — mismas alturas, mismos anchos de columna, mismo orden — para que
// al llegar los datos nada salte de sitio. Un skeleton que no coincide con el
// layout final es peor que no poner nada.

type SkeletonProps = {
  width?: number | string
  height?: number | string
  radius?: number | string
  style?: React.CSSProperties
}

export default function Skeleton({ width = '100%', height = 12, radius, style }: SkeletonProps) {
  return (
    <div
      className="kairo-skeleton"
      aria-hidden
      style={{ width, height, ...(radius !== undefined ? { borderRadius: radius } : null), ...style }}
    />
  )
}

/** Varias líneas de texto; la última sale más corta, como un párrafo real. */
export function SkeletonLines({ lines = 3, height = 11, gap = 8, lastWidth = '62%' }: {
  lines?: number
  height?: number
  gap?: number
  lastWidth?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={height} radius={6} width={i === lines - 1 ? lastWidth : '100%'} />
      ))}
    </div>
  )
}

/**
 * Envoltorio de pantalla completa. Reserva los 60 px del rail de SidebarNav
 * (app/components/SidebarNav.tsx, .kairo-sidebar-spacer) para que el contenido
 * no se desplace horizontalmente cuando el layout real entra en su sitio.
 *
 * `label` es lo único que anuncia el estado a lectores de pantalla: los bloques
 * van aria-hidden porque no significan nada leídos en voz alta.
 */
export function SkeletonScreen({ children, background = '#f4f7fb', label = 'Cargando' }: {
  children: React.ReactNode
  background?: string
  label?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', minHeight: '100vh', background }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,.06)' }} aria-hidden />
      {children}
    </div>
  )
}
