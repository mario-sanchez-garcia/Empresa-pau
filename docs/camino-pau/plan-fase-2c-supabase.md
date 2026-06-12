# Plan Fase 2C — Camino PAU Supabase

---

## 1. Objetivo

**Hacer:** Pasar XP, racha, tareas completadas, misiones y ruta de entrada de `localStorage` a Supabase por usuario. Sin cambiar el comportamiento visible para el alumno. Sin IA. Sin generación dinámica de contenido todavía.

**No hacer todavía:**
- Generación de tareas desde currículum real (Fase 2D)
- IA para adaptar misión
- Tareas diferentes por usuario basadas en errores (requiere integración historial, Fase 2D)
- Tracking de click-through a práctica
- Beta abierta a alumnos externos

---

## 2. Estado actual

| Dato | Dónde vive | Debe pasar a Supabase |
|---|---|---|
| `xpTotal` | localStorage | Sí — `camino_user_progress.xp_total` |
| `streakDays` | localStorage | Sí — `camino_user_progress.streak_days` |
| `lastCompletedDate` | localStorage | Sí — `camino_user_progress.last_mission_date` |
| `completedTasksByDate` | localStorage | Sí — tabla `camino_task_completions` |
| `completedMissions` | localStorage | Sí — tabla `camino_daily_missions` |
| `selectedRouteId` | localStorage | Sí — tabla `camino_route_settings` |
| `levelBySubject` | localStorage | Sí — `camino_user_progress.level_*` |
| `progressTowardsPau` | localStorage | Sí — `camino_user_progress.progress_towards_pau` |
| Tareas del día (mock) | `caminoData.ts` hardcoded | Quedan en código hasta Fase 2D |
| Contenido de tareas | `caminoData.ts` | No — siempre derivado del código |

El progreso demo inicial (`xpTotal: 1840`, `streakDays: 6`) es ficticio. En Supabase se inicializa en cero real para cada usuario nuevo.

---

## 3. Tablas propuestas

### 3.1 `camino_user_progress`

**Propósito:** Una fila por usuario. Totales agregados. Es la fila que se lee para pintar el dashboard (XP, racha, niveles, progreso).

```sql
create table public.camino_user_progress (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  xp_total             integer     not null default 0 check (xp_total >= 0),
  streak_days          integer     not null default 0 check (streak_days >= 0),
  longest_streak       integer     not null default 0 check (longest_streak >= 0),
  last_mission_date    date,
  missions_completed   integer     not null default 0 check (missions_completed >= 0),
  level_mates          smallint    not null default 1 check (level_mates between 1 and 20),
  level_historia       smallint    not null default 1 check (level_historia between 1 and 20),
  level_ingles         smallint    not null default 1 check (level_ingles between 1 and 20),
  progress_towards_pau smallint    not null default 0 check (progress_towards_pau between 0 and 100),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

create index camino_user_progress_user_idx
  on public.camino_user_progress (user_id);
```

**Guarda:** totales en tiempo real, calculados por el API al completar tareas/misiones.  
**No guarda:** historial de XP (eso va en `camino_xp_events`), route (en `camino_route_settings`), detalle de tareas completadas (en `camino_task_completions`).

---

### 3.2 `camino_daily_missions`

**Propósito:** Una fila por (usuario, fecha). Registra si ese día tuvo misión y si la completó. Es la fuente de verdad para calcular racha.

```sql
create table public.camino_daily_missions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  mission_date   date        not null,
  route_id       text        not null check (route_id in ('completa','ajustada','acelerada','sprint','intensiva')),
  week_number    smallint,
  task_ids       text[]      not null default '{}',
  completed      boolean     not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, mission_date)
);

create index camino_daily_missions_user_date_idx
  on public.camino_daily_missions (user_id, mission_date desc);
```

**Guarda:** qué tareas se asignaron ese día (`task_ids`), si la misión se completó y cuándo.  
**No guarda:** contenido de las tareas (derivado de `caminoData.ts`), XP de la misión (en `camino_xp_events`).

