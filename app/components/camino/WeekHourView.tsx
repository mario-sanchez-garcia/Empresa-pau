'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS, type ContentType } from '@/app/lib/camino/contentTypeColors'
import { addDays } from '@/app/lib/camino/studyDays'

export type HourViewItem = {
  key: string
  type: ContentType
  title: string
  subtitle?: string
  done?: boolean
  /** "HH:MM", null = sin hora asignada (se muestra aparte, arriba de la rejilla). */
  start: string | null
  end: string | null
  onDelete?: () => void
}

const WEEKDAY_LABELS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOUR_START = 7
const HOUR_END = 23
const HOUR_PX = 52
const GRID_HEIGHT = (HOUR_END - HOUR_START) * HOUR_PX

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

function hourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

type PositionedItem = HourViewItem & { top: number; height: number; lane: number; laneCount: number }

// Asigna "carriles" (lanes) a los bloques que se solapan en el tiempo, para
// que dos cosas a la misma hora se vean una al lado de la otra en vez de
// una tapando a la otra — igual que hace Google Calendar. En la práctica es
// raro (el motor de Kairo ya evita el horario ocupado al colocar sus
// misiones), pero un evento propio añadido DESPUÉS de que Kairo ya
// programara algo a esa hora sí puede coincidir, y el horario del alumno
// manda siempre sobre lo que proponga Kairo.
function layoutDay(items: HourViewItem[]): PositionedItem[] {
  const timed = items
    .filter((item): item is HourViewItem & { start: string; end: string } => Boolean(item.start && item.end))
    .map(item => ({ ...item, startMin: toMinutes(item.start), endMin: Math.max(toMinutes(item.end), toMinutes(item.start) + 15) }))
    .sort((a, b) => a.startMin - b.startMin)

  const lanes: { endMin: number }[] = []
  const placed = timed.map(item => {
    let lane = lanes.findIndex(l => l.endMin <= item.startMin)
    if (lane === -1) { lane = lanes.length; lanes.push({ endMin: item.endMin }) }
    else lanes[lane].endMin = item.endMin
    return { ...item, lane }
  })

  // Cuántos carriles se solapan de verdad con cada bloque (no solo el total
  // global) — así un bloque que no coincide con nadie ocupa el ancho entero
  // aunque haya solapes en otra franja horaria del mismo día.
  return placed.map(item => {
    const overlapping = placed.filter(other => other.startMin < item.endMin && other.endMin > item.startMin)
    const laneCount = Math.max(1, ...overlapping.map(o => o.lane + 1))
    const clampedStart = Math.max(item.startMin, HOUR_START * 60)
    const clampedEnd = Math.min(item.endMin, HOUR_END * 60)
    return {
      ...item,
      top: (clampedStart - HOUR_START * 60) / 60 * HOUR_PX,
      height: Math.max(18, (clampedEnd - clampedStart) / 60 * HOUR_PX),
      laneCount,
    }
  })
}

function NowLine() {
  const [topPx, setTopPx] = useState<number | null>(null)
  useEffect(() => {
    function update() {
      const now = new Date()
      const madridStr = now.toLocaleTimeString('sv-SE', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })
      const minutes = toMinutes(madridStr)
      if (minutes < HOUR_START * 60 || minutes > HOUR_END * 60) { setTopPx(null); return }
      setTopPx((minutes - HOUR_START * 60) / 60 * HOUR_PX)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])
  if (topPx == null) return null
  return (
    <div className="pointer-events-none absolute left-0 right-0 z-10" style={{ top: topPx }}>
      <div className="relative">
        <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-red-500" />
        <div className="border-t border-red-400" />
      </div>
    </div>
  )
}

