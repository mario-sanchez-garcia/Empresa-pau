'use client'

import { Medal } from 'lucide-react'
import { divisionFor } from '@/app/lib/camino/leagues'

export type RankingEntry = {
  id: string
  name: string
  community: string
  xp: number
  rank: number
  isCurrentUser: boolean
  isMock?: boolean
}

export default function RankingRow({ row, fixed = false }: { row: RankingEntry; fixed?: boolean }) {
  const rowDivision = divisionFor(row.xp)
  const podium = row.rank <= 3
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${row.isCurrentUser ? 'border border-blue-200 bg-blue-50 shadow-sm' : podium ? 'bg-white shadow-sm' : 'bg-white/70'} ${fixed ? 'ring-1 ring-blue-100' : ''}`}>
      <span className="min-w-0 text-sm font-black text-slate-800">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black" style={{ background: podium ? rowDivision.bg : '#f1f5f9', color: podium ? rowDivision.text : '#64748b' }}>
          {podium ? <Medal size={14} /> : `#${row.rank}`}
        </span>
        {row.name}
        {row.isMock && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-400">demo</span>}
      </span>
      <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: rowDivision.bg, color: rowDivision.text }}>{rowDivision.name}</span>
      <span className="shrink-0 text-xs font-black text-blue-700">{row.xp.toLocaleString('es-ES')} XP</span>
    </div>
  )
}
