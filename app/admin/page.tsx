'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import type { AdminMetrics } from '@/app/lib/adminMetrics'

const c = {
  bg: '#2563eb',
  light: '#eff6ff',
  accent: '#60a5fa',
  deep: '#1d4ed8',
  ink: '#111827',
  muted: '#64748b',
  border: '#dbe7fb',
  surface: '#ffffff',
  shadow: '0 18px 48px rgba(37,99,235,0.08)'
}

type State =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; metrics: AdminMetrics }

function eur(n: number) {
  if (n < 0.01) return `${(n * 100).toFixed(4)} c€`
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 4 })
}
function num(n: number) { return n.toLocaleString('es-ES') }
function dt(s: string) {
  return new Date(s).toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}
function shortRoute(r: string) {
  return r.replace('/api/', '').replace('/', ' › ')
}
function shortUserId(id: string) {
  return id.slice(0, 8) + '…'
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: c.shadow
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: c.ink, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: c.muted, marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, marginTop: 32 }}>
      {children}
    </h2>
  )
}

function Table({ cols, rows }: { cols: string[]; rows: (string | number | null)[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{
                textAlign: 'left', padding: '8px 12px', background: c.light,
                color: c.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.07em', borderBottom: `1px solid ${c.border}`
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ padding: '20px 12px', color: c.muted, fontStyle: 'italic', textAlign: 'center' }}>Sin datos</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? c.surface : '#f8faff' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 12px', color: c.ink, borderBottom: `1px solid ${c.border}`, fontFamily: j === 0 ? 'var(--font-geist-mono, monospace)' : 'inherit', fontSize: j === 0 ? 12 : 13 }}>
                  {cell == null ? <span style={{ color: c.muted }}>—</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: c.shadow
    }}>
      {children}
    </div>
  )
}

function Dashboard({ m }: { m: AdminMetrics }) {
  const s = m.summary

  return (
    <div>
      {/* Resumen de hoy */}
      <SectionTitle>Resumen de hoy</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <Card label="Llamadas IA" value={num(s.callsToday)} />
        <Card label="Tokens hoy" value={num(s.tokensToday)} />
        <Card label="Coste hoy" value={eur(s.costTodayEur)} />
        <Card label="Coste 7 días" value={eur(s.cost7dEur)} />
        <Card label="Usuarios activos hoy" value={num(s.activeUsersToday)} sub={`${num(s.activeUsers7d)} en 7 días`} />
        <Card label="Correcciones hoy" value={num(s.correctionsToday)} />
        <Card label="Simulacros hoy" value={num(s.simulacrosToday)} />
        <Card label="Planes esta semana" value={num(s.plansThisWeek)} />
        <Card label="Errores 24h" value={num(s.errorsLast24h)} />
      </div>

      {/* Beta health */}
      <SectionTitle>Estado beta</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <Card
          label="IA activa"
          value={m.betaHealth.aiActive ? 'OK' : 'Sin datos'}
        />
        <Card
          label="Tracking activo"
          value={m.betaHealth.trackingActive ? 'OK' : 'Sin datos'}
        />
        <Card label="Errores 24h" value={num(m.betaHealth.errors24h)} />
        <Card label="Coste hoy" value={eur(m.betaHealth.costToday)} />
      </div>

      {/* Uso por ruta */}
      <SectionTitle>Uso por ruta — últimos 7 días</SectionTitle>
      <Panel>
        <Table
          cols={['Ruta', 'Llamadas', 'Tokens', 'Coste estimado', 'Errores']}
          rows={m.byRoute.map(r => [
            shortRoute(r.route),
            num(r.calls),
            num(r.tokens),
            eur(r.costEur),
            r.errors > 0 ? num(r.errors) : '0'
          ])}
        />
      </Panel>

      {/* Top usuarios */}
      <SectionTitle>Top usuarios por tokens — últimos 30 días</SectionTitle>
      <Panel>
        <Table
          cols={['Usuario (ID)', 'Llamadas', 'Tokens', 'Coste estimado']}
          rows={m.topUsers.map(u => [
            shortUserId(u.userId),
            num(u.calls),
            num(u.tokens),
            eur(u.costEur)
          ])}
        />
      </Panel>

      {/* Últimos eventos IA */}
      <SectionTitle>Últimos 50 eventos IA</SectionTitle>
      <Panel>
        <Table
          cols={['Fecha', 'Ruta', 'Acción', 'Tokens', 'Estado']}
          rows={m.recentEvents.map(e => [
            dt(e.createdAt),
            shortRoute(e.route),
            e.action,
            e.totalTokens != null ? num(e.totalTokens) : null,
            e.status === 'error'
              ? `ERROR: ${e.errorCode ?? 'unknown'}`
              : e.status
          ])}
        />
      </Panel>

      {/* Errores recientes */}
      <SectionTitle>Errores últimas 24h</SectionTitle>
      <Panel>
        <Table
          cols={['Fecha', 'Ruta', 'Acción', 'Código']}
          rows={m.recentErrors.map(e => [
            dt(e.createdAt),
            shortRoute(e.route),
            e.action,
            e.errorCode ?? 'unknown'
          ])}
        />
      </Panel>

      {/* Actividad de producto */}
      <SectionTitle>Correcciones recientes</SectionTitle>
      <Panel>
        <Table
          cols={['Fecha', 'Asignatura', 'Nota', 'Nota máx']}
          rows={m.productActivity.recentCorrections.map(r => [
            dt(r.createdAt),
            r.asignatura,
            r.nota != null ? String(r.nota) : null,
            r.notaMaxima != null ? String(r.notaMaxima) : null
          ])}
        />
      </Panel>

      <SectionTitle>Simulacros recientes</SectionTitle>
      <Panel>
        <Table
          cols={['Fecha', 'Asignatura', 'Estado', 'Nota final']}
          rows={m.productActivity.recentSimulacros.map(r => [
            dt(r.createdAt),
            r.asignatura,
            r.estado,
            r.notaFinal != null ? String(r.notaFinal) : null
          ])}
        />
      </Panel>

      <p style={{ marginTop: 32, fontSize: 11, color: c.muted, textAlign: 'right' }}>
        Actualizado: {dt(m.calculatedAt)} · Coste estimado (€): input ×0.0000028 + output ×0.000014
      </p>
    </div>
  )
}

