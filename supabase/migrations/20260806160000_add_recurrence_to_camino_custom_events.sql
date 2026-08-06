-- Un horario de clase/extraescolares real se repite cada semana (lunes a
-- viernes cole, martes y jueves natación...). Hasta ahora camino_custom_events
-- solo guardaba una fecha concreta por evento (event_date), así que el
-- alumno tendría que volver a meter el mismo evento cada semana para que
-- siguiera bloqueando huecos en la vista por horas / en el motor de Camino.
-- Añade una recurrencia semanal opcional: recurrence='weekly' + day_of_week
-- convierte event_date en la fecha de INICIO de la serie (no una ocurrencia
-- puntual), y recurrence_until (opcional) le pone fin. Eventos sueltos
-- (cita del dentista, un examen del cole un día concreto) siguen
-- funcionando igual que antes con recurrence='none'.

alter table public.camino_custom_events
  add column recurrence text not null default 'none'
              check (recurrence in ('none', 'weekly')),
  add column day_of_week smallint
              check (day_of_week is null or (day_of_week between 0 and 6)),
  add column recurrence_until date;

-- 0=lunes .. 6=domingo — mismo criterio que mondayBasedDayIndex()
-- (app/lib/camino/studyDays.ts), que ya usa esta vista de calendario.
comment on column public.camino_custom_events.day_of_week is
  'Solo relevante cuando recurrence=weekly. 0=lunes..6=domingo.';
comment on column public.camino_custom_events.recurrence_until is
  'Fecha límite (inclusive) de la recurrencia semanal. NULL = sin fin, se repite indefinidamente.';

alter table public.camino_custom_events
  add constraint camino_custom_events_recurrence_consistency check (
    (recurrence = 'none' and day_of_week is null)
    or
    (recurrence = 'weekly' and day_of_week is not null)
  );

create index camino_custom_events_user_recurrence_idx
  on public.camino_custom_events (user_id, recurrence);
