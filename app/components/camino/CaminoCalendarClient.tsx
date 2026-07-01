'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, Clock3, Medal, Pencil, Plus, RotateCcw, Target, Trash2, Trophy, Zap } from 'lucide-react'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'
import Sidebar from '@/app/components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding, type OnboardingData } from '@/app/lib/onboarding/onboardingStorage'
import { buildEvauHref, buildTopicHref, getCurriculumForSubjects, normalizeSubjectSlug, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { getCaminoPlanLimits, monthlyToWeeklyLimit, normalizeCaminoPlanId, type CaminoPlanId } from '@/app/lib/camino/caminoPlanLimits'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'
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
type XpEvent = { id: string; missionId: string; date: string; subject: string; xp: number; bonus: boolean; score?: number }
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

const CALENDAR_KEY = 'pausia_camino_calendar_v2'
const CALENDAR_WEEKS_KEY = 'pausia_camino_calendar_weeks_v1'
const EXAMS_KEY = 'pausia_camino_student_exams_v1'
const XP_KEY = 'pausia_camino_xp_events_v1'
const WEAK_AREAS_KEY = 'pausia_camino_weak_areas_v1'
const TOPIC_PROGRESS_KEY = 'pausia_camino_topic_progress_v1'
const CALENDAR_VISIBILITY_KEY = 'pausia_camino_calendar_expanded_v1'
const SCHOOL_FEEDBACK_KEY = 'pausia_school_topic_feedback_v1'
const SCHOOL_ADJUSTMENTS_KEY = 'pausia_camino_school_adjustments_v1'
const CALENDAR_REFRESH_KEY = 'pausia_camino_calendar_needs_refresh_v1'

const SUBJECT_SLUGS: Record<string, string> = {
  'Matemáticas II': 'matematicas_ii', 'Matemáticas CCSS': 'matematicas_ccss', 'Física': 'fisica', 'Química': 'quimica',
  'Historia de España': 'historia_espana', 'Historia de la Filosofía': 'historia_filosofia', 'Lengua Castellana': 'lengua', 'Inglés': 'ingles', 'Biología': 'biologia'
}
const DB_SUBJECTS: Record<string, string> = {
  'Matemáticas CCSS': 'matematicas_ccss',
}
const seedTopicToCurriculumItem = (topic: CaminoCurriculumTopic): CurriculumItem => ({
  subject: SUBJECT_SLUGS[topic.subject] ? topic.subject : Object.entries(SUBJECT_SLUGS).find(([, slug]) => slug === topic.subject)?.[0] ?? topic.subject,
  subjectSlug: topic.subject,
  block: topic.blockTitle,
  blockSlug: topic.blockSlug,
  topic: topic.title,
  topicSlug: topic.topicSlug,
  title: topic.title,
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
const MOCK_RANKING: RankingEntry[] = [
  { id: 'mock-a-garcia', name: 'A. García', community: 'Madrid', xp: 8420, rank: 1, isCurrentUser: false, isMock: true },
  { id: 'mock-n-soler', name: 'N. Soler', community: 'Cataluña', xp: 7310, rank: 2, isCurrentUser: false, isMock: true },
  { id: 'mock-m-ruiz', name: 'M. Ruiz', community: 'Madrid', xp: 6040, rank: 3, isCurrentUser: false, isMock: true },
  { id: 'mock-l-ferrer', name: 'L. Ferrer', community: 'Cataluña', xp: 4860, rank: 4, isCurrentUser: false, isMock: true },
  { id: 'mock-d-martin', name: 'D. Martín', community: 'Madrid', xp: 3920, rank: 5, isCurrentUser: false, isMock: true },
]

function toISO(date: Date) { return date.toISOString().slice(0, 10) }
function todayISO() { return toISO(new Date()) }
function todayMadrid() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }) }
function dateFromISO(dateISO: string) { return new Date(`${dateISO}T12:00:00Z`) }
function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }
function mondayOf(date: Date) { const d = new Date(date); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); d.setHours(0, 0, 0, 0); return d }
function currentWeekStartISO() { return toISO(mondayOf(new Date())) }
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
    if (!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  }).map(({ label }) => label)
}
function textSlug(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function calendarDayLabel(dateISO: string) { return new Date(`${dateISO}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) }
function weekRangeLabel(weekStartISO: string) {
  const start = dateFromISO(weekStartISO)
  const end = addDays(start, 6)
  const startText = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const endText = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return `Semana del ${startText} al ${endText}`
}
function weekOffset(weekStartISO: string, weeks: number) { return toISO(addDays(dateFromISO(weekStartISO), weeks * 7)) }
function cacheWeek(cache: CalendarWeekCache, weekStartISO: string, calendar: DayPlan[]) {
  return { ...cache, [weekStartISO]: calendar }
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
  if ((kind === 'concept_explanation' || kind === 'guided_example' || kind === 'guided_practice') && block && topic) return { href: `/camino-pau/curso/${s}/${textSlug(block)}/${textSlug(topic)}`, fallback: '', autoCompletable: false }
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
  const target = mission.href ? { href: mission.href, fallback: '' } : getMissionTarget(mission.kind, mission.subject, mission.topic, mission.block)
  if (!target.href) return target
  const separator = target.href.includes('?') ? '&' : '?'
  const start = mission.kind === 'concept_explanation' || mission.kind === 'guided_example' || mission.kind === 'guided_practice' ? '&start=exercise' : ''
  return { ...target, href: `${target.href}${separator}missionId=${encodeURIComponent(mission.id)}&source=camino_pau${start}` }
}
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
  const href = blockSlug
    ? `/camino-pau/curso/${row.subject}/${blockSlug}/${textSlug(row.title)}`
    : ''
  return {
    id: row.id,
    calendarRowId: row.id,
    role: row.is_main ? 'main' : 'bonus',
    kind: 'concept_explanation',
    subject: subjectLabel,
    block: row.block_key ?? subjectLabel,
    topic: row.title,
    title: row.title,
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
    const subject = row.subject === 'matematicas_ccss' ? 'Matemáticas CCSS' : 'Matemáticas II'
    return {
      subject,
      subjectSlug: row.subject === 'matematicas_ccss' ? 'matematicas_ccss' : 'matematicas_ii',
      block: row.block_key,
      blockSlug: textSlug(row.block_key),
      topic: row.chapter_title,
      topicSlug: textSlug(row.chapter_title),
      title: row.title,
      sortOrder: row.sort_order,
      contentStatus: 'latex_notes',
      source: 'supabase' as const,
    }
  }).filter(item => item.subject !== 'Matemáticas CCSS' || item.block !== 'Geometría')
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
      return { date: dateISO, label: calendarDayLabel(dateISO), isToday: dateISO === todayISO(), missions: [] }
    })
  }
  const weeklyDays = Math.min(onboarding.weeklyStudyDaysValue ?? 4, planLimits.maxStudyDaysPerWeek)
  const weeklyCorrectionBudget = monthlyToWeeklyLimit(planLimits.correctionsPerMonth)
  const weeklyPhotoBudget = monthlyToWeeklyLimit(planLimits.photosPerMonth)
  const maxCorrectableMissions = Math.max(1, Math.min(weeklyCorrectionBudget, Math.max(weeklyPhotoBudget, planLimits.caminoMode === 'limited' ? 2 : weeklyCorrectionBudget)))
  const minutes = onboarding.dailyMinutes ?? 60
  const indexes = indexesFor(weeklyDays)
  let subjectRotation = 0
  const topicRotationBySubject = new Map<string, number>()
  const allowedSubjectSlugs = new Set(subjects.map(subject => subjectSlug(subject)))
  const relevantExams = exams.filter(exam => allowedSubjectSlugs.has(normalizeSubjectSlug(exam.subject)))
  const weakAreas = typeof window === 'undefined' ? [] : loadJson<Array<{ subject: string; block?: string; topic?: string; score: number }>>(WEAK_AREAS_KEY, [])
  const topicProgress = typeof window === 'undefined' ? {} : loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {})
  const schoolAdjustments = typeof window === 'undefined' ? [] : loadSchoolAdjustments()
  let plannedSimulationsThisRun = 0
  const nextCurriculumItem = (subject: string) => {
    const rows = curriculumForSubject(subject, curriculum)
    const startRotation = topicRotationBySubject.get(subject) ?? 0
    for (let attempt = 0; attempt < Math.max(rows.length, 1); attempt += 1) {
      const rotation = startRotation + attempt
      const item = pickCurriculumItem(subject, rotation, curriculum)
      if (!item || !findAdjustmentForItem(item, subject, onboarding, schoolAdjustments)) {
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

    return { date: dateISO, label: calendarDayLabel(dateISO), isToday: dateISO === todayISO(), missions }
  })
}

function syncStatuses(calendar: DayPlan[], events: XpEvent[]) {
  const done = new Set(events.map(event => event.missionId))
  const realToday = todayISO()
  return calendar.map(day => ({
    ...day,
    label: calendarDayLabel(day.date),
    isToday: day.date === realToday,
    missions: day.missions.map(mission => ({ ...mission, status: done.has(mission.id) ? 'done' : mission.status })),
  }))
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

function loadOrGenerateWeek(
  weekStartISO: string,
  onboarding: OnboardingData,
  exams: StudentExam[],
  curriculum: CurriculumItem[],
  planId: CaminoPlanId,
  xpEvents: XpEvent[],
  cache: CalendarWeekCache
) {
  const cached = cache[weekStartISO]
  if (cached?.length && calendarMatchesOnboarding(cached, onboarding, weekStartISO)) return syncStatuses(cached, xpEvents)
  return syncStatuses(generateCalendar(onboarding, exams, curriculum, planId, weekStartISO, cache), xpEvents)
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
  const [examDraft, setExamDraft] = useState({ subject: '', date: toISO(addDays(new Date(), 3)), block: '', topic: '', name: '', priority: 'normal' as ExamPriority })
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([])
  const [calendarEditorOpen, setCalendarEditorOpen] = useState(false)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
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

  useEffect(() => {
    const loadedOnboarding = loadOnboarding()
    const loadedExams = loadJson<StudentExam[]>(EXAMS_KEY, [])
    const loadedXp = loadJson<XpEvent[]>(XP_KEY, [])
    const loadedCalendar = loadJson<DayPlan[]>(CALENDAR_KEY, [])
    const loadedWeekCache = loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {})
    const currentWeek = currentWeekStartISO()
    const loadedCalendarExpanded = loadJson<boolean>(CALENDAR_VISIBILITY_KEY, false)
    const shouldRefreshCalendar = loadJson<boolean>(CALENDAR_REFRESH_KEY, false)
    const legacyCurrentWeek = loadedCalendar.length > 0 && calendarMatchesOnboarding(loadedCalendar, loadedOnboarding, currentWeek) ? loadedCalendar : []
    const canReuseSavedCalendar = !shouldRefreshCalendar && Boolean(loadedWeekCache[currentWeek]?.length || legacyCurrentWeek.length)
    // Seguro: efecto de montaje único que lee localStorage (client-only).
    // Lazy initializers causarían error de hidratación SSR.
    setOnboarding(loadedOnboarding)
    // Seguro: efecto de montaje único que lee localStorage (client-only).
    // Lazy initializers causarían error de hidratación SSR.
    setExams(loadedExams)
    // Seguro: efecto de montaje único que lee localStorage (client-only).
    // Lazy initializers causarían error de hidratación SSR.
    setXpEvents(loadedXp)
    setCalendarExpanded(loadedCalendarExpanded)
    setSelectedWeekStart(currentWeek)
    // Seguro: efecto de montaje único que lee localStorage (client-only).
    // Lazy initializers causarían error de hidratación SSR.
    setExamDraft(current => ({ ...current, subject: loadedOnboarding.subjects[0] ?? 'Matemáticas II' }))
    // Seguro: efecto de montaje único que lee localStorage (client-only).
    // Lazy initializers causarían error de hidratación SSR.
    const initialCache = legacyCurrentWeek.length ? cacheWeek(loadedWeekCache, currentWeek, legacyCurrentWeek) : loadedWeekCache
    const initialCalendar = canReuseSavedCalendar ? loadOrGenerateWeek(currentWeek, loadedOnboarding, loadedExams, FALLBACK_CURRICULUM, 'free', loadedXp, initialCache) : generateCalendar(loadedOnboarding, loadedExams, FALLBACK_CURRICULUM, 'free', currentWeek, initialCache)
    setCalendar(syncStatuses(initialCalendar, loadedXp))
    saveJson(CALENDAR_WEEKS_KEY, cacheWeek(initialCache, currentWeek, initialCalendar))
    saveJson(CALENDAR_KEY, initialCalendar)
    if (shouldRefreshCalendar) saveJson(CALENDAR_REFRESH_KEY, false)
    if (!window.localStorage.getItem('pausia_camino_onboarding_done')) setShowOnboarding(true)
    fetchCurriculumItems(loadedOnboarding.subjects)
      .then(items => {
        const nextItems = items.length ? items : FALLBACK_CURRICULUM
        setCurriculumItems(nextItems)
        if (!canReuseSavedCalendar) {
          const cache = loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {})
          const regenerated = generateCalendar(loadedOnboarding, loadedExams, nextItems, 'free', currentWeek, cache)
          setCalendar(syncStatuses(regenerated, loadedXp))
          saveJson(CALENDAR_KEY, regenerated)
          saveJson(CALENDAR_WEEKS_KEY, cacheWeek(cache, currentWeek, regenerated))
        }
      })
      .catch(() => setCurriculumItems(FALLBACK_CURRICULUM))
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id
      if (!userId || cancelled) return
      const created = data.session?.user.created_at
      if (created) {
        const days = Math.floor((Date.now() - new Date(created).getTime()) / 86400000)
        if (!cancelled) setDaysSinceReg(days)
      }
      await ensureCaminoCalendar(userId, supabase)
      if (cancelled) return
      const [days, rachaValue, matCount, histCount] = await Promise.all([
        fetchCaminoCalendar(userId),
        calcularRacha(userId, supabase),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'matematicas_ii'),
        supabase.from('camino_calendar').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed').eq('subject', 'historia_espana'),
      ])
      if (cancelled) return
      if (days && days.length > 0) {
        setCalendar(days)
        setSupabaseCalLoaded(true)
        const realTodayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
        const todayDay = days.find(d => d.date === realTodayStr)
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
      }
      setStreak(rachaValue)
      setSubjectProgress({ matematicas_ii: matCount.count ?? 0, historia_espana: histCount.count ?? 0 })
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

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
    if (!onboarding?.completedAt) return
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null
      if (!token || cancelled) return
      const res = await fetch('/api/billing/me', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok || cancelled) return
      const billing = await res.json() as { activePlans?: Array<{ planId?: string | null }> }
      const planId = normalizeCaminoPlanId(billing.activePlans?.[0]?.planId)
      setCaminoPlanId(planId)
      const savedCalendar = loadJson<DayPlan[]>(CALENDAR_KEY, [])
      const savedWeekCache = loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {})
      const shouldRefreshCalendar = loadJson<boolean>(CALENDAR_REFRESH_KEY, false)
      if (!supabaseCalLoaded && (!savedCalendar.length || shouldRefreshCalendar || !calendarMatchesOnboarding(savedWeekCache[selectedWeekStart] ?? savedCalendar, onboarding, selectedWeekStart))) {
        const source = curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM
        const regenerated = generateCalendar(onboarding, exams, source, planId, selectedWeekStart, savedWeekCache)
        setCalendar(syncStatuses(regenerated, xpEvents))
        saveJson(CALENDAR_KEY, regenerated)
        saveJson(CALENDAR_WEEKS_KEY, cacheWeek(savedWeekCache, selectedWeekStart, regenerated))
        if (shouldRefreshCalendar) saveJson(CALENDAR_REFRESH_KEY, false)
      }
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
  const totalXP = xpEvents.reduce((sum, event) => sum + event.xp, 0)
  const weeklyXP = xpEvents.filter(e => e.date >= currentWeekStartISO()).reduce((sum, e) => sum + e.xp, 0)
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
  const onboardingSubjects = normalizeOnboardingSubjects(onboarding?.subjects ?? [])
  const courseGroups = courseTopicsForSubjects(onboardingSubjects, curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM)
  const caminoPlanLimits = getCaminoPlanLimits(caminoPlanId)
  const hasOnboardingSubjects = Boolean(onboarding?.subjects.length)
  const isRescueMode = calendar.some(day => day.missions.some(m => m.metadata?.plan_mode === 'rescue'))
  const selectedWeekLabel = weekRangeLabel(selectedWeekStart)
  const selectedIsCurrentWeek = selectedWeekStart === currentWeekStartISO()

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

  function persist(nextCalendar: DayPlan[], nextXp = xpEvents, nextExams = exams) {
    setCalendar(nextCalendar); setXpEvents(nextXp); setExams(nextExams)
    const cache = cacheWeek(loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {}), selectedWeekStart, nextCalendar)
    saveJson(CALENDAR_WEEKS_KEY, cache); saveJson(CALENDAR_KEY, nextCalendar); saveJson(XP_KEY, nextXp); saveJson(EXAMS_KEY, nextExams)
  }
  function generateWeek(weekStartISO: string, nextExams = exams, planId = caminoPlanId) {
    if (!onboarding) return []
    const source = curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM
    const cache = loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {})
    const nextCalendar = loadOrGenerateWeek(weekStartISO, onboarding, nextExams, source, planId, xpEvents, cache)
    setSelectedWeekStart(weekStartISO)
    setCalendar(nextCalendar)
    saveJson(CALENDAR_KEY, nextCalendar)
    saveJson(CALENDAR_WEEKS_KEY, cacheWeek(cache, weekStartISO, nextCalendar))
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
    const cache = loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {})
    const regenerated = syncStatuses(generateCalendar(onboarding, nextExams, source, caminoPlanId, selectedWeekStart, cache), xpEvents)
    persist(regenerated, xpEvents, nextExams)
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
    const nextExams = editingExamId ? exams.map(exam => exam.id === editingExamId ? { ...exam, ...examDraft } : exam) : [...exams, { id: `exam-${examDraft.date}-${exams.length + 1}`, ...examDraft }]
    resetExamDraft()
    regenerate(nextExams)
  }
  function deleteExam(id: string) { regenerate(exams.filter(exam => exam.id !== id)) }

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

  return (
    <Shell>
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU</p><h1 className="text-2xl font-black tracking-tight text-slate-950">Tu semana de estudio</h1></div><div className="flex flex-wrap gap-2"><button onClick={() => setCalendarEditorOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-[0_10px_26px_rgba(37,99,235,0.08)]"><CalendarDays size={16} /> Editar calendario</button><button onClick={openNewExam} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]"><Plus size={16} /> Añadir examen</button></div></div></header>
      <main className="mx-auto max-w-7xl px-5 py-6">
        {isRescueMode && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"><p className="text-sm font-black text-amber-800">⚠️ Modo Rescate PAU activado — nos centramos en los temas más importantes para maximizar tu nota.</p></div>}
        <section className="mb-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
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
          />
          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">XP y división</p><h2 className="mt-1 text-base font-bold text-slate-600">{displayedXP.toLocaleString('es-ES')} XP</h2></div><span className="rounded-xl px-3 py-1 text-xs font-bold" style={{ background: division.bg, color: division.text }}>{division.name}</span></div><p className="mt-3 text-sm font-semibold text-slate-500">Ganas XP por practicar y aún más cuando mejoras tu precisión.</p><p className="mt-2 rounded-2xl bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">Plan gratuito · Te quedan {Math.max(0, 7 - (daysSinceReg ?? 0))} días de prueba</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${divisionPct}%`, background: division.bar }} /></div><p className="mt-2 text-[11px] font-semibold text-slate-400">{nextDivision ? `Faltan ${Math.max(0, nextDivision.min - displayedXP).toLocaleString('es-ES')} XP para ${nextDivision.name}.` : 'División máxima alcanzada.'}</p>{streak > 0 && <p className="mt-3 text-[11px] font-black text-orange-500">🔥 {streak} día{streak !== 1 ? 's' : ''} de racha</p>}</div>
        </section>

        {(subjectProgress.matematicas_ii != null || subjectProgress.historia_espana != null) && (
          <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Progreso del temario</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                { subject: 'matematicas_ii', label: 'Matemáticas II', total: 60, color: '#2563eb' },
                { subject: 'historia_espana', label: 'Historia de España', total: 128, color: '#7c3aed' },
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
        <section className="mb-5 rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Calendario editable</p><h2 className="text-xl font-black text-slate-950">{selectedWeekLabel}</h2><p className="mt-1 text-xs font-bold text-slate-400">{selectedIsCurrentWeek ? 'Estás viendo la semana actual.' : 'Semana seleccionada. Qué hacer hoy sigue usando la fecha real.'}</p></div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-500">{completedMain} de {totalMain} misiones principales completadas</p><button onClick={() => setCalendarEditorOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Pencil size={15} /> Editar calendario</button></div></div><div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={() => goToWeek(weekOffset(selectedWeekStart, -1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"><ChevronLeft size={14} /> Semana anterior</button><button onClick={goToCurrentWeek} className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700">Hoy</button><button onClick={() => goToWeek(weekOffset(selectedWeekStart, 1))} className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50">Semana siguiente <ArrowRight size={14} /></button></div><button onClick={toggleCalendarExpanded} className="mt-3 inline-flex items-center gap-1.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"><ChevronDown className={`transition-transform duration-200${calendarExpanded ? ' rotate-180' : ''}`} size={14} aria-hidden />{calendarExpanded ? 'Ocultar semana' : 'Ver semana completa'}</button>{calendarExpanded && <div className="mt-4 grid gap-3 lg:grid-cols-7">{visibleCalendar.map(day => <DayCard key={day.date} day={day} exams={exams.filter(exam => exam.date === day.date)} />)}</div>}</section>

        <CourseDirectory groups={courseGroups} />

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]"><div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">Exámenes parciales</h2><p className="text-sm font-semibold text-slate-500">Añade tus próximos exámenes para que Pausia ajuste tu semana.</p></div><button onClick={openNewExam} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Plus size={15} /> Añadir examen</button></div><div className="grid gap-2">{exams.length ? exams.map(exam => <div key={exam.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{exam.subject} · {exam.topic || exam.name || 'Parcial'}</p><p className="text-xs font-bold text-slate-400">{formatDate(exam.date)} · prioridad {priorityLabel(exam.priority)}</p></div><div className="flex shrink-0 gap-1"><button onClick={() => openEditExam(exam)} className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700" aria-label="Editar examen"><Pencil size={16} /></button><button onClick={() => deleteExam(exam.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar examen"><Trash2 size={16} /></button></div></div>) : <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800">Empieza añadiendo tu próximo examen del instituto.</p>}</div></div><RankingCard open={rankingOpen} setOpen={setRankingOpen} tab={rankingTab} setTab={setRankingTab} rows={rankingTopRows} currentRow={fixedCurrentRow} community={rankingCommunity} totalXP={displayedXP} division={division.name} realUserCount={leaderboard?.realUserCount ?? 1} liga={liga} ligaLoading={ligaLoading} onCreateLiga={createLiga} onJoinLiga={joinLiga} /></section>

        <section className="mt-5" id="acceso-premium">
          <ParentLinkModule billing={{ loading: false, hasActivePack: caminoPlanId !== 'free', activePlans: [], pendingParentCheckout: null }} />
        </section>
      </main>
      <AnimatePresence>{showExamForm && <ExamModal subjects={onboardingSubjects} draft={examDraft} setDraft={setExamDraft} onClose={resetExamDraft} onSave={saveExam} editing={Boolean(editingExamId)} />}</AnimatePresence>
      <AnimatePresence>{calendarEditorOpen && onboarding && <CalendarEditorOverlay calendar={visibleCalendar} subjects={onboardingSubjects} curriculum={curriculumItems.length ? curriculumItems : FALLBACK_CURRICULUM} planId={caminoPlanId} onClose={() => setCalendarEditorOpen(false)} onAddExam={() => { setCalendarEditorOpen(false); openNewExam() }} onSave={(next) => { persist(syncStatuses(next, xpEvents)); setCalendarEditorOpen(false); setToast('Calendario guardado') }} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} onAnimationComplete={() => setTimeout(() => setToast(null), 1600)} className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</motion.div>}</AnimatePresence>
      <AnimatePresence>{showOnboarding && <CaminoOnboardingModal onClose={() => { window.localStorage.setItem('pausia_camino_onboarding_done', 'true'); setShowOnboarding(false) }} />}</AnimatePresence>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen bg-[#f4f7fb] max-lg:block"><Sidebar activeItem="camino" /><div className="min-w-0 flex-1">{children}</div></div> }

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
          <h2 className="text-xl font-black text-slate-950">Cursos de tu Camino</h2>
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

function CalendarEditorOverlay({ calendar, subjects, curriculum, planId, onClose, onAddExam, onSave }: { calendar: DayPlan[]; subjects: string[]; curriculum: CurriculumItem[]; planId: CaminoPlanId; onClose: () => void; onAddExam: () => void; onSave: (calendar: DayPlan[]) => void }) {
  const safeSubjects: string[] = subjects
  const [draft, setDraft] = useState<DayPlan[]>(() => calendar.map(day => ({ ...day, missions: day.missions.map(mission => ({ ...mission })) })))
  const [newMission, setNewMission] = useState({ day: calendar[0]?.date ?? todayISO(), subject: safeSubjects[0] ?? 'Matemáticas II', kind: 'concept_explanation' as MissionKind, topic: '', minutes: 15, bonus: false })
  const [draggedMissionId, setDraggedMissionId] = useState<string | null>(null)
  const [editorNotice, setEditorNotice] = useState('')
  const topics = curriculumForSubject(newMission.subject, curriculum)

  function moveMission(missionId: string, nextDate: string) {
    const sourceDay = draft.find(day => day.missions.some(mission => mission.id === missionId))
    const mission = sourceDay?.missions.find(item => item.id === missionId)
    if (!sourceDay || !mission) return
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
    const cache = cacheWeek(loadJson<CalendarWeekCache>(CALENDAR_WEEKS_KEY, {}), calendar[0]?.date ?? currentWeekStartISO(), draft)
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-0 right-0 top-0 z-50 bg-slate-950/20 p-4 backdrop-blur-sm max-lg:left-0 lg:left-[248px]">
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 px-5 py-4">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Editar calendario</p><h2 className="text-xl font-black text-slate-950">Ajusta tu semana</h2></div>
          <div className="flex flex-wrap gap-2"><button onClick={onAddExam} className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"><Plus size={15} /> Añadir parcial</button><button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-500">Cancelar</button><button onClick={() => onSave(draft)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Guardar cambios</button></div>
        </header>
        <div className="grid flex-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-3 lg:grid-cols-2">
            {draft.map(day => (
              <article key={day.date} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (draggedMissionId) moveMission(draggedMissionId, day.date); setDraggedMissionId(null) }} className="rounded-3xl border border-blue-100 bg-slate-50 p-4">
                <h3 className="text-sm font-black capitalize text-slate-900">{day.label}</h3>
                <div className="mt-3 grid gap-2">
                  {day.missions.length ? day.missions.map(mission => (
                    <div key={mission.id} draggable onDragStart={() => setDraggedMissionId(mission.id)} onDragEnd={() => setDraggedMissionId(null)} className="cursor-grab rounded-2xl border border-white bg-white p-3 shadow-sm active:cursor-grabbing">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-black" style={{ color: themeFor(mission.subject).text }}>{mission.subject}{mission.topic ? ` · ${mission.topic}` : ''}</p>
                          <input value={mission.title} onChange={event => updateMission(mission.id, { title: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs font-black text-slate-800 outline-none focus:border-blue-200 focus:bg-white" />
                        </div>
                        <button onClick={() => deleteMission(mission.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar misión"><Trash2 size={15} /></button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <select value={mission.subject} onChange={event => updateMission(mission.id, { subject: event.target.value })} className="mini-input">{safeSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select>
                        <select value={mission.kind} onChange={event => updateMission(mission.id, { kind: event.target.value as MissionKind })} className="mini-input">{kindOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                        <select value={day.date} onChange={event => moveMission(mission.id, event.target.value)} className="mini-input">{draft.map(option => <option key={option.date} value={option.date}>{option.label}</option>)}</select>
                      </div>
                      <label className="mt-2 inline-flex items-center gap-2 text-xs font-black text-slate-500"><input type="checkbox" checked={mission.role === 'bonus'} onChange={event => updateMission(mission.id, { role: event.target.checked ? 'bonus' : 'main' })} /> Bonus/opcional</label>
                    </div>
                  )) : <p className="text-xs font-bold text-slate-400">Sin misiones.</p>}
                </div>
              </article>
            ))}
          </div>
          <aside className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4">
            <h3 className="text-sm font-black text-slate-950">Añadir misión</h3>
            {editorNotice && <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">{editorNotice}</p>}
            <div className="mt-4 grid gap-3">
              <Field label="Día"><select value={newMission.day} onChange={event => setNewMission({ ...newMission, day: event.target.value })} className="inputish">{draft.map(day => <option key={day.date} value={day.date}>{day.label}</option>)}</select></Field>
              <Field label="Asignatura"><select value={newMission.subject} onChange={event => setNewMission({ ...newMission, subject: event.target.value, topic: '' })} className="inputish">{safeSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field>
              <Field label="Tema"><select value={newMission.topic} onChange={event => setNewMission({ ...newMission, topic: event.target.value })} className="inputish"><option value="">Sugerido</option>{topics.map(topic => <option key={`${topic.subject}-${topic.sortOrder}`} value={topic.topic}>{topic.block} · {topic.topic}</option>)}</select></Field>
              <Field label="Tipo"><select value={newMission.kind} onChange={event => setNewMission({ ...newMission, kind: event.target.value as MissionKind })} className="inputish">{kindOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Duración"><input type="number" min={5} max={90} value={newMission.minutes} onChange={event => setNewMission({ ...newMission, minutes: Number(event.target.value) })} className="inputish" /></Field>
              <label className="inline-flex items-center gap-2 text-sm font-black text-slate-600"><input type="checkbox" checked={newMission.bonus} onChange={event => setNewMission({ ...newMission, bonus: event.target.checked })} /> Opcional / bonus</label>
              <button onClick={addMission} disabled={!safeSubjects.length} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> Añadir misión</button>
            </div>
          </aside>
        </div>
        <style>{`.mini-input{min-width:0;border-radius:10px;border:1px solid #e2e8f0;background:#f8fafc;padding:7px 8px;font-size:11px;font-weight:800;color:#475569;outline:none}.mini-input:focus{border-color:#93c5fd;background:#fff}`}</style>
      </motion.section>
    </motion.div>
  )
}

function formatBlockLabel(blockKey?: string): string {
  if (!blockKey) return ''
  return blockKey.replace(/^bloque-\d+-/, '').replace(/-/g, ' ')
}

function heroReason(mission: Mission, blockCompleted: number): string {
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
  if (blockCompleted === 0) {
    return `Empezamos por aquí porque es la base de ${blockName}. Completar esta misión desbloquea las siguientes.`
  }
  return `Sigues avanzando en ${blockName}. Llevas ${blockCompleted} misión${blockCompleted !== 1 ? 'es' : ''} completada${blockCompleted !== 1 ? 's' : ''} en este bloque.`
}

function HeroMissionCard({ mission, blockCompleted, streak, completedThisWeek, totalThisWeek, weeklyXP, onPostpone, onMarkNotSeen, hasOnboardingSubjects }: {
  mission: Mission | null
  blockCompleted: number
  streak: number
  completedThisWeek: number
  totalThisWeek: number
  weeklyXP: number
  onPostpone: () => void
  onMarkNotSeen: () => void
  hasOnboardingSubjects: boolean
}) {
  const theme = mission ? themeFor(mission.subject) : { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
  const subjectUpper = (mission?.subject ?? '').toUpperCase()
  const blockLabel = formatBlockLabel(mission?.blockKey).toUpperCase()
  const headerParts = ['CAMINO PAU', subjectUpper, blockLabel].filter(Boolean)
  const target = mission ? hrefForMission(mission) : null
  const reason = mission ? heroReason(mission, blockCompleted) : null

  return (
    <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
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
                <button onClick={onMarkNotSeen} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-50">No lo he dado en clase</button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <h2 className="text-xl font-black text-slate-400">{hasOnboardingSubjects ? 'No hay misión asignada hoy' : 'Completa tu onboarding para empezar'}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{hasOnboardingSubjects ? 'Puedes revisar el calendario o descansar.' : 'Configura tu perfil y construiremos tu Camino PAU.'}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{streak > 0 ? `🔥 ${streak}` : '0'}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">días de racha</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{completedThisWeek}<span className="text-sm font-semibold text-slate-400">/{totalThisWeek}</span></p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">esta semana</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-900">{weeklyXP}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">XP semanal</p>
        </div>
      </div>
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
  return <article className={`min-h-[210px] rounded-3xl border p-3 ${day.isToday ? 'border-blue-300 bg-blue-50/70' : 'border-slate-100 bg-slate-50/80'}`}><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black capitalize text-slate-900">{day.label}</h3>{done && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">Hecho</span>}</div>{exams.map(exam => <p key={exam.id} className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800">Parcial: {exam.subject} · {exam.block || exam.topic || priorityLabel(exam.priority)}</p>)}<div className="grid gap-2">{main.length ? main.map(mission => { const target = hrefForMission(mission); const content = <><p className="text-[11px] font-black" style={{ color: themeFor(mission.subject).text }}>{mission.subject}{mission.topic ? ` · ${mission.topic}` : ''}</p><p className="mt-1 text-xs font-bold text-slate-700">{mission.title}</p><p className="mt-2 text-[11px] font-bold text-slate-400">{mission.status === 'done' ? 'Completada' : target.href ? 'Ir a practicar' : 'Todavía no hemos preparado este contenido.'}</p></>; return target.href ? <a key={mission.id} href={target.href} className="rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5" style={{ borderColor: themeFor(mission.subject).border }}>{content}</a> : <div key={mission.id} className="rounded-2xl border bg-white p-3 text-left" style={{ borderColor: themeFor(mission.subject).border }}>{content}</div> }) : <p className="text-xs font-semibold text-slate-400">Descanso o repaso libre.</p>}</div></article>
}

function ExamModal({ subjects, draft, setDraft, onClose, onSave, editing }: { subjects: string[]; draft: { subject: string; date: string; block: string; topic: string; name: string; priority: ExamPriority }; setDraft: (draft: { subject: string; date: string; block: string; topic: string; name: string; priority: ExamPriority }) => void; onClose: () => void; onSave: () => void; editing: boolean }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm"><motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"><h2 className="text-xl font-black text-slate-950">{editing ? 'Editar examen parcial' : 'Añadir examen parcial'}</h2><p className="mt-1 text-sm font-semibold text-slate-500">Si tienes un parcial cerca, Camino PAU priorizará bloque, tema y ejercicios reales.</p><div className="mt-5 grid gap-3"><Field label="Asignatura"><select value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} className="inputish">{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></Field><Field label="Fecha"><input type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} className="inputish" /></Field><Field label="Bloque"><input value={draft.block} onChange={event => setDraft({ ...draft, block: event.target.value })} placeholder="Álgebra, Análisis, Probabilidad..." className="inputish" /></Field><Field label="Tema opcional"><input value={draft.topic} onChange={event => setDraft({ ...draft, topic: event.target.value })} placeholder="Sistemas/Gauss, Derivadas, Writing..." className="inputish" /></Field><Field label="Nombre opcional"><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Parcial 1" className="inputish" /></Field><Field label="Prioridad"><select value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value as ExamPriority })} className="inputish"><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="muy_alta">Muy alta</option></select></Field></div><style>{`.inputish{width:100%;border-radius:14px;border:1px solid #dbe7fb;background:#f8fbff;padding:11px 12px;font-size:14px;font-weight:700;color:#334155;outline:none}.inputish:focus{border-color:#93c5fd;background:white}`}</style><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-500">Cancelar</button><button onClick={onSave} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white">{editing ? 'Guardar cambios' : 'Guardar examen'}</button></div></motion.div></motion.div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>{children}</label> }

function RankingCard({ open, setOpen, tab, setTab, rows, currentRow, community, totalXP, division, realUserCount, liga, ligaLoading, onCreateLiga, onJoinLiga }: { open: boolean; setOpen: (open: boolean) => void; tab: 'global' | 'community'; setTab: (tab: 'global' | 'community') => void; rows: RankingEntry[]; currentRow: RankingEntry | null; community: string; totalXP: number; division: string; realUserCount: number; liga: LigaInfo | null; ligaLoading: boolean; onCreateLiga: (nombre: string) => Promise<{ error?: string }>; onJoinLiga: (codigo: string) => Promise<{ error?: string }> }) {
  const title = tab === 'community' ? `Ranking Comunidad · ${community}` : 'Ranking Global'
  return <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left"><span><span className="block text-lg font-black text-slate-950">Ranking y divisiones</span><span className="mt-1 block text-sm font-semibold text-slate-500">Consulta tu posición cuando quieras.</span></span><ChevronDown className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} /></button><AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-5 rounded-3xl bg-slate-50 p-4"><div className="grid gap-3 sm:grid-cols-3"><MiniStat icon={<Trophy size={15} />} label="División" value={division} /><MiniStat icon={<Zap size={15} />} label="XP total" value={totalXP.toLocaleString('es-ES')} /><MiniStat icon={<BarChart3 size={15} />} label="Comunidad" value={community} /></div><p className="mt-3 text-sm font-semibold text-slate-500">Tu división refleja tu constancia y precisión. Los alumnos de relleno solo aparecen si faltan usuarios reales.</p><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-black text-slate-900">{community === 'Sin comunidad' && tab === 'community' ? 'Completa tu comunidad para ver tu ranking local.' : title}</h3><div className="flex gap-2"><button onClick={() => setTab('global')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'global' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>Global</button><button onClick={() => setTab('community')} className={`rounded-full px-3 py-1.5 text-xs font-black ${tab === 'community' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>Comunidad</button></div></div><div className="mt-3 grid gap-2">{rows.map(row => <RankingRow key={row.id} row={row} />)}</div>{currentRow && <><div className="my-3 h-px bg-blue-100" /><RankingRow row={currentRow} fixed /></>}{realUserCount < 3 && <p className="mt-3 text-sm font-bold text-slate-500">El ranking se activará cuando haya más alumnos usando Pausia.</p>}<div className="my-4 h-px bg-blue-100" /><LigaSection liga={liga} loading={ligaLoading} onCreateLiga={onCreateLiga} onJoinLiga={onJoinLiga} /></div></motion.div>}</AnimatePresence></div>
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
