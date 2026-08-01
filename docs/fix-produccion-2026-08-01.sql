-- ============================================================
-- REPARACIÓN DE PRODUCCIÓN — Kairo · 2026-08-01
-- Basado en la auditoría de docs/audit-produccion.sql
--
-- v2: corregidos los tipos. La migración original del repo
-- (20260731150000) declaraba is_liga_member(uuid), pero en
-- producción ligas.id y liga_miembros.liga_id son TEXT.
-- Por eso nunca llegó a aplicarse: fallaba al crear la función.
--
-- Tipos verificados en producción:
--   ligas.id                          text
--   liga_miembros.liga_id             text
--   liga_miembros.user_id             uuid
--   ligas_rondas.id                   uuid
--   ligas_rondas.scope_key            text
--   ligas_rondas.scope_type           text
--   ligas_rondas_resultados.ronda_id  uuid
--
-- Ejecutar ENTERO de una vez en Supabase → SQL Editor.
-- Idempotente: se puede repetir sin romper nada.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- FIX 1 — Columna email en signup_attempts
-- Sin ella el INSERT falla, la tabla queda vacía y NINGÚN
-- límite de registro llega a saltar nunca.
-- (migración 20260622100000, nunca aplicada)
-- ────────────────────────────────────────────────────────────
alter table public.signup_attempts
  add column if not exists email text;

update public.signup_attempts
  set email = 'unknown'
  where email is null;

alter table public.signup_attempts
  alter column email set not null;

create index if not exists signup_attempts_email_created_at_idx
  on public.signup_attempts (email, created_at);


-- ────────────────────────────────────────────────────────────
-- FIX 2 — Cerrar las tablas de ligas
-- Estado actual: SELECT con USING (true) para authenticated.
-- Cualquier usuario registrado puede volcar TODAS las ligas
-- (incluidos sus códigos de invitación) y TODOS los miembros.
-- ────────────────────────────────────────────────────────────

-- La versión uuid nunca existió, pero por si acaso queda de un
-- intento previo, se elimina antes de crear la correcta.
drop function if exists public.is_liga_member(uuid);

create or replace function public.is_liga_member(target_liga_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.liga_miembros lm
    where lm.liga_id = target_liga_id
      and lm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_liga_member(text) from public;
grant execute on function public.is_liga_member(text) to authenticated;


-- ── ligas ───────────────────────────────────────────────────
drop policy if exists "cualquiera autenticado puede ver ligas" on public.ligas;
drop policy if exists "ligas: select authenticated"            on public.ligas;
drop policy if exists "ligas: select own membership"           on public.ligas;

create policy "ligas: select own membership"
  on public.ligas for select
  to authenticated
  using (public.is_liga_member(id));


-- ── liga_miembros (singular en producción) ──────────────────
drop policy if exists "miembros pueden ver su liga"               on public.liga_miembros;
drop policy if exists "liga_miembros: select own league"          on public.liga_miembros;
drop policy if exists "liga_miembros: select own league hardened" on public.liga_miembros;

create policy "liga_miembros: select own league hardened"
  on public.liga_miembros for select
  to authenticated
  using (public.is_liga_member(liga_id));


-- ── ligas_rondas ────────────────────────────────────────────
-- scope_key es text y guarda el id de liga (también text):
-- se pasa directo, sin cast.
drop policy if exists "ligas_rondas: select authenticated" on public.ligas_rondas;
drop policy if exists "ligas_rondas: select scoped"        on public.ligas_rondas;

create policy "ligas_rondas: select scoped"
  on public.ligas_rondas for select
  to authenticated
  using (
    case
      when scope_type = 'personal' then public.is_liga_member(scope_key)
      when scope_type in ('global', 'comunidad_materia') then true
      else false
    end
  );


-- ── ligas_rondas_resultados ─────────────────────────────────
drop policy if exists "ligas_rondas_resultados: select authenticated" on public.ligas_rondas_resultados;
drop policy if exists "ligas_rondas_resultados: select scoped"        on public.ligas_rondas_resultados;

create policy "ligas_rondas_resultados: select scoped"
  on public.ligas_rondas_resultados for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.ligas_rondas r
      where r.id = ligas_rondas_resultados.ronda_id
        and case
          when r.scope_type = 'personal' then public.is_liga_member(r.scope_key)
          else false
        end
    )
  );


-- ────────────────────────────────────────────────────────────
-- VERIFICACIÓN — ejecutar después
-- Esperado:
--   · 1 fila  "funcion ok"        → is_liga_member existe (true)
--   · 0 filas "POLITICA ABIERTA"  → ninguna liga con USING (true)
--   · 1 fila  "columna email ok"
-- ────────────────────────────────────────────────────────────
select 'funcion ok' as check, proname as detalle, prosecdef::text as valor
from pg_proc where proname = 'is_liga_member'

union all

select 'POLITICA ABIERTA', tablename || ' / ' || policyname, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('ligas','liga_miembros','ligas_rondas','ligas_rondas_resultados')
  and qual = 'true'

union all

select 'columna email ok', column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'signup_attempts'
  and column_name = 'email';
