'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Rocket,
  Route,
  Settings,
  TimerReset
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'

export type SidebarItemId = 'camino' | 'examenes' | 'simulacros' | 'zona' | 'chat' | 'historial' | 'plan-estudio' | 'settings'

interface SidebarProps {
  activeItem?: SidebarItemId
  email?: string | null
  onNavigate?: (item: SidebarItemId) => void
  onLogout?: () => void | Promise<void>
}

const NAV_ITEMS = [
  { id: 'camino',       label: 'Camino PAU',     desc: 'Tu misión diaria',   href: '/camino',         icon: Route },
  { id: 'examenes',     label: 'Exámenes',        desc: 'Practica y corrige', href: '/',               icon: ClipboardList },
  { id: 'simulacros',   label: 'Simulacros',      desc: 'Condiciones reales', href: '/simulacros',     icon: TimerReset },
  { id: 'zona',         label: 'La Zona',         desc: 'Estudia a tu manera',href: '/zona',           icon: BrainCircuit },
  { id: 'chat',         label: 'Chat con Pausia', desc: 'Resuelve dudas',     href: '/?view=chat',     icon: MessageCircle },
  { id: 'historial',    label: 'Historial',       desc: 'Tus correcciones',   href: '/?view=historial',icon: BarChart3 },
  { id: 'plan-estudio', label: 'Mi Plan',         desc: 'Semana organizada',  href: '/planning',       icon: Rocket },
] as const

function routeItem(pathname: string): SidebarItemId {
  if (pathname.startsWith('/camino'))    return 'camino'
  if (pathname.startsWith('/simulacros'))return 'simulacros'
  if (pathname.startsWith('/zona'))      return 'zona'
  if (pathname.startsWith('/planning'))  return 'plan-estudio'
  if (pathname.startsWith('/settings'))  return 'settings'
  return 'examenes'
}

