'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, LayoutGrid, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'
import KairoSpinner from '@/app/components/ui/KairoSpinner'
import Flashcards from '@/components/zona/Flashcards'
import SectionIntroCard from '@/components/shared/SectionIntroCard'
import type { Flashcard, ZonaUser } from '@/components/zona/types'

const STUDY_DESK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_130632_68dfbf7a-aa85-468a-87c7-855c54c5b88f.png'

const SUBJ_CHIPS: { label: string; id: 'all' | 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'historia' | 'lengua' | 'ingles'; color: string }[] = [
  { label: 'Todas',       id: 'all',               color: '#94a3b8' },
  { label: 'Mates II',    id: 'mates',             color: '#2563eb' },
  { label: 'Mates CCSS',  id: 'matematicas_ccss',  color: '#7c3aed' },
  { label: 'Física',      id: 'fisica',            color: '#CA8A04' },
  { label: 'Química',     id: 'quimica',           color: '#ea580c' },
  { label: 'Biología',    id: 'biologia',          color: '#2f6f4e' },
  { label: 'Historia',    id: 'historia',          color: '#92400e' },
  { label: 'Lengua',      id: 'lengua',            color: '#0284C7' },
  { label: 'Inglés',      id: 'ingles',            color: '#0f766e' },
]

export default function ZonaPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState<'all' | 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'historia' | 'lengua' | 'ingles'>('all')
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

  if (loading || !user) return <KairoSpinner />

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#f8fafc' }}>
      <style>{`
        .zona-hero {
          height: 200px !important;
        }

        .zona-hero-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%) !important;
          padding: 20px 28px !important;
        }

        .zona-hero-title {
          font-size: 40px !important;
          letter-spacing: -.035em !important;
        }

        @media (max-width: 767px) {
          .zona-hero { height: 130px !important; }
          .zona-hero-title { font-size: 28px !important; }
          .zona-hero-overlay { padding: 16px 20px !important; }
          .zona-main { padding: 16px 16px 20px !important; }
        }
      `}</style>
      <SidebarNav />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Hero */}
        <div className="zona-hero" style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
          <img src={STUDY_DESK_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'brightness(.5) saturate(.7)' }} />
          <div className="zona-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%)', display: 'flex', alignItems: 'flex-end', padding: '20px 28px' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Kairo · Tu espacio personal</div>
              <div className="zona-hero-title" style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-.035em', lineHeight: .9 }}>La Zona</div>
            </div>
          </div>
        </div>

        {/* Subject chips band */}
        <div style={{ background: 'white', borderBottom: '2px solid #0f172a', display: 'flex', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none', padding: '0 20px' }}>
          {SUBJ_CHIPS.map((chip) => {
            const isActive = activeSubject === chip.id
            return (
              <button
                key={chip.label}
                onClick={() => setActiveSubject(chip.id)}
                style={{ padding: '12px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent', marginBottom: -2, fontSize: 11, fontWeight: 700, color: isActive ? '#0f172a' : '#64748b', background: 'none', border: 'none', borderBottomStyle: 'solid', cursor: 'pointer' }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: chip.color, flexShrink: 0 }} />
                {chip.label}
              </button>
            )
          })}
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
          <a href="/zona/cursos" style={{ padding: '13px 20px', fontSize: 12, fontWeight: 900, color: '#64748b', borderBottom: '3px solid transparent', marginBottom: -1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <BookOpen size={13} /> Mis Cursos
          </a>
        </div>

        {/* Content */}
        <main className="kairo-page-scroll zona-main" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          <SectionIntroCard
            hintKey="hint_zona"
            line1="Repasa con flashcards lo que más se te resiste."
            line2="Para pasar de saber la teoría a recordarla de verdad."
          />
          <Flashcards userId={user.id} initialCards={cards} externalSubject={activeSubject} />
        </main>
      </div>
    </div>
  )
}
