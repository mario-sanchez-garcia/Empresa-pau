'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
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
import type { ZonaCanvas, ZonaUser } from '@/components/zona/types'

const CanvasBoard = dynamic(() => import('@/components/zona/canvas/CanvasBoard'), {
  ssr: false,
  loading: () => <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-[#f2e4d4] bg-white/80 font-black text-[#7C3AED]">Preparando tu espacio...</div>
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

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff8f1] via-[#fff7ed] to-[#eef6ff]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#7C3AED] text-white shadow-xl"><Zap size={28} /></div>
          <p className="font-black text-[#7c6f64]">Abriendo Mi Espacio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#fff8f1] via-[#fff7ed] to-[#eef6ff] text-[#172033] max-lg:block">
      <aside className="sticky top-0 flex h-screen w-[282px] shrink-0 flex-col border-r border-[#f2e4d4] bg-[#fffdf9]/85 shadow-2xl backdrop-blur-2xl max-lg:relative max-lg:h-auto max-lg:w-full">
        <div className="border-b border-[#f2e4d4] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] via-[#fb7185] to-[#2563eb] text-white shadow-lg"><GraduationCap size={23} /></div>
            <div>
              <div className="text-lg font-black">Pausia</div>
              <div className="text-xs text-[#7c6f64]">EBAU Madrid · practica mejor</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-[#a5917d]">Navegacion</div>
          <SidebarLink href="/" icon={<ClipboardList size={17} />} title="Examenes" subtitle="Practica y corrige" />
          <SidebarLink href="/zona" active icon={<BrainCircuit size={17} />} title="La Zona" subtitle="Estudia a tu manera" />
          <SidebarLink href="/" icon={<MessageCircle size={17} />} title="Chat con Pausia" subtitle="Resuelve dudas" />
          <SidebarLink href="/" icon={<BarChart3 size={17} />} title="Historial" subtitle="Tus correcciones" />
          <SidebarLink href="/planning" icon={<Rocket size={17} />} title="Planning" subtitle="Tareas completables" />
        </nav>
        <div className="border-t border-[#f2e4d4] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd6fe] bg-[#f5f3ff] text-sm font-black text-[#7C3AED]">{user.email?.[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{user.email}</div>
              <div className="text-xs text-[#a5917d]">Estudiante</div>
            </div>
          </div>
          <button onClick={cerrarSesion} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-3 py-2 text-xs font-black text-red-600"><LogOut size={15} />Cerrar sesion</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b border-[#f2e4d4] bg-[#fffdf9]/80 px-8 backdrop-blur-2xl max-md:h-auto max-md:flex-wrap max-md:gap-4 max-md:p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ddd6fe] bg-[#f5f3ff] text-[#7C3AED]"><BrainCircuit size={22} /></div>
            <div>
              <h1 className="m-0 text-xl font-black">Mi Espacio</h1>
              <p className="m-0 text-sm text-[#a5917d]">Canvas infinito para pensar visualmente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a className="flex items-center gap-2 rounded-full border border-[#f2e4d4] bg-white/80 px-4 py-2 text-sm font-black text-[#7c6f64]" href="/zona"><Sparkles size={15} /> Flashcards</a>
            <div className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2 text-sm font-black text-white shadow-lg"><Zap size={15} /> Mi Espacio</div>
          </div>
        </header>
        <main className="h-[calc(100vh-78px)] p-4 max-md:h-auto max-md:min-h-[760px]">
          <CanvasBoard userId={user.id} initialCanvases={canvases} />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, title, subtitle, active = false }: { href: string; icon: ReactNode; title: string; subtitle: string; active?: boolean }) {
  return (
    <a href={href} className={`mb-2 flex items-center gap-3 rounded-2xl border p-3 text-left no-underline ${active ? 'border-[#ddd6fe] bg-[#f5f3ff] text-[#7C3AED] shadow-lg' : 'border-transparent text-[#7c6f64]'}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${active ? 'border-[#ddd6fe] bg-white text-[#7C3AED]' : 'border-[#f2e4d4] bg-[#fffaf5]'}`}>{icon}</span>
      <span><strong className="block text-sm">{title}</strong><small className="block text-xs text-[#a5917d]">{subtitle}</small></span>
    </a>
  )
}
