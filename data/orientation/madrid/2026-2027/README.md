# Catálogo oficial de Orientación · Madrid 2026-2027

Este directorio contiene el catálogo normalizado de las seis universidades públicas del Distrito Único de Madrid: UAH, UAM, UC3M, UCM, UPM y URJC.

## Alcance y semántica

- Curso académico: `2026-2027`.
- Nota de referencia: columna `Grupo 1 · Ordinaria` del documento oficial del Distrito Único.
- Centros adscritos: excluidos de esta primera versión.
- Dobles grados y programas conjuntos: se conservan como titulaciones propias cuando aparecen así en la fuente.
- Ponderaciones: únicamente valores impresos `0,1` o `0,2`; la ausencia equivale a que no se carga una ponderación.
- Los nombres oficiales se conservan para mostrar; `search_name` es una representación normalizada solo para búsqueda.

## Artefactos

- `catalog.json`: universidades, grados, nota de referencia y ponderaciones normalizadas.
- `sources.json`: URL canónica, SHA-256, fecha y páginas de cada PDF oficial.
- `validation-report.json`: conteos, exclusiones, emparejamientos y discrepancias observadas.

El catálogo contiene 6 universidades, 554 titulaciones/notas y 4.473 ponderaciones. De 456 filas fuente de ponderaciones, 426 son únicas; 364 pudieron vincularse de forma demostrable a una titulación pública del PDF de notas. Las filas de centros adscritos o con nombres no conciliables sin inferencia quedan fuera. Una matriz duplicada de `Filosofía - Ciencia Política y Gestión Pública (URJC)` difiere entre las páginas 3 y 19 del PDF y se excluye de ponderaciones; la titulación y su nota de referencia sí permanecen.

## Reproducibilidad

El importador está en `scripts/orientation/import_madrid_2026_2027.py`. Requiere los dos PDFs oficiales como entradas locales y genera JSON y SQL deterministas. Los binarios no se versionan; sus hashes esperados están en `sources.json`.

Validación sin reprocesar los PDF:

```powershell
node --test scripts/orientation/catalog.test.mjs
```

Seed idempotente para Supabase:

`supabase/migrations/20260831213000_seed_orientation_madrid_2026_2027.sql`
