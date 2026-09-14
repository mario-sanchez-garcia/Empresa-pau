# Carga de semanas pendientes — 2026-09-14

## Caso observado

La captura del 30 de noviembre al 6 de diciembre muestra «Preparando las misiones de esta semana…» junto a días rotulados «Repaso libre». La captura demuestra que había una petición pendiente; por sí sola no permite concluir si terminaría ni si los huecos persistirían en la cuenta.

## Problemas reproducidos y corregidos

- Navegar rápidamente por varias semanas encolaba un recálculo completo por salto. Ahora hay como máximo una petición activa y una pendiente por sesión. La pendiente acumula el horizonte más lejano y conserva cualquier guardado forzado. Una pausa de 250 ms evita solicitar semanas por las que solo se pasa.
- La siembra repetía reservas, eventos, preferencias, historial de horarios y disponibilidad externa por cada día. Ahora prepara los planificadores diarios con una lectura paginada del rango, una de eventos y una del perfil de horarios. Google se consulta una vez por rango. La fotografía se toma después de las escrituras anteriores y dentro del bloqueo de planificación.
- Los días vacíos distinguen planificación pendiente, carga, fallo, resultado confirmado, descanso y festivo. No se anuncia «Repaso libre» como sustituto de misiones que aún no han llegado.

## Pruebas

- `test:camino`: 377/377, incluida la reproducción con el currículo real a 180 × 6 y la navegación a semanas posteriores.
- Comparación de 30 planificadores diarios: mismos huecos y presupuesto que antes, incluyendo misiones manuales, completadas, sin hora, eventos recurrentes y disponibilidad externa. Máximo tres lecturas del nuevo bloque frente a al menos 150 del anterior; este recuento no representa todas las consultas del endpoint.
- Varias semanas solicitadas mientras hay una carga activa: solo una petición posterior con la fecha más lejana y `force` preservado.
- Error de lectura: se propaga, no se convierte en disponibilidad libre.
- Estados de celdas vacías comprobados por comportamiento; reemplazan la anterior prueba de cadenas del componente.
- TypeScript, `test:calendar`, compilación webpack y ESLint sin errores. ESLint conserva 31 avisos en los archivos revisados.

## Límites

No se ha medido la latencia de la cuenta de la captura ni certificado que sus huecos desaparezcan. La mejora reduce trabajo repetido; no crea contenido académico ficticio ni modifica el nuevo reparto de temario. Para cerrar el caso individual hay que identificar la cuenta y comprobar su disponibilidad efectiva, la respuesta de planificación y las filas de esa semana tras el despliegue.
