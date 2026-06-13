# Beta Privada · QA Checklist

> Versión: beta privada interna · Fecha: junio 2026  
> Para ejecutar antes de cada invitación de usuario nuevo o despliegue relevante.

---

## 1. Autenticación

- [ ] El login redirige a `/camino` tras autenticarse correctamente.
- [ ] Un usuario no autenticado que accede a `/camino` es redirigido al login.
- [ ] Un usuario no autenticado que accede a `/onboarding` puede completar el flujo (modo local).
- [ ] El logout funciona y limpia la sesión.

---

## 2. Onboarding (`/onboarding`)

- [ ] El flujo completo (comunidad → asignaturas → tiempo → modo → generando → primera misión → tiny win) funciona sin errores.
- [ ] `localStorage` guarda correctamente `pausia_onboarding_v1` con los datos del wizard.
- [ ] La pantalla "Ya tienes tu Camino PAU creado" aparece si `isOnboardingComplete()` devuelve true.
- [ ] Las 3 tareas de activación muestran checkmark al completarse.
- [ ] El XP solo se suma visualmente si la API `/api/camino/complete-task` confirma la tarea (usuario autenticado).
- [ ] Si no hay conexión, aparece banner de advertencia (no bloquea el flujo).
- [ ] Al completar las 3 tareas, aparece la pantalla tiny win con el XP total.
- [ ] El botón "Ver mi Camino" en tiny win navega a `/camino`.

---

## 3. Camino PAU (`/camino`)

- [ ] Las métricas (XP, racha, nivel Mates, progreso PAU) se cargan correctamente desde Supabase.
- [ ] Si Supabase no está disponible, aparece banner "Modo local" y se usa localStorage como fallback.
- [ ] Las tareas del día se generan según la ruta y semana del currículum.
- [ ] Al completar una tarea aparece checkmark y el progreso de la misión actualiza.
- [ ] La barra de progreso de misión avanza correctamente.
- [ ] El selector de ruta (RouteCard) actualiza la misión del día al cambiar.
- [ ] El badge "En vivo" aparece solo cuando `source === 'supabase'`.
- [ ] El badge "Beta interna" aparece cuando `source === 'local'`.

---

## 4. Parent Checkout (`/parent-checkout/[token]`)

- [ ] Un enlace válido no expirado muestra la página de pago correctamente.
- [ ] Un enlace expirado o inválido muestra error (no la página de pago).
- [ ] El botón "Desbloquear Pack Curso PAU" redirige a Stripe Checkout.
- [ ] En Stripe Checkout se puede completar el pago con tarjeta de test (`4242 4242 4242 4242`).
- [ ] Tras el pago, la página de éxito (`/parent-checkout/success`) no activa ningún entitlement por sí sola.
- [ ] El webhook de Stripe crea el `user_entitlement` correctamente.
- [ ] Si el webhook falla, Stripe reintenta (status 500 retornado correctamente).
- [ ] La página de success tiene el enlace a `hola@pausia.es` y links legales.
- [ ] El footer legal (Privacidad, Términos, Reembolsos, Uso de IA, Contacto) está presente en la página de checkout.

---

## 5. Páginas legales

- [ ] `/legal/privacidad` carga y muestra el contenido correcto.
- [ ] `/legal/terminos` carga y muestra el contenido correcto.
- [ ] `/legal/reembolsos` carga y muestra el contenido correcto.
- [ ] `/legal/ia` carga y muestra el contenido correcto.
- [ ] `/contacto` carga y muestra los 5 bloques de contacto con email clickable.
- [ ] Los links de navegación entre páginas legales funcionan.

---

## 6. Seguridad

- [ ] Ninguna llamada a la API usa `SUPABASE_SERVICE_ROLE_KEY` en cliente (verificar Vercel env vars).
- [ ] El token del parent link solo existe como hash en DB (nunca plain text).
- [ ] Las rutas de API comprueban autenticación server-side (Bearer token Supabase).
- [ ] La success page de Stripe no activa entitlements.
- [ ] No hay `?admin=true` ni acceso por query param a funciones privilegiadas.

---

## 7. Build y despliegue

- [ ] `npm run build` pasa sin errores de TypeScript ni de Next.js.
- [ ] No hay warnings críticos de `import 'server-only'` en logs de build.
- [ ] Vercel tiene `SUPABASE_SERVICE_ROLE_KEY` (no `SUPABASE_SERVICE_KEY`) en variables de entorno.
- [ ] El despliegue en Vercel completa sin errores.
- [ ] Las páginas legales y `/contacto` responden correctamente en producción.

---

## 8. Smoke test de usuario nuevo

Secuencia de pasos para un usuario nuevo:
1. Registro de cuenta nueva → acceso a `/camino`.
2. Navegar a `/onboarding` → completar el wizard completo.
3. Completar las 3 tareas de activación → ver tiny win con XP.
4. Clic en "Ver mi Camino" → verificar que XP se refleja en `/camino`.
5. Probar el módulo de parent link → copiar enlace.
6. Abrir el enlace de padre/madre → verificar página de checkout.
7. Navegar a `/legal/privacidad` desde el footer del checkout.

---

## Notas

- La corrección automática de respuestas abiertas **no** está activa en beta: se guarda el texto pero no hay feedback de IA en tiempo real todavía.
- Los simulacros completos están disponibles pero la nota estimada puede variar hasta calibrar los modelos de IA.
- El "Modo local" en Camino PAU es esperado si el usuario no está autenticado o Supabase tiene latencia.

---

## Cómo actuar si algo falla durante beta

