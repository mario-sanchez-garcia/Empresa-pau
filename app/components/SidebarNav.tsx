'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, ClipboardList, Clock, GraduationCap, HelpCircle, LayoutDashboard, LayoutGrid, LogOut, MessageCircle, Settings, Sparkles, UserRound, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

const NAV = [
  { label: 'Camino PAU', href: '/camino',                  icon: LayoutGrid },
  { label: 'Exámenes',   href: '/examenes',                icon: ClipboardList },
  { label: 'Simulacros', href: '/simulacros',              icon: GraduationCap },
  { label: 'La Zona',    href: '/zona',                    icon: Zap },
  { label: 'Tutor IA',   href: '/examenes?view=chat',      icon: MessageCircle },
  { label: 'Historial',  href: '/examenes?view=historial', icon: Clock },
  { label: 'Mi Perfil',  href: '/settings',                icon: UserRound },
  { label: 'Ayuda',      href: '/ayuda',                   icon: HelpCircle },
]

// The 5 items shown in the mobile bottom bar (most-used first)
const MOBILE_NAV = [
  { label: 'Camino',     href: '/camino',     icon: LayoutGrid },
  { label: 'Exámenes',  href: '/examenes',   icon: ClipboardList },
  { label: 'Simulacros', href: '/simulacros', icon: GraduationCap },
  { label: 'Zona',       href: '/zona',       icon: Zap },
  { label: 'Perfil',     href: '/settings',   icon: UserRound },
]

// currentView is read from window.location.search on mount (not next/navigation's
// useSearchParams, which would force every page embedding this sidebar into a
// Suspense boundary) — section switches under /examenes are full navigations
// via plain <a href>, so a fresh read on mount is always correct.
function isActive(href: string, pathname: string, currentView: string | null): boolean {
  const [hrefPath, hrefQuery] = href.split('?')
  if (hrefPath === '/camino')     return pathname.startsWith('/camino')
  if (hrefPath === '/zona')       return pathname.startsWith('/zona')
  if (hrefPath === '/simulacros') return pathname.startsWith('/simulacros')
  if (hrefPath === '/settings')   return pathname === '/settings'
  if (hrefPath === '/admin')      return pathname.startsWith('/admin')
  if (hrefPath === '/ayuda')      return pathname === '/ayuda'
  if (hrefPath === '/examenes') {
    if (pathname !== '/examenes') return false
    const hrefView = new URLSearchParams(hrefQuery ?? '').get('view')
    return hrefView === currentView
  }
  return false
}

export default function SidebarNav() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentView, setCurrentView] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ label: string; comunidad: string | null } | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Lectura del ?view= real de la URL tras cada navegación completa (los enlaces del sidebar son <a href>, no client-side routing)
    setCurrentView(new URLSearchParams(window.location.search).get('view'))
  }, [pathname])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/admin/me', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(r => r.ok ? r.json() : { isAdmin: false })
        .then((d: { isAdmin?: boolean }) => setIsAdmin(d.isAdmin === true))
        .catch(() => {})
    })
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const fallback = user.email?.split('@')[0] || 'Alumno'
      try {
        const { data } = await supabase.from('perfiles').select('username, comunidad').eq('id', user.id).maybeSingle()
        setProfile({ label: data?.username?.trim() || fallback, comunidad: data?.comunidad ?? null })
      } catch {
        setProfile({ label: fallback, comunidad: null })
      }
    }
    loadProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

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
            const active = isActive(href, pathname, currentView)
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

          <div style={{ flex: 1, minHeight: 12 }} />

          {/* Plan Pro upsell — purely additive, links to the real /pricing page */}
          <a
            href="/pricing"
            style={{
              margin: '0 10px 12px', padding: open ? '12px' : '10px 0',
              borderRadius: 12, textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(37,99,235,.22), rgba(37,99,235,.08))',
              border: '1px solid rgba(37,99,235,.35)',
              display: 'flex', flexDirection: open ? 'column' : 'row',
              alignItems: open ? 'flex-start' : 'center', justifyContent: open ? 'flex-start' : 'center',
              gap: 6, overflow: 'hidden', flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#60a5fa" />
              {open && <span style={{ fontSize: 12.5, fontWeight: 800, color: '#e0f2fe', whiteSpace: 'nowrap' }}>Plan Pro</span>}
            </div>
            {open && (
              <>
                <span style={{ fontSize: 11, color: '#93c5fd', lineHeight: 1.4 }}>
                  Aprovecha todas las funciones premium.
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#60a5fa' }}>Mejorar ahora →</span>
              </>
            )}
          </a>

          {/* Profile row */}
          <div style={{
            margin: '0 10px', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {(profile?.label ?? '?')[0]?.toUpperCase()}
            </div>
            {open && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#e0f2fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.label ?? '…'}
                </div>
                {profile?.comunidad && (
                  <div style={{ fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap' }}>{profile.comunidad}</div>
                )}
              </div>
            )}
            {open && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <a href="/settings" aria-label="Notificaciones" style={{ padding: 6, borderRadius: 8, color: '#64748b', display: 'flex' }}>
                  <Bell size={15} />
                </a>
                <a href="/settings" aria-label="Ajustes" style={{ padding: 6, borderRadius: 8, color: '#64748b', display: 'flex' }}>
                  <Settings size={15} />
                </a>
                <button onClick={handleLogout} aria-label="Cerrar sesión" style={{ padding: 6, borderRadius: 8, color: '#64748b', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
          <div style={{ height: 12, flexShrink: 0 }} />
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
          const active = isActive(href, pathname, currentView)
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
