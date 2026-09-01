-- Resuelve el hueco Ser Humano × Moderna documentado en la investigación previa,
-- usando el único ejercicio real del banco que lo respalda genuinamente: el texto de
-- Descartes de 2025-Extraordinaria, clasificado como "Cogito y sustancia pensante"
-- (Meditaciones metafísicas) — es una tesis antropológica real ("soy una cosa que
-- piensa"), no solo epistemológica, así que se amplía la cobertura de Descartes (ya en
-- el catálogo de 13 autores) a este problema transversal sin inventar autor ni obra
-- nueva. El ángulo se mantiene distinto del de su ficha de autor (conocimiento) para no
-- duplicar contenido — ver alert_markdown.
--
-- Los otros 5 huecos detectados en la misma investigación (Ética×Moderna,
-- Sociedad/Política×Antigua, Sociedad/Política×Medieval, Dios×Antigua,
-- Conocimiento/Realidad×Medieval) quedan sin resolver a propósito: ningún autor de los
-- 13 tiene un ejercicio real en el banco para esas combinaciones, y no se ha querido
-- inventar contenido sin respaldo de examen. Documentados en
-- app/data/historia_filosofia_madrid.ts junto a AUTOR_TOPIC_SLUGS.

UPDATE curriculum_content_v2
SET concept_markdown = $mkd$Cuando el examen pide "exponga el problema del ser humano en un autor o corriente filosófica de la época [X]", primero hay que comprobar la época exigida.

De los cinco autores del temario de Madrid que tratan este problema: **Platón** (época antigua) define al ser humano a partir del dualismo entre alma y cuerpo — para él, lo propiamente humano es el alma, mientras que el cuerpo es más bien un obstáculo del que debe liberarse para conocer de verdad. **Agustín de Hipona** (época medieval) sitúa lo definitorio del ser humano en el libre albedrío. **Descartes** (época moderna) define al ser humano por su capacidad de pensar: tras la duda metódica, lo único que resiste es que "soy una cosa que piensa" — la esencia humana es la sustancia pensante (*res cogitans*), no el cuerpo ni ninguna otra cosa material. **Marx** y **Hannah Arendt** pertenecen ambos a la época contemporánea: Marx entiende al ser humano como un ser esencialmente social (ni siquiera la conciencia existe al margen de las relaciones sociales); Arendt analiza cómo la tradición ha jerarquizado la vita activa y la vita contemplativa.

Estrategia: si la época es antigua, Platón; si es medieval, Agustín de Hipona; si es moderna, Descartes; si es contemporánea, Marx o Arendt (el que mejor controles). Con estos cinco autores, las cuatro épocas quedan cubiertas para este problema.$mkd$,
    worked_example_markdown = $mkd$Ejemplo de elección razonada: si el enunciado pide "época moderna", la opción válida es Descartes. El único ejercicio real del banco que lo respalda es el de 2025-Extraordinaria (*Meditaciones metafísicas*, clasificado como "Cogito y sustancia pensante"): tras la duda metódica, Descartes concluye "soy una cosa que piensa, es decir, que duda, afirma, quiere, no quiere, y que también imagina y siente" — la respuesta a "qué es el ser humano" no es un dato del cuerpo, sino esa capacidad de pensar, presente incluso cuando se duda de todo lo demás.$mkd$,
    practice_prompt = $mkd$El enunciado pide: "Exponga el problema del ser humano en un autor o corriente filosófica de la época moderna." De los cinco autores del temario que tratan este problema (Platón, Agustín de Hipona, Descartes, Marx, Hannah Arendt), ¿cuál es el único válido para esta época? Redacta en 8-10 líneas por qué, según Descartes, "ser una cosa que piensa" define lo propiamente humano.$mkd$,
    alert_markdown = $mkd$⚠️ No confundas este enfoque con la ficha de autor de Descartes centrada en el conocimiento (duda, cogito, tipos de ideas, prueba de Dios): aquí el foco es qué ES el ser humano (una sustancia pensante), no cómo llega a esa certeza — es el mismo texto real, pero con un ángulo distinto según qué problema te pida el examen.$mkd$
WHERE subject = 'historia_filosofia' AND sort_order = 16;
