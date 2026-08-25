'use client'

import { useRef, useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import type { PreguntaCat } from '@/app/data/examenes'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
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
  const [imagenes, setImagenes] = useState<Array<{ data: string; type: string; preview: string }>>([])
  const [correccion, setCorreccion] = useState('')
  const [imagenError, setImagenError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto' | 'imagen'>('texto')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImagen(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    setImagenError('')
    // allSettled: una sola foto en formato no compatible (típicamente HEIC
    // de iPhone) no debe descartar las demás ya comprimidas del mismo lote.
    const results = await Promise.allSettled(files.map(async file => ({
      data: await compressImageToBase64(file),
      type: 'image/jpeg',
      preview: URL.createObjectURL(file),
    })))
    const succeeded = results.filter((r): r is PromiseFulfilledResult<{ data: string; type: string; preview: string }> => r.status === 'fulfilled').map(r => r.value)
    const failedCount = results.length - succeeded.length
    if (succeeded.length) setImagenes(current => [...current, ...succeeded])
    if (failedCount > 0) {
      // compressImageToBase64 rechaza en formatos que el navegador no sabe
      // decodificar (típicamente HEIC de iPhone) — el resto del lote ya
      // comprimido se conserva, solo se avisa de las que fallaron.
      console.error('[cat-pregunta] image_compression_failed', { failedCount })
      setImagenError(`No hemos podido leer ${failedCount === 1 ? 'una foto' : `${failedCount} fotos`} (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte la imagen a JPG/PNG.`)
    }
  }

  function eliminarImagen(index: number) {
    setImagenes(current => current.filter((img, i) => {
      if (i === index) URL.revokeObjectURL(img.preview)
      return i !== index
    }))
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && imagenes.length === 0) return

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
          ? `Respuesta manuscrita adjunta como ${imagenes.length === 1 ? 'imagen' : `${imagenes.length} imágenes — están en orden, léelas como páginas consecutivas de una misma respuesta`}. Corrígela leyendo la(s) imagen(es) enviada(s).`
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
        body: JSON.stringify({
          pregunta: prompt,
          imagen: modo === 'imagen' ? imagenes[0]?.data ?? null : null,
          imagenTipo: modo === 'imagen' ? imagenes[0]?.type ?? null : null,
          imagenes: modo === 'imagen' ? imagenes.slice(1).map(img => ({ data: img.data, mediaType: img.type })) : undefined,
          creditKey: `cat-mates:${pregunta.year}:${pregunta.tipo}:${pregunta.serie}:${pregunta.ejercicio}:${option}`,
        })
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
      const correccionGuardada = correccionJson ? JSON.stringify(correccionJson) : correccionVisible
      setCorreccion(correccionGuardada)

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
          respuesta: modo === 'imagen' ? `Respuesta manuscrita adjunta (${imagenes.length} imagen${imagenes.length === 1 ? '' : 'es'}).` : respuesta.substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: correccionGuardada
        })
      }
    } finally {
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : imagenes.length === 0
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
          <RichTextArea value={respuesta} onChange={setRespuesta} placeholder="Escribe tu resolución paso a paso..." minHeight={180} accentColor={CAT_UI.color} softColor={CAT_UI.light} borderColor={CAT_UI.border} />
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleImagen} className="hidden" />
            {imagenes.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imagenes.map((img, index) => (
                  <div key={`${img.preview}-${index}`} className="relative overflow-hidden rounded-2xl border bg-white" style={{ borderColor: CAT_UI.border }}>
                    <img src={img.preview} alt={`Página ${index + 1}`} loading="lazy" decoding="async" className="h-32 w-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: 'rgba(15,23,42,0.75)' }}>{index + 1}</span>
                    <button onClick={() => eliminarImagen(index)} type="button" aria-label={`Quitar página ${index + 1}`} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: CAT_UI.color }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} type="button" className="campus-hover flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed" style={{ height: imagenes.length > 0 ? 96 : 180, borderColor: CAT_UI.accent, backgroundColor: `${CAT_UI.light}66`, color: CAT_UI.color }}>
              <UploadCloud size={imagenes.length > 0 ? 22 : 34} />
              <span className="mt-2 text-sm font-black">{imagenes.length > 0 ? 'Añadir otra página' : 'Haz clic para subir una foto'}</span>
              {imagenes.length === 0 && <span className="mt-1 text-xs font-semibold" style={{ color: CAT_UI.accent }}>Fotografía tu respuesta manuscrita</span>}
            </button>
            {imagenes.length > 1 && (
              <p className="mt-2 text-xs font-semibold" style={{ color: CAT_UI.muted }}>Se corrigen juntas como páginas consecutivas de una misma respuesta.</p>
            )}
            {imagenError && <p className="mt-2 text-xs font-bold" style={{ color: '#dc2626' }}>{imagenError}</p>}
          </div>
        )}

        <button
          className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={corregir}
          disabled={cargando || sinRespuesta}
          style={{ background: `linear-gradient(135deg, ${CAT_UI.color}, ${CAT_UI.accent})`, boxShadow: `0 16px 34px ${CAT_UI.accent}33` }}
          type="button"
        >
          {cargando ? <KairoLoadingDot /> : <WandSparkles size={17} />}{cargando ? 'Corrigiendo con Kairo...' : 'Corregir con Kairo'}
        </button>
      </section>

      {correccion && (
        <section className="border-t-2" style={{ borderColor: CAT_UI.color }}>
          <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: CAT_UI.color }}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
            CORRECCIÓN DE KAIRO
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
