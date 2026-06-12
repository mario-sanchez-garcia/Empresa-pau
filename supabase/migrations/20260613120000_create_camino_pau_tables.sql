-- Fase 2C: Camino PAU – persistencia por usuario

-- ----------------------------------------------------------------
-- camino_user_progress: agregados por usuario (XP, racha, niveles)
-- ----------------------------------------------------------------
create table public.camino_user_progress (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  xp_total             integer     not null default 0 check (xp_total >= 0),
  streak_days          integer     not null default 0 check (streak_days >= 0),
  longest_streak       integer     not null default 0 check (longest_streak >= 0),
  last_mission_date    date,
  missions_completed   integer     not null default 0 check (missions_completed >= 0),
  level_mates          smallint    not null default 1 check (level_mates between 1 and 20),
  level_historia       smallint    not null default 1 check (level_historia between 1 and 20),
  level_ingles         smallint    not null default 1 check (level_ingles between 1 and 20),
  progress_towards_pau smallint    not null default 0 check (progress_towards_pau between 0 and 100),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

create index camino_user_progress_user_idx
  on public.camino_user_progress (user_id);

alter table public.camino_user_progress enable row level security;

create policy "camino_user_progress: select own"
  on public.camino_user_progress for select
  using (auth.uid() = user_id);

create policy "camino_user_progress: insert own"
  on public.camino_user_progress for insert
  with check (auth.uid() = user_id);

create policy "camino_user_progress: update own"
  on public.camino_user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- camino_daily_missions: una fila por (usuario, fecha)
-- ----------------------------------------------------------------
create table public.camino_daily_missions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  mission_date   date        not null,
  route_id       text        not null check (route_id in ('completa','ajustada','acelerada','sprint','intensiva')),
  week_number    smallint,
  task_ids       text[]      not null default '{}',
  completed      boolean     not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, mission_date)
);

create index camino_daily_missions_user_date_idx
  on public.camino_daily_missions (user_id, mission_date desc);

alter table public.camino_daily_missions enable row level security;

create policy "camino_daily_missions: select own"
  on public.camino_daily_missions for select
  using (auth.uid() = user_id);

create policy "camino_daily_missions: insert own"
  on public.camino_daily_missions for insert
  with check (auth.uid() = user_id);

create policy "camino_daily_missions: update own"
  on public.camino_daily_missions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- camino_task_completions: ledger append-only de tareas completadas
-- unique(user_id, task_id, mission_date) garantiza idempotencia
-- ----------------------------------------------------------------
create table public.camino_task_completions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  task_id        text        not null,
  task_type      text        not null,
  subject_key    text,
  mission_date   date        not null,
  xp_earned      integer     not null default 0 check (xp_earned >= 0),
  completed_at   timestamptz not null default now(),
  unique (user_id, task_id, mission_date)
);

create index camino_task_completions_user_date_idx
  on public.camino_task_completions (user_id, mission_date desc);

create index camino_task_completions_user_at_idx
  on public.camino_task_completions (user_id, completed_at desc);

alter table public.camino_task_completions enable row level security;

create policy "camino_task_completions: select own"
  on public.camino_task_completions for select
  using (auth.uid() = user_id);

create policy "camino_task_completions: insert own"
  on public.camino_task_completions for insert
  with check (auth.uid() = user_id);

-- append-only: sin UPDATE ni DELETE policy

-- ----------------------------------------------------------------
-- camino_route_settings: ruta activa del alumno
-- ----------------------------------------------------------------
create table public.camino_route_settings (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  route_id         text        not null default 'completa'
                   check (route_id in ('completa','ajustada','acelerada','sprint','intensiva')),
  entry_date       date        not null default current_date,
  pau_target_date  date,
  changed_at       timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  unique (user_id)
);

alter table public.camino_route_settings enable row level security;

create policy "camino_route_settings: select own"
  on public.camino_route_settings for select
  using (auth.uid() = user_id);

create policy "camino_route_settings: insert own"
  on public.camino_route_settings for insert
  with check (auth.uid() = user_id);

create policy "camino_route_settings: update own"
  on public.camino_route_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- camino_xp_events: ledger inmutable de XP ganado
-- unique(user_id, source_type, source_id, mission_date) previene duplicados
-- ----------------------------------------------------------------
create table public.camino_xp_events (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  source_type    text        not null
                 check (source_type in ('task_completion','mission_completion','streak_bonus')),
  source_id      text        not null,
  xp_amount      integer     not null check (xp_amount > 0),
  mission_date   date        not null,
  created_at     timestamptz not null default now(),
  unique (user_id, source_type, source_id, mission_date)
);

create index camino_xp_events_user_at_idx
  on public.camino_xp_events (user_id, created_at desc);

alter table public.camino_xp_events enable row level security;

create policy "camino_xp_events: select own"
  on public.camino_xp_events for select
  using (auth.uid() = user_id);

create policy "camino_xp_events: insert own"
  on public.camino_xp_events for insert
  with check (auth.uid() = user_id);

-- append-only: sin UPDATE ni DELETE policy
