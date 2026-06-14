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
    <div className="pau-bg-atmosphere flex min-h-screen text-slate-900 max-lg:block">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="pau-glass sticky top-0 z-40 flex min-h-[68px] items-center justify-between gap-4 border-b border-[var(--pau-border)] px-8 max-md:flex-wrap max-md:px-4">
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
