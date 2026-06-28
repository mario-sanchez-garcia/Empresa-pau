# Stripe test mode - Checklist P0

Objetivo: verificar que los pagos de prueba activan acceso solo desde webhook firmado, no desde la pagina de success.

## Variables necesarias

- `STRIPE_SECRET_KEY`: clave test `sk_test_...`.
- `STRIPE_WEBHOOK_SECRET`: secreto del endpoint test `whsec_...`.
- `NEXT_PUBLIC_APP_URL`: URL local o preview.
- `NEXT_PUBLIC_SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- IDs/precios Stripe asociados al plan activo si se configuran fuera de `app/lib/billing/plans.ts`.

## Tarjeta test

- Pago correcto: `4242 4242 4242 4242`.
- Fecha: cualquier futura.
- CVC: cualquier 3 digitos.
- ZIP: cualquier valor valido.

## Webhook local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el `whsec_...` emitido por Stripe CLI en `STRIPE_WEBHOOK_SECRET` y reinicia el servidor local.

## Flujo Premium / Curso PAU / Intensivo / Superpremium

1. Confirmar que el plan existe en el mapa de planes o que el checkout envia `metadata.plan_id`.
2. Crear link parental o checkout desde la app.
3. Pagar en modo test con `4242 4242 4242 4242`.
4. Verificar en logs que llega `checkout.session.completed`.
5. Verificar que `user_entitlements` contiene una fila `active` para el alumno y el `plan_id` correcto.
6. Verificar que `parent_checkout_links.status` pasa a `paid` si aplica.
7. Verificar que `billing_events` registra `checkout_completed`.

Nota actual: el mapa de planes productivo expone `pack_curso_pau`. Si se habilitan Premium, Intensivo o Superpremium como SKUs separados, deben entrar en `PLANS` antes de QA completa.

## Success page no activa acceso

1. Visitar manualmente `/parent-checkout/success`.
2. Confirmar que no aparece ninguna nueva fila en `user_entitlements`.
3. Confirmar que la pagina informa de que la activacion depende del webhook.

## Pago fallido o expirado

1. Abrir un checkout y dejarlo expirar o cancelarlo.
2. Confirmar que no se crea entitlement activo.
3. Confirmar que `parent_checkout_links` queda `expired` o conserva estado no pagado.

## Smoke estatico

```bash
npm run smoke:stripe:p0
```

Debe comprobar:

- endpoint `app/api/stripe/webhook/route.ts`;
- verificacion de firma con raw body;
- creacion de entitlement desde webhook;
- idempotencia por `stripe_checkout_session_id`;
- success page pasiva;
- mapa de planes;
- migracion de tablas de billing.
