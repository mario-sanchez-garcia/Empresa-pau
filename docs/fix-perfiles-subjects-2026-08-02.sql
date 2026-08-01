-- ============================================================
-- REPARACIÓN — perfiles.subjects incompleto
--
-- La columna perfiles.subjects se creó el 2026-08-02, mucho después de que
-- las cuentas existentes completaran el onboarding. Quedó a NULL para todas.
--
-- /api/camino/add-subject leía esa columna como "asignaturas actuales", veía
-- NULL, lo interpretaba como lista vacía y escribía SOLO la asignatura recién
-- añadida. Resultado: el alumno perdía las demás y el selector le ofrecía
-- volver a añadir las que ya tenía.
--
-- Esto reconstruye la lista uniendo lo que haya en perfiles.subjects con el
-- snapshot de onboarding guardado en billing_events. Es la unión, no un
-- reemplazo: nadie pierde una asignatura añadida después.
--
-- Solo lectura + UPDATE acotado. Idempotente.
-- ============================================================


-- ── PASO 1 — Ver a quién afecta ANTES de tocar nada ─────────
-- Compara lo que hay ahora con lo que debería haber.
with snapshot as (
  select distinct on (be.user_id)
    be.user_id,
    be.payload -> 'subjects' as subjects_onboarding
  from public.billing_events be
  where be.event_type = 'onboarding_completed'
  order by be.user_id, be.created_at desc
)
select
  p.id,
  p.subjects                as ahora,
  s.subjects_onboarding     as en_onboarding,
  jsonb_array_length(coalesce(p.subjects, '[]'::jsonb))         as n_ahora,
  jsonb_array_length(coalesce(s.subjects_onboarding, '[]'::jsonb)) as n_onboarding
from public.perfiles p
join snapshot s on s.user_id = p.id
where jsonb_typeof(s.subjects_onboarding) = 'array'
  and (
    p.subjects is null
    or jsonb_array_length(coalesce(p.subjects, '[]'::jsonb))
       < jsonb_array_length(s.subjects_onboarding)
  )
order by n_ahora;


-- ── PASO 2 — Reparar (unión de ambas listas, sin duplicados) ─
-- Ejecuta esto solo después de revisar el resultado del paso 1.
with snapshot as (
  select distinct on (be.user_id)
    be.user_id,
    be.payload -> 'subjects' as subjects_onboarding
  from public.billing_events be
  where be.event_type = 'onboarding_completed'
  order by be.user_id, be.created_at desc
),
union_subjects as (
  select
    p.id,
    (
      select jsonb_agg(distinct valor)
      from (
        select jsonb_array_elements_text(coalesce(p.subjects, '[]'::jsonb)) as valor
        union
        select jsonb_array_elements_text(s.subjects_onboarding)             as valor
      ) t
      where valor is not null and valor <> ''
    ) as subjects_final
  from public.perfiles p
  join snapshot s on s.user_id = p.id
  where jsonb_typeof(s.subjects_onboarding) = 'array'
)
update public.perfiles p
set subjects = u.subjects_final
from union_subjects u
where p.id = u.id
  and u.subjects_final is not null
  and coalesce(p.subjects, '[]'::jsonb) <> u.subjects_final;


-- ── PASO 3 — Verificar ───────────────────────────────────────
-- No debería quedar ninguna fila con menos asignaturas de las que
-- el onboarding registró.
with snapshot as (
  select distinct on (be.user_id)
    be.user_id,
    be.payload -> 'subjects' as subjects_onboarding
  from public.billing_events be
  where be.event_type = 'onboarding_completed'
  order by be.user_id, be.created_at desc
)
select count(*) as filas_aun_incompletas
from public.perfiles p
join snapshot s on s.user_id = p.id
where jsonb_typeof(s.subjects_onboarding) = 'array'
  and jsonb_array_length(coalesce(p.subjects, '[]'::jsonb))
      < jsonb_array_length(s.subjects_onboarding);
