'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ClipboardList, Clock, GraduationCap, HelpCircle, LayoutDashboard, LayoutGrid, MessageCircle, UserRound, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

const NAV = [
  { label: 'Camino PAU',      href: '/camino',                  icon: LayoutGrid },
  { label: 'Exámenes',        href: '/examenes',                icon: ClipboardList },
  { label: 'Simulacros',      href: '/simulacros',              icon: GraduationCap },
  { label: 'La Zona',         href: '/zona',                    icon: Zap },
  { label: 'Chat con Kairo',  href: '/examenes?view=chat',      icon: MessageCircle },
  { label: 'Historial',       href: '/examenes?view=historial', icon: Clock },
  { label: 'Mi Perfil',       href: '/settings',                icon: UserRound },
  { label: 'Ayuda',           href: '/ayuda',                   icon: HelpCircle },
]

// The 5 items shown in the mobile bottom bar (most-used first)
const MOBILE_NAV = [
  { label: 'Camino',     href: '/camino',     icon: LayoutGrid },
  { label: 'Exámenes',  href: '/examenes',   icon: ClipboardList },
  { label: 'Simulacros', href: '/simulacros', icon: GraduationCap },
  { label: 'Zona',       href: '/zona',       icon: Zap },
  { label: 'Perfil',     href: '/settings',   icon: UserRound },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/camino')     return pathname.startsWith('/camino')
  if (href === '/zona')       return pathname.startsWith('/zona')
  if (href === '/simulacros') return pathname.startsWith('/simulacros')
  if (href === '/settings')   return pathname === '/settings'
  if (href === '/examenes')   return pathname === '/examenes'
  if (href === '/admin')      return pathname.startsWith('/admin')
  if (href === '/ayuda')      return pathname === '/ayuda'
  return false
}

export default function SidebarNav() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/admin/me', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(r => r.ok ? r.json() : { isAdmin: false })
        .then((d: { isAdmin?: boolean }) => setIsAdmin(d.isAdmin === true))
        .catch(() => {})
    })
  }, [])

  const allNav = [...NAV, ...(isAdmin ? [{ label: 'Panel interno', href: '/admin', icon: LayoutDashboard }] : [])]

  return (
    <>
      {/* ── Global mobile styles ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .kairo-sidebar-spacer { display: none !important; }
          .kairo-sidebar-desktop { display: none !important; }
          .kairo-mobile-nav { display: flex !important; }
          /* Body-level pages (Camino, Exámenes) — ensure content clears bottom nav */
          body { padding-bottom: 72px !important; }
          /* Fixed-height internal-scroll pages (Settings, Zona) */
          .kairo-page-scroll { padding-bottom: 72px !important; }
        }
        @media (min-width: 768px) {
          .kairo-mobile-nav { display: none !important; }
        }
      `}</style>

      {/* ── Desktop sidebar (unchanged behaviour) ────────────────────────── */}
      <div className="kairo-sidebar-spacer" style={{ width: 60, flexShrink: 0 }}>
        <nav
          className="kairo-sidebar-desktop"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'fixed', left: 0, top: 0, height: '100vh',
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

          {allNav.map(({ label, href, icon: Icon }) => {
            const active = isActive(href, pathname)
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
                  background: active ? 'rgba(37,99,235,.18)' : 'rgba(37,99,235,.07)',
                  color: active ? '#2563eb' : '#60a5fa',
                  transition: 'background 120ms, color 120ms',
                }}>
                  <Icon size={18} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  marginLeft: 10, whiteSpace: 'nowrap',
                  color: active ? '#e0f2fe' : '#93c5fd',
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

      {/* ── Mobile bottom navigation bar ─────────────────────────────────── */}
      <nav
        className="kairo-mobile-nav"
        style={{
          display: 'none', // overridden by media query
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 200,
          height: 60,
          background: '#0f172a',
          borderTop: '1px solid rgba(255,255,255,.07)',
          alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href, pathname)
          return (
            <a
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4,
                textDecoration: 'none',
                color: active ? '#2563eb' : '#475569',
                background: active ? 'rgba(37,99,235,.08)' : 'transparent',
                transition: 'color 140ms, background 140ms',
                minWidth: 0,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 500,
                letterSpacing: '.04em', textTransform: 'uppercase',
                color: active ? '#2563eb' : '#64748b',
                lineHeight: 1,
              }}>
                {label}
              </span>
            </a>
          )
        })}
      </nav>
    </>
  )
}