**Nota:** `week_number` permite en Fase 2D saber qué semana del currículum de 38 semanas corresponde a cada misión.

---

### 3.3 `camino_task_completions`

**Propósito:** Registro append-only de cada tarea completada. La constraint `unique (user_id, task_id, mission_date)` es la garantía de idempotencia: nunca se puede completar la misma tarea dos veces el mismo día.

```sql
create table public.camino_task_completions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  task_id        text        not null,
  task_type      text        not null,
  subject_key    text,
  mission_date   date        not null,
  xp_earned      integer     not null default 0 check (xp_earned >= 0),
  completed_at   timestamptz not null default now(),
  unique (user_id, task_id, mission_date)
);

create index camino_task_completions_user_date_idx
  on public.camino_task_completions (user_id, mission_date desc);

create index camino_task_completions_user_at_idx
  on public.camino_task_completions (user_id, completed_at desc);
```

**Guarda:** qué tarea, qué tipo, qué asignatura, cuánto XP ganó, cuándo.  
**No guarda:** título ni detalle de la tarea (derivado del código), action hrefs.

---

### 3.4 `camino_route_settings`

**Propósito:** Ruta activa del alumno y cuándo empezó. La `entry_date` permite calcular en qué semana del currículum está el alumno en Fase 2D.

```sql
create table public.camino_route_settings (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  route_id         text        not null default 'completa'
                   check (route_id in ('completa','ajustada','acelerada','sprint','intensiva')),
  entry_date       date        not null default current_date,
  pau_target_date  date,
  changed_at       timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  unique (user_id)
);
```

**Guarda:** ruta activa, fecha real de entrada a Pausia, fecha estimada de PAU.  
**No guarda:** historial de cambios de ruta (auditoría futura si se necesita), preferences de asignaturas (Fase 2D).

**Nota:** se hace UPSERT en cada cambio de ruta. Si se quiere historial, añadir tabla `camino_route_history` en Fase 2D.

---

### 3.5 `camino_xp_events`

**Propósito:** Ledger inmutable de todos los XP ganados. La constraint `unique (user_id, source_type, source_id, mission_date)` previene duplicados exactamente igual que `camino_task_completions`. `xp_total` en `camino_user_progress` es siempre la suma de esta tabla.

```sql
create table public.camino_xp_events (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  source_type    text        not null
                 check (source_type in ('task_completion','mission_completion','streak_bonus')),
  source_id      text        not null,
  xp_amount      integer     not null check (xp_amount > 0),
  mission_date   date        not null,
  created_at     timestamptz not null default now(),
  unique (user_id, source_type, source_id, mission_date)
);

create index camino_xp_events_user_at_idx
  on public.camino_xp_events (user_id, created_at desc);
```

**Guarda:** fuente del XP (`task_completion`, `mission_completion`, `streak_bonus`), referencia al origen (`source_id` = `task_id` o `mission_date`), cuánto XP.  
**No guarda:** tokens de IA (eso va en `ai_usage_events`), metadatos de corrección.

---

## 4. RLS

Patrón idéntico al resto de la app. Todas las policies usan `auth.uid() = user_id`.

### `camino_user_progress`

```sql
alter table public.camino_user_progress enable row level security;

create policy "camino_user_progress: select own"
  on public.camino_user_progress for select
  using (auth.uid() = user_id);

create policy "camino_user_progress: insert own"
  on public.camino_user_progress for insert
  with check (auth.uid() = user_id);

create policy "camino_user_progress: update own"
  on public.camino_user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE policy: si el usuario quiere "reset", el API actualiza los valores a 0.
-- Borrar la fila rompería el estado del usuario permanentemente.
```

### `camino_daily_missions`

```sql
alter table public.camino_daily_missions enable row level security;

create policy "camino_daily_missions: select own"
  on public.camino_daily_missions for select
  using (auth.uid() = user_id);

create policy "camino_daily_missions: insert own"
  on public.camino_daily_missions for insert
  with check (auth.uid() = user_id);

create policy "camino_daily_missions: update own"
  on public.camino_daily_missions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE: el historial de misiones es permanente.
```

