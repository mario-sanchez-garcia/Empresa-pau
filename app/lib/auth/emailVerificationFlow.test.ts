import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Invariantes del RECORRIDO de verificación por código, comprobadas sobre el
// código fuente.
//
// Las pantallas implicadas son componentes cliente que importan Supabase y
// Next: no se pueden cargar en un test de Node. Las REGLAS puras están
// probadas sobre datos en emailVerification.test.ts y
// postAuthDestination.test.ts; lo que se fija aquí es el cableado, que es
// donde viven los fallos de este flujo — mandar a Google a verificar un
// código, finalizar sin sesión, o filtrar el email por la URL.

const ROOT = process.cwd()

function read(...parts: string[]): string {
  return readFileSync(join(ROOT, ...parts), 'utf8')
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n')
}

const onboardingFlow = () => stripComments(read('app', 'components', 'onboarding', 'OnboardingFlow.tsx'))
const verifyScreen = () => stripComments(read('app', 'verificar-email', 'VerificarEmailClient.tsx'))
const callback = () => stripComments(read('app', 'auth', 'callback', 'page.tsx'))

// ── Signup por email sin sesión → /verificar-email ──────────────────────

test('un signup por email que necesita confirmación va a /verificar-email', () => {
  const code = onboardingFlow().replace(/\s+/g, ' ')
  assert.ok(code.includes('if (result.needsConfirmation)'), 'no se detecta la confirmación pendiente')
  assert.ok(code.includes("router.push(`/verificar-email?draft=${encodeURIComponent(draftId)}`)"),
    'el signup por email no lleva a la pantalla de verificación')
  assert.ok(!code.includes('/onboarding/revisa-tu-email?email='), 'sigue usando la pantalla antigua con el email en la URL')
})

test('el finalizer NO se llama antes de tener sesión', () => {
  const code = onboardingFlow().replace(/\s+/g, ' ')
  // goToFinalizing solo puede ocurrir tras setSession (rama sin confirmación)
  // o desde la pantalla de verificación, ya con sesión real.
  const confirmBranch = code.indexOf('if (result.needsConfirmation)')
  const setSession = code.indexOf('await supabase.auth.setSession(result.session)')
  const goToFinalizing = code.indexOf('goToFinalizing(draftId)', confirmBranch)
  assert.ok(confirmBranch > 0 && setSession > confirmBranch, 'la rama de confirmación no precede a setSession')
  assert.ok(goToFinalizing > setSession, 'se finaliza sin haber establecido sesión')
})

// ── El email no viaja en la URL ─────────────────────────────────────────

test('el email no se pone nunca en un query param', () => {
  for (const [name, code] of [['OnboardingFlow', onboardingFlow()], ['/verificar-email', verifyScreen()]] as const) {
    assert.ok(!/[?&]email=\$\{/.test(code), `${name} mete el email en la URL`)
    assert.ok(!/searchParams\.get\('email'\)/.test(code), `${name} lee el email de la URL`)
  }
})

test('el email pendiente se guarda en sessionStorage y solo se muestra enmascarado', () => {
  assert.ok(onboardingFlow().includes('savePendingVerification('), 'el signup no guarda el contexto pendiente')
  const screen = verifyScreen()
  assert.ok(screen.includes('loadPendingVerification()'), 'la pantalla no lee el contexto pendiente')
  assert.ok(screen.includes('maskEmail(pending?.email'), 'la pantalla enseña el email sin enmascarar')
  assert.ok(!/\{pending\?\.email\}/.test(screen), 'la pantalla pinta el email en claro')
})

// ── Google OAuth no pasa por la verificación ────────────────────────────

test('Google OAuth no entra nunca en /verificar-email', () => {
  const code = onboardingFlow()
  const googleStart = code.indexOf('async function handleGoogleSignup(')
  const googleEnd = code.indexOf('async function handleEmailSignup(')
  assert.ok(googleStart > 0 && googleEnd > googleStart)
  const googleBody = code.slice(googleStart, googleEnd)
  assert.ok(!googleBody.includes('verificar-email'), 'el flujo de Google toca la pantalla de verificación')
  assert.ok(!googleBody.includes('savePendingVerification'), 'el flujo de Google guarda contexto de verificación')
  assert.ok(googleBody.includes("method=google"), 'el flujo de Google ha dejado de usar su callback')

  // Y el callback, que es por donde vuelve Google, tampoco redirige allí.
  assert.ok(!callback().includes('verificar-email'), 'el callback de OAuth manda a verificar un código')
})

// ── Verificación: cliente, anon key, sesión real ────────────────────────

test('la verificación usa verifyOtp con el tipo soportado por nuestra versión', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes('supabase.auth.verifyOtp('), 'no se usa verifyOtp')
  assert.ok(screen.includes("type: 'signup'"), 'el tipo de OTP no es el del registro')
  // Nada de un sistema propio: ni códigos en nuestra BD ni endpoint de verificación.
  assert.ok(!/\/api\/auth\/verify/.test(screen), 'se ha creado una ruta propia de verificación')
})

