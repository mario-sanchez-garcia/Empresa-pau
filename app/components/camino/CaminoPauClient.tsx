'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Flame, GraduationCap, RotateCcw, Route, Sparkles, Target, TrendingUp } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import DailyTaskCard from '@/app/components/camino/DailyTaskCard'
import MissionCard from '@/app/components/camino/MissionCard'
import ProgressPath from '@/app/components/camino/ProgressPath'
import RouteCard from '@/app/components/camino/RouteCard'
import { dailyTasks, nextObjectives } from '@/app/lib/camino/caminoData'
import {
  completeCaminoTask,
  completedTasksForDate,
  createInitialProgress,
  loadCaminoProgress,
  resetCaminoProgress,
  saveCaminoProgress,
  setCaminoRoute,
  todayKey,
  type CaminoProgress
} from '@/app/lib/camino/caminoProgress'
import type { CaminoRouteId, DailyCaminoTask } from '@/app/lib/camino/caminoData'

export default function CaminoPauClient() {
  const dayKey = useMemo(() => todayKey(), [])
  const [progress, setProgress] = useState<CaminoProgress>(() => createInitialProgress(dayKey))
  const [ready, setReady] = useState(false)
  const tasksRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setProgress(loadCaminoProgress(dayKey))
    setReady(true)
  }, [dayKey])

  useEffect(() => {
    if (ready) saveCaminoProgress(progress)
  }, [progress, ready])

  const completedTaskIds = completedTasksForDate(progress, dayKey)
  const completedCount = completedTaskIds.length
  const missionCompleted = completedCount === dailyTasks.length
  const missionProgress = Math.round((completedCount / dailyTasks.length) * 100)

  function handleCompleteTask(task: DailyCaminoTask) {
    setProgress(current => completeCaminoTask(current, dayKey, task, dailyTasks))
  }

  function handleRouteChange(routeId: CaminoRouteId) {
    setProgress(current => setCaminoRoute(current, routeId))
  }

  function handleReset() {
    setProgress(resetCaminoProgress(dayKey))
  }

  function scrollToTasks() {
    tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.88),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),radial-gradient(circle_at_82%_82%,rgba(186,230,253,0.45),transparent_30%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-slate-900 max-lg:block">
      <Sidebar activeItem="camino" />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-[#dbe7fb] bg-white/80 px-8 py-3 backdrop-blur-xl max-md:px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_18px_42px_rgba(37,99,235,0.26)]">
                <Route size={27} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Camino PAU</h1>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-blue-700">MVP interno</span>
                </div>
                <p className="text-sm font-bold text-slate-500">Tu misión diaria para llegar preparado a la PAU</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Cada día sabes exactamente qué estudiar.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            >
              <RotateCcw size={13} /> Reset progreso
            </button>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-5 p-5 max-md:p-4">
          <MissionCard
            routeId={progress.selectedRouteId}
            completedCount={completedCount}
            totalTasks={dailyTasks.length}
            missionCompleted={missionCompleted}
            onPrimaryAction={scrollToTasks}
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Flame size={19} />} label="Racha actual" value={`${progress.streakDays} días`} tone="amber" />
            <MetricCard icon={<Sparkles size={19} />} label="XP total" value={formatNumber(progress.xpTotal)} tone="blue" />
            <MetricCard icon={<GraduationCap size={19} />} label="Nivel Matemáticas II" value={String(progress.levelBySubject.mates)} tone="slate" />
            <MetricCard icon={<TrendingUp size={19} />} label="Progreso hacia la PAU" value={`${progress.progressTowardsPau}%`} tone="emerald" />
          </section>

          <section ref={tasksRef} className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tareas del día</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Tu misión de hoy</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${missionCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {missionCompleted ? 'Misión completada' : `${completedCount}/${dailyTasks.length} completadas`}
                </span>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 transition-all duration-500" style={{ width: `${missionProgress}%` }} />
              </div>
              <div className="grid gap-3">
                {dailyTasks.map(task => (
                  <DailyTaskCard key={task.id} task={task} completed={completedTaskIds.includes(task.id)} onComplete={handleCompleteTask} />
                ))}
              </div>
            </div>

            <div className="grid content-start gap-6">
              <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={handleRouteChange} />
              <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Próximos objetivos</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Lo que viene después</h2>
                <div className="mt-4 grid gap-3">
                  {nextObjectives.map(item => (
                    <div key={item.week} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-blue-700 shadow-sm">{item.week}</div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Semana {item.week}: {item.label}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <ProgressPath />

          <section className="grid gap-4 lg:grid-cols-3">
            <WhyCard title="No decides cada día" text="No tienes que decidir qué estudiar. Pausia te lo ordena." />
            <WhyCard title="Primero hábito" text="Primero hábito, luego bloques, después simulacros." />
            <WhyCard title="Ruta adaptable" text="Tu ruta se adapta según cuándo empiezas." />
          </section>

          <section className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50/70 p-5">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 shrink-0 text-blue-700" size={19} />
              <div>
                <p className="text-sm font-bold leading-6 text-blue-950">Las tareas ya te llevan a las zonas reales de Pausia. La personalización automática — tareas generadas desde tu progreso, historial de errores e IA — llegará en la siguiente fase.</p>
                <p className="mt-1 text-xs font-semibold text-blue-500">Vista previa interna · Sin persistencia real todavía</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'amber' | 'blue' | 'slate' | 'emerald' }) {
  const toneClass = {
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  }[tone]

  return (
    <article className="rounded-[26px] border border-[#dbe7fb] bg-white/90 p-4 shadow-[0_16px_42px_rgba(37,99,235,0.07)]">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClass}`}>{icon}</div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">{value}</p>
    </article>
  )
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[26px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_16px_42px_rgba(37,99,235,0.07)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><CalendarDays size={18} /></div>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p>
    </article>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value)
}
