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
  { id: 'camino', label: 'Camino PAU', desc: 'Tu misión diaria', href: '/camino', icon: Route },
  { id: 'examenes', label: 'Exámenes', desc: 'Practica y corrige', href: '/', icon: ClipboardList },
  { id: 'simulacros', label: 'Simulacros', desc: 'Condiciones reales', href: '/simulacros', icon: TimerReset },
  { id: 'zona', label: 'La Zona', desc: 'Estudia a tu manera', href: '/zona', icon: BrainCircuit },
  { id: 'chat', label: 'Chat con Pausia', desc: 'Resuelve dudas', href: '/?view=chat', icon: MessageCircle },
  { id: 'historial', label: 'Historial', desc: 'Tus correcciones', href: '/?view=historial', icon: BarChart3 },
  { id: 'plan-estudio', label: 'Mi Plan', desc: 'Semana organizada', href: '/planning', icon: Rocket }
] as const

function routeItem(pathname: string): SidebarItemId {
  if (pathname.startsWith('/camino')) return 'camino'
  if (pathname.startsWith('/simulacros')) return 'simulacros'
  if (pathname.startsWith('/zona')) return 'zona'
  if (pathname.startsWith('/planning')) return 'plan-estudio'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'examenes'
}

export default function Sidebar({ activeItem, email, onNavigate, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessionEmail, setSessionEmail] = useState('')
  const [profile, setProfile] = useState<{ displayName?: string, photo?: string }>({})
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
      try {
        setProfile(JSON.parse(window.localStorage.getItem('pausia_profile_preferences') ?? '{}'))
      } catch {
        setProfile({})
      }
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
    if (onLogout) {
      await onLogout()
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = ((profile.displayName || displayedEmail || '?')[0] ?? '?').toUpperCase()

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as any,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: 272,
        flexShrink: 0,
        borderRight: '1px solid var(--pau-border)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        transition: 'box-shadow 220ms var(--ease-out)',
      }}
      className="max-lg:relative max-lg:h-auto max-lg:w-full"
    >
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--pau-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #38bdf8 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37,99,235,0.22)',
            flexShrink: 0,
          }}>
            <GraduationCap size={21} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Pausia</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontWeight: 600 }}>
              {ccaa === 'Madrid' ? 'EBAU Madrid' : ccaa === 'Cataluña' ? 'PAU Catalunya' : 'PAU / EBAU'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = currentItem === item.id
          const sharedStyle = {
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 12,
            border: '1px solid transparent',
            textDecoration: 'none',
            cursor: 'pointer',
            background: 'none',
            textAlign: 'left' as const,
            transition: 'background 160ms var(--ease-out), border-color 160ms var(--ease-out)',
            marginBottom: 2,
            ...(active ? {
              background: 'rgba(239,246,255,1)',
              borderColor: '#bfdbfe',
            } : {}),
          }

          const content = (
            <>
              <span style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#dbeafe' : '#f8fafc',
                color: active ? '#1d4ed8' : '#64748b',
                border: `1px solid ${active ? '#bfdbfe' : '#e2e8f0'}`,
                transition: 'background 160ms var(--ease-out), color 160ms var(--ease-out)',
              }}>
                <Icon size={16} strokeWidth={2} />
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{
                  display: 'block', fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  color: active ? '#1e3a8a' : '#475569',
                  lineHeight: 1.3,
                }}>
                  {item.label}
                </strong>
                <small style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                  {item.desc}
                </small>
              </span>
            </>
          )

          if (onNavigate && ['examenes', 'chat', 'historial'].includes(item.id)) {
            return (
              <button
                key={item.id}
                style={sharedStyle}
                className="pau-nav-item"
                onClick={() => onNavigate(item.id as SidebarItemId)}
                aria-current={active ? 'page' : undefined}
              >
                {content}
              </button>
            )
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              style={sharedStyle}
              className="pau-nav-item"
              aria-current={active ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="pau-nav-item"
            style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 12, border: '1px solid transparent',
              textDecoration: 'none', background: 'none', marginBottom: 2,
              transition: 'background 160ms var(--ease-out)',
            }}
          >
            <span style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
            }}>
              <LayoutDashboard size={16} strokeWidth={2} />
            </span>
            <span style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', lineHeight: 1.3 }}>Panel interno</strong>
              <small style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Métricas de beta</small>
            </span>
          </Link>
        )}
      </nav>

      {/* Bottom: CCAA + user */}
      <div style={{ borderTop: '1px solid var(--pau-border)', padding: '14px 14px 16px' }}>
        {/* CCAA selector */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
            Comunidad autónoma
          </span>
          <select
            value={ccaa}
            onChange={(event) => setCCAA(event.target.value as CCAA)}
            style={{
              width: '100%', borderRadius: 9, border: '1px solid var(--pau-border)',
              background: '#fafbff', padding: '7px 10px', fontSize: 12, fontWeight: 700,
              color: '#374151', outline: 'none', cursor: 'pointer',
              transition: 'border-color 150ms var(--ease-out)',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              paddingRight: 28,
            }}
          >
            {CCAA_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#eff6ff', border: '1.5px solid #bfdbfe', overflow: 'hidden',
            fontSize: 13, fontWeight: 900, color: '#2563eb',
          }}>
            {profile.photo
              ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.displayName || 'Estudiante'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayedEmail || ''}
            </div>
          </div>
          <Link
            href="/settings"
            aria-label="Ajustes"
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${currentItem === 'settings' ? '#bfdbfe' : 'transparent'}`,
              background: currentItem === 'settings' ? '#eff6ff' : 'transparent',
              color: currentItem === 'settings' ? '#2563eb' : '#94a3b8',
              transition: 'background 150ms, border-color 150ms, color 150ms',
            }}
          >
            <Settings size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Support link */}
        <Link
          href="/contacto"
          style={{
            display: 'block', textAlign: 'center', fontSize: 11,
            fontWeight: 600, color: '#94a3b8', textDecoration: 'none',
            padding: '4px 0', marginBottom: 8,
            transition: 'color 150ms var(--ease-out)',
          }}
        >
          Soporte · Feedback
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '9px 14px', borderRadius: 10,
            border: '1px solid #e2e8f0', background: '#fafafa',
            fontSize: 12, fontWeight: 700, color: '#64748b',
            cursor: 'pointer',
            transition: 'background 150ms var(--ease-out), border-color 150ms var(--ease-out), color 150ms var(--ease-out)',
          }}
        >
          <LogOut size={14} aria-hidden="true" /> Cerrar sesión
        </button>
      </div>

      <style>{`
        .pau-nav-item:hover:not([aria-current="page"]) {
          background: rgba(248, 250, 255, 0.9) !important;
          border-color: #e2ecf9 !important;
        }
        .pau-nav-item:active { transform: scale(0.98); }
        button[style*="background: #fafafa"]:hover { background: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #374151 !important; }
        a[href="/contacto"]:hover { color: #2563eb !important; }
      `}</style>
    </aside>
  )
}
