import { BarChart3, ChevronRight, Target, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { GradePredictionResult } from '@/app/lib/gradePrediction'

type GradePredictionCardProps = {
  predictions: GradePredictionResult[]
  loading?: boolean
  error?: string
}

const SUBJECT_STYLES: Record<string, { color: string; light: string; border: string }> = {
  mates: { color: '#2563eb', light: '#eff6ff', border: '#dbeafe' },
  matematicas_ccss: { color: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe' },
  fisica: { color: '#CA8A04', light: '#FEFCE8', border: '#FEF08A' },
  quimica: { color: '#ea580c', light: '#fff7ed', border: '#ffedd5' },
  biologia: { color: '#4d7c0f', light: '#f7fee7', border: '#ecfccb' },
  lengua: { color: '#0284C7', light: '#E0F2FE', border: '#BAE6FD' },
  historia: { color: '#2f6f4e', light: '#f0fdf4', border: '#dcfce7' },
  ingles: { color: '#0284c7', light: '#f0f9ff', border: '#e0f2fe' },
  historia_filosofia: { color: '#64748B', light: '#F8FAFC', border: '#E2E8F0' }
}

export default function GradePredictionCard({ predictions, loading, error }: GradePredictionCardProps) {
  return (
    <section className="overflow-hidden bg-white" style={{ borderRadius: 16, border: '1px solid var(--pau-border)', boxShadow: 'var(--shadow-md)' }}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dbe7fb] bg-gradient-to-br from-white via-blue-50/50 to-sky-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
            <Target size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Nota estimada</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Estimación orientativa basada en tu práctica reciente.</p>
          </div>
        </div>
        <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-blue-700">No oficial</span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-sm font-bold text-blue-900">
            Calculando tu estimación orientativa...
          </div>
        ) : predictions.length === 0 ? (
          <EmptyState error={error} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {predictions.map(prediction => (
              <PredictionItem key={prediction.subject} prediction={prediction} />
            ))}
          </div>
        )}

        <p className="mt-4 text-xs font-semibold text-slate-400">
          No es una predicción oficial. Mejora cuanto más practicas en Kairo.
        </p>
      </div>
    </section>
  )
}

function PredictionItem({ prediction }: { prediction: GradePredictionResult }) {
  const style = SUBJECT_STYLES[prediction.subject] ?? SUBJECT_STYLES.mates
  const trend = trendCopy(prediction.trendAdjustment)
  const TrendIcon = prediction.trendAdjustment > 0 ? TrendingUp : prediction.trendAdjustment < 0 ? TrendingDown : BarChart3

  return (
    <article className="rounded-3xl border bg-white p-4 shadow-[0_12px_30px_rgba(37,99,235,0.06)]" style={{ borderColor: style.border }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{prediction.subjectLabel}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">Basado en {prediction.simulacroCount} simulacros y {prediction.correctionCount} correcciones.</p>
        </div>
        <span className={confidenceClass(prediction.confidence)}>Confianza {prediction.confidence}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-slate-400">Rango orientativo</p>
          <p className="mt-1 text-4xl font-black tabular-nums" style={{ color: style.color }}>{formatGrade(prediction.min)} - {formatGrade(prediction.max)}</p>
        </div>
        <div className="rounded-2xl px-3 py-2 text-xs font-black" style={{ background: style.light, color: style.color }}>
          Centro: {formatGrade(prediction.estimated)}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl p-3 text-sm font-semibold" style={{ background: style.light, color: style.color }}>
        <TrendIcon size={16} className="mt-0.5 shrink-0" />
        <span>{trend}</span>
      </div>
    </article>
  )
}

function EmptyState({ error }: { error?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-blue-950">Todavía no hay datos suficientes para estimar tu nota.</h3>
          <p className="mt-1 text-sm font-semibold text-blue-800">
            Haz tu primer simulacro o corrige algunos ejercicios para estimar tu nota.
          </p>
          {error && <p className="mt-2 text-xs font-semibold text-blue-700">{error}</p>}
        </div>
        <Link href="/simulacros" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white no-underline shadow-[0_14px_28px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5">
          Empezar <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}

function confidenceClass(confidence: GradePredictionResult['confidence']) {
  if (confidence === 'alta') return 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700'
  if (confidence === 'media') return 'rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700'
  return 'rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600'
}

function trendCopy(adjustment: number) {
  if (adjustment > 0) return 'Tu práctica reciente mejora ligeramente la estimación.'
  if (adjustment < 0) return 'Tu práctica reciente baja un poco la estimación; conviene repasar los últimos errores.'
  return 'Tu estimación se mantiene estable con los datos actuales.'
}

function formatGrade(value: number) {
  return value.toFixed(1).replace('.', ',')
}
