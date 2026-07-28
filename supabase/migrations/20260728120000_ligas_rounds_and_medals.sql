-- Rediseño de Ligas: rondas mensuales, ámbito Comunidad+Materia, medallas.
--
-- Contexto: hoy el XP se calcula/almacena en camino_xp_events (ledger) +
-- camino_user_progress (rollup global histórico). Este cambio añade lo
-- mínimo necesario para soportar 3 ámbitos (Personal/Comunidad+Materia/
-- Global), rondas de 1 mes natural, y dos clasificaciones separadas
-- (Etapas por medallas, XP total histórico) sin duplicar el evento de
-- XP de origen — solo se derivan rollups adicionales del mismo insert.

-- ----------------------------------------------------------------
-- perfiles.comunidad: fuente de verdad server-side para agrupar por
-- comunidad autónoma. Hoy solo vivía en billing_events.payload.community
-- (log de eventos de onboarding), frágil para usar como join de ranking.
-- ----------------------------------------------------------------
alter table public.perfiles add column if not exists comunidad text;

-- ----------------------------------------------------------------
-- camino_xp_events.subject: necesario para agrupar el ámbito
-- Comunidad+Materia. Nullable — eventos históricos anteriores a este
-- cambio no participan retroactivamente en ese ámbito nuevo, pero
-- siguen contando igual para Personal y Global.
-- ----------------------------------------------------------------
alter table public.camino_xp_events add column if not exists subject text;

-- ----------------------------------------------------------------
-- camino_subject_xp: rollup incremental de XP histórico por (usuario,
-- asignatura) — igual que camino_user_progress.xp_total pero partido
-- por materia. Necesario porque el ranking "XP total" del ámbito
-- Comunidad+Materia debe contar solo el XP de esa materia, no el total
-- del alumno.
-- ----------------------------------------------------------------
create table if not exists public.camino_subject_xp (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  subject     text        not null,
  xp_total    integer     not null default 0 check (xp_total >= 0),
  updated_at  timestamptz not null default now(),
  unique (user_id, subject)
);

create index if not exists camino_subject_xp_subject_idx
  on public.camino_subject_xp (subject, xp_total desc);

alter table public.camino_subject_xp enable row level security;

create policy "camino_subject_xp: select own"
  on public.camino_subject_xp for select
  using (auth.uid() = user_id);

create policy "camino_subject_xp: insert own"
  on public.camino_subject_xp for insert
  with check (auth.uid() = user_id);

create policy "camino_subject_xp: update own"
  on public.camino_subject_xp for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- ligas_rondas: una fila por (ámbito, clave de ámbito, mes) YA CERRADO.
-- No se crean filas para rondas en curso — el XP de la ronda actual se
-- calcula en caliente filtrando camino_xp_events por fecha. Solo al
-- cerrar se necesita fijar el resultado, porque la composición de una
-- liga/comunidad+materia puede cambiar después de que la ronda termine.
-- ----------------------------------------------------------------
create table if not exists public.ligas_rondas (
  id            uuid        primary key default gen_random_uuid(),
  scope_type    text        not null check (scope_type in ('personal', 'comunidad_materia', 'global')),
  scope_key     text        not null, -- ligas.id | "madrid:matematicas_ii" | "global"
  period_start  date        not null,
  period_end    date        not null,
  status        text        not null default 'closed' check (status = 'closed'),
  closed_at     timestamptz not null default now(),
  unique (scope_type, scope_key, period_start)
);

create index if not exists ligas_rondas_scope_idx
  on public.ligas_rondas (scope_type, scope_key, period_start desc);

alter table public.ligas_rondas enable row level security;

create policy "ligas_rondas: select authenticated"
  on public.ligas_rondas for select
  to authenticated
  using (true);

-- Solo el cron (service role) inserta — sin policy de insert para
-- authenticated/anon, igual que el resto de tablas append-only.

-- ----------------------------------------------------------------
-- ligas_rondas_resultados: posición y medalla de cada alumno en cada
-- ronda cerrada. "Etapas" (ranking por medallas históricas) se agrega
-- en caliente sobre esta tabla — no necesita rollup propio, el volumen
-- es bajo (~1 fila por alumno por ámbito activo por mes).
-- ----------------------------------------------------------------
create table if not exists public.ligas_rondas_resultados (
  id          uuid        primary key default gen_random_uuid(),
  ronda_id    uuid        not null references public.ligas_rondas(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  round_xp    integer     not null check (round_xp >= 0),
  rank        integer     not null check (rank >= 1),
  medalla     text        check (medalla in ('oro', 'plata', 'bronce')),
  created_at  timestamptz not null default now(),
  unique (ronda_id, user_id)
);

create index if not exists ligas_rondas_resultados_user_idx
  on public.ligas_rondas_resultados (user_id, created_at desc);

alter table public.ligas_rondas_resultados enable row level security;

create policy "ligas_rondas_resultados: select authenticated"
  on public.ligas_rondas_resultados for select
  to authenticated
  using (true);

-- Solo el cron (service role) inserta.
