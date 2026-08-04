-- Cache de la explicación "¿Por qué es así?" por tema curricular.
--
-- El contenido teórico general de un tema (idea clave, método, error típico,
-- mini ejemplo) es el mismo para cualquier alumno que llegue a ese tema — solo
-- cambia qué error concreto cometió. Antes se le pedía al modelo que la
-- regenerara entera en cada corrección, lo que añadía tokens de salida y
-- tiempo sin aportar nada nuevo. Esta tabla guarda la primera generación por
-- tema y las siguientes correcciones la reutilizan en vez de regenerarla.
--
-- Solo se lee/escribe desde el servidor (service role) — no hay política de
-- select para authenticated/anon a propósito, no es dato de un alumno.

create table if not exists public.topic_why_cache (
  id            uuid        primary key default gen_random_uuid(),
  subject       text        not null,
  block_slug    text        not null,
  topic_slug    text        not null,
  porque_es_asi jsonb       not null,
  created_at    timestamptz not null default now(),
  unique (subject, block_slug, topic_slug)
);

create index if not exists topic_why_cache_lookup_idx
  on public.topic_why_cache (subject, block_slug, topic_slug);

alter table public.topic_why_cache enable row level security;
