# Pendientes Kairo — Beta privada y septiembre

## 1. Resumen ejecutivo

Kairo está cerca de una beta privada controlada con 3-5 alumnos si el foco se mantiene en Matemáticas II y Matemáticas CCSS. Ya existen onboarding limitado, Camino PAU, calendario, cursos por tema, corrección IA, XP, historial, ejercicios PAU/EVAU, simulacros, Stripe test mode, legal básico y smoke tests.

Lo que falta para que la beta no parezca una demo es cerrar el corazón del método: una progresión real por asignatura, explicaciones de curso con más valor, ejercicio aplicado corregible, XP solo tras corrección y EVAU del mismo tema sin repeticiones raras. Para septiembre, además, hay que cerrar métricas, QA académico, pricing/legal/Stripe live si se cobra y decidir qué asignaturas se prometen públicamente.

## 2. Pendientes para beta privada

| Prioridad | Cosa que falta | Qué necesita Codex para hacerlo | Información valiosa / contexto |
|---|---|---|---|
| P0 | Cerrar base real de planificación de Camino PAU | Secuencia editorial de Matemáticas II y CCSS con bloque, tema, orden, prerequisitos, misión esperada y query EVAU | 🟡 Parcial: hay `user_learning_queue`, `camino_calendar`, `ensureCaminoCalendar` y seed; falta una fuente única que diga qué tema viene después y cuándo pasar a EVAU |
| P0 | Desarrollar un poco más las explicaciones de los cursos activos | Apuntes LaTeX, lista exacta de temas beta y decisión de si se actualiza `curriculum_content_v2`, seed o Supabase | 🔴 Pendiente: deben responder qué es, para qué sirve, cuándo se usa en PAU, error típico y conexión con ejercicio; mini clase, no teoría larga |
| P0 | Cerrar curso → ejercicio aplicado → corrección → XP | Confirmar flujo en `/camino/tema`, `/api/chat`, `/api/camino/complete-mission` e historial; definir si toda misión se completa solo tras corrección | 🟡 Parcial: el curso corrige y llama a `complete-mission` si hay nota; hay riesgo de XP directo en calendario manual y falta QA de no duplicidad |
| P0 | Garantizar EVAU por tema sin abrir siempre lo primero | Etiquetado mínimo tema/bloque en ejercicios de Matemáticas II y CCSS; lista de fallbacks aceptables | 🟡 Parcial: `randomEvauExercise` respeta subject y evita recientes, pero usa keywords y puede caer en `subject_fallback` |
| P0 | Métricas básicas de beta | Definir dónde registrar eventos y nombres: `onboarding_completed`, `camino_opened`, `course_opened`, `exercise_submitted`, `correction_completed`, `xp_awarded`, `evau_exercise_opened`, `day_2_return` | 🔴 Pendiente: hay `billing_events` y admin de uso IA, pero no un tracking de producto cerrado para beta |
| P0 | Mensaje claro de beta privada | Ubicación exacta: onboarding, Camino o dashboard; copy final | 🟡 Parcial: el onboarding bloquea materias, pero conviene mostrar explícitamente “Estás en la beta privada… Matemáticas II y CCSS” |
| P0 | QA manual de beta privada | Checklist con 3-5 alumnos, casos Madrid/CCSS/Mates II, móvil y escritorio | 🟡 Parcial: hay smoke tests y docs QA, pero no sustituyen una prueba real de punta a punta |
| P1 | Mejorar “No lo he dado en clase” para beta | Confirmar comportamiento deseado al marcar tema: retrasar, sustituir por previo y no repetirlo mañana | 🟡 Parcial: `postpone-mission` guarda `not_taught_in_class`; el cliente tiene lógica de sustitución, pero falta QA real |
| P1 | Parciales y simulacros en beta | Decidir si los alumnos reales añaden parciales por bloque o por tema; validar límites del plan | 🟡 Parcial: existe `injectPartialExamMissions`, banner y límites; falta comprobar que adapta Camino de forma comprensible |
| P1 | Revisar calendario visible | Criterio final de semana: 7 días, 14 días o solo hoy + próximos | 🟡 Parcial: semana empieza lunes, hay navegación, editor simple y bonus; el motor Supabase genera 14 días, el cliente también genera semanas |

## 3. Pendientes para septiembre / beta pública

