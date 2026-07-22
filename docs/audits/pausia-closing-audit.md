# Auditoría técnica de cierre — Kairo

**Fecha:** 2026-06-13  
**Sprints auditados:** Magic Parent Checkout · Camino PAU · Onboarding Day 1 / First Mission Activation  
**Build:** ✅ 23/23 páginas · 0 errores TypeScript  
**Commit final:** `6c8e031788c330144db936809f34d3bc20de7f62`

---

## Estado general

El repo está limpio, en sync con `origin/main`, el build pasa al 100% y no hay breaking changes en ninguna de las rutas existentes. Los tres sprints están entregados y en producción. Hay un riesgo P0 crítico de entorno (mismatch de nombre de variable de entorno) y varios riesgos P1 antes de beta privada real.

---

## Build

```
✓ Compiled successfully in 4.2s
✓ TypeScript: 0 errores
✓ 23/23 páginas generadas
```

Sin warnings relevantes. Todas las rutas presentes: `/onboarding`, `/camino`, `/parent-checkout/[token]`, `/parent-checkout/success`, todos los endpoints API.

---

## Git

- **Rama:** `main`
- **Estado:** clean, 0 cambios pendientes
- **Sincronía:** `up to date with 'origin/main'` — todo pusheado
- **Commit hash final:** `6c8e031788c330144db936809f34d3bc20de7f62`

**Últimos 10 commits:**
```
6c8e031 feat: onboarding day 1 + first mission activation
d299ad4 docs: add parent checkout qa notes
21bc2fa fix: use short stripe checkout expiration
c02a7f7 fix: handle parent checkout token safely
5e408b9 feat: add parent checkout foundation (Magic Link PAU)
ed5d77f Refine theory explanations and correction loading
5f4212b Add theory toggle and correction loading
cc4c1b9 Fix AI correction formatting fallback
4de35bc Move settings to sidebar footer
f1ae667 Add theory toggle to AI corrections
```

---

## Camino PAU

**Persistencia:**
- `useCaminoProgress` implementa una estrategia dual correcta: primero localStorage como estado inicial optimista, luego fetch a `/api/camino/state` con Bearer token que sobrescribe con datos reales de Supabase.
- Cuando hay sesión → source = `'supabase'`, datos reales
- Sin sesión → source = `'local'`, datos de localStorage

**APIs:**
- `GET /api/camino/state` — autenticada, devuelve progreso real, ruta, tareas completadas hoy, weak areas. Todas las queries filtradas por `user.id` (RLS aplicado vía Bearer token).
- `POST /api/camino/complete-task` — idempotente mediante `upsert ON CONFLICT DO NOTHING` en `camino_task_completions (user_id, task_id, mission_date)`. XP de misión también idempotente por `camino_xp_events (user_id, source_type, source_id, mission_date)`. Ventana temporal de ±1 día verificada server-side.
- `PATCH /api/camino/route` — solo actualiza `camino_route_settings` del usuario autenticado.
- `POST /api/camino/reset` — protegido por `isInternalUser()` (lista de emails configurada en `INTERNAL_USER_EMAILS` env var). Usa service role solo para operaciones de reset de datos propios del user autenticado.

**Pack activo:** `CaminoPauClient` usa `useBillingStatus` → `GET /api/billing/me` → lee `user_entitlements` real de Supabase. No hay lógica local de desbloqueo.

**Riesgo de acceso cruzado:** Todas las queries de Camino usan `createUserSupabase(accessToken)` que pasa el JWT del usuario; RLS en Supabase aplica automáticamente. El usuario no puede leer ni escribir datos de otro usuario.

---

## Magic Parent Checkout

**Token:**
- `generateRawToken()` → `crypto.randomBytes(32).toString('hex')` (64 chars hex)
- Solo se guarda `token_hash = SHA-256(rawToken)` en `parent_checkout_links`
- El raw token viaja en la URL una vez y nunca se persiste en DB
- Guard de tipo `typeof rawToken !== 'string'` añadido tanto en `hashToken()` como en el Server Component de la página

