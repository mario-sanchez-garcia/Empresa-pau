'use client'

import type { ReactNode } from 'react'
import { CalendarDays, CheckCircle2, Flame, GraduationCap, RotateCcw, Route, Sparkles, Target, TrendingUp } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import DailyTaskCard from '@/app/components/camino/DailyTaskCard'
import MissionCard from '@/app/components/camino/MissionCard'
import ProgressPath from '@/app/components/camino/ProgressPath'
import RouteCard from '@/app/components/camino/RouteCard'
import { nextObjectives } from '@/app/lib/camino/caminoData'
import { completedTasksForDate } from '@/app/lib/camino/caminoProgress'
import { useCaminoProgress } from '@/app/hooks/useCaminoProgress'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'

export default function CaminoPauClient() {
  const {
    progress,
    loading,
    source,
    dayKey,
    currentTasks,
    weekContext,
    completeTask,
    changeRoute,
    resetProgress
  } = useCaminoProgress()

  const billing = useBillingStatus()

  const completedTaskIds = completedTasksForDate(progress, dayKey)
  const completedCount = completedTaskIds.length
  const totalTasks = currentTasks.length
  const missionCompleted = totalTasks > 0 && completedCount >= totalTasks
  const missionProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.88),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),radial-gradient(circle_at_82%_82%,rgba(186,230,253,0.45),transparent_30%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-slate-900 max-lg:block">
      <Sidebar activeItem="camino" />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-[#dbe7fb] bg-white/80 px-8 py-3 backdrop-blur-xl max-md:px-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_18px_42px_rgba(37,99,235,0.26)]">
              <Route size={27} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Camino PAU</h1>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                  source === 'supabase'
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border-blue-100 bg-blue-50 text-blue-700'
                }`}>
                  {source === 'supabase' ? 'En vivo' : 'Beta interna'}
                </span>
                {weekContext && (
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                    Semana {weekContext.semana} · {weekContext.faseLabel}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500">Tu misión diaria para llegar preparado a la PAU</p>
              {weekContext && (
                <p className="mt-0.5 text-xs font-semibold text-slate-400">{weekContext.objetivo}</p>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-5 p-5 max-md:p-4">
          <MissionCard
            routeId={progress.selectedRouteId}
            completedCount={completedCount}
            totalTasks={totalTasks}
            missionCompleted={missionCompleted}
            onPrimaryAction={() => {
              document.getElementById('camino-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />

          {/* Métricas */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Flame size={19} />} label="Racha actual" value={loading ? '–' : `${progress.streakDays} días`} tone="amber" />
            <MetricCard icon={<Sparkles size={19} />} label="XP total" value={loading ? '–' : formatNumber(progress.xpTotal)} tone="blue" />
            <MetricCard icon={<GraduationCap size={19} />} label="Nivel Matemáticas II" value={loading ? '–' : String(progress.levelBySubject.mates)} tone="slate" />
            <MetricCard icon={<TrendingUp size={19} />} label="Progreso hacia la PAU" value={loading ? '–' : `${progress.progressTowardsPau}%`} tone="emerald" />
          </section>

          {/* Tareas del día */}
          <section id="camino-tasks" className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
              {/* Cabecera de misión */}
              <div className="mb-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tareas del día</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      {weekContext ? `Semana ${weekContext.semana} · ${weekContext.objetivo}` : 'Tu misión de hoy'}
                    </h2>
                    {weekContext && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {weekContext.faseLabel} · {weekContext.duracion} estimados
                      </p>
                    )}
                  </div>
                  {missionCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                      <CheckCircle2 size={13} /> Misión completada
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {completedCount}/{totalTasks} completadas
                    </span>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 transition-all duration-500"
                    style={{ width: `${missionProgress}%` }}
                  />
                </div>

                {/* Mensaje de misión completada */}
                {missionCompleted && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Misión completada. Vuelve mañana para mantener la racha.
                  </p>
                )}
              </div>

              {/* Skeleton de carga */}
              {loading && (
                <div className="grid gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              )}

              {/* Lista de tareas */}
              {!loading && (
                <div className="grid gap-3">
                  {currentTasks.map(task => (
                    <DailyTaskCard
                      key={task.id}
                      task={task}
                      completed={completedTaskIds.includes(task.id)}
                      onComplete={completeTask}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar derecho */}
            <div className="grid content-start gap-6">
              <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={changeRoute} />

              {/* Próximos objetivos */}
              <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Próximos objetivos</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Lo que viene después</h2>
                <div className="mt-4 grid gap-3">
                  {nextObjectives.map(item => (
                    <div key={item.week} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-blue-700 shadow-sm">
                        {item.week}
                      </div>
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
            <WhyCard title="Ruta adaptable" text="Tu ruta ajusta la semana del currículum en la que empiezas." />
          </section>

          {/* Estado del progreso */}
          <section className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50/70 p-5">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 shrink-0 text-blue-700" size={19} />
              <div>
                {source === 'supabase' ? (
                  <>
                    <p className="text-sm font-bold leading-6 text-blue-950">Tu progreso se guarda automáticamente en Pausia. XP, racha y misiones están sincronizados en todos tus dispositivos.</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-blue-600">Las misiones se generan desde el currículum PAU de 38 semanas según tu ruta de entrada. La personalización por errores reales e IA llegará en la siguiente fase.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold leading-6 text-blue-950">Las tareas te acercan a las zonas reales de Pausia. La personalización automática llegará en la siguiente fase.</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-blue-600">Vista previa interna: XP, racha y tareas se guardan localmente en este dispositivo.</p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Pack Curso PAU — Parent Checkout */}
          <ParentLinkModule billing={billing} />

          {/* Opciones de demo */}
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Opciones de demo</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">Solo para pruebas internas</p>
            </div>
            <button
              type="button"
              onClick={resetProgress}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none"
            >
              <RotateCcw size={12} /> Reiniciar demo local
            </button>
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
