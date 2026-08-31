-- Primer borrador del Curso de Inglés (Madrid): 5 temas de "destrezas PAU", no de
-- contenido cronológico (a diferencia de Historia/Física) — Inglés PAU Madrid evalúa 5
-- tipos de tarea fijos (verdadero/falso, comprensión abierta, vocabulario, gramática,
-- redacción), cada uno con 65 ejercicios reales en app/data/ingles.ts. Se agrupan en un
-- único bloque "Destrezas PAU" porque no hay progresión temática entre ellas: cualquier
-- alumno puede empezar por cualquiera.
--
-- Contenido 100% original sobre CÓMO abordar cada tarea (estrategia de examen), no
-- gramática/vocabulario genérico de academia de inglés — ver investigación previa:
-- ninguna fuente con licencia se ha copiado.
--
-- curriculum_topics ya tenía 1 fila huérfana para subject='ingles'
-- ('essay-connectors', order=1, sin fila en curriculum_content_v2, sin referencias en
-- exam_topics/topic_theory_coverage — verificado, 0 dependencias). No se toca ni se
-- fusiona en esta tarea; los 5 temas nuevos usan order 2-6 para no colisionar con ella.
--
-- topic_id ya poblado desde el insert (mismo patrón que CCSS/Química). review_status
-- ='draft' — no visibles para alumnos reales todavía. Inglés sigue con betaStatus
-- 'locked' / fuera de PRIVATE_BETA_SUBJECTS y ALLOWED_GENERATE_SUBJECTS.

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('031b983c-9079-44a2-b6c5-92e4a9cd402d'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'comprension-verdadero-falso-con-evidencia-textual', 'Comprensión Lectora: Verdadero/Falso con Evidencia Textual', 2),
  ('947614e7-2c82-418b-96fd-a24f7ab5a543'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'comprension-abierta-con-propias-palabras', 'Comprensión Lectora: Preguntas Abiertas con Propias Palabras', 3),
  ('ca44087d-38dc-46fc-8160-173b456f48f2'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'vocabulario-en-contexto', 'Vocabulario en Contexto', 4),
  ('f7518d31-047d-4c63-ab26-e1c56e6742cc'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'gramatica-transformacion-y-uso-de-estructuras', 'Gramática: Transformación y Uso de Estructuras', 5),
  ('f999ffa8-94b7-41b0-a605-82f6732b5c37'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'redaccion-ensayo-de-opinion', 'Redacción: Ensayo de Opinión (150-200 palabras)', 6);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 2, 'Comprensión Lectora: Verdadero/Falso con Evidencia Textual', $mkd$En esta tarea se dan afirmaciones sobre el texto y hay que decidir si son **verdaderas o falsas**, copiando además la frase exacta del texto que lo demuestra — sin esa cita, la respuesta correcta no puntúa, aunque el verdadero/falso esté bien.

Antes de leer el texto entero, conviene leer primero las afirmaciones: así sabes qué buscar y puedes hacer una lectura de **scanning** (localizar información concreta) en vez de leer todo con el mismo detalle. Las afirmaciones suelen ir en el mismo orden que la información aparece en el texto.

Dos trampas habituales: afirmaciones que invierten el sentido real de una frase (niegan algo que el texto afirma, o al revés), y afirmaciones que mezclan un dato verdadero con otro inventado en la misma frase — si una sola parte es falsa, toda la afirmación es falsa. La cita que copies debe ser la frase completa que sirve de prueba, no una palabra suelta.$mkd$, $mkd$Texto (fragmento): "Although the bridge was built in 1920, it was not officially opened to the public until three years later, due to funding problems."

Afirmación: "The bridge was opened the same year it was built." → **FALSE**. Evidencia: "it was not officially opened to the public until three years later".

Nótese que copiar solo "1920" no sirve como evidencia — hay que copiar la frase que demuestra que la afirmación es falsa, no solo el dato numérico.$mkd$, $mkd$Texto: "Marta learned to swim when she was six, but she didn't compete professionally until her twenties, after years of training with a local club."
Afirmación: "Marta started competing professionally as soon as she learned to swim."
¿Verdadero o falso? Copia la evidencia exacta del texto.$mkd$, NULL, '031b983c-9079-44a2-b6c5-92e4a9cd402d'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 3, 'Comprensión Lectora: Preguntas Abiertas con Propias Palabras', $mkd$Aquí se pide responder preguntas sobre el texto **con tus propias palabras**, sin copiar del texto. Una respuesta que solo cambia una o dos palabras de la frase original (una "copia camuflada") se penaliza igual que una copia literal.

La estrategia es: localizar la idea exacta que responde a la pregunta, y luego **reformularla** con vocabulario y estructura distintos — usando sinónimos, cambiando de voz activa a pasiva o viceversa, o reordenando la frase. No hace falta añadir información nueva que no esté en el texto, solo decirlo de otra manera.

Si la pregunta tiene dos partes (por ejemplo, "qué pasó y por qué"), hay que responder a las dos — una respuesta parcial pierde puntos aunque la parte que sí está sea correcta y esté bien parafraseada.$mkd$, $mkd$Texto: "The committee rejected the proposal because it required a budget increase that the city council was not willing to approve."

Pregunta: "Why was the proposal rejected?"

Respuesta que NO vale (copia casi literal): "Because it required a budget increase that the council wasn't willing to approve."

Respuesta que SÍ vale (parafraseada): "The council turned it down since accepting it would have meant spending more money than they were prepared to authorise."$mkd$, $mkd$Texto: "Working from home has made many employees more productive, but it has also blurred the line between personal time and work time, leaving some people feeling like they are always on duty."