**Flujo de activación:**
- La success page `/parent-checkout/success` es **completamente pasiva** — solo muestra texto, no llama ninguna API, no crea ningún entitlement. El comentario en el código lo dice explícitamente: `// This page is intentionally passive`.
- El único lugar que crea `user_entitlements` es el webhook `POST /api/stripe/webhook` en `handleCheckoutCompleted()`.
- Idempotencia del webhook: comprueba `user_entitlements` por `stripe_checkout_session_id` antes de insertar. Stripe puede llamar el webhook varias veces; solo la primera crea el entitlement.

**`checkout.session.expired`:**
- El handler `handleCheckoutExpired` actualiza el link a `status = 'expired'` **solo si el status está en** `['checkout_started', 'opened', 'created']`. Los links `paid` **no se tocan**. Correcto.

**Expiración Stripe vs link de padre:**
- Link de padre: 7 días (`LINK_TTL_SECONDS = 7 * 24 * 60 * 60`)
- Stripe Checkout Session: `now + 30 minutos` hardcodeado — correcto (Stripe rechaza > 24h)
- Si la sesión expira, el padre puede volver al mismo link y se genera una nueva sesión

**`billing/supabase.ts`:** Solo importado en archivos de API route y en el Server Component de parent-checkout. Ningún cliente. Correcto.

**`tokens.ts`:** Solo importado en `parent-checkout/[token]/page.tsx` (Server Component) y dos API routes. Ningún cliente.

**Claves hardcodeadas:** Ninguna encontrada en código fuente.

---

## Onboarding Day 1

**Flujo:** 4 pasos → pantalla de generación (2,4s) → 3 tareas de activación → tiny win → diagnóstico soft → CTA de padres.

**Qué se guarda en Supabase:**
- `camino_route_settings`: `route_id` + `entry_date` (UPSERT por `user_id`) via `POST /api/onboarding/setup`
- `billing_events`: `event_type = 'onboarding_completed'` con payload `{community, daily_minutes, start_mode, route_id}`
- Las 3 tareas de activación se completan via `POST /api/camino/complete-task` exactamente igual que misiones normales (con idempotencia incluida)

**Qué se guarda solo en localStorage (`kairo_onboarding_v1`):**
- `community`, `subjects`, `dailyMinutes`, `startMode`, `completedAt`

**Reutilización de Magic Parent Checkout:** Correcto. `ParentLinkModule` se importa sin modificaciones desde `app/components/camino/ParentLinkModule.tsx`. Recibe `billing` de `useBillingStatus()`. El flujo completo de link → Stripe → webhook es idéntico al de `/camino`.

**CTA final → `/camino`:** El botón "Ver mi Camino completo" hace `router.push('/camino')`.

**Comportamiento con Pack activo:** `ParentLinkModule` detecta `billing.hasActivePack === true` y muestra "Pack Curso PAU activo" en lugar del módulo de generación de link. Correcto.

**Repetibilidad sin duplicar XP:** Las tareas `ob-flash-1`, `ob-test-1`, `ob-open-1` tienen idempotencia via `camino_task_completions (user_id, task_id, mission_date)`. Si el usuario repite el onboarding el mismo día, el API retorna `alreadyCompleted: true` y no suma XP. Si lo repite otro día, sí suma XP de nuevo (comportamiento de cualquier misión normal — no es un problema).

**`isOnboardingComplete()` no se usa como guard:** Ningún componente fuera de `onboardingStorage.ts` llama a `isOnboardingComplete()` para redirigir. Si un usuario vuelve a `/onboarding` tras completarlo, el wizard empieza desde el paso 1.

---

## Seguridad