test('el destino tras verificar sale de la sesión real, no de la URL', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes('await supabase.auth.getSession()'), 'no se comprueba la sesión real')
  assert.ok(screen.includes('if (!accessToken) { setPhase(\'no_context\') return }')
    || screen.includes("if (!accessToken) { setPhase('no_context'); return }"),
    'se sigue adelante sin token de sesión')
  assert.ok(screen.includes('resolvePostAuthDestination('), 'no usa la resolución de destino compartida')
})

test('el service role no aparece en el cliente', () => {
  for (const [name, code] of [['/verificar-email', verifyScreen()], ['OnboardingFlow', onboardingFlow()]] as const) {
    assert.ok(!code.includes('SERVICE_ROLE'), `${name} referencia el service role`)
  }
})

// ── Refresh sin contexto: fallo seguro ──────────────────────────────────

test('sin contexto suficiente, la pantalla no pide un código imposible de verificar', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes("setPhase('no_context')"), 'no hay estado de "sin contexto"')
  assert.ok(screen.includes('const stored = loadPendingVerification() if (!stored)'), 'no se corta cuando falta el contexto')
  assert.ok(screen.includes('Volver al registro'), 'no se ofrece salida al alumno')
})

test('con sesión ya válida no se vuelve a pedir un código', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(/if \(data\.session\) \{ await goAfterAuth\(/.test(screen), 'un refresh con sesión vuelve a pedir código')
})

// ── Reenvío: endpoint existente, con su límite ──────────────────────────

test('el reenvío reutiliza el endpoint con rate limit, no llama a Supabase directo', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes("fetch('/api/auth/resend-confirmation'"), 'el reenvío no pasa por nuestro endpoint')
  assert.ok(!screen.includes('supabase.auth.resend('), 'el cliente llama a resend saltándose el rate limit')
  assert.ok(screen.includes('cooldown > 0'), 'el botón de reenviar no respeta el cooldown')
  assert.ok(screen.includes('retryAfterSeconds'), 'no se respeta el cooldown que impone el servidor')
})

test('el endpoint de reenvío conserva su límite y expone el tiempo de espera', () => {
  const route = stripComments(read('app', 'api', 'auth', 'resend-confirmation', 'route.ts')).replace(/\s+/g, ' ')
  assert.ok(route.includes('const RESEND_COOLDOWN_SECONDS = 60'), 'ha cambiado el cooldown por email')
  assert.ok(route.includes('const RESEND_IP_HOURLY_LIMIT = 12'), 'ha cambiado el límite por IP')
  assert.ok(route.includes('retryAfterSeconds: RESEND_COOLDOWN_SECONDS'), 'el 429 no dice cuánto hay que esperar')
})

// ── Telemetría sin PII ──────────────────────────────────────────────────

test('los cinco eventos existen y están aceptados por el servidor', () => {
  const events = [
    'email_verification_viewed',
    'email_verification_submitted',
    'email_verification_succeeded',
    'email_verification_failed',
    'email_verification_resent',
  ]
  const client = read('app', 'lib', 'onboarding', 'onboardingEvents.ts')
  const server = read('app', 'api', 'onboarding', 'event', 'route.ts')
  const screen = verifyScreen()
  for (const event of events) {
    assert.ok(client.includes(`'${event}'`), `${event} no está en el tipo de eventos`)
    assert.ok(server.includes(`'${event}'`), `${event} no lo acepta /api/onboarding/event`)
    assert.ok(screen.includes(event), `${event} no se emite desde la pantalla`)
  }
})

test('ningún evento de verificación lleva email ni código', () => {
  const screen = verifyScreen()
  const calls = screen.match(/sendOnboardingEvent\([^)]*\)/g) ?? []
  assert.ok(calls.length > 0)
  for (const call of calls) {
    // `method: 'email'` sí es legítimo (google|email, ya en la lista blanca).
    // Lo que no puede aparecer es el VALOR del email ni el del código.
    assert.ok(!/pending\b|\.email\b|normalizedEmail|maskEmail/.test(call), `evento con el email: ${call}`)
    assert.ok(!/\btoken\b|\bcode\b|\botp\b/i.test(call.replace(/error_code/g, '')), `evento con el código: ${call}`)
  }
})

// ── La pantalla antigua sigue funcionando ───────────────────────────────

