-- Amplía user_entitlements.source para las dos concesiones automáticas,
-- sin Stripe, que reemplazan el plan Free público (ver app/lib/pricing.ts
-- PUBLIC_PLAN_IDS y app/lib/billing/autoTrialAccess.ts):
--   - auto_promo_beta: Premium gratis para cualquiera que se registre hasta
--     PREMIUM_FREE_BETA_DEADLINE_DATE (12 de octubre de 2026 inclusive).
--   - auto_trial: prueba de 7 días de Premium para registros posteriores a
--     esa fecha, concedida una única vez por alumno.
-- Mismo patrón que 'manual_admin' (concesión directa en user_entitlements,
-- sin checkout_session_id ni customer_id de Stripe).
alter table public.user_entitlements
  drop constraint if exists user_entitlements_source_check;

alter table public.user_entitlements
  add constraint user_entitlements_source_check
  check (source in (
    'stripe_parent_checkout',
    'manual_admin',
    'stripe_self_checkout',
    'auto_promo_beta',
    'auto_trial'
  ));
