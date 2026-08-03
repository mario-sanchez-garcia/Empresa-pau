-- injectPartialExamMissions.ts inserts mission_type='partial_practice' and
-- source='partial' for parciales-driven missions, but the original
-- camino_calendar check constraints (20260701120000_create_camino_tables.sql)
-- only allowed ('concept','review','comment_text','pau_practice') and
-- ('algorithm','manual'). Widen both so a fresh migration replay matches what
-- the app actually writes.

alter table public.camino_calendar
  drop constraint if exists camino_calendar_mission_type_check;

alter table public.camino_calendar
  add constraint camino_calendar_mission_type_check
  check (mission_type in ('concept', 'review', 'comment_text', 'pau_practice', 'partial_practice'));

alter table public.camino_calendar
  drop constraint if exists camino_calendar_source_check;

alter table public.camino_calendar
  add constraint camino_calendar_source_check
  check (source in ('algorithm', 'manual', 'partial'));
