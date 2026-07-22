-- Ritmo de Instituto Fase 1: instituto canonico y senales agregables.
-- No activa cambios colectivos en el scheduler; solo prepara datos seguros.

create table if not exists public.institutes (
  id uuid primary key default gen_random_uuid(),
  community text not null,
  name text not null,
  normalized_name text not null,
  source text not null default 'manual' check (source in ('manual', 'official', 'admin')),
  verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (community, normalized_name)
);

create index if not exists institutes_community_normalized_name_idx
  on public.institutes (community, normalized_name);

create table if not exists public.user_institute_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institute_id uuid not null references public.institutes(id) on delete cascade,
  community text not null,
  source text not null default 'onboarding' check (source in ('onboarding', 'manual', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists user_institute_memberships_institute_id_idx
  on public.user_institute_memberships (institute_id);

create index if not exists user_institute_memberships_user_id_idx
  on public.user_institute_memberships (user_id);

create table if not exists public.pace_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institute_id uuid not null references public.institutes(id) on delete cascade,
  subject text not null,
  block_slug text,
  topic_slug text not null,
  v2_sort_order integer,
  signal_type text not null default 'not_taught_yet' check (signal_type in ('not_taught_yet', 'currently_learning')),
  source text not null default 'topic_page' check (source in ('topic_page', 'daily_mission', 'flashcard', 'onboarding', 'admin')),
  signal_day date not null default current_date,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, institute_id, subject, block_slug, topic_slug, signal_type, signal_day)
);

create index if not exists pace_signals_institute_topic_type_created_idx
  on public.pace_signals (institute_id, subject, block_slug, topic_slug, signal_type, created_at desc);

create index if not exists pace_signals_user_created_idx
  on public.pace_signals (user_id, created_at desc);

create index if not exists pace_signals_institute_type_created_idx
  on public.pace_signals (institute_id, signal_type, created_at desc);

create or replace view public.view_institute_lag as
select
  institute_id,
  subject,
  block_slug,
  topic_slug,
  v2_sort_order,
  count(distinct user_id) as unique_students,
  max(created_at) as last_signal_at
from public.pace_signals
where signal_type = 'not_taught_yet'
  and created_at >= now() - interval '30 days'
group by institute_id, subject, block_slug, topic_slug, v2_sort_order
having count(distinct user_id) >= 3;

alter table public.institutes enable row level security;
alter table public.user_institute_memberships enable row level security;
alter table public.pace_signals enable row level security;

create policy "institutes: authenticated read"
  on public.institutes for select
  to authenticated
  using (true);

create policy "user_institute_memberships: read own"
  on public.user_institute_memberships for select
  to authenticated
  using (user_id = auth.uid());

create policy "pace_signals: read own"
  on public.pace_signals for select
  to authenticated
  using (user_id = auth.uid());

create policy "pace_signals: insert own membership"
  on public.pace_signals for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.user_institute_memberships m
      where m.user_id = auth.uid()
        and m.institute_id = pace_signals.institute_id
    )
  );

revoke all on public.view_institute_lag from anon, authenticated;
