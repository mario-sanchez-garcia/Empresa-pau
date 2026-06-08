'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Copy, Lightbulb, MessageCircle, RotateCcw, Target, TriangleAlert } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroRecord } from '@/components/simulacros/types'
import MathMarkdown from '@/components/shared/MathMarkdown'

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
      actions={<a href="/simulacros" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 px-4 py-2 text-sm font-black text-white no-underline shadow-[0_16px_34px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5"><RotateCcw size={16} />Nuevo simulacro</a>}
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        <section className="overflow-hidden rounded-[28px] border border-[#dbe7fb] bg-white/90 shadow-[0_22px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full px-4 py-2 text-sm font-black text-white" style={{ background: cfg.color }}>{cfg.label} · {record.dificultad_real ?? record.dificultad}</div>
            <div className="text-7xl font-black tracking-tight" style={{ color: gradeColor(nota) }}>{nota.toFixed(2)}</div>
            <div className="mt-2 text-lg font-black text-slate-500">/10 · {nota14.toFixed(2)}/14</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-black text-slate-600">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Completado en {record.tiempo_empleado ?? 0} min de 90</span>
              {record.asignatura !== 'lengua' && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Opción {record.opcion}</span>}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{record.id.slice(0, 8)}</span>
            </div>
            {(record.tiempo_empleado ?? 0) > 90 && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-black text-blue-800">En el examen real habrías entregado al llegar a 90 min.</div>}
          </div>
          <div className="h-3 bg-blue-50"><div className="h-full" style={{ width: `${Math.min(100, nota * 10)}%`, background: gradeColor(nota) }} /></div>
        </section>

        <nav className="flex flex-wrap gap-2 rounded-3xl border border-[#dbe7fb] bg-white/90 p-2 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          {[
            ['resumen', 'Resumen'],
            ['detalle', 'Corrección detallada'],
            ['plan', 'Plan de repaso'],
            ['bloques', 'Por bloques temáticos']
          ].map(([id, label]) => <button key={id} onClick={() => setTab(id as Tab)} className={`rounded-2xl px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 ${tab === id ? 'bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>{label}</button>)}
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
              <article key={index} className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{block.tema}</h2>
                    <p className="text-sm font-semibold text-slate-500">Año {block.año_origen} · {block.convocatoria_origen}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">{format(block.puntos_conseguidos)}/{format(block.puntos_maximos)} · {block.porcentaje_logrado ?? 0}%</span>
                </div>
                {Array.isArray(block.penalizaciones_aplicadas) && block.penalizaciones_aplicadas.length > 0 && (
                  <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-blue-900">
                    {block.penalizaciones_aplicadas.map((penalty: any, i: number) => <div key={i}>- {penalty.motivo}: {penalty.puntos_descontados}</div>)}
                  </div>
                )}
                <Markdown text={block.correccion_detalle} />
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"><strong className="block text-blue-900">Solución correcta corta</strong><Markdown text={block.solucion_correcta_corta} /></div>
                <div className="mt-4 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 text-blue-950"><strong className="mb-1 flex items-center gap-2"><Lightbulb size={16} />Consejo específico</strong>{block.consejo_especifico}</div>
              </article>
            ))}
          </section>
        )}

        {tab === 'plan' && (
          <section className="grid gap-4 md:grid-cols-3">
            {plan.map((item: any) => (
              <article key={item.prioridad} className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]">{item.prioridad}</div>
                <h3 className="mb-2 text-lg font-black">{item.tema}</h3>
                <p className="text-sm font-semibold text-slate-600">{item.accion}</p>
                <p className="mt-3 text-sm font-black text-slate-500"><Clock size={15} className="mr-1 inline" />{item.tiempo_recomendado}</p>
                <a href="/" className="mt-4 inline-block rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white no-underline shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5">Practicar en Pausia</a>
              </article>
            ))}
          </section>
        )}

        {tab === 'bloques' && (
          <section className="grid gap-4 md:grid-cols-4">
            {resumen.map((item: any, index: number) => (
              <article key={index} className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
                <h3 className="font-black">{item.bloque}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{format(item.puntos_conseguidos)}/{format(item.puntos_maximos)} puntos</p>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-blue-50"><div className="h-full bg-blue-600" style={{ width: `${item.porcentaje ?? 0}%` }} /></div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${levelClass(item.nivel)}`}>{item.nivel}</span>
              </article>
            ))}
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <button onClick={share} className="flex items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white px-4 py-2 font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Copy size={16} />Compartir resultado</button>
          <a href="/" className="flex items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white px-4 py-2 font-black text-slate-700 no-underline transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><MessageCircle size={16} />Preguntar a Pausia</a>
        </div>
      </div>
    </SimulacroShell>
  )
}

function ResultCard({ icon, title, text, tone = 'blue' }: { icon: ReactNode; title: string; text?: string; tone?: 'blue' | 'green' | 'orange' }) {
  const bg = tone === 'green' ? 'bg-sky-50' : tone === 'orange' ? 'bg-blue-50' : 'bg-white/90'
  return <article className={`rounded-[28px] border border-[#dbe7fb] p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl ${bg}`}><div className="mb-3 flex items-center gap-2 font-black text-blue-800">{icon}{title}</div><p className="text-sm font-semibold leading-7 text-slate-600">{text || 'Sin datos.'}</p></article>
}

function Markdown({ text }: { text?: string }) {
  return <MathMarkdown text={text} className="prose prose-slate" />
}

function gradeColor(n: number) {
  if (n < 5) return '#1d4ed8'
  if (n < 6) return '#2563eb'
  if (n < 7) return '#0284c7'
  if (n < 9) return '#0f5ea8'
  return '#1e3a8a'
}

function levelClass(level?: string) {
  if (level?.includes('Domina')) return 'bg-sky-50 text-sky-700'
  if (level?.includes('urgente')) return 'bg-blue-50 text-blue-800'
  return 'bg-indigo-50 text-indigo-700'
}

function format(value: any) {
  return typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : '0'
}
