-- Camino PAU personalizado: currículo, plantillas y feedback por instituto.
-- Migración incremental y no destructiva.

create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  block_slug text not null,
  block_title text not null,
  topic_slug text not null,
  title text not null,
  order_index integer not null default 0,
  content_status text not null default 'itinerary_only' check (content_status in ('latex_notes', 'itinerary_only')),
  explanation text,
  guided_example text,
  practice_prompt text,
  raw_latex text,
  evau_practice_query jsonb not null default '{}'::jsonb,
  compatible_subjects text[] not null default '{}',
  source text not null default 'contenidos_2_bach',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject, block_slug, topic_slug)
);

create table if not exists public.mission_templates (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  block_slug text not null,
  topic_slug text not null,
  mission_type text not null check (mission_type in ('concept_explanation', 'guided_example', 'guided_practice', 'evau_practice', 'error_review', 'exam_focus', 'mock_exam')),
  title text not null,
  estimated_minutes integer not null default 20,
  xp integer not null default 15,
  target jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (subject, block_slug, topic_slug, mission_type)
);

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

alter table public.curriculum_topics enable row level security;
alter table public.mission_templates enable row level security;
alter table public.school_topic_feedback enable row level security;
alter table public.school_topic_status enable row level security;

create policy "curriculum_topics: read for authenticated"
  on public.curriculum_topics for select to authenticated using (true);

create policy "mission_templates: read for authenticated"
  on public.mission_templates for select to authenticated using (true);

create policy "school_topic_feedback: user insert"
  on public.school_topic_feedback for insert to authenticated with check (user_id = auth.uid());

create policy "school_topic_feedback: user read own"
  on public.school_topic_feedback for select to authenticated using (user_id = auth.uid());

create policy "school_topic_status: read aggregate"
  on public.school_topic_status for select to authenticated using (true);
