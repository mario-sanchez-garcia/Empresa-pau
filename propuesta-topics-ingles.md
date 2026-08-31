# Propuesta de topicSlugs — Inglés (Madrid)

## Resumen

- **325 ejercicios reales** analizados (`app/data/ingles.ts`, interfaz `PreguntaIngles`, 65 exámenes Madrid 2018-2026, filtrados por `comunidad === 'Madrid'`).
- Mapeo basado en el campo `label` (bloque), que distingue el tipo de tarea de forma fiable y estable en los 65 exámenes — a diferencia de Química/CCSS, aquí **no se necesita leer cada enunciado para clasificar**, porque el propio dato ya identifica la tarea sin ambigüedad.
- **Confianza alta en el 100% de los 325 casos** — no ha aparecido ningún caso real de ambigüedad que justifique una sección de revisión manual.
- Variantes de un mismo año (`True / False / Not Given`, `Gramática (elige 4 de 6)`, `Redacción (elige 1 de 2)`) son la misma tarea con una pequeña variación de formato (una tercera opción, o elegir entre varias) — mismo topic.
- **NO se ha aplicado nada a `ingles.ts` todavía** — esto es solo propuesta.

### Desglose por tema

| topic_slug | Título | Ejercicios |
|---|---|---|
| `comprension-verdadero-falso-con-evidencia-textual` | Comprensión Lectora: Verdadero/Falso con Evidencia Textual | 65 |
| `comprension-abierta-con-propias-palabras` | Comprensión Lectora: Preguntas Abiertas con Propias Palabras | 65 |
| `vocabulario-en-contexto` | Vocabulario en Contexto | 65 |
| `gramatica-transformacion-y-uso-de-estructuras` | Gramática: Transformación y Uso de Estructuras | 65 |
| `redaccion-ensayo-de-opinion` | Redacción: Ensayo de Opinión (150-200 palabras) | 65 |
| **Total** | | **325** |

## REQUIERE REVISIÓN MANUAL (0)

Ninguno. Los 325 ejercicios se clasificaron con confianza alta a partir del campo `label`, sin ningún caso ambiguo.

## Comprensión Lectora: Verdadero/Falso con Evidencia Textual (65 ejercicios)

| ID | Año | Label original | topicSlug propuesto | Confianza |
|---|---|---|---|---|
| `ing-1718-A-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1718-B-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819-A-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819-B-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920-L-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920-L-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920-M-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920-M-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021-L-A-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021-L-B-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021-M-A-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021-M-B-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122-L-A-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122-L-B-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122-M-A-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122-M-B-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223-L-A-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223-L-B-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223-M-A-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223-M-B-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324-L-A-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324-L-B-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324-M-A-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324-M-B-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2425-A-1` | 2025 | True / False / Not Given | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2425-B-1` | 2025 | True / False / Not Given | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021Ext-A-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021Ext-B-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021Mod-A-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021Mod-B-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122Ext-A-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122Ext-B-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122Mod-A-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2122Mod-B-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223Ext-A-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223Ext-B-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223Mod-A-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2223Mod-B-1` | 2023 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324Ext-A-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324Ext-B-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324Mod-A-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2324Mod-B-1` | 2024 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2425Ext-1` | 2025 | True / False / Not Given | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2425Mod-1` | 2025 | True / False / Not Given | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2526Mod-1` | 2026 | True / False / Not Given | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1718Mod-A-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1718Mod-B-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1718Ext-A-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1718Ext-B-1` | 2018 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819Mod-A-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819Mod-B-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819Ext-A-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1819Ext-B-1` | 2019 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920Mod-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920Mod-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920Ext-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920Ext-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920ExtCoin-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920ExtCoin-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920OrdAdic-A-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-1920OrdAdic-B-1` | 2020 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021OrdCoin-A-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2021OrdCoin-B-1` | 2021 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2022OrdCoin-A-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |
| `ing-2022OrdCoin-B-1` | 2022 | True / False | `comprension-verdadero-falso-con-evidencia-textual` | alta |

