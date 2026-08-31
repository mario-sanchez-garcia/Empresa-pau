-- Fase 2 del borrador de Inglés: 6 temas finos adicionales, descubiertos en la
-- auditoría de la propuesta de topicSlugs de los 325 ejercicios.
--
-- GRAMÁTICA (4 nuevos, dentro del mismo bloque "Destrezas PAU"): la auditoría de los 65
-- ejercicios reales de Gramática mostró que "gramatica-transformacion-y-uso-de-
-- estructuras" identifica el BLOQUE del examen, pero mezcla siempre 3-4 fenómenos
-- gramaticales distintos por ejercicio, lo cual impide a Camino reforzar un fallo
-- concreto (ej. "el alumno falla condicionales" vs "el alumno falla pasiva"). Se crean
-- los 4 fenómenos con volumen real suficiente (verificado leyendo los 65, no keywords
-- ciegas): estilo indirecto (37/65), condicionales (31/65), voz pasiva (20/65),
-- comparativos/superlativos (20/65). Gerundio/infinitivo (14/65), preposiciones
-- dependientes (13/65) y oraciones de relativo (9/65) NO se separan — volumen
-- insuficiente y/o naturaleza más colocacional que de regla gramatical aplicable. El
-- topic general se mantiene como paraguas para estructuras mixtas/simulacro, tal como
-- sugería la tarea.
--
-- REDACCIÓN (2 nuevos, mismo bloque): la auditoría de los 65 prompts de Redacción
-- encontró 2 familias reales distintas del ensayo de opinión (52/65): narrativa/
-- descriptiva de experiencia personal (9/65: "Describe an experience...", "Have you
-- ever felt...") y carta/email informal (4/65, siempre como alternativa opcional en los
-- exámenes 2025-2026 — formato emergente, volumen bajo hoy pero señal real de cambio de
-- formato reciente, se documenta así en el informe).
--
-- topic_id ya poblado desde el insert. review_status='draft'. Continúa la numeración
-- desde el bloque "Destrezas PAU" ya existente (order/sort_order 2-6) sin colisionar.

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('865a2712-e17b-46bb-9ebf-a696dc2ada00'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'estilo-indirecto-reported-speech', 'Estilo Indirecto (Reported Speech)', 7),
  ('f4a9575b-04ce-46b7-bd55-1aa8c701a65c'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'oraciones-condicionales', 'Oraciones Condicionales', 8),
  ('3d501aeb-d444-4863-b8e0-c5ebc49dfd70'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'voz-pasiva', 'Voz Pasiva', 9),
  ('2c8114dd-cea1-4859-a83d-c8956bb3ed6b'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'comparativos-y-superlativos', 'Comparativos y Superlativos', 10),
  ('43dfe194-569b-4574-8880-bd3a1602330f'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'redaccion-narrativa-descriptiva-personal', 'Redacción: Narrativa y Descripción de una Experiencia Personal', 11),
  ('8c7485f0-3973-4d79-8861-297be89ee0d2'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'redaccion-carta-o-email-informal', 'Redacción: Carta o Email Informal', 12);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 7, 'Estilo Indirecto (Reported Speech)', $mkd$Al transformar una pregunta o afirmación directa en estilo indirecto (*reported speech*), ocurren tres cambios sistemáticos:

**1. El tiempo verbal retrocede** (backshift): present simple → past simple, present perfect → past perfect, will → would, can → could, must → had to. Si el verbo introductor está en pasado ("she said", "he asked"), casi siempre hay que retroceder el tiempo del verbo citado.

**2. El orden de las palabras cambia** en las preguntas: pasa a ser el orden de una afirmación normal (sujeto + verbo), no el de una pregunta. "Where do you live?" → "...where I lived" (no "...where did I live"). Los auxiliares de pregunta (do/does/did) desaparecen.

**3. Los pronombres y marcadores de tiempo/lugar se adaptan** al punto de vista de quien informa: "today" → "that day", "tomorrow" → "the next day", "here" → "there", "my" → "her/his", según quién hable de quién.$mkd$, $mkd$Directo: "Where do you live?" she asked me.
Indirecto: She asked me **where I lived**.

