# Auditoría completa para beta pública — Kairo

**Fecha:** 2 de agosto de 2026
**Estado global:** 7 / 10 · No listo para cobrar
**Destinatario:** equipo de desarrollo

---

## Cómo leer esto

Cada pantalla tiene nota, lo que funciona y lo que falta. Los items van marcados:

- 🔴 **Bloqueante** — no se puede abrir la beta pública con esto sin resolver
- 🟠 **Importante** — no bloquea, pero cuesta usuarios o dinero
- 🟡 **Pulido** — mejora, no urge

Una regla que sale de la auditoría: **casi todos los fallos encontrados eran código correcto que nadie verificó de punta a punta**. No había errores de programación. Había funcionalidades construidas y nunca probadas. Tenedlo en cuenta al cerrar cada item: no basta con escribirlo, hay que verlo funcionar.

---

## 0. Bloqueantes que no son código

Esto va primero porque nada de lo demás importa si no está.

| | Estado |
|---|---|
| 🔴 Alta de autónomo o sociedad | **Sin hacer.** Sin NIF no hay aviso legal válido y cobrar es infracción de LSSI |
| 🔴 Rellenar `[PENDIENTE]` del aviso legal | 6 campos pintados en naranja en producción ahora mismo |
| 🔴 Vercel plan Pro (20 €/mes) | Hobby **prohíbe uso comercial**. Violación el día que se activa Stripe. Además sube el límite de funciones de 10 s a 60 s |
| 🔴 Supabase plan Pro (25 €/mes) | Free: 500 MB y el proyecto se pausa por inactividad |
| 🔴 Probar el flujo completo en móvil real | **Nunca se ha hecho.** Registro → onboarding → foto de ejercicio → corrección. Es por donde entrarán casi todos |

---

## 1. Landing (`/`) — 7,5/10

**Funciona:** identidad visual fuerte (negro, Bebas, naranja, fotografía editorial). Imágenes optimizadas de 1,63 MB a 86 KB en escritorio y 59 KB en móvil. Open Graph configurado. `sitemap.ts` y `robots.ts` añadidos.

**Falta:**
- 🔴 **Cifras sin verificar.** Dice "8,4 en Mat. II · Antes: 5,1" y `platformStats.ts` declara "1.200+". Si no se pueden respaldar con datos reales, es publicidad engañosa (Ley de Competencia Desleal). Con Stripe activo y menores de por medio, la exposición es real. **Decisión requerida: verificar o retirar.**
- 🟡 15,5 MB de imágenes sin usar en `public/brand/`, una de 5,7 MB. No afectan al runtime, sí al peso del repo y de cada despliegue.

---

## 2. Login (`/login`) — 9/10

**La mejor pantalla del producto.** Negro, lámpara naranja, "ESTUDIA MENOS. SACA MÁS NOTA." La marca está clarísima. Google OAuth funciona.

**Falta:**
- 🔴 Los datos "1.200+ / 38 / <30s" — mismo problema de verificación que la landing, y aquí son distintos de los de la home. Unificar y respaldar.
- 🟡 Contraste bajo en esas cifras; si se quedan, merecen más protagonismo.

---

## 3. Onboarding (`/onboarding`) — 7,5/10

**Funciona:** 8 pasos, recoge comunidad, asignaturas, exámenes parciales, minutos y días de estudio, y sensación de preparación. Todo eso **sí se lee** después (personaliza el Camino y el tono del tutor).

**Falta:**
- 🟠 Nunca probado en móvil de principio a fin.
- 🟡 Sin medición de abandono por paso. No se sabe dónde se cae la gente.

---

## 4. Camino (`/camino`) — 6,5/10

Es la pantalla principal del producto y la que más deuda acumula.

**Funciona:** misión del día clara, próximas misiones numeradas, ligas, XP, avance por asignatura, nota proyectada. `ensure-calendar` ahora se ejecuta **una vez al día por usuario** en vez de en cada carga (era el mayor cuello de botella). El badge de ranking ya muestra el puesto real.

