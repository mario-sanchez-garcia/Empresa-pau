'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import type { AdminMetrics, RangeSummary } from '@/app/lib/adminMetrics'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#1c1c1c',
  bgDark: '#1c1c1c',
  light: '#f5f5f5',
  accent: '#60a5fa',
  ink: '#111827',
  muted: '#64748b',
  border: '#e0e0e0',
  surface: '#ffffff',
  shadow: '0 1px 4px rgba(0,0,0,0.06)',
  shadowMd: '0 2px_8px_rgba(0,0,0,0.08)'
}

// ─── Formatters ─────────────────────────────────────────────────────────────────
function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0,00 €'
  if (n === 0) return '0,00 €'
  if (n < 0.005) return '< 0,01 €'
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPreciseCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0,0000 €'
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} €`
}

function fmtNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0'
  return Math.round(n).toLocaleString('es-ES')
}

function fmtTokens(n: number | null | undefined): string {
  if (n == null || isNaN(n) || n === 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.round(n).toLocaleString('es-ES')
}

function fmtChars(n: number | null | undefined): string {
  if (n == null || isNaN(n) || n === 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M chars`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K chars`
  return `${Math.round(n).toLocaleString('es-ES')} chars`
}

function fmtPercent(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '0%'
  return `${Math.round(n * 100)}%`
}

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  } catch { return s }
}

function maskUserId(id: string): string {
  return id.slice(0, 6) + '·····' + id.slice(-4)
}

// ─── State machine ──────────────────────────────────────────────────────────────
type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; metrics: AdminMetrics }

type Range = 'today' | '7d' | '30d'

// ─── Sub-components ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent = false, warn = false, danger = false
}: {
  label: string; value: string; sub?: string
  accent?: boolean; warn?: boolean; danger?: boolean
}) {
  const bg = danger ? '#fef2f2' : warn ? '#fffbeb' : accent ? C.light : C.surface
  const border = danger ? '#fecaca' : warn ? '#fde68a' : accent ? '#e0e0e0' : C.border
  const valColor = danger ? '#dc2626' : warn ? '#b45309' : C.ink
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '18px 20px', boxShadow: C.shadow }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: valColor, lineHeight: 1, margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.muted, marginTop: 6, margin: '6px 0 0' }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '32px 0 12px', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
      {children}
    </h2>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
      {children}
    </div>
  )
}

type CellValue = string | number | null | React.ReactNode

function Table({ cols, rows, emptyMsg = 'Sin datos' }: {
  cols: string[]
  rows: CellValue[][]
  emptyMsg?: string
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{
                textAlign: 'left', padding: '9px 14px', background: '#f9f9f9',
                color: C.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap'
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: '24px 14px', color: C.muted, textAlign: 'center', fontStyle: 'italic', fontSize: 13 }}>
                {emptyMsg}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : '#fafcff' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '8px 14px', color: C.ink, borderBottom: `1px solid ${C.border}`,
                  fontFamily: j === 0 ? 'var(--font-geist-mono, monospace)' : 'inherit',
                  fontSize: j === 0 ? 11 : 12, whiteSpace: j <= 1 ? 'nowrap' : 'normal'
                }}>
                  {cell == null ? <span style={{ color: C.muted }}>—</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status, errorCode }: { status: string; errorCode?: string | null }) {
  if (status === 'error') {
    return (
      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
        Error{errorCode ? `: ${errorCode}` : ''}
      </span>
    )
  }
  return (
    <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
      OK
    </span>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'completado') {
    return <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Completado</span>
  }
  return <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>En progreso</span>
}

// ─── Alerts ──────────────────────────────────────────────────────────────────────
type AlertLevel = 'ok' | 'warn' | 'danger'
type Alert = { level: AlertLevel; message: string }

function computeAlerts(m: AdminMetrics): Alert[] {
  const alerts: Alert[] = []
  const s = m.summaryToday
  const topUser = m.topUsers[0]

  if (s.costEur === 0 && s.calls === 0) {
    alerts.push({ level: 'ok', message: 'Sin actividad IA hoy.' })
  } else if (s.costEur >= 15) {
    alerts.push({ level: 'danger', message: `Alerta: coste hoy ${fmtCurrency(s.costEur)} — supera 15 €. Revisar urgente.` })
  } else if (s.costEur >= 5) {
    alerts.push({ level: 'warn', message: `Revisar consumo: coste hoy ${fmtCurrency(s.costEur)} (umbral: 5 €).` })
  } else if (s.calls > 0) {
    alerts.push({ level: 'ok', message: `Coste IA bajo control: ${fmtCurrency(s.costEur)} hoy.` })
  }

  if (s.errors === 0 && s.calls > 0) {
    alerts.push({ level: 'ok', message: 'Sin errores IA en las últimas 24h.' })
  } else if (s.errors > 0) {
    alerts.push({ level: 'warn', message: `Hay ${fmtNumber(s.errors)} error${s.errors > 1 ? 'es' : ''} IA en las últimas 24h.` })
  }

  if (topUser && m.summaryToday.tokens > 0) {
    const todayUserTokens = m.topUsers.find(u => u.lastActive && u.lastActive >= new Date(Date.now() - 86400000).toISOString())
    if (todayUserTokens && todayUserTokens.tokens > 50000) {
      alerts.push({ level: 'warn', message: `Usuario con alto consumo: ${fmtTokens(todayUserTokens.tokens)} tokens (30 días).` })
    }
  }

  const { simulacrosStats: ss } = m
  if (ss.total > 0 && ss.completionRate < 0.5 && ss.enProgreso > 3) {
    alerts.push({ level: 'warn', message: `Alta tasa de abandono en simulacros: ${fmtPercent(1 - ss.completionRate)} sin completar.` })
  } else if (ss.total > 0) {
    alerts.push({ level: 'ok', message: `Tasa de finalización de simulacros: ${fmtPercent(ss.completionRate)}.` })
  }

  return alerts
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null
  const bgMap: Record<AlertLevel, string> = { ok: '#f0fdf4', warn: '#fffbeb', danger: '#fef2f2' }
  const borderMap: Record<AlertLevel, string> = { ok: '#bbf7d0', warn: '#fde68a', danger: '#fecaca' }
  const colorMap: Record<AlertLevel, string> = { ok: '#166534', warn: '#92400e', danger: '#991b1b' }
  const icon: Record<AlertLevel, string> = { ok: '✓', warn: '!', danger: '!!' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: bgMap[a.level], border: `1px solid ${borderMap[a.level]}`,
          borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <span style={{ fontWeight: 800, color: colorMap[a.level], fontSize: 12, marginTop: 1, flexShrink: 0 }}>{icon[a.level]}</span>
          <span style={{ fontSize: 13, color: colorMap[a.level], fontWeight: 500 }}>{a.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Insights ────────────────────────────────────────────────────────────────────
function computeInsights(m: AdminMetrics): string[] {
  const out: string[] = []
  const s7 = m.summary7d

  if (m.byRouteAction.length > 0) {
    const topRoute = m.byRouteAction[0]
    out.push(`La acción más usada esta semana: "${topRoute.label}" (${fmtNumber(topRoute.calls)} llamadas).`)
    const mostExpensive = [...m.byRouteAction].sort((a, b) => b.costEur - a.costEur)[0]
    if (mostExpensive.costEur > 0) {
      out.push(`La ruta más cara (7 días): "${mostExpensive.label}" — ${fmtCurrency(mostExpensive.costEur)}.`)
    }
  }

  if (m.topUsers.length > 0) {
    const top = m.topUsers[0]
    out.push(`Usuario con más consumo (30 días): ${maskUserId(top.userId)} — ${fmtTokens(top.tokens)} tokens.`)
  }

  if (s7.calls > 0 && s7.costEur > 0) {
    const avgCostPerCall = s7.costEur / s7.calls
    out.push(`Coste medio por llamada IA (7 días): ${fmtCurrency(avgCostPerCall)}.`)
  }

  if (m.simulacrosStats.total > 0) {
    out.push(`Simulacros totales: ${fmtNumber(m.simulacrosStats.total)} — ${fmtPercent(m.simulacrosStats.completionRate)} completados, ${fmtNumber(m.simulacrosStats.abandoned)} posibles abandonos.`)
  }

  if (s7.corrections > 0) {
    out.push(`Correcciones esta semana: ${fmtNumber(s7.corrections)}.`)
  }

  if (s7.plans > 0) {
    out.push(`Planes de estudio generados esta semana: ${fmtNumber(s7.plans)}.`)
  }

  // Planning % of cost
  const planningRoute = m.byRouteAction.find(r => r.action === 'planning_generation')
  if (planningRoute && s7.costEur > 0) {
    const pct = planningRoute.costEur / s7.costEur
    out.push(`Planning representa el ${fmtPercent(pct)} del coste total (7 días).`)
  }

  return out.slice(0, 6)
}

function InsightsPanel({ insights }: { insights: string[] }) {
  if (insights.length === 0) return (
    <div style={{ padding: '20px 16px', color: C.muted, fontStyle: 'italic', fontSize: 13 }}>Sin datos suficientes para generar insights.</div>
  )
  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {insights.map((ins, i) => (
        <div key={i} style={{
          background: C.light, border: `1px solid #e0e0e0`, borderRadius: 10,
          padding: '10px 14px', fontSize: 13, color: '#1c1c1c', fontWeight: 500, lineHeight: 1.5
        }}>
          {ins}
        </div>
      ))}
    </div>
  )
}

