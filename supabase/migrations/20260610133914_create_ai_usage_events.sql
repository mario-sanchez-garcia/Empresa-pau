create extension if not exists pgcrypto;

create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null,
  action text not null,
  model text,
  provider text not null default 'anthropic',
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  estimated_cost_eur numeric(10, 6),
  status text not null default 'success',
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_created_idx
  on public.ai_usage_events (user_id, created_at desc);

create index if not exists ai_usage_events_route_created_idx
  on public.ai_usage_events (route, created_at desc);

create index if not exists ai_usage_events_action_created_idx
  on public.ai_usage_events (action, created_at desc);

alter table public.ai_usage_events enable row level security;

create policy "Users can read their own ai usage events"
  on public.ai_usage_events
  for select
  using (auth.uid() = user_id);
