'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Route, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import {
  DEFAULT_SUBJECTS,
  isOnboardingComplete,
  markOnboardingComplete,
  saveOnboarding,
  startModeToRouteId,
  type OnboardingCommunity,
  type OnboardingDailyMinutes,
  type OnboardingStartMode,
} from '@/app/lib/onboarding/onboardingStorage'
import { getMissionForDate } from '@/app/lib/camino/caminoMissionGenerator'
import { todayKey } from '@/app/lib/camino/caminoProgress'
import type { DailyCaminoTask } from '@/app/lib/camino/caminoData'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase =
  | 'already-done'
  | 'step-community'
  | 'step-subjects'
  | 'step-time'
  | 'step-start'
  | 'generating'
  | 'first-mission'
  | 'tiny-win'
  | 'done'

// ─── Onboarding first mission tasks ──────────────────────────────────────────
// These 3 lightweight tasks are hardcoded for the activation experience.
// They use the complete-task API just like normal missions.
const ONBOARDING_TASKS: DailyCaminoTask[] = [
  {
    id: 'ob-flash-1',
    title: '3 flashcards de activación',
    type: 'flashcard',
    xp: 15,
    subject: 'Matemáticas II',
    subjectKey: 'mates',
    detail: 'Repasa conceptos clave: derivada, integral y límite. 30 segundos.',
    actionLabel: 'Empezar',
    actionHref: '/?subject=mates',
  },
  {
    id: 'ob-test-1',
    title: 'Mini check: 1 pregunta tipo test',
    type: 'test',
    xp: 10,
    subject: 'Historia de España',
    subjectKey: 'historia',
    detail: '¿Qué sistema político caracteriza al Antiguo Régimen?\nA) Monarquía parlamentaria  B) Monarquía absoluta  C) República constitucional',
    actionLabel: 'Responder',
    actionHref: '/?subject=historia',
  },
  {
    id: 'ob-open-1',
    title: 'Respuesta corta de práctica',
    type: 'correccion_ia',
    xp: 30,
    subject: 'Matemáticas II',
    subjectKey: 'mates',
    detail: 'En una frase: ¿qué significa que una función sea derivable en un punto?',
    actionLabel: 'Escribir respuesta',
    actionHref: '/?subject=mates',
  },
]

