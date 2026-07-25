# Inventario inicial de ejercicios `requiereRevision`

Generado para beta P0. No se modifican enunciados ni soluciones oficiales.

## Resumen

Se han encontrado flags `requiereRevision: true` en datos de Cataluña, especialmente en Biología, Física y Química. La UI ya muestra etiqueta visible de revisión editorial en:

- `app/components/CatEjercicioCard.tsx`
- `app/components/CatFisicaEjercicioCard.tsx`

Para beta pública, estos ejercicios deben mantenerse cetiquetados como “En revisión” o excluirse de flujos comerciales hasta completar QA editorial.

## Archivos afectados

| Archivo | Asignatura / comunidad | Hallazgo | Acción recomendada |
| --- | --- | --- | --- |
| `app/data/biologia_cataluna.ts` | Biología · Cataluña | Muchos ejercicios con `requiereRevision: true` repartidos por el dataset. | QA editorial por año/convocatoria antes de presentarlos como validados. Mantener etiqueta visible. |
| `app/data/fisica_cataluna.ts` | Física · Cataluña | Flags en ejercicios/opciones concretas. | Mantener etiqueta “En revisión” ya soportada por `CatFisicaEjercicioCard`. |
| `app/data/quimica_cataluna.ts` | Química · Cataluña | Flags en ejercicios concretos. | Mantener etiqueta “En revisión” vía `CatEjercicioCard`. |
| `app/data/biologia.ts` | Biología | Tipo preparado para `requiereRevision`, sin flags encontrados en la búsqueda inicial. | Sin acción inmediata. |
| `app/data/ingles.ts` | Inglés | Tipo preparado para `requiereRevision`, sin flags encontrados en la búsqueda inicial. | Sin acción inmediata. |

## Conteo orientativo por búsqueda estática

- `biologia_cataluna.ts`: dataset con alta densidad de ejercicios marcados, revisar de forma prioritaria.
- `fisica_cataluna.ts`: al menos 3 apariciones de `requiereRevision: true`.
- `quimica_cataluna.ts`: al menos 2 apariciones de `requiereRevision: true`.

Comando usado:

```bash
rg -n "requiereRevision|requiresReview|requiere_revision|revision" app\data components app -g "*.ts" -g "*.tsx"
```

## Pendiente

- Convertir este inventario en matriz completa por año, convocatoria, ejercicio y motivo.
- Decidir si los ejercicios en revisión se excluyen de simulacros públicos o solo se etiquetan.
- Añadir smoke editorial que falle si un ejercicio con `requiereRevision` se muestra sin aviso.
