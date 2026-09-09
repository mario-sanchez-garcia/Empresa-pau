-- BUG (09/09/2026): dos cuentas nuevas se quedaron atascadas en
-- /onboarding/finalizando con "No hemos podido terminar de construir tu
-- Camino" (last_error_code='queue_generation_failed'), y "Reintentar"
-- reproducía el fallo idéntico una y otra vez.
--
-- Causa: user_learning_queue_subject_check —el check constraint que
-- 20260729130000 dejó en las 4 asignaturas del beta inicial y que después se
-- amplió a mano en producción hasta fisica/quimica— sigue sin aceptar
-- 'historia_filosofia', 'ingles' ni 'economia', que SÍ están en
-- ALLOWED_GENERATE_SUBJECTS (app/lib/onboarding/generateCaminoPlan.ts) y en
-- PRIVATE_BETA_SUBJECTS (app/lib/camino/betaCurriculum.ts). Ambas cuentas
-- habían elegido Historia de la Filosofía: el INSERT por lotes se rechazaba
-- entero y el alumno se quedaba sin cola ni calendario.
--
-- Comprobado en producción antes de escribir esto: 0 filas de
-- historia_filosofia / ingles / economia en user_learning_queue y
-- camino_calendar, frente a miles de las asignaturas aceptadas.
--
-- Arreglo: alinear el constraint con ALLOWED_GENERATE_SUBJECTS. Solo se toca
-- user_learning_queue: camino_calendar se alimenta siempre de esta cola, así
-- que no necesita constraint propio (y añadirle uno rompería las misiones
-- manuales con asignaturas fuera del beta).
--
-- `not valid` a propósito: la restricción se aplica a todo lo que se inserte
-- a partir de ahora, pero no revalida filas antiguas (la tabla arrastra datos
-- de slugs previos como 'mates'/'historia' y la migración no debe fallar por
-- ellos).
alter table public.user_learning_queue
  drop constraint if exists user_learning_queue_subject_check;

alter table public.user_learning_queue
  add constraint user_learning_queue_subject_check
  check (subject in (
    'matematicas_ii',
    'matematicas_ccss',
    'lengua',
    'historia_espana',
    'fisica',
    'quimica',
    'ingles',
    'historia_filosofia',
    'economia'
  )) not valid;
