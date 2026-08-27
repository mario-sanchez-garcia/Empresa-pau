-- Fase 1 de "temas como entidad real" aplicada a Lengua (mismo patrón que
-- 20260825220000_add_topic_id_to_curriculum_content_v2.sql para Historia).
--
-- Contexto (ver informe de investigación previo): curriculum_topics ya tenía
-- 68 filas para subject='lengua': 60 coinciden 1:1 con curriculum_content_v2
-- (comunicacion 15, reflexion-lengua 25, educacion-literaria 20 — vienen de
-- PRIVATE_BETA_CURRICULUM_TOPICS en betaCurriculum.ts) y 8 eran de un
-- catálogo distinto y más pobre (comentario-texto-pau, gramatica-lexico,
-- literatura — también en betaCurriculum.ts, no en curriculum_seed.json como
-- se sospechaba), sin lección propia en curriculum_content_v2.
--
-- Backfill de topic_id: las 60 filas de curriculum_content_v2 se emparejan
-- por coincidencia exacta de título (verificado 60/60 antes de esta
-- migración).
--
-- Los 8 huérfanos se resuelven en dos grupos, revisados y aprobados por el
-- usuario antes de aplicar:
--   - 4 con un solapamiento 1:1 claro: se fusionan borrando la fila huérfana
--     (organizacion-ideas, comentario-critico, valores-se, oracion-compuesta
--     — ninguno tenía referencias reales en exam_topics, verificado antes).
--   - 4 donde el huérfano cubre 2-3 temas finos ya separados (tema-resumen,
--     adecuacion-coherencia-cohesion, modernismo-generacion-98,
--     vanguardias-generacion-27): se mantienen como fila (no se pierde el
--     concepto) y se registra la cobertura en topic_theory_coverage — mismo
--     mecanismo que se dejó preparado (vacío) para los 10 genéricos de
--     Historia en la migración anterior.

