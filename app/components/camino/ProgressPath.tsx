import { Lock, MapPin, Check } from 'lucide-react'
import { progressNodes } from '@/app/lib/camino/caminoData'

const nodeStyles = {
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  current: 'border-blue-300 bg-blue-600 text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)]',
  next: 'border-blue-100 bg-blue-50 text-blue-700',
  locked: 'border-slate-200 bg-slate-50 text-slate-400'
} as const

export default function ProgressPath() {
  return (
    <section style={{ borderRadius: 16, border: '1px solid var(--pau-border)', background: '#fff', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <p className="text-xs font-bold text-slate-400">Mini mapa de progreso</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">Bloques del camino</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {progressNodes.map((node, index) => (
          <div key={node.id} className="relative">
            {index < progressNodes.length - 1 && <div className="absolute left-1/2 top-6 hidden h-px w-full bg-blue-100 md:block" />}
            <div className="relative border border-[#dbe7fb] bg-white p-4" style={{ borderRadius: 12 }}>
              <div className={`mb-3 flex h-11 w-11 items-center justify-center border ${nodeStyles[node.status]}`} style={{ borderRadius: 10 }}>
                {node.status === 'completed' ? <Check size={20} /> : node.status === 'locked' ? <Lock size={18} /> : <MapPin size={19} />}
              </div>
              <h3 className="font-black text-slate-900">{node.label}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{node.description}</p>
              <span className="mt-3 inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">{labelForStatus(node.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function labelForStatus(status: 'completed' | 'current' | 'next' | 'locked') {
  if (status === 'completed') return 'Completado'
  if (status === 'current') return 'Actual'
  if (status === 'next') return 'Próximo'
  return 'Bloqueado'
}
