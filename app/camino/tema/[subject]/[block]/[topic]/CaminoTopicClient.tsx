'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, MessageCircle, PenLine, RotateCcw, School, UploadCloud, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import { buildEvauHref, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { DIVISIONS } from '@/app/lib/camino/leagues'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import MathMarkdown from '@/components/shared/MathMarkdown'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'

const TOPIC_VIDEO_MAP: Record<string, string> = {
  'matematicas_ii:algebra-lineal:matrices-operaciones':      'wMEHXzOvln0',
  'matematicas_ii:algebra-lineal:sistemas-gauss':            '85Mu8Szvoz0',
  'matematicas_ii:analisis:limites-continuidad':             '_FIE0_prPYE',
  'matematicas_ii:analisis:derivadas-optimizacion':          'h7Or6dNILgU',
  'matematicas_ii:integrales:areas-integrales':              'Uft9Zds7N98',
  'matematicas_ii:geometria-3d:producto-vectorial':          'J7IFZA1rfvA',
  'matematicas_ii:probabilidad:probabilidad-combinatoria':   'EmOykWKJ9Lc',
  'matematicas_ii:probabilidad:normal-tipificacion':         'Mi9JBF_a0H8',
}

// Maps each seed topic to its sort_order range in curriculum_content_v2
const TOPIC_TO_V2_RANGE: Record<string, { min: number; max: number }> = {
  'matematicas_ii:algebra-lineal:matrices-operaciones':    { min: 1,  max: 9  },
  'matematicas_ii:algebra-lineal:sistemas-gauss':          { min: 10, max: 19 },
  'matematicas_ii:geometria-3d:producto-vectorial':        { min: 20, max: 34 },
  'matematicas_ii:analisis:limites-continuidad':           { min: 35, max: 40 },
  'matematicas_ii:analisis:derivadas-optimizacion':        { min: 41, max: 45 },
  'matematicas_ii:integrales:areas-integrales':            { min: 46, max: 49 },
  'matematicas_ii:probabilidad:probabilidad-combinatoria': { min: 50, max: 54 },
  'matematicas_ii:probabilidad:normal-tipificacion':       { min: 55, max: 60 },
}

const TOPIC_PROGRESS_KEY = 'kairo_camino_topic_progress_v1'
const SCHOOL_FEEDBACK_KEY = 'kairo_school_topic_feedback_v1'
const SCHOOL_ADJUSTMENTS_KEY = 'kairo_camino_school_adjustments_v1'
const CALENDAR_REFRESH_KEY = 'kairo_camino_calendar_needs_refresh_v1'
const CALENDAR_KEY = 'kairo_camino_calendar_v2'
const XP_KEY = 'kairo_camino_xp_events_v1'
const WEAK_AREAS_KEY = 'kairo_camino_weak_areas_v1'

type TopicProgress = Record<string, { explanation?: boolean; guided?: boolean; evau?: boolean; xp: number; score?: number }>
type SchoolFeedback = Array<{ schoolName: string | null; community: string | null; subject: string; block: string; topic: string; reason: 'not_seen_in_class'; date: string }>
type SchoolAdjustment = { schoolName: string | null; community: string | null; subject: string; blockSlug: string; topicSlug: string; feedbackType: 'not_seen_in_class'; status: 'not_seen' | 'delayed_for_school'; notSeenCount: number; date: string }
type CaminoXpEvent = { id: string; missionId: string; date: string; subject: string; xp: number; bonus: boolean; score?: number }
type CalendarMission = { id: string; status: 'pending' | 'done'; subject: string; role?: 'main' | 'bonus' }
type CalendarDay = { date: string; missions: CalendarMission[] }
type UploadedImage = { data: string; preview: string; type: string }
type LigaMiembro = { user_id: string; name: string; weekly_xp: number; rank: number }
type LigaInfo = { id: string; codigo: string; nombre: string; miembros: LigaMiembro[] }
type CurriculumV2Card = {
  sort_order: number
  title: string
  concept_markdown: string | null
  worked_example_markdown: string | null
  alert_markdown: string | null
  practice_prompt: string | null
  video_id: string | null
}
type LessonMarkdownProps = {
  text?: string | null
  className?: string
  format?: boolean | 'raw'
}
type LessonSegment =
  | { type: 'markdown'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function progressKey(topic: CaminoCurriculumTopic) {
  return `${topic.subject}:${topic.blockSlug}:${topic.topicSlug}`
}

function daysSince(isoDate: string): number {
  const createdDay = new Date(isoDate).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const todayDay = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  return Math.floor((new Date(todayDay + 'T00:00:00Z').getTime() - new Date(createdDay + 'T00:00:00Z').getTime()) / 86400000)
}

function xpFromScore(score: number) {
  const baseXP = 10
  const bonusXP = score < 4 ? 5 : score < 6 ? 12 : score < 8 ? 22 : score < 9 ? 32 : 45
  return baseXP + bonusXP
}

function scoreFromCorrection(data: unknown, maxScore: number) {
  const raw = (data as { desglose_bloques?: Array<{ puntos_conseguidos?: number | string }> } | null)?.desglose_bloques?.[0]?.puntos_conseguidos
  const numeric = Number(raw)
  if (!Number.isFinite(numeric)) return null
  return Math.min(maxScore, Math.max(0, numeric))
}

function normalizeLessonMathText(text: string): string {
  return text
    .replace(/\u0008egin\{/g, '\\begin{')
    .replace(/\u0009imes/g, '\\times')
    .replace(/\u000crac/g, '\\frac')
    .replace(/\u000bec/g, '\\vec')
    .replace(/(^|[^\\])end\{(pmatrix|bmatrix|vmatrix|matrix|cases|array|aligned)\}/g, '$1\\end{$2}')
    .replace(/(^|[^\\])det\(/g, '$1\\det(')
    .replace(/\\times(?!\s)/g, '\\times ')
    .replace(/(^|[^\\])\(\s*(m)\\times\s*(n)\s*\)/g, '$1\\($2 \\times $3\\)')
    .replace(/(^|[^\\])\(\s*([mn])\s*\)(?=\s+(?:filas|columnas)\b)/gi, '$1\\($2\\)')
    .replace(/\(\(\s*A\+B\s*\)\{ij\}=a\{ij\}\+b_\{ij\}\)/g, '\\[(A+B)_{ij}=a_{ij}+b_{ij}\\]')
    .replace(/([A-Za-z])\{ij\}/g, '$1_{ij}')
    .replace(/\(A\+B\)\{ij\}/g, '(A+B)_{ij}')
    .replace(/M_\{2\s+imes\s+2\}/g, '\\(M_{2 \\times 2}\\)')
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match, body) => `\n\n$$\n${body.trim()}\n$$\n\n`)
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_match, body) => `$${body.trim()}$`)
    .replace(/\n{3,}/g, '\n\n')
}

function normalizeLessonMarkdown(text?: string | null): string {
  const value = dedentContent(text ?? '').replace(/\r\n?/g, '\n').trim()
  const repaired = normalizeLessonMathText(value)
  if (!repaired.includes('|---') && !repaired.includes('| ---')) return repaired

  return repaired.replace(/(\|[^\n]+?\|)[ \t]+(?=\|)/g, '$1\n')
}

