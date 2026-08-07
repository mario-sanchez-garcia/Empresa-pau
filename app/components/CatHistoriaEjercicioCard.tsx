'use client'

import { useRef, useState } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores, scoreFromCorrection } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import MathMarkdown from '@/components/shared/MathMarkdown'
import { ExamContentCard, ExamMetaChips } from '@/components/shared/ExamPracticeUI'

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
  color: '#2f6f4e',
  accent: '#86c89a',
  light: '#f0fdf4',
  border: '#dcfce7',
}

export function RenderFuente({ fuente, storageKeyPrefix = 'cat-historia:fuente' }: { fuente?: Fuente; storageKeyPrefix?: string }) {
  if (!fuente) return null
  const imagenes = fuente.imagenes_url?.length ? fuente.imagenes_url : fuente.imagen_url ? [fuente.imagen_url] : []

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_14px_34px_rgba(37,99,235,0.07)]" style={{ borderColor: UI.border }}>
      {fuente.titulo && <h4 className="mb-4 text-base font-black text-slate-900">{fuente.titulo}</h4>}
      {(fuente.tipo === 'imagen' || fuente.tipo === 'imagen_doble' || fuente.tipo === 'documento') && imagenes.length > 0 && (
        <div className={`grid gap-3 ${imagenes.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {imagenes.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${fuente.titulo ?? 'Fuente histórica'} ${index + 1}`} className="max-h-[520px] w-full rounded-2xl border border-slate-200 object-contain" />)}
        </div>
      )}
      {fuente.texto && (
        <ExamStatement
          className="mt-4"
          text={fuente.texto}
          storageKey={`${storageKeyPrefix}:texto`}
          accentColor={UI.color}
          softColor={UI.light}
          readingMode
        />
      )}
      {fuente.tabla && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead style={{ backgroundColor: UI.light, color: UI.color }}>
              <tr>{fuente.tabla.columnas?.map(columna => <th key={columna} className="border-b px-4 py-3 font-black" style={{ borderColor: UI.border }}>{columna}</th>)}</tr>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function obtenerPreguntas(ejercicio: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (ejercicio.preguntas) return ejercicio.preguntas.map((pregunta: any) => `${pregunta.numero}. ${pregunta.enunciado} (${pregunta.puntos} puntos)`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (ejercicio.contextos) return ejercicio.contextos.flatMap((contexto: any) => [
    contexto.descripcion,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...contexto.preguntas.map((pregunta: any) => `${pregunta.numero}. ${pregunta.enunciado}\n${pregunta.opciones.map((opcion: any) => `${opcion.letra}) ${opcion.texto}`).join('\n')}`)
  ])
  return [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(ejercicio.pregunta1 ?? []).map((pregunta: any) => `${pregunta.letra}) ${pregunta.enunciado} (${pregunta.puntos} puntos)`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(ejercicio.pregunta2?.opciones ?? []).map((opcion: any) => `Opción ${opcion.letra}: ${opcion.enunciado} (${opcion.puntos} puntos)`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(ejercicio.opciones ?? []).map((opcion: any) => `Opción ${opcion.letra}: ${opcion.enunciado}${opcion.terminos ? `\nTérminos: ${opcion.terminos.join(', ')}` : ''} (${opcion.puntos} puntos)`),
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function puntuacionEjercicio(ejercicio: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (ejercicio.preguntas) return ejercicio.preguntas.reduce((total: number, pregunta: any) => total + Number(pregunta.puntos ?? 0), 0)
  if (ejercicio.tipo === 'test') return 2.5
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (ejercicio.pregunta1) return ejercicio.pregunta1.reduce((total: number, pregunta: any) => total + Number(pregunta.puntos ?? 0), 0) + 2.5
  return Number(ejercicio.opciones?.[0]?.puntos ?? 2.5)
}

export function RespuestaIA({ contenido, officialMaxScore }: { contenido: string; officialMaxScore?: number }) {
  if (!contenido) return null
  return (
    <section className="overflow-hidden rounded-[22px] border-2" style={{ borderColor: UI.color }}>
      <div className="flex items-center gap-2 px-6 py-4 text-sm font-black text-white" style={{ backgroundColor: UI.color }}>
        <WandSparkles size={17} /> CORRECCIÓN DE KAIRO
      </div>
      <CorrectionResultCard correction={contenido} officialMaxScore={officialMaxScore} className="p-6 text-sm leading-7" />
    </section>
  )
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CatHistoriaEjercicioCard({ ejercicio, contexto }: { ejercicio: any; contexto: string }) {
  const [respuesta, setRespuesta] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)
  const [imagenTipo, setImagenTipo] = useState('image/jpeg')
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [correccion, setCorreccion] = useState('')
  const [imagenError, setImagenError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto' | 'imagen'>('texto')
  const fileRef = useRef<HTMLInputElement>(null)
  const preguntas = obtenerPreguntas(ejercicio)
  const puntuacion = puntuacionEjercicio(ejercicio)
  const enunciadoOficial = [ejercicio.instrucciones, ...preguntas].filter(Boolean).join('\n\n')
  const contenidoIncompleto = isIncompleteOfficialExercise(ejercicio)

  async function handleImagen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImagenError('')
    setImagenPreview(URL.createObjectURL(file))
    setImagenTipo('image/jpeg')
    try {
      setImagen(await compressImageToBase64(file))
    } catch (error) {
      // compressImageToBase64 rechaza en formatos que el navegador no sabe
      // decodificar (típicamente HEIC de iPhone) — sin este catch quedaba
      // una promesa rechazada sin manejar y una preview engañosa con
      // `imagen` sin rellenar.
      console.error('[cat-historia] image_compression_failed', { message: (error as Error)?.message })
      setImagenPreview(null)
      setImagen(null)
      setImagenError('No hemos podido leer esta foto (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte la imagen a JPG/PNG.')
    }
  }

  function eliminarImagen() {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagen(null)
    setImagenPreview(null)
    setImagenError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && !imagen) return
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
          studentAnswer: modo === 'imagen'
            ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.'
            : respuesta,
        }]
      })
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
          imagen: modo === 'imagen' ? imagen : null,
          imagenTipo: modo === 'imagen' ? imagenTipo : null,
          creditKey: `cat-historia:${contexto}:${ejercicio.numero}`,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setCorreccion(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = parseCorrectionPayload(data.respuesta)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [puntuacion]) : null
      const visible = normalized
        ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: puntuacion })
        : sanitizeCorrectionScaleText(correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: puntuacion }), puntuacion)
      const storedCorrection = normalized ? JSON.stringify(normalized) : visible
      setCorreccion(storedCorrection)

      // Best-effort: la corrección ya se ha mostrado al alumno en la línea de
      // arriba — un fallo guardando el historial no debe pisarla con un
      // mensaje de error ni impedir que la vea.
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await supabase.from('historial_examenes').insert({
            user_id: userData.user.id,
            asignatura: 'historia',
            tipo: 'Cataluña',
            año: Number(contexto.match(/\b20\d{2}\b/)?.[0]),
            bloque: `Ejercicio ${ejercicio.numero}`,
            opcion: 'Única',
            nota: normalized ? scoreFromCorrection(normalized, puntuacion) : null,
            nota_maxima: puntuacion,
            enunciado: enunciadoOficial.substring(0, 2000),
            respuesta: modo === 'imagen' ? 'Respuesta manuscrita adjunta como imagen.' : respuesta.substring(0, 4000),
            // Do not truncate full correction: History modal needs complete feedback.
            correccion: storedCorrection,
          })
        }
      } catch (saveError) {
        console.error('CAT_HISTORIA_SAVE_ERROR', (saveError as Error)?.message?.slice(0, 200))
      }
    } catch (error) {
      // Antes esta función no tenía catch (solo finally) — cualquier fallo de
      // red, un cuerpo de respuesta no-JSON tras un error 500 sin formatear,
      // o cualquier excepción inesperada se propagaba sin controlar y el
      // alumno se quedaba sin corrección visible o veía el texto técnico
      // crudo del error, en vez del mensaje en español que usa el resto de
      // la app.
      console.error('CAT_HISTORIA_CORRECTION_ERROR', (error as Error)?.message?.slice(0, 200))
      setCorreccion('No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
    } finally {
      setCargando(false)
    }
  }

  const sinRespuesta = modo === 'texto' ? !respuesta.trim() : !imagen

  return (
    <article className="overflow-hidden bg-white" style={{ borderRadius: 16, border: `1px solid ${UI.border}`, boxShadow: 'var(--shadow-sm)' }}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: UI.light, borderBottom: `2px solid ${UI.accent}` }}>
        <div>
          <ExamMetaChips color={UI.color} accent={UI.accent} items={['PAU Catalunya', contexto, `Ejercicio ${ejercicio.numero}`, ejercicio.tipo]} />
          <h3 className="mt-2 text-lg font-black text-slate-900">Ejercicio {ejercicio.numero}</h3>
        </div>
        <div className="text-right"><span className="text-2xl font-black" style={{ color: UI.color }}>{puntuacion}</span><span className="ml-1 text-sm font-bold" style={{ color: UI.accent }}>pts</span></div>
      </header>
      <div className="grid gap-5 p-6">
        {contenidoIncompleto && <IncompleteExerciseNotice />}
        {!contenidoIncompleto && <RenderFuente fuente={ejercicio.fuente} storageKeyPrefix={`cat-historia:${contexto}:ejercicio:${ejercicio.numero}:fuente`} />}
        {!contenidoIncompleto && <ExamContentCard title="Enunciado oficial" color={UI.color} borderColor="#e5edf9">
          <ExamStatement
            text={enunciadoOficial}
            storageKey={`cat-historia:${contexto}:ejercicio:${ejercicio.numero}:enunciado`}
            accentColor={UI.color}
            softColor={UI.light}
          />
        </ExamContentCard>}
        {!contenidoIncompleto && <div className="border-t pt-5" style={{ borderColor: UI.border }}>
          <label className="mb-3 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">Tu respuesta</label>
          <div className="mb-4 flex gap-2">
            {(['texto', 'imagen'] as const).map(nextMode => (
              <button
                className={modo === nextMode ? 'campus-primary' : 'campus-hover'}
                key={nextMode}
                onClick={() => setModo(nextMode)}
                style={{
                  background: modo === nextMode ? `linear-gradient(135deg, ${UI.color}, ${UI.accent})` : UI.light,
                  color: modo === nextMode ? '#fff' : UI.color,
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
            <RichTextArea value={respuesta} onChange={setRespuesta} placeholder="Escribe tu respuesta..." minHeight={260} accentColor={UI.color} softColor={UI.light} borderColor={UI.border} />
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImagen} className="hidden" />
              {imagenPreview ? (
                <div className="relative overflow-hidden rounded-2xl border bg-white" style={{ borderColor: UI.border }}>
                  <img src={imagenPreview} alt="Respuesta" className="max-h-[360px] w-full object-contain" />
                  <button onClick={eliminarImagen} type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: UI.color }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} type="button" className="campus-hover flex h-[220px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed" style={{ borderColor: UI.accent, backgroundColor: `${UI.light}99`, color: UI.color }}>
                  <UploadCloud size={34} />
                  <span className="mt-2 text-sm font-black">Haz clic para subir una foto</span>
                  <span className="mt-1 text-xs font-semibold" style={{ color: UI.accent }}>Fotografía tu respuesta manuscrita</span>
                </button>
              )}
              {imagenError && <p className="mt-2 text-xs font-bold" style={{ color: '#dc2626' }}>{imagenError}</p>}
            </div>
          )}
          <button type="button" onClick={corregir} disabled={cargando || sinRespuesta} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})` }}>
            {cargando ? <KairoLoadingDot /> : <WandSparkles size={17} />} {cargando ? 'Corrigiendo con Kairo...' : 'Corregir con Kairo'}
          </button>
        </div>}
        {!contenidoIncompleto && <RespuestaIA contenido={correccion} officialMaxScore={puntuacion} />}
      </div>
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
