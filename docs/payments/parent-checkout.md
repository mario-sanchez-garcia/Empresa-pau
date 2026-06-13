# Parent Checkout — Magic Link para padres

## Qué hace este MVP

Un alumno autenticado genera un enlace seguro desde `/camino`. El enlace lleva al padre a una página pública de Pausia donde puede pagar el Pack Curso PAU con tarjeta a través de Stripe. Cuando Stripe confirma el pago mediante webhook, se activa un `user_entitlement` para el alumno.

**El padre no necesita tener cuenta en Pausia.**

---

## Flujo

```
Alumno logueado en /camino
  → POST /api/checkout/parent-link   (autenticado)
  → Genera raw token (crypto.randomBytes), guarda solo SHA-256 hash
  → Devuelve URL: /parent-checkout/<rawToken>
  → Alumno comparte via Web Share API o copia el enlace

Padre abre /parent-checkout/<rawToken>
  → Server resuelve token: hashToken(rawToken) → busca en parent_checkout_links
  → Si token inválido/expirado/cancelado → página de error segura
  → Si paid → "Pack ya activado"
  → Si válido → ParentCheckoutClient (interfaz de pago)

Padre pulsa "Desbloquear Pack Curso PAU"
  → POST /api/checkout/parent-session  (pública, token en body)
  → Crea Stripe Checkout Session
  → Redirige a checkout.stripe.com

Padre completa pago en Stripe

Stripe llama POST /api/stripe/webhook
  → Verifica firma con STRIPE_WEBHOOK_SECRET
  → checkout.session.completed
  → Lee metadata: student_user_id, parent_checkout_link_id, plan_id
  → Crea user_entitlements (status=active)
  → Actualiza parent_checkout_links (status=paid)
  → Inserta billing_events

Alumno vuelve a /camino
  → GET /api/billing/me
  → hasActivePack: true
  → UI muestra "Pack Curso PAU activo"
```

---

## Tablas

### `parent_checkout_links`
| Campo | Tipo | Notas |
|---|---|---|
| `token_hash` | text UNIQUE | SHA-256 del rawToken. Nunca se guarda el raw. |
| `student_user_id` | uuid → auth.users | El alumno que generó el link |
| `status` | text | `created`, `opened`, `checkout_started`, `paid`, `expired`, `cancelled`, `failed` |
| `expires_at` | timestamptz | 7 días desde creación |
| `stripe_checkout_session_id` | text | Se rellena al crear la Stripe Session |
| `paid_at` | timestamptz | Se rellena en el webhook |

### `user_entitlements`
| Campo | Tipo | Notas |
|---|---|---|
| `user_id` | uuid → auth.users | El alumno |
| `plan_id` | text | `pack_curso_pau` |
| `source` | text | `stripe_parent_checkout` |
| `status` | text | `active`, `expired`, `refunded`, `cancelled` |
| `stripe_checkout_session_id` | text UNIQUE | Idempotencia: no duplicar por mismo session |

### `billing_events` (append-only)
Log de auditoría. Eventos: `parent_link_created`, `checkout_session_created`, `checkout_completed`, `checkout_expired`.

---

## Variables de entorno

Añadir en Vercel (Production y Preview):

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...        # o sk_test_... para pruebas
STRIPE_WEBHOOK_SECRET=whsec_...      # Stripe Dashboard → Webhooks → Signing secret

# App URL (para success_url y cancel_url de Stripe)
NEXT_PUBLIC_APP_URL=https://pausia.es

# Opcional: fecha límite del precio fundador (default: 2026-09-01)
FOUNDING_DEADLINE_DATE=2026-09-01
```

**`SUPABASE_SERVICE_ROLE_KEY`** ya debe existir (se usa en el webhook y en los helpers de billing).

---

## Configuración de Stripe

### Webhook endpoint
En Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://pausia.es/api/stripe/webhook`
- Eventos a escuchar:
  - `checkout.session.completed`
  - `checkout.session.expired`

### Modo test vs producción
- En desarrollo: usar `STRIPE_SECRET_KEY=sk_test_...` y Stripe CLI para simular webhooks
- En producción: usar `sk_live_...` y el webhook real

---

## Precios

Fuente única en `app/lib/billing/plans.ts`:

| Plan | Precio fundador | Precio estándar |
|---|---|---|
| `pack_curso_pau` | 49,00 € | 79,00 € |

El precio fundador aplica hasta la fecha en `FOUNDING_DEADLINE_DATE` (default: 2026-09-01).

**El cliente nunca decide el precio.** `parent-session` route lee el precio del servidor via `getLivePriceCents()`.

---

## Seguridad

- El raw token **nunca** se guarda en base de datos. Solo se guarda el SHA-256.
- El raw token viaja en la URL y en el body de `parent-session`, nunca en cookies o headers de autenticación.
- El webhook verifica la firma de Stripe antes de procesar cualquier evento.
- El acceso premium **solo** se activa en el webhook. La success page es decorativa.
- No hay query params ni headers que activen acceso.
- La página pública no muestra el email del alumno, notas, ni datos sensibles.
- RLS: `parent_checkout_links` — el alumno solo ve sus propios links. Writes críticos (status, paid_at) solo desde server con service role.
- `user_entitlements` — el alumno solo puede leer sus propios entitlements. No hay policy de INSERT/UPDATE desde cliente.
- `billing_events` — no hay RLS de lectura de cliente. Solo admin/server.

---

## Cómo probar (modo test)

1. Configura `STRIPE_SECRET_KEY=sk_test_...` y `STRIPE_WEBHOOK_SECRET=whsec_...` en `.env.local`
2. Configura `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. Aplica la migración: `supabase db push` o en Supabase Dashboard → SQL Editor
4. Inicia el servidor: `npm run dev`
5. En otra terminal, reenvía webhooks con Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
6. Loguéate en `/camino`, haz click en "Enviar a mis padres"
7. Copia el URL generado, ábrelo en incógnito
8. Verifica que sin token inválido muestra error seguro (prueba con `/parent-checkout/tokenbasura`)
9. Pulsa "Desbloquear Pack Curso PAU" → redirige a Stripe
10. Usa tarjeta de test `4242 4242 4242 4242` con cualquier fecha futura y CVC
11. Verifica que el webhook recibe `checkout.session.completed`
12. Verifica que `user_entitlements` tiene una fila con `status=active`
13. Verifica que `/camino` muestra "Pack Curso PAU activo"

---

## Qué NO hace el MVP

- No crea cuenta para el padre
- No envía email de confirmación automático (Stripe sí lo hace si está configurado)
- No soporta suscripciones mensuales
- No soporta reembolsos desde la UI (manual vía Stripe Dashboard o con `manual_admin` source)
- No soporta descuentos o cupones
- No hay checkout propio del alumno (solo vía parents)
- La success page no verifica en tiempo real el estado del entitlement (sin polling)
- No hay Supabase Realtime en `/camino` para activación instantánea (usa `GET /api/billing/me` al cargar)

---

## Pendientes para siguientes iteraciones

- [ ] Supabase Realtime en `/camino` para activación instantánea post-pago
- [ ] Email de confirmación personalizado para alumno y padre
- [ ] Self-checkout del alumno
- [ ] Gestión de reembolsos desde admin
- [ ] Renovaciones / extensión de entitlement
- [ ] Cupones / precios especiales
- [ ] Stripe Customer Portal para el padre