**Falta:**
- 🔴 **Dos generadores de calendario conviviendo.** Hay un generador en servidor (`ensureCaminoCalendar`) y otro en cliente (`generateCalendar` dentro de `CaminoCalendarClient`). Ambos escriben el mismo calendario. Con pocos usuarios las discrepancias pasan desapercibidas; con miles se convierte en "mi Camino ha cambiado solo". **Hay una métrica `calendar_source` instrumentada: dejadla correr unos días, ved cuál gana en la práctica y matad el otro.** Es el item técnico más importante que queda.
- 🟠 **La racha aparece con dos valores distintos** en la misma pantalla: "0" en el héroe y "—" en la columna derecha. Una de las dos lee mal.
- 🟡 El fondo del héroe resta contraste al número de días. Oscurecer un 10-15 %.
- 🟡 Las barras de "Tu avance" no distinguen ir adelantado de ir retrasado. Un código de color daría lectura instantánea.

---

## 5. Ejercicio / Tema (`/camino/tema/...`) — 8/10

**Funciona:** corrección por foto o texto, editor con símbolos matemáticos (acierto grande), desglose de puntos, XP solo tras confirmación del servidor. Compresión de imagen a 1568 px con calidad 0,85. **Reintento automático ante saturación de la IA** con mensaje honesto en vez de error genérico.

**Falta:**
- 🟠 **El header ocupa un tercio de la pantalla** cuando el alumno va a resolver. Debería colapsar al empezar el ejercicio.
- 🟠 Sin probar en móvil: hacer foto a un ejercicio manuscrito desde el teléfono es **el flujo central del producto** y no se ha validado nunca en un dispositivo real.
- 🟡 Modo inmersivo tipo examen (ocultar barra lateral).

---

## 6. Exámenes (`/examenes`) — 8/10

**Funciona:** vista dividida enunciado/feedback, filtros por año, convocatoria, pregunta y opción. Subrayado. Ejercicios oficiales reales.

**Falta:**
- 🟠 Mismo problema de header alto.
- 🟡 Iconos por asignatura en las píldoras de filtro para identificación rápida.

---

## 7. Simulacros (`/simulacros`) — 6/10

**Funciona:** configuración por asignatura, tipo normal / peores notas / personalizado, detección automática de puntos débiles.

**Falta:**
- 🔴 **Los datos no cuadran: "0.16 media" y "4 min tiempo medio" sobre 8 simulacros.** Cuatro minutos por simulacro completo es imposible. O son datos de prueba contaminando la vista, o la puntuación está rota. **Investigar antes de la beta:** si un alumno real ve una media de 0,16, se va.
- 🟠 Sin caché en el endpoint de ranking asociado.

---

## 8. La Zona (`/zona`) — 5/10

**Funciona:** estructura clara de tres acciones (repasar, crear, mi espacio), filtros por asignatura, flashcards generadas del historial.

**Falta:**
- 🔴 **La tarjeta activa sale vacía.** En la captura solo se ve "Consejo PAU" y "toca para girar", sin contenido. Con 0/22 repasadas. Está roto o el estado vacío es indistinguible de un fallo.
- 🟡 La tarjeta flota sin contenedor. Un borde o sombra la haría sentir un objeto físico.
- 🟡 **Decisión de producto pendiente:** hay un mockup que convierte La Zona en un gestor de archivos tipo Quizlet (materiales, carpetas, estadísticas). **Recomendación: no construirlo.** Optimiza para organizar en vez de estudiar, y compite con la tesis del Camino ("no pienses qué hacer, te digo qué toca hoy").

---

## 9. Tutor (`/examenes?view=chat`) — 8/10

**Funciona:** chat limpio, acciones rápidas que evitan el lienzo en blanco, contexto de asignatura y nivel, tono adaptado según `preparation_feeling` del onboarding. Reintento ante saturación.

