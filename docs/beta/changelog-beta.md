# Changelog · Beta Privada Pausia

> Historial de cambios y sprints desde el inicio del desarrollo hasta la beta privada.  
> Formato: `[SPRINT] · Fecha aproximada · Descripción`

---

## [Sprint 4] Pre-Beta Hardening — Junio 2026

### Páginas legales
- Creadas `/legal/privacidad`, `/legal/terminos`, `/legal/reembolsos`, `/legal/ia`, `/contacto`
- Footers con links legales añadidos en parent checkout, success page y pricing

### Copy responsable
- `'Correcciones IA ilimitadas'` → `'Correcciones IA con uso razonable'` en planes
- Garantía de reembolsos: eliminada frase "sin preguntas", añadido email de contacto + link a política
- Añadido disclaimer de IA orientativa en página de checkout

### Error states
- Onboarding: banner de advertencia si `/api/onboarding/setup` falla (no bloquea flujo)
- Onboarding: XP solo se suma visualmente si la API confirma la tarea (usuario autenticado)
- Onboarding: banner de error de tarea si `complete-task` falla
- Camino PAU: banner "Modo local" si Supabase no está disponible al cargar
- Camino PAU: fix de fallback a localStorage cuando Supabase falla (antes usaba zeros)

### Documentación
- Creado `docs/qa/beta-private-qa.md` con checklist de QA para beta privada
- Creado `docs/beta/changelog-beta.md` (este archivo)

---

## [Sprint 3b] Stripe Webhook P0 Fix — Junio 2026

### Fix crítico: atomicidad de webhook
- `handleCheckoutCompleted` ahora crea `user_entitlements` **antes** de marcar `parent_checkout_links` como `paid`
- Si la creación del entitlement falla → status 500 → Stripe reintenta automáticamente
- Idempotencia: si el entitlement ya existe, repara el link si hace falta y retorna sin error
- Log de evento `checkout_entitlement_failed` cuando falla la creación del entitlement

---

## [Sprint 3] Hardening Pre-Beta — Mayo-Junio 2026

### Seguridad server-only
- Añadido `import 'server-only'` en `app/lib/billing/supabase.ts` y `app/lib/billing/tokens.ts`
- Build-time error si estos módulos se importan accidentalmente en client components

### Datos honestos
- `createInitialProgress()` devuelve ceros reales (antes devolvía valores de demo)

### Onboarding guard
- `OnboardingFlow` comprueba `isOnboardingComplete()` al montar y muestra pantalla "ya tienes tu camino" si true

### Entorno
- Creado `.env.example` con todos los vars necesarios y comentario explícito sobre `SUPABASE_SERVICE_ROLE_KEY`
- `.gitignore` actualizado para trackear `.env.example`

---

## [Sprint 2] Onboarding Day 1 — Mayo 2026

### Wizard de onboarding (`/onboarding`)
- 4 pasos: comunidad autónoma → asignaturas → minutos diarios → modo de inicio
- Pantalla "Creando tu Camino PAU…" con 3 checks animados
- Primera misión: 3 tareas de activación (flashcard, test, correccion_ia)
- Tiny win screen: XP celebration + diagnóstico soft + Parent Link Module
- Persistencia en `localStorage` via `pausia_onboarding_v1`
- POST a `/api/onboarding/setup` → upsert en `camino_route_settings`

### Arquitectura
- `app/lib/onboarding/onboardingStorage.ts` — helper de localStorage + `startModeToRouteId()`
- `app/onboarding/OnboardingClient.tsx` — wrapper `'use client'` para `ssr: false`
- `app/onboarding/page.tsx` — Server Component con metadata

---

## [Sprint 1] Magic Parent Checkout — Abril-Mayo 2026

### Flujo completo de pago por padres/madres
- `parent_checkout_links`: token_hash (SHA-256), expiración, estado (created/opened/paid/expired)
- `/parent-checkout/[token]` — página de checkout tokenizada con info del alumno
- `/api/checkout/parent-session` — crea sesión Stripe con metadata del alumno
- `/parent-checkout/success` — página pasiva (no activa entitlement)
- Webhook Stripe → crea `user_entitlements` con idempotencia via `stripe_checkout_session_id`
- `ParentLinkModule` — componente reutilizable para generar y compartir el enlace

### Seguridad
- Token nunca almacenado en texto plano (solo SHA-256 hash)
- Success page intencionalmente pasiva
- Webhook único activador de entitlements

---

## [Sprint 0] Camino PAU — Marzo-Abril 2026

### Motor de misiones
- 38 semanas de currículum PAU organizado por rutas: `completa`, `ajustada`, `acelerada`, `intensiva`
- `getMissionForDate()` — genera tareas del día según ruta, semana de entrada y áreas débiles
- Rutas seleccionables desde RouteCard
- `useCaminoProgress` hook — estado del progreso con sync Supabase + fallback localStorage

### Progreso
- XP, racha, niveles por asignatura, progreso hacia PAU
- Misiones diarias con múltiples tipos de tarea: flashcard, test, correccion_ia, simulacro
- `/api/camino/complete-task` — endpoint de completado con server-side XP

### UI
- CaminoPauClient con header, métricas, tareas del día, selector de ruta, próximos objetivos
- Sidebar de navegación
- Badge de fuente: "En vivo" (Supabase) / "Beta interna" (local)

---

## Deuda técnica conocida

| Prioridad | Descripción |
|-----------|-------------|
| P1 | `level_historia` y `level_ingles` no incrementan en `complete-task` |
| P1 | XP en tiny-win es optimista — no reconcilia si todas las llamadas fallan |
| P2 | `useBillingStatus` se carga desde el primer paso del onboarding (fetch innecesario) |
| P2 | No hay feedback de IA real-time en respuestas abiertas todavía |

---

## Variables de entorno requeridas

Ver `.env.example` en la raíz del proyecto.  
**CRÍTICO**: en Vercel debe llamarse `SUPABASE_SERVICE_ROLE_KEY` (no `SUPABASE_SERVICE_KEY`).
