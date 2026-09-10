-- Run before deploying the matching planner. No tasks or progress are deleted.
begin;
alter table public.camino_calendar drop constraint if exists camino_calendar_status_check;
alter table public.camino_calendar add constraint camino_calendar_status_check
  check (status in ('pending','completed','missed','postponed','unscheduled','superseded'));

create table public.camino_plan_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  owner uuid not null,
  expires_at timestamptz not null
);
alter table public.camino_plan_locks enable row level security;

create or replace function public.camino_claim_plan(p_user_id uuid, p_owner uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into camino_plan_locks(user_id, owner, expires_at)
  values (p_user_id,p_owner,clock_timestamp() + interval '10 minutes')
  on conflict (user_id) do update set owner=excluded.owner, expires_at=excluded.expires_at
    where camino_plan_locks.expires_at < clock_timestamp();
  return found;
end $$;
create or replace function public.camino_release_plan(p_user_id uuid, p_owner uuid)
returns void language sql security definer set search_path = public as $$
  delete from camino_plan_locks where user_id=p_user_id and owner=p_owner;
$$;

-- Reconcile both sides of interrupted writes. A queue item is the stable work
-- identity; a calendar row is a placement. Preserve superseded placements.
create or replace function public.camino_reconcile_work(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 814));
  perform id from user_learning_queue where user_id=p_user_id order by id for update;
  with ranked as (
    select id,row_number() over(partition by queue_id order by locked desc, scheduled_date,created_at,id) as n
    from camino_calendar where user_id=p_user_id and queue_id is not null and status in ('pending','postponed')
  ) update camino_calendar c set status='superseded',start_time=null,end_time=null,updated_at=now()
    from ranked r where c.id=r.id and r.n>1;

  update camino_calendar c set status='superseded',start_time=null,end_time=null,updated_at=now()
  where c.user_id=p_user_id and c.status in ('unscheduled','pending','postponed') and c.queue_id is not null
    and (exists(select 1 from user_learning_queue q where q.id=c.queue_id and q.user_id=p_user_id and q.queue_status='completed')
      or (c.status='unscheduled' and exists(select 1 from camino_calendar a where a.user_id=p_user_id
        and a.queue_id=c.queue_id and a.status in ('pending','postponed','completed'))));

  update camino_calendar set start_time=null,end_time=null where user_id=p_user_id
    and status in ('unscheduled','superseded') and (start_time is not null or end_time is not null);

  update user_learning_queue q set queue_status='scheduled',calendar_id=c.id,scheduled_at=coalesce(q.scheduled_at,now())
    from camino_calendar c where q.user_id=p_user_id and c.user_id=p_user_id and c.queue_id=q.id
    and c.status in ('pending','postponed') and q.queue_status in ('pending','scheduled');
  update user_learning_queue q set queue_status='pending',calendar_id=null,scheduled_at=null
    where q.user_id=p_user_id and q.queue_status='scheduled'
      and not exists(select 1 from camino_calendar c where c.queue_id=q.id and c.user_id=p_user_id
        and c.status in ('pending','postponed','completed'));
end $$;

-- Apply a complete placement pass atomically. Guard against completion/editing
-- between reading and writing: roll back the entire pass and let it retry.
create or replace function public.camino_apply_placements(p_user_id uuid, p_changes jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare change jsonb; current_row camino_calendar%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 814));
  for change in select value from jsonb_array_elements(p_changes) order by value->>'id' loop
    select * into current_row from camino_calendar where id=(change->>'id')::uuid and user_id=p_user_id for update;
    if not found or current_row.status <> change->>'expected_status'
      or current_row.updated_at is distinct from (change->>'expected_updated_at')::timestamptz then
      raise exception 'plan_changed_retry' using errcode='40001';
    end if;
    update camino_calendar set
      scheduled_date=(change->>'scheduled_date')::date,
      status=change->>'status', start_time=(change->>'start_time')::time, end_time=(change->>'end_time')::time,
      metadata=change->'metadata',updated_at=now()
      where id=current_row.id and user_id=p_user_id;
  end loop;
  perform camino_reconcile_work(p_user_id);
end $$;

-- Retry identity must not depend on the newly chosen date.
do $$ declare u uuid; begin
  for u in select distinct user_id from camino_calendar loop perform camino_reconcile_work(u); end loop;
end $$;
create unique index camino_one_live_placement_per_queue on public.camino_calendar(user_id,queue_id)
  where queue_id is not null and status in ('pending','postponed');

revoke all on function public.camino_claim_plan(uuid,uuid) from public,anon,authenticated;
revoke all on function public.camino_release_plan(uuid,uuid) from public,anon,authenticated;
revoke all on function public.camino_reconcile_work(uuid) from public,anon,authenticated;
revoke all on function public.camino_apply_placements(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.camino_claim_plan(uuid,uuid) to service_role;
grant execute on function public.camino_release_plan(uuid,uuid) to service_role;
grant execute on function public.camino_reconcile_work(uuid) to service_role;
grant execute on function public.camino_apply_placements(uuid,jsonb) to service_role;
commit;
