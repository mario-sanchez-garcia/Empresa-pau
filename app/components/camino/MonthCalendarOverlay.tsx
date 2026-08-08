'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { addDays, getMadridToday, mondayBasedDayIndex } from '@/app/lib/camino/studyDays'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS, type ContentType } from '@/app/lib/camino/contentTypeColors'
import {
  CUSTOM_EVENT_CATEGORIES,
  CUSTOM_EVENT_CATEGORY_LABELS,
  WEEKDAY_LABELS_FULL,
  createCustomEvent,
  deleteCustomEvent,
  fetchCustomEvents,
  type CustomEvent,
  type CustomEventCategory,
  type CustomEventRecurrence,
} from '@/app/lib/camino/customEvents'
import { useHints } from '@/app/lib/onboarding/HintsContext'
import WeekHourView, { type HourViewItem } from '@/app/components/camino/WeekHourView'

type ExamSummary = { id: string; date: string; subject: string; topic?: string; name?: string; block?: string }

type MissionRow = {
  id: string
  scheduled_date: string
  subject: string
  title: string
  status: string
  start_time: string | null
  end_time: string | null
}

type DayItem = HourViewItem

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function monthStartISO(dateISO: string): string {
  return `${dateISO.slice(0, 7)}-01`
}

function addMonths(monthStartISOStr: string, n: number): string {
  const [y, m] = monthStartISOStr.split('-').map(Number)
  const total = (y * 12 + (m - 1)) + n
  const nextY = Math.floor(total / 12)
  const nextM = (total % 12) + 1
  return `${nextY}-${String(nextM).padStart(2, '0')}-01`
}

function monthLabel(monthStartISOStr: string): string {
  const [y, m] = monthStartISOStr.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1, 12))
  const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return label.replace(/^\w/, c => c.toUpperCase())
}

