# Checklist beta privada — Pausia

## Alcance activo

- [ ] Onboarding permite seleccionar Matemáticas II.
- [ ] Onboarding permite seleccionar Matemáticas CCSS.
- [ ] Onboarding permite seleccionar Lengua Castellana y Literatura.
- [ ] Onboarding permite seleccionar Historia de España.
- [ ] Física, Química, Biología, Inglés e Historia de la Filosofía aparecen como Próximamente y no se pueden seleccionar.
- [ ] El backend rechaza asignaturas fuera de la beta privada.

## Camino PAU

- [ ] Camino genera solo las asignaturas seleccionadas por el alumno.
- [ ] Matemáticas II genera misiones de Matemáticas II.
- [ ] Matemáticas CCSS genera misiones de Matemáticas CCSS.
- [ ] Lengua genera misiones de Lengua, no Matemáticas.
- [ ] Historia genera misiones de Historia, no Matemáticas.
- [ ] CCSS no muestra Geometría 3D.
- [ ] Matemáticas II sí puede mostrar Geometría 3D.
- [ ] La misión principal del día es clara y no hay 5 tareas obligatorias.
- [ ] Las misiones bonus aparecen debajo y son opcionales.
- [ ] Semana siguiente avanza a temas posteriores de la secuencia.
- [ ] Misma semana recargada mantiene las misiones guardadas.
- [ ] No se repite el mismo `topicSlug` en semanas consecutivas salvo repaso explícito.

## Curso, corrección y XP

- [ ] El curso/tema abre bien desde Camino.
- [ ] Un tema con contenido local/LaTeX no muestra el fallback de apunte pendiente.
- [ ] `Dimensión de una Matriz` carga contenido útil mediante alias a la secuencia beta.
- [ ] La explicación tiene valor: qué es, uso PAU, reconocimiento y error típico.
- [ ] Hay ejemplo guiado.
- [ ] Hay ejercicio aplicado corregible.
- [ ] Hay errores típicos y criterio de avance.
- [ ] El layout muestra mini clase visual: idea clave, cómo se trabaja, ejemplo, alerta y práctica.
- [ ] El bloque `Vídeo explicativo` solo aparece si hay `videoId` real.
- [ ] Lengua e Historia usan tono de mini clase propio, no una plantilla rígida de Matemáticas.
- [ ] El alumno puede entregar texto.
- [ ] El alumno puede subir imagen si el flujo lo permite.
- [ ] La corrección con Pausia funciona.
- [ ] La corrección se guarda en historial.
- [ ] XP se asigna solo tras corrección.
- [ ] XP no se duplica al recargar o repetir.
- [ ] LaTeX, KaTeX y MathMarkdown siguen funcionando.

## PAU/EVAU por tema

- [ ] El ejercicio PAU/EVAU respeta asignatura.
- [ ] El ejercicio PAU/EVAU respeta comunidad cuando hay datos.
- [ ] El ejercicio PAU/EVAU intenta respetar bloque y tema.
- [ ] Lengua no abre Matemáticas.
- [ ] Historia no abre Matemáticas.
- [ ] CCSS no abre Matemáticas II con Geometría 3D.
- [ ] Si solo hay fallback, el aviso es claro y sigue en la misma asignatura.
- [ ] No se repite siempre el mismo ejercicio.

## Parciales, simulacros y aula

- [ ] El alumno puede añadir parcial.
- [ ] Camino reduce teoría nueva si el parcial está cerca.
- [ ] Camino aumenta práctica PAU/EVAU del bloque del parcial.
- [ ] Camino sugiere simulacro si el plan y límites lo permiten.
- [ ] No lo he dado en clase guarda feedback.
- [ ] No lo he dado en clase retrasa o sustituye el tema.
- [ ] No insiste al día siguiente con el mismo tema marcado.

## Pricing, métricas y feedback

- [ ] Pricing visible: Free 0 €, Premium 9,99 €/mes, Curso 59/79 €, Intensivo 19,99 €/3 meses, Superpremium 17,99 €/mes.
- [ ] No aparece ilimitado, correcciones ilimitadas ni fotos ilimitadas.
- [ ] Se registra `onboarding_completed`.
- [ ] Se registra `correction_completed`.
- [ ] Se registra `xp_awarded`.
- [ ] Se registra `no_dado_en_clase_clicked`.
- [ ] El mensaje de beta privada aparece en Camino.
- [ ] El enlace de feedback funciona si existe `NEXT_PUBLIC_BETA_FEEDBACK_URL`.

## QA técnica

- [ ] `npm.cmd run smoke`
- [ ] `npm.cmd run build`
- [ ] `npm.cmd run lint`

## Carga de contenido y progresión

- Fuente de verdad de secuencia beta: `app/lib/camino/betaCurriculum.ts`, combinada en `app/lib/camino/caminoCurriculumPlan.ts`.
- Fuente de verdad legacy de mini-misiones Matemáticas II: `app/data/camino/curriculum_seed.json` y `curriculum_content_v2` cuando Supabase tiene filas.
- El curso resuelve `subject/blockSlug/topicSlug` con `normalizeSubjectSlug`, `normalizeTopicSlug` y alias controlados en `caminoCurriculumPlan.ts`.
- Si existe contenido local de la secuencia beta, el curso lo usa antes del fallback vacío.
- El contenido local se presenta como mini clase visual y se renderiza con `MathMarkdown`.
- El bloque de vídeo no se pinta si no hay `videoId` real.
- La cola/calendario guarda `metadata.topic_slug` para que el enlace use el slug canónico, no el título convertido a slug.
- Las semanas generadas localmente arrancan desde un offset por `weekDelta`, de modo que semana siguiente avanza en la secuencia.
