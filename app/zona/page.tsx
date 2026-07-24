'use client'

import { CANVAS_ENABLED } from '@/app/zona/canvasFlags'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit,
  Sparkles,
  Zap
} from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import Flashcards from '@/components/zona/Flashcards'
import type { Flashcard, ZonaUser } from '@/components/zona/types'

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
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#1c1c1c] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"><Zap size={28} /></div>
          <p className="font-black text-slate-500">Cargando La Zona...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] text-[#1c1c1c] max-lg:block">
      <Sidebar email={user.email} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b border-[#e0e0e0] bg-white/80 px-8 backdrop-blur-2xl max-md:h-auto max-md:flex-wrap max-md:gap-4 max-md:p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#e8e8e8] bg-[#f5f5f5] text-[#1c1c1c]"><BrainCircuit size={22} /></div>
            <div>
              <h1 className="m-0 text-xl font-black">La Zona</h1>
              <p className="m-0 text-sm text-slate-500">Estudia a tu manera</p>
              <p className="m-0 mt-1 max-w-xl text-xs font-semibold text-slate-400">Repasa conceptos, guarda errores y crea tus propias tarjetas.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-[#1c1c1c] px-4 py-2 text-sm font-black text-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"><Sparkles size={15} /> Zona de estudio</div>
            {CANVAS_ENABLED && (
              <a className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white/80 px-4 py-2 text-sm font-black text-slate-600 transition hover:border-[#ccc] hover:bg-[#f5f5f5] hover:text-[#1c1c1c]" href="/zona/canvas"><Zap size={15} /> Mi Espacio</a>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl p-8 max-md:p-4">
          <Flashcards userId={user.id} initialCards={cards} />
        </main>
      </div>
    </div>
  )
}
