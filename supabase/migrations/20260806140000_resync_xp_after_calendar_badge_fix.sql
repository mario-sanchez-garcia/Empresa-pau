-- Segundo pase de corrección del bug "bonus de nota no se refleja" (ver
-- 20260806120000/20260806130000 para el primer pase: race condition +
-- ambigüedad SQL en increment_camino_progress()). La causa raíz que seguía
-- reportándose no era el agregado en sí (camino_user_progress.xp_total ya
-- quedó bien resincronizado y el incremento es atómico desde esas dos
-- migraciones) sino una tarjeta de UI: la ficha de misión de Camino
-- (app/components/camino/CaminoCalendarClient.tsx) mostraba un XP estimado
-- fijo (10 o 20 según mission_type) tanto antes como DESPUÉS de completar la
-- misión, así que un alumno que veía "+35 XP · +15 bonus por la nota" en el
-- toast de corrección seguía viendo solo "+20 XP" en su tarjeta de Camino —
-- parecía que el bonus nunca se hubiera sumado, aunque camino_xp_events y
-- camino_user_progress ya lo tenían bien. Este archivo solo hace limpieza de
-- datos, coherente con el código ya corregido en el mismo commit:
--   1. Reconfirma que camino_user_progress.xp_total coincide con la suma de
--      camino_xp_events (mismo resync idempotente que 20260806120000, por si
--      hubiera vuelto a desincronizarse algo desde esa fecha).
--   2. Rellena camino_calendar.xp_awarded con el total real (base + bonus)
--      para misiones ya completadas, donde antes solo se guardaba la base
--      (o, en el caso de partial_practice, no se guardaba nada) — necesario
--      porque el fix de UI ahora lee esta columna para las misiones ya
--      hechas.

update public.camino_user_progress cup
set xp_total = totals.total_xp, updated_at = now()
from (
  select user_id, sum(xp_amount) as total_xp
  from public.camino_xp_events
  group by user_id
) totals
where cup.user_id = totals.user_id
  and cup.xp_total <> totals.total_xp;

-- Camino-native missions (complete-mission/route.ts): camino_xp_events.source_id
-- is the camino_calendar row id itself.
update public.camino_calendar cal
set xp_awarded = events.xp_amount,
    updated_at = now()
from public.camino_xp_events events
where events.source_type = 'mission_completion'
  and events.source_id = cal.id::text
  and cal.status = 'completed'
  and (cal.xp_awarded is null or cal.xp_awarded <> events.xp_amount);

-- Práctica parcial missions completed through /api/simulacro
-- (markCalendarMissionCompleted.ts): camino_xp_events.source_id is the
-- historial_simulacros row id, linked back to camino_calendar via
-- metadata.practica_simulacro_id (set by markCalendarMissionCompleted.ts).
update public.camino_calendar cal
set xp_awarded = events.xp_amount,
    updated_at = now()
from public.camino_xp_events events
where events.source_type = 'parcial_completion'
  and events.source_id = (cal.metadata ->> 'practica_simulacro_id')
  and cal.status = 'completed'
  and (cal.xp_awarded is null or cal.xp_awarded <> events.xp_amount);
