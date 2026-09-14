\set ON_ERROR_STOP on
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000041');
do $$ declare a uuid; b uuid; begin
  a=record_beta_incident('00000000-0000-0000-0000-000000000041','automatic','plan_failed','/camino','','blocking','fixture-hash');
  b=record_beta_incident('00000000-0000-0000-0000-000000000041','automatic','plan_failed','/camino','','blocking','fixture-hash');
  if a<>b then raise exception 'not deduplicated'; end if;
  if (select occurrences from beta_incidents where id=a)<>2 then raise exception 'incorrect occurrence count'; end if;
  update beta_incidents set status='resolved',resolved_at=now() where id=a;
  perform record_beta_incident('00000000-0000-0000-0000-000000000041','automatic','plan_failed','/camino','','blocking','fixture-hash');
  if (select status from beta_incidents where id=a)<>'open' then raise exception 'recurrence hidden'; end if;
end $$;
set local role authenticated;
do $$ begin
  begin perform record_beta_incident('00000000-0000-0000-0000-000000000041','automatic','plan_failed','/camino','','blocking','fixture-hash');
    raise exception 'student bypassed API';
  exception when insufficient_privilege then null; end;
  begin perform id from beta_incidents; raise exception 'student read private incidents';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'Incident storage, deduplication, recurrence and access checks passed' as result;
