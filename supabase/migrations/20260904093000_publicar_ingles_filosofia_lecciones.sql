-- Publica las 29 lecciones (11 Inglés + 18 Historia de la Filosofía) auditadas y
-- corregidas en tareas previas. review_status pasa de 'draft' a 'published', lo que
-- las hace visibles bajo RLS para 'authenticated' (política "autenticados pueden
-- leer", restringida a review_status='published' desde 20260829150000).

UPDATE curriculum_content_v2 SET review_status = 'published' WHERE subject IN ('ingles', 'historia_filosofia');
