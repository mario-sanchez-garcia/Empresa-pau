-- Kairo/Pausia calendar integrations.
-- OAuth tokens are stored encrypted by the server before reaching these rows.

create table if not exists public.calendar_connections (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users(id) on delete cascade,
  provider                   text not null check (provider in ('google', 'icloud')),
  provider_account_email     text,
  external_calendar_id       text,
  external_calendar_summary  text,
  access_token               text,
  refresh_token              text,
  token_expires_at           timestamptz,
  sync_token                 text,
  sync_enabled               boolean not null default true,
  google_channel_id          text,
  google_resource_id         text,
  google_channel_expiration  timestamptz,
  last_synced_at             timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists calendar_connections_user_provider_idx
  on public.calendar_connections (user_id, provider);

create index if not exists calendar_connections_watch_idx
  on public.calendar_connections (provider, google_channel_id, google_resource_id)
  where google_channel_id is not null;

alter table public.calendar_connections enable row level security;

create policy "calendar_connections: select own"
  on public.calendar_connections for select
  using (auth.uid() = user_id);

create policy "calendar_connections: insert own"
  on public.calendar_connections for insert
  with check (auth.uid() = user_id);

create policy "calendar_connections: update own"
  on public.calendar_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calendar_connections: delete own"
  on public.calendar_connections for delete
  using (auth.uid() = user_id);

create table if not exists public.calendar_event_links (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  entity_type           text not null check (entity_type in ('mission', 'exam', 'simulation', 'study_session')),
  entity_id             text not null,
  provider              text not null check (provider in ('google', 'icloud')),
  external_calendar_id  text not null,
  external_event_id     text not null,
  external_etag         text,
  last_local_update     timestamptz,
  last_external_update  timestamptz,
  last_sync_source      text not null default 'unknown'
                        check (last_sync_source in ('kairo', 'external', 'sync', 'unknown')),
  last_synced_at        timestamptz,
  sync_status           text not null default 'pending'
                        check (sync_status in ('synced', 'pending', 'error', 'deleted_external', 'conflict', 'disconnected')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, entity_type, entity_id, provider),
  unique (provider, external_calendar_id, external_event_id)
);

create index if not exists calendar_event_links_user_entity_idx
  on public.calendar_event_links (user_id, entity_type, entity_id);

alter table public.calendar_event_links enable row level security;

create policy "calendar_event_links: select own"
  on public.calendar_event_links for select
  using (auth.uid() = user_id);

create policy "calendar_event_links: insert own"
  on public.calendar_event_links for insert
  with check (auth.uid() = user_id);

create policy "calendar_event_links: update own"
  on public.calendar_event_links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calendar_event_links: delete own"
  on public.calendar_event_links for delete
  using (auth.uid() = user_id);

create or replace function public.touch_calendar_integrations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_calendar_connections_updated_at on public.calendar_connections;
create trigger touch_calendar_connections_updated_at
before update on public.calendar_connections
for each row execute function public.touch_calendar_integrations_updated_at();

drop trigger if exists touch_calendar_event_links_updated_at on public.calendar_event_links;
create trigger touch_calendar_event_links_updated_at
before update on public.calendar_event_links
for each row execute function public.touch_calendar_integrations_updated_at();
