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
    syncError,
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
    <div
      className="max-lg:block"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 14% 10%, rgba(219,234,254,0.7), transparent 28%), radial-gradient(circle at 88% 6%, rgba(224,231,255,0.55), transparent 26%), linear-gradient(160deg, #fbfdff 0%, #f4f8fe 100%)',
        color: '#0f172a',
      }}
    >
      <Sidebar activeItem="camino" />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          borderBottom: '1px solid var(--pau-border)',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          padding: '12px 28px',
        }} className="max-md:px-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{
              width: 48, height: 48, flexShrink: 0, borderRadius: 14,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #38bdf8 100%)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 28px rgba(37,99,235,0.22)',
            }}>
              <Route size={24} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '-0.025em', color: '#0f172a' }}>
                  Camino PAU
                </h1>
                <span className={`pau-badge ${source === 'supabase' ? 'pau-badge-green' : 'pau-badge-blue'}`}>
                  {source === 'supabase' ? 'En vivo' : 'Beta interna'}
                </span>
                {weekContext && (
                  <span className="pau-badge" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Semana {weekContext.semana} · {weekContext.faseLabel}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                Tu misión diaria para llegar preparado a la PAU
              </p>
            </div>
          </div>
        </header>

        {/* Sync warning */}
        {syncError && !loading && (
          <div style={{ margin: '12px 20px 0' }} className="pau-info">
            <Target size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Modo local — no se pudo sincronizar con el servidor. Tu progreso se guarda en este dispositivo.
          </div>
        )}

        {/* Main */}
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 20px 40px' }} className="max-md:px-4">

          <MissionCard
            routeId={progress.selectedRouteId}
            completedCount={completedCount}
            totalTasks={totalTasks}
            missionCompleted={missionCompleted}
            onPrimaryAction={() => {
              document.getElementById('camino-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />

          {/* Metrics */}
          <section style={{ display: 'grid', gap: 12, marginTop: 16 }} className="md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Flame size={18} />} label="Racha actual" value={loading ? '–' : `${progress.streakDays} días`} tone="amber" />
            <MetricCard icon={<Sparkles size={18} />} label="XP total" value={loading ? '–' : formatNumber(progress.xpTotal)} tone="blue" />
            <MetricCard icon={<GraduationCap size={18} />} label="Nivel Matemáticas II" value={loading ? '–' : String(progress.levelBySubject.mates)} tone="slate" />
            <MetricCard icon={<TrendingUp size={18} />} label="Progreso PAU" value={loading ? '–' : `${progress.progressTowardsPau}%`} tone="emerald" />
          </section>

          {/* Tasks + sidebar */}
          <section id="camino-tasks" style={{ display: 'grid', gap: 16, marginTop: 16 }} className="xl:grid-cols-[1fr_360px]">
            {/* Task card */}
            <div style={{
              background: '#fff', border: '1px solid var(--pau-border)',
              borderRadius: 20, padding: '20px 20px 16px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Card header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.015em' }}>
                      {weekContext ? `Semana ${weekContext.semana} · ${weekContext.objetivo}` : 'Tu misión de hoy'}
                    </h2>
                    {weekContext && (
                      <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                        {weekContext.faseLabel} · {weekContext.duracion} estimados
                      </p>
                    )}
                  </div>
                  {missionCompleted ? (
                    <span className="pau-badge pau-badge-green" style={{ gap: 5 }}>
                      <CheckCircle2 size={12} /> Misión completada
                    </span>
                  ) : (
                    <span className="pau-badge pau-badge-blue">
                      {completedCount}/{totalTasks} completadas
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="pau-progress-bar">
                  <div
                    className="pau-progress-fill"
                    style={{ width: `${missionProgress}%` }}
                    role="progressbar"
                    aria-valuenow={missionProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso misión: ${missionProgress}%`}
                  />
                </div>

                {missionCompleted && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                    Misión completada. Vuelve mañana para mantener la racha.
                  </p>
                )}
              </div>

              {/* Skeleton */}
              {loading && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="pau-skeleton" style={{ height: 76 }} />
                  ))}
                </div>
              )}

              {/* Task list */}
              {!loading && (
                <div className="pau-stagger" style={{ display: 'grid', gap: 10 }}>
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

            {/* Right column */}
            <div style={{ display: 'grid', alignContent: 'start', gap: 16 }}>
              <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={changeRoute} />

              {/* Next objectives */}
              <section style={{
                background: '#fff', border: '1px solid var(--pau-border)',
                borderRadius: 20, padding: 18, boxShadow: 'var(--shadow-sm)',
              }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Lo que viene</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {nextObjectives.map(item => (
                    <div key={item.week} style={{
                      display: 'flex', gap: 12, padding: '10px 12px',
                      borderRadius: 12, background: '#f8fbff',
                      border: '1px solid var(--pau-border)',
                    }}>
                      <div style={{
                        width: 36, height: 36, flexShrink: 0, borderRadius: 10,
                        background: '#fff', border: '1px solid var(--pau-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 900, color: '#2563eb',
                        boxShadow: 'var(--shadow-xs)',
                      }}>
                        {item.week}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                          Semana {item.week}: {item.label}
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <ProgressPath />

          {/* Why cards */}
          <section style={{ display: 'grid', gap: 14, marginTop: 16 }} className="lg:grid-cols-3">
            <WhyCard title="No decides cada día" text="No tienes que decidir qué estudiar. Pausia te lo ordena." />
            <WhyCard title="Primero hábito" text="Primero hábito, luego bloques, después simulacros." />
            <WhyCard title="Ruta adaptable" text="Tu ruta ajusta la semana del currículum en la que empiezas." />
          </section>

          {/* Progress state */}
          <section className="pau-info" style={{ marginTop: 14, alignItems: 'flex-start' }}>
            <Target size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              {source === 'supabase' ? (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                    Tu progreso se guarda automáticamente. XP, racha y misiones sincronizados.
                  </p>
                  <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Las misiones se generan desde el currículum PAU de 38 semanas según tu ruta de entrada.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                    Las tareas te acercan a las zonas reales de Pausia.
                  </p>
                  <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Vista previa interna: XP, racha y tareas se guardan localmente en este dispositivo.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Parent checkout */}
          <div style={{ marginTop: 14 }}>
            <ParentLinkModule billing={billing} />
          </div>

          {/* Demo reset — discrete */}
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetProgress}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: 'transparent',
                fontSize: 11, fontWeight: 600, color: '#94a3b8',
                cursor: 'pointer', transition: 'color 150ms, border-color 150ms',
              }}
            >
              <RotateCcw size={11} aria-hidden="true" /> Reiniciar demo local
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: 'amber' | 'blue' | 'slate' | 'emerald' }) {
  const tones = {
    amber: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', iconBg: '#fef3c7' },
    blue:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', iconBg: '#dbeafe' },
    slate: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', iconBg: '#f1f5f9' },
    emerald: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', iconBg: '#dcfce7' },
  }[tone]

  return (
    <article style={{
      background: '#fff', border: '1px solid var(--pau-border)',
      borderRadius: 16, padding: '16px 16px 14px',
      boxShadow: 'var(--shadow-xs)',
      transition: 'box-shadow 200ms var(--ease-out), transform 200ms var(--ease-out)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tones.iconBg, color: tones.color,
        border: `1px solid ${tones.border}`,
      }}>
        {icon}
      </div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1 }}>
        {value}
      </p>
    </article>
  )
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <article style={{
      background: '#fff', border: '1px solid var(--pau-border)',
      borderRadius: 16, padding: 18,
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
      }}>
        <CalendarDays size={17} />
      </div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 600, color: '#64748b', lineHeight: 1.65 }}>{text}</p>
    </article>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value)
}
