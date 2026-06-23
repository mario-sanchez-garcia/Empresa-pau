-- Store applied-theory explanations generated after complete exam corrections.
-- Additive only: existing correction text and history rows are not rewritten.

alter table public.historial_examenes
  add column if not exists why_it_works text,
  add column if not exists why_it_works_context jsonb,
  add column if not exists detected_concepts jsonb default '[]'::jsonb,
  add column if not exists curriculum_source_ids jsonb default '[]'::jsonb;

comment on column public.historial_examenes.why_it_works is
  'Applied theory explanation shown as "¿Por qué es así?" for a completed correction.';

comment on column public.historial_examenes.why_it_works_context is
  'Non-private curriculum/exercise mapping context used to ground why_it_works.';

comment on column public.historial_examenes.detected_concepts is
  'Concept slugs and applied-method metadata detected from the exercise and correction.';

comment on column public.historial_examenes.curriculum_source_ids is
  'Internal curriculum, rubric and solution source identifiers used by why_it_works.';
