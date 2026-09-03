-- Ejecutar al final. Todas las filas deben devolver ok = true.
with conteos as (
select 'Cataluña · universidades' as comprobacion, 8::bigint as esperado, (select count(*) from public.orientation_universities where community = 'Cataluña' and active = true)::bigint as real
union all
select 'Cataluña · grados/centros' as comprobacion, 560::bigint as esperado, (select count(*) from public.orientation_degrees where community = 'Cataluña' and active = true)::bigint as real
union all
select 'Cataluña · notas' as comprobacion, 560::bigint as esperado, (select count(*) from public.orientation_admission_cutoffs where community = 'Cataluña' and academic_year = '2026-2027' and admission_round = 'primera_assignacio_juny' and status = 'verified')::bigint as real
union all
select 'Cataluña · ponderaciones' as comprobacion, 4797::bigint as esperado, (select count(*) from public.orientation_subject_weightings where community = 'Cataluña' and academic_year = '2026-2027' and status = 'verified')::bigint as real
union all
select 'Madrid · universidades' as comprobacion, 6::bigint as esperado, (select count(*) from public.orientation_universities where community = 'Comunidad de Madrid' and active = true)::bigint as real
union all
select 'Madrid · grados' as comprobacion, 554::bigint as esperado, (select count(*) from public.orientation_degrees where community = 'Comunidad de Madrid' and active = true)::bigint as real
union all
select 'Madrid · notas' as comprobacion, 554::bigint as esperado, (select count(*) from public.orientation_admission_cutoffs where community = 'Comunidad de Madrid' and academic_year = '2026-2027' and admission_round = 'grupo_1_ordinaria' and status = 'verified')::bigint as real
union all
select 'Madrid · ponderaciones' as comprobacion, 4473::bigint as esperado, (select count(*) from public.orientation_subject_weightings where community = 'Comunidad de Madrid' and academic_year = '2026-2027' and status = 'verified')::bigint as real
)
select comprobacion, esperado, real, real = esperado as ok from conteos order by comprobacion;

-- Debe devolver cero filas: no puede haber códigos estables duplicados.
select stable_code, count(*) as repeticiones from public.orientation_degrees
where stable_code like 'CAT:%' group by stable_code having count(*) > 1;