| Punto | Estado |
|---|---|
| Autenticación de endpoints | ✅ Todos los endpoints de escritura usan Bearer token verificado server-side con `getAuthContext()` o `getAuthUser()` |
| `SUPABASE_SERVICE_ROLE_KEY` en cliente | ✅ No expuesto. Solo en archivos server-only (`/api/`, `/lib/billing/`, `/lib/camino/*Server.ts`). Sin `'use client'` ni `NEXT_PUBLIC_` prefix |
| Token de padre en texto plano | ✅ Solo hash SHA-256 en DB. Raw token viaja una vez en URL |
| Success page activa acceso | ✅ No. Completamente pasiva |
| Solo webhook activa entitlements | ✅ Verificado. Un único lugar en el código crea `user_entitlements` |
| Acceso por `?admin=true` | ✅ No existe ningún mecanismo de este tipo |
| Admin gate | ✅ `isInternalUser()` basado en lista de emails de env var, no en query param ni claim del cliente |
| Cross-user data access | ✅ Todos los endpoints de Camino usan RLS via JWT del usuario autenticado |
| Endpoint público sin auth requerida | ✅ Correcto por diseño: `/parent-checkout/[token]` es pública, acceso por token opaco |

**Punto de atención (no crítico):** `billing/supabase.ts` y `tokens.ts` no tienen `import 'server-only'`. Dependen de convención (comentario en archivo) para no ser importados en cliente. Si alguien importa accidentalmente uno de estos en un cliente component, TypeScript no lo detectaría — solo fallaría en runtime.

---

## Mocks o partes locales detectadas

### Mock crítico: `createInitialProgress()` en `caminoProgress.ts`

```typescript
// líneas 25-32 de app/lib/camino/caminoProgress.ts
xpTotal: 1840,
streakDays: 6,
levelBySubject: { mates: 8, historia: 5, ingles: 6 },
progressTowardsPau: 34
```

Esto es el **estado por defecto cuando no hay localStorage** (usuario nuevo sin sesión, o primera carga antes de que llegue Supabase). En la práctica, para usuarios autenticados, `useCaminoProgress` sobrescribe estos valores con los datos reales de Supabase en el primer fetch. Pero un usuario nuevo que abre `/camino` sin estar logueado verá `1840 XP`, `racha 6 días` y `nivel 8 de mates` — datos inventados.

### Tareas de onboarding hardcodeadas

Los 3 `ONBOARDING_TASKS` en `OnboardingFlow.tsx` son estáticos, no se adaptan a la comunidad o asignaturas elegidas por el usuario. Adecuado para MVP.

### XP del onboarding: inconsistencia client/server

| Tarea | XP mostrado en UI | XP guardado en DB |
|---|---|---|
| `ob-flash-1` (flashcard) | 15 | 15 ✅ |
| `ob-test-1` (test) | 10 | 10 ✅ |
| `ob-open-1` (correccion_ia) | **20** | **30** ⚠️ |

El servidor usa `TASK_TYPE_XP_MAP['correccion_ia'] = 30` pero la UI muestra 20. El usuario recibe más XP del que se le muestra.

---

## Riesgos P0

### P0-1: Mismatch de nombre de variable de entorno

`.env.local` tiene `SUPABASE_SERVICE_KEY`. Todo el código usa `process.env.SUPABASE_SERVICE_ROLE_KEY`. En local, este valor es `undefined`. Consecuencias:

- `billing/supabase.ts → createServiceClient()` **lanza excepción** → el webhook, `billing/me`, parent-link y parent-session fallan en local
- `caminoProgressServer.ts → createServiceSupabase()` retorna `null` → reset falla silenciosamente en local
- `caminoWeakAreasServer.ts` retorna `null` → weak areas vacías en local

**En producción (Vercel):** Si Vercel tiene `SUPABASE_SERVICE_ROLE_KEY` configurado correctamente, funciona. Necesita verificación explícita en el panel de Vercel. Si Vercel también tiene solo `SUPABASE_SERVICE_KEY`, el webhook nunca ha funcionado y ningún pago ha activado acceso.

