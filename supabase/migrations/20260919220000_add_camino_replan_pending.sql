-- Guardar los ajustes debe bastar para que el Camino se reajuste.
--
-- Hasta ahora no bastaba. /api/camino/ensure-calendar comparte un bloqueo por
-- alumno con el resto del Camino, así que tener el Camino abierto en otra
-- pestaña (o un reajuste todavía en curso) devolvía 409 `plan_busy`. Ajustes
-- reintentaba tres veces y, si seguía ocupado, le pedía al alumno que cerrase
-- las demás pestañas y pulsara «Recalcular mi plan»: los cambios estaban
-- guardados, pero el Camino se quedaba con el plan viejo hasta que el alumno
-- hacía algo a mano.
--
-- Esta columna convierte esa espera en una tarea pendiente que sobrevive al
-- cierre de la pestaña: cuando un reajuste forzado no llega a entrar (bloqueo
-- ocupado, resultado degradado o error), se marca aquí, y la siguiente
-- ejecución de ensure-calendar —la propia carga del Camino, sin throttle
-- diario— la aplica y la limpia.
--
-- Nombrada 20260919220000 por lo mismo que 20260919210000: el CLI de Supabase
-- se salta las migraciones con versión anterior a la última aplicada.

alter table public.camino_ensure_log
  add column if not exists replan_pending_at timestamptz;

comment on column public.camino_ensure_log.replan_pending_at is
  'Marca de un reajuste forzado que no pudo ejecutarse (bloqueo ocupado o fallo). La siguiente ejecución de ensure-calendar lo aplica saltándose el throttle diario y lo limpia.';
