-- Student-owned calendar events (deberes, extraescolares, estudio personal,
-- lo que sea) shown alongside Kairo missions and exams in the new monthly
-- calendar view. Deliberately a separate table from camino_calendar: that
-- table's schema (subject, v2_sort_order, queue_id, mission_type check...)
-- is shaped entirely around Kairo-generated PAU missions, and the mission
-- scheduling engine (ensureCaminoCalendar / injectPartialExamMissions)
-- assumes every row there is one of those. Free-form personal events don't
-- fit that shape and must never be visible to (or touched by) that engine.
create table public.camino_custom_events (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  event_date   date        not null,
  title        text        not null,
  description  text,
  category     text        not null default 'otro'
               check (category in ('deberes', 'extraescolar', 'estudio_personal', 'otro')),
  start_time   time,
  end_time     time,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index camino_custom_events_user_date_idx
  on public.camino_custom_events (user_id, event_date);

alter table public.camino_custom_events enable row level security;

create policy "camino_custom_events: select own"
  on public.camino_custom_events for select
  using (auth.uid() = user_id);

create policy "camino_custom_events: insert own"
  on public.camino_custom_events for insert
  with check (auth.uid() = user_id);

create policy "camino_custom_events: update own"
  on public.camino_custom_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "camino_custom_events: delete own"
  on public.camino_custom_events for delete
  using (auth.uid() = user_id);