**Falta:**
- 🟡 Avatar propio del bot en vez del logo de Kairo.
- 🟡 **Idea con recorrido:** tutor proactivo. Si el alumno falla una misión o marca "no me la sé" tres veces seguidas, ofrecer explicación sin que tenga que ir a buscarla.

---

## 10. Historial (`/examenes?view=historial`) — 5,5/10

Visualmente la pantalla mejor construida. Conceptualmente la más problemática.

**Funciona:** el promedio **sí normaliza** correctamente — `(nota / nota_maxima) * 10`, así que un 4,8/5 cuenta como 9,6. Buena densidad, evolución temporal, asignaturas a reforzar.

**Falta:**
- 🔴 **`page-client.tsx` línea 5781: "¡Sigue así! Vas por buen camino." está escrito a fuego.** Se imprime siempre, sin mirar ninguna nota. En producción aparece con un 1,1 de media y justo encima de "corrige algunos ejercicios más para ver tendencias". La app felicita a alguien que va mal y admite acto seguido que no tiene datos. Destruye la credibilidad de todo lo que diga el resto de la interfaz.
- 🟠 **Muro de rojo.** Casi todo a 0/10, tres asignaturas a 0.0, promedio 1,1. Es el sitio al que vas a ver tu progreso y dice "eres malo en todo". Para un chaval de 17 con ansiedad de PAU es un botón de cerrar la app. No mentir con los números: enmarcarlos. Cuántos ejercicios lleva, qué ha mejorado, qué bloque atacar mañana.
- 🟠 **Escalas mezcladas en la lista.** Se ven "0/2,5", "4,8/5", "0/1,25" mientras las medias van sobre 10. El alumno no puede reconciliarlo. Mostrar todo normalizado o poner la equivalencia.
- 🟠 **Medias de una sola muestra con el mismo peso visual.** "Mates CCSS 7,5" viene de **1 corrección** y aparece igual de destacada que "Mates 1,1" de 79. Parece su mejor asignatura y es ruido. Atenuar o marcar "pocos datos" por debajo de 3-4 correcciones.
- 🟠 **"Percentil P50"** — verificar contra qué población se calcula. Si es contra usuarios de prueba, el número no significa nada y es de los que sí se creen.

---

## 11. Planning (`/planning`) — sin evaluar

No se revisó en esta auditoría. Requiere pasada propia.

---

## 12. Ajustes (`/settings`) — 8/10

**Funciona:** username único con comprobación en vivo, comunidad, curso, objetivo diario, días de Camino, minutos por día, estilo de corrección, recordatorios por email. Al guardar preferencias de estudio fuerza el recálculo del Camino (`force: true`), así que el cambio se nota de inmediato.

**Falta:**
- 🟡 Verificar en móvil que los selectores se usan bien.

---

## 13. Ayuda (`/ayuda`) — 9/10

Explica las seis secciones y el sistema de XP mejor de lo que lo haría la mayoría de productos con equipo de contenido dedicado. Poco que tocar.

---

## 14. Pricing (`/pricing`) — 7/10

**Falta:**
- 🟠 **Decisión de negocio pendiente:** `FOUNDING_DEADLINE_DATE` está en **1 de septiembre**. Si se va a anunciar el precio de 59 € durante todo agosto en TikTok, esa fecha tiene que cuadrar con lo que se prometa. Cambiarla en Vercel mueve precio, email y cobro a la vez.

---

## 15. Waitlist (`/waitlist`) — 8/10

**Funciona:** formulario, límite de 5 registros por IP y hora, código de referido único, emails de confirmación y de recompensa. Datos en la tabla `waitlist` con RLS activo y sin políticas — solo service role, correcto.

