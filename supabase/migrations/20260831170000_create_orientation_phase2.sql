-- Orientación Fase 2: catálogo verificable y objetivo dentro del perfil real.
-- No inserta datos: solo crea estructura para fuentes oficiales posteriores.
create table if not exists public.orientation_universities (
  id uuid primary key default gen_random_uuid(), name text not null, acronym text,
  community text not null, official_url text not null, active boolean not null default true,
  created_at timestamptz not null default now(), unique (name, community)
);
create table if not exists public.orientation_degrees (
  id uuid primary key default gen_random_uuid(), university_id uuid not null references public.orientation_universities(id) on delete cascade,
  name text not null, campus text, official_url text not null, active boolean not null default true,
  created_at timestamptz not null default now(), unique (university_id, name, campus)
);
create table if not exists public.orientation_admission_cutoffs (
  id uuid primary key default gen_random_uuid(), degree_id uuid not null references public.orientation_degrees(id) on delete cascade,
  academic_year text not null, admission_round text not null, cutoff_score numeric(4,2) not null check (cutoff_score between 5 and 14),
  source_url text not null, source_label text not null, verified_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'verified', 'archived')),
  created_at timestamptz not null default now(), unique (degree_id, academic_year, admission_round)
);
create table if not exists public.orientation_subject_weightings (
  id uuid primary key default gen_random_uuid(), degree_id uuid not null references public.orientation_degrees(id) on delete cascade,
  academic_year text not null, subject text not null, weighting numeric(2,1) not null check (weighting in (0.1, 0.2)),
  source_url text not null, source_label text not null, verified_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'verified', 'archived')),
  created_at timestamptz not null default now(), unique (degree_id, academic_year, subject)
);
create table if not exists public.orientation_official_criteria (
  id uuid primary key default gen_random_uuid(), community text not null, academic_year text not null,
  subject text not null, criterion_type text not null, official_text text not null, kairo_explanation text,
  source_url text not null, source_document text, published_at timestamptz, verified_at timestamptz,
  version text not null, status text not null default 'draft' check (status in ('draft', 'verified', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists orientation_degrees_university_idx on public.orientation_degrees (university_id);
create index if not exists orientation_cutoffs_degree_year_idx on public.orientation_admission_cutoffs (degree_id, academic_year desc);
create index if not exists orientation_weightings_degree_year_idx on public.orientation_subject_weightings (degree_id, academic_year desc);
create index if not exists orientation_criteria_lookup_idx on public.orientation_official_criteria (community, academic_year, subject);
alter table public.orientation_universities enable row level security;
alter table public.orientation_degrees enable row level security;
alter table public.orientation_admission_cutoffs enable row level security;
alter table public.orientation_subject_weightings enable row level security;
alter table public.orientation_official_criteria enable row level security;
-- Sin políticas: solo las rutas server-side con service role leen/escriben.
alter table public.perfiles
  add column if not exists target_degree text,
  add column if not exists target_university text,
  add column if not exists target_admission_score numeric(4,2),
  add column if not exists target_orientation_source_type text,
  add column if not exists target_orientation_updated_at timestamptz;
alter table public.perfiles drop constraint if exists perfiles_target_admission_score_check;
alter table public.perfiles add constraint perfiles_target_admission_score_check check (target_admission_score is null or target_admission_score between 5 and 14);
alter table public.perfiles drop constraint if exists perfiles_target_orientation_source_type_check;
alter table public.perfiles add constraint perfiles_target_orientation_source_type_check check (target_orientation_source_type is null or target_orientation_source_type in ('fixture', 'official'));
comment on column public.perfiles.target_admission_score is 'Nota de referencia guardada; no implica garantía de admisión.';
