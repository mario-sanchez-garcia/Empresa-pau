-- Auth/onboarding audit hardening. All functions are service-role only and
-- serialize reservations inside Postgres, so parallel serverless instances
-- cannot bypass cooldowns with a count-then-insert race.

create extension if not exists pgcrypto;

create table if not exists public.auth_email_attempts (
  id bigserial primary key,
  email text not null,
  ip text not null,
  action text not null,
  created_at timestamptz not null default now()
);

alter table public.auth_email_attempts drop constraint if exists auth_email_attempts_action_check;
alter table public.auth_email_attempts add constraint auth_email_attempts_action_check
  check (action in ('signup_confirmation', 'password_recovery'));

create index if not exists auth_email_attempts_email_action_created_at_idx
  on public.auth_email_attempts (email, action, created_at desc);
create index if not exists auth_email_attempts_ip_action_created_at_idx
  on public.auth_email_attempts (ip, action, created_at desc);
alter table public.auth_email_attempts enable row level security;

create or replace function public.reserve_auth_email_attempt(
  p_email text,
  p_ip text,
  p_action text,
  p_email_window_seconds integer,
  p_email_limit integer,
  p_ip_window_seconds integer,
  p_ip_limit integer
) returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(trim(p_email));
  v_ip text := coalesce(nullif(trim(p_ip), ''), 'unknown');
  v_email_oldest timestamptz;
  v_ip_oldest timestamptz;
begin
  if p_action not in ('signup_confirmation', 'password_recovery')
     or v_email = ''
     or p_email_window_seconds <= 0 or p_email_limit <= 0
     or p_ip_window_seconds <= 0 or p_ip_limit <= 0 then
    raise exception 'invalid rate limit arguments';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('auth-email:' || p_action || ':' || v_email, 0));
  perform pg_advisory_xact_lock(hashtextextended('auth-ip:' || p_action || ':' || v_ip, 0));

  select min(created_at) into v_email_oldest
  from public.auth_email_attempts
  where email = v_email and action = p_action
    and created_at >= now() - make_interval(secs => p_email_window_seconds);

  if (select count(*) from public.auth_email_attempts
      where email = v_email and action = p_action
        and created_at >= now() - make_interval(secs => p_email_window_seconds)) >= p_email_limit then
    return query select false, greatest(1, ceil(extract(epoch from (v_email_oldest + make_interval(secs => p_email_window_seconds) - now())))::integer);
    return;
  end if;

  select min(created_at) into v_ip_oldest
  from public.auth_email_attempts
  where ip = v_ip and action = p_action
    and created_at >= now() - make_interval(secs => p_ip_window_seconds);

  if (select count(*) from public.auth_email_attempts
      where ip = v_ip and action = p_action
        and created_at >= now() - make_interval(secs => p_ip_window_seconds)) >= p_ip_limit then
    return query select false, greatest(1, ceil(extract(epoch from (v_ip_oldest + make_interval(secs => p_ip_window_seconds) - now())))::integer);
    return;
  end if;

  insert into public.auth_email_attempts(email, ip, action) values (v_email, v_ip, p_action);
  return query select true, 0;
end;
$$;

revoke all on function public.reserve_auth_email_attempt(text,text,text,integer,integer,integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_auth_email_attempt(text,text,text,integer,integer,integer,integer) to service_role;

create table if not exists public.api_rate_limit_attempts (
  id bigserial primary key,
  key_hash text not null,
  action text not null check (action in ('onboarding_draft')),
  created_at timestamptz not null default now()
);
create index if not exists api_rate_limit_attempts_lookup_idx
  on public.api_rate_limit_attempts (key_hash, action, created_at desc);
alter table public.api_rate_limit_attempts enable row level security;

create or replace function public.reserve_api_rate_limit(
  p_key text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
) returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text := encode(extensions.digest(coalesce(p_key, 'unknown'), 'sha256'), 'hex');
  v_oldest timestamptz;
begin
  if p_action <> 'onboarding_draft' or p_limit <= 0 or p_window_seconds <= 0 then
    raise exception 'invalid rate limit arguments';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('api-rate:' || p_action || ':' || v_hash, 0));
  select min(created_at) into v_oldest
  from public.api_rate_limit_attempts
  where key_hash = v_hash and action = p_action
    and created_at >= now() - make_interval(secs => p_window_seconds);
  if (select count(*) from public.api_rate_limit_attempts
      where key_hash = v_hash and action = p_action
        and created_at >= now() - make_interval(secs => p_window_seconds)) >= p_limit then
    return query select false, greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer);
    return;
  end if;
  insert into public.api_rate_limit_attempts(key_hash, action) values (v_hash, p_action);
  return query select true, 0;
end;
$$;

revoke all on function public.reserve_api_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_api_rate_limit(text,text,integer,integer) to service_role;

create or replace function public.reserve_signup_attempt(
  p_email text,
  p_ip text,
  p_email_limit integer,
  p_ip_limit integer,
  p_window_seconds integer
) returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(trim(p_email));
  v_ip text := coalesce(nullif(trim(p_ip), ''), 'unknown');
  v_oldest timestamptz;
