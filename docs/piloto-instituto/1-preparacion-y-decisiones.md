---
title: "Piloto en el instituto: ¿estamos preparados?"
subtitle: "Informe de preparación y decisiones pendientes · 150 alumnos de 2º de Bachillerato"
author: "Kairo — documento interno para el equipo"
date: "11 de septiembre de 2026"
geometry: margin=2.4cm
fontsize: 10.5pt
colorlinks: true
linkcolor: blue
---

\begin{veredicto}
\textbf{Veredicto en una frase.} La idea es buena y el momento es el correcto, pero el piloto tal
y como está planteado hoy mediría el paywall en vez del producto: dura 14 días y el acceso
gratuito se corta a los 7. Se arregla con \textbf{una sola pieza} (un plan de piloto con
caducidad), no con cuatro. La otra mitad de la pregunta —«¿cuántos convertirían?»— no depende
de código y hoy no se puede responder legalmente.
\medskip

\textbf{Recomendación:} adelante con el piloto, pero separando las dos preguntas. Uso y
retención se pueden medir en dos semanas. Conversión real no, hasta que esté el alta fiscal.
\end{veredicto}

## 1. Por qué la idea es buena (y por qué ahora)

Tres cosas que no se repiten fácil y que conviene no desaprovechar:

- **Un canal con autoridad.** La recomendación de su profesor de mates pesa más que cualquier
  anuncio, y además da acceso a las clases enteras de golpe. No es captación uno a uno.
- **150 alumnos del mismo centro encienden funciones que hasta ahora no se podían probar.**
  El Pulso de centro (`app/api/centro/pulso/route.ts`) compara a cada alumno con sus compañeros
  reales del instituto: con 5 personas no significa nada, con 150 del mismo sitio sí.
- **Septiembre es el mes.** La ansiedad por la PAU arranca la primera semana de clase. En agosto
  nadie piensa en esto; en septiembre el tutor dice «este es el año».

## 2. El bloqueante real: el piloto dura 14 días, el producto corta a los 7

Esto es lo que hay que entender antes que nada, porque cambia la lista de tareas.

Un alumno que se registre sin pagar entra al plan Free. Ese plan, tal y como está definido hoy
en `app/lib/pricing.ts:71-80`, le da:

| Límite del plan Free | Valor | Qué significa en un piloto de 2 semanas |
|---|---|---|
| Corte por antigüedad | **7 días** | Se queda sin corrector a mitad del piloto |
| `maxStudyDaysPerWeek` | **2** | El Camino diario, que es la tesis del producto, va capado a 2 días |
| `photosPerMonth` | **3** | La foto del ejercicio a mano: 3 en todo el piloto |
| `correctionsPerMonth` | 25 | Suficiente para 2 semanas, este no estorba |
| `fullMocksPerMonth` | 0 | Sin simulacros completos |

El corte de 7 días no es una cifra suelta: está repetido en **nueve rutas** de servidor
(`!billing.hasActivePack && billing.daysSince >= 7`), en chat, corrección de examen, corrección
de Camino, simulacro, sesión de simulacro, práctica parcial, intensidad de parciales, planning y
sugerencia de repaso.

\begin{bloqueante}[Por qué esto invalida la medición, no solo la experiencia]
La métrica que de verdad importa en el piloto es \textbf{si vuelven en la segunda semana}. La
segunda semana empieza el día 8. El día 8 es exactamente cuando el producto les corta. Sin
tocar esto, el resultado del piloto no dice si Kairo engancha: dice cuándo aparece el muro.
\end{bloqueante}

**Y el mecanismo para dar acceso gratis está muerto.** `app/lib/billing/betaCourtesyAccess.ts`
es una lista fija de 5 correos con ventana `BETA_COURTESY_EXPIRES_AT = 2026-08-09`. Esa fecha
pasó hace más de un mes: hoy la función devuelve `null` para todo el mundo. No hay código de
clase, ni alta por dominio, ni alta masiva.

\begin{decision}[La buena noticia: es una sola pieza, no cuatro]
Las tres puertas de la tabla de arriba comprueban lo mismo: \texttt{hasActivePack}. Un único
mecanismo que inserte en \texttt{user\_entitlements} un derecho con \texttt{expires\_at} a 3–4
semanas las desactiva las tres a la vez. El patrón ya existe dos veces en el repo:
\texttt{betaCourtesyAccess.ts} hace exactamente ese insert (solo hay que sustituir la lista fija
por un código de clase), y \texttt{parent\_checkout\_links} ya tiene el modelo de token con
caducidad y hash que necesitaría ese código.
\medskip

Estimación: \textbf{1–2 días} de trabajo de quien conozca el repo, más pruebas. No es un
proyecto, es una pieza.
\end{decision}

