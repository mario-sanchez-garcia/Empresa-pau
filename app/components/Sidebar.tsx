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
        height: '100vh', width: 268, flexShrink: 0,
        borderRight: '1px solid var(--pau-border)',
        background: 'rgba(248,251,255,0.96)',
        backdropFilter: 'blur(24px)',
        transition: 'box-shadow 220ms var(--ease-out)',
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--pau-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, #1a43cc 0%, #2563eb 55%, #3b8ef8 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <GraduationCap size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--pau-ink)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Pausia
            </div>
            <div style={{ fontSize: 10, color: 'var(--pau-soft)', marginTop: 2, fontWeight: 600, letterSpacing: '0.01em' }}>
              {ccaa === 'Madrid' ? 'EBAU Madrid' : ccaa === 'Cataluña' ? 'PAU Catalunya' : 'PAU / EBAU'}
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 999,
            background: 'rgba(37,99,235,0.08)', color: '#2563eb',
            border: '1px solid rgba(37,99,235,0.14)',
          }}>
            Beta
          </span>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = currentItem === item.id

          const baseStyle: React.CSSProperties = {
            display: 'flex', width: '100%', alignItems: 'center', gap: 9,
            padding: '8px 9px', borderRadius: 11,
            border: '1px solid transparent', textDecoration: 'none', cursor: 'pointer',
            background: 'none', textAlign: 'left',
            transition: 'background 160ms var(--ease-out), border-color 160ms var(--ease-out)',
            marginBottom: 1, position: 'relative',
            ...(active ? {
              background: 'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(224,236,255,0.7))',
              borderColor: 'rgba(190,218,255,0.8)',
            } : {}),
          }

          const iconEl = (
            <span style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active
                ? 'linear-gradient(135deg, #2563eb, #3b8ef8)'
                : 'rgba(241,245,252,1)',
              color: active ? '#fff' : 'var(--pau-muted)',
              border: active ? 'none' : '1px solid rgba(220,232,250,0.8)',
              boxShadow: active ? '0 3px 10px rgba(37,99,235,0.28)' : 'none',
              transition: 'background 160ms var(--ease-out), color 160ms var(--ease-out), box-shadow 160ms var(--ease-out)',
            }}>
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
            </span>
          )

          const textEl = (
            <span style={{ minWidth: 0 }}>
              <strong style={{
                display: 'block', fontSize: 13,
                fontWeight: active ? 800 : 600,
                color: active ? '#1a3a8f' : 'var(--pau-ink-2)',
                lineHeight: 1.3, letterSpacing: active ? '-0.01em' : '0',
              }}>
                {item.label}
              </strong>
              <small style={{ display: 'block', fontSize: 11, color: active ? '#5b82c8' : 'var(--pau-soft)', marginTop: 0.5 }}>
                {item.desc}
              </small>
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
              display: 'flex', width: '100%', alignItems: 'center', gap: 9,
              padding: '8px 9px', borderRadius: 11, border: '1px solid transparent',
              textDecoration: 'none', background: 'none', marginBottom: 1,
              transition: 'background 160ms var(--ease-out)',
            }}
          >
            <span style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(241,245,252,1)', color: 'var(--pau-muted)',
              border: '1px solid rgba(220,232,250,0.8)',
            }}>
              <LayoutDashboard size={15} strokeWidth={2} />
            </span>
            <span style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pau-ink-2)', lineHeight: 1.3 }}>Panel interno</strong>
              <small style={{ display: 'block', fontSize: 11, color: 'var(--pau-soft)', marginTop: 0.5 }}>Métricas de beta</small>
            </span>
          </Link>
        )}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--pau-border)', padding: '12px 12px 14px' }}>
        {/* CCAA */}
        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{
            display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--pau-soft)',
            letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Comunidad
          </span>
          <select
            value={ccaa}
            onChange={e => setCCAA(e.target.value as CCAA)}
            aria-label="Comunidad autónoma"
            style={{
              width: '100%', borderRadius: 8, border: '1px solid var(--pau-border)',
              background: '#fff', padding: '6px 26px 6px 9px', fontSize: 12, fontWeight: 700,
              color: 'var(--pau-ink-2)', outline: 'none', cursor: 'pointer',
              transition: 'border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out)',
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
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
            border: '1.5px solid #bfdbfe', overflow: 'hidden',
            fontSize: 12, fontWeight: 900, color: '#2563eb',
          }}>
            {profile.photo
              ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pau-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
              {profile.displayName || 'Estudiante'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--pau-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayedEmail || ''}
            </div>
          </div>
          <Link
            href="/settings"
            aria-label="Ajustes de cuenta"
            style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${currentItem === 'settings' ? '#bfdbfe' : 'rgba(220,232,250,0.6)'}`,
              background: currentItem === 'settings' ? '#eff6ff' : 'transparent',
              color: currentItem === 'settings' ? '#2563eb' : 'var(--pau-soft)',
              transition: 'background 150ms, border-color 150ms, color 150ms',
            }}
          >
            <Settings size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Support + Logout */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Link
            href="/contacto"
            style={{
              flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 600,
              color: 'var(--pau-soft)', textDecoration: 'none',
              padding: '7px 0', borderRadius: 8,
              border: '1px solid rgba(220,232,250,0.6)',
              background: 'transparent',
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
              gap: 5, padding: '7px 0', borderRadius: 8,
              border: '1px solid rgba(220,232,250,0.6)', background: 'transparent',
              fontSize: 11, fontWeight: 600, color: 'var(--pau-soft)', cursor: 'pointer',
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
          background: rgba(243,247,255,0.9) !important;
          border-color: rgba(213,230,252,0.6) !important;
        }
        .pau-nav-btn:hover:not([aria-current="page"]) span:first-child {
          background: rgba(237,244,255,1) !important;
          color: #2563eb !important;
        }
        .pau-nav-btn:active { transform: scale(0.98); }
        .pau-footer-link:hover {
          color: #2563eb !important;
          border-color: #bfdbfe !important;
          background: rgba(239,246,255,0.6) !important;
        }
        select:focus { border-color: #93c5fd !important; box-shadow: 0 0 0 3px rgba(147,197,253,0.2) !important; }
      `}</style>
    </aside>
  )
}