### `camino_task_completions`

```sql
alter table public.camino_task_completions enable row level security;

create policy "camino_task_completions: select own"
  on public.camino_task_completions for select
  using (auth.uid() = user_id);

create policy "camino_task_completions: insert own"
  on public.camino_task_completions for insert
  with check (auth.uid() = user_id);

-- No UPDATE ni DELETE: append-only. Una tarea completada no se puede "descompletar".
-- Si el reset borra un día, eso se gestiona server-side con service role en el endpoint /reset (solo internal).
```

### `camino_route_settings`

```sql
alter table public.camino_route_settings enable row level security;

create policy "camino_route_settings: select own"
  on public.camino_route_settings for select
  using (auth.uid() = user_id);

create policy "camino_route_settings: insert own"
  on public.camino_route_settings for insert
  with check (auth.uid() = user_id);

create policy "camino_route_settings: update own"
  on public.camino_route_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### `camino_xp_events`

```sql
alter table public.camino_xp_events enable row level security;

create policy "camino_xp_events: select own"
  on public.camino_xp_events for select
  using (auth.uid() = user_id);

create policy "camino_xp_events: insert own"
  on public.camino_xp_events for insert
  with check (auth.uid() = user_id);

-- No UPDATE ni DELETE: ledger inmutable.
-- El admin lee con service role desde adminMetrics.ts, no necesita policy adicional.
```

---

## 5. APIs / Route Handlers

Patrón idéntico al de `/api/planning/route.ts`: `Bearer → getUser → RLS`. No se usa service role para leer datos del usuario.

---

### `GET /api/camino/state`

**Propósito:** Carga completa del estado del usuario: progreso agregado + ruta + tareas completadas hoy.

```
Input:    Authorization: Bearer <token>
          Query param: ?date=YYYY-MM-DD  (fecha local del cliente)

Output:   {
  progress: {
    xpTotal, streakDays, lastMissionDate,
    levelMates, levelHistoria, levelIngles,
    progressTowardsPau, missionsCompleted
  },
  route: { routeId, entryDate, pauTargetDate },
  todayMission: {
    missionDate: string,
    completedTaskIds: string[],
    missionCompleted: boolean
  }
}
```

**Validaciones:**
- Token válido y usuario autenticado.
- `date` param: si falta, usar fecha del servidor en UTC. Si está presente, validar que es `YYYY-MM-DD` y que no es más de 1 día en el futuro (anti-cheat mínimo).

**Errores:** 401 si no autenticado. 400 si `date` inválida.

**Idempotencia:** GET, siempre seguro.

**Tablas:** lee `camino_user_progress`, `camino_route_settings`, `camino_task_completions` (WHERE `mission_date = ?date`).

**Comportamiento especial:** Si el usuario no tiene fila en `camino_user_progress` todavía (primera vez), devuelve valores iniciales reales (todo a 0, `route_id = 'completa'`) sin crear la fila. La fila se crea en el primer `complete-task`.

---

### `POST /api/camino/complete-task`

**Propósito:** Marcar una tarea como completada. Idempotente.

```
Input:    Authorization: Bearer <token>
          Body: {
            taskId: string,       // e.g. 'flashcards-integrales'
            taskType: string,     // e.g. 'flashcard'
            subjectKey?: string,  // e.g. 'mates'
            xpAmount: number,     // validado server-side contra tareas conocidas
            missionDate: string   // YYYY-MM-DD, fecha local del cliente
          }

