import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  classifyVerifyError,
  formatCooldown,
  formatOtpExpiry,
  isCompleteOtpToken,
  maskEmail,
  needsNewCode,
  normalizeOtpToken,
  otpExpiryFromEnv,
  parsePendingVerification,
  resendCooldownRemaining,
  verifyFailureMessage,
} from './emailVerification.ts'

// ── El email nunca se muestra entero ────────────────────────────────────

test('el email se enseña enmascarado pero reconocible', () => {
  assert.equal(maskEmail('mario.sanchez@gmail.com'), `ma${'\u2022'.repeat('mario.sanchez'.length - 2)}@gmail.com`)
  assert.ok(maskEmail('mario.sanchez@gmail.com').endsWith('@gmail.com'))
  // El alumno tiene que poder detectar una errata de dominio.
  assert.ok(maskEmail('a@b.com').includes('@b.com'))
})

test('el enmascarado nunca deja escapar la parte local completa', () => {
  for (const email of ['a@x.com', 'ab@x.com', 'abc@x.com', 'nombre.muy.largo@dominio.es']) {
    const masked = maskEmail(email)
    const local = email.slice(0, email.lastIndexOf('@'))
    if (local.length > 2) {
      assert.ok(!masked.includes(local), `${email} se enseña entero: ${masked}`)
    }
  }
})

test('una entrada que no es un email no revela nada', () => {
  assert.equal(maskEmail(''), '•••')
  assert.equal(maskEmail('sin-arroba'), '•••')
})

// ── Pegar el código ─────────────────────────────────────────────────────

test('pegar el código con espacios, guiones o saltos de línea funciona', () => {
  for (const pasted of ['123456', '123 456', '123-456', ' 123456 ', '12 34 56', '123456\n']) {
    assert.equal(normalizeOtpToken(pasted), '123456', pasted)
    assert.equal(isCompleteOtpToken(pasted), true, pasted)
  }
})

test('pegar el correo entero no produce un código inventado', () => {
  // Se queda con los primeros dígitos y NO se autocompleta con basura.
  const token = normalizeOtpToken('Tu código es 123456. Caduca pronto.')
  assert.equal(token, '123456')
})

test('un código incompleto no se da por válido', () => {
  assert.equal(isCompleteOtpToken('12345'), false)
  assert.equal(isCompleteOtpToken(''), false)
  assert.equal(isCompleteOtpToken('abcdef'), false)
})

test('nunca se acepta más de la longitud del código', () => {
  assert.equal(normalizeOtpToken('1234567890').length, OTP_LENGTH)
})

// ── Errores accionables ─────────────────────────────────────────────────

test('caducado y equivocado no se confunden', () => {
  assert.equal(classifyVerifyError('Token has expired or is invalid'), 'expired')
  assert.equal(classifyVerifyError('Invalid token'), 'invalid')
  assert.equal(classifyVerifyError('Email rate limit exceeded'), 'rate_limited')
  assert.equal(classifyVerifyError(null), 'unknown')
  // Decirle "código incorrecto" cuando lo que pasa es que caducó le hace
  // teclear el mismo código una y otra vez.
  assert.notEqual(verifyFailureMessage('expired'), verifyFailureMessage('invalid'))
})

test('ningún mensaje de error revela si el email existe', () => {
  for (const kind of ['expired', 'invalid', 'rate_limited', 'unknown'] as const) {
    const message = verifyFailureMessage(kind)
    assert.ok(!/registrad|existe|cuenta ya/i.test(message), message)
  }
})

// ── Reenvío con cooldown visible ────────────────────────────────────────

test('el cooldown cuenta atrás desde el último envío', () => {
  const now = 1_700_000_000_000
  assert.equal(resendCooldownRemaining(now, now), RESEND_COOLDOWN_SECONDS)
  assert.equal(resendCooldownRemaining(now - 30_000, now), 30)
  assert.equal(resendCooldownRemaining(now - 60_000, now), 0)
  assert.equal(resendCooldownRemaining(now - 999_000, now), 0)
})

test('sin envío previo se puede reenviar; un reloj hacia atrás no lo desbloquea', () => {
  const now = 1_700_000_000_000
  assert.equal(resendCooldownRemaining(null, now), 0)
  // Un timestamp futuro (reloj del dispositivo movido) NO abre el reenvío.
  assert.equal(resendCooldownRemaining(now + 5_000, now), RESEND_COOLDOWN_SECONDS)
})

