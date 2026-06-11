'use client'

import type { ReactNode } from 'react'
import Sidebar from '@/app/components/Sidebar'

interface SimulacroShellProps {
  children: ReactNode
  title: string
  subtitle: string
  actions?: ReactNode
}

export default function SimulacroShell({ children, title, subtitle, actions }: SimulacroShellProps) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.9),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(224,231,255,0.72),transparent_28%),linear-gradient(135deg,#fbfdff_0%,#f8fafc_48%,#eff6ff_100%)] text-slate-900 max-lg:block">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex min-h-[82px] items-center justify-between gap-4 border-b border-[#dbe7fb] bg-white/80 px-8 backdrop-blur-xl max-md:flex-wrap max-md:px-4">
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
