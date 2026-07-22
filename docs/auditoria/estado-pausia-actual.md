# Auditoría de Estado — Kairo

Fecha de revisión: 2026-07-05  
Repo revisado: `C:\Users\ZEROCITY\Documents\GitHub\Empresa-pau`  
Últimos commits revisados: hasta `cf65667 fix(camino): trim ranking to 4 rows, remove mi liga section, align column heights`

## 1. Resumen ejecutivo

Kairo ya tiene una base de producto real: login, onboarding, Camino PAU, cursos por tema, ejercicios PAU/EVAU, corrección IA, historial, simulacros, Chat, La Zona, Stripe test mode, Supabase y smoke tests P0. El producto ha avanzado mucho desde la auditoría de junio: Camino PAU ya es la pantalla principal tras login, usa fecha real, permite navegación semanal, incorpora parciales y tiene una capa nueva de calendario/cola en Supabase.

El estado no es todavía "beta pública lista". La razón principal no es falta de pantallas, sino consistencia y QA: Camino tiene dos lógicas conviviendo (cliente/local y Supabase), el mapeo EVAU por tema funciona con heurísticas y fallbacks, los límites de plan existen pero no están cerrados como sistema único de billing/uso, y quedan validaciones manuales críticas de correcciones IA, simulacros, onboarding real y Stripe live.

Recomendación corta: sí se puede preparar una beta cerrada controlada con 3-5 alumnos, pero no abrir beta pública ni cobro real hasta cerrar QA P0.

## 2. Estado actual del producto

| Área | Estado | Comentario |
|---|---|---|
| Login y redirección | ✅ Funciona | `/login` redirige a Camino según cambios recientes; el flujo de producto se centra en `/camino`. |
| Onboarding | 🟡 Parcial | Guarda comunidad, asignaturas, centro y preferencias; existe `/api/onboarding/generate`, pero hay que validar que todo usuario nuevo genera cola/calendario correcto. |
| Camino PAU | 🟡 Parcial | Es el motor principal visual y funcional, con fecha real, semanas, parciales y límites; conviven lógica local y lógica Supabase. |
| Cursos / Temario guiado | 🟡 Parcial | Hay rutas refrescables por tema, contenido Markdown/LaTeX y corrección; cobertura fuerte en Matemáticas y CCSS, más desigual en otras materias. |
| Ejercicios PAU/EVAU | 🟡 Parcial | `getRandomEvauExerciseForMission` enruta por asignatura/bloque/tema y evita repetición reciente, pero usa heurísticas y fallback por asignatura. |
| Corrección IA | ✅ Funciona | Texto e imagen pasan por `/api/chat`, con auth, rate limit, streaming/truncation y MathMarkdown. Requiere QA manual amplia. |
| Historial | ✅ Funciona | Guarda correcciones completas y evita guardar truncadas según smoke P0. |
| Simulacros | 🟡 Parcial | Simulacros y práctica por parcial existen; la corrección por bloques reduce riesgo de timeout, pero requiere QA manual. |
| Chat con Kairo | ✅ Funciona | Chat autenticado, con imagen, rate limit y reglas de formato/LaTeX. Contexto por tema existe desde curso. |
| La Zona | ✅ Funciona | Flashcards/canvas existen; no es el motor principal de Camino. |
| Stripe / pagos | 🟡 Parcial | Parent checkout test mode está documentado como OK; falta live mode, legal definitivo y unificar pricing/copy. |
| Supabase / migraciones | 🟡 Parcial | Hay migraciones para historial, simulacros, Camino, billing, curriculum, signup y Why; falta validar policies reales en producción. |
| QA / smoke | ✅ Funciona | `npm run smoke` existe y cubre P0 de correcciones, Camino, EVAU y Stripe. No sustituye QA manual. |

## 3. Qué funciona hoy

- Camino PAU existe como experiencia principal y aparece como destino tras login.
- El calendario ya no depende de fechas demo de junio: usa fecha real, semana actual y navegación semanal.
- Camino filtra misiones por asignaturas del onboarding y evita tareas visibles tipo flashcards o "corrige un error" como misión principal.
- Las misiones de curso abren páginas reales tipo `/camino/tema/[subject]/[block]/[topic]`.
- Las páginas de curso usan `MathMarkdown`, muestran explicación, ejemplo, práctica y permiten corregir con Kairo.
- El XP no se concede por leer: se vincula a completar/corregir misiones.
- Las misiones EVAU usan `getRandomEvauExerciseForMission`, con asignatura normalizada, keywords por tema y lista reciente para evitar repetir.
- La corrección IA por texto e imagen funciona con auth, rate limit, truncation sentinel, logging de uso y normalización LaTeX.
- Historial evita guardar correcciones truncadas y conserva `why_it_works` cuando existe.
- Simulacros completos y práctica parcial existen; hay `blockFilter` y ruta `/simulacros/practica/[id]`.
- Stripe parent checkout tiene token hash, webhook firmado, idempotencia por session id y QA en test mode documentado.
- Existen smoke tests P0 y docs QA para correcciones, Stripe, beta privada y Camino.

## 4. Qué está parcial o inestable

