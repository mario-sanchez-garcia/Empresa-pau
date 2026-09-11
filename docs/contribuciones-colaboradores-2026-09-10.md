# Análisis de contribuciones — Kairo (actualización)

**Fecha:** 10 de septiembre de 2026
**Repositorio:** `msanchezieu2024-cmyk/Empresa-pau`, rama `main`, HEAD `ebbe04b` (sincronizado con `origin/main`, 0 commits de diferencia)
**Periodo analizado:** 7 de junio – 10 de septiembre de 2026 (95 días naturales)
**Actualiza a:** `docs/contribuciones-colaboradores-2026-09-05.md` (5 días después)
**Método:** `git log` y `git blame` sobre HEAD en vivo, identidades unificadas por email
(Marco aparece con dos nombres de commit, un solo email; unificado con `.mailmap`,
igual que en los informes anteriores).

---

## 0. El titular: el reparto ha cambiado de verdad esta vez

En los dos informes anteriores el reparto Mario/Marco se movía poco (76,5%/18,8%
bruto el 17/08 → 72,4%/22,8% vivo el 05/09, solo 3 puntos en 18 días). **Esta vez
no.** Desde el 5 de septiembre (fecha del último informe) hasta hoy, Marco ha
estado más activo que nunca — **54 de los 85 commits nuevos** a `main` son
suyos, con trabajo real (no solo retoques): una migración que hace atómico el
otorgamiento de XP
(`award_camino_xp`, sustituye al `increment_camino_progress` antiguo en el
camino principal), otra que hace atómica la reserva de cuota de IA antes de
llamar al proveedor pagado, y un barrido sistemático de contraste/tema oscuro
en Exámenes, Historial y Camino.

**Reparto por código vivo hoy:** Mario **57,3%** · Marco **39,7%** · Alejandro
1,6% · Diego 1,4%. Frente al 72,4%/22,8% de hace 5 días, es un movimiento de
**14,6 puntos** en una semana — mucho más que el 3% de movimiento entre los dos
informes anteriores combinados.

Antes de sacar conclusiones de reparto de equity con este número: sección 5
explica cuánto de ese movimiento es trabajo de ingeniería real y cuánto es
contenido/datos que inflan el bruto igual que pasó con el reetiquetado de
`topicSlugs` en el informe de agosto.

---

## 1. Resumen ejecutivo

| | Commits | Líneas + (bruto) | Líneas vivas hoy* | Supervivencia | Días activos | Última actividad |
|---|---:|---:|---:|---:|---:|---|
| **Mario** | 795 | 189.749 | 124.538 | 65,6% | 57 | 10/09 (hoy) |
| **Marco** | 402 | 272.156 | 86.214 | 31,7% | 45 | 09/09 (ayer) |
| **Alejandro** | 41 | 7.469 | 3.506 | 46,9% | 9 | 10/08 |
| **Diego** | 8 | 3.176 | 3.087 | 97,2% | 3 | 14/08 |

*Líneas vivas: `git blame` sobre HEAD, excluyendo binarios y los catálogos
oficiales de universidades (`data/orientation/**`, ~162.000 líneas de datos de
notas de corte republicados — ver sección 5). Con esa exclusión el total vivo
analizado es **217.345 líneas**, no las ~400.000 que tiene el repo si se
cuenta todo.

**Reparto por código vivo hoy:** Mario **57,3%** · Marco **39,7%** ·
Alejandro **1,6%** · Diego **1,4%**.

**Comparación con los dos informes previos** (todos sobre código vivo, no bruto):

| | 17/08 | 05/09 | 10/09 | Cambio 05/09→10/09 |
|---|---:|---:|---:|---:|
| Mario | 69,5% | 72,4% | **57,3%** | −15,1 pts |
| Marco | 27,4% | 22,8% | **39,7%** | +16,9 pts |
| Alejandro | 3,0% | 2,5% | 1,6% | −0,9 pts |
| Diego | 0,1% | 2,3% | 1,4% | −0,9 pts |

---

## 2. Propiedad por sistema

Igual que en los informes anteriores, más una categoría nueva (**Orientación**)
que antes no se aislaba y que ahora pesa lo suficiente como para necesitar su
propia fila.

