-- Security hardening: league data must not be enumerable with the public anon key.
-- Invite-code lookup is handled by server API routes using the service role.

create or replace function public.is_liga_member(target_liga_id uuid)
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

revoke all on function public.is_liga_member(uuid) from public;
grant execute on function public.is_liga_member(uuid) to authenticated;

drop policy if exists "ligas: select authenticated" on public.ligas;
drop policy if exists "ligas: select own membership" on public.ligas;

create policy "ligas: select own membership"
  on public.ligas for select
  to authenticated
  using (public.is_liga_member(id));

drop policy if exists "liga_miembros: select own league" on public.liga_miembros;
drop policy if exists "liga_miembros: select own league hardened" on public.liga_miembros;

create policy "liga_miembros: select own league hardened"
  on public.liga_miembros for select
  to authenticated
  using (public.is_liga_member(liga_id));

drop policy if exists "ligas_rondas: select authenticated" on public.ligas_rondas;
drop policy if exists "ligas_rondas: select scoped" on public.ligas_rondas;

create policy "ligas_rondas: select scoped"
  on public.ligas_rondas for select
  to authenticated
  using (
    case
      when scope_type = 'personal' then public.is_liga_member(scope_key::uuid)
      when scope_type in ('global', 'comunidad_materia') then true
      else false
    end
  );

drop policy if exists "ligas_rondas_resultados: select authenticated" on public.ligas_rondas_resultados;
drop policy if exists "ligas_rondas_resultados: select scoped" on public.ligas_rondas_resultados;

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
          when r.scope_type = 'personal' then public.is_liga_member(r.scope_key::uuid)
          else false
        end
    )
  );
