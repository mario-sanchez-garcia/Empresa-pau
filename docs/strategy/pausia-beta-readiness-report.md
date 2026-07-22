# Kairo Beta Readiness Report

Informe interno de preparación para beta cerrada, estabilidad técnica, monetización y próximos pasos.

Fecha: 2026-06-17  
Modo: Solo lectura  
Resultado build: passed  
Resultado lint: failed  
Último commit auditado: 9b62edf fix(camino): remove pau-guide mascot image from MissionCard badge row

## Resumen para el equipo

- Kairo está cerca de una beta cerrada.
- No está todavía lista para cobrar.
- La prioridad no es añadir features, sino estabilizar.
- Los principales riesgos son lint, CSP, RLS real en producción, pricing inconsistente, datos oficiales y costes IA.
- El siguiente paso recomendado es atacar el primer P0.

## 1. Estado ejecutivo

Kairo ya tiene muchísimo producto real: Exámenes, Simulacros, Chat, Planning, Camino PAU, Onboarding, Pricing, Admin, Stripe y Supabase. Para beta cerrada está cerca. Para beta pública todavía hay riesgos claros.

Veredicto corto: beta cerrada sí, usuarios de pago todavía no.

El mayor problema no es que falten features, sino estabilidad, deuda técnica y consistencia:

- `app/page.tsx` tiene más de 3600 líneas y concentra demasiada lógica.
- `npm run build` pasa.
- `npm run lint` falla con 619 problemas, aunque muchos vienen de carpetas locales `.agents/`.
- Hay riesgo alto de bundle pesado porque Exámenes importa todos los datos al cliente.
- La seguridad ha mejorado bastante: APIs IA protegidas con Bearer token, rate limits, RLS y Stripe webhook correcto.
- Todavía falta una capa seria de integridad: algunos datos como historial/notas/progreso se pueden crear desde cliente o confiar demasiado en payloads del usuario.

## 2. Comandos ejecutados

- `git status -sb`: limpio en tracked, con untracked locales.
- `git status --short`: solo untracked.
- `git log --oneline -8 --decorate`: último commit `9b62edf fix(camino): remove pau-guide mascot image from MissionCard badge row`.
- `git branch -vv`: `main` alineada con `origin/main`.
- `git remote -v`: GitHub `Empresa-pau.git`.
- `npm run build`: passed.
- `npm run lint`: failed.
- `npm run test`: no existe script `test`.

Untracked actuales durante la revisión:

- `.agents/`
- `.claude/`
- `app/globals.css.bak`
- `docs/beta/rehearsal-final-report.md`
- `skills-lock.json`

## 3. Arquitectura actual

Rutas principales:

- `/`: Exámenes, Chat, Historial y Planning dentro del cliente principal.
- `/simulacros`: creación de simulacros.
- `/simulacros/[id]`: simulacro activo.
- `/simulacros/[id]/results`: resultados.
- `/zona` y `/zona/canvas`: La Zona.
- `/camino`: Camino PAU.
- `/onboarding`: onboarding.
- `/landing`, `/pricing`, `/login`, `/settings`, `/admin`, `/parent-checkout`.

APIs principales:

- `/api/chat`
- `/api/planning`
- `/api/simulacro`
- `/api/onboarding/setup`
- `/api/camino/*`
- `/api/billing/me`
- `/api/checkout/*`
- `/api/stripe/webhook`
- `/api/admin/*`

Auth:

- Cliente Supabase en `app/lib/supabase.ts`.
- APIs IA usan Bearer token.
- Admin usa allowlist interna por email.
- Stripe usa server-side y webhook firmado.

## 4. Build

`npm run build`: passed.

Next generó correctamente 28 páginas. No hay crash de producción detectable por build en este estado local.

## 5. Lint

`npm run lint`: failed.

Problemas:

- Muchos errores vienen de `.agents/`, que no debería entrar en lint.
- Errores reales en `components/zona/canvas/CanvasBoard.tsx`.
- Errores reales en `components/zona/canvas/useCanvas.ts`.
- Principalmente reglas de React Hooks por refs leídos durante render.
- `useCanvas.ts` tiene `set-state-in-effect`.

