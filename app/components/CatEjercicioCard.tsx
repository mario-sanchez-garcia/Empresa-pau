'use client'

import { useState, type CSSProperties } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'
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

function formatPts(value?: number) {
  if (value == null) return ''
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',')
}

function IncompleteExerciseNotice({ color, light, border }: { color: string; light: string; border: string }) {
  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: light, border: `1px solid ${border}`, color: '#334155' }}>
      <div className="mb-2 text-lg font-black" style={{ color }}>Ejercicio en preparación</div>
      <p className="text-sm font-bold leading-6">Estamos terminando de adaptar este contenido.</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Prueba otro ejercicio mientras tanto.</p>
    </div>
  )
}

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
  const contenidoIncompleto = isIncompleteOfficialExercise(ejercicio)

  function cambiarApartado(index: number) {
    imagenes.forEach(imagen => URL.revokeObjectURL(imagen.preview))
    setApartadoIdx(index)
    setImagenes([])
    setRespuesta('')
    setCorreccion('')
  }

  async function handleImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const next = await Promise.all(files.map(async file => {
      const preview = URL.createObjectURL(file)
      const data = await compressImageToBase64(file)
      return {
        name: file.name,
        type: 'image/jpeg',
        data,
        preview,
      }
    }))
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
      const storedCorrection = normalized ? JSON.stringify(normalized) : visible
      setCorreccion(storedCorrection)

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
          correccion: storedCorrection,
        })
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <article className="overflow-hidden bg-white" style={{ borderRadius: 16, border: `1px solid ${UI.border}`, boxShadow: 'var(--shadow-sm)' }}>
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
          <div>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Apartados</span>
            <div className="flex flex-wrap gap-2">
              {ejercicio.apartados.map((item, index) => {
                const active = apartadoIdx === index
                return (
                  <button
                    key={item.id}
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
                    {item.id}{item.puntos ? ` · ${formatPts(item.puntos)} pts` : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {contenidoIncompleto && <IncompleteExerciseNotice color={UI.color} light={UI.light} border={UI.border} />}
        {!contenidoIncompleto && textoFuente && (
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
        {!contenidoIncompleto && enunciadoVisible && (
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
        {!contenidoIncompleto && ejercicio.imagenes?.map((imagen, index) => <div key={index} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">{imagen}</div>)}

        {!contenidoIncompleto && <section className="mt-2 border-t pt-5" style={{ borderColor: UI.border }}>
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-slate-500">Tu respuesta</div>
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
            <RichTextArea value={respuesta} onChange={setRespuesta} placeholder="Escribe aquí tu respuesta." minHeight={220} accentColor={UI.color} softColor={UI.light} borderColor={UI.border} mathSubject={asignatura} />
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
          <button type="button" onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : imagenes.length === 0)} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ '--hover-shadow': `${UI.accent}33`, background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` } as CSSProperties}>
            {cargando ? <PausiaLoadingDot /> : <WandSparkles size={17} />}{cargando ? 'Corrigiendo con Pausia...' : 'Corregir con Pausia'}
          </button>
        </section>}
        {!contenidoIncompleto && correccion && (
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
