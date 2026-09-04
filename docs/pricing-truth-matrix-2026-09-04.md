# Matriz de verdad comercial - 4 de septiembre de 2026

Esta auditoría contrasta el PDF interno `Pausia_pricing_definitivo_v4.pdf` (junio de 2026) con el HEAD `b5001fb0d5489bc34479596b2c92d07c7927a1e1`. El PDF es contexto de negocio, no una especificación vigente.

## Decisión ejecutiva

- Planes públicos: Free, Premium y Curso PAU.
- Plan principal: Premium.
- Curso PAU Early y Normal no son productos distintos. Son dos precios temporales del mismo `pack_curso_pau`; desde el 1 de septiembre el precio general es 79 EUR. Las reservas de waitlist mantienen su precio bloqueado.
- Intensivo y Superpremium siguen reconocidos por el normalizador de entitlements y conservan límites para compatibilidad, pero no tienen checkout ni definición de facturación activa. No se ofrecen públicamente.
- Orientación y Ranking no tienen un paywall verificable en el producto actual. Se muestran como incluidos en todos los planes públicos.
- El backend continúa siendo la autoridad de enforcement; la configuración comercial comparte exactamente los mismos límites tipados.

## Matriz

| Plan | PDF junio | Configuración anterior | Backend real | Stripe / checkout | Decisión final |
| --- | --- | --- | --- | --- | --- |
| Free | 0 EUR; 25 correcciones; 3 fotos; 1 parcial; Camino limitado; Ranking preview | Límites iguales; aparecía en landing y `/pricing` | Enforcement: 25 correcciones, 3 fotos, 1 parcial, 0 simulacros completos, 2 días de Camino/semana, 15 tarjetas/mazo | No requiere checkout | Público. Orientación y Ranking completos porque no existe gate actual |
| Premium | 9,99 EUR/mes; 200 correcciones; 80 fotos; 5 simulacros; Camino y Ranking completos | Público; checkout `premium` | Enforcement: 200 correcciones, 80 fotos, 12 parciales, 5 simulacros, 6 días de Camino/semana, 40 tarjetas/mazo | Checkout mensual recurrente mediante `price_data`; webhook renueva entitlement | Público y recomendado |
| Curso PAU Early | 59 EUR | Mismo plan `pack_curso_pau`; precio hasta `FOUNDING_DEADLINE_DATE`; reservas pueden conservar 59/49/39 EUR | Entitlement normalizado a `curso_pau`, mismos límites que Premium | Checkout de pago único; precio resuelto al iniciar checkout | No se publica como plan independiente. Solo se respeta como precio bloqueado legacy |
| Curso PAU Normal | 79 EUR | Precio general posterior al deadline del mismo `pack_curso_pau` | Mismos límites que Premium; acceso hasta el 30 de junio | Checkout de pago único mediante `price_data` | Público como `Curso PAU`, actualmente 79 EUR |
| Intensivo | 19,99 EUR por 3 meses; 150 correcciones; 60 fotos; 6 simulacros | Límites definidos, pero no aparecía públicamente ni en billing | El normalizador acepta entitlements `intensivo`; enforcement existe | Sin plan de billing, sin allowlist de checkout y sin flujo de compra | Oculto. Mantener compatibilidad; no inventar compra |
| Superpremium | 17,99 EUR/mes; 600 correcciones; 200 fotos; 20 simulacros | Límites definidos; usado por una cortesía beta ya expirada | El normalizador acepta entitlements `superpremium`; enforcement existe | Sin plan de billing, sin allowlist de checkout y sin flujo de compra | Oculto. Mantener compatibilidad; no venderlo como ilimitado |

## Condiciones verificables

- Premium se renueva mensualmente en Stripe y puede gestionarse desde el portal de facturación; al cancelar conserva acceso hasta el final del periodo pagado.
- Curso PAU es un pago único y su entitlement vence el 30 de junio; no tiene renovación mensual.
- Los límites se cuentan por mes natural y se reinician al comenzar el siguiente mes.
- Los precios públicos ya se comunican con IVA incluido.
- La garantía comercial de 7 días y el desistimiento están documentados en las páginas legales existentes; pricing enlaza a ellas sin crear condiciones nuevas.
- Stripe crea precios inline en cada Checkout Session. No hay un `stripePriceId` persistente que deba inventarse.

## Limitaciones de la auditoría

La clave Stripe local es un placeholder, por lo que no se pudieron listar objetos del dashboard real. La coherencia del flujo se valida contra el código, el webhook y los smoke tests sin efectuar cargos. Antes de producción debe confirmarse que `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, el portal y los webhooks están configurados en el entorno de despliegue.
