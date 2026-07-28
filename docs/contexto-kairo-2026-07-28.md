# Kairo — Documento de Contexto

Producto, negocio, marketing y próximos pasos. Todo lo esencial en un solo documento.

*Elaborado a partir del estado real del código, el historial de commits y las auditorías internas del proyecto · 28 julio 2026*

---

## 0. Resumen ejecutivo

Kairo es una plataforma web de preparación para la **PAU/EBAU** (selectividad española) dirigida a estudiantes de 17-18 años en Madrid y Cataluña. Genera misiones de estudio diarias, corrige ejercicios con IA, simula exámenes completos oficiales y hace seguimiento del progreso hacia la nota final. Los padres son un usuario secundario que sigue el avance mediante un enlace de informe compartido.

El producto tiene profundidad real: **492+ archivos de código y 658 commits**. La marca se posiciona como un *"compañero de estudio serio"* — cercano a Linear en sobriedad, deliberadamente alejado de la estética gamificada tipo Duolingo o del "SaaS + IA" genérico.

**Estado actual:** beta cerrada, no lista todavía para cobro público. Dos auditorías internas consecutivas (17 jun y 5 jul 2026) coinciden: el producto no necesita más funcionalidades, necesita **consistencia de precios, cierre de Stripe en modo live, y QA real con alumnos**. Desde la última auditoría (5 jul) ha habido avances concretos: límites de facturación conectados a gamificación, gestión de cancelaciones y pagos fallidos de Stripe, corrección de doble cobro en ejercicios repetidos, y refuerzo de seguridad en la corrección de Camino (movida a servidor).

---

## 1. Producto — qué hace Kairo

Bucle principal: **onboarding → Camino PAU (misión diaria) → corrección IA → XP/racha → simulacro periódico → informe de progreso**.

**Onboarding**
Comunidad (Madrid/Cataluña/otra), centro, asignaturas, nivel autopercibido y disponibilidad semanal. La beta limita las asignaturas activas a **Matemáticas II, Matemáticas CCSS, Lengua Castellana e Historia de España**; el resto aparece marcado "Próximamente".

**Camino PAU**
El núcleo del producto. Ruta de misiones diarias por tema: explicación en vídeo, ejemplo guiado y ejercicio EVAU corregido por IA. Otorga XP y racha, detecta "áreas débiles" (<60% en ≥2 intentos) e inyecta repasos automáticos. Calendario semanal navegable.

**Simulacros**
Exámenes completos con enunciados oficiales reales (EBAU Madrid / PAU Cataluña, 2015-2025). Corrección por bloques en paralelo contra rúbrica oficial, con nota final, desglose, errores y plan de repaso. Límite de 1/día más cuota mensual según plan.

**Chat con Kairo**
Tutor IA conversacional. Corrige ejercicios por texto o foto, renderiza LaTeX y añade una explicación pedagógica ("¿por qué es así?").

**Planning / calendario**
Plan de estudio semanal generado por IA, mostrado como misiones pendientes/completadas en un calendario.

**Ligas**
Gamificación social ligera: grupos por código de 6 caracteres, ranking semanal por XP acumulado. No es el eje central del producto.

**Informe para padres · Centro Pulso · Proyección de nota**
Enlace firmado y temporal con progreso semanal para padres (sin login). Comparativa anónima con la mediana de otros alumnos del mismo centro (mínimo 3 alumnos, por privacidad). Estimación de nota final PAU a partir del historial de simulacros.

**La Zona · Panel admin interno**
Flashcards/canvas — feature experimental, no crítica. Panel interno (acceso por lista de emails) con métricas de uso y coste de IA, funnel de simulacros y estado de facturación.

---

## 2. Negocio y monetización

| Plan | Precio | Qué incluye / límites |
|---|---|---|
| **Free** | 0 € (prueba 7 días) | 25 correcciones/mes, 3 fotos, 1 parcial, 0 simulacros, 2 días de estudio/semana. Pasado el plazo, se bloquean las rutas de IA. |
| **Pack Curso PAU** (principal) | Pago único · precio "fundador" con fecha límite, luego precio estándar más alto | Acceso completo desde la compra hasta el 30 de junio del curso académico. Es la oferta central que se vende también a los padres (ver abajo). |
| Premium / Intensivo / Superpremium | Mensual, escalonado | Niveles adicionales definidos en el código para testear apetito de precio; cuotas crecientes de correcciones, fotos y simulacros. No todos con Stripe conectado por igual todavía. |

**Mecanismo distintivo: Parent Checkout**
El propio estudiante genera un enlace de pago seguro (token de un solo uso, expira en 7 días) para que sus padres compren el Pack Curso PAU sin que el estudiante gestione tarjeta ni datos de pago. Es la palanca de conversión familiar del producto: el adolescente activa el proceso, el padre paga.

> **Punto de atención repetido en las dos últimas auditorías internas:** ha habido inconsistencias de precio entre `/pricing`, la landing y el servidor de facturación (por ejemplo, distintas cifras mostradas para Premium o para el Pack). Es el bloqueante **#1** antes de cobrar en producción, aunque el commit reciente *"billing+gamification: billing limits"* (semana del 21 jul) sugiere que ya se está trabajando en unificarlo.

Lo que ya funciona bien y está validado: checkout tokenizado, webhook de Stripe firmado e idempotente, cancelación de suscripción y pagos fallidos gestionados (commit reciente), entitlements que solo se activan desde el webhook (nunca desde el cliente).

---

## 3. Marketing y crecimiento

**Landing y posicionamiento**
Testimonios de alumnos, tabla comparativa frente a academias (100-200 €/mes) y frente al autoestudio, y cifras de catálogo (miles de ejercicios, 38 semanas de currículum, corrección en menos de 30 segundos, más de 10 años de exámenes oficiales). Marca: sobria, sin gradientes "IA-púrpura" genéricos, sin ilustración infantil.

