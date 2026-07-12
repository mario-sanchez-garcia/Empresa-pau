'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, MessageCircle, PenLine, RotateCcw, School, UploadCloud, X } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { buildEvauHref, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import { calcularRacha } from '@/app/lib/calcularRacha'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'
import MathMarkdown from '@/components/shared/MathMarkdown'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'

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

const TOPIC_PROGRESS_KEY = 'pausia_camino_topic_progress_v1'
const SCHOOL_FEEDBACK_KEY = 'pausia_school_topic_feedback_v1'
const SCHOOL_ADJUSTMENTS_KEY = 'pausia_camino_school_adjustments_v1'
const CALENDAR_REFRESH_KEY = 'pausia_camino_calendar_needs_refresh_v1'
const CALENDAR_KEY = 'pausia_camino_calendar_v2'
const XP_KEY = 'pausia_camino_xp_events_v1'
const WEAK_AREAS_KEY = 'pausia_camino_weak_areas_v1'

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
    supabase
      .from('curriculum_content')
      .select('content_markdown')
      .eq('subject', topic.subject)
      .eq('block_slug', topic.blockSlug)
      .eq('topic_slug', topic.topicSlug)
      .single()
      .then(({ data }) => {
        if (data?.content_markdown) setDiegoContent(data.content_markdown)
        setDiegoLoading(false)
      })
  }, [topic?.subject, topic?.blockSlug, topic?.topicSlug])

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
    let adjustment: SchoolAdjustment = {
      schoolName: onboarding.schoolName,
      community: onboarding.community,
      subject: currentTopic.subject,
      blockSlug: currentTopic.blockSlug,
      topicSlug: currentTopic.topicSlug,
      feedbackType: 'not_seen_in_class',
      status: localCount >= 2 ? 'delayed_for_school' : 'not_seen',
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
    window.dispatchEvent(new CustomEvent('pausia:school-topic-feedback', { detail: adjustment }))
    setToast('Tema postponado. Lo verás más adelante.')

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) { router.push('/camino'); return }

      // Sync school feedback (best-effort)
      const response = await fetch('/api/camino/school-topic-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(adjustment),
      })
      if (response.ok) {
        const remote = await response.json() as { status?: 'not_seen' | 'delayed_for_school'; notSeenCount?: number }
        adjustment = {
          ...adjustment,
          status: remote.status ?? adjustment.status,
          notSeenCount: remote.notSeenCount ?? adjustment.notSeenCount,
        }
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
      const subjectLabel = subjectLabelFromSlug(currentTopic.subject)
      const statement = selectedV2Card?.practice_prompt ?? currentTopic.practicePrompt ?? currentTopic.guidedExample ?? ('Ejercicio de ' + selectedMissionTitle)
      const prompt = buildCorrectionPrompt({
        subject: subjectLabel,
        simulacroId: 'Camino PAU · ' + subjectLabel + ' · ' + currentTopic.blockTitle + ' · ' + selectedMissionTitle,
        option: 'Curso',
        elapsedMinutes: 0,
        difficulty: 'Media',
        blocks: [{
          numeroBloque: 'Ejercicio de curso',
          tema: selectedMissionTitle,
          year: new Date().getFullYear(),
          convocatoria: 'Camino PAU',
          option: 'Curso',
          maxScore,
          officialPrompt: statement,
          criteria: currentTopic.referenceSolution
            ? `Solución orientativa del curso:\n${currentTopic.referenceSolution}`
            : currentTopic.guidedExample
              ? `Solución orientativa del curso:\n${currentTopic.guidedExample}`
              : 'Corrección orientativa de curso. No hay rúbrica oficial asociada a este ejercicio.',
          studentAnswer: answerMode === 'imagen' ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.' : studentAnswer,
        }]
      })
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ pregunta: prompt, imagen: answerMode === 'imagen' ? image?.data : null, imagenTipo: answerMode === 'imagen' ? image?.type : null })
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.error === 'free_plan_expired' || data.error === 'correction_limit_reached') {
          setShowPaywall(true)
          return
        }
        setCorrection(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = parseCorrectionPayload(data.respuesta)
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
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Link href="/camino" className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft size={16} /> Volver a Camino PAU</Link>
        <section className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU → {subjectLabelFromSlug(currentTopic.subject)} → {currentTopic.blockTitle}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{currentTopic.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{selectedV2Card ? 'Mini-misión 25 min' : '25 min'}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${topicCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{statusLabel}</span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{selectedV2Card ? `Misión ${selectedV2Card.sort_order} de 60` : 'Subpágina de aprendizaje'}</span>
                {selectedV2Number && <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">Mini-misión {selectedV2Number} de {v2Cards.length}</span>}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU/EVAU relacionado.</p>
            </div>
            <button onClick={markNotSeen} className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"><School size={16} /> No lo he dado en clase</button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              {/* Vista de mini-misión individual (flashcard_v2) */}
              {currentTopic.contentStatus === 'flashcard_v2' ? (
                v2Loading ? (
                  <LearningCard title="Explicación"><ContentSkeleton /></LearningCard>
                ) : selectedV2Card ? (
                  <>
                    <LearningCard title="Idea clave">
                      {selectedV2Card.concept_markdown
                        ? <MathMarkdown text={selectedV2Card.concept_markdown} format="raw" />
                        : <EmptyContent />}
                      {selectedV2Card.alert_markdown && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <MathMarkdown text={selectedV2Card.alert_markdown} format="raw" />
                        </div>
                      )}
                    </LearningCard>
                    {selectedV2Card.worked_example_markdown && (
                      <LearningCard title="Caso práctico resuelto">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                          <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                            <MathMarkdown text={selectedV2Card.worked_example_markdown} format="raw" />
                          </div>
                        </div>
                      </LearningCard>
                    )}
                    {videoId && (
                      <LearningCard title="Vídeo explicativo">
                        <button onClick={() => setVideoOpen(v => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600">
                          🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                        </button>
                        {videoOpen && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                              <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                            </div>
                          </div>
                        )}
                      </LearningCard>
                    )}
                    {selectedV2Card.practice_prompt && (
                      <LearningCard title="Inténtalo tú">
                        <MathMarkdown text={selectedV2Card.practice_prompt} format="raw" />
                      </LearningCard>
                    )}
                  </>
                ) : null
              ) : (
              <>
              {/* Mini clase: contenido real primero, fallback discreto solo si falta */}
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
              {/* Secciones fallback cuando no hay datos v2 */}
              {!v2Loading && v2Cards.length === 0 && (
                <>
                  {videoId && (
                    <LearningCard title="Vídeo explicativo">
                      <div>
                        <button onClick={() => setVideoOpen(v => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600">
                          🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                        </button>
                        {videoOpen && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                              <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo de apoyo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                            </div>
                          </div>
                        )}
                      </div>
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
                        <ul className="space-y-2 text-sm font-semibold text-slate-700">
                          {currentTopic.commonMistakes.map(mistake => <li key={mistake}>• {mistake}</li>)}
                        </ul>
                      ) : null}
                      {currentTopic.progressCriteria && (
                        <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                          <p><span className="font-black text-blue-700">Visto:</span> {currentTopic.progressCriteria.seen}</p>
                          <p><span className="font-black text-blue-700">Practicado:</span> {currentTopic.progressCriteria.practiced}</p>
                          <p><span className="font-black text-blue-700">Completado:</span> {currentTopic.progressCriteria.completed}</p>
                          <p><span className="font-black text-blue-700">Dominado:</span> {currentTopic.progressCriteria.mastered}</p>
                        </div>
                      )}
                    </LearningCard>
                  )}
                </>
              )}
              {/* 2. Tu misión de hoy: selector + vídeo + práctica + navegación */}
              {v2Cards.length > 0 && (
                <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black text-slate-950">🎯 Tu misión de hoy</h2>
                  <p className="mt-1 mb-4 text-sm font-semibold text-slate-500">Elige una mini-misión y pon en práctica lo que has aprendido arriba.</p>
                  <V2MiniMissionSelector cards={v2Cards} activeIndex={activeV2Index} onSelect={selectV2Card} />
                  {videoId && (
                    <div className="mt-4">
                      <p className="mb-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">{videoSupportCopy}</p>
                      <button onClick={() => setVideoOpen(v => !v)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600">
                        🎥 {videoOpen ? 'Ocultar vídeo' : 'Ver vídeo de apoyo'}
                      </button>
                      {videoOpen && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                            <iframe src={'https://www.youtube.com/embed/' + videoId} title={'Vídeo: ' + currentTopic.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedV2Card?.practice_prompt && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">Ahora inténtalo tú</p>
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <MathMarkdown text={selectedV2Card.practice_prompt} format="raw" />
                      </div>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={() => selectV2Card(activeV2Index - 1)} disabled={activeV2Index === 0} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2 text-xs font-black text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                      <ArrowLeft size={14} /> Misión anterior
                    </button>
                    <button type="button" onClick={() => selectV2Card(activeV2Index + 1)} disabled={activeV2Index >= v2Cards.length - 1} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                      Siguiente misión <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              )}
              </>
              )}
              {/* Entrega y corrección IA */}
              <article ref={exerciseRef} id="course-exercise" className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">Entrega tu ejercicio</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">El XP se asigna sólo después de corregir con Pausia y depende de la nota obtenida.</p>
                  </div>
                  {missionId && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Misión conectada</span>}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAnswerMode('texto')} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${answerMode === 'texto' ? 'bg-blue-600 text-white' : 'border border-blue-100 bg-blue-50 text-blue-700'}`}><PenLine size={14} /> Escribir respuesta</button>
                  <button type="button" onClick={() => setAnswerMode('imagen')} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${answerMode === 'imagen' ? 'bg-blue-600 text-white' : 'border border-blue-100 bg-blue-50 text-blue-700'}`}><Camera size={14} /> Subir foto</button>
                </div>
                {answerMode === 'texto' ? (
                  <RichTextArea value={studentAnswer} onChange={setStudentAnswer} placeholder="Escribe aquí tu desarrollo paso a paso..." minHeight={160} accentColor="#2563eb" mathSubject={currentTopic.subject} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    {image ? (
                      <div className="grid gap-3">
                        <img src={image.preview} alt="Respuesta subida" className="max-h-72 rounded-2xl border border-blue-100 object-contain" />
                        <button type="button" onClick={clearImage} className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-black text-red-600"><X size={14} /> Quitar foto</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm"><UploadCloud size={16} /> Elegir foto de mi respuesta</button>
                    )}
                  </div>
                )}
                <button type="button" onClick={isFreeAndExpired ? () => setShowPaywall(true) : correctCourseExercise} disabled={correcting || (answerMode === 'texto' ? !studentAnswer.trim() : !image)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {correcting ? <><PausiaLoadingDot /> Corrigiendo con Pausia...</> : <>Corregir con Pausia <Check size={16} /></>}
                </button>
                {score != null && <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">Nota: {score}/10{xpAwarded != null ? ` · XP registrado: ${xpAwarded}` : ''}</p>}
                {correction && <div className="mt-4"><CorrectionResultCard correction={correction} officialMaxScore={10} className="p-5 text-sm leading-7" /></div>}
              </article>
            </div>
            <aside className="grid content-start gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 text-center">
                    <p className="text-xl font-black leading-none text-blue-600">{streak}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">días racha</p>
                  </div>
                  <div className="h-8 w-px shrink-0 bg-slate-100" />
                  <div className="min-w-0 flex-1">
                    {ligaLoading ? (
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    ) : liga && myLigaEntry ? (
                      <>
                        <p className="truncate text-xs font-black text-slate-800">{liga.nombre}</p>
                        <p className="text-[10px] font-semibold text-slate-400">#{myLigaEntry.rank} en liga · {myLigaEntry.weekly_xp} XP sem.</p>
                      </>
                    ) : (
                      <Link href="/camino" className="text-xs font-black text-blue-600 hover:underline">Crear liga con amigos →</Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Práctica PAU/EVAU</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre Exámenes con asignatura, bloque, tema y modo aleatorio preparados.</p>
                <Link href={buildEvauHref(currentTopic)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Hacer ejercicio PAU de este tema <ArrowRight size={16} /></Link>
                <a href="#course-exercise" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700">Corregir ejercicio del curso <Check size={16} /></a>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">Preguntar a Pausia sobre este tema</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre el Chat con Pausia con esta asignatura, bloque y tema como contexto.</p>
                <div className="mt-3 flex flex-wrap gap-2">{['Explícamelo más fácil', 'Ponme otro ejemplo', 'No entiendo este paso', 'Hazme una pregunta parecida', '¿Por qué se hace así?'].map(item => <Link key={item} href={chatHref(item)} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{item}</Link>)}</div>
                <Link href={chatHref()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white">Abrir Chat con Pausia <MessageCircle size={16} /></Link>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-900">{current.xp ?? 0} XP en este tema</p>
                <p className="mt-1 text-xs font-bold text-emerald-700">{topicCompleted ? 'Tema completado con corrección.' : 'El XP se asigna solo después de corregir el ejercicio final.'}</p>
              </div>
            </aside>
          </div>
        </section>
        {toast && <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}<button onClick={() => setToast('')} className="ml-3 text-slate-300"><RotateCcw size={13} /></button></div>}
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
              <ParentLinkModule billing={billing} />
              <Link href="/pricing" className="mt-3 block text-center text-sm font-black text-blue-700 hover:underline">Ver planes</Link>
            </div>
          </div>
        )}
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
      </main>
    </Shell>
  )
}

// ── curriculum_content_v2 flashcard accordion (todos los apuntes) ────────────

function V2FlashcardAccordion({ cards }: { cards: CurriculumV2Card[] }) {
  const [openIdx, setOpenIdx] = useState<number>(0)
  return (
    <div className="flex flex-col gap-2">
      {cards.map((card, i) => {
        const isOpen = openIdx === i
        return (
          <div key={card.sort_order} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-black leading-snug text-slate-800">
                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-blue-500">#{i + 1}</span>
                <span className="[&_p]:m-0 [&_p]:inline"><MathMarkdown text={card.title} format="raw" /></span>
              </span>
              <ChevronDown size={16} className={`shrink-0 text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 280ms ease' }}>
              <div className="overflow-hidden">
                <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                  {card.concept_markdown && (
                    <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                      <MathMarkdown text={card.concept_markdown} format="raw" />
                    </div>
                  )}
                  {card.alert_markdown && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <MathMarkdown text={card.alert_markdown} format="raw" />
                    </div>
                  )}
                  {card.worked_example_markdown && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <MathMarkdown text={card.worked_example_markdown} format="raw" />
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
    <section className="rounded-3xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Misiones de este tema</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Cada tarjeta es una mini-misión independiente.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{cards.length} mini-misiones</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((card, index) => {
          const isActive = activeIndex === index
          return (
            <button
              key={card.sort_order}
              type="button"
              onClick={() => onSelect(index)}
              className={'rounded-2xl border px-4 py-3 text-left transition-all ' + (isActive ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white')}
            >
              <span className={'mb-1 block text-[10px] font-black uppercase tracking-[0.12em] ' + (isActive ? 'text-blue-700' : 'text-slate-400')}>Mini-misión {index + 1}</span>
              <span className={'block text-sm font-black leading-snug ' + (isActive ? 'text-blue-950' : 'text-slate-700') + ' [&_p]:m-0 [&_p]:inline'}>
                <MathMarkdown text={card.title} format="raw" />
              </span>
            </button>
          )
        })}
      </div>
    </section>
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

  if (!sections.length) return <MathMarkdown text={markdown} />

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="text-sm font-black leading-snug text-slate-800 [&_p]:inline [&_p]:m-0">
                <MathMarkdown text={section.title} format="raw" />
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 280ms ease',
              }}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                  {section.body && (
                    <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                      <MathMarkdown text={section.body} format="raw" />
                    </div>
                  )}
                  {section.caseStudy && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                      <div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">
                        <MathMarkdown text={section.caseStudy} format="raw" />
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
  return <div className="flex min-h-screen bg-[#f4f7fb] max-lg:block"><Sidebar activeItem="camino" /><div className="min-w-0 flex-1">{children}</div></div>
}

function cleanLessonLine(value: string) {
  return value
    .replace(/^(Qué es|Para qué sirve|Cuándo se usa en PAU\/EVAU|Error típico)\s*:\s*/i, '')
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
  const use = pickLessonLine(topic, 'Para qué sirve')
  const pau = pickLessonLine(topic, 'Cuándo se usa en PAU/EVAU')
  const alert = pickLessonLine(topic, 'Error típico', topic.commonMistakes?.[0] ?? '')
  const tags = topic.examTags?.slice(0, 4) ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">Idea clave</p>
        <MathMarkdown text={idea} />
      </div>
      {(use || pau || tags.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {use && <InfoTile label="Para qué sirve" text={use} />}
          {pau && <InfoTile label="Cómo aparece en PAU" text={pau} />}
          {tags.length > 0 && <InfoTile label="Etiquetas PAU" text={tags.join(' · ')} />}
        </div>
      )}
      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Cómo se trabaja</p>
        <ol className="space-y-2">
          {lessonStepsFor(topic).map((step, index) => (
            <li key={step} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {alert && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-black text-amber-800">Error típico</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">{alert}</p>
        </div>
      )}
    </div>
  )
}

function InfoTile({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <MathMarkdown text={text} />
    </div>
  )
}

function GuidedExamplePanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Ejemplo guiado</p>
      <MathMarkdown text={text} />
    </div>
  )
}

function PracticePromptPanel({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">Ejercicio corregible</p>
      <MathMarkdown text={text} />
    </div>
  )
}

function EmptyContent({ compact = false }: { compact?: boolean }) {
  const copy = compact
    ? 'Este bloque aún necesita contenido completo.'
    : 'Este tema aún necesita contenido completo. Puedes practicar con ejercicios disponibles.'
  return <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{copy}</p>
}

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[80, 60, 90, 50, 75].map(w => (
        <div key={w} className="h-3 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

function LearningCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-black text-slate-950">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">Paso de lectura</span></div><div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">{children}</div></article>
}
