-- Chat con Kairo (Tutor Inteligente) hoy no persiste nada: los mensajes viven
-- solo en useState del cliente (mensajes en page-client.tsx) y se pierden al
-- recargar. Además, cambiar de asignatura a mitad de chat no cambiaba de
-- hilo — cambiarAsignatura() nunca tocaba `mensajes`, así que Matemáticas y
-- Física quedaban mezclados en el mismo array.
--
-- Diseño: un hilo fijo por (usuario, asignatura) — igual que los pills de
-- CHAT_SUBJECTS en page-client.tsx (general + las 9 asignaturas), no una
-- lista de conversaciones estilo ChatGPT. Cambiar de pill pasa a cargar el
-- hilo de esa asignatura en vez de seguir escribiendo en el mismo array.
--
-- chat_messages es un ledger append-only (mismo patrón que camino_xp_events):
-- nunca se edita ni se resume una fila ya insertada, solo se lee el hilo
-- completo o su cola más reciente.

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in (
    'general',
    'mates',
    'matematicas_ccss',
    'fisica',
    'quimica',
    'biologia',
    'ingles',
    'lengua',
    'historia',
    'historia_filosofia'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, subject)
);

create index if not exists chat_threads_user_idx
  on public.chat_threads (user_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('usuario', 'kairo')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_created_idx
  on public.chat_messages (thread_id, created_at);

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can read their own chat threads"
  on public.chat_threads
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own chat threads"
  on public.chat_threads
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat threads"
  on public.chat_threads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat threads"
  on public.chat_threads
  for delete
  using (auth.uid() = user_id);

create policy "Users can read their own chat messages"
  on public.chat_messages
  for select
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );

create policy "Users can create their own chat messages"
  on public.chat_messages
  for insert
  with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );

create policy "Users can delete their own chat messages"
  on public.chat_messages
  for delete
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = chat_messages.thread_id and t.user_id = auth.uid()
    )
  );

comment on table public.chat_threads is
  'Un hilo fijo por (usuario, asignatura) del Chat con Kairo. Ver CHAT_SUBJECTS en app/page-client.tsx.';
comment on table public.chat_messages is
  'Ledger append-only de mensajes de chat_threads — mismo patrón que camino_xp_events.';
