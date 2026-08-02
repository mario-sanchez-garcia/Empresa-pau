'use client'

import type { ReactNode } from 'react'
import SidebarNav from '@/app/components/SidebarNav'

interface SimulacroShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export default function SimulacroShell({ children, title, subtitle, actions }: SimulacroShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fb' }}>
      <style>{`
        .sim-hero {
          height: clamp(220px, 22vw, 320px) !important;
          border: 1px solid rgba(219,231,251,.95);
          border-radius: 24px;
          margin: 22px 18px 24px 22px;
          box-shadow: 0 24px 70px rgba(37,99,235,.16);
        }

        .sim-hero-overlay {
          padding: clamp(24px, 3vw, 42px) clamp(28px, 4vw, 58px) !important;
          background:
            linear-gradient(90deg, rgba(2,6,23,.82) 0%, rgba(2,6,23,.44) 44%, rgba(2,6,23,.12) 100%),
            linear-gradient(to top, rgba(0,0,0,.64) 0%, rgba(0,0,0,.18) 62%, transparent 100%) !important;
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
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2563eb' }}>Simulacros</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{title}</span>
                {subtitle && <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>{subtitle}</span>}
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
    </div>
  )
}
