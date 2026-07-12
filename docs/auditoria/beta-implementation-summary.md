# Resumen de implementación — Beta privada core PAU

## Qué se activó

La beta privada pasa a tener cuatro asignaturas activas en Camino PAU:

- Matemáticas II (`matematicas_ii`)
- Matemáticas CCSS (`matematicas_ccss`)
- Lengua Castellana y Literatura (`lengua`)
- Historia de España (`historia_espana`)

El resto de asignaturas queda visible como Próximamente en onboarding y no debe generar Camino.

## Fuentes usadas

- `pausia_latex_beta_pack.zip`: temas beta de Matemáticas II y Matemáticas CCSS.
- `pausia_lengua_latex_beta_pack.zip`: secuencia beta de Lengua y guía de ingesta.
- `pausia_historia_latex_beta_pack.zip`: secuencia beta de Historia y guía de ingesta.
- `Cronologia_asignaturas_2_Bachillerato_Madrid.docx`: referencia de orden académico.
- `pendientes-beta-septiembre.pdf`: prioridades beta/septiembre.
- `base-planificacion-camino-pau.docx`: diagnóstico de planificación.
- `Pausia_pricing_definitivo_v4 (1).pdf`: precios y límites comerciales.

## Cambios funcionales principales

- Se creó `app/lib/camino/betaCurriculum.ts` con una secuencia curricular beta mínima para las cuatro asignaturas.
- `caminoCurriculumPlan.ts` combina el seed existente con la secuencia beta.
- `/api/onboarding/generate` acepta solo las cuatro asignaturas beta y usa la secuencia beta como fallback si falta `curriculum_content_v2`.
- `ensureCaminoCalendar` rellena calendario para las cuatro asignaturas beta.
- Onboarding permite seleccionar Matemáticas II, Matemáticas CCSS, Lengua e Historia.
- Camino muestra mensaje de beta privada y progreso de las cuatro asignaturas.
- `randomEvauExercise` reconoce alias de Lengua e Historia y mantiene fallback dentro de la misma asignatura.
- Parciales/simulacros reconocen CCSS, Lengua e Historia.
- La corrección de curso usa `referenceSolution` cuando existe.
- Se registran métricas beta mínimas en `billing_events`.

## Corrección de carga LaTeX / contenido

El aviso de apunte pendiente aparecía en temas que sí tenían contenido porque algunas misiones abrían URLs creadas desde `title` (`textSlug(row.title)`) o desde slugs legacy de `curriculum_content_v2`. Esos slugs no siempre coincidían con los `topicSlug` de la secuencia beta local.

La solución actual:

- `caminoCurriculumPlan.ts` expone `normalizeTopicSlug`.
- `getTopic` normaliza `subject`, `blockSlug` y `topicSlug`.
- Se añadieron alias controlados para slugs legacy como `dimension-de-una-matriz` hacia contenido beta local como `matrices-operaciones`.
- Si el tema exacto legacy no tiene contenido local, pero existe alias con explicación/ejemplo/ejercicio, el curso usa ese contenido sin mostrar fallback.
- El fallback queda reservado para temas realmente incompletos y usa un texto menos alarmante.

## Recuperación visual de cursos

La pantalla de curso prioriza ahora una estructura de mini clase:

- Idea clave.
- Cómo se trabaja.
- Ejemplo guiado paso a paso.
- Error típico.
- Práctica corregible.

El contenido se sigue renderizando con `MathMarkdown` para conservar LaTeX/KaTeX. El bloque `Vídeo explicativo` solo se muestra cuando existe un `videoId` real; si no hay vídeo, no aparece tarjeta vacía ni fallback dentro de ese bloque.

Lengua e Historia usan títulos y pasos adaptados a respuesta escrita, comentario, contexto, causas y consecuencias, evitando una plantilla matemática rígida.

## Corrección de progresión semanal

Las semanas podían repetirse porque el generador local de calendario inicializaba la rotación de temas desde cero cada vez que se generaba una semana. Además, el calendario persistido no guardaba siempre el `topicSlug` canónico, por lo que podía reconstruir enlaces desde el título.

La solución actual:

- `/api/onboarding/generate` guarda `metadata.topic_slug` y `block_slug` canónico al crear la cola.
- `ensureCaminoCalendar` recalcula `topic_slug` canónico si la cola viene de datos legacy.
- `CaminoCalendarClient` lee `metadata.topic_slug` para construir el enlace del curso.
- La generación local de semanas usa `weekDelta` para desplazar `subjectRotation` y `topicRotationBySubject`.
- Se evita repetir temas recientes desde la caché semanal cuando hay alternativa.

## Reglas de progreso

- Tema visto: el alumno abre la explicación del curso.
- Tema practicado: el alumno entrega el ejercicio aplicado.
- Tema completado: el ejercicio aplicado queda corregido con Pausia.
- Tema dominado: ejercicio aplicado y PAU/EVAU del mismo tema con nota suficiente.

En esta iteración, la regla crítica implementada es que el XP del curso se dispara desde corrección/complete-mission, no por abrir teoría.

## Qué queda pendiente para septiembre

- Ampliar las secuencias beta a una programación completa de 38 semanas.
- Reemplazar fallbacks por contenido `curriculum_content_v2` revisado para cada tema.
- Etiquetar más ejercicios PAU/EVAU por tema exacto.
- Completar métricas de producto: `course_opened`, `exercise_submitted`, `evau_exercise_opened`, `partial_created`, `simulation_started`, `day_2_return` y `feedback_clicked`.
- Validar académicamente las explicaciones y soluciones de las cuatro asignaturas.
- Cerrar Stripe live, price IDs, legal y soporte si se decide cobrar.
