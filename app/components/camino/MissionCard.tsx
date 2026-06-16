'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { getRouteById, todayMission, type CaminoRouteId } from '@/app/lib/camino/caminoData'

interface MissionCardProps {
  routeId: CaminoRouteId
  completedCount: number
  totalTasks: number
  missionCompleted: boolean
  onPrimaryAction: () => void
}

const R = 38
const CIRC = 2 * Math.PI * R

export default function MissionCard({
  routeId, completedCount, totalTasks, missionCompleted, onPrimaryAction,
}: MissionCardProps) {
  const route    = getRouteById(routeId)
  const started  = completedCount > 0
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const cta      = missionCompleted ? '¡Misión completada!' : started ? 'Continuar misión' : 'Empezar misión'
  const offset   = CIRC - (progress / 100) * CIRC

  return (
    <section
      style={{
        borderRadius: 24, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)',
      }}
      aria-label="Misión de hoy"
    >
      {/* Decorative glows */}
      <div aria-hidden style={{
        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: -30, left: '35%', width: 180, height: 180,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '28px 28px',
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>

        {/* Pau avatar */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
            style={{
              width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.22)',
              boxShadow: '0 0 0 8px rgba(255,255,255,0.07), 0 16px 40px rgba(0,0,0,0.32)',
            }}
          >
            <Image
              src="/mascots/pau/pau-guide.png" alt="Pau"
              width={90} height={90}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              priority
            />
          </motion.div>

          {/* XP orb */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.38 }}
            aria-hidden
            style={{
              position: 'absolute', bottom: -5, right: -5,
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: '2.5px solid #312e81',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}
          >
            ⚡
          </motion.div>
        </div>

        {/* Mission text */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}
          >
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.88)',
              padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(8px)',
            }}>
              Misión de hoy · Día {todayMission.day}
            </span>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              {route.nombre}
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h2
              key={missionCompleted ? 'done' : 'active'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2 }}
            >
              {missionCompleted ? '¡Misión completada! 🎉' : 'Tu misión de hoy'}
            </motion.h2>
          </AnimatePresence>

          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500, lineHeight: 1.55 }}>
            {todayMission.objective}
          </p>

          {/* Meta chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              <Clock3 size={13} /> {todayMission.estimatedTime}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              <CheckCircle2 size={13} /> {completedCount}/{totalTasks} tareas
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.01em' }}>
              +250 XP
            </span>
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={onPrimaryAction}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            style={{
              marginTop: 18,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: missionCompleted ? 'rgba(22,163,74,0.85)' : '#fff',
              color: missionCompleted ? '#fff' : '#1e1b4b',
              fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: missionCompleted
                ? '0 6px 22px rgba(22,163,74,0.38)'
                : '0 6px 22px rgba(0,0,0,0.22)',
            }}
          >
            {cta}
            {!missionCompleted && <ArrowRight size={15} />}
          </motion.button>
        </div>

        {/* Circular progress ring (hidden on small mobile) */}
        <div className="hidden sm:flex" style={{ flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
          aria-hidden>
          <svg width={108} height={108} viewBox="-4 -4 108 108">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7.5" />
            <motion.circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke={missionCompleted ? '#4ade80' : 'rgba(255,255,255,0.92)'}
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.15, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="44" textAnchor="middle"
              fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" letterSpacing="0.07em"
              style={{ fontFamily: 'system-ui, sans-serif' }}>
              MISIÓN
            </text>
            <text x="50" y="63" textAnchor="middle"
              fill={missionCompleted ? '#4ade80' : '#fff'} fontSize="21" fontWeight="900"
              style={{ fontFamily: 'system-ui, sans-serif' }}>
              {progress}%
            </text>
          </svg>
        </div>

      </div>
    </section>
  )
}
