'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked, BookOpen, Check, ChevronRight, ChevronUp,
  FileText, Layers, PenLine, Play, Headphones, Pencil, Zap,
} from 'lucide-react'
import { caminoTaskTypes, type DailyCaminoTask } from '@/app/lib/camino/caminoData'
import CurriculumFlashcardPanel from '@/app/components/camino/CurriculumFlashcardPanel'
import type { CurriculumBlockKey } from '@/app/lib/camino/curriculumFlashcards'

interface DailyTaskCardProps {
  task: DailyCaminoTask
  completed: boolean
  onComplete: (task: DailyCaminoTask) => void
}

const SUBJECT_COLORS: Record<string, { bg: string; icon: string }> = {
  'Matemáticas II':      { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Física':              { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Historia de España':  { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Química':             { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Biología':            { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Lengua y Literatura': { bg: '#f5f5f5', icon: '#1c1c1c' },
  'Inglés':              { bg: '#f5f5f5', icon: '#1c1c1c' },
}
const DEFAULT_SC = { bg: '#f1f5f9', icon: '#64748b' }

function TaskIcon({ type, color }: { type: string; color: string }) {
  const props = { size: 17, strokeWidth: 2.2, color }
  switch (type) {
    case 'flashcard':   return <Layers      {...props} />
    case 'video':       return <Play        {...props} />
    case 'ejercicios':  return <PenLine     {...props} />
    case 'lectura':     return <BookMarked  {...props} />
    case 'repaso':      return <BookOpen    {...props} />
    case 'examen':      return <FileText    {...props} />
    case 'practica':    return <Pencil      {...props} />
    case 'reading':     return <Headphones  {...props} />
    case 'writing':     return <PenLine     {...props} />
    case 'test':        return <FileText    {...props} />
    default:            return <Zap        {...props} />
  }
}

export default function DailyTaskCard({ task, completed, onComplete }: DailyTaskCardProps) {
  const type     = caminoTaskTypes[task.type]
  const sc       = SUBJECT_COLORS[task.subject] ?? DEFAULT_SC
  const [showXp, setShowXp] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const isExpandable = task.type === 'flashcard' && !!task.block

  function handleComplete() {
    if (completed) return
    setShowXp(true)
    onComplete(task)
    setTimeout(() => setShowXp(false), 1100)
  }

  return (
    <>
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 13,
        padding: '13px 18px',
        background: completed ? 'rgba(240,253,244,0.55)' : 'transparent',
        position: 'relative',
        transition: 'background 220ms',
      }}
    >
      {/* XP float */}
      <AnimatePresence>
        {showXp && (
          <motion.div
            key="xp-float"
            initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.85, ease: 'easeOut' }}
            aria-hidden
            style={{
              position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none', zIndex: 10,
              color: '#1c1c1c', fontWeight: 900, fontSize: 12.5, whiteSpace: 'nowrap',
            }}
          >
            +{task.xp} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon / check button */}
      <motion.button
        type="button"
        onClick={handleComplete}
        disabled={completed}
        whileTap={completed ? {} : { scale: 0.80 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        aria-label={completed ? `${task.title} completada` : `Completar ${task.title}`}
        style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0, border: 'none',
          background: completed ? 'linear-gradient(135deg, #16a34a, #22c55e)' : sc.bg,
          color: completed ? '#fff' : sc.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: completed ? 'default' : 'pointer',
          boxShadow: completed ? '0 3px 10px rgba(22,163,74,0.22)' : 'none',
          transition: 'background 240ms, box-shadow 240ms',
        }}
      >
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <Check size={18} strokeWidth={2.8} color="#fff" />
            </motion.span>
          ) : (
            <motion.span
              key="icon"
              exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.1 }}
            >
              <TaskIcon type={task.type} color={sc.icon} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 13.5, fontWeight: 700,
          color: completed ? '#9ca3af' : '#111827',
          letterSpacing: '-0.012em', lineHeight: 1.3,
          textDecoration: completed ? 'line-through' : 'none',
          textDecorationColor: '#d1d5db',
        }}>
          {task.title}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 11.5, fontWeight: 500, color: '#94a3b8', lineHeight: 1 }}>
          {task.subject}{task.block ? ` · ${task.block}` : ''} · {type.label} · {task.xp} XP
        </p>
      </div>

      {/* Right action */}
      {isExpandable ? (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Ocultar flashcards' : 'Ver flashcards'}
          style={{
            color: expanded ? '#1c1c1c' : '#d1d5db', flexShrink: 0,
            display: 'flex', alignItems: 'center', lineHeight: 1,
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronRight size={18} />}
        </button>
      ) : completed ? (
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', flexShrink: 0 }}
        >
          ✓ Hecho
        </motion.span>
      ) : (
        <Link
          href={task.actionHref}
          style={{
            color: '#d1d5db', flexShrink: 0,
            display: 'flex', alignItems: 'center', lineHeight: 1,
            textDecoration: 'none',
          }}
          aria-label={task.actionLabel}
        >
          <ChevronRight size={18} />
        </Link>
      )}
    </div>
    {isExpandable && expanded && (
      <CurriculumFlashcardPanel blockKey={task.block as CurriculumBlockKey} />
    )}
    </>
  )
}
