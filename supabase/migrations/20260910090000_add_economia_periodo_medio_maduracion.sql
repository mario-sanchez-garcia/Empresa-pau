-- Añade el topic "El Periodo Medio de Maduración" a Economía de la Empresa,
-- hueco curricular detectado en la auditoría completa de la asignatura
-- (ver 20260909090000_auditoria_completa_economia.sql) y cerrado tras
-- revisión y aprobación humana del borrador (borrador-pmm-economia.md).
--
-- Se inserta en el bloque "La Función Financiera", justo después de "La
-- Estructura Económica y Financiera de la Empresa" (sort_order 44) y antes
-- de "Las Inversiones y su Clasificación" — nuevo sort_order 45. Los 5
-- topics posteriores del mismo bloque (Inversiones, Fuentes de
-- Financiación, Leasing y Factoring, VAN, TIR y Payback) se desplazan +1
-- (45→46 ... 49→50) en curriculum_topics."order" y en
-- curriculum_content_v2.sort_order. Ya aplicado en directo contra Supabase
-- con SUPABASE_SERVICE_ROLE_KEY antes de este commit (mismo patrón de
-- desplazamiento a +500 primero, para evitar colisión, que la migración de
-- reordenación de Matemáticas CCSS del 20260830130000); esta migración deja
-- constancia reproducible del cambio. app/data/camino/curriculum_seed.json
-- se actualizó en el mismo commit para mantener orderIndex/v2SortOrder
-- coherentes con esta renumeración — verificado 1:1 contra las 50 filas
-- reales tras aplicar.

BEGIN;

-- Paso 1: mover los 5 topics afectados a un rango temporal alto para evitar
-- colisión con el sort_order 45 que va a ocupar el topic nuevo.
UPDATE curriculum_topics SET "order" = "order" + 500
  WHERE subject = 'economia' AND topic_slug IN ('las-inversiones-y-su-clasificacion', 'las-fuentes-de-financiacion-propias-y-ajenas', 'el-leasing-y-el-factoring', 'la-valoracion-de-inversiones-el-metodo-del-van', 'la-valoracion-de-inversiones-tir-y-payback');
UPDATE curriculum_content_v2 SET sort_order = sort_order + 500
  WHERE subject = 'economia' AND topic_id IN (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug IN ('las-inversiones-y-su-clasificacion', 'las-fuentes-de-financiacion-propias-y-ajenas', 'el-leasing-y-el-factoring', 'la-valoracion-de-inversiones-el-metodo-del-van', 'la-valoracion-de-inversiones-tir-y-payback'));

-- Paso 2: fijar el order/sort_order final (+1 respecto al original) por topic_slug
UPDATE curriculum_topics SET "order" = 46 WHERE subject = 'economia' AND topic_slug = 'las-inversiones-y-su-clasificacion';
UPDATE curriculum_content_v2 SET sort_order = 46 WHERE subject = 'economia' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug = 'las-inversiones-y-su-clasificacion');
UPDATE curriculum_topics SET "order" = 47 WHERE subject = 'economia' AND topic_slug = 'las-fuentes-de-financiacion-propias-y-ajenas';
UPDATE curriculum_content_v2 SET sort_order = 47 WHERE subject = 'economia' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug = 'las-fuentes-de-financiacion-propias-y-ajenas');
UPDATE curriculum_topics SET "order" = 48 WHERE subject = 'economia' AND topic_slug = 'el-leasing-y-el-factoring';
UPDATE curriculum_content_v2 SET sort_order = 48 WHERE subject = 'economia' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug = 'el-leasing-y-el-factoring');
UPDATE curriculum_topics SET "order" = 49 WHERE subject = 'economia' AND topic_slug = 'la-valoracion-de-inversiones-el-metodo-del-van';
UPDATE curriculum_content_v2 SET sort_order = 49 WHERE subject = 'economia' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug = 'la-valoracion-de-inversiones-el-metodo-del-van');
UPDATE curriculum_topics SET "order" = 50 WHERE subject = 'economia' AND topic_slug = 'la-valoracion-de-inversiones-tir-y-payback';
UPDATE curriculum_content_v2 SET sort_order = 50 WHERE subject = 'economia' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'economia' AND topic_slug = 'la-valoracion-de-inversiones-tir-y-payback');

-- Paso 3: insertar el topic nuevo
INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('7195a5e3-91d0-43dd-857d-1ec43fe5e582'::uuid, 'economia', 'la-funcion-financiera', 'La Función Financiera', 'periodo-medio-de-maduracion', 'El Periodo Medio de Maduración', 45);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('economia', 'La Función Financiera', 'la-funcion-financiera', 45, 'El Periodo Medio de Maduración', $mkd$El periodo medio de maduración (PMM) mide, en días, el tiempo medio que tarda una unidad monetaria invertida en el ciclo de explotación (ciclo corto) en volver a convertirse en efectivo.

*PMM económico* = PMa (aprovisionamiento) + PMf (fabricación) + PMv (venta) + PMc (cobro), donde cada subperíodo = 365 / rotación, y rotación = consumo o coste anual del concepto / saldo medio de la partida.

*PMM financiero* = PMM económico − PMp (periodo medio de pago a proveedores), porque ese es el tiempo que la empresa no financia con recursos propios al tener aplazamiento de sus proveedores.$mkd$, $mkd$Con consumo anual de materias primas 730.000€ y saldo medio en almacén 40.000€ → PMa = 20 días; coste de producción anual 1.095.000€ y productos en curso medios 30.000€ → PMf = 10 días; coste de ventas anual 1.460.000€ y productos terminados medios 60.000€ → PMv = 15 días; ventas netas anuales 1.825.000€ y saldo medio de clientes 100.000€ → PMc = 20 días.

PMM económico = 65 días.

Con compras anuales 730.000€ y saldo medio de proveedores 60.000€ → PMp = 30 días.

PMM financiero = 35 días.$mkd$, $mkd$Ejercicio análogo con otro juego de datos para que el alumno calcule ambos periodos (PMM económico y PMM financiero).$mkd$, NULL, '7195a5e3-91d0-43dd-857d-1ec43fe5e582'::uuid, 'published');

COMMIT;
