'use client'

// Confirmación del registro por email mediante CÓDIGO, dentro de la app.
//
// El alumno se queda en Kairo en vez de salir a su correo, abrir un enlace y
// volver — el punto donde más gente se caía del embudo. La verificación la
// hace Supabase (`verifyOtp`) con la anon key desde el navegador: la sesión
// queda persistida por el propio cliente, igual que en el flujo de enlace, y
// no hace falta ninguna ruta nuestra ni el service role.
//
// Dos cosas que esta pantalla NO hace:
//  · No confía en nada que venga del cliente para decidir si el alumno está
//    verificado. Lo único que lo decide es la sesión real de Supabase.
//  · No lleva el email en la URL. Va en sessionStorage, atado a la pestaña
//    del registro; en la URL solo viaja el id opaco del draft.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { SUPPORT_EMAIL } from '@/app/lib/support'
import { clearOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { setLocalDraftId } from '@/app/lib/onboarding/onboardingDraftStorage'
import { sendOnboardingEvent, flushQueuedOnboardingEvents } from '@/app/lib/onboarding/onboardingEvents'
import { resolvePostAuthDestination } from '@/app/lib/onboarding/postAuthDestination'
import {
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  classifyVerifyError,
  clearPendingVerification,
  formatCooldown,
  formatOtpExpiry,
  isCompleteOtpToken,
  loadPendingVerification,
  maskEmail,
  needsNewCode,
  normalizeOtpToken,
  otpExpiryFromEnv,
  resendCooldownRemaining,
  savePendingVerification,
  verifyFailureMessage,
  type PendingVerification,
  type VerifyFailureKind,
} from '@/app/lib/auth/emailVerification'

type Phase = 'checking' | 'ready' | 'verifying' | 'success' | 'no_context'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// La duración real la fija Supabase (Authentication → Email OTP expiry). Sin
// el valor configurado, el copy se queda genérico en vez de prometer un plazo
// que puede no ser el nuestro.
const OTP_EXPIRY_LABEL = formatOtpExpiry(otpExpiryFromEnv(process.env.NEXT_PUBLIC_OTP_EXPIRY_SECONDS))

function VerificarEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [phase, setPhase] = useState<Phase>('checking')
  const [pending, setPending] = useState<PendingVerification | null>(null)
  const [token, setToken] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  // El fallo pide un código NUEVO (caducado, o verificación sin sesión). No
  // adelanta el reenvío —el cooldown real es el del servidor— pero sí dirige
  // al alumno al botón que de verdad resuelve su caso.
  const [needsFreshCode, setNeedsFreshCode] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const viewedFiredRef = useRef(false)
  // Cerrojo SÍNCRONO. `phase` es estado de React y no se actualiza dentro del
  // mismo tick, así que teclear el último dígito y pulsar Enter a la vez podía
  // lanzar dos verifyOtp con el mismo código: Supabase invalida el token en la
  // primera y la segunda pinta un error falso con la sesión ya creada.
  const verifyingRef = useRef(false)

  // El draft SÍ puede ir en la URL: es un id opaco, no dice nada del alumno.
  const draftFromUrl = useMemo(() => {
    const raw = searchParams.get('draft')
    return raw && UUID_RE.test(raw) ? raw : null
  }, [searchParams])

  const traceId = pending?.traceId ?? null

  const goAfterAuth = useCallback(async (draftId: string | null) => {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setPhase('no_context')
      return
    }
    const { destination, draftClaimed } = await resolvePostAuthDestination(draftId, {
      claimDraft: async id => {
        const res = await fetch('/api/onboarding/draft/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ draft_id: id }),
        })
        return res.ok
      },
      fetchOnboardingMe: async () => {
        const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${accessToken}` } })
        return res.ok ? await res.json() : null
      },
    })
    if (draftClaimed && draftId) setLocalDraftId(draftId)
    void flushQueuedOnboardingEvents(accessToken)

    // El onboarding local se descarta porque puede ser de otra cuenta en la
    // misma máquina, y la pantalla de destino reconcilia con el servidor.
    //
    // Con UNA excepción: si traíamos draft y el claim ha fallado, el alumno
    // vuelve a /onboarding y sus respuestas locales son lo único que le evita
    // repetir las once preguntas por un fallo de infraestructura que no es
    // suyo. La sesión ya es válida y el draft del servidor sigue ahí, así que
    // al llegar de nuevo al paso de registro se reintenta el claim solo.
    const claimFailed = Boolean(draftId) && !draftClaimed
    if (!claimFailed) clearOnboarding()
    clearPendingVerification()
    router.replace(destination)
  }, [router])

  // ── Montaje: ¿hace falta verificar algo? ───────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function boot() {
      // Refresh directo o vuelta atrás con la cuenta ya confirmada: no se
      // vuelve a pedir un código que ya no hace falta.
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      if (data.session) {
        await goAfterAuth(draftFromUrl ?? loadPendingVerification()?.draftId ?? null)
        return
      }

      const stored = loadPendingVerification()
      if (!stored) {
        // Sin contexto (pestaña nueva, sessionStorage limpiado, enlace
        // compartido): fallo seguro. No se inventa un email ni se pide un
        // código que no se podría verificar contra nada.
        setPhase('no_context')
        return
      }
      setPending(stored)
      setCooldown(resendCooldownRemaining(stored.lastSentAtMs, Date.now()))
      setPhase('ready')
    }
    void boot()
    return () => { cancelled = true }
  }, [draftFromUrl, goAfterAuth])

  // Telemetría de vista, una sola vez y sin PII.
  useEffect(() => {
    if (phase !== 'ready' || viewedFiredRef.current) return
    viewedFiredRef.current = true
    void sendOnboardingEvent(traceId, 'email_verification_viewed', {})
    inputRef.current?.focus()
  }, [phase, traceId])

  // Cuenta atrás visible del reenvío.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(current => Math.max(0, current - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleVerify(rawToken: string) {
    // El cerrojo se toma ANTES de cualquier await y de tocar estado.
    if (!pending || verifyingRef.current) return
    const code = normalizeOtpToken(rawToken)
    if (!isCompleteOtpToken(code)) {
      setErrorMsg(`El código tiene ${OTP_LENGTH} dígitos.`)
      return
    }
    verifyingRef.current = true
    setErrorMsg('')
    setResendMsg('')
    setPhase('verifying')
    void sendOnboardingEvent(traceId, 'email_verification_submitted', {})

    /** Deja la pantalla lista para otro intento. Solo en fallos recuperables. */
    const failWith = (kind: VerifyFailureKind) => {
      void sendOnboardingEvent(traceId, 'email_verification_failed', { error_code: kind })
      setErrorMsg(verifyFailureMessage(kind))
      setNeedsFreshCode(needsNewCode(kind))
      setPhase('ready')
      setToken('')
      // El cerrojo se libera aquí, al final del camino de error: solo cuando
      // la pantalla vuelve a admitir un intento.
      verifyingRef.current = false
      inputRef.current?.focus()
    }

    let result: Awaited<ReturnType<typeof supabase.auth.verifyOtp>>
    try {
      result = await supabase.auth.verifyOtp({
        email: pending.email,
        token: code,
        type: 'signup',
      })
    } catch {
      failWith('unknown')
      return
    }

    const { data, error } = result

    if (error) {
      failWith(classifyVerifyError(error.message))
      return
    }
    if (!data.session) {
      // Sin error y sin sesión. No podemos afirmar por qué: ni que el código
      // estuviera ya usado, ni que el email quedara verificado. Lo único
      // seguro es que no hay sesión y que repetir el mismo código no va a
      // cambiarlo — el mensaje pide uno nuevo. El cooldown NO se toca: lo
      // gobierna el servidor.
      failWith('no_session')
      return
    }

    void sendOnboardingEvent(traceId, 'email_verification_succeeded', {})
    void sendOnboardingEvent(traceId, 'email_confirmation_completed', {})
    void sendOnboardingEvent(traceId, 'onboarding_signup_completed', { method: 'email' })
    setPhase('success')
    // El cerrojo NO se libera: a partir de aquí estamos resolviendo el destino
    // post-auth y ya no debe poder lanzarse otra verificación. La pantalla se
    // desmonta al redirigir.
    await goAfterAuth(pending.draftId ?? draftFromUrl)
  }

  async function handleResend() {
    if (!pending || resending || cooldown > 0) return
    setResending(true)
    setErrorMsg('')
    setResendMsg('')
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pending.email,
          next: '/onboarding/finalizando',
          draft_id: pending.draftId ?? draftFromUrl,
        }),
      })
      const body = await res.json().catch(() => null) as { error?: string; retryAfterSeconds?: number } | null
      if (!res.ok) {
        // El servidor manda sobre el cooldown: es el que tiene el registro
        // real de envíos (auth_email_attempts), no esta pestaña.
        setCooldown(body?.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS)
        setErrorMsg(body?.error ?? 'No se ha podido reenviar el código.')
        return
      }
      const next = { ...pending, lastSentAtMs: Date.now() }
      setPending(next)
      savePendingVerification(next)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setNeedsFreshCode(false)
      setResendMsg('Te hemos enviado un código nuevo.')
      setToken('')
      inputRef.current?.focus()
      void sendOnboardingEvent(traceId, 'email_verification_resent', {})
    } catch {
      setErrorMsg('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setResending(false)
    }
  }

  function backToSignup() {
    clearPendingVerification()
    router.push('/onboarding')
  }

  // ── Sin contexto suficiente ────────────────────────────────────────────
  if (phase === 'no_context') {
    return (
      <Shell>
        <Title>Confirma tu email</Title>
        <p style={bodyText}>
          No hemos podido recuperar a qué dirección enviamos el código. Puede pasar si abriste
          esta página en otra pestaña o en otro dispositivo.
        </p>
        <button onClick={backToSignup} style={primaryButton}>Volver al registro</button>
        <SupportLine />
      </Shell>
    )
  }

  if (phase === 'checking') {
    return (
      <Shell>
        <p style={{ ...bodyText, opacity: 0.6 }} role="status" aria-live="polite">Un momento…</p>
      </Shell>
    )
  }

  if (phase === 'success') {
    return (
      <Shell>
        <div style={successMark} aria-hidden>✓</div>
        <Title>Email confirmado</Title>
        <p style={bodyText} role="status" aria-live="polite">Estamos preparando tu Camino…</p>
      </Shell>
    )
  }

  const busy = phase === 'verifying'

  return (
    <Shell>
      <Title>CONFIRMA TU EMAIL</Title>

      <p style={bodyText}>
        Te hemos enviado un código de {OTP_LENGTH} dígitos a{' '}
        <strong style={{ color: '#fff', fontWeight: 700 }}>{maskEmail(pending?.email ?? '')}</strong>.
      </p>

      <form
        onSubmit={event => { event.preventDefault(); void handleVerify(token) }}
        style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <label htmlFor="otp" style={label}>Código de verificación</label>
        <input
          ref={inputRef}
          id="otp"
          value={token}
          onChange={event => {
            const next = normalizeOtpToken(event.target.value)
            setToken(next)
            if (errorMsg) setErrorMsg('')
            // Pegar el código completo verifica solo: en móvil, obligar a
            // pulsar un botón después de pegar es un paso de más.
            if (isCompleteOtpToken(next) && !busy) void handleVerify(next)
          }}
          onPaste={event => {
            const pasted = normalizeOtpToken(event.clipboardData.getData('text'))
            if (!pasted) return
            event.preventDefault()
            setToken(pasted)
            if (isCompleteOtpToken(pasted) && !busy) void handleVerify(pasted)
          }}
          disabled={busy}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCorrect="off"
          spellCheck={false}
          maxLength={OTP_LENGTH}
          placeholder="000000"
          aria-describedby={errorMsg ? 'otp-error' : 'otp-help'}
          aria-invalid={Boolean(errorMsg)}
          style={{
            width: '100%',
            padding: '16px 18px',
            background: 'rgba(255,255,255,.05)',
            border: `1px solid ${errorMsg ? 'rgba(248,113,113,.55)' : 'rgba(255,255,255,.16)'}`,
            borderRadius: 10,
            color: '#fff',
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 26,
            letterSpacing: '.32em',
            textAlign: 'center',
            outline: 'none',
            minHeight: 56,
          }}
        />

        <p id="otp-help" style={{ ...helpText, margin: 0 }}>
          {OTP_EXPIRY_LABEL
            ? `Puedes pegarlo directamente desde el correo. El código caduca en ${OTP_EXPIRY_LABEL}.`
            : 'Puedes pegarlo directamente desde el correo.'}
        </p>

        {errorMsg && (
          <p id="otp-error" role="alert" style={{ ...helpText, color: '#f87171', margin: 0 }}>{errorMsg}</p>
        )}
        {resendMsg && (
          <p role="status" aria-live="polite" style={{ ...helpText, color: '#4ade80', margin: 0 }}>{resendMsg}</p>
        )}

        <button type="submit" disabled={busy || !isCompleteOtpToken(token)} style={{
          ...primaryButton,
          opacity: busy || !isCompleteOtpToken(token) ? 0.45 : 1,
          cursor: busy || !isCompleteOtpToken(token) ? 'not-allowed' : 'pointer',
        }}>
          {busy ? 'Verificando…' : 'Verificar código'}
        </button>
      </form>

      {/* Cuando el fallo exige un código nuevo, el reenvío deja de ser un
          enlace secundario y se explica la espera real — la que impone el
          servidor, no una inventada aquí. */}
      <button
        onClick={handleResend}
        disabled={resending || cooldown > 0}
        style={{
          ...linkButton,
          cursor: resending || cooldown > 0 ? 'not-allowed' : 'pointer',
          color: needsFreshCode && cooldown === 0 ? '#fff' : linkButton.color,
        }}
      >
        {resending
          ? 'Reenviando…'
          : cooldown > 0
            ? `Reenviar código (${formatCooldown(cooldown)})`
            : needsFreshCode
              ? 'Solicitar código nuevo'
              : '¿No te ha llegado? Reenviar código'}
      </button>

      {needsFreshCode && cooldown > 0 && (
        <p role="status" aria-live="polite" style={{ ...helpText, margin: 0 }}>
          Podrás pedir un código nuevo en {formatCooldown(cooldown)}.
        </p>
      )}

      <button onClick={backToSignup} style={{ ...linkButton, fontSize: 11, opacity: 0.6 }}>
        ← Cambiar email o volver
      </button>

      <SupportLine />
    </Shell>
  )
}

// ── Identidad visual del onboarding ──────────────────────────────────────

const bodyText: React.CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,.55)',
  maxWidth: 340,
  lineHeight: 1.6,
  margin: 0,
  textAlign: 'center',
}

const helpText: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,.35)',
  lineHeight: 1.6,
  textAlign: 'center',
}

const label: React.CSSProperties = {
  fontFamily: "'DM Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,.4)',
  textAlign: 'center',
}

const primaryButton: React.CSSProperties = {
  padding: '14px 24px',
  background: '#fff',
  color: '#111',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  minHeight: 48,
  width: '100%',
  maxWidth: 340,
}

const linkButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,.5)',
  fontSize: 12,
  fontWeight: 700,
  textDecoration: 'underline',
  padding: '10px 8px',
  minHeight: 40,
}

const successMark: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: '#fff',
  color: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  fontWeight: 900,
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      gap: 18,
      padding: '32px 20px',
    }}>
      {children}
    </main>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 'clamp(30px, 6vw, 44px)',
      color: '#fff',
      letterSpacing: '.02em',
      margin: 0,
      textAlign: 'center',
      lineHeight: 1.1,
    }}>
      {children}
    </h1>
  )
}

function SupportLine() {
  return (
    <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', margin: 0, textAlign: 'center' }}>
      ¿Sigue sin llegar? <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'rgba(255,255,255,.6)' }}>Escríbenos a soporte</a>.
    </p>
  )
}

export default function VerificarEmailClient() {
  return (
    <Suspense fallback={<Shell><p style={{ ...bodyText, opacity: 0.6 }}>Un momento…</p></Shell>}>
      <VerificarEmailContent />
    </Suspense>
  )
}
