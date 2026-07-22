# Nota estimada

La seccion "Nota estimada" muestra una estimacion orientativa por asignatura basada en la practica reciente del alumno en Kairo.

No usa IA, no llama a ningun modelo y no promete una nota oficial. Es una ayuda de producto para que el alumno entienda su progreso aproximado.

## Datos que usa

La version MVP usa datos ya existentes:

- `historial_simulacros`: simulacros completados, `nota_final`, `resultado_json`, `asignatura`, `created_at` y `updated_at`.
- `historial_examenes`: correcciones individuales, `nota`, `nota_maxima`, `asignatura` y `created_at`.

No crea tablas nuevas ni requiere migraciones.

## Formula MVP

Para cada asignatura:

1. Convierte todas las notas a escala 0-10.
2. Usa los ultimos 3 simulacros de esa asignatura.
3. Pondera simulacros recientes asi:
   - ultimo: 50%
   - penultimo: 30%
   - antepenultimo: 20%
4. Usa las ultimas 10 correcciones individuales con media simple.
5. Combina datos:
   - simulacros + correcciones: `simulacroScore * 0.7 + exerciseScore * 0.3`
   - solo simulacros: `simulacroScore`
   - solo correcciones: `exerciseScore`
6. Aplica tendencia simple si hay al menos 4 notas:
   - mejora clara: `+0.2`
   - bajada clara: `-0.2`
7. Limita siempre el resultado entre 0 y 10.

## Rango y confianza

La UI muestra un rango, no una nota exacta.

Confianza:

- Sin datos: no hay estimacion.
- 1-3 puntos de datos: baja.
- 4-10 puntos de datos: media.
- 11+ puntos de datos y al menos 2 simulacros: alta.
- 11+ puntos de datos sin 2 simulacros: media.

Rango:

- Confianza baja: nota estimada +/- 1.0.
- Confianza media: nota estimada +/- 0.6.
- Confianza alta: nota estimada +/- 0.35.

## Por que es orientativo

La estimacion depende de la calidad y cantidad del historial. No tiene en cuenta aun:

- Diferencias exactas por comunidad autonoma.
- Cambios de dificultad entre convocatorias.
- Evolucion por bloque dentro de cada asignatura.
- Penalizaciones especificas por tipo de examen.
- Condiciones reales completas de admision universitaria.

## Mejoras futuras

- Prediccion por comunidad autonoma.
- Identificacion automatica de puntos debiles.
- Objetivos de nota por asignatura.
- Comparacion anonima con cohortes.
- Plan diario inteligente conectado a la estimacion.
- Separar estimacion por bloques tematicos.