Paso a paso: 1) el orden pasa de pregunta a afirmación ("where I lived", no "where did I live"); 2) el verbo retrocede de presente ("do you live") a pasado ("I lived"); 3) el pronombre "you" pasa a "I" porque ahora habla la persona a la que se preguntó.$mkd$, $mkd$Transforma a estilo indirecto: "Have you finished your homework?" my mother asked. — My mother asked me _____________________________ .$mkd$, NULL, '865a2712-e17b-46bb-9ebf-a696dc2ada00'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 8, 'Oraciones Condicionales', $mkd$Las oraciones condicionales relacionan una condición (cláusula con "if") con su consecuencia. Los tipos que más aparecen en el examen son:

- **Primera condicional** (condición real y futura): *if* + presente, ... + *will* + infinitivo. "If questions are asked, women are more likely to speak up."
- **Segunda condicional** (situación hipotética presente/futura, poco probable o irreal): *if* + pasado simple, ... + *would* + infinitivo. "If I were you, I would show..."
- **Tercera condicional** (situación hipotética pasada, ya no se puede cambiar): *if* + pluscuamperfecto (*had* + participio), ... + *would have* + participio. "If I had known..., I would have joined..."
- **Condicionales mixtas**: combinan una condición pasada con una consecuencia presente, o viceversa — por ejemplo "If she had met him before [pasado], she would marry him [presente]".

El error más habitual es mezclar los tiempos de la condición y la consecuencia sin darse cuenta de qué tipo de condicional pide la frase — conviene identificar primero si la situación es real, hipotética-presente o hipotética-pasada antes de rellenar los huecos.$mkd$, $mkd$Completa: "If I _______ (know) that this pizza had so much salt, I _______ (not/buy) it when I went to the supermarket yesterday."

La frase habla de algo que pasó "ayer" y ya no se puede cambiar → **tercera condicional**: "If I **had known** ..., I **wouldn't have bought** it..."$mkd$, $mkd$Completa usando el tipo de condicional adecuado: "If she _______ (have) more free time, she _______ (learn) to play the piano."$mkd$, NULL, 'f4a9575b-04ce-46b7-bd55-1aa8c701a65c'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 9, 'Voz Pasiva', $mkd$Se usa la voz pasiva (*to be* + participio pasado) cuando interesa más la acción o quién la recibe que quién la realiza — muy habitual en textos informativos y noticias, que es justo el tipo de texto de estos exámenes.

Para formar la pasiva: **sujeto pasivo + to be (en el tiempo correspondiente) + participio pasado (+ by + agente, si se menciona)**. El tiempo verbal de "to be" tiene que coincidir con el tiempo de la frase activa original: "wrote" (pasado simple) → "was written"; "has discovered" (presente perfecto) → "has been discovered".

En estos ejercicios, la pista entre paréntesis suele ser el verbo en infinitivo, y hay que reconocer POR EL CONTEXTO que el sujeto no realiza la acción sino que la recibe — por ejemplo, "the article _______ (write) by a journalist" solo tiene sentido si "the article" es escrito, no si escribe.$mkd$, $mkd$Completa: "The series Game of Thrones _______ (base) on the book, _______ (write) by George R.R. Martin."

La serie no "basa" nada, sino que **está basada** en el libro (pasiva presente): "**is based**". El libro tampoco "escribe", sino que **fue escrito** por Martin (pasiva pasada): "**written**" (participio, tras "book," funciona como cláusula de relativo reducida: "the book, written by...").$mkd$, $mkd$Completa: "The article _______ (write) by a journalist who _______ (interview) over fifty witnesses."$mkd$, $mkd$⚠️ No toda palabra entre paréntesis que "suena a pasiva" lo es — comprueba siempre si el sujeto de la frase realiza la acción (activa) o la recibe (pasiva) antes de decidir la forma verbal.$mkd$, '3d501aeb-d444-4863-b8e0-c5ebc49dfd70'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 10, 'Comparativos y Superlativos', $mkd$Para comparar dos cosas se usa el **comparativo**: adjetivos cortos añaden *-er* (*higher*, *longer*), adjetivos largos usan *more* + adjetivo (*more important*), y siempre puede ir seguido de "than". Para señalar el extremo de un grupo se usa el **superlativo**: *the* + adjetivo + *-est* (*the highest*) o *the most* + adjetivo (*the most important*).

