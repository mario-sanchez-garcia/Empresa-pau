# Propuesta de vinculación obra leída → catálogo de libros (Lengua, Comunidad de Madrid)

Generado a partir de `app/data/lengua.ts` (`examenesLengua`, ejercicios de "obra leída" —
`grupo: "obra"`, preguntas 3.3/3.4 o equivalentes A.7/B.7) y `lengua_obras_lectura` en
Supabase (24 obras, catálogo de referencia — ver investigación de la tarea que la creó).

**No se ha asignado ningún `obraSlug` — ver el motivo abajo.** Sí se ha añadido
`periodo` (tramo cronológico) a los 59 ejercicios donde es determinable, y se ha dejado
el mecanismo de filtrado listo (`app/lib/camino/filterObraLeidaExercises.ts`) para
cuando exista un `obraSlug` real que aplicar.

## Por qué ningún ejercicio tiene (ni puede tener) un `obraSlug` asignado

Esto es distinto del caso de Historia, donde el dato existía pero solo era accesible
revisando el PDF original del examen. Aquí **no hay ningún dato que revisar**: el examen
real de Lengua de Madrid **nunca nombra un libro concreto** en la pregunta de obra leída
— el enunciado pregunta de forma genérica por "la obra española que haya leído" de un
tramo cronológico, precisamente porque cada centro asigna una lectura distinta a sus
alumnos (confirmado con un documento real de un instituto de Madrid en la tarea que creó
el catálogo). No existe, por tanto, una "respuesta correcta" única por examen que se
pueda buscar en ningún sitio — el libro real que correspondía a cada examen concreto
dependía de qué le tocara leer a cada alumno, no del examen en sí.

Vincular un ejercicio a un libro concreto solo tiene sentido, por tanto, **a nivel de
alumno** (qué ha leído él/ella), no a nivel de examen — que es exactamente el mecanismo
que ya existe (`lengua_obras_lectura` + `perfiles.lengua_obras_leidas` +
`LenguaObrasLeidasSelector`) y el que se deja listo para consumir en
`filterObraLeidaExercises.ts`.

## Lo que SÍ es determinable: el periodo

Aunque no el libro, **el tramo cronológico sí está siempre en el enunciado** de forma
explícita e inequívoca — se ha añadido como campo `periodo` (mismos 3 valores que
`lengua_obras_lectura.periodo`) a los 59 ejercicios genuinos de obra leída.

| periodo | ejercicios |
|---|---|
| anterior_1936 | 25 |
| 1937_1974 | 20 |
| posterior_1975 | 14 |
| **Total con periodo** | **59** |

## Incidencia de calidad de datos encontrada (1 ejercicio, sin tocar)

`lengua-19-B.7` (examen 19, 2018 Modelo B) tiene `grupo: "obra"` pero su enunciado real
es un fragmento de comentario de texto sobre física/Vera Rubin — no menciona ninguna obra
leída ni tramo cronológico. Es un error de etiquetado en los datos de origen de
`app/data/lengua.ts` (contenido y `grupo` no coinciden), no algo que se pueda resolver
asignándole un periodo inventado. **Se ha dejado sin `periodo` ni `obraSlug`, y sin
tocar su contenido** — requiere revisión manual contra el examen fuente para saber si el
enunciado real de esa pregunta se transcribió mal o si el campo `grupo` está mal puesto.

## Mecanismo de filtrado (listo, no cableado a producción)

`app/lib/camino/filterObraLeidaExercises.ts` — `filterObraLeidaExercisesForStudent(exercises, declaradas)`:
dado el array de `ObraLeidaDeclarada` que el alumno ya puede guardar desde
`LenguaObrasLeidasSelector` (`perfiles.lengua_obras_leidas`), devuelve los ejercicios de
obra leída que le corresponden — por `obraSlug` exacto si el ejercicio ya lo tiene, o por
`periodo` como aproximación razonable mientras no lo tenga (todo ejercicio de un tramo
pregunta, en esencia, por cualquier libro de ese tramo). No se ha conectado a
`generatePracticeSession`/`practica-parcial` — eso es cambiar el motor de prácticas real,
fuera del alcance de esta tarea; queda listo para esa integración cuando se decida
hacerla.

## Detalle por ejercicio (60)

