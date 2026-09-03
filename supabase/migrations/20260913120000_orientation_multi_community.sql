-- Extiende Orientación a múltiples comunidades sin cambiar RLS ni sustituir
-- los datos de Madrid. Las columnas desnormalizadas permiten consultas
-- territoriales eficientes y se rellenan desde la universidad existente.

alter table public.orientation_degrees add column if not exists community text;
alter table public.orientation_admission_cutoffs add column if not exists community text;
alter table public.orientation_subject_weightings add column if not exists community text;
alter table public.perfiles add column if not exists target_orientation_community text;

update public.orientation_degrees d
set community = u.community
from public.orientation_universities u
where d.university_id = u.id and d.community is null;

update public.orientation_admission_cutoffs c
set community = d.community
from public.orientation_degrees d
where c.degree_id = d.id and c.community is null;

update public.orientation_subject_weightings w
set community = d.community
from public.orientation_degrees d
where w.degree_id = d.id and w.community is null;

update public.perfiles p
set target_orientation_community = u.community
from public.orientation_universities u
where p.target_university_id = u.id and p.target_orientation_community is null;

create index if not exists orientation_degrees_community_idx
  on public.orientation_degrees (community, active, university_id);
create index if not exists orientation_cutoffs_community_year_round_idx
  on public.orientation_admission_cutoffs (community, academic_year, admission_round, status);
create index if not exists orientation_weightings_community_year_idx
  on public.orientation_subject_weightings (community, academic_year, status);

comment on column public.perfiles.target_orientation_community is
  'Comunidad del único objetivo global guardado; explorar otra comunidad no lo modifica.';

-- Criterios territoriales mínimos usados por la guía. Son idempotentes y
-- mantienen el texto oficial separado de la explicación práctica de Kairo.
insert into public.orientation_official_criteria
  (id, community, academic_year, subject, criterion_type, official_text, kairo_explanation, source_url, source_document, published_at, verified_at, version, status)
values
  ('e7ce57c9-95e2-56d1-a903-df785cab655c', 'Cataluña', '2026-2027', 'Criterios generales (todas las materias)', 'duracion',
   'Cada ejercicio de las PAU tiene una duración de una hora y media.',
   'Planifica 90 minutos y reserva unos minutos finales para revisar.',
   'https://universitats.gencat.cat/es/pau/examens-criteris-correccions/', 'Exámenes y criterios de corrección PAU 2026', '2026-05-01', '2026-09-03T00:00:00Z', '2026-09-03', 'verified'),
  ('645afba4-55c8-5a84-b821-9334f6507eb5', 'Cataluña', '2026-2027', 'Acceso internacional', 'unedasiss',
   'La calificación de acceso acreditada por UNEDasiss se expresa entre 5 y 10. Para mejorarla cuentan las dos mejores materias superadas y ponderables examinadas mediante PAU o PCE.',
   'Una asignatura que solo figure en la acreditación, sin examen PAU o PCE, no se usa para sumar ponderación en Cataluña.',
   'https://universitats.gencat.cat/es/preinscripcions/acces-universitat-estudis-estrangers/', 'Acceso a la universidad para estudiantes extranjeros', '2026-01-01', '2026-09-03T00:00:00Z', '2026-09-03', 'verified')
on conflict (id) do update set
  community=excluded.community, academic_year=excluded.academic_year, subject=excluded.subject,
  criterion_type=excluded.criterion_type, official_text=excluded.official_text,
  kairo_explanation=excluded.kairo_explanation, source_url=excluded.source_url,
  source_document=excluded.source_document, published_at=excluded.published_at,
  verified_at=excluded.verified_at, version=excluded.version, status=excluded.status;
