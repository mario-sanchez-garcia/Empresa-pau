'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, Flag, Pause, Send, Trash2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroAnswer, SimulacroRecord } from '@/components/simulacros/types'
import { getApiErrorMessage, RATE_LIMIT_CODE, BILLING_BLOCK_CODE } from '@/app/lib/rateLimitMessages'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import ExamStatement from '@/components/shared/ExamStatement'
import MathAnswerToolbar from '@/components/shared/MathAnswerToolbar'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import KairoSpinner from '@/app/components/ui/KairoSpinner'
import { PARCIAL_MINUTES } from '@/app/lib/camino/xpMap'
import { isValidSegments, totalElapsedSeconds, type TimeSegment } from '@/app/lib/simulacros/timeSegments'

// Misma duración de referencia que usa el XP de esta acción (PARCIAL_COMPLETION_XP
// en xpMap.ts, ver comentario ahí: "una sesión de parcial cronometrada"). El
// anillo/estilo del cronómetro es una réplica exacta del de app/simulacros/[id]/page.tsx
// para que ambos flujos se sientan como el mismo componente.
const TOTAL_SECONDS = PARCIAL_MINUTES * 60
const RING_RADIUS = 48
const RING_CIRC = 2 * Math.PI * RING_RADIUS

function PracticaPageInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [answers, setAnswers] = useState<Record<string, SimulacroAnswer>>({})
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<Record<string, 'text' | 'image'>>({})
  // En móvil el enunciado (con texto fuente incluido, a veces largo) y la
  // respuesta competían por la misma pantalla estrecha, dejando muy poco
  // alto real para leer o escribir a la vez. En desktop (md+) ambos paneles
  // siguen mostrándose apilados como siempre — esto solo cambia < md.
  const [mobileTab, setMobileTab] = useState<Record<string, 'leer' | 'responder'>>({})
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  // Suma de los tramos ya cerrados (pausas anteriores) — igual que en
  // app/simulacros/[id]/page.tsx, para que pausar y reanudar nunca reinicie
  // el reloj a 0. secondsLeft siempre sale de TOTAL_SECONDS -
  // closedElapsedSeconds - (tramo abierto, si lo hay).
  const [closedElapsedSeconds, setClosedElapsedSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [timeUp, setTimeUp] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reviewMarked, setReviewMarked] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitStage, setSubmitStage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'dirty'>('saved')
  const [creatingSession, setCreatingSession] = useState(false)
  const [createError, setCreateError] = useState('')
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState('')

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
      const missionId = searchParams.get('missionId') ?? undefined

      supabase.auth.getSession().then(async ({ data }) => {
        const token = data.session?.access_token
        if (!token) { router.push('/login'); return }

        try {
          const res = await fetch('/api/practica-parcial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ subject, block, missionId }),
          })
          if (res.ok) {
            const json = await res.json() as { id: string; alreadyCompleted?: boolean }
            // Esta misión del calendario ya tenía una práctica entregada hoy
            // — en vez de abrir una sesión nueva (que se descubriría
            // duplicada solo al corregirla), se va directo a la corrección
            // ya hecha.
            router.replace(json.alreadyCompleted ? `/simulacros/${json.id}/results` : `/simulacros/practica/${json.id}`)
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

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      const token = data.session?.access_token
      if (!user || !token) { router.push('/login'); return }

      const { data: row } = await supabase
        .from('historial_simulacros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (!row) { router.push('/camino'); return }

      const next = row as SimulacroRecord
      if (next.estado === 'completado') {
        router.push(`/simulacros/${params.id}/results`)
        return
      }

      const storedAnswers = next.respuestas_parciales ?? {}
      const storedActive = readActive(next.id)
      answersRef.current = storedAnswers
      savedSnapshotRef.current = JSON.stringify(storedAnswers)
      setAnswers(storedAnswers)
      if (storedActive !== null && storedActive < next.bloques.length) setActive(storedActive)
      setRecord(next)

      // time_segments (pausar y continuar): mismo modelo que
      // app/simulacros/[id]/page.tsx. La práctica parcial no tiene pantalla
      // de "empezar" — si la sesión todavía no tiene ningún tramo (recién
      // creada, o de antes de "pausar y continuar"), se abre el primero
      // aquí mismo contra el servidor, en vez de fiarse solo del reloj local
      // de created_at, que no sobrevive a una pausa.
      const resultadoJson = (next.resultado_json && typeof next.resultado_json === 'object' && !Array.isArray(next.resultado_json))
        ? next.resultado_json as Record<string, unknown>
        : {}
      const segments = isValidSegments(resultadoJson.time_segments) ? resultadoJson.time_segments : []
      const openSeg = segments.find(s => s.endedAt === null) ?? null
      const closedSeconds = totalElapsedSeconds(segments.filter(s => s.endedAt !== null))

      if (openSeg) {
        const openStart = Date.parse(openSeg.startedAt)
        const start = Number.isFinite(openStart) ? openStart : Date.now()
        setClosedElapsedSeconds(closedSeconds)
        setStartedAtMs(start)
        setSecondsLeft(Math.max(0, TOTAL_SECONDS - closedSeconds - Math.floor((Date.now() - start) / 1000)))
        return
      }
      if (segments.length > 0) {
        // Todos los tramos están cerrados: en pausa.
        setClosedElapsedSeconds(closedSeconds)
        setStartedAtMs(null)
        setSecondsLeft(Math.max(0, TOTAL_SECONDS - closedSeconds))
        return
      }

      // Sin tramos todavía: abre el primero ahora mismo.
      try {
        const res = await fetch('/api/simulacro/timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ simulacroId: next.id, action: 'resume' }),
        })
        const json = await safeJson(res)
        const openedSegments: TimeSegment[] = isValidSegments(json?.segments) ? json.segments : []
        const opened = openedSegments.find(s => s.endedAt === null) ?? null
        const openStart = opened ? Date.parse(opened.startedAt) : NaN
        if (res.ok && Number.isFinite(openStart)) {
          setClosedElapsedSeconds(0)
          setStartedAtMs(openStart)
          setSecondsLeft(Math.max(0, TOTAL_SECONDS - Math.floor((Date.now() - openStart) / 1000)))
          return
        }
      } catch { /* fallback below */ }

      // Fallback si el servidor falla: reloj local desde created_at, como
      // antes de "pausar y continuar", para no bloquear la práctica.
      const fallbackStart = new Date(next.created_at ?? Date.now()).getTime()
      setStartedAtMs(fallbackStart)
      setSecondsLeft(Math.max(0, TOTAL_SECONDS - Math.floor((Date.now() - fallbackStart) / 1000)))
    })
  }, [params.id, router, searchParams])

  useEffect(() => {
    if (!record || submitting || !startedAtMs) return
    const timer = window.setInterval(() => {
      const next = Math.max(0, TOTAL_SECONDS - closedElapsedSeconds - Math.floor((Date.now() - startedAtMs) / 1000))
      setSecondsLeft(next)
      if (next === 0) {
        window.clearInterval(timer)
        setTimeUp(true)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [record, submitting, startedAtMs, closedElapsedSeconds])

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
  const elapsedMinutes = Math.max(0, Math.ceil((TOTAL_SECONDS - secondsLeft) / 60))
  const percentLeft = Math.max(0, Math.min(1, secondsLeft / TOTAL_SECONDS))
  const isUrgent = secondsLeft <= 15 * 60
  const isWarning = secondsLeft <= 45 * 60 && secondsLeft > 15 * 60
  const timerColor = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#2563eb'
  const ringOffset = RING_CIRC * (1 - percentLeft)
  // En pausa: ya hay una sesión cargada pero no hay ningún tramo abierto
  // ahora mismo (se cerró al pulsar "Pausar").
  const isPaused = Boolean(record) && startedAtMs === null

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
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

  // Reanudar abre un tramo nuevo en el servidor. Si ya no se puede
  // continuar (ver MAX_RESUME_DAYS en app/lib/simulacros/timeSegments.ts),
  // el servidor devuelve 410 con un mensaje claro en vez de dejar continuar
  // silenciosamente.
  async function resumePractice() {
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
        setResumeError(json?.message ?? 'No hemos podido continuar la práctica ahora mismo. Inténtalo de nuevo.')
        return
      }
      setStartedAtMs(Date.now())
      setTimeUp(false)
    } catch {
      setResumeError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setResuming(false)
    }
  }

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
    if (record) writeActive(record.id, index)
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
      setSubmitStage('Corrigiendo con Kairo...')

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setSubmitError('Tu sesión ha caducado. Vuelve a iniciar sesión.')
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
          simulacro_id: record.id,
        }),
      })

      const result = await safeJson(res)

      if (!res.ok || result?.correction_error) {
        const noResultSave = result?.code === RATE_LIMIT_CODE || result?.code === BILLING_BLOCK_CODE
        const updatePayload = noResultSave
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

      // El servidor ya recalculó tiempo_empleado_minutos a partir de
      // resultado_json.time_segments (suma real de los tramos trabajados,
      // sin contar las pausas) — se prefiere ese valor sobre elapsedMinutes
      // (reloj local) para que esta escritura redundante no lo pise.
      const authoritativeElapsed = typeof result?.tiempo_empleado_minutos === 'number' ? result.tiempo_empleado_minutos : elapsedMinutes

      await supabase.from('historial_simulacros').update({
        resultado_json: { ...result, __practice_session: true },
        nota_final: result?.nota_final ?? null,
        estado: 'completado',
        tiempo_empleado: authoritativeElapsed,
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

  // Pantalla distinta para "en pausa" — deja claro que no es una sesión
  // nueva ni una ya completada, y que se puede retomar justo donde se dejó.
  if (isPaused) {
    const usedMinutes = Math.max(0, Math.round(closedElapsedSeconds / 60))
    return (
      <SimulacroShell
        title={blockLabel ? `Práctica de ${blockLabel} · Parcial` : 'Práctica dirigida'}
        subtitle="En pausa · continúa cuando quieras"
      >
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="pau-card-section" style={{ padding: '40px 32px' }}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
              style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
            >
              <Pause size={12} /> En pausa
            </span>
            <h2 className="mt-4 text-2xl font-black" style={{ color: '#0f172a' }}>
              Tu práctica está en pausa
            </h2>
            <p className="mt-2 text-sm font-semibold" style={{ color: '#64748b' }}>
              Ya llevas {usedMinutes} min trabajados y tus respuestas están guardadas. Continúa justo donde lo dejaste.
            </p>
            <div className="mt-5 text-4xl font-black" style={{ color: '#2563eb' }}>
              {formatTime(secondsLeft)}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              tiempo restante
            </div>
            {resumeError && <div className="pau-info mt-4" role="alert">{resumeError}</div>}
            <button
              onClick={() => void resumePractice()}
              disabled={resuming}
              className="campus-primary mt-6"
              style={{ padding: '12px 28px', borderRadius: 12, opacity: resuming ? 0.7 : 1 }}
            >
              {resuming ? 'Un momento...' : 'Continuar práctica →'}
            </button>
          </div>
        </div>
      </SimulacroShell>
    )
  }

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

            {/* Circular ring timer — mismo componente/estilo que app/simulacros/[id]/page.tsx */}
            <div
              className={`relative flex-shrink-0 ${isUrgent ? 'sim-ring-urgent' : ''}`}
              aria-label={`Tiempo restante: ${formatTime(secondsLeft)}`}
            >
              <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
                <circle cx="56" cy="56" r={RING_RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="7" />
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

          {/* Timer progress bar — mismo estilo que app/simulacros/[id]/page.tsx */}
          <div className="mt-2 pau-progress-bar">
            <div
              className="pau-progress-fill"
              style={{
                transform: `scaleX(${percentLeft})`,
                background: `linear-gradient(90deg, ${timerColor}, ${timerColor}cc)`,
                transition: 'transform 1s linear, background 600ms ease',
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
          const activeMobileTab = mobileTab[block.id] ?? 'leer'
          return (
            <section key={block.id} className={active === index ? 'grid gap-4 pau-reveal' : 'hidden'}>

              {/* Selector Leer/Responder — solo en móvil (md:hidden), desktop sigue mostrando ambos paneles apilados */}
              {!bloqueIncompleto && (
                <div className="flex gap-2 md:hidden">
                  {([
                    { key: 'leer' as const, label: 'Leer enunciado' },
                    { key: 'responder' as const, label: 'Responder' },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setMobileTab(prev => ({ ...prev, [block.id]: tab.key }))}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition"
                      style={{
                        background: activeMobileTab === tab.key ? cfg.color : '#f1f5f9',
                        color: activeMobileTab === tab.key ? '#fff' : '#475569',
                        boxShadow: activeMobileTab === tab.key ? `0 8px 20px ${cfg.color}30` : 'none',
                        border: 'none',
                        transition: 'all 180ms var(--ease-out)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={`pau-card-section ${!bloqueIncompleto && activeMobileTab === 'responder' ? 'hidden md:block' : ''}`}>
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
                <div className={`pau-card-section ${activeMobileTab === 'leer' ? 'hidden md:block' : ''}`}>
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
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => void handleImage(block.id, event.target.files?.[0])} />
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

      {/* Confirm / Time Up modal */}
      {(confirmOpen || timeUp) && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 'var(--z-modal-bg)', background: 'rgba(15,23,42,0.52)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="pau-reveal-scale w-full max-w-md"
            style={{ background: '#fff', borderRadius: 22, border: '1px solid var(--pau-border)', boxShadow: 'var(--shadow-xl)', padding: 28 }}
          >
            <div className="mb-3 flex items-center gap-3">
              {timeUp
                ? <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
                : <CheckCircle2 size={22} style={{ color: cfg.color }} />}
              <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
                {timeUp ? 'Tiempo agotado' : '¿Entregar la práctica?'}
              </h2>
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
              <button
                onClick={() => { setConfirmOpen(false); setTimeUp(false) }}
                disabled={submitting}
                className="pau-button-secondary"
                style={{ padding: '10px 20px' }}
              >
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

// Misma convención de clave que app/simulacros/[id]/page.tsx (kairo:simulacro:<id>:...)
// — sin esto, pausar y reanudar guardaba bien respuestas y tiempo, pero
// siempre reabría la pregunta 1 en vez de la que se estaba respondiendo.
function activeKey(id: string) {
  return `kairo:simulacro:${id}:active`
}

function readActive(id: string) {
  try {
    const value = window.localStorage.getItem(activeKey(id))
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? number : null
  } catch {
    return null
  }
}

function writeActive(id: string, index: number) {
  try {
    window.localStorage.setItem(activeKey(id), String(index))
  } catch {
    // Local storage is best-effort only.
  }
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0')
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

export default function PracticaPage() {
  return (
    <Suspense fallback={<KairoSpinner />}>
      <PracticaPageInner />
    </Suspense>
  )
}
