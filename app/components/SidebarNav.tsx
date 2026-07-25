'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ClipboardList, Clock, GraduationCap, LayoutGrid, MessageCircle, UserRound, Zap } from 'lucide-react'

const NAV = [
  { label: 'Exámenes',        href: '/examenes',                icon: ClipboardList },
  { label: 'Simulacros',      href: '/simulacros',              icon: GraduationCap },
  { label: 'Camino PAU',      href: '/camino',                  icon: LayoutGrid },
  { label: 'La Zona',         href: '/zona',                    icon: Zap },
  { label: 'Chat con Kairo',  href: '/examenes?view=chat',      icon: MessageCircle },
  { label: 'Historial',       href: '/examenes?view=historial', icon: Clock },
  { label: 'Mi Perfil',       href: '/settings',                icon: UserRound },
]

export default function SidebarNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    // Spacer keeps 60px column in layout; nav is fixed to viewport
    <div style={{ width: 60, flexShrink: 0 }}>
      <nav
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh',
          // Must be above filter bar (z-index 91) and all page content
          zIndex: 200,
          width: open ? 212 : 60,
          background: '#0f172a',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          padding: '16px 0', gap: 2,
          overflow: 'hidden',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: open ? '6px 0 28px rgba(0,0,0,.4)' : 'none',
        }}
      >
        {/* Brand */}
        <div style={{ position: 'relative', height: 44, flexShrink: 0, marginBottom: 10 }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: open ? 0 : 1, transition: 'opacity 120ms', pointerEvents: 'none',
          }}>
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 900, fontSize: 11, letterSpacing: 3, color: '#2563eb', textTransform: 'uppercase' }}>Kairo</div>
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', paddingLeft: 18,
            opacity: open ? 1 : 0, transition: 'opacity 150ms 80ms', pointerEvents: 'none',
          }}>
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: 3, color: '#2563eb', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Kairo</span>
          </div>
        </div>

        {/* Nav items — all items always highlighted, current page gets stronger accent */}
        {NAV.map(({ label, href, icon: Icon }) => {
          // Determine if this is the strictly current destination
          const isCurrentPage = (() => {
            if (href === '/camino')      return pathname.startsWith('/camino')
            if (href === '/zona')        return pathname.startsWith('/zona')
            if (href === '/simulacros')  return pathname.startsWith('/simulacros')
            if (href === '/settings')    return pathname === '/settings'
            if (href === '/examenes')    return pathname === '/examenes'
            return false
          })()

          return (
            <a
              key={label}
              href={href}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '0 10px', height: 44, flexShrink: 0,
                textDecoration: 'none', overflow: 'hidden',
              }}
            >
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                // All items get a subtle blue tint; active gets full highlight
                background: isCurrentPage ? 'rgba(37,99,235,.18)' : 'rgba(37,99,235,.07)',
                color: isCurrentPage ? '#2563eb' : '#60a5fa',
                transition: 'background 120ms, color 120ms',
              }}>
                <Icon size={18} />
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                marginLeft: 10, whiteSpace: 'nowrap',
                // All labels in the same blue-tinted color
                color: isCurrentPage ? '#e0f2fe' : '#93c5fd',
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-6px)',
                transition: open
                  ? 'opacity 180ms 80ms, transform 180ms 80ms'
                  : 'opacity 80ms, transform 80ms',
              }}>
                {label}
              </span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
