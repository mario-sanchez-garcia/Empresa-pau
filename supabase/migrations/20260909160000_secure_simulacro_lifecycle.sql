-- Simulacros are read directly by the browser, but every mutation that can
-- affect academic history, AI cost or XP must pass through an authenticated
-- server route.  The legacy ALL policy let a browser set nota_final,
-- resultado_json and estado arbitrarily.

alter table public.historial_simulacros
  add column if not exists answers_revision bigint not null default 0,
  add column if not exists timer_revision bigint not null default 0,
  add column if not exists correction_status text not null default 'idle',
  add column if not exists correction_started_at timestamptz;

-- Backfill pre-existing rows. Historical technical failures used to be
-- incorrectly marked completed; make them retryable without inventing a
-- grade. Genuine completed results remain immutable history.
update public.historial_simulacros
set estado = 'en_progreso', correction_status = 'failed', nota_final = null
where estado = 'completado'
  and (
    lower(coalesce(resultado_json ->> 'correction_error', 'false')) = 'true'
    or resultado_json ->> 'estado_correccion' in ('error', 'parcial')
  );

update public.historial_simulacros
set correction_status = 'completed'
where estado = 'completado' and correction_status <> 'completed';

update public.historial_simulacros
set correction_status = case
  when resultado_json ->> 'estado_correccion' = 'parcial' then 'partial'
  when resultado_json ->> 'estado_correccion' = 'error' then 'failed'
  else correction_status
end
where estado = 'en_progreso';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.historial_simulacros'::regclass
      and conname = 'historial_simulacros_correction_status_check'
  ) then
    alter table public.historial_simulacros
      add constraint historial_simulacros_correction_status_check
      check (correction_status in ('idle', 'processing', 'partial', 'failed', 'completed'));
  end if;
end $$;

drop policy if exists "Users can manage their own simulacros" on public.historial_simulacros;
drop policy if exists "Users can read own simulacros" on public.historial_simulacros;
drop policy if exists "Users can create own simulacros" on public.historial_simulacros;
drop policy if exists "Users can update own simulacros" on public.historial_simulacros;
drop policy if exists "Users can delete own simulacros" on public.historial_simulacros;

create policy "Users can read own simulacros"
on public.historial_simulacros
for select
using (auth.uid() = user_id);

create index if not exists historial_simulacros_user_status_idx
  on public.historial_simulacros (user_id, estado, correction_status, updated_at desc);
