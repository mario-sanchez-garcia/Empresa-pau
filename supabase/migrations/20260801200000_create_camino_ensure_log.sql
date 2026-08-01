-- Throttle de /api/camino/ensure-calendar.
--
-- Hasta ahora esa ruta se ejecutaba en CADA carga del Camino, y encadena
-- ensureCaminoCalendar + injectWeakReviewMissions + applyCalendarPersonalization.
-- Aun saliendo pronto por el hash de personalización, son 3-4 consultas de
-- escritura por carga de página. Con la actividad concentrada de 17:00 a 21:00
-- eso es el principal punto de presión sobre camino_calendar.
--
-- Tabla propia y mínima a propósito: añadir la columna a camino_route_settings
-- habría obligado a insertar filas para usuarios que no la tienen, y esa tabla
-- lleva entry_date/route_id que sí afectan al motor del Camino.
--
-- Una fila por usuario, no una por día: no crece con el tiempo.

create table if not exists public.camino_ensure_log (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  last_ensured_at  timestamptz not null default now(),
  last_ensured_day date        not null default (now() at time zone 'Europe/Madrid')::date,
  run_count        integer     not null default 1
);

create index if not exists camino_ensure_log_day_idx
  on public.camino_ensure_log (last_ensured_day);

-- RLS activo sin políticas: solo accesible con service role, igual que
-- signup_attempts y billing_events. La ruta que la usa ya va con service role.
alter table public.camino_ensure_log enable row level security;
