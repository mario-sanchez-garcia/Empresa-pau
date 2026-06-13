-- Billing: parent checkout links, user entitlements, billing events
-- Append-only for billing_events. All writes via server/webhook only.

-- ----------------------------------------------------------------
-- parent_checkout_links
-- ----------------------------------------------------------------
create table public.parent_checkout_links (
  id                          uuid        primary key default gen_random_uuid(),
  student_user_id             uuid        not null references auth.users(id) on delete cascade,
  token_hash                  text        not null unique,
  plan_id                     text        not null,
  price_cents                 integer     not null check (price_cents > 0),
  currency                    text        not null default 'eur',
  student_display_name        text,
  parent_email                text,
  status                      text        not null default 'created'
                                          check (status in ('created','opened','checkout_started','paid','expired','cancelled','failed')),
  stripe_checkout_session_id  text        unique,
  stripe_customer_id          text,
  expires_at                  timestamptz not null,
  opened_at                   timestamptz,
  checkout_started_at         timestamptz,
  paid_at                     timestamptz,
  cancelled_at                timestamptz,
  metadata                    jsonb       not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index pcl_student_idx        on public.parent_checkout_links (student_user_id);
create index pcl_token_hash_idx     on public.parent_checkout_links (token_hash);
create index pcl_status_idx         on public.parent_checkout_links (status);
create index pcl_stripe_session_idx on public.parent_checkout_links (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.parent_checkout_links enable row level security;

-- Student can view their own links
create policy "pcl: select own"
  on public.parent_checkout_links for select
  using (auth.uid() = student_user_id);

-- Student can insert their own links (server validates token_hash, expiry, etc.)
create policy "pcl: insert own"
  on public.parent_checkout_links for insert
  with check (auth.uid() = student_user_id);

-- No client-side update/delete. All status transitions done server-side.

-- ----------------------------------------------------------------
-- user_entitlements
-- ----------------------------------------------------------------
create table public.user_entitlements (
  id                          uuid        primary key default gen_random_uuid(),
  user_id                     uuid        not null references auth.users(id) on delete cascade,
  plan_id                     text        not null,
  source                      text        not null
                                          check (source in ('stripe_parent_checkout','manual_admin','stripe_self_checkout')),
  status                      text        not null default 'active'
                                          check (status in ('active','expired','refunded','cancelled')),
  started_at                  timestamptz not null default now(),
  expires_at                  timestamptz,
  stripe_checkout_session_id  text        unique,
  stripe_customer_id          text,
  parent_checkout_link_id     uuid        references public.parent_checkout_links(id) on delete set null,
  metadata                    jsonb       not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index ue_user_idx         on public.user_entitlements (user_id);
create index ue_plan_status_idx  on public.user_entitlements (user_id, plan_id, status);
create index ue_stripe_session_idx on public.user_entitlements (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.user_entitlements enable row level security;

-- Student can read their own entitlements
create policy "ue: select own"
  on public.user_entitlements for select
  using (auth.uid() = user_id);

-- No insert/update/delete from client. Only server/webhook writes.

-- ----------------------------------------------------------------
-- billing_events (append-only audit log)
-- ----------------------------------------------------------------
create table public.billing_events (
  id                          uuid        primary key default gen_random_uuid(),
  user_id                     uuid        references auth.users(id) on delete set null,
  parent_checkout_link_id     uuid        references public.parent_checkout_links(id) on delete set null,
  stripe_checkout_session_id  text,
  event_type                  text        not null,
  payload                     jsonb       not null default '{}'::jsonb,
  created_at                  timestamptz not null default now()
);

create index be_user_idx     on public.billing_events (user_id)
  where user_id is not null;
create index be_pcl_idx      on public.billing_events (parent_checkout_link_id)
  where parent_checkout_link_id is not null;
create index be_type_idx     on public.billing_events (event_type);

alter table public.billing_events enable row level security;

-- No client access. Admin/server only via service role.