- Camino PAU tiene dos capas de planificación:
  - `CaminoCalendarClient.tsx`: cliente/local, onboarding amplio, semana navegable, límites, parciales y misiones por tema.
  - `ensureCaminoCalendar.ts` + tablas nuevas: server/Supabase, horizonte de 14 días, cola `user_learning_queue`, actualmente más cerrado a `matematicas_ii` e `historia_espana`.
- El selector de asignaturas del onboarding es más amplio que la capa server de cola/calendario. Riesgo: un usuario elige Física/Química/Inglés y parte del motor server no le genera el mismo nivel de contenido.
- El mapeo PAU/EVAU por tema es razonable, pero no perfecto: usa keywords y puede caer en `subject_fallback`.
- "No lo he dado en clase" tiene lógica local y API/documentación, pero falta comprobar el ciclo completo por centro real: marcar tema, persistir ajuste, regenerar calendario y no volver a mostrarlo.
- Los límites de plan existen en `caminoPlanLimits.ts` y `/api/chat`, pero no hay una única capa completa que aplique todos los límites de forma homogénea en correcciones, fotos, parciales, simulacros y Camino.
- Pricing sigue siendo una zona sensible: hay plan mensual, pack curso, founding price y copy comercial que deben quedar alineados antes de cobrar.
- QA docs contienen checks manuales sin marcar; smoke P0 cubre código estático/contratos, no experiencia real en navegador.

## 5. Problemas críticos detectados

| Problema | Estado | Impacto |
|---|---|---|
| Convivencia de dos motores de Camino | 🔴 Crítico | Puede crear calendarios distintos según local/Supabase y romper la promesa de personalización. |
| Cobertura server limitada de asignaturas en Camino | 🔴 Crítico | Si el usuario elige materias no soportadas por la cola server, el plan puede sentirse falso o incompleto. |
| Routing EVAU con fallbacks | 🟡 Parcial | Si el tema no matchea bien, el alumno puede recibir un ejercicio real pero no del tema esperado. |
| QA manual insuficiente | 🔴 Crítico | Correcciones IA, simulacros, móvil, onboarding y Camino necesitan prueba con usuarios reales. |
| Stripe live no cerrado | 🔴 Crítico | No se debe cobrar hasta validar live mode, legal y copy/precios. |
| Integridad de XP/progreso | 🟡 Parcial | Hay mejoras server-side, pero docs previos ya señalaban riesgo de manipulación o duplicidad. |

## 6. Estado de Camino PAU

Camino PAU es ya el centro del producto, pero todavía debe considerarse parcial.

✅ Implementado:

- Pantalla principal `/camino`.
- Fecha real y semana actual.
- Navegación semanal: anterior, hoy, siguiente.
- Separación entre "hoy real" y "semana seleccionada".
- Misiones filtradas por asignaturas de onboarding.
- Misiones de curso y PAU/EVAU del mismo tema.
- Parciales: banner, práctica parcial y misiones inyectadas.
- Simulacros cercanos a parcial, con límite por plan en la capa cliente.
- Sustitución por ejercicios PAU si se alcanza límite de simulacros.
- Evita flashcards/historial/"corrige un error" como misión principal.
- Soporte para "tema no dado" mediante ajustes de centro/comunidad.
- Admin status de Camino y nuevas tablas/migración `20260701120000_create_camino_tables.sql`.

🟡 Parcial:

- La capa Supabase de `ensureCaminoCalendar.ts` solo considera `matematicas_ii` e `historia_espana` al formar la cola principal.
- Hay fallbacks locales importantes, esperados para beta, pero peligrosos si se confunden con producto cerrado.
- El calendario navega y persiste, pero la persistencia completa en Supabase y la regeneración multi-dispositivo necesitan QA.
- Las decisiones de "temario acabado", "bloque completo" y "errores débiles" existen, pero dependen de señales que deben validarse con historial real.

## 7. Estado de correcciones, chat e historial

✅ Corrección IA:

- `/api/chat` requiere auth, limita imágenes grandes y registra uso.
- Corrige texto e imagen, soporta streaming y no streaming.
- Tiene reglas explícitas de Markdown y LaTeX.
- `MathMarkdown` y `mathFormatting.ts` normalizan correcciones y enunciados.
- El smoke P0 cubre truncation, guardado de historial y render de "¿Por qué es así?".

🟡 Parcial:

- "¿Por qué es así?" está mejor conectado a teoría y conceptos, pero puede seguir variando según respuesta del modelo.
- Falta QA manual representativa: mínimo 15-30 ejercicios entre Matemáticas, CCSS, Física, Química, Historia/Filosofía, Lengua e Inglés.
- Las correcciones de imagen son costosas y tienen límite; hay que observar coste real con usuarios.

✅ Historial:

- Guarda correcciones completas.
- Evita guardar truncadas.
- Tiene columnas/migración para `why_it_works`, contexto y conceptos.

✅ Chat:

- Funciona con contexto textual y desde curso puede recibir tema/ejercicio.
- Input multilinea y render Markdown/LaTeX ya han sido tratados en smoke.

## 8. Estado de onboarding y personalización

