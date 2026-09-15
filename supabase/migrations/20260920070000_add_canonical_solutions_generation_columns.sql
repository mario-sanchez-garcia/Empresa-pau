-- Pieza 2 (pipeline de generación) de canonical_solutions necesita:
--   1. Distinguir el hash de origen (enunciado + official_solution + rúbrica,
--      lo que invalida una fila si cambia) de forma explícita — la columna ya
--      existía como content_hash con exactamente ese propósito (ver comentario
--      original en 20260915120000_create_canonical_solutions.sql), solo con
--      otro nombre. Se renombra en vez de añadir una columna duplicada: la
--      tabla sigue vacía en producción (confirmado antes de escribir esta
--      migración), así que no hay filas que migrar ni código que dependa del
--      nombre viejo.
--   2. Trazar quién/cuándo generó cada fila con columnas propias, no dentro
--      del JSONB versionado (canonical_solution) — igual que reviewed_by ya
--      es columna propia y no vive dentro del JSON.
--   3. Un 'rejected' explícito en review_status: sin él, una solución que un
--      revisor humano descarta no se distingue de una que todavía no se ha
--      generado ('missing'), y el pipeline no tiene forma de saber que ya se
--      intentó y falló la revisión (para no volver a generarla en bucle).

BEGIN;

ALTER TABLE public.canonical_solutions
  RENAME COLUMN content_hash TO source_hash;

ALTER TABLE public.canonical_solutions
  ADD COLUMN IF NOT EXISTS generated_by text,
  ADD COLUMN IF NOT EXISTS generated_at timestamptz;

ALTER TABLE public.canonical_solutions
  DROP CONSTRAINT IF EXISTS canonical_solutions_review_status_check;

ALTER TABLE public.canonical_solutions
  ADD CONSTRAINT canonical_solutions_review_status_check
    CHECK (review_status IN ('missing', 'generated', 'reviewed', 'published', 'rejected'));

COMMIT;
