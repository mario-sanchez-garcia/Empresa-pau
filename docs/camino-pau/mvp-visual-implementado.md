# Camino PAU - MVP visual implementado

## Qué se ha implementado

Se ha creado la primera versión funcional interna de Camino PAU en `/camino`.

Incluye:

- Header de Camino PAU con badge `MVP interno`.
- Misión diaria con día, ruta activa, objetivo, tiempo estimado y progreso.
- 4 tareas completables con XP y estado visual.
- Métricas de racha, XP total, nivel de Matemáticas II y progreso hacia la PAU.
- Selector de ruta de entrada: completa, ajustada, acelerada, sprint e intensiva.
- Próximos objetivos de las semanas 17-20.
- Mini mapa de progreso con nodos completado, actual, próximo y bloqueado.
- Bloque final explicando por qué existe Camino PAU.
- Aviso de vista previa interna.
- Entrada `Camino PAU` en el sidebar.

## Qué es mock/local

Esta primera versión no usa Supabase ni IA. El estado se guarda en `localStorage` con la clave:

`pausia_camino_progress_v1`

El progreso inicial de demo es:

- 1.840 XP.
- Racha de 6 días.
- Nivel 8 en Matemáticas II.
- 34% de progreso hacia la PAU.
- Una tarea inicial ya completada.

El usuario puede completar tareas, sumar XP una sola vez por tarea, completar la misión diaria, cambiar la ruta activa y reiniciar la demo.

## Datos usados

La capa interna de datos está en:

- `app/lib/camino/caminoData.ts`
- `app/lib/camino/caminoProgress.ts`

Los datos se han derivado de:

- `docs/camino-pau/rutas-entrada.tsv`
- `docs/camino-pau/calendario-38-semanas-revisado.tsv`
- `docs/camino-pau/camino-pau-curriculum-mvp.md`

La app no lee el `.xlsx` ni los TSV en runtime.

## Qué queda para fase 2

- Persistencia real en Supabase.
- Generación real de tareas diarias.
- Conexión con ejercicios existentes.
- Conexión con historial de errores.
- IA para adaptar misión.
- Tracking en admin.
- Beta con alumnos reales.

## Qué NO se ha tocado

- No se ha tocado Supabase.
- No se han creado migraciones.
- No se han creado APIs nuevas.
- No se ha llamado a IA.
- No se ha tocado `app/data/`.
- No se han tocado Exámenes, Simulacros, Historial, Admin, Pricing ni Mi Plan.
- No se han añadido dependencias.

## Cómo probar `/camino`

1. Abrir `/camino`.
2. Confirmar que el sidebar muestra `Camino PAU` activo.
3. Cambiar la ruta activa y comprobar que cambia el mensaje.
4. Completar tareas y comprobar que sube el XP.
5. Completar todas las tareas y comprobar el estado `Misión completada`.
6. Recargar y comprobar que el estado se mantiene con `localStorage`.
7. Pulsar `Reset progreso` y comprobar que vuelve al estado demo inicial.
8. Revisar la vista en móvil.
9. Comprobar que Exámenes, Simulacros, Historial y Admin siguen accesibles desde el sidebar.
