// Reglas de la verificación por código (OTP) del registro por email.
//
// Puras y sin Supabase a propósito: lo delicado de esta pantalla no es la
// llamada a `verifyOtp` —esa la valida Supabase— sino todo lo de alrededor.
// Qué email se enseña y cómo, qué cuenta como código completo, cuándo se
// puede reenviar, y qué le decimos al alumno cuando falla. Eso tiene que
// poder comprobarse sin navegador.
//
// El email NUNCA viaja en la URL. Va en sessionStorage, atado a la pestaña
// donde el alumno se registró: una URL se comparte, se pega en un chat y
// acaba en logs de servidor y de analítica. En pantalla solo se muestra
// enmascarado.

/** Dígitos del código que envía Supabase en `{{ .Token }}`. */
export const OTP_LENGTH = 6

/** Segundos entre reenvíos. Es el mismo que aplica /api/auth/resend-confirmation. */
export const RESEND_COOLDOWN_SECONDS = 60

// ── Email enmascarado ────────────────────────────────────────────────────

/**
 * `mario.sanchez@gmail.com` → `ma••••••••••@gmail.com`
 *
 * Deja lo justo para que el alumno reconozca SU dirección (y detecte una
 * errata) sin exponerla entera en pantalla — puede haber alguien mirando, y
 * esta pantalla se abre a menudo en clase.
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0) return '•••'
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at)
  if (local.length <= 2) return `${local[0] ?? ''}•${domain}`
  return `${local.slice(0, 2)}${'•'.repeat(Math.max(3, local.length - 2))}${domain}`
}

// ── El código ────────────────────────────────────────────────────────────

/**
 * Normaliza lo que el alumno escribe O PEGA.
 *
 * Pegar el código desde el correo es el camino habitual en móvil, y llega con
 * espacios, guiones o saltos de línea según el cliente de correo. Quedarse
 * solo con los dígitos evita el "código incorrecto" más absurdo posible: el
 * que ocurre con el código correcto.
 */
export function normalizeOtpToken(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH)
}

export function isCompleteOtpToken(token: string): boolean {
  return normalizeOtpToken(token).length === OTP_LENGTH
}

// ── Errores ──────────────────────────────────────────────────────────────

export type VerifyFailureKind = 'expired' | 'invalid' | 'rate_limited' | 'no_session' | 'unknown'

/**
 * Traduce el error de Supabase a algo accionable.
 *
 * Caducado y equivocado piden cosas distintas del alumno (pedir otro código
 * vs. revisar los dígitos); decirle "código incorrecto" cuando lo que pasa es
 * que caducó le hace teclear el mismo código una y otra vez.
 */
export function classifyVerifyError(message: string | null | undefined): VerifyFailureKind {
  const text = (message ?? '').toLowerCase()
  if (!text) return 'unknown'
  if (text.includes('expired') || text.includes('caduc')) return 'expired'
  if (text.includes('rate limit') || text.includes('too many')) return 'rate_limited'
  if (text.includes('invalid') || text.includes('incorrect') || text.includes('token')) return 'invalid'
  return 'unknown'
}

export function verifyFailureMessage(kind: VerifyFailureKind): string {
  switch (kind) {
    case 'expired':
      return 'Ese código ya ha caducado. Pide uno nuevo y vuelve a intentarlo.'
    case 'rate_limited':
      return 'Demasiados intentos seguidos. Espera un momento antes de volver a probar.'
    case 'invalid':
      return 'El código no es correcto. Revisa los dígitos o pide uno nuevo.'
    case 'no_session':
      // Supabase no ha devuelto error PERO tampoco sesión. Con eso no podemos
      // afirmar ni que el código ya se hubiera usado ni que el email quedara
      // verificado: solo sabemos que no hay sesión. El mensaje dice
      // exactamente eso y da la única salida que sí funciona — pedir otro
      // código —, porque reintroducir el mismo no va a cambiar el resultado.
      return 'No hemos podido completar la verificación. Solicita un código nuevo para continuar.'
    default:
      return 'No hemos podido verificar el código. Inténtalo de nuevo.'
  }
}

/**
 * ¿Este fallo se resuelve reintroduciendo el mismo código, o hay que pedir
 * uno nuevo?
 *
 * Sirve para dirigir al alumno al botón correcto. NO toca el cooldown: el
 * reenvío lo gobierna /api/auth/resend-confirmation con su registro real de
 * envíos, y adelantarlo desde aquí sería mentirle con una espera que el
 * servidor va a rechazar igualmente.
 */
export function needsNewCode(kind: VerifyFailureKind): boolean {
  return kind === 'expired' || kind === 'no_session'
}

// ── Reenvío ──────────────────────────────────────────────────────────────

/** Segundos que faltan para poder reenviar, 0 si ya se puede. */
export function resendCooldownRemaining(
  lastSentAtMs: number | null,
  nowMs: number,
  cooldownSeconds: number = RESEND_COOLDOWN_SECONDS,
): number {
  if (lastSentAtMs == null) return 0
  const elapsed = Math.floor((nowMs - lastSentAtMs) / 1000)
  if (!Number.isFinite(elapsed) || elapsed < 0) return cooldownSeconds
  return Math.max(0, cooldownSeconds - elapsed)
}

export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return ''
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} min`
}

/**
 * Cuánto dura el código, para el copy.
 *
 * NO se escribe a mano: el valor real lo fija Supabase (Authentication →
 * Rate Limits / Email OTP expiry) y prometer una hora cuando caduca en diez
 * minutos es peor que no decir nada. Sin el valor configurado
 * (`NEXT_PUBLIC_OTP_EXPIRY_SECONDS`), el copy se queda en genérico.
 */
export function formatOtpExpiry(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 120) return `${Math.round(seconds)} segundos`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minutos`
  const hours = Math.round(minutes / 60)
  return hours === 1 ? '1 hora' : `${hours} horas`
}

export function otpExpiryFromEnv(raw: string | undefined): number | null {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

// ── Contexto pendiente (sessionStorage) ──────────────────────────────────

const PENDING_KEY = 'kairo_pending_email_verification_v1'

export type PendingVerification = {
  email: string
  draftId: string | null
  /** Para telemetría: el mismo trace del onboarding, nunca PII. */
  traceId: string | null
  /** ms epoch del último envío, para el cooldown de reenvío. */
  lastSentAtMs: number
}

/**
 * Valida la forma de lo leído. `sessionStorage` es escribible por cualquier
 * script de la propia pestaña, así que su contenido se trata como entrada,
 * no como verdad — y en cualquier caso lo único que decide si el alumno está
 * verificado es la sesión real de Supabase, nunca esto.
 */
export function parsePendingVerification(raw: string | null): PendingVerification | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<PendingVerification>
    const email = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : ''
    if (!email || !email.includes('@')) return null
    return {
      email,
      draftId: typeof parsed.draftId === 'string' ? parsed.draftId : null,
      traceId: typeof parsed.traceId === 'string' ? parsed.traceId : null,
      lastSentAtMs: typeof parsed.lastSentAtMs === 'number' ? parsed.lastSentAtMs : 0,
    }
  } catch {
    return null
  }
}

export function savePendingVerification(value: PendingVerification): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(value))
  } catch { /* modo privado o almacenamiento bloqueado: la pantalla lo trata como "sin contexto" */ }
}

export function loadPendingVerification(): PendingVerification | null {
  if (typeof window === 'undefined') return null
  try {
    return parsePendingVerification(window.sessionStorage.getItem(PENDING_KEY))
  } catch {
    return null
  }
}

export function clearPendingVerification(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(PENDING_KEY)
  } catch { /* nada que limpiar */ }
}
