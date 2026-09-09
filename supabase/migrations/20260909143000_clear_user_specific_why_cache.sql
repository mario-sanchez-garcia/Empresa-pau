-- "¿Por qué es así?" incluye studentConnection y se genera con la respuesta
-- concreta del alumno. La antigua caché global por tema podía reutilizar ese
-- texto entre usuarios. El endpoint ya no lee ni escribe esta tabla; se vacía
-- el contenido derivado previo para no conservar explicaciones potencialmente
-- específicas de un intento. No se elimina ningún dato académico oficial ni
-- historial de usuario.
delete from public.topic_why_cache;
