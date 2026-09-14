# Actualización de Camino: busy-409

13 de septiembre de 2026. Síntoma comunicado: aviso persistente de actualización pendiente con código `busy-409`.

## Evidencia

`ensure-calendar` devuelve 409 cuando otra ejecución posee el lease del alumno. El cliente hacía tres intentos con solo 1 + 2 segundos de espera, aunque la ruta puede durar hasta 300 segundos. El montaje, la recuperación de calendario vacío y los botones podían llamar sin coordinación. La previsión tenía además su propia implementación de la llamada.

En la base configurada, a las 20:16 UTC solo había un bloqueo caducado desde la mañana, no uno activo. Se comprobó la recuperación de un lease caducado: `camino_claim_plan` devolvió booleano true y el propietario coincidió con el identificador de la prueba. Se liberó exclusivamente ese lease mediante su propietario. No se modificaron misiones, preferencias ni progreso. Esta comprobación no identifica qué ejecución originó el 409 de la captura.

## Arreglo

- Una promesa compartida por token evita que llamadas simultáneas de una sesión compitan por el bloqueo.
- Si llega una petición forzada durante una normal, se ejecuta después. No se pierde la intención de aplicar cambios de disponibilidad.
- Los 409 tienen hasta ocho intentos, con espera progresiva acotada (54 segundos de espera total si las respuestas son inmediatas). Los fallos genéricos mantienen tres intentos. Cada petición tiene un límite superior al máximo del servidor.
- La previsión usa el mismo coordinador que la carga y el botón de reintento.
- Mientras se espera se muestra que Camino está actualizándose. Un bloqueo persistente termina como actualización pendiente, no como corrupción del plan.
- Se elimina la afirmación no verificable de que nada cambió durante un fallo. Una lectura correcta de plan-status ya no borra un fallo del planificador; una actualización correcta sí lo retira.
- Se conserva el lease y su política de propiedad. No se desactiva ni se libera un bloqueo de otro proceso.

## Pruebas

355 pruebas de Camino correctas. Incluyen llamadas simultáneas, peticiones forzadas en cola, aislamiento de sesiones, recuperación tras cuatro 409, espera acotada, reintento tras fallo y ruta HTTP real con contendiente 409 y posterior éxito al liberar el propietario (base simulada).

Chrome con componentes reales y transporte simulado: fallo 503 visible incluso tras focus, seguido de cuatro 409 y éxito con recarga. TypeScript, ESLint y build verificados.

## Alcance

Hace falta desplegar el commit para que el navegador del alumno reciba el arreglo. No se verificó la actualización completa dentro de su sesión de producción: el navegador de Codex no tenía esa sesión abierta. El aviso de 11,3 horas sin encajar tiene sus propios motivos por actividad; un 409 no demuestra por sí solo falta de capacidad académica.
