---
title: "Plan de lanzamiento del piloto"
subtitle: "Dos semanas en el instituto · 2º de Bachillerato · arranque escalonado"
author: "Kairo"
date: "11 de septiembre de 2026"
geometry: margin=2.4cm
fontsize: 10.5pt
colorlinks: true
linkcolor: blue
---

\begin{veredicto}
\textbf{Qué responde este piloto y qué no.} Responde: ¿los alumnos lo usan solos, sin que nadie
les obligue, y vuelven a la semana siguiente? Eso se puede medir en dos semanas y es la pregunta
que de verdad decide si Kairo funciona.
\medskip

\textbf{No responde} cuántos pagarían. Los alumnos son menores sin tarjeta —paga la familia— y
hoy no se puede facturar legalmente (ver informe de preparación). Lo que sí se puede capturar al
final es \emph{intención}, que es una señal más débil y hay que tratarla como tal.
\end{veredicto}

## 1. Las tres fases

Nada de abrir a 150 el primer día. Cada fase tiene una puerta: si no se cumple, no se pasa a la
siguiente. Las fechas son relativas al día de apertura (D1) porque la fecha real la da el
instituto.

| Fase | Cuándo | Quién | Objetivo | Puerta para pasar de fase |
|---|---|---|---|---|
| **0. Interna** | D-7 a D-4 | 3–4 del equipo | Que nada obvio esté roto | Registro $\rightarrow$ onboarding $\rightarrow$ primera corrección, en móvil real (iPhone y Android) |
| **1. Semilla** | D-3 a D-1 | 10–15 alumnos voluntarios | Ver fallos reales sin público | $\ge$ 8 de 10 completan su primera corrección sin ayuda; 0 incidencias bloqueantes abiertas |
| **2. Una clase** | D1 a D3 | 1 clase (~30) | Probar uso simultáneo | Ninguna incidencia bloqueante que afecte a > 3 alumnos; coste dentro de lo previsto |
| **3. Todo 2º** | D4 en adelante | ~150 | El dato de verdad | — |

\begin{aviso}[La regla que hace que esto sirva]
Cada fase se abre \textbf{solo si} el equipo ha mirado el panel de incidencias y ha cerrado o
descartado lo bloqueante de la fase anterior. Si se abre igual «porque ya está el profesor
esperando», el escalonado no sirve de nada: solo retrasa el mismo desastre.
\end{aviso}

## 2. Calendario de las dos semanas

| Día | Qué pasa | Quién lo hace |
|---|---|---|
| D-7 | Plan de piloto (código de clase) desplegado y probado | Equipo técnico |
| D-6 | Verificar migraciones aplicadas en producción; fijar tope de gasto | Mario |
| D-5 | Confirmar por escrito al profesor: fechas, asignaturas que entran y cuáles no | Mario |
| D-3 | Fase 1: semilla de 10–15 alumnos | Equipo |
| D-1 | Revisión de incidencias de la semilla · decisión go/no-go | Equipo |
| **D1** | Fase 2: primera clase. Presentación de 5 min en el aula | Mario + profesor |
| D2–D3 | Guardia activa. Revisión de incidencias 2 veces al día | Turnos |
| **D4** | Go/no-go · Fase 3: resto de 2º | Equipo |
| D5–D9 | Uso normal. Revisión diaria de métricas e incidencias | Turnos |
| **D8** | Punto de control clave: ¿vuelven en la segunda semana? | Mario |
| D10–D13 | Segunda semana completa | Turnos |
| **D14** | Cierre: encuesta, captura de intención, agradecimiento al centro | Mario + profesor |
| D15–D17 | Informe de resultados y decisión de siguiente paso | Equipo |

## 3. Qué medimos exactamente

Definidas de antemano para no elegir después la métrica que mejor quede. Todas excluyen cuentas
internas del equipo y de prueba.

