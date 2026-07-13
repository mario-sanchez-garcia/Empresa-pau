# Cómo organiza Camino PAU los contenidos

## 1. Resumen ejecutivo

Camino PAU no funciona hoy como una IA pedagógica generativa que decide libremente qué estudiar. Funciona como un motor mixto de reglas, secuencia curricular, cola de aprendizaje, calendario persistido, estado del usuario y algunos ajustes reactivos.

La parte fuerte es que ya existe una base ordenada por asignatura, se guardan misiones en calendario y se evita regenerar todo sin control cuando hay datos persistidos. La parte débil es que la personalización por errores reales todavía es parcial: la corrección puede guardar nota, XP y áreas débiles, pero no hay todavía un modelo robusto que reprograme el curso entero según patrones de error.

Valor educativo actual: Medio. Sirve para beta porque da orden, constancia y práctica progresiva. Todavía no es suficiente como “tutor IA completo” de curso anual.

## 2. ¿Hay una IA organizando o un motor de reglas?

Actualmente es principalmente un motor de reglas.

| Elemento | Estado | Comentario |
|---|---:|---|
| IA generativa decidiendo el plan | 🔴 | No se ve un LLM generando la planificación semanal. |
| Reglas hardcodeadas | ✅ | Hay reglas de días hábiles, rotación de asignaturas, límites de plan, parciales, rescate y prioridades. |
| Secuencia curricular | ✅ | `PRIVATE_BETA_CURRICULUM_TOPICS` y `CAMINO_CURRICULUM_TOPICS` ordenan temas. |
| Supabase | ✅ | Guarda cola, calendario, XP, feedback escolar y estado. |
| JSON/TS local | ✅ | Hay seed local y currículum beta en TypeScript. |
| Cola de aprendizaje | ✅ | `user_learning_queue` ordena temas pendientes por usuario. |
| Calendario persistido | ✅ | `camino_calendar` guarda misiones por fecha. |
| Progreso del usuario | 🟡 | XP y completados influyen; dominio fino por habilidad todavía no. |
| Historial de correcciones | 🟡 | Se guarda y se usa parcialmente como áreas débiles locales. |
| Fallbacks | ✅ | Hay fallback curricular local y fallback PAU/EVAU por asignatura si no hay match exacto. |

Conclusión: Camino PAU parece “inteligente” porque combina datos, pero la inteligencia actual es procedimental, no generativa.

## 3. Fuentes de datos que usa Camino PAU

| Dato | Estado | Uso real |
|---|---:|---|
| Asignaturas seleccionadas | ✅ | Filtran la beta y determinan qué materias entran en calendario. |
| Comunidad | 🟡 | Se guarda y afecta ranking/feedback; no organiza profundamente el temario. |
| Temario oficial | 🟡 | Está representado por secuencias internas, no como motor oficial completo. |
| `curriculum_content_v2` | ✅ | Se usa para cola/contenido cuando hay filas. |
| `PRIVATE_BETA_CURRICULUM_TOPICS` | ✅ | Fallback principal por asignatura beta. |
| `CAMINO_CURRICULUM_TOPICS` | ✅ | Une seed local y secuencia beta. |
| `curriculum_topics` | 🟡 | Existe como tabla curricular, pero el flujo central usa sobre todo TS/local y `curriculum_content_v2`. |
| `mission_templates` | 🟡 | Existe, pero no parece dirigir el calendario principal. |
| `user_learning_queue` | ✅ | Fuente persistida de temas pendientes/scheduled/postponed/completed. |
| `camino_calendar` | ✅ | Fuente de misiones mostradas. |
| `camino_user_progress` | ✅ | XP total/racha/estado visible. |
| `camino_xp_events` | ✅ | Ledger de XP. |
| Historial de correcciones | 🟡 | Se guarda en `historial_examenes`; su efecto en Camino es limitado. |
| Notas anteriores | 🟡 | Nota baja puede guardar weak area local; no reordena todo el plan en servidor. |
| Errores del alumno | 🔴 | No hay taxonomía fuerte de errores que reprograme. |
| Parciales añadidos | ✅ | Inyectan misiones cercanas al parcial. |
| “Aún no lo he dado” | ✅ | Guarda feedback y puede postponar cola/calendario. |
| Fecha actual | ✅ | Se usa con zona Europe/Madrid. |
| Semana seleccionada | ✅ | Cliente puede mostrar/generar semana según `weekStart`. |
| Límites de plan | ✅ | Limitan días, correcciones, fotos, simulacros y bonus. |

## 4. Flujo real: cómo decide qué toca hoy

Flujo principal de servidor:

1. Lee usuario autenticado.
2. Recibe asignaturas seleccionadas.
3. Normaliza y limita a la beta privada: Matemáticas II, Matemáticas CCSS, Lengua e Historia de España.
4. Busca contenido en `curriculum_content_v2`.
5. Si no hay contenido suficiente, usa `PRIVATE_BETA_CURRICULUM_TOPICS`.
6. Crea filas en `user_learning_queue` con `subject`, bloque, orden y `metadata.topic_slug`.
7. Genera 14 días hábiles desde hoy.
8. Reparte asignaturas por día con una rotación simple.
9. Inserta misiones en `camino_calendar`.
10. Marca los elementos de cola como `scheduled`.

