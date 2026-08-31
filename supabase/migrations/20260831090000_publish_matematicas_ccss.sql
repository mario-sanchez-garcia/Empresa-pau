-- Publica las 43 lecciones del Curso de Matemáticas CCSS (fin del borrador).
-- Decisión del usuario: publicar las 43 completas, incluidos los 2 temas de
-- Contraste de Hipótesis (sin ejercicio PAU real asociado hoy, aceptado).
--
-- Antes de este cambio se verificó y corrigió lo necesario para que "publicado"
-- sea real, no solo el flag:
--   1) app/lib/camino/caminoCurriculumPlan.ts: getTopicByV2SortOrder ahora exige
--      contentStatus==='flashcard_v2' para confiar en v2SortOrder como FK real —
--      sin esto, los sort_order 1-6 seguían resolviendo a los 6 topics viejos de
--      PRIVATE_BETA_CURRICULUM_TOPICS (bug ya identificado y corregido para el
--      admin-preview en la tarea anterior, pero que también afectaba a
--      generateCaminoPlan/correct/complete-mission a través de la misma función
--      compartida — se corrige una vez en el origen en vez de en cada llamada).
--   2) app/data/camino/curriculum_seed.json: se añaden 43 entradas flashcard_v2
--      (mismo patrón que las 376 ya existentes para matematicas_ii, historia_espana,
--      fisica, quimica, lengua) — sin esto, ni el enrutado
--      (/camino-pau/curso/matematicas_ccss/...) ni /api/camino/correct podían
--      resolver estos temas, porque ambos dependen del catálogo estático
--      CAMINO_CURRICULUM_TOPICS, no solo de curriculum_content_v2.review_status.
--      Los 4 topics legacy de curriculum_seed.json y los 6 de betaCurriculum.ts
--      para matematicas_ccss NO se tocan (hay usuarios reales con
--      user_learning_queue/camino_calendar apuntando a su rango de numeración
--      1001-1006, verificado en la tarea anterior).

UPDATE curriculum_content_v2
SET review_status = 'published'
WHERE subject = 'matematicas_ccss';
