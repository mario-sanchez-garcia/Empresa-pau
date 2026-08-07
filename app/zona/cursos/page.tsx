'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle2, LayoutGrid, Lock, RotateCcw, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'
import KairoSpinner from '@/app/components/ui/KairoSpinner'
import SectionIntroCard from '@/components/shared/SectionIntroCard'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import { useIsInternalUser } from '@/app/hooks/useIsInternalUser'
import type { ZonaUser } from '@/components/zona/types'
import {
  CAMINO_CURRICULUM_TOPICS,
  buildTopicHref,
  sanitizeLessonTitle,
  subjectLabelFromSlug,
  type CaminoCurriculumTopic,
} from '@/app/lib/camino/caminoCurriculumPlan'
import { DEFAULT_GRADE_THRESHOLD_CONFIG, resolveGradeThreshold, shouldSuggestRepeat, type GradeThresholdConfig } from '@/app/lib/camino/gradeThreshold'

const LIBRARY_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_134153_21d8ecce-c198-4ae1-8fc9-22814072fdbc.png'

// Same palette Camino PAU uses for these subjects (SUBJECT_COLORS in
// CaminoCalendarClient.tsx), keyed by slug instead of label so it lines up
// directly with the subject values stored in user_learning_queue.
const SUBJECT_ACCENT: Record<string, { bg: string; text: string; border: string }> = {
  matematicas_ii: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  matematicas_ccss: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  fisica: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  quimica: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  biologia: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  historia_espana: { bg: '#fff8f1', text: '#78350f', border: '#fed7aa' },
  historia_filosofia: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  lengua: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  ingles: { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
}
function accentFor(subject: string) {
  return SUBJECT_ACCENT[subject] ?? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
}

const HIDDEN_COURSE_SUBJECTS = new Set(['matematicas_ccss'])

type QueueStatus = 'pending' | 'scheduled' | 'completed' | 'postponed' | 'inactive'
type QueueRow = {
  subject: string
  block_key: string | null
  block_slug: string | null
  v2_sort_order: number | null
  title: string
  subject_position: number | null
  queue_status: QueueStatus
}
type CalendarRow = {
  subject: string
  v2_sort_order: number | null
  status: 'pending' | 'completed' | 'missed' | 'postponed'
  completed_at: string | null
}
type HistorialGradeRow = {
  id: string
  asignatura: string
  v2_sort_order: number | null
  nota: number | null
  nota_maxima: number | null
  created_at: string
}

type CourseStatus = 'completed' | 'today'
type CourseEntry = {
  key: string
  title: string
  orderIndex: number
  status: CourseStatus
  completedAt?: string
  href: string | null
  nota: number | null
  notaMaxima: number | null
  latestHistorialId: string | null
}
type BlockGroup = { blockTitle: string; orderIndex: number; items: CourseEntry[] }
type SubjectGroup = {
  subject: string
  label: string
  blocks: BlockGroup[]
  total: number
  completed: number
}

const TOPIC_BY_V2 = new Map<string, CaminoCurriculumTopic>()
const TOPIC_BY_ORDER = new Map<string, CaminoCurriculumTopic>()
for (const topic of CAMINO_CURRICULUM_TOPICS) {
  if (topic.v2SortOrder != null) TOPIC_BY_V2.set(`${topic.subject}:${topic.v2SortOrder}`, topic)
  TOPIC_BY_ORDER.set(`${topic.subject}:${topic.orderIndex}`, topic)
}
function findTopic(subject: string, v2SortOrder: number | null): CaminoCurriculumTopic | null {
  if (v2SortOrder == null) return null
  return TOPIC_BY_V2.get(`${subject}:${v2SortOrder}`) ?? TOPIC_BY_ORDER.get(`${subject}:${v2SortOrder}`) ?? null
}

function formatGrade(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function buildSubjectGroups(queueRows: QueueRow[], calendarRows: CalendarRow[], gradeRows: HistorialGradeRow[]): SubjectGroup[] {
  // Every topic that already has curriculum content is open to everyone right
  // away (no scheduling wait) — only completion is tracked from camino_calendar.
  const completedByKey = new Map<string, CalendarRow>()
  for (const row of calendarRows) {
    if (row.v2_sort_order == null || row.status !== 'completed') continue
    const key = `${row.subject}:${row.v2_sort_order}`
    const prev = completedByKey.get(key)
    if (!prev || (row.completed_at ?? '') > (prev.completed_at ?? '')) completedByKey.set(key, row)
  }

  // Nota más reciente por tema (subject+v2_sort_order) — gradeRows ya viene
  // ordenado por created_at desc, así que la primera fila vista por key es
  // la más reciente. Solo tipo='Camino PAU' con v2_sort_order relleno
  // corresponde a una corrección de un tema de Cursos (ver CaminoTopicClient.tsx).
  const latestGradeByKey = new Map<string, HistorialGradeRow>()
  for (const row of gradeRows) {
    if (row.v2_sort_order == null || row.nota == null) continue
    const key = `${row.asignatura}:${row.v2_sort_order}`
    if (!latestGradeByKey.has(key)) latestGradeByKey.set(key, row)
  }

  const subjects = new Map<string, Map<string, BlockGroup>>()
  const totals = new Map<string, { total: number; completed: number }>()

  for (const q of queueRows) {
    if (HIDDEN_COURSE_SUBJECTS.has(q.subject)) continue

    const key = `${q.subject}:${q.v2_sort_order}`
    const topic = findTopic(q.subject, q.v2_sort_order)
    const completedRow = completedByKey.get(key)
    const gradeRow = latestGradeByKey.get(key)

    let status: CourseStatus = 'today'
    let completedAt: string | undefined
    if (q.queue_status === 'completed' || completedRow) {
      status = 'completed'
      completedAt = completedRow?.completed_at ?? undefined
    }

    const blockTitle = sanitizeLessonTitle(topic?.blockTitle ?? q.block_key ?? 'General')
    const entry: CourseEntry = {
      key,
      title: sanitizeLessonTitle(topic?.title ?? q.title),
      orderIndex: topic?.orderIndex ?? q.subject_position ?? 0,
      status,
      completedAt,
      href: topic ? buildTopicHref(topic) : null,
      nota: gradeRow?.nota ?? null,
      notaMaxima: gradeRow?.nota_maxima ?? null,
      latestHistorialId: gradeRow?.id ?? null,
    }

    if (!subjects.has(q.subject)) subjects.set(q.subject, new Map())
    const blocks = subjects.get(q.subject)!
    if (!blocks.has(blockTitle)) blocks.set(blockTitle, { blockTitle, orderIndex: entry.orderIndex, items: [] })
    const block = blocks.get(blockTitle)!
    block.items.push(entry)
    block.orderIndex = Math.min(block.orderIndex, entry.orderIndex)

    const t = totals.get(q.subject) ?? { total: 0, completed: 0 }
    t.total += 1
    if (status === 'completed') t.completed += 1
    totals.set(q.subject, t)
  }

  return [...subjects.entries()]
    .map(([subject, blocks]) => {
      const blockList = [...blocks.values()]
        .map(block => ({ ...block, items: block.items.slice().sort((a, b) => a.orderIndex - b.orderIndex) }))
        .sort((a, b) => a.orderIndex - b.orderIndex)
      const t = totals.get(subject) ?? { total: 0, completed: 0 }
      return { subject, label: subjectLabelFromSlug(subject), blocks: blockList, total: t.total, completed: t.completed }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

const STATUS_META: Record<CourseStatus, { label: string; color: string; bg: string; border: string; Icon: typeof CheckCircle2 }> = {
  completed: { label: 'Completado', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
  today: { label: 'Disponible', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: Zap },
}

export default function ZonaCursosPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [groups, setGroups] = useState<SubjectGroup[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [gradeThresholdConfig, setGradeThresholdConfig] = useState<GradeThresholdConfig>(DEFAULT_GRADE_THRESHOLD_CONFIG)
  const [confirmItem, setConfirmItem] = useState<CourseEntry | null>(null)
  const router = useRouter()
  const billing = useBillingStatus()
  const internalUser = useIsInternalUser()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser({ id: data.user.id, email: data.user.email })

      const [{ data: queueRows }, { data: calendarRows }, { data: gradeRows }] = await Promise.all([
        supabase
          .from('user_learning_queue')
          .select('subject, block_key, block_slug, v2_sort_order, title, subject_position, queue_status')
          .eq('user_id', data.user.id),
        supabase
          .from('camino_calendar')
          .select('subject, v2_sort_order, status, completed_at')
          .eq('user_id', data.user.id)
          .eq('status', 'completed'),
        supabase
          .from('historial_examenes')
          .select('id, asignatura, v2_sort_order, nota, nota_maxima, created_at')
          .eq('user_id', data.user.id)
          .eq('tipo', 'Camino PAU')
          .not('v2_sort_order', 'is', null)
          .order('created_at', { ascending: false })
          .limit(500),
      ])

      const built = buildSubjectGroups((queueRows ?? []) as QueueRow[], (calendarRows ?? []) as CalendarRow[], (gradeRows ?? []) as HistorialGradeRow[])
      setGroups(built)
      setSelectedSubject(prev => (prev && built.some(g => g.subject === prev)) ? prev : (built[0]?.subject ?? ''))

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (token) {
        try {
          const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json() as { grade_threshold_mode?: string; grade_threshold?: number | null; subject_grade_thresholds?: Record<string, number> }
            setGradeThresholdConfig({
              mode: json.grade_threshold_mode === 'per_subject' ? 'per_subject' : 'general',
              general: typeof json.grade_threshold === 'number' ? json.grade_threshold : null,
              bySubject: json.subject_grade_thresholds ?? {},
            })
          }
        } catch { /* usa el umbral por defecto si falla */ }
      }
      setLoading(false)
    }
    load()
  }, [router])

  const activeGroup = useMemo(() => groups.find(g => g.subject === selectedSubject) ?? groups[0], [groups, selectedSubject])
  const overallStats = useMemo(() => {
    const stats = { completed: 0, today: 0 }
    for (const group of groups) {
      for (const block of group.blocks) {
        for (const item of block.items) stats[item.status] += 1
      }
    }
    return stats
  }, [groups])

  if (loading || !user || billing.loading || internalUser.loading) return <KairoSpinner />

  // Mis Cursos is a paid-plan feature — internal/staff accounts always pass.
  const canAccess = billing.hasActivePack || internalUser.isInternalUser

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#f8fafc' }}>
      <style>{`
        .cursos-hero { height: 200px !important; }
        .cursos-hero-overlay { background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%) !important; padding: 20px 28px !important; }
        .cursos-hero-title { font-size: 40px !important; letter-spacing: -.035em !important; }
        /* iPad/tablet: mismo ajuste que La Zona/Mi Espacio — sin esto el
           hero se quedaba a altura de escritorio en tablet. */
        @media (min-width: 768px) and (max-width: 1024px) {
          .cursos-hero { height: 160px !important; }
          .cursos-hero-title { font-size: 32px !important; }
          .cursos-hero-overlay { padding: 18px 24px !important; }
        }
        @media (max-width: 767px) {
          .cursos-hero { height: 130px !important; }
          .cursos-hero-title { font-size: 28px !important; }
          .cursos-hero-overlay { padding: 16px 20px !important; }
          .cursos-main { padding: 16px 16px 20px !important; }
        }
      `}</style>
      <SidebarNav />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div className="cursos-hero" style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
          <img src={LIBRARY_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(.5) saturate(.7)' }} />
          <div className="cursos-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%)', display: 'flex', alignItems: 'flex-end', padding: '20px 28px' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Kairo · Todo tu temario</div>
              <div className="cursos-hero-title" style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-.035em', lineHeight: .9 }}>Mis Cursos</div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', padding: '0 20px', flexShrink: 0, overflowX: 'auto' }}>
          <a href="/zona" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#64748b', borderBottom: '3px solid transparent', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <Zap size={13} /> Zona de Estudio
          </a>
          {CANVAS_ENABLED && (
            <a href="/zona/canvas" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#64748b', borderBottom: '3px solid transparent', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <LayoutGrid size={13} /> Mi Espacio
            </a>
          )}
          <a href="/zona/cursos" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#0f172a', borderBottom: '3px solid #2563eb', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <BookOpen size={13} /> Mis Cursos
          </a>
        </div>

        <main className="kairo-page-scroll cursos-main" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          {!canAccess ? (
            <div style={{ borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', padding: '40px 28px', textAlign: 'center', maxWidth: 440, margin: '32px auto 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={22} color="#2563eb" />
              </div>
              <p style={{ fontSize: 15.5, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Mis Cursos es para alumnos con plan activo</p>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
                Desbloquea todo el temario de Camino PAU organizado por asignatura y bloque con cualquier plan de pago de Kairo.
              </p>
              <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#2563eb', padding: '11px 24px', fontSize: 13.5, fontWeight: 900, color: 'white', textDecoration: 'none' }}>Ver planes</a>
            </div>
          ) : (
            <>
              <SectionIntroCard
                hintKey="hint_zona_cursos"
                line1="Aquí están todos tus cursos de Camino PAU, organizados por asignatura y bloque."
                line2="Ve qué has completado y qué tienes disponible para empezar ahora."
              />

              {groups.length === 0 ? (
                <div style={{ borderRadius: 20, border: '1px dashed #cbd5e1', background: 'white', padding: '32px 20px', textAlign: 'center' }}>
                  <BookOpen size={28} color="#94a3b8" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Todavía no tienes cursos generados</p>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Completa tu Camino PAU para que aparezcan aquí, organizados por asignatura.</p>
                  <a href="/camino" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#2563eb', padding: '10px 20px', fontSize: 13, fontWeight: 900, color: 'white', textDecoration: 'none' }}>Ir a Camino PAU</a>
                </div>
              ) : (
                <>
                {/* Global stats */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {(['completed', 'today'] as CourseStatus[]).map(status => {
                    const meta = STATUS_META[status]
                    return (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 12, background: meta.bg, border: `1px solid ${meta.border}` }}>
                        <meta.Icon size={14} color={meta.color} />
                        <span style={{ fontSize: 12, fontWeight: 900, color: meta.color }}>{overallStats[status]}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, opacity: .85 }}>{meta.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Subject chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {groups.map(group => {
                    const accent = accentFor(group.subject)
                    const isActive = group.subject === activeGroup?.subject
                    return (
                      <button
                        key={group.subject}
                        onClick={() => setSelectedSubject(group.subject)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                          border: `1px solid ${isActive ? accent.text : accent.border}`,
                          background: isActive ? accent.bg : 'white',
                          color: accent.text, fontSize: 12, fontWeight: 900,
                        }}
                      >
                        {group.label}
                        <span style={{ fontSize: 10, fontWeight: 800, opacity: .75 }}>{group.completed}/{group.total}</span>
                      </button>
                    )
                  })}
                </div>

                {activeGroup && (
                  <div>
                    {/* Progress bar for the selected subject */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${activeGroup.total ? Math.round((activeGroup.completed / activeGroup.total) * 100) : 0}%`, background: '#34d399', borderRadius: 999 }} />
                      </div>
                      <p style={{ marginTop: 6, fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
                        {activeGroup.completed} de {activeGroup.total} temas completados en {activeGroup.label}
                      </p>
                    </div>

                    {activeGroup.blocks.map(block => (
                      <section key={block.blockTitle} style={{ marginBottom: 16, borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <h3 style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', margin: 0 }}>{block.blockTitle}</h3>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>
                            {block.items.filter(i => i.status === 'completed').length}/{block.items.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {block.items.map(item => {
                            const meta = STATUS_META[item.status]
                            const notaOnTen = item.nota != null && item.notaMaxima ? (item.nota / item.notaMaxima) * 10 : null
                            const threshold = resolveGradeThreshold(gradeThresholdConfig, item.key.split(':')[0])
                            const suggestRepeat = item.status === 'completed' && item.latestHistorialId != null && item.href != null && shouldSuggestRepeat(notaOnTen, threshold)
                            const rowStyle: CSSProperties = {
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                              padding: '10px 12px', borderRadius: 12, border: '1px solid #eef2f7',
                              background: item.status === 'completed' ? '#f8fafc' : 'white',
                              textDecoration: 'none', cursor: item.href ? 'pointer' : 'default',
                              opacity: item.href ? 1 : .6,
                            }
                            const titleBlock = (
                              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', minWidth: 0 }}>
                                <span style={{
                                  fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  color: item.status === 'completed' ? '#94a3b8' : '#0f172a',
                                  textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                                }}>
                                  {item.title}
                                </span>
                                {notaOnTen != null && (
                                  <span style={{ fontSize: 10.5, fontWeight: 800, color: notaOnTen < threshold ? '#b45309' : '#059669' }}>
                                    Nota: {formatGrade(item.nota ?? 0)}/{formatGrade(item.notaMaxima ?? 10)}
                                  </span>
                                )}
                              </span>
                            )
                            const badges = (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '4px 9px', borderRadius: 999, background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, fontSize: 10.5, fontWeight: 900 }}>
                                  <meta.Icon size={11} />
                                  {meta.label}
                                </span>
                                {suggestRepeat && (
                                  <a
                                    href={`${item.href}?repeatOf=${item.latestHistorialId}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '5px 11px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #fb923c)', border: 'none', boxShadow: '0 2px 6px rgba(217,119,6,.4)', color: 'white', fontSize: 10.5, fontWeight: 900, textDecoration: 'none' }}
                                  >
                                    <RotateCcw size={11} />
                                    Repetir para mejorar
                                  </a>
                                )}
                              </span>
                            )
                            if (!item.href) {
                              return <div key={item.key} style={rowStyle}>{titleBlock}{badges}</div>
                            }
                            // Un tema completado no debe reabrirse directo como si
                            // fuera nuevo — se pregunta primero si quiere repetirlo
                            // (CaminoTopicClient también protege esto por si acceso
                            // llega desde otro sitio, p. ej. la tarjeta del calendario).
                            if (item.status === 'completed') {
                              return (
                                <div key={item.key} style={rowStyle}>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmItem(item)}
                                    style={{ display: 'contents', textDecoration: 'none', color: 'inherit', background: 'none', border: 'none', padding: 0, margin: 0, font: 'inherit', textAlign: 'left', cursor: 'pointer' }}
                                  >
                                    {titleBlock}
                                  </button>
                                  {badges}
                                </div>
                              )
                            }
                            return <a key={item.key} href={item.href} style={rowStyle}>{titleBlock}{badges}</a>
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
              )}
            </>
          )}
        </main>
      </div>

      {confirmItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal-bg, 1000)', background: 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setConfirmItem(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 400, background: 'white', borderRadius: 22, border: '1px solid #e2e8f0', boxShadow: '0 24px 60px rgba(15,23,42,0.22)', padding: 26 }}
          >
            <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Ya completaste este tema</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
              &ldquo;{confirmItem.title}&rdquo; ya está marcado como completado{confirmItem.nota != null ? ` con nota ${formatGrade(confirmItem.nota)}/${formatGrade(confirmItem.notaMaxima ?? 10)}` : ''}. ¿Quieres repetirlo para intentar mejorar tu nota?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                style={{ padding: '10px 18px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmItem.href
                    ? (confirmItem.latestHistorialId ? `${confirmItem.href}?repeatOf=${confirmItem.latestHistorialId}` : `${confirmItem.href}?confirmed=1`)
                    : null
                  setConfirmItem(null)
                  if (target) router.push(target)
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #fb923c)', border: 'none', color: 'white', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
              >
                <RotateCcw size={13} /> Sí, quiero repetirlo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