Prioridad: alta antes de beta pública.

## 6. Seguridad

Fortalezas:

- `/api/chat`, `/api/planning` y `/api/simulacro` están protegidas con Bearer token.
- Existe rate limiting con `ai_usage_events`.
- Usuarios internos se excluyen mediante allowlist.
- Stripe webhook verifica firma.
- Checkout tiene rate limit.
- RLS existe en tablas importantes.

Riesgos:

- No he visto CSP fuerte en `next.config.ts`.
- Root client puede insertar historial propio; RLS protege propiedad, pero no integridad.
- Camino PAU puede confiar demasiado en datos enviados desde cliente para XP/tareas.
- Si `SUPABASE_SERVICE_ROLE_KEY` se usara mal en un cliente sería crítico, aunque no he visto evidencia directa.
- `.env.local` existe localmente; confirmar que nunca está tracked.

## 7. Capturas de seguridad

Las capturas mencionan:

- API keys expuestas en cliente.
- Falta de rate limiting.
- RLS desactivado.
- Secrets pusheados.
- CORS demasiado abierto.

Estado Kairo:

- API keys privadas: parcialmente bien. Anthropic/Stripe secret están server-side. Supabase anon key sí está en cliente y eso es normal, pero requiere RLS correcto.
- Rate limiting: bastante mejorado en APIs IA y checkout.
- RLS: hay migraciones con RLS para historial, simulacros, flashcards, canvas, camino y billing.
- Secrets en Git: no puedo garantizar historial remoto completo sin auditoría de secretos, pero `.env.local` no aparece tracked ahora.
- CORS: no he visto un CORS peligroso explícito, pero falta una política CSP/headers más completa.

Conclusión: cumple bastante mejor que una app vibe-coded típica, pero no a la perfección hasta hacer hardening.

## 8. IA y costes

Entry points IA:

- `app/api/chat/route.ts`: `claude-sonnet-4-6`, `max_tokens: 4000`.
- `app/api/planning/route.ts`: `claude-sonnet-4-6`, `max_tokens: 2000`.
- `app/api/simulacro/route.ts`: `claude-sonnet-4-6`, corrección por bloques, `max_tokens: 1800` por bloque.

Bien:

- Auth.
- Rate limits.
- Logging de eventos.

Riesgo:

- Coste estimado parece no calcularse de forma real en todos los eventos.
- Chat permite payload de imagen grande.
- Simulacro corrige varios bloques, coste alto por uso.

## 9. Supabase

Tablas/migraciones relevantes:

- `historial_examenes`
- `historial_simulacros`
- `flashcards`
- `canvases`
- `canvas_images`
- `ai_usage_events`
- `camino_*`
- `parent_checkout_links`
- `user_entitlements`
- `billing_events`

Bien:

- RLS generalizado.
- Storage privado para canvas.
- Billing server-side.

Pendiente:

- Revisar policies reales en Supabase producción.
- Validar que el service role solo se usa en server.
- No confiar en notas/historial enviados desde cliente para analíticas premium.

## 10. Stripe/Billing

Bien:

- Webhook con firma.
- Checkout tokenizado.
- Eventos de billing.
- Entitlements.

Problema importante:

- Pricing inconsistente:
  - `/pricing`: Premium previsto `7,99 €/mes`, Pack `19,99 €`.
  - Landing: `14,99 €/mes`.
  - Billing server: pack fundador `49 €`, estándar `79 €`.

Antes de cobrar, esto hay que unificar sí o sí.

## 11. UX/Product

Fuerte:

- Producto tiene mucha profundidad.
- Exámenes y Simulacros son el core correcto.
- Camino PAU puede ser diferencial.
- Onboarding serio mejorado.

Débil:

- Demasiadas secciones para beta si no están todas pulidas.
- La Zona/canvas parece experimental.
- Landing con shader puede ser bonita pero pesada.
- Hay inconsistencias de nombres: Planning, Mi Plan, Plan de estudio, Camino PAU.
- Falta una narrativa clara de qué hago primero.

## 12. Performance

