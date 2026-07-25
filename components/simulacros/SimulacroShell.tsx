'use client'

import type { ReactNode } from 'react'

interface SimulacroShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export default function SimulacroShell({ children, title, subtitle, actions }: SimulacroShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fb' }}>

      {/* 60px dark sidebar — same DNA as CaminoCalendarClient */}
      <nav style={{ width: 60, background: '#0f172a', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 4, position: 'sticky', top: 0, height: '100vh', zIndex: 40 }}>
        <a href="/camino" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 900, fontSize: 11, letterSpacing: 3, color: '#2563eb', textTransform: 'uppercase', marginBottom: 16, padding: '8px 0', textDecoration: 'none' }}>Kairo</a>
        <a href="/" title="Inicio" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </a>
        <a href="/camino" title="Camino PAU" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </a>
        <a href="/simulacros" title="Simulacros" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,99,235,0.2)', color: '#2563eb', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </a>
        <a href="/zona" title="La Zona" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        </a>
        <a href="/settings" title="Configuración" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>
        </a>
      </nav>

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
