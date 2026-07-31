'use client'

import { X } from 'lucide-react'
import { useHints } from '@/app/lib/onboarding/HintsContext'

const SECTIONS = [
  { name: 'Camino',     desc: 'Tu plan diario. Empieza siempre por aquí.' },
  { name: 'Simulacros', desc: 'Exámenes cronometrados como el día real.' },
  { name: 'La Zona',    desc: 'Repasa lo que no recuerdas con flashcards.' },
  { name: 'Tutor',      desc: 'Pregúntale a Kairo cuando te atasques.' },
]

// embedded=true: renders inline inside an existing dark card (no wrapper, no close button)
// embedded=false (default): standalone dark card with its own background and close button
export default function KairoMapCard({ embedded = false }: { embedded?: boolean }) {
  const { seenKeys, markSeen, isLoaded } = useHints()

  if (!isLoaded || seenKeys.has('kairo_map_seen')) return null

  const rows = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
        El mapa de Kairo
      </p>
      {SECTIONS.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            padding: '11px 0',
            borderTop: i === 0 ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 900, color: 'white', minWidth: 78, flexShrink: 0 }}>
            {s.name}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
            {s.desc}
          </span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
    </div>
  )

  if (embedded) return rows

  return (
    <div style={{ marginTop: 20, borderRadius: 12, background: '#0f172a', padding: '20px 22px', color: 'white', position: 'relative' }}>
      <button
        onClick={() => markSeen('kairo_map_seen')}
        style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
        }}
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
      {rows}
    </div>
  )
}
