-- Reserve correction quota atomically before invoking the paid provider.
-- Failed and structurally invalid calls are finalized without consuming quota.
create table if not exists public.ai_usage_reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  action text not null,
  credit_key text,
  status text not null check (status in ('reserved', 'success', 'error', 'invalid_output')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_usage_reservations_quota_idx
  on public.ai_usage_reservations (user_id, action, route, created_at desc);
create index if not exists ai_usage_reservations_reservation_idx
  on public.ai_usage_reservations (reservation_id);

alter table public.ai_usage_reservations enable row level security;

-- Preserve usage already consumed earlier in the current month so deploying
-- the new atomic counter never resets a student's commercial quota.
insert into public.ai_usage_reservations
  (reservation_id, user_id, route, action, credit_key, status, expires_at, created_at, updated_at)
select e.id, e.user_id, e.route, e.action,
  case
    when e.route = '/api/camino/correct' then nullif(e.metadata ->> 'creditKey', '')
    when e.route = '/api/simulacro' then nullif(e.metadata ->> 'simulacroId', '')
    else null
  end,
  'success', e.created_at, e.created_at, e.created_at
from public.ai_usage_events e
where e.status = 'success'
  and e.created_at >= date_trunc('month', now())
  and e.action in ('chat', 'image_correction', 'parcial_correction', 'simulacro_correction')
on conflict (id) do nothing;

create or replace function public.reserve_ai_usage_quota(
  p_user_id uuid,
  p_route text,
  p_action text,
  p_daily_limit integer,
  p_window_seconds integer,
  p_monthly_limit integer,
  p_units integer default 1,
  p_credit_key text default null
)
returns table (
  allowed boolean,
  blocked_by text,
  current_count integer,
  retry_after_seconds integer,
  reservation_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_month_start timestamptz := date_trunc('month', v_now);
  v_units integer := greatest(1, least(coalesce(p_units, 1), 30));
  v_daily integer;
  v_monthly integer;
  v_new_monthly integer;
  v_oldest timestamptz;
  v_reservation uuid := gen_random_uuid();
begin
  if auth.uid() is distinct from p_user_id
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'not authorized';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_action, 0));

  select count(*)::integer, min(r.created_at)
    into v_daily, v_oldest
  from public.ai_usage_reservations r
  where r.user_id = p_user_id
    and r.route = p_route
    and r.action = p_action
    and r.created_at >= v_now - make_interval(secs => greatest(1, p_window_seconds))
    and (r.status = 'success' or (r.status = 'reserved' and r.expires_at > v_now));

  if v_daily + v_units > greatest(0, p_daily_limit) then
    return query select false, 'daily'::text, v_daily,
      greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => greatest(1, p_window_seconds)) - v_now)))::integer),
      null::uuid;
    return;
  end if;

  select count(distinct coalesce(r.credit_key, r.id::text))::integer
    into v_monthly
  from public.ai_usage_reservations r
  where r.user_id = p_user_id
    and r.action = p_action
    and r.created_at >= v_month_start
    and (r.status = 'success' or (r.status = 'reserved' and r.expires_at > v_now));

  if nullif(trim(p_credit_key), '') is null then
    v_new_monthly := v_units;
  else
    select count(*)::integer into v_new_monthly
    from generate_series(1, v_units) n
    where not exists (
      select 1 from public.ai_usage_reservations r
      where r.user_id = p_user_id
        and r.action = p_action
        and r.created_at >= v_month_start
        and r.credit_key = case when n = 1 then trim(p_credit_key) else trim(p_credit_key) || '::img' || n end
        and (r.status = 'success' or (r.status = 'reserved' and r.expires_at > v_now))
    );
  end if;

  if v_monthly + v_new_monthly > greatest(0, p_monthly_limit) then
    return query select false, 'monthly'::text, v_monthly, null::integer, null::uuid;
    return;
  end if;

  insert into public.ai_usage_reservations
    (reservation_id, user_id, route, action, credit_key, status, expires_at)
  select v_reservation, p_user_id, p_route, p_action,
    case when nullif(trim(p_credit_key), '') is null then null
         when n = 1 then trim(p_credit_key)
         else trim(p_credit_key) || '::img' || n end,
    'reserved', v_now + interval '10 minutes'
  from generate_series(1, v_units) n;

  return query select true, null::text, v_daily, null::integer, v_reservation;
end;
$$;

create or replace function public.finalize_ai_usage_quota(
  p_reservation_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('success', 'error', 'invalid_output') then
    raise exception 'invalid status';
  end if;

  update public.ai_usage_reservations r
  set status = p_status, updated_at = now()
  where r.reservation_id = p_reservation_id
    and r.status = 'reserved'
    and (auth.uid() = r.user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');
end;
$$;

revoke all on table public.ai_usage_reservations from anon, authenticated;
grant execute on function public.reserve_ai_usage_quota(uuid, text, text, integer, integer, integer, integer, text) to authenticated, service_role;
grant execute on function public.finalize_ai_usage_quota(uuid, text) to authenticated, service_role;
