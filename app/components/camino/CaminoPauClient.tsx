'use client'

import type { ReactNode } from 'react'
import { CalendarDays, CheckCircle2, Flame, GraduationCap, RotateCcw, Route, Sparkles, Target, TrendingUp, Zap } from 'lucide-react'
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
    progress, loading, source, syncError, dayKey,
    currentTasks, weekContext, completeTask, changeRoute, resetProgress
  } = useCaminoProgress()

  const billing = useBillingStatus()
  const completedTaskIds = completedTasksForDate(progress, dayKey)
  const completedCount = completedTaskIds.length
  const totalTasks = currentTasks.length
  const missionCompleted = totalTasks > 0 && completedCount >= totalTasks
  const missionProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div
      className="max-lg:block pau-bg-atmosphere"
      style={{ display: 'flex', minHeight: '100vh', color: 'var(--pau-ink)' }}
    >
      <Sidebar activeItem="camino" />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <header
          className="pau-glass max-md:px-4"
          style={{
            position: 'sticky', top: 0, zIndex: 40,
            borderBottom: '1px solid var(--pau-border)',
            padding: '11px 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0, borderRadius: 13,
              background: 'linear-gradient(135deg, #1a43cc 0%, #2563eb 55%, #3b8ef8 100%)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}>
              <Route size={22} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--pau-ink)' }}>
                  Camino PAU
                </h1>
                <span className={`pau-badge ${source === 'supabase' ? 'pau-badge-green' : 'pau-badge-blue'}`}>
                  {source === 'supabase' ? 'En vivo' : 'Beta interna'}
                </span>
                {weekContext && (
                  <span className="pau-badge" style={{ background: 'var(--pau-surface-1)', color: 'var(--pau-muted)', border: '1px solid var(--pau-border)' }}>
                    Semana {weekContext.semana} · {weekContext.faseLabel}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: 'var(--pau-muted)' }}>
                Tu misión diaria para llegar preparado a la PAU
              </p>
            </div>
          </div>
        </header>

        {/* Sync warning */}
        {syncError && !loading && (
          <div style={{ margin: '12px 20px 0' }} className="pau-info">
            <Target size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Modo local — no se pudo sincronizar. Tu progreso se guarda en este dispositivo.
          </div>
        )}

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 20px 48px' }} className="max-md:px-4">

          <div className="pau-reveal">
            <MissionCard
              routeId={progress.selectedRouteId}
              completedCount={completedCount}
              totalTasks={totalTasks}
              missionCompleted={missionCompleted}
              onPrimaryAction={() => {
                document.getElementById('camino-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
          </div>

          {/* ── Metrics ──────────────────────────────────────────────── */}
          <section
            style={{ display: 'grid', gap: 10, marginTop: 14 }}
            className="md:grid-cols-2 xl:grid-cols-4 pau-stagger"
          >
            <MetricCard
              icon={<Flame size={17} />}
              label="Racha actual"
              value={loading ? '–' : `${progress.streakDays}`}
              unit={loading ? '' : 'días'}
              tone="amber"
              sublabel="mantén la racha"
            />
            <MetricCard
              icon={<Sparkles size={17} />}
              label="XP total"
              value={loading ? '–' : formatNumber(progress.xpTotal)}
              unit=""
              tone="blue"
              sublabel="puntos acumulados"
            />
            <MetricCard
              icon={<Zap size={17} />}
              label="Nivel Matemáticas"
              value={loading ? '–' : String(progress.levelBySubject.mates)}
              unit=""
              tone="violet"
              sublabel="nivel actual"
            />
            <MetricCard
              icon={<TrendingUp size={17} />}
              label="Progreso PAU"
              value={loading ? '–' : String(progress.progressTowardsPau)}
              unit="%"
              tone="emerald"
              sublabel="del temario cubierto"
            />
          </section>

          {/* ── Tasks + sidebar ────────────────────────────────────── */}
          <section id="camino-tasks" style={{ display: 'grid', gap: 14, marginTop: 14 }} className="xl:grid-cols-[1fr_356px]">

            {/* Task card — double-bezel */}
            <div className="pau-card-bezel pau-reveal pau-reveal-delay-1">
              <div className="pau-card-bezel-inner" style={{ padding: '20px 20px 16px' }}>
                {/* Card header */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--pau-ink)', letterSpacing: '-0.02em' }}>
                        {weekContext ? `Semana ${weekContext.semana} · ${weekContext.objetivo}` : 'Tu misión de hoy'}
                      </h2>
                      {weekContext && (
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, fontWeight: 600, color: 'var(--pau-soft)' }}>
                          {weekContext.faseLabel} · {weekContext.duracion} estimados
                        </p>
                      )}
                    </div>
                    {missionCompleted ? (
                      <span className="pau-badge pau-badge-mint" style={{ gap: 5 }}>
                        <CheckCircle2 size={11} /> Misión completada
                      </span>
                    ) : (
                      <span className="pau-badge pau-badge-blue">
                        {completedCount}/{totalTasks} completadas
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="pau-progress-bar" style={{ height: 5 }}>
                    <div
                      className="pau-progress-fill"
                      style={{ transform: `scaleX(${missionProgress / 100})` }}
                      role="progressbar"
                      aria-valuenow={missionProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progreso misión: ${missionProgress}%`}
                    />
                  </div>

                  {missionCompleted && (
                    <p style={{ margin: '7px 0 0', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                      Misión completada. Vuelve mañana para mantener la racha.
                    </p>
                  )}
                </div>

                {/* Skeleton */}
                {loading && (
                  <div style={{ display: 'grid', gap: 9 }}>
                    {[1, 2, 3].map(i => <div key={i} className="pau-skeleton" style={{ height: 74 }} />)}
                  </div>
                )}

                {/* Task list */}
                {!loading && (
                  <div className="pau-stagger" style={{ display: 'grid', gap: 9 }}>
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
            </div>

            {/* Right column */}
            <div style={{ display: 'grid', alignContent: 'start', gap: 12 }} className="pau-reveal pau-reveal-delay-2">
              <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={changeRoute} />

              {/* Next objectives */}
              <section style={{ borderRadius: 'var(--r-xl)', background: '#fff', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--pau-ink)', letterSpacing: '-0.01em' }}>
                  Lo que viene
                </h2>
                <div style={{ display: 'grid', gap: 8 }}>
                  {nextObjectives.map((item, i) => (
                    <div key={item.week} style={{
                      display: 'flex', gap: 10, padding: '9px 10px',
                      borderRadius: 10,
                      background: i === 0 ? 'linear-gradient(135deg, rgba(239,246,255,0.9), rgba(224,236,255,0.6))' : 'var(--pau-surface-1)',
                      border: `1px solid ${i === 0 ? 'rgba(190,218,255,0.8)' : 'var(--pau-border)'}`,
                    }}>
                      <div style={{
                        width: 32, height: 32, flexShrink: 0, borderRadius: 8,
                        background: i === 0 ? 'linear-gradient(135deg, #2563eb, #3b8ef8)' : '#fff',
                        border: i === 0 ? 'none' : '1px solid var(--pau-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900,
                        color: i === 0 ? '#fff' : '#2563eb',
                        boxShadow: i === 0 ? '0 4px 10px rgba(37,99,235,0.22)' : 'var(--shadow-xs)',
                      }}>
                        {item.week}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--pau-ink)', letterSpacing: '-0.01em' }}>
                          Semana {item.week}: {item.label}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--pau-muted)' }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <div className="pau-reveal pau-reveal-delay-3">
            <ProgressPath />
          </div>

          {/* ── Why cards ─────────────────────────────────────────── */}
          <section style={{ display: 'grid', gap: 12, marginTop: 14 }} className="lg:grid-cols-3 pau-stagger">
            <WhyCard
              title="No decides cada día"
              text="No tienes que decidir qué estudiar. Pausia te lo ordena según el currículum PAU real."
              icon="01"
            />
            <WhyCard
              title="Primero hábito"
              text="Primero hábito, luego bloques temáticos, después simulacros completos."
              icon="02"
            />
            <WhyCard
              title="Ruta adaptable"
              text="Tu ruta ajusta la semana del currículum en la que empiezas, no desde cero."
              icon="03"
            />
          </section>

          {/* ── Sync status ───────────────────────────────────────── */}
          <section className="pau-info" style={{ marginTop: 12, alignItems: 'flex-start' }}>
            <Target size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              {source === 'supabase' ? (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                    Tu progreso se guarda automáticamente. XP, racha y misiones sincronizados.
                  </p>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Las misiones se generan desde el currículum PAU de 38 semanas según tu ruta de entrada.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                    Las tareas te acercan a las zonas reales de Pausia.
                  </p>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Vista previa interna: XP, racha y tareas se guardan localmente en este dispositivo.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ── Parent checkout ───────────────────────────────────── */}
          <div style={{ marginTop: 12 }}>
            <ParentLinkModule billing={billing} />
          </div>

          {/* Demo reset */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetProgress}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 7,
                border: '1px solid var(--pau-border)', background: 'transparent',
                fontSize: 11, fontWeight: 600, color: 'var(--pau-soft)',
                cursor: 'pointer', transition: 'color 150ms, border-color 150ms',
              }}
            >
              <RotateCcw size={10} aria-hidden="true" /> Reiniciar demo local
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── MetricCard ─────────────────────────────────────────────────── */
type MetricTone = 'amber' | 'blue' | 'slate' | 'emerald' | 'violet'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string
  unit: string
  tone: MetricTone
  sublabel?: string
}

const METRIC_TONES: Record<MetricTone, { bg: string; iconBg: string; color: string; border: string; valueBg: string }> = {
  amber:   { bg: 'linear-gradient(145deg,rgba(255,251,235,0.9),rgba(254,243,199,0.7))', iconBg: 'rgba(245,158,11,0.14)', color: '#92400e', border: 'rgba(245,158,11,0.28)', valueBg: '#fef9e7' },
  blue:    { bg: 'linear-gradient(145deg,#eff6ff,#e8f2ff)', iconBg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe', valueBg: '#edf6ff' },
  slate:   { bg: 'linear-gradient(145deg,#f8fafc,#f1f5f9)', iconBg: '#e2e8f0', color: '#475569', border: '#cbd5e1', valueBg: '#f4f7fa' },
  emerald: { bg: 'linear-gradient(145deg,rgba(240,253,244,0.9),rgba(209,250,229,0.7))', iconBg: 'rgba(5,150,105,0.12)', color: '#065f46', border: 'rgba(5,150,105,0.22)', valueBg: '#effdf5' },
  violet:  { bg: 'linear-gradient(145deg,rgba(245,243,255,0.9),rgba(237,233,254,0.7))', iconBg: 'rgba(124,58,237,0.10)', color: '#5b21b6', border: 'rgba(124,58,237,0.20)', valueBg: '#f3f0ff' },
}

function MetricCard({ icon, label, value, unit, tone, sublabel }: MetricCardProps) {
  const t = METRIC_TONES[tone]
  return (
    <article
      className="pau-metric-card"
      style={{ background: t.bg, border: `1px solid ${t.border}` }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9, marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: t.iconBg, color: t.color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: t.color, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.85 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--pau-ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{unit}</span>}
      </div>
      {sublabel && (
        <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--pau-muted)' }}>
          {sublabel}
        </p>
      )}
    </article>
  )
}

/* ── WhyCard ────────────────────────────────────────────────────── */
function WhyCard({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <article style={{
      borderRadius: 'var(--r-xl)', padding: '18px 16px',
      background: '#fff', boxShadow: 'var(--shadow-xs)',
      transition: 'transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a43cc, #2563eb)',
        color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '-0.01em',
        boxShadow: '0 4px 10px rgba(37,99,235,0.24)',
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--pau-ink)', letterSpacing: '-0.015em', textWrap: 'balance' as never }}>
        {title}
      </h3>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--pau-muted)', lineHeight: 1.65, textWrap: 'pretty' as never }}>
        {text}
      </p>
    </article>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value)
}
