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
    <div className="pausia-premium-shell flex min-h-screen text-slate-900 max-lg:block">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="pausia-topbar sticky top-0 z-40 flex items-center justify-between gap-4 px-8 max-md:flex-wrap max-md:px-4" style={{ minHeight: 64 }}>
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: '#0f172a', letterSpacing: '-0.03em' }}>{title}</h1>
            <p className="text-xs font-bold" style={{ color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>
          </div>
          {actions}
        </header>
        <main className="p-6 max-md:p-4">{children}</main>
      </div>
    </div>
  )
}
