# Camino PAU - MVP visual implementado

## Qué se ha implementado

Se ha creado la primera versión funcional interna de Camino PAU en `/camino`.

Incluye:

- Header de Camino PAU con badge `Beta interna`.
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

## Fase 2A — Navegación desde tareas

Implementado en `feat: connect camino tasks to app sections`.

Cada tarea de la misión diaria tiene ahora un botón de acción secundario que lleva al alumno a la zona correspondiente de la app.

### Acciones añadidas a cada tarea

`actionType` fue el nombre original del campo. En Fase 2B se eliminó y se consolida en el campo `type` (de tipo `CaminoTaskTypeId`). El helper `buildCaminoAction(type, subject?)` en `caminoActions.ts` hace la resolución de `actionLabel` y `actionHref`. Los documentos anteriores que mencionen `actionType` como campo de `DailyCaminoTask` están desactualizados.

| Tarea | `type` | `actionLabel` | `actionHref` | Estado |
|---|---|---|---|---|
| 5 flashcards de integrales | `flashcard` | Repasar flashcards | `/zona` | Real — La Zona tiene flashcards reales vía Supabase |
| 2 ejercicios cortos de análisis | `ejercicio_corto` | Practicar análisis | `/?subject=mates` | Real — navega a Exámenes de Matemáticas II |
| 1 corrección IA corta | `correccion_ia` | Hacer corrección | `/?subject=mates` | Provisional — lleva a Exámenes donde está la corrección IA |
| Repasar error reciente: cálculo de áreas | `repaso_error` | Ver historial | `/?view=historial` | Real — navega al Historial de correcciones |

### Qué es real

- `/?subject=mates` — soportado por `readSubjectFromUrl()` en `app/page.tsx:284`. Carga directamente Exámenes de Matemáticas II.
- `/?view=historial` — soportado por `readHomeSectionFromUrl()` en `app/page.tsx:278`. Carga directamente el Historial.
- `/zona` — página real con flashcards conectadas a Supabase.

### Qué sigue siendo provisional

- El enlace de corrección (`/?subject=mates`) lleva a los exámenes generales, no a un flujo de corrección pre-cargado. En Fase 2B debería existir algo como `/?subject=mates&mode=correccion` o una ruta dedicada.
- Las tareas diarias son datos mock estáticos (todas de Semana 17, Análisis). En Fase 2B se generarán dinámicamente desde el currículum y el progreso del alumno.
- No existe filtro por bloque (`block: 'Análisis'`). El campo está definido en la interfaz para cuando exista soporte.

### Cambios técnicos

- `DailyCaminoTask` (en `caminoData.ts`) tiene: `type`, `block?`, `subjectKey?`, `actionLabel`, `actionHref`. El campo `actionType` fue eliminado en Fase 2B — `type` cumple la misma función y es la fuente de verdad.
- `DailyTaskCard.tsx` muestra el botón de acción como enlace `<Link>` secundario a la derecha del footer de la tarea.
- Completar una tarea y pulsar la acción son acciones independientes: el usuario puede hacer una sin la otra.

### Qué queda para Fase 2B

- Filtros reales por asignatura y bloque (query params `block=analisis`, etc.).
- Generación dinámica de tareas desde el currículum de 38 semanas.
- Guardar progreso en Supabase (tabla `camino_progress`).
- Usar historial real de errores para poblar `repaso_error`.
- Tracking de Camino PAU en el panel admin.
- Beta con alumnos reales.

## Fase 2B — Deep links y acciones inteligentes

Implementado en `feat: add camino smart task actions`.

### Nuevo helper: `app/lib/camino/caminoActions.ts`

Contiene la tabla central de acciones por `CaminoTaskTypeId`:

| Tipo de tarea | Label | Href | Deep link | Fallback |
|---|---|---|---|---|
| `flashcard` | Repasar flashcards | `/zona` | No | No |
| `ejercicio_corto` | Practicar ahora | `/?subject=<sujeto>` | Sí | No |
| `correccion_ia` | Hacer corrección | `/?subject=<sujeto>` | Sí | No |
| `repaso_error` | Ver historial | `/?view=historial` | Sí | No |
| `mini_simulacro` | Ir a simulacros | `/simulacros` | No | No |
| `simulacro_completo` | Hacer simulacro | `/simulacros` | No | No |
| `simulacro_completo_escalonado` | Hacer simulacro | `/simulacros` | No | No |
| `estrategia_examen` | Ver mi plan | `/planning` | No | **Sí** |
| `repaso_ligero` | Practicar | `/?subject=<sujeto>` | Sí | No |
| `reading` | Practicar reading | `/?subject=ingles` | Sí | No |
| `writing` | Practicar writing | `/?subject=ingles` | Sí | No |
| `test` | Practicar ahora | `/?subject=<sujeto>` | Sí | No |

`buildCaminoAction(type, subject?)` genera la acción con el href ajustado al sujeto cuando procede.

### Qué enlaces son reales

- `/zona` — La Zona con flashcards reales (Supabase).
- `/?subject=mates` — navega a Exámenes de Matemáticas II. Soportado por `readSubjectFromUrl()` en `app/page.tsx:284`.
- `/?subject=ingles` — navega a Exámenes de Inglés. Misma función.
- `/?subject=historia` — navega a Exámenes de Historia. Misma función.
- `/?view=historial` — navega al Historial de correcciones. Soportado por `readHomeSectionFromUrl()` en `app/page.tsx:278`.
- `/simulacros` — página real.
- `/planning` — Mi Plan, página real.

### Qué enlaces son fallback

- `estrategia_examen` → `/planning`: Mi Plan es la sección más cercana disponible. No existe página de estrategia de examen dedicada todavía.
- `correccion_ia` → `/?subject=mates`: lleva a Exámenes donde está la corrección IA, no a un flujo de corrección pre-cargado.

