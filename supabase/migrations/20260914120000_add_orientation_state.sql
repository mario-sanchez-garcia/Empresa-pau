-- Estado de trabajo de Orientación. El objetivo explícito para Camino continúa
-- en sus columnas propias; este documento solo sincroniza la exploración y la
-- simulación entre dispositivos.
alter table public.perfiles
  add column if not exists orientation_state jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'perfiles_orientation_state_v1_check'
      and conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_orientation_state_v1_check
      check (
        orientation_state is null
        or (
          jsonb_typeof(orientation_state) = 'object'
          and orientation_state ->> 'version' = '1'
        )
      );
  end if;
end
$$;

comment on column public.perfiles.orientation_state is
  'Estado versionado de exploración y simulación de Orientación; protegido por el RLS existente de perfiles.';
