-- Continuación de la unificación de temas de Lengua (ver
-- 20260827120000_backfill_lengua_topic_ids_and_merge_orphans.sql).
--
-- 1) 3 topic_slug nuevos de nivel "técnica" para el bloque Comunicación
-- (comentario de texto / resumen / texto argumentativo), decisión del
-- usuario tras confirmar que las 15 lecciones actuales del bloque no tenían
-- ninguna entidad que representara la técnica en sí. Reparto revisado:
--   - comentario de texto: 11 lecciones (todo lo que analiza el texto fuente:
--     tipologías, funciones del lenguaje, modalización, coherencia,
--     cohesión, marcadores, adecuación, figuras retóricas, método completo).
--   - resumen: 1 lección.
--   - texto argumentativo: 2 lecciones (estructura + tipos de argumentos).
--   - "El Examen de Lengua en la PAU: Estructura y Reparto de Puntos"
--     (cv2 id 368) queda SIN vincular a ninguna técnica a propósito: es la
--     lección introductoria/meta sobre el examen completo, no sobre una
--     técnica concreta.
--
-- 2) Catálogo de obras de lectura obligatoria (lengua_obras_lectura).
-- Investigado: NO existe una lista única oficial para la Comunidad de
-- Madrid — cada centro elige su propia obra por periodo (confirmado
-- contrastando el examen, que siempre pregunta de forma genérica "la obra
-- que haya leído, posterior a 1975..." sin nombrar título, con un documento
-- real de un instituto de Madrid que lista su propia elección). Por eso esto
-- es un catálogo de referencia (obras reales, bien conocidas, con periodo
-- verificado), no "la" lista oficial — el alumno puede declarar un título
-- fuera de esta lista libremente desde la UI. Cataluña sí tiene una lista
-- oficial fija, pero es de la modalidad optativa "Literatura Castellana",
-- no de la asignatura común que cubre app/data/lengua_cataluna.ts (que,
-- comprobado, dejó de tener preguntas de obra leída desde la convocatoria
-- 2025). Columna `comunidad` queda NULL/genérica por ahora.
--
-- 3) perfiles.lengua_obras_leidas: mismo patrón jsonb incremental que
-- subjects/subject_levels/student_exams.

INSERT INTO curriculum_topics (subject, comunidad, block_key, block_title, topic_slug, title, "order")
VALUES
  ('lengua', NULL, 'comunicacion-tecnicas', 'Técnicas de Comunicación', 'comentario-de-texto', 'Comentario de Texto', 1),
  ('lengua', NULL, 'comunicacion-tecnicas', 'Técnicas de Comunicación', 'resumen', 'Resumen', 2),
  ('lengua', NULL, 'comunicacion-tecnicas', 'Técnicas de Comunicación', 'texto-argumentativo', 'Texto Argumentativo', 3)
ON CONFLICT (subject, topic_slug) DO NOTHING;

