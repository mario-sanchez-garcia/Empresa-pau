'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, Bookmark, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, Clock3, GripVertical, Medal, Pencil, Plus, RotateCcw, Target, Trash2, Trophy, Zap } from 'lucide-react'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'
import Sidebar from '@/app/components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding, type OnboardingData } from '@/app/lib/onboarding/onboardingStorage'
import { buildEvauHref, buildTopicHref, getCurriculumForSubjects, getTopicByV2SortOrder, normalizeCaminoSlug, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { PRIVATE_BETA_SUBJECTS } from '@/app/lib/camino/betaCurriculum'
import { getCaminoPlanLimits, monthlyToWeeklyLimit, normalizeCaminoPlanId, type CaminoPlanId } from '@/app/lib/camino/caminoPlanLimits'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'
import { deletePartialExamMissions, injectPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'
import { calcularRacha } from '@/app/lib/calcularRacha'

type MissionKind = 'concept_explanation' | 'guided_example' | 'guided_practice' | 'evau_practice' | 'exam_focus' | 'mock_exam' | 'manual'
type MissionRole = 'main' | 'bonus'
type MissionStatus = 'pending' | 'done'

type Mission = {
  id: string
  calendarRowId?: string
  role: MissionRole
  kind: MissionKind
  subject: string
  block?: string
  topic?: string
  title: string
  reason: string
  href: string
  target: string
  source: 'camino_pau'
  xpPolicy: 'after_correction'
  estimatedMinutes: number
  baseXP: number
  status: MissionStatus
  metadata?: Record<string, unknown>
  subjectSlug?: string
  v2SortOrder?: number
  blockKey?: string
  missionType?: string
}
type DayPlan = { date: string; label: string; isToday: boolean; missions: Mission[] }
type ExamPriority = 'baja' | 'normal' | 'alta' | 'muy_alta'
type StudentExam = { id: string; subject: string; date: string; block: string; topic: string; name: string; priority: ExamPriority }
type CurriculumItem = { subject: string; subjectSlug: string; block: string; blockSlug: string; topic: string; topicSlug: string; title: string; sortOrder: number; contentStatus: string; source: 'supabase' | 'fallback' | 'seed'; planTopic?: CaminoCurriculumTopic }
type RankingEntry = { id: string; name: string; community: string; xp: number; rank: number; isCurrentUser: boolean; isMock?: boolean }
type LeaderboardPayload = {
  global: { top: RankingEntry[]; current: RankingEntry | null }
  community: { name: string; top: RankingEntry[]; current: RankingEntry | null }
  currentXp: number
  realUserCount: number
}
type LigaMiembro = { user_id: string; name: string; weekly_xp: number; rank: number }
type LigaInfo = { id: string; codigo: string; nombre: string; miembros: LigaMiembro[] }
type SchoolTopicAdjustment = { schoolName: string | null; community: string | null; subject: string; blockSlug: string | null; topicSlug: string; feedbackType: 'not_seen_in_class'; status: 'not_seen' | 'delayed_for_school'; notSeenCount: number; date: string }
type LegacySchoolFeedback = { schoolName: string | null; community: string | null; subject: string; block: string; topic: string; reason: 'not_seen_in_class'; date: string }
type CalendarWeekCache = Record<string, DayPlan[]>
type TopicProgress = Record<string, { explanation?: boolean; guided?: boolean; evau?: boolean; xp: number; score?: number }>

const EXAMS_KEY = 'pausia_camino_student_exams_v1'
const WEAK_AREAS_KEY = 'pausia_camino_weak_areas_v1'
const TOPIC_PROGRESS_KEY = 'pausia_camino_topic_progress_v1'
const CALENDAR_VISIBILITY_KEY = 'pausia_camino_calendar_expanded_v1'
const CALENDAR_WEEK_CACHE_KEY = 'pausia_camino_week_cache_v2'
const SCHOOL_FEEDBACK_KEY = 'pausia_school_topic_feedback_v1'
const SCHOOL_ADJUSTMENTS_KEY = 'pausia_camino_school_adjustments_v1'
const BETA_FEEDBACK_URL = process.env.NEXT_PUBLIC_BETA_FEEDBACK_URL

const SUBJECT_SLUGS: Record<string, string> = {
  'Matemáticas II': 'matematicas_ii', 'Matemáticas CCSS': 'matematicas_ccss', 'Física': 'fisica', 'Química': 'quimica',
  'Historia de España': 'historia_espana', 'Historia de la Filosofía': 'historia_filosofia', 'Lengua Castellana': 'lengua', 'Inglés': 'ingles', 'Biología': 'biologia'
}
const PRIVATE_BETA_SUBJECT_SLUGS = new Set<string>(PRIVATE_BETA_SUBJECTS)
const DB_SUBJECTS: Record<string, string> = {
  'Matemáticas CCSS': 'matematicas_ccss',
  'Lengua Castellana': 'lengua',
  'Historia de España': 'historia_espana',
}
const seedTopicToCurriculumItem = (topic: CaminoCurriculumTopic): CurriculumItem => ({
  subject: SUBJECT_SLUGS[topic.subject] ? topic.subject : Object.entries(SUBJECT_SLUGS).find(([, slug]) => slug === topic.subject)?.[0] ?? topic.subject,
  subjectSlug: topic.subject,
  block: topic.blockTitle,
  blockSlug: topic.blockSlug,
  topic: sanitizeLessonTitle(topic.title),
  topicSlug: topic.topicSlug,
  title: sanitizeLessonTitle(topic.title),
  sortOrder: topic.orderIndex,
  contentStatus: topic.contentStatus,
  source: 'seed',
  planTopic: topic,
})
const FALLBACK_CURRICULUM: CurriculumItem[] = getCurriculumForSubjects(Object.keys(SUBJECT_SLUGS)).map(seedTopicToCurriculumItem)
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

function toISO(date: Date) { return date.toISOString().slice(0, 10) }
function todayISO() { return toISO(new Date()) }
function todayMadrid() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }) }
function dateFromISO(dateISO: string) { return new Date(`${dateISO}T12:00:00Z`) }
function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }
function mondayOf(date: Date) { const d = new Date(date); const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() - day + 1); d.setUTCHours(12, 0, 0, 0); return d }
function currentWeekStartISO() { return toISO(mondayOf(dateFromISO(todayMadrid()))) }
function daysBetween(fromISO: string, toDateISO: string) { return Math.ceil((dateFromISO(toDateISO).getTime() - dateFromISO(fromISO).getTime()) / 86400000) }
function monthKey(dateISO: string) { return dateISO.slice(0, 7) }
function themeFor(subject: string) { return SUBJECT_COLORS[subject] ?? { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' } }
function subjectSlug(subject: string) { return normalizeSubjectSlug(SUBJECT_SLUGS[subject] ?? subject) }
function normalizeOnboardingSubjects(subjects: string[]) {
  const seen = new Set<string>()
  return subjects.map(subject => {
    const slug = normalizeSubjectSlug(subject)
    const label = subjectLabelFromSlug(slug)
    return { slug, label }
  }).filter(({ slug }) => {
    if (!slug || seen.has(slug) || !PRIVATE_BETA_SUBJECT_SLUGS.has(slug)) return false
    seen.add(slug)
    return true
  }).map(({ label }) => label)
}
function textSlug(value: string) { return normalizeCaminoSlug(value) }
function calendarDayLabel(dateISO: string) { return new Date(`${dateISO}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) }
function weekRangeLabel(weekStartISO: string) {
  const start = dateFromISO(weekStartISO)
  const end = addDays(start, 6)
  const startText = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const endText = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return `Semana del ${startText} al ${endText}`
}
function weekOffset(weekStartISO: string, weeks: number) { return toISO(addDays(dateFromISO(weekStartISO), weeks * 7)) }
function isRealToday(dateISO: string) { return dateISO === todayMadrid() }
function buildWeekDays(weekStartISO: string, sourceDays: DayPlan[] = []) {
  const byDate = new Map(sourceDays.map(day => [day.date, day]))
  const start = dateFromISO(weekStartISO)
  return Array.from({ length: 7 }, (_, index): DayPlan => {
    const dateISO = toISO(addDays(start, index))
    const source = byDate.get(dateISO)
    return { date: dateISO, label: calendarDayLabel(dateISO), isToday: isRealToday(dateISO), missions: source?.missions ?? [] }
  })
}
function weekStartForDate(dateISO: string) {
  return toISO(mondayOf(dateFromISO(dateISO)))
}
function cloneWeek(days: DayPlan[]) {
  return days.map(day => ({ ...day, missions: day.missions.map(mission => ({ ...mission })) }))
}
function mergeWeekIntoCalendar(current: DayPlan[], weekStartISO: string, weekDays: DayPlan[]) {
  const weekEndISO = toISO(addDays(dateFromISO(weekStartISO), 6))
  const outsideWeek = current.filter(day => day.date < weekStartISO || day.date > weekEndISO)
  return [...outsideWeek, ...cloneWeek(weekDays)].sort((a, b) => a.date.localeCompare(b.date))
}
function saveWeekCache(weekStartISO: string, weekDays: DayPlan[]) {
  const cache = loadJson<CalendarWeekCache>(CALENDAR_WEEK_CACHE_KEY, {})
  saveJson(CALENDAR_WEEK_CACHE_KEY, { ...cache, [weekStartISO]: cloneWeek(weekDays) })
}
function saveCalendarWeeksToCache(days: DayPlan[]) {
  const cache = loadJson<CalendarWeekCache>(CALENDAR_WEEK_CACHE_KEY, {})
  const next = { ...cache }
  const grouped = new Map<string, DayPlan[]>()
  for (const day of days) {
    const weekStart = weekStartForDate(day.date)
    if (!grouped.has(weekStart)) grouped.set(weekStart, [])
    grouped.get(weekStart)!.push(day)
  }
  for (const [weekStart, weekDays] of grouped) {
    next[weekStart] = buildWeekDays(weekStart, weekDays)
  }
  saveJson(CALENDAR_WEEK_CACHE_KEY, next)
}
function getSimulationLimitForPlan(planId: CaminoPlanId) {
  return getCaminoPlanLimits(planId).fullMocksPerMonth
}
function getMonthlySimulationUsage(_userId: string | null, month: string, cache: CalendarWeekCache) {
  return Object.values(cache).flat().flatMap(day => day.missions)
    .filter(mission => mission.kind === 'mock_exam' && monthKey(mission.id.slice(0, 10)) === month)
    .length
}
function canScheduleSimulation(_userId: string | null, planId: CaminoPlanId, dateISO: string, cache: CalendarWeekCache, plannedThisRun = 0) {
  return getMonthlySimulationUsage(_userId, monthKey(dateISO), cache) + plannedThisRun < getSimulationLimitForPlan(planId)
}
function courseHrefForItem(item: CurriculumItem) {
  if (item.planTopic) return buildTopicHref(item.planTopic)
  return `/camino-pau/curso/${item.subjectSlug || subjectSlug(item.subject)}/${item.blockSlug || textSlug(item.block)}/${item.topicSlug || textSlug(item.topic)}`
}
function getMissionTarget(kind: MissionKind, subject: string, topic?: string, block?: string, planTopic?: CaminoCurriculumTopic) {
  const s = subjectSlug(subject)
  if (planTopic && (kind === 'concept_explanation' || kind === 'guided_example' || kind === 'guided_practice')) return { href: buildTopicHref(planTopic), fallback: '', autoCompletable: false }
  const topicParam = topic ? `&topic=${encodeURIComponent(textSlug(topic))}` : ''
  const blockParam = block ? `&block=${encodeURIComponent(textSlug(block))}` : ''
  if (kind === 'mock_exam') return { href: `/simulacros?subject=${s}${blockParam}${topicParam}&source=camino_pau`, fallback: '', autoCompletable: false }
  if (kind === 'evau_practice' || kind === 'exam_focus') return { href: `/?subject=${s}${blockParam}${topicParam}&mode=random&source=camino`, fallback: '', autoCompletable: false }
  if ((kind === 'concept_explanation' || kind === 'guided_example' || kind === 'guided_practice') && block && topic) {
    const blockSlug = textSlug(block)
    const topicSlug = resolveTopicSlugAlias(s, blockSlug, textSlug(topic))
    return { href: `/camino-pau/curso/${s}/${blockSlug}/${topicSlug}`, fallback: '', autoCompletable: false }
  }
  if (kind === 'concept_explanation' || kind === 'guided_example' || kind === 'guided_practice') return { href: '', fallback: 'Este tema necesita bloque y tema para abrir una página de curso.', autoCompletable: true }
  return { href: '', fallback: 'Esta misión todavía no tiene pantalla propia. Puedes marcarla como hecha cuando la termines fuera de Pausia.', autoCompletable: true }
}
function actionHref(kind: MissionKind, subject: string, topic?: string, block?: string, planTopic?: CaminoCurriculumTopic) {
  if (planTopic && (kind === 'evau_practice' || kind === 'exam_focus')) return buildEvauHref(planTopic)
  return getMissionTarget(kind, subject, topic, block, planTopic).href
}
function missionTarget(kind: MissionKind, subject: string, topic?: string, block?: string, planTopic?: CaminoCurriculumTopic) {
  return actionHref(kind, subject, topic, block, planTopic)
}
function missionMeta(kind: MissionKind, subject: string, topic?: string, block?: string, planTopic?: CaminoCurriculumTopic) {
  const target = missionTarget(kind, subject, topic, block, planTopic)
  return { href: target, target, source: 'camino_pau' as const, xpPolicy: 'after_correction' as const }
}
function indexesFor(count: number) { if (count <= 3) return [0, 2, 4]; if (count === 4) return [0, 1, 3, 5]; if (count === 5) return [0, 1, 2, 4, 5]; if (count === 6) return [0, 1, 2, 3, 4, 5]; return [0, 1, 2, 3, 4, 5, 6] }
function titleFor(kind: MissionKind, subject: string, item?: CurriculumItem) { if (kind === 'concept_explanation') return `Tema de hoy: ${item?.topic ?? subject}`; if (kind === 'guided_example') return `Ejemplo guiado: ${item?.topic ?? subject}`; if (kind === 'guided_practice') return `Practica guiada: ${item?.topic ?? subject}`; if (kind === 'evau_practice') return `Ejercicio PAU/EVAU de ${item?.topic ?? subject}`; if (kind === 'exam_focus') return `Parcial cerca: ${item?.topic ?? subject}`; if (kind === 'mock_exam') return `Mini simulacro de ${subject}`; return `Tarea personalizada de ${subject}` }
function loadJson<T>(key: string, fallback: T): T { try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback } }
function saveJson(key: string, value: unknown) { window.localStorage.setItem(key, JSON.stringify(value)) }
function divisionFor(xp: number) { return DIVISIONS.find(d => xp >= d.min && xp <= d.max) ?? DIVISIONS[0] }
function priorityWeight(priority: ExamPriority) { if (priority === 'muy_alta') return 4; if (priority === 'alta') return 3; if (priority === 'normal') return 2; return 1 }
function priorityLabel(priority: ExamPriority) { return priority === 'muy_alta' ? 'Muy alta' : priority.charAt(0).toUpperCase() + priority.slice(1) }
function formatDate(dateISO: string) { return new Date(dateISO).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }
function hrefForMission(mission: Mission) {
  if (mission.missionType === 'partial_practice') {
    const simSubject = String(mission.metadata?.simulacro_subject ?? '')
    const simBlock = String(mission.metadata?.simulacro_block_filter ?? mission.block ?? '')
    if (simSubject && simBlock) {
      return {
        href: `/simulacros/practica/nueva?subject=${encodeURIComponent(simSubject)}&block=${encodeURIComponent(simBlock)}&source=camino_partial&missionId=${encodeURIComponent(mission.id)}`,
        fallback: '',
      }
    }
  }
  const target = mission.href ? { href: mission.href, fallback: '' } : getMissionTarget(mission.kind, mission.subject, mission.topic, mission.block)
  if (!target.href) return target
  const separator = target.href.includes('?') ? '&' : '?'
  const start = mission.kind === 'concept_explanation' || mission.kind === 'guided_example' || mission.kind === 'guided_practice' ? '&start=exercise' : ''
  return { ...target, href: `${target.href}${separator}missionId=${encodeURIComponent(mission.id)}&source=camino_pau${start}` }
}
function localCurrentEntry(community: string, xp: number): RankingEntry { return { id: 'local-current-user', name: 'Tú', community, xp, rank: 1, isCurrentUser: true } }

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

type CaminoCalRow = {
  id: string
  scheduled_date: string
  subject: string
  title: string
  block_key: string | null
  block_slug: string | null
  is_main: boolean
  is_bonus: boolean
  status: string
  v2_sort_order: number | null
  mission_type: string
  metadata?: Record<string, unknown> | null
}

function calRowToMission(row: CaminoCalRow): Mission {
  const subjectLabel = subjectLabelFromSlug(row.subject)
  const blockSlug = row.block_slug ?? (row.block_key ? textSlug(row.block_key) : '')
  const linkedTopic = getTopicByV2SortOrder(row.subject, row.v2_sort_order)
  const rawTopicSlug = typeof row.metadata?.topic_slug === 'string'
    ? normalizeTopicSlug(row.metadata.topic_slug)
    : normalizeTopicSlug(sanitizeLessonTitle(row.title))
  const topicSlug = resolveTopicSlugAlias(row.subject, blockSlug, rawTopicSlug)
  const href = linkedTopic ? buildTopicHref(linkedTopic) : blockSlug
    ? `/camino-pau/curso/${row.subject}/${blockSlug}/${topicSlug}`
    : ''
  const cleanTitle = sanitizeLessonTitle(row.title)
  return {
    id: row.id,
    calendarRowId: row.id,
    role: row.is_main ? 'main' : 'bonus',
    kind: 'concept_explanation',
    subject: subjectLabel,
    block: row.block_key ?? subjectLabel,
    topic: cleanTitle,
    title: cleanTitle,
    reason: row.block_key ? `${row.block_key} · misión de tu Camino PAU.` : 'Misión de tu Camino PAU.',
    href,
    target: href,
    source: 'camino_pau',
    xpPolicy: 'after_correction',
    estimatedMinutes: 30,
    baseXP: 20,
    status: row.status === 'completed' ? 'done' : 'pending',
    metadata: row.metadata ?? undefined,
    subjectSlug: row.subject,
    v2SortOrder: row.v2_sort_order ?? undefined,
    blockKey: row.block_key ?? undefined,
    missionType: row.mission_type,
  }
}

async function fetchCaminoCalendar(userId: string): Promise<DayPlan[] | null> {
  const todayStr = todayMadrid()
  const { data, error } = await supabase
    .from('camino_calendar')
    .select('id, scheduled_date, subject, title, block_key, block_slug, is_main, is_bonus, status, v2_sort_order, mission_type, metadata')
    .eq('user_id', userId)
    .gte('scheduled_date', todayStr)
    .order('scheduled_date', { ascending: true })
    .limit(14)
  if (error || !data || data.length === 0) return null
  const byDate = new Map<string, CaminoCalRow[]>()
  for (const row of data as CaminoCalRow[]) {
    if (!byDate.has(row.scheduled_date)) byDate.set(row.scheduled_date, [])
    byDate.get(row.scheduled_date)!.push(row)
  }
  const today = todayMadrid()
  return Array.from(byDate.entries()).map(([date, rows]) => ({
    date,
    label: calendarDayLabel(date),
    isToday: date === today,
    missions: rows.map(calRowToMission),
  }))
}

async function fetchCurriculumItems(subjects: string[]): Promise<CurriculumItem[]> {
  const seeded = getCurriculumForSubjects(subjects).map(seedTopicToCurriculumItem)
  const dbSubjects = subjects.map(subject => DB_SUBJECTS[subject]).filter(Boolean)
  if (dbSubjects.length === 0) return seeded
  const { data, error } = await supabase
    .from('curriculum_flashcards')
    .select('subject, chapter_title, block_key, title, sort_order')
    .in('subject', dbSubjects)
    .eq('region', 'ambas')
    .order('sort_order', { ascending: true })

  if (error || !data) return seeded

  const flashcardItems = data.map(row => {
    const subject = subjectLabelFromSlug(row.subject)
    const blockSlug = textSlug(row.block_key)
    const rawTopicSlug = textSlug(row.chapter_title)
    return {
      subject,
      subjectSlug: normalizeSubjectSlug(row.subject),
      block: sanitizeLessonTitle(row.block_key),
      blockSlug,
      topic: sanitizeLessonTitle(row.chapter_title),
      topicSlug: resolveTopicSlugAlias(row.subject, blockSlug, rawTopicSlug),
      title: sanitizeLessonTitle(row.title),
      sortOrder: row.sort_order,
      contentStatus: 'latex_notes',
      source: 'supabase' as const,
    }
  }).filter(item => item.subjectSlug !== 'matematicas_ccss' || item.blockSlug !== 'geometria')
  return [...seeded, ...flashcardItems]
}

function curriculumForSubject(subject: string, curriculum: CurriculumItem[]) {
  const rows = curriculum.filter(item => item.subject === subject)
  if (rows.length > 0) return rows
  return FALLBACK_CURRICULUM.filter(item => item.subject === subject)
}

function courseTopicsForSubjects(subjects: string[], curriculum: CurriculumItem[]) {
  const source = (curriculum.length ? curriculum : FALLBACK_CURRICULUM).filter(item => item.planTopic)
  const allowedSubjects = new Set(normalizeOnboardingSubjects(subjects))
  const grouped = new Map<string, Map<string, CurriculumItem[]>>()
  for (const item of source) {
    if (!allowedSubjects.has(item.subject)) continue
    if (item.subject === 'Matemáticas CCSS' && item.blockSlug === 'geometria-3d') continue
    if (!grouped.has(item.subject)) grouped.set(item.subject, new Map())
    const blocks = grouped.get(item.subject)!
    if (!blocks.has(item.block)) blocks.set(item.block, [])
    blocks.get(item.block)!.push(item)
  }
  return Array.from(grouped.entries()).map(([subject, blocks]) => ({
    subject,
    blocks: Array.from(blocks.entries()).map(([block, items]) => ({
      block,
      items: items.sort((a, b) => a.sortOrder - b.sortOrder)
    }))
  }))
}

function pickCurriculumItem(subject: string, rotation: number, curriculum: CurriculumItem[]) {
  const rows = curriculumForSubject(subject, curriculum)
  if (rows.length === 0) return null
  return rows[rotation % rows.length]
}

function loadSchoolAdjustments(): SchoolTopicAdjustment[] {
  const direct = loadJson<SchoolTopicAdjustment[]>(SCHOOL_ADJUSTMENTS_KEY, [])
  const legacy = loadJson<LegacySchoolFeedback[]>(SCHOOL_FEEDBACK_KEY, []).map(item => ({
    schoolName: item.schoolName,
    community: item.community,
    subject: item.subject,
    blockSlug: item.block,
    topicSlug: item.topic,
    feedbackType: item.reason,
    status: 'not_seen' as const,
    notSeenCount: 1,
    date: item.date,
  }))
  return [...direct, ...legacy].filter(item => item.feedbackType === 'not_seen_in_class')
}

function adjustmentMatchesSubject(adjustment: SchoolTopicAdjustment, subject: string) {
  return normalizeSubjectSlug(adjustment.subject) === subjectSlug(subject)
}

function adjustmentMatchesSchool(adjustment: SchoolTopicAdjustment, onboarding: OnboardingData) {
  if (!adjustment.schoolName) return true
  return adjustment.schoolName === onboarding.schoolName
}

function findAdjustmentForItem(item: CurriculumItem | null | undefined, subject: string, onboarding: OnboardingData, adjustments: SchoolTopicAdjustment[]) {
  if (!item) return null
  return adjustments.find(adjustment =>
    adjustmentMatchesSchool(adjustment, onboarding) &&
    adjustmentMatchesSubject(adjustment, subject) &&
    (!adjustment.blockSlug || adjustment.blockSlug === item.blockSlug || adjustment.blockSlug === textSlug(item.block)) &&
    (adjustment.topicSlug === item.topicSlug || adjustment.topicSlug === textSlug(item.topic))
  ) ?? null
}

function findReplacementItem(subject: string, blockedItem: CurriculumItem, onboarding: OnboardingData, curriculum: CurriculumItem[], adjustments: SchoolTopicAdjustment[]) {
  const rows = curriculumForSubject(subject, curriculum)
    .filter(item => item.blockSlug === blockedItem.blockSlug || item.block === blockedItem.block)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const before = rows.filter(item => item.sortOrder < blockedItem.sortOrder).reverse()
  const after = rows.filter(item => item.sortOrder > blockedItem.sortOrder)
  return [...before, ...after].find(item => !findAdjustmentForItem(item, subject, onboarding, adjustments)) ?? null
}

function schoolAdjustedItem(subject: string, item: CurriculumItem | null, onboarding: OnboardingData, curriculum: CurriculumItem[], adjustments: SchoolTopicAdjustment[], examContext?: StudentExam) {
  const adjustment = findAdjustmentForItem(item, subject, onboarding, adjustments)
  if (!item || !adjustment) return { item, adjustment: null, replacedTopic: null }
  const replacement = findReplacementItem(subject, item, onboarding, curriculum, adjustments)
  if (replacement) return { item: replacement, adjustment, replacedTopic: item.topic }
  return { item: null, adjustment, replacedTopic: examContext?.topic || item.topic }
}

function findExamCurriculumItem(exam: StudentExam | undefined, subject: string, curriculum: CurriculumItem[]) {
  if (!exam) return null
  const blockNeedle = textSlug(exam.block || '')
  const topicNeedle = textSlug(exam.topic || '')
  if (!blockNeedle && !topicNeedle) return null
  return curriculumForSubject(subject, curriculum).find(item => {
    const block = textSlug(item.block)
    const topic = textSlug(item.topic)
    return Boolean((blockNeedle && block.includes(blockNeedle)) || (topicNeedle && topic.includes(topicNeedle)))
  }) ?? null
}

function progressKeyForItem(item: CurriculumItem | null | undefined) {
  if (!item) return ''
  return `${item.subjectSlug || subjectSlug(item.subject)}:${item.blockSlug}:${item.topicSlug}`
}

function topicIsCompleted(item: CurriculumItem | null | undefined, progress: TopicProgress) {
  const key = progressKeyForItem(item)
  return Boolean(key && progress[key]?.evau)
}

function blockIsCompleted(item: CurriculumItem | null | undefined, subject: string, curriculum: CurriculumItem[], progress: TopicProgress) {
  if (!item) return false
  const rows = curriculumForSubject(subject, curriculum).filter(row => row.blockSlug === item.blockSlug || row.block === item.block)
  return rows.length > 0 && rows.every(row => topicIsCompleted(row, progress))
}

function missionPhaseForExam(distance: number | null) {
  if (distance == null) return 'normal'
  if (distance <= 1) return 'eve'
  if (distance <= 6) return 'close'
  if (distance <= 14) return 'medium'
  return 'far'
}

function buildMission(input: {
  dateISO: string
  slot: string
  role: MissionRole
  kind: MissionKind
  subject: string
  item: CurriculumItem | null
  title: string
  reason: string
  minutes: number
  xp: number
}): Mission {
  const subjectSlugValue = input.item?.subjectSlug ?? subjectSlug(input.subject)
  const blockSlugValue = input.item?.blockSlug ?? (input.item?.block ? textSlug(input.item.block) : undefined)
  const topicSlugValue = input.item?.topicSlug ?? (input.item?.topic && blockSlugValue ? resolveTopicSlugAlias(subjectSlugValue, blockSlugValue, textSlug(input.item.topic)) : undefined)
  return {
    id: `${input.dateISO}-${input.slot}`,
    role: input.role,
    kind: input.kind,
    subject: input.subject,
    block: input.item?.block,
    topic: input.item?.topic,
    title: input.title,
    reason: input.reason,
    ...missionMeta(input.kind, input.subject, input.item?.topic, input.item?.block, input.item?.planTopic),
    estimatedMinutes: input.minutes,
    baseXP: input.xp,
    status: 'pending',
    metadata: topicSlugValue ? { topic_slug: topicSlugValue } : undefined,
    subjectSlug: subjectSlugValue,
    blockKey: input.item?.block,
  }
}

function generateCalendar(onboarding: OnboardingData, exams: StudentExam[], curriculum: CurriculumItem[] = [], planId: CaminoPlanId = 'free', weekStartISO = currentWeekStartISO(), weekCache: CalendarWeekCache = {}) {
  const planLimits = getCaminoPlanLimits(planId)
  const start = dateFromISO(weekStartISO)
  const subjects = normalizeOnboardingSubjects(onboarding.subjects)
  if (!subjects.length) {
    return Array.from({ length: 7 }, (_, index): DayPlan => {
      const date = addDays(start, index)
      const dateISO = toISO(date)
      return { date: dateISO, label: calendarDayLabel(dateISO), isToday: isRealToday(dateISO), missions: [] }
    })
  }
  const weeklyDays = Math.min(onboarding.weeklyStudyDaysValue ?? 4, planLimits.maxStudyDaysPerWeek)
  const weekDelta = Math.max(0, Math.floor(daysBetween(currentWeekStartISO(), weekStartISO) / 7))
  const topicStepPerWeek = Math.max(1, Math.ceil(weeklyDays / Math.max(subjects.length, 1)))
  const weeklyCorrectionBudget = monthlyToWeeklyLimit(planLimits.correctionsPerMonth)
  const weeklyPhotoBudget = monthlyToWeeklyLimit(planLimits.photosPerMonth)
  const maxCorrectableMissions = Math.max(1, Math.min(weeklyCorrectionBudget, Math.max(weeklyPhotoBudget, planLimits.caminoMode === 'limited' ? 2 : weeklyCorrectionBudget)))
  const minutes = onboarding.dailyMinutes ?? 60
  const indexes = indexesFor(weeklyDays)
  let subjectRotation = weekDelta * weeklyDays
  const topicRotationBySubject = new Map<string, number>(
    subjects.map(subject => [subject, weekDelta * topicStepPerWeek])
  )
  const allowedSubjectSlugs = new Set(subjects.map(subject => subjectSlug(subject)))
  const relevantExams = exams.filter(exam => allowedSubjectSlugs.has(normalizeSubjectSlug(exam.subject)))
  const weakAreas = typeof window === 'undefined' ? [] : loadJson<Array<{ subject: string; block?: string; topic?: string; score: number }>>(WEAK_AREAS_KEY, [])
  const topicProgress = typeof window === 'undefined' ? {} : loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {})
  const schoolAdjustments = typeof window === 'undefined' ? [] : loadSchoolAdjustments()
  const recentTopicKeys = new Set(
    Object.values(weekCache)
      .flat()
      .flatMap(day => day.missions)
      .map(mission => `${subjectSlug(mission.subject)}:${mission.block ? textSlug(mission.block) : ''}:${typeof mission.metadata?.topic_slug === 'string' ? mission.metadata.topic_slug : mission.topic ? textSlug(mission.topic) : ''}`)
      .filter(Boolean),
  )
  let plannedSimulationsThisRun = 0
  const nextCurriculumItem = (subject: string) => {
    const rows = curriculumForSubject(subject, curriculum)
    const startRotation = topicRotationBySubject.get(subject) ?? 0
    for (let attempt = 0; attempt < Math.max(rows.length, 1); attempt += 1) {
      const rotation = startRotation + attempt
      const item = pickCurriculumItem(subject, rotation, curriculum)
      const recentKey = item ? `${subjectSlug(subject)}:${item.blockSlug}:${item.topicSlug}` : ''
      if (!item || (!recentTopicKeys.has(recentKey) && !findAdjustmentForItem(item, subject, onboarding, schoolAdjustments))) {
        topicRotationBySubject.set(subject, rotation + 1)
        return item
      }
    }
    topicRotationBySubject.set(subject, startRotation + 1)
    return pickCurriculumItem(subject, startRotation, curriculum)
  }

  return Array.from({ length: 7 }, (_, index): DayPlan => {
    const date = addDays(start, index)
    const dateISO = toISO(date)
    const upcoming = relevantExams
      .map(exam => ({ exam, distance: daysBetween(dateISO, exam.date), weight: priorityWeight(exam.priority) }))
      .filter(item => item.distance >= 0 && item.distance <= 21)
      .sort((a, b) => a.distance - b.distance || b.weight - a.weight)[0]?.exam
    const sameDay = relevantExams.find(exam => exam.date === dateISO)
    const examDistance = sameDay ? 0 : upcoming ? daysBetween(dateISO, upcoming.date) : null
    const examPhase = missionPhaseForExam(examDistance)
    const strongExamNearby = upcoming && priorityWeight(upcoming.priority) >= 3 && examDistance != null && examDistance <= 6
    const studyDay = indexes.includes(index) || Boolean(sameDay)
    const missions: Mission[] = []

    if (studyDay) {
      const weakArea = weakAreas.find(area => subjects.some(subject => subjectSlug(subject) === normalizeSubjectSlug(area.subject)) && area.score < 6)
      const rawPrioritySubject = sameDay?.subject ?? (strongExamNearby || index <= 2 ? upcoming?.subject : null) ?? (index <= 2 ? weakArea?.subject : null)
      const prioritySubject = rawPrioritySubject ? subjectLabelFromSlug(normalizeSubjectSlug(rawPrioritySubject)) : null
      const subject = prioritySubject ?? subjects[subjectRotation % subjects.length]
      const examContext = sameDay ?? (strongExamNearby ? upcoming : undefined)
      const weakItem = weakArea && normalizeSubjectSlug(weakArea.subject) === subjectSlug(subject) ? findExamCurriculumItem({ id: 'weak-area', subject, date: todayISO(), block: weakArea.block ?? '', topic: weakArea.topic ?? '', name: 'Refuerzo', priority: 'normal' }, subject, curriculum) : null
      const rawCurriculumItem = findExamCurriculumItem(examContext, subject, curriculum) ?? weakItem ?? nextCurriculumItem(subject)
      const schoolAdjusted = schoolAdjustedItem(subject, rawCurriculumItem, onboarding, curriculum, schoolAdjustments, examContext)
      const curriculumItem = schoolAdjusted.item
      if (!prioritySubject) subjectRotation += 1
      const topicDone = topicIsCompleted(curriculumItem ?? rawCurriculumItem, topicProgress)
      const blockDone = blockIsCompleted(curriculumItem ?? rawCurriculumItem, subject, curriculum, topicProgress)
      const canUseSimulation = (examPhase === 'eve' || examPhase === 'close') && canScheduleSimulation(null, planId, dateISO, weekCache, plannedSimulationsThisRun)
      const simulationLimitReached = (examPhase === 'eve' || examPhase === 'close') && !canUseSimulation && getSimulationLimitForPlan(planId) > 0
      const kind: MissionKind = schoolAdjusted.adjustment
        ? 'concept_explanation'
        : canUseSimulation
          ? 'mock_exam'
          : sameDay || strongExamNearby || topicDone || blockDone
            ? 'evau_practice'
            : 'concept_explanation'
      const reason = schoolAdjusted.adjustment
        ? examContext
          ? 'Este tema aparece en tu parcial, pero lo has marcado como no dado. Te proponemos una base previa antes de practicarlo.'
          : schoolAdjusted.replacedTopic
            ? `Tema marcado como no dado en clase: retrasamos ${schoolAdjusted.replacedTopic} y trabajamos una base previa del bloque.`
            : 'Tema marcado como no dado en clase. Repasa la base previa de este bloque.'
        : canUseSimulation ? `Parcial próximo${upcoming ? ` (${priorityLabel(upcoming.priority)})` : ''}: toca simulacro del mismo bloque sin superar tu límite mensual.`
          : simulationLimitReached ? 'Has alcanzado el límite de simulacros de tu plan este mes. Te proponemos ejercicios PAU del mismo tema.'
            : blockDone ? 'Bloque completado: pasamos a ejercicio PAU mixto y repaso inteligente, sin repetir teoría básica.'
              : topicDone ? 'Tema completado: evitamos repetir teoría básica y pasamos a práctica PAU/EVAU.'
                : sameDay ? `Parcial hoy: ${sameDay.block || sameDay.topic || sameDay.name || sameDay.subject}. Prioridad a ejercicios PAU/EVAU del bloque.` : weakItem ? `Refuerzo concreto de ${curriculumItem?.topic ?? weakArea?.topic ?? subject} por una corrección baja anterior.` : curriculumItem ? `${curriculumItem.block} · explicación, práctica guiada y ejercicio PAU.` : upcoming?.subject === subject ? `Parcial cercano (${priorityLabel(upcoming.priority)}): priorizamos ${subject}.` : onboarding.preparationFeeling === 'Me cuesta organizarme' ? 'Poco volumen, mucha claridad.' : 'Reparto equilibrado según tu onboarding.'
      if (missions.length < maxCorrectableMissions) {
        const missionItem = curriculumItem ?? rawCurriculumItem
        missions.push(buildMission({
          dateISO,
          slot: 'main-1',
          role: 'main',
          kind,
          subject,
          item: missionItem,
          title: kind === 'mock_exam'
            ? `Simulacro corto: ${missionItem?.block ?? subject}`
            : schoolAdjusted.adjustment ? curriculumItem ? `Base previa: ${curriculumItem.topic}` : `Base previa de ${rawCurriculumItem?.block ?? subject}` : weakItem ? `Refuerza ${curriculumItem?.topic ?? weakArea?.topic ?? subject}` : sameDay ? `Foco parcial: ${sameDay.block || sameDay.topic || subject}` : topicDone || blockDone ? `Ejercicio PAU/EVAU de ${missionItem?.topic ?? subject}` : titleFor(kind, subject, missionItem ?? undefined),
          reason,
          minutes: Math.min(Math.max(25, Math.round(minutes / 2)), 60),
          xp: kind === 'mock_exam' ? 35 : kind === 'evau_practice' ? 25 : 15,
        }))
        if (kind === 'mock_exam') plannedSimulationsThisRun += 1
      }

      if (planLimits.caminoMode !== 'limited' && minutes >= 60 && !sameDay && missions.length < maxCorrectableMissions) {
        const secondItem = curriculumItem ?? rawCurriculumItem
        missions.push(buildMission({
          dateISO,
          slot: 'main-2',
          role: 'main',
          kind: 'evau_practice',
          subject,
          item: secondItem,
          title: blockDone ? `Ejercicio PAU mixto de ${secondItem?.block ?? subject}` : `Ejercicio PAU/EVAU de ${secondItem?.topic ?? subject}`,
          reason: topicDone || blockDone ? 'Seguimos practicando con PAU/EVAU porque este contenido ya está trabajado.' : 'Después del curso, practica con un ejercicio PAU/EVAU del mismo tema.',
          minutes: Math.min(30, Math.max(15, Math.round(minutes / 3))),
          xp: 25,
        }))
      }

      if (planLimits.includeBonusMissions) {
        missions.push({ id: `${dateISO}-bonus-1`, role: 'bonus', kind: 'guided_example', subject, block: curriculumItem?.block, topic: curriculumItem?.topic, title: `Bonus: ejemplo guiado de ${curriculumItem?.topic ?? subject}`, reason: 'Opcional para practicar con calma.', ...missionMeta('guided_example', subject, curriculumItem?.topic, curriculumItem?.block, curriculumItem?.planTopic), estimatedMinutes: 10, baseXP: 12, status: 'pending' })
        if (missions.length < maxCorrectableMissions) {
          missions.push({ id: `${dateISO}-bonus-2`, role: 'bonus', kind: 'evau_practice', subject, block: curriculumItem?.block, topic: curriculumItem?.topic, title: `Bonus: ejercicio PAU de ${curriculumItem?.topic ?? subject}`, reason: 'Cierra el día con práctica real si te queda energía.', ...missionMeta('evau_practice', subject, curriculumItem?.topic, curriculumItem?.block, curriculumItem?.planTopic), estimatedMinutes: 12, baseXP: 12, status: 'pending' })
        }
      }
    }

    return { date: dateISO, label: calendarDayLabel(dateISO), isToday: isRealToday(dateISO), missions }
  })
}

function calendarStartsWeek(calendar: DayPlan[], weekStartISO: string) {
  return calendar[0]?.date === weekStartISO
}

function missionBelongsToSubjects(mission: Mission, subjects: string[]) {
  const allowed = new Set(subjects.map(subject => normalizeSubjectSlug(subject)))
  return Boolean(mission.subject && allowed.has(normalizeSubjectSlug(mission.subject)))
}

function missionHasStructuredTarget(mission: Mission) {
  return Boolean(
    mission.id &&
    mission.subject &&
    mission.block &&
    mission.topic &&
    mission.href &&
    mission.target &&
    mission.source === 'camino_pau' &&
    mission.xpPolicy === 'after_correction'
  )
}

function visibleCalendarForOnboarding(calendar: DayPlan[], onboarding: OnboardingData | null) {
  if (!onboarding) return calendar
  return calendar.map(day => ({
    ...day,
    missions: day.missions.filter(mission => missionBelongsToSubjects(mission, onboarding.subjects) && missionHasStructuredTarget(mission)),
  }))
}

function calendarMatchesOnboarding(calendar: DayPlan[], onboarding: OnboardingData, weekStartISO = currentWeekStartISO()) {
  if (!calendarStartsWeek(calendar, weekStartISO)) return false
  return calendar.every(day => day.missions.every(mission =>
    missionBelongsToSubjects(mission, onboarding.subjects) &&
    missionHasStructuredTarget(mission) &&
    !/flashcard|tarjeta|mazo|historial|corrige un error|revisa tus errores/i.test(`${mission.kind} ${mission.title} ${mission.reason}`)
  ))
}

export default function CaminoCalendarClient() {
  const router = useRouter()
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [calendar, setCalendar] = useState<DayPlan[]>([])
  const [exams, setExams] = useState<StudentExam[]>([])
  const [xpTotal, setXpTotal] = useState(0)
  const [weeklyXP, setWeeklyXP] = useState(0)
  const [rankingOpen, setRankingOpen] = useState(false)
  const [rankingTab, setRankingTab] = useState<'global' | 'community'>('global')
  const [showExamForm, setShowExamForm] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [examDraft, setExamDraft] = useState({ subject: '', date: toISO(addDays(new Date(), 3)), block: '', topic: '', name: '', priority: 'normal' as ExamPriority })
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([])
  const [calendarEditorOpen, setCalendarEditorOpen] = useState(false)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [showPastExams, setShowPastExams] = useState(false)
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStartISO())
  const [caminoPlanId, setCaminoPlanId] = useState<CaminoPlanId>('free')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [liga, setLiga] = useState<LigaInfo | null>(null)
  const [ligaLoading, setLigaLoading] = useState(true)
  const [supabaseCalLoaded, setSupabaseCalLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({})
  const [blockCompletedCount, setBlockCompletedCount] = useState(0)
  const [daysSinceReg, setDaysSinceReg] = useState<number | null>(null)
  const [caminoReadyStatus, setCaminoReadyStatus] = useState<'checking' | 'no_queue' | 'no_future' | 'ready'>('checking')
  const [isGenerating, setIsGenerating] = useState(false)
  const [projection, setProjection] = useState<Array<{ asignatura: string; nota_proyectada: number | null; num_entries: number; recent_entries: number; confidence: 'low' | 'medium' | 'high'; trend_7d: number | null; bloques: Array<{ bloque: string; nota_proyectada: number; num_entries: number; avg_max_pts: number | null }> }> | null>(null)

  useEffect(() => {
    const loadedOnboarding = loadOnboarding()
    const loadedExams = loadJson<StudentExam[]>(EXAMS_KEY, [])
    const loadedCalendarExpanded = loadJson<boolean>(CALENDAR_VISIBILITY_KEY, false)
    setOnboarding(loadedOnboarding)
    setExams(loadedExams)
    setCalendarExpanded(loadedCalendarExpanded)
    setSelectedWeekStart(currentWeekStartISO())
    setExamDraft(current => ({ ...current, subject: loadedOnboarding.subjects[0] ?? 'Matemáticas II' }))
    if (!window.localStorage.getItem('pausia_camino_onboarding_done')) setShowOnboarding(true)
    fetchCurriculumItems(loadedOnboarding.subjects)
      .then(items => setCurriculumItems(items.length ? items : FALLBACK_CURRICULUM))
      .catch(() => setCurriculumItems(FALLBACK_CURRICULUM))
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id
      if (!userId || cancelled) return
      const token = data.session?.access_token
      const storedExams = loadJson<StudentExam[]>(EXAMS_KEY, [])
      if (storedExams.length === 0 && token) {
        fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then((profile: { student_exams?: StudentExam[] }) => {
            if (Array.isArray(profile.student_exams) && profile.student_exams.length > 0 && !cancelled) {
              setExams(profile.student_exams)
              saveJson(EXAMS_KEY, profile.student_exams)
            }
          })
          .catch(() => undefined)
      }
      const created = data.session?.user.created_at
      if (created) {
        const days = Math.floor((Date.now() - new Date(created).getTime()) / 86400000)
        if (!cancelled) setDaysSinceReg(days)
      }
      await ensureCaminoCalendar(userId, supabase)
      if (cancelled) return
      const weekStart = currentWeekStartISO()
      const [calDays, rachaValue, matCount, ccssCount, lenguaCount, historiaCount, progressRow, weeklyXpRows, queueResult] = await Promise.all([
        fetchCaminoCalendar(userId),
        calcularRacha(userId, supabase),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'matematicas_ii'),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'matematicas_ccss'),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'lengua'),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'historia_espana'),
        supabase.from('camino_user_progress').select('xp_total').eq('user_id', userId).maybeSingle(),
        supabase.from('camino_xp_events').select('xp_amount').eq('user_id', userId).gte('created_at', weekStart + 'T00:00:00Z'),
        supabase.from('user_learning_queue').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ])
      if (cancelled) return
      if (calDays && calDays.length > 0) {
        setCalendar(calDays)
        saveCalendarWeeksToCache(calDays)
        setSupabaseCalLoaded(true)
        setCaminoReadyStatus('ready')
        const realTodayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
        const todayDay = calDays.find(d => d.date === realTodayStr)
        const heroMission = todayDay?.missions.find(m => m.role === 'main')
        if (heroMission?.blockKey) {
          supabase
            .from('camino_calendar')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('block_key', heroMission.blockKey)
            .eq('status', 'completed')
            .then(({ count }) => { if (!cancelled) setBlockCompletedCount(count ?? 0) })
        }
      } else {
        const qCount = (queueResult as { count: number | null }).count ?? 0
        if (!cancelled) setCaminoReadyStatus(qCount > 0 ? 'no_future' : 'no_queue')
      }
      setStreak(rachaValue)
      setSubjectProgress({
        matematicas_ii: matCount.count ?? 0,
        matematicas_ccss: ccssCount.count ?? 0,
        lengua: lenguaCount.count ?? 0,
        historia_espana: historiaCount.count ?? 0,
      })
      setXpTotal(Number(progressRow.data?.xp_total) || 0)
      setWeeklyXP(((weeklyXpRows.data ?? []) as Array<{ xp_amount: number }>).reduce((sum, r) => sum + (Number(r.xp_amount) || 0), 0))
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (caminoReadyStatus !== 'no_future') return
    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user.id
      if (!userId || cancelled) return
      await ensureCaminoCalendar(userId, supabase)
      const calDays = await fetchCaminoCalendar(userId)
      if (cancelled) return
      if (calDays && calDays.length > 0) {
        setCalendar(calDays)
        saveCalendarWeeksToCache(calDays)
        setSupabaseCalLoaded(true)
        setCaminoReadyStatus('ready')
      } else {
        setCaminoReadyStatus('no_queue')
      }
    }, 2000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [caminoReadyStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!onboarding?.community) return
    const community = onboarding.community
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (cancelled) return
      if (!token) return
      const next = await fetchLeaderboard(token, community)
      if (!cancelled && next) setLeaderboard(next)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [onboarding?.community])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (!token || cancelled) return
      try {
        const res = await fetch('/api/proyeccion', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok || cancelled) return
        const json = await res.json() as { projections?: Array<{ asignatura: string; nota_proyectada: number | null; num_entries: number; recent_entries: number; confidence: 'low' | 'medium' | 'high'; trend_7d: number | null; bloques: Array<{ bloque: string; nota_proyectada: number; num_entries: number; avg_max_pts: number | null }> }> }
        if (!cancelled) setProjection(json.projections ?? [])
      } catch { /* silently ignore */ }
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!onboarding?.completedAt) return
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (!token || cancelled) return
      const res = await fetch('/api/billing/me', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok || cancelled) return
      const billing = await res.json() as { activePlans?: Array<{ planId?: string | null }> }
      const planId = normalizeCaminoPlanId(billing.activePlans?.[0]?.planId)
      if (!cancelled) setCaminoPlanId(planId)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [onboarding?.completedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (!token || cancelled) { if (!cancelled) setLigaLoading(false); return }
      const res = await fetch('/api/ligas', { headers: { Authorization: `Bearer ${token}` } })
      if (!cancelled && res.ok) { const d = await res.json(); setLiga(d.liga ?? null) }
      if (!cancelled) setLigaLoading(false)
    }).catch(() => { if (!cancelled) setLigaLoading(false) })
    return () => { cancelled = true }
  }, [])

  const hasProfile = Boolean(onboarding?.completedAt && onboarding.community && onboarding.subjects.length)
  const visibleCalendar = visibleCalendarForOnboarding(calendar, onboarding)
  const realToday = todayMadrid()
  const today = visibleCalendar.find(day => day.date === realToday) ?? { date: realToday, label: calendarDayLabel(realToday), isToday: true, missions: [] }
  const allMissions = visibleCalendar.flatMap(day => day.missions)
  const totalMain = allMissions.filter(mission => mission.role === 'main').length
  const completedMain = allMissions.filter(mission => mission.role === 'main' && mission.status === 'done').length
  const todayMain = today?.missions.filter(mission => mission.role === 'main') ?? []
  const todayBonus = today?.missions.filter(mission => mission.role === 'bonus') ?? []
  const todayDone = todayMain.length > 0 && todayMain.every(mission => mission.status === 'done')
  const displayedXP = leaderboard?.currentXp ?? xpTotal
  const division = divisionFor(displayedXP)
  const nextDivision = DIVISIONS[DIVISIONS.indexOf(division) + 1]
  const divisionPct = nextDivision ? Math.min(100, Math.round(((displayedXP - division.min) / (nextDivision.min - division.min)) * 100)) : 100
  const rankingCommunity = leaderboard?.community.name ?? onboarding?.community ?? 'Sin comunidad'
  const fallbackCurrent = localCurrentEntry(rankingCommunity, displayedXP)
  const rankingSource = rankingTab === 'global'
    ? leaderboard?.global
    : leaderboard?.community
  const currentRankingRow = rankingSource?.current ?? fallbackCurrent
  const rankingTopRows = rankingSource?.top ?? []
  const currentInTop = rankingTopRows.some(row => row.isCurrentUser)
  const fixedCurrentRow = currentInTop ? null : currentRankingRow
  const onboardingSubjects = normalizeOnboardingSubjects(onboarding?.subjects ?? [])
  const courseGroups = courseTopicsForSubjects(onboardingSubjects, curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM)
  const caminoPlanLimits = getCaminoPlanLimits(caminoPlanId)
  const hasOnboardingSubjects = Boolean(onboarding?.subjects.length)
  const microMission = (todayMain.length > 0 || !hasOnboardingSubjects || caminoReadyStatus !== 'ready')
    ? null
    : (() => {
      const topEntry = Object.entries(subjectProgress).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])[0]
      const topSlug = topEntry?.[0] ?? (onboardingSubjects[0] ? subjectSlug(onboardingSubjects[0]) : null)
      if (!topSlug) return null
      const subjectLabel = subjectLabelFromSlug(topSlug)
      const items = (curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM)
        .filter(item => (item.subjectSlug === topSlug || subjectSlug(item.subject) === topSlug) && item.planTopic)
      const item = items[0] ?? null
      const href = item?.planTopic
        ? `${buildTopicHref(item.planTopic)}?start=exercise&source=repaso_express`
        : `/?subject=${encodeURIComponent(topSlug)}&mode=random&source=repaso_express`
      return { subject: subjectLabel, subjectSlug: topSlug, topic: item?.topic ?? subjectLabel, href, hasCompletedItems: Boolean(topEntry) }
    })()
  const isRescueMode = calendar.some(day => day.missions.some(m => m.metadata?.plan_mode === 'rescue'))
  const selectedWeekLabel = weekRangeLabel(selectedWeekStart)
  const selectedIsCurrentWeek = selectedWeekStart === currentWeekStartISO()
  const nextMissionInCalendar = visibleCalendar
    .filter(day => day.date > realToday)
    .flatMap(day => day.missions.filter(m => m.role === 'main' && m.status !== 'done'))
    [0] ?? null
  const showWeeklyGoal = !leaderboard || rankingTopRows.length < 2
  const weekEndISO = toISO(addDays(dateFromISO(selectedWeekStart), 6))
  const weekCalendar = buildWeekDays(selectedWeekStart, visibleCalendar.filter(day => day.date >= selectedWeekStart && day.date <= weekEndISO))
  const activeExams = exams.filter(e => e.date >= realToday)
  const pastExams = exams.filter(e => e.date < realToday)
  const upcomingPartial = (() => {
    const horizon = toISO(addDays(new Date(), 7))
    return exams
      .filter(e => e.date >= realToday && e.date <= horizon)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  })()

  const userSubjectSlugs = new Set(onboardingSubjects.map(s => subjectSlug(s)))
  const filteredProjection = projection?.filter(p => userSubjectSlugs.has(p.asignatura)) ?? null
  const isShareWindow = (() => {
    const dow = new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Madrid', weekday: 'short' })
    return dow === 'Fri' || dow === 'Sat' || dow === 'Sun'
  })()
  const heroAsignatura = (() => {
    if (!filteredProjection?.length) return null
    const nextPartialSlug = upcomingPartial ? subjectSlug(upcomingPartial.subject) : null
    if (nextPartialSlug && filteredProjection.some(p => p.asignatura === nextPartialSlug)) return nextPartialSlug
    return [...filteredProjection].sort((a, b) => b.recent_entries - a.recent_entries)[0]?.asignatura ?? null
  })()

  async function shareInforme() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      const res = await fetch('/api/informe/link', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { setToast('No se pudo generar el enlace'); return }
      const { url } = await res.json() as { url?: string }
      if (!url) { setToast('No se pudo generar el enlace'); return }
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      if (isMobile) {
        const msg = encodeURIComponent(`Mira mi progreso de esta semana en Pausia: ${url}`)
        window.open(`https://wa.me/?text=${msg}`, '_blank')
      } else {
        await navigator.clipboard.writeText(url)
        setToast('Enlace copiado')
      }
    } catch {
      setToast('No se pudo generar el enlace')
    }
  }

  async function createLiga(nombre: string): Promise<{ error?: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No hay sesión activa' }
    const res = await fetch('/api/ligas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ nombre }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error ?? 'Error al crear liga' }
    setLiga(json.liga)
    return {}
  }

  async function joinLiga(codigo: string): Promise<{ error?: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'No hay sesión activa' }
    const res = await fetch('/api/ligas/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ codigo: codigo.trim().toUpperCase() }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error ?? 'Error al unirse' }
    const refreshRes = await fetch('/api/ligas', { headers: { Authorization: `Bearer ${session.access_token}` } })
    if (refreshRes.ok) { const d = await refreshRes.json(); setLiga(d.liga ?? null) }
    return {}
  }

  async function completeMission(mission: Mission) {
    if (!mission.calendarRowId) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setCalendar(current => current.map(day => ({
      ...day,
      missions: day.missions.map(m => m.id === mission.id ? { ...m, status: 'done' as MissionStatus } : m),
    })))
    setXpTotal(prev => prev + 20)
    setWeeklyXP(prev => prev + 20)
    setToast('¡Misión completada! +20 XP')
    await supabase
      .from('camino_calendar')
      .update({ status: 'completed', completed_at: new Date().toISOString(), xp_awarded: 20 })
      .eq('id', mission.calendarRowId)
    await supabase
      .from('camino_xp_events')
      .insert({
        user_id: session.user.id,
        xp: 20,
        source: 'camino_mission',
        metadata: { mission_id: mission.calendarRowId, subject: mission.subject, title: mission.title },
      })
  }

  async function generateCamino() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setIsGenerating(true)
    try {
      const subjectSlugs = (onboarding?.subjects ?? []).map(s => SUBJECT_SLUGS[s]).filter((slug): slug is string => Boolean(slug) && PRIVATE_BETA_SUBJECT_SLUGS.has(slug))
      const subjects = subjectSlugs.length > 0 ? subjectSlugs : ['matematicas_ii']
      const res = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ subjects, startMode: 'zero' }),
      })
      if (res.ok) {
        await ensureCaminoCalendar(session.user.id, supabase)
        const calDays = await fetchCaminoCalendar(session.user.id)
        if (calDays && calDays.length > 0) {
          setCalendar(calDays)
          saveCalendarWeeksToCache(calDays)
          setSupabaseCalLoaded(true)
          setCaminoReadyStatus('ready')
        }
      }
    } catch { /* silent */ }
    setIsGenerating(false)
  }

  function persist(nextCalendar: DayPlan[], nextExams = exams) {
    const weekStart = weekStartForDate(nextCalendar[0]?.date ?? selectedWeekStart)
    saveWeekCache(weekStart, nextCalendar)
    setCalendar(current => nextCalendar.length <= 7 ? mergeWeekIntoCalendar(current, weekStart, nextCalendar) : nextCalendar)
    setExams(nextExams)
    saveJson(EXAMS_KEY, nextExams)
    supabase.auth.getSession().then(({ data: sessionData }) => {
      const token = sessionData.session?.access_token
      if (!token) return
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_exams: nextExams }),
      }).catch(() => undefined)
    }, () => undefined)
  }
  function generateWeek(weekStartISO: string, nextExams = exams, planId = caminoPlanId) {
    if (!onboarding) return []
    const weekEndISO = toISO(addDays(dateFromISO(weekStartISO), 6))
    const existingWeek = buildWeekDays(weekStartISO, calendar.filter(day => day.date >= weekStartISO && day.date <= weekEndISO))
    if (existingWeek.some(day => day.missions.length > 0)) {
      setSelectedWeekStart(weekStartISO)
      saveWeekCache(weekStartISO, existingWeek)
      return existingWeek
    }
    const cachedWeek = loadJson<CalendarWeekCache>(CALENDAR_WEEK_CACHE_KEY, {})[weekStartISO]
    if (cachedWeek) {
      const stableWeek = buildWeekDays(weekStartISO, cachedWeek)
      setSelectedWeekStart(weekStartISO)
      setCalendar(current => mergeWeekIntoCalendar(current, weekStartISO, stableWeek))
      return stableWeek
    }
    const source = curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM
    const weekCache = loadJson<CalendarWeekCache>(CALENDAR_WEEK_CACHE_KEY, {})
    const nextCalendar = generateCalendar(onboarding, nextExams, source, planId, weekStartISO, weekCache)
    setSelectedWeekStart(weekStartISO)
    saveWeekCache(weekStartISO, nextCalendar)
    setCalendar(current => mergeWeekIntoCalendar(current, weekStartISO, nextCalendar))
    return nextCalendar
  }
  function goToWeek(weekStartISO: string) {
    generateWeek(weekStartISO)
  }
  function goToCurrentWeek() {
    goToWeek(currentWeekStartISO())
  }
  function regenerate(nextExams = exams) {
    if (!onboarding) return
    const source = curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM
    const regenerated = generateCalendar(onboarding, nextExams, source, caminoPlanId, selectedWeekStart, {})
    persist(regenerated, nextExams)
    setToast('Camino PAU actualizado')
  }
  function toggleCalendarExpanded() {
    setCalendarExpanded(current => {
      const next = !current
      saveJson(CALENDAR_VISIBILITY_KEY, next)
      return next
    })
  }
  function postponeMission(missionId: string) {
    const dayIndex = calendar.findIndex(day => day.missions.some(mission => mission.id === missionId))
    if (dayIndex < 0 || dayIndex >= calendar.length - 1) return
    const mission = calendar[dayIndex].missions.find(item => item.id === missionId)
    if (!mission) return
    const nextCalendar = calendar.map((day, index) => index === dayIndex ? { ...day, missions: day.missions.filter(item => item.id !== missionId) } : index === dayIndex + 1 ? { ...day, missions: [...day.missions, { ...mission, id: `${day.date}-${mission.role}-postponed-${day.missions.length + 1}` }] } : day)
    persist(nextCalendar); setToast('Misión pospuesta a mañana')
  }
  function resetExamDraft() {
    setEditingExamId(null)
    setShowExamForm(false)
    setExamDraft(current => ({ ...current, block: '', topic: '', name: '', date: toISO(addDays(new Date(), 3)), priority: 'normal' }))
  }
  function openNewExam() { setEditingExamId(null); setShowExamForm(true) }
  function openEditExam(exam: StudentExam) { setEditingExamId(exam.id); setExamDraft({ subject: exam.subject, date: exam.date, block: exam.block ?? '', topic: exam.topic, name: exam.name, priority: exam.priority }); setShowExamForm(true) }
  function saveExam() {
    if (!examDraft.subject || !examDraft.date) return
    const BLOCK_NORMALIZE: Record<string, string> = {
      'álgebra': 'Algebra', 'algebra': 'Algebra',
      'análisis': 'Analisis', 'analisis': 'Analisis',
      'análisis matemático': 'Analisis',
      'geometría': 'Geometria', 'geometria': 'Geometria',
      'probabilidad': 'Probabilidad',
      'probabilidad y estadística': 'Probabilidad',
    }
    const rawBlock = examDraft.block?.toLowerCase().trim() ?? ''
    const normalizedBlock = BLOCK_NORMALIZE[rawBlock] ?? examDraft.block
    const draft = { ...examDraft, block: normalizedBlock }
    const currentEditingId = editingExamId
    const nextExams = currentEditingId
      ? exams.map(exam => exam.id === currentEditingId ? { ...exam, ...draft } : exam)
      : [...exams, { id: `exam-${examDraft.date}-${exams.length + 1}`, ...draft }]
    resetExamDraft()
    regenerate(nextExams)
    const savedExam = currentEditingId
      ? nextExams.find(e => e.id === currentEditingId)
      : nextExams[nextExams.length - 1]
    if (savedExam) {
      supabase.auth.getSession().then(({ data }) => {
        const userId = data.session?.user.id
        if (!userId) return
        injectPartialExamMissions(userId, supabase, savedExam)
      }, () => undefined)
    }
  }
  function deleteExam(id: string) {
    regenerate(exams.filter(exam => exam.id !== id))
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id
      if (!userId) return
      deletePartialExamMissions(userId, supabase, id)
    }, () => undefined)
  }

  async function markNotSeenHero() {
    const mission = todayMain[0]
    if (!mission?.subjectSlug || mission.v2SortOrder == null) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setCalendar(current => current.map(day => ({
      ...day,
      missions: day.missions.filter(m => m.id !== mission.id),
    })))
    try {
      const res = await fetch('/api/camino/postpone-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ subject: mission.subjectSlug, v2SortOrder: mission.v2SortOrder }),
      })
      const json = await res.json()
      setToast(json.warning ? 'Avisamos: tendrás que ver este bloque antes de la PAU.' : 'Tema marcado como no visto en clase.')
    } catch {
      setToast('Error al marcar el tema.')
    }
  }

  if (!hasProfile) return (
    <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="w-full rounded-[32px] border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)]"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700"><Target size={30} /></div><h1 className="text-3xl font-black tracking-tight text-slate-950">Completa tu perfil para que Pausia cree tu Camino PAU.</h1><p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">Usaremos tu comunidad, asignaturas, centro y disponibilidad para generar un calendario semanal sencillo.</p><button onClick={() => router.push('/onboarding')} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">Completar perfil <ArrowRight size={16} /></button></section></main></Shell>
  )

  if (caminoReadyStatus === 'no_queue') return (
    <Shell>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10">
        <section className="w-full rounded-[32px] border border-amber-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <RotateCcw size={30} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Tu Camino PAU aún no está listo</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">Algo fue mal al generar tu plan. Vamos a intentarlo de nuevo.</p>
          <button
            onClick={generateCamino}
            disabled={isGenerating}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] disabled:opacity-60"
          >
            {isGenerating
              ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generando...</>
              : <>Generar mi Camino PAU <ArrowRight size={16} /></>}
          </button>
        </section>
      </main>
    </Shell>
  )

  if (caminoReadyStatus === 'no_future') return (
    <Shell>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10">
        <section className="w-full rounded-[32px] border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(37,99,235,0.10)]">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Preparando tus próximas misiones...</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">Esto solo tarda un momento.</p>
        </section>
      </main>
    </Shell>
  )

  return (
    <Shell>
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU</p><h1 className="text-2xl font-black tracking-tight text-slate-950">Tu semana de estudio</h1></div><div className="flex flex-wrap gap-2"><button onClick={() => setCalendarEditorOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-[0_10px_26px_rgba(37,99,235,0.08)]"><CalendarDays size={16} /> Ver semana</button><button onClick={openNewExam} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition"><Plus size={16} /> Añadir examen</button></div></div></header>
      <main className="mx-auto max-w-7xl px-5 py-6">
        <section className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold leading-6 text-blue-900">
              Estás en la beta privada de Pausia. De momento estamos probando Matemáticas II, Matemáticas CCSS, Lengua e Historia. Tu feedback nos ayuda a mejorar el Camino PAU.
            </p>
            {BETA_FEEDBACK_URL && (
              <a href={BETA_FEEDBACK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-xs font-black text-blue-700 shadow-sm">
                Dar feedback
              </a>
            )}
          </div>
        </section>
        {isRescueMode && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"><p className="text-sm font-black text-amber-800">⚠️ Modo Rescate PAU activado — nos centramos en los temas más importantes para maximizar tu nota.</p></div>}
        <section className="mb-5 grid items-stretch gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col gap-4">
            {upcomingPartial && <PartialExamBanner exam={upcomingPartial} today={realToday} />}
            <div className="flex-1 min-h-0">
              <HeroMissionCard
                mission={todayMain[0] ?? null}
                blockCompleted={blockCompletedCount}
                streak={streak}
                completedThisWeek={completedMain}
                totalThisWeek={Math.min(totalMain, 5)}
                weeklyXP={weeklyXP}
                onPostpone={() => todayMain[0] && postponeMission(todayMain[0].id)}
                onMarkNotSeen={markNotSeenHero}
                hasOnboardingSubjects={hasOnboardingSubjects}
                nextMissionTitle={nextMissionInCalendar?.title ?? null}
                microMission={microMission}
              />
            </div>
            {todayBonus.length > 0 && (
              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Extras opcionales</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Haz primero la misión principal. Los extras son opcionales.</p>
                <div className="mt-3 grid gap-2">
                  {todayBonus.map(mission => <MissionRow key={mission.id} mission={mission} onPostpone={postponeMission} onComplete={completeMission} compact />)}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[28px] border border-blue-100 bg-white px-4 py-4 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Tu objetivo de hoy</p>
              {todayMain[0] ? (
                <>
                  <p className="mt-2 text-xs font-black text-slate-700">Completa esta misión para:</p>
                  <ul className="mt-1.5 grid gap-1">
                    <li className="text-xs font-semibold text-slate-600">• <span className="font-black text-blue-600">+{todayMain[0].baseXP} XP</span></li>
                    <li className="text-xs font-semibold text-slate-600">• {streak > 0 ? 'Mantener tu racha' : 'Empezar una racha'}</li>
                    <li className="text-xs font-semibold text-slate-600">• Avanzar en <span className="font-black text-slate-800">{formatBlockLabel(todayMain[0].blockKey) || todayMain[0].block || todayMain[0].subject}</span></li>
                  </ul>
                </>
              ) : microMission ? (
                <>
                  <p className="mt-2 text-xs font-black text-slate-700">Reto exprés de hoy:</p>
                  <ul className="mt-1.5 grid gap-1">
                    <li className="text-xs font-semibold text-slate-600">• <span className="font-black text-blue-600">5 tarjetas · 3 min</span></li>
                    <li className="text-xs font-semibold text-slate-600">• <span className="font-black text-slate-800">{microMission.subject}</span></li>
                    <li className="text-xs font-semibold text-slate-600">• Sin tocar tu plan de mañana</li>
                  </ul>
                </>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">División</span>
                <span className="rounded-xl px-2 py-0.5 text-[11px] font-bold" style={{ background: division.bg, color: division.text }}>{division.name}</span>
                {caminoPlanId === 'free' && daysSinceReg !== null && (
                  <p className="w-full rounded-xl bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Te quedan {Math.max(0, 7 - daysSinceReg)} días de prueba</p>
                )}
              </div>
            </div>
            <RankingCard open={rankingOpen} setOpen={setRankingOpen} tab={rankingTab} setTab={setRankingTab} rows={rankingTopRows} currentRow={fixedCurrentRow} community={rankingCommunity} totalXP={displayedXP} division={division.name} realUserCount={leaderboard?.realUserCount ?? 1} liga={liga} ligaLoading={ligaLoading} onCreateLiga={createLiga} onJoinLiga={joinLiga} />
          </div>
        </section>

        {(subjectProgress.matematicas_ii != null || subjectProgress.matematicas_ccss != null || subjectProgress.lengua != null || subjectProgress.historia_espana != null) && (
          <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tu avance</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {([
                { subject: 'matematicas_ii', label: 'Matemáticas II', total: 9, color: '#2563eb' },
                { subject: 'matematicas_ccss', label: 'Matemáticas CCSS', total: 6, color: '#7c3aed' },
                { subject: 'lengua', label: 'Lengua', total: 8, color: '#0891b2' },
                { subject: 'historia_espana', label: 'Historia', total: 10, color: '#b45309' },
              ] as const).map(({ subject, label, total, color }) => {
                const done = subjectProgress[subject] ?? 0
                const pct = Math.min(100, Math.round((done / total) * 100))
                return (
                  <div key={subject}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-black text-slate-700">{label}</span>
                      <span className="text-xs font-bold text-slate-400">{done}/{total}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">{pct}% completado</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}
        {filteredProjection && filteredProjection.length > 0 && <NotaProyectadaCard projections={filteredProjection} heroAsignatura={heroAsignatura} />}
        {filteredProjection && filteredProjection.length > 0 && isShareWindow && (
          <section className="mb-5 rounded-[28px] border border-blue-100 bg-white px-5 py-4 shadow-[0_4px_16px_rgba(37,99,235,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">¿Quieres compartir tu progreso?</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">Comparte un resumen semanal con tus padres</p>
              </div>
              <button
                onClick={shareInforme}
                className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.97]"
              >
                Compartir
              </button>
            </div>
          </section>
        )}

        <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tu semana</p>
              <h2 className="text-xl font-black text-slate-950">{selectedWeekLabel}</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">{completedMain} de {totalMain} misiones completadas</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setCalendarEditorOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Pencil size={15} /> Editar</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => goToWeek(weekOffset(selectedWeekStart, -1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"><ChevronLeft size={14} /> Anterior</button>
            <button onClick={goToCurrentWeek} className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700">Esta semana</button>
            <button onClick={() => goToWeek(weekOffset(selectedWeekStart, 1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50">Siguiente <ArrowRight size={14} /></button>
          </div>
          <button onClick={toggleCalendarExpanded} className="mt-3 inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100">
            <ChevronDown className={`transition-transform duration-200${calendarExpanded ? ' rotate-180' : ''}`} size={14} aria-hidden />
            {calendarExpanded ? 'Ocultar' : 'Ver semana'}
          </button>
          {calendarExpanded && <CompactWeekView days={weekCalendar} exams={exams} />}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">Exámenes parciales</h2><p className="text-sm font-semibold text-slate-500">Añade tus próximos exámenes para que Pausia ajuste tu semana.</p></div><button onClick={openNewExam} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Plus size={15} /> Añadir examen</button></div><div className="grid gap-2">{activeExams.length ? activeExams.map(exam => <div key={exam.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{exam.subject} · {exam.topic || exam.name || 'Parcial'}</p><p className="text-xs font-bold text-slate-400">{formatDate(exam.date)} · prioridad {priorityLabel(exam.priority)}</p></div><div className="flex shrink-0 gap-1"><button onClick={() => openEditExam(exam)} className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700" aria-label="Editar examen"><Pencil size={16} /></button><button onClick={() => deleteExam(exam.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar examen"><Trash2 size={16} /></button></div></div>) : <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800">Empieza añadiendo tu próximo examen del instituto.</p>}{pastExams.length > 0 && <div className="mt-2"><button onClick={() => setShowPastExams(v => !v)} className="flex w-full items-center gap-2 py-1.5 text-xs font-black text-slate-400 hover:text-slate-600"><ChevronDown size={13} className={`transition-transform${showPastExams ? ' rotate-180' : ''}`} />Exámenes pasados ({pastExams.length})</button>{showPastExams && <div className="mt-1 grid gap-1">{pastExams.map(exam => <div key={exam.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 opacity-60"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-600">{exam.subject} · {exam.topic || exam.name || 'Parcial'}</p><p className="text-xs font-bold text-slate-400">{formatDate(exam.date)}</p></div><button onClick={() => deleteExam(exam.id)} className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Eliminar examen pasado"><Trash2 size={15} /></button></div>)}</div>}</div>}</div></div>
          <CourseDirectory groups={courseGroups} />
        </section>

        <section className="mt-5" id="acceso-premium">
          <ParentLinkModule billing={{ loading: false, hasActivePack: caminoPlanId !== 'free', activePlans: [], pendingParentCheckout: null }} daysSinceReg={daysSinceReg} />
        </section>
      </main>
      <AnimatePresence>{showExamForm && <ExamModal subjects={onboardingSubjects} draft={examDraft} setDraft={setExamDraft} onClose={resetExamDraft} onSave={saveExam} editing={Boolean(editingExamId)} />}</AnimatePresence>
      <AnimatePresence>{calendarEditorOpen && onboarding && <CalendarEditorOverlay calendar={weekCalendar} weekStartISO={selectedWeekStart} subjects={onboardingSubjects} curriculum={curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM} planId={caminoPlanId} onNavigateWeek={generateWeek} onClose={() => setCalendarEditorOpen(false)} onAddExam={() => { setCalendarEditorOpen(false); openNewExam() }} onSave={(next) => { persist(next); setCalendarEditorOpen(false); setToast('Calendario guardado') }} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} onAnimationComplete={() => setTimeout(() => setToast(null), 1600)} className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</motion.div>}</AnimatePresence>
      <AnimatePresence>{showOnboarding && <CaminoOnboardingModal onClose={() => { window.localStorage.setItem('pausia_camino_onboarding_done', 'true'); setShowOnboarding(false) }} />}</AnimatePresence>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen bg-[#f4f7fb] max-lg:block"><Sidebar activeItem="camino" /><div className="min-w-0 flex-1">{children}</div></div> }

type BlockEntry = { bloque: string; nota_proyectada: number; num_entries: number; avg_max_pts: number | null }
type ProjectionEntry = { asignatura: string; nota_proyectada: number | null; num_entries: number; recent_entries: number; confidence: 'low' | 'medium' | 'high'; trend_7d: number | null; bloques: BlockEntry[] }

function gradeColors(nota: number, confidence: 'low' | 'medium' | 'high'): { text: string; bar: string; bg: string } {
  if (confidence === 'low') return { text: '#64748b', bar: '#94a3b8', bg: '#f8fafc' }
  if (nota >= 7) return { text: '#15803d', bar: '#16a34a', bg: '#f0fdf4' }
  if (nota >= 5) return { text: '#b45309', bar: '#d97706', bg: '#fffbeb' }
  if (nota >= 4) return { text: '#92400e', bar: '#d97706', bg: '#fffbeb' }
  // nota < 4 with medium/high confidence: neutral dark, plan-first layout handles color
  return { text: '#1e293b', bar: '#94a3b8', bg: '#f8fafc' }
}

function planLine(nota: number, bloques: BlockEntry[]): string {
  const weak = bloques.filter(b => b.num_entries >= 1)
  const weakName = weak[0]?.bloque ?? null
  if (nota < 5) {
    const gap = (5 - nota).toFixed(1)
    return weakName
      ? `Estás a ${gap} del aprobado — ${weakName} es donde más puntos puedes recuperar`
      : `Estás a ${gap} puntos del aprobado — practica los ejercicios más flojos`
  }
  if (nota < 7) {
    return weakName
      ? `Vas camino del aprobado — asegura subiendo ${weakName}`
      : 'Vas camino del aprobado — sigue practicando para asegurar la nota'
  }
  return weakName
    ? `Buena proyección — consolida ${weakName} para asegurar la nota`
    : 'Buena proyección — mantén el ritmo y consolida los bloques más difíciles'
}

function NotaProyectadaCard({ projections, heroAsignatura }: { projections: ProjectionEntry[]; heroAsignatura: string | null }) {
  const hero = projections.find(p => p.asignatura === heroAsignatura) ?? projections[0] ?? null
  const rest = projections.filter(p => p !== hero)
  const totalEntries = projections.reduce((s, p) => s + p.num_entries, 0)

  if (!hero) return null

  const heroNota = hero.nota_proyectada
  const heroBloques = hero.bloques ?? []
  const isLowScore = heroNota !== null && hero.confidence !== 'low' && heroNota < 4
  const heroC = heroNota !== null ? gradeColors(heroNota, hero.confidence) : null

  // Steps for plan-first layout (nota < 4)
  const weakSteps = heroBloques.filter(b => b.num_entries >= 1).slice(0, 2)
  const planSteps: string[] = weakSteps.map((b, i) => {
    const pts = b.avg_max_pts !== null ? ` — vale ${b.avg_max_pts.toFixed(1)} pts del examen` : ''
    return `${i + 1}. ${i === 0 ? 'Refuerza' : 'Practica'} ${b.bloque}${pts}`
  })
  planSteps.push(`${planSteps.length + 1}. Mantén tu ritmo de misiones diarias`)

  return (
    <section className="mb-5 rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(16,185,129,0.07)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">Proyección PAU</p>
          <h2 className="text-lg font-black text-slate-950">Nota proyectada</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">Basada en {totalEntries} corrección{totalEntries !== 1 ? 'es' : ''} · se actualiza con cada práctica</p>
        </div>
        <BarChart3 size={20} className="shrink-0 text-emerald-400" />
      </div>

      {/* Hero: priority subject */}
      <div className="mb-3 rounded-2xl border border-slate-100 px-5 py-4" style={{ background: heroC?.bg ?? '#f8fafc' }}>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{subjectLabelFromSlug(hero.asignatura)}</p>

        {hero.confidence === 'low' ? (
          <>
            <p className="text-sm font-black text-slate-500">Aún afinando</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Resuelve {Math.max(1, 3 - hero.recent_entries)} ejercicio{3 - hero.recent_entries !== 1 ? 's' : ''} más para ver tu proyección
            </p>
          </>
        ) : isLowScore && heroNota !== null ? (
          /* Plan-first layout for nota < 4 */
          <>
            <p className="text-base font-black text-slate-800">Tu plan para llegar al 5</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Proyección actual: <span className="font-black text-slate-600">{heroNota.toFixed(1)}/10</span></p>
            <ul className="mt-3 grid gap-1.5">
              {planSteps.map((step, i) => (
                <li key={i} className="text-xs font-semibold text-slate-600">{step}</li>
              ))}
            </ul>
            {/* Neutral bar with aprobado marker */}
            <div className="relative mt-4 h-2 overflow-visible rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-400 transition-all duration-700" style={{ width: `${Math.min(100, (heroNota / 10) * 100)}%` }} />
              {/* aprobado marker at 50% */}
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '50%' }}>
                <div className="h-4 w-0.5 -translate-y-[2px] rounded-full bg-slate-500" />
              </div>
            </div>
            <div className="relative mt-1 h-3">
              <span className="absolute text-[10px] font-black text-slate-400" style={{ left: '50%', transform: 'translateX(-50%)' }}>Aprobado (5)</span>
            </div>
          </>
        ) : heroNota !== null && heroC ? (
          /* Normal layout for nota >= 4 */
          <>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-5xl font-black leading-none" style={{ color: heroC.text }}>{heroNota.toFixed(1)}</span>
              <span className="mb-1 text-xl font-semibold text-slate-400">/10</span>
              {hero.trend_7d !== null && Math.abs(hero.trend_7d) >= 0.1 && (
                <span className={`mb-1 text-sm font-black ${hero.trend_7d > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {hero.trend_7d > 0 ? '▲' : '▼'} {hero.trend_7d > 0 ? '+' : ''}{hero.trend_7d.toFixed(1)} esta semana
                </span>
              )}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (heroNota / 10) * 100)}%`, background: heroC.bar }} />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{planLine(heroNota, heroBloques)}</p>
          </>
        ) : null}
      </div>

      {/* Compact chips for remaining subjects */}
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rest.map(p => {
            const nota = p.nota_proyectada
            const colors = nota !== null && p.confidence !== 'low' ? gradeColors(nota, p.confidence) : null
            return (
              <div key={p.asignatura} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-xs font-black text-slate-600">{subjectLabelFromSlug(p.asignatura)}</span>
                {p.confidence === 'low' ? (
                  <span className="text-[11px] font-semibold text-slate-400">Afinando</span>
                ) : nota !== null && colors ? (
                  <span className="text-[11px] font-black" style={{ color: colors.text }}>{nota.toFixed(1)}/10</span>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CourseDirectory({ groups }: { groups: Array<{ subject: string; blocks: Array<{ block: string; items: CurriculumItem[] }> }> }) {
  const [open, setOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(groups[0]?.subject ?? '')
  const [selectedBlock, setSelectedBlock] = useState(groups[0]?.blocks[0]?.block ?? '')
  const activeGroup = groups.find(group => group.subject === selectedSubject) ?? groups[0]
  const activeBlock = activeGroup?.blocks.find(block => block.block === selectedBlock) ?? activeGroup?.blocks[0]
  return (
    <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Temario guiado</p>
          <h2 className="text-xl font-black text-slate-950">Explorar temas</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Elige asignatura, bloque y tema cuando quieras entrar manualmente a una ruta de aprendizaje.</p>
        </div>
        <button onClick={() => setOpen(value => !value)} className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><BookOpen size={16} /> {open ? 'Cerrar cursos' : 'Ver cursos'}</button>
      </div>
      {groups.length ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <button key={group.subject} onClick={() => { setSelectedSubject(group.subject); setSelectedBlock(group.blocks[0]?.block ?? ''); setOpen(true) }} className="rounded-full border px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5" style={{ borderColor: selectedSubject === group.subject ? themeFor(group.subject).text : themeFor(group.subject).border, background: selectedSubject === group.subject ? themeFor(group.subject).bg : '#ffffff', color: themeFor(group.subject).text }}>
                {group.subject}
              </button>
            ))}
          </div>
          {!open && <p className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800">Tu calendario ya te lleva al tema que toca. Abre cursos sólo cuando quieras buscar manualmente un bloque concreto.</p>}
          {open && activeGroup && (
            <article className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: themeFor(activeGroup.subject).text }} />
                <h3 className="text-base font-black text-slate-900">{activeGroup.subject}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeGroup.blocks.map(block => (
                  <button key={`${activeGroup.subject}-${block.block}`} onClick={() => setSelectedBlock(block.block)} className="rounded-2xl border border-white bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5" style={{ borderColor: activeBlock?.block === block.block ? themeFor(activeGroup.subject).border : '#ffffff' }}>
                    {block.block}
                  </button>
                ))}
              </div>
              {activeBlock && <div className="mt-3 rounded-2xl border border-white bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{activeBlock.block}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeBlock.items.map(item => (
                    <a key={`${item.subjectSlug}-${item.blockSlug}-${item.topicSlug}`} href={courseHrefForItem(item)} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5" style={{ borderColor: themeFor(item.subject).border, background: themeFor(item.subject).bg, color: themeFor(item.subject).text }}>
                      {item.topic}
                      <ArrowRight size={12} />
                    </a>
                  ))}
                </div>
              </div>}
            </article>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800">Completa tus asignaturas para ver el temario guiado.</p>
      )}
    </section>
  )
}

function CalendarEditorOverlay({ calendar, weekStartISO, subjects, curriculum, planId, onNavigateWeek, onClose, onAddExam, onSave }: { calendar: DayPlan[]; weekStartISO: string; subjects: string[]; curriculum: CurriculumItem[]; planId: CaminoPlanId; onNavigateWeek: (weekStartISO: string) => DayPlan[]; onClose: () => void; onAddExam: () => void; onSave: (calendar: DayPlan[]) => void }) {
  const safeSubjects: string[] = subjects
  const [draft, setDraft] = useState<DayPlan[]>(() => calendar.map(day => ({ ...day, missions: day.missions.map(mission => ({ ...mission })) })))
  const [newMission, setNewMission] = useState({ day: calendar[0]?.date ?? todayISO(), subject: safeSubjects[0] ?? 'Matemáticas II', kind: 'concept_explanation' as MissionKind, topic: '', minutes: 15, bonus: false })
  const [draggedMissionId, setDraggedMissionId] = useState<string | null>(null)
  const [editorNotice, setEditorNotice] = useState('')
  const [editorWeekStart, setEditorWeekStart] = useState(weekStartISO)
  const [missionPanelOpen, setMissionPanelOpen] = useState(false)
  const topics = curriculumForSubject(newMission.subject, curriculum)
  const orderedDraft = draft.slice().sort((a, b) => a.date.localeCompare(b.date))
  const mainMissionCount = orderedDraft.reduce((total, day) => total + day.missions.filter(mission => mission.role === 'main').length, 0)
  const bonusMissions = orderedDraft.flatMap(day => day.missions.filter(mission => mission.role === 'bonus').map(mission => ({ mission, day })))

  function cloneWeek(days: DayPlan[]) {
    return days.map(day => ({ ...day, missions: day.missions.map(mission => ({ ...mission })) }))
  }

  function navigateEditorWeek(nextWeekStart: string) {
    const nextWeek = onNavigateWeek(nextWeekStart)
    const nextDraft = cloneWeek(nextWeek)
    setEditorWeekStart(nextWeekStart)
    setDraft(nextDraft)
    setNewMission(current => ({ ...current, day: nextDraft[0]?.date ?? nextWeekStart }))
    setDraggedMissionId(null)
  }

  function moveMission(missionId: string, nextDate: string) {
    const sourceDay = draft.find(day => day.missions.some(mission => mission.id === missionId))
    const mission = sourceDay?.missions.find(item => item.id === missionId)
    if (!sourceDay || !mission || sourceDay.date === nextDate) return
    setDraft(current => current.map(day => {
      if (day.date === sourceDay.date) return { ...day, missions: day.missions.filter(item => item.id !== missionId) }
      if (day.date === nextDate) return { ...day, missions: [...day.missions, mission] }
      return day
    }))
  }

  function updateMission(missionId: string, patch: Partial<Mission>) {
    setDraft(current => current.map(day => ({ ...day, missions: day.missions.map(mission => {
      if (mission.id !== missionId) return mission
      const next = { ...mission, ...patch }
      return { ...next, ...missionMeta(next.kind, next.subject, next.topic, next.block) }
    }) })))
  }

  function deleteMission(missionId: string) {
    setDraft(current => current.map(day => ({ ...day, missions: day.missions.filter(mission => mission.id !== missionId) })))
  }

  function addMission() {
    if (!newMission.subject) return
    const item = topics.find(topic => topic.topic === newMission.topic) ?? topics[0]
    const subject = newMission.subject
    const topic = item?.topic ?? newMission.topic
    const cache: CalendarWeekCache = { [calendar[0]?.date ?? currentWeekStartISO()]: draft }
    const requestedKind = newMission.kind
    const kind = requestedKind === 'mock_exam' && !canScheduleSimulation(null, planId, newMission.day, cache)
      ? 'evau_practice'
      : requestedKind
    if (requestedKind === 'mock_exam' && kind !== 'mock_exam') setEditorNotice('Has alcanzado el límite de simulacros de tu plan este mes. Te proponemos ejercicios PAU del mismo tema.')
    const mission: Mission = {
      id: `${newMission.day}-${newMission.bonus ? 'bonus' : 'main'}-manual-${draft.reduce((total, day) => total + day.missions.length, 0) + 1}`,
      role: newMission.bonus ? 'bonus' : 'main',
      kind,
      subject,
      block: item?.block,
      topic,
      title: titleFor(kind, subject, item ?? undefined),
      reason: requestedKind === 'mock_exam' && kind !== 'mock_exam' ? 'Simulacro sustituido por límite mensual: práctica PAU del mismo tema.' : item ? `${item.block} · añadida por el alumno.` : 'Añadida manualmente por el alumno.',
      ...missionMeta(kind, subject, topic, item?.block, item?.planTopic),
      estimatedMinutes: newMission.minutes,
      baseXP: newMission.bonus ? 12 : kind === 'mock_exam' ? 35 : kind === 'evau_practice' ? 25 : 15,
      status: 'pending',
    }
    setDraft(current => current.map(day => day.date === newMission.day ? { ...day, missions: [...day.missions, mission] } : day))
  }

  const kindOptions: Array<{ value: MissionKind; label: string }> = [
    { value: 'concept_explanation', label: 'Explicación' },
    { value: 'guided_practice', label: 'Ejercicio guiado' },
    { value: 'evau_practice', label: 'Ejercicio PAU' },
    { value: 'mock_exam', label: 'Simulacro' },
  ]

  async function handleSave() {
    onSave(draft)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return
      const rows = draft.flatMap(day =>
        day.missions
          .filter(m => m.calendarRowId)
          .map(m => ({
            id: m.calendarRowId!,
            scheduled_date: day.date,
            is_main: m.role === 'main',
            is_bonus: m.role !== 'main',
            title: m.title,
            source: 'manual',
            is_locked: true,
          }))
      )
      for (const { id, ...fields } of rows) {
        supabase.from('camino_calendar').update(fields).eq('id', id).then(() => {}, () => {})
      }
    } catch { /* silent */ }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-0 right-0 top-0 z-50 bg-slate-950/20 p-3 backdrop-blur-sm max-lg:left-0 sm:p-4 lg:left-[248px]">
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-2xl">
        <header className="shrink-0 border-b border-blue-100 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Editar calendario</p>
              <h2 className="text-xl font-black text-slate-950">Ajusta tu semana</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Mueve misiones entre días. Pausia respetará tus cambios manuales al guardar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={onAddExam} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Plus size={15} /> Añadir parcial</button>
              <button onClick={() => setMissionPanelOpen(current => !current)} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-[0_6px_18px_rgba(37,99,235,0.18)]"><Plus size={15} /> Añadir misión</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => navigateEditorWeek(weekOffset(editorWeekStart, -1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"><ChevronLeft size={14} /> Semana anterior</button>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700">{weekRangeLabel(editorWeekStart)}</div>
            <button onClick={() => navigateEditorWeek(currentWeekStartISO())} className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"><RotateCcw size={14} /> Hoy</button>
            <button onClick={() => navigateEditorWeek(weekOffset(editorWeekStart, 1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50">Semana siguiente <ArrowRight size={14} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-white to-blue-50/40 p-4 sm:p-5">
          {editorNotice && <p className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">{editorNotice}</p>}

          {missionPanelOpen && (
            <aside className="mb-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_12px_34px_rgba(37,99,235,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-950">Añadir misión</h3>
                <button onClick={() => setMissionPanelOpen(false)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500">Cerrar</button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <Field label="Día"><select value={newMission.day} onChange={event => setNewMission({ ...newMission, day: event.target.value })} className="inputish">{orderedDraft.map(day => <option key={day.date} value={day.date}>{day.label}</option>)}</select></Field>
                <Field label="Asignatura"><select value={newMission.subject} onChange={event => setNewMission({ ...newMission, subject: event.target.value, topic: '' })} className="inputish">{safeSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field>
                <Field label="Tema"><select value={newMission.topic} onChange={event => setNewMission({ ...newMission, topic: event.target.value })} className="inputish"><option value="">Sugerido</option>{topics.map(topic => <option key={`${topic.subject}-${topic.sortOrder}`} value={topic.topic}>{topic.block} · {topic.topic}</option>)}</select></Field>
                <Field label="Tipo"><select value={newMission.kind} onChange={event => setNewMission({ ...newMission, kind: event.target.value as MissionKind })} className="inputish">{kindOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
                <Field label="Duración"><input type="number" min={5} max={90} value={newMission.minutes} onChange={event => setNewMission({ ...newMission, minutes: Number(event.target.value) })} className="inputish" /></Field>
                <div className="flex items-end">
                  <button onClick={addMission} disabled={!safeSubjects.length} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> Añadir</button>
                </div>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm font-black text-slate-600"><input type="checkbox" checked={newMission.bonus} onChange={event => setNewMission({ ...newMission, bonus: event.target.checked })} /> Opcional / bonus</label>
            </aside>
          )}

          <section className="min-w-0 overflow-x-auto rounded-[28px] border border-blue-100 bg-white shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
            <div className="grid min-w-[980px] grid-cols-7 divide-x divide-blue-100">
              {orderedDraft.map(day => {
                const mainMissions = day.missions.filter(mission => mission.role === 'main')
                return (
                  <article
                    key={day.date}
                    onDragOver={event => event.preventDefault()}
                    onDrop={event => { event.preventDefault(); if (draggedMissionId) moveMission(draggedMissionId, day.date); setDraggedMissionId(null) }}
                    className={`min-h-[430px] bg-white ${day.isToday ? 'ring-2 ring-inset ring-blue-300' : ''}`}
                  >
                    <div className="sticky top-0 z-10 border-b border-blue-100 bg-white/95 px-3 py-3 backdrop-blur">
                      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{day.label.split(' ')[0]}</h3>
                      <p className="mt-1 text-sm font-black text-slate-950">{day.label.replace(day.label.split(' ')[0], '').trim()}</p>
                    </div>
                    <div className="grid gap-2 p-2.5">
                      {mainMissions.length ? mainMissions.map(mission => {
                        const theme = themeFor(mission.subject)
                        return (
                          <div key={mission.id} draggable onDragStart={() => setDraggedMissionId(mission.id)} onDragEnd={() => setDraggedMissionId(null)} className="group min-w-0 rounded-2xl border bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: theme.border }}>
                            <div className="flex items-start gap-2">
                              <button type="button" aria-label="Arrastrar para mover" className="cursor-grab rounded-lg p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"><GripVertical size={13} /></button>
                              <div className="min-w-0 flex-1">
                                <span className="inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: theme.bg, color: theme.text }}>{mission.subject}</span>
                                <p className="mt-1 line-clamp-3 text-xs font-black leading-snug text-slate-800">{mission.title}</p>
                                <p className="mt-1 text-[10px] font-semibold text-slate-400">{mission.estimatedMinutes} min · {mission.kind}</p>
                                <select value={day.date} onChange={event => moveMission(mission.id, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-500 sm:hidden">
                                  {orderedDraft.map(optionDay => <option key={optionDay.date} value={optionDay.date}>Mover a {optionDay.label}</option>)}
                                </select>
                              </div>
                              <div className="flex shrink-0 flex-col gap-1">
                                <button type="button" onClick={() => updateMission(mission.id, { role: 'bonus' })} aria-label="Mover a bonus" className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-violet-50 hover:text-violet-500"><Bookmark size={13} /></button>
                                <button type="button" onClick={() => deleteMission(mission.id)} aria-label="Eliminar misión" className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                              </div>
                            </div>
                          </div>
                        )
                      }) : <p className="rounded-2xl border border-dashed border-blue-100 bg-blue-50/50 px-3 py-4 text-center text-[11px] font-bold text-slate-400">Sin misiones. Arrastra aquí.</p>}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-violet-100 bg-white p-4 shadow-[0_12px_34px_rgba(124,58,237,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-500">Misiones extra / bonus</p>
                <h3 className="text-base font-black text-slate-950">Opcionales para sumar ritmo sin romper el plan</h3>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-600">{bonusMissions.length} bonus</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {bonusMissions.length ? bonusMissions.map(({ mission, day }) => {
                const theme = themeFor(mission.subject)
                return (
                  <div key={mission.id} draggable onDragStart={() => setDraggedMissionId(mission.id)} onDragEnd={() => setDraggedMissionId(null)} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3">
                    <div className="flex items-start gap-2">
                      <button type="button" aria-label="Arrastrar para mover bonus" className="cursor-grab rounded-lg p-1.5 text-violet-300 hover:bg-white hover:text-violet-500"><GripVertical size={13} /></button>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: theme.bg, color: theme.text }}>{mission.subject}</span>
                        <p className="mt-1 line-clamp-2 text-xs font-black leading-snug text-slate-800">{mission.title}</p>
                        <p className="mt-1 text-[10px] font-semibold text-violet-500">{day.label} · {mission.estimatedMinutes} min</p>
                        <select value={day.date} onChange={event => moveMission(mission.id, event.target.value)} className="mt-2 w-full rounded-xl border border-violet-100 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-500">
                          {orderedDraft.map(optionDay => <option key={optionDay.date} value={optionDay.date}>Mover a {optionDay.label}</option>)}
                        </select>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button type="button" onClick={() => updateMission(mission.id, { role: 'main' })} aria-label="Hacer principal" className="rounded-lg p-1.5 text-violet-500 transition-colors hover:bg-white"><Bookmark size={13} className="fill-violet-400" /></button>
                        <button type="button" onClick={() => deleteMission(mission.id)} aria-label="Eliminar misión bonus" className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                )
              }) : <p className="rounded-2xl border border-dashed border-violet-100 bg-violet-50/50 px-4 py-4 text-sm font-bold text-violet-500">No hay bonus opcionales esta semana.</p>}
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-blue-100 bg-white px-5 py-4">
          <p className="text-xs font-bold text-slate-400">{mainMissionCount} misiones principales · {bonusMissions.length} bonus opcionales</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-500">Cancelar</button>
            <button onClick={handleSave} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_6px_20px_rgba(37,99,235,0.20)] transition hover:bg-blue-700">Guardar cambios</button>
          </div>
        </footer>

        <style>{`.inputish{width:100%;border-radius:14px;border:1px solid #dbe7fb;background:#f8fbff;padding:11px 12px;font-size:14px;font-weight:700;color:#334155;outline:none}.inputish:focus{border-color:#93c5fd;background:white}`}</style>
      </motion.section>
    </motion.div>
  )
}

function formatBlockLabel(blockKey?: string): string {
  if (!blockKey) return ''
  return blockKey.replace(/^bloque-\d+-/, '').replace(/-/g, ' ')
}

function heroReason(mission: Mission, blockCompleted: number, nextMissionTitle?: string | null): string {
  if (mission.missionType === 'comment_text') {
    return 'Práctica de técnica PAU. Aparece periódicamente para que domines el comentario de texto antes del examen.'
  }
  if (mission.metadata?.plan_mode === 'rescue') {
    return 'Modo Rescate: priorizamos este tema por su peso específico en la PAU.'
  }
  if (mission.metadata?.express) {
    return 'Repaso rápido antes de entrar en materia nueva.'
  }
  const blockName = formatBlockLabel(mission.blockKey) || 'este bloque'
  if (nextMissionTitle) {
    return `Hoy refuerzas una idea clave de ${blockName}. Cuando lo entiendas, "${nextMissionTitle}" te resultará mucho más fácil.`
  }
  if (blockCompleted === 0) {
    return `Empezamos por ${blockName}. Completar esta misión desbloquea las siguientes.`
  }
  return `Sigues avanzando en ${blockName}. Llevas ${blockCompleted} misión${blockCompleted !== 1 ? 'es' : ''} completada${blockCompleted !== 1 ? 's' : ''} en este bloque.`
}

function HeroMissionCard({ mission, blockCompleted, streak, completedThisWeek, totalThisWeek, weeklyXP, onPostpone, onMarkNotSeen, hasOnboardingSubjects, nextMissionTitle, microMission }: {
  mission: Mission | null
  blockCompleted: number
  streak: number
  completedThisWeek: number
  totalThisWeek: number
  weeklyXP: number
  onPostpone: () => void
  onMarkNotSeen: () => void
  hasOnboardingSubjects: boolean
  nextMissionTitle?: string | null
  microMission?: { subject: string; subjectSlug: string; topic: string; href: string; hasCompletedItems: boolean } | null
}) {
  const [showNotSeenConfirm, setShowNotSeenConfirm] = useState(false)
  const [microDone, setMicroDone] = useState(false)
  const theme = mission ? themeFor(mission.subject) : { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
  const subjectUpper = (mission?.subject ?? '').toUpperCase()
  const blockLabel = formatBlockLabel(mission?.blockKey).toUpperCase()
  const headerParts = ['CAMINO PAU', subjectUpper, blockLabel].filter(Boolean)
  const target = mission ? hrefForMission(mission) : null
  const reason = mission ? heroReason(mission, blockCompleted, nextMissionTitle) : null

  return (
    <div className="h-full rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{headerParts.join(' · ')}</p>

      {mission ? (
        <>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">{mission.title}</h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-400">
            <span>{mission.estimatedMinutes} min · Misión principal</span>
            {!!mission.metadata?.express && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-700">⚡ Repaso Express</span>}
          </p>

          {reason && (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">{reason}</p>
            </div>
          )}

          <div className="mt-5">
            {mission.status === 'done' ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-black text-emerald-700"><Check size={15} /> Misión completada hoy</div>
            ) : target?.href ? (
              <a href={target.href} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">Empezar misión <ArrowRight size={15} /></a>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-black text-slate-400">Contenido en preparación</div>
            )}
          </div>

          {mission.status !== 'done' && (
            <div className="mt-3 flex justify-center gap-3">
              <button onClick={onPostpone} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50"><RotateCcw size={12} /> Posponer</button>
              {mission.subjectSlug && mission.v2SortOrder != null && (
                <button onClick={() => setShowNotSeenConfirm(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50">Aún no lo he dado</button>
              )}
            </div>
          )}
        </>
      ) : hasOnboardingSubjects && microMission ? (
        <div className="mt-4">
          {microDone ? (
            <>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <Check size={16} className="text-emerald-600" />
                <p className="text-sm font-black text-emerald-800">¡Reto completado! Vuelve mañana para tu próxima misión.</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-slate-950">Reto exprés de hoy</h2>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-400">
                <span>{microMission.subject}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700">5 tarjetas · 3 min</span>
              </p>
              {microMission.hasCompletedItems && (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-600">Repaso de contenido que ya has visto. Sin afectar tu plan de mañana.</p>
                </div>
              )}
              <div className="mt-5">
                <a
                  href={microMission.href}
                  onClick={() => setMicroDone(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
                >
                  Empezar reto <ArrowRight size={15} />
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {hasOnboardingSubjects ? (
            <>
              <h2 className="text-xl font-black text-slate-950">Explora tu primer tema</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">Tu plan aún está generándose. Mientras tanto, empieza a explorar.</p>
              <div className="mt-5">
                <a href="#explorar" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
                  Ver temas disponibles <ArrowRight size={15} />
                </a>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-slate-400">Completa tu onboarding para empezar</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">Configura tu perfil y construiremos tu Camino PAU.</p>
            </>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{streak > 0 ? `🔥 ${streak}` : '—'}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{streak > 0 ? 'días de racha' : 'Empieza tu racha hoy'}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{completedThisWeek}<span className="text-sm font-semibold text-slate-400">/{totalThisWeek}</span></p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">misiones esta semana</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{weeklyXP > 0 ? `+${weeklyXP}` : '—'}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{weeklyXP > 0 ? 'XP esta semana' : 'Gana XP al completar'}</p>
        </div>
      </div>

      <AnimatePresence>
        {showNotSeenConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }} className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-black text-slate-950">¿Aún no lo has dado en clase?</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">Lo guardamos para más adelante. Hoy te daremos una alternativa para que no pierdas el ritmo.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowNotSeenConfirm(false)} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-500">Cancelar</button>
                <button onClick={() => { setShowNotSeenConfirm(false); onMarkNotSeen() }} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white">Confirmar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function shortSubjectLabel(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('matemát')) return 'Mates'
  if (s.includes('historia')) return 'Historia'
  if (s.includes('inglés') || s.includes('ingles')) return 'Inglés'
  if (s.includes('física') || s.includes('fisica')) return 'Física'
  if (s.includes('química') || s.includes('quimica')) return 'Química'
  if (s.includes('biolog')) return 'Bio'
  return subject.split(' ')[0]
}

function compactDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).replace('.', '')
}

const PARTIAL_SIM_SUBJECT: Record<string, string> = {
  matematicas_ii: 'mates', matematicas_ccss: 'matematicas_ccss', historia_espana: 'historia',
  fisica: 'fisica', quimica: 'quimica', biologia: 'biologia', ingles: 'ingles', lengua: 'lengua',
}
const PARTIAL_BLOCK_DISPLAY: Record<string, string> = {
  Algebra: 'Álgebra', Analisis: 'Análisis', Geometria: 'Geometría', Probabilidad: 'Probabilidad',
}

function PartialExamBanner({ exam, today }: { exam: StudentExam; today: string }) {
  const daysDiff = Math.round(
    (new Date(exam.date + 'T12:00:00Z').getTime() - new Date(today + 'T12:00:00Z').getTime()) / 86400000
  )
  const subjectSlug = SUBJECT_SLUGS[exam.subject] ?? exam.subject
  const simSubject = PARTIAL_SIM_SUBJECT[subjectSlug] ?? subjectSlug
  const blockDisplay = exam.block ? (PARTIAL_BLOCK_DISPLAY[exam.block] ?? exam.block) : ''
  const href = exam.block
    ? `/simulacros/practica/nueva?subject=${simSubject}&block=${encodeURIComponent(exam.block)}&source=camino_partial`
    : `/simulacros/practica/nueva?subject=${simSubject}&source=camino_partial`

  if (daysDiff === 0) {
    return (
      <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-base font-black text-amber-900">¡Hoy es tu parcial de {exam.subject}!</p>
        <p className="mt-1 text-sm font-semibold text-amber-700">Ya has preparado todo lo necesario. ¡Mucho ánimo!</p>
      </div>
    )
  }

  return (
    <div className="rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-[0_8px_24px_rgba(251,146,60,0.10)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-600">Próximo parcial</p>
          <p className="mt-1 text-base font-black text-slate-900">
            {daysDiff === 1 ? 'Mañana' : `En ${daysDiff} días`}
            {exam.subject ? ` · ${exam.subject}` : ''}
            {blockDisplay ? ` · ${blockDisplay}` : ''}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Pausia ha ajustado esta semana para que llegues preparado.
          </p>
        </div>
        <a
          href={href}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_4px_12px_rgba(245,158,11,0.30)] transition hover:-translate-y-0.5 hover:bg-amber-600"
        >
          Empezar práctica <ArrowRight size={14} />
        </a>
      </div>
    </div>
  )
}

function CompactWeekView({ days, exams }: { days: DayPlan[]; exams: StudentExam[] }) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  return (
    <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
      {days.map(day => {
        const main = day.missions.filter(m => m.role === 'main')
        const done = main.length > 0 && main.every(m => m.status === 'done')
        const subjects = [...new Set(main.map(m => m.subject))]
        const subjectLabel = subjects.length ? subjects.map(shortSubjectLabel).join(', ') : 'Repaso libre'
        const missionCount = main.length
        const isExpanded = expandedDate === day.date
        const isToday = day.isToday
        return (
          <div key={day.date}>
            <button
              onClick={() => setExpandedDate(isExpanded ? null : day.date)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${isToday ? 'bg-blue-50/60' : 'bg-white'}`}
            >
              <span className={`flex w-24 shrink-0 items-center gap-1.5 text-xs font-black capitalize ${isToday ? 'text-blue-700' : 'text-slate-500'}`}>
                {compactDayLabel(day.date)}
                {isToday && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-label="Hoy" />}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-700">{subjectLabel}</span>
              {isToday && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">Hoy</span>}
              {main.some(m => m.missionType === 'partial_practice') && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">Prep. parcial</span>
              )}
              <span className={`shrink-0 text-xs font-bold ${done ? 'text-emerald-600' : missionCount === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                {done ? '✅ Hecho' : missionCount === 0 ? 'Repaso libre' : `${missionCount} misión${missionCount !== 1 ? 'es' : ''}`}
              </span>
              <ChevronDown size={13} className={`shrink-0 text-slate-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                <DayCard day={day} exams={exams.filter(e => e.date === day.date)} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function WeeklyGoalCard({ completed, target }: { completed: number; target: number }) {
  const [open, setOpen] = useState(false)
  const remaining = Math.max(0, target - completed)
  return (
    <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-lg font-black text-slate-950">Ranking y divisiones</span>
          <span className="mt-1 block text-sm font-semibold text-slate-500">Consulta tu posición cuando quieras.</span>
        </span>
        <ChevronDown className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-5 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-800">Tu objetivo semanal</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {remaining === 0 ? '¡Has completado tu objetivo de la semana! 🎉' : `Completa ${remaining} misión${remaining !== 1 ? 'es' : ''} más esta semana.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MissionRow({ mission, onPostpone, onComplete, compact = false }: { mission: Mission; onPostpone: (id: string) => void; onComplete?: (mission: Mission) => void; compact?: boolean }) {
  const theme = themeFor(mission.subject)
  const target = hrefForMission(mission)
  return <div className={`rounded-2xl border p-4 ${mission.status === 'done' ? 'bg-emerald-50 border-emerald-100' : 'bg-white'}`} style={{ borderColor: mission.status === 'done' ? '#bbf7d0' : theme.border }}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: theme.bg, color: theme.text }}>{mission.subject}</span><span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400"><Clock3 size={12} /> {mission.estimatedMinutes} min</span>{mission.block && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">{mission.block}</span>}{mission.role === 'bonus' && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">Bonus</span>}{!!mission.metadata?.express && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">⚡ Repaso Express</span>}</div><h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-slate-900`}>{mission.title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{mission.reason}</p>{target.fallback && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">Todavía no hemos preparado este contenido.</p>}</div><div className="flex shrink-0 flex-wrap gap-2">{mission.status === 'done' ? <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><Check size={13} /> Completada</span> : target.href ? <a href={target.href} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">Ir a practicar <ArrowRight size={13} /></a> : <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-400">Sin pantalla</span>}{mission.status !== 'done' && mission.calendarRowId && onComplete && <button onClick={() => onComplete(mission)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><Check size={13} /> Hecha</button>}{mission.status !== 'done' && mission.role === 'main' && <button onClick={() => onPostpone(mission.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500"><RotateCcw size={13} /> Posponer</button>}</div></div></div>
}

function DayCard({ day, exams }: { day: DayPlan; exams: StudentExam[] }) {
  const main = day.missions.filter(mission => mission.role === 'main')
  const done = main.length > 0 && main.every(mission => mission.status === 'done')
  return <article className={`min-h-[210px] rounded-3xl border p-3 ${day.isToday ? 'border-blue-300 bg-blue-50/70' : 'border-slate-100 bg-slate-50/80'}`}><div className="mb-3 flex items-center justify-between"><h3 className={`text-sm font-black capitalize ${day.isToday ? 'text-blue-800' : 'text-slate-900'}`}>{day.label}</h3><div className="flex items-center gap-1.5">{day.isToday && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">Hoy</span>}{done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">Hecho</span>}</div></div>{exams.map(exam => <p key={exam.id} className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800">Parcial: {exam.subject} · {exam.block || exam.topic || priorityLabel(exam.priority)}</p>)}<div className="grid gap-2">{main.length ? main.map(mission => { const target = hrefForMission(mission); const content = <><p className="text-[11px] font-black" style={{ color: themeFor(mission.subject).text }}>{mission.subject}{mission.topic ? ` · ${mission.topic}` : ''}</p>{mission.missionType === 'partial_practice' && <span className="mb-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">Prep. parcial</span>}<p className="mt-1 text-xs font-bold text-slate-700">{mission.title}</p><p className="mt-2 text-[11px] font-bold text-slate-400">{mission.status === 'done' ? 'Completada' : target.href ? 'Ir a practicar' : 'Todavía no hemos preparado este contenido.'}</p></>; return target.href ? <a key={mission.id} href={target.href} className="rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5" style={{ borderColor: themeFor(mission.subject).border }}>{content}</a> : <div key={mission.id} className="rounded-2xl border bg-white p-3 text-left" style={{ borderColor: themeFor(mission.subject).border }}>{content}</div> }) : <p className="text-xs font-semibold text-slate-400">Descanso o repaso libre.</p>}</div></article>
}

function ExamModal({ subjects, draft, setDraft, onClose, onSave, editing }: { subjects: string[]; draft: { subject: string; date: string; block: string; topic: string; name: string; priority: ExamPriority }; setDraft: (draft: { subject: string; date: string; block: string; topic: string; name: string; priority: ExamPriority }) => void; onClose: () => void; onSave: () => void; editing: boolean }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm"><motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><h2 className="text-xl font-black text-slate-950">{editing ? 'Editar examen parcial' : 'Añadir examen parcial'}</h2><p className="mt-1 text-sm font-semibold text-slate-500">Si tienes un parcial cerca, Camino PAU priorizará bloque, tema y ejercicios reales.</p><div className="mt-5 grid gap-3"><Field label="Asignatura"><select value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} className="inputish">{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field><Field label="Fecha"><input type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} className="inputish" /></Field><Field label="Bloque"><input value={draft.block} onChange={event => setDraft({ ...draft, block: event.target.value })} placeholder="Álgebra, Análisis, Probabilidad..." className="inputish" /></Field><Field label="Tema opcional"><input value={draft.topic} onChange={event => setDraft({ ...draft, topic: event.target.value })} placeholder="Sistemas/Gauss, Derivadas, Writing..." className="inputish" /></Field><Field label="Nombre opcional"><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Parcial 1" className="inputish" /></Field><Field label="Prioridad"><select value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value as ExamPriority })} className="inputish"><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="muy_alta">Muy alta</option></select></Field></div><style>{`.inputish{width:100%;border-radius:14px;border:1px solid #dbe7fb;background:#f8fbff;padding:11px 12px;font-size:14px;font-weight:700;color:#334155;outline:none}.inputish:focus{border-color:#93c5fd;background:white}`}</style><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-500">Cancelar</button><button onClick={onSave} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white">{editing ? 'Guardar cambios' : 'Guardar examen'}</button></div></motion.div></motion.div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>{children}</label> }

function RankingCard({ open, setOpen, tab, setTab, rows, currentRow, community, totalXP, division, realUserCount, liga, ligaLoading, onCreateLiga, onJoinLiga }: { open: boolean; setOpen: (open: boolean) => void; tab: 'global' | 'community'; setTab: (tab: 'global' | 'community') => void; rows: RankingEntry[]; currentRow: RankingEntry | null; community: string; totalXP: number; division: string; realUserCount: number; liga: LigaInfo | null; ligaLoading: boolean; onCreateLiga: (nombre: string) => Promise<{ error?: string }>; onJoinLiga: (codigo: string) => Promise<{ error?: string }> }) {
  const hasEnoughUsers = realUserCount >= 3
  const visibleRows = tab === 'community' ? rows.filter(row => row.community === community) : rows

  return (
    <div className="flex flex-1 flex-col rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
      <p className="text-base font-black text-slate-950">Ranking y divisiones</p>
      <div className="mt-4 grid gap-4">
        {/* División + XP compacto */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">División actual</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">{division}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">XP total</p>
            <p className="mt-0.5 text-sm font-black text-blue-700">{totalXP.toLocaleString('es-ES')} XP</p>
          </div>
        </div>

        {/* Ranking real o empty state */}
        {hasEnoughUsers ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                {tab === 'community' && community !== 'Sin comunidad' ? `Ranking · ${community}` : 'Ranking global'}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setTab('global')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'global' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Global</button>
                <button onClick={() => setTab('community')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'community' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Comunidad</button>
              </div>
            </div>
            {tab === 'community' && community === 'Sin comunidad' ? (
              <p className="text-sm font-semibold text-slate-400">Completa tu perfil con tu comunidad autónoma para ver el ranking local.</p>
            ) : visibleRows.length ? (
              <div className="grid gap-1.5">
                {visibleRows.slice(0, 3).map(row => <RankingRow key={row.id} row={row} />)}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400">Sin datos por ahora.</p>
            )}
            {currentRow && !visibleRows.slice(0, 3).some(r => r.isCurrentUser) && (
              <>
                <div className="my-3 h-px bg-blue-100" />
                <RankingRow row={currentRow} fixed />
              </>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-500">Aún no hay suficientes alumnos activos para mostrar un ranking real.</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {totalXP === 0 ? 'Empieza completando tu primera misión para sumar XP.' : 'Completa misiones esta semana para seguir sumando XP.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
function RankingRow({ row, fixed = false }: { row: RankingEntry; fixed?: boolean }) {
  const rowDivision = divisionFor(row.xp)
  const podium = row.rank <= 3
  return <div className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${row.isCurrentUser ? 'border border-blue-200 bg-blue-50 shadow-sm' : podium ? 'bg-white shadow-sm' : 'bg-white/70'} ${fixed ? 'ring-1 ring-blue-100' : ''}`}><span className="min-w-0 text-sm font-black text-slate-800"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black" style={{ background: podium ? rowDivision.bg : '#f1f5f9', color: podium ? rowDivision.text : '#64748b' }}>{podium ? <Medal size={14} /> : `#${row.rank}`}</span>{row.name}{row.isMock && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">demo</span>}</span><span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: rowDivision.bg, color: rowDivision.text }}>{rowDivision.name}</span><span className="shrink-0 text-xs font-black text-blue-700">{row.xp.toLocaleString('es-ES')} XP</span></div>
}
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-white p-3"><div className="mb-1 flex items-center gap-1.5 text-blue-700">{icon}<span className="text-[10px] font-black uppercase tracking-[0.12em]">{label}</span></div><p className="text-sm font-black text-slate-900">{value}</p></div> }

function LigaSection({ liga, loading, onCreateLiga, onJoinLiga }: { liga: LigaInfo | null; loading: boolean; onCreateLiga: (nombre: string) => Promise<{ error?: string }>; onJoinLiga: (codigo: string) => Promise<{ error?: string }> }) {
  const [mode, setMode] = useState<'idle' | 'creating' | 'joining'>('idle')
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (!nombre.trim()) return
    setBusy(true); setErr(null)
    const result = await onCreateLiga(nombre.trim())
    setBusy(false)
    if (result.error) { setErr(result.error); return }
    setMode('idle'); setNombre('')
  }

  async function handleJoin() {
    if (!codigo.trim()) return
    setBusy(true); setErr(null)
    const result = await onJoinLiga(codigo.trim())
    setBusy(false)
    if (result.error) { setErr(result.error); return }
    setMode('idle'); setCodigo('')
  }

  function copyLink() {
    if (!liga) return
    navigator.clipboard.writeText(`${window.location.origin}/liga/${liga.codigo}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="text-xs font-bold text-slate-400">Cargando liga…</p>

  if (liga) return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Mi liga</p>
          <h3 className="text-sm font-black text-slate-950">{liga.nombre}</h3>
        </div>
        <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700 transition hover:bg-blue-100">
          {copied ? '✓ Copiado' : 'Compartir liga'}
        </button>
      </div>
      <div className="grid gap-1.5">
        {liga.miembros.map(m => (
          <div key={m.user_id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2" style={{ background: m.name === 'Tú' ? '#eff6ff' : '#fff', border: m.name === 'Tú' ? '1px solid #bfdbfe' : '1px solid #f1f5f9' }}>
            <span className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black" style={{ background: m.rank <= 3 ? '#eff6ff' : '#f1f5f9', color: m.rank <= 3 ? '#1d4ed8' : '#64748b' }}>
                {m.rank <= 3 ? <Medal size={11} /> : m.rank}
              </span>
              {m.name}
            </span>
            <span className="text-[11px] font-bold text-blue-700 shrink-0">{m.weekly_xp} XP sem.</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (mode === 'idle') return (
    <div>
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Mi liga</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setMode('creating'); setErr(null) }} className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100">
          + Crear liga
        </button>
        <button onClick={() => { setMode('joining'); setErr(null) }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
          Unirme a una liga
        </button>
      </div>
    </div>
  )

  if (mode === 'creating') return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Crear liga</p>
      <div className="flex gap-2">
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la liga" maxLength={40} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
        <button onClick={handleCreate} disabled={busy || !nombre.trim()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{busy ? '…' : 'Crear'}</button>
        <button onClick={() => { setMode('idle'); setErr(null) }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500">×</button>
      </div>
      {err && <p className="mt-1.5 text-[11px] font-bold text-red-500">{err}</p>}
    </div>
  )

  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Unirme a una liga</p>
      <div className="flex gap-2">
        <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="Código (ej. AB3K7M)" maxLength={10} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white" onKeyDown={e => e.key === 'Enter' && handleJoin()} />
        <button onClick={handleJoin} disabled={busy || !codigo.trim()} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{busy ? '…' : 'Entrar'}</button>
        <button onClick={() => { setMode('idle'); setErr(null) }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-500">×</button>
      </div>
      {err && <p className="mt-1.5 text-[11px] font-bold text-red-500">{err}</p>}
    </div>
  )
}

function CaminoOnboardingModal({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: <Target size={26} />, title: 'Bienvenido a Camino PAU', desc: 'Tu coach de estudio diario para la PAU' },
    { icon: <CalendarDays size={26} />, title: 'Cada día tienes una misión', desc: 'Empieza siempre por ella. Todo lo demás puede esperar.' },
    { icon: <Trophy size={26} />, title: 'Completa misiones, gana XP', desc: 'Cuanto más practicas, más subes de división.' },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 16, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }} className="w-full max-w-[480px] rounded-[28px] bg-white p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Tu ruta hacia la PAU</h2>
        <div className="mt-6 grid gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.22)]">
                {step.icon}
              </div>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-sm font-black text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 px-6 py-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:shadow-[0_16px_36px_rgba(37,99,235,0.32)]">
          Empezar
        </button>
      </motion.div>
    </motion.div>
  )
}