Output:   {
  ok: boolean,
  alreadyCompleted: boolean,   // true si ya estaba completada (idempotente)
  xpEarned: number,            // 0 si alreadyCompleted
  missionCompleted: boolean,   // true si todas las tareas del día están ahora completas
  newStreak: number
}
```

**Validaciones:**
- Token válido.
- `taskId` debe estar en la lista de tasks conocidas (validar contra `VALID_TASK_IDS` hardcoded en el servidor).
- `xpAmount` debe coincidir con el XP definido en el servidor para ese `taskId` — el cliente NO decide cuánto XP gana.
- `missionDate` debe ser hoy o ayer (ventana de ±1 día para evitar reloads en medianoche).

**Lógica de idempotencia (en orden):**

```sql
-- 1. Upsert misión del día (crear si no existe)
INSERT INTO camino_daily_missions (user_id, mission_date, route_id, task_ids)
VALUES (?, ?, ?, ?)
ON CONFLICT (user_id, mission_date) DO NOTHING;

-- 2. Insertar tarea completada — no hace nada si ya existe
INSERT INTO camino_task_completions (user_id, task_id, task_type, subject_key, mission_date, xp_earned)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT (user_id, task_id, mission_date) DO NOTHING
RETURNING id;

-- Si 0 filas insertadas → alreadyCompleted = true, fin.

-- 3. Insertar XP event — idempotente por la unique constraint
INSERT INTO camino_xp_events (user_id, source_type, source_id, xp_amount, mission_date)
VALUES (?, 'task_completion', ?, ?, ?)
ON CONFLICT (user_id, source_type, source_id, mission_date) DO NOTHING;

-- 4. Comprobar si todas las tareas del día están completadas
-- 5. Si misiónCompleta AND no había misión previa completada ese día:
--    - INSERT xp_event 'mission_completion'
--    - UPDATE camino_daily_missions SET completed = true, completed_at = now()
--    - Calcular nuevo streak (ver §6)
--    - UPDATE camino_user_progress (xp_total, streak_days, levels, progress_towards_pau)
-- 6. Si misión no completa:
--    - UPDATE camino_user_progress SET xp_total = xp_total + xpAmount, updated_at = now()
```

**Errores:** 401, 400 (`taskId` inválido, `xpAmount` manipulado), 422 si `missionDate` fuera de ventana.

---

### `PATCH /api/camino/route`

**Propósito:** Cambiar la ruta activa del alumno.

```
Input:    Authorization: Bearer <token>
          Body: { routeId: CaminoRouteId }

Output:   { ok: boolean, routeId: string }
```

**Validaciones:** `routeId` debe estar en el enum válido.

**Idempotencia:**
```sql
INSERT INTO camino_route_settings (user_id, route_id, entry_date)
VALUES (?, ?, current_date)
ON CONFLICT (user_id) DO UPDATE SET route_id = EXCLUDED.route_id, changed_at = now();
```

**Tablas:** `camino_route_settings`.

---

### `POST /api/camino/reset`

**Propósito:** Reiniciar el progreso demo. Solo para usuarios internos (`isInternalUser(email)`).

```
Input:    Authorization: Bearer <token>

Output:   { ok: boolean }
```

**Validaciones:**
- Token válido.
- `isInternalUser(user.email)` → si no, 403 inmediatamente.

**Lógica:** Usa `SUPABASE_SERVICE_ROLE_KEY` para el DELETE (el alumno no tiene DELETE policy). Borra filas del día actual y resetea el aggregate:
```sql
DELETE FROM camino_task_completions WHERE user_id = ? AND mission_date = today;
DELETE FROM camino_daily_missions WHERE user_id = ? AND mission_date = today;
DELETE FROM camino_xp_events WHERE user_id = ? AND mission_date = today;
UPDATE camino_user_progress
  SET xp_total = 0, streak_days = 0, last_mission_date = null,
      missions_completed = 0, level_mates = 1, level_historia = 1,
      level_ingles = 1, progress_towards_pau = 0, updated_at = now()
  WHERE user_id = ?;
