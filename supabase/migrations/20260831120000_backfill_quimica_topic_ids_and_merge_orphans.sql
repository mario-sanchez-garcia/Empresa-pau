-- Fase 1 de "temas como entidad real" aplicada a Química (mismo patrón que
-- 20260827120000 Lengua/Historia y 20260828120000 Matemáticas II).
--
-- Contexto (investigación previa, ya confirmada): curriculum_topics tenía 76
-- filas para subject='quimica': 68 finas que coinciden 1:1 por título exacto
-- contra curriculum_content_v2 (verificado 68/68 antes de esta migración, sin
-- ambigüedad, sin duplicados) + 8 huérfanas gruesas de PRIVATE_BETA_CURRICULUM_TOPICS
-- (betaCurriculum.ts, una por bloque), sin fila propia en curriculum_content_v2 y
-- sin ninguna referencia en exam_topics (verificado, 0 filas).
--
-- Backfill: las 68 filas finas se emparejan por coincidencia exacta de título.
--
-- Las 8 huérfanas gruesas: ninguna tiene solapamiento 1:1 (cada bloque tiene
-- entre 7 y 11 lecciones finas, no 1), así que las 8 se mantienen como fila y
-- su cobertura real se registra en topic_theory_coverage (cubren TODAS las
-- lecciones finas de su propio bloque, partición limpia sin solapes entre
-- bloques — verificado: 8+8+8+7+11+8+8+10=68).
--
-- Colisión de "order" resuelta explícitamente: las 8 huérfanas tenían "order"
-- 1-8, coincidiendo con las 8 primeras lecciones finas (que también numeran
-- 1-68 desde 1). Se reasignan a 69-76 (justo después de la última fina),
-- preservando su secuencia relativa original — no se tocan las 68 finas.
--
-- Cero impacto en el Curso que ya usan alumnos reales: esta migración solo
-- añade curriculum_content_v2.topic_id (columna no leída hoy por
-- getTopicByV2SortOrder ni por el flujo de alumno real, que dependen de
-- curriculum_seed.json / sort_order) y reordena las 8 filas huérfanas de
-- curriculum_topics, que hoy no tienen ninguna fila en curriculum_content_v2
-- y no las usa ningún alumno. No toca curriculum_seed.json, betaCurriculum.ts
-- ni ninguna fila de curriculum_content_v2 más allá de rellenar topic_id.