// Monday-first 6-week (42 day) grid that fully covers the month, including
// the leading/trailing days from adjacent months (shown dimmed) so every
// week row is complete — the familiar Google Calendar month-grid pattern.
function buildMonthGrid(monthStartISOStr: string): string[] {
  const leadingBlanks = mondayBasedDayIndex(monthStartISOStr)
  const gridStart = addDays(monthStartISOStr, -leadingBlanks)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

function weekRangeLabel(weekStartISOStr: string): string {
  const start = new Date(`${weekStartISOStr}T12:00:00`)
  const end = new Date(`${addDays(weekStartISOStr, 6)}T12:00:00`)
  const startText = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const endText = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return `Semana del ${startText} al ${endText}`
}

export default function MonthCalendarOverlay({
  onClose,
  exams,
}: {
  onClose: () => void
  exams: ExamSummary[]
}) {
  const today = getMadridToday()
  const [monthCursor, setMonthCursor] = useState<string>(() => monthStartISO(today))
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventDraft, setEventDraft] = useState({
    title: '', description: '', category: 'otro' as CustomEventCategory,
    startTime: '', endTime: '', recurrence: 'none' as CustomEventRecurrence, recurrenceUntil: '',
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesLoaded, setNotesLoaded] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(true)
  const { seenKeys, markSeen, isLoaded: hintsLoaded } = useHints()

  // Este overlay cubre toda la pantalla (fixed inset-0) pero el body de
  // detrás seguía siendo scrolleable — al llegar al límite de scroll del
  // grid mensual (o del panel lateral), la rueda del ratón encadenaba el
  // scroll restante al fondo de la página en vez de quedarse contenido en
  // el calendario. overscroll-contain en los paneles internos evita el
  // encadenado; bloquear el scroll del body mientras el overlay está
  // montado es la red de seguridad estándar para cualquier modal a
  // pantalla completa.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      try {
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok || cancelled) return
        const json = await res.json() as { custom_instructions?: string }
        if (!cancelled) setNotes(json.custom_instructions ?? '')
      } finally {
        if (!cancelled) setNotesLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const grid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor])
  const gridEnd = grid[grid.length - 1]

  const weekStartISO = useMemo(() => addDays(selectedDate, -mondayBasedDayIndex(selectedDate)), [selectedDate])

  // Navegar de semana en semana puede cruzar a un mes cuyo grid de 42 días
  // (buildMonthGrid) todavía no está cargado — resincroniza monthCursor con
  // el mes de la nueva fecha seleccionada para que el efecto de carga de
  // abajo traiga misiones/eventos de esa semana si hace falta. Un grid
  // mensual de 6 semanas completas siempre contiene entera cualquier semana
  // que toque ese mes, así que esto basta incluso cuando la semana cae a
  // caballo entre dos meses.
  function goToWeek(deltaDays: number) {
    const next = addDays(selectedDate, deltaDays)
    setSelectedDate(next)
    const nextMonth = monthStartISO(next)
    if (nextMonth !== monthCursor) setMonthCursor(nextMonth)
  }
  function goToTodayWeek() {
    setSelectedDate(today)
    const todayMonth = monthStartISO(today)
    if (todayMonth !== monthCursor) setMonthCursor(todayMonth)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) { setLoading(false); return }
      const [missionRes, events] = await Promise.all([
        supabase
          .from('camino_calendar')
          .select('id, scheduled_date, subject, title, status, start_time, end_time')
          .eq('user_id', userId)
          .gte('scheduled_date', grid[0])
          .lte('scheduled_date', gridEnd)
          .order('scheduled_date', { ascending: true })
          .limit(300),
        fetchCustomEvents(supabase, userId, grid[0], gridEnd),
      ])
      if (cancelled) return
      setMissions((missionRes.data as MissionRow[] | null) ?? [])
      setCustomEvents(events)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [grid, gridEnd])

  const missionsByDate = useMemo(() => {
    const map = new Map<string, MissionRow[]>()
    for (const m of missions) {
      if (!map.has(m.scheduled_date)) map.set(m.scheduled_date, [])
      map.get(m.scheduled_date)!.push(m)
    }
    return map
  }, [missions])

  const examsByDate = useMemo(() => {
    const map = new Map<string, ExamSummary[]>()
    for (const e of exams) {
      if (e.date < grid[0] || e.date > gridEnd) continue
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [exams, grid, gridEnd])

  const customEventsByDate = useMemo(() => {
    const map = new Map<string, CustomEvent[]>()
    for (const ev of customEvents) {
      if (!map.has(ev.date)) map.set(ev.date, [])
      map.get(ev.date)!.push(ev)
    }
    return map
  }, [customEvents])

  function itemsForDate(dateISO: string): DayItem[] {
    const items: DayItem[] = []
    for (const m of missionsByDate.get(dateISO) ?? []) {
      items.push({
        key: `m-${m.id}`,
        type: 'kairo_mission',
        title: m.title,
        subtitle: m.subject,
        done: m.status === 'completed',
        start: m.start_time ? m.start_time.slice(0, 5) : null,
        end: m.end_time ? m.end_time.slice(0, 5) : null,
      })
    }
    for (const e of examsByDate.get(dateISO) ?? []) {
      items.push({
        key: `e-${e.id}`,
        type: 'exam',
        title: e.name || `Parcial · ${e.subject}`,
        subtitle: e.topic || e.block || e.subject,
        start: null,
        end: null,
      })
    }
    for (const ev of customEventsByDate.get(dateISO) ?? []) {
      items.push({
        key: `c-${ev.occurrenceKey}`,
        type: 'student_event',
        title: ev.title,
        subtitle: [CUSTOM_EVENT_CATEGORY_LABELS[ev.category], ev.startTime?.slice(0, 5)].filter(Boolean).join(' · ') || undefined,
        start: ev.startTime ? ev.startTime.slice(0, 5) : null,
        end: ev.endTime ? ev.endTime.slice(0, 5) : null,
        onDelete: async () => {
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) return
          const ok = await deleteCustomEvent(supabase, userId, ev.id)
          if (ok) setCustomEvents(current => current.filter(item => item.id !== ev.id))
        },
      })
    }
    return items
  }

  async function saveNewEvent() {
    if (!eventDraft.title.trim() || savingEvent) return
    setSavingEvent(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const created = await createCustomEvent(supabase, userId, { ...eventDraft, date: selectedDate })
      if (created) {
        // Recarga en vez de solo añadir `created` al estado: un evento
        // semanal recién creado devuelve una única fila (su primera
        // ocurrencia), pero el grid visible necesita TODAS sus ocurrencias
        // proyectadas — fetchCustomEvents ya sabe expandirlas.
        const refreshed = await fetchCustomEvents(supabase, userId, grid[0], gridEnd)
        setCustomEvents(refreshed)
        setEventDraft({ title: '', description: '', category: 'otro', startTime: '', endTime: '', recurrence: 'none', recurrenceUntil: '' })
        setShowEventForm(false)
      }
    } finally {
      setSavingEvent(false)
    }
  }

  async function saveNotes() {
    if (notesSaving) return
    setNotesSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ custom_instructions: notes }),
      })
      if (res.ok) {
        setNotesSaved(true)
      }
    } finally {
      setNotesSaving(false)
    }
  }

  const selectedItems = itemsForDate(selectedDate)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-0 right-0 top-0 z-50 flex items-stretch bg-slate-950/25 p-3 backdrop-blur-[2px] max-lg:left-0 sm:p-5 lg:left-[248px]">
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.987 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.987 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 20px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)' }}
      >
        {/* Header */}
        <header className="shrink-0 bg-[#0f172a] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[.24em] text-slate-500">Camino PAU · Tu agenda</p>
              <h2 className="mt-1 text-[22px] font-black text-slate-100" style={{ letterSpacing: '-0.025em', lineHeight: 1 }}>
                {viewMode === 'month' ? monthLabel(monthCursor) : weekRangeLabel(weekStartISO)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="mr-1 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className="rounded-md px-2.5 py-1.5 text-[10px] font-black transition"
                  style={{ background: viewMode === 'month' ? 'white' : 'transparent', color: viewMode === 'month' ? '#0f172a' : '#cbd5e1' }}
                >
                  Mes
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-black transition"
                  style={{ background: viewMode === 'week' ? 'white' : 'transparent', color: viewMode === 'week' ? '#0f172a' : '#cbd5e1' }}
                >
                  <CalendarClock size={12} /> Por horas
                </button>
              </div>
              {viewMode === 'month' ? (
                <>
                  <button onClick={() => setMonthCursor(addMonths(monthCursor, -1))} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/[0.11]" aria-label="Mes anterior"><ChevronLeft size={15} /></button>
                  <button onClick={() => setMonthCursor(monthStartISO(today))} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-black text-slate-300 transition hover:bg-white/[0.11]">Hoy</button>
                  <button onClick={() => setMonthCursor(addMonths(monthCursor, 1))} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/[0.11]" aria-label="Mes siguiente"><ChevronRight size={15} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => goToWeek(-7)} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/[0.11]" aria-label="Semana anterior"><ChevronLeft size={15} /></button>
                  <button onClick={() => goToTodayWeek()} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-black text-slate-300 transition hover:bg-white/[0.11]">Hoy</button>
                  <button onClick={() => goToWeek(7)} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/[0.11]" aria-label="Semana siguiente"><ChevronRight size={15} /></button>
                </>
              )}
              <button onClick={onClose} className="ml-1 inline-flex items-center justify-center rounded-lg bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/[0.11]" aria-label="Cerrar"><X size={15} /></button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {/* 'suggestion' no aparece en esta vista mensual (viene de datos
                efímeros en localStorage, no de camino_calendar) — se omite
                de la leyenda para no listar un tipo que nunca se ve aquí. */}
            {(Object.keys(CONTENT_TYPE_COLORS) as ContentType[]).filter(type => type !== 'suggestion').map(type => (
              <span key={type} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.08em] text-slate-400">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: CONTENT_TYPE_COLORS[type].dot, display: 'inline-block' }} />
                {CONTENT_TYPE_LABELS[type]}
              </span>
            ))}
          </div>
        </header>

        {hintsLoaded && !seenKeys.has('hint_calendario_mensual') && (
          <div className="mx-6 mt-4 flex shrink-0 items-start gap-3 rounded-xl border-l-[3px] border-blue-600 bg-slate-50 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[13px] font-black text-slate-900">Esta es tu agenda completa, no solo la de Kairo.</p>
              <p className="text-[12px] font-semibold leading-relaxed text-slate-500">
                Aquí ves tus misiones ({CONTENT_TYPE_LABELS.kairo_mission.toLowerCase()}) y tus parciales, y puedes añadir cualquier otra cosa
                tuya — deberes, extraescolares, estudio por tu cuenta. Cuenta a Kairo cómo prefieres organizarte con las notas de abajo
                y ajustará tus misiones a partir de ahí. El calendario semanal (Editar semana) sigue disponible tal cual.
              </p>
            </div>
            <button onClick={() => markSeen('hint_calendario_mensual')} className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-600" aria-label="Cerrar explicación"><X size={14} /></button>
          </div>
        )}

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

          {viewMode === 'month' ? (
            /* Month grid */
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 py-5">
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {WEEKDAY_LABELS.map(label => (
                  <div key={label} className="pb-1 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-7 gap-1.5" style={{ gridAutoRows: 'minmax(84px, 1fr)' }}>
                {grid.map(dateISO => {
                  const inMonth = dateISO.slice(0, 7) === monthCursor.slice(0, 7)
                  const isToday = dateISO === today
                  const isSelected = dateISO === selectedDate
                  const items = itemsForDate(dateISO)
                  return (
                    <button
                      key={dateISO}
                      type="button"
                      onClick={() => setSelectedDate(dateISO)}
                      className="flex flex-col items-stretch rounded-lg p-1.5 text-left transition-all"
                      style={{
                        background: isSelected ? '#eff6ff' : 'white',
                        border: `1.5px solid ${isSelected ? '#2563eb' : isToday ? 'rgba(37,99,235,.35)' : '#f1f5f9'}`,
                        opacity: inMonth ? 1 : 0.4,
                      }}
                    >
                      <span
                        className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black"
                        style={{ background: isToday ? '#2563eb' : 'transparent', color: isToday ? 'white' : '#334155' }}
                      >
                        {parseInt(dateISO.slice(-2), 10)}
                      </span>
                      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                        {items.slice(0, 3).map(item => (
                          <span
                            key={item.key}
                            className="truncate rounded px-1 py-0.5 text-[9px] font-bold"
                            style={{
                              background: CONTENT_TYPE_COLORS[item.type].bg,
                              color: CONTENT_TYPE_COLORS[item.type].text,
                              textDecoration: item.done ? 'line-through' : 'none',
                            }}
                          >
                            {item.title}
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span className="text-[9px] font-black text-slate-400">+{items.length - 3} más</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {loading && <p className="mt-3 text-center text-[11px] font-bold text-slate-400">Cargando…</p>}
            </div>
          ) : (
            /* Vista por horas: agenda semanal tipo Google Calendar, misma
               fuente de datos (missions/customEvents/exams) que el grid
               mensual — ampliación, no un calendario paralelo. */
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
              <WeekHourView
                weekStartISO={weekStartISO}
                today={today}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                itemsForDate={itemsForDate}
              />
              {loading && <p className="mt-2 text-center text-[11px] font-bold text-slate-400">Cargando…</p>}
            </div>
          )}

          {/* Day detail + notes panel */}
          <div className="flex w-full shrink-0 flex-col overflow-y-auto overscroll-contain border-t border-[#f1f5f9] bg-[#fafbfc] px-6 py-5 lg:w-[340px] lg:border-l lg:border-t-0">
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-black text-slate-900">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
                </p>
                <button
                  onClick={() => setShowEventForm(v => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus size={12} /> Añadir evento
                </button>
              </div>

              {showEventForm && (
                <div className="mb-3 rounded-xl border border-[#e2e8f0] bg-white p-3">
                  <input
                    value={eventDraft.title}
                    onChange={e => setEventDraft({ ...eventDraft, title: e.target.value.slice(0, 120) })}
                    placeholder="Ej: Entreno de fútbol, Deberes de física..."
                    className="mb-2 w-full rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2.5 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-blue-200 focus:bg-white"
                  />
                  <div className="mb-2">
                    <select
                      value={eventDraft.category}
                      onChange={e => setEventDraft({ ...eventDraft, category: e.target.value as CustomEventCategory })}
                      className="w-full rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2 py-2 text-[11px] font-bold text-slate-700 outline-none"
                    >
                      {CUSTOM_EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{CUSTOM_EVENT_CATEGORY_LABELS[cat]}</option>)}
                    </select>
                  </div>
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[.08em] text-slate-400">Empieza</span>
                      <input
                        type="time"
                        value={eventDraft.startTime}
                        onChange={e => setEventDraft({ ...eventDraft, startTime: e.target.value })}
                        className="rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2 py-2 text-[11px] font-bold text-slate-700 outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[.08em] text-slate-400">Termina</span>
                      <input
                        type="time"
                        value={eventDraft.endTime}
                        onChange={e => setEventDraft({ ...eventDraft, endTime: e.target.value })}
                        className="rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2 py-2 text-[11px] font-bold text-slate-700 outline-none"
                      />
                    </label>
                  </div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={eventDraft.recurrence === 'weekly'}
                      onChange={e => setEventDraft({ ...eventDraft, recurrence: e.target.checked ? 'weekly' : 'none' })}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Se repite cada {WEEKDAY_LABELS_FULL[mondayBasedDayIndex(selectedDate)].toLowerCase()}
                  </label>
                  {eventDraft.recurrence === 'weekly' && (
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      Hasta (opcional)
                      <input
                        type="date"
                        value={eventDraft.recurrenceUntil}
                        onChange={e => setEventDraft({ ...eventDraft, recurrenceUntil: e.target.value })}
                        className="rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
                      />
                    </label>
                  )}
                  <textarea
                    value={eventDraft.description}
                    onChange={e => setEventDraft({ ...eventDraft, description: e.target.value.slice(0, 500) })}
                    placeholder="Notas (opcional)"
                    rows={2}
                    className="mb-2 w-full rounded-lg border border-[#f1f5f9] bg-[#fafbfc] px-2.5 py-2 text-[11px] font-semibold text-slate-600 outline-none"
                    style={{ resize: 'vertical' }}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowEventForm(false)} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[11px] font-black text-slate-500">Cancelar</button>
                    <button onClick={saveNewEvent} disabled={!eventDraft.title.trim() || savingEvent} className="rounded-lg bg-[#0f172a] px-3 py-1.5 text-[11px] font-black text-white disabled:opacity-40">
                      {savingEvent ? 'Guardando…' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {selectedItems.length === 0 && (
                  <p className="text-[11px] font-semibold text-slate-400">Nada programado este día.</p>
                )}
                {selectedItems.map(item => (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2"
                    style={{ background: CONTENT_TYPE_COLORS[item.type].bg, borderColor: CONTENT_TYPE_COLORS[item.type].border }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: CONTENT_TYPE_COLORS[item.type].dot, flexShrink: 0 }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-black" style={{ color: CONTENT_TYPE_COLORS[item.type].text, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</p>
                      {item.subtitle && <p className="truncate text-[10px] font-semibold text-slate-500">{item.subtitle}</p>}
                    </div>
                    {item.done && <Check size={13} className="shrink-0 text-emerald-600" />}
                    {item.onDelete && (
                      <button onClick={item.onDelete} className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-red-500" aria-label="Eliminar evento"><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI notes / instructions — same perfiles.custom_instructions field as Ajustes */}
            <div className="mt-auto border-t border-[#e2e8f0] pt-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" />
                <p className="text-[11px] font-black uppercase tracking-[.1em] text-slate-500">Notas para Kairo</p>
              </div>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value.slice(0, 600)); setNotesSaved(false) }}
                placeholder={notesLoaded ? 'Ej: "no me pongas nada los findes por la mañana", "prefiero sesiones cortas entre semana"...' : 'Cargando tus notas…'}
                disabled={!notesLoaded}
                rows={3}
                className="w-full rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-blue-200 disabled:opacity-60"
                style={{ resize: 'vertical' }}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-slate-400">Es el mismo campo que Ajustes → Personalización IA — se usa al preparar tus misiones y tus parciales.</p>
                <button
                  onClick={saveNotes}
                  disabled={!notesLoaded || notesSaving || notesSaved}
                  className="shrink-0 rounded-lg bg-[#0f172a] px-3 py-1.5 text-[11px] font-black text-white disabled:opacity-40"
                >
                  {notesSaving ? 'Guardando…' : notesSaved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

export function MonthCalendarButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[11px] font-black text-[#334155] transition hover:bg-slate-50">
      <CalendarDays size={13} /> Ver mes
    </button>
  )
}
