-- Clasificación temática de Historia de la Filosofía (Madrid): retira el stub
-- huérfano "descartes-hume-kant" (0 dependencias en curriculum_content_v2/
-- topic_theory_coverage/exam_topics, verificado antes de tocarlo) y lo sustituye por
-- 13 topics de autor (eje de contenido doctrinal, uno por filósofo real del corpus de
-- 68 textos/284 preguntas de examenesHistoriaFilosofiaMadrid) + 5 topics de problema
-- filosófico transversal (para las 204 preguntasComunes, que no fijan autor — el
-- alumno elige, así que no se les asigna un autor inventado).
--
-- Todos en block_key/block_title separados: 'autores'/'Autores' para el eje de
-- contenido doctrinal, 'problemas-transversales'/'Problemas Transversales' para el eje
-- de habilidad. review_status='draft', sin filas en curriculum_content_v2 todavía (esta
-- tarea es de normalización + clasificación de topicSlugs, no de redacción de lecciones
-- — igual que el stub anterior, que tampoco tenía contenido).
--
-- Historia de la Filosofía sigue ausente de PRIVATE_BETA_SUBJECTS/
-- ALLOWED_GENERATE_SUBJECTS — no se activa nada en producción con esta migración.

DELETE FROM curriculum_topics WHERE id = '04492126-0205-4d38-9653-b1d052a6370d'::uuid;

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('9a8390fc-5671-40fb-91c6-cc3caa79e575'::uuid, 'historia_filosofia', 'autores', 'Autores', 'descartes', 'Descartes', 1),
  ('b9292860-3c3a-494c-a362-462f9c82959b'::uuid, 'historia_filosofia', 'autores', 'Autores', 'tomas-de-aquino', 'Tomás de Aquino', 2),
  ('c612c3ad-447a-4500-9a0e-0d77f7e4694c'::uuid, 'historia_filosofia', 'autores', 'Autores', 'platon', 'Platón', 3),
  ('e7b6c9a8-5eae-4383-ae6a-f39d7d0a66ce'::uuid, 'historia_filosofia', 'autores', 'Autores', 'kant', 'Kant', 4),
  ('7d8503da-da5b-4803-9b62-1a03f9e1415b'::uuid, 'historia_filosofia', 'autores', 'Autores', 'rousseau', 'Rousseau', 5),
  ('58226462-4d35-4044-b008-85b00cdb93d3'::uuid, 'historia_filosofia', 'autores', 'Autores', 'hume', 'Hume', 6),
  ('2ba8433d-dfad-4afb-9dcb-1f1ac1539a5b'::uuid, 'historia_filosofia', 'autores', 'Autores', 'habermas', 'Habermas', 7),
  ('336dee00-0f31-4472-9de9-913323041085'::uuid, 'historia_filosofia', 'autores', 'Autores', 'ortega-y-gasset', 'Ortega y Gasset', 8),
  ('94c95b5b-9ab5-44ab-bf91-0dae0249776a'::uuid, 'historia_filosofia', 'autores', 'Autores', 'marx', 'Marx', 9),
  ('063406fc-042b-4d02-bb0d-bb929e633878'::uuid, 'historia_filosofia', 'autores', 'Autores', 'nietzsche', 'Nietzsche', 10),
  ('09531eee-fd59-49d8-bfbb-660e6f658c57'::uuid, 'historia_filosofia', 'autores', 'Autores', 'aristoteles', 'Aristóteles', 11),
  ('b5ac4e42-67ed-4fe9-9433-342640bd6e30'::uuid, 'historia_filosofia', 'autores', 'Autores', 'agustin-de-hipona', 'Agustín de Hipona', 12),
  ('1ea54724-1faa-4134-a725-6f20257d8cf1'::uuid, 'historia_filosofia', 'autores', 'Autores', 'hannah-arendt', 'Hannah Arendt', 13),
  ('7f438d55-027e-4cae-b92a-875054ca8b83'::uuid, 'historia_filosofia', 'problemas-transversales', 'Problemas Transversales', 'etica-y-moral', 'Ética y/o Moral', 14),
  ('53c8543d-190f-403e-875f-6ff7c9094690'::uuid, 'historia_filosofia', 'problemas-transversales', 'Problemas Transversales', 'sociedad-y-politica', 'Sociedad y/o Política', 15),
  ('dbf9c3b3-a98a-49ff-b4eb-c90feb5ef3c8'::uuid, 'historia_filosofia', 'problemas-transversales', 'Problemas Transversales', 'ser-humano', 'Ser Humano', 16),
  ('f594a46d-fb21-4c60-a9cd-584ac906d75c'::uuid, 'historia_filosofia', 'problemas-transversales', 'Problemas Transversales', 'dios', 'Dios', 17),
  ('07633129-cbf0-48cf-9bae-7663e5dfa24b'::uuid, 'historia_filosofia', 'problemas-transversales', 'Problemas Transversales', 'conocimiento-y-realidad', 'Conocimiento y/o Realidad', 18);
