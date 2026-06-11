# Panel interno /admin

Panel privado para control de la beta de Pausia. Solo accesible para usuarios en `INTERNAL_USER_EMAILS`.

## Ruta

`/admin`

## Protección de acceso

1. El cliente (`app/admin/page.tsx`) obtiene la sesión activa con `supabase.auth.getSession()`.
2. Si no hay sesión: muestra "Inicia sesión para acceder."
3. Si hay sesión: llama a `GET /api/admin/metrics` con `Authorization: Bearer <access_token>`.
4. La API route (`app/api/admin/metrics/route.ts`) valida el token con `authSupabase.auth.getUser(accessToken)` (server-side).
5. Si el usuario no está en `INTERNAL_USER_EMAILS` (`isInternalUser(email)`): devuelve 403 → el cliente muestra "No tienes acceso a esta página."
6. Si pasa la comprobación: llama a `fetchAdminMetrics()` y devuelve los datos.

La comprobación `isInternalUser` se hace **exclusivamente en el servidor**. El cliente nunca decide si alguien es admin. `SUPABASE_SERVICE_ROLE_KEY` nunca se expone al cliente.

## Métricas disponibles

### Resumen de hoy
- Llamadas IA hoy
- Tokens consumidos hoy
- Coste estimado hoy (€)
- Coste estimado últimos 7 días (€)
- Usuarios activos hoy / 7 días
- Correcciones completadas hoy
- Simulacros completados hoy
- Planes de estudio generados esta semana
- Errores de IA últimas 24h

### Estado beta
Indicadores rápidos: IA activa, tracking activo, errores 24h, coste hoy.

### Uso por ruta — últimos 7 días
Tabla: ruta, llamadas, tokens, coste estimado, errores.

### Top usuarios por tokens — últimos 30 días
Tabla: user_id (truncado a 8 chars), llamadas, tokens, coste estimado.

### Últimos 50 eventos IA
Tabla: fecha, ruta, acción, tokens, estado/error.

### Errores últimas 24h
Tabla: fecha, ruta, acción, código de error.

### Actividad de producto
- Correcciones recientes: fecha, asignatura, nota, nota máxima.
- Simulacros recientes: fecha, asignatura, estado, nota final.

## Tablas utilizadas

| Tabla | Uso |
|-------|-----|
| `ai_usage_events` | Todas las métricas de IA: llamadas, tokens, errores |
| `historial_examenes` | Correcciones recientes (tabla sin migración — lectura defensiva) |
| `historial_simulacros` | Simulacros recientes |

## Cálculo de coste

```typescript
// Approximate internal estimates. Update when provider pricing changes.
const APPROX_INPUT_EUR_PER_TOKEN  = 0.0000028   // ~$3/M input tokens
const APPROX_OUTPUT_EUR_PER_TOKEN = 0.000014     // ~$15/M output tokens
const APPROX_AVG_EUR_PER_TOKEN    = 0.000007     // fallback si solo hay total_tokens
```

Nota: `estimated_cost_eur` en `ai_usage_events` se inserta como `null` actualmente, por lo que el coste siempre se recalcula en el panel con las constantes anteriores.

## Datos faltantes

- Si la tabla no existe o falla una query: se devuelven arrays vacíos y contadores a 0.
- `historial_examenes` se envuelve en try/catch porque no tiene migración formal.
- Si `SUPABASE_SERVICE_ROLE_KEY` no está configurada, se usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback (las queries sujetas a RLS pueden devolver menos datos).

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `app/admin/page.tsx` | Componente cliente: gestiona auth y renderiza el dashboard |
| `app/api/admin/metrics/route.ts` | API route: verifica usuario interno y devuelve métricas |
| `app/lib/adminMetrics.ts` | Funciones server-only: queries a Supabase con service role |
| `docs/admin-panel.md` | Este documento |

## Qué NO hace este panel

- No modifica ningún dato.
- No expone enunciados, respuestas ni correcciones de usuarios.
- No toca `app/data/*`, `public/*`, pricing, prompts IA, ni modelos.
- No usa query params para autenticar (`?admin=true` no funciona).
- No instala dependencias nuevas.
