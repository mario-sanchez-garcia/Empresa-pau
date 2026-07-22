-- Migration: create curriculum_flashcards table
-- Tabla editorial Kairo — contenido curricular para Camino PAU.
-- Regiones: madrid, cataluna, ambas.

create table if not exists public.curriculum_flashcards (
  id                  uuid        primary key default gen_random_uuid(),
  subject             text        not null,
  region              text        not null default 'ambas'
                      check (region in ('madrid', 'cataluna', 'ambas')),
  chapter_number      smallint    not null,
  chapter_title       text        not null,
  block_key           text        not null
                      check (block_key in ('Álgebra', 'Análisis', 'Geometría', 'Probabilidad')),
  order_label         text        not null,
  sort_order          integer     not null,
  title               text        not null,
  concept_latex       text        not null,
  alert_title         text,
  alert_latex         text,
  worked_case_title   text,
  worked_case_latex   text,
  created_at          timestamptz not null default now(),
  unique (subject, region, sort_order)
);

create index curriculum_flashcards_subject_region_block_sort_idx
  on public.curriculum_flashcards (subject, region, block_key, sort_order);

create index curriculum_flashcards_subject_chapter_sort_idx
  on public.curriculum_flashcards (subject, chapter_number, sort_order);

alter table public.curriculum_flashcards enable row level security;

create policy "curriculum_flashcards: select for authenticated"
  on public.curriculum_flashcards for select
  to authenticated
  using (true);