## 3. La otra mitad de la pregunta: «¿cuántos convertirían?»

Esta parte no depende de nosotros y conviene decirlo claro en la reunión.

\begin{bloqueante}[No se puede cobrar todavía]
\texttt{app/legal/aviso-legal/page.tsx:44-48} sigue mostrando en producción cuatro campos
\texttt{[PENDIENTE]}: nombre o razón social, NIF/CIF, domicilio y datos registrales. El propio
texto de la página dice que deben rellenarse «antes de la puesta en producción del servicio con
facturación a usuarios». Cobrar sin identificación publicada incumple el artículo 10 de la LSSI,
y con menores de por medio no es un riesgo teórico. Esto no es código: es el alta de autónomo o
sociedad.
\end{bloqueante}

Además hay un detalle que cambia el diseño del piloto: **los alumnos tienen 17 años y no tienen
tarjeta.** Quien paga es el padre o la madre. El flujo existe (`app/parent-checkout/`,
`parent_checkout_links`), pero eso significa que medir conversión no es medir a 150 alumnos:
es medir a 150 familias, con un paso intermedio —que el alumno convenza en casa— que no
controlamos y que tarda más de dos semanas en producirse.

**Cómo lo plantearía yo, en orden de preferencia:**

1. **Piloto ahora, midiendo uso y retención; conversión después.** No se pierde la ventana de
   septiembre ni la buena disposición del profesor. Al final del piloto se captura *intención*
   (el alumno pide el enlace para sus padres, o el padre deja su correo) sin cobrar nada, que es
   perfectamente legal. La conversión real se mide con esa lista cuando esté el alta fiscal.
2. **Retrasar el piloto hasta tener el alta.** Se mide todo de una vez, pero se pierde
   septiembre y la conversación con el profesor se enfría. Solo tiene sentido si el alta está a
   días vista.
3. Cobrar durante el piloto. **Descartado**, por lo de arriba.

La opción 1 tiene un sesgo que hay que asumir y anotar: la intención declarada («sí, se lo pido
a mis padres») siempre sale más alta que el pago real. No la presentéis como tasa de conversión.

## 4. Cobertura de asignaturas: quién choca y quién no

`app/lib/subjectCatalog.ts` tiene **9 asignaturas activas** y Biología en `locked`
(«Próximamente»). Matizo lo que se ha dicho en otras revisiones, porque el detalle importa para
lo que se le promete al profesor:

| Itinerario de 2º | Troncales comunes | Sus específicas | Estado |
|---|---|---|---|
| Ciencias | Cubiertos | Mates II, Física, Química | **Bien cubierto** |
| Sociales | Cubiertos | Mates CCSS, Economía | **Bien cubierto** |
| Ciencias de la Salud | Cubiertos | Biología está **bloqueada** | Choca en su asignatura principal |
| Humanidades | Cubiertos | Latín, Griego, H.ª del Arte, Geografía: **no existen** | Choca |

Los troncales comunes (Lengua, Historia de España, Inglés, Historia de la Filosofía) sí están,
así que **ningún alumno se queda sin nada**. Pero un alumno de Humanidades solo tendría los
comunes, y eso hay que decírselo por adelantado, no descubrirlo en clase.

\begin{decision}[Decisión que hay que tomar antes de hablar con el profesor]
¿El piloto es 2º entero (y asumimos que Humanidades y Salud usan solo los comunes, avisados por
adelantado), o lo acotamos a Ciencias y Sociales? Acotar da mejores datos y peor relación con el
centro; abrir da peor dato medio y mejor relación. Yo abriría, avisando por escrito, porque el
objetivo del piloto es el vínculo con el instituto tanto como el dato.
\end{decision}

## 5. Coste: menos grave de lo que parece, pero sin tope

Con derechos tipo Premium durante el piloto, cada alumno tendría 200 correcciones y 80 fotos al
mes. Escenarios para 150 alumnos y dos semanas, usando el coste por corrección del análisis de
septiembre (2.000–5.000 tokens de entrada y 1.000–2.000 de salida sobre el precio publicado de
Sonnet, 3 y 15 USD por millón):

| Escenario | Correcciones/alumno | Total | Coste IA estimado |
|---|---:|---:|---:|
| Realista (1–2 al día) | 20 | 3.000 | **~135 USD** |
| Uso intenso | 60 | 9.000 | ~405 USD |
| Techo teórico (todos al límite) | 200 | 30.000 | ~1.350 USD |