UPDATE curriculum_content_v2 AS cv2
SET topic_id = v.topic_id
FROM (VALUES
  (251::bigint, 'ffd3cb0f-cf46-4eab-8804-9fc79e560bd3'::uuid),
  (252::bigint, '72587915-915b-49a2-bded-73aa88885046'::uuid),
  (253::bigint, 'fff3503e-6c0f-4bb5-8a57-7931271b7aea'::uuid),
  (254::bigint, '8f4b1f62-b4c7-43e8-be80-42b7ec8bb760'::uuid),
  (255::bigint, '80ce51fe-db81-45b9-8e00-33131318ee46'::uuid),
  (256::bigint, '5bdaf5a9-1ede-4101-9427-eff0c7148b32'::uuid),
  (257::bigint, '38f79944-16a3-4020-8839-3ab56c9df718'::uuid),
  (258::bigint, '2b262945-ba4e-4e22-bf22-5e3c84b61a24'::uuid),
  (259::bigint, '8c490997-26ba-4ef2-9891-b20354dce5e3'::uuid),
  (260::bigint, 'cdbc8b37-53d3-446c-84d0-4f56e9631451'::uuid),
  (261::bigint, '903c1947-76c6-4551-89b7-4a368882a7dd'::uuid),
  (262::bigint, '27046c16-47f3-4480-9f42-425283aad020'::uuid),
  (263::bigint, '40b144e8-c0e2-44a0-a673-50d922a34fef'::uuid),
  (264::bigint, '8b156969-1124-4e23-ae0f-0d12b4de0cf0'::uuid),
  (265::bigint, '45015453-2b71-4b0d-ab39-70c2d8b36274'::uuid),
  (266::bigint, '65f52dc7-de72-4919-965a-e36ba69474c4'::uuid),
  (267::bigint, '4465dc31-4e5a-41fa-9d25-11429c1d9db2'::uuid),
  (268::bigint, 'bc8e12f4-7295-4a74-b4a0-e72564009f9b'::uuid),
  (269::bigint, 'febe36d8-ff11-4866-bbe5-3fe8500e826c'::uuid),
  (270::bigint, '392cee59-fe34-4458-bdc7-9cbadec1729e'::uuid),
  (271::bigint, 'da2faf88-bfd5-4922-b349-623ada51df8a'::uuid),
  (272::bigint, '62d383d1-33e7-4d89-a0dc-d7d6de90322d'::uuid),
  (273::bigint, 'ca3c3c4c-678a-495f-a2c0-016b0b01a7c5'::uuid),
  (274::bigint, 'f7e12292-b281-4d53-a4e0-ba8cd10fa2c4'::uuid),
  (275::bigint, 'c7cc665c-6cf2-4cbf-8deb-e8095fe84302'::uuid),
  (276::bigint, '558f0ae8-af38-47ba-863d-ee57547714ef'::uuid),
  (277::bigint, '00fe3453-23ae-4380-bcc9-8872e70fd265'::uuid),
  (278::bigint, 'e5121032-c46e-4bfa-972c-b189bcbebe57'::uuid),
  (279::bigint, 'd35faffb-b362-424a-8954-1f102e94d570'::uuid),
  (280::bigint, 'e820546a-a6c8-46d6-a9ec-97093e122eb5'::uuid),
  (281::bigint, '4dbc6981-f99f-40ab-bf18-cf9a96bb8573'::uuid),
  (282::bigint, '1d509b25-7fb9-403f-aefd-9c7819bdf888'::uuid),
  (283::bigint, 'cce3a952-d2f0-4a9e-b0fe-d975a56d47de'::uuid),
  (284::bigint, 'ee1bc01b-7619-4080-8ade-c5fbfc944849'::uuid),
  (285::bigint, '384f0bde-69e5-4440-9991-7d5bd0de7c1e'::uuid),
  (286::bigint, '8247c339-fe1a-46d5-b24b-b7be267b144d'::uuid),
  (287::bigint, 'fa84754f-bd27-4e92-bb1e-1cc5cc26ff58'::uuid),
  (288::bigint, '98d51bd1-1fd5-4adb-aa0b-eb95c183ea4a'::uuid),
  (289::bigint, '9dcc9ce5-3ecd-4b5a-9444-2844d20a9623'::uuid),
  (290::bigint, 'd3b27e6a-74fd-4471-a032-30a496738a8d'::uuid),
  (291::bigint, '17d127ee-e292-4276-bfcc-bd04cfc8b910'::uuid),
  (292::bigint, '5dca94c2-72ef-49cc-abb2-21076781b697'::uuid),
  (293::bigint, 'eb780c4e-3cb4-42e1-8469-e1ec1f3defce'::uuid),
  (294::bigint, 'd243c86a-a143-4978-abb7-15422e59f8ee'::uuid),
  (295::bigint, '43e894d6-79f6-4eca-99d8-bf0514c920d7'::uuid),
  (296::bigint, 'd0735d66-4ff1-47bb-89f2-3a6e257d7c7f'::uuid),
  (297::bigint, '2c0d7b7d-f828-4cfe-9e98-2e6ee1ac139d'::uuid),
  (298::bigint, 'efbfa17c-9838-4fe5-a786-4b51ce7e69cd'::uuid),
  (299::bigint, '05094e26-b3b6-455f-a176-921eb95b0741'::uuid),
  (300::bigint, 'ae8cd295-82d7-462e-a4f7-641d8c486040'::uuid),
  (301::bigint, 'd531142d-6243-46d9-8d87-205267cd8565'::uuid),
  (302::bigint, '982a8abf-9f4e-40dc-8896-08db5689b375'::uuid),
  (303::bigint, '9e3ea4e5-606b-4916-affe-73685af735be'::uuid),
  (304::bigint, '930f477a-5fb2-4014-876f-9229578e48e4'::uuid),
  (305::bigint, 'a34fdee4-8877-46ee-8ee0-84cb35505b9c'::uuid),
  (306::bigint, '4211cfd2-a697-4460-b307-9d03a908ca9c'::uuid),
  (307::bigint, '26396876-9483-402f-a2c5-2dee9d078a23'::uuid),
  (308::bigint, 'd2235f1a-135e-4c50-a2e6-f3e6ab7cd954'::uuid),
  (309::bigint, 'e744f018-cbf7-450c-9ae6-d92a2d89dd86'::uuid),
  (310::bigint, '124e5130-db09-4dda-bf0d-accaca46c422'::uuid),
  (311::bigint, 'b9f8955c-a803-4830-802a-5b2a2378d1c5'::uuid),
  (312::bigint, '91413dc0-9fc0-405f-8e14-31b1ef29d0ae'::uuid),
  (313::bigint, 'f91c9ad5-34ab-47db-84cc-27f81aaa9a48'::uuid),
  (314::bigint, 'a2dc9824-58ac-46b6-a1ba-a7288e8d4e04'::uuid),
  (315::bigint, '1a4a1a76-6c56-41f6-81e9-f2097a146a97'::uuid),
  (316::bigint, '7a77e695-0d93-4cd0-8931-b1176d632761'::uuid),
  (317::bigint, 'aa2bfff3-9b74-4496-8594-b38a0273a744'::uuid),
  (318::bigint, '1672bdcf-2e14-4d0a-9f28-b3413edfdc82'::uuid)
) AS v(cv2_id, topic_id)
WHERE cv2.id = v.cv2_id;

