'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Camera, Check, ChevronDown, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import { examenesHistoriaFilosofiaMadrid } from '@/app/data/historia_filosofia_madrid'
import { examenesHistoriaFilosofiaCataluna } from '@/app/data/historia_filosofia_cataluna'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import RichTextArea from '@/components/shared/RichTextArea'
import { ExamContentCard, ExamMetaChips } from '@/components/shared/ExamPracticeUI'

type Comunidad = 'Madrid' | 'Cataluña'
type Convocatoria = 'ordinaria' | 'extraordinaria'

const UI = {
  color: '#64748B',
  accent: '#94A3B8',
  light: '#F8FAFC',
  border: '#E2E8F0'
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scoreFromCorrection(data: any, maxScore: number) {
  const raw = data?.desglose_bloques?.[0]?.puntos_conseguidos
  return raw == null ? null : Math.min(maxScore, Math.max(0, Number(raw)))
}

export default function PhilosophyExamWorkspace({ ccaa }: { ccaa: Comunidad }) {
  const [convocatoria, setConvocatoria] = useState<Convocatoria>('ordinaria')
  const [year, setYear] = useState<number | null>(null)
  const [examId, setExamId] = useState('')
  const [textOption, setTextOption] = useState<'A' | 'B'>('A')
  const [exerciseNumber, setExerciseNumber] = useState(1)
  const [exerciseOption, setExerciseOption] = useState<'A' | 'B'>('A')
  const [questionId, setQuestionId] = useState('')
  const [answer, setAnswer] = useState('')
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [image, setImage] = useState<string | null>(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [correction, setCorrection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const exams = useMemo(() => (
    ccaa === 'Madrid'
      ? examenesHistoriaFilosofiaMadrid.filter(exam => exam.convocatoria === convocatoria)
      : examenesHistoriaFilosofiaCataluna.filter(exam => exam.convocatoria === convocatoria)
  ), [ccaa, convocatoria])
  const years = useMemo(() => [...new Set(exams.map(exam => exam.anio))].sort((a, b) => b - a), [exams])
  const examsForYear = useMemo(() => exams.filter(exam => exam.anio === year), [exams, year])
  const selectedExam = examsForYear.find(exam => exam.id === examId) ?? examsForYear[0]

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(years[0] ?? null)
  }, [years])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExamId(examsForYear[0]?.id ?? '')
  }, [examsForYear])

  useEffect(() => {
    // React 18 batchea estos setStates en un solo render — no hay riesgo real de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextOption('A')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExerciseNumber(1)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExerciseOption('A')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestionId('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCorrection('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')
  }, [ccaa, examId])

  const madridExam = ccaa === 'Madrid' ? selectedExam as (typeof examenesHistoriaFilosofiaMadrid)[number] | undefined : undefined
  const catalunaExam = ccaa === 'Cataluña' ? selectedExam as (typeof examenesHistoriaFilosofiaCataluna)[number] | undefined : undefined
  const selectedText = madridExam?.textos.find(text => text.opcion === textOption) ?? madridExam?.textos[0]
  const madridQuestions = madridExam ? [...(selectedText?.preguntas ?? []), ...(madridExam.preguntasComunes ?? [])] : []
  const selectedExercise = catalunaExam?.ejercicios.find(exercise => exercise.numero === exerciseNumber) ?? catalunaExam?.ejercicios[0]
  const selectedExerciseOption = selectedExercise?.opciones?.find(option => option.opcion === exerciseOption) ?? selectedExercise?.opciones?.[0]
  const catalunaQuestions = selectedExerciseOption?.apartados ?? selectedExercise?.apartados ?? []
  const questions = ccaa === 'Madrid' ? madridQuestions : catalunaQuestions
  const selectedQuestion = questions.find(question => question.id === questionId) ?? questions[0]
  const isSelectedTextQuestion = Boolean(selectedQuestion && selectedText?.preguntas.some(question => question.id === selectedQuestion.id))

  const questionsSignature = questions.map(question => question.id).join(',')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestionId(questionsSignature.split(',')[0] ?? '')
  }, [textOption, exerciseNumber, exerciseOption, questionsSignature])

  useEffect(() => {
    // React 18 batchea estos setStates en un solo render — no hay riesgo real de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCorrection('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImage(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [ccaa, convocatoria, year, examId, textOption, exerciseNumber, exerciseOption, questionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sourceText = ccaa === 'Madrid'
    ? isSelectedTextQuestion && selectedText
      ? `**${selectedText.autor}, ${selectedText.obra}**\n\n${selectedText.texto}`
      : ''
    : selectedExerciseOption?.texto
      ? `**${selectedExerciseOption.autor ?? ''}${selectedExerciseOption.obra ? `, ${selectedExerciseOption.obra}` : ''}**\n\n${selectedExerciseOption.texto}\n\n${selectedExerciseOption.fuente ?? ''}`
      : ''
  const maxScore = Number(selectedQuestion?.puntos ?? selectedExercise?.puntos ?? 2)
  const wordLimit = selectedQuestion && 'limitePalabras' in selectedQuestion ? selectedQuestion.limitePalabras : undefined
  const variantLabel = ccaa === 'Madrid'
    ? madridExam?.variante
    : catalunaExam?.serie
  const contextLabel = ccaa === 'Madrid'
    ? `Texto ${textOption} · ${selectedQuestion?.id ?? ''}`
    : `Ejercicio ${selectedExercise?.numero ?? ''}${selectedExercise?.opciones ? ` · Opción ${exerciseOption}` : ''} · ${selectedQuestion?.id ?? ''}`
  const criteria = ccaa === 'Madrid'
    ? [
        ...(madridExam?.criteriosGenerales ?? []),
        isSelectedTextQuestion && selectedText?.solucionOrientativa ? `Solución orientativa disponible:\n${selectedText.solucionOrientativa}` : ''
      ].filter(Boolean).join('\n\n')
    : 'Valora la precisión conceptual, la comprensión del texto o problema filosófico, la argumentación, la comparación razonada y la claridad expresiva. Respeta el límite de palabras cuando se indique.'

  async function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
    setImageType('image/jpeg')
    setImage(await compressImageToBase64(file))
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function correct() {
    if (!selectedQuestion || !selectedExam || (mode === 'text' ? !answer.trim() : !image)) return
    setLoading(true)
    setCorrection('')
    setError('')
    const prompt = buildCorrectionPrompt({
      subject: 'Historia de la Filosofía',
      community: ccaa,
      simulacroId: `Práctica Filosofía ${ccaa} ${selectedExam.anio} ${convocatoria} ${contextLabel}`,
      option: ccaa === 'Madrid' ? textOption : selectedExercise?.opciones ? exerciseOption : 'Única',
      elapsedMinutes: 0,
      difficulty: 'Media',
      blocks: [{
        numeroBloque: contextLabel,
        tema: selectedQuestion.titulo,
        community: ccaa,
        year: selectedExam.anio,
        convocatoria,
        option: ccaa === 'Madrid' ? textOption : selectedExercise?.opciones ? exerciseOption : 'Única',
        maxScore,
        officialPrompt: selectedQuestion.enunciado,
        sourceText,
        criteria,
        studentAnswer: mode === 'image' ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.' : answer
      }]
    })

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setError('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ pregunta: prompt, imagen: mode === 'image' ? image : null, imagenTipo: mode === 'image' ? imageType : null })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'No se pudo corregir la respuesta.'))
      const parsed = parseCorrectionPayload(data.respuesta)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visible = normalized
        ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore })
        : correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: maxScore })
      const storedCorrection = normalized ? JSON.stringify(normalized) : visible
      setCorrection(storedCorrection)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: 'historia_filosofia',
          tipo: `${ccaa} · ${titleCase(convocatoria)}${variantLabel ? ` · ${variantLabel}` : ''}`,
          año: selectedExam.anio,
          bloque: contextLabel,
          opcion: ccaa === 'Madrid' ? textOption : selectedExercise?.opciones ? exerciseOption : 'Única',
          nota: scoreFromCorrection(normalized, maxScore),
          nota_maxima: maxScore,
          enunciado: selectedQuestion.enunciado.substring(0, 2000),
          respuesta: mode === 'image' ? 'Respuesta manuscrita adjunta como imagen.' : answer.substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: storedCorrection
        })
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo corregir la respuesta.')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedExam) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">No hay exámenes de Filosofía disponibles para esta convocatoria.</div>
  }

  const convocatoriaOptions = [...new Set(
    (ccaa === 'Madrid' ? examenesHistoriaFilosofiaMadrid : examenesHistoriaFilosofiaCataluna).map(exam => exam.convocatoria)
  )]

  return (
    <>
      <div className="exams-filter-card" style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '2px solid #0f172a', padding: '12px 0', marginBottom: 20 }}>
        <div className="exams-filter-bar">
          <FilterDropdown
            label="Año"
            value={String(year ?? years[0] ?? 'Año')}
            options={years.map(y => ({ label: String(y), active: y === year, onSelect: () => setYear(y) }))}
          />
          <div className="exams-filter-divider" />
          <FilterDropdown
            label="Convocatoria"
            value={titleCase(convocatoria)}
            options={convocatoriaOptions.map(conv => ({
              label: titleCase(conv),
              active: conv === convocatoria,
              onSelect: () => setConvocatoria(conv as Convocatoria)
            }))}
          />
          {examsForYear.length > 1 && (
            <>
              <div className="exams-filter-divider" />
              <FilterDropdown
                label={ccaa === 'Madrid' ? 'Variante' : 'Serie'}
                value={ccaa === 'Madrid'
                  ? ('variante' in selectedExam && selectedExam.variante ? selectedExam.variante : 'Principal')
                  : ('serie' in selectedExam ? selectedExam.serie : 'Principal')}
                options={examsForYear.map(exam => ({
                  label: ccaa === 'Madrid'
                    ? ('variante' in exam && exam.variante ? exam.variante : 'Principal')
                    : ('serie' in exam ? exam.serie : 'Principal'),
                  active: exam.id === examId,
                  onSelect: () => setExamId(exam.id)
                }))}
              />
            </>
          )}
          {ccaa === 'Madrid' && (madridExam?.textos ?? []).length > 0 && (
            <>
              <div className="exams-filter-divider" />
              <FilterDropdown
                label="Texto"
                value={`Texto ${textOption}`}
                options={(madridExam?.textos ?? []).map(text => ({
                  label: `Texto ${text.opcion}`,
                  active: text.opcion === textOption,
                  onSelect: () => setTextOption(text.opcion as 'A' | 'B')
                }))}
              />
            </>
          )}
          {ccaa === 'Cataluña' && (catalunaExam?.ejercicios ?? []).length > 0 && (
            <>
              <div className="exams-filter-divider" />
              <FilterDropdown
                label="Ejercicio"
                value={`Ejercicio ${selectedExercise?.numero ?? ''}`}
                options={(catalunaExam?.ejercicios ?? []).map(exercise => ({
                  label: `Ejercicio ${exercise.numero}`,
                  active: exercise.numero === exerciseNumber,
                  onSelect: () => setExerciseNumber(exercise.numero)
                }))}
              />
              {selectedExercise?.opciones && (
                <>
                  <div className="exams-filter-divider" />
                  <FilterDropdown
                    label="Opción"
                    value={`Opción ${exerciseOption}`}
                    options={selectedExercise.opciones.map(option => ({
                      label: `Opción ${option.opcion}`,
                      active: option.opcion === exerciseOption,
                      onSelect: () => setExerciseOption(option.opcion as 'A' | 'B')
                    }))}
                  />
                </>
              )}
            </>
          )}
          {questions.length > 0 && (
            <>
              <div className="exams-filter-divider" />
              <FilterDropdown
                label={ccaa === 'Madrid' ? 'Pregunta' : 'Apartado'}
                value={selectedQuestion ? `${selectedQuestion.id} · ${selectedQuestion.titulo}` : 'Selecciona'}
                options={questions.map(question => ({
                  label: `${question.id} · ${question.titulo}`,
                  active: question.id === questionId,
                  onSelect: () => setQuestionId(question.id)
                }))}
              />
            </>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-5">
        <article className="overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_45px_rgba(100,116,139,0.10)]" style={{ borderColor: UI.border }}>
          <header className="flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5" style={{ background: UI.light, borderColor: UI.border }}>
            <div className="min-w-0">
              <ExamMetaChips
                color={UI.color}
                accent={UI.accent}
                items={[
                  ccaa === 'Cataluña' ? 'PAU Catalunya' : 'EBAU Madrid',
                  String(selectedExam.anio),
                  titleCase(convocatoria),
                  variantLabel,
                  ccaa === 'Cataluña' ? `Exercici ${selectedExercise?.numero ?? ''}` : `Texto ${textOption}`,
                  ccaa === 'Cataluña' && selectedExercise?.opciones ? `Opció ${exerciseOption}` : null,
                  selectedQuestion?.id ? `Pregunta ${selectedQuestion.id}` : null,
                ]}
              />
              <h2 className="mt-2 text-xl font-black text-slate-900">{selectedQuestion?.titulo}</h2>
            </div>
            <div className="text-2xl font-black" style={{ color: UI.color }}>{maxScore} <span className="text-sm">pts</span></div>
          </header>
          <div className="grid gap-5 p-6">
            {sourceText && (
              <ExamContentCard title={ccaa === 'Cataluña' ? 'Texto filosófico / fuente oficial' : 'Texto filosófico'} color={UI.color} borderColor={UI.border} soft>
                <ExamStatement
                  text={sourceText}
                  storageKey={`filosofia:${ccaa}:${selectedExam?.id ?? 'examen'}:${selectedQuestion?.id ?? 'pregunta'}:fuente`}
                  accentColor={UI.color}
                  softColor={UI.light}
                  readingMode
                />
              </ExamContentCard>
            )}
            <ExamContentCard title="Enunciado oficial" color={UI.color} borderColor={UI.border}>
              <ExamStatement
                text={selectedQuestion?.enunciado ?? ''}
                storageKey={`filosofia:${ccaa}:${selectedExam?.id ?? 'examen'}:${selectedQuestion?.id ?? 'pregunta'}:enunciado`}
                accentColor={UI.color}
                softColor={UI.light}
                readingMode
              />
              {wordLimit && <div className="mt-3 text-xs font-bold text-slate-500">Límite: {wordLimit}</div>}
            </ExamContentCard>
          </div>
          <section className="border-t p-6" style={{ borderColor: UI.border }}>
            <div className="mb-4 flex gap-2">
              <ModeButton active={mode === 'text'} onClick={() => setMode('text')} icon={<PenLine size={15} />} label="Escribir" />
              <ModeButton active={mode === 'image'} onClick={() => setMode('image')} icon={<Camera size={15} />} label="Subir foto" />
            </div>
            {mode === 'text' ? (
              <RichTextArea value={answer} onChange={setAnswer} placeholder="Redacta aquí tu respuesta..." minHeight={208} accentColor={UI.color} softColor={UI.light} borderColor={UI.border} />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={chooseImage} className="hidden" />
                {imagePreview
                  ? <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: UI.border }}><img src={imagePreview} alt="Respuesta manuscrita" className="max-h-80 w-full object-contain" /><button type="button" onClick={clearImage} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white"><X size={16} /></button></div>
                  : <button type="button" onClick={() => fileRef.current?.click()} className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-sm font-black" style={{ borderColor: UI.accent, background: UI.light, color: UI.color }}><UploadCloud size={32} /><span className="mt-2">Sube una foto de tu respuesta</span></button>
                }
              </div>
            )}
            {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            <button type="button" onClick={correct} disabled={loading || (mode === 'text' ? !answer.trim() : !image)} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:opacity-50" style={{ '--hover-shadow': `${UI.accent}33`, background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` } as CSSProperties}>{loading ? <KairoLoadingDot /> : <WandSparkles size={17} />}{loading ? 'Corrigiendo con Kairo...' : 'Corregir con Kairo'}</button>
          </section>
          {correction && <section className="border-t-2" style={{ borderColor: UI.color }}><div className="px-6 py-4 text-sm font-black text-white" style={{ background: UI.color }}>CORRECCIÓN DE KAIRO</div><CorrectionResultCard correction={correction} officialMaxScore={maxScore} className="p-6 text-sm leading-7" /></section>}
        </article>
      </div>
    </>
  )
}

