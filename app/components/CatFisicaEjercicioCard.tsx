'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import type { EjercicioFisicaCataluna, ExamenFisicaCataluna } from '@/app/data/fisica_cataluna'
import { scoreFromCorrection } from '@/app/lib/correctionPrompt'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import { supabase } from '@/app/lib/supabase'
import { saveExamHistory } from '@/app/lib/examHistoryClient'
import { examTextDraftKey, useExamTextDraft } from '@/app/hooks/useExamTextDraft'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import { ExamContentCard, ExamMetaChips } from '@/components/shared/ExamPracticeUI'

const UI = {
  color: '#CA8A04',
  accent: '#FACC15',
  light: '#FEFCE8',
  border: '#FEF08A',
  muted: '#64748b',
}

type UploadedImage = { name: string; type: string; data: string; preview: string }

function formatPts(value?: number) {
  if (value == null) return ''
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',')
}

function IncompleteExerciseNotice() {
  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: UI.light, border: `1px solid ${UI.border}`, color: '#334155' }}>
      <div className="mb-2 text-lg font-black" style={{ color: UI.color }}>Ejercicio en preparación</div>
      <p className="text-sm font-bold leading-6">Estamos terminando de adaptar este contenido.</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Prueba otro ejercicio mientras tanto.</p>
    </div>
  )
}

