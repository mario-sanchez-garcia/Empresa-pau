create table if not exists public.historial_simulacros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asignatura text not null,
  opcion text not null check (opcion in ('A', 'B')),
  dificultad text not null check (dificultad in ('Fácil', 'Media', 'Difícil')),
  dificultad_real text,
  bloques jsonb not null default '[]'::jsonb,
  respuestas_parciales jsonb not null default '{}'::jsonb,
  resultado_json jsonb,
  nota_final numeric,
  estado text not null default 'en_progreso' check (estado in ('en_progreso', 'completado')),
  tiempo_empleado integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.historial_simulacros enable row level security;

create policy "Users can read own simulacros"
on public.historial_simulacros
for select
using (auth.uid() = user_id);

create policy "Users can create own simulacros"
on public.historial_simulacros
for insert
with check (auth.uid() = user_id);

create policy "Users can update own simulacros"
on public.historial_simulacros
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own simulacros"
on public.historial_simulacros
for delete
using (auth.uid() = user_id);

create index if not exists historial_simulacros_user_created_idx
on public.historial_simulacros(user_id, created_at desc);
