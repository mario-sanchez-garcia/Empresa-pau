# Auditoría y clasificación temática — Historia de la Filosofía (Madrid)

Auditoría técnica confirmando (o corrigiendo) la investigación previa, ejecutada
directamente contra `app/data/historia_filosofia_madrid.ts` y contra `curriculum_topics`
real, antes de implementar nada. Todos los números están recalculados en esta sesión, no
copiados del informe anterior.

## 0. Reconstrucción del modelo de datos (resuelve la inconsistencia 68+80+204=352≠284)

El informe previo sumaba **textos** (68) + **preguntas embebidas en los textos** (80) +
**preguntasComunes** (204) = 352, pero el número correcto de unidades reales es **284**.
El error era conceptual: un **texto** (`TextoHistoriaFilosofiaMadrid`) no es en sí mismo
una unidad de pregunta — es un pasaje de lectura con metadata (`autor`/`obra`/`problema`)
que **contiene** 1 o 2 preguntas reales dentro de su array `preguntas[]`. Sumarlo aparte
de sus propias preguntas cuenta el mismo contenido dos veces.

- **34 exámenes**, de 2 formatos:
  - `madrid_clasico_texto_ab_tres_preguntas` (28 exámenes, 2018-2024): 2 textos por
    examen (opción A/B), **1 pregunta embebida por texto** (el comentario "X.1"), + **6
    `preguntasComunes`** por examen (A.2, A.3, A.4, B.2, B.3, B.4). → 28 × (2+6) = 224
    unidades.
  - `madrid_2025_texto_ab_cuatro_preguntas` (6 exámenes, 2025-2026): 2 textos por examen,
    **2 preguntas embebidas por texto** ("1.1 Tesis principal", "1.2 Diálogo
    filosófico"), + **6 `preguntasComunes`** por examen (2A, 2B, 3A, 3B, 4A, 4B). → 6 ×
    (4+6) = 60 unidades.
- **68 textos** (34 × 2, opción A/B) — contenedores de metadata, no unidades de pregunta.
- **80 preguntas reales embebidas en textos** (56 exámenes clásicos × 1 + 6 exámenes 2025
  × 2 textos × 2 preguntas = 56 + 24 = 80) — su autor es siempre el fijado en su `texto`
  padre.
- **204 `preguntasComunes`** (28 × 6 + 6 × 6 = 168 + 36 = 204) — sin autor fijo, el
  alumno elige.
- **Unidades reales que consume/podría consumir Camino: 80 + 204 = 284.** (El "84" que
  aparecía en el informe anterior era un error de redacción, no un cálculo real — no
  corresponde a ninguna magnitud del modelo de datos.)

**Formato 2025/2026 (verificado directamente en `historia-filosofia-mad-2025-ordinaria`
y los otros 5 exámenes de este formato)**: sigue existiendo (A) una pregunta de doctrina
ligada al texto fijo elegido ("Tesis principal", con una segunda pregunta "Diálogo
filosófico" que además pide relacionarlo con otro autor, pero la doctrina central sigue
siendo la del autor del texto) y (B) preguntas transversales tipo "Exponga el problema de
X en un autor, autora o corriente filosófica de la época Y", idénticas en estructura a las
`preguntasComunes` clásicas (mismo patrón, ligera ampliación de redacción con "autora").
La clasificación por autor (textos) / por problema (comunes) es válida para **ambos**
formatos sin romper el histórico.

## 1. Tabla de normalización de autores (recalculada, 32 → 13)

| valor original | frecuencia | normalizado | evidencia |
|---|---|---|---|
| "René Descartes" / "RENÉ\nDESCARTES" / "Descartes" | 8+1+1=10 | **Descartes** | forma ya limpia, solo variantes de caja/salto de línea |
| "TOMÁS DE AQUINO" / "Tomás de Aquino" / "Santo Tomás de Aquino" / "TOMÁS DE\nAQUINO" / "Santo Tomás" | 5+1+1+1+1=9 | **Tomás de Aquino** | variantes de caja/forma corta |
| "Autor no especificado" (2022-extraordinaria A) | 1 | **Tomás de Aquino** | RESUELTO_POR_EVIDENCIA — cita "(TOMÁS DE AQUINO, Suma teológica)" al final de `texto` |
| "Platón" | 6 | **Platón** | ya canónico |
| "Platón reflexiona en este texto en torno al conocimiento" | 1 | **Platón** | RESUELTO_POR_EVIDENCIA — cita "(PLATÓN, Fedón)" al final de `texto` |
| "Immanuel Kant" / "Kant" | 4+3=7 | **Kant** | forma ya limpia |
| "Kant reflexiona...a priori" | 2 | **Kant** | RESUELTO_POR_EVIDENCIA — cita "(IMMANUEL KANT, Crítica de la razón pura)" |
| "Kant reflexiona...metafísica" | 1 | **Kant** | RESUELTO_POR_EVIDENCIA — misma obra citada |
| "Jean-Jacques Rousseau" / "JEAN-JACQUES ROUSSEAU" / "JEAN-JACQUES\nROUSSEAU" / "Rousseau" | 2+2+1+1=6 | **Rousseau** | variantes de caja |
| "Rousseau reflexiona..." | 1 | **Rousseau** | RESUELTO_POR_EVIDENCIA — cita "(JEAN-JACQUES ROUSSEAU, Del contrato social)" |
| "David Hume" | 5 | **Hume** | forma ya limpia |
| "Jürgen Habermas" / "JÜRGEN\nHABERMAS" / "Habermas" | 1+3+1=5 | **Habermas** | variantes de caja/salto de línea |
| "Autor no especificado" (2018-ordinaria B) | 1 | **Habermas** | RESUELTO_POR_EVIDENCIA — cita "(JÜRGEN HABERMAS, Tres modelos normativos de democracia)" |
| "José Ortega y Gasset" / "ORTEGA Y GASSET" / "JOSÉ ORTEGA Y\nGASSET" / "Ortega y Gasset" | 2+1+1+1=5 | **Ortega y Gasset** | variantes de caja |
| "Ortega y Gasset reflexiona..." | 1 | **Ortega y Gasset** | RESUELTO_POR_EVIDENCIA — cita "(JOSÉ ORTEGA Y GASSET, El tema de nuestro tiempo)" |
| "Karl Marx" | 4 | **Marx** | forma ya limpia |
| "Friedrich Nietzsche" / "F. NIETZSCHE" / "FRIEDRICH\nNIETZSCHE" | 2+1+1=4 | **Nietzsche** | variantes de caja/abreviatura |
| "ARISTÓTELES" / "Aristóteles" | 2+1=3 | **Aristóteles** | ya limpio salvo caja |
| "Autor no especificado" (2023-modelo B) | 1 | **Aristóteles** | RESUELTO_POR_EVIDENCIA — cita "(ARISTÓTELES, Ética a Nicómaco)" |
| "Agustín de Hipona" | 1 | **Agustín de Hipona** | ya canónico |
| "HANNAH ARENDT" | 1 | **Hannah Arendt** | variante de caja |

**Total: 68/68. Los 13 filósofos reales: Descartes(10), Tomás de Aquino(10), Platón(7),
Kant(7), Rousseau(6), Hume(5), Habermas(5), Ortega y Gasset(5), Marx(4), Nietzsche(4),
Aristóteles(3), Agustín de Hipona(1), Hannah Arendt(1).**

**Los 3 + 6 = 9 casos que parecían ambiguos NO lo eran**: los 3 "Autor no especificado" y
los 6 casos con `autor` = frase completa ("Kant reflexiona...", "Platón reflexiona...",
etc.) tienen, los 9, la cita bibliográfica completa escrita literalmente al final del
campo `texto` entre paréntesis (p. ej. "...(IMMANUEL KANT, Crítica de la razón pura)."),
así que se resolvieron con **evidencia textual directa**, no por inferencia. Se
corrigieron también `obra` (antes "Obra no especificada" en los 9 casos) y `problema`
(antes vacío o un fragmento de frase truncado) usando la misma cita.

**0 casos requieren revisión manual.**

**Hallazgo incidental fuera de alcance**: quedan 6 textos con `obra: "Obra no
especificada"` cuyo `autor` YA era correcto y no forma parte de los 32 valores
problemáticos de `autor` — son un hueco de datos distinto (falta el título de la obra,
no el autor) y no se han tocado, siguiendo la instrucción de no normalizar
destructivamente más de lo pedido.

## 2. Dependencias comprobadas antes de tocar `autor`/`obra` (dictamen: seguro normalizar en el dato)

Búsqueda completa en el repo (`app/`, `scripts/`) de todo lo que lee
`examenesHistoriaFilosofiaMadrid` o los campos `autor`/`obra`/`problema`/`preguntasComunes`:

- **`app/components/PhilosophyExamWorkspace.tsx`**: solo **muestra** `autor`/`obra` como
  texto (`` `**${autor}, ${obra}**` ``) y filtra por `opcion` ('A'/'B'), nunca por el
  valor literal de `autor`. Cambiar el texto es el efecto deseado (limpia
  "TOMÁS DE\nAQUINO" → "Tomás de Aquino" en lo que ve el alumno).
- **`app/lib/camino/randomEvauExercise.ts`**: es el único sitio con lógica real sobre
  `autor` — un clasificador de `topicSlug` **propio y ya existente**, por coincidencia de
  substring en minúsculas/sin acentos (`platon`, `descartes`, `kant`, `hume`, `marx`).
  No hace comparación exacta (`===`) en ningún sitio. Se comprobó explícitamente que
  ninguno de los 9 nombres resueltos por evidencia (Habermas, Tomás de Aquino,
  Aristóteles, Ortega y Gasset, Kant, Platón, Rousseau) coincide por substring con esas 5
  palabras clave salvo los que ya coincidían antes (Kant, Platón) — sin cambio de
  comportamiento. Este clasificador es un mecanismo **aparte** del `topicSlugs`/
  `curriculum_topics` que se implementa en esta tarea (sirve para "practica aleatoria",
  no para Camino/temario) y no se ha tocado.
- **`generateCaminoPlan.ts` / `PRIVATE_BETA_SUBJECTS`**: `historia_filosofia` **ausente**
  de ambas listas — confirmado, no se ha añadido.
- Ningún archivo hace `autor === "literal"`. **Dictamen: normalizar el valor literal en
  el dato es seguro** — no hay lógica exacta que dependa de la grafía actual, y hacerlo
  además corrige errores de visualización reales (saltos de línea dentro del nombre,
  "Autor no especificado" mostrado al alumno).

## 3. Metadata de época — no existe un campo reutilizable, se sigue el patrón de `topicSlugs`

Búsqueda de `period`/`era`/`epoca` como metadata de examen o pregunta en el resto del
proyecto: **no existe ningún precedente a nivel de pregunta.** El único sitio donde
Historia de España representa cronología es `curriculum_topics.block_key`/`block_title`
(p. ej. bloque "Restauración") — allí la época **es** el bloque temático, porque cada
tema pertenece a un único período. Ese patrón no encaja aquí: nuestros bloques son por
**eje** (autor vs. transversal), no por época, y la época de una `preguntaComun` es una
restricción sobre qué autor vale para responder, no un tema de contenido en sí (por eso
el punto 8 pide explícitamente NO crear topics problema×época). Al no existir un campo
reutilizable, se añade `allowedEras?: string[]` directamente en
`PreguntaHistoriaFilosofiaMadrid`, igual que se hizo con `topicSlugs?: string[]` para
otras asignaturas esta sesión — mismo patrón, campo nuevo justificado por ausencia de uno
existente.

**Caso "antigua o medieval" preservado como conjunto real**, no forzado a una única
época: `allowedEras: ['antigua', 'medieval']` en los 12 casos donde el enunciado dice
literalmente "de la época antigua o medieval".

## 4. Topics existentes vs. propuestos

| propuesta | topic existente | acción |
|---|---|---|
| `descartes` | — (parte del stub `descartes-hume-kant`) | **DIVIDIR** del stub |
| `hume` | — (parte del stub `descartes-hume-kant`) | **DIVIDIR** del stub |
| `kant` | — (parte del stub `descartes-hume-kant`) | **DIVIDIR** del stub |
| `platon` | ninguno | CREAR |
| `aristoteles` | ninguno | CREAR |
| `agustin-de-hipona` | ninguno | CREAR |
| `tomas-de-aquino` | ninguno | CREAR |
| `rousseau` | ninguno | CREAR |
| `marx` | ninguno | CREAR |
| `nietzsche` | ninguno | CREAR |
| `ortega-y-gasset` | ninguno | CREAR |
| `hannah-arendt` | ninguno | CREAR |
| `habermas` | ninguno | CREAR |
| `etica-y-moral` | ninguno | CREAR |
| `sociedad-y-politica` | ninguno | CREAR |
| `ser-humano` | ninguno | CREAR |
| `dios` | ninguno | CREAR |
| `conocimiento-y-realidad` | ninguno | CREAR |

Se confirmó por consulta directa a `curriculum_topics` que **ninguno de los 18 slugs
propuestos existe ya bajo ningún subject** (búsqueda exacta, no solo dentro de
`historia_filosofia`). El único topic existente para esta asignatura es el stub
`descartes-hume-kant` (id `04492126-0205-4d38-9653-b1d052a6370d`, order 1,
`block_key='filosofia-moderna'`), con **0 filas dependientes** en `curriculum_content_v2`,
`topic_theory_coverage` y `exam_topics` (verificado por consulta) — seguro de retirar y
dividir en sus 3 autores sin perder nada.

## 5. Tabla de preguntas comunes por problema filosófico (recalculada sobre 204 reales)

| problema | nº preguntas (de 204) | slug definitivo |
|---|---|---|
| Ética y/o moral | 52 | `etica-y-moral` |
| Ser humano | 47 | `ser-humano` |
| Sociedad y/o política | 38 | `sociedad-y-politica` |
| Dios | 37 | `dios` |
| Conocimiento y/o realidad | 30 | `conocimiento-y-realidad` |
| **Total** | **204** | 204/204 clasificadas, 0 sin clasificar |

Coincide exactamente con lo estimado en la investigación previa.

## 6. Tabla de épocas (metadata, no topic)

| época | nº preguntas (de 204) | representación |
|---|---|---|
| moderna | 68 | `allowedEras: ['moderna']` |
| contemporánea | 68 | `allowedEras: ['contemporanea']` |
| antigua | 28 | `allowedEras: ['antigua']` |
| medieval | 28 | `allowedEras: ['medieval']` |
| antigua o medieval (formato reciente) | 12 | `allowedEras: ['antigua','medieval']` |
| **Total** | **204** | 204/204 con época asignada |

## 7. Eje de autor — frecuencia real por topic (80 preguntas reales, no 68 textos)

| topic (autor) | nº preguntas |
|---|---|
| descartes | 12 |
| tomas-de-aquino | 12 |
| platon | 10 |
| hume | 7 |
| rousseau | 7 |
| kant | 7 |
| marx | 5 |
| habermas | 5 |
| ortega-y-gasset | 5 |
| nietzsche | 5 |
| aristoteles | 3 |
| agustin-de-hipona | 1 |
| hannah-arendt | 1 |
| **Total** | **80** |

(Los recuentos aquí son mayores que los del §1 porque cuentan **preguntas**, no
**textos** — un texto del formato 2025 aporta 2 preguntas en vez de 1.)

## 8. Decisión de implementación (semántica del catálogo, sin doble etiquetado)

- Pregunta ligada a texto/autor fijado → `topicSlugs` es **solo** el topic de autor (p.
  ej. `['kant']`). Nunca se añade además un topic de problema transversal a estas
  preguntas — evita que el mismo eje tenga dos significados.
- `preguntaComun` sin autor fijado → `topicSlugs` es **solo** el topic de problema
  transversal (p. ej. `['etica-y-moral']`), más `allowedEras` como metadata aparte (no
  como topic). Nunca se asigna un autor inventado.
- Implementado como **enriquecimiento derivado** al final de
  `historia_filosofia_madrid.ts` (no como literal hardcodeado en cada uno de los ~350
  objetos de examen): se deriva `topicSlugs`/`allowedEras` de `texto.autor` y
  `pregunta.enunciado`, que son los campos reales ya presentes. Se evita así editar a
  mano los ~350 literales de examen (riesgo de tocar id/enunciado/criterios) y el dato
  deriva nunca puede desincronizarse del `autor` normalizado.
