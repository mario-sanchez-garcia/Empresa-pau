'use client'

import { useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import type { EjercicioFisicaCataluna, ExamenFisicaCataluna } from '@/app/data/fisica_cataluna'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores, parseCorrectionJson } from '@/app/lib/correctionPrompt'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'

const UI = {
  color: '#6d28d9',
  accent: '#a78bfa',
  light: '#f5f3ff',
  border: '#ede9fe',
  muted: '#64748b',
}

type UploadedImage = { name: string; type: string; data: string; preview: string }

export default function CatFisicaEjercicioCard({ examen, ejercicio }: { examen: ExamenFisicaCataluna; ejercicio: EjercicioFisicaCataluna }) {
  const [opcionIdx, setOpcionIdx] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [imagenes, setImagenes] = useState<UploadedImage[]>([])
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto' | 'imagen'>('texto')
  const [apartadoIdx, setApartadoIdx] = useState(0)
  const opcion = ejercicio.opciones?.[opcionIdx]
  const apartados = opcion?.apartados ?? ejercicio.apartados
  const apartado = apartados?.[apartadoIdx] ?? apartados?.[0]
  const maxScore = Number(apartado?.puntos ?? 2.5)
  const titulo = opcion?.titulo ?? ejercicio.titulo
  const apartadoTexto = apartado ? `${apartado.letra}) ${apartado.enunciado}${apartado.puntos ? ` (${apartado.puntos} puntos)` : ''}` : ''
  const enunciado = [ejercicio.instrucciones, opcion?.enunciado ?? ejercicio.enunciado, apartadoTexto, ...(opcion?.datos ?? ejercicio.datos ?? [])].filter(Boolean).join('\n\n')
  const requiereRevision = ejercicio.requiereRevision || opcion?.requiereRevision

  async function handleImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const next = await Promise.all(files.map(file => new Promise<UploadedImage>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, type: file.type, data: String(reader.result).split(',')[1], preview: URL.createObjectURL(file) })
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

  function cambiarOpcion(index: number) {
    imagenes.forEach(imagen => URL.revokeObjectURL(imagen.preview))
    setImagenes([])
    setOpcionIdx(index)
    setApartadoIdx(0)
    setRespuesta('')
    setCorreccion('')
  }

  function cambiarApartado(index: number) {
    imagenes.forEach(imagen => URL.revokeObjectURL(imagen.preview))
    setImagenes([])
    setApartadoIdx(index)
    setRespuesta('')
    setCorreccion('')
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && imagenes.length === 0) return
    setCargando(true)
    setCorreccion('')
    const option = opcion?.opcion ?? 'Única'
    const prompt = buildCorrectionPrompt({
      subject: 'Física PAU Cataluña',
      community: 'Cataluña',
      simulacroId: `${examen.id} · Ejercicio ${ejercicio.numero} · Apartado ${apartado?.letra ?? 'único'}`,
      option,
      elapsedMinutes: 0,
      difficulty: 'Media',
      blocks: [{
        numeroBloque: `Ejercicio ${ejercicio.numero} · Apartado ${apartado?.letra ?? 'único'}`,
        tema: `${ejercicio.bloque ?? titulo} · ${apartado?.letra ?? 'único'}`,
        year: examen.anio,
        convocatoria: examen.convocatoria,
        option,
        maxScore,
        officialPrompt: enunciado,
        studentAnswer: modo === 'imagen'
          ? `Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada. Se adjuntan ${imagenes.length} imagen(es).`
          : respuesta,
      }],
    })

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorreccion('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          pregunta: prompt,
          imagenes: modo === 'imagen' ? imagenes.map(imagen => ({ data: imagen.data, mediaType: imagen.type })) : [],
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setCorreccion(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = parseCorrectionJson(data.respuesta || '')
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visible = normalized ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore }) : data.respuesta || ''
      setCorreccion(visible)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: 'fisica',
          tipo: `Cataluña · ${examen.convocatoria}`,
          año: examen.anio,
          bloque: `${titulo} · Apartado ${apartado?.letra ?? 'único'}`,
          opcion: option,
          nota: normalized?.desglose_bloques?.[0]?.puntos_conseguidos ?? null,
          nota_maxima: maxScore,
          enunciado: enunciado.substring(0, 500),
          respuesta: (modo === 'imagen' ? `${imagenes.length} imagen(es) adjuntas.` : respuesta).substring(0, 1000),
          correccion: visible.substring(0, 2000),
        })
      }
    } finally {
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : imagenes.length === 0

  return (
    <article className="overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_45px_rgba(37,99,235,0.08)]" style={{ borderColor: UI.border }}>
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: UI.light, borderBottom: `2px solid ${UI.accent}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.08em]" style={{ color: UI.color }}>PAU Cataluña {examen.anio} · {examen.convocatoria} · {examen.serie}</div>
          <h3 className="mt-2 text-lg font-black text-slate-900">{titulo}</h3>
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-[26px] font-black" style={{ color: UI.color }}>{maxScore}</span>
          <span className="text-sm font-bold" style={{ color: UI.accent }}>pts</span>
        </div>
      </header>
      <div className="grid gap-5 p-6">
        {ejercicio.opciones && (
          <div className="flex gap-2">
            {ejercicio.opciones.map((item, index) => (
              <button key={item.opcion} type="button" onClick={() => cambiarOpcion(index)} className="rounded-xl px-4 py-2 text-sm font-black" style={{ background: opcionIdx === index ? UI.color : UI.light, color: opcionIdx === index ? '#fff' : UI.color }}>
                Opción {item.opcion}
              </button>
            ))}
          </div>
        )}
        {(apartados?.length ?? 0) > 1 && (
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Apartado</span>
            <select value={apartadoIdx} onChange={event => cambiarApartado(Number(event.target.value))} className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none" style={{ borderColor: UI.border }}>
              {apartados?.map((item, index) => <option key={item.letra} value={index}>{item.letra} · {item.enunciado}</option>)}
            </select>
          </label>
        )}
        {requiereRevision && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Este enunciado procede de OCR parcial y requiere consultar el PDF original.</div>}
        {(opcion?.enunciado ?? ejercicio.enunciado) && <MathMarkdown text={opcion?.enunciado ?? ejercicio.enunciado} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7" />}
        {apartadoTexto && <MathMarkdown text={apartadoTexto} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7" />}
        {(opcion?.datos ?? ejercicio.datos)?.map((dato, index) => <MathMarkdown key={index} text={dato} className="text-sm text-slate-600" />)}

        <section className="border-t pt-5" style={{ borderColor: UI.border }}>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: UI.muted }}>Tu respuesta</div>
          <div className="mb-4 flex gap-2">
            {(['texto', 'imagen'] as const).map(nextMode => (
              <button
                key={nextMode}
                type="button"
                onClick={() => setModo(nextMode)}
                className={modo === nextMode ? 'campus-primary' : 'campus-hover'}
                style={{
                  background: modo === nextMode ? `linear-gradient(135deg, ${UI.color}, ${UI.accent})` : UI.light,
                  color: modo === nextMode ? '#fff' : UI.color,
                }}
              >
                <span className="flex items-center gap-2 rounded-full px-[18px] py-[9px] text-[13px] font-bold">
                  {nextMode === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}
                  {nextMode === 'texto' ? 'Escribir' : 'Subir foto'}
                </span>
              </button>
            ))}
          </div>
          {modo === 'texto' ? (
            <textarea value={respuesta} onChange={event => setRespuesta(event.target.value)} className="h-[220px] w-full resize-y rounded-2xl border bg-slate-50 p-4 text-sm leading-7 outline-none transition focus:bg-white" style={{ borderColor: UI.border }} placeholder="Escribe tu resolución paso a paso..." />
          ) : (
            <div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm font-black" style={{ borderColor: UI.accent, backgroundColor: UI.light, color: UI.color }}>
                <UploadCloud size={20} /> Añadir fotos
                <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleImagenes} className="hidden" />
              </label>
              {imagenes.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {imagenes.map((imagen, index) => (
                    <div key={`${imagen.name}-${index}`} className="relative rounded-2xl border p-3" style={{ borderColor: UI.border }}>
                      <img src={imagen.preview} alt={imagen.name} className="h-40 w-full object-contain" />
                      <div className="mt-2 truncate text-xs font-semibold text-slate-600">{imagen.name}</div>
                      <button type="button" onClick={() => eliminarImagen(index)} className="absolute right-2 top-2 rounded-full p-2 text-white" style={{ backgroundColor: UI.color }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button type="button" onClick={corregir} disabled={cargando || sinRespuesta} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` }}>
            <WandSparkles size={17} />{cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}
          </button>
        </section>
        {correccion && (
          <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: UI.color }}>
            <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
              CORRECCIÓN DE PAUSIA
            </div>
            <MathMarkdown text={correccion} format={false} className="p-6 text-[0.925rem] leading-7" />
          </section>
        )}
      </div>
    </article>
  )
}
