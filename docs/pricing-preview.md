# Pricing Preview

Kairo incluye una primera pagina de pricing en `/pricing` para validar interes en Premium antes de activar pagos reales.

## Que se ha creado

- Pagina publica `/pricing`.
- Enlace discreto "Ver planes" desde la landing.
- Tres planes visibles:
  - Free beta.
  - Premium previsto.
  - Pack PAU.
- Botones de interes que muestran un estado local de confirmacion.

## Pagos reales

No hay pagos activos todavia.

Esta version no incluye:

- Stripe.
- Checkout.
- Suscripciones.
- Pagos unicos reales.
- Webhooks.
- Entitlements.
- Cambios de limites por plan.

## Precios propuestos

- Premium previsto: `7,99 €/mes`.
- Pack PAU: `19,99 €`, pago unico para 3 meses, pensado para mayo-julio.

## Para que sirve

La pagina sirve para medir interes durante la beta y presentar una propuesta clara sin prometer que Premium ya esta activo.

Los CTAs no cobran dinero ni crean una compra. Solo muestran una confirmacion visual:

> Gracias. Te avisaremos cuando el acceso Premium este disponible.

## Evolucion recomendada

Cuando se quiera monetizar de verdad, los siguientes pasos serian:

1. Crear una tabla de waitlist/leads o eventos de interes.
2. Conectar Stripe Checkout.
3. Crear tabla `user_entitlements` o equivalente.
4. Asociar limites IA a cada plan.
5. Crear un panel admin para ver interes premium.
6. Anadir emails transaccionales para avisar a los usuarios apuntados.

## Limitaciones actuales

- El interes no se guarda en backend.
- No se puede comprar todavia.
- Los limites de Free/Premium son copy de producto, no reglas de plan activas.
- No hay medicion cuantitativa real hasta que exista un backend de leads o analitica.
