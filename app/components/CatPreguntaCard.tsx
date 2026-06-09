'use client'

import type { PreguntaCat } from '@/app/data/examenes'
import MathMarkdown from '@/components/shared/MathMarkdown'

export default function CatPreguntaCard({ pregunta }: { pregunta: PreguntaCat }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-[0_18px_45px_rgba(180,35,42,0.08)]">
      <header className="flex items-start justify-between gap-4 border-b border-rose-100 bg-rose-50 px-6 py-4">
        <div>
          <div className="mb-1 text-[11px] font-black uppercase tracking-widest text-rose-700">
            {pregunta.serie} · Ejercicio {pregunta.ejercicio}{pregunta.opcion ? ` · Opción ${pregunta.opcion}` : ''}
          </div>
          <h3 className="text-lg font-black text-slate-900">{pregunta.tema}</h3>
        </div>
        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-rose-700 shadow-sm">
          {pregunta.puntuacion} pts
        </div>
      </header>
      <div className="p-6">
        <MathMarkdown text={pregunta.enunciado} className="text-[1.05rem] leading-8 text-slate-800" />
        {pregunta.apartados.length > 0 && (
          <ul className="mt-5 grid gap-2">
            {pregunta.apartados.map((apartado, index) => (
              <li key={index} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {apartado}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
