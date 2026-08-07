-- Ajuste puntual de límites por alumno concreto, sin tocar su plan ni los
-- límites generales de nadie más (ver CAMINO_PLAN_LIMITS en
-- app/lib/camino/caminoPlanLimits.ts, que no se toca aquí).
--
-- Caso que lo motiva: darle a un alumno concreto un puñado de simulacros
-- extra este mes y un margen algo mayor en el resto de cuotas, sin subirlo
-- a un plan superior (ni inventarle uno) y sin la vía de "sin límites en
-- absoluto" de INTERNAL_USER_EMAILS (esa es solo para el equipo interno).
--
-- Una fila por alumno, no por mes: es un ajuste manual que se aplica todos
-- los meses hasta que alguien lo quite o lo ponga a 0 — igual de simple que
-- añadir la fila para dárselo. Si en el futuro hace falta que caduque solo,
-- se puede añadir una columna expires_at entonces; no hace falta ahora.
--
-- Se lee sumando estos extra_* al límite del plan justo antes de comparar
-- contra el consumo del mes (ver app/lib/billing/limitOverrides.ts) — nunca
-- se escribe en camino_plan_limits ni se modifica el plan_id del alumno.

create table if not exists public.user_limit_overrides (
  user_id                     uuid primary key references auth.users(id) on delete cascade,
  extra_corrections_per_month integer not null default 0,
  extra_photos_per_month      integer not null default 0,
  extra_partials_per_month    integer not null default 0,
  extra_mocks_per_month       integer not null default 0,
  notes                       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- RLS activo sin políticas: solo accesible con service role, mismo patrón
-- que camino_ensure_log/signup_attempts/billing_events. Los endpoints que lo
-- leen (exam/correct, camino/correct, simulacro, practica-parcial) ya usan
-- service role para el resto de comprobaciones de plan en esa misma request.
alter table public.user_limit_overrides enable row level security;