Pregunta: "What negative effect does the text mention about working from home?" Responde con tus propias palabras, sin copiar frases del texto.$mkd$, $mkd$⚠️ Cambiar el orden de las palabras o sustituir un artículo no cuenta como parafrasear. Si al leer tu respuesta reconoces la misma frase del texto casi entera, hay que reformularla más.$mkd$, '947614e7-2c82-418b-96fd-a24f7ab5a543'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 4, 'Vocabulario en Contexto', $mkd$Esta tarea da una definición o sinónimo en español o inglés y pide encontrar la palabra del texto que significa eso — siempre dentro de un párrafo concreto que el enunciado indica, lo cual reduce mucho dónde buscar.

Hay que escribir la palabra **exactamente como aparece en el texto**, con la forma verbal o el número (singular/plural) que tenga allí — no hace falta ni conviene "normalizarla" a su forma de diccionario. Si la pista sugiere una acción o un estado, fíjate en si el texto usa una expresión de varias palabras (un *phrasal verb* o una expresión hecha) en vez de una sola palabra suelta — en ese caso hay que copiar la expresión completa.

Antes de buscar, piensa qué categoría gramatical tendría la palabra (verbo, adjetivo, sustantivo) según cómo esté planteada la pista — eso descarta rápido la mayoría de palabras del párrafo.$mkd$, $mkd$Párrafo: "She was absolutely delighted when she heard the news, even though she tried to remain calm in front of her colleagues."

Pista: "very happy (paragraph 2)" → la palabra es **"delighted"**, copiada tal cual aparece (no "delight" ni "to delight").$mkd$, $mkd$Párrafo: "After weeks of searching, the volunteers finally managed to track down the missing dog near an abandoned farmhouse."

Pista: "find, after searching for a long time (paragraph 1)" — ¿qué palabra o expresión del texto significa esto? Escríbela exactamente como aparece.$mkd$, NULL, 'ca44087d-38dc-46fc-8160-173b456f48f2'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 5, 'Gramática: Transformación y Uso de Estructuras', $mkd$Esta tarea da frases con huecos y una palabra entre paréntesis que hay que usar en la forma correcta — un mismo apartado suele mezclar varios puntos distintos (una preposición, un tiempo verbal, un comparativo...), así que conviene resolver cada hueco por separado en vez de intentar entender la frase entera de golpe.

Casi todos los exámenes incluyen un apartado dedicado a transformar una pregunta o afirmación en **estilo indirecto**: cambia el tiempo verbal hacia atrás (present → past, will → would, can → could...), el orden de las palabras pasa a ser el de una afirmación normal (no el de una pregunta), y desaparecen las palabras auxiliares de pregunta como "do/does/did".

Para los demás huecos: primero identifica qué tipo de palabra falta (¿un verbo en cierto tiempo?, ¿una preposición fija después de ese verbo o adjetivo?, ¿la forma comparativa de un adjetivo?), completa, y relee la frase entera al final para comprobar que tiene sentido y concuerda en persona y número.$mkd$, $mkd$a) Complete: "If I _______ (know) about the meeting, I _______ (attend) it." → "If I **had known** about the meeting, I **would have attended** it." (condicional de tercer tipo: situación hipotética pasada).

b) Estilo indirecto: "Where do you live?" she asked me. → She asked me **where I lived**. (el tiempo retrocede de presente a pasado, y el orden pasa a ser afirmativo: "where I lived", no "where did I live").$mkd$, $mkd$Completa usando la forma correcta:
a) The article was _______ (write) by a journalist who _______ (interview) over fifty witnesses.
b) Complete la frase para reportar lo dicho: "Have you finished your homework?" my mother asked. — My mother asked me _____________________________ .$mkd$, NULL, 'f7518d31-047d-4c63-ab26-e1c56e6742cc'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 6, 'Redacción: Ensayo de Opinión (150-200 palabras)', $mkd$Esta tarea pide escribir entre 150 y 200 palabras dando tu opinión sobre un tema. Se valora el contenido (que respondas realmente a lo que se pregunta), la organización del texto, y el uso correcto y variado del inglés — no hace falta estar "de acuerdo" con nada en particular, solo defender una postura de forma clara.

Una estructura que funciona de forma fiable: una frase inicial que presente el tema y tu postura, dos párrafos centrales con una razón cada uno (idealmente con un ejemplo breve que la ilustre), y una frase final que cierre retomando tu opinión — no hace falta un párrafo de conclusión largo, con una frase basta.

Usar conectores (*however*, *moreover*, *for this reason*, *in conclusion*) ayuda a que el texto se lea como un argumento organizado y no como una lista de frases sueltas. Conviene controlar la longitud: quedarse muy corto pierde puntos de contenido, y writing muy largo no suma nada extra — es mejor revisar lo escrito que añadir más frases al final.$mkd$, $mkd$Tema: "Should students be allowed to use mobile phones in class?"

Esquema de una respuesta de 150-200 palabras: (1) frase inicial — postura clara ("I believe mobile phones should be allowed in class, but only for specific tasks."); (2) primer párrafo — razón 1 con ejemplo (acceso rápido a información, diccionarios online); (3) segundo párrafo — razón 2 con ejemplo, o un matiz/contraargumento reconocido con "however"; (4) frase final — retoma la postura inicial con otras palabras.$mkd$, $mkd$Escribe entre 150 y 200 palabras sobre el siguiente tema: "Is it better to travel alone or with other people? Explain your choice."$mkd$, NULL, 'f999ffa8-94b7-41b0-a605-82f6732b5c37'::uuid, 'draft');