**Lectura:** el escenario realista es perfectamente asumible y no debería frenar la decisión. El
problema no es el coste medio, es que **no hay tope agregado**: si una clase entera hace
simulacros a la vez, o un alumno descubre que el chat es gratis, nada corta. Lo que hace falta
no es bajar límites, es un presupuesto global del piloto con corte y aviso.

\begin{aviso}[Comprobar antes de empezar]
En \texttt{app/lib/aiUsage.ts:121} hay una rama \texttt{AI\_RATE\_LIMIT\_RESERVATION\_NOT\_DEPLOYED}:
si la migración de reservas atómicas de cuota (\texttt{20260909150000\_atomic\_ai\_usage\_reservations.sql})
no está aplicada en producción, el sistema cae a la ruta antigua \textbf{en silencio}, sin
reserva atómica. Con 150 alumnos concurrentes eso es exactamente el escenario donde se pierde la
cuenta. Verificad que está aplicada.
\end{aviso}

## 6. Sistema de avisos de fallos

Lo que se construyó estos días (tabla `beta_incidents`, `record_beta_incident`, botón «Avisar de
un fallo», panel de triaje) **vive en la copia `camino-repair`, no en el repositorio principal**.
No lo he podido revisar: esa carpeta está fuera de mi acceso. Lo que sigue vale igualmente como
criterio.

\begin{aviso}[El hueco del diseño actual, según lo descrito]
El panel se refresca cada minuto \textbf{solo mientras alguien lo tenga abierto} y no avisa por
ningún canal externo. Para un piloto presencial eso no basta: si a las 10:15 se rompe algo en una
clase entera, os enteráis cuando alguien mire. Durante las dos semanas hace falta que una
incidencia \texttt{blocking} dispare un aviso que llegue al móvil (email o push), con un
responsable de guardia por franja.
\end{aviso}

**Lo que sí hay que exigirle al sistema de incidencias antes del piloto**, más allá de que
funcione: que diga *cuántos alumnos distintos* está afectando un fallo (no solo cuántas veces
ocurre) y que distinguía «no funciona» de «no entiendo qué hacer» — en un piloto escolar la
segunda categoría es la que más os va a enseñar sobre el producto.

## 7. Lo que no he podido verificar

Para que nadie dé por cerrado algo que no lo está:

- **La copia `camino-repair`** y todo lo que contiene (sistema de incidencias, últimos arreglos
  del motor). Está fuera de mi acceso; no he visto ese código.
- **Qué migraciones están realmente aplicadas en producción.** Especialmente las de reservas
  atómicas de IA y de XP. El detector `/admin/schema-drift` no cubre permisos ni funciones nuevas.
- **El flujo de pago de padres de punta a punta.** Existe el código, pero no hay constancia de
  una compra real completada; solo pruebas contra código.
- **El comportamiento con 150 cuentas concurrentes.** No se ha hecho ninguna prueba de carga.

## 8. Decisiones que hay que tomar en la reunión

| # | Decisión | Quién decide | Cuándo |
|---|---|---|---|
| 1 | ¿Piloto ahora midiendo solo uso, o esperamos al alta fiscal para medir también conversión? | Mario + equipo | Antes de responder al profesor |
| 2 | ¿2º entero o solo Ciencias y Sociales? | Mario + profesor | Antes de fijar fecha |
| 3 | Quién construye el plan de piloto (código de clase) y para cuándo | Equipo técnico | Esta semana |
| 4 | Presupuesto máximo de IA para el piloto y quién lo vigila | Mario | Antes de abrir |
| 5 | Quién está de guardia cada franja durante las dos semanas | Equipo | Antes de abrir |
| 6 | Fecha real de inicio del alta de autónomo/sociedad | Mario | Esta semana |

## 9. Resumen para quien solo lea esta página

\begin{listo}[Listo o casi]
Motor de Camino, corrección con IA, Orientación, panel de administración, contenido de 9
asignaturas, webhook de Stripe, cifrado de tokens de calendario. Nada de esto frena el piloto.
\end{listo}

\begin{bloqueante}[Bloquea el piloto — hay que construirlo]
Plan de piloto con caducidad (código de clase o alta por dominio). Sin esto los alumnos se
quedan a medias el día 8 y el dato de retención no vale. \textbf{1–2 días de trabajo.}
\end{bloqueante}

\begin{bloqueante}[Bloquea solo la parte de conversión — no es código]
Alta fiscal y los cuatro campos del aviso legal. Mientras no estén, no se puede cobrar, así que
«cuántos convertirían» se mide como intención, no como pago.
\end{bloqueante}

\begin{aviso}[Hay que decidirlo, no construirlo]
Qué itinerarios entran (Biología bloqueada, faltan las de Humanidades), tope de gasto de IA,
avisos externos de incidencias y turnos de guardia.
\end{aviso}