### ¿Soporta la app query params de bloque?

**No.** `bloquesMates` se deriva dinámicamente del examen activo durante el render (`Array.from(new Set(examen.preguntas.map(p => p.bloque)))`). No existe un mecanismo para inicializar `bloqueIdx` desde un query param sin conocer el índice en esa lista. Implementar `/?block=Analisis` requeriría lógica de resolución nombre→índice post-render. Esto queda para Fase 2C.

Los bloques reales en los datos de examen son: `Algebra`, `Analisis`, `Geometria`, `Probabilidad` (sin tildes, exactamente como están en `app/data/examenes.ts`).

### Cambios técnicos

- `app/lib/camino/caminoActions.ts` — nuevo archivo con `CaminoAction`, `CAMINO_ACTION_DEFAULTS`, `buildCaminoAction`.
- `app/lib/camino/caminoData.ts` — importa `buildCaminoAction`, usa helper local `taskAction()` para poblar `actionLabel`/`actionHref`. Removido `CaminoActionType`. Añadido `subjectKey` a `DailyCaminoTask`.
- `app/components/camino/CaminoPauClient.tsx` — microcopy actualizado: "Las tareas ya te llevan a las zonas reales de Pausia."
- `app/page.tsx` — **no tocado**. Los params existentes funcionan como están.

### Nota sobre ID de tarea renombrado

El ID `'ejercicios-análisis'` (con acento) se cambió a `'ejercicios-analisis'` (sin acento) para consistencia. El localStorage de usuarios con esa tarea completada la mostrará como no completada. Solución: pulsar Reset progreso. Solo afecta a la demo interna, no a datos reales.

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

## Pendiente Fase 2C

- **Persistencia real en Supabase** — tabla `camino_progress` por usuario: XP, racha, tareas completadas, misiones, nivel por asignatura.
- **Racha real por usuario** — basada en `last_completed_date` en Supabase, no en localStorage.
- **XP real por usuario** — acumulado en Supabase, visible en perfil.
- **Generación diaria desde currículum** — tareas generadas desde `caminoWeeks` según semana real del alumno y su ruta de entrada.
- **Uso del historial real de errores** — `repaso_error` debe pre-cargar el error más reciente de `historial_examenes` del usuario.
- **Filtros por bloque en práctica** — `/?subject=mates&block=Analisis` para ir directamente al bloque de análisis en exámenes. Requiere refactor mínimo de inicialización de `bloqueIdx` en `app/page.tsx`.
- **Admin tracking de Camino** — añadir eventos `camino_task_completed` y `camino_mission_completed` a `ai_usage_events` o tabla propia.
- **Beta con alumnos reales** — fase de prueba cerrada antes de lanzamiento general.
- **Página de estrategia de examen dedicada** — actualmente `estrategia_examen` redirige a `/planning` como fallback.

## Saneamiento previo a Supabase

Implementado en `chore: clarify camino pau preview state`.

### Qué sigue siendo local/mock

- XP, racha, nivel y progreso son valores demo en `localStorage`. No están vinculados a ningún usuario real.
- Las tareas son las mismas para todos los usuarios y todos los días (Semana 17, Análisis).
- La misión diaria no sabe en qué semana está el alumno ni qué errores ha cometido.
- `todayKey()` usaba UTC — corregido a hora local para que la misión no cambie a las 11pm.

### Qué se ha aclarado en UI

- Badge cambiado de `MVP interno` a `Beta interna` — más honesto, menos técnico.
- Botón "Reset progreso" movido de la cabecera a una zona discreta "Opciones de demo" al final de la página. Texto: "Reiniciar demo local". Microcopy: "Solo para pruebas internas".
- Microcopy del aviso inferior actualizado: "Las tareas te **acercan** a las zonas reales de Pausia" (no "ya te llevan"). Añadida nota explícita: "Vista previa interna: XP, racha y tareas se guardan localmente en este dispositivo."
- Tildes corregidas en strings de rutas y tipos de tarea visibles en la UI: `hábito`, `presión`, `día`, `rápido`, `Diagnóstico`, `más`, `teoría básica`.

### Por qué no se debe vender todavía como personalización real

1. El XP no distingue entre usuarios — dos alumnos con distinto rendimiento ven los mismos valores.
2. Las tareas no provienen del historial real de errores del alumno.
3. La racha no sobrevive entre dispositivos ni entre sesiones si se borra el localStorage.
4. No hay ningún tracking de qué alumnos completan qué tareas.
5. La "ruta de entrada" seleccionada no cambia las tareas — es solo cosmética en esta fase.

### Qué queda para Fase 2C

Ver sección `## Pendiente Fase 2C` en este documento.

### Decisión sobre `actionType`

El campo `actionType: CaminoActionType` fue eliminado de `DailyCaminoTask` en Fase 2B. La documentación de Fase 2A que lo menciona está desactualizada. El campo `type: CaminoTaskTypeId` cumple la misma función y es la fuente de verdad para `buildCaminoAction()`. No se ha añadido un alias para no introducir deuda técnica.

## Cómo probar `/camino`

1. Abrir `/camino`.
2. Confirmar que el sidebar muestra `Camino PAU` activo.
3. Cambiar la ruta activa y comprobar que cambia el mensaje.
4. Completar tareas y comprobar que sube el XP.
5. Completar todas las tareas y comprobar el estado `Misión completada`.
6. Recargar y comprobar que el estado se mantiene con `localStorage`.
7. Abrir "Opciones de demo" y pulsar "Reiniciar demo local" — comprobar que vuelve al estado demo inicial.
8. Revisar la vista en móvil.
9. Comprobar que Exámenes, Simulacros, Historial y Admin siguen accesibles desde el sidebar.
