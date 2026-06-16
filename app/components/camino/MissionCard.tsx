'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { getRouteById, todayMission, type CaminoRouteId } from '@/app/lib/camino/caminoData'

interface MissionCardProps {
  routeId: CaminoRouteId
  completedCount: number
  totalTasks: number
  missionCompleted: boolean
  weekTitle?: string
  onPrimaryAction: () => void
}

const R    = 46
const CIRC = 2 * Math.PI * R

export default function MissionCard({
  routeId, completedCount, totalTasks, missionCompleted, weekTitle, onPrimaryAction,
}: MissionCardProps) {
  const route    = getRouteById(routeId)
  const started  = completedCount > 0
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const offset   = CIRC - (progress / 100) * CIRC
  const heading  = weekTitle ?? 'Tu misión de hoy'
  const cta      = missionCompleted ? '¡Misión completada!' : started ? 'Continuar misión' : 'Empezar misión'

  return (
    <section
      style={{
        borderRadius: 20, background: '#fff',
        border: '1.5px solid rgba(219,231,248,0.85)',
        boxShadow: '0 2px 14px rgba(37,99,235,0.06)',
        padding: '26px 28px',
        display: 'flex', alignItems: 'center', gap: 24,
        overflow: 'hidden', position: 'relative',
      }}
      aria-label="Misión de hoy"
    >
      {/* Left: text */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Badge row */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}
        >
          <span style={{
            background: '#111827', color: '#fff',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 99, whiteSpace: 'nowrap',
          }}>
            Misión de hoy · Día {todayMission.day}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {route.nombre}
          </span>
        </motion.div>

        {/* Heading — BIG */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={missionCompleted ? 'done' : heading}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            style={{
              margin: 0,
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              fontWeight: 900,
              color: missionCompleted ? '#059669' : '#111827',
              letterSpacing: '-0.033em',
              lineHeight: 1.18,
              maxWidth: '26ch',
            }}
          >
            {missionCompleted ? '¡Misión completada!' : heading}
          </motion.h2>
        </AnimatePresence>

        <p style={{
          margin: '10px 0 0',
          fontSize: 13.5, color: '#64748b', fontWeight: 500, lineHeight: 1.65, maxWidth: '44ch',
        }}>
          {todayMission.objective}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            <Clock3 size={13} aria-hidden /> {todayMission.estimatedTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            <CheckCircle2 size={13} aria-hidden /> {completedCount}/{totalTasks} tareas
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.01em' }}>
            +250 XP
          </span>
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={onPrimaryAction}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 440, damping: 20 }}
          style={{
            marginTop: 20,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: missionCompleted
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
            color: '#fff',
            fontSize: 13.5, fontWeight: 800, letterSpacing: '-0.01em',
            boxShadow: missionCompleted
              ? '0 5px 18px rgba(5,150,105,0.30)'
              : '0 5px 18px rgba(109,40,217,0.35)',
          }}
        >
          {cta}
          {!missionCompleted && <ArrowRight size={14} />}
        </motion.button>
      </div>

      {/* Right: circular day ring */}
      <div
        className="hidden sm:flex"
        style={{ flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
        aria-hidden
      >
        <svg width={124} height={124} viewBox="-8 -8 116 116">
          <circle
            cx="50" cy="50" r={R}
            fill="none" stroke="#f1f5f9" strokeWidth="7.5"
          />
          <motion.circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={missionCompleted ? '#10b981' : '#7c3aed'}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="42" textAnchor="middle"
            fill="#94a3b8" fontSize="8.5" fontWeight="700" letterSpacing="0.07em"
            style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>
            DÍA
          </text>
          <text x="50" y="65" textAnchor="middle"
            fill={missionCompleted ? '#10b981' : '#111827'} fontSize="28" fontWeight="900"
            style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.04em' }}>
            {todayMission.day}
          </text>
          <text x="50" y="79" textAnchor="middle"
            fill="#cbd5e1" fontSize="8" fontWeight="600"
            style={{ fontFamily: 'system-ui, sans-serif' }}>
            {progress}% hoy
          </text>
        </svg>
      </div>
    </section>
  )
}
