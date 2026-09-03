# Catálogo oficial de Orientación · Cataluña 2026-2027

Catálogo reproducible del sistema de preinscripción universitaria de Cataluña: las siete universidades públicas y la Universitat de Vic - Universitat Central de Catalunya (UVic-UCC).

## Alcance y semántica

- La nota mostrada es la de `PAU / CFGS` de la primera asignación de junio de 2026, publicada el 10/07/2026. Es una **nota de referencia histórica**, no una nota fija ni una garantía de admisión.
- Se conservan los nombres completos de centro, campus, modalidad y simultaneidad que publica la fuente. Cada opción mantiene su código oficial de cinco dígitos.
- Las ponderaciones corresponden a 2026, versión 7 (28/05/2026). La estructura separa `academic_year` y admite importar 2027/2028 sin reemplazar 2026.
- La unión entre notas y ponderaciones se realiza exclusivamente por código oficial. No existe fallback por nombre ni emparejamiento difuso.
- Una matriz duplicada y contradictoria (`61057`) se excluye y queda documentada. El código `41066` no tiene matriz en la fuente. Ambos grados y sus notas permanecen en el catálogo.
- La celda de universidad del código `31131` queda corrupta al extraer el PDF; se resuelve como UPC mediante el prefijo oficial `3` del propio código y el informe registra esa decisión.

## Resultado validado

- 8 universidades.
- 560 opciones oficiales de grado/centro y 560 notas de referencia.
- 4.797 ponderaciones verificadas.
- 558 opciones con al menos una ponderación.

## Artefactos

- `catalog.json`: catálogo normalizado.
- `sources.json`: URLs, fechas, páginas y SHA-256 de los PDF fuente.
- `validation-report.json`: conteos, reglas de unión y todas las discrepancias/exclusiones.
- `sql-manifest.json`: orden de ejecución y tamaño de lote.
- `sql/00_LEEME.txt`: instrucciones exactas de carga manual.
- `sql/01_schema.sql`: esquema multi-comunidad y criterios territoriales.
- `sql/02_*.sql` a `sql/32_*.sql`: datos separados por entidad en lotes de 200.
- `sql/33_validation.sql`: conteos finales de Madrid y Cataluña y control de IDs duplicados.

## Reproducibilidad

Los PDF binarios no se versionan. Descárgalos con los nombres registrados en `sources.json` dentro de `tmp/pdfs/orientation-catalunya-2026/` y ejecuta:

```powershell
python scripts/orientation/import_catalunya_2026_2027.py
```

El importador genera UUID v5 y códigos estables con prefijo `CAT:`. También recompone la migración idempotente completa `20260913121000_seed_orientation_catalunya_2026_2027.sql`.

Para SQL Editor, abre `sql/00_LEEME.txt` y aplica todos los archivos listados. Cada SQL es autocontenido, no corta tuplas y conserva `ON CONFLICT`; ningún bloque borra datos.
