'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight } from 'lucide-react'

const CursorGrid = dynamic(() => import('@/components/ui/CursorGrid'), { ssr: false })

const C = {
  ink:      '#0f172a',
  muted:    '#64748b',
  border:   '#e2e8f0',
  grad:     'linear-gradient(135deg, #1d4ed8 0%, #2563eb 52%, #3b82f6 100%)',
}

export default function CursorGridHero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100svh', background: '#ffffff', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <CursorGrid
          color="#2563eb"
          cellSize={60}
          radius={150}
          falloff="smooth"
          holdTime={400}
          fadeDuration={900}
          lineWidth={1}
          maxOpacity={0.75}
          fillOpacity={0}
          gridOpacity={0.055}
          cellRadius={0}
          clickPulse={true}
          pulseSpeed={600}
        />
      </div>
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '0 clamp(20px,5vw,48px)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,18px)' }}>
          <span style={{
            width: 'clamp(48px,6.5vw,72px)',
            height: 'clamp(48px,6.5vw,72px)',
            borderRadius: 'clamp(12px,1.8vw,20px)',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            background: '#ffffff',
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(15,23,42,0.06)',
          }}>
            <img src="/brand/kairo-mark.svg" alt="" style={{ width: '78%', height: '78%', objectFit: 'contain', display: 'block' }} />
          </span>
          <span style={{
            fontSize: 'clamp(40px,8vw,88px)',
            fontWeight: 900,
            color: C.ink,
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}>
            Kairo
          </span>
        </div>
        <p style={{
          fontSize: 'clamp(1rem,2vw,1.3rem)',
          color: C.muted,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          margin: 0,
          maxWidth: 520,
        }}>
          Prepara la PAU con claridad.
        </p>
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '13px 28px', borderRadius: 999,
          background: C.grad, color: '#fff',
          fontWeight: 800, fontSize: 15, textDecoration: 'none',
          boxShadow: '0 12px 32px rgba(37,99,235,0.25)',
          letterSpacing: '-0.01em',
          marginTop: 8,
        }}>
          Empezar gratis
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowRight size={13} />
          </span>
        </Link>
      </div>
    </section>
  )
}
