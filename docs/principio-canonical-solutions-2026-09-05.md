# Principio de arquitectura: IA solo para lo que cambia por alumno

**Fecha:** 5 de septiembre de 2026
**Estado:** principio adoptado, Fase 1 no iniciada
**Verificado contra código real** (no es solo la propuesta a papel)

---

## El principio, en una frase

No pagar IA para regenerar conocimiento que ya conocemos. IA para lo
personal, código para lo calculable, base de datos para lo conocido, caché
para lo repetido.

## El problema concreto

Cada corrección de Kairo devuelve, en la misma llamada al modelo:

- **Parte personalizada** (depende del alumno): nota, qué hizo bien/mal,
  errores concretos, feedback.
- **Parte universal** (igual para todos): la solución correcta paso a paso.

**Verificado en `app/lib/correctionPrompt.ts` y `app/api/camino/correct/route.ts`:**
`solucion_orientativa` y `solucion_correcta_corta` se generan de cero en
cada llamada, mezcladas en el mismo JSON que `feedback_general` y
`errores_principales`. Con 1.200 ejercicios oficiales y miles de
correcciones a lo largo de la vida de Kairo, se paga muchas veces por
generar prácticamente el mismo contenido.

## Ya existe un precedente que funciona: `topic_why_cache`

**Esto no es teórico — ya está en producción a menor escala.**
`supabase/migrations/20260804150000_create_topic_why_cache.sql` cachea la
explicación "¿Por qué es así?" por tema con el mismo razonamiento: *"el
contenido teórico general de un tema es el mismo para cualquier alumno que
llegue a ese tema"*. Diseño: clave única `(subject, block_slug, topic_slug)`,
solo lectura/escritura desde el servidor (service role), sin política RLS
para el alumno porque no es su dato personal.

`canonical_solutions` debe seguir este mismo patrón, no inventar uno nuevo.

## La arquitectura propuesta (resumen)

```
ALUMNO ENVÍA RESPUESTA
→ Kairo identifica exercise_id
→ Supabase recupera: enunciado, rúbrica, canonical solution
→ Claude recibe SOLO lo necesario para evaluar (no regenera la solución)
→ Claude devuelve SOLO lo personalizado: score, errores, feedback
→ Kairo combina feedback de Claude + canonical solution de Supabase
→ respuesta final al alumno
```

Tabla `canonical_solutions`: `exercise_id`, `official_solution`,
`canonical_solution`, `solution_version`, `rubric_version`, `language`,
`review_status` (`missing → generated → reviewed → published`),
`content_hash`, timestamps.

## Las cuatro trampas reales

1. **La corrección oficial no es "canónica" en todas las asignaturas.**
   En Matemáticas y Física hay una solución objetiva. En Historia,
   Filosofía y Lengua, la corrección oficial suele ser un esquema de
   puntuación, no una explicación — convertirla en "la" explicación
   pedagógica es juicio editorial congelado, no un hecho objetivo.
2. **El pipeline batch necesita gate de revisión humana obligatorio antes
   de `published`**, no opcional. Una canonical solution mal generada no es
   un bug: es una lección incorrecta replicada a toda la base de alumnos
   hasta que alguien la detecte.
3. **No mezclar fases de riesgo distinto.** Canonical solutions (Fases 1-2)
   es infraestructura de coste, acotada y medible. Student Error Profile y
   tocar `ensureCaminoCalendar` (Fases 4-5) es cambio de producto, sujeto a
   la misma disciplina de "no tocar sin datos reales" que ya se aplicó con
   Ritmo de Instituto.
4. La generalización a legal/fintech/salud (sección 36 del documento
   original) es válida pero diluye el argumento — la ventaja real de Kairo
   es específica: 1.200 ejercicios oficiales de la PAU y la arquitectura
   para explotarlos sin regenerar conocimiento, no "un patrón universal de
   IA".

## Gap técnico encontrado al verificar (nuevo, no estaba en la propuesta original)

**`ai_usage_events.metadata` en `exam/correct` no guardaba el id exacto de
la pregunta** (`subject`, `examLabel`, `year`, `option` sí; el id real del
ejercicio no). **Resuelto el 5 de septiembre de 2026** — ver Fase 1, paso 1
más abajo.

## Fase 1, paso 1 — completado y verificado (5 de septiembre de 2026)

Se añadió `exerciseId` y `exerciseLabel` al `metadata` de `ai_usage_events`
en dos puntos: `app/api/exam/correct/route.ts` (flujo normal, `source.id`
ya lo enviaba el cliente pero no se copiaba al metadata) y
`components/shared/RepeatExamModal.tsx` (flujo "Repetir para mejorar", no
enviaba el campo en absoluto — `source.id` ya existía en el componente,
usado en otro sitio como `repeated_from_id`).

**Confirmado con una corrección real**, no solo revisión estática: fila
`cb18b1a3-a4c0-4a9a-8889-ef9d23527ab5`, `exerciseId: "2025-J-11"` coincide
de forma independiente con la cola del `creditKey` (que se construye por
separado), y los 15 campos previos de `metadata` siguen intactos.

**Hallazgo importante para el paso 2, que no estaba documentado en
ningún sitio antes de ahora:** las correcciones de texto se registran en
`ai_usage_events` con `route: "/api/chat"`, no `/api/exam/correct`. Es
deliberado — comparte cupo diario con el chat general a propósito, para no
crear un cupo duplicado (comentario en `exam/correct/route.ts`, líneas
~181-183). Consecuencia práctica: **la consulta de "ejercicios más
corregidos" no puede filtrar por `route`**, porque esa columna mezcla chat
real con correcciones de texto. Hay que filtrar por
`metadata->>'exerciseId' is not null`. La columna `action` tampoco sirve
para distinguir: correcciones de texto salen como `'chat'`, de foto como
`'image_correction'`.

Sin este hallazgo, la consulta del paso 2 habría contado mal desde el
primer día, en silencio.

## Orden de ejecución acordado

1. **Ahora:** añadir `preguntaId` al metadata de `ai_usage_events` en
   `exam/correct`. Una línea, sin riesgo.
2. **Con una semana de datos:** medir coste actual con los 20-30 ejercicios
   de Matemáticas II más corregidos. Generar sus canonical solutions a
   mano, con revisión humana. Medir coste antes/después con tráfico real.
   No afirmar el ahorro del 50% hasta medirlo.
3. **Con resultado positivo confirmado:** pipeline batch para Matemáticas y
   Física únicamente — donde "canonical" significa lo que se cree que
   significa. Gate de revisión humana obligatorio antes de `published`.
4. **Después, con proceso distinto:** Historia, Filosofía, Lengua — no como
   "canonical solution" sino como banco de explicaciones de referencia
   validadas manualmente, que es lo que realmente son.
5. **Pausado explícitamente hasta que el resto respire:** Student Error
   Profile y su conexión con Camino. Aplica la misma paciencia de
   shadow-mode que Ritmo de Instituto antes de tocar el scheduler.

## Regla para futuras decisiones de arquitectura (la que pidió Mario)

Antes de construir cualquier feature nueva, preguntar:

- ¿Esto siempre es igual? → base de datos / contenido canónico.
- ¿Esto puede calcularse? → código.
- ¿Esto se repite mucho? → caché / retrieval.
- ¿Esto depende de verdad de este alumno y necesita interpretación? → IA.

No afirmar ninguna cifra de ahorro sin medir antes/después con tráfico
real, controlando también calidad, latencia y tasa de reintentos.
