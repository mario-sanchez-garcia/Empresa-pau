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

      <SidebarNav />

      {/* Content area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
