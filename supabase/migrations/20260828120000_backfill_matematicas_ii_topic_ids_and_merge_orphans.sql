-- Fase 1 de "temas como entidad real" aplicada a Matemáticas II (mismo
-- patrón que 20260827120000_backfill_lengua_topic_ids_and_merge_orphans.sql
-- para Lengua e Historia).
--
-- Contexto (ver informe de investigación previo): curriculum_topics ya
-- tenía 74 filas para subject='matematicas_ii': 63 finas (block_key
-- algebra-lineal/geometria-3d/analisis/probabilidad) que coinciden 1:1 por
-- título exacto contra curriculum_content_v2 (verificado 63/63 antes de
-- esta migración, sin ambigüedad — mismo resultado que Física), y 11
-- huérfanas (block_key algebra/geometria-3d/analisis/integrales/
-- probabilidad) del catálogo antiguo y más grueso de
-- PRIVATE_BETA_CURRICULUM_TOPICS (betaCurriculum.ts), sin fila propia en
-- curriculum_content_v2.
--
-- Backfill de topic_id: las 63 filas finas se emparejan por coincidencia
-- exacta de título con su fila de curriculum_content_v2.
--
-- Los 11 huérfanos se resuelven en dos grupos (verificado antes de esta
-- migración que ninguno de los 11 tiene referencias en exam_topics):
--   - 2 con solapamiento 1:1 claro (mismo concepto exacto, sin más
--     desglose): se fusionan borrando la fila huérfana — producto-por-un-
--     escalar (= producto-por-un-escalar-numero-matriz) y multiplicacion-
--     de-matrices (= multiplicacion-de-matrices-a-b).
--   - 9 donde el huérfano es un resumen que agrupa varias lecciones finas
--     ya separadas: se mantienen como fila y su cobertura se registra en
--     topic_theory_coverage, con el subconjunto de lecciones finas que
--     coincide con el título/alcance real del huérfano (no se fuerza
--     cobertura del bloque entero cuando el huérfano no lo nombra
--     explícitamente — p.ej. "vectores-productos" no cubre el repaso de
--     vectores en el plano ni base/dependencia lineal, que son contenido
--     añadido después de que existiera el huérfano).

