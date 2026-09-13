-- Biología no podía generarse en Camino, en silencio.
--
-- Desde el 2026-09-11 Biología tiene sus 63 temas publicados en
-- curriculum_content_v2 y se puede elegir en el onboarding
-- (PRIVATE_BETA_SUBJECTS), pero faltaba en las DOS puertas que hay entre
-- "elegirla" y "tener cola":
--
--   1. ALLOWED_GENERATE_SUBJECTS en app/lib/onboarding/generateCaminoPlan.ts,
--      que filtra las asignaturas antes de leer el temario.
--   2. este check constraint, que rechazaría el insert de la cola aunque la
--      primera puerta se abriese.
--
-- El fallo no era visible: generateCaminoPlan aísla la inserción por
-- asignatura precisamente para que una rechazada no tire el onboarding entero
-- (ver 20260909170000), así que el alumno de Ciencias de la Salud terminaba el
-- onboarding "con éxito" y sin una sola misión de Biología.
--
-- Esta migración abre la segunda puerta. La primera se abre en el mismo commit,
-- y hay un test que comprueba que las tres listas (PRIVATE_BETA_SUBJECTS,
-- ALLOWED_GENERATE_SUBJECTS y este constraint) siguen coincidiendo.
--
-- `not valid` igual que en 20260909170000: se aplica a las filas nuevas pero no
-- revalida las antiguas, que arrastran slugs previos como 'mates'/'historia' y
-- harían fallar la migración.

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
    'biologia',
    'ingles',
    'historia_filosofia',
    'economia'
  )) not valid;