**Corregido el 2 de agosto:** el precio bloqueado **ahora sí se respeta**. Antes se guardaba `price_locked` por persona (59 € base, 49 € con 1 referido, 39 € con 3), se comunicaba por email con asunto "Plaza reservada — Curso PAU a X €"… y ningún checkout lo leía. Se prometía un precio y se cobraba otro. Ahora ambos checkouts cobran **el menor** entre el vigente y el prometido, y queda rastro en `billing_events`.

**Falta:**
- 🟠 Si se anuncia "plazas limitadas", **poner un número real y respetarlo**. Afirmar disponibilidad limitada sin serlo está en la lista negra de prácticas desleales de la directiva europea: no admite defensa, basta con que sea falso. Además "quedan 43 plazas" convierte mejor que "limitadas".

---

## 16. Invitación a liga (`/liga/[codigo]`) — 8,5/10

**Funciona:** restilada al ADN de Kairo (negro, Bebas, naranja). Tarjeta de Open Graph propia con el código de liga, así que compartir por WhatsApp ya no muestra una URL pelada. Imagen de fondo servida en 26 KB en móvil. RLS cerrado: un no-miembro solo ve nombre y número de miembros.

---

## 17. Checkout (alumno y padres) — 8/10

**Funciona:** casilla obligatoria de renuncia al desistimiento antes de pagar, registro server-side de la aceptación con versión del documento (TRLGDCU art. 103.m), bloqueo de doble pago, rate limiting, precio bloqueado de waitlist respetado en ambos flujos.

**Falta:**
- 🟠 Probar el flujo de padres completo en móvil: enlace con token → página → pago.

---

## 18. Confirmación de email (`/confirmar-email`) — 7/10

**Funciona:** Resend con dominio propio, página con reenvío y cooldown de 60 s, redirección a `/onboarding` con sesión iniciada.

**Falta:**
- 🟠 **Verificación end-to-end pendiente.** Concretamente el caso 4: **intentar iniciar sesión con una cuenta sin confirmar debe fallar**. Los otros tres pasos comprueban que la experiencia es fluida; ese comprueba que la cuenta está realmente bloqueada. Sin él, todo el sistema puede ser decorativo.
- 🟡 Al pulsar el enlace hay un parpadeo de medio segundo. Se intentó arreglar dos veces sin éxito. Posible causa: sesiones mezcladas del navegador durante las pruebas. Reproducir en ventana de incógnito limpia antes de invertir más tiempo.

---

## 19. Páginas legales — 6/10

**Funciona:** términos, privacidad, aviso legal, reembolsos, política de IA, sección de desistimiento distinta de la de reembolsos, versionado de documentos, consentimiento RGPD registrado en `billing_events` al registrarse. Comentario en `layout.tsx` avisando de que añadir cualquier analítica de terceros obliga a banner de cookies.

**Falta:**
- 🔴 6 campos `[PENDIENTE]` en el aviso legal: razón social, NIF, domicilio, datos registrales. Visibles en producción, pintados en naranja.

---

## 20. Emails transaccionales — 5/10

**Falta:**
- 🔴 **10 ficheros con `https://empresa-pau.vercel.app` escrito a fuego.** Están en `sendEmail.ts`, `emailTemplate.ts`, los cuatro `send*Email.ts`, `unsubscribe/route.ts` y dos `ctaUrl` de `daily-reminder`. Es **otro origen** que `kairo-pau.com`: el alumno que pulsa "Ver mi misión" en el correo de recordatorio aterriza donde no tiene sesión y se le pide entrar otra vez. En un email de reenganche, eso es justo el usuario que intentabas recuperar. Sustituir por `process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'`, que es el patrón que ya usan `informe/link` e `informe/[token]`.

---

## 21. Panel de administración — 8/10

**Funciona:** `/admin/camino-status`, `/admin/metrics`, y **`/admin/schema-drift`** (nuevo, 2 de agosto): compara el esquema real de producción con lo que el código espera. Detecta tablas, columnas y funciones que falten, y políticas RLS con lectura abierta.