| Sistema | Líneas | Mario | Marco | Alejandro | Diego |
|---|---:|---:|---:|---:|---:|
| **Onboarding** | 5.542 | **92,3%** | 7,6% | 0,0% | 0,1% |
| **Pagos y facturación** | 3.174 | **86,4%** | 13,3% | 0,3% | — |
| **Emails y crons** | 2.312 | **85,3%** | 14,7% | — | — |
| **Seguridad y auth** | 1.588 | **77,1%** | 22,0% | 0,9% | — |
| **Landing y marketing** | 1.138 | **62,8%** | 35,3% | 1,8% | — |
| **IA: corrección y prompts** | 3.243 | **57,0%** | 41,0% | 2,0% | — |
| **Datos de exámenes** | 39.879 | **60,7%** | 34,9% | 4,4% | — |
| **Motor del Camino** | 35.934 | 41,0% | **50,5%** | 0,0% | 8,5% |
| **Gamificación (XP/ligas)** | 1.068 | 49,8% | **50,2%** | — | — |
| **Esquema BD (migraciones)** | 20.506 | 12,1% | **87,8%** | 0,0% | 0,0% |
| **Orientación** (nuevo) | 4.098 | 14,2% | **85,8%** | — | — |

**Lectura rápida:** Mario sigue controlando en solitario los sistemas de mayor
riesgo comercial/legal (pagos, seguridad, emails, onboarding) casi exactamente
igual que en los dos informes anteriores — esas filas apenas se han movido.
**Lo que ha cambiado es todo lo demás.** Marco ya es mayoritario en tres
sistemas, no en uno: motor del Camino (como antes), y ahora también esquema de
BD y orientación — dos categorías donde antes Mario dominaba (68% en
migraciones el 17/08) o no se medían por separado.

---

## 3. Qué hay detrás del giro — no te quedes solo con el porcentaje

**a) Esquema BD: 87,8% de Marco, pero con matiz importante.** De las 20.506
líneas vivas en `supabase/migrations/`, **11.764 son dos migraciones de
sembrado de catálogo oficial** (`20260831213000_seed_orientation_madrid...`,
5.713 líneas, y `20260913121000_seed_orientation_catalunya...`, 6.051 líneas —
esta última con el nombre de fichero mal fechado: dice 13 de septiembre pero
se commiteó el 3; no es incidente, es una migración correctamente aplicada
con un nombre confuso, vale la pena renombrarla en algún momento). Son
`INSERT` de datos de admisión universitaria, no diseño de esquema. Quitando
esas dos, el resto de migraciones de Marco (rondas, ligas, y las cuatro
migraciones "auditoria_final/completa" de revisión de contenido curricular en
Historia, Lengua, Economía, Física y Filosofía) siguen siendo trabajo real,
pero la cifra "87,8%" mide sobre todo *sembrado de contenido*, no lógica de
base de datos. Esto ya pasó con el reetiquetado de `topicSlugs` en agosto —
mismo patrón, sistema distinto.

**b) Motor del Camino: la pieza más significativa del giro es trabajo de
verdad, no dato.** `CaminoCalendarClient.tsx` ha pasado de 55%/45% Mario/Marco
(17/08) a 64,4% Marco hoy — Marco ha tomado más control del fichero más
disputado del repo. Y dos migraciones suyas de estos últimos 5 días
resuelven, de forma independiente, dos de los hallazgos técnicos que
identificamos en la auditoría del 7-8 de septiembre:

- `20260908130000_atomic_camino_xp_award.sql` — crea `award_camino_xp()`,
  que hace en una sola transacción lo que antes eran tres pasos (evento +
  agregado por asignatura + agregado global), con `auth.uid()` comprobado
  dentro y `EXECUTE` revocado a `PUBLIC/anon/authenticated`. Esto es
  esencialmente el hallazgo A04 de la auditoría, ya resuelto por Marco antes
  de que llegáramos a tocarlo.
- `20260909150000_atomic_ai_usage_reservations.sql` — tabla de reservas de
  cuota con estados (`reserved/success/error/invalid_output`) para reservar
  antes de llamar al proveedor de IA, con backfill del histórico para no
  resetear cuota ya consumida. Esto ataca directamente el hallazgo A05.

**Importante:** `awardXp.ts` todavía llama a **las dos** funciones —
`award_camino_xp` (la nueva, en el camino principal) y `increment_camino_progress`
(la que arreglamos con Mario el 9 de septiembre — `revoke` de `PUBLIC` y
comprobación de `auth.uid()` — sigue viva en el flujo de "repetir para
mejorar"). Ninguna de las dos correcciones es redundante; conviven porque
cubren caminos de código distintos. No he verificado si `A05` sigue teniendo
el problema del `creditKey` arbitrario aceptado del cliente — la tabla nueva
resuelve la atomicidad de la reserva, no necesariamente esa parte del
hallazgo original.

**c) Orientación: 85,8% Marco, pero son sobre todo los catálogos oficiales
excluidos del cómputo principal.** La fila de la tabla de sistemas cuenta
`app/orientacion/*.tsx` (lógica) y `data/orientation/**` quedó fuera del
cómputo de esta fila también — si se incluyeran los ~162.000 líneas de
catálogo bruto (Madrid + Cataluña, ambos commiteados por Marco el 1 y 3 de
septiembre), el "89%" sería casi 100% pero sin decir nada sobre esfuerzo de
ingeniería: son datos oficiales de notas de corte republicados, no código
escrito por el equipo.

