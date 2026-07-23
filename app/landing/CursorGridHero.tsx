'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight } from 'lucide-react'
import type { CircularGalleryItem } from '@/components/ui/CircularGallery'

const CursorGrid = dynamic(() => import('@/components/ui/CursorGrid'), { ssr: false })
const CircularGallery = dynamic(() => import('@/components/ui/CircularGallery'), { ssr: false })

const C = {
  ink:  '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  grad: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 52%, #3b82f6 100%)',
}

const GALLERY_ITEMS: CircularGalleryItem[] = [
  { image: '/brand/hero-student.jpg',                        text: 'Campus PAU' },
  { image: '/brand/scene-exam.jpg',                          text: 'Examen EBAU' },
  { image: '/brand/scene-laptop.jpg',                        text: 'Con Kairo' },
  { image: '/brand/scene-books.jpg',                         text: 'Estudio' },
  { image: '/brand/fa-barboza-NWoaoMgMiVY-unsplash.jpg',    text: 'Preparación' },
]

export default function CursorGridHero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100svh', background: '#ffffff', overflow: 'hidden' }}>

      {/* Layer 0 — CursorGrid fills the whole section */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <CursorGrid
          color="#2563eb"
          cellSize={60}
          radius={150}
          falloff="smooth"
          holdTime={400}
          fadeDuration={900}
          lineWidth={1}
          maxOpacity={0.85}
          fillOpacity={0}
          gridOpacity={0.12}
          cellRadius={0}
          clickPulse={true}
          pulseSpeed={600}
        />
      </div>

      {/* Layer 1 — CircularGallery centred in the lower 60 % of the section.
          pointer-events: none so the gallery canvas doesn't swallow cursor
          moves intended for the CursorGrid — the gallery uses window listeners
          so drag/scroll still works regardless. */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62%',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        <CircularGallery
          items={GALLERY_ITEMS}
          bend={3}
          textColor="#1e293b"
          borderRadius={0.05}
          scrollSpeed={2}
          scrollEase={0.03}
        />
      </div>

      {/* Layer 2 — Wordmark + CTA pinned to the top portion.
          pointer-events: none on the wrapper; only the button re-enables them. */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '42%',
        zIndex: 2,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '0 clamp(20px,5vw,48px)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,16px)' }}>
          <span style={{
            width: 'clamp(44px,5.5vw,64px)',
            height: 'clamp(44px,5.5vw,64px)',
            borderRadius: 'clamp(10px,1.5vw,18px)',
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
            fontSize: 'clamp(36px,7vw,80px)',
            fontWeight: 900,
            color: C.ink,
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}>
            Kairo
          </span>
        </div>
        <p style={{
          fontSize: 'clamp(0.95rem,1.8vw,1.2rem)',
          color: C.muted,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          margin: 0,
          maxWidth: 480,
        }}>
          Prepara la PAU con claridad.
        </p>
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '12px 26px', borderRadius: 999,
          background: C.grad, color: '#fff',
          fontWeight: 800, fontSize: 14, textDecoration: 'none',
          boxShadow: '0 12px 32px rgba(37,99,235,0.25)',
          letterSpacing: '-0.01em',
          pointerEvents: 'auto',
        }}>
          Empezar gratis
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowRight size={12} />
          </span>
        </Link>
      </div>

    </section>
  )
}