**Waitlist con precio por referidos**
Antes del lanzamiento de pago, la captación funciona con email + comunidad + curso → código único (`KAIRO-XXXXXX`). Cada referido válido baja el precio bloqueado del propio usuario: **59 € → 49 € con 1 referido → 39 € con 3 referidos**, con email automático de "bajada de precio". Es hoy el único mecanismo de referidos activo — no existe un programa de referidos para usuarios que ya pagan.

**Emails de ciclo de vida** (automatizados vía Vercel Cron)
- **Recordatorio diario** — 16:00, todos los días excepto sábado, si queda misión pendiente.
- **Aviso de racha en riesgo** — 19:30 lunes a viernes.
- **Reenganche** — 09:00 lunes a sábado, a los 3 días exactos de inactividad.
- **Resumen semanal** — viernes 16:00.

Baja de la lista con token firmado (unsubscribe de un clic). Sin este tipo de retención automatizada por email, el producto dependería solo de la fuerza de la racha/gamificación dentro de la app.

---

## 4. Estado técnico (resumen)

**Stack:** Next.js 16 (App Router) + React 19 · Supabase (auth, base de datos, RLS) · Stripe · Anthropic Claude (Sonnet) para toda la IA · Resend para email · Vercel (hosting + cron jobs).

**Seguridad, lo que ya funciona:** rutas de IA protegidas con Bearer token y rate limiting; RLS de Supabase aplicado vía JWT de usuario; checkout con token hasheado (SHA-256), nunca en texto plano; panel admin restringido por lista de emails, no por parámetro de URL.

**Lo que falta cerrar:** cabeceras CSP más completas, auditoría fila-por-fila de las políticas RLS ya en producción (no solo en migraciones), y reducir la confianza en datos enviados desde el cliente para XP/progreso — hoy el cliente todavía puede influir más de lo ideal en el historial y las tareas completadas de Camino.

> **Nota operativa real:** hubo un incidente donde el nombre de una variable de entorno (`SUPABASE_SERVICE_KEY` vs. `SUPABASE_SERVICE_ROLE_KEY`) rompía en silencio el webhook de Stripe en local. Vale la pena una verificación explícita periódica de variables de entorno en Vercel antes de cualquier prueba de pago real.

---

## 5. Qué queda por hacer desde aquí

### 🔴 P0 — antes de abrir beta pública o cobrar en serio

1. **Unificar precios y copy** en `/pricing`, landing y servidor de facturación — señalado en dos auditorías seguidas.
2. **Cerrar Stripe en modo live** + política de reembolsos y soporte definida.
3. **Auditar RLS de Supabase tabla por tabla en producción** y confirmar variables de entorno en Vercel.
4. **Reforzar cabeceras CSP** y limpiar los errores reales de lint (excluyendo carpetas de herramientas internas del linting).
5. **Reducir la confianza en datos del cliente** para XP, progreso e historial de Camino.
6. **Unificar el motor de Camino PAU**: hoy conviven una lógica local/cliente y una lógica Supabase con cobertura de asignaturas distinta (Supabase cubre sobre todo Matemáticas II e Historia de España) — riesgo de que la personalización prometida no se cumpla igual para todos los alumnos.
7. **QA académico manual**: 15-30 ejercicios reales corregidos por IA en cada asignatura que se vaya a prometer, incluyendo fotos.

### 🟡 P1 — antes de escalar a más alumnos/asignaturas

- Ampliar la cola/calendario de Supabase a todas las asignaturas ofrecidas en onboarding (hoy limitada en la práctica a Matemáticas II e Historia de España).
- Etiquetado más determinista de ejercicios EVAU por tema, para reducir los casos de "fallback" a otro tema.
- Tracking real de coste de IA por modelo/ruta, con límites de plan aplicados de forma homogénea en correcciones, fotos, parciales, simulacros y chat.
- Métricas de producto que hoy no existen: retención Day-2, misiones completadas por alumno, coste IA por alumno — actualmente solo hay eventos de uso de IA y de facturación, no de aprendizaje.
- Decidir y comunicar públicamente qué asignaturas se prometen desde el lanzamiento.

### 🔵 P2 — más adelante

- Completar contenido de Física, Química, Filosofía, Inglés y Biología.
- Ranking/ligas más avanzado y panel de administración de contenidos académicos (hoy depende de scripts/seeds, no de una herramienta).
- Exportaciones en PDF, canvas colaborativo real en La Zona, carga dinámica de datasets grandes para aligerar el rendimiento del cliente.

---

## 6. Decisiones de negocio pendientes

No son tareas técnicas — son decisiones que solo puede tomar el equipo fundador:

1. ¿Se cobra en septiembre o se abre antes una beta pública gratuita para validar retención?
2. ¿Qué asignaturas se prometen en landing y onboarding desde el primer día?
3. ¿Qué significa exactamente "tema completado": leer la teoría, entregar un ejercicio, recibir corrección, o aprobar el ejercicio EVAU?
4. ¿Ligas/ranking es parte del núcleo de la propuesta de valor o una mejora secundaria que puede esperar?
5. ¿El Parent Checkout sigue siendo la palanca de crecimiento principal, o conviene reforzar el sistema de referidos de la waitlist para usuarios ya activos?

---

*Documento generado a partir del código fuente, historial de commits y auditorías internas del repositorio (`docs/`) a fecha de 28 de julio de 2026. Las cifras de precio y los porcentajes de estado reflejan el snapshot más reciente encontrado en el código y en la documentación interna — conviene reconfirmarlas contra Stripe y Supabase en producción antes de usarlas de cara a inversores o socios externos.*