function splitMarkdownTableRow(line: string): string[] | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null
  const cells = trimmed
    .slice(1, -1)
    .split('|')
    .map(cell => cell.trim())
  return cells.length >= 2 ? cells : null
}

function isMarkdownTableSeparator(cells: string[]) {
  return cells.every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')))
}

function parseLessonMarkdownSegments(text?: string | null): LessonSegment[] {
  const normalized = normalizeLessonMarkdown(text)
  if (!normalized) return []

  const lines = normalized.split('\n')
  const segments: LessonSegment[] = []
  const buffer: string[] = []

  const flushBuffer = () => {
    const body = buffer.join('\n').trim()
    if (body) segments.push({ type: 'markdown', text: body })
    buffer.length = 0
  }

  for (let index = 0; index < lines.length; index += 1) {
    const header = splitMarkdownTableRow(lines[index])
    const separator = splitMarkdownTableRow(lines[index + 1] ?? '')
    if (header && separator && isMarkdownTableSeparator(separator)) {
      const rows: string[][] = []
      let rowIndex = index + 2
      while (rowIndex < lines.length) {
        const row = splitMarkdownTableRow(lines[rowIndex])
        if (!row || row.length !== header.length) break
        rows.push(row)
        rowIndex += 1
      }

      if (rows.length) {
        flushBuffer()
        segments.push({ type: 'table', headers: header, rows })
        index = rowIndex - 1
        continue
      }
    }

    buffer.push(lines[index])
  }

  flushBuffer()
  return segments
}

function LessonMarkdown({ text, className = '', format = 'raw' }: LessonMarkdownProps) {
  const normalized = normalizeLessonMarkdown(text)
  const segments = useMemo(() => parseLessonMarkdownSegments(normalized), [normalized])

  if (!segments.some(segment => segment.type === 'table')) {
    return <MathMarkdown text={normalized} className={className} format={format} />
  }

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'markdown') {
          return <MathMarkdown key={index} text={segment.text} format={format} />
        }
        return <LessonMarkdownTable key={index} headers={segment.headers} rows={segment.rows} />
      })}
    </div>
  )
}

function LessonMarkdownTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ margin: '16px 0', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 5 }}>
      <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} style={{ borderBottom: '2px solid #0f172a', padding: '10px 14px', fontWeight: 900, fontSize: 11, color: '#0f172a', verticalAlign: 'top' }}>
                <LessonMarkdown text={header} format="raw" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} style={{ padding: '10px 14px', fontWeight: 500, color: '#334155', lineHeight: 1.7 }}>
                  <LessonMarkdown text={cell} format="raw" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CaminoTopicClient({ topic }: { topic: CaminoCurriculumTopic | null }) {
  const onboarding = useMemo(() => loadOnboarding(), [])
  const router = useRouter()
  const params = useSearchParams()
  const missionId = params.get('missionId')
  const shouldStartExercise = params.get('start') === 'exercise'
  const exerciseRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState('')
  const [progress, setProgress] = useState<TopicProgress>(() => loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {}))
  const [answerMode, setAnswerMode] = useState<'texto' | 'imagen'>('texto')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [image, setImage] = useState<UploadedImage | null>(null)
  const [correction, setCorrection] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [xpAwarded, setXpAwarded] = useState<number | null>(null)
  const [leagueUpgrade, setLeagueUpgrade] = useState<{ from: string; to: string } | null>(null)
  const [correcting, setCorrecting] = useState(false)
  const [diegoContent, setDiegoContent] = useState<string | null>(null)
  const [diegoLoading, setDiegoLoading] = useState(true)
  const [v2Cards, setV2Cards] = useState<CurriculumV2Card[]>([])
  const [v2Loading, setV2Loading] = useState(true)
  const [activeV2Index, setActiveV2Index] = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [liga, setLiga] = useState<LigaInfo | null>(null)
  const [ligaLoading, setLigaLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [daysSinceRegistration, setDaysSinceRegistration] = useState<number | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [nextMissionTitle, setNextMissionTitle] = useState<string | null>(null)
  const [blockProgress, setBlockProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 })
  const billing = useBillingStatus()

  useEffect(() => {
    if (shouldStartExercise) exerciseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [shouldStartExercise])

  useEffect(() => {
    if (!topic) {
      queueMicrotask(() => setDiegoLoading(false))
      return
    }
    // Query by block only (no topic_slug) so granular v2 topics find the
    // broader Diego notes that cover the whole block.
    // analisis absorbs the old 'integrales' block, so we query both.
    const blockSlugs = topic.blockSlug === 'analisis'
      ? [topic.blockSlug, 'integrales']
      : [topic.blockSlug]
    supabase
      .from('curriculum_content')
      .select('content_markdown')
      .eq('subject', topic.subject)
      .in('block_slug', blockSlugs)
      .order('topic_slug', { ascending: true })
      .then(({ data }) => {
        const combined = (data ?? [])
          .map(r => r.content_markdown)
          .filter(Boolean)
          .join('\n\n')
        if (combined) setDiegoContent(combined)
        setDiegoLoading(false)
      })
  }, [topic?.subject, topic?.blockSlug])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setV2Loading(true)
      setV2Cards([])
      setActiveV2Index(0)
    })

    if (!topic) {
      queueMicrotask(() => { if (!cancelled) setV2Loading(false) })
      return () => { cancelled = true }
    }

    // flashcard_v2: fetch a single row by v2SortOrder
    if (topic.contentStatus === 'flashcard_v2' && topic.v2SortOrder != null) {
      supabase
        .from('curriculum_content_v2')
        .select('sort_order, title, concept_markdown, worked_example_markdown, alert_markdown, practice_prompt, video_id')
        .eq('subject', topic.subject)
        .eq('sort_order', topic.v2SortOrder)
        .single()
        .then(
          ({ data }) => {
            if (cancelled) return
            setV2Cards(data ? [data as CurriculumV2Card] : [])
            setV2Loading(false)
          },
          () => {
            if (cancelled) return
            setV2Cards([])
            setV2Loading(false)
          }
        )
      return () => { cancelled = true }
    }

    // legacy topics: fetch range from TOPIC_TO_V2_RANGE
    const range = TOPIC_TO_V2_RANGE[topic.subject + ':' + topic.blockSlug + ':' + topic.topicSlug]
    if (!range) {
      queueMicrotask(() => { if (!cancelled) setV2Loading(false) })
      return () => { cancelled = true }
    }

    supabase
      .from('curriculum_content_v2')
      .select('sort_order, title, concept_markdown, worked_example_markdown, alert_markdown, practice_prompt, video_id')
      .eq('subject', topic.subject)
      .gte('sort_order', range.min)
      .lte('sort_order', range.max)
      .order('sort_order', { ascending: true })
      .then(
        ({ data }) => {
          if (cancelled) return
          setV2Cards(data?.length ? data as CurriculumV2Card[] : [])
          setV2Loading(false)
        },
        () => {
          if (cancelled) return
          setV2Cards([])
          setV2Loading(false)
        }
      )

    return () => { cancelled = true }
  }, [topic?.subject, topic?.blockSlug, topic?.topicSlug, topic?.v2SortOrder])

  useEffect(() => {
    if (!v2Cards.length) {
      queueMicrotask(() => setActiveV2Index(0))
      return
    }
    if (typeof window === 'undefined') return

    const syncActiveCardFromUrl = () => {
      const raw = new URLSearchParams(window.location.search).get('card')
      const requested = Number(raw)
      const nextIndex = Number.isInteger(requested) && requested >= 1 && requested <= v2Cards.length ? requested - 1 : 0
      setActiveV2Index(nextIndex)

      if (raw && (nextIndex !== requested - 1 || requested < 1 || requested > v2Cards.length)) {
        const url = new URL(window.location.href)
        url.searchParams.set('card', '1')
        window.history.replaceState(null, '', url.pathname + url.search + url.hash)
      }
    }

    syncActiveCardFromUrl()
    window.addEventListener('popstate', syncActiveCardFromUrl)
    return () => window.removeEventListener('popstate', syncActiveCardFromUrl)
  }, [v2Cards.length, topic?.subject, topic?.blockSlug, topic?.topicSlug])

  useEffect(() => {
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    const events = loadJson<CaminoXpEvent[]>(XP_KEY, [])
    const dates = new Set(events.map(e => e.date))
    let s = 0; let cur = toISO(new Date())
    while (dates.has(cur)) { s++; const d = new Date(cur); d.setDate(d.getDate() - 1); cur = toISO(d) }
    queueMicrotask(() => setStreak(s))

    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      const uid = data.session?.user?.id ?? null
      const createdAt = data.session?.user?.created_at
      if (!token || cancelled) { if (!cancelled) setLigaLoading(false); return }
      if (!cancelled) setCurrentUserId(uid)
      if (createdAt && !cancelled) setDaysSinceRegistration(daysSince(createdAt))
      try {
        const res = await fetch('/api/ligas', { headers: { Authorization: `Bearer ${token}` } })
        if (!cancelled && res.ok) { const json = await res.json(); setLiga(json.liga ?? null) }
      } catch { /* silent */ }
      if (!cancelled) setLigaLoading(false)
    }).catch(() => { if (!cancelled) setLigaLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (!topic) {
    return <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><h1 className="text-2xl font-black text-slate-950">Tema no encontrado</h1><p className="mt-2 text-sm font-semibold text-slate-500">Este tema todavía no está conectado al itinerario de Camino PAU.</p><Link href="/camino" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"><ArrowLeft size={16} /> Volver a Camino</Link></section></main></Shell>
  }

  const currentTopic = topic
  const key = progressKey(currentTopic)
  const current = progress[key] ?? { xp: 0 }
  const topicCompleted = Boolean(current.evau)
  const isFreeAndExpired = !billing.loading && !billing.hasActivePack && daysSinceRegistration !== null && daysSinceRegistration >= 7
  const statusLabel = topicCompleted ? 'Completado' : 'Pendiente'
  const selectedV2Card = v2Cards[activeV2Index] ?? v2Cards[0] ?? null
  const selectedV2Number = selectedV2Card ? activeV2Index + 1 : null
  const selectedMissionTitle = selectedV2Card?.title ?? currentTopic.title
  const uniqueV2VideoIds = Array.from(new Set(v2Cards.map(card => card.video_id).filter((id): id is string => Boolean(id))))
  const videoId = selectedV2Card?.video_id ?? TOPIC_VIDEO_MAP[key] ?? null
  const videoSupportCopy = selectedV2Card
    ? uniqueV2VideoIds.length === 1 && v2Cards.length > 1
      ? 'Vídeo de apoyo del tema. Algunas mini-misiones comparten el mismo vídeo mientras completamos el mapa individual.'
      : 'Vídeo explicativo de esta mini-misión.'
    : 'Vídeo explicativo del tema.'
  const myLigaEntry = liga && currentUserId ? liga.miembros.find(m => m.user_id === currentUserId) ?? null : null

  function selectV2Card(index: number, mode: 'push' | 'replace' = 'push') {
    if (!v2Cards.length) return
    const safeIndex = Math.min(Math.max(index, 0), v2Cards.length - 1)
    setActiveV2Index(safeIndex)
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    url.searchParams.set('card', String(safeIndex + 1))
    window.history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash)
  }

  async function markNotSeen() {
    const now = new Date().toISOString()
    const feedback = loadJson<SchoolFeedback>(SCHOOL_FEEDBACK_KEY, [])
    const next = [...feedback, { schoolName: onboarding.schoolName, community: onboarding.community, subject: currentTopic.subject, block: currentTopic.blockSlug, topic: currentTopic.topicSlug, reason: 'not_seen_in_class' as const, date: now }]
    const localCount = next.filter(item =>
      item.schoolName === onboarding.schoolName &&
      item.subject === currentTopic.subject &&
      item.block === currentTopic.blockSlug &&
      item.topic === currentTopic.topicSlug
    ).length
    const adjustment: SchoolAdjustment = {
      schoolName: onboarding.schoolName,
      community: onboarding.community,
      subject: currentTopic.subject,
      blockSlug: currentTopic.blockSlug,
      topicSlug: currentTopic.topicSlug,
      feedbackType: 'not_seen_in_class',
      status: localCount >= 3 ? 'delayed_for_school' : 'not_seen',
      notSeenCount: localCount,
      date: now,
    }

    saveJson(SCHOOL_FEEDBACK_KEY, next)
    saveJson(SCHOOL_ADJUSTMENTS_KEY, [
      adjustment,
      ...loadJson<SchoolAdjustment[]>(SCHOOL_ADJUSTMENTS_KEY, []).filter(item =>
        !(item.schoolName === adjustment.schoolName &&
          item.subject === adjustment.subject &&
          item.blockSlug === adjustment.blockSlug &&
          item.topicSlug === adjustment.topicSlug)
      )
    ].slice(0, 80))
    saveJson(CALENDAR_REFRESH_KEY, true)
    window.localStorage.removeItem(CALENDAR_KEY)
    window.dispatchEvent(new CustomEvent('kairo:school-topic-feedback', { detail: adjustment }))
    setToast('Entendido. Ajustando tu Camino...')

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) { router.push('/camino'); return }

      // Sync institute pace signal (best-effort). The server resolves institute membership.
      const response = await fetch('/api/camino/pace-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: currentTopic.subject,
          blockSlug: currentTopic.blockSlug,
          topicSlug: currentTopic.topicSlug,
          v2SortOrder: currentTopic.v2SortOrder,
          signalType: 'not_taught_yet',
          source: 'topic_page',
        }),
      })
      if (response.ok) {
        const remote = await response.json() as { individualOnly?: boolean }
        setToast(remote.individualOnly
          ? 'Entendido. Ajustamos tu Camino para no priorizar este tema por ahora.'
          : 'Entendido. Ajustamos tu Camino y tendremos en cuenta el ritmo de tu instituto.')
      } else {
        setToast('Entendido. Ajustamos tu Camino para no priorizar este tema por ahora.')
      }

      // Persist postpone to Supabase queue + calendar
      if (currentTopic.v2SortOrder != null) {
        const postponeRes = await fetch('/api/camino/postpone-mission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subject: currentTopic.subject, v2SortOrder: currentTopic.v2SortOrder }),
        })
        if (postponeRes.ok) {
          const postponeData = await postponeRes.json() as { success?: boolean; warning?: boolean }
          if (postponeData.warning) {
            setToast('Avisamos: tendrás que ver este bloque antes de la PAU')
          }
        }
      }
    } catch {
      // Local adjustment already applied; best-effort.
    }

    setTimeout(() => router.push('/camino'), 1600)
  }

  function chatHref(prompt?: string) {
    const params = new URLSearchParams({
      view: 'chat',
      from: 'camino_course',
      subject: currentTopic.subject,
      block: currentTopic.blockSlug,
      topic: currentTopic.topicSlug,
    })
    if (prompt) params.set('question', prompt)
    return `/?${params.toString()}`
  }

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (image?.preview) URL.revokeObjectURL(image.preview)
    setImage({ data: await compressImageToBase64(file), preview: URL.createObjectURL(file), type: 'image/jpeg' })
  }

  function clearImage() {
    if (image?.preview) URL.revokeObjectURL(image.preview)
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function awardCorrectionXp(scoreOnTen: number) {
    const xp = xpFromScore(scoreOnTen)
    const eventMissionId = missionId ?? `course:${key}`
    const calendar = loadJson<CalendarDay[]>(CALENDAR_KEY, [])
    const xpEvents = loadJson<CaminoXpEvent[]>(XP_KEY, [])
    const previous = xpEvents.find(event => event.missionId === eventMissionId)
    const nextEvents = previous
      ? xpEvents.map(event => event.missionId === eventMissionId && scoreOnTen > (event.score ?? -1) ? { ...event, xp, score: scoreOnTen, date: new Date().toISOString().slice(0, 10) } : event)
      : [...xpEvents, { id: `${eventMissionId}-${Date.now()}`, missionId: eventMissionId, date: new Date().toISOString().slice(0, 10), subject: subjectLabelFromSlug(currentTopic.subject), xp, bonus: false, score: scoreOnTen }]
    const xpChanged = !previous || scoreOnTen > (previous.score ?? -1)

    saveJson(XP_KEY, nextEvents)
    if (missionId) {
      saveJson(CALENDAR_KEY, calendar.map(day => ({ ...day, missions: day.missions.map(mission => mission.id === missionId ? { ...mission, status: 'done' as const } : mission) })))
    }
    setProgress(previous => {
      const item = previous[key] ?? { xp: 0 }
      const storedXp = xpChanged ? xp : item.xp || xp
      const storedScore = xpChanged ? scoreOnTen : item.score ?? scoreOnTen
      const next = {
        ...previous,
        [key]: {
          ...item,
          evau: true,
          xp: storedXp,
          score: storedScore,
        }
      }
      saveJson(TOPIC_PROGRESS_KEY, next)
      return next
    })
    if (scoreOnTen < 6) {
      const weakAreas = loadJson<Array<{ subject: string; block: string; topic: string; score: number; date: string }>>(WEAK_AREAS_KEY, [])
      const nextWeakAreas = [{ subject: subjectLabelFromSlug(currentTopic.subject), block: currentTopic.blockTitle, topic: currentTopic.title, score: scoreOnTen, date: new Date().toISOString() }, ...weakAreas.filter(item => !(item.subject === subjectLabelFromSlug(currentTopic.subject) && item.topic === currentTopic.title))].slice(0, 12)
      saveJson(WEAK_AREAS_KEY, nextWeakAreas)
    }
    setXpAwarded(xpChanged ? xp : previous?.xp ?? xp)
    return { xp, xpChanged }
  }

  async function correctCourseExercise() {
    if (answerMode === 'texto' && !studentAnswer.trim()) return
    if (answerMode === 'imagen' && !image) return
    const maxScore = 10
    setCorrecting(true)
    setCorrection('')
    setScore(null)
    setXpAwarded(null)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorrection('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }
      const statement = selectedV2Card?.practice_prompt ?? currentTopic.practicePrompt ?? currentTopic.guidedExample ?? ('Ejercicio de ' + selectedMissionTitle)
      const selectedSortOrder = selectedV2Card?.sort_order ?? currentTopic.v2SortOrder ?? null
      const response = await fetch('/api/camino/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          topicId: `${currentTopic.subject}:${currentTopic.blockSlug}:${currentTopic.topicSlug}:${selectedSortOrder ?? 'legacy'}`,
          subject: currentTopic.subject,
          block: currentTopic.blockSlug,
          topic: currentTopic.topicSlug,
          sortOrder: selectedSortOrder,
          responseMode: answerMode === 'imagen' ? 'image' : 'text',
          studentResponse: answerMode === 'imagen' ? image?.data : studentAnswer,
          imageType: answerMode === 'imagen' ? image?.type : null,
        })
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.error === 'free_plan_expired' || data.error === 'correction_limit_reached' || data.error === 'photo_limit_reached') {
          setShowPaywall(true)
          return
        }
        setCorrection(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = data.correction ?? parseCorrectionPayload(data.respuesta)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visibleCorrection = normalized
        ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore })
        : correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: maxScore })
      const storedCorrection = normalized ? JSON.stringify(normalized) : visibleCorrection
      const rawScore = normalized ? scoreFromCorrection(normalized, maxScore) : null
      setCorrection(storedCorrection)
      if (rawScore == null) {
        setToast('Corrección recibida sin nota clara. No se asigna XP hasta tener una nota.')
      } else {
        const { xp } = awardCorrectionXp(rawScore)
        setScore(rawScore)
        let toastText = `+${xp} XP por corrección · nota ${rawScore}/10`
        if (currentTopic.v2SortOrder != null) {
          try {
            const cmRes = await fetch('/api/camino/complete-mission', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({
                subject: currentTopic.subject,
                v2SortOrder: currentTopic.v2SortOrder,
                missionType: 'concept',
                title: selectedMissionTitle,
              }),
            })
            const cmJson = await cmRes.json()
            if (cmJson.success && typeof cmJson.xpAwarded === 'number') {
              setXpAwarded(cmJson.xpAwarded)
              toastText = `+${cmJson.xpAwarded} XP por corrección · nota ${rawScore}/10`
              if (cmJson.leagueUpgrade) setLeagueUpgrade(cmJson.leagueUpgrade)
            } else if (cmJson.reason === 'already_completed') {
              toastText = `Nota ${rawScore}/10 · Misión ya completada`
            }
          } catch { /* silent */ }
        }
        setToast(toastText)
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: currentTopic.subject,
          tipo: 'Camino PAU',
          año: new Date().getFullYear(),
          bloque: currentTopic.blockTitle,
          opcion: 'Curso',
          nota: rawScore,
          nota_maxima: maxScore,
          enunciado: statement.substring(0, 2000),
          respuesta: answerMode === 'imagen' ? 'Respuesta manuscrita adjunta como imagen.' : studentAnswer.substring(0, 4000),
          correccion: storedCorrection
        })
        calcularRacha(userData.user.id, supabase).then(s => setStreak(s)).catch(() => undefined)
        if (rawScore != null) {
          const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
          const [nextRes, blockRes] = await Promise.all([
            supabase
              .from('camino_calendar')
              .select('title')
              .eq('user_id', userData.user.id)
              .eq('status', 'pending')
              .gt('scheduled_date', todayStr)
              .order('scheduled_date', { ascending: true })
              .limit(1),
            supabase
              .from('camino_calendar')
              .select('status')
              .eq('user_id', userData.user.id)
              .eq('subject', currentTopic.subject)
              .eq('block_slug', currentTopic.blockSlug),
          ])
          setNextMissionTitle(nextRes.data?.[0]?.title ?? null)
          const blockRows = blockRes.data ?? []
          setBlockProgress({
            completed: blockRows.filter(r => r.status === 'completed').length,
            total: blockRows.length,
          })
          setTimeout(() => setShowSuccessModal(true), 1000)
        }
      }
    } finally {
      setCorrecting(false)
    }
  }

  return (
    <Shell>
      {/* ── Dark topbar ── */}
      <div style={{ background: '#0f172a', padding: '11px 32px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Link href="/camino" style={{ color: '#475569', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <span style={{ width: 1, height: 14, background: '#1e293b', flexShrink: 0 }} />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#475569', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Camino PAU &rsaquo; {subjectLabelFromSlug(currentTopic.subject)} &rsaquo; <span style={{ color: '#93c5fd' }}>{currentTopic.blockTitle}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {streak > 0 && <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 999, padding: '3px 10px' }}>🔥 {streak}</span>}
          <button onClick={markNotSeen} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#92400e', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
            <School size={13} /> No lo he dado en clase
          </button>
        </div>
      </div>

      {/* ── Document body: article + aside ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Article column */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', background: '#fdfdfc', borderRight: '1px solid #e2e8f0', minWidth: 0 }}>

          {/* Document header */}
          <header style={{ marginBottom: 36, paddingBottom: 28, borderBottom: '2px solid #0f172a' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 10 }}>
              {subjectLabelFromSlug(currentTopic.subject)} &middot; {currentTopic.blockTitle}
            </p>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 38, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
              {currentTopic.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '3px 10px' }}>
                {selectedV2Card ? 'Mini-misión · 25 min' : '25 min'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: topicCompleted ? '#059669' : '#64748b', background: topicCompleted ? '#f0fdf4' : '#f8fafc', border: `1px solid ${topicCompleted ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 4, padding: '3px 10px' }}>
                {statusLabel}
              </span>
              {selectedV2Number && (
                <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 4, padding: '3px 10px' }}>
                  Mini-misión {selectedV2Number} de {v2Cards.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.7 }}>
              Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU/EVAU relacionado.
            </p>
          </header>

          {/* ── Content sections ── */}
          {currentTopic.contentStatus === 'flashcard_v2' ? (
            v2Loading ? (
              <LearningCard title="Explicación"><ContentSkeleton /></LearningCard>
            ) : selectedV2Card ? (
              <>
                <LearningCard title="Idea clave">
                  {selectedV2Card.concept_markdown
                    ? <LessonMarkdown text={selectedV2Card.concept_markdown} format="raw" />
                    : <EmptyContent />}
                  {selectedV2Card.alert_markdown && (
                    <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '12px 14px' }}>
                      <LessonMarkdown text={selectedV2Card.alert_markdown} format="raw" />
                    </div>
                  )}
                </LearningCard>
                {selectedV2Card.worked_example_markdown && (
                  <LearningCard title="Caso práctico resuelto">
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '14px 16px' }}>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={selectedV2Card.worked_example_markdown} format="raw" />
                      </div>
                    </div>
                  </LearningCard>
                )}
                {videoId && (
                  <LearningCard title="Vídeo explicativo">
                    <button onClick={() => setVideoOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                    </button>
                    {videoOpen && (
                      <div style={{ marginTop: 12, overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                          <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                        </div>
                      </div>
                    )}
                  </LearningCard>
                )}
                {selectedV2Card.practice_prompt && (
                  <LearningCard title="Inténtalo tú">
                    <LessonMarkdown text={selectedV2Card.practice_prompt} format="raw" />
                  </LearningCard>
                )}
              </>
            ) : null
          ) : (
            <>
              <LearningCard title={lessonTitleFor(currentTopic)}>
                {v2Loading
                  ? <ContentSkeleton />
                  : v2Cards.length > 0
                    ? <V2FlashcardAccordion cards={v2Cards} />
                    : diegoLoading
                      ? (currentTopic.explanation ? <StructuredLesson topic={currentTopic} /> : <ContentSkeleton />)
                      : diegoContent
                        ? <DiegoContentCards markdown={diegoContent} />
                        : currentTopic.explanation
                          ? <StructuredLesson topic={currentTopic} />
                          : <EmptyContent />}
              </LearningCard>
              {!v2Loading && v2Cards.length > 0 && !diegoLoading && diegoContent && (
                <LearningCard title="Apuntes del bloque">
                  <DiegoContentCards markdown={diegoContent} />
                </LearningCard>
              )}
              {!v2Loading && v2Cards.length === 0 && (
                <>
                  {videoId && (
                    <LearningCard title="Vídeo explicativo">
                      <button onClick={() => setVideoOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                      </button>
                      {videoOpen && (
                        <div style={{ marginTop: 12, overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                            <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo de apoyo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                          </div>
                        </div>
                      )}
                    </LearningCard>
                  )}
                  <LearningCard title="Ejemplo guiado paso a paso">
                    {currentTopic.guidedExample ? <GuidedExamplePanel text={currentTopic.guidedExample} /> : <EmptyContent compact />}
                  </LearningCard>
                  <LearningCard title="Practica tú">
                    {currentTopic.practicePrompt ? <PracticePromptPanel text={currentTopic.practicePrompt} /> : <EmptyContent compact />}
                  </LearningCard>
                  {(currentTopic.commonMistakes?.length || currentTopic.progressCriteria) && (
                    <LearningCard title="Errores típicos y criterio de avance">
                      {currentTopic.commonMistakes?.length ? (
                        <ul style={{ display: 'grid', gap: 6 }}>
                          {currentTopic.commonMistakes.map(mistake => (
                            <li key={mistake} style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', gap: 8 }}>
                              <span style={{ color: '#2563eb' }}>•</span> {mistake}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {currentTopic.progressCriteria && (
                        <div style={{ marginTop: 14, display: 'grid', gap: 6, gridTemplateColumns: '1fr 1fr' }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}><span style={{ fontWeight: 900, color: '#2563eb' }}>Visto:</span> {currentTopic.progressCriteria.seen}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}><span style={{ fontWeight: 900, color: '#2563eb' }}>Practicado:</span> {currentTopic.progressCriteria.practiced}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}><span style={{ fontWeight: 900, color: '#2563eb' }}>Completado:</span> {currentTopic.progressCriteria.completed}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}><span style={{ fontWeight: 900, color: '#2563eb' }}>Dominado:</span> {currentTopic.progressCriteria.mastered}</p>
                        </div>
                      )}
                    </LearningCard>
                  )}
                </>
              )}
              {v2Cards.length > 0 && (
                <article style={{ paddingTop: 28, paddingBottom: 28, borderTop: '1px solid #e2e8f0' }}>
                  <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6, letterSpacing: '-.01em' }}>🎯 Tu misión de hoy</h2>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, fontWeight: 600 }}>Elige una mini-misión y pon en práctica lo que has aprendido arriba.</p>
                  <V2MiniMissionSelector cards={v2Cards} activeIndex={activeV2Index} onSelect={selectV2Card} />
                  {videoId && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 10 }}>{videoSupportCopy}</p>
                      <button onClick={() => setVideoOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                      </button>
                      {videoOpen && (
                        <div style={{ marginTop: 10, overflow: 'hidden', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                            <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedV2Card?.practice_prompt && (
                    <div style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '14px 16px' }}>
                      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#2563eb', marginBottom: 8 }}>Ahora inténtalo tú</p>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={selectedV2Card.practice_prompt} format="raw" />
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                    <button type="button" onClick={() => selectV2Card(activeV2Index - 1)} disabled={activeV2Index === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '8px 14px', fontSize: 12, fontWeight: 900, color: '#2563eb', cursor: 'pointer', opacity: activeV2Index === 0 ? .4 : 1 }}>
                      <ArrowLeft size={13} /> Misión anterior
                    </button>
                    <button type="button" onClick={() => selectV2Card(activeV2Index + 1)} disabled={activeV2Index >= v2Cards.length - 1} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2563eb', border: 'none', borderRadius: 5, padding: '8px 16px', fontSize: 12, fontWeight: 900, color: 'white', cursor: 'pointer', opacity: activeV2Index >= v2Cards.length - 1 ? .4 : 1 }}>
                      Siguiente misión <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              )}
            </>
          )}

          {/* ── Exercise submission ── */}
          <article ref={exerciseRef} id="course-exercise" style={{ paddingTop: 28, paddingBottom: 40, borderTop: '2px solid #0f172a', marginTop: 4 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em' }}>Entrega tu ejercicio</h2>
                <p style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: '#64748b' }}>El XP se asigna sólo después de corregir con Kairo y depende de la nota obtenida.</p>
              </div>
              {missionId && <span style={{ borderRadius: 999, background: '#eff6ff', padding: '3px 10px', fontSize: 10, fontWeight: 900, color: '#2563eb', border: '1px solid #bfdbfe' }}>Misión conectada</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => setAnswerMode('texto')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 4, padding: '8px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: 'none', background: answerMode === 'texto' ? '#0f172a' : '#f1f5f9', color: answerMode === 'texto' ? 'white' : '#64748b' }}>
                <PenLine size={13} /> Escribir respuesta
              </button>
              <button type="button" onClick={() => setAnswerMode('imagen')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 4, padding: '8px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: 'none', background: answerMode === 'imagen' ? '#0f172a' : '#f1f5f9', color: answerMode === 'imagen' ? 'white' : '#64748b' }}>
                <Camera size={13} /> Subir foto
              </button>
            </div>
            {answerMode === 'texto' ? (
              <RichTextArea value={studentAnswer} onChange={setStudentAnswer} placeholder="Escribe aquí tu desarrollo paso a paso..." minHeight={160} accentColor="#2563eb" mathSubject={currentTopic.subject} />
            ) : (
              <div style={{ borderRadius: 4, border: '1px dashed #cbd5e1', background: '#f8fafc', padding: 14 }}>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
                {image ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <img src={image.preview} alt="Respuesta subida" style={{ maxHeight: 280, borderRadius: 4, border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                    <button type="button" onClick={clearImage} style={{ display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 6, borderRadius: 4, border: '1px solid #fecaca', background: 'white', padding: '6px 12px', fontSize: 11, fontWeight: 900, color: '#dc2626', cursor: 'pointer' }}>
                      <X size={13} /> Quitar foto
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 4, background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', fontSize: 13, fontWeight: 900, color: '#2563eb', cursor: 'pointer' }}>
                    <UploadCloud size={15} /> Hacer foto o elegir imagen
                  </button>
                )}
              </div>
            )}
            <button type="button" onClick={isFreeAndExpired ? () => setShowPaywall(true) : correctCourseExercise} disabled={correcting || (answerMode === 'texto' ? !studentAnswer.trim() : !image)} style={{ marginTop: 12, display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 4, background: '#0f172a', padding: '12px', fontSize: 13, fontWeight: 900, color: 'white', border: 'none', cursor: correcting ? 'not-allowed' : 'pointer', opacity: (correcting || (answerMode === 'texto' ? !studentAnswer.trim() : !image)) ? .5 : 1 }}>
              {correcting ? <><KairoLoadingDot /> Corrigiendo con Kairo...</> : <>Corregir con Kairo <Check size={15} /></>}
            </button>
            {score != null && (
              <p style={{ marginTop: 12, borderRadius: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', fontSize: 13, fontWeight: 900, color: '#065f46' }}>
                Nota: {score}/10{xpAwarded != null ? ` · XP registrado: ${xpAwarded}` : ''}
              </p>
            )}
            {correction && <div style={{ marginTop: 14 }}><CorrectionResultCard correction={correction} officialMaxScore={10} className="p-5 text-sm leading-7" /></div>}
          </article>
        </main>

        {/* ── Aside ── */}
        <aside style={{ width: 264, flexShrink: 0, background: '#fafaf9', padding: '28px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Streak + Liga */}
          <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 10 }}>Tu progreso</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{streak}</p>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: '#94a3b8', marginTop: 2 }}>días racha</p>
              </div>
              <div style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {ligaLoading ? (
                  <div style={{ height: 10, width: 80, borderRadius: 999, background: '#f1f5f9' }} />
                ) : liga && myLigaEntry ? (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liga.nombre}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>#{myLigaEntry.rank} · {myLigaEntry.weekly_xp} XP sem.</p>
                  </>
                ) : (
                  <Link href="/camino" style={{ fontSize: 12, fontWeight: 900, color: '#2563eb', textDecoration: 'none' }}>Crear liga →</Link>
                )}
              </div>
            </div>
          </div>

          {/* Práctica PAU */}
          <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ height: 2, background: '#0f172a', marginBottom: 10 }} />
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#0f172a', marginBottom: 8 }}>Práctica PAU/EVAU</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>Abre Exámenes con asignatura, bloque, tema y modo aleatorio preparados.</p>
            <Link href={buildEvauHref(currentTopic)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: '#0f172a', color: 'white', borderRadius: 4, padding: '10px 12px', fontSize: 11, fontWeight: 900, textDecoration: 'none', marginBottom: 6 }}>
              Hacer ejercicio PAU de este tema <ArrowRight size={12} />
            </Link>
            <a href="#course-exercise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: 'transparent', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 4, padding: '9px 12px', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
              Corregir ejercicio del curso <Check size={12} />
            </a>
          </div>

          {/* Chat Kairo */}
          <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 10 }}>Pregunta a Kairo</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>Abre el Chat con Kairo con esta asignatura, bloque y tema como contexto.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {['Explícamelo más fácil', 'Ponme otro ejemplo', 'No entiendo este paso', 'Hazme una pregunta parecida', '¿Por qué se hace así?'].map(item => (
                <Link key={item} href={chatHref(item)} style={{ borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', padding: '4px 9px', fontSize: 10, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>
                  {item}
                </Link>
              ))}
            </div>
            <Link href={chatHref()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: '#7c3aed', color: 'white', borderRadius: 4, padding: '10px 12px', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
              Abrir Chat con Kairo <MessageCircle size={12} />
            </Link>
          </div>

          {/* XP */}
          <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 8 }}>XP en este tema</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: topicCompleted ? '#059669' : '#0f172a', lineHeight: 1, marginBottom: 4 }}>{current.xp ?? 0} XP</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{topicCompleted ? 'Tema completado con corrección.' : 'El XP se asigna solo después de corregir el ejercicio final.'}</p>
          </div>

          <Link href="/pricing" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 900, color: '#2563eb', marginTop: 4, textDecoration: 'none' }}>Ver planes</Link>
        </aside>

      </div>{/* end document body */}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50, borderRadius: 8, background: '#0f172a', padding: '12px 18px', fontSize: 13, fontWeight: 900, color: 'white', boxShadow: '0 8px 28px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {toast}
          <button onClick={() => setToast('')} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><RotateCcw size={13} /></button>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Tu plan gratuito ha terminado</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Has completado 7 días de Camino PAU. Para seguir avanzando, desbloquea el acceso completo.</p>
              </div>
              <button type="button" onClick={() => setShowPaywall(false)} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="grid gap-2">
              <Link href="/pricing" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Desbloquear acceso completo <ArrowRight size={14} /></Link>
              <button type="button" onClick={() => setShowPaywall(false)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600">Seguir con el plan gratuito</button>
            </div>
            <Link href="/pricing" className="mt-3 block text-center text-sm font-black text-blue-700 hover:underline">Ver planes</Link>
          </div>
        </div>
      )}

      {/* League upgrade modal */}
      {leagueUpgrade && (() => {
        const upgradedDiv = DIVISIONS.find(d => d.name === leagueUpgrade.to) ?? DIVISIONS[DIVISIONS.length - 1]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="mb-4 rounded-2xl px-4 py-5 text-center" style={{ background: upgradedDiv.bg }}>
                <p className="text-3xl font-black" style={{ color: upgradedDiv.text }}>🏆 {leagueUpgrade.to}</p>
                <p className="mt-1 text-sm font-bold" style={{ color: upgradedDiv.text, opacity: 0.75 }}>Nueva división</p>
              </div>
              <h2 className="text-center text-lg font-black text-slate-950">¡Has subido de división!</h2>
              <p className="mt-1 text-center text-sm font-semibold text-slate-500">De <strong className="text-slate-700">{leagueUpgrade.from}</strong> a <strong style={{ color: upgradedDiv.text }}>{leagueUpgrade.to}</strong>. Sigue así.</p>
              <button
                type="button"
                onClick={() => setLeagueUpgrade(null)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white"
                style={{ background: upgradedDiv.bar }}
              >
                ¡A por más XP!
              </button>
            </div>
          </div>
        )
      })()}

      {/* Success modal */}
      {showSuccessModal && score != null && (
        <SuccessModal
          score={score}
          xp={xpAwarded ?? 0}
          streak={streak}
          blockProgress={blockProgress}
          nextMissionTitle={nextMissionTitle}
          onViewWeek={() => { setShowSuccessModal(false); router.push('/camino') }}
          onDoBonus={() => setShowSuccessModal(false)}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </Shell>
  )
}

// ── curriculum_content_v2 flashcard accordion (todos los apuntes) ────────────

function V2FlashcardAccordion({ cards }: { cards: CurriculumV2Card[] }) {
  const [openIdx, setOpenIdx] = useState<number>(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {cards.map((card, i) => {
        const isOpen = openIdx === i
        return (
          <div key={card.sort_order} style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: 5 }}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.12em', color: '#2563eb', flexShrink: 0 }}>#{i + 1}</span>
                <span className="[&_p]:m-0 [&_p]:inline"><LessonMarkdown text={card.title} format="raw" /></span>
              </span>
              <ChevronDown size={14} style={{ flexShrink: 0, color: '#2563eb', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }} />
            </button>
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 280ms ease' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #f1f5f9', padding: '12px 14px' }}>
                  {card.concept_markdown && (
                    <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                      <LessonMarkdown text={card.concept_markdown} format="raw" />
                    </div>
                  )}
                  {card.alert_markdown && (
                    <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 4, padding: '10px 12px' }}>
                      <LessonMarkdown text={card.alert_markdown} format="raw" />
                    </div>
                  )}
                  {card.worked_example_markdown && (
                    <div style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 4, padding: '12px 14px' }}>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={card.worked_example_markdown} format="raw" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── curriculum_content_v2 mini-mission selector ─────────────────────────────

function V2MiniMissionSelector({ cards, activeIndex, onSelect }: { cards: CurriculumV2Card[]; activeIndex: number; onSelect: (index: number) => void }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden', padding: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: '#2563eb', marginBottom: 3 }}>Misiones de este tema</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Cada tarjeta es una mini-misión independiente.</p>
        </div>
        <span style={{ borderRadius: 999, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 10px', fontSize: 10, fontWeight: 900, color: '#2563eb' }}>{cards.length} mini-misiones</span>
      </div>
      <div style={{ display: 'grid', gap: 6, gridTemplateColumns: '1fr 1fr' }}>
        {cards.map((card, index) => {
          const isActive = activeIndex === index
          return (
            <button
              key={card.sort_order}
              type="button"
              onClick={() => onSelect(index)}
              style={{ border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 4, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: isActive ? '#eff6ff' : '#fafafa', transition: 'all .1s' }}
            >
              <span style={{ display: 'block', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.12em', color: isActive ? '#2563eb' : '#94a3b8', marginBottom: 4 }}>Mini-misión {index + 1}</span>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: isActive ? '#1e40af' : '#334155', lineHeight: 1.4 }} className="[&_p]:m-0 [&_p]:inline">
                <LessonMarkdown text={card.title} format="raw" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Diego content card components ────────────────────────────────────────────

type Section = { title: string; body: string; caseStudy: string | null }

// Remove leading 4+ spaces from each line (Python-generated content adds them as indentation,
// but in standard markdown 4-space indent means code block).
function dedentContent(text: string): string {
  return text.replace(/^ {4,}/gm, '')
}

function parseSections(md: string): Section[] {
  const rawParts = ('\n' + md.trimStart()).split(/\n(?=## [^#])/)
  const sections: Section[] = []
  for (const part of rawParts) {
    const trimmed = part.trimStart()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    if (!lines[0].startsWith('## ')) continue
    const title = lines[0].replace(/^## (?:\d+[a-zA-Z]*\. )?/, '').trim()
    if (!title) continue
    const restLines = lines.slice(1).join('\n').trim().split('\n')
    const caseIdx = restLines.findIndex(l => l.startsWith('### '))
    if (caseIdx >= 0) {
      sections.push({
        title,
        body: dedentContent(restLines.slice(0, caseIdx).join('\n').trim()),
        caseStudy: dedentContent(restLines.slice(caseIdx).join('\n').trim()),
      })
    } else {
      sections.push({ title, body: dedentContent(restLines.join('\n').trim()), caseStudy: null })
    }
  }
  return sections
}

function DiegoContentCards({ markdown }: { markdown: string }) {
  const sections = useMemo(() => parseSections(markdown), [markdown])
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  if (!sections.length) return <LessonMarkdown text={markdown} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {sections.map((section, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: 5 }}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }} className="[&_p]:inline [&_p]:m-0">
                <LessonMarkdown text={section.title} format="raw" />
              </span>
              <ChevronDown
                size={14}
                style={{ flexShrink: 0, color: '#2563eb', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }}
              />
            </button>
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 280ms ease' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #f1f5f9', padding: '12px 14px' }}>
                  {section.body && (
                    <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                      <LessonMarkdown text={section.body} format="raw" />
                    </div>
                  )}
                  {section.caseStudy && (
                    <div style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 4, padding: '12px 14px' }}>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={section.caseStudy} format="raw" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function motivationalPhrase(score: number): string {
  if (score >= 9) return '¡Perfecto! Dominas este tema.'
  if (score >= 7) return 'Muy bien. Estás en el buen camino.'
  if (score >= 5) return 'Aprobado. Repasa los errores antes del examen.'
  return 'Sigue practicando. La PAU se gana con constancia.'
}

function SuccessModal({ score, xp, streak, blockProgress, nextMissionTitle, onViewWeek, onDoBonus, onClose }: {
  score: number
  xp: number
  streak: number
  blockProgress: { completed: number; total: number }
  nextMissionTitle: string | null
  onViewWeek: () => void
  onDoBonus: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm rounded-[28px] bg-white p-7 shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="text-center text-5xl leading-none">🎉</div>
        <h2 className="mt-3 text-center text-2xl font-black text-slate-950">¡Misión completada!</h2>

        <div className="mt-5 flex divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex-1 py-3 text-center">
            <p className="text-base font-black text-blue-600">+{xp} XP</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">ganados</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <p className="text-base font-black text-orange-500">{streak > 0 ? `🔥 ${streak}` : streak} días</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">de racha</p>
          </div>
          {blockProgress.total > 0 && (
            <div className="flex-1 py-3 text-center">
              <p className="text-base font-black text-slate-700">{blockProgress.completed}/{blockProgress.total}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">del bloque</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-slate-600">{motivationalPhrase(score)}</p>

        {nextMissionTitle && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-400">Mañana toca</p>
            <p className="mt-1 text-sm font-black text-blue-900 leading-snug">{nextMissionTitle}</p>
          </div>
        )}

        <div className="mt-5 grid gap-2">
          <button
            onClick={onViewWeek}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
          >
            Ver mi semana <ArrowRight size={15} />
          </button>
          <button
            onClick={onDoBonus}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            Hacer bonus
          </button>
        </div>
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfdfc' }}>
      <SidebarNav />
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }}>
        {children}
      </div>
    </div>
  )
}

function cleanLessonLine(value: string) {
  return value
    .replace(/^(Qué es|Teoría rápida|Para qué sirve|Cuándo se usa en PAU\/EVAU|Error típico)\s*:\s*/i, '')
    .trim()
}

function pickLessonLine(topic: CaminoCurriculumTopic, label: string, fallback = '') {
  const line = topic.explanation
    .split(/\n+/)
    .map(item => item.trim())
    .find(item => item.toLowerCase().startsWith(label.toLowerCase()))
  return line ? cleanLessonLine(line) : fallback
}

function lessonTitleFor(topic: CaminoCurriculumTopic) {
  if (topic.subject === 'lengua') return 'Mini clase de Lengua'
  if (topic.subject === 'historia_espana' || topic.subject === 'historia') return 'Mini clase de Historia'
  return 'Mini clase visual'
}

function lessonStepsFor(topic: CaminoCurriculumTopic) {
  if (topic.subject === 'lengua') {
    return ['Lee el enunciado y localiza qué te pide exactamente.', 'Identifica la función del fragmento o del concepto.', 'Redacta con una plantilla clara: idea, explicación y ejemplo.', 'Revisa precisión, cohesión y ortografía antes de entregar.']
  }
  if (topic.subject === 'historia_espana' || topic.subject === 'historia') {
    return ['Sitúa el tema en su etapa histórica.', 'Ordena causas, hechos principales y consecuencias.', 'Usa fechas o conceptos clave sin convertir la respuesta en una lista.', 'Cierra conectando el tema con la pregunta PAU.']
  }
  return ['Identifica datos, incógnitas y tipo de ejercicio.', 'Elige el procedimiento del bloque antes de calcular.', 'Escribe los pasos con notación clara y comprueba el resultado.', 'Relaciona el resultado con lo que pregunta el enunciado PAU.']
}

function StructuredLesson({ topic }: { topic: CaminoCurriculumTopic }) {
  const idea = pickLessonLine(topic, 'Qué es', topic.explanation)
  const theory = pickLessonLine(topic, 'Teoría rápida')
  const use = pickLessonLine(topic, 'Para qué sirve')
  const pau = pickLessonLine(topic, 'Cuándo se usa en PAU/EVAU')
  const alert = pickLessonLine(topic, 'Error típico', topic.commonMistakes?.[0] ?? '')
  const tags = topic.examTags?.slice(0, 4) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, padding: '12px 14px' }}>
        <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#2563eb', marginBottom: 6 }}>Idea clave</p>
        <LessonMarkdown text={idea} />
      </div>
      {theory && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '12px 14px' }}>
          <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#4f46e5', marginBottom: 6 }}>Teoría rápida</p>
          <LessonMarkdown text={theory} />
        </div>
      )}
      {(use || pau || tags.length > 0) && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
          {use && <InfoTile label="Para qué sirve" text={use} />}
          {pau && <InfoTile label="Cómo aparece en PAU" text={pau} />}
          {tags.length > 0 && <InfoTile label="Etiquetas PAU" text={tags.join(' · ')} />}
        </div>
      )}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '12px 14px' }}>
        <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#94a3b8', marginBottom: 10 }}>Cómo se trabaja</p>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, listStyle: 'none' }}>
          {lessonStepsFor(topic).map((step, index) => (
            <li key={step} style={{ display: 'flex', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0, marginTop: 2, width: 20, height: 20, borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {alert && (
        <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 5, padding: '12px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 900, color: '#92400e', marginBottom: 4 }}>Error típico</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#78350f', lineHeight: 1.6 }}>{alert}</p>
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 5, padding: '10px 12px' }}>
      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#94a3b8', marginBottom: 5 }}>{label}</p>
      <LessonMarkdown text={text} />
    </div>
  )
}

function GuidedExamplePanel({ text }: { text: string }) {
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '12px 14px' }}>
      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#059669', marginBottom: 8 }}>Ejemplo guiado</p>
      <LessonMarkdown text={text} />
    </div>
  )
}

function PracticePromptPanel({ text }: { text: string }) {
  return (
    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, padding: '12px 14px' }}>
      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#2563eb', marginBottom: 8 }}>Ejercicio corregible</p>
      <LessonMarkdown text={text} />
    </div>
  )
}

function EmptyContent({ compact = false }: { compact?: boolean }) {
  const copy = compact
    ? 'Este bloque aún necesita contenido completo.'
    : 'Este tema aún necesita contenido completo. Puedes practicar con ejercicios disponibles.'
  return <p style={{ border: '1px dashed #bfdbfe', borderRadius: 5, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#3b82f6', background: '#eff6ff' }}>{copy}</p>
}

function ContentSkeleton() {
  return (
    <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[80, 60, 90, 50, 75].map(w => (
        <div key={w} style={{ height: 10, borderRadius: 999, background: '#f1f5f9', width: `${w}%` }} />
      ))}
    </div>
  )
}

function LearningCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article style={{ paddingTop: 28, paddingBottom: 28, borderTop: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em' }}>{title}</h2>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#94a3b8' }}>Paso de lectura</span>
      </div>
      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">{children}</div>
    </article>
  )
}
