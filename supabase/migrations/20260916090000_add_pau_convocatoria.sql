-- Convocatoria objetivo de cada alumno.
--
-- Hasta ahora todo el Camino planificaba contra la constante congelada
-- '2027-06-07' que vivía dentro de ensureCaminoCalendar.ts: no dependía de
-- convocatoria, ni de curso, ni de comunidad, y a partir del 8 de junio de
-- 2027 pasaba a ser una fecha en el pasado (con lo que la urgencia caía a
-- cero justo cuando el alumno más apretado va).
--
-- Estas tres columnas son la fuente por alumno. `pau_exam_date` es la que
-- gobierna el plan; convocatoria y comunidad quedan registradas para poder
-- derivarla automáticamente cuando exista calendario oficial por territorio.
alter table public.perfiles
  add column if not exists pau_convocatoria text,
  add column if not exists pau_comunidad text,
  add column if not exists pau_exam_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'perfiles_pau_convocatoria_check'
      and conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_pau_convocatoria_check
      check (pau_convocatoria is null or pau_convocatoria in ('ordinaria', 'extraordinaria'));
  end if;
end
$$;

comment on column public.perfiles.pau_convocatoria is
  'ordinaria | extraordinaria. Convocatoria a la que se presenta el alumno; junto a pau_comunidad permite derivar pau_exam_date cuando haya calendario oficial.';
comment on column public.perfiles.pau_comunidad is
  'Comunidad autónoma en la que se examina. Mismo vocabulario que orientation_degrees.community.';
comment on column public.perfiles.pau_exam_date is
  'Fecha objetivo efectiva del Camino. Cuando es null se usa la ordinaria de junio del curso en marcha (ver app/lib/camino/examDate.ts).';
