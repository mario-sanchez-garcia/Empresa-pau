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
  const [copyMessage, setCopyMessage] = useState('')

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
  const correctionFailed = Boolean(result.correction_error || result.estado_correccion === 'error')
  const nota = safeNumber(result.nota_final ?? record.nota_final, 0)
  const hasGrade = !correctionFailed && isFiniteNumber(result.nota_final ?? record.nota_final)
  const nota14 = safeNumber(result.nota_sobre_14, nota * 1.4)
  const cfg = SUBJECTS[record.asignatura]
  const detail = normalizeDetail(result, record, correctionFailed)
  const plan = normalizePlan(result, detail, correctionFailed)
  const resumen = normalizeResumen(result, detail)
  const years = unique(record.bloques.map(block => block.year)).join(', ')

  async function share() {
    await navigator.clipboard.writeText(hasGrade ? `He sacado un ${nota.toFixed(1)} en un simulacro de ${cfg.label} en Pausia.` : `He completado un simulacro de ${cfg.label} en Pausia.`)
    setCopyMessage('Resultado copiado al portapapeles.')
    window.setTimeout(() => setCopyMessage(''), 2200)
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
            <div className="text-7xl font-black tracking-tight" style={{ color: hasGrade ? gradeColor(nota) : '#64748b' }}>{hasGrade ? nota.toFixed(2) : 'Sin nota'}</div>
            <div className="mt-2 text-lg font-black text-slate-500">{hasGrade ? `/10 · ${nota14.toFixed(2)}/14` : 'Corrección pendiente'}</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-black text-slate-600">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Tiempo: {record.tiempo_empleado ?? 0} min de 90</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Años: {years || 'sin datos'}</span>
              {record.asignatura !== 'lengua' && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Opción {record.opcion}</span>}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{record.id.slice(0, 8)}</span>
            </div>
            {correctionFailed && (
              <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-black text-blue-900">
                {result.mensaje_usuario ?? result.feedback_general ?? 'No hemos podido corregir este simulacro. Tus respuestas están guardadas y puedes intentarlo de nuevo.'}
              </div>
            )}
            {(record.tiempo_empleado ?? 0) > 90 && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-black text-blue-800">En el examen real habrías entregado al llegar a 90 min.</div>}
          </div>
          <div className="h-3 bg-blue-50"><div className="h-full" style={{ width: `${hasGrade ? Math.min(100, nota * 10) : 0}%`, background: hasGrade ? gradeColor(nota) : '#cbd5e1' }} /></div>
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
            <ResultCard icon={<Target />} title="Feedback general" text={result.feedback_general || 'Revisa la corrección detallada para ver el análisis bloque a bloque.'} />
            <ResultCard icon={<CheckCircle2 />} title="Qué está bien" text={result.puntos_fuertes || listToText(result.fortalezas) || 'Todavía no hay fortalezas detectadas en esta corrección.'} tone="green" />
            <ResultCard icon={<TriangleAlert />} title="Errores principales" text={result.puntos_mejora || listToText(result.errores_principales) || 'No hay errores principales disponibles. Mira cada bloque para más detalle.'} tone="orange" />
            <ResultCard icon={<Clock />} title="Contexto de dificultad" text={result.contexto_dificultad || `Simulacro de dificultad ${record.dificultad_real ?? record.dificultad}.`} />
          </section>
        )}

        {tab === 'detalle' && (
          <section className="grid gap-4">
            {detail.map((block, index) => (
              <article key={`${block.numero_bloque}-${index}`} className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{block.numero_bloque} · {block.tema}</h2>
                    <p className="text-sm font-semibold text-slate-500">Año {block.año_origen ?? 'sin datos'} · {block.convocatoria_origen || 'convocatoria sin datos'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">{format(block.puntos_conseguidos)}/{format(block.puntos_maximos)} · {block.porcentaje_logrado}%</span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <TextPanel title="Qué hizo bien" text={block.que_hizo_bien} />
                  <TextPanel title="Qué faltaba" text={block.que_faltaba} />
                  <TextPanel title="Errores detectados" text={listToText(block.errores_detectados)} />
                  <TextPanel title="Cómo mejorar" text={block.consejo_para_mejorar} />
                </div>

                {block.penalizaciones_aplicadas.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-blue-900">
                    <strong className="mb-2 block">Penalizaciones aplicadas</strong>
                    {block.penalizaciones_aplicadas.map((penalty: any, i: number) => <div key={i}>- {penalty.motivo ?? 'Penalización'}: {penalty.puntos_descontados ?? ''}</div>)}
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
                  <strong className="block text-blue-900">Corrección detallada</strong>
                  <Markdown text={block.correccion_detalle} />
                </div>
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <strong className="block text-blue-900">Solución orientativa</strong>
                  <Markdown text={block.solucion_orientativa} />
                </div>
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
                <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-900">{item.recurso_sugerido}</p>
              </article>
            ))}
          </section>
        )}

        {tab === 'bloques' && (
          <section className="grid gap-4 md:grid-cols-4">
            {resumen.map((item: any, index: number) => (
              <article key={`${item.bloque}-${index}`} className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl">
                <h3 className="font-black">{item.bloque}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{format(item.puntos_conseguidos)}/{format(item.puntos_maximos)} puntos</p>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-blue-50"><div className={`h-full ${barClass(item.nivel)}`} style={{ width: `${clamp(item.porcentaje, 0, 100)}%` }} /></div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${levelClass(item.nivel)}`}>{item.nivel}</span>
              </article>
            ))}
          </section>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={share} className="flex items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white px-4 py-2 font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Copy size={16} />Compartir resultado</button>
          <a href="/" className="flex items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white px-4 py-2 font-black text-slate-700 no-underline transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><MessageCircle size={16} />Preguntar a Pausia</a>
          {copyMessage && <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">{copyMessage}</span>}
        </div>
      </div>
    </SimulacroShell>
  )
}

function ResultCard({ icon, title, text, tone = 'blue' }: { icon: ReactNode; title: string; text?: string; tone?: 'blue' | 'green' | 'orange' }) {
  const bg = tone === 'green' ? 'bg-sky-50' : tone === 'orange' ? 'bg-blue-50' : 'bg-white/90'
  return <article className={`rounded-[28px] border border-[#dbe7fb] p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur-xl ${bg}`}><div className="mb-3 flex items-center gap-2 font-black text-blue-800">{icon}{title}</div><p className="text-sm font-semibold leading-7 text-slate-600">{text || 'Sin datos disponibles.'}</p></article>
}

function TextPanel({ title, text }: { title: string; text?: string }) {
  return <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><strong className="mb-1 block text-blue-900">{title}</strong><Markdown text={text || 'Sin datos disponibles.'} /></div>
}

function Markdown({ text }: { text?: string }) {
  return <MathMarkdown text={text || 'Sin datos disponibles.'} className="prose prose-slate" />
}

function normalizeDetail(result: any, record: SimulacroRecord, correctionFailed: boolean) {
  const raw = Array.isArray(result?.desglose_bloques) ? result.desglose_bloques : []
  return record.bloques.map((source, index) => {
    const block = raw[index] ?? {}
    const max = safeNumber(block.max_puntos ?? block.puntos_maximos ?? source.puntuacion, source.puntuacion ?? 0)
    const score = clamp(safeNumber(block.nota ?? block.puntos_conseguidos, 0), 0, max)
    const percentage = max > 0 ? Math.round(score / max * 100) : 0
    const unavailable = correctionFailed || !raw[index]
    return {
      numero_bloque: block.numero_bloque || `Bloque ${index + 1}`,
      tema: block.tema || source.tema || `Bloque ${index + 1}`,
      año_origen: block.año_origen ?? source.year ?? null,
      convocatoria_origen: block.convocatoria_origen ?? source.convocatoria ?? '',
      puntos_conseguidos: score,
      puntos_maximos: max,
      porcentaje_logrado: safeNumber(block.porcentaje_logrado ?? block.porcentaje, percentage),
      que_hizo_bien: textOrFallback(block.que_hizo_bien, unavailable ? 'La corrección no llegó a completarse, así que no podemos destacar aciertos concretos todavía.' : 'No se han indicado aciertos concretos.'),
      errores_detectados: normalizeList(block.errores_detectados, unavailable ? ['La corrección no llegó a completarse.'] : ['No se han indicado errores concretos.']),
      que_faltaba: textOrFallback(block.que_faltaba, unavailable ? 'Vuelve a intentar la corrección para ver qué faltaba en este bloque.' : 'No se ha indicado qué faltaba.'),
      penalizaciones_aplicadas: Array.isArray(block.penalizaciones_aplicadas) ? block.penalizaciones_aplicadas : [],
      correccion_detalle: textOrFallback(block.correccion_detalle, unavailable ? 'No hay corrección detallada disponible porque la corrección falló o quedó incompleta.' : 'La IA no añadió corrección detallada para este bloque.'),
      solucion_orientativa: textOrFallback(block.solucion_orientativa ?? block.solucion_correcta_corta, unavailable ? 'No hay solución orientativa disponible todavía.' : 'No se ha incluido solución orientativa.'),
      consejo_para_mejorar: textOrFallback(block.consejo_para_mejorar ?? block.consejo_especifico, unavailable ? 'Conserva tu respuesta y vuelve a corregir el simulacro cuando el servicio responda.' : 'Rehaz el bloque comparando tu desarrollo con el criterio oficial.')
    }
  })
}

function normalizePlan(result: any, detail: ReturnType<typeof normalizeDetail>, correctionFailed: boolean) {
  if (Array.isArray(result?.plan_repaso) && result.plan_repaso.length) {
    return result.plan_repaso.slice(0, 3).map((item: any, index: number) => ({
      prioridad: item.prioridad ?? index + 1,
      tema: item.tema || `Prioridad ${index + 1}`,
      accion: item.accion || 'Revisa este punto y repite un ejercicio parecido.',
      tiempo_recomendado: item.tiempo_recomendado || '20 min',
      recurso_sugerido: item.recurso_sugerido || 'Vuelve al banco de exámenes de Pausia.'
    }))
  }

  if (correctionFailed) {
    return [{ prioridad: 1, tema: 'Corrección pendiente', accion: 'Vuelve a intentar la corrección. Tus respuestas están guardadas.', tiempo_recomendado: '2 min', recurso_sugerido: 'Abre de nuevo el simulacro y pulsa Ver corrección.' }]
  }

  return detail
    .filter(block => block.porcentaje_logrado < 80)
    .slice(0, 3)
    .map((block, index) => ({
      prioridad: index + 1,
      tema: block.tema,
      accion: `Rehaz ${block.numero_bloque} centrándote en: ${block.que_faltaba}`,
      tiempo_recomendado: block.porcentaje_logrado < 50 ? '30 min' : '20 min',
      recurso_sugerido: 'Practica otro bloque del mismo tema en Pausia.'
    }))
}

function normalizeResumen(result: any, detail: ReturnType<typeof normalizeDetail>) {
  if (Array.isArray(result?.resumen_por_bloque_tematico) && result.resumen_por_bloque_tematico.length) {
    return result.resumen_por_bloque_tematico.map((item: any) => ({
      bloque: item.bloque || item.tema || 'Bloque',
      puntos_conseguidos: safeNumber(item.puntos_conseguidos, 0),
      puntos_maximos: safeNumber(item.puntos_maximos, 0),
      porcentaje: safeNumber(item.porcentaje, 0),
      nivel: normalizeLevel(item.nivel)
    }))
  }

  return detail.map(block => ({
    bloque: block.tema,
    puntos_conseguidos: block.puntos_conseguidos,
    puntos_maximos: block.puntos_maximos,
    porcentaje: block.porcentaje_logrado,
    nivel: normalizeLevel(block.porcentaje_logrado >= 80 ? 'Domina' : block.porcentaje_logrado >= 50 ? 'En progreso' : 'Necesita refuerzo urgente')
  }))
}

function gradeColor(n: number) {
  if (n < 5) return '#1d4ed8'
  if (n < 6) return '#2563eb'
  if (n < 7) return '#0284c7'
  if (n < 9) return '#0f5ea8'
  return '#1e3a8a'
}

function levelClass(level?: string) {
  if (level?.includes('Domina')) return 'bg-emerald-50 text-emerald-700'
  if (level?.includes('urgente')) return 'bg-rose-50 text-rose-700'
  return 'bg-amber-50 text-amber-700'
}

function barClass(level?: string) {
  if (level?.includes('Domina')) return 'bg-emerald-500'
  if (level?.includes('urgente')) return 'bg-rose-500'
  return 'bg-amber-500'
}

function normalizeLevel(level?: string) {
  if (level?.includes('Domina')) return 'Domina'
  if (level?.includes('urgente')) return 'Necesita refuerzo urgente'
  return 'En progreso'
}

function normalizeList(value: any, fallback: string[] = []) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return fallback
}

function listToText(value: any) {
  return normalizeList(value).join(' ')
}

function textOrFallback(value: any, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

function isFiniteNumber(value: any) {
  return Number.isFinite(Number(value))
}

function safeNumber(value: any, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function format(value: any) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '0'
}
