'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Camera, CheckCircle2, Flag, Pause, Send, Trash2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroAnswer, SimulacroRecord } from '@/components/simulacros/types'
import { getApiErrorMessage, RATE_LIMIT_CODE, BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import ExamStatement from '@/components/shared/ExamStatement'
import MathEditor from '@/components/shared/MathEditor'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import KairoSpinner from '@/app/components/ui/KairoSpinner'
import { isValidSegments, totalElapsedSeconds } from '@/app/lib/simulacros/timeSegments'

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
  // startedAtMs = inicio del tramo ABIERTO ahora mismo (null si nunca se ha
  // empezado, o si está en pausa). closedElapsedSeconds = suma de los
  // tramos ya cerrados (pausas anteriores) — lo que ya se trabajó y no debe
  // reiniciarse a 0 al reanudar. secondsLeft siempre sale de
  // duración - closedElapsedSeconds - (tramo abierto, si lo hay).
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [closedElapsedSeconds, setClosedElapsedSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState('')
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
        const durationSeconds = getDurationSeconds(next)
        answersRef.current = storedAnswers
        savedSnapshotRef.current = JSON.stringify(storedAnswers)
        setAnswers(storedAnswers)
        setReviewMarked(storedReview)
        setRecord(next)

        // time_segments (pausar y continuar): un tramo con endedAt=null
        // sigue abierto ahora mismo (sesión activa); si todos están cerrados
        // es que está en pausa; si no hay ninguno, nunca se ha empezado.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resultadoJson = (next.resultado_json && typeof next.resultado_json === 'object' && !Array.isArray(next.resultado_json))
          ? next.resultado_json as Record<string, unknown>
          : {}
        const segments = isValidSegments(resultadoJson.time_segments) ? resultadoJson.time_segments : []
        const openSegment = segments.find(s => s.endedAt === null) ?? null
        const closedSeconds = totalElapsedSeconds(segments.filter(s => s.endedAt !== null))

        if (openSegment) {
          const openStart = Date.parse(openSegment.startedAt)
          setClosedElapsedSeconds(closedSeconds)
          setStartedAtMs(Number.isFinite(openStart) ? openStart : Date.now())
          setExamStarted(true)
          setSecondsLeft(Math.max(0, durationSeconds - closedSeconds - Math.floor((Date.now() - openStart) / 1000)))
        } else if (segments.length > 0) {
          // Todos los tramos están cerrados: en pausa.
          setClosedElapsedSeconds(closedSeconds)
          setStartedAtMs(null)
          setExamStarted(true)
          setSecondsLeft(Math.max(0, durationSeconds - closedSeconds))
        } else {
          // Sin tramos: o nunca se ha empezado, o es una sesión creada antes
          // de "pausar y continuar" — para esas últimas (ya tienen
          // respuestas guardadas) se preserva el comportamiento de antes
          // (un único tramo continuo desde su inicio real) en vez de
          // resetear su progreso a "no empezado".
          const storedStart = readStartedAt(next.id)
          const hasAnswers = Object.values(storedAnswers).some(answer => Boolean(answer?.text?.trim() || answer?.image))
          const legacyFallbackStart = hasAnswers ? new Date(next.started_at ?? next.created_at ?? Date.now()).getTime() : null
          const legacyStart = storedStart ?? legacyFallbackStart
          setClosedElapsedSeconds(0)
          if (legacyStart) {
            setStartedAtMs(legacyStart)
            setExamStarted(true)
            setSecondsLeft(Math.max(0, durationSeconds - Math.floor((Date.now() - legacyStart) / 1000)))
          } else {
            setStartedAtMs(null)
            setExamStarted(false)
            setSecondsLeft(durationSeconds)
          }
        }
      }
    })
  }, [params.id, router])

  useEffect(() => {
    if (!record || submitting || !examStarted || !startedAtMs) return
    const durationSeconds = getDurationSeconds(record)
    const timer = window.setInterval(() => {
      const next = Math.max(0, durationSeconds - closedElapsedSeconds - Math.floor((Date.now() - startedAtMs) / 1000))
      setSecondsLeft(next)
      if (next === 0) {
        window.clearInterval(timer)
        setTimeUp(true)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [record, submitting, examStarted, startedAtMs, closedElapsedSeconds])

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
  // En pausa: ya se empezó (hay progreso/tramos) pero no hay ningún tramo
  // abierto ahora mismo — distinto de "nunca empezado" (examStarted=false)
  // y de "activo" (examStarted=true && startedAtMs set).
  const isPaused = examStarted && !startedAtMs

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

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  // Empezar por primera vez y reanudar desde pausa son la misma acción en
  // el servidor (abrir un tramo nuevo en time_segments) — solo cambia qué
  // pantalla la dispara. El servidor manda: si la sesión ya no se puede
  // reanudar (ver MAX_RESUME_DAYS / fecha del parcial en
  // app/lib/simulacros/timeSegments.ts), devuelve 410 con un mensaje claro
  // en vez de dejar continuar silenciosamente.
  async function startExam() {
    if (!record || resuming) return
    setResuming(true)
    setResumeError('')
    try {
      const token = await getAccessToken()
      if (!token) { setResumeError('Tu sesión ha caducado. Vuelve a iniciar sesión.'); return }
      const res = await fetch('/api/simulacro/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ simulacroId: record.id, action: 'resume' }),
      })
      const json = await safeJson(res)
      if (!res.ok) {
        setResumeError(json?.message ?? 'No hemos podido empezar el simulacro ahora mismo. Inténtalo de nuevo.')
        return
      }
      setStartedAtMs(Date.now())
      setExamStarted(true)
      setTimeUp(false)
    } catch {
      setResumeError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setResuming(false)
    }
  }

  // Pausar cierra el tramo abierto en el servidor (el tiempo ya consumido
  // se guarda en closedElapsedSeconds y deja de sumar) sin tocar las
  // respuestas — se guardan aparte, como siempre, vía autosave.
  async function pauseExam() {
    if (!record || !startedAtMs || pausing) return
    setPausing(true)
    try {
      await autosave(answersRef.current)
      const token = await getAccessToken()
      if (!token) return
      const res = await fetch('/api/simulacro/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ simulacroId: record.id, action: 'pause' }),
      })
      if (res.ok) {
        const json = await safeJson(res)
        const nextClosed = typeof json?.elapsedSeconds === 'number'
          ? json.elapsedSeconds
          : closedElapsedSeconds + Math.floor((Date.now() - startedAtMs) / 1000)
        setClosedElapsedSeconds(nextClosed)
        setStartedAtMs(null)
      }
    } finally {
      setPausing(false)
    }
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
        const noResultSave = result?.code === RATE_LIMIT_CODE || result?.code === BILLING_BLOCK_CODE
        const updatePayload = noResultSave
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

      // El servidor ya calculó y guardó tiempo_empleado desde
      // resultado_json.time_segments (la suma real de los tramos
      // trabajados, sin las pausas) al corregir — result.tiempo_empleado_minutos
      // lo trae de vuelta. Se prefiere sobre elapsedMinutes (el del propio
      // reloj del cliente) para no pisar ese valor más preciso con este
      // update, redundante pero ya existente.
      const authoritativeElapsed = typeof result?.tiempo_empleado_minutos === 'number' ? result.tiempo_empleado_minutos : elapsedMinutes
      await supabase.from('historial_simulacros').update({
        resultado_json: result,
        nota_final: result?.nota_final ?? null,
        estado: 'completado',
        tiempo_empleado: authoritativeElapsed,
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

  if (!record) return <KairoSpinner />

  if (!examStarted || isPaused) {
    const community = record.comunidad ?? record.bloques[0]?.comunidad ?? 'Madrid'
    const totalPoints = record.bloques.reduce((sum, block) => sum + Number(block.puntuacion || 0), 0)
    const BLOCK_COLORS = ['#2563eb', '#7c3aed', '#0369a1', '#15803d', '#c2410c', '#b45309', '#831843']
    const HF_CLOCK = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260728_113008_a83f03ca-efc2-415e-99b4-d2af7f3807a2.png'
    const tags = [
      `${record.bloques.length} ejercicios`,
      `${totalPoints || 10} puntos`,
      record.dificultad_real ?? record.dificultad,
      record.asignatura !== 'lengua' ? optionSummaryForRecord(record) : null,
    ].filter((t): t is string => Boolean(t))
    // En pausa: se muestra el tiempo REAL restante (ya descontadas las
    // pausas), no la duración completa fija — para dejar claro que esto es
    // "continuar donde lo dejaste", no "empezar de cero" ni "ya completado".
    const usedMinutes = Math.max(0, Math.round(closedElapsedSeconds / 60))

    return (
      <SimulacroShell>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>

        {/* Full-bleed scene */}
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#000' }}>

          {/* Background photo */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${HF_CLOCK})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          {/* Radial dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.97) 100%)' }} />

          {/* Top nav */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 44px', zIndex: 10 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.3em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)' }}>
              {isPaused ? 'Simulacro PAU · En pausa' : 'Simulacro PAU · Antes de empezar'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, background: isPaused ? 'rgba(245,158,11,0.15)' : 'rgba(37,99,235,0.15)', border: `1px solid ${isPaused ? 'rgba(245,158,11,0.35)' : 'rgba(37,99,235,0.3)'}`, fontSize: 9, fontWeight: 900, color: isPaused ? '#fbbf24' : '#60a5fa', letterSpacing: '.06em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPaused ? '#f59e0b' : '#2563eb', display: 'inline-block', flexShrink: 0 }} />
              {isPaused ? 'En pausa' : 'Kairo IA'}
            </span>
          </div>

          {/* Center: giant countdown + subject */}
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 40px 40px' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.3em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
              {isPaused ? 'Tiempo restante · ya llevas ' + usedMinutes + ' min' : 'Tu tiempo disponible'}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(96px, 14vw, 192px)', lineHeight: 1, color: '#fff', letterSpacing: '0.04em', textShadow: '0 0 80px rgba(37,99,235,0.45)' }}>
              {isPaused ? formatTime(secondsLeft) : `${String(durationMinutes).padStart(2, '0')}:00`}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginTop: 6, display: 'block' }}>
              {isPaused ? 'minutos y segundos restantes' : 'minutos · simulacro real'}
            </span>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 4vw, 50px)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', marginTop: 20 }}>
              {cfg.label} · {community}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center', marginTop: 20 }}>
              {tags.map(tag => (
                <span key={tag} style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>
                  {tag}
                </span>
              ))}
            </div>
            {resumeError && (
              <div style={{ marginTop: 20, maxWidth: 420, padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: 12, fontWeight: 700 }}>
                {resumeError}
              </div>
            )}
          </div>

          {/* Bottom panel */}
          <div style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Block strip */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${record.bloques.length}, 1fr)`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {record.bloques.map((block, i) => (
                <div key={block.id} style={{ padding: '16px 20px', borderRight: i < record.bloques.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)' }}>
                    Bloque {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>{block.tema}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BLOCK_COLORS[i % BLOCK_COLORS.length] }}>{block.puntuacion} pts</div>
                </div>
              ))}
            </div>

            {/* CTA bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                {isPaused ? 'Tus respuestas siguen guardadas tal y como las dejaste' : 'La corrección aparece al entregar · Kairo IA'}
              </span>
              <button
                onClick={() => void startExam()}
                disabled={resuming}
                className="campus-primary"
                style={{ padding: '15px 30px', borderRadius: 10, fontSize: 14, gap: 10, background: '#2563eb', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', opacity: resuming ? 0.7 : 1 }}
              >
                {resuming ? 'Un momento...' : isPaused ? 'Continuar simulacro →' : 'Empezar simulacro →'}
              </button>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => void pauseExam()}
            disabled={submitting || pausing}
            className="pau-button-secondary"
            style={{ padding: '9px 16px', fontSize: 13, gap: 8, borderRadius: 12 }}
            title="Guarda tus respuestas y el tiempo consumido hasta ahora — puedes continuar más tarde donde lo dejaste."
          >
            <Pause size={14} />{pausing ? 'Pausando...' : 'Pausar'}
          </button>
          <button
            onClick={() => { setSubmitError(''); setConfirmOpen(true) }}
            disabled={submitting}
            className="campus-primary"
            style={{ padding: '9px 18px', fontSize: 13, gap: 8, borderRadius: 12 }}
          >
            <Send size={14} />Entregar simulacro
          </button>
        </div>
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
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => void handleImage(block.id, event.target.files?.[0])} />
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
                <MathEditor
                  subject={record.asignatura}
                  value={answers[block.id]?.text ?? ''}
                  onChange={text => setAnswers(prev => ({ ...prev, [block.id]: { ...(prev[block.id] ?? {}), text } }))}
                  accentColor={cfg.color}
                  softColor={`${cfg.color}10`}
                  borderColor="#dde8f8"
                  minHeight={224}
                />
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