export default function Sidebar({ activeItem, email, onNavigate, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessionEmail, setSessionEmail] = useState('')
  const [profile, setProfile] = useState<{ displayName?: string; photo?: string }>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const currentItem = activeItem ?? routeItem(pathname)
  const displayedEmail = email ?? sessionEmail
  const { ccaa, setCCAA } = useCCAA()

  useEffect(() => {
    if (email === undefined) supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? ''))
  }, [email])

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
    function readProfile() {
      try { setProfile(JSON.parse(window.localStorage.getItem('pausia_profile_preferences') ?? '{}')) }
      catch { setProfile({}) }
    }
    readProfile()
    window.addEventListener('pausia_profile_preferences_change', readProfile)
    window.addEventListener('storage', readProfile)
    return () => {
      window.removeEventListener('pausia_profile_preferences_change', readProfile)
      window.removeEventListener('storage', readProfile)
    }
  }, [])

  async function logout() {
    if (onLogout) { await onLogout(); return }
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = ((profile.displayName || displayedEmail || '?')[0] ?? '?').toUpperCase()

  return (
    <aside
      className="max-lg:relative max-lg:h-auto max-lg:w-full"
      style={{
        position: 'sticky', top: 0,
        zIndex: 'var(--z-sticky)' as never,
        display: 'flex', flexDirection: 'column',
        height: '100vh', width: 220, flexShrink: 0,
        borderRight: '1px solid #f1f5f9',
        background: '#ffffff',
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #1a43cc 0%, #2563eb 55%, #3b8ef8 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.24)',
          }}>
            <GraduationCap size={18} strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Pausia
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 999,
            background: 'rgba(124,58,237,0.08)', color: '#5b21b6',
            border: '1px solid rgba(124,58,237,0.18)',
          }}>
            Beta
          </span>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = currentItem === item.id

          const baseStyle: React.CSSProperties = {
            display: 'flex', width: '100%', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 10,
            border: 'none', textDecoration: 'none', cursor: 'pointer',
            background: active ? '#eff6ff' : 'none', textAlign: 'left',
            transition: 'background 150ms ease',
            marginBottom: 2,
          }

          const iconEl = (
            <Icon
              size={16}
              strokeWidth={active ? 2.4 : 2}
              style={{ flexShrink: 0, color: active ? '#2563eb' : '#94a3b8' }}
            />
          )

          const textEl = (
            <span style={{
              fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? '#1e40af' : '#64748b',
              letterSpacing: active ? '-0.01em' : '0',
            }}>
              {item.label}
            </span>
          )

          if (onNavigate && ['examenes', 'chat', 'historial'].includes(item.id)) {
            return (
              <button
                key={item.id}
                style={baseStyle}
                className="pau-nav-btn"
                onClick={() => onNavigate(item.id as SidebarItemId)}
                aria-current={active ? 'page' : undefined}
              >
                {iconEl}{textEl}
              </button>
            )
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              style={baseStyle}
              className="pau-nav-btn"
              aria-current={active ? 'page' : undefined}
            >
              {iconEl}{textEl}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="pau-nav-btn"
            style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 10, border: 'none',
              textDecoration: 'none', background: 'none', marginBottom: 2,
              transition: 'background 150ms ease',
            }}
          >
            <LayoutDashboard size={16} strokeWidth={2} style={{ flexShrink: 0, color: '#94a3b8' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Panel interno</span>
          </Link>
        )}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 12px 16px' }}>
        {/* CCAA */}
        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{
            display: 'block', fontSize: 9, fontWeight: 800, color: '#94a3b8',
            letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Comunidad
          </span>
          <select
            value={ccaa}
            onChange={e => setCCAA(e.target.value as CCAA)}
            aria-label="Comunidad autónoma"
            style={{
              width: '100%', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', padding: '6px 26px 6px 9px', fontSize: 12, fontWeight: 600,
              color: '#374151', outline: 'none', cursor: 'pointer',
              transition: 'border-color 150ms ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238fa3bc' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 7px center',
            }}
          >
            {CCAA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#eff6ff', border: '1.5px solid #bfdbfe', overflow: 'hidden',
            fontSize: 11, fontWeight: 800, color: '#2563eb',
          }}>
            {profile.photo
              ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.displayName || 'Estudiante'}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayedEmail || ''}
            </div>
          </div>
          <Link
            href="/settings"
            aria-label="Ajustes de cuenta"
            style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${currentItem === 'settings' ? '#bfdbfe' : '#e2e8f0'}`,
              background: currentItem === 'settings' ? '#eff6ff' : 'transparent',
              color: currentItem === 'settings' ? '#2563eb' : '#94a3b8',
              transition: 'background 150ms, border-color 150ms, color 150ms',
            }}
          >
            <Settings size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Support + Logout */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Link
            href="/contacto"
            style={{
              flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 600,
              color: '#94a3b8', textDecoration: 'none',
              padding: '6px 0', borderRadius: 7,
              border: '1px solid #e2e8f0', background: 'transparent',
              transition: 'color 150ms, border-color 150ms, background 150ms',
            }}
            className="pau-footer-link"
          >
            Soporte
          </Link>
          <button
            onClick={logout}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, padding: '6px 0', borderRadius: 7,
              border: '1px solid #e2e8f0', background: 'transparent',
              fontSize: 11, fontWeight: 600, color: '#94a3b8', cursor: 'pointer',
              transition: 'background 150ms, border-color 150ms, color 150ms',
            }}
            className="pau-footer-link"
          >
            <LogOut size={12} aria-hidden="true" /> Salir
          </button>
        </div>
      </div>

      <style>{`
        .pau-nav-btn:hover:not([aria-current="page"]) {
          background: #f8fafc !important;
        }
        .pau-nav-btn:active { transform: scale(0.98); }
        .pau-footer-link:hover {
          color: #2563eb !important;
          border-color: #bfdbfe !important;
          background: #eff6ff !important;
        }
        select:focus { border-color: #93c5fd !important; box-shadow: 0 0 0 3px rgba(147,197,253,0.2) !important; }
      `}</style>
    </aside>
  )
}