test('/onboarding/revisa-tu-email redirige conservando el draft', () => {
  const page = stripComments(read('app', 'onboarding', 'revisa-tu-email', 'page.tsx')).replace(/\s+/g, ' ')
  assert.ok(page.includes('redirect('), 'la ruta antigua ya no redirige')
  assert.ok(page.includes('/verificar-email?draft='), 'la redirección pierde el draft del alumno')
  assert.ok(!page.includes('email='), 'la redirección arrastra el email a la URL nueva')
})

// ── El plazo de caducidad no se inventa ─────────────────────────────────

test('el copy de caducidad sale de la configuración, no del código', () => {
  const screen = verifyScreen()
  assert.ok(screen.includes('NEXT_PUBLIC_OTP_EXPIRY_SECONDS'), 'la caducidad no se lee de la configuración')
  // Nada de plazos escritos a mano.
  assert.ok(!/caduca en \d/i.test(screen), 'hay un plazo de caducidad escrito a mano')
})

// ── Los cuatro arreglos de la revisión de auth ──────────────────────────

test('1. verifyOtp sin error y sin sesión tiene rama propia', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  // Ya no se colapsa en `error || !data.session`.
  assert.ok(!/if \(error \|\| !data\.session\)/.test(screen), 'sigue mezclando error y falta de sesión')
  assert.ok(/if \(error\) \{ failWith\(classifyVerifyError\(error\.message\)\) return \}/.test(screen)
    || screen.includes('if (error) { failWith(classifyVerifyError(error.message)); return }'),
    'el error de Supabase no se clasifica por su cuenta')
  assert.ok(screen.includes("if (!data.session) {") && screen.includes("failWith('no_session')"),
    'la falta de sesión no tiene tratamiento propio')
})

test('1b. el cooldown de reenvío NO se fuerza a cero desde la pantalla', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  // La única fuente de verdad es el servidor. Nada de setCooldown(0).
  assert.ok(!/setCooldown\(0\)/.test(screen), 'la pantalla adelanta el reenvío por su cuenta')
  // Y cuando hace falta un código nuevo pero aún hay espera, se dice cuánta.
  assert.ok(screen.includes('Podrás pedir un código nuevo en'), 'no se muestra la espera real')
})

test('2. el doble submit lo impide un cerrojo síncrono, no el estado de React', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes('const verifyingRef = useRef(false)'), 'no hay cerrojo síncrono')
  assert.ok(screen.includes('if (!pending || verifyingRef.current) return'), 'el cerrojo no se comprueba al entrar')
  assert.ok(screen.includes('verifyingRef.current = true'), 'el cerrojo no se toma')
  // Se libera SOLO en el camino de error recuperable...
  const releases = screen.match(/verifyingRef\.current = false/g) ?? []
  assert.equal(releases.length, 1, 'el cerrojo se libera en más de un sitio: revisa cuál')
  // ...y nunca después de empezar a resolver el destino post-auth.
  const successAt = screen.indexOf("setPhase('success')")
  const releaseAt = screen.lastIndexOf('verifyingRef.current = false')
  assert.ok(successAt > 0 && releaseAt < successAt, 'el cerrojo se libera durante la resolución post-auth')
})

test('3. un claim fallido NO borra las respuestas locales del alumno', () => {
  const screen = verifyScreen().replace(/\s+/g, ' ')
  assert.ok(screen.includes('const claimFailed = Boolean(draftId) && !draftClaimed'),
    'la pantalla no distingue el claim fallido')
  assert.ok(screen.includes('if (!claimFailed) clearOnboarding()'),
    'la pantalla sigue borrando el onboarding local tras un claim fallido')

  const cb = callback().replace(/\s+/g, ' ')
  assert.ok(cb.includes('function go(target: string, keepLocalOnboarding = false)'),
    'el callback no puede conservar el onboarding local')
  assert.ok(cb.includes('if (!keepLocalOnboarding) clearOnboarding()'), 'el callback borra siempre')
  assert.ok(cb.includes('go(destination, Boolean(draftId) && !draftClaimed)'),
    'el callback no conserva las respuestas tras un claim fallido')
})

test('4. sin token y con draft, el callback vuelve al onboarding', () => {
  const cb = callback().replace(/\s+/g, ' ')
  assert.ok(cb.includes("if (draftId) { go('/onboarding', true) return }")
    || cb.includes("if (draftId) { go('/onboarding', true); return }"),
    'sin token y con draft ya no se vuelve al onboarding')
  // Y nunca se cae a /onboarding/finalizando sin token.
  const noTokenBlock = cb.slice(cb.indexOf('if (!token) {'), cb.indexOf('postAuthDestination.ts'))
  assert.ok(!noTokenBlock.includes('finalizando'), 'se puede llegar a finalizando sin token')
})
