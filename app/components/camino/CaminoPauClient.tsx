'use client'

import { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, RotateCcw, Sparkles, Target, TrendingUp, Zap } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import DailyTaskCard from '@/app/components/camino/DailyTaskCard'
import MissionCard from '@/app/components/camino/MissionCard'
import ProgressPath from '@/app/components/camino/ProgressPath'
import RouteCard from '@/app/components/camino/RouteCard'
import { nextObjectives } from '@/app/lib/camino/caminoData'
import type { DailyCaminoTask } from '@/app/lib/camino/caminoData'
import { completedTasksForDate } from '@/app/lib/camino/caminoProgress'
import { useCaminoProgress } from '@/app/hooks/useCaminoProgress'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'

const CONFETTI_COLORS = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#ec4899', '#0ea5e9', '#16a34a']

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n: number) { return new Intl.NumberFormat('es-ES').format(n) }

// ─── Main component ────────────────────────────────────────────────────────────

export default function CaminoPauClient() {
  const {
    progress, loading, source, syncError, dayKey,
    currentTasks, weekContext, completeTask, changeRoute, resetProgress,
  } = useCaminoProgress()
  const billing = useBillingStatus()

  const completedTaskIds = completedTasksForDate(progress, dayKey)
  const completedCount   = completedTaskIds.length
  const totalTasks       = currentTasks.length
  const missionCompleted = totalTasks > 0 && completedCount >= totalTasks
  const missionProgress  = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  // XP notification toast
  const [xpNotif, setXpNotif]   = useState<{ xp: number; id: number } | null>(null)
  const xpTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function handleCompleteTask(task: DailyCaminoTask) {
    completeTask(task)
    setXpNotif({ xp: task.xp, id: Date.now() })
    clearTimeout(xpTimer.current)
    xpTimer.current = setTimeout(() => setXpNotif(null), 1900)
  }

  // Confetti canvas
  const confettiRef      = useRef<HTMLCanvasElement>(null)
  const prevCompleted    = useRef(false)

  useEffect(() => {
    if (missionCompleted && !prevCompleted.current) fireConfetti()
    prevCompleted.current = missionCompleted
  }, [missionCompleted])

  function fireConfetti() {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H; canvas.style.display = 'block'
    const ps = Array.from({ length: 120 }, () => ({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.55, y: H * 0.3,
      vx: (Math.random() - 0.5) * 16, vy: -(Math.random() * 12 + 3),
      w: Math.random() * 10 + 4, h: Math.random() * 4 + 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 11, alpha: 1,
    }))
    let raf: number
    function tick() {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      for (const p of ps) {
        if (p.alpha <= 0) continue; alive = true
        p.vy += 0.36; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.rotV
        if (p.y > H * 0.76) p.alpha -= 0.028
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) raf = requestAnimationFrame(tick)
      else { ctx.clearRect(0, 0, W, H); if (canvas) canvas.style.display = 'none' }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }

  return (
    <div
      className="pausia-premium-shell max-lg:block"
      style={{ display: 'flex', minHeight: '100dvh', background: '#f4f6fb', color: 'var(--pau-ink)' }}
    >
      <Sidebar activeItem="camino" />

      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Custom topbar ──────────────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(244,246,251,0.93)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(219,231,248,0.75)',
          padding: '0 24px', minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          {/* Left: title + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Camino PAU
            </h1>
            <span
              className={`pau-badge ${source === 'supabase' ? 'pau-badge-green' : 'pau-badge-blue'}`}
              style={{ fontSize: 10 }}
            >
              {source === 'supabase' ? 'En vivo' : 'Beta'}
            </span>
            {weekContext && (
              <span className="hidden sm:inline" style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                · S{weekContext.semana} · {weekContext.faseLabel}
              </span>
            )}
          </div>

          {/* Right: streak + XP chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <motion.div
              whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 12,
                background: '#fff7ed', border: '1.5px solid #fed7aa', cursor: 'default',
              }}
            >
              <Flame size={15} color="#f97316" aria-hidden />
              <span style={{ fontSize: 14, fontWeight: 900, color: '#ea580c', fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '–' : progress.streakDays}
              </span>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 12,
                background: '#eff6ff', border: '1.5px solid #bfdbfe', cursor: 'default',
              }}
            >
              <Sparkles size={13} color="#2563eb" aria-hidden />
              <span style={{ fontSize: 14, fontWeight: 900, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '–' : fmtNum(progress.xpTotal)}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>XP</span>
            </motion.div>
          </div>
        </header>

        {/* Sync warning */}
        {syncError && !loading && (
          <div style={{ margin: '12px 24px 0' }} className="pau-info">
            <Target size={14} style={{ flexShrink: 0 }} aria-hidden />
            Modo local — tu progreso se guarda en este dispositivo.
          </div>
        )}

        {/* ── Main content ────────────────────────────────────────────── */}
        <main
          className="max-md:px-4"
          style={{ padding: '20px 24px 64px', maxWidth: 1120, margin: '0 auto' }}
        >

          {/* ── Pau + Mission hero ────────────────────────────────── */}
          <div className="pau-reveal">
            <MissionCard
              routeId={progress.selectedRouteId}
              completedCount={completedCount}
              totalTasks={totalTasks}
              missionCompleted={missionCompleted}
              onPrimaryAction={() =>
                document.getElementById('camino-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            />
          </div>

          {/* ── Metrics row ───────────────────────────────────────── */}
          <div
            className="grid-cols-2 sm:grid-cols-4 pau-stagger"
            style={{ display: 'grid', gap: 10, marginTop: 12 }}
            aria-label="Estadísticas de progreso"
          >
            <MetricChip
              icon={<Flame size={16} />} tone="amber"
              label="Racha" value={loading ? '–' : String(progress.streakDays)} unit="días"
            />
            <MetricChip
              icon={<Sparkles size={14} />} tone="blue"
              label="XP total" value={loading ? '–' : fmtNum(progress.xpTotal)} unit=""
            />
            <MetricChip
              icon={<Zap size={15} />} tone="violet"
              label="Nivel mates" value={loading ? '–' : String(progress.levelBySubject.mates)} unit=""
            />
            <MetricChip
              icon={<TrendingUp size={15} />} tone="emerald"
              label="Progreso PAU" value={loading ? '–' : String(progress.progressTowardsPau)} unit="%"
            />
          </div>

          {/* ── Tasks + right sidebar ─────────────────────────────── */}
          <section
            id="camino-tasks"
            className="xl:grid-cols-[1fr_336px] pau-reveal pau-reveal-delay-2"
            style={{ display: 'grid', gap: 12, marginTop: 12 }}
            aria-label="Tareas de hoy"
          >
            {/* Task panel */}
            <div style={{
              borderRadius: 20, background: '#fff', overflow: 'hidden',
              border: '1.5px solid rgba(219,231,248,0.9)',
              boxShadow: '0 2px 14px rgba(37,99,235,0.06)',
            }}>
              {/* Panel header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(219,231,248,0.6)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {weekContext ? `S${weekContext.semana} · ${weekContext.objetivo}` : 'Tu misión de hoy'}
                    </h2>
                    {weekContext && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                        {weekContext.faseLabel} · {weekContext.duracion}
                      </p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {missionCompleted ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 440, damping: 20 }}
                        className="pau-badge pau-badge-mint"
                        style={{ gap: 5, fontSize: 11 }}
                      >
                        ✓ ¡Misión completada!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="progress"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pau-badge pau-badge-blue"
                        style={{ fontSize: 11 }}
                      >
                        {completedCount}/{totalTasks} tareas
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Animated progress bar */}
                <div className="pau-progress-bar" style={{ height: 6, borderRadius: 99 }} role="none">
                  <motion.div
                    className="pau-progress-fill"
                    style={{ borderRadius: 99, transformOrigin: 'left' }}
                    animate={{ scaleX: missionProgress / 100 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    role="progressbar"
                    aria-valuenow={missionProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de misión: ${missionProgress}%`}
                  />
                </div>

                <AnimatePresence>
                  {missionCompleted && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: '#16a34a' }}
                    >
                      Vuelve mañana para mantener la racha. 🔥
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Task list */}
              <div style={{ padding: '14px 16px' }}>
                {loading ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="pau-skeleton" style={{ height: 82, borderRadius: 18 }} />
                    ))}
                  </div>
                ) : (
                  <div className="pau-stagger" style={{ display: 'grid', gap: 8 }}>
                    {currentTasks.map(task => (
                      <DailyTaskCard
                        key={task.id}
                        task={task}
                        completed={completedTaskIds.includes(task.id)}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'grid', alignContent: 'start', gap: 12 }}>
              <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={changeRoute} />

              {/* Lo que viene */}
              <section style={{
                borderRadius: 20, background: '#fff',
                border: '1.5px solid rgba(219,231,248,0.9)',
                padding: '16px 16px',
                boxShadow: '0 2px 14px rgba(37,99,235,0.06)',
              }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Lo que viene
                </h2>
                <div style={{ display: 'grid', gap: 8 }}>
                  {nextObjectives.map((item, i) => (
                    <div key={item.week} style={{
                      display: 'flex', gap: 10, padding: '9px 10px', borderRadius: 13,
                      background: i === 0
                        ? 'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(224,236,255,0.55))'
                        : '#f8fbff',
                      border: `1.5px solid ${i === 0 ? 'rgba(190,218,255,0.8)' : 'rgba(219,231,248,0.6)'}`,
                    }}>
                      <div style={{
                        width: 32, height: 32, flexShrink: 0, borderRadius: 9,
                        background: i === 0 ? 'linear-gradient(135deg, #1d4ed8, #3b8ef8)' : '#fff',
                        border: i === 0 ? 'none' : '1.5px solid rgba(219,231,248,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 900,
                        color: i === 0 ? '#fff' : '#2563eb',
                        boxShadow: i === 0 ? '0 4px 12px rgba(37,99,235,0.26)' : 'none',
                      }}>
                        {item.week}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                          S{item.week}: {item.label}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: 10.5, fontWeight: 600, color: '#94a3b8' }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          {/* ── Progress path ──────────────────────────────────────── */}
          <div className="pau-reveal pau-reveal-delay-3" style={{ marginTop: 12 }}>
            <ProgressPath />
          </div>

          {/* ── Why cards ─────────────────────────────────────────── */}
          <section
            className="lg:grid-cols-3 pau-stagger"
            style={{ display: 'grid', gap: 10, marginTop: 12 }}
          >
            <WhyCard icon="01" title="No decides cada día"
              text="Pausia te ordena qué estudiar según el currículum PAU real. Sin agobio." />
            <WhyCard icon="02" title="Primero hábito"
              text="Primero hábito, luego bloques temáticos, después simulacros completos." />
            <WhyCard icon="03" title="Ruta adaptable"
              text="Tu ruta ajusta la semana del currículum en la que empiezas, no desde cero." />
          </section>

          {/* ── Sync status ───────────────────────────────────────── */}
          <section className="pau-info" style={{ marginTop: 10, alignItems: 'flex-start' }}>
            <Target size={14} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
            <div>
              {source === 'supabase' ? (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 12.5, color: '#1e40af', lineHeight: 1.6 }}>
                    Tu progreso se guarda automáticamente. XP, racha y misiones sincronizados.
                  </p>
                  <p style={{ margin: '3px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Las misiones se generan desde el currículum PAU de 38 semanas según tu ruta.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 12.5, color: '#1e40af', lineHeight: 1.6 }}>
                    Las tareas te acercan a las zonas reales de Pausia.
                  </p>
                  <p style={{ margin: '3px 0 0', fontWeight: 600, fontSize: 12, color: '#3b82f6', lineHeight: 1.6 }}>
                    Vista previa interna: XP, racha y tareas guardados localmente.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ── Parent checkout ───────────────────────────────────── */}
          <div style={{ marginTop: 10 }}>
            <ParentLinkModule billing={billing} />
          </div>

          {/* Demo reset */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetProgress}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                border: '1px solid var(--pau-border)', background: 'transparent',
                fontSize: 11, fontWeight: 600, color: 'var(--pau-soft)',
                cursor: 'pointer', transition: 'color 140ms, border-color 140ms',
              }}
            >
              <RotateCcw size={10} aria-hidden /> Reiniciar demo local
            </button>
          </div>
        </main>
      </div>

      {/* ── Confetti canvas ──────────────────────────────────────────── */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: 'none' }}
        aria-hidden
      />

      {/* ── XP notification toast ────────────────────────────────────── */}
      <AnimatePresence>
        {xpNotif && (
          <motion.div
            key={xpNotif.id}
            initial={{ opacity: 0, scale: 0.65, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, y: -18 }}
            transition={{ type: 'spring', stiffness: 520, damping: 28 }}
            aria-live="polite"
            aria-label={`+${xpNotif.xp} XP ganados`}
            style={{
              position: 'fixed', bottom: 88, right: 24, zIndex: 100,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', fontWeight: 900, fontSize: 16,
              padding: '11px 18px', borderRadius: 16,
              boxShadow: '0 8px 28px rgba(245,158,11,0.40)',
              pointerEvents: 'none',
            }}
          >
            +{xpNotif.xp} XP ⚡
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MetricChip ────────────────────────────────────────────────────────────────

type MetricTone = 'amber' | 'blue' | 'emerald' | 'violet'

const CHIP_TONES: Record<MetricTone, { bg: string; border: string; iconColor: string; textColor: string }> = {
  amber:   { bg: 'linear-gradient(145deg, #fffbeb, #fef3c7)', border: 'rgba(245,158,11,0.25)', iconColor: '#d97706', textColor: '#92400e' },
  blue:    { bg: 'linear-gradient(145deg, #eff6ff, #e8f2ff)', border: 'rgba(37,99,235,0.2)',   iconColor: '#2563eb', textColor: '#1e40af' },
  emerald: { bg: 'linear-gradient(145deg, #f0fdf4, #dcfce7)', border: 'rgba(5,150,105,0.2)',   iconColor: '#059669', textColor: '#065f46' },
  violet:  { bg: 'linear-gradient(145deg, #f5f3ff, #ede9fe)', border: 'rgba(124,58,237,0.18)', iconColor: '#7c3aed', textColor: '#5b21b6' },
}

interface MetricChipProps {
  icon: ReactNode; label: string; value: string; unit: string; tone: MetricTone
}

function MetricChip({ icon, label, value, unit, tone }: MetricChipProps) {
  const t = CHIP_TONES[tone]
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.18 }}
      style={{
        borderRadius: 16, padding: '12px 14px',
        background: t.bg, border: `1.5px solid ${t.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.iconColor }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, fontWeight: 700, color: t.textColor }}>
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── WhyCard ───────────────────────────────────────────────────────────────────

function WhyCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article style={{ borderRadius: 18, background: '#fff', border: '1.5px solid rgba(219,231,248,0.9)', padding: '18px 16px', boxShadow: '0 1px 6px rgba(37,99,235,0.05)' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '-0.01em',
        boxShadow: '0 4px 10px rgba(37,99,235,0.26)',
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.015em' }}>
        {title}
      </h3>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, fontWeight: 500, color: '#64748b', lineHeight: 1.65 }}>
        {text}
      </p>
    </article>
  )
}
