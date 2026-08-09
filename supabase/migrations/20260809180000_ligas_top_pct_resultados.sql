-- Niveles "top %" de temporada (top5/top10/top25/top50), calculados sobre
-- la MISMA población que el ámbito 'global' de ligas_rondas (todos los
-- alumnos con actividad ese mes, sin importar su liga) — igual que el
-- medallero oro/plata/bronce, pero como eje independiente: bronce y plata
-- no se combinan con top%, solo oro (regla de negocio, no de esquema — se
-- aplica al leer, en /api/ligas/etapas, comparando el periodo de esta fila
-- contra ligas_rondas_resultados.medalla='oro' de scope_type='personal' del
-- mismo alumno en ese mismo periodo).
--
-- Se guarda solo el nivel MÁS exigente alcanzado esa ronda (top5% implica
-- top10/25/50 — la expansión a los niveles anidados se hace al leer, no al
-- guardar, mismo principio que "no rollup propio" ya usado en
-- ligas_rondas_resultados).

create table if not exists public.ligas_top_pct_resultados (
  id                  uuid        primary key default gen_random_uuid(),
  ronda_id            uuid        not null references public.ligas_rondas(id) on delete cascade,
  user_id             uuid        not null references auth.users(id) on delete cascade,
  tier                text        not null check (tier in ('top5', 'top10', 'top25', 'top50')),
  rank                integer     not null check (rank >= 1),
  total_participants  integer     not null check (total_participants >= 1),
  created_at          timestamptz not null default now(),
  unique (ronda_id, user_id)
);

create index if not exists ligas_top_pct_resultados_user_idx
  on public.ligas_top_pct_resultados (user_id, created_at desc);

alter table public.ligas_top_pct_resultados enable row level security;

create policy "ligas_top_pct_resultados: select authenticated"
  on public.ligas_top_pct_resultados for select
  to authenticated
  using (true);

-- Solo el cron (service role) inserta — mismo patrón que ligas_rondas_resultados.
