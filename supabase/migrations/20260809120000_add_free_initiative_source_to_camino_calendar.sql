-- Principio de diseño: lo que Kairo programa nunca debe repetir contenido
-- que el alumno ya hizo por su cuenta (Mis Cursos / La Zona abierto
-- directamente, sin misión asignada). /api/camino/complete-mission ahora
-- registra esos casos como una fila de camino_calendar normal (status
-- 'completed', fechada el día real en que se hizo), para que el motor de
-- cola (ensureCaminoCalendar, que solo lee queue_status='pending') y el
-- injector de repasos (injectWeakReviewMissions, que excluye status=
-- 'completed') dejen de volver a ofrecer ese mismo tema. Necesita un
-- source distinto de 'algorithm'/'manual'/'partial' para poder mostrarlo en
-- el calendario con una marca visual distinta ("por tu cuenta") sin
-- confundirlo con una misión que Kairo sí asignó.

alter table public.camino_calendar
  drop constraint if exists camino_calendar_source_check;

alter table public.camino_calendar
  add constraint camino_calendar_source_check
  check (source in ('algorithm', 'manual', 'partial', 'free_initiative'));
