'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Route,
  Settings,
  TimerReset,
} from 'lucide-react'
import { DM_Mono } from 'next/font/google'
import { supabase } from '@/app/lib/supabase'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'

const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export type SidebarItemId = 'camino' | 'examenes' | 'simulacros' | 'zona' | 'chat' | 'historial' | 'settings'

interface SidebarProps {
  activeItem?: SidebarItemId
  email?: string | null
  onNavigate?: (item: SidebarItemId) => void
  onLogout?: () => void | Promise<void>
}

const NAV_ITEMS = [
  { id: 'camino',     label: 'Camino PAU',    desc: 'Misión diaria',     href: '/camino',          icon: Route },
  { id: 'examenes',   label: 'Exámenes',       desc: 'Practica y corrige', href: '/examenes',              icon: ClipboardList },
  { id: 'simulacros', label: 'Simulacros',     desc: 'Condiciones reales', href: '/simulacros',            icon: TimerReset },
  { id: 'zona',       label: 'La Zona',        desc: 'Estudia a tu ritmo', href: '/zona',                  icon: BrainCircuit },
  { id: 'chat',       label: 'Chat con Kairo', desc: 'Resuelve dudas',     href: '/examenes?view=chat',    icon: MessageCircle },
  { id: 'historial',  label: 'Historial',      desc: 'Tus correcciones',   href: '/examenes?view=historial', icon: BarChart3 },
] as const

function routeItem(pathname: string): SidebarItemId {
  if (pathname.startsWith('/camino'))     return 'camino'
  if (pathname.startsWith('/simulacros')) return 'simulacros'
  if (pathname.startsWith('/zona'))       return 'zona'
  if (pathname.startsWith('/planning'))   return 'camino'
  if (pathname.startsWith('/settings'))   return 'settings'
  return 'examenes'
}

