# Panel interno /admin

Panel privado para control de la beta de Pausia. Solo accesible para usuarios en `INTERNAL_USER_EMAILS`.

## Cómo acceder

- Ir directamente a `/admin`.
- O usar el enlace "Panel interno" del Sidebar (visible solo para usuarios internos).

## Protección de acceso

1. El cliente obtiene la sesión con `supabase.auth.getSession()`.
2. Sin sesión → "Inicia sesión para acceder."
3. Con sesión → llama a `GET /api/admin/metrics` con `Authorization: Bearer <access_token>`.
4. La API route valida con `authSupabase.auth.getUser(accessToken)` **en el servidor**.
5. Si el email no está en `INTERNAL_USER_EMAILS` (`isInternalUser(email)`) → 403 → "No tienes acceso."
6. Si pasa → `fetchAdminMetrics()` → datos.

La comprobación `isInternalUser` se hace **exclusivamente en el servidor**.
`SUPABASE_SERVICE_ROLE_KEY` nunca se expone al cliente.
El enlace del Sidebar usa `GET /api/admin/me` (devuelve `{ isAdmin: boolean }`, nunca emails ni secrets).

## Variables de entorno en Vercel

| Variable | Descripción |
|----------|-------------|
| `INTERNAL_USER_EMAILS` | Emails separados por coma. Ej: `yo@empresa.com,otro@empresa.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. Server-side only. Nunca `NEXT_PUBLIC_`. |

Después de cambiar variables de entorno en Vercel: **hacer redeploy manual**.

## Métricas y secciones

### Alertas de estado beta
Umbrales automáticos:
- Coste hoy < 5 € → OK "Coste IA bajo control"
- Coste hoy ≥ 5 € → Aviso amarillo
- Coste hoy ≥ 15 € → Aviso rojo urgente
- Errores IA > 0 (24h) → Aviso amarillo
- Top usuario > 50.000 tokens (30d) → Aviso
- Tasa finalización simulacros < 50% y >3 en progreso → Aviso

### Filtros de rango (tabs)
Selector visual: **Hoy / 7 días / 30 días**.
Todas las métricas de resumen se recalculan en el servidor para los tres rangos y el cliente cambia entre ellos sin llamadas adicionales.

### Resumen por rango
- Llamadas IA
- Tokens (con sufijo K/M)
- Coste estimado (2 decimales)
- Errores IA
- Usuarios activos
- Correcciones
- Simulacros completados
- Planes generados

### Insights rápidos
Generados automáticamente a partir de los datos (sin IA):
- Ruta/acción más usada y más cara
- Usuario con más consumo
- Coste medio por llamada
- Resumen de simulacros
- Correcciones y planes de la semana

### Simulacros — desglose completo
- Total simulacros creados
- Completados
- En progreso
- Posibles abandonados (en_progreso con created_at > 2h)
- Tasa de finalización

**Definiciones:**
- `completado`: `estado = 'completado'`
- `en_progreso`: `estado = 'en_progreso'`
- `abandonado` (estimado): `en_progreso` + creado hace más de 2 horas
- `completionRate`: completados / total

### Uso por acción (7 días)
Tabla con ruta + acción como unidad, con etiqueta legible:
- "Chat con Pausia" → `/api/chat` + `chat`
- "Corrección imagen" → `/api/chat` + `image_correction`
- "Mi Plan" → `/api/planning` + `planning_generation`
- "Simulacro" → `/api/simulacro` + `simulacro_correction`

### Top usuarios por tokens (30 días)
Tabla: ID enmascarado, llamadas, tokens, coste estimado, última actividad.
IDs se muestran como `abc123·····d4ef` (6 chars + 4 chars finales). Sin emails.

### Últimos 50 eventos IA
Tabla con badges de estado (OK / Error:código).

### Errores últimas 24h
Tabla con fecha, acción y código de error.

### Correcciones y simulacros recientes
20 filas más recientes de cada tabla.
Simulacros con badge visual (Completado / En progreso).

## Cálculo de coste

```typescript
// Approximate internal estimates. Update when provider pricing changes.
const APPROX_INPUT_EUR_PER_TOKEN  = 0.0000028   // ~$3/M input tokens
const APPROX_OUTPUT_EUR_PER_TOKEN = 0.000014     // ~$15/M output tokens
const APPROX_AVG_EUR_PER_TOKEN    = 0.000007     // fallback si solo hay total_tokens
```

Fórmula: `input_tokens × 0.0000028 + output_tokens × 0.000014`.
Si solo existe `total_tokens`: `total_tokens × 0.000007`.
El campo `estimated_cost_eur` de la tabla `ai_usage_events` se inserta como `null` actualmente — el coste siempre se recalcula en el panel.

Todos los costes se muestran **siempre a 2 decimales**. Importes menores a 0,01 € se muestran como `< 0,01 €`.

## Tablas utilizadas

| Tabla | Uso |
|-------|-----|
| `ai_usage_events` | Todas las métricas IA: llamadas, tokens, errores |
| `historial_examenes` | Correcciones (sin migración formal — lectura defensiva) |
| `historial_simulacros` | Simulacros y desglose de estados |

## Comportamiento con datos ausentes

- Si una tabla no existe o falla: arrays vacíos, contadores a 0.
- `historial_examenes` envuelto en try/catch por ser orphan table.
- Si falta `SUPABASE_SERVICE_ROLE_KEY`: se usa anon key de fallback (RLS activa → menos datos).
- Sin datos IA: sección de alertas muestra "Sin actividad IA hoy."
- Cada tabla tiene un empty state legible.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `app/admin/page.tsx` | Componente cliente: auth, tabs de rango, dashboard completo |
| `app/api/admin/metrics/route.ts` | API route: verifica usuario interno, devuelve métricas |
| `app/api/admin/me/route.ts` | API mínima: devuelve `{ isAdmin: boolean }` para el Sidebar |
| `app/lib/adminMetrics.ts` | Funciones server-only: queries con service role, cálculos |
| `docs/admin-panel.md` | Este documento |

## Qué NO hace este panel

- No modifica ningún dato.
- No expone enunciados, respuestas ni correcciones de usuarios.
- No toca `app/data/*`, `public/*`, pricing, nota estimada, prompts IA, modelos, límites.
- No usa query params para autenticar (`?admin=true` no funciona).
- No expone `INTERNAL_USER_EMAILS` ni `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- No instala dependencias nuevas.

## Limitaciones conocidas

- Coste estimado, no facturación real. Actualizar constantes si cambia el pricing del proveedor.
- Usuarios identificados por ID enmascarado, no por email.
- `correctionsToday`/`corrections7d` están limitados a los 25 más recientes si hay más.
- `simulacrosStats` no filtra por rango: muestra totales de toda la vida.
- Tokens por modelo no desagregados (todos juntos con la misma constante de coste).

## Futuras mejoras

- Gráficos de evolución temporal (tokens/coste por día)
- Export CSV
- Alertas por email/Slack cuando se supera umbral
- Coste real desagregado por modelo
- Retención semanal y conversión Premium
- Panel de profesor
- Emails enmascarados en top usuarios (requiere join con `auth.users` vía admin API)