type PhiloFilterOption = { label: string; active: boolean; onSelect: () => void }

function FilterDropdown({ label, value, options }: { label: string; value: string; options: PhiloFilterOption[] }) {
  const [open, setOpen] = useState(false)
  const hasValue = options.some(o => o.active)
  return (
    <div className={`exam-filter-dropdown${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`exam-filter-trigger${hasValue ? ' has-value' : ''}${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(c => !c)}
      >
        <span className="exam-filter-label">{label}</span>
        <span className="exam-filter-sep">·</span>
        <span className="exam-filter-value">{value}</span>
        <ChevronDown
          size={11}
          style={{
            flexShrink: 0,
            color: open ? '#2563eb' : '#94a3b8',
            transition: 'transform 180ms cubic-bezier(0.23,1,0.32,1), color 140ms',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>
      {open && (
        <div className="exam-filter-menu">
          {options.map(option => (
            <button
              type="button"
              key={option.label}
              className={`exam-filter-option${option.active ? ' is-active' : ''}`}
              onClick={() => { option.onSelect(); setOpen(false) }}
            >
              <span>{option.label}</span>
              {option.active && <Check size={13} style={{ flexShrink: 0, color: '#2563eb' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return <button type="button" onClick={onClick} className="campus-hover flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black" style={{ '--hover-color': UI.color, '--hover-bg': UI.light, '--hover-border': UI.accent, '--hover-shadow': `${UI.accent}33`, background: active ? UI.color : UI.light, borderColor: active ? UI.color : UI.border, color: active ? '#fff' : UI.color } as CSSProperties}>{icon}{label}</button>
}
