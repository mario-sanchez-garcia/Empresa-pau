'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import type { CurriculumRow } from '@/app/api/admin/camino-content/route'

// ─── Design tokens (shared with admin panel) ────────────────────────────────
const C = {
  bg: '#2563eb',
  bgDark: '#1d4ed8',
  light: '#eff6ff',
  accent: '#60a5fa',
  ink: '#111827',
  muted: '#64748b',
  border: '#dbe7fb',
  surface: '#ffffff',
  shadow: '0 4px 24px rgba(37,99,235,0.07)',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function fmtChars(n: number): string {
  if (n === 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M chars`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K chars`
  return `${n} chars`
}

// ─── State ───────────────────────────────────────────────────────────────────
type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; rows: CurriculumRow[] }

// ─── Grouped view ────────────────────────────────────────────────────────────
function CaminoPreviewTable({ rows }: { rows: CurriculumRow[] }) {
  const byBlock: Record<string, CurriculumRow[]> = {}
  for (const row of rows) {
    if (!byBlock[row.block_slug]) byBlock[row.block_slug] = []
    byBlock[row.block_slug].push(row)
  }

  if (Object.keys(byBlock).length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: C.muted, fontStyle: 'italic', fontSize: 14 }}>
        No hay contenido en curriculum_content todavía.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(byBlock).map(([blockSlug, blockRows]) => {
        const subject = blockRows[0].subject
        const totalChars = blockRows.reduce((s, r) => s + r.char_count, 0)
        return (
          <div key={blockSlug} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
            {/* Block header */}
            <div style={{ background: '#f8faff', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 2px' }}>
                  {slugToTitle(subject)}
                </p>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: 0 }}>
                  {slugToTitle(blockSlug)}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                  {blockRows.length} tema{blockRows.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                  {fmtChars(totalChars)} total
                </span>
              </div>
            </div>

            {/* Topics table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Tema', 'Slug', 'Contenido', 'Ver lección'].map(col => (
                      <th key={col} style={{
                        textAlign: 'left', padding: '8px 14px',
                        color: C.muted, fontWeight: 700, fontSize: 10,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap'
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blockRows.map((row, i) => (
                    <tr key={row.topic_slug} style={{ background: i % 2 === 0 ? C.surface : '#fafcff' }}>
                      <td style={{ padding: '9px 14px', color: C.ink, fontWeight: 600, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
                        {slugToTitle(row.topic_slug)}
                      </td>
                      <td style={{ padding: '9px 14px', color: C.muted, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                        {row.topic_slug}
                      </td>
                      <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: row.char_count > 500 ? '#f0fdf4' : row.char_count > 0 ? '#fffbeb' : '#f9fafb',
                          color: row.char_count > 500 ? '#15803d' : row.char_count > 0 ? '#b45309' : C.muted,
                          border: `1px solid ${row.char_count > 500 ? '#bbf7d0' : row.char_count > 0 ? '#fde68a' : C.border}`,
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700
                        }}>
                          {fmtChars(row.char_count)}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}` }}>
                        <Link
                          href={`/camino-pau/curso/${row.subject}/${row.block_slug}/${row.topic_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: C.bg, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CaminoPreviewPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) { setState({ status: 'unauthenticated' }); return }

      const res = await fetch('/api/admin/camino-content', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (cancelled) return
      if (res.status === 403) { setState({ status: 'unauthorized' }); return }
      if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try { const body = await res.json(); if (body?.error) msg = body.error } catch { /* ignore */ }
        setState({ status: 'error', message: msg }); return
      }
      const rows: CurriculumRow[] = await res.json()
      setState({ status: 'loaded', rows })
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.light} 0%, #f8faff 100%)` }}>
      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.bgDark} 0%, ${C.bg} 100%)`, padding: '0 32px', boxShadow: '0 2px 20px rgba(37,99,235,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <Link href="/admin" style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                ← Panel admin
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <Link href="/" style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                Volver a Pausia
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0f2fe', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                Solo usuarios internos
              </span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Preview Camino PAU
            </h1>
            <p style={{ color: '#93c5fd', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>
              Contenido de curriculum_content agrupado por bloque.
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>
        {state.status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando contenido…</p>
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
            <Link href="/" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline', display: 'block', marginTop: 16 }}>← Volver a Pausia</Link>
          </div>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700 }}>Error: {state.message}</p>
          </div>
        )}

        {state.status === 'loaded' && (
          <>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                {state.rows.length} tema{state.rows.length !== 1 ? 's' : ''} en total
              </p>
            </div>
            <CaminoPreviewTable rows={state.rows} />
          </>
        )}
      </div>
    </div>
  )
}
