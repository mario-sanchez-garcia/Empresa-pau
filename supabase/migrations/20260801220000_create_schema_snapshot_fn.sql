-- Función de introspección para el detector de desincronización.
--
-- Contexto: durante seis semanas hubo migraciones en el repo que nunca se
-- aplicaron a producción (signup_attempts.email desde el 22 de junio, las RLS
-- de ligas del 31 de julio). Nadie se enteró porque no había forma de saberlo:
-- el código fallaba en silencio dentro de un try/catch.
--
-- Esto expone el estado REAL del esquema para que /api/admin/schema-drift
-- pueda compararlo con lo que el código espera. Solo lectura de catálogos.

create or replace function public.schema_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'tables', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', tablename,
        'rls', rowsecurity
      ) order by tablename), '[]'::jsonb)
      from pg_tables where schemaname = 'public'
    ),
    'columns', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'table', table_name,
        'column', column_name
      ) order by table_name, column_name), '[]'::jsonb)
      from information_schema.columns where table_schema = 'public'
    ),
    'functions', (
      select coalesce(jsonb_agg(distinct proname), '[]'::jsonb)
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
    ),
    'policies', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'table', tablename,
        'name', policyname,
        'cmd', cmd,
        'using', qual
      ) order by tablename, policyname), '[]'::jsonb)
      from pg_policies where schemaname = 'public'
    )
  );
$$;

-- Solo service role. La ruta que la llama ya usa esa clave y además exige
-- usuario interno.
revoke all on function public.schema_snapshot() from public;
revoke all on function public.schema_snapshot() from anon;
revoke all on function public.schema_snapshot() from authenticated;