export default function WeekHourView({
  weekStartISO,
  today,
  selectedDate,
  onSelectDate,
  itemsForDate,
}: {
  weekStartISO: string
  today: string
  selectedDate: string
  onSelectDate: (date: string) => void
  itemsForDate: (dateISO: string) => HourViewItem[]
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStartISO, i)), [weekStartISO])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex overflow-x-auto">
        <div className="w-12 shrink-0" />
        {days.map((dateISO, i) => {
          const isToday = dateISO === today
          const isSelected = dateISO === selectedDate
          return (
            <button
              key={dateISO}
              type="button"
              onClick={() => onSelectDate(dateISO)}
              className="flex min-w-[92px] flex-1 flex-col items-center gap-0.5 border-b-2 py-2 transition-colors"
              style={{ borderColor: isSelected ? '#2563eb' : 'transparent' }}
            >
              <span className="text-[9px] font-black uppercase tracking-[.1em] text-slate-400">{WEEKDAY_LABELS_SHORT[i]}</span>
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-black"
                style={{ background: isToday ? '#2563eb' : 'transparent', color: isToday ? 'white' : '#334155' }}
              >
                {parseInt(dateISO.slice(-2), 10)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sin hora asignada — misiones/eventos que no tienen franja horaria */}
      <div className="flex border-b border-[#f1f5f9]">
        <div className="w-12 shrink-0 pt-1 text-center text-[8px] font-black uppercase text-slate-300">Sin hora</div>
        {days.map(dateISO => {
          const untimed = itemsForDate(dateISO).filter(item => !item.start)
          return (
            <div key={dateISO} className="flex min-w-[92px] flex-1 flex-col gap-1 px-1 py-1.5">
              {untimed.map(item => (
                <span
                  key={item.key}
                  className="truncate rounded px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    background: CONTENT_TYPE_COLORS[item.type].bg,
                    color: CONTENT_TYPE_COLORS[item.type].text,
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}
                  title={item.title}
                >
                  {item.title}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <div className="flex flex-1 overflow-y-auto overflow-x-auto">
        <div className="w-12 shrink-0">
          {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i).map(hour => (
            <div key={hour} style={{ height: HOUR_PX }} className="relative">
              <span className="absolute -top-[7px] right-1.5 text-[9px] font-bold text-slate-300">{hourLabel(hour)}</span>
            </div>
          ))}
        </div>
        {days.map(dateISO => {
          const positioned = layoutDay(itemsForDate(dateISO))
          const isToday = dateISO === today
          return (
            <div key={dateISO} className="relative min-w-[92px] flex-1 border-l border-[#f1f5f9]" style={{ height: GRID_HEIGHT }}>
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i).map(i => (
                <div key={i} className="absolute left-0 right-0 border-t border-[#f8fafc]" style={{ top: i * HOUR_PX }} />
              ))}
              {isToday && <NowLine />}
              {positioned.map(item => (
                <div
                  key={item.key}
                  className="group absolute overflow-hidden rounded-md border px-1.5 py-0.5 text-left"
                  style={{
                    top: item.top,
                    height: item.height - 2,
                    left: `${(item.lane / item.laneCount) * 100}%`,
                    width: `${100 / item.laneCount}%`,
                    background: CONTENT_TYPE_COLORS[item.type].bg,
                    borderColor: CONTENT_TYPE_COLORS[item.type].border,
                  }}
                  title={item.title}
                >
                  <p
                    className="truncate text-[9px] font-black leading-tight"
                    style={{ color: CONTENT_TYPE_COLORS[item.type].text, textDecoration: item.done ? 'line-through' : 'none' }}
                  >
                    {item.title}
                  </p>
                  {item.height > 32 && item.start && (
                    <p className="truncate text-[8px] font-semibold text-slate-500">{item.start}–{item.end}</p>
                  )}
                  {item.done && <Check size={10} className="absolute right-1 top-1 text-emerald-600" />}
                  {item.onDelete && (
                    <button
                      onClick={e => { e.stopPropagation(); item.onDelete?.() }}
                      className="absolute right-1 top-1 hidden rounded p-0.5 text-slate-400 hover:bg-white hover:text-red-500 group-hover:block"
                      aria-label="Eliminar evento"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-[#f1f5f9] px-1 pt-2">
        {(Object.keys(CONTENT_TYPE_COLORS) as ContentType[]).map(type => (
          <span key={type} className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.08em] text-slate-400">
            <span style={{ width: 7, height: 7, borderRadius: 999, background: CONTENT_TYPE_COLORS[type].dot, display: 'inline-block' }} />
            {CONTENT_TYPE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  )
}