### 1. Usuario no puede completar onboarding

- Pregunta si ve algún mensaje de error en pantalla.
- Si el flujo se queda bloqueado: el estado se guarda en `localStorage` (`pausia_onboarding_v1`) — el usuario puede refrescar y continuar desde donde dejó.
- Si persiste: el usuario puede acceder directamente a `/camino` sin completar onboarding (el Camino funciona sin él).
- Revisa logs de Vercel para errores en `/api/onboarding/setup`.

### 2. Camino no sincroniza (badge "Beta interna" / "Modo local")

- Confirma que el usuario está autenticado (cerrar sesión y volver a entrar).
- Verifica en Supabase: tabla `camino_route_settings` → busca por `user_id`.
- Verifica en Supabase: tabla `camino_xp_events` → busca por `user_id`.
- Si hay errores 500 en Vercel, revisa variable `SUPABASE_SERVICE_ROLE_KEY`.
- El "Modo local" no es un error bloqueante: el progreso se guarda localmente y se puede sincronizar manualmente más adelante.

### 3. Simulacro no corrige / loading infinito

- El botón "Entregar examen" llama a `/api/simulacro` vía POST.
- Si hay loading infinito: algo salió mal en el catch que no llamó `setSubmitting(false)` — reportar como bug.
- Si hay error visible: el texto de la respuesta está guardado (`respuestas_parciales` en `historial_simulacros`), el usuario puede volver a intentar.
- Verifica en Supabase: tabla `historial_simulacros` → columnas `estado`, `resultado_json`, `respuestas_parciales`.
- Verifica logs Vercel para `SIMULACRO_CORRECTION_ERROR`.
- Si `ANTHROPIC_API_KEY` no está configurada en Vercel: el simulacro dará error inmediatamente.

### 4. Padre paga en test pero Pack no aparece

- Verifica en Stripe Dashboard (test mode) que el pago fue completado.
- Verifica en Supabase: tabla `user_entitlements` → busca por `user_id` del alumno.
- Verifica en Supabase: tabla `billing_events` → busca por email del alumno, evento `checkout_completed` o `checkout_entitlement_failed`.
- Verifica en Supabase: tabla `parent_checkout_links` → columna `status` debe ser `paid`.
- Si `user_entitlements` no existe pero `billing_events` tiene `checkout_entitlement_failed`: problema en webhook. Revisar Vercel logs con el `stripe_session_id`.
- **Si necesitas activar manualmente**: hazlo directo en Supabase insertando en `user_entitlements`. **No usar cobro live hasta que el webhook esté 100% verificado.**

### 5. Link padre expirado

- Los links tienen 7 días de caducidad por defecto.
- El usuario puede generar un nuevo link desde el Camino (módulo ParentLinkModule).
- En Supabase: tabla `parent_checkout_links`, columna `expires_at`.

### 6. Usuario ve Pack activo incorrectamente

- Verifica en Supabase: tabla `user_entitlements` → `is_active` debe ser `true` solo para usuarios que pagaron.
- Si hay un registro incorrecto: desactivar manualmente poniendo `is_active = false` en Supabase.
- **No borres registros** — solo desactiva.

### 7. Error 500 en Vercel

- Ir a Vercel Dashboard → Proyecto → Functions → Logs.
- Filtrar por ruta que falla (ej. `/api/camino/complete-task`).
- Los errores más comunes en beta:
  - `SUPABASE_SERVICE_ROLE_KEY` no configurada → todas las rutas que usan el cliente de servicio fallarán.
  - `ANTHROPIC_API_KEY` no configurada → simulacros y chat fallarán.
  - `STRIPE_WEBHOOK_SECRET` incorrecto → webhook fallará con 400.

### 8. Cómo mirar logs en Vercel

1. Dashboard Vercel → selecciona el proyecto.
2. Tab "Logs" (o "Functions" en el menú lateral).
3. Filtra por timestamp o por ruta (ej. `/api/stripe/webhook`).
4. Busca los prefijos de error: `SIMULACRO_CORRECTION_ERROR`, `[stripe/webhook]`, `CAMINO_`, etc.

### 9. Tablas clave en Supabase

| Tabla | Para qué sirve | Qué mirar |
|-------|----------------|-----------|
| `parent_checkout_links` | Links de pago generados por alumnos | `status` (created/opened/paid/expired), `token_hash`, `expires_at` |
| `user_entitlements` | Accesos activos al Pack Curso PAU | `is_active`, `plan_id`, `stripe_checkout_session_id`, `activated_at` |
| `billing_events` | Log de todos los eventos de pago | `event_type`, `user_id`, `metadata`, `created_at` |
| `camino_task_completions` | Tareas del Camino completadas | `user_id`, `task_id`, `mission_date`, `xp_earned` |
| `camino_xp_events` | Historial de XP ganado | `user_id`, `xp_delta`, `source`, `created_at` |
| `historial_simulacros` | Simulacros realizados | `estado`, `resultado_json`, `nota_final`, `respuestas_parciales` |

### 10. Qué NO hacer durante beta

- **No toques datos a ciegas** — siempre busca por `user_id` específico.
- **No reenvíes secretos** ni claves por email, Slack o mensajes no cifrados.
- **No actives cobro live** (Stripe live mode) hasta tener legal definitivo y webhook probado en producción.
- **No borres registros** en `billing_events` o `user_entitlements` — desactiva, nunca borres.
- **No hagas `DELETE` masivo** en ninguna tabla sin backup previo.
- **No hagas `UPDATE` masivo** a ciegas — siempre filtra por `user_id` o `id` concreto.