---

## 4. Ficheros más grandes y quién manda en ellos

| Líneas vivas | Dueño dominante | % | Fichero |
|---:|---|---:|---|
| 11.655 | Mario | 49,0% | `app/data/camino/curriculum_seed.json` |
| 7.960 | Mario | 77,8% | `app/page-client.tsx` |
| 6.051 | **Marco** | 100% | `supabase/migrations/..._seed_orientation_catalunya...sql` |
| 5.794 | **Marco** | 64,4% | `app/components/camino/CaminoCalendarClient.tsx` |
| 5.713 | **Marco** | 100% | `supabase/migrations/..._seed_orientation_madrid...sql` |
| 5.471 | Mario | 95,2% | `app/data/quimica.ts` |
| 5.370 | Mario | 87,2% | `app/data/lengua.ts` |
| 4.753 | Mario | 80,5% | `app/data/examenes.ts` |
| 3.503 | Mario | 89,1% | `app/data/fisica.ts` |
| 2.644 | **Marco** | 62,4% | `app/camino/tema/.../CaminoTopicClient.tsx` |
| 2.505 | **Marco** | 100% | `app/data/biologia_cataluna.ts` |

`CaminoCalendarClient.tsx` sigue siendo el fichero más disputado del repo, y
ahora con mayoría de Marco en vez de reparto casi igualado — es el dato más
concreto de que su peso en el motor del Camino ha crecido de verdad, no solo
en migraciones de datos.

**Ficheros en exclusiva** (ningún otro autor ha tocado una línea que sobreviva
hoy): Marco 283, Mario 261, Alejandro 4, Diego 1. Es la primera vez que Marco
supera a Mario en esta métrica — reflejo directo de las dos semanas
recientes de trabajo casi en solitario en Camino, esquema y orientación.

---

## 5. Lo que estos números NO miden (sigue aplicando, igual que en los dos
informes anteriores)

- **Sembrado de datos vs. lógica.** Ya explicado en la sección 3 — pesa
  más en este informe que en los dos anteriores porque las migraciones de
  catálogo son grandes y recientes.
- **Uso de IA por commit.** No he podido verificar el heurístico de
  co-autoría (`Co-authored-by: Claude/Codex`) que sí aparecía en el informe
  del 17/08 — no encuentro esos trailers en los commits de este rango. O el
  flujo de trabajo cambió (menos commits con trailer explícito) o el dato de
  agosto se obtuvo de otra fuente que no tengo aquí. No afirmo un porcentaje
  esta vez para no inventar un dato que no puedo confirmar.
- **Variables de entorno, revisión de código, decisiones de producto.** Sigue
  sin dejar rastro en git, igual que antes.
- **Una migración de sembrado de datos no vale lo mismo que una de esquema.**
  Repetido a propósito: es la distorsión más grande de este informe concreto.

---

## 6. Conclusiones

**El informe de agosto decía "colaborador significativo, no puntual" sobre
Marco. Esta actualización lo confirma con más fuerza que las dos anteriores
juntas.** No es un pico de actividad aislado: 54 commits desde el 5 de
septiembre, con trabajo que va desde UI (barrido de contraste/tema oscuro) hasta
infraestructura real (dos migraciones de atomicidad que resuelven hallazgos
de seguridad de forma independiente a nuestra propia auditoría). Es la
persona con la actividad más reciente del equipo, otra vez.

**La concentración de riesgo en Mario en los sistemas críticos no ha
cambiado.** Pagos, seguridad, emails y onboarding siguen siendo suyos casi en
solitario, con los mismos porcentajes que hace 5 y hace 18 días. Si la
pregunta es "qué pasa si Mario desaparece una semana", la respuesta sigue
siendo la misma que en agosto.

**Si la pregunta es de reparto de equity:** el salto de 14,6 puntos en 5 días
es real pero parcialmente inflado por dos migraciones de datos (11.764
líneas). Descontando esas dos líneas tanto del numerador de Marco (86.214 →
74.450) como del total analizado (217.345 → 205.581), su porcentaje de
código vivo bajaría de 39,7% a **36,2%** — sigue siendo un salto notable
frente al 22,8% de hace 5 días, solo que algo menos dramático que el
titular. Cualquier decisión formal de reparto debería mirar la tabla de la
sección 2 (propiedad por sistema) con el matiz de la sección 3, no el
porcentaje global de la sección 1 en solitario.
