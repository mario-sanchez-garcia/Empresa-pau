begin;
create table public.beta_incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null check(source in ('automatic','student')),
  code text not null,
  route text not null,
  description text not null default '' check(length(description)<=1500),
  severity text not null check(severity in ('blocking','high','normal')),
  status text not null default 'open' check(status in ('open','investigating','resolved')),
  occurrences integer not null default 1,
  fingerprint text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.beta_incidents enable row level security;
create index beta_incidents_triage on public.beta_incidents(status,last_seen_at desc);
create index beta_incidents_user_recent on public.beta_incidents(user_id,created_at desc);

create function public.record_beta_incident(p_user_id uuid,p_source text,p_code text,p_route text,
  p_description text,p_severity text,p_fingerprint text) returns uuid
language plpgsql security definer set search_path=public as $$
declare result uuid;
begin
  insert into beta_incidents(user_id,source,code,route,description,severity,fingerprint)
  values(p_user_id,p_source,p_code,p_route,p_description,p_severity,p_fingerprint)
  on conflict(fingerprint) do update set occurrences=beta_incidents.occurrences+1,last_seen_at=now(),
    status='open',resolved_at=null returning id into result;
  return result;
end $$;
revoke all on function public.record_beta_incident(uuid,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_beta_incident(uuid,text,text,text,text,text,text) to service_role;
commit;
