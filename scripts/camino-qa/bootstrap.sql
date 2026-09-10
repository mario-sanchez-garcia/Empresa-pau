-- Mínimo de Supabase que necesitan las migraciones de Camino. Idempotente a
-- propósito: el script se ejecuta varias veces contra el mismo contenedor
-- desechable mientras se itera, y un "role already exists" abortaba la tanda
-- entera dando la falsa impresión de que fallaban las invariantes.
do $$ begin
  create role anon;
exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated;
exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role;
exception when duplicate_object then null; end $$;
create schema if not exists auth;
create table if not exists auth.users(id uuid primary key);
create or replace function auth.uid() returns uuid language sql as $$ select null::uuid $$;
