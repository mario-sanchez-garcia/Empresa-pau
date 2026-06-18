'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Check, ChevronDown, Clock3, Medal, Pencil, Plus, RotateCcw, Target, Trash2, Trophy, Zap } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding, type OnboardingData } from '@/app/lib/onboarding/onboardingStorage'

type MissionKind = 'exam' | 'flashcards' | 'chat' | 'simulacro' | 'historial' | 'manual'
type MissionRole = 'main' | 'bonus'
type MissionStatus = 'pending' | 'done'

type Mission = { id: string; role: MissionRole; kind: MissionKind; subject: string; title: string; reason: string; href: string; estimatedMinutes: number; baseXP: number; status: MissionStatus }
type DayPlan = { date: string; label: string; isToday: boolean; missions: Mission[] }
type ExamPriority = 'baja' | 'normal' | 'alta' | 'muy_alta'
type StudentExam = { id: string; subject: string; date: string; topic: string; name: string; priority: ExamPriority }
type XpEvent = { id: string; missionId: string; date: string; subject: string; xp: number; bonus: boolean }
type RankingEntry = { id: string; name: string; community: string; xp: number; rank: number; isCurrentUser: boolean; isMock?: boolean }
type LeaderboardPayload = {
  global: { top: RankingEntry[]; current: RankingEntry | null }
  community: { name: string; top: RankingEntry[]; current: RankingEntry | null }
  currentXp: number
  realUserCount: number
}

const CALENDAR_KEY = 'pausia_camino_calendar_v2'
const EXAMS_KEY = 'pausia_camino_student_exams_v1'
const XP_KEY = 'pausia_camino_xp_events_v1'

const SUBJECT_SLUGS: Record<string, string> = {
  'Matemáticas II': 'matematicas_ii', 'Matemáticas CCSS': 'matematicas_ccss', 'Física': 'fisica', 'Química': 'quimica',
  'Historia de España': 'historia', 'Historia de la Filosofía': 'historia_filosofia', 'Lengua Castellana': 'lengua', 'Inglés': 'ingles', 'Biología': 'biologia'
}
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Matemáticas II': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }, 'Matemáticas CCSS': { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  'Física': { bg: '#fefce8', text: '#a16207', border: '#fef08a' }, 'Química': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  'Historia de España': { bg: '#fff8f1', text: '#78350f', border: '#fed7aa' }, 'Historia de la Filosofía': { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  'Lengua Castellana': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }, 'Inglés': { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' }, 'Biología': { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
}
const DIVISIONS = [
  { name: 'Bronce', min: 0, max: 499, bg: '#fff7ed', text: '#92400e', bar: '#b45309' },
  { name: 'Plata', min: 500, max: 1499, bg: '#f8fafc', text: '#475569', bar: '#94a3b8' },
  { name: 'Oro', min: 1500, max: 3499, bg: '#fefce8', text: '#a16207', bar: '#eab308' },
  { name: 'Platino', min: 3500, max: 6999, bg: '#f0f9ff', text: '#0369a1', bar: '#38bdf8' },
  { name: 'Diamante', min: 7000, max: 12999, bg: '#eff6ff', text: '#1d4ed8', bar: '#2563eb' },
  { name: 'Élite PAU', min: 13000, max: Infinity, bg: '#f5f3ff', text: '#6d28d9', bar: '#7c3aed' },
]
const MOCK_RANKING: RankingEntry[] = [
  { id: 'mock-a-garcia', name: 'A. García', community: 'Madrid', xp: 8420, rank: 1, isCurrentUser: false, isMock: true },
  { id: 'mock-n-soler', name: 'N. Soler', community: 'Cataluña', xp: 7310, rank: 2, isCurrentUser: false, isMock: true },
  { id: 'mock-m-ruiz', name: 'M. Ruiz', community: 'Madrid', xp: 6040, rank: 3, isCurrentUser: false, isMock: true },
  { id: 'mock-l-ferrer', name: 'L. Ferrer', community: 'Cataluña', xp: 4860, rank: 4, isCurrentUser: false, isMock: true },
  { id: 'mock-d-martin', name: 'D. Martín', community: 'Madrid', xp: 3920, rank: 5, isCurrentUser: false, isMock: true },
]

