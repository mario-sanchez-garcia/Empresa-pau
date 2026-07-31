-- P0 security: perfiles stores student preferences and personal product data.
-- Authenticated clients may only access their own profile row.
-- Cross-user lookups for rankings/usernames must go through server routes.

alter table public.perfiles enable row level security;

drop policy if exists "perfiles: select own" on public.perfiles;
drop policy if exists "perfiles: insert own" on public.perfiles;
drop policy if exists "perfiles: update own" on public.perfiles;

create policy "perfiles: select own"
  on public.perfiles for select
  to authenticated
  using (auth.uid() = id);

create policy "perfiles: insert own"
  on public.perfiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "perfiles: update own"
  on public.perfiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