**Acción requerida:** Verificar en Vercel → Settings → Environment Variables que existe `SUPABASE_SERVICE_ROLE_KEY` (nombre exacto). Si no, añadirla y hacer redeploy antes de cualquier prueba de pago.

---

## Riesgos P1

### P1-1: `createInitialProgress()` con datos fake visibles
Un usuario nuevo que visita `/camino` sin sesión activa verá XP=1840, racha=6, nivel 8. Antes de enseñar la app a usuarios reales hay que cambiar los valores a cero o mostrar un estado vacío explícito.

**Archivo:** `app/lib/camino/caminoProgress.ts` líneas 25-32

### P1-2: Sin redirect en `/onboarding` para usuarios que ya completaron el flujo
`isOnboardingComplete()` existe en `onboardingStorage.ts` pero ningún componente la llama como guard. Si un usuario ya completó el onboarding y vuelve a `/onboarding`, ve el wizard desde el principio.

**Archivo:** `app/components/onboarding/OnboardingFlow.tsx` — falta `useEffect` inicial que compruebe y redirija.

### P1-3: XP del onboarding optimista sin reconciliación
En `OnboardingFlow.tsx`, `xpEarned` solo se actualiza localmente. Si la llamada a `complete-task` falla en silencio, la pantalla de tiny win muestra XP incorrecto respecto a Supabase.

### P1-4: `useBillingStatus` se carga desde el paso 1 del onboarding
El hook hace fetch a `/api/billing/me` aunque el usuario esté en el primer paso. Carga innecesaria y 401 silencioso si no está autenticado.

### P1-5: Sin `server-only` guard en `billing/supabase.ts` y `tokens.ts`
Si en el futuro alguien importa accidentalmente estos módulos en un cliente component, `SUPABASE_SERVICE_ROLE_KEY` se intentaría usar en el navegador. TypeScript no lo previene — solo fallaría en runtime.

**Solución:** Añadir `import 'server-only'` como primera línea de ambos archivos.

### P1-6: `level_historia` y `level_ingles` nunca se incrementan
En `complete-task`, solo `level_mates` sube al completar una misión. `level_historia` y `level_ingles` se inicializan a 1 y nunca suben en Supabase.

**Archivo:** `app/api/camino/complete-task/route.ts` línea ~188

---

## Riesgos P2

### P2-1: Streak calculado solo al completar la misión completa
Si un usuario completa 3 de 4 tareas y cierra el navegador, la racha no sube. Al día siguiente se rompe aunque hubiera progreso real. Esperado para MVP pero puede frustrar a usuarios.

### P2-2: `progress_towards_pau` crece +1 por tarea individual
El contador puede crecer más rápido de lo esperado si hay muchas tareas por misión. No tiene techo semántico más allá de `Math.min(100, ...)`.

### P2-3: Streak usa fechas UTC; usuarios en UTC+1/+2 pueden romper racha accidentalmente
`getYesterday()` compara en UTC. Un usuario español que completa una misión a las 23:50 local (21:50 UTC) y la siguiente a las 00:10 local siguiente día (22:10 UTC, mismo día UTC) podría romper la racha.

**Archivo:** `app/lib/camino/caminoProgressServer.ts` — `getYesterday()` y `isDateWithinWindow()`

### P2-4: `camino_route_settings.entry_date` se sobrescribe en cada onboarding
Si un usuario hace onboarding de nuevo, `entry_date` vuelve a hoy y el currículum vuelve a semana 1. Solución: ignorar el UPSERT si ya existe `entry_date` con antigüedad suficiente.

### P2-5: `INTERNAL_USER_EMAILS` no está en `.env.local`
El reset endpoint retorna 403 para cualquier email en local. Bajo impacto (solo testing interno).

### P2-6: Evento `onboarding_completed` en `billing_events` no se registra si falla el service role
El try/catch absorbe el error silenciosamente. Si P0-1 no está resuelto, este evento nunca llega a Supabase.

---

## Checklist QA antes de enseñar la app a 3 usuarios reales