**Regla operativa a mantener:** cuando se escriba una migración que el código necesite, **añadir también la entrada en `app/lib/schema/expectedSchema.ts`**. Si no está en esa lista, el detector no puede avisar.

**Abrir `/admin/schema-drift` antes de cada despliegue importante.** En su primera ejecución encontró un fallo de cuatro días atrás.

**Falta:**
- 🟡 `/api/admin/camino-content` no lo llama nadie. Puede que se use manualmente; confirmar y borrar si no.

---

## 22. Transversal — lo que afecta a todo

### Escalabilidad

**Resuelto el 1-2 de agosto:** los cuatro crons de email solo veían los primeros 1.000 usuarios y enviaban de uno en uno cortándose a mitad — ahora paginan, envían en lotes de 20 y son reanudables vía `email_events`. El ranking global estaba capado a 500 puestos. `ensure-calendar` se ejecutaba en cada carga.

**Pendiente:**
- 🔴 Los dos generadores de Camino (ver sección 4)
- 🟠 `close-liga-round`: `.limit(50_000)` con bucles anidados en memoria. Mensual, pero a 10.000 usuarios procesa mucho de una vez
- 🟠 `/api/camino/leaderboard` sin caché (el global sí la tiene, 60 s)
- 🟡 `myRank` se calcula en `/api/ligas/global` y la interfaz no lo usa. Ojo si se conecta: el top usa rango por índice de array y `myRank` usa `COUNT`, así que con empates darían cifras distintas

### Límites de la API de Anthropic

Los límites son **por organización**, no por usuario: todos los alumnos comparten el mismo cupo de tokens por minuto. Una corrección con foto son ~2.500 tokens de entrada.

| Nivel | Correcciones/min en toda la plataforma |
|---|---|
| Tier 1 | ~8 |
| Tier 3 | ~32 |
| Tier 4 | ~320 |

Los niveles suben solos con el gasto acumulado. **No hay nada que optimizar en código**, es gestión de cuenta. El riesgo real no es septiembre con 10.000 alumnos: es un TikTok que funcione y meta 500 personas de golpe estando en Tier 2. El reintento ya está implementado.

### Observabilidad — 3/10

**El mayor hueco estructural.** Si mañana un cron deja de enviar, si las correcciones tardan quince segundos, o si un endpoint falla al 5 % de los alumnos, nadie se entera. Vercel Pro lo trae incluido: activarlo.

### Móvil

🔴 **Sin probar.** Todas las revisiones hechas hasta ahora han sido sobre capturas de escritorio. Los alumnos entrarán desde el teléfono.

---

## Orden recomendado de trabajo

**Semana 1 — desbloquear**
1. Alta de autónomo y rellenar los `[PENDIENTE]` del aviso legal
2. Vercel Pro y Supabase Pro
3. Los 10 enlaces de email al dominio correcto
4. Frase fija del historial (línea 5781) y racha con dos valores en el Camino
5. Investigar los datos de simulacros (0.16 media / 4 min)
6. Tarjeta vacía de La Zona

**Semana 2 — verificar**
7. Flujo completo en móvil real, iPhone y Android
8. Confirmación de email end-to-end, sobre todo el bloqueo de login sin confirmar
9. Decidir y verificar las cifras de marketing de landing y login
10. Decidir `FOUNDING_DEADLINE_DATE` y cuadrarla con lo que se anuncie

**Después de septiembre**
11. Unificar los dos generadores de Camino con los datos de `calendar_source`
12. Header colapsable en ejercicios y simulacros
13. Replantear el historial para que informe sin desmoralizar
14. `close-liga-round` y caché del leaderboard

---

## Nota final

El producto tiene más funcionalidad de la que necesita para lanzar. Lo que separa esto de un 9 no son features: es **verificación y observabilidad**. Todos los fallos serios encontrados en esta auditoría eran código correcto que nadie miró funcionando de punta a punta.

Con el alta hecha y las alertas activadas, el producto se pone en 8 sin escribir una línea de código.
