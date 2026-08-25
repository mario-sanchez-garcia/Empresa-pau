-- Fase 1 de "temas como entidad real": hoy no existe ninguna tabla de temas
-- en Supabase — la única identidad de tema (topic_slug) vive repartida en
-- app/data/camino/curriculum_seed.json y app/lib/camino/betaCurriculum.ts, y
-- curriculum_content_v2 solo tiene título + posición numérica, sin relación
-- estructurada con un tema real. Esta migración solo crea la estructura y
-- dos tablas de relación auxiliares; no toca curriculum_content_v2 ni
-- ninguna tabla existente. El poblado de curriculum_topics se hace aparte
-- (script de seed), no en esta migración.
--
-- curriculum_topics: catálogo de temas, uno por (subject, topic_slug), con
-- el bloque y el título tal como ya existen en los dos orígenes de datos
-- actuales.
create table if not exists public.curriculum_topics (
  id          uuid        primary key default gen_random_uuid(),
  subject     text        not null,
  comunidad   text,
  block_key   text        not null,
  block_title text        not null,
  topic_slug  text        not null,
  title       text        not null,
  "order"     integer     not null,
  created_at  timestamptz not null default now(),
  unique (subject, topic_slug)
);

create index if not exists curriculum_topics_subject_block_order_idx
  on public.curriculum_topics (subject, block_key, "order");

alter table public.curriculum_topics enable row level security;

create policy "curriculum_topics: select for authenticated"
  on public.curriculum_topics for select
  to authenticated
  using (true);

-- exam_topics: relaciona un examen (perfiles.student_exams) con uno o
-- varios temas de curriculum_topics. student_exams es un array jsonb por
-- alumno, no una tabla — cada examen se identifica con un id de texto
-- generado en cliente (p. ej. "exam-<uuid>", ver generateExamId() en
-- CaminoCalendarClient.tsx), no con un uuid real de fila. Postgres no puede
-- declarar una foreign key contra un elemento dentro de un jsonb de otra
-- fila, así que exam_id es texto sin "references" — misma convención de
-- referencia lógica (no FK) que ya usa camino_calendar.metadata->>
-- 'partial_exam_id' en injectPartialExamMissions.ts para el mismo problema.
create table if not exists public.exam_topics (
  id         uuid        primary key default gen_random_uuid(),
  exam_id    text        not null,
  topic_id   uuid        not null references public.curriculum_topics(id),
  created_at timestamptz not null default now()
);

create index if not exists exam_topics_exam_id_idx on public.exam_topics (exam_id);
create index if not exists exam_topics_topic_id_idx on public.exam_topics (topic_id);

alter table public.exam_topics enable row level security;
-- Sin políticas para authenticated/anon a propósito, igual que
-- topic_why_cache: de momento solo se escribe/lee desde el servidor
-- (service role) hasta que una fase posterior decida cómo exponerlo.

-- exam_simulacro: guarda el simulacro generado para un examen concreto.
-- Mismo tipo y misma resolución de exam_id que exam_topics.
create table if not exists public.exam_simulacro (
  exam_id        text        primary key,
  simulacro_data jsonb       not null,
  created_at     timestamptz not null default now()
);

alter table public.exam_simulacro enable row level security;
-- Sin políticas para authenticated/anon a propósito, mismo motivo que
-- exam_topics.
