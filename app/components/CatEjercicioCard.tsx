'use client'

import { useState } from 'react'
import { UploadCloud, WandSparkles, X } from 'lucide-react'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'

export type CatEjercicioView = {
  id: string
  titulo: string
  instrucciones?: string
  texto?: string
  fuente?: string
  enunciado?: string
  apartados: { id: string; enunciado: string; puntos?: number; opciones?: string[] }[]
  datos?: string[]
  imagenes?: string[]
  opcion?: string
  requiereRevision?: boolean
}

type ExamContext = {
  id: string
  anio: number
  convocatoria: string
  serie: string
  instrucciones: string
}

type UploadedImage = {
  name: string
  type: string
  data: string
  preview: string
}

const UI = { color: '#2563eb', accent: '#60a5fa', light: '#eff6ff', border: '#dbeafe' }

export default function CatEjercicioCard({
  asignatura,
  asignaturaLabel,
  examen,
  ejercicio,
}: {
  asignatura: 'quimica' | 'lengua'
  asignaturaLabel: string
  examen: ExamContext
  ejercicio: CatEjercicioView
}) {
  const [respuesta, setRespuesta] = useState('')
  const [imagenes, setImagenes] = useState<UploadedImage[]>([])
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const maxScore = ejercicio.apartados.reduce((sum, apartado) => sum + Number(apartado.puntos ?? 0), 0) || 2.5
  const apartadosTexto = ejercicio.apartados.map(apartado => [
    `${apartado.id}. ${apartado.enunciado}${apartado.puntos ? ` (${apartado.puntos} puntos)` : ''}`,
    apartado.opciones?.map((opcion, index) => `${String.fromCharCode(97 + index)}) ${opcion}`).join('\n'),
  ].filter(Boolean).join('\n'))
  const enunciadoCompleto = [
    ejercicio.instrucciones,
    ejercicio.texto,
    ejercicio.fuente,
    ejercicio.enunciado,
    ...apartadosTexto,
    ...(ejercicio.datos ?? []),
  ].filter(Boolean).join('\n\n')

  async function handleImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const next = await Promise.all(files.map(file => new Promise<UploadedImage>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        data: String(reader.result).split(',')[1],
        preview: URL.createObjectURL(file),
      })
      reader.onerror = reject
      reader.readAsDataURL(file)
    })))
    setImagenes(current => [...current, ...next])
    event.target.value = ''
  }

  function eliminarImagen(index: number) {
    setImagenes(current => current.filter((imagen, imageIndex) => {
      if (imageIndex === index) URL.revokeObjectURL(imagen.preview)
      return imageIndex !== index
    }))
  }

  async function corregir() {
    if (!respuesta.trim() && imagenes.length === 0) return
    setCargando(true)
    setCorreccion('')
    const prompt = buildCorrectionPrompt({
      subject: asignaturaLabel,
      community: 'Cataluña',
      simulacroId: `${examen.id} · ${ejercicio.titulo}`,
      option: ejercicio.opcion ?? 'Única',
      elapsedMinutes: 0,
      difficulty: 'Media',
      blocks: [{
        numeroBloque: ejercicio.titulo,
        tema: ejercicio.titulo,
        year: examen.anio,
        convocatoria: examen.convocatoria,
        option: ejercicio.opcion ?? 'Única',
        maxScore,
        officialPrompt: enunciadoCompleto,
        sourceText: [ejercicio.texto, ejercicio.fuente].filter(Boolean).join('\n'),
        studentAnswer: [
          respuesta.trim(),
          imagenes.length ? `Se adjuntan ${imagenes.length} imagen(es) de la respuesta manuscrita.` : '',
        ].filter(Boolean).join('\n\n'),
      }],
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: prompt,
          imagenes: imagenes.map(imagen => ({ data: imagen.data, mediaType: imagen.type })),
        }),
      })
      const data = await response.json()
      const parsed = parseCorrectionJson(data.respuesta || '')
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visible = normalized ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore }) : data.respuesta || ''
      setCorreccion(visible)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura,
          tipo: `Cataluña · ${examen.convocatoria}`,
          año: examen.anio,
          bloque: ejercicio.titulo,
          opcion: ejercicio.opcion ?? 'Única',
          nota: normalized?.desglose_bloques?.[0]?.puntos_conseguidos ?? null,
          nota_maxima: maxScore,
          enunciado: enunciadoCompleto.substring(0, 500),
          respuesta: `${respuesta}${imagenes.length ? `\n${imagenes.length} imagen(es) adjuntas.` : ''}`.substring(0, 1000),
          correccion: visible.substring(0, 2000),
        })
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_45px_rgba(37,99,235,0.08)]" style={{ borderColor: UI.border }}>
      <header className="border-b px-6 py-5" style={{ backgroundColor: UI.light, borderColor: UI.accent }}>
        <div className="text-xs font-black uppercase tracking-[0.08em]" style={{ color: UI.color }}>PAU Cataluña {examen.anio} · {examen.convocatoria} · {examen.serie}</div>
        <h3 className="mt-2 text-lg font-black text-slate-900">{ejercicio.titulo}</h3>
        {ejercicio.opcion && <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-black" style={{ color: UI.color }}>Opción {ejercicio.opcion}</span>}
      </header>
      <div className="grid gap-4 p-6">
        {ejercicio.requiereRevision && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Este enunciado requiere revisión visual con el documento original.</div>}
        {ejercicio.instrucciones && <MathMarkdown text={ejercicio.instrucciones} className="rounded-2xl border px-5 py-4 text-sm" />}
        {ejercicio.texto && <MathMarkdown text={ejercicio.texto} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7" />}
        {ejercicio.fuente && <MathMarkdown text={ejercicio.fuente} className="text-xs italic text-slate-500" />}
        {ejercicio.enunciado && <MathMarkdown text={ejercicio.enunciado} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7" />}
        {apartadosTexto.map((apartado, index) => <MathMarkdown key={index} text={apartado} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7" />)}
        {ejercicio.datos?.map((dato, index) => <MathMarkdown key={index} text={dato} className="text-sm text-slate-600" />)}
        {ejercicio.imagenes?.map((imagen, index) => <div key={index} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">{imagen}</div>)}

        <section className="mt-2 border-t pt-5" style={{ borderColor: UI.border }}>
          <textarea value={respuesta} onChange={event => setRespuesta(event.target.value)} className="h-[220px] w-full resize-y rounded-2xl border bg-slate-50 p-4 text-sm leading-7 outline-none" style={{ borderColor: UI.border }} placeholder="Escribe tu respuesta..." />
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm font-black" style={{ borderColor: UI.accent, backgroundColor: UI.light, color: UI.color }}>
            <UploadCloud size={20} /> Añadir fotos
            <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleImagenes} className="hidden" />
          </label>
          {imagenes.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{imagenes.map((imagen, index) => <div key={`${imagen.name}-${index}`} className="relative rounded-2xl border p-3" style={{ borderColor: UI.border }}><img src={imagen.preview} alt={imagen.name} className="h-40 w-full object-contain" /><div className="mt-2 truncate text-xs font-semibold text-slate-600">{imagen.name}</div><button type="button" onClick={() => eliminarImagen(index)} className="absolute right-2 top-2 rounded-full p-2 text-white" style={{ backgroundColor: UI.color }}><X size={14} /></button></div>)}</div>}
          <button type="button" onClick={corregir} disabled={cargando || (!respuesta.trim() && imagenes.length === 0)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})` }}><WandSparkles size={17} />{cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}</button>
        </section>
        {correccion && <section className="rounded-2xl border-2" style={{ borderColor: UI.color }}><div className="px-5 py-3 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>CORRECCIÓN DE PAUSIA</div><MathMarkdown text={correccion} format={false} className="p-5 text-sm leading-7" /></section>}
      </div>
    </article>
  )
}