UPDATE curriculum_content_v2 AS cv2
SET topic_id = v.topic_id
FROM (VALUES
  (368, '04b0a2c1-abfb-4665-8c13-5b9fd073b662'::uuid),
  (369, 'fd164aa3-fda8-4613-9fb4-18d7dd779ea0'::uuid),
  (370, '304d0be6-8151-4749-b0ad-aba78aed6788'::uuid),
  (371, 'ad9afa8a-b246-49ad-8ab8-c00dc8f43193'::uuid),
  (372, 'c91b0b93-f91d-4280-8367-c0f9e78940d7'::uuid),
  (373, 'ab3da11e-1ebd-482a-92e0-3674db479053'::uuid),
  (374, '8930f1a0-3a58-43d1-bf2c-b56b42eb4521'::uuid),
  (375, 'e64cb3c1-4926-4f72-9476-2a067247994a'::uuid),
  (376, '395eabe1-0f39-4b86-ac7d-edc3f6b981e4'::uuid),
  (377, 'e4d8252c-9f85-45df-9785-a2ab5bb97140'::uuid),
  (378, 'c3dcd5c3-1e38-4b11-9cd1-66a3820f4058'::uuid),
  (379, 'b2d941e0-9f18-4fe2-95b2-1629291ece50'::uuid),
  (380, '5a092680-940d-4cca-9632-4dd989e7983c'::uuid),
  (381, 'd909fb7d-422b-4abe-97e3-57bcdf644362'::uuid),
  (382, '9263bea0-73bc-44fd-bd5a-75168497a02c'::uuid),
  (383, 'a3119cbc-6656-4f72-bc84-041a893f6adc'::uuid),
  (384, 'e12f4a4b-3090-4fb9-a620-3a9d846fabea'::uuid),
  (385, 'e40ea1cc-c6b8-40db-aa5e-e8a340ad97c2'::uuid),
  (386, '5f1f7929-8330-4e61-b06b-1e7f102172d5'::uuid),
  (387, '40e2d514-feab-41bd-9d96-b2baba6dfde7'::uuid),
  (388, '7e0e1d86-22bc-4cf4-90d0-48d447b6e548'::uuid),
  (389, '25960e4e-20a6-4a89-bbdd-8a33e157ad0e'::uuid),
  (390, '93f159f5-45bf-46cc-a280-e9319878b7ab'::uuid),
  (391, 'b932ae13-654f-4cec-88d4-05953d7fe0f0'::uuid),
  (392, '43757a18-7570-4031-aa9e-ebf236150b62'::uuid),
  (393, '1ee241c5-0813-4842-845f-01de9caf9f87'::uuid),
  (394, '61e994bf-e3eb-46d1-b152-8577bfe81b30'::uuid),
  (395, 'a25378bb-7085-4583-9ea0-bdab8d552cc7'::uuid),
  (396, '6cb95429-16d6-436e-96f3-b7c237c841f9'::uuid),
  (397, 'da9ea7cb-23a6-4d21-8d21-02835d9b7d06'::uuid),
  (398, 'd8762627-8891-4404-81b8-e6b5d274f6fa'::uuid),
  (399, 'f6130877-4029-4d42-8635-fb67352b4c06'::uuid),
  (400, 'cc8b7f24-08c7-426e-8583-ede531e34484'::uuid),
  (401, '68bc1631-99d6-4b7a-ab4d-2de6edf2308d'::uuid),
  (402, 'fa8916a6-7297-428e-8442-9e9c29849ad3'::uuid),
  (403, 'd84d950b-b226-4b1d-abb2-0583616cdfdc'::uuid),
  (404, 'e8f821d7-7968-467c-b801-01c85ff76131'::uuid),
  (405, 'f600c396-6814-4ad2-aef6-168a068dfa16'::uuid),
  (406, 'e08cebc4-766a-4ec5-9611-b59e034c7e80'::uuid),
  (407, 'a227e534-50c3-49fd-be91-fc32a73b15ed'::uuid),
  (408, 'cc126880-c646-4af9-8d11-ca9e04a434cb'::uuid),
  (409, '2c4a33dc-4dc3-4830-9678-f30ab9375fa2'::uuid),
  (410, '16992a5e-a243-41b3-a7c4-e7d07672d60b'::uuid),
  (411, '0502bb17-a81b-46ac-9112-df24f341f21e'::uuid),
  (412, 'c838cd02-56c8-4e45-a2fd-66ec2b2c42dc'::uuid),
  (413, '9562bf5e-156b-436e-bc8e-9c471620e0d8'::uuid),
  (414, 'd119870a-133d-4511-820c-31bc1b946497'::uuid),
  (415, '67c03cd3-a53b-4d59-91d8-06e3b8424f4a'::uuid),
  (416, '4d50ea0f-06ba-40b7-a640-219f7df19b6b'::uuid),
  (417, '4f44cf9d-2faa-4909-a9bd-defe8f99ce27'::uuid),
  (418, '2ad7d63f-0691-4179-96e9-e1dc7663e016'::uuid),
  (419, '6ccef110-60fe-414d-acc8-caf266d3662c'::uuid),
  (420, 'ef397683-1f69-4bc2-a4b9-03a3578d1a56'::uuid),
  (421, '5de18163-0b75-423b-9898-cced0711b701'::uuid),
  (422, 'b6d5180f-00b8-46d1-8508-624c21a6fe10'::uuid),
  (423, '6e3cfdd5-a578-4041-9ce7-16dcd23cbe67'::uuid),
  (424, 'e03e237e-4126-4cf9-b6c9-3d3a30822729'::uuid),
  (425, '9be2ffe5-d89c-4a9e-927e-65fb76080831'::uuid),
  (426, '60067ece-13dc-4509-9e88-e9476ab3b606'::uuid),
  (427, 'bba45c23-8af6-4e46-9821-c5e134e685f1'::uuid)
) AS v(cv2_id, topic_id)
WHERE cv2.id = v.cv2_id;

-- 4 huérfanos con solapamiento 1:1 claro: se borran (sin referencias reales
-- en exam_topics, verificado antes de esta migración).
DELETE FROM curriculum_topics
WHERE subject = 'lengua'
  AND topic_slug IN ('organizacion-ideas', 'comentario-critico', 'valores-se', 'oracion-compuesta');

-- 4 huérfanos que cubren 2-3 temas finos ya separados: se mantienen y se
-- registra la cobertura.
INSERT INTO topic_theory_coverage (topic_id, covered_by_content_v2_id)
SELECT ct.id, v.cv2_id
FROM curriculum_topics ct
JOIN (VALUES
  ('tema-resumen', 369),
  ('tema-resumen', 370),
  ('adecuacion-coherencia-cohesion', 378),
  ('adecuacion-coherencia-cohesion', 375),
  ('adecuacion-coherencia-cohesion', 376),
  ('modernismo-generacion-98', 410),
  ('modernismo-generacion-98', 411),
  ('vanguardias-generacion-27', 416),
  ('vanguardias-generacion-27', 417)
) AS v(topic_slug, cv2_id) ON v.topic_slug = ct.topic_slug
WHERE ct.subject = 'lengua'
ON CONFLICT (topic_id, covered_by_content_v2_id) DO NOTHING;
