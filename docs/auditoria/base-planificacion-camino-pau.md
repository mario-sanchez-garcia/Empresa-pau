# Mini auditoría — Base de planificación de Camino PAU

## 1. Resumen corto

El problema no está principalmente en la UI del calendario. La pantalla de Camino PAU ya está avanzada, pero la base de planificación todavía mezcla una cola lineal de contenidos, un calendario Supabase de 14 días y una generación local semanal con fallbacks. Eso permite enseñar misiones, XP, parciales y enlaces a curso/EVAU, pero no garantiza todavía una progresión curricular real por asignatura.

Para beta privada, la base activa debe centrarse en Matemáticas II y Matemáticas CCSS. Ahí el estado es desigual: Matemáticas II tiene una secuencia amplia de 60 temas; Matemáticas CCSS solo tiene 4 temas seed y necesita una secuencia propia mucho más granular.

## 2. Qué tiene ahora Camino PAU

✅ Existe

- Calendario guardado en Supabase con `camino_calendar`.
- Cola de aprendizaje por usuario con `user_learning_queue`.
- Generación inicial desde `/api/onboarding/generate`.
- Relleno automático de próximos días con `ensureCaminoCalendar`.
- Progreso agregado, XP y racha en `camino_user_progress` / `camino_xp_events`.
- Pantalla principal en `app/components/camino/CaminoCalendarClient.tsx`.
- Rutas de curso por tema en `/camino-pau/curso/[subject]/[block]/[topic]`.
- Enlace tema → ejercicio EVAU mediante `buildEvauHref` y `randomEvauExercise`.
- Parciales cercanos con inyección de misiones en `injectPartialExamMissions`.
- Acción “no lo he dado en clase” con `postpone-mission` y tablas de feedback escolar.
- Límites de plan en `caminoPlanLimits`.

🟡 Parcial

- Hay dos capas conviviendo: generación local semanal/fallback en cliente y generación Supabase de 14 días.
- `curriculum_topics` y `mission_templates` existen como estructura, pero la generación real de cola usa `curriculum_content_v2`.
- El matching EVAU por tema usa keywords y puede caer en `subject_fallback`.
- El progreso por asignatura se cuenta por misiones completadas, no por dominio real de tema.

## 3. Por qué el plan no evoluciona lo suficiente

🟡 Parcial

- La cola avanza por `subject_position` / `v2_sort_order`, pero no hay una entidad explícita de “siguiente tema” con prerequisitos, estado y reglas de salto.
- El calendario Supabase solo mantiene un horizonte de 14 días, no una programación completa de 60 días o 38 semanas.
- La alternancia de asignaturas está hardcodeada por día de semana: lunes/martes prioriza Matemáticas II y miércoles-jueves-viernes CCSS si ambas existen.
- El modo rescate reordena por prioridad, pero con reglas simples y muy dependientes de rangos.
- Los errores, notas, ejercicios fallados e historial de correcciones existen, pero no parecen alimentar de forma fuerte la selección del siguiente tema.
- Los parciales se inyectan cerca de la fecha, pero no sustituyen todavía a una programación curricular completa.
- Si faltan datos de contenido o cola, el cliente puede usar fallback local, lo que hace que el producto parezca funcionar aunque la base no esté cerrada.

🔴 Falta

- Una secuencia curricular explícita por asignatura que diga qué tema viene después y cuándo pasar de explicación a práctica guiada, EVAU y simulacro.
- Estado de dominio por tema: visto, practicado, corregido, dominado, pospuesto, no dado en clase.
- Reglas claras de avance vs. refuerzo: cuánto pesan errores, parciales, retrasos y temario nuevo.

## 4. Qué falta para un planning real por asignatura

🔴 Falta

- `curriculum_sequence` por asignatura, con orden, bloque, tema, prerequisitos y duración estimada.
- `subject_planning_template` para 60 días o 38 semanas.
- `topic_status` / `user_topic_progress` con estado granular por alumno.
- Reglas `mission_generation_rules`: explicación → ejemplo guiado → ejercicio aplicado → EVAU → simulacro.
- `exam_window_rules` para parciales y PAU: cuándo repasar, cuándo simular, cuándo bloquear avance.
- `evau_topic_map` más preciso: tema curricular → ejercicios PAU reales etiquetados.
- Política de fallback: qué hacer si un tema no tiene curso, apuntes o ejercicios EVAU.

🟡 Parcial

- `curriculum_topics`, `mission_templates`, `school_topic_feedback` y `school_topic_status` ya apuntan en esta dirección.
- `randomEvauExercise` ya conecta con ejercicios reales, pero por inferencia de keywords.
- `calendario-38-semanas-revisado.tsv` aporta una base editorial, aunque no está integrada como motor real.

## 5. Matemáticas II — estado y necesidades

✅ Existe

- `app/data/camino/curriculum_seed.json` contiene 60 temas de Matemáticas II.
- El orden cubre Álgebra, Geometría 3D, Análisis y Probabilidad.
- Hay rutas de curso, contenido LaTeX parcial y enlaces a EVAU por tema.

🟡 Parcial

