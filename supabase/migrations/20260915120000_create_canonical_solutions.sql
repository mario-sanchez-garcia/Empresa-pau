-- Solución pedagógica canónica por ejercicio oficial.
--
-- La explicación de cómo se resuelve un ejercicio de la PAU es la misma para
-- cualquier alumno que lo intente — lo único que cambia por alumno es qué hizo
-- bien, qué falló y por qué. Hoy el modelo regenera esa parte universal
-- (solucion_orientativa, solucion_correcta_corta) en cada corrección, mezclada
-- en el mismo JSON que el feedback personal. Con 1.200 ejercicios oficiales se
-- paga muchas veces por producir prácticamente el mismo contenido. Esta tabla
-- lo guarda una vez por ejercicio y las correcciones futuras lo reutilizan.
--
-- review_status es un gate humano obligatorio, no un adorno: una solución
-- canónica mal generada no es un bug puntual, es una lección incorrecta
-- servida a toda la base de alumnos hasta que alguien la detecte. Nada llega a
-- 'published' sin que una persona lo haya revisado (missing → generated →
-- reviewed → published). Por eso existen también reviewed_by, para trazabilidad
-- de quién aprobó qué, y content_hash: si cambia el enunciado, la corrección
-- oficial o la rúbrica de origen, el hash deja de coincidir y la solución
-- guardada queda marcada como sospechosa en vez de seguir sirviéndose.
--
-- El versionado (solution_version + language, únicos por ejercicio) permite
-- corregir una solución sin borrar la anterior, que puede haber estado
-- sirviéndose a alumnos y hay que poder auditar.
--
-- Solo se lee/escribe desde el servidor (service role) — no hay política de
-- select para authenticated/anon a propósito, no es dato de un alumno: es
-- contenido curricular compartido, igual que topic_why_cache.

create table if not exists public.canonical_solutions (
  id                 uuid        primary key default gen_random_uuid(),
  exercise_id        text        not null,
  subject            text        not null,
  official_solution  text,
  canonical_solution jsonb       not null,
  solution_version   integer     not null default 1,
  rubric_version     text,
  language           text        not null default 'es',
  review_status      text        not null default 'missing'
    check (review_status in ('missing', 'generated', 'reviewed', 'published')),
  content_hash       text,
  reviewed_by        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (exercise_id, solution_version, language)
);

-- Lookup habitual: la versión publicada más reciente de un ejercicio en un
-- idioma. El índice único de arriba no sirve para esto porque lleva
-- solution_version en medio, y la consulta no filtra por versión.
create index if not exists canonical_solutions_lookup_idx
  on public.canonical_solutions (exercise_id, language);

alter table public.canonical_solutions enable row level security;
