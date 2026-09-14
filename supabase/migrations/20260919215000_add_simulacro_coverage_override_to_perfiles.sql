-- El "método Kairo" no genera el Simulacro de un examen si el Curso de sus
-- temas no llega (o no puede llegar, comprimiendo al máximo) al 80% de
-- cobertura -- ver MIN_COVERAGE_PCT_FOR_SIMULACRO en
-- app/lib/camino/injectPartialExamMissions.ts. Estas dos columnas permiten
-- que un alumno concreto DESACTIVE esa protección bajo su propio criterio
-- (nunca cambia el comportamiento por defecto de nadie): enabled=false dejar
-- corriendo la regla estricta de siempre; enabled=true sustituye el 80% fijo
-- por override_pct (30-100, ver resolveSimulacroCoverageThreshold).
alter table public.perfiles
  add column if not exists simulacro_coverage_override_enabled boolean not null default false,
  add column if not exists simulacro_coverage_override_pct integer;

alter table public.perfiles
  drop constraint if exists perfiles_simulacro_coverage_override_pct_check;
alter table public.perfiles
  add constraint perfiles_simulacro_coverage_override_pct_check
  check (simulacro_coverage_override_pct is null or simulacro_coverage_override_pct between 30 and 100);

comment on column public.perfiles.simulacro_coverage_override_enabled is
  'Si true, el alumno fija su propio umbral mínimo de cobertura del Curso para generar el Simulacro en vez del 80% fijo del método Kairo. Default false: nadie cambia de comportamiento sin tocar este ajuste.';
comment on column public.perfiles.simulacro_coverage_override_pct is
  'Umbral en % (30-100) que sustituye al 80% fijo cuando simulacro_coverage_override_enabled=true. Ignorado si enabled=false.';
