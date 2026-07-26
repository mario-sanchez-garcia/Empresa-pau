'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'
import Flashcards from '@/components/zona/Flashcards'
import type { Flashcard, ZonaUser } from '@/components/zona/types'

const STUDY_DESK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_130632_68dfbf7a-aa85-468a-87c7-855c54c5b88f.png'

const SUBJ_CHIPS = [
  { label: 'Todas', color: '#94a3b8' },
  { label: 'Mates II', color: '#2563eb' },
  { label: 'Mates CCSS', color: '#7c3aed' },
  { label: 'Física', color: '#CA8A04' },
  { label: 'Química', color: '#ea580c' },
  { label: 'Biología', color: '#2f6f4e' },
  { label: 'Historia', color: '#92400e' },
  { label: 'Lengua', color: '#0284C7' },
  { label: 'Inglés', color: '#0f766e' },
]

export default function ZonaPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser({ id: data.user.id, email: data.user.email })
      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
      setCards((flashcards ?? []) as Flashcard[])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, background: '#2563eb', color: 'white' }}><Zap size={28} /></div>
          <p style={{ fontWeight: 900, color: '#64748b', margin: 0 }}>Cargando La Zona...</p>
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
          <img src={STUDY_DESK_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(.4) saturate(.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 70%)', display: 'flex', alignItems: 'flex-end', padding: '16px 28px' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Kairo · Tu espacio personal</div>
              <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-.04em', lineHeight: .95 }}>La Zona</div>
            </div>
          </div>
        </div>

        {/* Subject chips band */}
        <div style={{ background: 'white', borderBottom: '2px solid #0f172a', display: 'flex', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none', padding: '0 20px' }}>
          {SUBJ_CHIPS.map((chip, i) => (
            <div key={chip.label} style={{ padding: '12px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, borderBottom: i === 0 ? '3px solid #2563eb' : '3px solid transparent', marginBottom: -2, fontSize: 11, fontWeight: 700, color: i === 0 ? '#0f172a' : '#64748b' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: chip.color, flexShrink: 0 }} />
              {chip.label}
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
          <a href="/zona" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#0f172a', borderBottom: '3px solid #2563eb', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Zap size={13} /> Zona de Estudio
          </a>
          {CANVAS_ENABLED && (
            <a href="/zona/canvas" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#64748b', borderBottom: '3px solid transparent', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
              <LayoutGrid size={13} /> Mi Espacio
            </a>
          )}
        </div>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          <Flashcards userId={user.id} initialCards={cards} />
        </main>
      </div>
    </div>
  )
}
