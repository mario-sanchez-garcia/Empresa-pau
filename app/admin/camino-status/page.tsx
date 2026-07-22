'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'

const C = {
  bg: '#2563eb',
  bgDark: '#1d4ed8',
  light: '#eff6ff',
  ink: '#111827',
  muted: '#64748b',
  border: '#dbe7fb',
  surface: '#ffffff',
  shadow: '0 4px 24px rgba(37,99,235,0.07)',
}

type UserStatus = {
  email: string
  subjects: string
  queuePending: number
  queueScheduled: number
  queueCompleted: number
  queuePostponed: number
  futureDays: number
  lastCompleted: string | null
  streak: number
  xpTotal: number
  plan: 'premium' | 'free'
}

type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; users: UserStatus[]; generatedAt: string }

function fmtDateShort(s: string | null): string {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Madrid',
    })
  } catch { return s }
}

function Num({ n, color }: { n: number; color?: string }) {
  return (
    <span style={{ fontWeight: 700, color: n === 0 ? C.muted : (color ?? C.ink) }}>
      {n}
    </span>
  )
}

function PlanBadge({ plan }: { plan: 'premium' | 'free' }) {
  return plan === 'premium'
    ? <span style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>Premium</span>
    : <span style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>Free</span>
}

const COLS = [
  'Email', 'Asignaturas',
  'Pendiente', 'Programado', 'Completado', 'Pospuesto',
  'Días cal.', 'Última misión', 'Racha', 'XP total', 'Plan',
]

export default function CaminoStatusPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' })

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setState({ status: 'unauthenticated' }); return }
    const res = await fetch('/api/admin/camino-status', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.status === 403) { setState({ status: 'unauthorized' }); return }
    if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
    if (!res.ok) { setState({ status: 'error', message: `HTTP ${res.status}` }); return }
    const json = await res.json() as { users: UserStatus[]; generatedAt: string }
    setState({ status: 'loaded', users: json.users, generatedAt: json.generatedAt })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.light} 0%, #f8faff 100%)` }}>
      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.bgDark} 0%, ${C.bg} 100%)`, padding: '0 32px', boxShadow: '0 2px 20px rgba(37,99,235,0.2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <Link href="/admin" style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                ← Panel admin
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <Link href="/" style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                Volver a Kairo
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0f2fe', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                Solo usuarios internos
              </span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Estado Camino PAU — por usuario
            </h1>
            {state.status === 'loaded' && (
              <p style={{ color: '#93c5fd', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>
                {state.users.length} usuario{state.users.length !== 1 ? 's' : ''} · {fmtDateShort(state.generatedAt)}
              </p>
            )}
          </div>
          <button
            onClick={() => { setState({ status: 'loading' }); load() }}
            disabled={state.status === 'loading'}
            style={{
              background: state.status === 'loading' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: 8, padding: '8px 18px',
              fontSize: 12, fontWeight: 700, cursor: state.status === 'loading' ? 'default' : 'pointer',
              opacity: state.status === 'loading' ? 0.6 : 1,
            }}
          >
            {state.status === 'loading' ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>
        {state.status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando estado Camino…</p>
          </div>
        )}

        {state.status === 'unauthenticated' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 12 }}>Inicia sesión para acceder.</p>
            <a href="/login" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline' }}>Ir a login →</a>
          </div>
        )}

        {state.status === 'unauthorized' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 8 }}>No tienes acceso a esta página.</p>
            <p style={{ fontSize: 13, color: C.muted }}>Solo los usuarios del equipo interno pueden ver este panel.</p>
            <Link href="/" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline', display: 'block', marginTop: 16 }}>← Volver a Kairo</Link>
          </div>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700 }}>Error: {state.message}</p>
            <button onClick={load} style={{ marginTop: 12, color: C.bg, fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Reintentar
            </button>
          </div>
        )}

        {state.status === 'loaded' && (
          <>
            {/* Legend */}
            <div style={{ marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: C.muted, fontWeight: 600 }}>
              <span>Días cal.: días futuros con misión pendiente</span>
              <span style={{ color: '#16a34a' }}>≥7 días = verde</span>
              <span style={{ color: '#d97706' }}>3–6 = ámbar</span>
              <span style={{ color: '#dc2626' }}>0–2 = rojo</span>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {COLS.map(col => (
                        <th key={col} style={{
                          textAlign: 'left', padding: '9px 14px', background: '#f8faff',
                          color: C.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                          letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.length === 0 ? (
                      <tr>
                        <td colSpan={COLS.length} style={{ padding: '32px', textAlign: 'center', color: C.muted, fontStyle: 'italic', fontSize: 14 }}>
                          Sin usuarios con Camino generado.
                        </td>
                      </tr>
                    ) : state.users.map((u, i) => (
                      <tr key={u.email} style={{ background: i % 2 === 0 ? C.surface : '#fafcff' }}>
                        <td style={{ padding: '8px 14px', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', color: C.ink }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', fontWeight: 600, color: C.ink }}>
                          {u.subjects}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <Num n={u.queuePending} color="#2563eb" />
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <Num n={u.queueScheduled} color="#0891b2" />
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <Num n={u.queueCompleted} color="#16a34a" />
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <Num n={u.queuePostponed} color="#d97706" />
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: u.futureDays >= 7 ? '#16a34a' : u.futureDays >= 3 ? '#d97706' : '#dc2626' }}>
                          {u.futureDays}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', color: C.muted, fontSize: 11 }}>
                          {fmtDateShort(u.lastCompleted)}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: u.streak > 0 ? '#ea580c' : C.muted }}>
                          {u.streak > 0 ? `🔥 ${u.streak}` : '0'}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: u.xpTotal > 0 ? C.ink : C.muted }}>
                          {u.xpTotal.toLocaleString('es-ES')}
                        </td>
                        <td style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <PlanBadge plan={u.plan} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
