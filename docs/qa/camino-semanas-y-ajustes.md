# Camino: semanas futuras y guardado de disponibilidad

Fecha: 2026-09-14. Rama: `codex/camino-carga-real`.

## Problemas y cambios

El generador materializaba inicialmente treinta días de estudio. La lectura paginada que ya trae `main` evita perder filas existentes, pero navegar después de ese horizonte no solicitaba nuevas misiones. La semana del 19 al 25 de octubre podía aparecer casi vacía al comenzar el 14 de septiembre.

La navegación ahora solicita al servidor la semana visible (`throughDate`), espera la generación, personalización y lectura, y sustituye su caché por el calendario confirmado. Las peticiones se coordinan con la carga inicial y los reajustes. El servidor valida la fecha y limita la solicitud a un año; conserva el corte de temario, la PAU y el presupuesto diario. Las semanas pasadas siguen siendo historial. Una semana consultada sin trabajo programable se identifica como tal y no queda indefinidamente «Aún sin planificar».

Guardar Ajustes usa el coordinador compartido con reintentos por ocupación. El guardado de disponibilidad o de campos del perfil que afectan al plan deja un marcador persistente antes de responder. Si el alumno cierra Ajustes, una visita posterior a Camino recupera el reajuste sin pulsar otro botón. El marcador solo se retira tras terminar correctamente y si no hay un guardado posterior. Se elimina el botón de recálculo manual de Ajustes y se distingue entre guardado correcto, actualización pendiente y fallo al guardar el perfil.

Se corrige además el manejo del marcador con `checkedDb`: la lectura opcional usa el cliente sin envoltura para poder comprobar su error; el registro auxiliar captura excepciones y no sustituye el error original del plan.

## Validación

- `npm run test:camino`: 369/369. Incluye una reproducción con cuatro asignaturas, 480 actividades de 20 minutos, 180 minutos/día y seis días/semana. El POST inicial deja incompleta la semana de octubre; el POST con su fecha genera y personaliza las misiones hasta cubrir los días hábiles con trabajo disponible. Repetirlo no duplica trabajo.
- Reajuste pendiente tras cambiar de 180 a 30 minutos: una visita normal el mismo día lo aplica y retira el marcador.
- Solicitudes concurrentes de carga inicial y semana futura: la segunda conserva su horizonte; las duplicadas comparten espera.
- Fechas imposibles o fuera del límite: respuesta 400. Fallo al guardar el marcador con cliente comprobado: resultado auxiliar falso, sin excepción que oculte el resultado principal.
- Chrome, `node scripts/camino-qa/settings-browser.cjs`: página real de Ajustes con autenticación y transporte simulados. Un guardado de 180 × 6, cuatro respuestas 409 y después éxito; no hay botón de recálculo. Un fallo de perfil no anuncia éxito ni lanza otra actualización. Sin errores de JavaScript.
- `test:auth`: 57/57. `test:onboarding`: 5/5.
- TypeScript y compilación webpack de producción: correctos. ESLint: cero errores; 33 avisos en los archivos revisados.
- Lectura de esquema de la base configurada: `replan_pending_at` existe. Se usa la migración ya incorporada en `main`, `20260919220000_add_camino_replan_pending.sql`; este cambio no añade SQL.

## Alcance pendiente

Las pruebas de planificación usan una base en memoria con los módulos reales; la prueba de navegador simula las API. No constituyen una prueba de carga con 150 alumnos ni una verificación de la cuenta de la captura en producción. Tras integrar y desplegar la rama, comprobar en producción guardar disponibilidad y navegar a una semana posterior al horizonte inicial.

180 minutos son un máximo disponible, no una obligación de inventar actividades. Días de descanso, festivos, trabajo agotado o restricciones académicas pueden producir huecos legítimos. No se cambian mastery, prioridades académicas, umbrales 20/45 ni prompts.
