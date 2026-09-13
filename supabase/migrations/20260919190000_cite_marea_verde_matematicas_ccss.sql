-- Añade una cita breve y discreta al final del concept_markdown de las
-- lecciones de Matemáticas CCSS cuyo alcance/estructura curricular se
-- diseñó usando el índice de Apuntes Marea Verde CCSS II como referencia
-- (ver commit 33e6524, "primer borrador del Curso de Matemáticas CCSS":
-- "el índice de Apuntes Marea Verde CCSS II... se usó solo como referencia
-- de alcance, nunca como fuente de texto"). El contenido sigue siendo
-- 100% original — la cita es atribución de la referencia de alcance, no de
-- texto copiado.
--
-- Excluye a propósito las 4 lecciones que se añadieron DESPUÉS del borrador
-- original por una justificación distinta, no relacionada con Marea Verde:
--   - primitiva-de-una-funcion-y-la-integral-indefinida
--   - la-integral-definida-regla-de-barrow-y-areas
--     (hueco real detectado en examenes oficiales, ver
--     20260830120000_add_matematicas_ccss_integral_topics.sql)
--   - variable-aleatoria-y-sus-parametros
--   - poblacion-muestra-y-tecnicas-de-muestreo
--     (huecos pedagógicos internos, ver
--     20260830130000_reorder_matematicas_ccss_and_add_puente_topics.sql)
--
-- Verificado contra la base real antes de escribir esta migración: 39 filas
-- afectadas, ninguna llevaba ya ninguna cita.
update curriculum_content_v2
set concept_markdown = concept_markdown || E'\n\n*Inspirado en: Apuntes Marea Verde (apuntesmareaverde.org.es), con licencia Creative Commons — contenido redactado de forma original.*'
where subject = 'matematicas_ccss'
  and topic_id in (
    select id from curriculum_topics
    where subject = 'matematicas_ccss'
      and topic_slug not in (
        'primitiva-de-una-funcion-y-la-integral-indefinida',
        'la-integral-definida-regla-de-barrow-y-areas',
        'variable-aleatoria-y-sus-parametros',
        'poblacion-muestra-y-tecnicas-de-muestreo'
      )
  );
