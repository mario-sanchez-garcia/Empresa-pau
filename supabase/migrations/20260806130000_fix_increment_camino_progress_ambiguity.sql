-- Corrige un bug real en increment_camino_progress() (migración
-- 20260806120000): la función declaraba RETURNS TABLE(..., missions_completed
-- integer), y ese nombre de columna de salida colisiona con la columna real
-- missions_completed de camino_user_progress. PL/pgSQL resuelve identificadores
-- sin cualificar primero contra variables/OUT params del propio bloque, así
-- que la sentencia `missions_completed = missions_completed + p_missions_delta`
-- del UPDATE quedaba ambigua — la función fallaba con "column reference
-- 'missions_completed' is ambiguous" en TODA llamada real, rompiendo el
-- otorgamiento de XP de cualquier misión/simulacro/examen desde el momento en
-- que se aplicó la migración anterior. awardXp.ts nunca leyó ese campo del
-- resultado (solo old_xp_total/new_xp_total), así que se elimina en vez de
-- cualificarlo, quitando la colisión de raíz.
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

grant execute on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) to service_role;
