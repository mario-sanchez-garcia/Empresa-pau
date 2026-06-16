'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Camera, PenLine, UploadCloud, WandSparkles, X } from 'lucide-react'
import { examenesHistoriaFilosofiaMadrid } from '@/app/data/historia_filosofia_madrid'
import { examenesHistoriaFilosofiaCataluna } from '@/app/data/historia_filosofia_cataluna'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import ExamStatement from '@/components/shared/ExamStatement'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'
import FormatToolbar from '@/components/shared/FormatToolbar'
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
  const answerRef = useRef<HTMLTextAreaElement>(null)

  const exams = useMemo(() => (
    ccaa === 'Madrid'
      ? examenesHistoriaFilosofiaMadrid.filter(exam => exam.convocatoria === convocatoria)
      : examenesHistoriaFilosofiaCataluna.filter(exam => exam.convocatoria === convocatoria)
  ), [ccaa, convocatoria])
  const years = useMemo(() => [...new Set(exams.map(exam => exam.anio))].sort((a, b) => b - a), [exams])
  const examsForYear = useMemo(() => exams.filter(exam => exam.anio === year), [exams, year])
  const selectedExam = examsForYear.find(exam => exam.id === examId) ?? examsForYear[0]

  useEffect(() => {
    setYear(years[0] ?? null)
  }, [ccaa, convocatoria, years.join(',')])

  useEffect(() => {
    setExamId(examsForYear[0]?.id ?? '')
  }, [year, examsForYear.map(exam => exam.id).join(',')])

  useEffect(() => {
    setTextOption('A')
    setExerciseNumber(1)
    setExerciseOption('A')
    setQuestionId('')
    setAnswer('')
    setCorrection('')
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

  useEffect(() => {
    setQuestionId(questions[0]?.id ?? '')
  }, [textOption, exerciseNumber, exerciseOption, questions.map(question => question.id).join(',')])

  useEffect(() => {
    setAnswer('')
    setCorrection('')
    setError('')
    setImage(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
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

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageType(file.type || 'image/jpeg')
    setImagePreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setImage((reader.result as string).split(',')[1])
    reader.readAsDataURL(file)
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

  return (
    <div className="mb-8 grid gap-5">
      <section className="bg-white px-6 py-6" style={{ borderRadius: 16, border: `1px solid ${UI.border}`, boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-4 text-xs font-bold text-slate-400">Filtros</div>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-4">
            <FilterGroup
              label="Convocatoria"
              value={convocatoria}
              onChange={value => setConvocatoria(value as Convocatoria)}
              options={[...new Set((ccaa === 'Madrid' ? examenesHistoriaFilosofiaMadrid : examenesHistoriaFilosofiaCataluna).map(exam => exam.convocatoria))].map(value => ({ value, label: titleCase(value) }))}
            />
            <FilterGroup
              label="Año"
              value={String(year)}
              onChange={value => setYear(Number(value))}
              options={years.map(value => ({ value: String(value), label: String(value) }))}
            />
            {examsForYear.length > 1 && (
              <FilterGroup
                label={ccaa === 'Madrid' ? 'Variante' : 'Serie'}
                value={selectedExam.id}
                onChange={setExamId}
                options={examsForYear.map(exam => ({
                  value: exam.id,
                  label: ccaa === 'Madrid' ? ('variante' in exam && exam.variante ? exam.variante : 'Principal') : ('serie' in exam ? exam.serie : 'Principal')
                }))}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {ccaa === 'Madrid' ? (
              <FilterGroup
                label="Texto"
                value={textOption}
                onChange={value => setTextOption(value as 'A' | 'B')}
                options={(madridExam?.textos ?? []).map(text => ({ value: text.opcion, label: `Texto ${text.opcion}` }))}
              />
            ) : (
              <>
                <FilterGroup
                  label="Ejercicio"
                  value={String(selectedExercise?.numero)}
                  onChange={value => setExerciseNumber(Number(value))}
                  options={(catalunaExam?.ejercicios ?? []).map(exercise => ({ value: String(exercise.numero), label: `Ejercicio ${exercise.numero}` }))}
                />
                {selectedExercise?.opciones && (
                  <FilterGroup
                    label="Opción"
                    value={exerciseOption}
                    onChange={value => setExerciseOption(value as 'A' | 'B')}
                    options={selectedExercise.opciones.map(option => ({ value: option.opcion, label: `Opción ${option.opcion}` }))}
                  />
                )}
              </>
            )}
          </div>
          <FilterGroup
            label={ccaa === 'Madrid' ? 'Pregunta' : 'Apartados'}
            value={selectedQuestion?.id ?? ''}
            onChange={setQuestionId}
            options={questions.map(question => ({ value: question.id, label: `${question.id} · ${question.titulo}` }))}
            wide
          />
        </div>
      </section>

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
            <div>
              <FormatToolbar textareaRef={answerRef} value={answer} onChange={setAnswer} accentColor={UI.color} softColor={UI.light} />
              <textarea ref={answerRef} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Redacta aquí tu respuesta..." className="h-52 w-full resize-y border bg-slate-50 p-4 text-sm leading-7 outline-none focus:bg-white" style={{ borderColor: UI.border, borderTop: 'none', borderRadius: '0 0 16px 16px' }} />
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={chooseImage} className="hidden" />
              {imagePreview ? <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: UI.border }}><img src={imagePreview} alt="Respuesta manuscrita" className="max-h-80 w-full object-contain" /><button type="button" onClick={clearImage} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white"><X size={16} /></button></div>
                : <button type="button" onClick={() => fileRef.current?.click()} className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-sm font-black" style={{ borderColor: UI.accent, background: UI.light, color: UI.color }}><UploadCloud size={32} /><span className="mt-2">Sube una foto de tu respuesta</span></button>}
            </div>
          )}
          {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          <button type="button" onClick={correct} disabled={loading || (mode === 'text' ? !answer.trim() : !image)} className="campus-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white disabled:opacity-50" style={{ '--hover-shadow': `${UI.accent}33`, background: `linear-gradient(135deg, ${UI.color}, ${UI.accent})`, boxShadow: `0 16px 34px ${UI.accent}33` } as CSSProperties}>{loading ? <PausiaLoadingDot /> : <WandSparkles size={17} />}{loading ? 'Corrigiendo con Pausia...' : 'Corregir con Pausia'}</button>
        </section>
        {correction && <section className="border-t-2" style={{ borderColor: UI.color }}><div className="px-6 py-4 text-sm font-black text-white" style={{ background: UI.color }}>CORRECCIÓN DE PAUSIA</div><CorrectionResultCard correction={correction} officialMaxScore={maxScore} className="p-6 text-sm leading-7" /></section>}
      </article>
    </div>
  )
}

function FilterGroup({ label, value, onChange, options, wide = false }: { label: string, value: string, onChange: (value: string) => void, options: { value: string, label: string }[], wide?: boolean }) {
  if (!options.length) return null
  return (
    <div className={wide ? 'min-w-[260px] flex-1' : 'min-w-[150px]'}>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="campus-hover rounded-2xl border px-4 py-2.5 text-sm font-black transition"
              style={{
                '--hover-color': UI.color,
                '--hover-bg': UI.light,
                '--hover-border': UI.accent,
                '--hover-shadow': `${UI.accent}33`,
                background: active ? UI.color : '#fff',
                borderColor: active ? UI.color : UI.border,
                color: active ? '#fff' : '#334155',
                boxShadow: active ? `0 14px 28px ${UI.accent}33` : '0 8px 18px rgba(100,116,139,0.05)',
                maxWidth: wide ? '100%' : undefined,
                textAlign: 'left',
              } as CSSProperties}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return <button type="button" onClick={onClick} className="campus-hover flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black" style={{ '--hover-color': UI.color, '--hover-bg': UI.light, '--hover-border': UI.accent, '--hover-shadow': `${UI.accent}33`, background: active ? UI.color : UI.light, borderColor: active ? UI.color : UI.border, color: active ? '#fff' : UI.color } as CSSProperties}>{icon}{label}</button>
}
