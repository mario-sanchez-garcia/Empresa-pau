# Camino: previsión coherente con el calendario

Base revisada: `origin/main` en `d1edad4`. Rama de trabajo: `codex/camino-forecast-consistente`.
Commit y push autorizados por el usuario. Esta revisión no aplica migraciones ni despliega a producción.

## Cambios

- El cálculo de duración al colocar una misión vive en `placementDuration.ts` y lo comparten el planificador y la previsión. Se conserva el comportamiento del planificador: teoría y repaso usan el slot correspondiente; parciales y simulacros mantienen su duración específica.
- La previsión respeta tanto minutos como número de sesiones por día. No inventa sesiones porque sobren algunos minutos. El trabajo manual, bloqueado o completado consume tiempo sin convertirse en una sesión automática nueva.
- Una misión pendiente sin hueco conserva una estimación explícita. Una que cabe se cuenta con la duración del slot elegido. Las horas antiguas de una misión sin programar no fijan su nueva duración.
- La barra tiene categorías excluyentes: programado sin conflicto, pendiente que cabe y en riesgo. La suma coincide con el trabajo registrado; un conflicto de 30 minutos no se suma dos veces.
- El resultado favorable dice «Lo registrado cabe» y la barra incorpora una descripción accesible. Se conservan los límites de la estimación en el detalle.
- Una asignatura seleccionada sin contenido publicado ni catálogo de respaldo aparece en `skippedSubjects`. Antes podía omitirse sin declararla como fallo. No se ha creado ni modificado contenido académico.

- El endpoint de resumen carga una sola fotografía de disponibilidad y acceso para el aviso y la previsión. Evita duplicar las consultas de preferencias y acceso, y que ambas partes discrepen si el acceso cambia durante la petición.
- Se añade `scripts/camino-qa/check-readiness.mjs`, una comprobación repetible y de solo lectura de esquema, contenido publicado, exposición de RPC y autenticación de rutas. No imprime credenciales ni registros de alumnos.

## Reproducciones y pruebas

- Dos lecciones nuevas, 60 minutos diarios, un único día para teoría: la versión anterior estimaba 70 minutos. Ahora previsión y personalización coinciden en 35 + 25, sin riesgo ficticio.
- Teoría y repaso en jornadas de 30, 45, 60, 90, 150 y 180 minutos: comparación con la personalización real, incluyendo metadatos de duración antiguos en repasos.
- Parcial y lección compitiendo por jornadas de 30, 45, 60 y 90 minutos: misma carga que cabe y queda fuera antes y después de personalizar.
- Calendario con 90 minutos programados, 30 en conflicto: la representación contiene 60 válidos y 30 en riesgo.
- Recorridos generación → personalización → lectura → previsión con cuatro y seis asignaturas, entrando en septiembre, enero, el 31 de mayo y el 5 de junio. Cambios posteriores de días, minutos y fecha objetivo; parciales, conservación de la cola, ausencia de solapes, límites diarios y reserva final.
- Los recorridos usan el catálogo beta local y filas representativas publicadas de Inglés. Supabase está simulado en estas pruebas; no acreditan la integridad del catálogo de producción.
- Las regresiones de duración, sesiones extra y asignatura omitida fallan con la implementación anterior. Los archivos se restauraron al terminar la comprobación, sin usar stashes.

## Validación

- `test:camino`: 326/326, incluidas 28 pruebas nuevas.
- 150 peticiones concurrentes al handler real de resumen, con autenticación y base simuladas: identidad, asignaturas, carga y acceso aislados. También se comprueba fallo de lectura → HTTP 503 → reintento correcto. No es un benchmark de Vercel/Supabase.
- `test:onboarding`: 5/5.
- TypeScript sin errores; ESLint sin errores, con dos avisos preexistentes en la limpieza de metadatos de personalización.
- `next build --webpack`: correcto, con configuración pública ficticia de Supabase. No verifica credenciales ni servicios de producción.
- Invariantes de base de datos: correctas en PostgreSQL 16, en un contenedor nuevo y desechable. No se han aplicado migraciones a producción.
- Chrome real: recarga, resolución de avisos, cambio de cuenta con respuesta tardía, reintento, desplegable, copia limitada al trabajo registrado y barra sin doble conteo. Comprobación de desbordamiento a 320 y 390 píxeles; capturas revisadas en tema claro y oscuro.
- Diff revisado y sin errores de espacios.

## Límites que permanecen explícitos

La previsión estima carga del trabajo registrado y conserva las reservas existentes. No certifica haber aprendido el temario, ni predice una nota. No incorpora Google Calendar, ausencias futuras ni repasos todavía no generados. Las duraciones son objetivos de sesión, no tiempos individuales de aprendizaje medidos. Si un trabajo variable no encuentra hueco, su carga se estima con el primer slot diario.

Comprobación de solo lectura del 13/09/2026: las columnas necesarias y las cuatro RPC de fiabilidad están expuestas en la base configurada; hay 499 filas publicadas repartidas entre las nueve asignaturas habilitadas revisadas (incluidas 12 de Inglés). Las rutas de resumen y generación en www.kairo-pau.com responden 401 sin sesión. El resultado agregado está en `camino-readiness-2026-09-13.json`. Esto comprueba presencia y compatibilidad básica, no integridad académica ni que todas las migraciones se comporten correctamente en producción.

Queda por integrar y desplegar esta rama, verificar esa versión con cuentas de prueba y medir carga real en un entorno equivalente al de la beta. La prueba local de 150 solicitudes no sustituye esa medición. El piloto con alumnos permitirá medir duración real, bloqueos, abandono y utilidad académica. Estos resultados locales no sustituyen esa validación.

No se han cambiado las prioridades académicas, mastery, rescue ordering, umbrales 20/45, soluciones ni prompts. La copia principal y sus cambios ajenos se han mantenido separados.
