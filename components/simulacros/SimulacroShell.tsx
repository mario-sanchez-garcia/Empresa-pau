'use client'

import type { ReactNode } from 'react'
import { BarChart3, BrainCircuit, ClipboardList, GraduationCap, MessageCircle, Rocket, TimerReset } from 'lucide-react'

interface SimulacroShellProps {
  children: ReactNode
  title: string
  subtitle: string
  actions?: ReactNode
}

export default function SimulacroShell({ children, title, subtitle, actions }: SimulacroShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-900 max-lg:block">
      <aside className="sticky top-0 flex h-screen w-[282px] shrink-0 flex-col bg-[#0f172a] text-white shadow-2xl max-lg:relative max-lg:h-auto max-lg:w-full">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-lg font-black">Pausia</div>
              <div className="text-xs text-slate-400">Academia IA · EBAU Madrid</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Navegacion</div>
          <NavLink href="/" icon={<ClipboardList size={18} />} title="Exámenes" subtitle="Practica y corrige" />
          <NavLink href="/simulacros" active icon={<TimerReset size={18} />} title="Simulacros" subtitle="Condiciones reales" />
          <NavLink href="/zona" icon={<BrainCircuit size={18} />} title="La Zona" subtitle="Estudia a tu manera" />
          <NavLink href="/" icon={<MessageCircle size={18} />} title="Chat con Pausia" subtitle="Resuelve dudas" />
          <NavLink href="/" icon={<BarChart3 size={18} />} title="Historial" subtitle="Tus correcciones" />
          <NavLink href="/planning" icon={<Rocket size={18} />} title="Planning" subtitle="Tareas completables" />
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-8 backdrop-blur-xl max-md:flex-wrap max-md:px-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{title}</h1>
            <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
          </div>
          {actions}
        </header>
        <main className="p-6 max-md:p-4">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, title, subtitle, active = false }: { href: string; icon: ReactNode; title: string; subtitle: string; active?: boolean }) {
  return (
    <a href={href} className={`mb-2 flex items-center gap-3 rounded-xl p-3 no-underline transition ${active ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-slate-300 hover:bg-white/5'}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-300'}`}>{icon}</span>
      <span><strong className="block text-sm">{title}</strong><small className="block text-xs text-slate-500">{subtitle}</small></span>
    </a>
  )
}
