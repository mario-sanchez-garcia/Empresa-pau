create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Nuevo espacio',
  data jsonb not null default '{"elements":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists canvases_user_updated_idx
  on public.canvases (user_id, updated_at desc);

alter table public.canvases enable row level security;

create policy "Users can read their canvases"
  on public.canvases
  for select
  using (auth.uid() = user_id);

create policy "Users can create their canvases"
  on public.canvases
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their canvases"
  on public.canvases
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their canvases"
  on public.canvases
  for delete
  using (auth.uid() = user_id);

create table if not exists public.canvas_images (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.canvas_images enable row level security;

create policy "Users can read their canvas images"
  on public.canvas_images
  for select
  using (auth.uid() = user_id);

create policy "Users can create their canvas images"
  on public.canvas_images
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their canvas images"
  on public.canvas_images
  for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('zona-images', 'zona-images', false)
on conflict (id) do nothing;

create policy "Users can upload their zona images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'zona-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their zona images"
  on storage.objects
  for select
  using (
    bucket_id = 'zona-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their zona images"
  on storage.objects
  for delete
  using (
    bucket_id = 'zona-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
