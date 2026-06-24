'use client'

import { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, PackageCheck, RotateCcw, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react'
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

const CONFETTI_COLORS = ['#7c3aed', '#2563eb', '#059669', '#f59e0b', '#ec4899', '#0ea5e9', '#16a34a']
const XP_PER_LEVEL   = 300

function fmtNum(n: number) { return new Intl.NumberFormat('es-ES').format(n) }

// ─── Main ─────────────────────────────────────────────────────────────────────

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

  // Level computation
  const currentLevel    = Math.floor(progress.xpTotal / XP_PER_LEVEL) + 1
  const xpInLevel       = progress.xpTotal % XP_PER_LEVEL
  const xpToNext        = XP_PER_LEVEL - xpInLevel
  const levelPct        = xpInLevel / XP_PER_LEVEL

  // XP toast
  const [xpNotif, setXpNotif] = useState<{ xp: number; id: number } | null>(null)
  const xpTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function handleCompleteTask(task: DailyCaminoTask) {
    completeTask(task)
    setXpNotif({ xp: task.xp, id: Date.now() })
    clearTimeout(xpTimer.current)
    xpTimer.current = setTimeout(() => setXpNotif(null), 1900)
  }

  // Confetti
  const confettiRef   = useRef<HTMLCanvasElement>(null)
  const prevCompleted = useRef(false)

  function fireConfetti() {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H; canvas.style.display = 'block'
    const ps = Array.from({ length: 120 }, () => ({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.55, y: H * 0.28,
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
        if (p.y > H * 0.75) p.alpha -= 0.028
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

  useEffect(() => {
    if (missionCompleted && !prevCompleted.current) fireConfetti()
    prevCompleted.current = missionCompleted
  }, [missionCompleted])

  return (
    <div
      className="pausia-premium-shell max-lg:block"
      style={{ display: 'flex', minHeight: '100dvh', background: '#f4f7fb', color: 'var(--pau-ink)' }}
    >
      <Sidebar activeItem="camino" />

      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Topbar ──────────────────────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(219,231,248,0.8)',
          padding: '0 24px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 15.5, fontWeight: 900, color: '#111827', letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>
              Camino PAU
            </h1>
            {weekContext && (
              <span className="hidden md:inline" style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                · S{weekContext.semana} · {weekContext.faseLabel}
              </span>
            )}
            {!billing.loading && billing.hasActivePack && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
                padding: '4px 10px', borderRadius: 99,
                boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
              }}>
                <PackageCheck size={11} aria-hidden /> Pack PAU activo
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <motion.div whileTap={{ scale: 0.92 }} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 10,
              background: '#fff7ed', border: '1.5px solid #fed7aa',
            }}>
              <Flame size={14} color="#f97316" aria-hidden />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: '#ea580c', fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '–' : progress.streakDays}
              </span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.92 }} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 10,
              background: '#eff6ff', border: '1.5px solid #bfdbfe',
            }}>
              <Sparkles size={13} color="#2563eb" aria-hidden />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '–' : fmtNum(progress.xpTotal)}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>XP</span>
            </motion.div>
          </div>
        </header>

        {/* Sync warning */}
        {syncError && !loading && (
          <div style={{ margin: '10px 24px 0' }} className="pau-info">
            <Target size={13} style={{ flexShrink: 0 }} aria-hidden />
            Modo local — tu progreso se guarda en este dispositivo.
          </div>
        )}

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main
          className="max-md:px-4"
          style={{ padding: '18px 24px 60px', maxWidth: 1100, margin: '0 auto' }}
        >

          {/* ── Row 1: Mission hero + stat panel ─────────────────────── */}
          <div
            className="lg:grid-cols-[1fr_268px] pau-reveal"
            style={{ display: 'grid', gap: 12, alignItems: 'start' }}
          >
            <MissionCard
              routeId={progress.selectedRouteId}
              completedCount={completedCount}
              totalTasks={totalTasks}
              missionCompleted={missionCompleted}
              weekTitle={weekContext?.objetivo}
              onPrimaryAction={() =>
                document.getElementById('camino-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            />

            {/* Stat panel */}
            <div
              className="sm:grid-cols-3 lg:grid-cols-1"
              style={{ display: 'grid', gap: 10 }}
            >
              <StatCard
                tone="amber"
                icon={<Flame size={17} />}
                label="Racha actual"
                value={loading ? '–' : `${progress.streakDays} días`}
              />
              <StatCard
                tone="blue"
                icon={<Trophy size={16} />}
                label="Nivel académico"
                value={loading ? '–' : `Level ${currentLevel}`}
              />
              <StatCardProgress
                label="Progreso PAU"
                pct={loading ? 0 : progress.progressTowardsPau}
              />
            </div>
          </div>

          {/* ── Row 2: Progress path ─────────────────────────────────── */}
          <div className="pau-reveal pau-reveal-delay-2" style={{ marginTop: 12 }}>
            <ProgressPath />
          </div>

          {/* ── Row 3: Tasks + right panel ──────────────────────────── */}
          <div
            id="camino-tasks"
            className="lg:grid-cols-[1fr_268px] pau-reveal pau-reveal-delay-3"
            style={{ display: 'grid', gap: 12, marginTop: 12 }}
          >
            {/* Task panel */}
            <div style={{
              borderRadius: 20, background: '#fff', overflow: 'hidden',
              border: '1.5px solid rgba(219,231,248,0.85)',
              boxShadow: '0 2px 14px rgba(37,99,235,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Panel header */}
              <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(219,231,248,0.55)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      Tareas diarias
                    </p>
                    <h2 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 900, color: '#111827', letterSpacing: '-0.022em' }}>
                      {weekContext ? `S${weekContext.semana} · ${weekContext.objetivo}` : 'Tu misión de hoy'}
                    </h2>
                    {weekContext && (
                      <p style={{ margin: '1px 0 0', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
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
                        style={{ fontSize: 10.5 }}
                      >
                        ✓ ¡Completada!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="progress"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="pau-badge pau-badge-blue"
                        style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}
                      >
                        {completedCount}/{totalTasks} tareas
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="pau-progress-bar" style={{ height: 5, borderRadius: 99 }} role="none">
                  <motion.div
                    className="pau-progress-fill"
                    style={{ borderRadius: 99, transformOrigin: 'left' }}
                    animate={{ scaleX: totalTasks > 0 ? completedCount / totalTasks : 0 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    role="progressbar"
                    aria-valuenow={completedCount}
                    aria-valuemin={0}
                    aria-valuemax={totalTasks}
                    aria-label={`Progreso: ${completedCount} de ${totalTasks} tareas`}
                  />
                </div>
              </div>

              {/* Task list — flex:1 so the card fills height when stretched */}
              <div style={{ flex: 1 }}>
                {loading ? (
                  <div style={{ padding: '12px 0' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ padding: '10px 18px', borderBottom: i < 3 ? '1px solid rgba(219,231,248,0.5)' : 'none' }}>
                        <div className="pau-skeleton" style={{ height: 42, borderRadius: 14 }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {currentTasks.map((task, i) => (
                      <div
                        key={task.id}
                        style={{ borderTop: i > 0 ? '1px solid rgba(219,231,248,0.5)' : 'none' }}
                      >
                        <DailyTaskCard
                          task={task}
                          completed={completedTaskIds.includes(task.id)}
                          onComplete={handleCompleteTask}
                        />
                      </div>
                    ))}
                    {missionCompleted && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ margin: 0, padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#16a34a', borderTop: '1px solid rgba(219,231,248,0.5)' }}
                      >
                        ¡Vuelve mañana para mantener la racha! 🔥
                      </motion.p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* XP card — dark, stretches to match task panel height */}
            <div style={{
              borderRadius: 18,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              padding: '24px 22px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
              overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column',
            }}>
              <div aria-hidden style={{
                position: 'absolute', top: -30, right: -30, width: 140, height: 140,
                borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 70%)',
              }} />
              <div aria-hidden style={{
                position: 'absolute', bottom: -20, left: -20, width: 100, height: 100,
                borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 70%)',
              }} />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <TrendingUp size={14} color="rgba(255,255,255,0.45)" aria-hidden />
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    Total XP
                  </p>
                </div>
                <p style={{
                  margin: 0, fontSize: 42, fontWeight: 900, color: '#fff',
                  letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                }}>
                  {loading ? '–' : fmtNum(progress.xpTotal)}
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  {loading ? '…' : `Faltan ${fmtNum(xpToNext)} XP para el Nivel ${currentLevel + 1}`}
                </p>

                {/* Spacer pushes level bar to bottom */}
                <div style={{ flex: 1 }} />

                {/* Level bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>Nv. {currentLevel}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>Nv. {currentLevel + 1}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.10)' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                      animate={{ width: loading ? '0%' : `${Math.round(levelPct * 100)}%` }}
                      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 4: Route + Next objectives ───────────────────────── */}
          <div
            className="md:grid-cols-2"
            style={{ display: 'grid', gap: 12, marginTop: 12 }}
          >
            <RouteCard selectedRouteId={progress.selectedRouteId} onRouteChange={changeRoute} />

            <section style={{
              borderRadius: 18, background: '#fff',
              border: '1.5px solid rgba(219,231,248,0.85)',
              padding: '18px 18px',
              boxShadow: '0 2px 10px rgba(37,99,235,0.04)',
            }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                Lo que viene
              </h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {nextObjectives.map((item, i) => (
                  <div key={item.week} style={{
                    display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12,
                    background: i === 0 ? 'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(224,236,255,0.55))' : '#f8fbff',
                    border: `1.5px solid ${i === 0 ? 'rgba(190,218,255,0.8)' : 'rgba(219,231,248,0.5)'}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, flexShrink: 0, borderRadius: 9,
                      background: i === 0 ? 'linear-gradient(135deg, #1d4ed8, #3b8ef8)' : '#fff',
                      border: i === 0 ? 'none' : '1.5px solid rgba(219,231,248,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900,
                      color: i === 0 ? '#fff' : '#2563eb',
                      boxShadow: i === 0 ? '0 3px 10px rgba(37,99,235,0.22)' : 'none',
                    }}>
                      {item.week}
                    </div>
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                        S{item.week}: {item.label}
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Utilities ─────────────────────────────────────────────── */}
          <div style={{ marginTop: 12 }}>
            <ParentLinkModule billing={billing} />
          </div>

          <section className="pau-info" style={{ marginTop: 10, alignItems: 'flex-start' }}>
            <Target size={13} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
            <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: '#1e40af', lineHeight: 1.65 }}>
              {source === 'supabase'
                ? 'Tu progreso se guarda automáticamente. XP, racha y misiones sincronizados.'
                : 'Vista previa interna: XP, racha y tareas guardados localmente.'}
            </p>
          </section>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetProgress}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                border: '1px solid var(--pau-border)', background: 'transparent',
                fontSize: 11, fontWeight: 600, color: 'var(--pau-soft)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={10} aria-hidden /> Reiniciar demo local
            </button>
          </div>
        </main>
      </div>

      {/* Confetti */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: 'none' }}
        aria-hidden
      />

      {/* XP toast */}
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
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              color: '#fff', fontWeight: 900, fontSize: 16,
              padding: '11px 18px', borderRadius: 16,
              boxShadow: '0 8px 28px rgba(109,40,217,0.42)',
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

// ─── StatCard ─────────────────────────────────────────────────────────────────

const TONE_CFG = {
  amber: { bg: '#fff7ed', border: 'rgba(251,191,36,0.25)', icon: '#d97706', text: '#92400e' },
  blue:  { bg: '#eff6ff', border: 'rgba(37,99,235,0.18)',  icon: '#2563eb', text: '#1e40af' },
}

function StatCard({ tone, icon, label, value }: {
  tone: keyof typeof TONE_CFG; icon: ReactNode; label: string; value: string
}) {
  const t = TONE_CFG[tone]
  return (
    <div style={{
      borderRadius: 16, background: t.bg,
      border: `1.5px solid ${t.border}`,
      padding: '14px 14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ color: t.icon }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.icon }}>
          {label}
        </p>
      </div>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: t.text, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

function StatCardProgress({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{
      borderRadius: 16, background: '#f0fdf4',
      border: '1.5px solid rgba(34,197,94,0.2)',
      padding: '14px 14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ color: '#059669' }}><TrendingUp size={16} /></span>
        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669' }}>
          {label}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#065f46', letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {pct}
        </p>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#059669' }}>%</p>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(34,197,94,0.15)' }}>
        <motion.div
          style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
        />
      </div>
    </div>
  )
}
