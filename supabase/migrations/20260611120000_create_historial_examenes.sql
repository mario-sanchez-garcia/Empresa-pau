-- Version the critical exam correction history table used by Examenes, Historial, Mi Plan,
-- grade prediction and product metrics. This migration is intentionally additive and
-- does not drop or rewrite existing production data.

create table if not exists public.historial_examenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asignatura text,
  tipo text,
  "año" integer,
  bloque text,
  opcion text,
  nota numeric,
  nota_maxima numeric,
  enunciado text,
  respuesta text,
  correccion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.historial_examenes
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists asignatura text,
  add column if not exists tipo text,
  add column if not exists "año" integer,
  add column if not exists bloque text,
  add column if not exists opcion text,
  add column if not exists nota numeric,
  add column if not exists nota_maxima numeric,
  add column if not exists enunciado text,
  add column if not exists respuesta text,
  add column if not exists correccion text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.historial_examenes
  alter column id set default gen_random_uuid(),
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historial_examenes_user_id_fkey'
      and conrelid = 'public.historial_examenes'::regclass
  ) then
    alter table public.historial_examenes
      add constraint historial_examenes_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade not valid;
  end if;
end $$;

alter table public.historial_examenes enable row level security;

drop policy if exists "Users can read own exam history" on public.historial_examenes;
create policy "Users can read own exam history"
  on public.historial_examenes
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own exam history" on public.historial_examenes;
create policy "Users can create own exam history"
  on public.historial_examenes
  for insert
  WITH CHECK (auth.uid() = user_id);

drop policy if exists "Users can update own exam history" on public.historial_examenes;
create policy "Users can update own exam history"
  on public.historial_examenes
  for update
  using (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

drop policy if exists "Users can delete own exam history" on public.historial_examenes;
create policy "Users can delete own exam history"
  on public.historial_examenes
  for delete
  using (auth.uid() = user_id);

create index if not exists historial_examenes_user_created_idx
  on public.historial_examenes (user_id, created_at desc);

create index if not exists historial_examenes_user_asignatura_created_idx
  on public.historial_examenes (user_id, asignatura, created_at desc);

comment on table public.historial_examenes is
  'Critical Kairo exam correction history. Used by Examenes, Historial, Mi Plan, grade prediction and metrics.';
comment on column public.historial_examenes.correccion is
  'Do not truncate full correction: History modal needs complete feedback.';