### Requisito previo (antes de todo)
- [ ] Verificar en Vercel → Settings → Environment Variables que existe `SUPABASE_SERVICE_ROLE_KEY` (nombre exacto, no `SUPABASE_SERVICE_KEY`)
- [ ] Si no existe con ese nombre, añadirla y hacer redeploy antes de cualquier prueba

### Onboarding nuevo
- [ ] Abrir `/onboarding` sin sesión activa — ver paso 1 renderizado en móvil
- [ ] Completar los 4 pasos — verificar que cada selección persiste al avanzar
- [ ] Confirmar pantalla "Creando tu Camino PAU…" ~2,4s con 3 checks animados
- [ ] Completar las 3 tareas — verificar barra de progreso avanza
- [ ] Verificar que la tarea de respuesta abierta requiere texto para habilitarse
- [ ] Completar las 3 tareas — confirmar pantalla tiny win con XP total
- [ ] En Supabase: verificar fila en `camino_route_settings` con `route_id` correcto según `startMode`
- [ ] En Supabase: verificar fila en `billing_events` con `event_type = 'onboarding_completed'`
- [ ] Verificar que CTA "Ver mi Camino completo" redirige a `/camino`

### Camino PAU (usuario autenticado)
- [ ] Abrir `/camino` logueado — confirmar que XP, racha y nivel muestran datos reales de Supabase (no el fallback fake 1840/6/8)
- [ ] Completar una tarea — confirmar que en Supabase aparece fila en `camino_task_completions`
- [ ] Completar todas las tareas del día — confirmar streak incrementado
- [ ] Completar la misma tarea dos veces — confirmar que XP no se duplica

### Usuario sin Pack activo
- [ ] En `/camino` y en tiny win de onboarding: verificar que `ParentLinkModule` muestra módulo de "Enviar a mis padres"
- [ ] Generar link — verificar en Supabase: `parent_checkout_links` con `token_hash` (no raw token), `status = 'created'`

### Pago Stripe test completo
- [ ] Abrir link generado en navegador privado — verificar página pública con nombre del alumno
- [ ] Completar pago con tarjeta `4242 4242 4242 4242`
- [ ] Confirmar redirección a `/parent-checkout/success` — página pasiva, no activa nada
- [ ] En Supabase: `user_entitlements` con `status = 'active'` y `source = 'stripe_parent_checkout'`
- [ ] En Supabase: `parent_checkout_links` con `status = 'paid'`
- [ ] En Supabase: evento `checkout_completed` en `billing_events`

### Usuario con Pack activo
- [ ] Recargar `/camino` — confirmar badge "Pack Curso PAU activo" en `ParentLinkModule`
- [ ] En tiny win de onboarding: confirmar que `ParentLinkModule` muestra "Pack activo"

### Logout / Login
- [ ] Cerrar sesión — abrir `/camino` — confirmar que no muestra datos de otro usuario
- [ ] Iniciar sesión con otra cuenta — confirmar que se cargan los datos correctos

### Móvil
- [ ] Abrir `/onboarding` en móvil — verificar scroll, tap en opciones, textarea funcional
- [ ] Abrir `/camino` en móvil — verificar layout y botones táctiles

---

## Conclusión

Los tres sprints están correctamente implementados, el build pasa limpio y la arquitectura de seguridad es sólida: token nunca en texto plano, success page pasiva, entitlements solo por webhook, RLS aplicada vía JWT, service role nunca expuesto al cliente. El riesgo crítico a resolver **antes de cualquier prueba real de pago** es verificar el nombre exacto de `SUPABASE_SERVICE_ROLE_KEY` en Vercel — si no está configurado con ese nombre exacto, el webhook de Stripe no activará entitlements y ningún pago desbloqueará acceso. El resto son riesgos de pulido (datos fake visibles, inconsistencia de XP en onboarding, falta de redirect al repetir onboarding) que no rompen cobros ni acceso pero deben resolverse antes de beta privada.
