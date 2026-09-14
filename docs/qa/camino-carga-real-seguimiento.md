# Camino: seguimiento del presupuesto por minutos

Revisión del 13 de septiembre de 2026, sobre `main` ae91c25.

## Fallos corregidos

- El rellenado consideraba completo cualquier día con una misión y terminaba al encontrar treinta días ocupados. Ahora examina los primeros treinta días de estudio y deja que el scheduler descuente minutos y reservas reales de todas las fuentes. Reproducción: 180 min diarios, una misión de 20 min y ocho pendientes de 20; antes quedaba una misión ese lunes, ahora caben las nueve sin solaparse. Se prueba también con treinta fechas ya ocupadas.
- Una fila con hash vigente pero modelo de duración antiguo podía activar la reparación diaria y después saltársela dentro de la personalización. El retorno `already_current` también exige no necesitar actualización de duración. La siguiente llamada vuelve a ser idempotente.
- La cola pendiente se lee con paginación y errores explícitos. Una lectura fallida ya no se interpreta como un plan sin trabajo pendiente. Se conserva el orden académico existente.
- Las duraciones de referencia siguen identificándose como estimaciones después de programarse. El horario reservado no es una medición del tiempo de aprendizaje.

## Validación

- `test:camino`: 349 pruebas. Las reproducciones del día infrautilizado (uno y treinta días existentes) y la pérdida de la etiqueta de estimación fallaron antes del arreglo.
- Recorridos generación → personalización → lectura → previsión: cuatro, seis y diez asignaturas, distintas disponibilidades y fechas; nueve asignaturas con entrada tardía. Las asignaturas sin fallback usan todas sus identidades del catálogo local, no solo tres muestras. Supabase simulado: esto no certifica el contenido publicado en producción ni la preparación académica.
- Regresiones de solape y exceso de presupuesto con el mismo hash: reparación sin `force`, conservación de lo manual e idempotencia posterior.
- Acceso beta: las recomendaciones combinadas no superan sus seis días. Un parcial vencido conserva su motivo aunque sobren horas hasta la PAU.
- Chrome con componentes reales y transporte simulado: recarga, cambio de cuenta, avisos que aparecen/desaparecen, recomendaciones combinadas, detalle de parcial vencido y botón de recolocación (409 → reintento → éxito → recarga). Sin desbordamiento a 320/390 px.
- TypeScript y ESLint sin errores. Compilación de producción comprobada aparte del despliegue.

## Límites que permanecen

Este cambio no certifica un calendario de producción concreto. Hay que integrar/desplegar la rama y comprobar la cuenta de la captura para confirmar sus cifras finales. No incluye backfill masivo ni migraciones nuevas.

La duración por tipo es una referencia cuando falta una estimación específica del contenido. Debe calibrarse con actividad real de alumnos y revisión docente; no se reducen minutos para que la previsión dé verde. La previsión sigue excluyendo Google Calendar, ausencias futuras y repasos aún no creados, como indica la interfaz. Caber en tiempo no garantiza dominar las asignaturas.
