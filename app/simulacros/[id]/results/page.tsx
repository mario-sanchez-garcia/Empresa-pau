'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Copy, Lightbulb, MessageCircle, RotateCcw, Target, TriangleAlert } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroRecord } from '@/components/simulacros/types'
import MathMarkdown from '@/components/shared/MathMarkdown'
import 'katex/dist/katex.min.css'

type Tab = 'resumen' | 'detalle' | 'plan' | 'bloques'

export default function SimulacroResultsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [tab, setTab] = useState<Tab>('resumen')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: row } = await supabase
        .from('historial_simulacros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', data.user.id)
        .single()
      if (!row) router.push('/simulacros')
      else setRecord(row as SimulacroRecord)
    })
  }, [params.id, router])

  if (!record) {
    return <SimulacroShell title="Resultados" subtitle="Cargando corrección..."><div className="rounded-xl bg-white p-8 font-black text-slate-500">Buscando resultados...</div></SimulacroShell>
  }

  const result = record.resultado_json ?? {}
  const nota = Number(result.nota_final ?? record.nota_final ?? 0)
  const nota14 = Number(result.nota_sobre_14 ?? nota * 1.4)
  const cfg = SUBJECTS[record.asignatura]
  const detail = Array.isArray(result.desglose_bloques) ? result.desglose_bloques : []
  const plan = Array.isArray(result.plan_repaso) ? result.plan_repaso : []
  const resumen = Array.isArray(result.resumen_por_bloque_tematico) ? result.resumen_por_bloque_tematico : []

  async function share() {
    await navigator.clipboard.writeText(`He sacado un ${nota.toFixed(1)} en un simulacro de ${cfg.label} en Pausia.`)
    alert('Resultado copiado')
  }

  return (
    <SimulacroShell
      title="Resultados del simulacro"
      subtitle="Corrección completa bloque a bloque"
      actions={<a href="/simulacros" className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white no-underline"><RotateCcw size={16} />Nuevo simulacro</a>}
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full px-4 py-2 text-sm font-black text-white" style={{ background: cfg.color }}>{cfg.label} · {record.dificultad_real ?? record.dificultad}</div>
            <div className="text-7xl font-black tracking-tight" style={{ color: gradeColor(nota) }}>{nota.toFixed(2)}</div>
            <div className="mt-2 text-lg font-black text-slate-500">/10 · {nota14.toFixed(2)}/14</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-black text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">Completado en {record.tiempo_empleado ?? 0} min de 90</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Opción {record.opcion}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{record.id.slice(0, 8)}</span>
            </div>
            {(record.tiempo_empleado ?? 0) > 90 && <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-black text-amber-800">En el examen real habrías entregado al llegar a 90 min.</div>}
          </div>
          <div className="h-3 bg-slate-100"><div className="h-full" style={{ width: `${Math.min(100, nota * 10)}%`, background: gradeColor(nota) }} /></div>
        </section>

        <nav className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            ['resumen', 'Resumen'],
            ['detalle', 'Corrección detallada'],
            ['plan', 'Plan de repaso'],
            ['bloques', 'Por bloques temáticos']
          ].map(([id, label]) => <button key={id} onClick={() => setTab(id as Tab)} className={`rounded-xl px-4 py-2 text-sm font-black ${tab === id ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
        </nav>

        {tab === 'resumen' && (
          <section className="grid gap-4 md:grid-cols-2">
            <ResultCard icon={<Target />} title="Feedback general" text={result.feedback_general} />
            <ResultCard icon={<CheckCircle2 />} title="Puntos fuertes" text={result.puntos_fuertes} tone="green" />
            <ResultCard icon={<TriangleAlert />} title="Puntos de mejora" text={result.puntos_mejora} tone="orange" />
            <ResultCard icon={<Clock />} title="Contexto de dificultad" text={result.contexto_dificultad} />
          </section>
        )}

        {tab === 'detalle' && (
          <section className="grid gap-4">
            {detail.map((block: any, index: number) => (
              <article key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{block.tema}</h2>
                    <p className="text-sm font-semibold text-slate-500">Año {block.año_origen} · {block.convocatoria_origen}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black">{format(block.puntos_conseguidos)}/{format(block.puntos_maximos)} · {block.porcentaje_logrado ?? 0}%</span>
                </div>
                {Array.isArray(block.penalizaciones_aplicadas) && block.penalizaciones_aplicadas.length > 0 && (
                  <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
                    {block.penalizaciones_aplicadas.map((penalty: any, i: number) => <div key={i}>- {penalty.motivo}: {penalty.puntos_descontados}</div>)}
                  </div>
                )}
                <Markdown text={block.correccion_detalle} />
                <div className="mt-4 rounded-xl bg-blue-50 p-4"><strong className="block text-blue-900">Solución correcta corta</strong><Markdown text={block.solucion_correcta_corta} /></div>
                <div className="mt-4 rounded-xl bg-violet-50 p-4 text-violet-900"><strong className="mb-1 flex items-center gap-2"><Lightbulb size={16} />Consejo específico</strong>{block.consejo_especifico}</div>
              </article>
            ))}
          </section>
        )}

        {tab === 'plan' && (
          <section className="grid gap-4 md:grid-cols-3">
            {plan.map((item: any) => (
              <article key={item.prioridad} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-black text-white">{item.prioridad}</div>
                <h3 className="mb-2 text-lg font-black">{item.tema}</h3>
                <p className="text-sm font-semibold text-slate-600">{item.accion}</p>
                <p className="mt-3 text-sm font-black text-slate-500"><Clock size={15} className="mr-1 inline" />{item.tiempo_recomendado}</p>
                <a href="/" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white no-underline">Practicar en Pausia</a>
              </article>
            ))}
          </section>
        )}

        {tab === 'bloques' && (
          <section className="grid gap-4 md:grid-cols-4">
            {resumen.map((item: any, index: number) => (
              <article key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-black">{item.bloque}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{format(item.puntos_conseguidos)}/{format(item.puntos_maximos)} puntos</p>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-600" style={{ width: `${item.porcentaje ?? 0}%` }} /></div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${levelClass(item.nivel)}`}>{item.nivel}</span>
              </article>
            ))}
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <button onClick={share} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-black text-slate-700"><Copy size={16} />Compartir resultado</button>
          <a href="/" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-black text-slate-700 no-underline"><MessageCircle size={16} />Preguntar a Pausia</a>
        </div>
      </div>
    </SimulacroShell>
  )
}

function ResultCard({ icon, title, text, tone = 'blue' }: { icon: ReactNode; title: string; text?: string; tone?: 'blue' | 'green' | 'orange' }) {
  const bg = tone === 'green' ? 'bg-emerald-50' : tone === 'orange' ? 'bg-orange-50' : 'bg-white'
  return <article className={`rounded-xl border border-slate-200 p-6 shadow-sm ${bg}`}><div className="mb-3 flex items-center gap-2 font-black">{icon}{title}</div><p className="text-sm font-semibold leading-7 text-slate-600">{text || 'Sin datos.'}</p></article>
}

function Markdown({ text }: { text?: string }) {
  return <MathMarkdown text={text} className="prose prose-slate" />
}

function gradeColor(n: number) {
  if (n < 5) return '#dc2626'
  if (n < 6) return '#f97316'
  if (n < 7) return '#eab308'
  if (n < 9) return '#22c55e'
  return '#15803d'
}

function levelClass(level?: string) {
  if (level?.includes('Domina')) return 'bg-emerald-50 text-emerald-700'
  if (level?.includes('urgente')) return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

function format(value: any) {
  return typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : '0'
}
