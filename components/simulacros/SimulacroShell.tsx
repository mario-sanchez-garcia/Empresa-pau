'use client'

import type { ReactNode } from 'react'
import SidebarNav from '@/app/components/SidebarNav'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

interface SimulacroShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export default function SimulacroShell({ children, title, subtitle, actions }: SimulacroShellProps) {
  const { theme } = useClayThemePreference()
  return (
    <ClayThemeScope theme={theme} style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`
        /* iPad/tablet: el hero (340px, pensado para escritorio) solo tenía
           un recorte para móvil (max-width:767px) — en tablet se quedaba a
           altura completa, dejando muy poco sitio para el contenido real
           debajo. */
        @media (min-width: 768px) and (max-width: 1024px) {
          .sim-hero { height: 260px !important; }
          .sim-hero-count { font-size: 78px !important; }
          .sim-hero-overlay { padding: 22px 26px 28px !important; }
        }

        @media (max-width: 767px) {
          .sim-hero { height: 200px !important; }
          .sim-hero-count { font-size: 64px !important; }
          .sim-hero-overlay { padding: 16px 20px 22px !important; }
          .sim-card-grid { grid-template-columns: 1fr !important; }
          .sim-main { padding: 16px !important; }
        }
      `}</style>
      <SidebarNav />

      {/* Content area */}
      <div className="kairo-page-scroll" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {title && (
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--clay-surface)', borderBottom: '1px solid var(--clay-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--clay-accent)' }}>Simulacros</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--clay-text)', lineHeight: 1 }}>{title}</span>
                {subtitle && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--clay-text-muted)', marginTop: 2 }}>{subtitle}</span>}
              </div>
              {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
            </div>
          </header>
        )}
        {title
          ? <main style={{ padding: 24, flex: 1 }}>{children}</main>
          : <>{children}</>
        }
      </div>
    </ClayThemeScope>
  )
}
