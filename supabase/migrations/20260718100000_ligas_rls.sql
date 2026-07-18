-- P0-5: Enable RLS on ligas and liga_miembros
-- All app access goes through the service-role client (bypasses RLS).
-- These policies protect against direct anon/authenticated key access.

-- ----------------------------------------------------------------
-- ligas
-- ----------------------------------------------------------------
alter table public.ligas enable row level security;

-- Any authenticated user can look up a liga (needed for code-lookup flow)
create policy "ligas: select authenticated"
  on public.ligas for select
  to authenticated
  using (true);

-- Creating a liga is server-only (service role); block direct client inserts
-- by requiring creador_user_id = auth.uid() as a safety net
create policy "ligas: insert own"
  on public.ligas for insert
  to authenticated
  with check (creador_user_id = auth.uid());

-- ----------------------------------------------------------------
-- liga_miembros
-- ----------------------------------------------------------------
alter table public.liga_miembros enable row level security;

-- Users can see all members of leagues they belong to (for ranking display)
create policy "liga_miembros: select own league"
  on public.liga_miembros for select
  to authenticated
  using (
    liga_id in (
      select liga_id from public.liga_miembros lm2 where lm2.user_id = auth.uid()
    )
  );

-- Users can only insert their own membership row
create policy "liga_miembros: insert own"
  on public.liga_miembros for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can only delete their own membership row
create policy "liga_miembros: delete own"
  on public.liga_miembros for delete
  to authenticated
  using (user_id = auth.uid());