```

**Nota:** solo borra el día actual para el reset demo. Un "borrar todo" requeriría confirmación explícita y está fuera de alcance por ahora.

---

## 6. Idempotencia

### Doble XP por la misma tarea

**Garantía:** `unique (user_id, task_id, mission_date)` en `camino_task_completions`. La inserción es `ON CONFLICT DO NOTHING`. Si ya existe, el API devuelve `alreadyCompleted: true` y no toca `camino_xp_events` ni `camino_user_progress`.

### Doble misión completada

**Garantía:** El API comprueba si `camino_daily_missions.completed = true` ANTES de actualizar streak/niveles:
```sql
SELECT completed FROM camino_daily_missions
WHERE user_id = ? AND mission_date = ?
FOR UPDATE;  -- lock para evitar race condition
```
Si `completed = true`, no se suma racha ni se actualizan niveles, aunque todas las tareas estén en `camino_task_completions`.

### Duplicar misión diaria

**Garantía:** `unique (user_id, mission_date)` en `camino_daily_missions`. La fila se crea con `ON CONFLICT DO NOTHING` en el primer `complete-task` del día.

### Romper racha al recargar

**Garantía:** La lógica de racha se calcula así en el servidor:
```
if last_mission_date = hoy → no cambiar streak (ya contado hoy)
if last_mission_date = ayer → streak + 1
else → streak = 1 (se rompió)
```
La fecha se compara en `date` (sin hora), usando la fecha proporcionada por el cliente. Un reload no cambia `last_mission_date` porque sigue siendo hoy.

### Problema de timezone servidor vs cliente

La `mission_date` la proporciona el cliente (su fecha local, derivada de `todayKey()`). El servidor valida que esté dentro de ±1 día de su fecha UTC. Esto cubre el caso de un alumno en UTC+2 haciendo tareas a las 23:30 hora local (que ya es mañana en UTC). Al aceptar `missionDate` del cliente, la racha se calcula correctamente en su zona horaria.

---

## 7. Migración desde localStorage

**Decisión:** No migrar el progreso localStorage a Supabase. Los valores actuales son demo ficticios (1840 XP, 6 días de racha). Sobrescribirlos en Supabase con datos ficticios contaminaría las métricas reales.

**Plan de transición en 4 etapas:**

**Etapa A — Lanzamiento (Fase 2C):**
```
usuario no logueado:      localStorage (sin cambio)
usuario logueado:         Supabase como fuente de verdad
                          si no tiene fila en Supabase → progreso inicial real (todo a 0)
                          localStorage se sigue leyendo para el estado de la UI hasta que
                          el hook de Supabase cargue (evita flash de contenido vacío)
```

**Etapa B — Fallback:**
```typescript
// En useCaminoProgress():
const [progress, setProgress] = useState(() => loadCaminoProgressLocal(dayKey))  // lectura rápida local

useEffect(() => {
  if (!session) return
  fetchCaminoState(session.access_token)
    .then(data => setProgress(mapSupabaseToCaminoProgress(data)))
    .catch(() => {})  // si falla Supabase, queda el localStorage — no rompe UI
}, [session])
```

**Etapa C — Gradual:**
- Cuando Supabase carga correctamente, el localStorage local se vuelve irrelevante.
- No lo borramos activamente (podría usarse para caché offline).
- Sí lo borramos en el reset demo.

**Etapa D — Apagar mock (Fase 2D):**
- Cuando las tareas sean dinámicas, eliminar `createInitialProgress()` con los valores demo.
- Reemplazar por `createEmptyProgress()` con todo a 0.

---

## 8. Generación de misión diaria (sin IA)

**En Fase 2C:** las tareas siguen siendo las 4 hardcodeadas en `caminoData.ts`. Lo que cambia es que la _ruta_ viene de Supabase. El API `/state` devuelve el `route_id` real y el cliente genera las tareas a partir de `caminoData.ts`.

**Para Fase 2D — generación determinista desde currículum:**

1. **Calcular semana del alumno:**
   ```typescript
   function calculateCaminoWeek(entryDate: Date, routeId: CaminoRouteId): number {
     const daysSinceEntry = Math.floor((Date.now() - entryDate.getTime()) / 86400000)
     const weeksSinceEntry = Math.floor(daysSinceEntry / 7) + 1
     // ajustar según ruta (rutas aceleradas saltan semanas iniciales)
     const ROUTE_WEEK_OFFSET = { completa: 0, ajustada: 4, acelerada: 8, sprint: 16, intensiva: 30 }
     return Math.min(38, weeksSinceEntry + ROUTE_WEEK_OFFSET[routeId])
   }
   ```

2. **Obtener tareas de esa semana:**
   ```typescript
   const week = caminoWeeks.find(w => w.semana === currentWeek)
   // Si no existe la semana, usar semana 17 como fallback
   ```

3. **Mapear misión de la semana a tareas individuales:**
   ```
   semana.mision = 'flashcard + ejercicio_corto + correccion_ia'
   → split por ' + '
   → mapear cada tipo a DailyCaminoTask con taskAction()
   → asignar subject de semana.matematicas / historia / ingles
   ```

4. **Fallback si semana no encontrada:** usar las 4 tareas actuales de `caminoData.ts`.

5. **No IA todavía.** Ni adaptación. Misma misión para todos los usuarios en la misma semana+ruta.

---

## 9. Integración futura con historial

**Tablas disponibles:**
- `historial_examenes`: `user_id`, `asignatura`, `bloque`, `nota`, `nota_maxima`
- `historial_simulacros`: `user_id`, `asignatura`, `nota_final`, `estado`, `bloques` (jsonb)

**Query para detectar bloques débiles:**
```sql
SELECT
  asignatura,
  bloque,
  COUNT(*) as intentos,
  AVG(nota::float / NULLIF(nota_maxima::float, 0)) as avg_score
