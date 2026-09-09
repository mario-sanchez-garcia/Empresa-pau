-- Las notas de Correcciones deben proceder del backend que emite el grant
-- firmado, no de un INSERT/UPDATE directo del navegador. Las lecturas y el
-- borrado del propio historial mantienen sus políticas RLS; la escritura se
-- hace desde /api/exam/history con service_role tras validar usuario, UUID,
-- nota, máximo y grant.
drop policy if exists "Users can create own exam history" on public.historial_examenes;
drop policy if exists "Users can update own exam history" on public.historial_examenes;
