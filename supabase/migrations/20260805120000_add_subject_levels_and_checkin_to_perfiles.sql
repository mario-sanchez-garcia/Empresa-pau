-- subject_levels: student's self-assessed level ('bajo'|'medio'|'alto') per
-- active subject, edited from Ajustes. Same three-tier scale ExamModal
-- already uses for "¿Cómo vas en esta asignatura?" (confidence per exam),
-- just persisted per-subject in general rather than per-exam.
alter table public.perfiles
  add column if not exists subject_levels jsonb not null default '{}';

-- last_weekly_checkin_at: when the student last answered or dismissed the
-- weekly "¿sigues con X horas/día? ¿cómo vas?" prompt. Null/older than 7
-- days means the prompt is due again.
alter table public.perfiles
  add column if not exists last_weekly_checkin_at timestamptz;