INSERT INTO topic_theory_coverage (topic_id, covered_by_content_v2_id)
SELECT ct.id, v.cv2_id
FROM curriculum_topics ct
JOIN (VALUES
  ('comentario-de-texto', 369),
  ('comentario-de-texto', 371),
  ('comentario-de-texto', 372),
  ('comentario-de-texto', 373),
  ('comentario-de-texto', 374),
  ('comentario-de-texto', 375),
  ('comentario-de-texto', 376),
  ('comentario-de-texto', 377),
  ('comentario-de-texto', 378),
  ('comentario-de-texto', 379),
  ('comentario-de-texto', 380),
  ('resumen', 370),
  ('texto-argumentativo', 381),
  ('texto-argumentativo', 382)
) AS v(topic_slug, cv2_id) ON v.topic_slug = ct.topic_slug
WHERE ct.subject = 'lengua'
ON CONFLICT (topic_id, covered_by_content_v2_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.lengua_obras_lectura (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo               text        NOT NULL,
  autor                text        NOT NULL,
  anio_publicacion     integer,
  genero               text        CHECK (genero IN ('novela', 'teatro', 'poesia')),
  periodo              text        NOT NULL CHECK (periodo IN ('anterior_1936', '1937_1974', 'posterior_1975')),
  movimiento_literario text,
  related_topic_slug   text,
  comunidad            text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (titulo, autor)
);

ALTER TABLE public.lengua_obras_lectura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lengua_obras_lectura: select for authenticated"
  ON public.lengua_obras_lectura FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.lengua_obras_lectura (titulo, autor, anio_publicacion, genero, periodo, movimiento_literario, related_topic_slug) VALUES
  ('Niebla', 'Miguel de Unamuno', 1914, 'novela', 'anterior_1936', 'Generación del 98', 'la-novela-anterior-a-1936-unamuno-baroja-y-azorin'),
  ('El árbol de la ciencia', 'Pío Baroja', 1911, 'novela', 'anterior_1936', 'Generación del 98', 'la-novela-anterior-a-1936-unamuno-baroja-y-azorin'),
  ('San Manuel Bueno, mártir', 'Miguel de Unamuno', 1930, 'novela', 'anterior_1936', 'Generación del 98', 'la-novela-anterior-a-1936-unamuno-baroja-y-azorin'),
  ('Platero y yo', 'Juan Ramón Jiménez', 1914, 'poesia', 'anterior_1936', 'Modernismo', 'el-modernismo'),
  ('Luces de Bohemia', 'Ramón María del Valle-Inclán', 1920, 'teatro', 'anterior_1936', 'Generación del 98 / Esperpento', 'el-teatro-anterior-a-1939-valle-inclan-y-el-esperpento'),
  ('Bodas de sangre', 'Federico García Lorca', 1932, 'teatro', 'anterior_1936', 'Generación del 27', 'el-teatro-de-lorca'),
  ('La casa de Bernarda Alba', 'Federico García Lorca', 1936, 'teatro', 'anterior_1936', 'Generación del 27', 'el-teatro-de-lorca'),

  ('La familia de Pascual Duarte', 'Camilo José Cela', 1942, 'novela', '1937_1974', 'Tremendismo', 'la-novela-espanola-de-1939-a-1974'),
  ('Nada', 'Carmen Laforet', 1945, 'novela', '1937_1974', 'Novela de posguerra', 'la-novela-espanola-de-1939-a-1974'),
  ('La colmena', 'Camilo José Cela', 1951, 'novela', '1937_1974', 'Realismo social', 'la-novela-espanola-de-1939-a-1974'),
  ('El Jarama', 'Rafael Sánchez Ferlosio', 1955, 'novela', '1937_1974', 'Realismo social', 'la-novela-espanola-de-1939-a-1974'),
  ('Réquiem por un campesino español', 'Ramón J. Sender', 1953, 'novela', '1937_1974', 'Novela del exilio', 'la-novela-espanola-de-1939-a-1974'),
  ('Tiempo de silencio', 'Luis Martín-Santos', 1962, 'novela', '1937_1974', 'Novela experimental', 'la-novela-espanola-de-1939-a-1974'),
  ('Cinco horas con Mario', 'Miguel Delibes', 1966, 'novela', '1937_1974', 'Realismo crítico', 'la-novela-espanola-de-1939-a-1974'),
  ('Historia de una escalera', 'Antonio Buero Vallejo', 1949, 'teatro', '1937_1974', 'Teatro realista', 'el-teatro-de-1939-a-la-actualidad'),

  ('La verdad sobre el caso Savolta', 'Eduardo Mendoza', 1975, 'novela', 'posterior_1975', 'Novela posmoderna', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('Los santos inocentes', 'Miguel Delibes', 1981, 'novela', 'posterior_1975', 'Realismo social', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('Historias del Kronen', 'José Ángel Mañas', 1994, 'novela', 'posterior_1975', 'Generación X', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('Soldados de Salamina', 'Javier Cercas', 2001, 'novela', 'posterior_1975', 'Narrativa de la memoria histórica', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('La sombra del viento', 'Carlos Ruiz Zafón', 2001, 'novela', 'posterior_1975', 'Narrativa popular contemporánea', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('Los girasoles ciegos', 'Alberto Méndez', 2004, 'novela', 'posterior_1975', 'Narrativa de la memoria histórica', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('El cuarto de atrás', 'Carmen Martín Gaite', 1978, 'novela', 'posterior_1975', 'Narrativa de la Transición', 'la-novela-espanola-de-1975-a-la-actualidad'),
  ('Bajarse al moro', 'José Luis Alonso de Santos', 1985, 'teatro', 'posterior_1975', 'Teatro de la Transición', 'el-teatro-de-1939-a-la-actualidad'),
  ('¡Ay, Carmela!', 'José Sanchis Sinisterra', 1987, 'teatro', 'posterior_1975', 'Teatro contemporáneo', 'el-teatro-de-1939-a-la-actualidad')
ON CONFLICT (titulo, autor) DO NOTHING;

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS lengua_obras_leidas jsonb NOT NULL DEFAULT '[]';
