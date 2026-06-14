import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { caminoTaskTypes, type DailyCaminoTask } from '@/app/lib/camino/caminoData'

interface DailyTaskCardProps {
  task: DailyCaminoTask
  completed: boolean
  onComplete: (task: DailyCaminoTask) => void
}

const variantClasses = {
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  sky: 'border-sky-100 bg-sky-50 text-sky-700',
  violet: 'border-violet-100 bg-violet-50 text-violet-700',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-100 bg-amber-50 text-amber-700',
  slate: 'border-slate-100 bg-slate-50 text-slate-700'
} as const

export default function DailyTaskCard({ task, completed, onComplete }: DailyTaskCardProps) {
  const type = caminoTaskTypes[task.type]

  return (
    <article
      style={{
        borderRadius: 14,
        border: `1px solid ${completed ? '#bbf7d0' : 'var(--pau-border)'}`,
        background: completed ? 'rgba(240,253,244,0.8)' : '#fff',
        padding: '14px 14px',
        transition: 'transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out), border-color 180ms var(--ease-out)',
        boxShadow: completed ? 'none' : 'var(--shadow-xs)',
      }}
      className={!completed ? 'pau-card-hover-effect' : ''}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onComplete(task)}
          disabled={completed}
          aria-label={completed ? `${task.title} completada` : `Completar ${task.title}`}
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${completed ? 'border-emerald-300 bg-emerald-600 text-white' : 'border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'}`}
        >
          {completed ? <CheckCircle2 size={21} /> : <Circle size={20} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${variantClasses[type.variant]}`}>{type.label}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700"><Sparkles size={12} />{task.xp} XP</span>
            {completed && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">Completada</span>}
          </div>
          <h3 className="mt-3 text-base font-black text-slate-900">{task.title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{task.detail}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-400">{task.subject}{task.block ? ` · ${task.block}` : ''}</p>
            <Link
              href={task.actionHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {task.actionLabel} <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
