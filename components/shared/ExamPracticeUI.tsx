import type { ReactNode } from 'react'

export function ExamMetaChips({ items, color, accent }: { items: Array<string | null | undefined | false>; color: string; accent: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.filter(Boolean).map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-black"
          style={index === 0 ? { backgroundColor: color, borderColor: color, color: '#fff' } : { borderColor: accent, color }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export function ExamContentCard({ title, color, borderColor, children, soft = false }: { title: string; color: string; borderColor: string; children: ReactNode; soft?: boolean }) {
  return (
    <section className="min-w-0 rounded-[22px] border px-5 py-4 shadow-[0_14px_34px_rgba(37,99,235,0.07)]" style={{ borderColor, backgroundColor: soft ? '#f8fafc' : '#fff' }}>
      <div className="mb-3 text-[11px] font-black uppercase tracking-[0.08em]" style={{ color }}>{title}</div>
      {children}
    </section>
  )
}
