-- ============================================================
-- AUDITORÍA DE PRODUCCIÓN — Kairo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Ejecuta cada bloque por separado y guarda los resultados.
-- Todo es SOLO LECTURA. No modifica nada.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- BLOQUE 1 — ¿Existen las tablas que el código espera?
-- Cualquier fila con existe = false es una migración sin aplicar.
-- ────────────────────────────────────────────────────────────
with esperadas(tabla) as (
  values
    ('signup_attempts'),        -- rate limiting de registro (FALLA EN LOGS)
    ('perfiles'),
    ('ligas'),
    ('ligas_miembros'),
    ('ligas_rondas'),
    ('ligas_rondas_resultados'),
    ('billing_events'),         -- consentimiento RGPD + onboarding prefs
    ('camino_calendar'),
    ('camino_user_progress'),
    ('camino_subject_xp'),
    ('camino_xp_events'),
    ('camino_daily_missions'),
    ('camino_task_completions'),
    ('camino_route_settings'),
    ('user_entitlements'),      -- Stripe
    ('user_learning_queue'),
    ('curriculum_topics'),
    ('curriculum_flashcards'),
    ('historial_examenes'),
    ('historial_simulacros'),
    ('ai_usage_events'),
    ('email_events'),
    ('waitlist'),
    ('institutes'),
    ('user_institute_memberships'),
    ('parent_checkout_links'),
    ('canvases'),
    ('canvas_images'),
    ('flashcards'),
    ('mission_templates'),
    ('pace_signals'),
    ('school_topic_status'),
    ('school_topic_feedback')
)
select
  e.tabla,
  (t.tablename is not null) as existe
from esperadas e
left join pg_tables t
  on t.tablename = e.tabla and t.schemaname = 'public'
order by existe asc, e.tabla;


-- ────────────────────────────────────────────────────────────
-- BLOQUE 2 — ¿Qué tablas tienen RLS activado?
-- rls_activado = false en una tabla con datos de usuario es un
-- agujero: cualquiera con la anon key puede leerla entera.
-- ────────────────────────────────────────────────────────────
select
  tablename,
  rowsecurity as rls_activado,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename) as num_politicas
from pg_tables t
where schemaname = 'public'
order by rowsecurity asc, num_politicas asc, tablename;


-- ────────────────────────────────────────────────────────────
-- BLOQUE 3 — Políticas permisivas peligrosas
-- Busca políticas con USING (true): acceso abierto a todo el mundo.
-- Si aparecen ligas / ligas_miembros aquí, la migración
-- 20260731150000_harden_ligas_rls.sql NO está aplicada.
-- ────────────────────────────────────────────────────────────
select
  tablename,
  policyname,
  cmd as operacion,
  roles,
  qual as condicion_using
from pg_policies
where schemaname = 'public'
  and (qual = 'true' or qual is null)
order by tablename, policyname;


-- ────────────────────────────────────────────────────────────
-- BLOQUE 4 — Estado concreto de las tablas de ligas
-- Esperado tras aplicar 20260731150000: RLS activo y políticas
-- que referencian is_liga_member(), no USING (true).
-- ────────────────────────────────────────────────────────────
select
  tablename,
  policyname,
  cmd as operacion,
  qual as condicion_using
from pg_policies
where schemaname = 'public'
  and tablename in ('ligas', 'ligas_miembros', 'ligas_rondas', 'ligas_rondas_resultados')
order by tablename, policyname;


-- ────────────────────────────────────────────────────────────
-- BLOQUE 5 — ¿Existe la función is_liga_member?
-- Si devuelve 0 filas, la migración de RLS de ligas no se aplicó.
-- ────────────────────────────────────────────────────────────
select
  proname as funcion,
  prosecdef as es_security_definer
from pg_proc
where proname in ('is_liga_member', 'handle_new_user');


-- ────────────────────────────────────────────────────────────
-- BLOQUE 6 — Estado de perfiles (confirmaste rowsecurity=true)
-- Verifica que las políticas siguen ahí tras el cambio.
-- ────────────────────────────────────────────────────────────
select
  policyname,
  cmd as operacion,
  qual as condicion_using,
  with_check as condicion_insert
from pg_policies
where schemaname = 'public' and tablename = 'perfiles'
order by policyname;


-- ────────────────────────────────────────────────────────────
-- BLOQUE 7 — Columnas de signup_attempts (si existe)
-- El código usa: ip, email, created_at
-- ────────────────────────────────────────────────────────────
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'signup_attempts'
order by ordinal_position;