function toISO(date: Date) { return date.toISOString().slice(0, 10) }
function todayISO() { return toISO(new Date()) }
function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }
function mondayOf(date: Date) { const d = new Date(date); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); d.setHours(0, 0, 0, 0); return d }
function daysUntil(dateISO: string) { return Math.ceil((new Date(dateISO).getTime() - new Date(todayISO()).getTime()) / 86400000) }
function themeFor(subject: string) { return SUBJECT_COLORS[subject] ?? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' } }
function subjectSlug(subject: string) { return SUBJECT_SLUGS[subject] ?? subject.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') }
function getMissionTarget(kind: MissionKind, subject: string) {
  const s = subjectSlug(subject)
  if (kind === 'exam') return { href: `/?subject=${s}&source=camino`, fallback: '', autoCompletable: false }
  if (kind === 'flashcards') return { href: `/zona?mode=flashcards&subject=${s}&source=camino`, fallback: '', autoCompletable: false }
  if (kind === 'chat') return { href: `/?view=chat&subject=${s}&source=camino`, fallback: '', autoCompletable: false }
  if (kind === 'simulacro') return { href: `/simulacros?subject=${s}&source=camino`, fallback: '', autoCompletable: false }
  if (kind === 'historial') return { href: `/?view=historial&subject=${s}&source=camino`, fallback: '', autoCompletable: false }
  return { href: '', fallback: 'Esta misión todavía no tiene pantalla propia. Puedes marcarla como hecha cuando la termines fuera de Pausia.', autoCompletable: true }
}
function actionHref(kind: MissionKind, subject: string) { return getMissionTarget(kind, subject).href }
function indexesFor(count: number) { if (count <= 3) return [0, 2, 4]; if (count === 4) return [0, 1, 3, 5]; if (count === 5) return [0, 1, 2, 4, 5]; if (count === 6) return [0, 1, 2, 3, 4, 5]; return [0, 1, 2, 3, 4, 5, 6] }
function kindFor(index: number): MissionKind { return (['exam', 'flashcards', 'historial', 'simulacro', 'chat'] as MissionKind[])[index % 5] }
function titleFor(kind: MissionKind, subject: string) { if (kind === 'exam') return `Haz 1 ejercicio de ${subject}`; if (kind === 'flashcards') return `Repasa 10 flashcards de ${subject}`; if (kind === 'chat') return `Pregunta una duda de ${subject}`; if (kind === 'simulacro') return `Haz un mini simulacro de ${subject}`; if (kind === 'historial') return `Revisa errores anteriores de ${subject}`; return `Tarea personalizada de ${subject}` }
function loadJson<T>(key: string, fallback: T): T { try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback } }
function saveJson(key: string, value: unknown) { window.localStorage.setItem(key, JSON.stringify(value)) }
function divisionFor(xp: number) { return DIVISIONS.find(d => xp >= d.min && xp <= d.max) ?? DIVISIONS[0] }
function priorityWeight(priority: ExamPriority) { if (priority === 'muy_alta') return 4; if (priority === 'alta') return 3; if (priority === 'normal') return 2; return 1 }
function priorityLabel(priority: ExamPriority) { return priority === 'muy_alta' ? 'Muy alta' : priority.charAt(0).toUpperCase() + priority.slice(1) }
function priorityLookahead(priority: ExamPriority) { if (priority === 'muy_alta') return 5; if (priority === 'alta') return 3; if (priority === 'normal') return 2; return 1 }
function formatDate(dateISO: string) { return new Date(dateISO).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }
function missionXP(mission: Mission, qualityScore?: number) { const completionXP = mission.role === 'main' ? 20 : 0; const score = qualityScore ?? (mission.kind === 'exam' ? 7 : null); const qualityXP = score == null ? 0 : score < 4 ? 5 : score < 6 ? 10 : score < 8 ? 20 : 30; const bonusXP = mission.role === 'bonus' ? mission.baseXP : 0; return mission.baseXP + completionXP + qualityXP + bonusXP }
function localCurrentEntry(community: string, xp: number): RankingEntry { return { id: 'local-current-user', name: 'Tú', community, xp, rank: 1, isCurrentUser: true } }
function fillWithMockRows(rows: RankingEntry[], tab: 'global' | 'community', community: string) {
  const used = new Set(rows.map(row => row.id))
  const bots = MOCK_RANKING
    .filter(row => tab === 'global' || row.community === community)
    .filter(row => !used.has(row.id))
    .slice(0, Math.max(0, 5 - rows.length))
    .map((row, index) => ({ ...row, rank: rows.length + index + 1 }))
  return [...rows, ...bots].slice(0, 5)
}

async function fetchLeaderboard(token: string, community: string) {
  try {
    const res = await fetch(`/api/camino/leaderboard?community=${encodeURIComponent(community)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json() as LeaderboardPayload
  } catch {
    return null
  }
}

function generateCalendar(onboarding: OnboardingData, exams: StudentExam[]) {
  const start = mondayOf(new Date())
  const subjects = onboarding.subjects.length ? onboarding.subjects : ['Matemáticas II', 'Historia de España', 'Inglés']
  const weeklyDays = onboarding.weeklyStudyDaysValue ?? 4
  const minutes = onboarding.dailyMinutes ?? 60
  const indexes = indexesFor(weeklyDays)
  let rotation = 0

  return Array.from({ length: 7 }, (_, index): DayPlan => {
    const date = addDays(start, index)
    const dateISO = toISO(date)
    const upcoming = exams
      .map(exam => ({ exam, distance: daysUntil(exam.date), weight: priorityWeight(exam.priority) }))
      .filter(item => item.distance >= 0 && item.distance <= priorityLookahead(item.exam.priority))
      .sort((a, b) => a.distance - b.distance || b.weight - a.weight)[0]?.exam
    const sameDay = exams.find(exam => exam.date === dateISO)
    const strongExamNearby = upcoming && priorityWeight(upcoming.priority) >= 3 && daysUntil(upcoming.date) <= 2
    const studyDay = indexes.includes(index) || Boolean(sameDay)
    const missions: Mission[] = []

    if (studyDay) {
      const prioritySubject = sameDay?.subject ?? (strongExamNearby || index <= 2 ? upcoming?.subject : null)
      const subject = prioritySubject ?? subjects[rotation % subjects.length]
      if (!prioritySubject) rotation += 1
      const kind = sameDay ? 'flashcards' : kindFor(index)
      const reason = sameDay ? `Parcial hoy: ${sameDay.topic || sameDay.name || sameDay.subject}. Repaso ligero.` : upcoming?.subject === subject ? `Parcial cercano (${priorityLabel(upcoming.priority)}): priorizamos ${subject}.` : onboarding.preparationFeeling === 'Me cuesta organizarme' ? 'Poco volumen, mucha claridad.' : 'Reparto equilibrado según tu onboarding.'
      missions.push({ id: `${dateISO}-main-1`, role: 'main', kind, subject, title: sameDay ? `Repaso ligero de ${subject}` : titleFor(kind, subject), reason, href: actionHref(kind, subject), estimatedMinutes: Math.min(Math.max(25, Math.round(minutes / 2)), 60), baseXP: 20, status: 'pending' })

      if (minutes >= 60 && !sameDay && !strongExamNearby) {
        const secondSubject = prioritySubject ?? subjects[rotation % subjects.length]
        if (!prioritySubject) rotation += 1
        missions.push({ id: `${dateISO}-main-2`, role: 'main', kind: 'historial', subject: secondSubject, title: `Corrige un error de ${secondSubject}`, reason: 'Refuerzo de precisión sin agobio.', href: actionHref('historial', secondSubject), estimatedMinutes: Math.min(30, Math.max(15, Math.round(minutes / 3))), baseXP: 20, status: 'pending' })
      }

      missions.push({ id: `${dateISO}-bonus-1`, role: 'bonus', kind: 'flashcards', subject, title: `Bonus: 5 flashcards de ${subject}`, reason: 'Opcional para sumar XP sin presión.', href: actionHref('flashcards', subject), estimatedMinutes: 10, baseXP: 12, status: 'pending' })
      missions.push({ id: `${dateISO}-bonus-2`, role: 'bonus', kind: 'chat', subject, title: `Bonus: pregunta una duda de ${subject}`, reason: 'Cierra el día resolviendo una duda concreta.', href: actionHref('chat', subject), estimatedMinutes: 8, baseXP: 10, status: 'pending' })
    }

    return { date: dateISO, label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }), isToday: dateISO === todayISO(), missions }
  })
}

function syncStatuses(calendar: DayPlan[], events: XpEvent[]) {
  const done = new Set(events.map(event => event.missionId))
  return calendar.map(day => ({ ...day, missions: day.missions.map(mission => ({ ...mission, status: done.has(mission.id) ? 'done' : mission.status })) }))
}

export default function CaminoCalendarClient() {
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [calendar, setCalendar] = useState<DayPlan[]>([])
  const [exams, setExams] = useState<StudentExam[]>([])
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([])
  const [rankingOpen, setRankingOpen] = useState(false)
  const [rankingTab, setRankingTab] = useState<'global' | 'community'>('global')
  const [showExamForm, setShowExamForm] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [examDraft, setExamDraft] = useState({ subject: '', date: toISO(addDays(new Date(), 3)), topic: '', name: '', priority: 'normal' as ExamPriority })
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const loadedOnboarding = loadOnboarding()
    const loadedExams = loadJson<StudentExam[]>(EXAMS_KEY, [])
    const loadedXp = loadJson<XpEvent[]>(XP_KEY, [])
    const loadedCalendar = loadJson<DayPlan[]>(CALENDAR_KEY, [])
    setOnboarding(loadedOnboarding)
    setExams(loadedExams)
    setXpEvents(loadedXp)
    setExamDraft(current => ({ ...current, subject: loadedOnboarding.subjects[0] ?? 'Matemáticas II' }))
    setCalendar(loadedCalendar.length ? syncStatuses(loadedCalendar, loadedXp) : syncStatuses(generateCalendar(loadedOnboarding, loadedExams), loadedXp))
  }, [])

  useEffect(() => {
    if (!onboarding?.community) return
    const community = onboarding.community
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (cancelled) return
      setAccessToken(token)
      if (!token) return
      const next = await fetchLeaderboard(token, community)
      if (!cancelled && next) setLeaderboard(next)
    }).catch(() => setAccessToken(null))
    return () => { cancelled = true }
  }, [onboarding?.community])

  const hasProfile = Boolean(onboarding?.completedAt && onboarding.community && onboarding.subjects.length)
  const today = calendar.find(day => day.isToday) ?? calendar[0]
  const allMissions = calendar.flatMap(day => day.missions)
  const totalMain = allMissions.filter(mission => mission.role === 'main').length
  const completedMain = allMissions.filter(mission => mission.role === 'main' && mission.status === 'done').length
  const todayMain = today?.missions.filter(mission => mission.role === 'main') ?? []
  const todayBonus = today?.missions.filter(mission => mission.role === 'bonus') ?? []
  const todayDone = todayMain.length > 0 && todayMain.every(mission => mission.status === 'done')
  const totalXP = xpEvents.reduce((sum, event) => sum + event.xp, 0)
  const displayedXP = leaderboard?.currentXp ?? totalXP
  const division = divisionFor(displayedXP)
  const nextDivision = DIVISIONS[DIVISIONS.indexOf(division) + 1]
  const divisionPct = nextDivision ? Math.min(100, Math.round(((displayedXP - division.min) / (nextDivision.min - division.min)) * 100)) : 100
  const rankingCommunity = leaderboard?.community.name ?? onboarding?.community ?? 'Sin comunidad'
  const fallbackCurrent = localCurrentEntry(rankingCommunity, displayedXP)
  const rankingSource = rankingTab === 'global'
    ? leaderboard?.global
    : leaderboard?.community
  const currentRankingRow = rankingSource?.current ?? fallbackCurrent
  const rankingTopRows = fillWithMockRows(rankingSource?.top ?? [fallbackCurrent], rankingTab, rankingCommunity)
  const currentInTop = rankingTopRows.some(row => row.isCurrentUser)
  const fixedCurrentRow = currentInTop ? null : currentRankingRow

  function persist(nextCalendar: DayPlan[], nextXp = xpEvents, nextExams = exams) {
    setCalendar(nextCalendar); setXpEvents(nextXp); setExams(nextExams)
    saveJson(CALENDAR_KEY, nextCalendar); saveJson(XP_KEY, nextXp); saveJson(EXAMS_KEY, nextExams)
  }
  function regenerate(nextExams = exams) { if (!onboarding) return; persist(syncStatuses(generateCalendar(onboarding, nextExams), xpEvents), xpEvents, nextExams); setToast('Planning actualizado con tus parciales') }
  function completeMission(missionId: string) {
    const completed = calendar.flatMap(day => day.missions).find(mission => mission.id === missionId && mission.status !== 'done')
    if (!completed) return
    const nextCalendar = calendar.map(day => ({
      ...day,
      missions: day.missions.map(mission => mission.id === missionId ? { ...mission, status: 'done' as MissionStatus } : mission),
    }))
    const xp = missionXP(completed)
    persist(nextCalendar, [...xpEvents, { id: `${missionId}-${Date.now()}`, missionId, date: todayISO(), subject: completed.subject, xp, bonus: completed.role === 'bonus' }])
    if (accessToken && onboarding?.community) void syncOnlineXp(accessToken, onboarding.community, missionId, xp)
    setToast(`+${xp} XP · ${completed.role === 'bonus' ? 'bonus completado' : 'misión completada'}`)
  }
  async function syncOnlineXp(token: string, community: string, missionId: string, xp: number) {
    try {
      await fetch('/api/camino/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sourceId: missionId, xpDelta: xp }),
      })
      const next = await fetchLeaderboard(token, community)
      if (next) setLeaderboard(next)
    } catch {
      // El progreso local ya queda guardado; el ranking online se reintentará al volver a entrar.
    }
  }
  function postponeMission(missionId: string) {
    const dayIndex = calendar.findIndex(day => day.missions.some(mission => mission.id === missionId))
    if (dayIndex < 0 || dayIndex >= calendar.length - 1) return
    const mission = calendar[dayIndex].missions.find(item => item.id === missionId)
    if (!mission) return
    const nextCalendar = calendar.map((day, index) => index === dayIndex ? { ...day, missions: day.missions.filter(item => item.id !== missionId) } : index === dayIndex + 1 ? { ...day, missions: [...day.missions, { ...mission, id: `${day.date}-${mission.role}-postponed-${Date.now()}` }] } : day)
    persist(nextCalendar); setToast('Misión pospuesta a mañana')
  }
  function resetExamDraft() {
    setEditingExamId(null)
    setShowExamForm(false)
    setExamDraft(current => ({ ...current, topic: '', name: '', date: toISO(addDays(new Date(), 3)), priority: 'normal' }))
  }
  function openNewExam() { setEditingExamId(null); setShowExamForm(true) }
  function openEditExam(exam: StudentExam) { setEditingExamId(exam.id); setExamDraft({ subject: exam.subject, date: exam.date, topic: exam.topic, name: exam.name, priority: exam.priority }); setShowExamForm(true) }
  function saveExam() {
    if (!examDraft.subject || !examDraft.date) return
    const nextExams = editingExamId ? exams.map(exam => exam.id === editingExamId ? { ...exam, ...examDraft } : exam) : [...exams, { id: `${Date.now()}`, ...examDraft }]
    resetExamDraft()
    regenerate(nextExams)
  }
  function deleteExam(id: string) { regenerate(exams.filter(exam => exam.id !== id)) }

  if (!hasProfile) return (
    <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="w-full rounded-[32px] border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)]"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700"><Target size={30} /></div><h1 className="text-3xl font-black tracking-tight text-slate-950">Completa tu perfil para que Pausia cree tu Camino PAU.</h1><p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">Usaremos tu comunidad, asignaturas, centro y disponibilidad para generar un calendario semanal sencillo.</p><button onClick={() => router.push('/onboarding')} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">Completar perfil <ArrowRight size={16} /></button></section></main></Shell>
  )

  return (
    <Shell>
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU</p><h1 className="text-2xl font-black tracking-tight text-slate-950">Tu semana de estudio</h1></div><button onClick={openNewExam} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]"><Plus size={16} /> Añadir examen</button></div></header>
      <main className="mx-auto max-w-7xl px-5 py-6">
        <section className="mb-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Qué hacer hoy</p><h2 className="mt-2 text-2xl font-black text-slate-950">{today?.label ?? 'Hoy'}</h2><p className="mt-2 text-sm font-semibold text-slate-500">Empieza por la misión principal. Completa lo importante y desbloquea bonus sin presión.</p><div className="mt-5 grid gap-3">{todayMain.length ? todayMain.map(mission => <MissionRow key={mission.id} mission={mission} onComplete={completeMission} onPostpone={postponeMission} />) : <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">Hoy toca poco, pero bien hecho. Puedes añadir un parcial para ajustar la semana.</p>}</div>{todayDone && <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-4"><h3 className="font-black text-emerald-900">Día completado</h3><p className="mt-1 text-sm font-semibold text-emerald-700">Has hecho lo importante de hoy. Puedes parar aquí o sumar XP con misiones bonus.</p><div className="mt-3 grid gap-2">{todayBonus.map(mission => <MissionRow key={mission.id} mission={mission} onComplete={completeMission} onPostpone={postponeMission} compact />)}</div></div>}</div>
          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">XP y división</p><h2 className="mt-2 text-3xl font-black text-slate-950">{displayedXP.toLocaleString('es-ES')} XP</h2></div><span className="rounded-2xl px-4 py-2 text-sm font-black" style={{ background: division.bg, color: division.text }}>{division.name}</span></div><p className="mt-3 text-sm font-semibold text-slate-500">Ganas XP por practicar y aún más cuando mejoras tu precisión.</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${divisionPct}%`, background: division.bar }} /></div><p className="mt-2 text-xs font-bold text-slate-400">{nextDivision ? `Faltan ${Math.max(0, nextDivision.min - displayedXP).toLocaleString('es-ES')} XP para ${nextDivision.name}.` : 'División máxima alcanzada.'}</p></div>
        </section>

        <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Calendario editable</p><h2 className="text-xl font-black text-slate-950">Semana actual</h2></div><p className="text-sm font-bold text-slate-500">{completedMain} de {totalMain} misiones principales completadas</p></div><div className="grid gap-3 lg:grid-cols-7">{calendar.map(day => <DayCard key={day.date} day={day} exams={exams.filter(exam => exam.date === day.date)} />)}</div></section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]"><div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">Exámenes parciales</h2><p className="text-sm font-semibold text-slate-500">Añade tus próximos exámenes para que Pausia ajuste tu semana.</p></div><button onClick={openNewExam} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Plus size={15} /> Añadir examen</button></div><div className="grid gap-2">{exams.length ? exams.map(exam => <div key={exam.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{exam.subject} · {exam.topic || exam.name || 'Parcial'}</p><p className="text-xs font-bold text-slate-400">{formatDate(exam.date)} · prioridad {priorityLabel(exam.priority)}</p></div><div className="flex shrink-0 gap-1"><button onClick={() => openEditExam(exam)} className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700" aria-label="Editar examen"><Pencil size={16} /></button><button onClick={() => deleteExam(exam.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar examen"><Trash2 size={16} /></button></div></div>) : <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800">Empieza añadiendo tu próximo examen del instituto.</p>}</div></div><RankingCard open={rankingOpen} setOpen={setRankingOpen} tab={rankingTab} setTab={setRankingTab} rows={rankingTopRows} currentRow={fixedCurrentRow} community={rankingCommunity} totalXP={displayedXP} division={division.name} realUserCount={leaderboard?.realUserCount ?? 1} /></section>
      </main>
      <AnimatePresence>{showExamForm && <ExamModal subjects={onboarding?.subjects ?? []} draft={examDraft} setDraft={setExamDraft} onClose={resetExamDraft} onSave={saveExam} editing={Boolean(editingExamId)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} onAnimationComplete={() => setTimeout(() => setToast(null), 1600)} className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</motion.div>}</AnimatePresence>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen bg-[#f4f7fb] max-lg:block"><Sidebar activeItem="camino" /><div className="min-w-0 flex-1">{children}</div></div> }

function MissionRow({ mission, onComplete, onPostpone, compact = false }: { mission: Mission; onComplete: (id: string) => void; onPostpone: (id: string) => void; compact?: boolean }) {
  const theme = themeFor(mission.subject)
  const target = getMissionTarget(mission.kind, mission.subject)
  return <div className={`rounded-2xl border p-4 ${mission.status === 'done' ? 'bg-emerald-50 border-emerald-100' : 'bg-white'}`} style={{ borderColor: mission.status === 'done' ? '#bbf7d0' : theme.border }}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: theme.bg, color: theme.text }}>{mission.subject}</span><span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400"><Clock3 size={12} /> {mission.estimatedMinutes} min</span>{mission.role === 'bonus' && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">Bonus</span>}</div><h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-slate-900`}>{mission.title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{mission.reason}</p>{target.fallback && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">{target.fallback}</p>}</div><div className="flex shrink-0 flex-wrap gap-2">{target.href ? <a href={target.href} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">Ir a practicar <ArrowRight size={13} /></a> : <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-400">Sin pantalla</span>}{mission.status !== 'done' && <button onClick={() => onComplete(mission.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><Check size={13} /> Marcar hecha</button>}{mission.status !== 'done' && mission.role === 'main' && <button onClick={() => onPostpone(mission.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500"><RotateCcw size={13} /> Posponer</button>}</div></div></div>
}

function DayCard({ day, exams }: { day: DayPlan; exams: StudentExam[] }) {
  const main = day.missions.filter(mission => mission.role === 'main')
  const done = main.length > 0 && main.every(mission => mission.status === 'done')
  return <article className={`min-h-[210px] rounded-3xl border p-3 ${day.isToday ? 'border-blue-300 bg-blue-50/70' : 'border-slate-100 bg-slate-50/80'}`}><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black capitalize text-slate-900">{day.label}</h3>{done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">Hecho</span>}</div>{exams.map(exam => <p key={exam.id} className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800">Parcial: {exam.subject} · {priorityLabel(exam.priority)}</p>)}<div className="grid gap-2">{main.length ? main.map(mission => { const target = getMissionTarget(mission.kind, mission.subject); const content = <><p className="text-[11px] font-black" style={{ color: themeFor(mission.subject).text }}>{mission.subject}</p><p className="mt-1 text-xs font-bold text-slate-700">{mission.title}</p><p className="mt-2 text-[11px] font-bold text-slate-400">{mission.status === 'done' ? 'Completada' : target.href ? 'Ir a practicar' : 'Sin pantalla · marca desde la misión'}</p></>; return target.href ? <a key={mission.id} href={target.href} className="rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5" style={{ borderColor: themeFor(mission.subject).border }}>{content}</a> : <div key={mission.id} className="rounded-2xl border bg-white p-3 text-left" style={{ borderColor: themeFor(mission.subject).border }}>{content}</div> }) : <p className="text-xs font-semibold text-slate-400">Descanso o repaso libre.</p>}</div></article>
}

function ExamModal({ subjects, draft, setDraft, onClose, onSave, editing }: { subjects: string[]; draft: { subject: string; date: string; topic: string; name: string; priority: ExamPriority }; setDraft: (draft: { subject: string; date: string; topic: string; name: string; priority: ExamPriority }) => void; onClose: () => void; onSave: () => void; editing: boolean }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm"><motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><h2 className="text-xl font-black text-slate-950">{editing ? 'Editar examen parcial' : 'Añadir examen parcial'}</h2><p className="mt-1 text-sm font-semibold text-slate-500">Si tienes un parcial cerca, lo tendremos en cuenta.</p><div className="mt-5 grid gap-3"><Field label="Asignatura"><select value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} className="inputish">{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field><Field label="Fecha"><input type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} className="inputish" /></Field><Field label="Tema opcional"><input value={draft.topic} onChange={event => setDraft({ ...draft, topic: event.target.value })} placeholder="Derivadas, Platón, Writing..." className="inputish" /></Field><Field label="Nombre opcional"><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Parcial 1" className="inputish" /></Field><Field label="Prioridad"><select value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value as ExamPriority })} className="inputish"><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="muy_alta">Muy alta</option></select></Field></div><style>{`.inputish{width:100%;border-radius:14px;border:1px solid #dbe7fb;background:#f8fbff;padding:11px 12px;font-size:14px;font-weight:700;color:#334155;outline:none}.inputish:focus{border-color:#93c5fd;background:white}`}</style><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-500">Cancelar</button><button onClick={onSave} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white">{editing ? 'Guardar cambios' : 'Guardar examen'}</button></div></motion.div></motion.div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>{children}</label> }

function RankingCard({ open, setOpen, tab, setTab, rows, currentRow, community, totalXP, division, realUserCount }: { open: boolean; setOpen: (open: boolean) => void; tab: 'global' | 'community'; setTab: (tab: 'global' | 'community') => void; rows: RankingEntry[]; currentRow: RankingEntry | null; community: string; totalXP: number; division: string; realUserCount: number }) {
  const title = tab === 'community' ? `Ranking Comunidad · ${community}` : 'Ranking Global'
  return <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left"><span><span className="block text-lg font-black text-slate-950">Ranking y divisiones</span><span className="mt-1 block text-sm font-semibold text-slate-500">Consulta tu posición cuando quieras.</span></span><ChevronDown className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-5 rounded-3xl bg-slate-50 p-4"><div className="grid gap-3 sm:grid-cols-3"><MiniStat icon={<Trophy size={15} />} label="División" value={division} /><MiniStat icon={<Zap size={15} />} label="XP total" value={totalXP.toLocaleString('es-ES')} /><MiniStat icon={<BarChart3 size={15} />} label="Comunidad" value={community} /></div><p className="mt-3 text-sm font-semibold text-slate-500">Tu división refleja tu constancia y precisión. Los alumnos de relleno solo aparecen si faltan usuarios reales.</p><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-black text-slate-900">{community === 'Sin comunidad' && tab === 'community' ? 'Completa tu comunidad para ver tu ranking local.' : title}</h3><div className="flex gap-2"><button onClick={() => setTab('global')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'global' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>Global</button><button onClick={() => setTab('community')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'community' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>Comunidad</button></div></div><div className="mt-3 grid gap-2">{rows.map(row => <RankingRow key={row.id} row={row} />)}</div>{currentRow && <><div className="my-3 h-px bg-blue-100" /><RankingRow row={currentRow} fixed /></>}{realUserCount < 3 && <p className="mt-3 text-sm font-bold text-slate-500">El ranking se activará cuando haya más alumnos usando Pausia.</p>}</div></motion.div>}</AnimatePresence></div>
}
function RankingRow({ row, fixed = false }: { row: RankingEntry; fixed?: boolean }) {
  const rowDivision = divisionFor(row.xp)
  const podium = row.rank <= 3
  return <div className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${row.isCurrentUser ? 'border border-blue-200 bg-blue-50 shadow-sm' : podium ? 'bg-white shadow-sm' : 'bg-white/70'} ${fixed ? 'ring-1 ring-blue-100' : ''}`}><span className="min-w-0 text-sm font-black text-slate-800"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black" style={{ background: podium ? rowDivision.bg : '#f1f5f9', color: podium ? rowDivision.text : '#64748b' }}>{podium ? <Medal size={14} /> : `#${row.rank}`}</span>{row.name}{row.isMock && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">demo</span>}</span><span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: rowDivision.bg, color: rowDivision.text }}>{rowDivision.name}</span><span className="shrink-0 text-xs font-black text-blue-700">{row.xp.toLocaleString('es-ES')} XP</span></div>
}
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-white p-3"><div className="mb-1 flex items-center gap-1.5 text-blue-700">{icon}<span className="text-[10px] font-black uppercase tracking-[0.12em]">{label}</span></div><p className="text-sm font-black text-slate-900">{value}</p></div> }
