-- Añade una nota breve sobre la fuente de la ESTRUCTURA de Biología (los 6
-- bloques y 63 temas, ver commit 36d52b3: "Estructura tomada literalmente
-- del Decreto 64/2022 (BOCM 26-07-2022), Anexo II").
--
-- A diferencia de la cita de Marea Verde en Matemáticas CCSS (una nota por
-- lección, porque ahí la referencia era de alcance por tema individual),
-- aquí la referencia es de la ESTRUCTURA GENERAL del curso completo, no del
-- contenido de cada lección por separado -- una única nota en la primera
-- lección del curso (sort_order=1, "Biomoléculas orgánicas e inorgánicas")
-- es más honesto que repetirla 63 veces como si cada lección derivara
-- individualmente del decreto.
update curriculum_content_v2
set concept_markdown = concept_markdown || E'\n\n*Estructura basada en el Decreto 64/2022 (BOCM).*'
where subject = 'biologia'
  and block_key = 'Las biomoléculas'
  and sort_order = 1;
