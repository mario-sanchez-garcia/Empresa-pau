-- CAM-01: convertir todo el otorgamiento de XP en una sola transacción.
-- Antes el evento, el agregado por asignatura y el agregado global se
-- escribían en tres peticiones. Un fallo tras insertar el evento hacía que
-- el reintento chocase con la clave idempotente y dejase el ranking corto;
-- dos premios concurrentes también podían perder XP por asignatura.

create or replace function public.award_camino_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_source_type text,
  p_source_id text,
  p_mission_date date,
  p_subject text,
  p_missions_delta integer,
  p_streak_days integer,
  p_longest_streak integer,
  p_has_streak boolean
) returns table (awarded boolean, old_xp_total integer, new_xp_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
  v_new_xp integer;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'award_camino_xp: no autorizado para operar sobre otro usuario';
  end if;
  if p_xp_amount <= 0 or p_missions_delta < 0 then
    raise exception 'award_camino_xp: cantidades inválidas';
  end if;

  insert into public.camino_xp_events (
    user_id, xp_amount, source_type, source_id, mission_date, subject
  ) values (
    p_user_id, p_xp_amount, p_source_type, p_source_id, p_mission_date, p_subject
  )
  on conflict (user_id, source_type, source_id, mission_date) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select coalesce(cup.xp_total, 0) into v_new_xp
    from public.camino_user_progress cup
    where cup.user_id = p_user_id;
    v_new_xp := coalesce(v_new_xp, 0);
    return query select false, v_new_xp, v_new_xp;
    return;
  end if;

  if p_subject is not null and btrim(p_subject) <> '' then
    insert into public.camino_subject_xp (user_id, subject, xp_total, updated_at)
    values (p_user_id, p_subject, p_xp_amount, now())
    on conflict (user_id, subject) do update
      set xp_total = public.camino_subject_xp.xp_total + excluded.xp_total,
          updated_at = now();
  end if;

  insert into public.camino_user_progress (
    user_id, xp_total, missions_completed, streak_days, longest_streak,
    level_mates, level_historia, level_ingles, progress_towards_pau, updated_at
  ) values (
    p_user_id,
    p_xp_amount,
    p_missions_delta,
    case when p_has_streak then p_streak_days else 0 end,
    case when p_has_streak then p_longest_streak else 0 end,
    1, 1, 1, 1, now()
  )
  on conflict (user_id) do update set
    xp_total = public.camino_user_progress.xp_total + excluded.xp_total,
    missions_completed = public.camino_user_progress.missions_completed + excluded.missions_completed,
    streak_days = case when p_has_streak then p_streak_days else public.camino_user_progress.streak_days end,
    longest_streak = case when p_has_streak then greatest(public.camino_user_progress.longest_streak, p_longest_streak) else public.camino_user_progress.longest_streak end,
    updated_at = now()
  returning public.camino_user_progress.xp_total into v_new_xp;

  return query select true, v_new_xp - p_xp_amount, v_new_xp;
end;
$$;

revoke all on function public.award_camino_xp(uuid, integer, text, text, date, text, integer, integer, integer, boolean) from public;
revoke all on function public.award_camino_xp(uuid, integer, text, text, date, text, integer, integer, integer, boolean) from anon;
revoke all on function public.award_camino_xp(uuid, integer, text, text, date, text, integer, integer, integer, boolean) from authenticated;
grant execute on function public.award_camino_xp(uuid, integer, text, text, date, text, integer, integer, integer, boolean) to service_role;

-- Repara cualquier ventana histórica entre evento y agregado causada por el
-- flujo anterior. El ledger append-only es la fuente de verdad.
insert into public.camino_user_progress (user_id, xp_total, updated_at)
select events.user_id, sum(events.xp_amount)::integer, now()
from public.camino_xp_events events
group by events.user_id
on conflict (user_id) do update
  set xp_total = excluded.xp_total,
      updated_at = now();

insert into public.camino_subject_xp (user_id, subject, xp_total, updated_at)
select events.user_id, events.subject, sum(events.xp_amount)::integer, now()
from public.camino_xp_events events
where events.subject is not null and btrim(events.subject) <> ''
group by events.user_id, events.subject
on conflict (user_id, subject) do update
  set xp_total = excluded.xp_total,
      updated_at = now();
