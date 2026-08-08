-- Fase 2 del onboarding (signup al final): el alumno recorre las 11
-- preguntas y la preview SIN sesión, y crea su cuenta solo al final. Antes de
-- tener user_id necesitamos un sitio server-side donde guardar sus
-- respuestas — de eso trata onboarding_drafts.
--
-- No sustituye a billing_events.onboarding_completed (evento de negocio,
-- ver /api/onboarding/me) ni a perfiles (fuente de verdad del perfil ya
-- creado). onboarding_drafts es puramente el puente pre-auth → post-auth:
-- nace anónimo, se reclama (claim) al autenticarse, y el finalizer lo usa
-- como única fuente de verdad para construir el perfil y el Camino real.
--
-- El id es opaco y aleatorio (gen_random_uuid()) — no se deriva de nada, no
-- viaja con email ni con el payload académico en la URL salvo el id mismo.
create table if not exists public.onboarding_drafts (
  id                 uuid primary key default gen_random_uuid(),
  trace_id           uuid not null,
  flow_version       text not null,
  payload            jsonb not null default '{}'::jsonb,
  status             text not null default 'pending_auth',
  processing_stage   text,
  expires_at         timestamptz not null,
  claimed_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  completed_at       timestamptz,
  last_error_code    text,

  constraint onboarding_drafts_status_check
    check (status in ('pending_auth', 'claimed', 'processing', 'completed', 'failed', 'expired')),

  constraint onboarding_drafts_processing_stage_check
    check (processing_stage is null or processing_stage in (
      'validating', 'saving_profile', 'building_queue',
      'generating_calendar', 'verifying_calendar', 'completed', 'failed'
    ))
);

create index if not exists onboarding_drafts_trace_id_idx on public.onboarding_drafts (trace_id);
create index if not exists onboarding_drafts_claimed_by_idx on public.onboarding_drafts (claimed_by);
create index if not exists onboarding_drafts_status_idx on public.onboarding_drafts (status);
create index if not exists onboarding_drafts_expires_at_idx on public.onboarding_drafts (expires_at);

-- RLS activo sin políticas: mismo patrón que user_limit_overrides/
-- camino_ensure_log/signup_attempts — solo accesible con service role. El
-- draft puede contener respuestas de onboarding de un usuario aún anónimo,
-- así que no debe haber ninguna vía de lectura/escritura directa desde el
-- cliente, ni siquiera para el propietario una vez reclamado.
alter table public.onboarding_drafts enable row level security;

-- Fase 1 (rediseño emocional) guardaba painType solo en el snapshot de
-- billing_events.onboarding_completed; Fase 2 lo persiste también en
-- perfiles para que el finalizer y el resto del producto puedan leerlo sin
-- ir a billing_events (que no tiene políticas RLS legibles desde el
-- cliente). Uno de los 4 valores cerrados de PainType — nunca texto libre.
alter table public.perfiles add column if not exists pain_type text;

alter table public.perfiles drop constraint if exists perfiles_pain_type_check;
alter table public.perfiles add constraint perfiles_pain_type_check
  check (pain_type is null or pain_type in ('daily_plan', 'correction_confidence', 'procrastination', 'improve_grade'));
