'use client'

import { useRef, useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import type { PreguntaCat } from '@/app/data/examenes'
import { buildCorrectionPrompt, correctionJsonToMarkdown, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'

export default function CatPreguntaCard({ pregunta }: { pregunta: PreguntaCat }) {
  const [respuesta, setRespuesta] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)
  const [imagenTipo, setImagenTipo] = useState('image/jpeg')
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto' | 'imagen'>('texto')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImagen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImagenTipo(file.type)
    setImagenPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setImagen((reader.result as string).split(',')[1])
    reader.readAsDataURL(file)
  }

  function eliminarImagen() {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagen(null)
    setImagenPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && !imagen) return

    setCargando(true)
    setCorreccion('')

    const option = pregunta.opcion ?? 'A'
    const officialPrompt = `${pregunta.enunciado}\n\n${pregunta.apartados.join('\n')}`
    const prompt = buildCorrectionPrompt({
      subject: 'Matemáticas II',
      simulacroId: `Práctica Matemáticas II Cataluña ${pregunta.year} ${pregunta.tipo} ${pregunta.serie} Ejercicio ${pregunta.ejercicio}`,
      option,
      elapsedMinutes: 0,
      difficulty: 'Media',
      blocks: [{
        numeroBloque: `Ejercicio ${pregunta.ejercicio}`,
        tema: pregunta.tema,
        year: pregunta.year,
        convocatoria: pregunta.tipo,
        option,
        maxScore: pregunta.puntuacion,
        officialPrompt,
        criteria: pregunta.criterios,
        studentAnswer: modo === 'imagen'
          ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.'
          : respuesta
      }]
    })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: prompt, imagen: modo === 'imagen' ? imagen : null, imagenTipo: modo === 'imagen' ? imagenTipo : null })
      })
      const data = await res.json()
      const correccionJson = parseCorrectionJson(data.respuesta || '')
      const correccionVisible = correccionJson ? correctionJsonToMarkdown(correccionJson) : data.respuesta
      setCorreccion(correccionVisible)

      const bloqueJson = correccionJson?.desglose_bloques?.[0]
      const partes = !correccionJson ? data.respuesta?.match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/) : null
      const nota = bloqueJson?.puntos_conseguidos != null
        ? Number(bloqueJson.puntos_conseguidos)
        : partes ? parseFloat(partes[1].replace(',', '.')) : null
      const notaMax = bloqueJson?.puntos_maximos != null
        ? Number(bloqueJson.puntos_maximos)
        : partes ? parseFloat(partes[2].replace(',', '.')) : pregunta.puntuacion
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: 'mates',
          tipo: pregunta.tipo,
          año: pregunta.year,
          bloque: pregunta.tema,
          opcion: option,
          nota,
          nota_maxima: notaMax,
          enunciado: officialPrompt.substring(0, 500),
          respuesta: modo === 'imagen' ? 'Respuesta manuscrita adjunta como imagen.' : respuesta.substring(0, 1000),
          correccion: correccionVisible?.substring(0, 2000)
        })
      }
    } finally {
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : !imagen

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

      <section className="border-t border-rose-100 p-6">
        <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Tu respuesta</div>
        <div className="mb-4 flex gap-2">
          {(['texto', 'imagen'] as const).map(nextMode => (
            <button
              className={modo === nextMode ? 'campus-primary' : 'campus-hover'}
              key={nextMode}
              onClick={() => setModo(nextMode)}
              style={{ background: modo === nextMode ? 'linear-gradient(135deg, #b4232a, #fb7185)' : '#fff1f2', color: modo === nextMode ? '#fff' : '#b4232a' }}
              type="button"
            >
              <span className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black">
                {nextMode === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}
                {nextMode === 'texto' ? 'Escribir' : 'Subir foto'}
              </span>
            </button>
          ))}
        </div>

        {modo === 'texto' ? (
          <textarea
            value={respuesta}
            onChange={event => setRespuesta(event.target.value)}
            placeholder="Escribe tu resolución paso a paso..."
            className="h-[180px] w-full resize-y rounded-2xl border border-rose-100 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
          />
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            {imagenPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white">
                <img src={imagenPreview} alt="Respuesta" className="max-h-[300px] w-full object-contain" />
                <button onClick={eliminarImagen} type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-700 text-white shadow-lg"><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} type="button" className="campus-hover flex h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50 text-rose-700">
                <UploadCloud size={34} />
                <span className="mt-2 text-sm font-black">Haz clic para subir una foto</span>
                <span className="mt-1 text-xs font-semibold text-rose-400">Fotografía tu respuesta manuscrita</span>
              </button>
            )}
          </div>
        )}

        <button
          className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-800 to-rose-400 px-5 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(180,35,42,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={corregir}
          disabled={cargando || sinRespuesta}
          type="button"
        >
          <WandSparkles size={17} />{cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}
        </button>
      </section>

      {correccion && (
        <section className="border-t-2 border-rose-700">
          <div className="flex items-center gap-2 bg-rose-700 px-6 py-4 text-sm font-black text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
            CORRECCIÓN DE PAUSIA
          </div>
          <MathMarkdown text={correccion} format={false} className="p-6 text-[0.925rem] leading-7" />
        </section>
      )}
    </article>
  )
}