| Métrica | Definición exacta | Objetivo propuesto | De dónde sale |
|---|---|---|---|
| **Registro** | Alumnos que crean cuenta / alumnos invitados | $\ge$ 70 % | `auth.users` filtrado por código de clase |
| **Activación** | Registrados que completan **su primera corrección** | $\ge$ 60 % | `ai_usage_events` con `exerciseId` |
| **Retorno día 2** | Activados que vuelven al día siguiente | $\ge$ 60 % | `camino_calendar`, `camino_xp_events` |
| **Retorno semana 2** | Activados que hacen algo útil entre D8 y D14 | $\ge$ 35 % | idem |
| **Trabajo útil** | Correcciones completadas por alumno activo | $\ge$ 5 en dos semanas | `historial_examenes` |
| **Misiones** | Misiones de Camino completadas por alumno activo | $\ge$ 4 | `camino_calendar` |
| **Fallos** | Incidencias bloqueantes · alumnos distintos afectados | 0 sin resolver > 24 h | panel de incidencias |
| **Coste** | Coste de IA por alumno activo | < 2,50 € | `ai_usage_events` |
| **Intención** | Alumnos que piden el enlace para sus padres | — (solo referencia) | captura del último día |

\begin{decision}[Los objetivos son propuestas, no referencias del sector]
Ninguno de estos números viene de un estudio: son puntos de partida para tener un criterio antes
de ver los datos. Lo importante no es acertarlos, es haberlos escrito \emph{antes}. Si al final
sale 45 \% de activación, la conversación debe ser «por qué» y no «bueno, 45 \% tampoco está mal».
\end{decision}

**La métrica que de verdad decide:** retorno en la segunda semana. Todo lo demás es contexto.
Un alumno que vuelve el día 9 sin que nadie se lo pida ha decidido que Kairo le sirve.

## 4. Guardia y protocolo de incidencias

Con 150 alumnos usando el producto en horario de clase, el tiempo de reacción importa más que la
calidad del arreglo.

| Gravedad | Qué significa | Respuesta | Quién |
|---|---|---|---|
| **Bloqueante** | El alumno no puede seguir estudiando | < 1 h en horario de clase | Guardia del día |
| **Prioritaria** | Funciona pero mal (corrección dudosa, dato erróneo) | Mismo día | Guardia del día |
| **Normal** | Molesta, no impide | Revisión diaria | Quien la coja |
| **«No entiendo qué hacer»** | No es un fallo, es diseño | Se anota, no se arregla en caliente | Mario |

\begin{aviso}[El hueco que hay que tapar antes de D1]
El panel de incidencias solo se refresca mientras alguien lo tiene abierto y no avisa por ningún
canal externo. Para un piloto presencial hace falta que una incidencia \textbf{bloqueante}
dispare un email o un push al móvil del que esté de guardia. Sin eso, el protocolo de arriba es
papel mojado: os enteraréis cuando alguien se acuerde de mirar.
\end{aviso}

**Turnos:** hay que asignar una persona por franja de mañana durante los 14 días, con nombre y
teléfono, antes de abrir. Una franja sin responsable es una franja en la que nadie mira.

**La cuarta categoría es la más valiosa.** «No entiendo qué hacer» no es un bug y no se arregla
en caliente, pero es lo que más os va a enseñar. Anotadlo aparte y revisadlo entero al final.

## 5. Qué se le dice al profesor (antes de empezar)

Por escrito, no de palabra. Un correo corto con esto:

1. **Fechas exactas** de cada fase y cuándo entra su clase.
2. **Qué asignaturas están y cuáles no.** En concreto: Biología aparece como «Próximamente», y no
   hay Latín, Griego, Historia del Arte, Geografía ni Dibujo Técnico. Los troncales comunes
   (Lengua, Historia de España, Inglés, Filosofía) sí están, así que ningún alumno se queda sin
   nada, pero un alumno de Humanidades solo tendrá los comunes. **Es mejor que lo sepa él antes
   que un alumno en clase.**