-- Resolver la colisión de "order": las 8 huérfanas pasan a 69-76.
UPDATE curriculum_topics SET "order" = v.new_order
FROM (VALUES
  ('estequiometria', 69),
  ('estructura-atomica', 70),
  ('enlace-quimico', 71),
  ('termoquimica', 72),
  ('equilibrio-cinetica', 73),
  ('acido-base', 74),
  ('electroquimica', 75),
  ('quimica-organica', 76)
) AS v(topic_slug, new_order)
WHERE curriculum_topics.subject = 'quimica' AND curriculum_topics.topic_slug = v.topic_slug;

-- Cobertura real de las 8 huérfanas (cada una cubre todas las finas de su bloque).
INSERT INTO topic_theory_coverage (topic_id, covered_by_content_v2_id)
SELECT ct.id, v.cv2_id
FROM curriculum_topics ct
JOIN (VALUES
  ('estequiometria', 251::integer),
  ('estequiometria', 252::integer),
  ('estequiometria', 253::integer),
  ('estequiometria', 254::integer),
  ('estequiometria', 255::integer),
  ('estequiometria', 256::integer),
  ('estequiometria', 257::integer),
  ('estequiometria', 258::integer),
  ('estructura-atomica', 259::integer),
  ('estructura-atomica', 260::integer),
  ('estructura-atomica', 261::integer),
  ('estructura-atomica', 262::integer),
  ('estructura-atomica', 263::integer),
  ('estructura-atomica', 264::integer),
  ('estructura-atomica', 265::integer),
  ('estructura-atomica', 266::integer),
  ('enlace-quimico', 267::integer),
  ('enlace-quimico', 268::integer),
  ('enlace-quimico', 269::integer),
  ('enlace-quimico', 270::integer),
  ('enlace-quimico', 271::integer),
  ('enlace-quimico', 272::integer),
  ('enlace-quimico', 273::integer),
  ('enlace-quimico', 274::integer),
  ('termoquimica', 275::integer),
  ('termoquimica', 276::integer),
  ('termoquimica', 277::integer),
  ('termoquimica', 278::integer),
  ('termoquimica', 279::integer),
  ('termoquimica', 280::integer),
  ('termoquimica', 281::integer),
  ('equilibrio-cinetica', 282::integer),
  ('equilibrio-cinetica', 283::integer),
  ('equilibrio-cinetica', 284::integer),
  ('equilibrio-cinetica', 285::integer),
  ('equilibrio-cinetica', 286::integer),
  ('equilibrio-cinetica', 287::integer),
  ('equilibrio-cinetica', 288::integer),
  ('equilibrio-cinetica', 289::integer),
  ('equilibrio-cinetica', 290::integer),
  ('equilibrio-cinetica', 291::integer),
  ('equilibrio-cinetica', 292::integer),
  ('acido-base', 293::integer),
  ('acido-base', 294::integer),
  ('acido-base', 295::integer),
  ('acido-base', 296::integer),
  ('acido-base', 297::integer),
  ('acido-base', 298::integer),
  ('acido-base', 299::integer),
  ('acido-base', 300::integer),
  ('electroquimica', 301::integer),
  ('electroquimica', 302::integer),
  ('electroquimica', 303::integer),
  ('electroquimica', 304::integer),
  ('electroquimica', 305::integer),
  ('electroquimica', 306::integer),
  ('electroquimica', 307::integer),
  ('electroquimica', 308::integer),
  ('quimica-organica', 309::integer),
  ('quimica-organica', 310::integer),
  ('quimica-organica', 311::integer),
  ('quimica-organica', 312::integer),
  ('quimica-organica', 313::integer),
  ('quimica-organica', 314::integer),
  ('quimica-organica', 315::integer),
  ('quimica-organica', 316::integer),
  ('quimica-organica', 317::integer),
  ('quimica-organica', 318::integer)
) AS v(topic_slug, cv2_id) ON v.topic_slug = ct.topic_slug
WHERE ct.subject = 'quimica'
ON CONFLICT (topic_id, covered_by_content_v2_id) DO NOTHING;
