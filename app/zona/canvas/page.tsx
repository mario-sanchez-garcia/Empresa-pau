'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit,
  Sparkles,
  Zap
} from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import type { ZonaCanvas, ZonaUser } from '@/components/zona/types'

const CanvasBoard = dynamic(() => import('@/components/zona/canvas/CanvasBoard'), {
  ssr: false,
  loading: () => <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-[#dbe7fb] bg-white/80 font-black text-blue-700 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">Preparando tu espacio...</div>
})

export default function ZonaCanvasPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [canvases, setCanvases] = useState<ZonaCanvas[]>([])
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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_18px_38px_rgba(37,99,235,0.24)]"><Zap size={28} /></div>
          <p className="font-black text-slate-500">Abriendo Mi Espacio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-[#172033] max-lg:block">
      <Sidebar email={user.email} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b border-[#dbe7fb] bg-white/80 px-8 backdrop-blur-2xl max-md:h-auto max-md:flex-wrap max-md:gap-4 max-md:p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700"><BrainCircuit size={22} /></div>
            <div>
              <h1 className="m-0 text-xl font-black">Mi Espacio</h1>
              <p className="m-0 text-sm text-slate-500">Canvas infinito para pensar visualmente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a className="flex items-center gap-2 rounded-full border border-[#dbe7fb] bg-white/80 px-4 py-2 text-sm font-black text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" href="/zona"><Sparkles size={15} /> Flashcards</a>
            <div className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)]"><Zap size={15} /> Mi Espacio</div>
          </div>
        </header>
        <main className="h-[calc(100vh-78px)] p-4 max-md:h-auto max-md:min-h-[760px]">
          <CanvasBoard userId={user.id} initialCanvases={canvases} />
        </main>
      </div>
    </div>
  )
}
