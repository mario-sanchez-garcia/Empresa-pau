-- Umbral de nota configurable: a partir de qué nota Kairo sugiere repetir un
-- simulacro/examen/curso para mejorar (ver historial de repetición en
-- 20260806170000). El alumno elige explícitamente si el umbral es el mismo
-- para todas las asignaturas o distinto por asignatura — grade_threshold_mode
-- guarda esa elección de forma explícita en vez de inferirla de si el dict
-- por asignatura está vacío, para que Ajustes/Onboarding siempre sepan qué
-- modo mostrar. Mismo patrón ya usado por subject_levels (jsonb, dict
-- slug->valor) en 20260805120000_add_subject_levels_and_checkin_to_perfiles.sql.

alter table public.perfiles
  add column if not exists grade_threshold_mode text not null default 'general'
              check (grade_threshold_mode in ('general', 'per_subject')),
  -- NULL = usa el valor por defecto de la app (6) sin que el alumno lo haya tocado.
  add column if not exists grade_threshold numeric,
  add column if not exists subject_grade_thresholds jsonb not null default '{}';

comment on column public.perfiles.grade_threshold_mode is
  'general = mismo umbral para todas las asignaturas (grade_threshold); per_subject = usa subject_grade_thresholds.';
comment on column public.perfiles.grade_threshold is
  'Umbral de nota (0-10) en modo general. NULL = valor por defecto de la app.';
comment on column public.perfiles.subject_grade_thresholds is
  'Umbral de nota (0-10) por asignatura en modo per_subject. {slug: numero}. Asignatura sin entrada = valor por defecto de la app.';
