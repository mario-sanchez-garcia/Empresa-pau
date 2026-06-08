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
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-slate-900 max-lg:block">
      <aside className="sticky top-0 flex h-screen w-[282px] shrink-0 flex-col border-r border-[#dbe7fb] bg-white/80 shadow-[18px_0_55px_rgba(37,99,235,0.055)] backdrop-blur-2xl max-lg:relative max-lg:h-auto max-lg:w-full">
        <div className="border-b border-[#dbe7fb] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-lg font-black">Pausia</div>
              <div className="text-xs text-slate-500">Academia IA · EBAU Madrid</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Navegacion</div>
          <NavLink href="/" icon={<ClipboardList size={18} />} title="Exámenes" subtitle="Practica y corrige" />
          <NavLink href="/simulacros" active icon={<TimerReset size={18} />} title="Simulacros" subtitle="Condiciones reales" />
          <NavLink href="/zona" icon={<BrainCircuit size={18} />} title="La Zona" subtitle="Estudia a tu manera" />
          <NavLink href="/" icon={<MessageCircle size={18} />} title="Chat con Pausia" subtitle="Resuelve dudas" />
          <NavLink href="/" icon={<BarChart3 size={18} />} title="Historial" subtitle="Tus correcciones" />
          <NavLink href="/planning" icon={<Rocket size={18} />} title="Planning" subtitle="Tareas completables" />
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between gap-4 border-b border-[#dbe7fb] bg-white/80 px-8 backdrop-blur-xl max-md:flex-wrap max-md:px-4">
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
    <a href={href} className={`mb-2 flex items-center gap-3 rounded-2xl border p-3 no-underline transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_14px_32px_rgba(37,99,235,0.1)] ${active ? 'border-blue-300 bg-blue-50 text-slate-900 shadow-[0_14px_32px_rgba(37,99,235,0.1)]' : 'border-transparent text-slate-600'}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-blue-600 text-white' : 'border border-[#dbe7fb] bg-white text-blue-600'}`}>{icon}</span>
      <span><strong className="block text-sm">{title}</strong><small className="block text-xs text-slate-400">{subtitle}</small></span>
    </a>
  )
}
