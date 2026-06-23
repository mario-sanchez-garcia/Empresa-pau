'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Components } from 'react-markdown'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { supabase } from '@/app/lib/supabase'
import {
  fetchCurriculumFlashcards,
  type CurriculumFlashcardRow,
  type CurriculumBlockKey,
} from '@/app/lib/camino/curriculumFlashcards'

const COMPACT: Partial<Components> = {
  p:  ({ children }: { children?: ReactNode }) => <p  style={{ margin: '2px 0', fontSize: 12.5, lineHeight: 1.7, color: '#334155' }}>{children}</p>,
  li: ({ children }: { children?: ReactNode }) => <li style={{ margin: '2px 0', fontSize: 12.5, lineHeight: 1.7, color: '#334155' }}>{children}</li>,
}

export default function CurriculumFlashcardPanel({ blockKey }: { blockKey: CurriculumBlockKey }) {
  const [cards, setCards] = useState<CurriculumFlashcardRow[]>([])
  const [phase, setPhase] = useState({ loading: true, idx: 0, showCase: false })

  useEffect(() => {
    let cancelled = false
    // reset síncrono antes del fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase({ loading: true, idx: 0, showCase: false })
    fetchCurriculumFlashcards(supabase, blockKey).then(rows => {
      if (!cancelled) {
        // asíncrono con cancelled guard
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCards(rows)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhase(p => ({ ...p, loading: false }))
      }
    })
    return () => { cancelled = true }
  }, [blockKey])

  if (phase.loading) {
    return (
      <div style={{ padding: '12px 18px 16px', borderTop: '1px solid rgba(219,231,248,0.55)', background: '#f8fbff' }}>
        <div style={{ height: 12, width: '45%', borderRadius: 6, background: '#e2e8f0', marginBottom: 10 }} />
        <div style={{ height: 60, borderRadius: 10, background: '#e2e8f0' }} />
      </div>
    )
  }

  if (cards.length === 0) return null

  const card    = cards[phase.idx]
  const isFirst = phase.idx === 0
  const isLast  = phase.idx === cards.length - 1

  return (
    <div style={{ padding: '14px 18px 16px', borderTop: '1px solid rgba(219,231,248,0.55)', background: '#f8fbff' }}>

      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93c5fd' }}>
          {card.order_label}
        </span>

        {cards.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <NavBtn disabled={isFirst} onClick={() => setPhase(p => ({ ...p, idx: p.idx - 1, showCase: false }))} label="Anterior">
              <ChevronLeft size={13} />
            </NavBtn>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', minWidth: 30, textAlign: 'center' }}>
              {phase.idx + 1}/{cards.length}
            </span>
            <NavBtn disabled={isLast} onClick={() => setPhase(p => ({ ...p, idx: p.idx + 1, showCase: false }))} label="Siguiente">
              <ChevronRight size={13} />
            </NavBtn>
          </div>
        )}
      </div>

      {/* title */}
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: '#1e3a5f', letterSpacing: '-0.01em' }}>
        {card.title}
      </p>

      {/* concept */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid rgba(219,231,248,0.85)', padding: '10px 14px' }}>
        <MathMarkdown text={card.concept_latex} format="raw" components={COMPACT} />
      </div>

      {/* alert */}
      {card.alert_title && card.alert_latex && (
        <div style={{ marginTop: 8, borderRadius: 10, background: 'rgba(239,246,255,0.9)', border: '1.5px solid rgba(147,197,253,0.6)', padding: '8px 12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10.5, fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertCircle size={11} aria-hidden /> {card.alert_title}
          </p>
          <MathMarkdown text={card.alert_latex} format="raw" components={COMPACT} />
        </div>
      )}

      {/* worked case */}
      {card.worked_case_title && card.worked_case_latex && (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setPhase(p => ({ ...p, showCase: !p.showCase }))}
            style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {phase.showCase ? '▲' : '▶'} {card.worked_case_title}
          </button>
          {phase.showCase && (
            <div style={{ marginTop: 6, borderRadius: 10, background: 'rgba(245,240,255,0.8)', border: '1.5px solid rgba(196,181,253,0.6)', padding: '8px 12px' }}>
              <MathMarkdown text={card.worked_case_latex} format="raw" components={COMPACT} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NavBtn({ disabled, onClick, label, children }: {
  disabled: boolean; onClick: () => void; label: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 26, height: 26, borderRadius: 8,
        border: '1.5px solid rgba(219,231,248,0.9)',
        background: disabled ? '#f8fbff' : '#fff',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        color: disabled ? '#cbd5e1' : '#2563eb',
      }}
    >
      {children}
    </button>
  )
}
