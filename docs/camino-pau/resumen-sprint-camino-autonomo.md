# Resumen Sprint Autónomo — Camino PAU

**Fecha:** 2026-06-13  
**Modo:** Autónomo (sin supervisión activa)  
**Commits generados:** 5 feat + 1 docs  
**Build final:** ✅ 21/21 páginas, 0 errores TypeScript

---

## BLOQUE 0 — Auditoría post-Supabase

**Estado:** Completado

Problemas identificados y corregidos:
- `TASK_XP_MAP` solo cubría 4 task IDs hardcoded. Con IDs dinámicos del generador, el servidor no podía validar el XP. **Fix:** reemplazado por `TASK_TYPE_XP_MAP` (validación por tipo) + `LEGACY_TASK_XP` (compatibilidad hacia atrás) + `resolveTaskXp(taskId, taskType)`.
- La comprobación de misión completada usaba `DAILY_TASK_IDS` hardcoded. **Fix:** el cliente envía `missionTaskIds`, el servidor los guarda en `camino_daily_missions.task_ids` y los usa para la comprobación.
- `caminoProgressServer.ts` tenía `VALID_ROUTE_IDS` duplicado en `complete-task/route.ts` (no bug, ya estaba en el módulo server). Se dejó sin cambio al no ser P0.

---

## BLOQUE 1 — Misiones deterministas del currículum

**Commit:** `feat: generate camino daily missions from 38-week curriculum`

### Archivos creados

**`app/lib/camino/caminoCurriculum.ts`**
- 38 semanas PAU completas (`semana`, `fase`, `objetivo`, `mates`, `historia`, `ingles`, `misionTypes`, `duracion`)
- `MISSION_TASK_XP`: XP canónico por tipo (sincronizado con servidor)
- `ROUTE_WEEK_OFFSET`: offsets por ruta (`completa=0`, `ajustada=4`, `acelerada=8`, `sprint=16`, `intensiva=30`)
- `getPhaseLabel(fase)`, `getCaminoWeek(semana)`

**`app/lib/camino/caminoMissionGenerator.ts`**
- `calculateCaminoWeek(entryDate, routeId, today)`: semana = `floor(daysSinceEntry / 7) + 1 + offset`, clampada a [1, 38]
- `buildDailyTasksFromWeek(week, weakBlocks)`: genera tareas con IDs `w{semana}-{tipo}-{index}`
- `getMissionForDate({ entryDate, routeId, today, weakBlocks })`: punto de entrada principal, devuelve `{ tasks, weekContext }`
- Asignación de subject: `reading/writing` → inglés; `correccion_ia` → inglés si la semana incluye writing, si no mates; resto → mates

### Archivos actualizados

**`app/hooks/useCaminoProgress.ts`**
- Expone `currentTasks: DailyCaminoTask[]` y `weekContext: WeekContext | null`
- Llama `getMissionForDate` tras cargar estado de Supabase (con `entryDate` y `weakBlocks` reales)
- Fallback a `dailyTasks` hardcoded si el generador devuelve vacío
- `completeTask` envía `missionTaskIds: currentTasks.map(t => t.id)` a la API

**`app/components/camino/CaminoPauClient.tsx`**
- Header muestra `Semana {N} · {faseLabel}` y objetivo
- Sección de tareas con título `Semana {N} · {objetivo}` y duración estimada
- Barra de progreso animada (completadas/total)
- Skeleton de carga (3 cards con `animate-pulse`)
- Mensaje "Misión completada" + badge verde cuando se terminan todas
- Copy diferenciado según `source` (`supabase` / `local`)

**`app/lib/camino/caminoProgressServer.ts`**
- `TASK_TYPE_XP_MAP` reemplaza `TASK_XP_MAP`
- `LEGACY_TASK_XP` para los 4 task IDs del MVP inicial
- `resolveTaskXp(taskId, taskType): number | null`

**`app/api/camino/complete-task/route.ts`**
- Acepta `missionTaskIds?` en el body
- Usa `resolveTaskXp` en lugar de lookup directo
- Guarda `task_ids` en `camino_daily_missions` en la primera tarea del día
- Comprobación de misión completada contra `task_ids` guardados en DB

---

## BLOQUE 2 — Deep links mejorados

**Commit:** `feat: add source=camino&returnTo=/camino params to all camino deep links`

**`app/lib/camino/caminoActions.ts`**
- `CAMINO_LINK_PARAMS = 'source=camino&returnTo=%2Fcamino'` añadido a todos los hrefs con `isDeepLink: true`
- Las páginas destino pueden detectar `?source=camino` para mostrar botón de vuelta
- hrefs no-deeplink (`/simulacros`, `/zona`, `/planning`) no modificados

---

