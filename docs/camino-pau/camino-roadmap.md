# Camino PAU — Roadmap

## Estado actual (Fase 2C + Sprint autónomo 2026-06-13)

### Implementado ✅

**Fase 1 — MVP visual** (previo al sprint)
- Página `/camino` con diseño completo
- Conexión de tareas a secciones reales de la app
- Copy honesto sobre estado beta
- Reset discreto de datos locales
- UTC timezone fix en `todayKey()`

**Fase 2C — Persistencia Supabase**
- 5 tablas: `camino_user_progress`, `camino_daily_missions`, `camino_task_completions`, `camino_route_settings`, `camino_xp_events`
- RLS en todas las tablas (INSERT with check, append-only en completions y xp_events)
- API routes: GET `/api/camino/state`, POST `/api/camino/complete-task`, PATCH `/api/camino/route`, POST `/api/camino/reset`
- localStorage fallback cuando no hay sesión activa
- Hook `useCaminoProgress` con fuente (`local` | `supabase`) y optimistic updates

**Sprint autónomo — BLOQUE 1: Misiones deterministas del currículum**
- `caminoCurriculum.ts`: 38 semanas PAU con fase, objetivo, contenido mates/historia/inglés, tipos de misión, duración
- `caminoMissionGenerator.ts`: genera tareas dinámicas `w{semana}-{tipo}-{index}` a partir del currículum
- `useCaminoProgress` expone `currentTasks` y `weekContext`
- `CaminoPauClient` muestra semana actual, fase, objetivo, barra de progreso, skeleton de carga
- complete-task API acepta `missionTaskIds` del cliente y los guarda en `camino_daily_missions.task_ids`
- Validación XP por tipo (`TASK_TYPE_XP_MAP`) + compatibilidad con task IDs legacy

**Sprint autónomo — BLOQUE 2: Deep links mejorados**
- Todos los `isDeepLink: true` incluyen `?source=camino&returnTo=%2Fcamino`
- Las páginas destino pueden usar estos params para mostrar botón de vuelta

**Sprint autónomo — BLOQUE 3: Áreas débiles**
- `caminoWeakAreasServer.ts`: consulta `historial_examenes`, agrega por (asignatura, bloque), devuelve bloques con avg < 60% y ≥ 2 intentos
- GET `/api/camino/state` incluye `weakAreas[]`
- El generador de misiones inyecta tarea `repaso_error` si el usuario tiene bloques débiles

**Sprint autónomo — BLOQUE 4: Admin metrics**
- `AdminMetrics.caminoMetrics`: 7 métricas (usuarios activos 7d, tareas 7/30d, misiones, XP, racha media, tasa de completado, distribución de rutas)
- Panel admin con sección "Camino PAU" usando StatCards
- Fetching aislado en try/catch — no rompe el panel si las tablas no existen

**Sprint autónomo — BLOQUE 5: UX Polish** (integrado en BLOQUE 1)
- Skeleton de carga (3 cards animadas)
- Cabecera con semana, fase y objetivo del currículum
- Barra de progreso de la misión
- Mensaje "Misión completada" cuando se terminan todas las tareas
- Copy diferenciado según fuente (supabase vs local)

---

## Próximas fases

### Fase 3 — Personalización avanzada (pendiente)

**3A — Block-level deep links**
Actualmente `bloquesMates` no se puede pasar por URL (se deriva del estado del examen activo en runtime). Para hacer deep links de nivel de bloque habría que:
1. Refactorizar `app/page.tsx` para aceptar `?block=Analisis` como param URL
2. O crear páginas de bloque dedicadas en `/camino/practica/[subject]/[block]`
Complejidad alta — deferred.

**3B — IA de personalización de misión**
- Ajustar tipos y contenido de misión según el historial de la semana (no solo áreas débiles)
- Requiere un modelo de score por semana curricular

**3C — Notificaciones de racha**
- Push notifications cuando el usuario no ha completado la misión del día
- Requiere Service Worker + tabla de suscripciones

**3D — Compañero IA en Camino**
- Chat contextual dentro de `/camino` que sepa en qué semana está el usuario
- Respuestas condicionadas al currículum actual

**3E — Milestones y celebraciones**
- Evento visual al completar fase (1→2, 2→3, 3→4)
- Racha de 7 días / 30 días con badges

### Fase 4 — Social y gamificación (largo plazo)

- Comparación anónima de progreso con otros usuarios de la misma ruta
- Retos semanales opcionales
- Tabla de líderes opt-in por comunidad

---

## Decisiones de arquitectura

| Decisión | Razón |
|---|---|
| XP validado server-side | El cliente nunca decide cuánto XP gana. `taskType` va al servidor, que aplica `TASK_TYPE_XP_MAP` |
| `ON CONFLICT DO NOTHING` para idempotencia | Permite reintentos seguros sin duplicar XP |
| localStorage como fallback | La app funciona offline o sin cuenta. El progreso local se migra al sincronizar |
| Misiones deterministas | La semana del currículum se calcula desde la fecha de entrada + offset de ruta. No hay aleatoriedad → mismo resultado en cualquier dispositivo |
| `weakAreas` en la respuesta de state | Se calcula server-side desde historial real, nunca en el cliente |
| Deep links con `returnTo` | Permite al destino ofrecer botón de vuelta sin hard-codear `/camino` |