export default function Sidebar({ activeItem, email, onNavigate, onLogout }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [sessionEmail, setSessionEmail] = useState('')
  const [profile, setProfile]           = useState<{ displayName?: string; photo?: string }>({})
  const [isAdmin, setIsAdmin]           = useState(false)
  const currentItem    = activeItem ?? routeItem(pathname)
  const displayedEmail = email ?? sessionEmail
  const { ccaa, setCCAA } = useCCAA()
  const M = dmMono.style.fontFamily

  useEffect(() => {
    if (email === undefined)
      supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? ''))
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
      try { setProfile(JSON.parse(window.localStorage.getItem('kairo_profile_preferences') ?? '{}')) }
      catch { setProfile({}) }
    }
    readProfile()
    window.addEventListener('kairo_profile_preferences_change', readProfile)
    window.addEventListener('storage', readProfile)
    return () => {
      window.removeEventListener('kairo_profile_preferences_change', readProfile)
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
      className="kairo-sidebar max-lg:relative max-lg:h-auto max-lg:w-full"
      style={{
        position: 'sticky', top: 0,
        zIndex: 'var(--z-sticky)' as never,
        display: 'flex', flexDirection: 'column',
        height: '100vh', width: 220, flexShrink: 0,
        background: '#111',
        borderRight: '1px solid rgba(255,255,255,.07)',
      }}
    >
      <style>{`
        /* ── Nav items ── */
        .ks-item {
          display: flex; align-items: center; gap: 11px;
          width: 100%; padding: 10px 16px;
          border: none; border-left: 2px solid transparent;
          background: transparent; text-align: left; cursor: pointer;
          text-decoration: none;
          transition: background 120ms ease, border-left-color 120ms ease;
        }
        .ks-item:hover:not([aria-current="page"]) {
          background: rgba(255,255,255,.04);
        }
        .ks-item[aria-current="page"] {
          background: rgba(255,255,255,.07);
          border-left-color: rgba(255,255,255,.55);
        }
        .ks-item:active { opacity: .8; }

        /* ── CCAA Select ── */
        .ks-select {
          width: 100%;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.6);
          padding: 7px 28px 7px 10px;
          font-size: 12px; font-weight: 500; outline: none; cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.25)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 7px center;
          transition: border-color 140ms;
        }
        .ks-select:focus { border-color: rgba(255,255,255,.25); }
        .ks-select option { background: #1a1a1a; color: #fff; }

        /* ── Footer buttons ── */
        .ks-footer-btn {
          flex: 1; padding: 7px 0; text-align: center;
          background: transparent; border: 1px solid rgba(255,255,255,.08);
          font-size: 11px; font-weight: 500; color: rgba(255,255,255,.3);
          cursor: pointer; text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: border-color 140ms, color 140ms, background 140ms;
        }
        .ks-footer-btn:hover {
          border-color: rgba(255,255,255,.22);
          color: rgba(255,255,255,.7);
          background: rgba(255,255,255,.04);
        }

        /* ── Settings icon ── */
        .ks-settings {
          width: 26px; height: 26px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 140ms, background 140ms, color 140ms;
        }

        /* ── Mobile ── */
        @media (max-width: 1024px) {
          .kairo-sidebar {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ks-item, .ks-footer-btn { transition: none !important; }
        }
      `}</style>

      {/* ── Logo ──────────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/camino" aria-label="Inicio" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 24, width: 'auto', display: 'block' }} />
        </Link>
        <span style={{ fontFamily: M, fontSize: 8.5, color: 'rgba(255,255,255,.22)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
          Beta
        </span>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {NAV_ITEMS.map(item => {
          const Icon   = item.icon
          const active = currentItem === item.id

          const content = (
            <>
              <Icon
                size={16}
                strokeWidth={active ? 2.2 : 1.8}
                style={{
                  flexShrink: 0,
                  color: active ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.28)',
                  transition: 'color 120ms',
                }}
              />
              <span style={{ minWidth: 0 }}>
                <span style={{
                  display: 'block', fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.45)',
                  letterSpacing: '-.01em', lineHeight: 1.2,
                  transition: 'color 120ms',
                }}>
                  {item.label}
                </span>
                <span style={{
                  display: 'block', fontFamily: M, fontSize: 9,
                  color: active ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.16)',
                  letterSpacing: '.09em', textTransform: 'uppercase', marginTop: 2,
                  transition: 'color 120ms',
                }}>
                  {item.desc}
                </span>
              </span>
            </>
          )

          if (onNavigate && ['examenes', 'chat', 'historial'].includes(item.id)) {
            return (
              <button
                key={item.id}
                className="ks-item"
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
              className="ks-item"
              aria-current={active ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div style={{ margin: '6px 16px', height: 1, background: 'rgba(255,255,255,.06)' }} />
            <Link href="/admin" className="ks-item">
              <LayoutDashboard size={15} strokeWidth={1.8} style={{ flexShrink: 0, color: 'rgba(255,255,255,.2)' }} />
              <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,.28)', letterSpacing: '-.01em' }}>
                Panel interno
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '14px 16px 16px' }}>

        {/* CCAA selector */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{
            display: 'block', fontFamily: M, fontSize: 8.5,
            color: 'rgba(255,255,255,.2)', letterSpacing: '.16em',
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            Comunidad
          </span>
          <select
            className="ks-select"
            value={ccaa}
            onChange={e => setCCAA(e.target.value as CCAA)}
            aria-label="Comunidad autónoma"
            style={{ fontFamily: M }}
          >
            {CCAA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, flexShrink: 0, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.12)',
            fontFamily: M, fontSize: 11, fontWeight: 500,
            color: 'rgba(255,255,255,.6)', letterSpacing: '.04em',
          }}>
            {profile.photo
              ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.72)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile.displayName || 'Estudiante'}
            </div>
            <div style={{
              fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.2)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '.02em',
            }}>
              {displayedEmail || ''}
            </div>
          </div>
          <Link
            href="/settings"
            aria-label="Ajustes de cuenta"
            className="ks-settings"
            style={{
              border: `1px solid ${currentItem === 'settings' ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`,
              background: currentItem === 'settings' ? 'rgba(255,255,255,.1)' : 'transparent',
              color: currentItem === 'settings' ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.22)',
            }}
          >
            <Settings size={13} aria-hidden />
          </Link>
        </div>

        {/* Soporte + Salir */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href="/contacto" className="ks-footer-btn">Soporte</Link>
          <button onClick={logout} className="ks-footer-btn">
            <LogOut size={11} aria-hidden /> Salir
          </button>
        </div>
      </div>
    </aside>
  )
}