| Prioridad | Cosa que falta | Qué necesita Codex para hacerlo | Información valiosa / contexto |
|---|---|---|---|
| P1 | Secuencia curricular sólida para todo el curso | Programación 38 semanas o 60 días, por asignatura, con fases y ventanas de repaso | 🔴 Falta como motor único; existe `calendario-38-semanas-revisado.tsv`, pero no gobierna el planning |
| P1 | Matemáticas CCSS completa y separada de Matemáticas II | Secuencia CCSS sin geometría 3D: álgebra, análisis económico, probabilidad e inferencia | 🔴 Falta granularidad: el seed CCSS tiene pocos hitos; el helper filtra geometría, pero el contenido debe crecer |
| P1 | Más contenido de curso con LaTeX | Apuntes LaTeX definitivos, mapping a `curriculum_content_v2` y revisión académica | 🟡 Parcial: hay tarjetas, MathMarkdown y contenido v2; falta calidad homogénea de mini clase |
| P1 | Etiquetado EVAU por tema | Mapa tema curricular → ejercicios reales por año/convocatoria/opción | 🟡 Parcial: hay ejercicios reales y heurística; para pública debe ser más determinista |
| P1 | Límites por plan conectados de punta a punta | Definir cuotas finales para correcciones, fotos, parciales, simulacros, Camino y chat | 🟡 Parcial: pricing está actualizado y `caminoPlanLimits` existe; falta comprobar aplicación homogénea |
| P1 | Stripe live si se cobra | Claves live, webhook producción, price IDs finales, prueba end-to-end, soporte y reembolsos | 🟡 Parcial: Stripe test/webhook está cubierto por smoke; para septiembre falta live y operación real |
| P1 | Legal y política de uso razonable | Texto final de términos, privacidad, IA, reembolsos y límites de uso | 🟡 Parcial: hay páginas legales beta; deben alinearse con pricing final antes de cobrar |
| P1 | Landing/pricing pública coherente | Confirmar copy final y promesas de asignaturas | ✅ Bastante avanzado: aparecen Free, Premium 9,99 €, Curso desde 59/79, Intensivo 19,99 €, Superpremium 17,99 € y smoke anti “ilimitado” |
| P1 | Observabilidad y métricas de producto | Dashboard o tabla/eventos para cohortes, retención y costes por flujo | 🟡 Parcial: hay admin de uso IA; faltan eventos de aprendizaje y retención |
| P2 | Más asignaturas o promesa explícita de no ofrecerlas | Decisión de alcance: solo mates al inicio o añadir Historia/Lengua/Física/Química | 🟡 Parcial: datos existen en varias materias, pero beta Camino debe limitarse para no prometer de más |
| P2 | Ranking/ligas avanzado | Decidir si es core de septiembre o mejora posterior | 🟡 Parcial: ranking y ligas existen, pero no son bloqueo de beta privada |
| P2 | Admin académico de contenidos | Pantalla o proceso para revisar temas, explicaciones, ejercicios y fallbacks | 🔴 Falta como operación de contenidos; hoy depende más de seeds/scripts/código |

## 4. Decisiones que debe tomar el equipo

1. ¿Beta privada solo Matemáticas II y Matemáticas CCSS definitivamente?
2. ¿Cuántos temas mínimos deben tener explicación útil antes de invitar alumnos?
3. ¿El calendario beta debe enseñar 7 días, 14 días o una vista de 60 días?
4. ¿Cuántas misiones al día son razonables para no abrumar?
5. ¿Qué pesa más: avanzar temario, corregir errores o preparar parciales próximos?
6. ¿Qué hacemos si un tema no tiene explicación LaTeX suficiente: fallback corto, no mostrarlo o mandar directo a EVAU?
7. ¿Se cobra en septiembre o primero se abre beta pública gratuita?
8. ¿Qué asignaturas se prometen públicamente en landing y onboarding?
9. ¿Qué significa “tema completado”: leer teoría, entregar ejercicio, recibir corrección o aprobar EVAU?
10. ¿Quién valida académicamente las explicaciones y el etiquetado por tema?

## 5. Recomendación de orden de trabajo

1. Cerrar una secuencia beta única para Matemáticas II y Matemáticas CCSS.
2. Mejorar explicaciones de cursos activos con formato mini clase: qué es, uso PAU, error típico y conexión con ejercicio.
3. Validar curso → ejercicio aplicado → corrección → XP → historial → misión completada, sin XP duplicado.
4. Reforzar EVAU por tema para Matemáticas II y CCSS, con fallback transparente y sin repetición.
5. Añadir métricas básicas de beta y mensaje claro de beta privada.
6. Hacer QA manual con 3-5 alumnos y recoger feedback.
7. Después preparar septiembre: más contenido, tagging EVAU, límites por plan, Stripe live, legal/copy final y decisión de asignaturas públicas.
