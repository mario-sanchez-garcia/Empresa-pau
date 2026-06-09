'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { WandSparkles } from 'lucide-react'
import { buildCorrectionPrompt, correctionJsonToMarkdown, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'

type Fuente = {
  tipo?: 'texto' | 'imagen' | 'imagen_doble' | 'documento' | 'tabla'
  titulo?: string
  texto?: string
  imagen_url?: string
  imagenes_url?: string[]
  descripcion?: string
  fuente_completa?: string
  tabla?: { columnas?: string[]; filas?: string[][] }
}

const UI = {
  color: '#9f1239',
  accent: '#fb7185',
  light: '#fff1f2',
  border: '#fecdd3',
}

export function RenderFuente({ fuente }: { fuente?: Fuente }) {
  if (!fuente) return null
  const imagenes = fuente.imagenes_url?.length ? fuente.imagenes_url : fuente.imagen_url ? [fuente.imagen_url] : []

  return (
    <section className="rounded-[22px] border bg-white p-5 shadow-[0_14px_34px_rgba(159,18,57,0.07)]" style={{ borderColor: UI.border }}>
      {fuente.titulo && <h4 className="mb-4 text-base font-black text-slate-900">{fuente.titulo}</h4>}
      {(fuente.tipo === 'imagen' || fuente.tipo === 'imagen_doble' || fuente.tipo === 'documento') && imagenes.length > 0 && (
        <div className={`grid gap-3 ${imagenes.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {imagenes.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${fuente.titulo ?? 'Fuente histórica'} ${index + 1}`} className="max-h-[520px] w-full rounded-2xl border border-slate-200 object-contain" />)}
        </div>
      )}
      {fuente.texto && <MathMarkdown text={fuente.texto} className="mt-4 text-sm leading-7 text-slate-700" />}
      {fuente.tabla && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-rose-50 text-rose-900">
              <tr>{fuente.tabla.columnas?.map(columna => <th key={columna} className="border-b border-rose-200 px-4 py-3 font-black">{columna}</th>)}</tr>
            </thead>
            <tbody>{fuente.tabla.filas?.map((fila, index) => <tr key={index} className="even:bg-slate-50">{fila.map((celda, cellIndex) => <td key={cellIndex} className="border-b border-slate-100 px-4 py-3 text-slate-700">{celda}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {fuente.descripcion && <MathMarkdown text={fuente.descripcion} className="mt-4 text-sm italic text-slate-600" />}
      {fuente.fuente_completa && <MathMarkdown text={fuente.fuente_completa} className="mt-3 text-xs text-slate-500" />}
    </section>
  )
}

function obtenerPreguntas(ejercicio: any) {
  if (ejercicio.preguntas) return ejercicio.preguntas.map((pregunta: any) => `${pregunta.numero}. ${pregunta.enunciado} (${pregunta.puntos} puntos)`)
  if (ejercicio.contextos) return ejercicio.contextos.flatMap((contexto: any) => [
    contexto.descripcion,
    ...contexto.preguntas.map((pregunta: any) => `${pregunta.numero}. ${pregunta.enunciado}\n${pregunta.opciones.map((opcion: any) => `${opcion.letra}) ${opcion.texto}`).join('\n')}`)
  ])
  return [
    ...(ejercicio.pregunta1 ?? []).map((pregunta: any) => `${pregunta.letra}) ${pregunta.enunciado} (${pregunta.puntos} puntos)`),
    ...(ejercicio.pregunta2?.opciones ?? []).map((opcion: any) => `Opción ${opcion.letra}: ${opcion.enunciado} (${opcion.puntos} puntos)`),
    ...(ejercicio.opciones ?? []).map((opcion: any) => `Opción ${opcion.letra}: ${opcion.enunciado}${opcion.terminos ? `\nTérminos: ${opcion.terminos.join(', ')}` : ''} (${opcion.puntos} puntos)`),
  ]
}

function puntuacionEjercicio(ejercicio: any) {
  if (ejercicio.preguntas) return ejercicio.preguntas.reduce((total: number, pregunta: any) => total + Number(pregunta.puntos ?? 0), 0)
  if (ejercicio.tipo === 'test') return 2.5
  if (ejercicio.pregunta1) return ejercicio.pregunta1.reduce((total: number, pregunta: any) => total + Number(pregunta.puntos ?? 0), 0) + 2.5
  return Number(ejercicio.opciones?.[0]?.puntos ?? 2.5)
}

export function RespuestaIA({ contenido }: { contenido: string }) {
  if (!contenido) return null
  return (
    <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: UI.color }}>
      <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>
        <WandSparkles size={17} /> CORRECCIÓN DE PAUSIA
      </div>
      <div className="prose prose-slate max-w-none p-6 text-sm leading-7"><ReactMarkdown>{contenido}</ReactMarkdown></div>
    </section>
  )
}

export default function CatHistoriaEjercicioCard({ ejercicio, contexto }: { ejercicio: any; contexto: string }) {
  const [respuesta, setRespuesta] = useState('')
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const preguntas = obtenerPreguntas(ejercicio)
  const puntuacion = puntuacionEjercicio(ejercicio)
  const enunciadoOficial = [ejercicio.instrucciones, ...preguntas].filter(Boolean).join('\n\n')

  async function corregir() {
    if (!respuesta.trim()) return
    setCargando(true)
    setCorreccion('')
    try {
      const prompt = buildCorrectionPrompt({
        subject: 'Historia de España',
        simulacroId: contexto,
        option: 'Única',
        elapsedMinutes: 0,
        difficulty: 'Media',
        blocks: [{
          numeroBloque: `Ejercicio ${ejercicio.numero}`,
          tema: ejercicio.tipo ?? 'Historia de España',
          year: contexto.match(/\b20\d{2}\b/)?.[0] ?? 'No especificado',
          convocatoria: contexto,
          option: 'Única',
          maxScore: puntuacion,
          officialPrompt: enunciadoOficial,
          sourceText: [ejercicio.fuente?.texto, ejercicio.fuente?.descripcion, ejercicio.fuente?.fuente_completa].filter(Boolean).join('\n'),
          studentAnswer: respuesta,
        }]
      })
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: prompt }),
      })
      const data = await response.json()
      const parsed = parseCorrectionJson(data.respuesta || '')
      const visible = parsed ? correctionJsonToMarkdown(parsed) : data.respuesta
      setCorreccion(visible)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const bloque = parsed?.desglose_bloques?.[0]
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: 'historia',
          tipo: 'Cataluña',
          año: Number(contexto.match(/\b20\d{2}\b/)?.[0]),
          bloque: `Ejercicio ${ejercicio.numero}`,
          opcion: 'Única',
          nota: bloque?.puntos_conseguidos != null ? Number(bloque.puntos_conseguidos) : null,
          nota_maxima: bloque?.puntos_maximos != null ? Number(bloque.puntos_maximos) : puntuacion,
          enunciado: enunciadoOficial.substring(0, 500),
          respuesta: respuesta.substring(0, 1000),
          correccion: visible?.substring(0, 2000),
        })
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_45px_rgba(159,18,57,0.08)]" style={{ borderColor: UI.border }}>
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: UI.light, borderColor: UI.accent }}>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.08em]" style={{ color: UI.color }}>{contexto}</div>
          <h3 className="mt-2 text-lg font-black text-slate-900">Ejercicio {ejercicio.numero}</h3>
        </div>
        <div className="text-right"><span className="text-2xl font-black" style={{ color: UI.color }}>{puntuacion}</span><span className="ml-1 text-sm font-bold text-rose-400">pts</span></div>
      </header>
      <div className="grid gap-5 p-6">
        <RenderFuente fuente={ejercicio.fuente} />
        {ejercicio.instrucciones && <MathMarkdown text={ejercicio.instrucciones} className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm" />}
        <div className="grid gap-3">
          {preguntas.map((pregunta: string, index: number) => <MathMarkdown key={index} text={pregunta} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7" />)}
        </div>
        <div className="border-t pt-5" style={{ borderColor: UI.border }}>
          <label className="mb-3 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">Tu respuesta</label>
          <textarea value={respuesta} onChange={event => setRespuesta(event.target.value)} className="h-[260px] w-full resize-y rounded-2xl border bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none focus:bg-white" style={{ borderColor: UI.border }} placeholder="Escribe tu respuesta..." />
          <button type="button" onClick={corregir} disabled={cargando || !respuesta.trim()} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})` }}>
            <WandSparkles size={17} /> {cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}
          </button>
        </div>
        <RespuestaIA contenido={correccion} />
      </div>
    </article>
  )
}