export default function AdminPage() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setState({ status: 'unauthenticated' })
        return
      }
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (cancelled) return
      if (res.status === 403) { setState({ status: 'unauthorized' }); return }
      if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
      if (!res.ok) { setState({ status: 'error', message: `HTTP ${res.status}` }); return }
      const metrics: AdminMetrics = await res.json()
      setState({ status: 'loaded', metrics })
    }
    load()
    return () => { cancelled = true }
  }, [])

  function refresh() {
    setState({ status: 'loading' })
    setTimeout(() => setState(s => s.status === 'loading' ? s : s), 0)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setState({ status: 'unauthenticated' }); return }
      fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then((metrics: AdminMetrics) => setState({ status: 'loaded', metrics }))
        .catch((e: unknown) => setState({ status: 'error', message: String(e) }))
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(145deg, ${c.light} 0%, ${c.surface} 60%)` }}>
      {/* Header */}
      <div style={{ background: c.bg, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            Pausia · Panel interno
          </p>
          <h1 style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, margin: '2px 0 0' }}>
            Dashboard de beta
          </h1>
        </div>
        {state.status === 'loaded' && (
          <button
            onClick={refresh}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Actualizar
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {state.status === 'loading' && (
          <p style={{ color: c.muted, fontSize: 15 }}>Cargando métricas…</p>
        )}

        {state.status === 'unauthenticated' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: c.ink, fontWeight: 600 }}>Inicia sesión para acceder.</p>
            <a href="/login" style={{ color: c.bg, fontSize: 14, fontWeight: 600, textDecoration: 'underline', display: 'block', marginTop: 12 }}>Ir a login</a>
          </div>
        )}

        {state.status === 'unauthorized' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: c.ink, fontWeight: 600 }}>No tienes acceso a esta página.</p>
          </div>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 16, color: '#dc2626', fontWeight: 600 }}>Error cargando métricas: {state.message}</p>
            <button onClick={refresh} style={{ marginTop: 12, color: c.bg, fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Reintentar
            </button>
          </div>
        )}

        {state.status === 'loaded' && <Dashboard m={state.metrics} />}
      </div>
    </div>
  )
}
