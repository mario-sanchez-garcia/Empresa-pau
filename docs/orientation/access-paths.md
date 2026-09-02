# Vías de acceso en Orientación

Última revisión: 2 de septiembre de 2026. Ámbito de producto: admisión a las seis universidades públicas del Distrito Único de Madrid para el curso 2026-2027.

## Principio de implementación

Kairo separa la **Calificación de Acceso a la Universidad (CAU, hasta 10)** de las **ponderaciones de admisión (hasta 4)**. La nota estimada nunca supera 14. Para las ponderaciones se reutiliza el catálogo oficial existente por grado y universidad; no se duplica el dataset.

La acreditación oficial prevalece siempre sobre una simulación. Si la documentación no permite obtener una equivalencia segura, Kairo muestra un estado incompleto en lugar de inventar una fórmula.

## Trazabilidad

| Vía | Organismo y documento | Vigencia | Regla extraída | Implementación Kairo |
| --- | --- | --- | --- | --- |
| Bachillerato español | [Universidades públicas de Madrid — Acuerdo de admisión 2026-2027](https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf) | Curso 2026-2027 | `CAU = 0,6 × CFB + 0,4 × PAU`. Después se suman como máximo las dos mejores materias aprobadas según tabla, hasta 14. | Mantiene sin cambios los dos controles existentes y el catálogo de ponderaciones. |
| Bachibac con título español | [Real Decreto 534/2024, disposición adicional tercera](https://www.boe.es/buscar/doc.php?id=BOE-A-2024-11858) y [Ministerio — acceso Bachibac](https://www.educacionfpydeportes.gob.es/mc/bachibac/presentacion/acceso-universidad/acceso-universidad-espanola.html) | Vigente | Usa la PAU española. Historia de España y Lengua Extranjera II pueden incorporar las calificaciones equivalentes de la prueba externa según el procedimiento oficial. | Misma base 60/40. La UI explica la sustitución de materias, pero no recalcula ejercicios individuales. |
| Bachibac con `diplôme du Baccalauréat` | [Ministerio — acceso Bachibac](https://www.educacionfpydeportes.gob.es/mc/bachibac/presentacion/acceso-universidad/acceso-universidad-espanola.html) | Documentación vigente consultada en 2026 | Nota del diplôme: `0,7 × media de Bachillerato + 0,3 × prueba externa`. Puede mejorarse mediante materias de admisión PAU válidas. | Dos controles 0-10 y comprobación de prueba externa superada. No mezcla esta prueba con la fase de acceso PAU. |
| Diploma IB | [Orden EFD/550/2025, artículos 3-4 y anexos II-III](https://www.boe.es/buscar/act.php?id=BOE-A-2025-10777) y [Acuerdo de Madrid 2026-2027](https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf) | Aplicable desde 2025-2026 y siguientes / curso 2026-2027 | Madrid usa la CAU de la acreditación UNEDasiss. La orden estatal toma la media de las calificaciones de materias del Diploma (escala aprobatoria 2-7) y aplica la fórmula genérica lineal al intervalo español 5-10. | El alumno puede copiar la CAU acreditada o estimarla desde la media 2-7. Kairo no transforma los puntos globales `/45`. |
| UE, Bachillerato Europeo y estados con convenio | [Acuerdo de Madrid 2026-2027, 3.5 y 7.3](https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf), [UNEDasiss — tipos de estudiantes](https://unedasiss.uned.es/publico_destino) | Curso 2026-2027 | La CAU es la acreditada por UNEDasiss. Pueden ponderar PCE, materias reconocidas en la acreditación o fase de admisión PAU cuando proceda; no la obligatoria de modalidad de una fase de acceso. | Entrada directa de CAU 5-10 y ponderaciones del grado. No se aplica una conversión genérica por país desde la UI. |
| Fuera de UE/sin convenio con homologación y PCE | [Acuerdo de Madrid 2026-2027, 3.6 y 7.4](https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf) | Curso 2026-2027 | `Nota de acceso = (0,2 × NMB + 4) + 0,1 × M1 + … + 0,1 × M4`; cada PCE cuenta si alcanza 5. Para ponderar solo son válidas PCE UNED. La modalidad exige las PCE necesarias; la información pública de Madrid indica un mínimo de tres. | Media homologada y cuatro PCE aisladas. Si hay menos de tres aprobadas, el escenario se marca incompleto. |
| Fuera de UE/sin convenio sin PCE/modalidad | [Acuerdo de Madrid 2026-2027, 3.6.b y orden de prelación](https://www.comunidad.madrid/docs/2026-06/acuerdo-universidades-2026-2027.pdf) | Curso 2026-2027 | Solo puede concurrir en la convocatoria extraordinaria y después de los grupos que cumplen acceso y admisión; con solo volante de homologación concurre provisionalmente con 5. | No se genera nota estimada comparable ni recomendación engañosa. Se explica el requisito pendiente. |

## Ponderaciones por vía

El acuerdo 2026-2027 permite un máximo de dos materias aprobadas que produzcan la mejor nota. Los coeficientes 0,1/0,2 dependen del grado y universidad y proceden del catálogo oficial ya cargado en `orientation_subject_weightings`.

- PAU ordinaria: fase de admisión y materia obligatoria de modalidad cuando sea válida.
- Bachibac por diplôme: pruebas de admisión PAU válidas.
- IB y acceso directo internacional: PCE, materias reconocidas en la acreditación o fase de admisión PAU cuando proceda.
- Homologación sin convenio: únicamente PCE UNED.

Kairo permite introducir la nota de una materia del catálogo, pero el alumno debe confirmar que esa materia consta como válida en su prueba o acreditación. No se asume reconocimiento automático por coincidencia de nombre.

## Persistencia y Camino

El esquema `perfiles` solo almacena el objetivo oficial (grado, universidad y referencia). No existe una columna estable para la vía ni para escenarios y no se crea una migración sin un consumidor de servidor claro.

La vía, sus campos y las notas de materias se guardan en almacenamiento local versionado (`kairo.orientation.access-paths.v1`) y aislado por vía. El objetivo sigue restaurándose por IDs desde el servidor. Al guardar, Orientación deja además un contexto local mínimo versionado para una integración futura con Camino: vía, objetivo, estimación, distancia y dos materias de mayor impacto. El scheduler no se modifica.

## Límites deliberados

- No se implementa una calculadora país por país. La Orden EFD/550/2025 contiene escalas y requisitos distintos, y UNEDasiss es quien emite la acreditación.
- No se calcula IB desde la puntuación total sobre 45 porque la regla estatal consultada usa calificaciones de materias y la acreditación UNEDasiss es el dato definitivo.
- No se promete acceso: las notas de corte son referencias históricas y las universidades pueden exigir requisitos adicionales.
