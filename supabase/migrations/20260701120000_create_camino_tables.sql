-- Camino PAU – tablas de cola y calendario por usuario
-- Creadas originalmente en el dashboard de Supabase; DDL normalizado aquí
-- para reproducibilidad en staging / migraciones futuras.

-- ----------------------------------------------------------------
-- user_learning_queue
-- Cola ordenada de flashcards pendientes por usuario.
-- queue_status lifecycle: pending → scheduled → completed | postponed | inactive
-- ----------------------------------------------------------------
create table public.user_learning_queue (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  subject          text        not null,
  block_key        text,
  block_slug       text,
  v2_sort_order    integer     not null,
  title            text        not null,
  subject_position integer,
  queue_status     text        not null default 'pending'
                   check (queue_status in ('pending', 'scheduled', 'completed', 'postponed', 'inactive')),
  postponed        boolean     not null default false,
  postponed_reason text,
  scheduled_at     timestamptz,
  calendar_id      uuid,
  metadata         jsonb       not null default '{}',
  created_at       timestamptz not null default now()
);

create index user_learning_queue_user_subject_idx
  on public.user_learning_queue (user_id, subject, subject_position);

create index user_learning_queue_user_status_idx
  on public.user_learning_queue (user_id, queue_status);

alter table public.user_learning_queue enable row level security;

create policy "user_learning_queue: select own"
  on public.user_learning_queue for select
  using (auth.uid() = user_id);

create policy "user_learning_queue: insert own"
  on public.user_learning_queue for insert
  with check (auth.uid() = user_id);

create policy "user_learning_queue: update own"
  on public.user_learning_queue for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- camino_calendar
-- Una fila por misión programada (usuario × fecha × tema).
-- status lifecycle: pending → completed | missed | postponed
-- ----------------------------------------------------------------
create table public.camino_calendar (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  scheduled_date date        not null,
  subject        text        not null,
  v2_sort_order  integer,
  title          text,
  block_key      text,
  block_slug     text,
  mission_type   text        not null default 'concept'
                 check (mission_type in ('concept', 'review', 'comment_text', 'pau_practice')),
  is_main        boolean     not null default true,
  is_bonus       boolean     not null default false,
  status         text        not null default 'pending'
                 check (status in ('pending', 'completed', 'missed', 'postponed')),
  completed_at   timestamptz,
  xp_awarded     integer,
  locked         boolean     not null default false,
  source         text        not null default 'algorithm'
                 check (source in ('algorithm', 'manual')),
  generated_by   text        not null default 'algorithm_v1',
  queue_id       uuid        references public.user_learning_queue(id) on delete set null,
  metadata       jsonb       not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index camino_calendar_user_date_idx
  on public.camino_calendar (user_id, scheduled_date);

create index camino_calendar_user_status_idx
  on public.camino_calendar (user_id, status);

create index camino_calendar_user_subject_status_idx
  on public.camino_calendar (user_id, subject, status);

alter table public.camino_calendar enable row level security;

create policy "camino_calendar: select own"
  on public.camino_calendar for select
  using (auth.uid() = user_id);

create policy "camino_calendar: insert own"
  on public.camino_calendar for insert
  with check (auth.uid() = user_id);

create policy "camino_calendar: update own"
  on public.camino_calendar for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
