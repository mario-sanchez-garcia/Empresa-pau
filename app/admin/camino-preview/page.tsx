'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { useIsInternalUser } from '@/app/hooks/useIsInternalUser'
import { buildTopicHref, getTopicByV2SortOrder, normalizeCaminoSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from '@/app/lib/camino/caminoCurriculumPlan'
import type { CaminoContentV2Row } from '@/app/api/admin/camino-content-v2/route'

// ─── Design tokens ───────────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
type V2Row = CaminoContentV2Row

type SubjectKey = 'matematicas_ii' | 'lengua' | 'historia_espana' | 'fisica' | 'quimica' | 'economia' | 'matematicas_ccss'

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; rows: V2Row[] }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function textSlug(title: string): string {
  return normalizeCaminoSlug(title)
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
  rows: V2Row[]
  subjectLabel: string
  blockOrder?: string[]
}) {
  const byBlock: Record<string, V2Row[]> = {}
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
            <div style={{ background: '#f8faff', padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 2px' }}>
                  {subjectLabel}
                </p>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: 0 }}>{blockKey}</h2>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{blockRows.length} misiones</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>🎥 {conVideo}</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>📝 {conConcepto}/{blockRows.length} concepto</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>🟢 {conCaso}/{blockRows.length} caso</span>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>✏️ {conEjercicio}/{blockRows.length} ejercicio</span>
              </div>
            </div>
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
                    // v2SortOrder solo es una FK real a curriculum_content_v2 cuando
                    // contentStatus === 'flashcard_v2' (topic publicado desde esta
                    // misma tabla). Para el resto de contentStatus (p.ej. 'latex_notes'),
                    // v2SortOrder es metadata de orden de calendario sin relación con
                    // esta tabla, y coincide numéricamente por pura casualidad — de ahí
                    // que los primeros temas de un borrador nuevo (sort_order 1, 2, 3…)
                    // enlazasen a temas antiguos de beta no relacionados. Mismo guard
                    // que ya usa CaminoTopicClient.tsx y /api/camino/correct.
                    const linkedTopic = getTopicByV2SortOrder(row.subject, row.sort_order)
                    const trustedLinkedTopic = linkedTopic?.contentStatus === 'flashcard_v2' ? linkedTopic : null
                    const topicSlug = resolveTopicSlugAlias(row.subject, row.block_slug, textSlug(sanitizeLessonTitle(row.title)))
                    const href = trustedLinkedTopic ? buildTopicHref(trustedLinkedTopic) : `/camino-pau/curso/${row.subject}/${row.block_slug}/${topicSlug}`
                    return (
                      // sort_order es único por subject en los datos actuales, pero
                      // no hay una restricción UNIQUE que lo garantice en el esquema
                      // — se combina con subject por si acaso, en vez de asumirlo.
                      <tr key={`${row.subject}-${row.sort_order}`} style={{ background: i % 2 === 0 ? C.surface : '#fafcff' }}>
                        <td style={{ padding: '9px 14px', color: C.muted, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                          {row.sort_order}
                        </td>
                        <td style={{ padding: '9px 14px', color: C.ink, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.border}`, minWidth: 220 }}>
                          {sanitizeLessonTitle(row.title)}
                        </td>
                        <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            <Indicator ok={Boolean(row.concept_markdown?.trim())} label="concepto" />
                            <Indicator ok={Boolean(row.worked_example_markdown?.trim())} label="caso" />
                            <Indicator ok={Boolean(row.practice_prompt?.trim())} label="ejercicio" />
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: 11, fontWeight: 700,
                              color: row.video_id ? '#1d4ed8' : '#94a3b8',
                              background: row.video_id ? '#eff6ff' : '#f8fafc',
                              border: `1px solid ${row.video_id ? '#bfdbfe' : '#e2e8f0'}`,
                              borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap',
                            }}>
                              {row.video_id ? '🎥' : '❌'} video
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                          <Link href={href} target="_blank" rel="noopener noreferrer"
                            style={{ color: C.bg, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
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

// ─── Subject config ───────────────────────────────────────────────────────────
const SUBJECTS: { key: SubjectKey; label: string; blockOrder?: string[] }[] = [
  { key: 'matematicas_ii', label: 'Matemáticas II', blockOrder: ['Álgebra', 'Geometría', 'Análisis', 'Probabilidad'] },
  // Borrador sin publicar (review_status='draft') — visible solo aquí, en
  // el admin, nunca en el flujo real de alumnos (ver filtro en
  // generateCaminoPlan.ts / add-subject/route.ts).
  { key: 'matematicas_ccss', label: 'Matemáticas CCSS (borrador)', blockOrder: ['Álgebra', 'Análisis', 'Probabilidad', 'Inferencia'] },
  // El orden replica el del examen oficial de Madrid: Comunicación (4 pts),
  // Reflexión sobre la lengua (3 pts) y Educación literaria (3 pts).
  { key: 'lengua', label: 'Lengua Castellana', blockOrder: ['Comunicación', 'Reflexión sobre la lengua', 'Educación literaria'] },
  { key: 'historia_espana', label: 'Historia de España' },
  { key: 'fisica', label: 'Física', blockOrder: ['Campo Gravitatorio', 'Campo Electromagnético', 'Vibraciones y Ondas', 'Óptica Geométrica', 'Física del Siglo XX'] },
  { key: 'quimica', label: 'Química', blockOrder: ['Estequiometría', 'Estructura Atómica y Clasificación Periódica', 'Enlace Químico y Propiedades de las Sustancias', 'Termoquímica', 'Equilibrio Químico y Cinética', 'Ácido-Base', 'Electroquímica', 'Química Orgánica'] },
  { key: 'economia', label: 'Economía de la Empresa', blockOrder: ['La Empresa y su Entorno', 'Desarrollo y Crecimiento de la Empresa', 'Organización y Dirección de la Empresa', 'La Función Productiva', 'La Función Comercial: El Marketing', 'La Información en la Empresa: Contabilidad y Fiscalidad', 'La Función Financiera'] },
]

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CaminoPreviewPage() {
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('matematicas_ii')
  const [cache, setCache] = useState<Partial<Record<SubjectKey, LoadState>>>({})

  // Autorización real: useIsInternalUser llama a /api/admin/me, que verifica
  // el JWT del usuario en el servidor contra isInternalUser() (misma lista
  // INTERNAL_USER_EMAILS que ya usan el resto de rutas /api/admin/*). No
  // basta con esto para la seguridad real de los datos — ver
  // /api/admin/camino-content-v2, que vuelve a comprobarlo en el servidor
  // antes de servir ninguna fila — pero sí decide qué ve esta página.
  const internalUser = useIsInternalUser()
  // Sesión, solo para distinguir "no has iniciado sesión" de "has iniciado
  // sesión pero no eres del equipo interno" en el mensaje mostrado — ambos
  // casos ya están bloqueados igual por internalUser.isInternalUser=false.
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setHasSession(Boolean(session))
    })
    return () => { cancelled = true }
  }, [])

  // Ref sincronizada con cache en cada render, para poder consultar "¿ya
  // está cargado este subject?" dentro del efecto de carga SIN declarar
  // cache como dependencia — así cambiar de asignatura no repite peticiones
  // ya cacheadas, y no hace falta silenciar exhaustive-deps.
  const cacheRef = useRef(cache)
  cacheRef.current = cache

  const loadSubject = useCallback((subject: SubjectKey) => {
    let cancelled = false
    setCache(c => ({ ...c, [subject]: { status: 'loading' } }))
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session?.access_token) {
        setCache(c => ({ ...c, [subject]: { status: 'error', message: 'No autorizado' } }))
        return
      }
      try {
        const res = await fetch(`/api/admin/camino-content-v2?subject=${encodeURIComponent(subject)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (cancelled) return
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          setCache(c => ({ ...c, [subject]: { status: 'error', message: body?.error || `HTTP ${res.status}` } }))
          return
        }
        setCache(c => ({ ...c, [subject]: { status: 'loaded', rows: (body.rows ?? []) as V2Row[] } }))
      } catch (e) {
        if (cancelled) return
        setCache(c => ({ ...c, [subject]: { status: 'error', message: e instanceof Error ? e.message : String(e) } }))
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Carga la asignatura activa cuando hace falta (primera vez, o cambio de
  // asignatura sin caché todavía) — loadSubject es estable (useCallback sin
  // dependencias), así que incluirla aquí no repite el efecto de más.
  useEffect(() => {
    if (!internalUser.isInternalUser) return
    const already = cacheRef.current[activeSubject]
    if (already && already.status !== 'idle') return
    return loadSubject(activeSubject)
  }, [internalUser.isInternalUser, activeSubject, loadSubject])

  const subjectCfg = SUBJECTS.find(s => s.key === activeSubject)!
  const loadState = cache[activeSubject] ?? { status: 'idle' }

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
                Volver a Kairo
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
              curriculum_content_v2
            </p>
          </div>

          {/* ── Subject selector ── */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUBJECTS.map(s => {
              const active = s.key === activeSubject
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSubject(s.key)}
                  aria-pressed={active}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: active ? '2px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.25)',
                    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 800 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 48px' }}>

        {internalUser.loading && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Verificando acceso…</p>
          </div>
        )}

        {!internalUser.loading && !internalUser.isInternalUser && hasSession === false && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 12 }}>Inicia sesión para acceder.</p>
            <a href="/login" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline' }}>Ir a login →</a>
          </div>
        )}

        {!internalUser.loading && !internalUser.isInternalUser && hasSession !== false && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 8 }}>No tienes acceso a esta página.</p>
            <p style={{ fontSize: 13, color: C.muted }}>Solo los usuarios del equipo interno pueden ver este panel.</p>
            <Link href="/" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline', display: 'block', marginTop: 16 }}>← Volver a Kairo</Link>
          </div>
        )}

        {internalUser.isInternalUser && (loadState.status === 'idle' || loadState.status === 'loading') && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando {subjectCfg.label}…</p>
          </div>
        )}

        {internalUser.isInternalUser && loadState.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700, marginBottom: 4 }}>No se ha podido cargar esta asignatura.</p>
            {/* Detalle técnico visible solo para depuración — nunca es el único mensaje mostrado. */}
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{loadState.message}</p>
            <button
              onClick={() => loadSubject(activeSubject)}
              style={{ color: C.bg, fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {internalUser.isInternalUser && loadState.status === 'loaded' && (
          <>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                {loadState.rows.length} misiones
                {' · '}{loadState.rows.filter(r => r.video_id).length} con vídeo
                {' · '}{loadState.rows.filter(r => r.concept_markdown?.trim()).length} con concepto
              </p>
            </div>
            <V2PreviewTable
              rows={loadState.rows}
              subjectLabel={subjectCfg.label}
              blockOrder={subjectCfg.blockOrder}
            />
          </>
        )}
      </div>
    </div>
  )
}
