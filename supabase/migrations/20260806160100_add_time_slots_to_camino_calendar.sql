-- Hasta ahora una misión de Camino solo tenía scheduled_date (un día, sin
-- hora): la vista por horas del calendario necesita colocar cada misión
-- como un bloque con duración real, y el motor de generación necesita saber
-- qué franja horaria concreta ocupa cada misión para no chocar con el
-- horario de clase/extraescolares del alumno (camino_custom_events) ni con
-- otras misiones del mismo día. Mismas columnas que ya tiene
-- camino_custom_events (start_time/end_time), mismo patrón: nullable, no
-- rompe filas existentes — una misión sin hora asignada (p.ej. si el motor
-- no encontró un hueco libre suficiente ese día) sigue mostrándose igual
-- que hasta ahora, solo sin bloque horario en la vista por horas.

alter table public.camino_calendar
  add column start_time time,
  add column end_time time;