## BLOQUE 3 — Áreas débiles

**Commit:** `feat: personalize camino missions with weak areas from historial`

**`app/lib/camino/caminoWeakAreasServer.ts`** (nuevo)
- Consulta `historial_examenes` (asignatura, bloque, nota, nota_maxima) para el usuario
- Agrega por `(asignatura, bloque)`: suma notas/máximos en los últimos 200 registros
- Devuelve bloques con avg < 60% y ≥ 2 intentos, ordenados de peor a mejor
- Nunca lanza excepción, devuelve `[]` en cualquier error

**`app/api/camino/state/route.ts`**
- Ahora incluye `weakAreas: WeakArea[]` en la respuesta GET
- `getWeakAreas` se ejecuta en el mismo `Promise.all` que el resto de queries

**`app/hooks/useCaminoProgress.ts`**
- Lee `data.weakAreas` de la respuesta Supabase
- Actualiza `weakBlocksRef.current` con los labels de los bloques débiles
- Los pasa a `updateMission()` → `getMissionForDate()` → `buildDailyTasksFromWeek()`

---

## BLOQUE 4 — Admin metrics

**Commit:** `feat: add camino admin metrics to admin panel`

**`app/lib/adminMetrics.ts`**
- Nuevo tipo `AdminMetrics.caminoMetrics`:
  - `activeUsers7d`: usuarios únicos con completions en los últimos 7 días
  - `tasksCompleted7d` / `tasksCompleted30d`
  - `missionsCompleted7d`
  - `xpGenerated7d`: suma de `camino_xp_events.xp_amount` en 7 días
  - `avgStreak`: media de `streak_days` de todos los usuarios
  - `missionCompletionRate`: misiones completadas / misiones totales (7d)
  - `routeDistribution`: conteo por route_id de `camino_route_settings`
- Fetching en try/catch independiente — si las tablas Camino no existen el panel no se rompe

**`app/admin/page.tsx`**
- Nueva sección "Camino PAU" con 7 `StatCard`s y distribución de rutas como badges

---

## BLOQUE 5 — UX Polish

Integrado en BLOQUE 1. Items completados:
- ✅ Skeleton de carga
- ✅ Card de misión con semana/fase/objetivo/duración
- ✅ Mensaje "Misión completada" con badge
- ✅ Copy diferenciado según fuente

---

## BLOQUE 6 — Documentación

**Commit:** `docs: add camino roadmap, qa checklist, and fase 2c implementation summary`

- `docs/camino-pau/camino-roadmap.md`: estado actual, fases futuras (3A-3E y 4), decisiones de arquitectura
- `docs/camino-pau/qa-camino.md`: checklist de QA completo (autenticado, localStorage, deep links, admin, edge cases, regresiones)
- `docs/camino-pau/resumen-fase-2c-implementacion.md`: resumen de implementación de la Fase 2C (Supabase persistence)

---

## BLOQUE 7 — QA + Push

### Build final
```
✓ Compiled successfully in 10.0s
✓ TypeScript OK (8.1s)
✓ Generating static pages (21/21)
```
Sin errores TypeScript. Sin warnings relevantes.

### Git log del sprint
```
feat: generate camino daily missions from 38-week curriculum
feat: add source=camino&returnTo=/camino params to all camino deep links
feat: personalize camino missions with weak areas from historial
feat: add camino admin metrics to admin panel
docs: add camino roadmap, qa checklist, and fase 2c implementation summary
```

### Deferred (no bloqueante)
- Block-level deep links (`?block=Analisis`): requiere refactor de `app/page.tsx`. Documentado en roadmap como Fase 3A.
- Notificaciones de racha: requiere Service Worker. Documentado como Fase 3C.
- IA de personalización de misión: requiere modelo de score semanal. Documentado como Fase 3B.

---

## Arquitectura — cambios de estado

| Componente | Antes del sprint | Después del sprint |
|---|---|---|
| Task IDs | 4 IDs hardcoded | `w{semana}-{tipo}-{index}` + 4 legacy |
| XP validation | `TASK_XP_MAP[taskId]` | `TASK_TYPE_XP_MAP[taskType]` + legacy fallback |
| Mission completeness | Hardcoded `DAILY_TASK_IDS` | `camino_daily_missions.task_ids` (guardados en 1ª completion) |
| Mission generation | `dailyTasks` estático (Semana 17) | Currículum de 38 semanas × ruta × entryDate |
| Personalization | Ninguna | weakAreas desde historial real |
| Admin metrics | Sin Camino | 7 métricas + distribución de rutas |
| Deep links | Sin tracking | `?source=camino&returnTo=%2Fcamino` |
| UX loading | Sin skeleton | Skeleton 3 cards + badge fuente |
