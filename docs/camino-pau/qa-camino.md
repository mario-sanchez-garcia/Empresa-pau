# Camino PAU — QA Checklist

## Flujo principal (usuario autenticado)

### Estado inicial
- [ ] `/camino` carga sin errores de consola
- [ ] Header muestra badge "En vivo" cuando `source === 'supabase'`
- [ ] Header muestra semana actual, fase y objetivo según la ruta activa
- [ ] Métricas muestran `–` mientras carga, luego valores reales
- [ ] Skeleton de 3 cards visible durante la carga inicial

### Misiones del currículum
- [ ] Las tareas del día corresponden a la semana calculada: `floor((hoy - entryDate) / 7) + 1 + routeOffset`
- [ ] IDs de tarea tienen formato `w{semana}-{tipo}-{index}` (ej: `w17-ejercicio_corto-0`)
- [ ] Cambiar ruta actualiza inmediatamente las tareas mostradas
- [ ] Si el usuario tiene áreas débiles (avg < 60%, ≥ 2 intentos), aparece tarea `repaso_error` adicional

### Completar tareas
- [ ] Click en el círculo de una tarea la marca como completada (verde)
- [ ] El XP del header aumenta tras completar
- [ ] La barra de progreso avanza
- [ ] Al completar todas las tareas aparece "Misión completada" y badge verde
- [ ] Completar la misma tarea dos veces no duplica XP (`alreadyCompleted: true` en API)

### Persistencia
- [ ] Recarga de página mantiene el estado correcto (completadas, XP, racha)
- [ ] Abrir en otro dispositivo con la misma cuenta muestra el mismo estado
- [ ] `camino_daily_missions.task_ids` se guarda con la primera tarea completada del día

### Racha
- [ ] Completar misión del día → streak + 1
- [ ] Completar misión después de un día sin misión → streak = 1 (rota)
- [ ] Completar segunda misión el mismo día → streak sin cambio

### Flujo sin cuenta (localStorage)
- [ ] Sin sesión activa: badge "Beta interna"
- [ ] Las tareas se generan igualmente desde el currículum
- [ ] El progreso se persiste en localStorage tras cada tarea
- [ ] Al hacer login se sincroniza desde Supabase (el estado local se sobreescribe)

## Deep links

- [ ] Las hrefs de tipo `isDeepLink: true` incluyen `?source=camino&returnTo=%2Fcamino`
- [ ] `/` con `?subject=mates&source=camino&returnTo=/camino` no provoca errores

## Admin metrics

- [ ] Panel admin → sección "Camino PAU" visible
- [ ] Con tablas vacías: muestra 0 en todas las métricas, no error
- [ ] Con datos: activeUsers7d > 0 si hay completions en los últimos 7 días

## Casos edge

- [ ] `entryDate: null` → misión usa semana `1 + routeOffset`
- [ ] Semana > 38 (usuario con ruta intensiva iniciada hace mucho) → clampeada a 38
- [ ] `historial_examenes` sin registros de bloque → `weakAreas: []`, sin tarea extra
- [ ] `SUPABASE_SERVICE_ROLE_KEY` no configurada → `/api/camino/reset` devuelve 500 limpiamente

## Regresiones

- [ ] Página de inicio `/` carga sin errores
- [ ] Simulacros funcionan correctamente
- [ ] Admin panel muestra métricas de AI usage correctamente (Camino section es aditiva)
- [ ] TypeScript build sin errores: `npm run build`
