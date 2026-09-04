'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { BookOpen, LayoutGrid, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'
import type { ZonaCanvas, ZonaUser } from '@/components/zona/types'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

const BOOKS_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_134153_21d8ecce-c198-4ae1-8fc9-22814072fdbc.png'

const CanvasBoard = dynamic(() => import('@/components/zona/canvas/CanvasBoard'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', minHeight: 520, alignItems: 'center', justifyContent: 'center', borderRadius: 24, border: '1px solid var(--clay-border)', background: 'var(--clay-surface)', fontWeight: 900, color: 'var(--clay-accent)' }}>Preparando tu espacio...</div>
})


export default function ZonaCanvasPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [canvases, setCanvases] = useState<ZonaCanvas[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { theme } = useClayThemePreference()

  useEffect(() => {
    if (!CANVAS_ENABLED) return
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser({ id: data.user.id, email: data.user.email })
      const { data: rows } = await supabase
        .from('canvases')
        .select('*')
        .eq('user_id', data.user.id)
        .order('updated_at', { ascending: false })
      setCanvases((rows ?? []) as ZonaCanvas[])
      setLoading(false)
    }
    load()
  }, [router])

  if (!CANVAS_ENABLED) {
    return (
      <ClayThemeScope theme={theme} style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: 'var(--clay-accent)', color: 'var(--clay-on-accent)' }}><LayoutGrid size={28} /></div>
          <p style={{ fontWeight: 900, color: 'var(--clay-text)', fontSize: 18, marginBottom: 8 }}>Mi Espacio — próximamente</p>
          <p style={{ color: 'var(--clay-text-muted)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>Esta sección está temporalmente desactivada. Vuelve pronto.</p>
          <a href="/zona" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: 'var(--clay-accent-deep)', padding: '10px 20px', fontSize: 13, fontWeight: 900, color: '#fff', textDecoration: 'none' }}>← Volver a La Zona</a>
        </div>
      </ClayThemeScope>
    )
  }

  if (loading || !user) {
    return (
      <ClayThemeScope theme={theme} style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: 'var(--clay-accent)', color: 'var(--clay-on-accent)' }}><Zap size={28} /></div>
          <p style={{ fontWeight: 900, color: 'var(--clay-text-muted)', margin: 0 }}>Abriendo Mi Espacio...</p>
        </div>
      </ClayThemeScope>
    )
  }

  return (
    <ClayThemeScope theme={theme} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        .canvas-hero {
          height: 200px !important;
        }

        .canvas-hero-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%) !important;
          padding: 20px 28px !important;
        }

        .canvas-hero-title {
          font-size: 40px !important;
          letter-spacing: -.035em !important;
        }

        /* iPad/tablet: mismo ajuste que el resto de La Zona — sin esto el
           hero se quedaba a altura de escritorio en tablet. */
        @media (min-width: 768px) and (max-width: 1024px) {
          .canvas-hero { height: 160px !important; }
          .canvas-hero-title { font-size: 32px !important; }
          .canvas-hero-overlay { padding: 18px 24px !important; }
        }

        @media (max-width: 767px) {
          .canvas-hero { height: 130px !important; }
          .canvas-hero-title { font-size: 28px !important; }
          .canvas-hero-overlay { padding: 16px 20px !important; }
        }
      `}</style>
      <SidebarNav />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Hero */}
        <div className="canvas-hero" style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
          <img src={BOOKS_IMG} alt="" loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(.5) saturate(.7)' }} />
          <div className="canvas-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%)', display: 'flex', alignItems: 'flex-end', padding: '20px 28px' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Kairo · Canvas infinito</div>
              <div className="canvas-hero-title" style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-.035em', lineHeight: .9 }}>Mi Espacio</div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ background: 'var(--clay-surface)', borderBottom: '2px solid var(--clay-border)', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
          <a href="/zona" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: 'var(--clay-text-muted)', borderBottom: '3px solid transparent', marginBottom: -2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Zap size={13} /> Zona de Estudio
          </a>
          <a href="/zona/canvas" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: 'var(--clay-text)', borderBottom: '3px solid var(--clay-accent)', marginBottom: -2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <LayoutGrid size={13} /> Mi Espacio
          </a>
          <a href="/zona/cursos" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: 'var(--clay-text-muted)', borderBottom: '3px solid transparent', marginBottom: -2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <BookOpen size={13} /> Mis Cursos
          </a>
        </div>

        {/* Canvas content fills remaining height */}
        <main style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
          <CanvasBoard userId={user.id} initialCanvases={canvases} />
        </main>
      </div>
    </ClayThemeScope>
  )
}
