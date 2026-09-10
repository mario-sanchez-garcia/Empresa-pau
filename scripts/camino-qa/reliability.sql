\set ON_ERROR_STOP on
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000001');
insert into user_learning_queue(id,user_id,subject,v2_sort_order,title) values
 ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','fisica',1,'Tema 1'),
 ('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000001','fisica',2,'Tema 2');
insert into camino_calendar(id,user_id,subject,v2_sort_order,title,scheduled_date,queue_id,start_time,end_time) values
 ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','fisica',1,'Tema 1','2027-05-17','00000000-0000-0000-0000-000000000011','16:00','16:30'),
 ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000001','fisica',2,'Tema 2','2027-05-19','00000000-0000-0000-0000-000000000012','16:00','16:30');

do $$ declare u uuid='00000000-0000-0000-0000-000000000001'; changes jsonb; initial_date date; begin
  -- Failure after calendar insertion but before marking the queue is recoverable.
  perform camino_reconcile_work(u);
  if (select count(*) from user_learning_queue where user_id=u and queue_status='scheduled') <> 2 then raise exception 'queue recovery failed'; end if;
  perform camino_reconcile_work(u);
  if (select count(*) from camino_calendar where user_id=u) <> 2 then raise exception 'retry duplicated work'; end if;
  -- A second placement of the same work, even on a different day, cannot race in.
  begin
    insert into camino_calendar(user_id,subject,v2_sort_order,scheduled_date,queue_id) values
      (u,'fisica',1,'2027-05-20','00000000-0000-0000-0000-000000000011');
    raise exception 'duplicate accepted';
  exception when unique_violation then null; end;
  -- Partial failure inside the placement batch rolls the WHOLE batch back.
  select jsonb_agg(jsonb_build_object('id',id,'expected_status',status,'expected_updated_at',updated_at,
    'scheduled_date','2027-05-21','status','pending','start_time','17:00','end_time','17:30','metadata',metadata) order by id)
    into changes from camino_calendar where user_id=u;
  changes=jsonb_set(changes,'{1,expected_status}','"completed"');
  begin
    perform camino_apply_placements(u,changes);
    raise exception 'stale batch accepted';
  exception when serialization_failure then null; end;
  if (select scheduled_date from camino_calendar where id='00000000-0000-0000-0000-000000000021') <> date '2027-05-17' then raise exception 'partial commit'; end if;
  -- No capacity -> explicit unplaced state, free hours and pending queue.
  select jsonb_agg(jsonb_build_object('id',id,'expected_status',status,'expected_updated_at',updated_at,
    'scheduled_date',scheduled_date,'status','unscheduled','start_time',null,'end_time',null,'metadata',metadata))
    into changes from camino_calendar where user_id=u;
  perform camino_apply_placements(u,changes);
  if exists(select 1 from camino_calendar where user_id=u and start_time is not null) then raise exception 'unscheduled still occupies time'; end if;
  if exists(select 1 from user_learning_queue where user_id=u and queue_status<>'pending') then raise exception 'queue not reopened'; end if;
  -- Availability increased -> re-place the same IDs (no lost/duplicate tasks).
  select jsonb_agg(jsonb_build_object('id',id,'expected_status',status,'expected_updated_at',updated_at,
    'scheduled_date',scheduled_date,'status','pending','start_time','18:00','end_time','18:30','metadata',metadata))
    into changes from camino_calendar where user_id=u;
  perform camino_apply_placements(u,changes);
  if (select count(*) from user_learning_queue where user_id=u and queue_status='scheduled')<>2 then raise exception 're-placement not reflected'; end if;
  -- Completion wins against an in-flight planner; completed work cannot reopen.
  update user_learning_queue set queue_status='completed' where id='00000000-0000-0000-0000-000000000011';
  perform camino_reconcile_work(u);
  if (select status from camino_calendar where id='00000000-0000-0000-0000-000000000021')<>'superseded' then raise exception 'completed work still scheduled'; end if;
  -- Lease owner cannot release another execution's lock.
  if not camino_claim_plan(u,'00000000-0000-0000-0000-000000000031') then raise exception 'first lock failed'; end if;
  if camino_claim_plan(u,'00000000-0000-0000-0000-000000000032') then raise exception 'second owner acquired'; end if;
  perform camino_release_plan(u,'00000000-0000-0000-0000-000000000032');
  if not exists(select 1 from camino_plan_locks where user_id=u) then raise exception 'wrong owner released'; end if;
  update camino_plan_locks set expires_at=now()-interval '1 second' where user_id=u;
  if not camino_claim_plan(u,'00000000-0000-0000-0000-000000000032') then raise exception 'expired lock not recoverable'; end if;
end $$;
-- Student roles cannot invoke privileged planning functions or see leases.
set local role authenticated;
do $$ begin
  begin perform public.camino_claim_plan('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000031');
    raise exception 'student acquired privileged lock';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'Camino database invariants passed' as result;
