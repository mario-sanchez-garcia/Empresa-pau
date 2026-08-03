-- perfiles.custom_instructions: free-text instructions the student can set
-- in Ajustes ("Personalización IA"), persisted server-side (unlike
-- correctionStyle/longAdvice which stay local-only) so the parciales plan
-- generator can actually read and respect them.
--
-- Cross-exam parciales scheduling (injectAllPartialExamMissions) now runs as
-- part of /api/camino/ensure-calendar, which is already throttled to once a
-- day per user (camino_ensure_log) and is idempotent for an unchanged exam
-- list — so the plan only actually shifts when something real changes
-- (new/edited/removed exam, a new day entering an exam's prep window, or a
-- new instruction), not on every login.

alter table public.perfiles
  add column if not exists custom_instructions text;
