alter table public.camino_calendar
  add column if not exists started_at timestamptz,
  add column if not exists last_postponed_at timestamptz,
  add column if not exists postpone_count integer not null default 0,
  add column if not exists manual_reschedule_count integer not null default 0,
  add column if not exists conflict_reschedule_count integer not null default 0,
  add column if not exists actual_duration_minutes integer,
  add column if not exists completion_delay_minutes integer;

alter table public.camino_calendar
  add constraint camino_calendar_postpone_count_nonnegative
  check (postpone_count >= 0) not valid;

alter table public.camino_calendar
  add constraint camino_calendar_manual_reschedule_count_nonnegative
  check (manual_reschedule_count >= 0) not valid;

alter table public.camino_calendar
  add constraint camino_calendar_conflict_reschedule_count_nonnegative
  check (conflict_reschedule_count >= 0) not valid;

create table if not exists public.camino_mission_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.camino_calendar(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'started',
      'completed',
      'postponed_manual',
      'rescheduled_manual',
      'rescheduled_conflict'
    )
  ),
  occurred_at timestamptz not null default now(),
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, mission_id, event_type, idempotency_key)
);

create index if not exists camino_mission_events_user_mission_idx
  on public.camino_mission_events (user_id, mission_id, occurred_at desc);

create index if not exists camino_mission_events_user_type_idx
  on public.camino_mission_events (user_id, event_type, occurred_at desc);

create index if not exists camino_calendar_user_started_idx
  on public.camino_calendar (user_id, started_at)
  where started_at is not null;

alter table public.camino_mission_events enable row level security;

create policy "camino_mission_events: select own"
  on public.camino_mission_events for select
  using (auth.uid() = user_id);

create policy "camino_mission_events: insert own"
  on public.camino_mission_events for insert
  with check (auth.uid() = user_id);
