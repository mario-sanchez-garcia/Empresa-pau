'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'

// ─── Design tokens ───────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
type V2MissionRow = {
  sort_order: number
  title: string
  block_key: string
  block_slug: string
  subject: string
  video_id: string | null
  concept_markdown: string | null
  worked_example_markdown: string | null
  practice_prompt: string | null
}

type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; mat: V2MissionRow[]; his: V2MissionRow[] }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(title: string): string {
  return title
    .replace(/\$[^$]*\$/g, '')
    .replace(/[()[\]{}$\\·×]/g, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
}

function Indicator({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 700,
      color: ok ? '#15803d' : '#94a3b8',
      background: ok ? '#f0fdf4' : '#f8fafc',
      border: `1px solid ${ok ? '#bbf7d0' : '#e2e8f0'}`,
      borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap',
    }}>
      {ok ? '✅' : '❌'} {label}
    </span>
  )
}

// ─── Preview Table ────────────────────────────────────────────────────────────
function V2PreviewTable({ rows, subjectLabel, blockOrder = [] }: {
  rows: V2MissionRow[]
  subjectLabel: string
  blockOrder?: string[]
}) {
  const byBlock: Record<string, V2MissionRow[]> = {}
  for (const row of rows) {
    if (!byBlock[row.block_key]) byBlock[row.block_key] = []
    byBlock[row.block_key].push(row)
  }

  const blocks = blockOrder.filter(b => byBlock[b]).concat(
    Object.keys(byBlock).filter(b => !blockOrder.includes(b))
  )

  if (blocks.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: C.muted, fontStyle: 'italic', fontSize: 14 }}>
        No hay misiones en curriculum_content_v2 todavía.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {blocks.map(blockKey => {
        const blockRows = byBlock[blockKey]
        const conVideo = blockRows.filter(r => r.video_id).length
        const conConcepto = blockRows.filter(r => r.concept_markdown?.trim()).length
        const conCaso = blockRows.filter(r => r.worked_example_markdown?.trim()).length
        const conEjercicio = blockRows.filter(r => r.practice_prompt?.trim()).length

        return (
          <div key={blockKey} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
            {/* Block header */}
            <div style={{ background: '#f8faff', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 2px' }}>
                  {subjectLabel}
                </p>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: 0 }}>
                  {blockKey}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{blockRows.length} misiones</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>🎥 {conVideo}</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>📝 {conConcepto}/{blockRows.length} concepto</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>🟢 {conCaso}/{blockRows.length} caso</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>✏️ {conEjercicio}/{blockRows.length} ejercicio</span>
              </div>
            </div>

            {/* Mission rows */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['#', 'Título', 'Indicadores', 'Ver lección'].map(col => (
                      <th key={col} style={{
                        textAlign: 'left', padding: '8px 14px',
                        color: C.muted, fontWeight: 700, fontSize: 10,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blockRows.map((row, i) => {
                    const topicSlug = slugify(row.title)
                    const href = `/camino-pau/curso/${row.subject}/${row.block_slug}/${topicSlug}`
                    const tieneConcepto = Boolean(row.concept_markdown?.trim())
                    const tieneCaso = Boolean(row.worked_example_markdown?.trim())
                    const tieneEjercicio = Boolean(row.practice_prompt?.trim())
                    const tieneVideo = Boolean(row.video_id)

                    return (
                      <tr key={row.sort_order} style={{ background: i % 2 === 0 ? C.surface : '#fafcff' }}>
                        <td style={{ padding: '9px 14px', color: C.muted, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                          {row.sort_order}
                        </td>
                        <td style={{ padding: '9px 14px', color: C.ink, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.border}`, minWidth: 220 }}>
                          {row.title}
                        </td>
                        <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            <Indicator ok={tieneConcepto} label="concepto" />
                            <Indicator ok={tieneCaso} label="caso" />
                            <Indicator ok={tieneEjercicio} label="ejercicio" />
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 11, fontWeight: 700,
                              color: tieneVideo ? '#1d4ed8' : '#94a3b8',
                              background: tieneVideo ? '#eff6ff' : '#f8fafc',
                              border: `1px solid ${tieneVideo ? '#bfdbfe' : '#e2e8f0'}`,
                              borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap',
                            }}>
                              {tieneVideo ? '🎥' : '❌'} video
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                          <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: C.bg, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, rows }: { title: string; rows: V2MissionRow[] }) {
  const conVideo = rows.filter(r => r.video_id).length
  const conConcepto = rows.filter(r => r.concept_markdown?.trim()).length
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
        {rows.length} flashcards · {conVideo} con vídeo · {conConcepto} con concepto
      </p>
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

      const { data, error } = await supabase
        .from('curriculum_content_v2')
        .select('sort_order, title, block_key, block_slug, subject, video_id, concept_markdown, worked_example_markdown, practice_prompt')
        .in('subject', ['matematicas_ii', 'historia_espana'])
        .order('sort_order', { ascending: true })

      if (cancelled) return
      if (error) { setState({ status: 'error', message: error.message }); return }

      const all = (data ?? []) as V2MissionRow[]
      setState({
        status: 'loaded',
        mat: all.filter(r => r.subject === 'matematicas_ii'),
        his: all.filter(r => r.subject === 'historia_espana'),
      })
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
              curriculum_content_v2 · Matemáticas II (60) · Historia de España (128)
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>
        {state.status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando misiones…</p>
          </div>
        )}

        {state.status === 'unauthenticated' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 12 }}>Inicia sesión para acceder.</p>
            <a href="/login" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline' }}>Ir a login →</a>
          </div>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700 }}>Error: {state.message}</p>
          </div>
        )}

        {state.status === 'loaded' && (
          <>
            {/* ── Matemáticas II ── */}
            <section style={{ marginBottom: 52 }}>
              <SectionHeader title="Matemáticas II" rows={state.mat} />
              <V2PreviewTable
                rows={state.mat}
                subjectLabel="Matemáticas II"
                blockOrder={['Álgebra', 'Geometría', 'Análisis', 'Probabilidad']}
              />
            </section>

            {/* ── Historia de España ── */}
            <section>
              <SectionHeader title="Historia de España" rows={state.his} />
              <V2PreviewTable
                rows={state.his}
                subjectLabel="Historia de España"
              />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