export default function CatFisicaEjercicioCard({ examen, ejercicio, draftOwnerId }: { examen: ExamenFisicaCataluna; ejercicio: EjercicioFisicaCataluna; draftOwnerId?: string }) {
  const correctionInFlightRef = useRef(false)
  const [opcionIdx, setOpcionIdx] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [imagenes, setImagenes] = useState<UploadedImage[]>([])
  const [correccion, setCorreccion] = useState('')
  const [imagenError, setImagenError] = useState('')
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
  const contenidoIncompleto = isIncompleteOfficialExercise({ ...ejercicio, opcion })
  useExamTextDraft(draftOwnerId ? examTextDraftKey(['cat-fisica', draftOwnerId, examen.id, ejercicio.numero, opcion?.opcion, apartado?.letra]) : null, respuesta, setRespuesta)

  async function handleImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // allSettled: un archivo en formato no compatible (p. ej. HEIC) no debe
    // tirar las demás fotos del mismo lote sin ningún aviso.
    const results = await Promise.allSettled(files.map(async file => ({
      name: file.name,
      type: 'image/jpeg',
      data: await compressImageToBase64(file),
      preview: URL.createObjectURL(file),
    })))
    const succeeded = results.filter((r): r is PromiseFulfilledResult<UploadedImage> => r.status === 'fulfilled').map(r => r.value)
    const failedCount = results.length - succeeded.length
    if (succeeded.length) setImagenes(current => [...current, ...succeeded])
    if (failedCount > 0) {
      console.error('[cat-fisica] image_compression_failed', { failedCount })
      setImagenError(`No hemos podido leer ${failedCount === 1 ? 'una foto' : `${failedCount} fotos`} (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte a JPG/PNG.`)
    } else {
      setImagenError('')
    }
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
    if (correctionInFlightRef.current) return
    correctionInFlightRef.current = true
    setCargando(true)
    setCorreccion('')
    const option = opcion?.opcion ?? 'Única'
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorreccion('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }

      const historyId = crypto.randomUUID()
      const response = await fetch('/api/exam/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          subject: 'Física',
          community: 'Cataluña',
          examLabel: `${examen.id} · Ejercicio ${ejercicio.numero} · Apartado ${apartado?.letra ?? 'único'}`,
          option,
          maxScore,
          year: examen.anio,
          examCall: examen.convocatoria,
          exerciseId: `${examen.id}:${ejercicio.numero}:${apartado?.letra ?? 'unico'}:${option}`,
          exerciseLabel: `${ejercicio.bloque ?? titulo} · ${apartado?.letra ?? 'único'}`,
          officialPrompt: enunciado,
          studentAnswer: modo === 'imagen'
            ? `Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada. Se adjuntan ${imagenes.length} imagen(es).`
            : respuesta,
          imagenes: modo === 'imagen' ? imagenes.map(imagen => ({ data: imagen.data, mediaType: imagen.type })) : [],
          creditKey: `cat-fisica:${examen.id}:${ejercicio.numero}:${apartado?.letra ?? 'unico'}:${option}`,
          historyId,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setCorreccion(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      if (data.truncated) {
        setCorreccion('La corrección se ha cortado antes de terminar. No se ha guardado; vuelve a intentarlo con la misma respuesta.')
        return
      }
      if (data.notEvaluable || !data.correction) {
        setCorreccion('No se pudo leer tu respuesta. No se ha guardado como intento; vuelve a intentarlo.')
        return
      }
      const normalized = data.correction
      const storedCorrection = JSON.stringify(normalized)
      setCorreccion(storedCorrection)

      try {
        const saved = await saveExamHistory({
          historyId,
          accessToken,
          xpGrant: typeof data.xpGrant === 'string' ? data.xpGrant : null,
          payload: {
          asignatura: 'fisica',
          tipo: `Cataluña · ${examen.convocatoria}`,
          año: examen.anio,
          bloque: `${titulo} · Apartado ${apartado?.letra ?? 'único'}`,
          opcion: option,
          nota: normalized ? scoreFromCorrection(normalized, maxScore) : null,
          nota_maxima: maxScore,
          enunciado: enunciado.substring(0, 2000),
          respuesta: (modo === 'imagen' ? `${imagenes.length} imagen(es) adjuntas.` : respuesta).substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: storedCorrection,
          },
        })
        if (saved.xpPending) setCorreccion(`${storedCorrection}\n\n> La corrección se guardó, pero el XP queda pendiente de confirmar.`)
      } catch (saveError) {
        setCorreccion(`${storedCorrection}\n\n> ${saveError instanceof Error ? saveError.message : 'La corrección está lista, pero no se ha podido guardar en Historial.'}`)
      }
    } catch {
      setCorreccion('No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
    } finally {
      correctionInFlightRef.current = false
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : imagenes.length === 0

  return (
    <article className="overflow-hidden bg-white" style={{ borderRadius: 16, border: `1px solid ${UI.border}`, boxShadow: 'var(--shadow-sm)' }}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: UI.light, borderBottom: `2px solid ${UI.accent}` }}>
        <div className="min-w-0">
          <ExamMetaChips color={UI.color} accent={UI.accent} items={['PAU Catalunya', String(examen.anio), examen.convocatoria, examen.serie, `Ejercicio ${ejercicio.numero}`, opcion?.opcion ? `Opción ${opcion.opcion}` : null, apartado?.letra ? `Apartado ${apartado.letra}` : null]} />
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
              <button key={item.opcion} type="button" onClick={() => cambiarOpcion(index)} className="campus-hover rounded-xl px-4 py-2 text-sm font-black" style={{ '--hover-color': UI.color, '--hover-bg': UI.light, '--hover-border': UI.accent, '--hover-shadow': `${UI.accent}33`, background: opcionIdx === index ? UI.color : UI.light, color: opcionIdx === index ? '#fff' : UI.color } as CSSProperties}>
                Opción {item.opcion}
              </button>
            ))}
          </div>
        )}
        {(apartados?.length ?? 0) > 1 && (
          <div>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Apartados</span>
            <div className="flex flex-wrap gap-2">
              {apartados?.map((item, index) => {
                const active = apartadoIdx === index
                return (
                  <button
                    key={item.letra}
                    type="button"
                    onClick={() => cambiarApartado(index)}
                    className="campus-hover rounded-2xl border px-4 py-2 text-sm font-black transition"
                    style={{
                      '--hover-color': UI.color,
                      '--hover-bg': UI.light,
                      '--hover-border': UI.accent,
                      '--hover-shadow': `${UI.accent}33`,
                      background: active ? UI.color : '#fff',
                      borderColor: active ? UI.color : UI.border,
                      color: active ? '#fff' : UI.color,
                      boxShadow: active ? `0 14px 28px ${UI.accent}33` : '0 8px 18px rgba(37,99,235,0.05)'
                    } as CSSProperties}
                  >
                    {item.letra}{item.puntos ? ` · ${formatPts(item.puntos)} pts` : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {contenidoIncompleto && <IncompleteExerciseNotice />}
        {!contenidoIncompleto && enunciado && (
          <ExamContentCard title="Enunciado oficial" color={UI.color} borderColor="#e5edf9">
            <ExamStatement
              text={enunciado}
              storageKey={`cat-fisica:${examen.id}:${ejercicio.numero}:${opcion?.opcion ?? 'unica'}:${apartado?.letra ?? apartadoIdx}:enunciado`}
              accentColor={UI.color}
              softColor={UI.light}
            />
          </ExamContentCard>
        )}

        {!contenidoIncompleto && <section className="border-t pt-5" style={{ borderColor: UI.border }}>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: UI.muted }}>Tu respuesta</div>
          <div className="mb-4 flex gap-2">
            {(['texto', 'imagen'] as const).map(nextMode => (
              <button
                key={nextMode}
                type="button"
                onClick={() => setModo(nextMode)}
                className={modo === nextMode ? 'campus-primary' : 'campus-hover'}
                style={{
                  '--hover-color': UI.color,
                  '--hover-bg': UI.light,
                  '--hover-border': UI.accent,
                  '--hover-shadow': `${UI.accent}33`,
                  background: modo === nextMode ? `linear-gradient(135deg, ${UI.color}, ${UI.accent})` : UI.light,
                  color: modo === nextMode ? '#fff' : UI.color,
                } as CSSProperties}
              >
                <span className="flex items-center gap-2 rounded-full px-[18px] py-[9px] text-[13px] font-bold">
                  {nextMode === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}
                  {nextMode === 'texto' ? 'Escribir' : 'Subir foto'}
                </span>
              </button>
            ))}
          </div>
          {modo === 'texto' ? (
            <RichTextArea value={respuesta} onChange={setRespuesta} placeholder="Escribe tu resolución paso a paso..." minHeight={220} accentColor={UI.color} softColor={UI.light} borderColor={UI.border} mathSubject="fisica" />
          ) : (
            <div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-4 text-sm font-black" style={{ borderColor: UI.accent, backgroundColor: UI.light, color: UI.color }}>
                <UploadCloud size={20} /> Añadir fotos
                <input type="file" multiple accept="image/png,image/jpeg,image/webp" capture="environment" onChange={handleImagenes} className="hidden" />
              </label>
              {imagenError && <p className="mt-2 text-xs font-bold" style={{ color: '#dc2626' }}>{imagenError}</p>}
              {imagenes.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {imagenes.map((imagen, index) => (
                    <div key={`${imagen.name}-${index}`} className="relative rounded-2xl border p-3" style={{ borderColor: UI.border }}>
                      <img src={imagen.preview} alt={imagen.name} loading="lazy" decoding="async" className="h-40 w-full object-contain" />
                      <div className="mt-2 truncate text-xs font-semibold text-slate-600">{imagen.name}</div>
                      <button type="button" onClick={() => eliminarImagen(index)} className="absolute right-2 top-2 rounded-full p-2 text-white" style={{ backgroundColor: UI.color }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button type="button" onClick={corregir} disabled={cargando || sinRespuesta} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ '--hover-shadow': `${UI.accent}33`, background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` } as CSSProperties}>
            {cargando ? <KairoLoadingDot /> : <WandSparkles size={17} />}{cargando ? 'Corrigiendo con Kairo...' : 'Corregir con Kairo'}
          </button>
        </section>}
        {!contenidoIncompleto && correccion && (
          <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: UI.color }}>
            <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20"><WandSparkles size={16} /></span>
              CORRECCIÓN DE KAIRO
            </div>
            <CorrectionResultCard correction={correccion} officialMaxScore={maxScore} className="p-6 text-[0.925rem] leading-7" />
          </section>
        )}
      </div>
    </article>
  )
}
