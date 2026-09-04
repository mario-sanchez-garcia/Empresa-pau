'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, MessageCircle, PenLine, RotateCcw, School, UploadCloud, X } from 'lucide-react'
import SidebarNav from '@/app/components/SidebarNav'
import { buildEvauHref, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores, scoreFromCorrection } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { DIVISIONS } from '@/app/lib/camino/leagues'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { annotateGlossarySymbols, decodeGlossaryPayload, type GlossaryEntry } from '@/app/lib/camino/glossaryAnnotate'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import KairoMapCard from '@/components/shared/KairoMapCard'
import MathEditor from '@/components/shared/MathEditor'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import LenguaObrasLeidasSelector from '@/app/components/camino/LenguaObrasLeidasSelector'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import ClayBadge from '@/components/clay/ClayBadge'
import ClayButton from '@/components/clay/ClayButton'
import ClayLinkButton from '@/components/clay/ClayLinkButton'
import ClayCard from '@/components/clay/ClayCard'
import ClayEmptyState from '@/components/clay/ClayEmptyState'
import { useClayThemePreference, type ClayTheme } from '@/components/clay/useClayThemePreference'

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

// "No lo he dado en clase" nació como señal genérica de ritmo de Camino, pero solo se
// pidió para los 2 temas de integrales de Matemáticas CCSS (llegan tarde en muchos
// institutos) — subject Y topicSlug juntos, porque Matemáticas II reutiliza los mismos
// topicSlug para sus propios temas de integrales y no debe activar el botón.
const NOT_SEEN_BUTTON_TOPICS = new Set<string>([
  'matematicas_ccss:primitiva-de-una-funcion-y-la-integral-indefinida',
  'matematicas_ccss:la-integral-definida-regla-de-barrow-y-areas',
])

// Piloto de claymorfismo (ver components/clay/): restilizado solo para esta
// ficha de tema concreta (Física · Modelo Atómico de Bohr), elegida porque ya
// tiene glosario de fórmulas real y permite comprobar que ambos conviven. El
// resto de temas/asignaturas renderiza exactamente igual que antes.
const CLAY_PILOT_SUBJECT = 'fisica'
const CLAY_PILOT_TOPIC_SLUG = 'modelo-atomico-de-bohr'
function isClayPilotTopic(topic: { subject?: string; topicSlug?: string } | null | undefined): boolean {
  return topic?.subject === CLAY_PILOT_SUBJECT && topic?.topicSlug === CLAY_PILOT_TOPIC_SLUG
}

// Maps each seed topic to its sort_order range in curriculum_content_v2
const TOPIC_TO_V2_RANGE: Record<string, { min: number; max: number }> = {
  // Matemáticas II
  'matematicas_ii:algebra-lineal:matrices-operaciones':    { min: 1,  max: 9  },
  'matematicas_ii:algebra-lineal:sistemas-gauss':          { min: 10, max: 19 },
  'matematicas_ii:geometria-3d:producto-vectorial':        { min: 20, max: 34 },
  'matematicas_ii:analisis:limites-continuidad':           { min: 35, max: 40 },
  'matematicas_ii:analisis:derivadas-optimizacion':        { min: 41, max: 45 },
  'matematicas_ii:integrales:areas-integrales':            { min: 46, max: 49 },
  'matematicas_ii:probabilidad:probabilidad-combinatoria': { min: 50, max: 54 },
  'matematicas_ii:probabilidad:normal-tipificacion':       { min: 55, max: 60 },
  // Historia de España (cards 1-128, sujeto historia_espana en curriculum_content_v2)
  'historia_espana:raices-historicas:origenes-reino-visigodo':       { min: 1,   max: 11  },
  'historia_espana:edad-media:edad-media-peninsular':                { min: 12,  max: 28  },
  'historia_espana:edad-moderna:edad-moderna':                       { min: 29,  max: 52  },
  'historia_espana:crisis-antiguo-regimen:crisis-antiguo-regimen':   { min: 53,  max: 70  },
  'historia_espana:estado-liberal:construccion-estado-liberal':      { min: 53,  max: 70  },
  'historia_espana:restauracion:restauracion':                       { min: 71,  max: 88  },
  'historia_espana:siglo-xx:segunda-republica':                      { min: 89,  max: 97  },
  'historia_espana:siglo-xx:guerra-civil':                           { min: 98,  max: 106 },
  'historia_espana:franquismo-democracia:franquismo':                { min: 107, max: 118 },
  'historia_espana:franquismo-democracia:transicion-democracia':     { min: 119, max: 128 },
  // Física (bloques 1-5, sujeto fisica en curriculum_content_v2)
  'fisica:campo-gravitatorio:campo-gravitatorio':         { min: 1,  max: 12 },
  'fisica:campo-electromagnetico:campo-electromagnetico': { min: 13, max: 23 },
  'fisica:vibraciones-ondas:vibraciones-ondas':           { min: 24, max: 33 },
  'fisica:optica-geometrica:optica-geometrica':           { min: 34, max: 41 },
  'fisica:fisica-siglo-xx:fisica-siglo-xx':               { min: 42, max: 57 },
  // Química (bloques 1-8, sujeto quimica en curriculum_content_v2)
  'quimica:estequiometria:estequiometria':                 { min: 58,  max: 65  },
  'quimica:estructura-atomica:estructura-atomica':         { min: 66,  max: 73  },
  'quimica:enlace-quimico:enlace-quimico':                 { min: 74,  max: 81  },
  'quimica:termoquimica:termoquimica':                     { min: 82,  max: 88  },
  'quimica:equilibrio-cinetica:equilibrio-cinetica':       { min: 89,  max: 99  },
  'quimica:acido-base:acido-base':                         { min: 100, max: 107 },
  'quimica:electroquimica:electroquimica':                 { min: 108, max: 115 },
  'quimica:quimica-organica:quimica-organica':             { min: 116, max: 125 },
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
type MissionXpStatus = 'checking' | 'pending' | 'already_completed' | 'free_practice'
type CurriculumV2Card = {
  sort_order: number
  title: string
  topic_id: string | null
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
  glossary?: Map<string, GlossaryEntry> | null
}
type CaminoCorrectionResponse = {
  error?: string
  message?: string
  code?: string
  correction?: unknown
  respuesta?: unknown
  notEvaluable?: boolean
  truncated?: boolean
  finishReason?: string
  score?: number | null
  mock?: boolean
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

function parseCaminoCorrectionResponse(text: string): CaminoCorrectionResponse {
  if (!text.trim()) return {}
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? parsed as CaminoCorrectionResponse : {}
  } catch {
    return {}
  }
}

function progressKey(topic: CaminoCurriculumTopic) {
  return `${topic.subject}:${topic.blockSlug}:${topic.topicSlug}`
}

function daysSince(isoDate: string): number {
  const createdDay = new Date(isoDate).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const todayDay = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  return Math.floor((new Date(todayDay + 'T00:00:00Z').getTime() - new Date(createdDay + 'T00:00:00Z').getTime()) / 86400000)
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

function LessonMarkdown({ text, className = '', format = 'raw', glossary }: LessonMarkdownProps) {
  const normalized = normalizeLessonMarkdown(text)
  const segments = useMemo(() => parseLessonMarkdownSegments(normalized), [normalized])

  if (!segments.some(segment => segment.type === 'table')) {
    const finalText = glossary ? annotateGlossarySymbols(normalized, glossary) : normalized
    return <MathMarkdown text={finalText} className={className} format={format} />
  }

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'markdown') {
          const finalText = glossary ? annotateGlossarySymbols(segment.text, glossary) : segment.text
          return <MathMarkdown key={index} text={finalText} format={format} />
        }
        return <LessonMarkdownTable key={index} headers={segment.headers} rows={segment.rows} glossary={glossary} />
      })}
    </div>
  )
}

