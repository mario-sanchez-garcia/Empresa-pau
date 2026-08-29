-- curriculum_content_v2 tiene RLS activado, pero su única política de
-- lectura ("autenticados pueden leer", USING (true)) deja pasar CUALQUIER
-- fila a CUALQUIER usuario autenticado — incluidas las filas en borrador
-- (review_status='draft', p.ej. las 39 lecciones sin revisar de Matemáticas
-- CCSS insertadas en 20260829120000). Un alumno real podía leerlas
-- directamente desde el navegador con el cliente Supabase (anon key + su
-- propio JWT), sin pasar por ningún filtro de la aplicación — el filtro
-- review_status='published' añadido en generateCaminoPlan.ts/add-subject
-- route.ts en 20260829120000 protege la app, pero no protegía la tabla en
-- sí frente a una consulta directa.
--
-- Se restringe la política existente para que 'authenticated' solo vea
-- filas 'published' — todas las filas de todas las asignaturas ya
-- publicadas (default de la columna) siguen siendo visibles exactamente
-- igual que antes, así que no cambia nada del comportamiento real de
-- Camino para ningún alumno. El acceso a borradores para revisión interna
-- (admin/camino-preview) pasa a hacerse por una ruta de API con
-- service-role (bypassa RLS igual que ya hacen otras rutas /api/admin/*),
-- nunca desde el cliente.

ALTER POLICY "autenticados pueden leer"
  ON curriculum_content_v2
  USING (review_status = 'published');
