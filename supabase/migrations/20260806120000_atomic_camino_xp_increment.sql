-- awardXp() (app/lib/camino/awardXp.ts) escribía siempre el XP base+bonus
-- combinado como una sola fila en camino_xp_events (eso nunca ha estado
-- mal — el evento por sí solo siempre lleva el importe correcto), pero
-- para mantener el agregado camino_user_progress.xp_total (que es lo que
-- de verdad lee el ranking) hacía un read-modify-write en dos pasos desde
-- el cliente: leer xp_total, sumarle el XP en JS, y escribir el resultado.
-- Si dos acciones que dan XP al mismo alumno caían casi a la vez (dos
-- pestañas, un simulacro terminando justo cuando se recalcula otra
-- misión...), la segunda escritura podía basarse en una lectura ya
-- obsoleta y pisar el resultado de la primera, perdiendo XP ya concedido
-- del agregado — aunque el evento individual siguiera bien registrado en
-- camino_xp_events. Esta función hace el incremento en una sola sentencia
-- SQL con el registro bloqueado (select ... for update), sin lectura
-- intermedia desde la aplicación.
create or replace function public.increment_camino_progress(
  p_user_id uuid,
  p_xp_delta integer,
  p_missions_delta integer,
  p_streak_days integer,
  p_longest_streak integer,
  p_has_streak boolean
) returns table (old_xp_total integer, new_xp_total integer, missions_completed integer)
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
      xp_total = xp_total + p_xp_delta,
      missions_completed = missions_completed + p_missions_delta,
      streak_days = case when p_has_streak then p_streak_days else streak_days end,
      longest_streak = case when p_has_streak then greatest(longest_streak, p_longest_streak) else longest_streak end,
      updated_at = now()
    where user_id = p_user_id;
  end if;

  return query
    select v_old_xp, cup.xp_total, cup.missions_completed
    from public.camino_user_progress cup
    where cup.user_id = p_user_id;
end;
$$;

grant execute on function public.increment_camino_progress(uuid, integer, integer, integer, integer, boolean) to service_role;

-- Corrección de datos históricos: camino_xp_events es un ledger append-only
-- (nunca se sobrescribe una fila ya insertada), así que sigue siendo la
-- fuente de verdad aunque el agregado se haya desincronizado por la
-- condición de carrera de arriba. Se recalcula xp_total como la suma real
-- de todos los eventos de cada alumno y se corrige solo donde no coincide
-- — no toca a nadie sin eventos (evita poner a 0 XP legado de antes de que
-- existiera camino_xp_events, aunque en este caso ambas tablas nacieron en
-- la misma migración del 13 de junio).
update public.camino_user_progress cup
set xp_total = totals.total_xp, updated_at = now()
from (
  select user_id, sum(xp_amount) as total_xp
  from public.camino_xp_events
  group by user_id
) totals
where cup.user_id = totals.user_id
  and cup.xp_total <> totals.total_xp;
