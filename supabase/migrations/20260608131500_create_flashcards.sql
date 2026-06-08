create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('mates', 'fisica', 'historia')),
  topic text not null,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

create index if not exists flashcards_user_subject_idx
  on public.flashcards (user_id, subject, topic);

alter table public.flashcards enable row level security;

create policy "Users can read their flashcards"
  on public.flashcards
  for select
  using (auth.uid() = user_id);

create policy "Users can create their flashcards"
  on public.flashcards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their flashcards"
  on public.flashcards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their flashcards"
  on public.flashcards
  for delete
  using (auth.uid() = user_id);
