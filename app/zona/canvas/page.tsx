'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { LayoutGrid, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'
import type { ZonaCanvas, ZonaUser } from '@/components/zona/types'

const BOOKS_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_134153_21d8ecce-c198-4ae1-8fc9-22814072fdbc.png'

const CanvasBoard = dynamic(() => import('@/components/zona/canvas/CanvasBoard'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', minHeight: 520, alignItems: 'center', justifyContent: 'center', borderRadius: 24, border: '1px solid #dbe7fb', background: 'rgba(255,255,255,.8)', fontWeight: 900, color: '#2563eb' }}>Preparando tu espacio...</div>
})


export default function ZonaCanvasPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [canvases, setCanvases] = useState<ZonaCanvas[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: '#2563eb', color: 'white' }}><LayoutGrid size={28} /></div>
          <p style={{ fontWeight: 900, color: '#0f172a', fontSize: 18, marginBottom: 8 }}>Mi Espacio — próximamente</p>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>Esta sección está temporalmente desactivada. Vuelve pronto.</p>
          <a href="/zona" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: '#0f172a', padding: '10px 20px', fontSize: 13, fontWeight: 900, color: 'white', textDecoration: 'none' }}>← Volver a La Zona</a>
        </div>
      </div>
    )
  }

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: '#2563eb', color: 'white' }}><Zap size={28} /></div>
          <p style={{ fontWeight: 900, color: '#64748b', margin: 0 }}>Abriendo Mi Espacio...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <SidebarNav />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Hero 155px */}
        <div style={{ position: 'relative', height: 155, flexShrink: 0, overflow: 'hidden' }}>
          <img src={BOOKS_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(.42) saturate(.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 70%)', display: 'flex', alignItems: 'flex-end', padding: '16px 28px' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Kairo · Canvas infinito</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-.04em', lineHeight: .95 }}>Mi Espacio</div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ background: 'white', borderBottom: '2px solid #0f172a', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
          <a href="/zona" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#64748b', borderBottom: '3px solid transparent', marginBottom: -2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Zap size={13} /> Zona de Estudio
          </a>
          <a href="/zona/canvas" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#0f172a', borderBottom: '3px solid #2563eb', marginBottom: -2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <LayoutGrid size={13} /> Mi Espacio
          </a>
        </div>

        {/* Canvas content fills remaining height */}
        <main style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
          <CanvasBoard userId={user.id} initialCanvases={canvases} />
        </main>
      </div>
    </div>
  )
}
