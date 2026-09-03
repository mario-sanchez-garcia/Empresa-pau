# Orientación territorial · Cataluña 2026

Fecha de verificación: 3 de septiembre de 2026.

## Alcance

Orientación usa una sola arquitectura para Madrid y Cataluña. La comunidad filtra el catálogo, las referencias, ponderaciones, criterios de corrección, reglas de acceso y el contexto enviado a Camino. El perfil aporta el valor inicial; la última selección explícita se conserva en el navegador. Explorar otro territorio no cambia el único objetivo global hasta que el alumno pulsa guardar.

## Fuentes oficiales

- [Preinscripción universitaria](https://universitats.gencat.cat/es/preinscripcions/): alcance de las siete universidades públicas y UVic-UCC.
- [Notas de corte](https://universitats.gencat.cat/es/preinscripcions/notes-tall/): PDF de la primera asignación de junio de 2026, publicado el 10/07/2026.
- [Ponderaciones](https://universitats.gencat.cat/es/preinscripcions/ponderacions/): tabla 2026, versión 7, actualizada el 28/05/2026. La misma página publica 2027 y 2028 para futuras importaciones.
- [Acceso con estudios extranjeros](https://universitats.gencat.cat/es/preinscripcions/acces-universitat-estudis-estrangers/): reglas de UNEDasiss, homologación, PAU/PCE y orden de asignación.
- [Exámenes y criterios de corrección 2026](https://universitats.gencat.cat/es/pau/examens-criteris-correccions/), junto con las fichas oficiales de [Historia](https://universitats.gencat.cat/es/pau/materies-pau/historia/), [Historia de la Filosofía](https://universitats.gencat.cat/es/pau/materies-pau/historia-filosofia/index.html) y [Química](https://universitats.gencat.cat/es/pau/materies-pau/quimica/index.html).

Los hashes y enlaces directos de los dos PDF importados están en `data/orientation/catalunya/2026-2027/sources.json`.

## Datos importados

- Universidades: 8 (UB, UAB, UPC, UPF, UdL, UdG, URV y UVic-UCC).
- Opciones de grado/centro: 560.
- Notas de referencia: 560.
- Ponderaciones: 4.797.
- Grados con ponderaciones seguras: 558.

La referencia es la columna `PAU / CFGS` de la primera asignación de junio. Es la nota del último estudiante que obtuvo plaza en esa asignación, no una exigencia fija ni una garantía futura.

## Extracción y matching

`scripts/orientation/import_catalunya_2026_2027.py` extrae las tablas de ambos PDF con `pdfplumber`. Conserva el código oficial, el nombre completo del centro/campus y el nombre oficial catalán de cada materia.

La unión nota ↔ ponderación usa exclusivamente el código de estudio de cinco dígitos. No hay matching por nombre. Las únicas excepciones documentadas son:

- `61057`: dos matrices contradictorias en el PDF de ponderaciones; se excluyen sus ponderaciones.
- `41066`: aparece en notas, pero no tiene matriz de ponderación.
- `31131`: la celda gráfica de universidad se extrae corrupta; se resuelve como UPC por el prefijo oficial `3` del mismo código y queda registrado en el informe.

El detalle completo, incluidos duplicados idénticos, está en `validation-report.json`.

## Admisión y estudios extranjeros

La regla compartida mantiene un máximo de 14 y suma las dos mejores materias aprobadas después de aplicar 0,1 o 0,2.

Para sistemas UE, con reciprocidad e IB, la nota de acceso acreditada por UNEDasiss está entre 5 y 10. Para subir nota solo cuentan materias ponderables en Cataluña examinadas mediante fase de admisión PAU/EBAU o PCE. Una materia meramente reconocida en la acreditación UNEDasiss no suma.

Para Bachillerato extranjero homologado fuera de esa vía, la prueba de acceso usa cuatro materias obligatorias; su media debe ser al menos 4 y la nota de acceso se calcula como 60 % de la media homologada más 40 % de la prueba. Debe alcanzar 5. La admisión añade después las dos mejores aportaciones ponderadas.

## Cómo se corrige

La pestaña territorial enlaza documentación de Canal Universitats y no reutiliza los baremos madrileños. La guía general indica 90 minutos por ejercicio y las fichas específicas implementadas resumen estructura y criterios de Historia, Historia de la Filosofía y Química. Se mantiene separada la información oficial de la explicación práctica de Kairo; no se denomina “rúbrica oficial” a un documento que no usa ese término.

## Base de datos y carga

1. Aplicar `supabase/migrations/20260913120000_orientation_multi_community.sql`.
2. Aplicar `supabase/migrations/20260913121000_seed_orientation_catalunya_2026_2027.sql` en un despliegue normal de migraciones.
3. Si se usa SQL Editor, ejecutar en orden los 31 bloques enumerados por `data/orientation/catalunya/2026-2027/sql-manifest.json` después de la migración de esquema.

Todos los inserts usan UUID deterministas y `ON CONFLICT ... DO UPDATE`. No hay `TRUNCATE`, borrados masivos ni cambios de RLS. Los datos de Madrid no se modifican.

## Limitaciones conocidas

- Dos grados carecen de ponderaciones publicables por ausencia o contradicción en la fuente; la UI los mantiene con su nota oficial e informa que no hay ponderaciones verificadas.
- La guía de corrección incorpora por ahora el marco general y tres materias con criterios específicos; las demás deben añadirse solo cuando se estructuren desde sus fichas oficiales.
- El catálogo 2027/2028 no se importa en esta entrega, pero `academic_year`, las fuentes y los IDs permiten añadirlo sin reemplazar 2026.
