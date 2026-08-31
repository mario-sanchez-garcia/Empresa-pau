# Normalización de autores — Historia de la Filosofía (Madrid)

Investigación de datos, sin aplicar nada todavía a `curriculum_topics` /
`curriculum_content_v2`. Corpus real: 34 exámenes, 68 textos (opción A/B × 34), 80
preguntas ligadas a esos textos y 204 `preguntasComunes` = 284 unidades de pregunta en
total, todo extraído directamente de `app/data/historia_filosofia_madrid.ts` (no
inventado).

## 1. Tabla de normalización de autores (32 valores → 13 filósofos reales)

| valor original (`autor`) | frecuencia | valor normalizado | nota |
|---|---|---|---|
| "René Descartes" | 8 | **Descartes** | |
| "RENÉ\nDESCARTES" | 1 | **Descartes** | salto de línea en el dato, mismo autor |
| "Descartes" | 1 | **Descartes** | forma corta |
| "TOMÁS DE AQUINO" | 5 | **Tomás de Aquino** | |
| "Tomás de Aquino" | 1 | **Tomás de Aquino** | |
| "Santo Tomás de Aquino" | 1 | **Tomás de Aquino** | |
| "TOMÁS DE\nAQUINO" | 1 | **Tomás de Aquino** | salto de línea |
| "Santo Tomás" | 1 | **Tomás de Aquino** | forma corta |
| "Autor no especificado" (2022-extraordinaria A) | 1 | **Tomás de Aquino** | ver §2 — resuelto con evidencia literal, no inferencia |
| "Platón" | 6 | **Platón** | |
| "Platón reflexiona en este texto en torno al conocimiento" | 1 | **Platón** | fragmento de frase, autor explícito en el propio texto |
| "Immanuel Kant" | 4 | **Kant** | |
| "Kant reflexiona en este texto sobre la necesidad de los conocimientos a priori" | 2 | **Kant** | fragmento de frase, autor explícito |
| "Kant reflexiona en este texto sobre la posibilidad de la metafísica" | 1 | **Kant** | fragmento de frase, autor explícito |
| "Jean-Jacques Rousseau" | 2 | **Rousseau** | |
| "JEAN-JACQUES ROUSSEAU" | 2 | **Rousseau** | |
| "JEAN-JACQUES\nROUSSEAU" | 1 | **Rousseau** | salto de línea |
| "Rousseau reflexiona en este texto sobre la relación entre individuo y sociedad" | 1 | **Rousseau** | fragmento de frase, autor explícito |
| "David Hume" | 5 | **Hume** | |
| "Jürgen Habermas" | 1 | **Habermas** | |
| "JÜRGEN\nHABERMAS" | 3 | **Habermas** | salto de línea |
| "Autor no especificado" (2018-ordinaria B) | 1 | **Habermas** | ver §2 — resuelto con evidencia literal, no inferencia |
| "José Ortega y Gasset" | 2 | **Ortega y Gasset** | |
| "ORTEGA Y GASSET" | 1 | **Ortega y Gasset** | |
| "JOSÉ ORTEGA Y\nGASSET" | 1 | **Ortega y Gasset** | salto de línea |
| "Ortega y Gasset reflexiona en este texto sobre el problema del conocimiento" | 1 | **Ortega y Gasset** | fragmento de frase, autor explícito |
| "Karl Marx" | 4 | **Marx** | |
| "Friedrich Nietzsche" | 2 | **Nietzsche** | |
| "F. NIETZSCHE" | 1 | **Nietzsche** | |
| "FRIEDRICH\nNIETZSCHE" | 1 | **Nietzsche** | |
| "ARISTÓTELES" | 2 | **Aristóteles** | |
| "Autor no especificado" (2023-modelo B) | 1 | **Aristóteles** | ver §2 — resuelto con evidencia literal, no inferencia |
| "Agustín de Hipona" | 1 | **Agustín de Hipona** | |
| "HANNAH ARENDT" | 1 | **Hannah Arendt** | |

**Total: 68/68 textos normalizados. 0 casos sin resolver.**

### Recuento final por filósofo (los 13 reales del corpus)

| filósofo | nº de textos (de 68) |
|---|---|
| Descartes | 10 |
| Tomás de Aquino | 10 |
| Platón | 7 |
| Kant | 7 |
| Rousseau | 6 |
| Hume | 5 |
| Habermas | 5 |
| Ortega y Gasset | 5 |
| Marx | 4 |
| Nietzsche | 4 |
| Aristóteles | 3 |
| Agustín de Hipona | 1 |
| Hannah Arendt | 1 |

Estos 13 coinciden exactamente con el bloque de autores exigidos en la concreción
curricular de Madrid para la PAU de Historia de la Filosofía (antigua: Platón,
Aristóteles; medieval: Agustín de Hipona y/o Tomás de Aquino; moderna: Descartes, Hume,
Rousseau, Kant; contemporánea: Marx, Nietzsche, Ortega y Gasset, y las incorporaciones más
recientes del currículo LOMLOE, Arendt y Habermas) — no es una lista genérica, es la que
efectivamente aparece en los 68 textos reales de examen.

## 2. Los 3 casos "Autor no especificado" — resueltos, no son ambiguos

