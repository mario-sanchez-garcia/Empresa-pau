# Vercel · Environment Variables Checklist

> No incluir valores reales aquí. Solo nombres y descripción.  
> Configurar en: Vercel Dashboard → Project → Settings → Environment Variables  
> Última verificación: 14 junio 2026 (rehearsal final)

---

## Variables requeridas para beta privada

### Supabase

| Variable | Tipo | Dónde se usa | Beta: requerida | Riesgo si falta |
|----------|------|-------------|-----------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Cliente + server | ✅ SÍ | App no arranca. Auth rota. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Cliente + server | ✅ SÍ | App no arranca. Auth rota. |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRETA** | Solo server (webhook, camino server, admin, billing) | ✅ SÍ | Webhook Stripe falla. Camino no sincroniza. Admin no carga. |

> ⚠️ **CRÍTICO**: el nombre correcto es `SUPABASE_SERVICE_ROLE_KEY` (no `SUPABASE_SERVICE_KEY`). Un error aquí rompe el webhook de Stripe silenciosamente.

---

### Stripe

| Variable | Tipo | Dónde se usa | Beta: requerida | Riesgo si falta |
|----------|------|-------------|-----------------|-----------------|
| `STRIPE_SECRET_KEY` | **SECRETA** | `/api/checkout/parent-session`, `/api/checkout/parent-link` | ✅ SÍ | Checkout falla al crear sesión Stripe. |
| `STRIPE_WEBHOOK_SECRET` | **SECRETA** | `/api/stripe/webhook` | ✅ SÍ | Webhook rechaza todos los eventos (400). Entitlements no se activan. |

> Para beta: usar claves de **test mode** (`sk_test_...`, `whsec_...` del test endpoint en Stripe Dashboard).  
> Para producción: usar claves **live** — NO hacer esto hasta tener legal completo y webhook verificado.

---

### IA (Anthropic)

| Variable | Tipo | Dónde se usa | Beta: requerida | Riesgo si falta |
|----------|------|-------------|-----------------|-----------------|
| `ANTHROPIC_API_KEY` | **SECRETA** | `/api/simulacro`, `/api/chat`, `/api/planning` | ✅ SÍ | Simulacros, chat y planning dan error 500. |

---

### App

| Variable | Tipo | Dónde se usa | Beta: requerida | Riesgo si falta |
|----------|------|-------------|-----------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | Pública | Generación de URLs en checkout | ✅ SÍ | URLs de retorno en Stripe apuntan a localhost. Checkout roto en producción. |
| `INTERNAL_USER_EMAILS` | Secreta | `/api/admin/me`, `/api/admin/metrics` | Recomendada | `/admin` accesible pero sin datos (muestra "no autorizado"). |
| `FOUNDING_DEADLINE_DATE` | Pública | `app/lib/billing/plans.ts` | Opcional | Sin ella, precio fundador activo hasta 2026-09-01 (por defecto). |

---

## Cómo verificar

```bash
# En local, verificar que .env.local tiene todas las variables:
grep -E "SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|ANTHROPIC_API_KEY|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_SUPABASE" .env.local

# Desde el código, verificar todos los process.env usados:
grep -rn "process\.env\." app --include="*.ts" --include="*.tsx" | grep -v ".next" | grep -v "data/"
```

---

## Configuración del webhook de Stripe

1. En [Stripe Dashboard (test)](https://dashboard.stripe.com/test/webhooks) → Add endpoint.
2. URL: `https://[TU_DOMINIO_VERCEL]/api/stripe/webhook`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Copiar el `Signing secret` → pegar como `STRIPE_WEBHOOK_SECRET` en Vercel.

> ⚠️ El signing secret del test endpoint es diferente al de producción. Usar el correcto según el entorno.

---

## Entornos en Vercel

- **Production** (rama `main`): variables de producción. En beta usar Stripe test + Supabase prod.
- **Preview** (ramas de PR): puede usar las mismas variables o tener un Supabase diferente.

Recomendación para beta: todas las variables configuradas solo en **Production** scope para evitar exposición en previews.

---

## Checklist antes del primer usuario real

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada en Vercel (Production).
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada en Vercel (Production).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada con el nombre correcto en Vercel (Production).
- [ ] `STRIPE_SECRET_KEY` (test mode) configurada en Vercel.
- [ ] `STRIPE_WEBHOOK_SECRET` del endpoint test configurado en Vercel.
- [ ] `ANTHROPIC_API_KEY` configurada en Vercel.
- [ ] `NEXT_PUBLIC_APP_URL` apunta al dominio de producción correcto (sin barra al final).
- [ ] `INTERNAL_USER_EMAILS` contiene tu email para acceder a `/admin`.
- [ ] Webhook de Stripe apunta a la URL de producción (no a localhost).
- [ ] Build en Vercel pasa sin errores después de configurar variables.