| examen | ejercicio_id | enunciado (extracto) | periodo | obraSlug |
|---|---|---|---|---|
| 2024 Ordinaria 12:00 | `lengua-1-3.3` | los aspectos más relevantes de la obra española o hispanoamericana que haya leído escrita en el... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2024 Ordinaria 12:00 | `lengua-1-3.4` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2024 Ordinaria 9:30 | `lengua-2-3.3` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2024 Ordinaria 9:30 | `lengua-2-3.4` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2023 Ordinaria Lunes | `lengua-3-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2023 Ordinaria Lunes | `lengua-3-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2023 Ordinaria Martes | `lengua-4-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2023 Ordinaria Martes | `lengua-4-B.7` | los aspectos más relevantes de la obra española o hispanoamericana que haya leído escrita en el... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2022 Ordinaria Lunes | `lengua-5-A.7` | los aspectos más relevantes de la obra española que haya leído escrita en el período posterior... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2022 Ordinaria Lunes | `lengua-5-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y 1939,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2022 Ordinaria Martes | `lengua-6-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2022 Ordinaria Martes | `lengua-6-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y 1939,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2021 Ordinaria Lunes | `lengua-7-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2021 Ordinaria Lunes | `lengua-7-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y 1939,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2021 Ordinaria Martes | `lengua-8-A.7` | los aspectos más relevantes de la obra española que haya leído escrita en el período posterior... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2021 Ordinaria Martes | `lengua-8-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y 1939,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2020 Ordinaria Martes | `lengua-9-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y 1939.... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2020 Ordinaria Martes | `lengua-9-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y 1974.... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2019 Ordinaria Lunes | `lengua-10-A.7` | los aspectos más relevantes de la obra española que haya leído escrita desde 1940 hasta 1974.... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2019 Ordinaria Lunes | `lengua-10-B.7` | los aspectos más relevantes de la obra española que haya leído escrita desde 1900 hasta 1939.... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2026 Modelo Única | `lengua-11-3.3` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2026 Modelo Única | `lengua-11-3.4` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2025 Modelo Única | `lengua-12-3.3` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2025 Modelo Única | `lengua-12-3.4` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2025 Extraordinaria Única | `lengua-13-3.3` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2025 Extraordinaria Única | `lengua-13-3.4` | los aspectos más relevantes de la obra española o hispanoamericana que haya leído escrita en el... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2024 Extraordinaria Lunes | `lengua-14-A.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y 1974,... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2024 Extraordinaria Martes | `lengua-15-B.7` | los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y 1936,... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2018 Extraordinaria A | `lengua-16-A.7` | Comente los aspectos más relevantes de la obra española publicada entre 1940 y 1974 que haya... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2018 Extraordinaria B | `lengua-17-B.7` | Comente los aspectos más relevantes de la obra española posterior a 1975 que haya leído en... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2018 Modelo A | `lengua-18-A.7` | Comente los aspectos más relevantes de la obra española del siglo XX anterior a 1940 que... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2018 Modelo B | `lengua-19-B.7` | % consiste en energía oscura, la “constante cosmológica” que Einstein inventó para que el cosmos no... | **SIN CLASIFICAR — ver incidencia arriba** | _(ninguno)_ |
| 2018 Ordinaria A | `lengua-20-A.7` | Comente los aspectos más relevantes de la obra española posterior a 1975 que haya leído en... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2018 Ordinaria B | `lengua-21-B.7` | Comente los aspectos más relevantes de la obra española publicada entre 1940 y 1974 que haya... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2019 Extraordinaria A | `lengua-22-A.7` | Comente los aspectos más relevantes de la obra española del siglo XX anterior a 1939 que... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2019 Extraordinaria B | `lengua-23-B.7` | Comente los aspectos más relevantes de la obra española posterior a 1974 que haya leído en... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2019 Modelo A | `lengua-24-A.7` | Comente los aspectos más relevantes de la obra española posterior a 1974 que haya leído en... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2019 Modelo B | `lengua-25-B.7` | Comente los aspectos más relevantes de la obra española del siglo XX anterior a 1940 que... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2020 Extraordinaria A | `lengua-26-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2020 Extraordinaria B | `lengua-27-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita desde 1975 hasta... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2020 Modelo A | `lengua-28-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2020 Modelo B | `lengua-29-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2021 Extraordinaria A | `lengua-30-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita en el periodo... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2021 Extraordinaria B | `lengua-31-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2021 Modelo A | `lengua-32-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita desde 1975 hasta... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2021 Modelo B | `lengua-33-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2022 Extraordinaria A | `lengua-34-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2022 Extraordinaria B | `lengua-35-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2022 Modelo A | `lengua-36-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2022 Modelo B | `lengua-37-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita en el período... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2023 Extraordinaria A | `lengua-38-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2023 Extraordinaria B | `lengua-39-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2023 Modelo A | `lengua-40-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1900 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2023 Modelo B | `lengua-41-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1940 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2024 Modelo A | `lengua-42-A.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2024 Modelo B | `lengua-43-B.7` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2026 Ordinaria 9:30 | `lengua-44-3.3` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
| 2026 Ordinaria 9:30 | `lengua-44-3.4` | Comente los aspectos más relevantes de la obra española o hispanoamericana que haya leído escrita en... | posterior_1975 (posterior a 1975) | _(ninguno)_ |
| 2026 Ordinaria 12:00 | `lengua-45-3.3` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1875 y... | anterior_1936 (anterior a 1936) | _(ninguno)_ |
| 2026 Ordinaria 12:00 | `lengua-45-3.4` | Comente los aspectos más relevantes de la obra española que haya leído escrita entre 1937 y... | 1937_1974 (1937–1974) | _(ninguno)_ |