El campo `autor` decía literalmente "Autor no especificado" y `obra`: "Obra no
especificada" en 3 textos, pero **no hizo falta inferir nada por contexto**: el propio
campo `texto` incluye la cita bibliográfica completa entre paréntesis al final de la
transcripción, con el nombre del autor y la obra ya escritos:

| examen | cita literal encontrada en `texto` | resolución |
|---|---|---|
| `historia-filosofia-mad-2018-ordinaria` (B) | "…(JÜRGEN HABERMAS, *Tres modelos normativos de democracia*)." | autor: **Habermas**, obra: *Tres modelos normativos de democracia* |
| `historia-filosofia-mad-2022-extraordinaria` (A) | "…(TOMÁS DE AQUINO, *Suma teológica*)." | autor: **Tomás de Aquino**, obra: *Suma teológica* |
| `historia-filosofia-mad-2023-modelo` (B) | "…(ARISTÓTELES, *Ética a Nicómaco*)." | autor: **Aristóteles**, obra: *Ética a Nicómaco* |

Es decir: fue un hueco de captura de datos (el `autor`/`obra` no se rellenaron al copiar
el texto), no una ambigüedad real. **0 casos requieren revisión manual** — los 68/68
textos quedan con autor y obra ciertos.

## 3. Propuesta de diseño de temas — por autor, con un eje adicional para preguntasComunes

**Por autor (recomendado para los 68 textos + sus 80 preguntas ligadas, 84 unidades):**
un tema por filósofo (13 temas), igual que el criterio "tema cronológico" usado en
Historia de España — aquí encaja igual o mejor, porque cada autor tiene un bloque de
pensamiento propio y diferenciado en el temario (no hay solapamiento de contenido entre,
p. ej., el problema del conocimiento en Descartes y el problema del conocimiento en Kant:
son respuestas doctrinales distintas, aunque compartan etiqueta de "problema"). Agrupar
por corriente en vez de por autor (p. ej. "racionalismo", "empirismo", "existencialismo")
perdería precisión: Descartes y Kant no comparten corriente pero sí podrían compartir un
`problema` genérico ("Conocimiento"), y agrupar por `problema` mezclaría doctrinas
incompatibles bajo un mismo tema — así que la clasificación por autor individual es la que
permite reforzar con precisión real ("el alumno falla Kant" ≠ "el alumno falla Descartes",
aunque ambos sean textos de teoría del conocimiento).

**Para las `preguntasComunes` (204 unidades) — tratamiento aparte, NO por autor:**
qué preguntan realmente: cada una pide "exponga el problema de [Ética y/o moral /
Sociedad y/o política / Ser humano / Dios / Conocimiento y/o realidad] en un autor **o
corriente filosófica** de la época [antigua/medieval/moderna/contemporánea]" — el alumno
elige libremente qué autor usar para responder. Como el dato no fija un autor concreto,
no se puede etiquetar con un tema de autor sin inventar una respuesta que el ejercicio no
da. Esto es exactamente análogo a "técnica" en Comunicación de Lengua: un eje transversal
de habilidad/tema filosófico, no de contenido de autor. Propuesta: 5 temas nuevos, uno por
problema filosófico transversal (`etica-y-moral`, `sociedad-y-politica`, `ser-humano`,
`dios`, `conocimiento-y-realidad`), sin cruzarlos con la época — la época en el enunciado
solo acota qué autores son válidos para responder, no es en sí misma una unidad de
contenido separable de forma fiable (los límites de "moderna" vs. "contemporánea" varían
entre convocatorias, ver combinaciones abajo) y crear un tema por cada combinación
problema×época fragmentaría en exceso 204 preguntas reales entre ~20 combinaciones de muy
distinto volumen.

Frecuencias reales por problema filosófico (204/204 clasificadas, 0 sin clasificar):

| problema filosófico | nº de preguntasComunes (de 204) |
|---|---|
| Ética y/o moral | 52 |
| Ser humano | 47 |
| Sociedad y/o política | 38 |
| Dios | 37 |
| Conocimiento y/o realidad | 30 |

Frecuencias por época (informativo, no se propone como tema propio):

| época | nº de preguntasComunes (de 204) |
|---|---|
| moderna | 68 |
| contemporánea | 68 |
| antigua | 28 |
| medieval | 28 |
| "antigua o medieval" (combinada, aparece en convocatorias recientes) | 12 |

## 4. Resumen de diseño propuesto (para tu revisión, nada creado todavía)

- **13 temas por autor** (Descartes, Tomás de Aquino, Platón, Kant, Rousseau, Hume,
  Habermas, Ortega y Gasset, Marx, Nietzsche, Aristóteles, Agustín de Hipona, Hannah
  Arendt) → cubren los 68 textos + sus 80 preguntas de comentario ligadas (84 unidades
  totales contando A.1/B.1 y las de formato 2025).
- **5 temas transversales por problema filosófico** (Ética y/o moral, Sociedad y/o
  política, Ser humano, Dios, Conocimiento y/o realidad) → cubren las 204
  `preguntasComunes`, que no fijan autor.
- Total: 13 + 5 = **18 temas nuevos** propuestos (frente al único stub existente hoy en
  `curriculum_topics`), cubriendo los 284/284 unidades del corpus con evidencia real, sin
  ningún caso "requiere revisión manual" pendiente.

No se ha tocado Supabase, `ingles.ts`, ni ninguna otra asignatura. Este documento es solo
para tu revisión antes de decidir si procedo a crear los temas.