test('el cooldown se muestra en una unidad legible', () => {
  assert.equal(formatCooldown(0), '')
  assert.equal(formatCooldown(45), '45 s')
  assert.equal(formatCooldown(90), '2 min')
})

// ── Caducidad del código: nunca inventada ───────────────────────────────

test('sin caducidad configurada, el copy no promete ningún plazo', () => {
  assert.equal(otpExpiryFromEnv(undefined), null)
  assert.equal(otpExpiryFromEnv(''), null)
  assert.equal(otpExpiryFromEnv('no-es-un-numero'), null)
  assert.equal(otpExpiryFromEnv('0'), null)
  assert.equal(otpExpiryFromEnv('-60'), null)
  assert.equal(formatOtpExpiry(null), null)
})

test('con caducidad configurada, el copy usa el valor real', () => {
  assert.equal(otpExpiryFromEnv('3600'), 3600)
  assert.equal(formatOtpExpiry(3600), '1 hora')
  assert.equal(formatOtpExpiry(600), '10 minutos')
  assert.equal(formatOtpExpiry(300), '5 minutos')
  assert.equal(formatOtpExpiry(90), '90 segundos')
})

// ── Contexto pendiente: entrada, no verdad ──────────────────────────────

test('un contexto pendiente válido se lee normalizado', () => {
  const parsed = parsePendingVerification(JSON.stringify({
    email: '  Mario@Gmail.COM ',
    draftId: 'd-1',
    traceId: 't-1',
    lastSentAtMs: 42,
  }))
  assert.deepEqual(parsed, { email: 'mario@gmail.com', draftId: 'd-1', traceId: 't-1', lastSentAtMs: 42 })
})

test('un contexto ausente, corrupto o sin email no sirve para nada', () => {
  for (const raw of [null, '', 'no-es-json', '{}', '[]', JSON.stringify({ email: 'sin-arroba' }), JSON.stringify({ draftId: 'x' })]) {
    assert.equal(parsePendingVerification(raw), null, String(raw))
  }
})

test('los campos que faltan no rompen la pantalla', () => {
  const parsed = parsePendingVerification(JSON.stringify({ email: 'a@b.com' }))
  assert.deepEqual(parsed, { email: 'a@b.com', draftId: null, traceId: null, lastSentAtMs: 0 })
})

// ── verifyOtp sin error pero sin sesión ─────────────────────────────────

test('"sin sesión" es un estado propio, no se mezcla con código incorrecto', () => {
  // Supabase puede devolver `error === null` y aun así ninguna sesión. Con eso
  // NO podemos afirmar la causa: ni que el código estuviera usado, ni que el
  // email quedara verificado.
  const sinSesion = verifyFailureMessage('no_session')
  assert.notEqual(sinSesion, verifyFailureMessage('invalid'))
  assert.notEqual(sinSesion, verifyFailureMessage('expired'))
  assert.notEqual(sinSesion, verifyFailureMessage('unknown'))
})

test('el mensaje de "sin sesión" no afirma una causa que no conocemos', () => {
  const message = verifyFailureMessage('no_session')
  // Nada de "ya se ha usado", "caducado" ni "verificado": no lo sabemos.
  assert.ok(!/ya se ha usado|ya usado|caduc|verificado/i.test(message), message)
  // Pero sí da la salida que de verdad funciona.
  assert.ok(/c[oó]digo nuevo/i.test(message), message)
})

test('caducado y sin sesión piden código nuevo; incorrecto no', () => {
  assert.equal(needsNewCode('expired'), true)
  assert.equal(needsNewCode('no_session'), true)
  // Un código mal tecleado se arregla tecleándolo bien: no gasta un reenvío.
  assert.equal(needsNewCode('invalid'), false)
  assert.equal(needsNewCode('rate_limited'), false)
  assert.equal(needsNewCode('unknown'), false)
})

test('pedir código nuevo NO adelanta el cooldown del servidor', () => {
  // La fuente de verdad del reenvío es /api/auth/resend-confirmation. Que el
  // fallo exija un código nuevo no puede saltarse los 60 s reales.
  const now = 1_700_000_000_000
  const justSent = now - 10_000
  assert.equal(resendCooldownRemaining(justSent, now), 50)
  // needsNewCode es una señal de COPY, no toca el tiempo restante.
  assert.equal(typeof needsNewCode('no_session'), 'boolean')
})