const OPEN_TASK_FEEDBACK = 'Respuesta guardada. En las próximas fases Pausia corregirá este tipo de respuestas con rúbricas detalladas.'

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const router = useRouter()
  const billing = useBillingStatus()
  const today = todayKey()
  const accessTokenRef = useRef<string | null>(null)

  const [phase, setPhase] = useState<Phase>('step-community')
  const [community, setCommunity] = useState<OnboardingCommunity | null>(null)
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS)
  const [dailyMinutes, setDailyMinutes] = useState<OnboardingDailyMinutes | null>(null)
  const [startMode, setStartMode] = useState<OnboardingStartMode | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const [openAnswer, setOpenAnswer] = useState('')
  const [openFeedback, setOpenFeedback] = useState<string | null>(null)
  const [submittingTask, setSubmittingTask] = useState<string | null>(null)
  const [setupWarning, setSetupWarning] = useState<string | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)

  useEffect(() => {
    if (isOnboardingComplete()) setPhase('already-done')
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      accessTokenRef.current = session?.access_token ?? null
    })
  }, [])

  // ─── Navigation helpers ───────────────────────────────────────────────────
  function nextFromCommunity() {
    if (!community) return
    saveOnboarding({ community })
    setPhase('step-subjects')
  }

  function nextFromSubjects() {
    saveOnboarding({ subjects })
    setPhase('step-time')
  }

  function nextFromTime() {
    if (!dailyMinutes) return
    saveOnboarding({ dailyMinutes })
    setPhase('step-start')
  }

  async function nextFromStart() {
    if (!startMode) return
    const routeId = startModeToRouteId(startMode)
    saveOnboarding({ startMode })
    setPhase('generating')

    // Save to Supabase if authenticated
    const token = accessTokenRef.current
    if (token) {
      try {
        const res = await fetch('/api/onboarding/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ routeId, community, dailyMinutes, startMode })
        })
        if (!res.ok) {
          setSetupWarning('Tu ruta se guardó localmente. El servidor no está disponible en este momento.')
        }
      } catch {
        setSetupWarning('Sin conexión. Tu ruta se guardó localmente y se sincronizará al reconectar.')
      }
    }

    setTimeout(() => setPhase('first-mission'), 2400)
  }

  // ─── Task completion ──────────────────────────────────────────────────────
  const completeTask = useCallback(async (task: DailyCaminoTask) => {
    if (completedTaskIds.includes(task.id) || submittingTask) return

    // For open answer task, require some input
    if (task.id === 'ob-open-1') {
      if (!openAnswer.trim()) return
      setOpenFeedback(OPEN_TASK_FEEDBACK)
    }

    setSubmittingTask(task.id)
    setTaskError(null)

    // Optimistic checkmark (no XP yet for authenticated users)
    setCompletedTaskIds(prev => [...prev, task.id])

    const token = accessTokenRef.current

    if (!token) {
      // Local-only mode — add XP immediately
      setXpEarned(prev => prev + task.xp)
    } else {
      try {
        const res = await fetch('/api/camino/complete-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            taskId: task.id,
            taskType: task.type,
            subjectKey: task.subjectKey ?? null,
            missionDate: today,
            missionTaskIds: ONBOARDING_TASKS.map(t => t.id)
          })
        })
        if (res.ok) {
          setXpEarned(prev => prev + task.xp)
        } else {
          setTaskError('No se pudo guardar la tarea. Inténtalo de nuevo o continúa.')
        }
      } catch {
        setTaskError('Error de conexión al guardar. Continúa igualmente.')
      }
    }

    setSubmittingTask(null)

    // All done → tiny win
    const newCompleted = [...completedTaskIds, task.id]
    if (ONBOARDING_TASKS.every(t => newCompleted.includes(t.id))) {
      setTimeout(() => {
        markOnboardingComplete()
        setPhase('tiny-win')
      }, 600)
    }
  }, [completedTaskIds, submittingTask, openAnswer, today])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-start justify-center bg-[radial-gradient(circle_at_20%_8%,rgba(219,234,254,0.9),transparent_30%),linear-gradient(135deg,#fbfdff_0%,#eff6ff_100%)] px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo mark */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]">
            <Route size={20} strokeWidth={2.4} />
          </div>
          <span className="text-lg font-black text-slate-900">Pausia</span>
        </div>

        {/* Step progress dots */}
        {['step-community', 'step-subjects', 'step-time', 'step-start'].includes(phase) && (
          <StepDots current={
            phase === 'step-community' ? 0 :
            phase === 'step-subjects' ? 1 :
            phase === 'step-time' ? 2 : 3
          } total={4} />
        )}

        {/* ── ALREADY DONE ────────────────────────────────────────────── */}
        {phase === 'already-done' && (
          <Card>
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]">
                <Route size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Ya tienes tu Camino PAU creado</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">Tu ruta y primera misión ya están activas.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/camino')}
                className="campus-primary w-full"
                style={{ padding: '13px 20px', borderRadius: 14, fontSize: 14, gap: 8 }}
              >
                Ver mi Camino <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => setPhase('step-community')}
                className="text-xs font-semibold text-slate-400 underline underline-offset-2 hover:text-slate-600"
              >
                Repetir onboarding
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 1: Community ───────────────────────────────────────── */}
        {phase === 'step-community' && (
          <Card>
            <h1 className="text-2xl font-black text-slate-950">Crea tu Camino PAU</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Dinos tu comunidad autónoma para adaptar tu ruta oficial.</p>
            <div className="mt-6 grid gap-3">
              {(['Madrid', 'Cataluña', 'Andalucía', 'Otra'] as OnboardingCommunity[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCommunity(c)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    community === c
                      ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      : 'border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60'
                  }`}
                >
                  {c}
                  {c === 'Otra' && community === 'Otra' && (
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Usaremos la Ruta Troncal PAU, centrada en el temario común.
                    </p>
                  )}
                </button>
              ))}
            </div>
            <PrimaryButton disabled={!community} onClick={nextFromCommunity}>
              Continuar <ArrowRight size={15} />
            </PrimaryButton>
          </Card>
        )}

        {/* ── STEP 2: Subjects ────────────────────────────────────────── */}
        {phase === 'step-subjects' && (
          <Card>
            <h1 className="text-2xl font-black text-slate-950">Tus asignaturas PAU</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Las misiones se centran en estas tres. Puedes ajustarlo más adelante.</p>
            <div className="mt-6 grid gap-3">
              {DEFAULT_SUBJECTS.map(s => {
                const selected = subjects.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubjects(selected ? subjects.filter(x => x !== s) : [...subjects, s])}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      selected
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-blue-200'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition ${selected ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-200 bg-white'}`}>
                      {selected && '✓'}
                    </div>
                    {s}
                  </button>
                )
              })}
            </div>
            <PrimaryButton disabled={subjects.length === 0} onClick={nextFromSubjects}>
              Continuar <ArrowRight size={15} />
            </PrimaryButton>
          </Card>
        )}

        {/* ── STEP 3: Daily time ──────────────────────────────────────── */}
        {phase === 'step-time' && (
          <Card>
            <h1 className="text-2xl font-black text-slate-950">¿Cuánto tiempo tienes al día?</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Pausia te preparará misiones que encajen en tu rutina.</p>
            <div className="mt-6 grid gap-3">
              {([15, 25, 40] as OnboardingDailyMinutes[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDailyMinutes(m)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    dailyMinutes === m
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60'
                  }`}
                >
                  <span>{m} min</span>
                  {m === 25 && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black text-blue-700">Recomendado</span>
                  )}
                </button>
              ))}
            </div>
            <PrimaryButton disabled={!dailyMinutes} onClick={nextFromTime}>
              Continuar <ArrowRight size={15} />
            </PrimaryButton>
          </Card>
        )}

        {/* ── STEP 4: Start mode ──────────────────────────────────────── */}
        {phase === 'step-start' && (
          <Card>
            <h1 className="text-2xl font-black text-slate-950">¿Desde dónde empiezas?</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Pausia ajustará la semana del currículum para que la ruta tenga sentido.</p>
            <div className="mt-6 grid gap-3">
              {([
                { id: 'septiembre', label: 'Desde septiembre', desc: 'Empiezo con margen, ruta completa' },
                { id: 'empezado',   label: 'Ya he empezado',   desc: 'Llevo algo de base, ajustamos el ritmo' },
                { id: 'retraso',    label: 'Voy con retraso',  desc: 'Priorizamos lo que más impacta en nota' },
                { id: 'intensivo',  label: 'Modo intensivo',   desc: 'Poco tiempo, foco máximo en el examen' },
              ] as { id: OnboardingStartMode; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStartMode(opt.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    startMode === opt.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/60'
                  }`}
                >
                  <p className={`text-sm font-black ${startMode === opt.id ? 'text-blue-800' : 'text-slate-800'}`}>{opt.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
            <PrimaryButton disabled={!startMode} onClick={nextFromStart}>
              Crear mi primera misión gratis <ArrowRight size={15} />
            </PrimaryButton>
          </Card>
        )}

        {/* ── GENERATING ──────────────────────────────────────────────── */}
        {phase === 'generating' && (
          <Card>
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_12px_32px_rgba(37,99,235,0.28)]">
                <Route size={30} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Creando tu Camino PAU…</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">Un momento</p>
              </div>
              <div className="w-full space-y-3 text-left">
                {[
                  'Ruta adaptada a tu comunidad',
                  'Misiones diarias hasta la PAU',
                  'Repaso inteligente de errores',
                ].map((item, i) => (
                  <GeneratingCheck key={item} label={item} delay={i * 600} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── FIRST MISSION ───────────────────────────────────────────── */}
        {phase === 'first-mission' && (
          <div className="space-y-5">
            <Card>
              <p className="text-xs font-bold text-slate-400">Tu primera misión</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Activación · Semana 1</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                3 tareas cortas para calibrar tu punto de partida. Sin presión.
              </p>
              <div className="pau-progress-bar mt-4">
                <div className="pau-progress-fill" style={{ width: `${Math.round((completedTaskIds.length / ONBOARDING_TASKS.length) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {completedTaskIds.length}/{ONBOARDING_TASKS.length} completadas
              </p>
            </Card>

            {setupWarning && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
                {setupWarning}
              </div>
            )}
            {taskError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
                {taskError}
              </div>
            )}

            {ONBOARDING_TASKS.map(task => (
              <OnboardingTaskCard
                key={task.id}
                task={task}
                completed={completedTaskIds.includes(task.id)}
                onComplete={completeTask}
                openAnswer={openAnswer}
                onOpenAnswerChange={setOpenAnswer}
                openFeedback={task.id === 'ob-open-1' ? openFeedback : null}
                loading={submittingTask === task.id}
              />
            ))}

            {completedTaskIds.length > 0 && completedTaskIds.length < ONBOARDING_TASKS.length && (
              <p className="text-center text-xs font-semibold text-blue-600">
                +{xpEarned} XP ganados hasta ahora · Sigue completando
              </p>
            )}
          </div>
        )}

        {/* ── TINY WIN + DONE ─────────────────────────────────────────── */}
        {(phase === 'tiny-win' || phase === 'done') && (
          <div className="space-y-5">
            {/* XP celebration */}
            <Card>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-[0_8px_24px_rgba(251,191,36,0.3)]">
                  <Zap size={26} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-950">+{xpEarned} XP</p>
                  <p className="mt-1 text-lg font-black text-slate-800">Primera misión completada</p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">Tu Camino ya no empieza desde cero</p>
                </div>
              </div>
            </Card>

            {/* Soft diagnosis */}
            <Card>
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-black text-slate-900">Diagnóstico inicial en progreso</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    Pausia todavía está calibrando tu ruta. Completa 3 misiones para desbloquear tu primer diagnóstico inicial.
                  </p>
                </div>
              </div>
            </Card>

            {/* Parent CTA */}
            <Card>
              <p className="mb-3 text-xs font-bold text-slate-400">Tu Camino PAU está creado</p>
              <ParentLinkModule billing={billing} />
            </Card>

            {/* CTA to /camino */}
            <button
              type="button"
              onClick={() => router.push('/camino')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              Ver mi Camino completo <ArrowRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 20, border: '1px solid var(--pau-border)', background: '#fff', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      {children}
    </div>
  )
}

function PrimaryButton({
  children, onClick, disabled
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="campus-primary mt-6 w-full"
      style={{ padding: '13px 20px', borderRadius: 14, fontSize: 14, gap: 8 }}
    >
      {children}
    </button>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-6 bg-blue-600' :
            i === current ? 'w-6 bg-blue-400' :
            'w-3 bg-slate-200'
          }`}
        />
      ))}
      <span className="ml-2 text-xs font-bold text-slate-400">{current + 1} / {total}</span>
    </div>
  )
}

function GeneratingCheck({ label, delay }: { label: string; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  )
}

interface OnboardingTaskCardProps {
  task: DailyCaminoTask
  completed: boolean
  onComplete: (task: DailyCaminoTask) => void
  openAnswer: string
  onOpenAnswerChange: (v: string) => void
  openFeedback: string | null
  loading: boolean
}

function OnboardingTaskCard({
  task, completed, onComplete, openAnswer, onOpenAnswerChange, openFeedback, loading
}: OnboardingTaskCardProps) {
  const isOpenTask = task.id === 'ob-open-1'

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${completed ? '#bbf7d0' : 'var(--pau-border)'}`,
      background: completed ? 'rgba(240,253,244,0.8)' : '#fff',
      padding: 16,
      transition: 'border-color 180ms var(--ease-out)',
    }}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={completed || loading}
          onClick={() => !isOpenTask && onComplete(task)}
          aria-label={completed ? `${task.title} completada` : `Completar ${task.title}`}
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none ${
            completed
              ? 'border-emerald-300 bg-emerald-600 text-white'
              : 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-300'
          }`}
        >
          {completed ? <CheckCircle2 size={18} /> : <span className="text-xs font-black">○</span>}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700">{task.type.replace(/_/g, ' ')}</span>
            <span className="flex items-center gap-1 text-[11px] font-black text-amber-600">
              <Sparkles size={11} />{task.xp} XP
            </span>
            {completed && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-700">Completada</span>}
          </div>
          <h3 className="mt-2 text-sm font-black text-slate-900">{task.title}</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 whitespace-pre-line">{task.detail}</p>

          {/* Open answer input */}
          {isOpenTask && !completed && (
            <div className="mt-3 space-y-2">
              <textarea
                value={openAnswer}
                onChange={e => onOpenAnswerChange(e.target.value)}
                placeholder="Escribe tu respuesta aquí (1-2 frases)…"
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <button
                type="button"
                disabled={!openAnswer.trim() || loading}
                onClick={() => onComplete(task)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-40"
              >
                {loading ? 'Guardando…' : 'Guardar respuesta'}
              </button>
            </div>
          )}

          {/* Open answer feedback */}
          {openFeedback && (
            <p className="mt-2 text-xs font-semibold text-slate-400 italic">{openFeedback}</p>
          )}
        </div>
      </div>
    </div>
  )
}
