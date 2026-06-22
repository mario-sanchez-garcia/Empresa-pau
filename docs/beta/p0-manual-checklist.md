# P0 manual checklist beta

Este checklist cubre verificaciones que no se pueden confirmar solo desde el repo. No pegues secretos reales en commits, issues ni logs.

## Supabase RLS

Ejecutar en SQL editor de Supabase producción y revisar que las tablas de usuario tienen RLS activo:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';
```

Revisar políticas reales:

```sql
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public';
```

Revisar buckets:

```sql
select id, name, public
from storage.buckets;
```

Confirmar especialmente:

- `historial_examenes`, `historial_simulacros`, `flashcards`, `canvases`, `canvas_images`, `camino_*` y billing no exponen datos entre usuarios.
- `billing_events` no permite escritura directa desde cliente.
- `curriculum_flashcards` solo permite lectura autenticada.
- Las migraciones nuevas (`signup_attempts`) están aplicadas.

## Variables de entorno

Comprobar en Vercel:

- `SUPABASE_SERVICE_ROLE_KEY` existe solo como variable server-side.
- No tiene prefijo `NEXT_PUBLIC_`.
- No se imprime en logs.
- No aparece en bundles cliente.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son las únicas variables Supabase públicas esperadas.

## Secret scan

Ejecutar antes de beta pública:

```bash
gitleaks detect --source .
trufflehog git file://. --only-verified
```

Si no están instalados:

```bash
winget install Gitleaks.Gitleaks
```

Para TruffleHog, seguir la guía oficial del proyecto y ejecutar contra el historial completo. Si aparece una clave real, rotarla antes de continuar.

## Stripe

Checklist mínimo en test mode:

- Crear checkout desde plan visible.
- Completar pago test.
- Confirmar que el webhook marca entitlement activo.
- Confirmar que la success page no desbloquea acceso sin webhook.
- Confirmar customer portal.
- Cancelar suscripción o entitlement y verificar pérdida de acceso.
- Verificar logs de webhook con firma válida.

No activar venta pública hasta completar este flujo.

## CORS y CSP

- Revisar preflights de APIs, no solo `/`.
- Confirmar que `Access-Control-Allow-Origin: *` no se aplica a endpoints privados con credenciales.
- Mantener CSP en `Report-Only` hasta corregir reportes reales.

## Simulacros

P1 recomendado:

- Registrar eventos `simulacro_started`, `simulacro_abandoned`, `simulacro_completed`.
- Medir coste total por simulacro, no solo por bloque.
- Hacer QA manual de 10 simulacros completos antes de venta pública.
