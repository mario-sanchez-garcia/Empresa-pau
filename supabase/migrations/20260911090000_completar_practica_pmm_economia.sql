-- Completa el practice_prompt de "El Periodo Medio de Maduración" (Economía
-- de la Empresa, sort_order 45, insertado en 20260910090000), que se había
-- quedado con una meta-descripción genérica ("ejercicio análogo con otro
-- juego de datos...") en vez de un ejercicio con cifras reales. Texto
-- aprobado por el usuario, insertado literal. Solo se toca
-- practice_prompt de esta fila — concept_markdown, worked_example_markdown,
-- sort_order, topic_id y review_status no cambian. Ya aplicado en directo
-- contra Supabase con SUPABASE_SERVICE_ROLE_KEY antes de este commit; esta
-- migración deja constancia reproducible del cambio.
-- curriculum_seed.json no necesitó actualizarse: para entradas
-- contentStatus='flashcard_v2', practicePrompt se guarda vacío a propósito
-- (el contenido real vive en curriculum_content_v2), igual que en el resto
-- de topics de economia del seed.

UPDATE curriculum_content_v2 SET practice_prompt = $mkd$Una empresa industrial presenta estos datos:

* Consumo anual de materias primas: 600.000 €
* Existencias medias de materias primas: 50.000 €
* Coste anual de producción: 900.000 €
* Productos en curso medios: 45.000 €
* Coste anual de las ventas: 1.200.000 €
* Productos terminados medios: 100.000 €
* Ventas anuales a crédito: 1.500.000 €
* Saldo medio de clientes: 125.000 €
* Compras anuales a crédito: 600.000 €
* Saldo medio de proveedores: 75.000 €

Calcula:
1. PMa.
2. PMf.
3. PMv.
4. PMc.
5. PMM económico.
6. PMp.
7. PMM financiero.
8. Interpreta ambos resultados y explica qué significaría que el PMM financiero fuese negativo.$mkd$
WHERE subject = 'economia' AND sort_order = 45;