begin
  if v_email = '' or p_email_limit <= 0 or p_ip_limit <= 0 or p_window_seconds <= 0 then
    raise exception 'invalid rate limit arguments';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('signup-email:' || v_email, 0));
  perform pg_advisory_xact_lock(hashtextextended('signup-ip:' || v_ip, 0));

  select min(created_at) into v_oldest from public.signup_attempts
  where (email=v_email or ip=v_ip) and created_at >= now() - make_interval(secs => p_window_seconds);
  if (select count(*) from public.signup_attempts where email=v_email and created_at >= now() - make_interval(secs => p_window_seconds)) >= p_email_limit
     or (select count(*) from public.signup_attempts where ip=v_ip and created_at >= now() - make_interval(secs => p_window_seconds)) >= p_ip_limit then
    return query select false, greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::integer);
    return;
  end if;
  insert into public.signup_attempts(ip,email) values (v_ip,v_email);
  return query select true, 0;
end;
$$;

revoke all on function public.reserve_signup_attempt(text,text,integer,integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_signup_attempt(text,text,integer,integer,integer) to service_role;

-- Recoverable, token-owned processing lease for onboarding finalization.
alter table public.onboarding_drafts add column if not exists processing_token uuid;
alter table public.onboarding_drafts add column if not exists processing_started_at timestamptz;

create unique index if not exists onboarding_drafts_one_active_per_user_idx
  on public.onboarding_drafts (claimed_by)
  where claimed_by is not null and status in ('claimed', 'processing');

create unique index if not exists billing_events_one_onboarding_completion_per_draft_idx
  on public.billing_events (user_id, ((payload->>'draft_id')))
  where event_type = 'onboarding_completed' and payload->>'draft_id' is not null;

create or replace function public.acquire_onboarding_processing(
  p_draft_id uuid,
  p_user_id uuid,
  p_token uuid,
  p_stale_before timestamptz
) returns table(result_code text, draft jsonb)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_draft public.onboarding_drafts%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended('onboarding-user:' || p_user_id::text, 0));
  select * into v_draft from public.onboarding_drafts where id = p_draft_id for update;
  if not found then return query select 'invalid_draft', null::jsonb; return; end if;
  if v_draft.claimed_by is distinct from p_user_id then return query select 'draft_claim_conflict', to_jsonb(v_draft); return; end if;
  if v_draft.status = 'expired' or v_draft.expires_at < now() then return query select 'draft_expired', to_jsonb(v_draft); return; end if;
  if v_draft.status = 'completed' then return query select 'completed', to_jsonb(v_draft); return; end if;

  if exists (
    select 1 from public.billing_events
    where user_id = p_user_id and event_type = 'onboarding_completed'
      and payload->>'onboarding_completed' = 'true'
      and payload->>'draft_id' = p_draft_id::text
  ) then
    update public.onboarding_drafts set status='completed', processing_stage='completed', completed_at=coalesce(completed_at, now()), last_error_code=null, processing_token=null, processing_started_at=null, updated_at=now() where id=p_draft_id returning * into v_draft;
    return query select 'completed', to_jsonb(v_draft); return;
  end if;

  if exists (
    select 1 from public.billing_events
    where user_id = p_user_id and event_type = 'onboarding_completed'
      and payload->>'onboarding_completed' = 'true'
  ) then
    update public.onboarding_drafts set status='failed', processing_stage='failed', last_error_code='already_onboarded', processing_token=null, processing_started_at=null, updated_at=now() where id=p_draft_id returning * into v_draft;
    return query select 'already_onboarded', to_jsonb(v_draft); return;
  end if;

  if v_draft.status = 'processing' and coalesce(v_draft.processing_started_at, v_draft.updated_at) >= p_stale_before then
    return query select 'processing', to_jsonb(v_draft); return;
  end if;

  if v_draft.status not in ('claimed', 'failed', 'processing') then
    return query select 'invalid_draft', to_jsonb(v_draft); return;
  end if;

  update public.onboarding_drafts set
    status='processing', processing_stage='validating', last_error_code=null,
    processing_token=p_token, processing_started_at=now(), updated_at=now()
  where id=p_draft_id returning * into v_draft;
  return query select 'acquired', to_jsonb(v_draft);
end;
$$;

revoke all on function public.acquire_onboarding_processing(uuid,uuid,uuid,timestamptz) from public, anon, authenticated;
grant execute on function public.acquire_onboarding_processing(uuid,uuid,uuid,timestamptz) to service_role;

create or replace function public.complete_onboarding_processing(
  p_draft_id uuid,
  p_user_id uuid,
  p_token uuid,
  p_payload jsonb
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_completed_at timestamptz := now();
begin
  perform 1 from public.onboarding_drafts
  where id=p_draft_id and claimed_by=p_user_id and status='processing' and processing_token=p_token
  for update;
  if not found then return false; end if;

  insert into public.billing_events(user_id, event_type, payload)
  values (p_user_id, 'onboarding_completed', p_payload)
  on conflict do nothing;

  update public.onboarding_drafts set
    status='completed', processing_stage='completed', completed_at=v_completed_at,
    last_error_code=null, processing_token=null, processing_started_at=null,
    updated_at=v_completed_at
  where id=p_draft_id and claimed_by=p_user_id and status='processing' and processing_token=p_token;
  return found;
end;
$$;

revoke all on function public.complete_onboarding_processing(uuid,uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.complete_onboarding_processing(uuid,uuid,uuid,jsonb) to service_role;