Flujo de mantenimiento:

1. `ensureCaminoCalendar` marca misiones pasadas como `missed`.
2. Devuelve a `pending` elementos asociados a misiones perdidas.
3. Comprueba cuántos días futuros hay.
4. Si faltan días, rellena hasta un horizonte de 14 días.
5. Si queda demasiado contenido para los días hasta PAU, activa modo rescate y prioriza bloques.

No hay una IA leyendo el perfil y escribiendo un plan desde cero. Hay reglas bastante claras.

## 5. Cómo organiza una semana

En servidor se mantiene un horizonte de 14 días hábiles, no una semana aislada. En cliente, la vista trabaja por semana.

Comportamiento real:

- Genera misiones en días hábiles.
- Evita fines de semana y festivos definidos en código.
- Reparte asignaturas con rotación por día.
- Puede crear 1 o 2 misiones al día según modo y presión de calendario.
- Si hay calendario en Supabase, lo reutiliza antes que inventar uno nuevo.
- Si el cliente genera una semana local, la cachea en `localStorage`.
- Misma semana + mismo usuario tiende a mantenerse estable si hay calendario persistido o caché.
- Puede cambiar si se añaden parciales, se marca “no dado”, se pierde una misión o falta calendario futuro.

La organización semanal es útil, pero todavía no es una planificación pedagógica fina. Es una agenda con reglas de avance y algunas adaptaciones.

## 6. Cómo organiza el curso completo

Hay visión de curso parcial, no completa.

Lo que sí existe:

- Secuencia ordenada por asignatura.
- Horizonte móvil de 14 días hábiles.
- Cálculo de días hasta la PAU 2027-06-07.
- Modo rescate si quedan demasiados temas para el tiempo disponible.
- Reglas de parciales.
- Comentario histórico periódico en Historia.

Lo que no existe todavía de forma completa:

- Plan anual de 38 semanas cerrado.
- Fases explícitas de inicio, desarrollo, repaso, simulacros y PAU.
- Replanificación global por dominio real.
- Mapa completo de prerequisitos usado por el motor.
- Revisión acumulada de errores por habilidad.

En la práctica, Camino organiza una cola larga y va rellenando el calendario próximo. No parece tener una planificación anual completa con checkpoints pedagógicos fuertes.

## 7. Cómo avanza entre temas

El avance depende de `subject_position`, `orderIndex`, `v2_sort_order` y el estado de cola/calendario.

| Capacidad | Estado | Comentario |
|---|---:|---|
| Saber qué tema viene después | ✅ | Lo sabe por orden de secuencia/cola. |
| Usar prerequisitos | 🟡 | Hay `prerequisites` en temas, pero no parecen gobernar fuerte la planificación. |
| Tema visto | 🟡 | Abrir/usar curso puede marcar progreso local, pero el estado fuerte llega con corrección/completado. |
| Tema practicado | 🟡 | Se infiere por práctica/corrección; no hay dominio granular universal. |
| Tema completado | ✅ | `complete-mission` y calendario completado lo registran. |
| Tema dominado | 🔴 | No hay criterio robusto y estable de dominio por tema/habilidad. |
| Toca repaso | 🟡 | Hay weak areas locales y modo review, pero no algoritmo sólido de repaso espaciado. |
| Toca PAU/EVAU | ✅ | Después de curso o cerca de parcial puede mandar a práctica PAU/EVAU. |

## 8. Cómo influyen correcciones, errores y XP

| Señal | Influencia | Realidad |
|---|---:|---|
| Corrección con nota | ✅ | Si hay nota, asigna XP y puede completar misión. |
| XP | ✅ | Actualiza progreso visible, ranking y racha. |
| Historial en `historial_examenes` | 🟡 | Se guarda, pero no parece alimentar de forma fuerte el plan servidor. |
| Nota baja | 🟡 | Guarda `weakAreas` en localStorage y puede priorizar refuerzo en generación local. |
| Error específico de cálculo/redacción | 🔴 | No se clasifica de forma estructurada para planificar. |
| Buena nota | 🟡 | Completa misión/tema, pero no hay promoción pedagógica sofisticada. |
| Repetición por fallo | 🟡 | Puede aparecer por weak area local; no es un sistema robusto de recuperación. |

Respuesta honesta: si el alumno falla matrices, puede haber refuerzo parcial si la nota baja queda en weak areas locales. Pero no hay todavía un motor central que lea todos los errores y reprograme automáticamente varias semanas.

## 9. Cómo influyen parciales y “Aún no lo he dado”

Parciales:

- ✅ Se guardan en perfil/local.
- ✅ Si el parcial está cerca, se inyectan misiones específicas.
- ✅ Se usan días laborables antes del examen.
- ✅ Se prioriza bloque/tema del parcial.
- ✅ Puede meter práctica EVAU, mini-simulacro y simulacro final.
- ✅ Si ya había misión normal, puede bajarla a bonus.
- 🟡 Solo actúa fuerte cuando el parcial está dentro de una ventana cercana.

