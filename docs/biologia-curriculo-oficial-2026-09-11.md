# Biología 2º Bachillerato — origen del temario cargado

Fecha de carga: **11 de septiembre de 2026**.

## Fuente

Estructura tomada **literalmente** del currículo oficial de la Comunidad de Madrid:

- **Decreto 64/2022, de 20 de julio** (BOCM núm. 176, 26 de julio de 2022), Anexo II, materia *Biología*, 2.º de Bachillerato.
- Confirmado contra la **reunión informativa PAU Biología 2026 de la UAM** (4 de noviembre de 2025), que fija la prueba sobre "los saberes básicos establecidos tanto en el Real Decreto 243/2022 como en el Decreto 64/2022" y presenta los "Contenidos (Bloques A a F)".

El decreto enumera textualmente los seis bloques: «Las biomoléculas», «Genética molecular y herencia», «Biología celular», «Metabolismo», «Biotecnología» e «Inmunología».

## Estructura cargada — 63 temas

| Bloque | Slug | Temas | Orden |
|---|---|---|---|
| A. Las biomoléculas | `biomoleculas` | 13 | 1–13 |
| B. Genética molecular y herencia | `genetica-molecular` | 14 | 14–27 |
| C. Biología celular | `biologia-celular` | 11 | 28–38 |
| D. Metabolismo | `metabolismo` | 11 | 39–49 |
| E. Biotecnología | `biotecnologia` | 6 | 50–55 |
| F. Inmunología | `inmunologia` | 8 | 56–63 |

Granularidad equiparable a la de Física (57) y Química (68).

## Dónde vive

Se siguió exactamente la misma cadena que Física, Química y Matemáticas II:

1. **`curriculum_topics`** (Supabase): 63 filas, `subject='biologia'`, `comunidad=null`.
   `block_key` = slug del bloque, `block_title` = título.
2. **`curriculum_content_v2`** (Supabase): 63 filas con `concept_markdown`,
   `worked_example_markdown`, `practice_prompt` y `alert_markdown`, todas con
   `review_status='published'` y enlazadas por `topic_id`.
   Ojo: aquí `block_key` es el **título** y `block_slug` el slug — invertido
   respecto a `curriculum_topics`. Es la convención que ya seguía Física.
3. **`app/data/camino/curriculum_seed.json`**: 63 entradas con
   `contentStatus: 'flashcard_v2'` y `v2SortOrder` igual al `sort_order`.
4. **`app/lib/camino/betaCurriculum.ts`**: `'biologia'` añadido a
   `PRIVATE_BETA_SUBJECTS` y a `PRIVATE_BETA_SUBJECT_LABELS`.

`generateCaminoPlan` lee la **fuente principal**, que es `curriculum_content_v2`
filtrada por `review_status='published'`; `PRIVATE_BETA_CURRICULUM_TOPICS` solo
actúa de respaldo cuando esa consulta no devuelve nada. Por eso Biología no
necesita temas propios en `betaCurriculum.ts`.

## Notas

- La fila esqueleto que existía («Mendel, ADN y expresión génica», bloque
  `genetica`) **no se borró**: se reconvirtió en el tema 26, «Las leyes de
  Mendel», conservando su UUID para no dejar huérfana ninguna referencia.
- Las preguntas 1 a 5 del examen de Madrid **no** se corresponden con bloques de
  contenido: cualquier bloque puede caer en cualquier posición. El `tema` de
  `app/data/biologia.ts` es la frase de encabezado del enunciado, no una
  taxonomía; no sirve como clasificación.
- El contenido está **redactado a partir del currículo oficial**, no procede de
  apuntes de ningún profesor. Si más adelante llegan apuntes reales, conviene
  revisarlo y sustituirlo tema a tema.
