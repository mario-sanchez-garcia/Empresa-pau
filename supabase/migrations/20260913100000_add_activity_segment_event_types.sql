-- Tramos de actividad observable dentro de una misión.
--
-- camino_mission_events ya existe desde 20260828173000 y ya tiene lo que hace
-- falta: RLS por usuario, metadata jsonb por evento, e idempotencia por
-- unique (user_id, mission_id, event_type, idempotency_key). Como event_type
-- forma parte de esa clave, el mismo segment_id sirve de idempotency_key para
-- la apertura y para el cierre sin colisionar entre sí.
--
-- Lo único que impedía usarla es el CHECK de event_type, que solo admitía los
-- cinco tipos originales. Esta es toda la migración: dos valores más. Ninguna
-- columna nueva, ninguna tabla nueva, ningún índice nuevo — los dos índices
-- existentes sobre (user_id, mission_id, occurred_at) y
-- (user_id, event_type, occurred_at) ya sirven a las consultas de derivación.
--
-- Por qué DOS eventos por tramo y no uno al cerrar: si el tramo viviera solo en
-- memoria hasta cerrarse, un navegador que muere antes de pagehide no nos
-- haría perder el final del tramo, nos haría perder su existencia. El servidor
-- no puede cerrar después algo que no sabe que empezó, y esa misión quedaría
-- indistinguible de una que nadie abrió. Dos escrituras por tramo es un precio
-- irrelevante para Supabase a cambio de cerrar ese agujero.

alter table public.camino_mission_events
  drop constraint if exists camino_mission_events_event_type_check;

alter table public.camino_mission_events
  add constraint camino_mission_events_event_type_check
  check (
    event_type in (
      'started',
      'completed',
      'postponed_manual',
      'rescheduled_manual',
      'rescheduled_conflict',
      'activity_segment_opened',
      'activity_segment_closed'
    )
  );
