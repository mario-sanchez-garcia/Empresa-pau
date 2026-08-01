-- Camino PAU personalizado: feedback por instituto.
-- Migración incremental y no destructiva.
--
-- Esta migración originalmente también creaba curriculum_topics y
-- mission_templates, pero nunca se llegó a usar ese camino (ninguna query
-- en el código las toca) ni se aplicó en producción — se retiraron de aquí.

create table if not exists public.school_topic_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  school_name text,
  community text,
  subject text not null,
  block_slug text not null,
  topic_slug text not null,
  reason text not null check (reason in ('not_seen_in_class')),
  created_at timestamptz not null default now()
);

create table if not exists public.school_topic_status (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  community text,
  subject text not null,
  block_slug text not null,
  topic_slug text not null,
  status text not null default 'unknown' check (status in ('unknown', 'not_seen', 'delayed_for_school', 'in_progress', 'seen')),
  not_seen_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (school_name, subject, block_slug, topic_slug)
);

alter table public.school_topic_feedback enable row level security;
alter table public.school_topic_status enable row level security;

create policy "school_topic_feedback: user insert"
  on public.school_topic_feedback for insert to authenticated with check (user_id = auth.uid());

create policy "school_topic_feedback: user read own"
  on public.school_topic_feedback for select to authenticated using (user_id = auth.uid());

create policy "school_topic_status: read aggregate"
  on public.school_topic_status for select to authenticated using (true);