function LessonMarkdownTable({ headers, rows, glossary }: { headers: string[]; rows: string[][]; glossary?: Map<string, GlossaryEntry> | null }) {
  return (
    <div style={{ margin: '16px 0', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 5 }}>
      <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} style={{ borderBottom: '2px solid #0f172a', padding: '10px 14px', fontWeight: 900, fontSize: 11, color: '#0f172a', verticalAlign: 'top' }}>
                <LessonMarkdown text={header} format="raw" glossary={glossary} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} style={{ padding: '10px 14px', fontWeight: 500, color: '#334155', lineHeight: 1.7 }}>
                  <LessonMarkdown text={cell} format="raw" glossary={glossary} />
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
  // Hook del piloto de claymorfismo — se llama siempre (antes del posible
  // return anticipado de más abajo si el tema no existe) para no romper las
  // reglas de hooks; isClayPilotTopic() decide después si se usa su valor.
  const { theme: clayTheme } = useClayThemePreference()
  const onboarding = useMemo(() => loadOnboarding(), [])
  const router = useRouter()
  const params = useSearchParams()
  const missionId = params.get('missionId')
  const shouldStartExercise = params.get('start') === 'exercise'
  const isFirstSession = params.get('first_session') === '1'
  // Presente cuando el alumno llega aquí desde "Repetir para mejorar" (La
  // Zona → Mis Cursos): id de la fila de historial_examenes que se está
  // intentando superar. Activa la vía de XP reducido en vez de
  // complete-mission — nunca toca camino_calendar, la misión ya completada
  // (y su fecha, fijada por el fix de cronología) se queda exactamente igual.
  const repeatOfId = params.get('repeatOf')
  // Presente cuando el aviso "ya completaste esto, ¿repetir?" ya se mostró y
  // confirmó en el propio listado de Mis Cursos (temas sin una fila de
  // historial_examenes que enlazar vía repeatOf, p. ej. lecciones sin
  // calificar) — evita preguntar dos veces lo mismo al aterrizar aquí.
  const entryConfirmed = params.get('confirmed') === '1'
  const exerciseRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const startedMissionRef = useRef<string | null>(null)
  const [toast, setToast] = useState('')
  const [progress, setProgress] = useState<TopicProgress>(() => loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {}))
  const [answerMode, setAnswerMode] = useState<'texto' | 'imagen'>('texto')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [correction, setCorrection] = useState('')
  const [mockCorrection, setMockCorrection] = useState(false)
  const [notEvaluable, setNotEvaluable] = useState(false)
  const [imageError, setImageError] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [xpAwarded, setXpAwarded] = useState<number | null>(null)
  const [firstSessionMarked, setFirstSessionMarked] = useState(false)
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
  const [missionXpStatus, setMissionXpStatus] = useState<MissionXpStatus>('checking')
  const [pendingCalendarRowId, setPendingCalendarRowId] = useState<string | null>(null)
  const [pendingMissionType, setPendingMissionType] = useState<string>('concept')
  // Sin este gate, cualquier enlace directo a un tema ya completado (tarjeta
  // del calendario, vista semanal, Mis Cursos sin pasar por "Repetir para
  // mejorar") aterrizaba en el formulario de entrega ya abierto y enviable,
  // sin avisar de que ya se había hecho. `repeatOfId` en la URL (el flujo de
  // "Repetir para mejorar" ya existente) salta este aviso porque ya expresa
  // la intención explícita de repetir.
  const [repeatConfirmed, setRepeatConfirmed] = useState(false)
  const billing = useBillingStatus()
  // Glosario interactivo de fórmulas (piloto Física): mapa topic_id -> símbolo -> significado,
  // cargado una vez se conocen los topic_id de las fichas mostradas (v2Cards). Vacío para
  // asignaturas sin entradas en formula_glossary — no rompe nada, simplemente no anota nada.
  const [glossaryByTopic, setGlossaryByTopic] = useState<Map<string, Map<string, GlossaryEntry>>>(new Map())
  const [activeGlossaryEntry, setActiveGlossaryEntry] = useState<GlossaryEntry | null>(null)
  const [mobileAsideOpen, setMobileAsideOpen] = useState(false)
  // Cápsula de feedback inmediato pegada al símbolo tocado/con hover (solo el
  // "label" corto) — el panel/drawer sigue mostrando la definición larga por
  // separado, esto es un añadido, no un reemplazo.
  const [glossaryTooltip, setGlossaryTooltip] = useState<{ label: string; left: number; top: number; placement: 'above' | 'below' } | null>(null)
  const glossaryTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (shouldStartExercise) exerciseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [shouldStartExercise])

  async function recordMissionStart(accessToken: string) {
    const calendarMissionId = pendingCalendarRowId ?? missionId
    if (!calendarMissionId || startedMissionRef.current === calendarMissionId) return
    startedMissionRef.current = calendarMissionId
    try {
      const response = await fetch('/api/camino/start-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ missionId: calendarMissionId }),
      })
      if (!response.ok) {
        console.warn('[camino/topic] start mission telemetry skipped', { status: response.status })
      }
    } catch (error) {
      console.warn('[camino/topic] start mission telemetry skipped', error)
    }
  }

  useEffect(() => {
    if (!missionId || !shouldStartExercise || startedMissionRef.current === missionId) return
    startedMissionRef.current = missionId
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token
      if (!token || cancelled) return
      await fetch('/api/camino/start-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ missionId }),
      }).catch(() => undefined)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [missionId, shouldStartExercise])

  useEffect(() => {
    if (!isFirstSession || score === null || !correction || mockCorrection || firstSessionMarked) return
    setFirstSessionMarked(true)
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      fetch('/api/onboarding/first-session-seen', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined)
    })
  }, [isFirstSession, score, correction, mockCorrection, firstSessionMarked])

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
        .select('sort_order, title, topic_id, concept_markdown, worked_example_markdown, alert_markdown, practice_prompt, video_id')
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
      .select('sort_order, title, topic_id, concept_markdown, worked_example_markdown, alert_markdown, practice_prompt, video_id')
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
    const topicIds = [...new Set(v2Cards.map(card => card.topic_id).filter((id): id is string => Boolean(id)))]
    if (topicIds.length === 0) {
      queueMicrotask(() => setGlossaryByTopic(new Map()))
      return
    }
    let cancelled = false
    supabase
      .from('formula_glossary')
      .select('topic_id, symbol, label, definition')
      .in('topic_id', topicIds)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          // Fallo silencioso hasta ahora: sin esto, un error transitorio dejaba
          // glossaryByTopic vacío sin ningún rastro — "no aparece nada marcado"
          // sin ninguna pista de por qué.
          console.warn('[camino/topic] formula_glossary fetch failed', error)
        }
        const map = new Map<string, Map<string, GlossaryEntry>>()
        for (const row of data ?? []) {
          if (!map.has(row.topic_id)) map.set(row.topic_id, new Map())
          map.get(row.topic_id)!.set(row.symbol, { label: row.label, definition: row.definition })
        }
        setGlossaryByTopic(map)
      })
    return () => { cancelled = true }
  }, [v2Cards])

  useEffect(() => {
    if (!mobileAsideOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileAsideOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [mobileAsideOpen])

  // La cápsula se cierra sola a los 3s (temporizador en showGlossaryTooltip),
  // pero también debe cerrarse al tocar fuera de cualquier símbolo marcado —
  // tocar OTRO símbolo no pasa por aquí porque handleGlossaryInteraction ya
  // reinicia el temporizador y reposiciona la cápsula para ese símbolo nuevo.
  useEffect(() => {
    if (!glossaryTooltip) return
    function onDocumentClick(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('[data-glossary-info]')) return
      setGlossaryTooltip(null)
    }
    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [glossaryTooltip])

  useEffect(() => () => {
    if (glossaryTooltipTimer.current) clearTimeout(glossaryTooltipTimer.current)
  }, [])

  const GLOSSARY_TOOLTIP_WIDTH = 220
  const GLOSSARY_TOOLTIP_MARGIN = 8

  // Calcula dónde poner la cápsula a partir del rectángulo real del símbolo
  // tocado: por defecto ENCIMA del símbolo (nunca a su derecha, para no tapar
  // el resto de la línea si el símbolo está a mitad de una fórmula larga), y
  // solo si no cabe arriba (símbolo muy pegado al borde superior del
  // viewport) se coloca debajo. El eje horizontal se centra sobre el símbolo
  // pero se recorta (clamp) para que la cápsula nunca se salga de la
  // pantalla por los lados.
  function computeGlossaryTooltipPosition(rect: DOMRect): { left: number; top: number; placement: 'above' | 'below' } {
    const centerX = rect.left + rect.width / 2
    const left = Math.min(
      Math.max(centerX - GLOSSARY_TOOLTIP_WIDTH / 2, GLOSSARY_TOOLTIP_MARGIN),
      window.innerWidth - GLOSSARY_TOOLTIP_WIDTH - GLOSSARY_TOOLTIP_MARGIN
    )
    const fitsAbove = rect.top > 56
    return fitsAbove
      ? { left, top: rect.top - 10, placement: 'above' }
      : { left, top: rect.bottom + 10, placement: 'below' }
  }

  function showGlossaryTooltip(label: string, rect: DOMRect) {
    setGlossaryTooltip({ label, ...computeGlossaryTooltipPosition(rect) })
    if (glossaryTooltipTimer.current) clearTimeout(glossaryTooltipTimer.current)
    glossaryTooltipTimer.current = setTimeout(() => setGlossaryTooltip(null), 3000)
  }

  // Hover (escritorio, el aside siempre está a la vista) y click/tap (cualquier
  // dispositivo) comparten la misma lectura del símbolo tocado.
  function handleGlossaryInteraction(e: React.SyntheticEvent<HTMLElement>) {
    const target = (e.target as HTMLElement).closest('[data-glossary-info]')
    const raw = target?.getAttribute('data-glossary-info')
    if (!raw) return null
    const decoded = decodeGlossaryPayload(raw)
    if (decoded) {
      setActiveGlossaryEntry(decoded)
      showGlossaryTooltip(decoded.label, target!.getBoundingClientRect())
    }
    return decoded
  }

  // En móvil el aside vive oculto detrás del botón "Progreso y ayuda" (ver
  // Shell más abajo): sin esto, tocar un símbolo actualizaba el estado sin que
  // el alumno viera ningún cambio en pantalla — el "¿Qué significa esto?"
  // quedaba escrito dentro de un drawer que nadie había abierto todavía. Al
  // tocar (no al pasar el ratón) se abre el drawer automáticamente si el
  // aside fijo no está visible, para que la definición aparezca al instante.
  function handleGlossaryClick(e: React.SyntheticEvent<HTMLElement>) {
    const decoded = handleGlossaryInteraction(e)
    if (!decoded) return
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setMobileAsideOpen(true)
    }
  }

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

  useEffect(() => {
    let cancelled = false
    if (!topic) {
      queueMicrotask(() => setMissionXpStatus('free_practice'))
      return () => { cancelled = true }
    }

    const pendingSortOrder = v2Cards[activeV2Index]?.sort_order ?? topic.v2SortOrder ?? null
    if (pendingSortOrder == null) {
      queueMicrotask(() => setMissionXpStatus('free_practice'))
      return () => { cancelled = true }
    }

    queueMicrotask(() => setMissionXpStatus('checking'))
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user?.id
      if (!userId || cancelled) {
        if (!cancelled) setMissionXpStatus('free_practice')
        return
      }
      const { data: rows } = await supabase
        .from('camino_calendar')
        .select('id, status, mission_type')
        .eq('user_id', userId)
        .eq('subject', topic.subject)
        .eq('v2_sort_order', pendingSortOrder)
        .limit(10)

      if (cancelled) return
      const pendingRow = rows?.find(row => row.status === 'pending')
      if (pendingRow) {
        setPendingCalendarRowId(pendingRow.id)
        setPendingMissionType(pendingRow.mission_type ?? 'concept')
        setMissionXpStatus('pending')
      } else if (rows?.some(row => row.status === 'completed')) {
        setPendingCalendarRowId(null)
        setPendingMissionType('concept')
        setMissionXpStatus('already_completed')
      } else {
        setPendingCalendarRowId(null)
        setPendingMissionType('concept')
        setMissionXpStatus('free_practice')
      }
    }).catch(() => {
      if (!cancelled) setMissionXpStatus(missionId ? 'pending' : 'free_practice')
    })
    return () => { cancelled = true }
  }, [topic, v2Cards, activeV2Index, missionId])

  // Un tema puede tener varias mini-lecciones (v2Cards); al cambiar de una
  // ya confirmada a otra sin confirmar, el aviso debe volver a aparecer en
  // vez de quedarse "abierto" para todas las siguientes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRepeatConfirmed(false)
  }, [topic, activeV2Index])

  if (!topic) {
    return <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="kairo-soft-panel p-8"><h1 className="text-2xl font-black text-slate-950">Tema no encontrado</h1><p className="mt-2 text-sm font-semibold text-slate-500">Este tema todavía no está conectado al itinerario de Camino PAU.</p><Link href="/camino" className="kairo-clay-action mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white"><ArrowLeft size={16} /> Volver a Camino</Link></section></main></Shell>
  }

  const currentTopic = topic
  const isClayPilot = isClayPilotTopic(currentTopic)
  const key = progressKey(currentTopic)
  const current = progress[key] ?? { xp: 0 }
  const topicCompleted = Boolean(current.evau)
  const isFreeAndExpired = !billing.loading && !billing.hasActivePack && daysSinceRegistration !== null && daysSinceRegistration >= 7
  const statusLabel = topicCompleted ? 'Completado' : 'Pendiente'
  const selectedV2Card = v2Cards[activeV2Index] ?? v2Cards[0] ?? null
  const selectedV2Number = selectedV2Card ? activeV2Index + 1 : null
  const selectedMissionTitle = selectedV2Card?.title ?? currentTopic.title
  const selectedSortOrder = selectedV2Card?.sort_order ?? currentTopic.v2SortOrder ?? null
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
          const postponeData = await postponeRes.json() as { success?: boolean; warning?: boolean; blockSkipped?: boolean; retryScheduled?: boolean }
          if (postponeData.warning) {
            setToast('Avisamos: tendrás que ver este bloque antes de la PAU')
          } else if (postponeData.blockSkipped) {
            setToast('Entendido, pasamos directamente al siguiente tema.')
          } else if (postponeData.retryScheduled) {
            setToast('Entendido, te lo volveremos a proponer en unos días.')
          }
        }
      }
    } catch {
      // Local adjustment already applied; best-effort.
    }

    setTimeout(() => router.push('/camino'), 1600)
  }

  function chatHref(prompt?: string) {
    const subjectParam =
      currentTopic.subject === 'matematicas_ii' ? 'mates' :
      currentTopic.subject === 'historia_espana' ? 'historia' :
      currentTopic.subject
    const params = new URLSearchParams({
      view: 'chat',
      from: 'camino_course',
      subject: subjectParam,
      block: currentTopic.blockSlug,
      topic: currentTopic.topicSlug,
    })
    if (prompt) params.set('question', prompt)
    return `/examenes?${params.toString()}`
  }

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    // allSettled: una sola foto en formato no compatible (típicamente HEIC
    // de iPhone) no debe descartar las demás ya comprimidas del mismo lote.
    const results = await Promise.allSettled(files.map(async file => ({
      data: await compressImageToBase64(file),
      preview: URL.createObjectURL(file),
      type: 'image/jpeg',
    })))
    const succeeded = results.filter((r): r is PromiseFulfilledResult<UploadedImage> => r.status === 'fulfilled').map(r => r.value)
    const failedCount = results.length - succeeded.length
    if (succeeded.length) setImages(current => [...current, ...succeeded])
    if (failedCount > 0) {
      console.error('[camino] image_compression_failed', { failedCount })
      setImageError(`No hemos podido leer ${failedCount === 1 ? 'una foto' : `${failedCount} fotos`} (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte a JPG/PNG.`)
    } else {
      setImageError('')
    }
  }

  function removeImage(index: number) {
    setImages(current => current.filter((img, i) => {
      if (i === index) URL.revokeObjectURL(img.preview)
      return i !== index
    }))
  }

  function clearImages() {
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
    setImageError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function recordConfirmedCorrectionXp(scoreOnTen: number, xp: number) {
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
    setXpAwarded(xpChanged ? xp : previous?.xp ?? xp)
  }

  function recordCorrectionWeakArea(scoreOnTen: number) {
    if (scoreOnTen >= 6) return
    const weakAreas = loadJson<Array<{ subject: string; block: string; topic: string; score: number; date: string }>>(WEAK_AREAS_KEY, [])
    const nextWeakAreas = [{ subject: subjectLabelFromSlug(currentTopic.subject), block: currentTopic.blockTitle, topic: currentTopic.title, score: scoreOnTen, date: new Date().toISOString() }, ...weakAreas.filter(item => !(item.subject === subjectLabelFromSlug(currentTopic.subject) && item.topic === currentTopic.title))].slice(0, 12)
    saveJson(WEAK_AREAS_KEY, nextWeakAreas)
  }

  async function correctCourseExercise() {
    if (answerMode === 'texto' && !studentAnswer.trim()) return
    if (answerMode === 'imagen' && images.length === 0) return
    const maxScore = 10
    setCorrecting(true)
    setCorrection('')
    setMockCorrection(false)
    setNotEvaluable(false)
    setScore(null)
    setXpAwarded(null)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorrection('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }
      void recordMissionStart(accessToken)
      const statement = selectedV2Card?.practice_prompt ?? currentTopic.practicePrompt ?? currentTopic.guidedExample ?? ('Ejercicio de ' + selectedMissionTitle)
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
          studentResponse: answerMode === 'imagen' ? images[0]?.data : studentAnswer,
          imageType: answerMode === 'imagen' ? images[0]?.type : null,
          studentResponseImages: answerMode === 'imagen'
            ? images.slice(1).map(img => ({ data: img.data, mediaType: img.type }))
            : undefined,
        })
      })
      const data = parseCaminoCorrectionResponse(await response.text())
      if (!response.ok) {
        if (data.error === 'free_plan_expired' || data.error === 'correction_limit_reached' || data.error === 'photo_limit_reached') {
          setShowPaywall(true)
          return
        }
        setCorrection(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      // Fallo técnico (imagen no legible, respuesta vacía, JSON sin
      // contenido genuino) — nunca se guarda como nota real ni cuenta como
      // intento: no se inserta en historial_examenes, no se pide XP y no se
      // marca la misión como completada.
      if (data.notEvaluable) {
        setNotEvaluable(true)
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
      } else if (data.mock && process.env.NODE_ENV !== 'production') {
        setScore(rawScore)
        setMockCorrection(true)
        setMissionXpStatus('free_practice')
        setToast(`Modo prueba · corrección simulada · nota ${rawScore}/10`)
        return
      } else if (repeatOfId) {
        // Repetir para mejorar (La Zona → Mis Cursos, ver DECISIONES en
        // gradeThreshold.ts): la misión de camino_calendar ya está
        // completada y fijada por el fix de cronología — esta vía nunca la
        // toca. Solo se guarda un intento nuevo en historial_examenes y,
        // si la nota mejora, se otorga XP reducido vía award-exam-xp.
        setScore(rawScore)
        recordCorrectionWeakArea(rawScore)
        let toastText = `Intento guardado · nota ${rawScore}/10`
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const { data: inserted } = await supabase.from('historial_examenes').insert({
            user_id: userData.user.id,
            asignatura: currentTopic.subject,
            tipo: 'Camino PAU',
            año: new Date().getFullYear(),
            bloque: currentTopic.blockTitle,
            opcion: 'Repetición',
            nota: rawScore,
            nota_maxima: maxScore,
            enunciado: statement.substring(0, 2000),
            respuesta: answerMode === 'imagen' ? `Respuesta manuscrita adjunta (${images.length} imagen${images.length === 1 ? '' : 'es'}).` : studentAnswer.substring(0, 4000),
            correccion: storedCorrection,
            repeated_from_id: repeatOfId,
            v2_sort_order: selectedSortOrder,
          }).select('id').single()
          if (inserted?.id) {
            try {
              const repeatRes = await fetch('/api/camino/award-exam-xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ historialExamenId: inserted.id, repeatedFromId: repeatOfId }),
              })
              const repeatJson = await repeatRes.json()
              // Con el nuevo sistema de XP, repetir sin mejorar ya no da 0
              // XP (se queda con el XP reducido de repetición de siempre) —
              // repeatJson.improved (no xpAwarded > 0, que ahora es casi
              // siempre true) es lo que distingue si hubo bonus de mejora.
              if (repeatJson.success && typeof repeatJson.xpAwarded === 'number' && repeatJson.xpAwarded > 0) {
                setXpAwarded(repeatJson.xpAwarded)
                if (typeof repeatJson.streakDays === 'number') setStreak(repeatJson.streakDays)
                toastText = repeatJson.improved
                  ? `¡Nota mejorada! +${repeatJson.xpAwarded} XP · nota ${rawScore}/10`
                  : `+${repeatJson.xpAwarded} XP · nota ${rawScore}/10. No ha mejorado tu mejor nota, así que sin bonus extra esta vez.`
                if (repeatJson.leagueUpgrade) setLeagueUpgrade(repeatJson.leagueUpgrade)
              } else {
                toastText = `Intento guardado · nota ${rawScore}/10. No ha mejorado tu mejor nota, así que no suma XP extra.`
              }
            } catch { /* silent */ }
          }
          calcularRacha(userData.user.id, supabase).then(s => setStreak(s)).catch(() => undefined)
        }
        setMissionXpStatus('free_practice')
        setToast(toastText)
        return
      } else {
        setScore(rawScore)
        recordCorrectionWeakArea(rawScore)
        let toastText = `Corrección guardada · nota ${rawScore}/10`
        if (selectedSortOrder != null) {
          try {
            const cmRes = await fetch('/api/camino/complete-mission', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({
                subject: currentTopic.subject,
                v2SortOrder: selectedSortOrder,
                calendarRowId: pendingCalendarRowId ?? missionId ?? undefined,
                missionType: pendingMissionType,
                title: selectedMissionTitle,
                score: rawScore,
              }),
            })
            const cmJson = await cmRes.json()
            if (cmJson.success && typeof cmJson.xpAwarded === 'number') {
              recordConfirmedCorrectionXp(rawScore, cmJson.xpAwarded)
              setXpAwarded(cmJson.xpAwarded)
              setMissionXpStatus('already_completed')
              if (typeof cmJson.streakDays === 'number') setStreak(cmJson.streakDays)
              const bonusXp = typeof cmJson.bonusXp === 'number' ? cmJson.bonusXp : 0
              toastText = `+${cmJson.xpAwarded} XP por corrección · nota ${rawScore}/10${bonusXp > 0 ? ` · +${bonusXp} bonus extra` : ''}`
              if (cmJson.leagueUpgrade) setLeagueUpgrade(cmJson.leagueUpgrade)
            } else if (cmJson.reason === 'already_completed') {
              setMissionXpStatus('already_completed')
              toastText = `Ya completaste esta misión hoy. La corrección se guarda igual.`
            } else if (cmJson.reason === 'free_initiative_recorded') {
              // El servidor ya marcó este tema como completado por iniciativa
              // propia (cola avanzada al siguiente tema distinto, calendario
              // de hoy reflejado) — ver /api/camino/complete-mission.
              setMissionXpStatus('free_practice')
              toastText = `Práctica libre guardada · reflejada en tu calendario de hoy. Kairo no volverá a programarte este tema.`
            } else if (cmJson.reason === 'no_pending_mission') {
              setMissionXpStatus('free_practice')
              toastText = `Práctica libre guardada. El XP se gana con las misiones de tu Camino.`
            }
          } catch (error) {
            console.warn('[camino/topic] complete mission skipped', error)
          }
        } else {
          setMissionXpStatus('free_practice')
          toastText = `Práctica libre guardada. El XP se gana con las misiones de tu Camino.`
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
          opcion: pendingMissionType === 'review' ? 'Repaso' : 'Curso',
          nota: rawScore,
          nota_maxima: maxScore,
          enunciado: statement.substring(0, 2000),
          respuesta: answerMode === 'imagen' ? `Respuesta manuscrita adjunta (${images.length} imagen${images.length === 1 ? '' : 'es'}).` : studentAnswer.substring(0, 4000),
          correccion: storedCorrection,
          v2_sort_order: selectedSortOrder
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
    } catch (error) {
      console.warn('[camino/topic] correction failed', error)
      setCorrection('No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
    } finally {
      setCorrecting(false)
    }
  }

  // Piloto claymorfismo, solo modo oscuro: el fondo real de página (Shell +
  // main + aside) era blanco fijo pase lo que pase, así que las tarjetas
  // oscuras (header, "Idea clave", glosario) flotaban sobre un lienzo que no
  // había cambiado — igual que el bug de temas.css. --clay-bg ya existía y ya
  // era más oscuro que --clay-surface, solo faltaba usarlo aquí. Claro/color
  // no se tocan (sus fondos casi blancos ya encajaban con el `#fdfdfc` fijo).
  const isClayPilotDark = isClayPilot && clayTheme === 'dark'

  return (
    <Shell clayTheme={isClayPilot ? clayTheme : undefined} clayDarkBg={isClayPilotDark}>
      {/* ── Dark topbar ── */}
      <div className="topic-topbar" style={{ background: '#0f172a', padding: '11px 32px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Link href="/camino" style={{ color: '#475569', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Volver
        </Link>
        <span style={{ width: 1, height: 14, background: '#1e293b', flexShrink: 0 }} />
        <p className="topic-topbar-breadcrumb" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#475569', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Camino PAU &rsaquo; {subjectLabelFromSlug(currentTopic.subject)} &rsaquo; <span style={{ color: '#93c5fd' }}>{currentTopic.blockTitle}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {streak > 0 && <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 999, padding: '3px 10px' }}>🔥 {streak}</span>}
          {NOT_SEEN_BUTTON_TOPICS.has(`${currentTopic.subject}:${currentTopic.topicSlug}`) && (
            <button onClick={markNotSeen} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#92400e', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
              <School size={13} /> No lo he dado en clase
            </button>
          )}
        </div>
      </div>

      {/* ── Document body: article + aside ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Article column */}
        <main
          className="topic-main"
          onClick={handleGlossaryClick}
          onMouseOver={handleGlossaryInteraction}
          style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', background: isClayPilotDark ? 'var(--clay-bg)' : '#fdfdfc', borderRight: isClayPilotDark ? '1px solid var(--clay-border)' : '1px solid #e2e8f0', minWidth: 0 }}
        >

          {/* Document header — piloto de claymorfismo solo si isClayPilot (ver
              CLAY_PILOT_SUBJECT/CLAY_PILOT_TOPIC_SLUG más arriba); cualquier
              otro tema renderiza el header original sin cambios. */}
          {isClayPilot ? (
            <ClayThemeScope theme={clayTheme} style={{ marginBottom: 36, background: 'transparent' }}>
              <ClayCard radius={24} padding={28}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--clay-accent)', marginBottom: 10 }}>
                  {subjectLabelFromSlug(currentTopic.subject)} &middot; {currentTopic.blockTitle}
                </p>
                <h1 className="topic-h1 [&_p]:m-0 [&_p]:inline" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 38, fontWeight: 700, color: 'var(--clay-text)', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
                  <LessonMarkdown text={currentTopic.title} format="raw" />
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12, alignItems: 'center' }}>
                  <ClayBadge tone="neutral">{selectedV2Card ? 'Mini-misión · 25 min' : '25 min'}</ClayBadge>
                  <ClayBadge tone={topicCompleted ? 'accent' : 'neutral'}>{statusLabel}</ClayBadge>
                  {selectedV2Number && <ClayBadge tone="neutral">Mini-misión {selectedV2Number} de {v2Cards.length}</ClayBadge>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--clay-text-muted)', lineHeight: 1.7, margin: 0 }}>
                  Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU relacionado.
                </p>
              </ClayCard>
            </ClayThemeScope>
          ) : (
            <header style={{ marginBottom: 36, paddingBottom: 28, borderBottom: '2px solid #0f172a' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 10 }}>
                {subjectLabelFromSlug(currentTopic.subject)} &middot; {currentTopic.blockTitle}
              </p>
              <h1 className="topic-h1 [&_p]:m-0 [&_p]:inline" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 38, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
                <LessonMarkdown text={currentTopic.title} format="raw" />
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
                Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU relacionado.
              </p>
            </header>
          )}

          {currentTopic.subject === 'lengua' && currentTopic.blockSlug === 'educacion-literaria' && (
            <LenguaObrasLeidasSelector />
          )}

          {/* ── Content sections ── */}
          {currentTopic.contentStatus === 'flashcard_v2' ? (
            v2Loading ? (
              <LearningCard title="Explicación" dark={isClayPilotDark}><ContentSkeleton /></LearningCard>
            ) : selectedV2Card ? (
              <>
                <LearningCard title="Idea clave" dark={isClayPilotDark}>
                  {isClayPilot ? (
                    <ClayThemeScope theme={clayTheme} style={{ background: 'transparent' }}>
                      <ClayCard radius={18}>
                        {selectedV2Card.concept_markdown
                          ? <LessonMarkdown text={selectedV2Card.concept_markdown} format="raw" />
                          : <EmptyContent dark={isClayPilotDark} />}
                      </ClayCard>
                      {selectedV2Card.alert_markdown && (
                        <ClayCard radius={18} style={{ marginTop: 14 }}>
                          <LessonMarkdown text={selectedV2Card.alert_markdown} format="raw" />
                        </ClayCard>
                      )}
                    </ClayThemeScope>
                  ) : (
                    <>
                      {selectedV2Card.concept_markdown
                        ? <LessonMarkdown text={selectedV2Card.concept_markdown} format="raw" />
                        : <EmptyContent />}
                      {selectedV2Card.alert_markdown && (
                        <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '12px 14px' }}>
                          <LessonMarkdown text={selectedV2Card.alert_markdown} format="raw" />
                        </div>
                      )}
                    </>
                  )}
                </LearningCard>
                {selectedV2Card.worked_example_markdown && (
                  <LearningCard title="Caso práctico resuelto" dark={isClayPilotDark}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '14px 16px' }}>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={selectedV2Card.worked_example_markdown} format="raw" />
                      </div>
                    </div>
                  </LearningCard>
                )}
                {videoId && (
                  <LearningCard title="Vídeo explicativo" dark={isClayPilotDark}>
                    <button onClick={() => setVideoOpen(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: isClayPilotDark ? 'var(--clay-text-muted)' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                    </button>
                    {videoOpen && (
                      <div style={{ marginTop: 12, overflow: 'hidden', borderRadius: 4, border: isClayPilotDark ? '1px solid var(--clay-border)' : '1px solid #e2e8f0' }}>
                        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                          <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                        </div>
                      </div>
                    )}
                  </LearningCard>
                )}
                {selectedV2Card.practice_prompt && (
                  <LearningCard title="Inténtalo tú" dark={isClayPilotDark}>
                    <LessonMarkdown text={selectedV2Card.practice_prompt} format="raw" glossary={selectedV2Card.topic_id ? glossaryByTopic.get(selectedV2Card.topic_id) : undefined} />
                  </LearningCard>
                )}
              </>
            ) : (
              <LearningCard title="Idea clave" dark={isClayPilotDark}>
                {isClayPilot ? (
                  <ClayThemeScope theme={clayTheme} style={{ background: 'transparent' }}>
                    <ClayCard radius={18}><EmptyContent dark={isClayPilotDark} /></ClayCard>
                  </ClayThemeScope>
                ) : (
                  <EmptyContent />
                )}
              </LearningCard>
            )
          ) : (
            <>
              <LearningCard title={lessonTitleFor(currentTopic)}>
                {v2Loading
                  ? <ContentSkeleton />
                  : v2Cards.length > 0
                    ? <V2FlashcardAccordion cards={v2Cards} glossaryByTopic={glossaryByTopic} />
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
                    <div className="kairo-soft-panel" style={{ marginTop: 16, background: '#eff6ff', padding: '14px 16px' }}>
                      <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.14em', color: '#2563eb', marginBottom: 8 }}>Ahora inténtalo tú</p>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={selectedV2Card.practice_prompt} format="raw" glossary={selectedV2Card.topic_id ? glossaryByTopic.get(selectedV2Card.topic_id) : undefined} />
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
          <article ref={exerciseRef} id="course-exercise" style={{ paddingTop: 28, paddingBottom: 40, borderTop: isClayPilotDark ? '1px solid var(--clay-border)' : '1px solid #dbe7fb', marginTop: 4 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 20, fontWeight: 700, color: isClayPilotDark ? 'var(--clay-text)' : '#0f172a', letterSpacing: '-.01em' }}>Entrega tu ejercicio</h2>
                <p style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: isClayPilotDark ? 'var(--clay-text-muted)' : '#64748b' }}>Corrige el ejercicio para registrar XP. La nota ajusta el bonus.</p>
              </div>
              <span style={{ borderRadius: 999, background: missionXpStatus === 'pending' ? '#eff6ff' : missionXpStatus === 'already_completed' ? '#f0fdf4' : '#f8fafc', padding: '3px 10px', fontSize: 10, fontWeight: 900, color: missionXpStatus === 'pending' ? '#2563eb' : missionXpStatus === 'already_completed' ? '#059669' : '#64748b', border: `1px solid ${missionXpStatus === 'pending' ? '#bfdbfe' : missionXpStatus === 'already_completed' ? '#bbf7d0' : '#e2e8f0'}` }}>
                {missionXpStatus === 'checking' ? 'Comprobando XP...' : missionXpStatus === 'pending' ? 'Misión con XP' : missionXpStatus === 'already_completed' ? 'Misión ya completada' : 'Práctica libre · no suma XP'}
              </span>
            </div>
            {missionXpStatus === 'already_completed' && !repeatOfId && !repeatConfirmed && !entryConfirmed ? (
              <div style={{ borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '20px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#065f46', marginBottom: 6 }}>Ya has completado este ejercicio</p>
                {current.score != null && (
                  <p style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginBottom: 6 }}>{current.score}/10</p>
                )}
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#166534', marginBottom: 16, lineHeight: 1.6 }}>
                  {current.score != null ? 'Tu nota la última vez. Puedes repetirlo para intentar mejorarla, o volver a Mis Cursos.' : 'Puedes repetirlo para intentar mejorar tu nota, o volver a Mis Cursos.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setRepeatConfirmed(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, background: '#059669', padding: '10px 20px', fontSize: 13, fontWeight: 900, color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <RotateCcw size={14} /> Sí, quiero repetirlo
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/zona/cursos')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, background: 'white', padding: '10px 20px', fontSize: 13, fontWeight: 900, color: '#065f46', border: '1px solid #bbf7d0', cursor: 'pointer' }}
                  >
                    Volver a Mis Cursos
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isClayPilot ? (
                  <ClayThemeScope theme={clayTheme} style={{ background: 'transparent', display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                    <ClayButton type="button" onClick={() => setAnswerMode('texto')} variant={answerMode === 'texto' ? 'primary' : 'secondary'} style={{ padding: '10px 18px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <PenLine size={13} /> Escribir respuesta
                    </ClayButton>
                    <ClayButton type="button" onClick={() => setAnswerMode('imagen')} variant={answerMode === 'imagen' ? 'primary' : 'secondary'} style={{ padding: '10px 18px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <Camera size={13} /> Subir foto
                    </ClayButton>
                  </ClayThemeScope>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <button type="button" onClick={() => setAnswerMode('texto')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: answerMode === 'texto' ? 'none' : '1px solid #dbe7fb', background: answerMode === 'texto' ? '#0f172a' : '#f8fbff', color: answerMode === 'texto' ? 'white' : '#64748b', boxShadow: answerMode === 'texto' ? '0 8px 18px rgba(15,23,42,.14)' : 'var(--kairo-inset-soft)' }}>
                      <PenLine size={13} /> Escribir respuesta
                    </button>
                    <button type="button" onClick={() => setAnswerMode('imagen')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', border: answerMode === 'imagen' ? 'none' : '1px solid #dbe7fb', background: answerMode === 'imagen' ? '#0f172a' : '#f8fbff', color: answerMode === 'imagen' ? 'white' : '#64748b', boxShadow: answerMode === 'imagen' ? '0 8px 18px rgba(15,23,42,.14)' : 'var(--kairo-inset-soft)' }}>
                      <Camera size={13} /> Subir foto
                    </button>
                  </div>
                )}
                {answerMode === 'texto' ? (
                  // El textarea de MathEditor se vuelve transparente por diseño
                  // (para poder mostrar la capa de LaTeX renderizado encima) y
                  // hereda el fondo de la página con texto oscuro fijo (#0f172a)
                  // — con <main> ya oscuro por el piloto, ese texto se volvía
                  // invisible. textareaStyle ya es un prop expuesto por
                  // MathEditor para esto exacto, sin tocar su componente.
                  // ANSWER_HAS_LATEX_OVERLAY replica la misma condición interna
                  // de MathEditor (hasContent && hasLatex) para NO forzar color
                  // cuando el textarea debe quedarse transparente (superpuesto
                  // sobre el LaTeX renderizado) — si lo forzáramos siempre,
                  // se rompería esa superposición en cuanto el alumno escriba
                  // una fórmula.
                  <MathEditor
                    subject={currentTopic.subject}
                    value={studentAnswer}
                    onChange={setStudentAnswer}
                    placeholder="Escribe aquí tu desarrollo paso a paso..."
                    minHeight={160}
                    accentColor={isClayPilotDark ? '#60a5fa' : '#2563eb'}
                    softColor={isClayPilotDark ? 'var(--clay-accent-soft)' : undefined}
                    borderColor={isClayPilotDark ? 'var(--clay-border)' : undefined}
                    textareaStyle={isClayPilotDark ? {
                      background: 'var(--clay-surface-raised)',
                      color: (studentAnswer.trim().length > 0 && /\$|\\\[|\\\(|\\begin\{/.test(studentAnswer)) ? 'transparent' : 'var(--clay-text)',
                    } : undefined}
                  />
                ) : (
                  <div className="kairo-inset" style={{ borderRadius: 14, borderStyle: 'dashed', padding: 14, ...(isClayPilotDark ? { background: 'var(--clay-surface-raised)', borderColor: 'var(--clay-border)' } : {}) }}>
                    <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleImage} style={{ display: 'none' }} />
                    {images.length > 0 && (
                      <div style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
                        {images.map((img, index) => (
                          <div key={`${img.preview}-${index}`} style={{ position: 'relative' }}>
                            <img src={img.preview} alt={`Página ${index + 1}`} loading="lazy" decoding="async" style={{ height: 96, width: '100%', borderRadius: 4, border: '1px solid #e2e8f0', objectFit: 'cover' }} />
                            <span style={{ position: 'absolute', bottom: 4, left: 4, borderRadius: 4, background: 'rgba(15,23,42,0.75)', color: 'white', fontSize: 10, fontWeight: 900, padding: '1px 6px' }}>{index + 1}</span>
                            <button type="button" onClick={() => removeImage(index)} aria-label={`Quitar página ${index + 1}`} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={isClayPilotDark ? undefined : 'kairo-soft-control'}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', fontSize: 13, fontWeight: 900, cursor: 'pointer',
                          color: isClayPilotDark ? 'var(--clay-accent)' : '#2563eb',
                          ...(isClayPilotDark ? { background: 'var(--clay-surface)', border: '1px solid var(--clay-border)', borderRadius: 'var(--kairo-radius-control)' } : {}),
                        }}
                      >
                        <UploadCloud size={15} /> {images.length > 0 ? 'Añadir otra página' : 'Hacer foto o elegir imagen'}
                      </button>
                      {images.length > 0 && (
                        <button type="button" onClick={clearImages} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 4, border: isClayPilotDark ? '1px solid #7f1d1d' : '1px solid #fecaca', background: isClayPilotDark ? 'var(--clay-surface)' : 'white', padding: '10px 12px', fontSize: 11, fontWeight: 900, color: isClayPilotDark ? '#f87171' : '#dc2626', cursor: 'pointer' }}>
                          <X size={13} /> Quitar todas
                        </button>
                      )}
                    </div>
                    {images.length > 1 && (
                      <p style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: isClayPilotDark ? 'var(--clay-text-muted)' : '#64748b' }}>Se corrigen juntas como páginas consecutivas de una misma respuesta.</p>
                    )}
                    {imageError && (
                      <p style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: isClayPilotDark ? '#f87171' : '#dc2626' }}>{imageError}</p>
                    )}
                  </div>
                )}
                <button type="button" className="kairo-clay-action" onClick={isFreeAndExpired ? () => setShowPaywall(true) : correctCourseExercise} disabled={correcting || (answerMode === 'texto' ? !studentAnswer.trim() : images.length === 0)} style={{ marginTop: 12, display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 900, color: 'white', border: 'none', cursor: correcting ? 'not-allowed' : 'pointer', opacity: (correcting || (answerMode === 'texto' ? !studentAnswer.trim() : images.length === 0)) ? .5 : 1 }}>
                  {correcting ? <><KairoLoadingDot /> Corrigiendo con Kairo...</> : <>Corregir con Kairo <Check size={15} /></>}
                </button>
                {notEvaluable && (
                  <div style={{ marginTop: 12, borderRadius: 4, background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#991b1b' }}>No se pudo leer tu respuesta — no evaluable</p>
                    <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#b91c1c', lineHeight: 1.4 }}>
                      Ha sido un error técnico, no un problema con tu trabajo. No cuenta como intento ni afecta a tu Camino.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" onClick={correctCourseExercise} style={{ fontSize: 12, fontWeight: 900, color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}>
                        Reintentar corrección
                      </button>
                      <a
                        href="mailto:hola@kairo.es?subject=Error%20t%C3%A9cnico%20al%20corregir&body=Se%20produjo%20un%20error%20t%C3%A9cnico%20al%20corregir%20un%20ejercicio%20de%20Camino%20PAU."
                        style={{ fontSize: 12, fontWeight: 900, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                      >
                        Reportar error
                      </a>
                    </div>
                  </div>
                )}
                {/* Zona que quedó fuera del piloto clay original: la caja de
                    nota, el badge "Modo prueba", la corrección en sí y la
                    tarjeta de primera sesión no participaban del tema pese a
                    vivir dentro de la ficha piloto de Bohr. Mismo patrón
                    isClayPilot ? ClayThemeScope : legacy que el resto del
                    archivo, para no afectar a ningún tema fuera del piloto. */}
                {isClayPilot ? (
                  <ClayThemeScope theme={clayTheme} style={{ background: 'transparent' }}>
                    {score != null && (
                      <p style={{ marginTop: 12, borderRadius: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', fontSize: 13, fontWeight: 900, color: '#065f46' }}>
                        Nota: {score}/10{xpAwarded != null ? ` · XP registrado: ${xpAwarded}` : ''}
                      </p>
                    )}
                    {mockCorrection && process.env.NODE_ENV !== 'production' && (
                      <p style={{ marginTop: 8, display: 'inline-flex', borderRadius: 999, background: 'var(--clay-bg)', border: '1px solid var(--clay-border)', padding: '4px 10px', fontSize: 11, fontWeight: 900, color: 'var(--clay-text-muted)' }}>
                        Modo prueba
                      </p>
                    )}
                    {correction && <div style={{ marginTop: 14 }}><CorrectionResultCard correction={correction} officialMaxScore={10} className="p-5 text-sm leading-7" /></div>}
                    {isFirstSession && score !== null && correction && !mockCorrection && (
                      <div style={{ marginTop: 20, borderRadius: 12, background: 'var(--clay-accent-deep)', padding: '20px 22px', color: 'var(--clay-on-accent)' }}>
                        <p style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.4, marginBottom: 10 }}>
                          {score < 5
                            ? 'Este es tu punto de partida. Kairo ya sabe en qué tienes que trabajar y va a empezar por ahí.'
                            : 'Buen comienzo. A partir de aquí Kairo ajusta tu Camino a lo que necesitas.'}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--clay-on-accent)', opacity: .6, lineHeight: 1.7, marginBottom: 18 }}>
                          Kairo convierte tus correcciones en la siguiente misión: qué hacer ahora, cuánto suma y cómo seguir avanzando.
                        </p>
                        <KairoMapCard embedded />
                        <a
                          href="/camino"
                          style={{ display: 'inline-block', marginTop: 18, padding: '11px 20px', borderRadius: 8, background: 'var(--clay-accent)', color: 'var(--clay-on-accent)', fontSize: 13, fontWeight: 900, textDecoration: 'none', letterSpacing: '-0.01em' }}
                        >
                          Ver mi Camino →
                        </a>
                      </div>
                    )}
                  </ClayThemeScope>
                ) : (
                  <>
                    {score != null && (
                      <p style={{ marginTop: 12, borderRadius: 4, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', fontSize: 13, fontWeight: 900, color: '#065f46' }}>
                        Nota: {score}/10{xpAwarded != null ? ` · XP registrado: ${xpAwarded}` : ''}
                      </p>
                    )}
                    {mockCorrection && process.env.NODE_ENV !== 'production' && (
                      <p style={{ marginTop: 8, display: 'inline-flex', borderRadius: 999, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', fontSize: 11, fontWeight: 900, color: '#64748b' }}>
                        Modo prueba
                      </p>
                    )}
                    {correction && <div style={{ marginTop: 14 }}><CorrectionResultCard correction={correction} officialMaxScore={10} className="p-5 text-sm leading-7" /></div>}
                    {isFirstSession && score !== null && correction && !mockCorrection && (
                      <div style={{ marginTop: 20, borderRadius: 12, background: '#0f172a', padding: '20px 22px', color: 'white' }}>
                        <p style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.4, marginBottom: 10 }}>
                          {score < 5
                            ? 'Este es tu punto de partida. Kairo ya sabe en qué tienes que trabajar y va a empezar por ahí.'
                            : 'Buen comienzo. A partir de aquí Kairo ajusta tu Camino a lo que necesitas.'}
                        </p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 18 }}>
                          Kairo convierte tus correcciones en la siguiente misión: qué hacer ahora, cuánto suma y cómo seguir avanzando.
                        </p>
                        <KairoMapCard embedded />
                        <a
                          href="/camino"
                          style={{ display: 'inline-block', marginTop: 18, padding: '11px 20px', borderRadius: 8, background: '#2563eb', color: 'white', fontSize: 13, fontWeight: 900, textDecoration: 'none', letterSpacing: '-0.01em' }}
                        >
                          Ver mi Camino →
                        </a>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </article>
        </main>

        {/* ── Aside (escritorio) ── */}
        <aside className="topic-aside" style={{ width: 264, flexShrink: 0, background: isClayPilotDark ? 'var(--clay-surface)' : 'rgba(248,251,255,.82)', padding: '28px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0, borderLeft: isClayPilotDark ? '1px solid var(--clay-border)' : '1px solid #dbe7fb' }}>
          <TopicAsideBody
            streak={streak}
            liga={liga}
            ligaLoading={ligaLoading}
            myLigaEntry={myLigaEntry}
            currentTopic={currentTopic}
            currentXp={current.xp ?? 0}
            topicCompleted={topicCompleted}
            chatHref={chatHref}
            activeGlossaryEntry={activeGlossaryEntry}
          />
        </aside>

      </div>{/* end document body */}

      {/* ── Botón flotante "Progreso y ayuda" (solo móvil) ──
          bottom:84 (no 20) para no quedar tapado por CookieBanner.tsx, que es
          fixed/bottom:0/z-index:9999 a todo el ancho en la primera visita —
          con bottom:20 el botón quedaba oculto detrás del banner hasta que el
          alumno aceptaba/rechazaba cookies. */}
      <button
        type="button"
        onClick={() => setMobileAsideOpen(true)}
        className="topic-mobile-aside-trigger"
        style={{ display: 'none', position: 'fixed', bottom: 84, right: 20, zIndex: 40, alignItems: 'center', gap: 7, background: '#0f172a', color: 'white', border: 'none', borderRadius: 999, padding: '11px 18px', fontSize: 12, fontWeight: 900, boxShadow: '0 12px 30px rgba(15,23,42,.28)', cursor: 'pointer' }}
      >
        <School size={14} /> Progreso y ayuda
      </button>

      {/* ── Drawer con el mismo contenido del aside (móvil) — no tapa la lección: se abre a demanda y se cierra tocando fuera/Escape/la X, igual que XpExplainerDrawer ── */}
      {mobileAsideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Progreso, práctica, chat y glosario de este tema"
          onClick={() => setMobileAsideOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}
        >
          <style>{`
            @keyframes topic-aside-drawer-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .topic-aside-drawer-panel { animation: topic-aside-drawer-in 260ms cubic-bezier(0.23,1,0.32,1) both; }
            @media (max-width: 640px) { .topic-aside-drawer-panel { width: 100vw !important; } }
          `}</style>
          <div
            className="topic-aside-drawer-panel"
            onClick={e => e.stopPropagation()}
            style={{ width: 'min(360px, 100vw)', height: '100%', background: 'rgba(248,251,255,.98)', boxShadow: '0 16px 48px rgba(37,99,235,0.12), 0 32px 80px rgba(37,99,235,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 20px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: 0 }}>Progreso y ayuda</p>
              <button
                type="button"
                onClick={() => setMobileAsideOpen(false)}
                aria-label="Cerrar"
                style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={15} />
              </button>
            </div>
            <div
              onClick={handleGlossaryInteraction}
              style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}
            >
              <TopicAsideBody
                streak={streak}
                liga={liga}
                ligaLoading={ligaLoading}
                myLigaEntry={myLigaEntry}
                currentTopic={currentTopic}
                currentXp={current.xp ?? 0}
                topicCompleted={topicCompleted}
                chatHref={chatHref}
                activeGlossaryEntry={activeGlossaryEntry}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cápsula de feedback inmediato del glosario de fórmulas — pegada al
          símbolo tocado/con hover, mismo lenguaje visual que el Toast de
          abajo (píldora oscura, texto blanco, sombra) para no inventar un
          estilo nuevo. position:fixed con coordenadas de getBoundingClientRect
          (viewport), por eso no se ve afectada por el scroll del contenedor. */}
      {glossaryTooltip && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: glossaryTooltip.left,
            top: glossaryTooltip.top,
            transform: glossaryTooltip.placement === 'above' ? 'translateY(-100%)' : undefined,
            zIndex: 45,
            width: GLOSSARY_TOOLTIP_WIDTH,
            pointerEvents: 'none',
            borderRadius: 10,
            background: '#0f172a',
            color: 'white',
            fontSize: 12,
            fontWeight: 800,
            padding: '7px 12px',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(15,23,42,.28)',
          }}
        >
          {glossaryTooltip.label}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50, borderRadius: 14, background: '#0f172a', padding: '12px 18px', fontSize: 13, fontWeight: 900, color: 'white', boxShadow: '0 12px 30px rgba(15,23,42,.24)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {toast}
          <button onClick={() => setToast('')} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><RotateCcw size={13} /></button>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && (
        <div className="kairo-subtle-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="kairo-modal-card w-full max-w-sm p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Tu plan gratuito ha terminado</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Has completado 7 días de Camino PAU. Para seguir avanzando, desbloquea el acceso completo.</p>
              </div>
              <button type="button" onClick={() => setShowPaywall(false)} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="grid gap-2">
              <Link href="/precios" className="kairo-clay-action flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white">Desbloquear acceso completo <ArrowRight size={14} /></Link>
              <button type="button" onClick={() => setShowPaywall(false)} className="kairo-soft-control flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-black text-slate-600">Seguir con el plan gratuito</button>
            </div>
            <Link href="/precios" className="mt-3 block text-center text-sm font-black text-blue-700 hover:underline">Ver planes</Link>
          </div>
        </div>
      )}

      {/* League upgrade modal */}
      {leagueUpgrade && (() => {
        const upgradedDiv = DIVISIONS.find(d => d.name === leagueUpgrade.to) ?? DIVISIONS[DIVISIONS.length - 1]
        return (
          <div className="kairo-subtle-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="kairo-modal-card w-full max-w-sm p-6">
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

// ── Contenido del aside (progreso/práctica/chat/glosario/XP) — compartido entre
// el <aside> fijo de escritorio y el drawer de móvil, mismo contenido en ambos
// sitios para que un alumno de móvil tenga acceso exactamente a lo mismo que uno
// de escritorio (antes el aside entero se ocultaba por completo en móvil).
function TopicAsideBody({
  streak,
  liga,
  ligaLoading,
  myLigaEntry,
  currentTopic,
  currentXp,
  topicCompleted,
  chatHref,
  activeGlossaryEntry,
}: {
  streak: number
  liga: LigaInfo | null
  ligaLoading: boolean
  myLigaEntry: LigaMiembro | null
  currentTopic: CaminoCurriculumTopic
  currentXp: number
  topicCompleted: boolean
  chatHref: (prompt?: string) => string
  activeGlossaryEntry: GlossaryEntry | null
}) {
  const isClayPilot = isClayPilotTopic(currentTopic)
  const { theme: clayTheme } = useClayThemePreference()
  // El fondo del <aside> pasa a oscuro (var(--clay-surface)) solo en este
  // tema para el piloto — el texto de las secciones que no tienen su propia
  // caja clara (Tu progreso, Práctica PAU, XP, Ver planes) seguía en negro
  // fijo y quedaba ilegible sobre ese fondo oscuro. Las secciones que ya
  // tienen su propia caja (glosario en ClayCard, "Pregunta a Kairo" en
  // kairo-glass) no necesitan esto, ya resuelven su propio contraste.
  const isClayPilotDark = isClayPilot && clayTheme === 'dark'
  const asideText = isClayPilotDark ? 'var(--clay-text)' : '#0f172a'
  const asideMuted = isClayPilotDark ? 'var(--clay-text-muted)' : '#94a3b8'
  const asideBody = isClayPilotDark ? 'var(--clay-text-muted)' : '#64748b'
  const asideBorder = isClayPilotDark ? 'var(--clay-border)' : '#e2e8f0'
  const asideAccent = isClayPilotDark ? 'var(--clay-accent)' : '#2563eb'
  return (
    <>
      {/* Streak + Liga */}
      <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: `1px solid ${asideBorder}` }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: asideMuted, marginBottom: 10 }}>Tu progreso</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: asideText, lineHeight: 1 }}>{streak}</p>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: asideMuted, marginTop: 2 }}>días racha</p>
          </div>
          <div style={{ width: 1, height: 28, background: asideBorder, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {ligaLoading ? (
              <div style={{ height: 10, width: 80, borderRadius: 999, background: '#f1f5f9' }} />
            ) : liga && myLigaEntry ? (
              <>
                <p style={{ fontSize: 12, fontWeight: 900, color: asideText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liga.nombre}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: asideMuted, marginTop: 2 }}>#{myLigaEntry.rank} · {myLigaEntry.weekly_xp} XP ronda</p>
              </>
            ) : (
              <Link href="/camino" style={{ fontSize: 12, fontWeight: 900, color: asideAccent, textDecoration: 'none' }}>Crear liga →</Link>
            )}
          </div>
        </div>
      </div>

      {/* Práctica PAU */}
      <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${asideBorder}` }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: asideMuted, marginBottom: 8 }}>Práctica PAU</p>
        <p style={{ fontSize: 12, fontWeight: 500, color: asideBody, lineHeight: 1.5, marginBottom: 10 }}>Ejercicio real con este contexto.</p>
        {isClayPilot ? (
          <ClayThemeScope theme={clayTheme} style={{ background: 'transparent' }}>
            <ClayLinkButton href={buildEvauHref(currentTopic)} style={{ marginBottom: 8 }}>
              Practicar PAU <ArrowRight size={12} />
            </ClayLinkButton>
            <ClayLinkButton href="#course-exercise" variant="secondary">
              Ir a la respuesta <Check size={12} />
            </ClayLinkButton>
          </ClayThemeScope>
        ) : (
          <>
            <Link href={buildEvauHref(currentTopic)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, padding: '9px 12px', fontSize: 11, fontWeight: 900, textDecoration: 'none', marginBottom: 6 }}>
              Practicar PAU <ArrowRight size={12} />
            </Link>
            <a href="#course-exercise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
              Ir a la respuesta <Check size={12} />
            </a>
          </>
        )}
      </div>

      {/* Chat Kairo */}
      <div className="kairo-glass" style={{ marginBottom: 18, padding: 14, borderRadius: 16 }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 10 }}>Pregunta a Kairo</p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>Pregunta sobre este tema con el contexto ya preparado.</p>
        <details style={{ marginBottom: 10 }}>
          <summary style={{ cursor: 'pointer', fontSize: 10, fontWeight: 900, color: '#7c3aed' }}>Preguntas rápidas</summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {['Explícamelo más fácil', 'Ponme otro ejemplo', 'No entiendo este paso', 'Hazme una pregunta parecida', '¿Por qué se hace así?'].map(item => (
              <Link key={item} href={chatHref(item)} style={{ borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', padding: '4px 9px', fontSize: 10, fontWeight: 700, color: '#334155', textDecoration: 'none' }}>
                {item}
              </Link>
            ))}
          </div>
        </details>
        {isClayPilot ? (
          <ClayThemeScope theme={clayTheme} style={{ background: 'transparent' }}>
            <ClayLinkButton href={chatHref()}>
              Abrir Chat con Kairo <MessageCircle size={12} />
            </ClayLinkButton>
          </ClayThemeScope>
        ) : (
          <Link href={chatHref()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', background: '#7c3aed', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
            Abrir Chat con Kairo <MessageCircle size={12} />
          </Link>
        )}
      </div>

      {/* Glosario interactivo (piloto Física): se actualiza al tocar/pasar el ratón
          sobre un símbolo marcado dentro de una fórmula — nunca en una burbuja
          flotante sobre la propia fórmula, siempre aquí. Restilizado en clay
          solo para isClayPilot (misma lógica/datos, sin cambios). */}
      {isClayPilot ? (
        <ClayThemeScope theme={clayTheme} style={{ marginBottom: 18, background: 'transparent' }}>
          <ClayCard radius={20} padding={18}>
            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'var(--clay-text-muted)', marginBottom: 8 }}>¿Qué significa esto?</p>
            {activeGlossaryEntry ? (
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: 'var(--clay-text)', marginBottom: 4 }}>{activeGlossaryEntry.label}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--clay-text-muted)', lineHeight: 1.5 }}>{activeGlossaryEntry.definition}</p>
              </div>
            ) : (
              <ClayEmptyState title="Aún no hay símbolo seleccionado" subtitle="Toca (o pasa el ratón sobre) un símbolo resaltado de una fórmula para ver su significado aquí." />
            )}
          </ClayCard>
        </ClayThemeScope>
      ) : (
        <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 8 }}>¿Qué significa esto?</p>
          {activeGlossaryEntry ? (
            <div>
              <p style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{activeGlossaryEntry.label}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>{activeGlossaryEntry.definition}</p>
            </div>
          ) : (
            <p style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', lineHeight: 1.5 }}>Toca (o pasa el ratón sobre) un símbolo resaltado de una fórmula para ver su significado aquí.</p>
          )}
        </div>
      )}

      {/* XP */}
      <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${asideBorder}` }}>
        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: asideMuted, marginBottom: 8 }}>XP en este tema</p>
        <p style={{ fontSize: 20, fontWeight: 900, color: topicCompleted ? '#059669' : asideText, lineHeight: 1, marginBottom: 4 }}>{currentXp} XP</p>
        <p style={{ fontSize: 11, fontWeight: 600, color: asideBody }}>{topicCompleted ? 'Tema completado con corrección.' : 'Pendiente de corrección.'}</p>
      </div>

      <Link href="/precios" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 900, color: asideAccent, marginTop: 4, textDecoration: 'none' }}>Ver planes</Link>
    </>
  )
}

// ── curriculum_content_v2 flashcard accordion (todos los apuntes) ────────────

function V2FlashcardAccordion({ cards, glossaryByTopic }: { cards: CurriculumV2Card[]; glossaryByTopic: Map<string, Map<string, GlossaryEntry>> }) {
  const [openIdx, setOpenIdx] = useState<number>(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {cards.map((card, i) => {
        const isOpen = openIdx === i
        const glossary = card.topic_id ? glossaryByTopic.get(card.topic_id) : undefined
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
                      <LessonMarkdown text={card.concept_markdown} format="raw" glossary={glossary} />
                    </div>
                  )}
                  {card.alert_markdown && (
                    <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 4, padding: '10px 12px' }}>
                      <LessonMarkdown text={card.alert_markdown} format="raw" glossary={glossary} />
                    </div>
                  )}
                  {card.worked_example_markdown && (
                    <div style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 4, padding: '12px 14px' }}>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <LessonMarkdown text={card.worked_example_markdown} format="raw" glossary={glossary} />
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
    <div className="kairo-soft-panel" style={{ overflow: 'hidden', padding: 14 }}>
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
              style={{ border: isActive ? '1px solid #2563eb' : '1px solid #dbe7fb', borderRadius: 12, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: isActive ? '#eff6ff' : '#ffffff', transition: 'all .1s', boxShadow: isActive ? '0 8px 20px rgba(37,99,235,.08)' : '0 3px 10px rgba(37,99,235,.035)' }}
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
  const HF_FLATLAY = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125450_f5670e8f-277d-470e-82b0-58dd6db26d4b.png'
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,10,20,0.78)', backdropFilter: 'blur(10px)', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
      <div style={{ position: 'relative', width: '100%', maxWidth: 380, borderRadius: 20, overflow: 'hidden', background: '#060e1e', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}>

        {/* Image header with XP hero */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${HF_FLATLAY})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,14,30,0.35) 0%, rgba(6,14,30,0.92) 100%)' }} />
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.28em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
              Misión completada
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, lineHeight: 1, color: '#fff', letterSpacing: '0.03em', textShadow: '0 0 50px rgba(37,99,235,0.6)' }}>
              +{xp} XP
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: streak > 0 ? '#f97316' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
              {streak > 0 ? `🔥 ${streak}` : '—'}
            </div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>días racha</div>
          </div>
          {blockProgress.total > 0 && (
            <div style={{ flex: 1, padding: '14px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#2563eb', lineHeight: 1 }}>
                {blockProgress.completed}/{blockProgress.total}
              </div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>del bloque</div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 24px 24px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: nextMissionTitle ? 16 : 0 }}>
            {motivationalPhrase(score)}
          </p>

          {nextMissionTitle && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 16 }}>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase' as const, color: '#3b82f6', marginBottom: 4 }}>Mañana toca</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>{nextMissionTitle}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={onViewWeek}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.35)', transition: 'transform 160ms ease-out' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              Ver mi semana <ArrowRight size={14} />
            </button>
            <button
              onClick={onDoBonus}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'color 160ms ease, border-color 160ms ease' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(255,255,255,0.7)'; b.style.borderColor = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(255,255,255,0.4)'; b.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              Ver corrección
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Shell({ children, clayTheme, clayDarkBg }: { children: React.ReactNode; clayTheme?: ClayTheme; clayDarkBg?: boolean }) {
  return (
    <div className="kairo-premium-shell" style={{ display: 'flex', minHeight: '100dvh' }}>
      <style>{`
        @media (max-width: 767px) {
          .topic-topbar { padding: 10px 16px !important; }
          .topic-topbar-breadcrumb { display: none !important; }
          .topic-main { padding: 24px 18px !important; padding-bottom: 84px !important; }
          .topic-aside { display: none !important; }
          .topic-h1 { font-size: 26px !important; }
          /* El aside fijo se oculta en móvil (arriba); en su lugar, el botón
             flotante abre el mismo contenido en un drawer bajo demanda — nunca
             tapa la lección salvo cuando el alumno lo pide explícitamente. */
          .topic-mobile-aside-trigger { display: inline-flex !important; }
        }
      `}</style>
      <SidebarNav />
      {/* data-kairo-clay-theme aquí (no en <html>/<body>) para que var(--clay-*)
          resuelva dentro de main/aside sin afectar a SidebarNav ni a ninguna
          otra pantalla — el atributo solo envuelve el contenido de esta ficha. */}
      <div
        data-kairo-clay-theme={clayTheme}
        style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100dvh', background: clayDarkBg ? 'var(--clay-bg)' : undefined }}
      >
        {children}
      </div>
    </div>
  )
}

function cleanLessonLine(value: string) {
  return value
    .replace(/^(Qué es|Teoría rápida|Para qué sirve|Cuándo se usa en PAU|Error típico)\s*:\s*/i, '')
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
  const pau = pickLessonLine(topic, 'Cuándo se usa en PAU')
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

function EmptyContent({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const copy = compact
    ? 'Este bloque aún necesita contenido completo.'
    : 'Este tema aún necesita contenido completo. Puedes practicar con ejercicios disponibles.'
  return (
    <p style={{
      border: dark ? '1px dashed var(--clay-border)' : '1px dashed #bfdbfe',
      borderRadius: 5,
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: 700,
      color: dark ? 'var(--clay-accent)' : '#3b82f6',
      background: dark ? 'var(--clay-accent-soft)' : '#eff6ff',
    }}>
      {copy}
    </p>
  )
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

function LearningCard({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  // dark solo lo pasa la ficha de Bohr en tema oscuro (ver isClayPilotDark) —
  // LearningCard es local a este archivo pero se reutiliza en TODOS los
  // temas, así que el valor por defecto (false) deja cualquier otro tema
  // exactamente igual que siempre. .kairo-quiet-card/.kairo-soft-control son
  // clases globales con fondo claro fijo, por eso se pisan aquí con estilo
  // inline en vez de intentar un selector CSS más frágil.
  return (
    <article
      className={dark ? undefined : 'kairo-quiet-card'}
      style={{
        padding: '22px 24px',
        marginBottom: 16,
        ...(dark ? {
          background: 'var(--clay-surface)',
          border: '1px solid var(--clay-border)',
          borderRadius: 'var(--kairo-radius-card)',
          boxShadow: `0 10px 0 var(--clay-shadow-shelf), 0 16px 28px var(--clay-shadow-elevate)`,
        } : {}),
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 18, fontWeight: 700, color: dark ? 'var(--clay-text)' : '#0f172a', letterSpacing: '-.01em' }}>{title}</h2>
        <span
          className={dark ? undefined : 'kairo-soft-control'}
          style={{
            padding: '5px 10px', fontSize: 9, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase' as const,
            color: dark ? 'var(--clay-text-muted)' : '#64748b',
            ...(dark ? { background: 'var(--clay-surface-raised)', border: '1px solid var(--clay-border)', borderRadius: 'var(--kairo-radius-control)' } : {}),
          }}
        >
          Paso de lectura
        </span>
      </div>
      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700" style={dark ? { color: 'var(--clay-text)' } : undefined}>{children}</div>
    </article>
  )
}
