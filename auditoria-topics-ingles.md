# Auditoría de topicSlugs — Inglés Madrid (325 ejercicios)

Auditoría de la propuesta de `topicSlugs` para los 325 ejercicios de Inglés de Madrid,
realizada ANTES de aplicar nada a `app/data/ingles.ts`, distinguiendo explícitamente
"tipo/formato de ejercicio" (lo que dice `label`) de "contenido de aprendizaje concreto"
(lo que el alumno debe reforzar). Todos los conteos de esta tabla están calculados
leyendo los 325 ejercicios reales de `ingles.ts` (no inventados ni extrapolados).

## Tabla por familia

| bloque | propuesta actual (label) | estado | propuesta definitiva | motivo |
|---|---|---|---|---|
| Comprensión T/F (65) | `comprension-verdadero-falso-con-evidencia-textual` | **CORRECTO** | mismo topic, sin cambios | La destreza evaluada (localizar y citar evidencia textual) es idéntica en las 65, incluida la variante 2025-2026 "True/False/Not Given" — es un cambio de formato (una tercera opción, NG), no de destreza. |
| Comprensión abierta (65) | `comprension-abierta-con-propias-palabras` | **CORRECTO** | mismo topic, sin cambios | Las 65 piden parafrasear ideas del texto con palabras propias; no hay variación real de destreza entre años. |
| Vocabulario (65) | `vocabulario-en-contexto` | **CORRECTO** | mismo topic, sin cambios | Formato estable 2018-2026 (encontrar la palabra del texto que significa X); variación de 4 vs. 5 ítems es solo de cantidad, no de destreza distinta. |
| Gramática (65) | `gramatica-transformacion-y-uso-de-estructuras` (único) | **INCOMPLETO** | mantener el topic general **+ 4 topics finos** (`estilo-indirecto-reported-speech`, `oraciones-condicionales`, `voz-pasiva`, `comparativos-y-superlativos`) | El label identifica correctamente el BLOQUE del examen, pero un único topic no permite a Camino distinguir "el alumno falla condicionales" de "el alumno falla pasiva". La lectura completa de los 65 ejercicios (ver tabla de frecuencias) mostró 3-4 fenómenos gramaticales distintos mezclados por ejercicio, con volumen real suficiente en 4 fenómenos para justificar topics propios. |
| Redacción (65) | `redaccion-ensayo-de-opinion` (único) | **INCOMPLETO** | mantener para 56/65 **+ 2 topics nuevos** (`redaccion-narrativa-descriptiva-personal` para 9, `redaccion-carta-o-email-informal` para 4, multi-etiquetado donde aparecen como alternativa) | La lectura de los 65 prompts confirmó que la mayoría (56) sí son ensayo argumentativo/de opinión, pero 9 piden narrar/describir una experiencia personal (destreza distinta: tiempos narrativos, no argumentación) y 4 (formato emergente 2025-2026) piden un email informal (registro y convenciones distintas). Forzar los 13 restantes en "ensayo de opinión" habría sido una clasificación incorrecta por tipo de texto. |

Ningún caso resultó **INCORRECTO** ni **DEMASIADO_GENERAL** en el sentido de "hay que
sustituir por completo la propuesta original" — el label siempre acertó el bloque; el
problema exclusivo fue de **granularidad insuficiente** en Gramática y Redacción, resuelto
añadiendo topics finos sin retirar los generales.

## Gramática — tabla de frecuencias (65 ejercicios, lectura completa uno a uno)

| estructura gramatical | nº ejercicios en los que aparece | topic existente / creado |
|---|---|---|
| Estilo indirecto (reported speech) | 37 / 65 | **nuevo**: `estilo-indirecto-reported-speech` |
| Oraciones condicionales (1ª, 2ª, 3ª, mixtas) | 32 / 65 | **nuevo**: `oraciones-condicionales` |
| Comparativos y superlativos | 22 / 65 | **nuevo**: `comparativos-y-superlativos` |
| Voz pasiva | 20 / 65 | **nuevo**: `voz-pasiva` |
| Gerundio / infinitivo | ~14 / 65 | no separado — ver justificación |
| Preposiciones dependientes | ~13 / 65 | no separado — ver justificación |
| Oraciones de relativo | ~9 / 65 | no separado — ver justificación |
| (todos los ejercicios, como bloque) | 65 / 65 | `gramatica-transformacion-y-uso-de-estructuras` (topic general, se mantiene) |