✅ Funciona:

- Onboarding guarda comunidad, asignaturas, centro, disponibilidad y preferencias.
- Camino lee onboarding y usa `normalizeOnboardingSubjects`.
- Hay autocomplete/fallback de centro y perfil.
- Si falta perfil, Camino pide completarlo.

🟡 Parcial:

- Hay que validar usuario nuevo end-to-end: onboarding → generación de cola → calendario → misión → corrección → XP.
- La personalización por instituto existe para "No lo he dado", pero necesita datos reales de varios centros para ser fiable.
- Riesgo de inconsistencia entre lo elegido en onboarding y lo soportado por la cola Supabase actual.

## 9. Estado de pagos, límites y beta

✅ Stripe test:

- Parent checkout test mode está documentado como probado OK.
- Webhook firmado crea entitlement antes de marcar link como pagado.
- Success page no activa plan por sí sola.
- Hay docs de QA y smoke Stripe P0.

🟡 Límites:

- `caminoPlanLimits.ts` define Free, Premium, Curso PAU, Intensivo y Superpremium.
- `/api/chat` aplica prueba gratis, límite mensual de correcciones y rate limits diarios.
- Simulacros y Camino tienen límites parciales.
- Falta una visión única de consumo real por plan y mensajes comerciales totalmente alineados.

🔴 Antes de cobrar:

- Activar y probar Stripe live.
- Unificar pricing/copy/legal.
- Revisar reembolsos y garantía.
- Validar que los límites prometidos coinciden con los límites de código.

## 10. Riesgos principales antes de beta

1. Camino parece funcional, pero puede depender de fallbacks distintos según local/Supabase.
2. Si onboarding no manda de verdad, el alumno percibe que el plan no es suyo.
3. Si los ejercicios EVAU no matchean subject/block/topic, el método se rompe.
4. Si una asignatura elegida no tiene cola/contenido suficiente, la experiencia queda incompleta.
5. Si LaTeX falla en correcciones, se pierde confianza académica.
6. Si Stripe/pricing/legal no están alineados, no se puede cobrar con seguridad.
7. Si no se prueba con alumnos reales, no hay señal de retorno Day-2 ni confianza en el flujo.
8. Si XP/progreso se duplica o no sincroniza, Camino pierde credibilidad.

## 11. Próximos pasos — corto plazo

Prioridad para los próximos 7-14 días:

1. QA manual de correcciones IA con 15-30 ejercicios reales, incluyendo imagen y texto.
2. QA end-to-end de Camino con usuario nuevo: onboarding, calendario, curso, corrección, XP, historial.
3. Validar que Camino no muestra asignaturas no elegidas y que no cae a Lengua/Matemáticas por defecto.
4. Probar parciales: crear parcial, ver banner, misiones inyectadas, práctica parcial, simulacro por bloque.
5. Validar routing EVAU por subject/block/topic y registrar casos con `subject_fallback`.
6. Probar "No lo he dado en clase" con centro real y comprobar que replanifica.
7. Ejecutar `npm run smoke` antes de cada beta build.
8. Hacer Stripe test mode completo tras cualquier cambio de billing.
9. Probar con 3-5 alumnos reales durante al menos una semana.

## 12. Próximos pasos — medio plazo

Antes de beta pública/septiembre:

1. Unificar el motor de Camino: decidir si manda Supabase, local o una transición clara.
2. Ampliar cola Supabase a todas las asignaturas que se ofrezcan en onboarding.
3. Completar estructura de 60 días / 38 semanas para Matemáticas II y Matemáticas CCSS con cobertura real.
4. Decidir lanzamiento mínimo de Historia, Filosofía, Física, Química, Lengua e Inglés según contenido disponible.
5. Mejorar etiquetado de ejercicios EVAU por tema para reducir fallbacks.
6. Persistir calendario y progreso de forma robusta en Supabase multi-dispositivo.
7. Conectar límites de plan a consumo real en una capa única.
8. Medir Day-2 return rate, misiones completadas, correcciones por alumno y coste IA.
9. Cerrar pricing final, legal, Stripe live y soporte/reembolsos.

## 13. Recomendación de prioridad

No abrir beta pública hasta que:

1. Correcciones IA pasen QA manual con ejercicios representativos.
2. Camino PAU respete onboarding, fecha real, tema y parciales en un flujo nuevo completo.
3. EVAU abra ejercicios del subject/topic correcto o muestre fallback transparente.
4. "No lo he dado en clase" se pruebe con al menos un centro real.
5. Stripe test mode siga OK y live mode/legal estén cerrados si se va a cobrar.
6. 3-5 alumnos reales hayan usado Kairo una semana y exista señal de retorno.

Orden recomendado:

1. **Cerrar Camino end-to-end**: onboarding → calendario → curso → EVAU → corrección → XP.
2. **QA académico**: correcciones, LaTeX y ejercicios por tema.
3. **Consistencia de producto**: asignaturas soportadas, pricing, límites y copy.
4. **Beta cerrada**: 3-5 alumnos, observación diaria, medir retorno.
5. **Cobro**: solo después de Stripe live, legal y soporte listos.