UPDATE curriculum_content_v2 AS cv2
SET topic_id = v.topic_id
FROM (VALUES
  (1, '068d45d9-56d9-4a49-9de9-c54850f4a20d'::uuid),
  (2, 'd10e9d75-cb9b-4620-8b57-42ecb82a19be'::uuid),
  (3, '4b2846db-2fee-450e-a327-56e9fb053b5d'::uuid),
  (4, '16a3b819-1528-4567-ac59-9a85708c6f99'::uuid),
  (5, 'f341bb38-5e55-4ed7-8740-8f534c91df93'::uuid),
  (6, 'bcb7461b-21fd-4f27-a0d7-d1d3d4e94aee'::uuid),
  (7, 'c4fe3005-cc83-4a50-808b-3d7ffd94fbc3'::uuid),
  (8, 'd130281f-6ccb-49c0-88b6-2b0a9b3b19f9'::uuid),
  (9, 'b7a360fd-e6bc-4d27-ae59-493795e0f9f2'::uuid),
  (10, '483f334e-4196-4795-91f4-651083eaa598'::uuid),
  (11, '4657ea6c-ec6d-4c36-8a2c-786b70eb588d'::uuid),
  (12, 'b1f8d684-4ff5-49cf-a4df-86578e66bbe0'::uuid),
  (13, '01d37036-7ace-4ea3-8d0c-dbc9d00b1819'::uuid),
  (14, '789c55e3-eb2d-48b0-ae16-c3df67983055'::uuid),
  (15, '3999cea5-c136-443e-b125-836a1bde28e9'::uuid),
  (16, 'f68cff72-a9ba-460d-9e2e-5178f25af0c3'::uuid),
  (17, '1bcb9b00-98ef-414b-beb5-1187e9eaa151'::uuid),
  (18, '3da86935-eea6-4613-83e4-72ffca8e94af'::uuid),
  (19, 'a5bd2049-829d-44d7-b85d-0da6c85bd9a5'::uuid),
  (20, 'e150fc8b-627b-454a-8ce4-304899c39715'::uuid),
  (21, 'e5dc5f08-366e-40f6-ac78-030c9d9a3080'::uuid),
  (22, '742105b9-e8ea-416a-8f7b-0649d7340f40'::uuid),
  (23, 'f3f6a71a-f629-496f-92cf-174ca48dca42'::uuid),
  (24, '7dd952bc-f234-411b-b9e8-3d7c020c509f'::uuid),
  (25, 'fdb89e84-25a1-4b02-9396-b0f943082a77'::uuid),
  (26, 'ebf785a8-d2b7-430f-b553-a39e61a66afc'::uuid),
  (27, 'b48065af-d96e-4bd9-8ed2-d2f073625ae0'::uuid),
  (28, 'f7e47fc5-ccc5-4429-8105-a945a38ab660'::uuid),
  (29, '7a83000d-4497-467c-9b2a-d51881462172'::uuid),
  (30, '2a147418-ab62-4ffe-aca9-044fae2e5ae3'::uuid),
  (31, 'b43fa8a1-89f3-4008-afa8-7afc10adbf6b'::uuid),
  (32, '06c3fefb-8bbb-4e57-9cd2-10269b48d50e'::uuid),
  (33, '964030f5-d054-4d0d-9a62-cc9375f1bb2a'::uuid),
  (34, 'ad382044-d75c-4f90-9374-3de5176cfbe2'::uuid),
  (35, '0c69e2cb-11cd-4cc5-bb3e-6aeb7576b180'::uuid),
  (36, '63c34148-7f90-4e8b-93b4-2337d8f8bbea'::uuid),
  (37, '72719780-5165-40e2-9e22-e0cfef992644'::uuid),
  (38, '46d28081-b21d-4b20-bd08-fe4069769e9a'::uuid),
  (39, 'bbf1a2f3-2975-4291-95d5-f4896afa4033'::uuid),
  (190, '9c284f38-6709-4f14-9382-7acf1ef3763c'::uuid),
  (191, 'a108b0f6-8689-4cc2-884a-e9abe1299c82'::uuid),
  (192, '9a14acce-6d19-4a63-a198-897e4ddcf2cc'::uuid),
  (40, '56c5a0f0-b593-4c16-a959-a90205eef653'::uuid),
  (41, '28e017b0-7907-4fe0-95cc-83df6681b085'::uuid),
  (42, '3365852a-a767-4ae3-afce-0e7ff0889d41'::uuid),
  (43, '00cd2ee1-3993-4b07-b49f-11de369c4840'::uuid),
  (44, 'ee44aefb-d2d0-4f76-8d98-d78f7eab8af3'::uuid),
  (45, '32185c0f-ba22-4fc2-92fc-3f1144ad1b3e'::uuid),
  (46, '409e8382-3a88-4636-ac64-62fa2a760abd'::uuid),
  (47, 'c5e0a81c-cd9d-4977-8431-c2f4e5514dad'::uuid),
  (48, '743eb46a-9351-49ae-a852-7190a4fc1ffa'::uuid),
  (49, 'a1767752-6bfc-43d3-9988-074382b76365'::uuid),
  (50, '64202e41-0a29-4868-bb80-82e9f74737df'::uuid),
  (51, 'ee97b310-e81a-4d09-9a76-a075835f46d5'::uuid),
  (52, '71a49163-2eac-4a18-be5c-b2b8752b73ca'::uuid),
  (53, '5cce1048-6b99-407b-89f8-e120f4d0a4a9'::uuid),
  (54, '584d192d-688a-4a3c-b202-6249f169e2e8'::uuid),
  (55, 'c22da257-d698-4293-8318-6b9b2e6671e3'::uuid),
  (56, '914efbdc-2467-42e5-bc0b-e9b845b9c7d5'::uuid),
  (57, 'abd11b5e-4b0e-43c7-9808-e60549fd64c8'::uuid),
  (58, 'a625de3c-7bd9-4ab0-82bf-5641a3902fed'::uuid),
  (59, '776abebd-0926-4da5-92ab-38fe2321e4b1'::uuid),
  (60, 'ec551967-ea54-43a4-95f2-210b48076d1b'::uuid)
) AS v(cv2_id, topic_id)
WHERE cv2.id = v.cv2_id;

