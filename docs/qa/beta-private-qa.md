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