// ─── Range tab ───────────────────────────────────────────────────────────────────
function RangeTabs({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const tabs: { id: Range; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' }
  ]
  return (
    <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            background: value === t.id ? C.bg : 'transparent',
            color: value === t.id ? '#fff' : C.muted,
            border: 'none', borderRadius: 8, padding: '6px 16px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────────
function Dashboard({ m }: { m: AdminMetrics }) {
  const [range, setRange] = useState<Range>('today')

  const summary: RangeSummary = range === 'today' ? m.summaryToday : range === '7d' ? m.summary7d : m.summary30d
  const rangeLabel = range === 'today' ? 'hoy' : range === '7d' ? 'últimos 7 días' : 'últimos 30 días'

  const alerts = computeAlerts(m)
  const insights = computeInsights(m)

  return (
    <div>
      {/* Alerts */}
      <SectionHeader>Estado beta — alertas</SectionHeader>
      <AlertsPanel alerts={alerts} />

      {/* Range selector + summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 12px', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
        <h2 style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
          Resumen — {rangeLabel}
        </h2>
        <RangeTabs value={range} onChange={setRange} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
        <StatCard label="Llamadas IA" value={fmtNumber(summary.calls)} />
        <StatCard label="Tokens" value={fmtTokens(summary.tokens)} />
        <StatCard label="Coste estimado" value={fmtCurrency(summary.costEur)} warn={summary.costEur >= 5} danger={summary.costEur >= 15} />
        <StatCard label="Errores IA" value={fmtNumber(summary.errors)} warn={summary.errors > 0} />
        <StatCard label="Usuarios activos" value={fmtNumber(summary.activeUsers)} />
        <StatCard label="Correcciones" value={fmtNumber(summary.corrections)} />
        <StatCard label="Simulacros complet." value={fmtNumber(summary.simulacros)} />
        <StatCard label="Planes generados" value={fmtNumber(summary.plans)} />
      </div>

      {/* Insights */}
      <SectionHeader>Insights rápidos</SectionHeader>
      <InsightsPanel insights={insights} />

      {/* AI costs */}
      <SectionHeader>Costes IA</SectionHeader>
      {m.aiCosts.last30Days.calls === 0 ? (
        <Panel>
          <div style={{ padding: '28px 18px', color: C.muted, textAlign: 'center', fontSize: 13, fontStyle: 'italic' }}>
            Todavía no hay eventos de uso IA registrados.
          </div>
        </Panel>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 10 }}>
            <StatCard label="Coste IA 7 días" value={fmtPreciseCurrency(m.aiCosts.last7Days.totalCostEur)} accent />
            <StatCard label="Coste IA 30 días" value={fmtPreciseCurrency(m.aiCosts.last30Days.totalCostEur)} />
            <StatCard label="Llamadas IA 7 días" value={fmtNumber(m.aiCosts.last7Days.calls)} />
            <StatCard label="Coste medio / llamada" value={fmtPreciseCurrency(m.aiCosts.last7Days.avgCostEur)} sub="últimos 7 días" />
            <StatCard label="Input medio" value={fmtTokens(m.aiCosts.last7Days.avgInputTokens)} sub="tokens / llamada" />
            <StatCard label="Output medio" value={fmtTokens(m.aiCosts.last7Days.avgOutputTokens)} sub="tokens / llamada" />
            <StatCard label="Total medio" value={fmtTokens(m.aiCosts.last7Days.avgTotalTokens)} sub="tokens / llamada" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14, marginTop: 14 }}>
            <Panel>
              <div style={{ padding: '14px 16px 8px' }}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Coste por tipo — últimos 7 días
                </p>
              </div>
              <Table
                cols={['Ruta/acción', 'Llamadas', 'Coste total', 'Coste medio', 'Input prom.', 'Output prom.']}
                rows={m.aiCosts.byRoute.map(row => [
                  row.label,
                  fmtNumber(row.calls),
                  fmtPreciseCurrency(row.totalCostEur),
                  fmtPreciseCurrency(row.avgCostEur),
                  fmtTokens(row.avgInputTokens),
                  fmtTokens(row.avgOutputTokens)
                ])}
                emptyMsg="Sin eventos IA en los últimos 7 días"
              />
            </Panel>

            <Panel>
              <div style={{ padding: '14px 16px 8px' }}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Imagen vs texto — últimos 7 días
                </p>
              </div>
              <Table
                cols={['Tipo', 'Llamadas', 'Input promedio', 'Output promedio', 'Coste medio', 'Tamaño imagen prom.']}
                rows={m.aiCosts.imageVsText.map(row => [
                  row.label,
                  fmtNumber(row.calls),
                  fmtTokens(row.avgInputTokens),
                  fmtTokens(row.avgOutputTokens),
                  fmtPreciseCurrency(row.avgCostEur),
                  row.hasImage ? fmtChars(row.avgImagePayloadChars) : '—'
                ])}
                emptyMsg="Sin eventos comparables"
              />
            </Panel>

            <Panel>
              <div style={{ padding: '14px 16px 8px' }}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Top llamadas más caras — últimos 7 días
                </p>
              </div>
              <Table
                cols={['Fecha', 'Ruta', 'Acción', 'Modelo', 'Input', 'Output', 'Coste', 'Imágenes']}
                rows={m.aiCosts.mostExpensiveCalls.map(row => [
                  fmtDate(row.createdAt),
                  row.route,
                  row.action,
                  row.model ?? '—',
                  row.inputTokens != null ? fmtTokens(row.inputTokens) : null,
                  row.outputTokens != null ? fmtTokens(row.outputTokens) : null,
                  fmtPreciseCurrency(row.estimatedCostEur),
                  row.imageCount != null ? fmtNumber(row.imageCount) : '—'
                ])}
                emptyMsg="Sin llamadas IA en los últimos 7 días"
              />
            </Panel>
          </div>
        </>
      )}

      {/* Simulacros breakdown */}
      <SectionHeader>Simulacros — desglose completo</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        <StatCard label="Total" value={fmtNumber(m.simulacrosStats.total)} />
        <StatCard label="Completados" value={fmtNumber(m.simulacrosStats.completados)} accent />
        <StatCard label="En progreso" value={fmtNumber(m.simulacrosStats.enProgreso)} warn={m.simulacrosStats.enProgreso > 0} />
        <StatCard
          label="Poss. abandonados"
          value={fmtNumber(m.simulacrosStats.abandoned)}
          sub="+2h sin completar"
          warn={m.simulacrosStats.abandoned > 0}
        />
        <StatCard
          label="Tasa finalización"
          value={fmtPercent(m.simulacrosStats.completionRate)}
          accent={m.simulacrosStats.completionRate >= 0.5}
          warn={m.simulacrosStats.completionRate > 0 && m.simulacrosStats.completionRate < 0.5}
        />
      </div>

      {/* By route+action */}
      <SectionHeader>Uso por acción — últimos 7 días</SectionHeader>
      <Panel>
        <Table
          cols={['Acción', 'Llamadas', 'Tokens', 'Coste est.', 'Errores']}
          rows={m.byRouteAction.map(r => [
            r.label,
            fmtNumber(r.calls),
            fmtTokens(r.tokens),
            fmtCurrency(r.costEur),
            r.errors > 0
              ? <span style={{ color: '#dc2626', fontWeight: 700 }}>{fmtNumber(r.errors)}</span>
              : '0'
          ])}
          emptyMsg="Sin eventos IA en los últimos 7 días"
        />
      </Panel>

      {/* Top users */}
      <SectionHeader>Top usuarios por tokens — últimos 30 días</SectionHeader>
      <Panel>
        <Table
          cols={['ID usuario', 'Llamadas', 'Tokens', 'Coste est.', 'Última actividad']}
          rows={m.topUsers.map(u => [
            maskUserId(u.userId),
            fmtNumber(u.calls),
            fmtTokens(u.tokens),
            fmtCurrency(u.costEur),
            u.lastActive ? fmtDate(u.lastActive) : null
          ])}
          emptyMsg="Sin datos de usuarios"
        />
      </Panel>

      {/* Recent events */}
      <SectionHeader>Últimos 50 eventos IA</SectionHeader>
      <Panel>
        <Table
          cols={['Fecha', 'Acción', 'Tokens', 'Estado']}
          rows={m.recentEvents.map(e => [
            fmtDate(e.createdAt),
            e.label,
            e.totalTokens != null ? fmtTokens(e.totalTokens) : null,
            <StatusBadge key={e.createdAt} status={e.status} errorCode={e.errorCode} />
          ])}
          emptyMsg="Sin eventos recientes"
        />
      </Panel>

      {/* Recent errors */}
      <SectionHeader>Errores últimas 24h</SectionHeader>
      <Panel>
        <Table
          cols={['Fecha', 'Acción', 'Código']}
          rows={m.recentErrors.map(e => [
            fmtDate(e.createdAt),
            e.action,
            e.errorCode ?? 'unknown'
          ])}
          emptyMsg="Sin errores en las últimas 24h"
        />
      </Panel>

      {/* Corrections */}
      <SectionHeader>Correcciones recientes</SectionHeader>
      <Panel>
        <Table
          cols={['Fecha', 'Asignatura', 'Nota', 'Máx']}
          rows={m.productActivity.recentCorrections.map(r => [
            fmtDate(r.createdAt),
            r.asignatura || '—',
            r.nota != null ? String(r.nota) : null,
            r.notaMaxima != null ? String(r.notaMaxima) : null
          ])}
          emptyMsg="Sin correcciones recientes"
        />
      </Panel>

      {/* Simulacros recientes */}
      <SectionHeader>Simulacros recientes</SectionHeader>
      <Panel>
        <Table
          cols={['Fecha', 'Asignatura', 'Estado', 'Nota']}
          rows={m.productActivity.recentSimulacros.map(r => [
            fmtDate(r.createdAt),
            r.asignatura,
            <EstadoBadge key={r.createdAt + r.asignatura} estado={r.estado} />,
            r.notaFinal != null ? String(r.notaFinal) : null
          ])}
          emptyMsg="Sin simulacros recientes"
        />
      </Panel>

      {/* Billing */}
      <SectionHeader>Billing · Parent Checkout</SectionHeader>
      <Panel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, padding: 16 }}>
          <StatCard label="Links creados (7d)" value={String(m.billingMetrics.linksCreated7d)} />
          <StatCard label="Pagos completados (7d)" value={String(m.billingMetrics.linksPaid7d)} accent />
          <StatCard label="Links creados (30d)" value={String(m.billingMetrics.linksCreated30d)} />
          <StatCard label="Pagos completados (30d)" value={String(m.billingMetrics.linksPaid30d)} accent />
          <StatCard label="Entitlements activos" value={String(m.billingMetrics.activeEntitlements)} accent />
          <StatCard label="Revenue (7d)" value={fmtCurrency(m.billingMetrics.revenueEurCents7d / 100)} accent />
        </div>
        {m.billingMetrics.recentLinks.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '0 16px 8px' }}>
              Últimos parent links
            </p>
            <Table
              cols={['Fecha', 'Estado', 'Plan', 'Precio', 'User ID']}
              rows={m.billingMetrics.recentLinks.map(r => [
                fmtDate(r.createdAt),
                r.status,
                r.planId,
                fmtCurrency(r.priceCents / 100),
                maskUserId(r.studentUserId)
              ])}
              emptyMsg=""
            />
          </>
        )}
      </Panel>

      {/* Camino PAU */}
      <SectionHeader>Camino PAU</SectionHeader>
      <Panel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, padding: 16 }}>
          <StatCard label="Usuarios activos (7d)" value={String(m.caminoMetrics.activeUsers7d)} />
          <StatCard label="Tareas completadas (7d)" value={String(m.caminoMetrics.tasksCompleted7d)} />
          <StatCard label="Tareas completadas (30d)" value={String(m.caminoMetrics.tasksCompleted30d)} />
          <StatCard label="Misiones completadas (7d)" value={String(m.caminoMetrics.missionsCompleted7d)} />
          <StatCard label="XP generado (7d)" value={String(m.caminoMetrics.xpGenerated7d)} />
          <StatCard label="Racha media (días)" value={String(m.caminoMetrics.avgStreak)} />
          <StatCard label="Tasa misión completada" value={`${Math.round(m.caminoMetrics.missionCompletionRate * 100)}%`} />
        </div>
        {Object.keys(m.caminoMetrics.routeDistribution).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Distribución de rutas</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(m.caminoMetrics.routeDistribution).sort((a, b) => b[1] - a[1]).map(([route, count]) => (
                <span key={route} style={{ background: C.border, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  {route}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <p style={{ marginTop: 28, fontSize: 10, color: C.muted, textAlign: 'right', borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
        Actualizado: {fmtDate(m.calculatedAt)} · Coste estimado — input: ×0,0000028 €/token · output: ×0,000014 €/token · Estimación aproximada, no facturación real.
      </p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' })

  async function load(cancelled?: { current: boolean }) {
    const { data: { session } } = await supabase.auth.getSession()
    if (cancelled?.current) return
    if (!session) { setState({ status: 'unauthenticated' }); return }

    const res = await fetch('/api/admin/metrics', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (cancelled?.current) return
    if (res.status === 403) { setState({ status: 'unauthorized' }); return }
    if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
    if (!res.ok) { setState({ status: 'error', message: `HTTP ${res.status}` }); return }
    const metrics: AdminMetrics = await res.json()
    setState({ status: 'loaded', metrics })
  }

  useEffect(() => {
    const guard = { current: false }
    // async con cancelled guard — setState ocurre de forma asíncrona, no síncrona
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(guard)
    return () => { guard.current = true }
  }, [])

  function refresh() {
    setState({ status: 'loading' })
    load()
  }

  const isLoaded = state.status === 'loaded'
  const updatedAt = isLoaded ? fmtDate(state.metrics.calculatedAt) : null

  return (
    <div style={{ minHeight: '100vh', background: C.light }}>
      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.bgDark} 0%, ${C.bg} 100%)`, padding: '0 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Link href="/" style={{ color: '#999', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                ← Volver a Kairo
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0f2fe', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                Solo usuarios internos
              </span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Panel interno
            </h1>
            <p style={{ color: '#999', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>
              Métricas básicas para controlar la beta de Kairo.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/admin/camino-preview"
              style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 700, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, padding: '5px 12px' }}
            >
              Preview Camino PAU
            </Link>
            <Link
              href="/admin/camino-status"
              style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 700, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, padding: '5px 12px' }}
            >
              Estado por usuario
            </Link>
            {updatedAt && (
              <span style={{ color: '#e0e0e0', fontSize: 11, fontWeight: 500 }}>
                Actualizado: {updatedAt}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={state.status === 'loading'}
              style={{
                background: state.status === 'loading' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 8, padding: '8px 18px',
                fontSize: 12, fontWeight: 700, cursor: state.status === 'loading' ? 'default' : 'pointer',
                opacity: state.status === 'loading' ? 0.6 : 1
              }}
            >
              {state.status === 'loading' ? 'Cargando…' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px' }}>
        {state.status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando métricas…</p>
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
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700, marginBottom: 12 }}>Error cargando métricas: {state.message}</p>
            <button onClick={refresh} style={{ color: C.bg, fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Reintentar
            </button>
          </div>
        )}

        {state.status === 'loaded' && <Dashboard m={state.metrics} />}
      </div>
    </div>
  )
}
