-- Piloto de "ayudas interactivas": glosario de símbolos/fórmulas por tema,
-- para el sistema de tooltip/panel que muestra el significado de un símbolo
-- (ej. "E_m" -> "Energía mecánica") al tocarlo/pasar el ratón sobre él
-- dentro de una fórmula. Ligado a topic_id (no a subject/símbolo global)
-- porque el mismo símbolo significa cosas distintas según el bloque — "E"
-- es campo eléctrico en Electricidad, energía total en Relatividad y
-- energía del fotón en Física Cuántica (ver investigación previa).
--
-- unique(topic_id, symbol), NO unique(symbol) solo: el mismo símbolo puede
-- repetirse en varios topic_id con significados distintos a propósito.

CREATE TABLE IF NOT EXISTS formula_glossary (
  id bigserial PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES curriculum_topics(id),
  symbol text NOT NULL,
  label text NOT NULL,
  definition text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, symbol)
);

CREATE INDEX IF NOT EXISTS formula_glossary_topic_id_idx ON formula_glossary (topic_id);

ALTER TABLE formula_glossary ENABLE ROW LEVEL SECURITY;

-- Mismo patrón que curriculum_topics (20260825120000): solo lectura para
-- authenticated, sin escritura desde el cliente (se puebla con
-- service-role, igual que curriculum_content_v2).
CREATE POLICY "formula_glossary: select for authenticated"
  ON formula_glossary FOR SELECT
  TO authenticated
  USING (true);