FROM historial_examenes
WHERE user_id = $1
  AND nota IS NOT NULL
  AND nota_maxima > 0
GROUP BY asignatura, bloque
ORDER BY avg_score ASC
LIMIT 5;
```

**Uso en misión diaria (Fase 2D):**
- Si `avg_score < 0.5` para `Analisis` → añadir tarea `repaso_error` de tipo Análisis.
- Si el alumno no tiene historial, la misión es la semana del currículum sin personalizar.
- Si el simulacro tiene `nota_final < 5`, priorizar tareas `repaso_error` de las asignaturas falladas.

**Integración con acciones (ya preparada):** `buildCaminoAction('repaso_error')` ya apunta a `/?view=historial`. En Fase 2D puede incluir `?subject=mates&block=Analisis` una vez que `app/page.tsx` soporte el param `block`.

---

## 10. Admin tracking

Añadir a `adminMetrics.ts` (solo después de que las tablas existan):

| Métrica | Query |
|---|---|
| Usuarios activos en Camino (7d) | `COUNT(DISTINCT user_id) FROM camino_task_completions WHERE completed_at > now()-'7 days'` |
| Misiones completadas (30d) | `COUNT(*) FROM camino_daily_missions WHERE completed = true AND mission_date > now()-30` |
| Tareas completadas (30d) | `COUNT(*) FROM camino_task_completions WHERE completed_at > now()-30` |
| XP generado (30d) | `SUM(xp_amount) FROM camino_xp_events WHERE created_at > now()-30` |
| Distribución de rutas | `SELECT route_id, COUNT(*) FROM camino_route_settings GROUP BY route_id` |
| Racha media activa | `AVG(streak_days) FROM camino_user_progress WHERE streak_days > 0` |
| Tasa de misión completa | `completed_missions / total_missions * 100` por rango |

**Click-through a práctica:** requiere un evento frontend. Se implementa en Fase 2D añadiendo un `POST /api/camino/action-click` que registra en `ai_usage_events` con `action = 'camino_action_click'` y `metadata = { taskId, actionHref }`. No hay coste de tokens, solo logging.

---

## 11. Riesgos

### P0 — Puede romper producción

| Riesgo | Causa | Mitigación |
|---|---|---|
| RLS mal configurado | policy `for insert` sin `with check` → usuario puede insertar con `user_id` de otro | **Obligatorio:** toda policy de INSERT tiene `with check (auth.uid() = user_id)` |
| Doble XP en retry de red | cliente reintenta `complete-task` porque no llegó la respuesta | `ON CONFLICT DO NOTHING` + respuesta `alreadyCompleted: true` es suficiente |
| `xp_total` out of sync | `camino_user_progress.xp_total` actualizado con un `+= xpAmount` que se ejecuta dos veces | Solo sumar XP si el INSERT en `camino_xp_events` devolvió 1 fila (no 0 por conflict) |
| Build roto por nuevo import | si `caminoProgress.ts` importa código server-side en componente cliente | Separar capas: `caminoProgress.ts` queda cliente-only; nuevo `caminoProgressServer.ts` es server-only |

### P1 — Afecta integridad de datos

| Riesgo | Causa | Mitigación |
|---|---|---|
| Racha rota al recargar | servidor recalcula racha comparando `last_mission_date` con UTC en vez de hora local | Siempre usar `missionDate` del cliente (fecha local), no `current_date` del servidor |
| Progreso inicial creado dos veces | dos requests simultáneos al cargar `/camino` → dos INSERT en `camino_user_progress` | `unique (user_id)` + `ON CONFLICT DO NOTHING` en la creación inicial |
| Datos falsos en métricas admin | si localStorage ficticio (XP 1840, racha 6) se importa a Supabase | No migrar localStorage. Supabase siempre empieza en 0 real |

### P2 — Afecta experiencia

| Riesgo | Causa | Mitigación |
|---|---|---|
| Flash de contenido vacío | componente muestra 0 XP mientras carga Supabase | Inicializar estado con localStorage, sobrescribir cuando Supabase carga |
| Spinner infinito si Supabase lento | `useEffect` no tiene timeout | `.catch(() => {})` en el fetch de Supabase, localStorage como fallback |
| Reset no borra Supabase | `resetCaminoProgress()` solo borra localStorage | `POST /api/camino/reset` debe borrar Supabase; localStorage se borra también en el cliente |
| Mezclar mock y real | código legacy usa `createInitialProgress()` con valores demo mientras Supabase falla | Separar claramente: si Supabase está disponible y el usuario está logueado, NUNCA usar los valores demo hardcoded |

---

## 12. Implementación recomendada por fases

### 2C.1 — Migraciones Supabase

Crear `supabase/migrations/<timestamp>_create_camino_tables.sql` con las 5 tablas + RLS de la sección 3.

Crear `supabase/migrations/<timestamp>_create_camino_indexes.sql` con todos los índices de búsqueda frecuente.

No tocar código aún. Verificar con `supabase db push` local.

---

### 2C.2 — Route Handlers

Crear:
- `app/api/camino/state/route.ts` — GET
- `app/api/camino/complete-task/route.ts` — POST
- `app/api/camino/route/route.ts` — PATCH (renombrar internamente como "cambiar ruta" para evitar conflicto de nombre)
- `app/api/camino/reset/route.ts` — POST (solo internal)

Extraer helper `app/lib/camino/caminoProgressServer.ts` con:
- `getCaminoState(userId, accessToken, missionDate)`
- `completeTask(userId, accessToken, payload)`
- `updateRoute(userId, accessToken, routeId)`
- `resetProgress(userId)` — usa service role

Patrón de auth: idéntico a `/api/planning/route.ts` (Bearer → `getUser` → usar `accessToken` para queries con RLS).

---

### 2C.3 — Hook cliente con fallback localStorage

Crear `app/hooks/useCaminoProgress.ts`:

```typescript
export function useCaminoProgress() {
  const [progress, setProgress] = useState<CaminoProgress>(() => loadCaminoProgressLocal(dayKey))
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'local' | 'supabase'>('local')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoading(false); return }
      fetch(`/api/camino/state?date=${dayKey}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          setProgress(mapSupabaseToCaminoProgress(data))
          setSource('supabase')
        })
        .catch(() => {})  // fallback silencioso a localStorage
        .finally(() => setLoading(false))
    })
  }, [dayKey])

  return { progress, loading, source, ... }
}
```

---

### 2C.4 — UI usando datos reales

Reemplazar en `CaminoPauClient.tsx`:
- `loadCaminoProgress(dayKey)` → `useCaminoProgress().progress`
- `saveCaminoProgress(progress)` → no necesario (el servidor es la fuente de verdad)
- `completeCaminoTask(...)` → `POST /api/camino/complete-task` + actualización optimista local
- `setCaminoRoute(...)` → `PATCH /api/camino/route` + update local inmediato
- `resetCaminoProgress(...)` → `POST /api/camino/reset` + limpiar localStorage

Mantener `loading` state para mostrar skeleton durante hidratación inicial.

Cambiar badge `Beta interna` por `En vivo` cuando `source === 'supabase'`.

---

### 2C.5 — QA

1. Nuevo usuario: `/camino` muestra todo a 0 real (no 1840 XP demo).
2. Completar tarea: XP sube en Supabase (verificar en panel admin).
3. Recargar: XP y racha se mantienen (de Supabase, no de localStorage).
4. Completar misma tarea dos veces: XP no se duplica.
5. Completar todas las tareas: misión completa, racha sube exactamente 1.
6. Recargar después de misión completa: racha no cambia.
7. Reset demo: borra Supabase del día actual, vuelve a 0.
8. Sin sesión (usuario no logueado): fallback a localStorage demo, sin llamadas a API.
9. Supabase offline (simular): fallback a localStorage sin error visible.
10. Cambiar ruta: persiste al recargar.
11. Admin panel: métricas de Camino aparecen.

---

### 2C.6 — Docs

Actualizar `docs/camino-pau/mvp-visual-implementado.md`:
- Sección `## Fase 2C — Persistencia Supabase` con tablas, políticas y decisiones tomadas.
- Marcar `## Pendiente Fase 2C` como completado.
- Añadir `## Pendiente Fase 2D` con generación dinámica de tareas.

---

## 13. Prompt de implementación sugerido

```
Quiero implementar la Fase 2C de Camino PAU: persistencia real en Supabase.

Antes de tocar nada:
1. Ejecuta git pull --rebase --autostash origin main
2. Ejecuta git status
3. Si hay conflictos, para y avísame.

Contexto:
Camino PAU existe en /camino con XP/racha en localStorage. El diseño técnico
completo está en docs/camino-pau/plan-fase-2c-supabase.md.
Lee ese documento PRIMERO antes de implementar nada.

Instrucciones estrictas:
- Implementa en el orden exacto: migraciones → Route Handlers → hook → UI → QA.
- No mezcles pasos. Haz commit al final de cada sub-fase.
- No toques app/data/, pricing, admin, simulacros, correcciones.
- No cambies el esquema de tablas existentes.
- No inventes rutas que no existan.
- Cada Route Handler debe seguir el patrón de app/api/planning/route.ts exactamente.
- Toda policy RLS de INSERT debe tener with check (auth.uid() = user_id).
- La lógica de complete-task debe ser completamente idempotente:
  si el INSERT en camino_task_completions retorna 0 filas (ON CONFLICT DO NOTHING),
  no sumar XP ni actualizar camino_user_progress.
- El cliente NUNCA decide cuánto XP gana. El servidor valida xpAmount contra
  un mapa hardcodeado de taskId → xp.
- El fallback a localStorage debe ser silencioso: si Supabase falla, la UI
  sigue mostrando localStorage sin error visible.

Al terminar cada sub-fase:
1. npm run build (corregir solo lo de esta tarea si falla)
2. git status (verificar que no hay archivos prohibidos)
3. git commit con mensaje apropiado
4. git push origin main

Commits:
- feat: add camino supabase tables and rls
- feat: add camino api routes
- feat: add useCaminoProgress hook with supabase+localstorage fallback
- feat: connect camino ui to supabase
- docs: update camino phase 2c implementation notes

Al final devuélveme:
- archivos creados/modificados,
- confirmación de idempotencia del complete-task,
- QA realizado,
- build limpio,
- commit hashes,
- push confirmado,
- qué queda para Fase 2D.
```
