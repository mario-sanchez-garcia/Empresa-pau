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
