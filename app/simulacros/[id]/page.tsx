'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Camera, CheckCircle2, Flag, Send, Trash2 } from 'lucide-react'
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

const DEFAULT_DURATION_MINUTES = 90
const TOTAL_SECONDS = DEFAULT_DURATION_MINUTES * 60
const RING_RADIUS = 48
const RING_CIRC = 2 * Math.PI * RING_RADIUS

export default function SimulacroActivoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({})
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Record<string, 'text' | 'image'>>({})
  const [examStarted, setExamStarted] = useState(false)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'dirty'>('saved')
  const [submitStage, setSubmitStage] = useState('')
  const answersRef = useRef<Record<string, SimulacroAnswer>>({})
  const answerTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const savedSnapshotRef = useRef('{}')
  const dirtyRef = useRef(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: row } = await supabase
        .from('historial_simulacros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', data.user.id)
        .single()
      if (!row) router.push('/simulacros')
      else {
        const next = row as SimulacroRecord
        if (next.estado === 'completado') {
          router.push(`/simulacros/${params.id}/results`)
          return
        }
        const storedAnswers = next.respuestas_parciales ?? {}
        const storedReview = readReviewState(next.id)
        const storedStart = readStartedAt(next.id)
        const hasAnswers = Object.values(storedAnswers).some(answer => Boolean(answer?.text?.trim() || answer?.image))
        const fallbackStart = hasAnswers ? new Date(next.started_at ?? next.created_at ?? Date.now()).getTime() : null
        const effectiveStart = storedStart ?? fallbackStart
        const durationSeconds = getDurationSeconds(next)
        answersRef.current = storedAnswers
        savedSnapshotRef.current = JSON.stringify(storedAnswers)
        setAnswers(storedAnswers)
        setReviewMarked(storedReview)
        setRecord(next)
        if (effectiveStart) {
          setStartedAtMs(effectiveStart)
          setExamStarted(true)
          setSecondsLeft(Math.max(0, durationSeconds - Math.floor((Date.now() - effectiveStart) / 1000)))
        } else {
          setStartedAtMs(null)
          setExamStarted(false)
          setSecondsLeft(durationSeconds)
        }
      }
    })
  }, [params.id, router])

  useEffect(() => {
    if (!record || submitting || !examStarted || !startedAtMs) return
    const durationSeconds = getDurationSeconds(record)
    const timer = window.setInterval(() => {
      const next = Math.max(0, durationSeconds - Math.floor((Date.now() - startedAtMs) / 1000))
      setSecondsLeft(next)
      if (next === 0) {
        window.clearInterval(timer)
        setTimeUp(true)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [record, submitting, examStarted, startedAtMs])

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

  const answeredCount = useMemo(() => Object.values(answers).filter(answer => answer?.text?.trim() || answer?.image).length, [answers])
  const markedCount = useMemo(() => Object.values(reviewMarked).filter(Boolean).length, [reviewMarked])
  const cfg = record ? SUBJECTS[record.asignatura] : SUBJECTS.mates
  const durationSeconds = record ? getDurationSeconds(record) : TOTAL_SECONDS
  const durationMinutes = Math.round(durationSeconds / 60)
  const elapsedMinutes = Math.max(0, Math.ceil((durationSeconds - secondsLeft) / 60))
  const percentLeft = Math.max(0, Math.min(1, secondsLeft / durationSeconds))
  const isUrgent = secondsLeft <= 15 * 60
  const isWarning = secondsLeft <= 45 * 60 && secondsLeft > 15 * 60
  const timerColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#2563eb'
  const ringOffset = RING_CIRC * (1 - percentLeft)

  async function autosave(nextAnswers = answers) {
    if (!record || (!dirtyRef.current && JSON.stringify(nextAnswers) === savedSnapshotRef.current)) return true
    setSaveStatus('saving')
    const { error } = await supabase.from('historial_simulacros').update({ respuestas_parciales: nextAnswers, updated_at: new Date().toISOString() }).eq('id', record.id)
    if (error) {
      setSaveStatus('error')
      return false
    }
    savedSnapshotRef.current = JSON.stringify(nextAnswers)
    dirtyRef.current = false
    setSaveStatus('saved')
    return true
  }

  async function changeActive(index: number) {
    if (dirtyRef.current) await autosave(answersRef.current)
    setActive(index)
  }

  function startExam() {
    if (!record) return
    const nextStartedAt = Date.now()
    writeStartedAt(record.id, nextStartedAt)
    setStartedAtMs(nextStartedAt)
    setSecondsLeft(getDurationSeconds(record))
    setExamStarted(true)
    setTimeUp(false)
  }

  function toggleReview(blockId: string) {
    if (!record) return
    setReviewMarked(prev => {
      const next = { ...prev, [blockId]: !prev[blockId] }
      if (!next[blockId]) delete next[blockId]
      writeReviewState(record.id, next)
      return next
    })
  }

  async function handleImage(blockId: string, file?: File) {
    if (!file) return
    const base64 = await compressImageToBase64(file)
    setAnswers(prev => ({ ...prev, [blockId]: { ...(prev[blockId] ?? { text: '' }), image: base64, imageType: 'image/jpeg' } }))
  }

  async function submitExam() {
    if (!record || submitting) return
    setSubmitting(true)
    setSubmitError('')
    setSubmitStage('Guardando respuestas...')
    const answersSnapshot = answers

    try {
      const saved = await autosave(answersSnapshot)
      if (!saved) throw new Error('No se pudieron guardar las respuestas pendientes.')
      setSubmitStage('Entregando simulacro...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setSubmitError('Tu sesión ha caducado. Vuelve a iniciar sesión para entregar el simulacro.')
        setSubmitting(false)
        return
      }

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
          simulacro_id: record.id
        })
      })
      setSubmitStage('Corrigiendo con IA...')
      const result = await safeJson(res)

      if (!res.ok || result?.correction_error) {
        const updatePayload = result?.code === RATE_LIMIT_CODE
          ? {
              tiempo_empleado: elapsedMinutes,
              respuestas_parciales: answersSnapshot,
              updated_at: new Date().toISOString()
            }
          : {
          resultado_json: result ?? {
            correction_error: true,
            estado_correccion: 'error',
            feedback_general: 'No hemos podido corregir este simulacro ahora mismo.'
          },
          tiempo_empleado: elapsedMinutes,
          respuestas_parciales: answersSnapshot,
          updated_at: new Date().toISOString()
        }
        await supabase.from('historial_simulacros').update(updatePayload).eq('id', record.id)
        setSubmitError(getApiErrorMessage(result, result?.mensaje_usuario ?? result?.feedback_general ?? 'No hemos podido corregir este simulacro. Inténtalo de nuevo; tus respuestas están guardadas.'))
        setSubmitting(false)
        return
      }

      await supabase.from('historial_simulacros').update({
        resultado_json: result,
        nota_final: result?.nota_final ?? null,
        estado: 'completado',
        tiempo_empleado: elapsedMinutes,
        respuestas_parciales: answersSnapshot,
        updated_at: new Date().toISOString()
      }).eq('id', record.id)
      setSubmitStage('Resultados listos')
      router.push(`/simulacros/${record.id}/results`)
    } catch (error) {
      console.error('SIMULACRO_SUBMIT_ERROR', error)
      try {
        await supabase.from('historial_simulacros').update({
          respuestas_parciales: answersSnapshot,
          updated_at: new Date().toISOString()
        }).eq('id', record.id)
      } catch {
        // Best-effort save — ignore if it also fails
      }
      setSubmitError('No hemos podido entregar la corrección. Tus respuestas están guardadas y puedes volver a intentarlo.')
      setSubmitStage('')
      setSubmitting(false)
    }
  }

  if (!record) {
    return (
      <SimulacroShell title="Simulacro" subtitle="Cargando examen...">
        <div className="pau-card-section mx-auto max-w-6xl">
          <div className="pau-skeleton" style={{ height: 24, width: '50%', borderRadius: 8, marginBottom: 12 }} />
          <div className="pau-skeleton" style={{ height: 16, width: '30%', borderRadius: 6 }} />
        </div>
      </SimulacroShell>
    )
  }

  if (!examStarted) {
    const community = record.comunidad ?? record.bloques[0]?.comunidad ?? 'Madrid'
    const totalPoints = record.bloques.reduce((sum, block) => sum + Number(block.puntuacion || 0), 0)
    const BLOCK_COLORS = ['#2563eb', '#7c3aed', '#0369a1', '#15803d', '#c2410c', '#b45309', '#831843']

    return (
      <SimulacroShell title="Simulacro PAU" subtitle="Antes de empezar">
        <div className="mx-auto max-w-5xl">
          <div
            className="pau-reveal overflow-hidden rounded-[20px]"
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 24px 64px rgba(15,23,42,0.16), 0 4px 20px rgba(15,23,42,0.08)',
            }}
          >
            {/* ── LEFT SIDEBAR ── */}
            <div style={{ background: '#060e1e', padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 520, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1e3a5f', marginBottom: 32 }}>Camino PAU</p>
                <div style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 0.88, marginBottom: 6 }}>
                  {record.bloques.length}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 36 }}>
                  ejercicios
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {([
                    { label: 'Asignatura', value: cfg.label, blue: true },
                    { label: 'Comunidad', value: community, blue: false },
                    { label: 'Duración', value: `${durationMinutes} min`, blue: false },
                    { label: 'Puntuación', value: totalPoints ? `${formatCompact(totalPoints)} pts` : '10 pts', blue: false },
                    { label: 'Dificultad', value: record.dificultad_real ?? record.dificultad, blue: false },
                  ] as { label: string; value: string; blue: boolean }[]).map(({ label, value, blue }) => (
                    <div key={label}>
                      <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#1e3a5f', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: blue ? '#3b82f6' : '#64748b', letterSpacing: '-0.01em' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.18)', fontSize: 9, fontWeight: 900, color: '#3b82f6', letterSpacing: '.06em' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                Kairo IA
              </div>
            </div>

            {/* ── RIGHT MAIN ── */}
            <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '36px 36px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 8 }}>
                  Simulacro PAU · Antes de empezar
                </p>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 12 }}>
                  Simulacro<br />real
                </h2>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.75, maxWidth: 400 }}>
                  Trabaja en condiciones de examen. Verás el tiempo, podrás navegar entre bloques y marcar dudas para revisarlas antes de entregar.
                </p>
              </div>

              {/* Body: exercise list */}
              <div style={{ padding: '22px 36px', flex: 1 }}>
                <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 10 }}>
                  Estructura del examen
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {record.bloques.map((block, index) => (
                    <div
                      key={block.id}
                      style={{ display: 'grid', gridTemplateColumns: '4px 1fr auto', borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden', background: '#fafbfc' }}
                    >
                      <div style={{ background: BLOCK_COLORS[index % BLOCK_COLORS.length] }} />
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 2 }}>
                          Bloque {String(index + 1).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{block.tema}</div>
                      </div>
                      <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        {block.puntuacion} pts
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block', flexShrink: 0 }} />
                  La corrección se mostrará al entregar el examen.
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '2px solid #0f172a', padding: '18px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>
                  {record.asignatura !== 'lengua' ? `${optionSummaryForRecord(record)} · ` : ''}{record.dificultad_real ?? record.dificultad}
                </p>
                <button
                  onClick={startExam}
                  className="campus-primary"
                  style={{ padding: '12px 26px', borderRadius: 10, fontSize: 13, gap: 8, background: '#0f172a', boxShadow: '0 6px 18px rgba(15,23,42,0.18)' }}
                >
                  Empezar simulacro →
                </button>
              </div>
            </div>
          </div>
        </div>
      </SimulacroShell>
    )
  }

  return (
    <SimulacroShell
      title="Simulacro PAU"
      subtitle={`${cfg.label} · ${record.dificultad_real ?? record.dificultad} · ${record.bloques.length} ejercicios`}
      actions={
        <button
          onClick={() => { setSubmitError(''); setConfirmOpen(true) }}
          disabled={submitting}
          className="campus-primary"
          style={{ padding: '9px 18px', fontSize: 13, gap: 8, borderRadius: 12 }}
        >
          <Send size={14} />Entregar simulacro
        </button>
      }
    >
      <div className="mx-auto grid max-w-6xl gap-5">

        {/* Exam header: metadata + ring timer */}
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
            {/* Left: chips */}
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge color={cfg.color}>{cfg.label}</Badge>
              <Badge color="#475569">{record.comunidad ?? record.bloques[0]?.comunidad ?? 'Madrid'}</Badge>
              <Badge color="#2563eb">{record.dificultad_real ?? record.dificultad}</Badge>
              {record.asignatura !== 'lengua' && <Badge color={cfg.color}>{optionSummaryForRecord(record)}</Badge>}
              <SaveBadge status={saveStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black" style={{ color: '#64748b' }}>
              <span>{answeredCount}/{record.bloques.length} respondidos</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>{markedCount} para revisar</span>
            </div>

            {/* Right: circular ring timer */}
            <div
              className={`relative flex-shrink-0 ${isUrgent ? 'sim-ring-urgent' : ''}`}
              aria-label={`Tiempo restante: ${formatTime(secondsLeft)}`}
            >
              <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
                {/* Background track */}
                <circle
                  cx="56" cy="56" r={RING_RADIUS}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                />
                {/* Draining arc */}
                <circle
                  cx="56" cy="56" r={RING_RADIUS}
                  fill="none"
                  stroke={timerColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 1s linear, stroke 600ms ease',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black leading-none" style={{ color: timerColor, letterSpacing: '-0.03em' }}>
                  {formatTime(secondsLeft)}
                </span>
                <span className="mt-0.5 text-[10px] font-bold" style={{ color: '#94a3b8' }}>
                  {isUrgent ? 'último tramo' : isWarning ? 'atención' : 'restantes'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer progress bar (thin, below content) */}
          <div className="mt-4 pau-progress-bar">
            <div
              className="pau-progress-fill"
              style={{
                transform: `scaleX(${percentLeft})`,
                background: `linear-gradient(90deg, ${timerColor}, ${timerColor}cc)`,
                transition: 'transform 1s linear, background 600ms ease',
              }}
            />
          </div>

          {/* Block navigation tabs */}
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
                    background: isActive
                      ? cfg.color
                      : marked
                      ? '#fffbeb'
                      : answered
                      ? `${cfg.color}14`
                      : '#f1f5f9',
                    color: isActive
                      ? '#fff'
                      : marked
                      ? '#b45309'
                      : answered
                      ? cfg.color
                      : '#94a3b8',
                    border: `1.5px solid ${isActive ? cfg.color : marked ? '#fde68a' : answered ? `${cfg.color}33` : '#e2e8f0'}`,
                    boxShadow: isActive ? `0 6px 18px ${cfg.color}30` : marked ? '0 8px 18px rgba(245,158,11,0.12)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    transition: 'all 180ms var(--ease-out)',
                  }}
                >
                  {index + 1}
                  {marked && (
                    <Flag
                      size={10}
                      className="absolute -right-1 -top-1"
                      style={{ color: isActive ? '#fff' : '#d97706', fill: isActive ? '#fff' : '#fbbf24' }}
                    />
                  )}
                  {answered && !isActive && (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                      style={{ background: cfg.color, border: '1.5px solid #fff' }}
                    />
                  )}
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

        {/* Block panels */}
        {record.bloques.map((block, index) => {
          const bloqueIncompleto = isIncompleteOfficialExercise(block)
          return (
          <section key={block.id} className={active === index ? 'grid gap-4 pau-reveal' : 'hidden'}>

            {/* Statement panel */}
            <div className="pau-card-section">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: answers[block.id]?.text?.trim() || answers[block.id]?.image
                          ? cfg.color
                          : '#e2e8f0',
                        boxShadow: answers[block.id]?.text?.trim() || answers[block.id]?.image
                          ? `0 0 0 3px ${cfg.color}20`
                          : 'none',
                        transition: 'background 250ms, box-shadow 250ms',
                      }}
                    />
                    <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
                      Bloque {index + 1} · {block.tema}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { text: `Año ${block.year}` },
                      { text: block.convocatoria },
                      { text: `${block.puntuacion} pts` },
                    ].map(chip => (
                      <span
                        key={chip.text}
                        className="rounded-full px-3 py-1 text-xs font-black"
                        style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                      >
                        {chip.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {bloqueIncompleto && <IncompleteExerciseNotice color={cfg.color} light={cfg.light} />}
              {!bloqueIncompleto && <div className="grid gap-3" style={{ borderRadius: 12, border: '1px solid #dde8f8', background: '#f8fbff', padding: 14 }}>
                {(record.asignatura === 'lengua' || record.asignatura === 'ingles') && block.textoFuente && (
                  <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                    <div
                      className="mb-3 text-[11px] font-black uppercase tracking-widest"
                      style={{ color: cfg.color }}
                    >
                      {record.asignatura === 'ingles' ? 'Texto oficial' : 'Texto fuente oficial'}
                    </div>
                    <ExamStatement
                      text={block.textoFuente}
                      storageKey={`simulacro:${record.id}:bloque:${block.id}:fuente`}
                      accentColor={cfg.color}
                      softColor={cfg.light}
                      readingMode
                    />
                  </div>
                )}
                <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                  <div
                    className="mb-3 text-[11px] font-black uppercase tracking-widest"
                    style={{ color: cfg.color }}
                  >
                    Enunciado oficial
                  </div>
                  <ExamStatement
                    text={block.enunciado}
                    storageKey={`simulacro:${record.id}:bloque:${block.id}:enunciado`}
                    accentColor={cfg.color}
                    softColor={cfg.light}
                    readingMode={record.asignatura === 'lengua' || record.asignatura === 'ingles'}
                  />
                </div>
                {record.asignatura !== 'lengua' && record.asignatura !== 'ingles' && block.textoFuente && (
                  <div style={{ borderRadius: 10, border: '1px solid #e5edf9', background: '#fff', padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                    <div
                      className="mb-3 text-[11px] font-black uppercase tracking-widest"
                      style={{ color: cfg.color }}
                    >
                      Texto fuente oficial
                    </div>
                    <ExamStatement
                      text={block.textoFuente}
                      storageKey={`simulacro:${record.id}:bloque:${block.id}:fuente`}
                      accentColor={cfg.color}
                      softColor={cfg.light}
                    />
                  </div>
                )}
              </div>}
            </div>

            {/* Answer panel */}
            {!bloqueIncompleto && <div className="pau-card-section">
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
                    style={{
                      borderColor: `${cfg.color}40`,
                      background: `${cfg.color}08`,
                    }}
                  >
                    <Camera size={32} className="mb-3" style={{ color: cfg.color }} />
                    <span className="font-black" style={{ color: cfg.color }}>Sube una foto de tu respuesta</span>
                    <span className="mt-1 text-xs font-semibold" style={{ color: '#94a3b8' }}>JPG, PNG, HEIC hasta 10 MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={event => void handleImage(block.id, event.target.files?.[0])} />
                  </label>
                  {answers[block.id]?.image && (
                    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#dbe7fb' }}>
                      <img
                        src={`data:${answers[block.id].imageType};base64,${answers[block.id].image}`}
                        alt="Respuesta"
                        className="max-h-96 w-full object-contain"
                        style={{ background: '#f8fbff' }}
                      />
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
                    style={{
                      height: 224,
                      minHeight: 160,
                      borderColor: '#dde8f8',
                      background: '#f8fbff',
                      color: '#0f172a',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = cfg.color
                      e.target.style.background = '#fff'
                      e.target.style.boxShadow = `0 0 0 4px ${cfg.color}14`
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#dde8f8'
                      e.target.style.background = '#f8fbff'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              )}
            </div>}
          </section>
          )
        })}
      </div>

      {/* Confirm / Time Up modal */}
      {(confirmOpen || timeUp) && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 'var(--z-modal-bg)', background: 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="pau-reveal-scale w-full max-w-md"
            style={{
              background: '#fff',
              borderRadius: 22,
              border: '1px solid var(--pau-border)',
              boxShadow: 'var(--shadow-xl)',
              padding: 28,
              zIndex: 'var(--z-modal)',
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              {timeUp
                ? <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
                : <CheckCircle2 size={22} style={{ color: cfg.color }} />}
              <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
                {timeUp ? 'Tiempo agotado' : '¿Quieres entregar el simulacro?'}
              </h2>
            </div>

            <p className="text-sm font-semibold" style={{ color: '#475569' }}>
              La corrección se mostrará al entregar. Después podrás revisar la nota estimada y el desglose por ejercicios.
            </p>
            <p className="mt-3 text-sm font-semibold" style={{ color: '#475569' }}>
              Has respondido{' '}
              <strong style={{ color: '#0f172a' }}>{answeredCount}</strong> de{' '}
              <strong style={{ color: '#0f172a' }}>{record.bloques.length}</strong> bloques.
              {record.bloques.length - answeredCount > 0 && (
                <> Quedan <strong style={{ color: '#0f172a' }}>{record.bloques.length - answeredCount}</strong> sin responder.</>
              )}
            </p>

            {/* Mini progress */}
            <div className="mt-3 pau-progress-bar">
              <div
                className="pau-progress-fill"
                style={{
                  transform: `scaleX(${answeredCount / record.bloques.length})`,
                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`,
                }}
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
              <button
                onClick={() => { setConfirmOpen(false); setTimeUp(false) }}
                disabled={submitting}
                className="pau-button-secondary"
                style={{ padding: '10px 20px' }}
              >
                Seguir revisando
              </button>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="campus-primary"
                style={{ padding: '10px 20px', borderRadius: 12 }}
              >
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
    <span
      className="rounded-full px-3 py-1 text-xs font-black text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  )
}

function SaveBadge({ status }: { status: 'saved' | 'saving' | 'error' | 'dirty' }) {
  const configs = {
    saved:  { label: 'Guardado',           bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    saving: { label: 'Guardando...',        bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    error:  { label: 'Error al guardar',    bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    dirty:  { label: 'Sin guardar',         bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  }
  const c = configs[status]
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-black"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
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

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0')
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

function formatCompact(value: number) {
  return Number.isFinite(value) ? value.toFixed(1).replace(/\.0$/, '') : '0'
}

function optionSummaryForRecord(record: SimulacroRecord) {
  const options = Array.from(new Set((record.bloques ?? []).map(block => block.option).filter(Boolean))).sort()
  if (options.length > 1) return 'Opciones A/B'
  if (options[0]) return `Opción ${options[0]}`
  return `Opción ${record.opcion}`
}

function getDurationSeconds(record: SimulacroRecord) {
  const minutes = Number(record.duration_minutes ?? DEFAULT_DURATION_MINUTES)
  return Math.max(1, Number.isFinite(minutes) ? minutes : DEFAULT_DURATION_MINUTES) * 60
}

function startKey(id: string) {
  return `kairo:simulacro:${id}:startedAt`
}

function reviewKey(id: string) {
  return `kairo:simulacro:${id}:reviewMarked`
}

function readStartedAt(id: string) {
  try {
    const value = window.localStorage.getItem(startKey(id))
    const number = Number(value)
    return Number.isFinite(number) && number > 0 ? number : null
  } catch {
    return null
  }
}

function writeStartedAt(id: string, value: number) {
  try {
    window.localStorage.setItem(startKey(id), String(value))
  } catch {
    // Local storage is best-effort only.
  }
}

function readReviewState(id: string) {
  try {
    const raw = window.localStorage.getItem(reviewKey(id))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as Record<string, boolean> : {}
  } catch {
    return {}
  }
}

function writeReviewState(id: string, value: Record<string, boolean>) {
  try {
    window.localStorage.setItem(reviewKey(id), JSON.stringify(value))
  } catch {
    // Local storage is best-effort only.
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}