3. **Que es gratis y sin tarjeta durante el piloto**, y qué pasa después (se lo diréis al final,
   no habrá cargos sorpresa).
4. **Qué necesitáis de él:** 5 minutos de clase el primer día, y que avise si oye quejas que no
   lleguen por el botón de la app.
5. **Un canal directo** con él (WhatsApp) para las dos semanas.

## 6. Qué se les dice a los alumnos (los 5 minutos en el aula)

Guion corto, sin vender:

> «Soy Mario, estudié aquí y me presenté a la PAU hace poco. He montado esto con unos
> compañeros porque odiaba estudiar con PDFs sueltos. Es gratis estas dos semanas, sin tarjeta y
> sin compromiso. Lo que os pido no es que os guste: es que lo uséis como uséis cualquier cosa y
> que nos digáis lo que está mal, con el botón de "Avisar de un fallo". Si algo no funciona,
> quiero saberlo — eso nos ayuda más que un cumplido.»

Tres cosas que **no** hay que hacer en esa presentación:

- No prometer asignaturas que no están.
- No pedirles que valoren si pagarían. Eso se pregunta al final, y con cuidado.
- No hacer que la primera sesión sea en clase con el profesor mirando: el dato de si lo usan
  solos se contamina. Que se registren en clase, sí; que estudien, en su casa.

**Sí conviene:** que cada alumno haga **una corrección real** delante, en los primeros 5 minutos.
Es el momento en que se entiende el producto, y si falla, falla ahí y os enteráis en el sitio.

## 7. El último día

- **Encuesta corta** (3 preguntas, 2 minutos, en clase): qué te ha servido, qué te ha estorbado,
  qué le falta.
- **Captura de intención**, sin cobrar nada: quien quiera seguir, deja un correo para que se
  informe a sus padres cuando esté disponible. Esa lista es el activo real del piloto.
- **Conversación de 10 minutos con 5 alumnos** de los que más lo hayan usado y 5 de los que lo
  dejaron el día 3. Los segundos enseñan más.
- **Agradecer al centro por escrito** y dejar la puerta abierta: este mismo instituto es el
  primer cliente B2B potencial.

## 8. Cuándo hay que parar

Definido antes para no discutirlo en caliente:

\begin{bloqueante}[Motivos para parar el piloto en marcha]
\begin{itemize}
\item Una incidencia bloqueante que afecte a más de 10 alumnos y no se resuelva en 24 h.
\item Cualquier fallo que exponga datos de un alumno a otro.
\item Coste de IA que supere el doble de lo presupuestado en la primera semana.
\item Correcciones sistemáticamente erróneas en una asignatura: mejor apagar esa asignatura que
      enseñar mal a 150 personas.
\end{itemize}
\end{bloqueante}

Parar no es fracasar. Parar tarde, sí.

## 9. Antes de D1: lista de comprobación

| | Tarea | Responsable | Hecho |
|---|---|---|---|
| 1 | Plan de piloto con caducidad, desplegado y probado con 2 cuentas reales | Técnico | $\square$ |
| 2 | Verificar en producción las migraciones de reservas atómicas y XP | Mario | $\square$ |
| 3 | Tope de gasto de IA configurado, con aviso al superarlo | Técnico | $\square$ |
| 4 | Aviso externo (email/push) para incidencias bloqueantes | Técnico | $\square$ |
| 5 | Turnos de guardia asignados con nombre y teléfono | Equipo | $\square$ |
| 6 | Flujo completo probado en iPhone y en Android reales | Equipo | $\square$ |
| 7 | Correo al profesor con fechas y asignaturas, por escrito | Mario | $\square$ |
| 8 | Panel de métricas que excluya cuentas internas | Técnico | $\square$ |
| 9 | Objetivos de la sección 3 escritos y aceptados por el equipo | Equipo | $\square$ |
