# Resumen implementación Fase 2C — Camino PAU Supabase

Fecha: 2026-06-13

---

## Archivos creados / modificados

### Nuevos

| Archivo | Descripción |
|---|---|
| `supabase/migrations/20260613120000_create_camino_pau_tables.sql` | Migración con las 5 tablas Camino + RLS |
| `app/lib/camino/caminoProgressServer.ts` | Helper server-side: TASK_XP_MAP, getAuthContext, createUserSupabase, createServiceSupabase |
| `app/api/camino/state/route.ts` | GET — lee progreso, ruta y tareas completadas hoy |
| `app/api/camino/complete-task/route.ts` | POST — completa tarea, idempotente, calcula XP en servidor |
| `app/api/camino/route/route.ts` | PATCH — cambia ruta activa, upsert |
| `app/api/camino/reset/route.ts` | POST — reset para usuarios internos con service role |
| `app/hooks/useCaminoProgress.ts` | Hook cliente con Supabase + fallback localStorage |
| `docs/camino-pau/plan-fase-2c-supabase.md` | Plan técnico completo (añadido al repo) |

### Modificados

| Archivo | Cambios |
|---|---|
| `app/components/camino/CaminoPauClient.tsx` | Usa `useCaminoProgress` hook. Badge `En vivo` con Supabase. Métricas muestran `–` durante carga. Copy diferente según `source`. |
| `docs/camino-pau/mvp-visual-implementado.md` | Nueva sección `## Fase 2C — Persistencia Supabase` |

---

## Migraciones creadas

### `supabase/migrations/20260613120000_create_camino_pau_tables.sql`

Crea 5 tablas con RLS:

**`camino_user_progress`** — una fila por usuario, agregados (XP, racha, niveles)
- `unique (user_id)`
- Policies: SELECT, INSERT (`with check`), UPDATE (`using` + `with check`)
- Sin DELETE: el reset actualiza a cero, no borra

**`camino_daily_missions`** — una fila por (usuario, fecha)
- `unique (user_id, mission_date)`
- Policies: SELECT, INSERT (`with check`), UPDATE (`using` + `with check`)

**`camino_task_completions`** — ledger append-only
- `unique (user_id, task_id, mission_date)` — garantía principal de idempotencia
- Policies: SELECT, INSERT (`with check`) **únicamente** — no hay UPDATE ni DELETE policy

**`camino_route_settings`** — ruta activa del alumno
- `unique (user_id)`
- Policies: SELECT, INSERT (`with check`), UPDATE (`using` + `with check`)

**`camino_xp_events`** — ledger inmutable de XP
- `unique (user_id, source_type, source_id, mission_date)` — segunda barrera anti-duplicado
- Policies: SELECT, INSERT (`with check`) **únicamente** — no hay UPDATE ni DELETE policy

Índices creados:
- `camino_user_progress_user_idx` — (user_id)
- `camino_daily_missions_user_date_idx` — (user_id, mission_date DESC)
- `camino_task_completions_user_date_idx` — (user_id, mission_date DESC)
- `camino_task_completions_user_at_idx` — (user_id, completed_at DESC)
- `camino_xp_events_user_at_idx` — (user_id, created_at DESC)

---

## APIs creadas

Todas usan el patrón: `Authorization: Bearer <token> → createClient(url, anonKey).auth.getUser(accessToken) → RLS`

### `GET /api/camino/state`

```
Query: ?date=YYYY-MM-DD (opcional, fallback a fecha UTC del servidor)
Auth:  Bearer token

Respuesta:
{
  progress: { xpTotal, streakDays, lastMissionDate, levelMates,
              levelHistoria, levelIngles, progressTowardsPau, missionsCompleted },
  route:    { routeId, entryDate, pauTargetDate },
  todayMission: { missionDate, completedTaskIds, missionCompleted }
}
```

- Si el usuario no tiene fila en Supabase, devuelve valores iniciales reales (todo a 0, routeId `completa`).
- No crea datos al leer (GET seguro).

---

### `POST /api/camino/complete-task`

```
Body: { taskId, taskType, subjectKey?, missionDate, routeId? }
Auth: Bearer token

Respuesta:
{ ok, alreadyCompleted, xpEarned, missionCompleted, newStreak }
```

**Mapa server-side de XP (el cliente no decide):**

