-- BUG CRÍTICO (encontrado validando onboarding end-to-end antes del
-- lanzamiento del 3 de agosto): la tabla user_learning_queue tiene un
-- check constraint en `subject` (user_learning_queue_subject_check,
-- añadido a mano en algún momento fuera de las migraciones trackeadas —
-- no aparece en 20260701120000_create_camino_tables.sql) que solo
-- permite 'matematicas_ii' e 'historia_espana'. Comprobado insertando
-- directamente: 'matematicas_ccss' y 'lengua' son RECHAZADOS.
--
-- Efecto real: cualquier alumno que elija Matemáticas CCSS o Lengua
-- Castellana en onboarding recibe un 500 de /api/onboarding/generate (el
-- insert por lotes falla en cuanto un lote mezcla una de estas dos
-- asignaturas) y se queda sin cola ni calendario — Camino PAU no se
-- genera en absoluto para esas dos asignaturas.
--
-- Arreglo: sustituir el constraint por uno que cubra las 4 asignaturas
-- activas del beta privado (mismas que PRIVATE_BETA_SUBJECTS en
-- app/lib/camino/betaCurriculum.ts).
alter table public.user_learning_queue drop constraint if exists user_learning_queue_subject_check;

alter table public.user_learning_queue
  add constraint user_learning_queue_subject_check
  check (subject in ('matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana'));