“Aún no lo he dado”:

- ✅ Guarda feedback local.
- ✅ Envía feedback a `/api/camino/school-topic-feedback`.
- ✅ Puede marcar `school_topic_status` como `not_seen` o `delayed_for_school`.
- ✅ Llama a `/api/camino/postpone-mission`.
- ✅ Marca cola como `postponed`.
- ✅ Marca misiones pendientes como `postponed`.
- 🟡 Sustituye por una base previa si encuentra alternativa.
- 🔴 No es todavía una coordinación completa con programación real de cada colegio.

## 10. Estado por asignatura beta

| Asignatura | Secuencia | Lecciones | Ejercicios | PAU/EVAU por tema | Riesgo |
|---|---|---|---|---|---|
| Matemáticas II | ✅ 11 temas beta + seed | ✅ Con contenido local/LaTeX y v2 cuando existe | ✅ Ejercicios de curso | 🟡 Match por tema/bloque/keywords y fallback | Medio |
| Matemáticas CCSS | ✅ 6 temas beta | ✅ Con contenido local | ✅ Ejercicios de curso | 🟡 Datos Madrid conectados, matching no siempre exacto | Medio |
| Lengua Castellana | ✅ 8 temas beta | ✅ Lecciones adaptadas a respuesta escrita | ✅ Prácticas de curso | 🟡 Puede abrir ejercicios por asignatura/keywords | Medio-alto |
| Historia de España | ✅ 10 temas beta | ✅ Lecciones de contexto/respuesta | ✅ Prácticas de curso + comentario periódico | 🟡 PAU/EVAU por tema menos fino | Medio-alto |

Matemáticas está más cerca de funcionar como secuencia curricular sólida. Lengua e Historia tienen valor beta, pero necesitan más mapeo a ejercicios reales y criterios por tema.

## 11. Problemas detectados

1. No hay IA generativa organizando el curso; hay reglas.
2. La personalización por errores es local/parcial.
3. No hay dominio granular por habilidad.
4. Los prerequisitos existen en datos, pero no gobiernan claramente el algoritmo.
5. El horizonte fuerte es 14 días, no 38 semanas.
6. PAU/EVAU por tema funciona por matching aproximado y fallback.
7. La planificación depende de varias fuentes: Supabase, TS local, localStorage y perfil.
8. Puede haber diferencias entre calendario servidor y semana generada localmente.
9. “Aún no lo he dado” postponea, pero no modela la programación real de cada clase.
10. Historia/Lengua tienen más riesgo de contenido genérico que Matemáticas.

## 12. Valor educativo actual

Valor: Medio.

Tiene sentido pedagógico porque:

- Ordena temas por asignatura.
- Crea hábito diario/semanal.
- Separa curso, práctica y PAU/EVAU.
- Respeta parcialmente parciales.
- Evita que todo sea flashcards o tareas sueltas.
- Guarda calendario y progreso.

Todavía no es personalización alta porque:

- No analiza errores de forma estructurada.
- No tiene modelo fuerte de dominio.
- No replanifica el curso completo.
- No diferencia con suficiente profundidad “sé teoría”, “sé aplicar”, “fallo cálculo”, “fallo redacción”.
- No hay aún un mapa PAU/EVAU exacto para todos los temas.

Para septiembre, sirve como beta si se comunica como Camino guiado y progresivo. No conviene venderlo como tutor IA plenamente adaptativo.

## 13. Qué haría falta para que tenga más valor

Prioridades breves:

1. Definir estados reales: visto, practicado, completado y dominado.
2. Guardar errores de corrección en categorías: concepto, procedimiento, cálculo, redacción, tiempo.
3. Usar esas categorías para meter repasos automáticos.
4. Convertir prerequisitos en reglas reales de desbloqueo o recomendación.
5. Crear planificación de 38 semanas con fases: base, desarrollo, práctica, repaso, simulacros.
6. Mapear ejercicios PAU/EVAU a tema exacto.
7. Unificar servidor/localStorage para evitar dobles motores.
8. Mejorar programación por colegio usando agregados de “no dado”.
9. Evitar fallbacks genéricos cuando hay tema específico.
10. Crear informes de avance por bloque y asignatura.

## 14. Conclusión clara

Camino PAU ya tiene una base educativa real: secuencia, calendario, cola, persistencia, XP, parciales y feedback de “no dado”. No es solo una lista decorativa.

Pero tampoco es todavía una IA pedagógica completa. Es un motor de planificación por reglas con algunos datos personalizados. Su valor actual está en dar orden y constancia; su siguiente salto debe ser usar correcciones y errores para decidir repasos, ritmo y prioridad de temas.

La frase honesta sería: Camino PAU organiza el estudio mediante un motor de reglas apoyado en secuencias curriculares y calendario persistido; empieza a personalizar por progreso, parciales y feedback, pero todavía no aprende de forma profunda de los errores del alumno.