| taskId | XP |
|---|---|
| `flashcards-integrales` | 25 |
| `ejercicios-analisis` | 30 |
| `correccion-corta` | 30 |
| `repaso-areas` | 20 |
| Bonus misión completa | 15 |

**Lógica de idempotencia:**
1. Upsert `camino_daily_missions` con `ignoreDuplicates: true`
2. Upsert `camino_task_completions` con `ignoreDuplicates: true` + `.select('id')`
3. Si `data.length === 0` → `alreadyCompleted: true`, retorno inmediato
4. Upsert `camino_xp_events` con `ignoreDuplicates: true`
5. Comprobar si todas las tareas están completadas
6. Comprobar si misión ya estaba marcada `completed = true`
7. Si misión completa y no contada: insertar XP event de misión, marcar misión, calcular nueva racha
8. Read-modify-write en `camino_user_progress`

**Lógica de racha:**
- `last_mission_date = null` → streak = 1
- `last_mission_date = hoy` → no cambiar (ya contado)
- `last_mission_date = ayer` → streak + 1
- cualquier otro caso → streak = 1 (rota)

**Validaciones:**
- `taskId` no en `TASK_XP_MAP` → 400
- `missionDate` fuera de ventana ±1 día UTC → 422

---

### `PATCH /api/camino/route`

```
Body: { routeId: 'completa' | 'ajustada' | 'acelerada' | 'sprint' | 'intensiva' }
Auth: Bearer token

Respuesta: { ok, routeId }
```

- Upsert en `camino_route_settings` con `onConflict: 'user_id'`.
- `routeId` inválido → 400.

---

### `POST /api/camino/reset`

```
Auth: Bearer token
Body: { missionDate?: YYYY-MM-DD }

Respuesta: { ok }
```

- Si usuario no está en `INTERNAL_USER_EMAILS` → 403 inmediato.
- Usa `SUPABASE_SERVICE_ROLE_KEY` (nunca expuesto al cliente).
- Borra `camino_task_completions`, `camino_daily_missions`, `camino_xp_events` del `missionDate` indicado.
- Resetea `camino_user_progress` a valores cero (no borra la fila).

---

## Hook cliente: `useCaminoProgress`

`app/hooks/useCaminoProgress.ts`

```typescript
const { progress, loading, source, dayKey, completeTask, changeRoute, resetProgress } = useCaminoProgress()
```

| Campo | Tipo | Descripción |
|---|---|---|
| `progress` | `CaminoProgress` | Estado actual (localStorage o Supabase) |
| `loading` | `boolean` | `true` hasta que la carga inicial termina |
| `source` | `'local' \| 'supabase'` | Fuente de verdad activa |
| `dayKey` | `string` | Fecha local hoy (`YYYY-MM-DD`) |
| `completeTask(task)` | `async` | Update optimista + API + re-fetch |
| `changeRoute(routeId)` | `async` | Update inmediato + PATCH API |
| `resetProgress()` | `async` | POST /reset si sesión+interno, else reset local |

**Flujo de inicialización:**
1. `useState` → `createInitialProgress(dayKey)` (valores demo como placeholder)
2. `useEffect` → `supabase.auth.getSession()`
3. Sin sesión → `loadCaminoProgress(dayKey)` + `source='local'` + `loading=false`
4. Con sesión → GET `/api/camino/state` → si OK: `source='supabase'`; si falla: `loadCaminoProgress` + `source='local'`
5. `loading=false` siempre al final

**Comportamiento del localStorage:**
- `source='local'`: se guarda en localStorage en cada cambio
- `source='supabase'`: localStorage se actualiza como caché tras cada fetch
- Fallback siempre disponible si Supabase está caído

---

## Build final

```
✓ Compiled successfully in 3.6s
✓ TypeScript sin errores
✓ 21/21 páginas generadas

Rutas dinámicas Camino:
  ƒ /api/camino/complete-task
  ƒ /api/camino/reset
  ƒ /api/camino/route
  ƒ /api/camino/state

Ninguna ruta existente rota.
```

---

## Commits

| Hash | Mensaje |
|---|---|
| `58cb552` | feat: add camino supabase tables and rls |
| `88a889e` | feat: add camino api routes |
| `3e5d7e0` | feat: connect camino ui to supabase |
| `11b8691` | docs: update camino phase 2c implementation notes |

