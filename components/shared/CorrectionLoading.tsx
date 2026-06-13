import { CheckCircle2, Cog, Sparkles } from 'lucide-react'

export default function CorrectionLoading({ stage }: { stage?: string }) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/80 to-sky-50 p-4 shadow-[0_16px_38px_rgba(37,99,235,0.10)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white text-blue-700 shadow-sm">
          <Cog className="h-5 w-5 animate-spin [animation-duration:3s]" aria-hidden="true" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-sky-500" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black text-slate-900">{stage || 'Pausia está corrigiendo tu respuesta'}</div>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            Analizando el procedimiento, los criterios PAU y la teoría del ejercicio.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {['Leyendo respuesta', 'Comparando criterios', 'Preparando feedback'].map((label, index) => (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-[11px] font-bold text-slate-600">
            {index === 0 ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
            ) : (
              <span className={`h-2 w-2 shrink-0 rounded-full bg-blue-400 ${index === 1 ? 'animate-pulse' : 'opacity-50'}`} aria-hidden="true" />
            )}
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
