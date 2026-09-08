-- A03 de la auditoría del 7-8 de septiembre de 2026: increment_camino_progress
-- es SECURITY DEFINER, recibe p_user_id como argumento sin comprobar
-- auth.uid() dentro, y las dos migraciones que la crearon
-- (20260806120000_atomic_camino_xp_increment.sql y
-- 20260806130000_fix_increment_camino_progress_ambiguity.sql) solo conceden
-- EXECUTE a service_role — nunca revocan el privilegio que Postgres concede
-- por defecto a PUBLIC al crear una función. Otras funciones de este mismo
-- repo sí llevan ese revoke explícito (is_liga_member en
-- 20260731150000_harden_ligas_rls.sql, schema_snapshot en
-- 20260801220000_create_schema_snapshot_fn.sql) — esta se quedó fuera del
-- patrón. Sin el revoke, cualquier cliente autenticado (o anónimo, según el
-- grant de esquema) puede invocar la función vía RPC de Supabase y sumarse
-- XP a sí mismo o a cualquier otro user_id a voluntad.
--
-- awardXp.ts (único punto de escritura de XP en el código) siempre llama con
-- createServiceClient() — confirmado en app/api/camino/complete-mission,
-- así que revocar PUBLIC/anon/authenticated no rompe ningún flujo legítimo.
--
-- Cinturón y tirantes: además del revoke (la corrección real), se añade una
-- comprobación de identidad dentro de la función. Si alguna vez se expusiera
-- por error a un rol de cliente, la función igualmente rechaza operar sobre
-- un user_id que no sea el de la sesión autenticada — salvo cuando quien
-- ejecuta es literalmente el service_role, que no tiene auth.uid().

revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from public;
revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from anon;
revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from authenticated;

grant execute on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) to service_role;

create or replace function public.increment_camino_progress(
  p_user_id uuid,
  p_xp_delta integer,
  p_missions_delta integer,
  p_streak_days integer,
  p_longest_streak integer,
  p_has_streak boolean
) returns table (old_xp_total integer, new_xp_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_xp integer;
begin
  -- auth.uid() es null cuando quien llama es service_role (no tiene sesión
  -- de auth) o un contexto sin JWT (p.ej. una migración o el SQL editor).
  -- Si hay un auth.uid() presente y no coincide con p_user_id, es un
  -- cliente autenticado intentando tocar el progreso de otro alumno:
  -- se rechaza. Esto es la defensa de respaldo; la defensa real es el
  -- revoke de arriba, que impide que un cliente llegue aquí siquiera.
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'increment_camino_progress: no autorizado para operar sobre otro usuario';
  end if;

  select xp_total into v_old_xp
  from public.camino_user_progress
  where user_id = p_user_id
  for update;

  if not found then
    v_old_xp := 0;
    insert into public.camino_user_progress (
      user_id, xp_total, missions_completed, streak_days, longest_streak,
      level_mates, level_historia, level_ingles, progress_towards_pau, updated_at
    ) values (
      p_user_id,
      p_xp_delta,
      p_missions_delta,
      case when p_has_streak then p_streak_days else 0 end,
      case when p_has_streak then p_longest_streak else 0 end,
      1, 1, 1, 1, now()
    );
  else
    update public.camino_user_progress set
      xp_total = camino_user_progress.xp_total + p_xp_delta,
      missions_completed = camino_user_progress.missions_completed + p_missions_delta,
      streak_days = case when p_has_streak then p_streak_days else camino_user_progress.streak_days end,
      longest_streak = case when p_has_streak then greatest(camino_user_progress.longest_streak, p_longest_streak) else camino_user_progress.longest_streak end,
      updated_at = now()
    where user_id = p_user_id;
  end if;

  return query
    select v_old_xp, cup.xp_total
    from public.camino_user_progress cup
    where cup.user_id = p_user_id;
end;
$$;

revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from public;
revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from anon;
revoke all on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) from authenticated;
grant execute on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) to service_role;
