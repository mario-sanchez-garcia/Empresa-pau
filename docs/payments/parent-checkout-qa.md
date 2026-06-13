# Magic Parent Checkout — Notas de QA

**Fecha:** 2026-06-13  
**Entorno:** Stripe test mode + Vercel production

---

## Flujo probado

1. Alumno autenticado en `/camino` pulsa "Enviar a mis padres"
2. `POST /api/checkout/parent-link` genera el link con token seguro (SHA-256, raw no guardado)
3. URL copiada y abierta en navegador sin sesión activa
4. Página pública `/parent-checkout/[token]` carga correctamente: nombre del alumno, plan, precio, features, garantía
5. Padre pulsa "Desbloquear Pack Curso PAU"
6. `POST /api/checkout/parent-session` crea Stripe Checkout Session y redirige
7. Pago completado con tarjeta de test `4242 4242 4242 4242`
8. Stripe llama `POST /api/stripe/webhook` con `checkout.session.completed`
9. Webhook verifica firma, crea `user_entitlements` (status=active), actualiza `parent_checkout_links` (status=paid)
10. Alumno recarga `/camino` → badge "Pack Curso PAU activo" visible

**Resultado: ✅ OK**

---

## Tablas verificadas en Supabase

| Tabla | Verificación |
|---|---|
| `parent_checkout_links` | Fila con `status=paid`, `paid_at` y `stripe_checkout_session_id` rellenos |
| `user_entitlements` | Fila con `status=active`, `source=stripe_parent_checkout`, `stripe_checkout_session_id` único |
| `billing_events` | 3 eventos: `parent_link_created`, `checkout_session_created`, `checkout_completed` |

---

## Incidencias encontradas y resueltas

**1. Variables de entorno / service role requerían redeploy**
Las variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` y `SUPABASE_SERVICE_ROLE_KEY` debían estar configuradas en Vercel antes del primer deploy funcional. Un redeploy tras añadirlas fue suficiente.

**2. `expires_at` de Stripe no admite caducidad de 7 días**
`stripe.checkout.sessions.create({ expires_at })` rechaza valores superiores a 24 horas con error 500. El código pasaba `parent_checkout_links.expires_at` (7 días) directamente. Corregido usando `now + 30 minutos` como expiración de la sesión de Stripe. El parent link sigue siendo válido 7 días — si la sesión expira, el padre puede volver al mismo link y se crea una nueva sesión.

---

## Riesgos pendientes antes de producción live

- **Activar cuenta Stripe real** antes de cobros en producción. La cuenta de test no procesa pagos reales.
- **Configurar claves live** (`sk_live_...`, `whsec_...`) y registrar el webhook en el entorno de producción de Stripe. Las claves de test no funcionan con pagos reales.
- **Revisar copy** — "correcciones IA ilimitadas" en la página del padre debe revisarse antes de publicar con tráfico real para asegurar que refleja los límites reales del plan.
- **Admin billing más completo** — la sección de billing en `/admin` muestra métricas básicas y links recientes, pero no permite gestionar reembolsos ni cancelaciones desde la UI. Operaciones de reembolso requieren Stripe Dashboard o un endpoint admin dedicado.
- **Límites de uso razonable en periodo de garantía** — la garantía de 7 días no tiene lógica de comprobación de uso. Definir criterios de elegibilidad para reembolso antes de escalar.