Una estructura que aparece con frecuencia en el examen es **"the + comparativo..., the + comparativo..."** para expresar que dos cosas cambian juntas: "The longer you live in a new place, the better you get to know it" (cuanto más tiempo vivas..., mejor lo conocerás).

Cuidado con los adjetivos irregulares (*good → better → the best*; *bad → worse → the worst*) y con los cambios ortográficos de los adjetivos cortos (*big → bigger*, con doble consonante; *noisy → noisier*, la "y" cambia a "i").$mkd$, $mkd$Completa: "Last year, the number of divorces was much _______ (high) than ever before."

"High" es un adjetivo corto de una sílaba → comparativo con *-er*: "**higher**". Al llevar "than" a continuación, confirma que se trata de un comparativo, no de un superlativo.$mkd$, $mkd$Completa: "My father is _______ (patient) than my mother, but she is _______ (good) at explaining things than he is."$mkd$, NULL, '2c8114dd-cea1-4859-a83d-c8956bb3ed6b'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 11, 'Redacción: Narrativa y Descripción de una Experiencia Personal', $mkd$A diferencia del ensayo de opinión, aquí no se pide defender una postura con razones, sino **contar o describir una experiencia** (real o imaginada): "Have you ever felt homesick? Describe your experience", "Describe an experience that made you feel afraid".

La estructura que funciona bien es cronológica: una frase inicial que sitúe la situación (cuándo, dónde, qué pasaba), un desarrollo que cuente qué ocurrió y cómo te sentiste, y un cierre breve con cómo terminó o qué aprendiste. Aquí sí conviene usar tiempos narrativos (past simple para la acción principal, past continuous para el contexto, past perfect si hay que mencionar algo anterior a la historia) en vez de los presentes/futuros típicos de un ensayo de opinión.

Aunque el tema sea personal, se sigue evaluando el rango y la corrección del inglés — no basta con contar algo simple en frases cortas; conviene incluir algún detalle sensorial o emocional que dé cuerpo al relato.$mkd$, $mkd$Tema: "Describe an experience that made you feel afraid."

Esquema: (1) frase inicial situando el momento ("Last summer, I decided to go hiking alone in the mountains near my hometown."); (2) desarrollo narrativo con tiempos de pasado ("As it started to get dark, I realised I had lost the path..."); (3) cierre con la resolución y cómo te sentiste después.$mkd$, $mkd$Escribe entre 150 y 200 palabras: "Have you ever lost something that was important to you? Describe your experience."$mkd$, NULL, '43dfe194-569b-4574-8880-bd3a1602330f'::uuid, 'draft'),
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 12, 'Redacción: Carta o Email Informal', $mkd$Este formato ha empezado a aparecer como alternativa en los exámenes más recientes (2025-2026), normalmente como segunda opción junto al ensayo de opinión — conviene conocerlo aunque hoy sea menos frecuente que el ensayo.

A diferencia del ensayo, un email informal a un amigo tiene sus propias convenciones: **saludo informal** ("Hi Susan," / "Dear Tom,"), un **registro cercano** (contracciones, expresiones coloquiales, evitar un tono demasiado formal), y un **cierre informal** ("Take care," / "See you soon," seguido de una despedida) — aunque en el examen se pide explícitamente no firmar ni identificarse.

El contenido debe responder a lo que pide el enunciado (pedir consejo, dar una recomendación, contar una noticia) de forma organizada: una frase que retome el motivo del email, el contenido principal en 1-2 párrafos breves, y un cierre que invite a responder o se despida con calidez.$mkd$, $mkd$Tarea: "Write an informal e-mail to your American friend Susan asking for advice about a trip you are planning to the USA."

Esquema: saludo informal ("Hi Susan,"); frase que sitúa el motivo ("I'm planning a trip to the USA next summer and I could really use your advice."); 1-2 preguntas concretas (dónde alojarse, qué ciudades visitar); cierre cercano invitando a responder ("Let me know what you think! Take care,").$mkd$, $mkd$Escribe entre 150 y 200 palabras: tu amiga Susan te ha escrito preguntando si debería estudiar en su país o en el extranjero. Respóndele con un email informal dándole tu consejo.$mkd$, NULL, '8c7485f0-3973-4d79-8861-297be89ee0d2'::uuid, 'draft');
