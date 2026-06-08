'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  LogOut,
  MessageCircle,
  Rocket,
  Sparkles,
  Zap
} from 'lucide-react'
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

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_18px_38px_rgba(37,99,235,0.24)]"><Zap size={28} /></div>
          <p className="font-black text-slate-500">Cargando La Zona...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-[#172033] max-lg:block">
      <aside className="sticky top-0 flex h-screen w-[282px] shrink-0 flex-col border-r border-[#dbe7fb] bg-white/80 shadow-[18px_0_55px_rgba(37,99,235,0.055)] backdrop-blur-2xl max-lg:relative max-lg:h-auto max-lg:w-full">
        <div className="border-b border-[#dbe7fb] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]"><GraduationCap size={23} /></div>
            <div>
              <div className="text-lg font-black">Pausia</div>
              <div className="text-xs text-slate-500">EBAU Madrid · practica mejor</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Navegacion</div>
          <SidebarLink href="/" icon={<ClipboardList size={17} />} title="Examenes" subtitle="Practica y corrige" />
          <SidebarLink href="/zona" active icon={<BrainCircuit size={17} />} title="La Zona" subtitle="Estudia a tu manera" />
          <SidebarLink href="/" icon={<MessageCircle size={17} />} title="Chat con Pausia" subtitle="Resuelve dudas" />
          <SidebarLink href="/" icon={<BarChart3 size={17} />} title="Historial" subtitle="Tus correcciones" />
          <SidebarLink href="/planning" icon={<Rocket size={17} />} title="Planning" subtitle="Tareas completables" />
        </nav>
        <div className="border-t border-[#dbe7fb] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-black text-blue-700">{user.email?.[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{user.email}</div>
              <div className="text-xs text-slate-400">Estudiante</div>
            </div>
          </div>
          <button onClick={cerrarSesion} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-black text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"><LogOut size={15} />Cerrar sesion</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b border-[#dbe7fb] bg-white/80 px-8 backdrop-blur-2xl max-md:h-auto max-md:flex-wrap max-md:gap-4 max-md:p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700"><BrainCircuit size={22} /></div>
            <div>
              <h1 className="m-0 text-xl font-black">La Zona</h1>
              <p className="m-0 text-sm text-slate-500">Estudia a tu manera</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)]"><Sparkles size={15} /> Flashcards</div>
            <a className="flex items-center gap-2 rounded-full border border-[#dbe7fb] bg-white/80 px-4 py-2 text-sm font-black text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" href="/zona/canvas"><Zap size={15} /> Mi Espacio</a>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl p-8 max-md:p-4">
          <Flashcards userId={user.id} initialCards={cards} />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, title, subtitle, active = false }: { href: string; icon: ReactNode; title: string; subtitle: string; active?: boolean }) {
  return (
    <a href={href} className={`mb-2 flex items-center gap-3 rounded-2xl border p-3 text-left no-underline transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_14px_32px_rgba(37,99,235,0.1)] ${active ? 'border-blue-300 bg-blue-50 text-slate-900 shadow-[0_14px_32px_rgba(37,99,235,0.1)]' : 'border-transparent text-slate-600'}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${active ? 'border-blue-200 bg-white text-blue-700' : 'border-[#dbe7fb] bg-white text-blue-600'}`}>{icon}</span>
      <span><strong className="block text-sm">{title}</strong><small className="block text-xs text-slate-400">{subtitle}</small></span>
    </a>
  )
}