---

## Push confirmado

```
d4a92fb..11b8691  main -> main
https://github.com/msanchezieu2024-cmyk/Empresa-pau
```

---

## QA realizado

| Prueba | Resultado |
|---|---|
| `npm run build` pasa sin errores | ✅ |
| TypeScript sin errores | ✅ |
| 4 rutas API aparecen como Dynamic | ✅ |
| Exámenes no tocado | ✅ |
| Simulacros no tocado | ✅ |
| Historial no tocado | ✅ |
| Mi Plan no tocado | ✅ |
| Admin no tocado | ✅ |
| `app/data/` no tocado | ✅ |
| Pricing no tocado | ✅ |
| No hay service role expuesto en cliente | ✅ |
| No hay policies abiertas | ✅ |
| Toda policy INSERT tiene `with check` | ✅ |
| Usuario sin sesión → localStorage | Verificado en código |
| Usuario nuevo logueado → 0 XP real | Verificado en lógica de GET /state |
| Completar misma tarea dos veces → no duplica XP | Verificado: upsert ignoreDuplicates + check `data.length === 0` |
| Reset → solo usuarios internos | Verificado: isInternalUser check antes de cualquier operación |
| Flujo real Supabase end-to-end | ⚠️ Requiere migración aplicada en Supabase (ver abajo) |

---

## Pasos manuales pendientes para Supabase

### 1. Aplicar la migración

La migración está en `supabase/migrations/20260613120000_create_camino_pau_tables.sql`.

**Opción A — Supabase CLI:**
```bash
supabase db push
```

**Opción B — Dashboard de Supabase:**
1. Ir al proyecto en supabase.com
2. `SQL Editor` → `New query`
3. Pegar el contenido completo del archivo de migración
4. Ejecutar

### 2. Verificar RLS después de aplicar

En el SQL Editor del dashboard:
```sql
-- Verificar que RLS está activado en todas las tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'camino_%';
```

Todas deben mostrar `rowsecurity = true`.

### 3. Verificar variables de entorno en producción (Vercel)

Confirmar que `SUPABASE_SERVICE_ROLE_KEY` está configurada en las variables de entorno de Vercel (es necesaria para el endpoint `/api/camino/reset`).

```bash
# Verificar localmente que existe:
grep SUPABASE_SERVICE_ROLE_KEY .env.local
```

### 4. QA post-migración

Una vez aplicada la migración, verificar manualmente:

1. `/camino` carga para usuario logueado — badge muestra `En vivo`
2. XP empieza en 0 (no en 1840) para usuario nuevo
3. Completar una tarea → XP aumenta en el valor correcto
4. Completar la misma tarea dos veces → XP no cambia la segunda vez
5. Completar las 4 tareas → misión completa, racha +1
6. Recargar → racha y XP se mantienen
7. Cambiar ruta → persiste al recargar
8. Reset (usuario interno) → vuelve a 0 XP
9. Reset (usuario no interno) → 403, sin cambios en Supabase
10. Sin sesión → funciona con localStorage demo

---

## Decisiones tomadas (sin consultar)

1. **`missionDate` del cliente** — el servidor acepta la fecha local del cliente (±1 día de ventana) en lugar de forzar la fecha UTC del servidor. Esto evita que usuarios en UTC+1/+2 pierdan la racha al hacer tareas tarde.

2. **`DAILY_TASK_IDS` hardcoded en el servidor** — en Fase 2C las tareas siguen siendo las mismas 4. El servidor las conoce para poder verificar si la misión está completa.

3. **Re-fetch tras complete-task** — en lugar de calcular el estado nuevo solo en cliente, el hook hace un re-fetch de `/api/camino/state` tras cada complete-task exitoso. Más costoso pero garantiza consistencia.

4. **Sin migración de valores demo** — usuarios con localStorage existente (1840 XP, 6 días racha) no ven esos valores migrados a Supabase. Empiezan desde 0 real. Los valores demo siguen visibles para usuarios sin sesión.

5. **Reset borra solo el día actual** — el endpoint de reset borra `task_completions`, `daily_missions` y `xp_events` solo del `missionDate` indicado, y resetea los agregados a 0. No hay "borrar todo el historial" — requeriría confirmación explícita.
