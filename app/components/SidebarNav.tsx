'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, ClipboardList, Clock, CreditCard, GraduationCap, HelpCircle, LayoutDashboard, LayoutGrid, LogOut, MessageCircle, MoreVertical, Settings, ShieldCheck, Sparkles, UserRound, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { loadProfilePreferences } from '@/app/lib/profilePreferences'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import { getCaminoPlanLimits } from '@/app/lib/camino/caminoPlanLimits'

const NAV = [
  { label: 'Camino PAU', href: '/camino',                  icon: LayoutGrid },
  { label: 'Exámenes',   href: '/examenes',                icon: ClipboardList },
  { label: 'Simulacros', href: '/simulacros',              icon: GraduationCap },
  { label: 'Tutor IA',   href: '/examenes?view=chat',      icon: MessageCircle },
  { label: 'Historial',  href: '/examenes?view=historial', icon: Clock },
  { label: 'La Zona',    href: '/zona',                    icon: Zap },
]

// Same labels the Settings page uses for preferences.educationLevel
const EDUC_LABELS: Record<string, string> = {
  '1-bachillerato': '1.º Bach', '2-bachillerato': '2.º Bach',
  'preparacion-pau': 'Prep. PAU', 'otro': 'Otro',
}

const ACCOUNT_MENU = [
  { label: 'Mi perfil', href: '/settings', icon: UserRound },
  { label: 'Ajustes', href: '/settings', icon: Settings },
  { label: 'Plan y facturación', href: '/pricing', icon: CreditCard },
  { label: 'Ayuda', href: '/ayuda', icon: HelpCircle },
]

// The items shown in the mobile bottom bar (most-used first). Historial was
// missing here even though it's a real NAV entry on desktop (/examenes?view=
// historial) — inserted in the same relative position it has in NAV, right
// before La Zona, without touching the order of the other items.
const MOBILE_NAV = [
  { label: 'Camino',     href: '/camino',                  icon: LayoutGrid },
  { label: 'Exámenes',  href: '/examenes',                icon: ClipboardList },
  { label: 'Simulacros', href: '/simulacros',              icon: GraduationCap },
  { label: 'Historial',  href: '/examenes?view=historial', icon: Clock },
  { label: 'Zona',       href: '/zona',                    icon: Zap },
  { label: 'Perfil',     href: '/settings',                icon: UserRound },
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
  const { loading: billingLoading, hasActivePack, activePlans } = useBillingStatus()
  const currentPlanLabel = activePlans[0] ? getCaminoPlanLimits(activePlans[0].planId).label : null
  const [currentView, setCurrentView] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ label: string; comunidad: string | null; curso: string | null } | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
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
      const educationLevel = loadProfilePreferences(user.id).educationLevel
      const curso = educationLevel ? (EDUC_LABELS[educationLevel] ?? null) : null
      try {
        const { data } = await supabase.from('perfiles').select('username, comunidad').eq('id', user.id).maybeSingle()
        setProfile({ label: data?.username?.trim() || fallback, comunidad: data?.comunidad ?? null, curso })
      } catch {
        setProfile({ label: fallback, comunidad: null, curso })
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    if (!accountMenuOpen) return
    function onDocClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('[data-account-menu]')) setAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [accountMenuOpen])

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
        .kairo-nav-item:hover > div:first-child { background: rgba(37,99,235,.28) !important; }
        .kairo-account-item:hover { background: #f1f5f9 !important; }
        .kairo-logout-item:hover { background: #fef2f2 !important; }
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
                className="kairo-nav-item"
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

          {/* Plan status — muestra el plan activo si ya pagas, el acceso
              interno si eres admin sin plan, o el upsell si no tienes nada. */}
          {!billingLoading && (
            hasActivePack && currentPlanLabel ? (
              <a
                href="/settings"
                style={{
                  margin: '0 10px 12px', padding: open ? '12px' : '10px 0',
                  borderRadius: 12, textDecoration: 'none',
                  background: 'linear-gradient(135deg, rgba(22,163,74,.20), rgba(22,163,74,.06))',
                  border: '1px solid rgba(22,163,74,.35)',
                  display: 'flex', flexDirection: open ? 'column' : 'row',
                  alignItems: open ? 'flex-start' : 'center', justifyContent: open ? 'flex-start' : 'center',
                  gap: 6, overflow: 'hidden', flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#4ade80" />
                  {open && <span style={{ fontSize: 12.5, fontWeight: 800, color: '#dcfce7', whiteSpace: 'nowrap' }}>Plan {currentPlanLabel}</span>}
                </div>
                {open && (
                  <span style={{ fontSize: 11, color: '#86efac', lineHeight: 1.4 }}>
                    Ya tienes acceso completo. Gestionar →
                  </span>
                )}
              </a>
            ) : isAdmin ? (
              <div
                style={{
                  margin: '0 10px 12px', padding: open ? '12px' : '10px 0',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.1)',
                  display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center',
                  gap: 8, overflow: 'hidden', flexShrink: 0,
                }}
              >
                <ShieldCheck size={16} color="#94a3b8" />
                {open && <span style={{ fontSize: 12.5, fontWeight: 800, color: '#cbd5e1', whiteSpace: 'nowrap' }}>Acceso interno</span>}
              </div>
            ) : (
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
            )
          )}

          {/* Account row — single entry point for profile/settings/plan/help/logout */}
          <div data-account-menu style={{ position: 'relative', margin: '0 10px', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
            <button
              onClick={() => setAccountMenuOpen(v => !v)}
              aria-label="Cuenta"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: accountMenuOpen ? 'rgba(255,255,255,.06)' : 'none', border: 'none',
                borderRadius: 10, padding: '6px', cursor: 'pointer', overflow: 'hidden',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(profile?.label ?? '?')[0]?.toUpperCase()}
              </div>
              {open && (
                <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#e0f2fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.label ?? '…'}
                  </div>
                  {(profile?.comunidad || profile?.curso) && (
                    <div style={{ fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {[profile?.comunidad, profile?.curso].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              )}
              {open && <MoreVertical size={15} color="#64748b" style={{ flexShrink: 0 }} />}
            </button>

            {accountMenuOpen && (
              <div style={{
                position: 'fixed', left: 68, bottom: 16, zIndex: 300,
                width: 216, borderRadius: 12, background: 'white',
                boxShadow: '0 18px 44px rgba(0,0,0,.28)', border: '1px solid #e2e8f0',
                padding: 6, overflow: 'hidden',
              }}>
                {ACCOUNT_MENU.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setAccountMenuOpen(false)}
                    className="kairo-account-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, textDecoration: 'none',
                      fontSize: 13, fontWeight: 700, color: '#334155',
                      transition: 'background 120ms',
                    }}
                  >
                    <Icon size={15} color="#64748b" /> {label}
                  </a>
                ))}
                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 6px' }} />
                <button
                  onClick={() => { setAccountMenuOpen(false); handleLogout() }}
                  className="kairo-logout-item"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, color: '#dc2626',
                    transition: 'background 120ms',
                  }}
                >
                  <LogOut size={15} /> Cerrar sesión
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
