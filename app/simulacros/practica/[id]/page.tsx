'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Camera, CheckCircle2, Flag, Send, Trash2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroAnswer, SimulacroRecord } from '@/components/simulacros/types'
import { getApiErrorMessage, RATE_LIMIT_CODE } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import ExamStatement from '@/components/shared/ExamStatement'
import MathAnswerToolbar from '@/components/shared/MathAnswerToolbar'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import KairoSpinner from '@/app/components/ui/KairoSpinner'

function PracticaPageInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({})
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Record<string, 'text' | 'image'>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitStage, setSubmitStage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'dirty'>('saved')
  const [creatingSession, setCreatingSession] = useState(false)
  const [createError, setCreateError] = useState('')

  const answersRef = useRef<Record<string, SimulacroAnswer>>({})
  const answerTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const savedSnapshotRef = useRef('{}')
  const dirtyRef = useRef(false)
  const sessionCreatedRef = useRef(false)

  useEffect(() => {
    if (params.id === 'nueva') {
      if (sessionCreatedRef.current) return
      sessionCreatedRef.current = true
      setCreatingSession(true)

      const subject = searchParams.get('subject') ?? 'mates'
      const block = searchParams.get('block') ?? ''

      supabase.auth.getSession().then(async ({ data }) => {
        const token = data.session?.access_token
        if (!token) { router.push('/login'); return }

        try {
          const res = await fetch('/api/practica-parcial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ subject, block }),
          })
          if (res.ok) {
            const json = await res.json() as { id: string }
            router.replace(`/simulacros/practica/${json.id}`)
          } else {
            const json = await res.json().catch(() => ({})) as Record<string, unknown>
            setCreateError(String(json.error ?? 'No hemos podido crear la sesión de práctica.'))
            setCreatingSession(false)
          }
        } catch {
          setCreateError('Error de red. Inténtalo de nuevo.')
          setCreatingSession(false)
        }
      })
      return
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }

      const { data: row } = await supabase
        .from('historial_simulacros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', data.user.id)
        .single()

      if (!row) { router.push('/camino'); return }

      const next = row as SimulacroRecord
      if (next.estado === 'completado') {
        router.push(`/simulacros/${params.id}/results`)
        return
      }

      const storedAnswers = next.respuestas_parciales ?? {}
      answersRef.current = storedAnswers
      savedSnapshotRef.current = JSON.stringify(storedAnswers)
      setAnswers(storedAnswers)
      setRecord(next)
    })
  }, [params.id, router, searchParams])

  useEffect(() => {
    answersRef.current = answers
    if (!record || JSON.stringify(answers) === savedSnapshotRef.current) return
    dirtyRef.current = true
    setSaveStatus('dirty')
    const timer = window.setTimeout(() => void autosave(answers), 2000)
    return () => window.clearTimeout(timer)
  }, [record, answers]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function protectPendingChanges(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', protectPendingChanges)
    return () => window.removeEventListener('beforeunload', protectPendingChanges)
  }, [])

  const answeredCount = useMemo(
    () => Object.values(answers).filter(a => a?.text?.trim() || a?.image).length,
    [answers],
  )
  const cfg = record ? SUBJECTS[record.asignatura] : SUBJECTS.mates
  const blockLabel = (record?.resultado_json as Record<string, unknown> | null)?.__practice_session
    ? String((record?.resultado_json as Record<string, unknown>).block ?? '')
    : ''

  async function autosave(nextAnswers = answers) {
    if (!record || (!dirtyRef.current && JSON.stringify(nextAnswers) === savedSnapshotRef.current)) return true
    setSaveStatus('saving')
    const { error } = await supabase
      .from('historial_simulacros')
      .update({ respuestas_parciales: nextAnswers, updated_at: new Date().toISOString() })
      .eq('id', record.id)
    if (error) { setSaveStatus('error'); return false }
    savedSnapshotRef.current = JSON.stringify(nextAnswers)
    dirtyRef.current = false
    setSaveStatus('saved')
    return true
  }

  async function changeActive(index: number) {
    if (dirtyRef.current) await autosave(answersRef.current)
    setActive(index)
  }

  function toggleReview(blockId: string) {
    if (!record) return
    setReviewMarked(prev => {
      const next = { ...prev, [blockId]: !prev[blockId] }
      if (!next[blockId]) delete next[blockId]
      return next
    })
  }

  async function handleImage(blockId: string, file?: File) {
    if (!file) return
    const base64 = await compressImageToBase64(file)
    setAnswers(prev => ({ ...prev, [blockId]: { ...(prev[blockId] ?? { text: '' }), image: base64, imageType: 'image/jpeg' } }))
  }

  async function submitSession() {
    if (!record || submitting) return
    setSubmitting(true)
    setSubmitError('')
    setSubmitStage('Guardando respuestas...')
    const answersSnapshot = answers

    try {
      const saved = await autosave(answersSnapshot)
      if (!saved) throw new Error('No se pudieron guardar las respuestas.')
      setSubmitStage('Corrigiendo con IA...')

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setSubmitError('Tu sesión ha caducado. Vuelve a iniciar sesión.')
        setSubmitting(false)
        return
      }

      const elapsedMinutes = 0
      const res = await fetch('/api/simulacro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          bloques: record.bloques,
          respuestas: answersSnapshot,
          asignatura: SUBJECTS[record.asignatura].label,
          comunidad: record.comunidad ?? record.bloques[0]?.comunidad ?? 'Madrid',
          opcion: record.opcion,
          tiempo_empleado: elapsedMinutes,
          simulacro_id: record.id,
        }),
      })

      const result = await safeJson(res)

      if (!res.ok || result?.correction_error) {
        const updatePayload = result?.code === RATE_LIMIT_CODE
          ? { tiempo_empleado: elapsedMinutes, respuestas_parciales: answersSnapshot, updated_at: new Date().toISOString() }
          : {
              resultado_json: { ...(result ?? {}), __practice_session: true },
              tiempo_empleado: elapsedMinutes,
              respuestas_parciales: answersSnapshot,
              updated_at: new Date().toISOString(),
            }
        await supabase.from('historial_simulacros').update(updatePayload).eq('id', record.id)
        setSubmitError(getApiErrorMessage(result, result?.mensaje_usuario ?? 'No hemos podido corregir. Inténtalo de nuevo; tus respuestas están guardadas.'))
        setSubmitting(false)
        return
      }

      await supabase.from('historial_simulacros').update({
        resultado_json: { ...result, __practice_session: true },
        nota_final: result?.nota_final ?? null,
        estado: 'completado',
        tiempo_empleado: elapsedMinutes,
        respuestas_parciales: answersSnapshot,
        updated_at: new Date().toISOString(),
      }).eq('id', record.id)

      setSubmitStage('Resultados listos')
      router.push(`/simulacros/${record.id}/results`)
    } catch (err) {
      console.error('PRACTICA_SUBMIT_ERROR', err)
      try {
        await supabase.from('historial_simulacros').update({ respuestas_parciales: answersSnapshot, updated_at: new Date().toISOString() }).eq('id', record.id)
      } catch { /* best-effort */ }
      setSubmitError('No hemos podido entregar la corrección. Tus respuestas están guardadas.')
      setSubmitStage('')
      setSubmitting(false)
    }
  }

  // ─── Loading / Creating states ────────────────────────────────────────────

  if (params.id === 'nueva' || creatingSession) {
    return (
      <SimulacroShell title="Práctica parcial" subtitle="Preparando sesión...">
        <div className="mx-auto max-w-xl py-20 text-center">
          {createError ? (
            <>
              <p className="mb-4 text-sm font-semibold text-red-600">{createError}</p>
              <a href="/camino" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                <ArrowLeft size={14} /> Volver a Camino PAU
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <KairoLoadingDot />
              <p className="text-sm font-semibold text-slate-500">Generando preguntas de tu bloque...</p>
            </div>
          )}
        </div>
      </SimulacroShell>
    )
  }

  if (!record) return <KairoSpinner />

  const subtitle = blockLabel
    ? `${cfg.label} · ${blockLabel} · ${record.bloques.length} preguntas`
    : `${cfg.label} · ${record.bloques.length} preguntas`

  return (
    <SimulacroShell
      title={blockLabel ? `Práctica de ${blockLabel} · Parcial` : 'Práctica dirigida'}
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-3">
          <a
            href="/camino"
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition hover:bg-slate-50"
            style={{ borderColor: '#dbe7fb', color: '#64748b' }}
          >
            <ArrowLeft size={13} /> Volver a Camino PAU
          </a>
          <button
            onClick={() => { setSubmitError(''); setConfirmOpen(true) }}
            disabled={submitting}
            className="campus-primary"
            style={{ padding: '9px 18px', fontSize: 13, gap: 8, borderRadius: 12 }}
          >
            <Send size={14} /> Entregar práctica
          </button>
        </div>
      }
    >
      <div className="mx-auto grid max-w-6xl gap-5">

        {/* Progress bar + navigation */}
        <section
          className="pau-card-section pau-reveal sticky z-30"
          style={{
            top: 76,
            background: 'rgba(255,255,255,0.86)',
            borderColor: 'rgba(219,231,251,0.92)',
            backdropFilter: 'blur(22px) saturate(1.12)',
            WebkitBackdropFilter: 'blur(22px) saturate(1.12)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge color={cfg.color}>{cfg.label}</Badge>
              {blockLabel && <Badge color="#f59e0b">{blockLabel}</Badge>}
              <span
                className="rounded-full px-3 py-1 text-xs font-black"
                style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
              >
                Prep. parcial
              </span>
              <SaveBadge status={saveStatus} />
            </div>
            <div className="text-xs font-black" style={{ color: '#64748b' }}>
              {answeredCount}/{record.bloques.length} respondidas
            </div>
          </div>

          <div className="mt-4 pau-progress-bar">
            <div
              className="pau-progress-fill"
              style={{
                transform: `scaleX(${record.bloques.length > 0 ? answeredCount / record.bloques.length : 0})`,
                background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`,
                transition: 'transform 300ms ease',
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {record.bloques.map((block, index) => {
              const answered = Boolean(answers[block.id]?.text?.trim() || answers[block.id]?.image)
              const marked = Boolean(reviewMarked[block.id])
              const isActive = active === index
              return (
                <button
                  key={block.id}
                  onClick={() => void changeActive(index)}
                  className="relative flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-black transition"
                  style={{
                    background: isActive ? cfg.color : marked ? '#fffbeb' : answered ? `${cfg.color}14` : '#f1f5f9',
                    color: isActive ? '#fff' : marked ? '#b45309' : answered ? cfg.color : '#94a3b8',
                    border: `1.5px solid ${isActive ? cfg.color : marked ? '#fde68a' : answered ? `${cfg.color}33` : '#e2e8f0'}`,
                    boxShadow: isActive ? `0 6px 18px ${cfg.color}30` : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    transition: 'all 180ms var(--ease-out)',
                  }}
                >
                  {index + 1}
                  {marked && <Flag size={10} className="absolute -right-1 -top-1" style={{ color: isActive ? '#fff' : '#d97706', fill: isActive ? '#fff' : '#fbbf24' }} />}
                  {answered && !isActive && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: cfg.color, border: '1.5px solid #fff' }} />}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-black" style={{ color: '#64748b' }}>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: '#cbd5e1' }} />Sin responder</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: cfg.color }} />Respondido</span>
            <span className="inline-flex items-center gap-1.5"><Flag size={13} style={{ color: '#d97706', fill: '#fbbf24' }} />Marcado para revisar</span>
          </div>
        </section>

        {/* Question panels */}
        {record.bloques.map((block, index) => {
          const bloqueIncompleto = isIncompleteOfficialExercise(block)
          return (
            <section key={block.id} className={active === index ? 'grid gap-4 pau-reveal' : 'hidden'}>

              <div className="pau-card-section">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          background: answers[block.id]?.text?.trim() || answers[block.id]?.image ? cfg.color : '#e2e8f0',
                          boxShadow: answers[block.id]?.text?.trim() || answers[block.id]?.image ? `0 0 0 3px ${cfg.color}20` : 'none',
                          transition: 'background 250ms, box-shadow 250ms',
                        }}
                      />
                      <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
                        Pregunta {index + 1} · {block.tema}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[{ text: `Año ${block.year}` }, { text: block.convocatoria }, { text: `${block.puntuacion} pts` }].map(chip => (
                        <span key={chip.text} className="rounded-full px-3 py-1 text-xs font-black" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
                          {chip.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {bloqueIncompleto
                  ? <IncompleteExerciseNotice color={cfg.color} light={cfg.light} />
                  : <div className="grid gap-3" style={{ borderRadius: 12, border: '1px solid #dde8f8', background: '#f8fbff', padding: 14 }}>
                      {(record.asignatura === 'lengua' || record.asignatura === 'ingles') && block.textoFuente && (
                        <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                          <div className="mb-3 text-[11px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                            {record.asignatura === 'ingles' ? 'Texto oficial' : 'Texto fuente oficial'}
                          </div>
                          <ExamStatement text={block.textoFuente} storageKey={`practica:${record.id}:bloque:${block.id}:fuente`} accentColor={cfg.color} softColor={cfg.light} readingMode />
                        </div>
                      )}
                      <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                        <div className="mb-3 text-[11px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>Enunciado oficial</div>
                        <ExamStatement
                          text={block.enunciado}
                          storageKey={`practica:${record.id}:bloque:${block.id}:enunciado`}
                          accentColor={cfg.color}
                          softColor={cfg.light}
                          readingMode={record.asignatura === 'lengua' || record.asignatura === 'ingles'}
                        />
                      </div>
                      {record.asignatura !== 'lengua' && record.asignatura !== 'ingles' && block.textoFuente && (
                        <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                          <div className="mb-3 text-[11px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>Texto fuente oficial</div>
                          <ExamStatement text={block.textoFuente} storageKey={`practica:${record.id}:bloque:${block.id}:fuente`} accentColor={cfg.color} softColor={cfg.light} />
                        </div>
                      )}
                    </div>
                }
              </div>

              {!bloqueIncompleto && (
                <div className="pau-card-section">
                  <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2">
                      {(['text', 'image'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setMode(prev => ({ ...prev, [block.id]: m }))}
                          className="rounded-xl px-4 py-2 text-sm font-black transition"
                          style={{
                            background: (mode[block.id] ?? 'text') === m ? cfg.color : '#f1f5f9',
                            color: (mode[block.id] ?? 'text') === m ? '#fff' : '#475569',
                            boxShadow: (mode[block.id] ?? 'text') === m ? `0 8px 20px ${cfg.color}30` : 'none',
                            border: 'none',
                            transition: 'all 180ms var(--ease-out)',
                          }}
                        >
                          {m === 'text' ? 'Escribir' : 'Subir foto'}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleReview(block.id)}
                        className="pau-button-secondary"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 12,
                          color: reviewMarked[block.id] ? '#b45309' : '#64748b',
                          background: reviewMarked[block.id] ? '#fffbeb' : '#fff',
                          borderColor: reviewMarked[block.id] ? '#fde68a' : '#dbe7fb',
                        }}
                      >
                        <Flag size={14} style={{ fill: reviewMarked[block.id] ? '#fbbf24' : 'transparent' }} />
                        {reviewMarked[block.id] ? 'Marcado para revisar' : 'Marcar para revisar'}
                      </button>
                      <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>
                        {answers[block.id]?.text?.trim()
                          ? `${answers[block.id].text.length} caracteres`
                          : answers[block.id]?.image
                          ? 'Imagen adjunta'
                          : 'Sin respuesta aún'}
                      </span>
                    </div>
                  </div>

                  {mode[block.id] === 'image' ? (
                    <div className="grid gap-4">
                      <label
                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition hover:-translate-y-0.5"
                        style={{ borderColor: `${cfg.color}40`, background: `${cfg.color}08` }}
                      >
                        <Camera size={32} className="mb-3" style={{ color: cfg.color }} />
                        <span className="font-black" style={{ color: cfg.color }}>Sube una foto de tu respuesta</span>
                        <span className="mt-1 text-xs font-semibold" style={{ color: '#94a3b8' }}>JPG, PNG, HEIC hasta 10 MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={event => void handleImage(block.id, event.target.files?.[0])} />
                      </label>
                      {answers[block.id]?.image && (
                        <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#dbe7fb' }}>
                          <img src={`data:${answers[block.id].imageType};base64,${answers[block.id].image}`} alt="Respuesta" className="max-h-96 w-full object-contain" style={{ background: '#f8fbff' }} />
                          <button
                            onClick={() => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? { text: '' }), image: null, imageType: null } }))}
                            className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition hover:bg-red-50"
                            style={{ border: '1px solid #fecaca' }}
                          >
                            <Trash2 size={15} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <MathAnswerToolbar
                        subject={record.asignatura}
                        value={answers[block.id]?.text ?? ''}
                        onChange={text => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? {}), text } }))}
                        textareaRef={{ current: answerTextareaRefs.current[block.id] ?? null }}
                        accentColor={cfg.color}
                        softColor={`${cfg.color}10`}
                        borderColor="#dde8f8"
                      />
                      <textarea
                        ref={node => { answerTextareaRefs.current[block.id] = node }}
                        value={answers[block.id]?.text ?? ''}
                        onChange={event => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? {}), text: event.target.value } }))}
                        placeholder="Desarrolla tu respuesta paso a paso..."
                        className="w-full resize-y rounded-2xl border p-4 text-sm leading-7 outline-none transition"
                        style={{ height: 224, minHeight: 160, borderColor: '#dde8f8', background: '#f8fbff', color: '#0f172a' }}
                        onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 4px ${cfg.color}14` }}
                        onBlur={e => { e.target.style.borderColor = '#dde8f8'; e.target.style.background = '#f8fbff'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 'var(--z-modal-bg)', background: 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="pau-reveal-scale w-full max-w-md"
            style={{ background: '#fff', borderRadius: 22, border: '1px solid var(--pau-border)', boxShadow: 'var(--shadow-xl)', padding: 28 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <CheckCircle2 size={22} style={{ color: cfg.color }} />
              <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>¿Entregar la práctica?</h2>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#475569' }}>
              La corrección se mostrará al entregar. Después podrás revisar tu nota y el desglose por pregunta.
            </p>
            <p className="mt-3 text-sm font-semibold" style={{ color: '#475569' }}>
              Has respondido <strong style={{ color: '#0f172a' }}>{answeredCount}</strong> de <strong style={{ color: '#0f172a' }}>{record.bloques.length}</strong> preguntas.
              {record.bloques.length - answeredCount > 0 && (
                <> Quedan <strong style={{ color: '#0f172a' }}>{record.bloques.length - answeredCount}</strong> sin responder.</>
              )}
            </p>
            <div className="mt-3 pau-progress-bar">
              <div
                className="pau-progress-fill"
                style={{ transform: `scaleX(${answeredCount / record.bloques.length})`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)` }}
              />
            </div>
            {submitting && (
              <div className="mt-4 flex items-center gap-2 text-sm font-black" style={{ color: cfg.color }}>
                <KairoLoadingDot />
                {submitStage || 'Preparando entrega...'}
              </div>
            )}
            {submitError && <div className="pau-info mt-4" role="alert">{submitError}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} disabled={submitting} className="pau-button-secondary" style={{ padding: '10px 20px' }}>
                Seguir revisando
              </button>
              <button onClick={submitSession} disabled={submitting} className="campus-primary" style={{ padding: '10px 20px', borderRadius: 12 }}>
                Entregar y corregir
              </button>
            </div>
          </div>
        </div>
      )}
    </SimulacroShell>
  )
}

function Badge({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: color }}>
      {children}
    </span>
  )
}

function SaveBadge({ status }: { status: 'saved' | 'saving' | 'error' | 'dirty' }) {
  const configs = {
    saved:  { label: 'Guardado',        bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    saving: { label: 'Guardando...',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    error:  { label: 'Error al guardar', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    dirty:  { label: 'Sin guardar',      bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  }
  const c = configs[status]
  return (
    <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function IncompleteExerciseNotice({ color, light }: { color: string; light: string }) {
  return (
    <div className="rounded-xl px-5 py-5" style={{ background: light, border: `1px solid ${color}22`, color: '#334155' }}>
      <div className="mb-2 text-lg font-black" style={{ color }}>Ejercicio en preparación</div>
      <p className="text-sm font-bold leading-6">Estamos terminando de adaptar este contenido.</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Prueba otro ejercicio mientras tanto.</p>
    </div>
  )
}

async function safeJson(response: Response) {
  try { return await response.json() } catch { return null }
}

export default function PracticaPage() {
  return (
    <Suspense fallback={<KairoSpinner />}>
      <PracticaPageInner />
    </Suspense>
  )
}