-- 2 huérfanos con solapamiento 1:1 claro: se borran (sin referencias reales
-- en exam_topics, verificado antes de esta migración).
DELETE FROM curriculum_topics
WHERE subject = 'matematicas_ii'
  AND topic_slug IN ('producto-por-un-escalar', 'multiplicacion-de-matrices');

-- 9 huérfanos que agrupan varias lecciones finas ya separadas: se
-- mantienen y se registra su cobertura real.
INSERT INTO topic_theory_coverage (topic_id, covered_by_content_v2_id)
SELECT ct.id, v.cv2_id
FROM curriculum_topics ct
JOIN (VALUES
  ('matrices-operaciones', 1),
  ('matrices-operaciones', 2),
  ('matrices-operaciones', 5),
  ('determinantes-inversa-rango', 10),
  ('determinantes-inversa-rango', 11),
  ('determinantes-inversa-rango', 12),
  ('determinantes-inversa-rango', 13),
  ('determinantes-inversa-rango', 8),
  ('determinantes-inversa-rango', 7),
  ('sistemas-gauss-rouche', 14),
  ('sistemas-gauss-rouche', 15),
  ('sistemas-gauss-rouche', 16),
  ('sistemas-gauss-rouche', 17),
  ('sistemas-gauss-rouche', 18),
  ('sistemas-gauss-rouche', 19),
  ('vectores-productos', 21),
  ('vectores-productos', 22),
  ('vectores-productos', 25),
  ('vectores-productos', 26),
  ('vectores-productos', 27),
  ('rectas-planos-posiciones', 28),
  ('rectas-planos-posiciones', 29),
  ('rectas-planos-posiciones', 30),
  ('limites-continuidad-asintotas', 35),
  ('limites-continuidad-asintotas', 36),
  ('limites-continuidad-asintotas', 37),
  ('limites-continuidad-asintotas', 38),
  ('limites-continuidad-asintotas', 39),
  ('limites-continuidad-asintotas', 190),
  ('limites-continuidad-asintotas', 191),
  ('limites-continuidad-asintotas', 192),
  ('limites-continuidad-asintotas', 40),
  ('derivadas-tangente-optimizacion', 41),
  ('derivadas-tangente-optimizacion', 42),
  ('derivadas-tangente-optimizacion', 43),
  ('derivadas-tangente-optimizacion', 44),
  ('derivadas-tangente-optimizacion', 45),
  ('primitivas-barrow-areas', 46),
  ('primitivas-barrow-areas', 47),
  ('primitivas-barrow-areas', 48),
  ('primitivas-barrow-areas', 49),
  ('condicionada-total-bayes-binomial-normal', 53),
  ('condicionada-total-bayes-binomial-normal', 54),
  ('condicionada-total-bayes-binomial-normal', 56),
  ('condicionada-total-bayes-binomial-normal', 59),
  ('condicionada-total-bayes-binomial-normal', 60)
) AS v(topic_slug, cv2_id) ON v.topic_slug = ct.topic_slug
WHERE ct.subject = 'matematicas_ii'
ON CONFLICT (topic_id, covered_by_content_v2_id) DO NOTHING;