Riesgo principal:

- `app/page.tsx` importa mucha data oficial en cliente.
- Datasets grandes como Lengua, Biología Cataluña y Exámenes cargan demasiado pronto.
- Landing usa animación WebGL/Three, potencialmente pesada.

Recomendación:

- Después de beta, separar Exámenes por asignatura/comunidad con imports dinámicos o endpoint server-side.

## 13. Datos oficiales

Hay muchos datos cargados, pero el escaneo detectó señales de placeholders en varios archivos:

- `app/data/examenes.ts`
- `app/data/quimica.ts`
- `app/data/lengua.ts`
- `app/data/ingles.ts`
- `app/data/historia_filosofia_madrid.ts`

No afirmo que sean falsos, solo que hay señales que deben revisarse manualmente antes de prometer 100% oficial.

## 14. Simulacros

Bien:

- Flujo existe.
- Corrección IA robustecida.
- Resultados tienen estructura.
- Rate limit existe.

Riesgos:

- `components/simulacros/data.ts` no incluye todas las asignaturas nuevas de forma equivalente.
- Historia de la Filosofía no parece incluida en simulacros.
- Cataluña no está completa para todos los subjects.
- Generación puede devolver null si no hay suficientes preguntas.

## 15. Camino PAU

Muy buena idea de producto.

Riesgos:

- Integridad de XP/tareas: el cliente puede influir demasiado.
- Necesita server-side source of truth para tareas válidas.
- Bien para motivación beta, no todavía para rankings/pagos/claims fuertes.

## 16. La Zona

Estado: experimental.

Riesgos:

- Lint real falla en canvas.
- Canvas toca muchos eventos, refs y estado complejo.
- No lo pondría como feature principal de pago todavía.

## 17. P0 antes de beta pública

- Arreglar lint o excluir `.agents/.claude` y corregir errores reales de Canvas.
- Añadir CSP/headers de seguridad más completos.
- Verificar RLS en Supabase producción tabla por tabla.
- Unificar pricing/copy.
- Revisar placeholders en datos oficiales.
- Reducir confianza en payloads cliente para Camino/historial/notas.
- Asegurar que Vercel tiene todas las env vars correctas.

## 18. P1 antes de cobrar

- Cost tracking real por modelo/tokens.
- Límite mensual premium/free consistente.
- Admin con métricas fiables.
- Terms/privacy/cookies revisados.
- Stripe pricing real alineado con landing/pricing/server.
- Tests mínimos para APIs críticas.
- Refactor ligero de `app/page.tsx`.

## 19. P2 más adelante

- Carga dinámica de datasets.
- Mejor QA mobile.
- Mejor sistema de búsqueda global.
- Exportaciones PDF/plan.
- Canvas colaborativo real.
- Rankings o streaks solo cuando la integridad esté blindada.

## 20. Roadmap recomendado

Semana 1:

- Seguridad básica: CSP, lint, RLS verification, env audit.
- Pricing coherente.
- QA de Exámenes/Simulacros.

Semana 2:

- Beta cerrada con 10-30 alumnos.
- Medir errores IA, coste por usuario y abandono.
- Pulir onboarding y Camino.

Semana 3:

- Preparar pago.
- Stripe end-to-end.
- Admin metrics fiables.
- Política clara de límites.

## 21. Veredicto final

Kairo tiene potencial real y ya parece mucho más que un prototipo. Pero ahora mismo la prioridad no es añadir más asignaturas ni más pantallas: es cerrar seguridad, estabilidad, coherencia de pricing y deuda técnica.

Recomendación directa: lanza una beta cerrada, no cobres todavía. Antes de cobrar, arregla lint, CSP, pricing, RLS audit real y tracking de costes IA.

Cambios realizados durante la auditoría original: ninguno.

## Próxima acción recomendada

La siguiente acción recomendada es atacar el primer P0: limpiar el pipeline de lint, excluir carpetas locales irrelevantes como .agents/ y .claude/, y corregir los errores reales en components/zona/canvas/CanvasBoard.tsx y components/zona/canvas/useCanvas.ts sin tocar funcionalidades de producto.
