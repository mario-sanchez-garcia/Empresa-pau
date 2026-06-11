'use client'

import { useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import { ExamContentCard, ExamMetaChips } from '@/components/shared/ExamPracticeUI'

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

type ColorScheme = { color: string; accent: string; light: string; border: string }

const DEFAULT_UI: ColorScheme = { color: '#2563eb', accent: '#60a5fa', light: '#eff6ff', border: '#dbeafe' }

export default function CatEjercicioCard({
  asignatura,
  asignaturaLabel,
  examen,
  ejercicio,
  colorScheme,
}: {
  asignatura: 'quimica' | 'lengua'
  asignaturaLabel: string
  examen: ExamContext
  ejercicio: CatEjercicioView
  colorScheme?: ColorScheme
}) {
  const UI = colorScheme ?? DEFAULT_UI
  const [respuesta, setRespuesta] = useState('')
  const [imagenes, setImagenes] = useState<UploadedImage[]>([])
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto' | 'imagen'>('texto')
  const [apartadoIdx, setApartadoIdx] = useState(0)
  const apartado = ejercicio.apartados[apartadoIdx] ?? ejercicio.apartados[0]
  const maxScore = Number(apartado?.puntos ?? 2.5)
  const apartadoTexto = apartado ? [
    `${apartado.id}. ${apartado.enunciado}${apartado.puntos ? ` (${apartado.puntos} puntos)` : ''}`,
    apartado.opciones?.map((opcion, index) => `${String.fromCharCode(97 + index)}) ${opcion}`).join('\n'),
  ].filter(Boolean).join('\n') : ''
  const enunciadoCompleto = [
    ejercicio.instrucciones,
    ejercicio.texto,
    ejercicio.fuente,
    ejercicio.enunciado,
    apartadoTexto,
    ...(ejercicio.datos ?? []),
  ].filter(Boolean).join('\n\n')
  const textoFuente = [ejercicio.texto, ejercicio.fuente].filter(Boolean).join('\n\n')
  const enunciadoVisible = [
    ejercicio.instrucciones,
    ejercicio.enunciado,
    apartadoTexto,
    ...(ejercicio.datos ?? []),
  ].filter(Boolean).join('\n\n')

  function cambiarApartado(index: number) {
    imagenes.forEach(imagen => URL.revokeObjectURL(imagen.preview))
    setApartadoIdx(index)
    setImagenes([])
    setRespuesta('')
    setCorreccion('')
  }

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
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && imagenes.length === 0) return
    setCargando(true)
    setCorreccion('')
    const prompt = buildCorrectionPrompt({
      subject: asignaturaLabel,
      community: 'Cataluña',
      simulacroId: `${examen.id} · ${ejercicio.titulo} · ${apartado?.id ?? 'Sin apartado'}`,
      option: ejercicio.opcion ?? 'Única',
      elapsedMinutes: 0,
      difficulty: 'Media',
      blocks: [{
        numeroBloque: `${ejercicio.titulo} · ${apartado?.id ?? 'Sin apartado'}`,
        tema: apartado?.id ? `${ejercicio.titulo} · ${apartado.id}` : ejercicio.titulo,
        year: examen.anio,
        convocatoria: examen.convocatoria,
        option: ejercicio.opcion ?? 'Única',
        maxScore,
        officialPrompt: enunciadoCompleto,
        sourceText: [ejercicio.texto, ejercicio.fuente].filter(Boolean).join('\n'),
        studentAnswer: modo === 'imagen'
          ? `Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada. Se adjuntan ${imagenes.length} imagen(es).`
          : respuesta.trim(),
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
      const parsed = parseCorrectionPayload(data.respuesta)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visible = normalized
        ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore })
        : correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: maxScore })
      setCorreccion(visible)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura,
          tipo: `Cataluña · ${examen.convocatoria}`,
          año: examen.anio,
          bloque: `${ejercicio.titulo} · ${apartado?.id ?? 'Sin apartado'}`,
          opcion: ejercicio.opcion ?? 'Única',
          nota: normalized?.desglose_bloques?.[0]?.puntos_conseguidos ?? null,
          nota_maxima: maxScore,
          enunciado: enunciadoCompleto.substring(0, 2000),
          respuesta: (modo === 'imagen' ? `${imagenes.length} imagen(es) adjuntas.` : respuesta).substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: visible,
        })
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_45px_rgba(37,99,235,0.08)]" style={{ borderColor: UI.border }}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: UI.light, borderBottom: `2px solid ${UI.accent}` }}>
        <div className="min-w-0">
          <ExamMetaChips color={UI.color} accent={UI.accent} items={['PAU Catalunya', String(examen.anio), examen.convocatoria, examen.serie, ejercicio.titulo, ejercicio.opcion ? `Opción ${ejercicio.opcion}` : null, apartado?.id ? `Apartado ${apartado.id}` : null]} />
          <h3 className="mt-2 text-lg font-black text-slate-900">{ejercicio.titulo}</h3>
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-[26px] font-black" style={{ color: UI.color }}>{maxScore}</span>
          <span className="text-sm font-bold" style={{ color: UI.accent }}>pts</span>
        </div>
      </header>
      <div className="grid gap-4 p-6">
        {ejercicio.apartados.length > 1 && (
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Pregunta / apartado</span>
            <select value={apartadoIdx} onChange={event => cambiarApartado(Number(event.target.value))} className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none" style={{ borderColor: UI.border }}>
              {ejercicio.apartados.map((item, index) => <option key={item.id} value={index}>{item.id} · {item.enunciado}</option>)}
            </select>
          </label>
        )}
        {ejercicio.requiereRevision && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Este ejercicio está pendiente de revisión editorial. Puede contener algún detalle incompleto o pendiente de validar.</div>}
        {textoFuente && (
          <ExamContentCard title={asignatura === 'lengua' ? 'Texto fuente oficial' : 'Datos / fuente oficial'} color={UI.color} borderColor={UI.border} soft>
            <ExamStatement
              text={textoFuente}
              storageKey={`cat-${asignatura}:${examen.id}:${ejercicio.id}:${apartado?.id ?? apartadoIdx}:fuente`}
              accentColor={UI.color}
              softColor={UI.light}
              readingMode={asignatura === 'lengua'}
            />
          </ExamContentCard>
        )}
        {enunciadoVisible && (
          <ExamContentCard title="Enunciado oficial" color={UI.color} borderColor="#e5edf9">
            <ExamStatement
              text={enunciadoVisible}
              storageKey={`cat-${asignatura}:${examen.id}:${ejercicio.id}:${apartado?.id ?? apartadoIdx}:enunciado`}
              accentColor={UI.color}
              softColor={UI.light}
              readingMode={asignatura === 'lengua'}
            />
          </ExamContentCard>
        )}
        {ejercicio.imagenes?.map((imagen, index) => <div key={index} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">{imagen}</div>)}

        <section className="mt-2 border-t pt-5" style={{ borderColor: UI.border }}>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-slate-500">Tu respuesta</div>
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
            <textarea value={respuesta} onChange={event => setRespuesta(event.target.value)} className="h-[220px] w-full resize-y rounded-2xl border bg-slate-50 p-4 text-sm leading-7 outline-none transition focus:bg-white" style={{ borderColor: UI.border }} placeholder="Escribe aquí tu respuesta." />
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
          <button type="button" onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : imagenes.length === 0)} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` }}>
            <WandSparkles size={17} />{cargando ? 'Pausia está corrigiendo...' : 'Corregir con Pausia'}
          </button>
        </section>
        {correccion && (
          <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: UI.color }}>
            <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
              CORRECCIÓN DE PAUSIA
            </div>
            <CorrectionResultCard correction={correccion} officialMaxScore={maxScore} className="p-6 text-[0.925rem] leading-7" />
          </section>
        )}
      </div>
    </article>
  )
}
