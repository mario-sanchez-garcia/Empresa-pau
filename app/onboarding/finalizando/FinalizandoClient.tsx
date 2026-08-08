'use client'

import { Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { validateUsername } from '@/app/lib/username'
import { loadLocalDraft, clearLocalDraft } from '@/app/lib/onboarding/onboardingDraftStorage'
import { clearOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { clearQueuedEvents } from '@/app/lib/onboarding/onboardingEventQueue'
import { sendOnboardingEvent, flushQueuedOnboardingEvents } from '@/app/lib/onboarding/onboardingEvents'
import { buildPersonalizedLoadingMessages } from '@/app/lib/onboarding/personalizedLoadingMessages'
import KairoLoadingMark from '@/app/components/onboarding/KairoLoadingMark'

type ProcessingStage = 'validating' | 'saving_profile' | 'building_queue' | 'generating_calendar' | 'verifying_calendar' | 'completed' | 'failed' | null

const STAGE_LABELS: Record<string, string> = {
  validating: 'Comprobando tu preparación',
  saving_profile: 'Guardando tu configuración',
  building_queue: 'Organizando tus prioridades',
  generating_calendar: 'Construyendo tus primeras misiones',
  verifying_calendar: 'Comprobando que todo está listo',
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_draft: 'No hemos encontrado tu preparación. Vuelve a completarla — no debería llevarte más de un minuto.',
  draft_expired: 'Tu preparación caducó. Vuelve a completar el onboarding para generar tu Camino.',
  draft_claim_conflict: 'Este enlace ya se usó desde otra cuenta. Inicia sesión con la cuenta correcta.',
  username_taken: 'Ese nombre acaba de ser utilizado. Elige otro para continuar.',
  profile_save_failed: 'No hemos podido guardar tu perfil.',
  queue_generation_failed: 'No hemos podido terminar de construir tu Camino.',
  calendar_generation_failed: 'No hemos podido terminar de construir tu Camino.',
  calendar_verification_failed: 'No hemos podido terminar de construir tu Camino.',
  internal_error: 'Algo fue mal. Contacta con soporte en hola@kairo.es',
}

interface RewardMission {
  title: string
  subject: string
  scheduledDate: string
  missionType: string
  durationMinutes: number
  xp: number
  supportsStepCorrection: boolean
}

interface Reward {
  title: string
  missions: RewardMission[]
  mirrorMessage: string | null
  mirrorBadge: string | null
}

function FinalizandoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [phase, setPhase] = useState<'checking' | 'processing' | 'completed' | 'failed' | 'no_draft' | 'no_session'>('checking')
  const [stage, setStage] = useState<ProcessingStage>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [msgIdx, setMsgIdx] = useState(0)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalizeEventFiredRef = useRef(false)

  const localDraft = typeof window !== 'undefined' ? loadLocalDraft() : null
  const loadingMessages = buildPersonalizedLoadingMessages({
    community: localDraft?.community ?? null,
    subjects: localDraft?.subjects ?? [],
    studentExams: (localDraft?.upcomingExams ?? []).map(e => ({ subject: e.subject, date: e.date })),
    weeklyStudyDaysValue: localDraft?.studyDays ?? null,
    dailyMinutes: localDraft?.minutesPerSession ?? null,
  })

  useEffect(() => {
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % Math.max(1, loadingMessages.length)), 2200)
    return () => clearInterval(interval)
  }, [loadingMessages.length])

  async function getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function onCompleted(rewardData: Reward) {
    stopPolling()
    setReward(rewardData)
    setPhase('completed')
    // Solo AHORA, con el Camino verificado, se limpia todo lo que ya no
    // hace falta — nunca antes (ver AGENTS.md / plan Fase 2 §24).
    clearOnboarding()
    clearLocalDraft()
    clearQueuedEvents()
  }

  function onFailed(code: string) {
    stopPolling()
    setErrorCode(code)
    setPhase('failed')
    if (code === 'username_taken') {
      setUsernameInput(localDraft?.username ?? '')
    }
  }

  async function runFinalize() {
    if (!draftId) { setPhase('no_draft'); return }
    const token = await getToken()
    if (!token) { setPhase('no_session'); return }

    if (!finalizeEventFiredRef.current) {
      finalizeEventFiredRef.current = true
      void sendOnboardingEvent(localDraft?.traceId ?? null, 'onboarding_finalize_started', {})
    }

    try {
      const res = await fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draft_id: draftId }),
      })
      const json = await res.json()
      if (json.status === 'completed') {
        onCompleted(json.reward)
      } else if (json.status === 'processing') {
        setStage(json.processing_stage ?? null)
        setPhase('processing')
        startPolling(token)
      } else {
        onFailed(json.error_code ?? 'internal_error')
      }
    } catch {
      onFailed('internal_error')
    }
  }

  function startPolling(token: string) {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/onboarding/status?draft=${encodeURIComponent(draftId ?? '')}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.status === 'completed') {
          onCompleted(json.reward)
        } else if (json.status === 'failed') {
          onFailed(json.last_error_code ?? 'internal_error')
        } else {
          setStage(json.processing_stage ?? null)
        }
      } catch {
        // Red caída durante el polling: se reintenta en el siguiente tick,
        // nunca se marca failed solo por un fallo de red puntual.
      }
    }, 1500)
  }

  useEffect(() => {
    void (async () => {
      const token = await getToken()
      if (token) void flushQueuedOnboardingEvents(token)
      void runFinalize()
    })()
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId])

  async function handleRetry() {
    setPhase('checking')
    setErrorCode(null)
    void sendOnboardingEvent(localDraft?.traceId ?? null, 'onboarding_finalize_resumed', {})
    await runFinalize()
  }

  async function handleUsernameRetry() {
    setUsernameError('')
    const validation = validateUsername(usernameInput.trim())
    if (validation) { setUsernameError(validation); return }
    setUsernameSaving(true)
    try {
      const token = await getToken()
      if (!token || !draftId) { setUsernameError('No se pudo confirmar tu sesión.'); setUsernameSaving(false); return }
      const res = await fetch('/api/onboarding/draft/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draft_id: draftId, username: usernameInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setUsernameError(json.error ?? 'No se pudo actualizar tu nombre de usuario.')
        setUsernameSaving(false)
        return
      }
      setUsernameSaving(false)
      setPhase('checking')
      void sendOnboardingEvent(localDraft?.traceId ?? null, 'onboarding_finalize_resumed', {})
      await runFinalize()
    } catch {
      setUsernameError('Error de conexión. Inténtalo de nuevo.')
      setUsernameSaving(false)
    }
  }

  // ── no draft / no session ──────────────────────────────────────────────
  if (phase === 'no_draft' || phase === 'no_session') {
    return (
      <Screen>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', maxWidth: 380, textAlign: 'center', lineHeight: 1.6 }}>
          {phase === 'no_draft'
            ? 'Nos falta información de tu preparación.'
            : 'No hemos podido confirmar tu sesión.'}
        </p>
        <button onClick={() => router.push('/onboarding')} style={primaryBtnStyle}>
          Volver al onboarding
        </button>
      </Screen>
    )
  }

  // ── completed: reward real ─────────────────────────────────────────────
  if (phase === 'completed' && reward) {
    return (
      <Screen>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: '#111' }}>✓</span>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: '#fff', letterSpacing: '.02em', textAlign: 'center' }}>{reward.title}</div>

        {reward.mirrorMessage && (
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.75)', textAlign: 'center', maxWidth: 360, margin: 0 }}>{reward.mirrorMessage}</p>
        )}
        {reward.mirrorBadge && (
          <span style={{ padding: '5px 12px', border: '1px solid rgba(37,99,235,.35)', background: 'rgba(37,99,235,.12)', borderRadius: 999, fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: '#60a5fa' }}>{reward.mirrorBadge}</span>
        )}

        {reward.missions.length > 0 && (
          <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {reward.missions.map((mission, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', textAlign: 'left' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 3 }}>{mission.subject} · {mission.scheduledDate}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{mission.title}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{mission.durationMinutes} min</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3b82f6' }}>+{mission.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => router.push('/camino')} style={{ ...primaryBtnStyle, marginTop: 12 }}>
          Empezar mi primera misión →
        </button>
        <button onClick={() => router.push('/camino')} style={secondaryBtnStyle}>
          Ver mi semana completa
        </button>
      </Screen>
    )
  }

  // ── failed ───────────────────────────────────────────────────────────
  if (phase === 'failed') {
    if (errorCode === 'username_taken') {
      return (
        <Screen>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f87171', textAlign: 'center', maxWidth: 380 }}>
            {ERROR_MESSAGES.username_taken}
          </p>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20))}
              placeholder="tu_usuario"
              style={{ padding: '12px 14px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }}
            />
            {usernameError && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{usernameError}</p>}
            <button onClick={handleUsernameRetry} disabled={usernameSaving} style={primaryBtnStyle}>
              {usernameSaving ? 'Guardando…' : 'Continuar con este nombre'}
            </button>
          </div>
        </Screen>
      )
    }
    return (
      <Screen>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#f87171', textAlign: 'center', maxWidth: 380 }}>
          {ERROR_MESSAGES[errorCode ?? 'internal_error'] ?? ERROR_MESSAGES.internal_error}
        </p>
        <button onClick={handleRetry} style={primaryBtnStyle}>Reintentar</button>
      </Screen>
    )
  }

  // ── checking / processing: estado real ──────────────────────────────
  return (
    <Screen>
      <KairoLoadingMark />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 24 }}>
        Estamos construyendo tu Camino
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 6 }}>
        {stage && STAGE_LABELS[stage] ? STAGE_LABELS[stage] : 'Comprobando tu preparación'}
      </div>
      {loadingMessages.length > 0 && (
        <p style={{ fontSize: 12, color: '#475569', marginTop: 4, minHeight: 18 }}>{loadingMessages[msgIdx]}</p>
      )}
      <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginTop: 16 }}>
        <div style={{ height: '100%', background: '#2563eb', animation: 'onb-bar-save 6s ease-out forwards' }} />
      </div>
      <style>{`@keyframes onb-bar-save{0%{width:0}100%{width:80%}}`}</style>
    </Screen>
  )
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16, padding: 24 }}>
      {children}
    </div>
  )
}

const primaryBtnStyle: CSSProperties = { padding: '12px 32px', background: '#fff', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer' }
const secondaryBtnStyle: CSSProperties = { background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }

export default function FinalizandoClient() {
  return (
    <Suspense>
      <FinalizandoContent />
    </Suspense>
  )
}
