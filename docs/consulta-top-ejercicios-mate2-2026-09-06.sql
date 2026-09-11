-- Paso 2 del plan de canonical_solutions
-- (docs/principio-canonical-solutions-2026-09-05.md)
--
-- Objetivo: identificar los 20-30 ejercicios de Matemáticas II más
-- corregidos, para generarles canonical solution a mano y medir el coste
-- antes/después con tráfico real.
--
-- NO ejecutar antes de una semana desde el 5 de septiembre de 2026 (fecha
-- en la que se empezó a guardar exerciseId en el metadata) — antes de esa
-- fecha, la mayoría de filas no tienen exerciseId y el conteo saldría corto.
--
-- Por qué el filtro es por metadata->>'exerciseId', no por route:
-- las correcciones de texto se registran con route = '/api/chat' (comparten
-- cupo con el chat general a propósito, ver comentario en
-- app/api/exam/correct/route.ts ~181-183). La columna route mezcla chat real
-- con correcciones, y la columna action tampoco distingue (correcciones de
-- texto salen como 'chat', de foto como 'image_correction'). El único campo
-- fiable es metadata->>'exerciseId' is not null.

select
  metadata->>'exerciseId'                              as exercise_id,
  min(metadata->>'exerciseLabel')                      as exercise_label,
  min(metadata->>'examLabel')                          as exam_label,
  count(*)                                             as veces_corregido,
  count(distinct user_id)                              as alumnos_distintos,
  sum(estimated_cost_eur)                              as coste_total_eur,
  round(avg(estimated_cost_eur), 6)                    as coste_medio_eur,
  sum(input_tokens)                                    as input_tokens_total,
  sum(output_tokens)                                   as output_tokens_total,
  min(created_at)                                      as primera_correccion,
  max(created_at)                                      as ultima_correccion
from public.ai_usage_events
where metadata->>'exerciseId' is not null
  and metadata->>'subject' = 'Matemáticas II'
  and status = 'success'
  -- ajustar la ventana según cuándo se corra esto:
  and created_at >= '2026-09-05'::timestamptz
group by metadata->>'exerciseId'
order by veces_corregido desc, coste_total_eur desc
limit 30;

-- Variante de control: coste total ya gastado en Mate II en la ventana,
-- para poder calcular el % de ahorro potencial sobre el total real
-- (no solo sobre el top 30) una vez se tenga el coste de generar las
-- canonical solutions.
--
-- select
--   count(*)                as correcciones_totales,
--   sum(estimated_cost_eur) as coste_total_eur
-- from public.ai_usage_events
-- where metadata->>'exerciseId' is not null
--   and metadata->>'subject' = 'Matemáticas II'
--   and status = 'success'
--   and created_at >= '2026-09-05'::timestamptz;
