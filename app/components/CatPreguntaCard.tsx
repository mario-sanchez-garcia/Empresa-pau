'use client'

import { useRef, useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import type { PreguntaCat } from '@/app/data/examenes'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import CorrectionLoading from '@/components/shared/CorrectionLoading'
import { ExamContentCard, ExamMetaChips } from '@/components/shared/ExamPracticeUI'

const CAT_UI = {
  color: '#2563eb',
  accent: '#60a5fa',
  light: '#eff6ff',
  border: '#dbe7fb',
  field: '#f8fafc',
  ink: '#1f2937',
  muted: '#64748b',
  shadow: '0 18px 45px rgba(37,99,235,0.08)'
}

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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorreccion('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ pregunta: prompt, imagen: modo === 'imagen' ? imagen : null, imagenTipo: modo === 'imagen' ? imagenTipo : null })
      })
      const data = await res.json()
      if (!res.ok) {
        setCorreccion(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsedCorrection = parseCorrectionPayload(data.respuesta)
      const correccionJson = parsedCorrection ? normalizeCorrectionForOfficialScores(parsedCorrection, [pregunta.puntuacion]) : null
      const correccionVisible = correccionJson
        ? correctionJsonToMarkdownWithOptions(correccionJson, { officialMaxScore: pregunta.puntuacion })
        : sanitizeCorrectionScaleText(correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: pregunta.puntuacion }), pregunta.puntuacion)
      setCorreccion(correccionVisible)

      const bloqueJson = correccionJson?.desglose_bloques?.[0]
      const partes = !correccionJson ? data.respuesta?.match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/) : null
      const rawNota = bloqueJson?.puntos_conseguidos != null
        ? Number(bloqueJson.puntos_conseguidos)
        : partes ? parseFloat(partes[1].replace(',', '.')) : null
      const nota = rawNota === null ? null : Math.min(pregunta.puntuacion, Math.max(0, rawNota))
      const notaMax = pregunta.puntuacion
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
          enunciado: officialPrompt.substring(0, 2000),
          respuesta: modo === 'imagen' ? 'Respuesta manuscrita adjunta como imagen.' : respuesta.substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: correccionVisible
        })
      }
    } finally {
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : !imagen
  const enunciadoCompleto = [pregunta.enunciado, ...pregunta.apartados].filter(Boolean).join('\n\n')

  return (
    <article className="mb-6 overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: CAT_UI.border, boxShadow: CAT_UI.shadow }}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: CAT_UI.light, borderBottom: `2px solid ${CAT_UI.accent}` }}>
        <div className="min-w-0">
          <ExamMetaChips color={CAT_UI.color} accent={CAT_UI.accent} items={['PAU Catalunya', String(pregunta.year), pregunta.tipo, pregunta.serie, `Ejercicio ${pregunta.ejercicio}`, pregunta.opcion ? `Opción ${pregunta.opcion}` : null]} />
          <h3 className="mt-2 text-lg font-black text-slate-900">{pregunta.tema}</h3>
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-[26px] font-black" style={{ color: CAT_UI.color }}>{pregunta.puntuacion}</span>
          <span className="text-sm font-bold" style={{ color: CAT_UI.accent }}>pts</span>
        </div>
      </header>

      <div className="p-6">
        <ExamContentCard title="Enunciado oficial" color={CAT_UI.color} borderColor="#e5edf9">
          <ExamStatement
            text={enunciadoCompleto}
            storageKey={`cat-mates:${pregunta.id}:enunciado`}
            accentColor={CAT_UI.color}
            softColor={CAT_UI.light}
          />
        </ExamContentCard>
      </div>

      <section className="border-t p-6" style={{ borderColor: CAT_UI.border }}>
        <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: CAT_UI.muted }}>Tu respuesta</div>
        <div className="mb-4 flex gap-2">
          {(['texto', 'imagen'] as const).map(nextMode => (
            <button
              className={modo === nextMode ? 'campus-primary' : 'campus-hover'}
              key={nextMode}
              onClick={() => setModo(nextMode)}
              style={{
                background: modo === nextMode ? `linear-gradient(135deg, ${CAT_UI.color}, ${CAT_UI.accent})` : CAT_UI.light,
                color: modo === nextMode ? '#fff' : CAT_UI.color
              }}
              type="button"
            >
              <span className="flex items-center gap-2 rounded-full px-[18px] py-[9px] text-[13px] font-bold">
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
            className="h-[180px] w-full resize-y rounded-2xl border bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition focus:bg-white"
            style={{ borderColor: CAT_UI.border }}
          />
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            {imagenPreview ? (
              <div className="relative overflow-hidden rounded-2xl border bg-white" style={{ borderColor: CAT_UI.border }}>
                <img src={imagenPreview} alt="Respuesta" className="max-h-[300px] w-full object-contain" />
                <button onClick={eliminarImagen} type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: CAT_UI.color }}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} type="button" className="campus-hover flex h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed" style={{ borderColor: CAT_UI.accent, backgroundColor: `${CAT_UI.light}66`, color: CAT_UI.color }}>
                <UploadCloud size={34} />
                <span className="mt-2 text-sm font-black">Haz clic para subir una foto</span>
                <span className="mt-1 text-xs font-semibold" style={{ color: CAT_UI.accent }}>Fotografía tu respuesta manuscrita</span>
              </button>
            )}
          </div>
        )}

        <button
          className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={corregir}
          disabled={cargando || sinRespuesta}
          style={{ background: `linear-gradient(135deg, ${CAT_UI.color}, ${CAT_UI.accent})`, boxShadow: `0 16px 34px ${CAT_UI.accent}33` }}
          type="button"
        >
          <WandSparkles size={17} />{cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}
        </button>
        {cargando && <CorrectionLoading />}
      </section>

      {correccion && (
        <section className="border-t-2" style={{ borderColor: CAT_UI.color }}>
          <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: CAT_UI.color }}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
            CORRECCIÓN DE PAUSIA
          </div>
          <CorrectionResultCard correction={correccion} officialMaxScore={pregunta.puntuacion} className="p-6 text-[0.925rem] leading-7" />
        </section>
      )}
    </article>
  )
}

function formatPts(value: number) {
  return value.toFixed(2).replace(/\.00$/, '')
}

function sanitizeCorrectionScaleText(text: string, maxScore: number) {
  return text
    .replace(/\s*\(\s*[0-9]+[.,]?[0-9]*\s*\/\s*14\s*\)/gi, '')
    .replace(/([0-9]+[.,]?[0-9]*)\s*\/\s*14\b/g, (_, score) => `${score}/${formatPts(maxScore)} pts`)
    .replace(/sobre\s+14\b/gi, `sobre ${formatPts(maxScore)} puntos`)
}