- El orden de 60 temas es útil, pero no coincide del todo con la progresión esperada: Integrales aparece dentro de Análisis y no como bloque propio visible.
- Probabilidad incluye distribución binomial/normal, pero falta decidir si estadística descriptiva debe entrar o no para Matemáticas II.
- Falta convertir el orden en una planificación diaria con fases y criterios de avance.
- Falta medir dominio por subtema: matrices, inversa, determinantes, rango, sistemas, Gauss, Rouché-Frobenius y Cramer no deberían ser solo una lista lineal.

🔴 Necesita

- Separar claramente bloques: Álgebra, Geometría, Análisis, Integrales y Probabilidad.
- Definir prerequisitos y puntos de control por bloque.
- Etiquetar ejercicios PAU por subtema para evitar `subject_fallback`.
- Marcar cuándo un tema pasa a EVAU y cuándo se considera completado.

## 6. Matemáticas CCSS — estado y necesidades

✅ Existe

- Slug normalizado: `matematicas_ccss`.
- Está activada para beta junto a Matemáticas II.
- `getCurriculumForSubject` filtra `geometria-3d` para CCSS.
- Hay datos estructurados de exámenes Madrid en `app/data/matematicas_ccss_madrid.ts`.
- Hay 4 temas seed: Sistemas por Gauss, Optimización económica, Bayes/tablas/árboles e Intervalos de confianza.

🟡 Parcial

- CCSS no hace fallback a Matemáticas II en el selector de exámenes, pero su planificación curricular es demasiado corta.
- El seed representa bloques correctos, pero solo como hitos grandes.
- La protección contra geometría 3D existe en el helper curricular, aunque debe mantenerse también en cualquier futura tabla/seed.

🔴 Necesita

- Secuencia propia sin geometría 3D.
- Álgebra: matrices, operaciones, inversa, sistemas, Gauss y programación lineal.
- Análisis: límites, asíntotas, continuidad, funciones a trozos, derivadas, optimización económica, costes, ingresos, beneficios, curvatura e inflexión.
- Probabilidad: Laplace, condicionada, árboles, tablas, total y Bayes.
- Inferencia: medias, proporciones, intervalos, error máximo, tamaño muestral y contraste.
- Mapeo tema → ejercicios PAU reales para que el plan no use coincidencias genéricas.

## 7. Datos ya disponibles que podemos aprovechar

✅ Existe

- `curriculum_seed.json`: base curricular inicial, especialmente fuerte en Matemáticas II.
- `curriculum_flashcards`: flashcards de Matemáticas II y duplicado filtrado para CCSS sin Geometría.
- `curriculum_topics` y `mission_templates`: estructura preparada para contenidos y misiones por tema.
- `matematicas_ccss_madrid.ts` y datos de exámenes existentes para prácticas reales.
- `randomEvauExercise.ts`: helper de selección EVAU por bloque/tema.
- `whyItWorksTheory.ts`: teoría aplicada por asunto, útil para cerrar correcciones.
- `camino_calendar`, `user_learning_queue`, `camino_user_progress`, `camino_xp_events`.
- Parciales guardados en perfil e inyección de misiones cercanas.
- “No lo he dado en clase” con feedback escolar.
- `docs/camino-pau/calendario-38-semanas-revisado.tsv`: referencia editorial de curso.
- Apuntes/LaTeX integrados parcialmente como `contentStatus: latex_notes`.

🟡 Parcial

- La información existe en varias capas, pero no hay una fuente única de verdad para la planificación.
- Las rutas de curso y los ejercicios EVAU se conectan, pero la calidad depende de cobertura y etiquetado.

## 8. Clarificaciones necesarias

1. ¿Queremos una programación fija de 60 días o una de 38 semanas?
2. ¿Matemáticas II y CCSS deben compartir temas comunes o tener secuencias separadas desde el inicio?
3. ¿El planning debe seguir trimestre escolar, cuenta atrás hasta PAU o ambos?
4. ¿Cómo se definen los parciales: por bloque, por tema o por fecha libre?
5. ¿Cuántas misiones por día queremos normalmente según plan Free/Premium/Intensivo?
6. ¿Cuánto peso tienen errores y notas bajas frente al avance de temario nuevo?
7. ¿Qué temas están suficientemente cubiertos por apuntes LaTeX para abrir curso completo?
8. ¿Qué ejercicios PAU están bien etiquetados por tema y cuáles solo por bloque?
9. ¿Qué pasa si un tema no tiene curso todavía: se salta, se muestra como itinerario o va directo a EVAU?
10. ¿Qué se considera “tema completado”: abrir teoría, entregar ejercicio, aprobar corrección o completar EVAU?

## 9. Próximo paso recomendado

Crear una tabla/archivo editorial único para beta con dos secuencias separadas: `matematicas_ii` y `matematicas_ccss`. Debe incluir bloque, tema, orden, prerequisitos, duración, tipo de misión esperada, disponibilidad de curso/LaTeX y query EVAU. Después, adaptar el generador para consumir esa secuencia como fuente principal y usar la cola/calendario solo como estado por usuario.

Prioridad práctica:

1. Cerrar la secuencia de Matemáticas CCSS sin geometría 3D.
2. Reetiquetar Matemáticas II separando Integrales como bloque funcional.
3. Definir estado de tema completado.
4. Conectar errores/parciales al motor de selección del siguiente tema.
