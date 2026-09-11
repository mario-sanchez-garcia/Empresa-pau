# Análisis de contribuciones — Kairo (actualización)

**Fecha:** 5 de septiembre de 2026
**Repositorio:** `msanchezieu2024-cmyk/Empresa-pau`
**Periodo analizado:** 7 de junio – 4 de septiembre de 2026 (90 días naturales)
**Actualiza a:** `docs/contribuciones-colaboradores-2026-08-17.md` (18 días después)
**Método:** `git log`, `git blame` sobre HEAD, clasificación por sistema — misma
metodología que el informe anterior, para que sean comparables.

---

## 0. Lo primero que hay que saber antes de leer las cifras

**El conteo bruto de líneas añadidas ahora miente más que la última vez, y
por un motivo concreto.** Marco aparece con 264.772 líneas añadidas desde
junio — 6 veces más que hace 18 días. Si te quedas ahí, la lectura es
"Marco ha hecho el 58 % de Kairo". Es falsa.

De esas 264.772 líneas, solo **31.386 siguen vivas hoy (12 %)**. El resto se
reescribió. La causa no es un revert ni un error: son varios commits de
finales de agosto —*"aplicar topicSlugs a los 245 ejercicios de Matemáticas
CCSS"*, *"aplicar topicSlugs a ejercicios de Comunicación..."*— que
reetiquetan bloques enteros del contenido de exámenes. Cada pasada de
reetiquetado reescribe el bloque completo, así que git cuenta esas líneas
como nuevas aunque el contenido casi no cambie. Es trabajo real y necesario
(clasificar ejercicios por tema), pero no equivale a 264.772 líneas de
producto nuevo.

Por eso, otra vez, **la cifra que importa es el código vivo hoy, no el
bruto.**

---

## 1. Resumen ejecutivo

| | Commits | Líneas + (bruto) | Líneas vivas hoy | Supervivencia | Días activos |
|---|---|---|---|---|---|
| **Mario** | 764 | 181.768 | 99.664 | 55 % | 51 |
| **Marco** | 351 | 264.772 | 31.386 | 12 % | 41 |
| **Alejandro** | 41 | 7.469 | 3.410 | 46 % | 9 |
| **Diego** | 8 | 3.176 | 3.165 | 100 % | 3 |

**Reparto por código vivo hoy** (la cifra honesta):
Mario **72,4 %** · Marco **22,8 %** · Alejandro 2,5 % · Diego 2,3 %

Frente al informe del 17 de agosto (Mario 69,5 % / Marco 27,4 %), la
proporción apenas se mueve — un movimiento de 3 puntos en 18 días, pese a que
el bruto de Marco se disparó un 500 %. Confirma que el reetiquetado no
cambió sustancialmente quién es dueño de qué.

**Diego pasa de 5 % a 100 % de supervivencia.** En el informe anterior sus
datos parecían casi todos reemplazados; ahora, sin que él haya vuelto a
tocarlos, prácticamente todo sigue en pie. Lectura correcta: lo que se veía
el 17 de agosto era un momento de tránsito —su contenido se estaba
integrando con el de otros—, no que su trabajo estuviera mal.

---

## 2. Propiedad por sistema — comparado con hace 18 días

| Sistema | Líneas | Mario | Marco | Alej. | Diego | Cambio desde el 17/08 |
|---|---|---|---|---|---|---|
| **Seguridad y auth** | 1.633 | 97 % | 2 % | 1 % | 0 % | **sin cambios** |
| **Onboarding** | 5.228 | 95 % | 5 % | 0 % | 0 % | **sin cambios** |
| **Landing y marketing** | 1.394 | 94 % | 4 % | 2 % | — | **sin cambios** |
| **Emails y crons** | 1.775 | 88 % | 12 % | — | — | **sin cambios** |
| **Pagos y facturación** | 2.649 | 87 % | 13 % | 0 % | — | **sin cambios** |
| **IA: corrección y prompts** | 3.100 | 75 % | 23 % | 2 % | — | **sin cambios** |
| **Esquema BD (migraciones)** | 3.271 | 68 % | 32 % | 0 % | 0 % | **sin cambios** |
| **Gamificación (ligas/XP)** | 1.162 | 62 % | 38 % | — | — | **sin cambios** |
| **Datos de exámenes** | 47.132 | 65 % | 25 % | 4 % | 6 % | +13.866 líneas, reparto similar |
| **Motor del Camino** | 5.698 | 41 % | 58 % | 0 % | 0 % | **sin cambios** |

**El hallazgo de esta actualización es este: nueve de los diez sistemas no
han recibido ni un commit relevante en 18 días.** Todo el movimiento de
finales de agosto se concentró en datos de exámenes (crecimiento real de
contenido, no solo reetiquetado — 13.866 líneas vivas nuevas) y en trabajo
de frontend/docs de Mario fuera de estos diez sistemas con nombre propio.

Práctico: si tu prioridad real es la tarea #5 (unificar generadores de
Camino) o la #9 (verificar confirmación de email), estas cifras dicen que
nadie ha tocado esas áreas desde el informe anterior — siguen exactamente
donde estaban.

---

## 3. Qué ha hecho cada uno en estas tres semanas concretas

### Mario
Sigue siendo el único activo en los ocho sistemas críticos, sin cambios de
propietario en ninguno. El crecimiento de su código vivo (+21.144 líneas,
de 78.520 a 99.664) se reparte entre datos de exámenes y trabajo de
frontend/documentación no clasificado en los diez sistemas con nombre.
Última actividad registrada en `main`: 19 de agosto.

### Marco
Concentró casi todo su esfuerzo en **reetiquetar el contenido existente por
tema** (`topicSlugs`) en Matemáticas CCSS y otros bloques — trabajo de
calidad de datos, no de producto nuevo. Su participación en el motor del
Camino (58 %) y en migraciones (32 %) se queda exactamente igual que hace 18
días: no ha vuelto a tocar esas áreas. Es la persona con la actividad más
reciente de las cuatro: 4 de septiembre.

### Alejandro y Diego
Sin actividad nueva desde el informe anterior (últimos commits el 10 y el 14
de agosto respectivamente). Sus cifras de esta tabla son las mismas que en
el informe del 17/08, salvo la corrección de supervivencia de Diego ya
explicada.

---

## 4. Lo que esto significa para las decisiones pendientes

**Si la pregunta sigue siendo el reparto de equity** (como se discutió el
17 de agosto): los datos de fondo no han cambiado lo suficiente como para
revisar el marco que ya se planteó. Marco sigue siendo el único co-dueño
técnico real de un sistema (el motor del Camino), y sigue siendo el único
de los tres colaboradores con actividad posterior al 10 de agosto — de
hecho la tiene más reciente que la del propio Mario en `main`. Vale la pena
preguntarle directamente si sigue considerándose activo en el proyecto,
porque los datos ahora apuntan a que sí.

**Alejandro y Diego siguen sin haber vuelto** en tres semanas. Si la
pregunta de equity sigue abierta, esto refuerza la lectura de que su
participación puede tratarse como cerrada, no como continuada.