**Por qué estos 4 y no los otros 3**: los 4 elegidos combinan volumen real alto (20-37 de
65) con ser reglas gramaticales claramente enunciables y accionables para reforzar
("repasa la voz pasiva", "repasa condicionales"). Gerundio/infinitivo y preposiciones
dependientes son más "colocacionales" (se aprenden verbo a verbo / preposición a
preposición, no como una única regla transformable en una lección de repaso) y su volumen
es menor; oraciones de relativo tiene el volumen más bajo (9/65) y ya queda parcialmente
cubierto por la práctica general. Un único ejercicio (`ing-1920Ext-B-4`) no contiene
ninguno de los 4 fenómenos finos — se queda correctamente solo con el topic general, lo
que confirma que el paraguas general sigue siendo necesario para exámenes mixtos/simulacro
tal como preveía la Opción C.

Multi-etiquetado: cada ejercicio de Gramática recibe el topic general **+** los topics
finos de los fenómenos que realmente contiene (normalmente 1-3), con **confianza alta**
en todos los casos — el multi-tag no implica confianza media cuando las estructuras están
claramente identificadas por lectura directa del enunciado (no por keywords ciegas; dos
casos de voz pasiva y uno de condicionales que un primer barrido por palabras clave no
detectó se añadieron tras releer el enunciado completo).

## Redacción — tabla de tipos (65 prompts, lectura completa uno a uno)

| tipo de writing | nº prompts | ejemplo de IDs | topic existente / creado |
|---|---|---|---|
| Ensayo de opinión / argumentativo | 56 / 65 | `ing-1718-A-5`, `ing-2223-A-5`, `ing-2425-A-5` | `redaccion-ensayo-de-opinion` (se mantiene) |
| Narrativa / descripción de experiencia personal | 9 / 65 | `ing-1819-A-5`, `ing-1920-L-A-5`, `ing-2021Mod-B-5` | **nuevo**: `redaccion-narrativa-descriptiva-personal` |
| Carta o email informal | 4 / 65 | `ing-2425-A-5`, `ing-2425-B-5`, `ing-2425Mod-5`, `ing-2526Mod-5` | **nuevo**: `redaccion-carta-o-email-informal` (siempre junto a `redaccion-ensayo-de-opinion`, ya que en los exámenes "elige 1 de 2" 2025-2026 el email es la alternativa a un ensayo de opinión) |

Uno de los 9 narrativos (`ing-2325...`, un relato de terror) es un caso límite pero se
mantiene en esta familia porque sigue pidiendo narrar una experiencia/situación con
tiempos de pasado, no argumentar una postura.

## Consulta al catálogo real (`curriculum_topics`, subject='ingles')

Antes de crear ningún topic nuevo se consultó la tabla real y se confirmó que los 5
topics de Destrezas PAU ya existentes (`comprension-verdadero-falso-con-evidencia-textual`,
`comprension-abierta-con-propias-palabras`, `vocabulario-en-contexto`,
`gramatica-transformacion-y-uso-de-estructuras`, `redaccion-ensayo-de-opinion`, order 2-6)
no tenían equivalente para los 4 fenómenos gramaticales finos ni para las 2 familias de
redacción — no se duplicó ningún topic existente. Se crearon los 6 nuevos en el mismo
bloque `destrezas-pau` (order 7-12), en `curriculum_topics` y `curriculum_content_v2`
(`review_status='draft'`), y sus 6 entradas correspondientes en `curriculum_seed.json`
(`v2SortOrder` verificado idéntico al `sort_order` real de cada fila, no asumido).

## Decisión final por familia

- **Comprensión T/F** y **Comprensión abierta**: conservan sus 2 topics existentes, sin
  cambios.
- **Vocabulario**: conserva su topic existente, sin cambios.
- **Gramática**: opción **C** — topic general + topics finos, coexistiendo. El general
  cubre exámenes/simulacros con fenómenos mixtos o minoritarios; los finos permiten a
  Camino reforzar el fenómeno concreto que el alumno falla.
- **Redacción**: `redaccion-ensayo-de-opinion` es correcto para 56/65, pero no para los 65
  — se añaden 2 topics finos para las 2 familias reales restantes (narrativa, email).
