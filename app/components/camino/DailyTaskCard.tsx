'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Circle, Sparkles } from 'lucide-react'
import { caminoTaskTypes, type DailyCaminoTask } from '@/app/lib/camino/caminoData'

interface DailyTaskCardProps {
  task: DailyCaminoTask
  completed: boolean
  onComplete: (task: DailyCaminoTask) => void
}

const SUBJECT_COLORS: Record<string, { border: string; bg: string; dot: string; checkBg: string }> = {
  'Matemáticas II':      { border: '#93c5fd', bg: '#eff6ff', dot: '#2563eb', checkBg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
  'Física':              { border: '#fde68a', bg: '#fefce8', dot: '#ca8a04', checkBg: 'linear-gradient(135deg, #b45309, #d97706)' },
  'Historia de España':  { border: '#fdba74', bg: '#fff7ed', dot: '#92400e', checkBg: 'linear-gradient(135deg, #78350f, #b45309)' },
  'Química':             { border: '#fca5a5', bg: '#fff1f2', dot: '#dc2626', checkBg: 'linear-gradient(135deg, #b91c1c, #ef4444)' },
  'Biología':            { border: '#6ee7b7', bg: '#d1fae5', dot: '#059669', checkBg: 'linear-gradient(135deg, #047857, #10b981)' },
  'Lengua y Literatura': { border: '#c4b5fd', bg: '#f5f3ff', dot: '#7c3aed', checkBg: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' },
  'Inglés':              { border: '#7dd3fc', bg: '#ecfeff', dot: '#0284c7', checkBg: 'linear-gradient(135deg, #0369a1, #0ea5e9)' },
}
const DEFAULT_SC = { border: '#cbd5e1', bg: '#f8fafc', dot: '#64748b', checkBg: 'linear-gradient(135deg, #475569, #64748b)' }

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  blue:    { bg: '#dbeafe', text: '#1d4ed8' },
  sky:     { bg: '#e0f2fe', text: '#0369a1' },
  violet:  { bg: '#ede9fe', text: '#6d28d9' },
  emerald: { bg: '#d1fae5', text: '#047857' },
  amber:   { bg: '#fef3c7', text: '#b45309' },
  slate:   { bg: '#f1f5f9', text: '#475569' },
}

export default function DailyTaskCard({ task, completed, onComplete }: DailyTaskCardProps) {
  const type    = caminoTaskTypes[task.type]
  const sc      = SUBJECT_COLORS[task.subject] ?? DEFAULT_SC
  const tc      = TYPE_COLORS[type.variant] ?? TYPE_COLORS.slate
  const [showXp, setShowXp] = useState(false)

  function handleComplete() {
    if (completed) return
    setShowXp(true)
    onComplete(task)
    setTimeout(() => setShowXp(false), 1100)
  }

  return (
    <motion.article
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      style={{
        borderRadius: 18,
        border: `1.5px solid ${completed ? '#86efac' : sc.border}`,
        background: completed ? 'rgba(240,253,244,0.88)' : '#ffffff',
        padding: '14px 16px',
        position: 'relative',
        boxShadow: completed
          ? 'none'
          : `0 2px 10px ${sc.dot}18, 0 1px 4px rgba(0,0,0,0.04)`,
        transition: 'border-color 250ms, background 250ms, box-shadow 250ms',
        cursor: 'default',
      }}
    >
      {/* XP float animation */}
      <AnimatePresence>
        {showXp && (
          <motion.div
            key="xp-float"
            initial={{ opacity: 1, y: 0, scale: 0.75 }}
            animate={{ opacity: 0, y: -34, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            aria-hidden
            style={{
              position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none', zIndex: 10,
              color: '#d97706', fontWeight: 900, fontSize: 15,
              textShadow: '0 1px 6px rgba(0,0,0,0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            +{task.xp} XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

        {/* Check button */}
        <div style={{ flexShrink: 0 }}>
          <motion.button
            type="button"
            onClick={handleComplete}
            disabled={completed}
            whileTap={completed ? {} : { scale: 0.82 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            aria-label={completed ? `${task.title} completada` : `Completar ${task.title}`}
            style={{
              width: 46, height: 46, borderRadius: 13, border: 'none', cursor: completed ? 'default' : 'pointer',
              background: completed ? 'linear-gradient(135deg, #16a34a, #22c55e)' : sc.bg,
              outline: completed ? 'none' : `1.5px solid ${sc.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: completed ? '0 4px 14px rgba(22,163,74,0.32)' : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <Check size={21} color="white" strokeWidth={2.8} />
                </motion.span>
              ) : (
                <motion.span key="circle" exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.12 }}>
                  <Circle size={21} color={sc.dot} strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 7 }}>
            <span style={{
              fontSize: 10.5, fontWeight: 800, padding: '2.5px 9px', borderRadius: 99,
              background: tc.bg, color: tc.text, letterSpacing: '-0.01em',
            }}>
              {type.label}
            </span>
            <span style={{
              fontSize: 10.5, fontWeight: 800, padding: '2.5px 9px', borderRadius: 99,
              background: '#fef3c7', color: '#b45309',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <Sparkles size={10} /> {task.xp} XP
            </span>
            <AnimatePresence>
              {completed && (
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  style={{
                    fontSize: 10.5, fontWeight: 800, padding: '2.5px 9px', borderRadius: 99,
                    background: '#d1fae5', color: '#047857', display: 'inline-block',
                  }}
                >
                  ✓ Completada
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <h3 style={{
            margin: 0, fontSize: 14, fontWeight: 800, color: completed ? '#9ca3af' : '#0f172a',
            letterSpacing: '-0.01em', lineHeight: 1.35,
            textDecoration: completed ? 'line-through' : 'none',
            textDecorationColor: '#d1d5db',
          }}>
            {task.title}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, fontWeight: 500, color: '#64748b', lineHeight: 1.55 }}>
            {task.detail}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: sc.dot + 'cc' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, flexShrink: 0, display: 'inline-block' }} />
              {task.subject}{task.block ? ` · ${task.block}` : ''}
            </span>
            <Link
              href={task.actionHref}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11.5, fontWeight: 700, color: '#2563eb',
                textDecoration: 'none', padding: '4px 10px', borderRadius: 8,
                transition: 'background 140ms',
              }}
              className="hover:bg-blue-50"
            >
              {task.actionLabel} <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
