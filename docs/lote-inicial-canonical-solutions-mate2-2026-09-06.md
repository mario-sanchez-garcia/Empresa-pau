# Lote inicial de canonical solutions — Matemáticas II

**Fecha:** 6 de septiembre de 2026
**Por qué este lote y no "los más corregidos":** sin tráfico real todavía, el
criterio original del plan (`docs/principio-canonical-solutions-2026-09-05.md`,
paso 2) no se puede aplicar — no hay corrección que contar. Elegir al azar o
por orden de ID de ejercicio habría sido arbitrario. En su lugar, este lote
sigue el **orden curricular real del Camino** (`v2_sort_order` en
`app/data/camino/curriculum_seed.json`, asignatura `matematicas_ii`): un
ejercicio por cada uno de los primeros temas que un alumno pisa, para que en
cuanto empiece a entrar tráfico el ahorro sea inmediato en los temas que se
corrigen primero, no en los que casualmente se generaron antes.

**Método:** de los 221 ejercicios de Matemáticas II con `topicSlugs` en
`app/data/examenes.ts` (2 quedan excluidos a propósito — evalúan
diagonalización, tema fuera del temario actual), se cogió, para cada tema en
orden curricular, el primer ejercicio disponible que lo cubre y no se hubiera
usado ya. Cubre Álgebra completa, Geometría completa y el arranque de
Análisis (límites, continuidad, derivadas e integral indefinida) — 30
ejercicios, 26 temas distintos.

**Qué falta a propósito:** los tres primeros temas de Álgebra (dimensión de
una matriz, suma/resta, producto por escalar) no tienen ejercicio propio en
el banco — son demasiado básicos para constituir un ejercicio completo de
examen; aparecen siempre como parte de otro más amplio. No es un hueco, es
que ese contenido no se corrige de forma aislada.

**Siguiente paso real:** generar la `canonical_solution` de estos 30 a mano,
pasar por el gate de revisión humana (`missing → generated → reviewed →
published`), y usarlos para validar el pipeline de principio a fin — no para
medir ahorro todavía, eso sigue esperando a tráfico real.

| # | Orden Camino | Bloque | Tema | Ejercicio |
|---|---|---|---|---|
| 1 | 4 | Álgebra | Multiplicación de Matrices (A·B) | M2026-P4A |
| 2 | 5 | Álgebra | Propiedades de la Matriz Traspuesta (Aᵗ) | 2018-J-B1 |
| 3 | 6 | Álgebra | Potencias de Matrices (Aⁿ) | 2019-Ext-1B |
| 4 | 7 | Álgebra | Rango de una Matriz (Método de Gauss) | 2022-Ext-B1 |
| 5 | 8 | Álgebra | Matriz Inversa por Gauss-Jordan | 2025-Ext-12 |
| 6 | 9 | Álgebra | Despejar en Ecuaciones Matriciales | 2024-J-B1 |
| 7 | 10 | Álgebra | Determinantes de Orden 2 y 3 (Regla de Sarrus) | 2024-Jl-1B |
| 8 | 15 | Álgebra | Teorema de Rouché-Frobenius (Discusión) | 2024-Jl-1A |
| 9 | 19 | Álgebra | Análisis de Sistemas por el Método de Gauss | 2025-J-11 |
| 10 | 23 | Geometría | Dependencia Lineal y Rango de Vectores | 2019-Ext-3A |
| 11 | 25 | Geometría | Producto Escalar de dos Vectores (u·v) | 2022-Ext-A3 |
| 12 | 26 | Geometría | Producto Vectorial (u×v) | 2018-J-A3 |
| 13 | 27 | Geometría | Producto Mixto | 2017-J-3B |
| 14 | 28 | Geometría | La Recta en el Espacio (Ecuaciones) | 2025-J-31 |
| 15 | 29 | Geometría | El Plano en el Espacio | 2025-Ext-32 |
| 16 | 30 | Geometría | Posiciones Relativas (Rectas y Planos) | 2023-J-A3 |
| 17 | 31 | Geometría | Ángulos en el Espacio | 2022-J-A3 |
| 18 | 32 | Geometría | Proyecciones Ortogonales y Puntos Simétricos | 2025-Ext-31 |
| 19 | 33 | Geometría | Distancias en el Espacio | 2025-J-32 |
| 20 | 34 | Geometría | Áreas y Volúmenes | 2024-J-B3 |
| 21 | 36 | Análisis | Definición de Límite y Límites Laterales | 2019-J-B2 |
| 22 | 38 | Análisis | Límites Infinitos | 2025-Ext-21 |
| 23 | 39 | Análisis | Indeterminación 0/0 | 2021-Ext-A2 |
| 24 | 42 | Análisis | Indeterminación 1^∞ | 2024-J-B2 |
| 25 | 43 | Análisis | Continuidad y Tipos de Discontinuidad | 2023-J-B2 |
| 26 | 44 | Análisis | Concepto de Derivada e Interpretación Geométrica | 2024-J-A2 |
| 27 | 45 | Análisis | Cálculo de Derivadas y Regla de la Cadena | 2019-Ext-2A |
| 28 | 47 | Análisis | Información Extraída de la Propia Función | 2022-J-A2 |
| 29 | 48 | Análisis | Información Extraída de la 1ª y 2ª Derivada | 2025-J-2 |
| 30 | 49 | Análisis | Primitiva de una Función y la Integral Indefinida | 2019-Ext-2B |