## Comprensión Lectora: Preguntas Abiertas con Propias Palabras (65 ejercicios)

| ID | Año | Label original | topicSlug propuesto | Confianza |
|---|---|---|---|---|
| `ing-1718-A-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1718-B-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819-A-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819-B-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920-L-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920-L-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920-M-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920-M-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021-L-A-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021-L-B-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021-M-A-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021-M-B-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122-L-A-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122-L-B-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122-M-A-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122-M-B-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223-L-A-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223-L-B-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223-M-A-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223-M-B-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324-L-A-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324-L-B-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324-M-A-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324-M-B-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2425-A-2` | 2025 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2425-B-2` | 2025 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021Ext-A-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021Ext-B-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021Mod-A-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021Mod-B-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122Ext-A-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122Ext-B-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122Mod-A-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2122Mod-B-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223Ext-A-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223Ext-B-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223Mod-A-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2223Mod-B-2` | 2023 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324Ext-A-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324Ext-B-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324Mod-A-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2324Mod-B-2` | 2024 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2425Ext-2` | 2025 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2425Mod-2` | 2025 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2526Mod-2` | 2026 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1718Mod-A-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1718Mod-B-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1718Ext-A-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1718Ext-B-2` | 2018 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819Mod-A-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819Mod-B-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819Ext-A-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1819Ext-B-2` | 2019 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920Mod-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920Mod-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920Ext-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920Ext-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920ExtCoin-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920ExtCoin-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920OrdAdic-A-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-1920OrdAdic-B-2` | 2020 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021OrdCoin-A-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2021OrdCoin-B-2` | 2021 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2022OrdCoin-A-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |
| `ing-2022OrdCoin-B-2` | 2022 | Comprensión abierta | `comprension-abierta-con-propias-palabras` | alta |

## Vocabulario en Contexto (65 ejercicios)

| ID | Año | Label original | topicSlug propuesto | Confianza |
|---|---|---|---|---|
| `ing-1718-A-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1718-B-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819-A-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819-B-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920-L-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920-L-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920-M-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920-M-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021-L-A-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021-L-B-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021-M-A-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021-M-B-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122-L-A-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122-L-B-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122-M-A-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122-M-B-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223-L-A-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223-L-B-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223-M-A-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223-M-B-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324-L-A-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324-L-B-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324-M-A-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324-M-B-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2425-A-3` | 2025 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2425-B-3` | 2025 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021Ext-A-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021Ext-B-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021Mod-A-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021Mod-B-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122Ext-A-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122Ext-B-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122Mod-A-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2122Mod-B-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223Ext-A-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223Ext-B-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223Mod-A-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2223Mod-B-3` | 2023 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324Ext-A-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324Ext-B-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324Mod-A-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2324Mod-B-3` | 2024 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2425Ext-3` | 2025 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2425Mod-3` | 2025 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2526Mod-3` | 2026 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1718Mod-A-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1718Mod-B-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1718Ext-A-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1718Ext-B-3` | 2018 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819Mod-A-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819Mod-B-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819Ext-A-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1819Ext-B-3` | 2019 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920Mod-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920Mod-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920Ext-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920Ext-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920ExtCoin-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920ExtCoin-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920OrdAdic-A-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-1920OrdAdic-B-3` | 2020 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021OrdCoin-A-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2021OrdCoin-B-3` | 2021 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2022OrdCoin-A-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |
| `ing-2022OrdCoin-B-3` | 2022 | Vocabulario | `vocabulario-en-contexto` | alta |

## Gramática: Transformación y Uso de Estructuras (65 ejercicios)

