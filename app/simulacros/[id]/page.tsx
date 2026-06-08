'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Camera, CheckCircle2, Clock, Send, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroAnswer, SimulacroRecord } from '@/components/simulacros/types'
import 'katex/dist/katex.min.css'

const TOTAL_SECONDS = 90 * 60

export default function SimulacroActivoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({})
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Record<string, 'text' | 'image'>>({})
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      else {
        const next = row as SimulacroRecord
        if (next.estado === 'completado') router.push(`/simulacros/${params.id}/results`)
        setRecord(next)
        setAnswers(next.respuestas_parciales ?? {})
      }
    })
  }, [params.id, router])

  useEffect(() => {
    if (!record || submitting) return
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setTimeUp(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [record, submitting])

  useEffect(() => {
    if (!record) return
    const timer = window.setInterval(() => void autosave(), 30000)
    return () => window.clearInterval(timer)
  }, [record, answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const answeredCount = useMemo(() => Object.values(answers).filter(answer => answer?.text?.trim() || answer?.image).length, [answers])
  const elapsedMinutes = Math.ceil((TOTAL_SECONDS - secondsLeft) / 60)
  const cfg = record ? SUBJECTS[record.asignatura] : SUBJECTS.mates
  const percentLeft = secondsLeft / TOTAL_SECONDS * 100
  const timerColor = secondsLeft > 45 * 60 ? 'bg-emerald-500' : secondsLeft > 15 * 60 ? 'bg-amber-500' : 'bg-red-500'

  async function autosave() {
    if (!record) return
    await supabase.from('historial_simulacros').update({ respuestas_parciales: answers, updated_at: new Date().toISOString() }).eq('id', record.id)
  }

  async function handleImage(blockId: string, file?: File) {
    if (!file) return
    const base64 = await fileToBase64(file)
    setAnswers(prev => ({ ...prev, [blockId]: { ...(prev[blockId] ?? { text: '' }), image: base64, imageType: file.type } }))
  }

  async function submitExam() {
    if (!record) return
    setSubmitting(true)
    await autosave()
    const res = await fetch('/api/simulacro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bloques: record.bloques,
        respuestas: answers,
        asignatura: SUBJECTS[record.asignatura].label,
        opcion: record.opcion,
        tiempo_empleado: elapsedMinutes,
        simulacro_id: record.id
      })
    })
    const result = await res.json()
    await supabase.from('historial_simulacros').update({
      resultado_json: result,
      nota_final: result?.nota_final ?? null,
      estado: 'completado',
      tiempo_empleado: elapsedMinutes,
      respuestas_parciales: answers,
      updated_at: new Date().toISOString()
    }).eq('id', record.id)
    router.push(`/simulacros/${record.id}/results`)
  }

  if (!record) {
    return <SimulacroShell title="Simulacro" subtitle="Cargando examen..."><div className="rounded-xl bg-white p-8 font-black text-slate-500">Preparando simulacro...</div></SimulacroShell>
  }

  return (
    <SimulacroShell
      title="Examen activo"
      subtitle="90 minutos, cuatro bloques y corrección completa"
      actions={<button onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white"><Send size={16} />Entregar examen</button>}
    >
      <div className="mx-auto grid max-w-6xl gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={cfg.color}>{cfg.label}</Badge>
              <Badge color="#475569">{record.id.slice(0, 8)}</Badge>
              <Badge color="#7c3aed">{record.dificultad_real ?? record.dificultad}</Badge>
              <Badge color={cfg.color}>Opción {record.opcion}</Badge>
            </div>
            <div className="flex items-center gap-2 text-2xl font-black" style={{ color: secondsLeft < 15 * 60 ? '#dc2626' : '#0f172a' }}><Clock size={24} />{formatTime(secondsLeft)}</div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${timerColor} transition-all`} style={{ width: `${percentLeft}%` }} /></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {record.bloques.map((block, index) => {
              const ok = Boolean(answers[block.id]?.text?.trim() || answers[block.id]?.image)
              return <button key={block.id} onClick={() => setActive(index)} className={`rounded-full px-4 py-2 text-sm font-black ${active === index ? 'bg-violet-600 text-white' : ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</button>
            })}
          </div>
        </section>

        {record.bloques.map((block, index) => (
          <section key={block.id} className={active === index ? 'grid gap-4' : 'hidden'}>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${answers[block.id]?.text?.trim() || answers[block.id]?.image ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <h2 className="text-xl font-black">Bloque {index + 1} · {block.tema}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-black text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Año {block.year}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{block.convocatoria}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{block.puntuacion} pts</span>
                  </div>
                </div>
              </div>
              <div className="prose prose-slate max-w-none rounded-xl bg-slate-50 p-5">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{block.enunciado}</ReactMarkdown>
                {block.textoFuente && <blockquote className="mt-4 border-l-4 border-slate-300 pl-4 text-slate-600">{block.textoFuente}</blockquote>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex gap-2">
                <button onClick={() => setMode(prev => ({ ...prev, [block.id]: 'text' }))} className={`rounded-xl px-4 py-2 text-sm font-black ${mode[block.id] !== 'image' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Escribir</button>
                <button onClick={() => setMode(prev => ({ ...prev, [block.id]: 'image' }))} className={`rounded-xl px-4 py-2 text-sm font-black ${mode[block.id] === 'image' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Subir foto</button>
              </div>
              {mode[block.id] === 'image' ? (
                <div className="grid gap-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <Camera size={32} className="mb-2 text-violet-600" />
                    <span className="font-black">Sube una foto de tu respuesta</span>
                    <input type="file" accept="image/*" className="hidden" onChange={event => void handleImage(block.id, event.target.files?.[0])} />
                  </label>
                  {answers[block.id]?.image && (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200">
                      <img src={`data:${answers[block.id].imageType};base64,${answers[block.id].image}`} alt="Respuesta" className="max-h-96 w-full object-contain" />
                      <button onClick={() => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? { text: '' }), image: null, imageType: null } }))} className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              ) : (
                <textarea value={answers[block.id]?.text ?? ''} onChange={event => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? {}), text: event.target.value } }))} placeholder="Desarrolla tu respuesta paso a paso..." className="h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none focus:border-violet-400" />
              )}
            </div>
          </section>
        ))}
      </div>

      {(confirmOpen || timeUp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-3 text-xl font-black">{timeUp ? <AlertTriangle className="text-red-600" /> : <CheckCircle2 className="text-violet-600" />}{timeUp ? 'Tiempo agotado' : 'Entregar examen'}</div>
            <p className="text-sm font-semibold text-slate-600">Has respondido {answeredCount} de {record.bloques.length} bloques. Quedan {record.bloques.length - answeredCount} vacíos.</p>
            {submitting && <p className="mt-4 rounded-xl bg-violet-50 p-4 text-sm font-black text-violet-700">Pausia está corrigiendo tu simulacro...</p>}
            <div className="mt-6 flex justify-end gap-3">
              {!timeUp && <button onClick={() => setConfirmOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-black">Volver</button>}
              <button onClick={submitExam} disabled={submitting} className="rounded-xl bg-violet-600 px-4 py-2 font-black text-white disabled:opacity-60">Ver corrección</button>
            </div>
          </div>
        </div>
      )}
    </SimulacroShell>
  )
}

function Badge({ children, color }: { children: ReactNode; color: string }) {
  return <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: color }}>{children}</span>
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0')
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.readAsDataURL(file)
  })
}
