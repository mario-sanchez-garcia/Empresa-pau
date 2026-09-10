-- Estado explícito para una misión que NO cabe en el plan del alumno.
--
-- Hasta ahora, cuando la personalización del calendario no encontraba fecha
-- para una fila (porque su sitio caía después de la PAU, o dentro de la
-- reserva de repaso final siendo temario nuevo, o simplemente porque no queda
-- capacidad), esa fila se quedaba EXACTAMENTE donde estaba: una misión con
-- fecha imposible, mostrada al alumno como trabajo programado normal.
--
-- 'unscheduled' es el estado honesto de esa fila: el trabajo NO se borra ni se
-- pierde — su fila de user_learning_queue vuelve a 'pending' para que la
-- siguiente planificación la recoloque —, pero deja de contar como una misión
-- con fecha válida.
--
-- Aditivo: no cambia ninguna fila existente. Los lectores filtran en positivo
-- ('pending', 'completed'…), así que una fila 'unscheduled' simplemente no
-- aparece como misión programada, que es justo lo que se busca.

alter table public.camino_calendar
  drop constraint if exists camino_calendar_status_check;

alter table public.camino_calendar
  add constraint camino_calendar_status_check
  check (status in ('pending', 'completed', 'missed', 'postponed', 'unscheduled'));
