'use client'

import { X } from 'lucide-react'
import { useHints } from '@/app/lib/onboarding/HintsContext'
import type { HintKey } from '@/app/lib/onboarding/hintsConfig'

interface SectionIntroCardProps {
  hintKey: HintKey
  line1: string
  line2: string
}

export default function SectionIntroCard({ hintKey, line1, line2 }: SectionIntroCardProps) {
  const { seenKeys, markSeen, isLoaded } = useHints()

  if (!isLoaded || seenKeys.has(hintKey)) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px',
      background: '#f8fafc',
      borderLeft: '3px solid #2563eb',
      borderRadius: 8,
      marginBottom: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3, lineHeight: 1.4 }}>
          {line1}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>
          {line2}
        </p>
      </div>
      <button
        onClick={() => markSeen(hintKey)}
        style={{
          flexShrink: 0,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', padding: 2, marginTop: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Cerrar"
      >
        <X size={15} />
      </button>
    </div>
  )
}