| ID | Año | Label original | topicSlug propuesto | Confianza |
|---|---|---|---|---|
| `ing-1718-A-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1718-B-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819-A-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819-B-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920-L-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920-L-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920-M-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920-M-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021-L-A-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021-L-B-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021-M-A-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021-M-B-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122-L-A-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122-L-B-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122-M-A-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122-M-B-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223-L-A-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223-L-B-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223-M-A-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223-M-B-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324-L-A-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324-L-B-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324-M-A-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324-M-B-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2425-A-4` | 2025 | Gramática (elige 4 de 6) | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2425-B-4` | 2025 | Gramática (elige 4 de 6) | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021Ext-A-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021Ext-B-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021Mod-A-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021Mod-B-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122Ext-A-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122Ext-B-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122Mod-A-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2122Mod-B-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223Ext-A-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223Ext-B-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223Mod-A-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2223Mod-B-4` | 2023 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324Ext-A-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324Ext-B-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324Mod-A-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2324Mod-B-4` | 2024 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2425Ext-4` | 2025 | Gramática (elige 4 de 6) | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2425Mod-4` | 2025 | Gramática (elige 4 de 6) | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2526Mod-4` | 2026 | Gramática (elige 4 de 6) | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1718Mod-A-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1718Mod-B-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1718Ext-A-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1718Ext-B-4` | 2018 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819Mod-A-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819Mod-B-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819Ext-A-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1819Ext-B-4` | 2019 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920Mod-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920Mod-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920Ext-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920Ext-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920ExtCoin-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920ExtCoin-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920OrdAdic-A-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-1920OrdAdic-B-4` | 2020 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021OrdCoin-A-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2021OrdCoin-B-4` | 2021 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2022OrdCoin-A-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |
| `ing-2022OrdCoin-B-4` | 2022 | Gramática | `gramatica-transformacion-y-uso-de-estructuras` | alta |

## Redacción: Ensayo de Opinión (150-200 palabras) (65 ejercicios)

| ID | Año | Label original | topicSlug propuesto | Confianza |
|---|---|---|---|---|
| `ing-1718-A-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1718-B-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819-A-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819-B-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920-L-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920-L-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920-M-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920-M-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021-L-A-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021-L-B-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021-M-A-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021-M-B-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122-L-A-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122-L-B-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122-M-A-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122-M-B-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223-L-A-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223-L-B-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223-M-A-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223-M-B-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324-L-A-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324-L-B-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324-M-A-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324-M-B-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2425-A-5` | 2025 | Redacción (elige 1 de 2) | `redaccion-ensayo-de-opinion` | alta |
| `ing-2425-B-5` | 2025 | Redacción (elige 1 de 2) | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021Ext-A-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021Ext-B-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021Mod-A-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021Mod-B-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122Ext-A-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122Ext-B-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122Mod-A-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2122Mod-B-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223Ext-A-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223Ext-B-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223Mod-A-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2223Mod-B-5` | 2023 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324Ext-A-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324Ext-B-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324Mod-A-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2324Mod-B-5` | 2024 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2425Ext-5` | 2025 | Redacción (elige 1 de 2) | `redaccion-ensayo-de-opinion` | alta |
| `ing-2425Mod-5` | 2025 | Redacción (elige 1 de 2) | `redaccion-ensayo-de-opinion` | alta |
| `ing-2526Mod-5` | 2026 | Redacción (elige 1 de 2) | `redaccion-ensayo-de-opinion` | alta |
| `ing-1718Mod-A-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1718Mod-B-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1718Ext-A-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1718Ext-B-5` | 2018 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819Mod-A-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819Mod-B-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819Ext-A-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1819Ext-B-5` | 2019 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920Mod-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920Mod-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920Ext-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920Ext-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920ExtCoin-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920ExtCoin-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920OrdAdic-A-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-1920OrdAdic-B-5` | 2020 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021OrdCoin-A-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2021OrdCoin-B-5` | 2021 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2022OrdCoin-A-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
| `ing-2022OrdCoin-B-5` | 2022 | Redacción | `redaccion-ensayo-de-opinion` | alta |
