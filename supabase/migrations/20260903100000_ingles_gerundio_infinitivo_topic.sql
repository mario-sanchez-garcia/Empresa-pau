-- 16º topic de Inglés: gerundio vs. infinitivo, detectado en la auditoría pedagógica
-- (aparece en 16/65 ejercicios reales de Gramática de Madrid — verificado con patrones
-- de disparador precisos, no keywords sueltas — frecuencia comparable a voz pasiva
-- (20/65) y comparativos (22/65), que sí tienen topic propio; se crea este topic por
-- coherencia con ese criterio y porque tiene reglas gramaticales propias y enseñables,
-- a diferencia de preposiciones dependientes (8/65) u oraciones de relativo (12/65),
-- que se mantienen sin topic propio por ser más colocacionales/de menor volumen).

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('16f5983d-5ae0-4cfe-b3ac-3e334430a714'::uuid, 'ingles', 'destrezas-pau', 'Destrezas PAU', 'gerundio-e-infinitivo', 'Gerundio vs. Infinitivo', 13);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('ingles', 'Destrezas PAU', 'destrezas-pau', 13, 'Gerundio vs. Infinitivo', $mkd$En los 65 ejercicios de Gramática de Madrid, 16 contienen al menos un hueco que pide elegir entre **gerundio** (-ing) e **infinitivo** después de otra palabra — es una estructura con reglas propias, distinta de los tiempos verbales o la voz pasiva, así que conviene tratarla aparte.

Algunos patrones fijos que aparecen en el banco: verbos seguidos siempre de gerundio (*stop, suggest, avoid, enjoy, can't help, insist on, look forward to*: "stop complaining", "suggested going", "I can't help coughing"); verbos seguidos siempre de infinitivo con "to" (*decide, manage, want, afford*: "managed to sell"); y un grupo de verbos que **cambian de significado** según lleven gerundio o infinitivo — los más frecuentes en el banco son *remember* ("remember to do" = acordarse de hacer algo antes de hacerlo; "remember doing" = recordar haberlo hecho ya) y *stop* ("stop to do" = parar para hacer otra cosa; "stop doing" = dejar de hacer algo).

También aparece con frecuencia el gerundio como **sujeto de la frase** ("Finding accommodation requires booking months in advance") y el infinitivo de **propósito** ("so as to...", "in order to..."). Antes de rellenar el hueco, identifica primero qué palabra rige el hueco (el verbo o expresión anterior) y comprueba si es de las que fijan gerundio, de las que fijan infinitivo, o de las que cambian de significado.$mkd$, $mkd$Completa: "My favourite teacher always believed in _______ (treat) all her students exactly the same." → "**treating**" (believe in + gerundio, preposición "in" seguida siempre de -ing).

Completa: "I must remember _______ (buy) shampoo at this shop." → "**to buy**" (remember to do = acordarse de hacer algo que todavía no has hecho — aquí significa que no debe olvidarse de comprarlo).$mkd$, $mkd$Completa usando la forma correcta (gerundio o infinitivo): "She can't help _______ (feel) nervous before exams, so her doctor suggested _______ (try) some breathing exercises."$mkd$, $mkd$⚠️ No existe una regla única "después de X siempre va gerundio/infinitivo" — depende del verbo o expresión concreta que rige el hueco. Con verbos como *remember* o *stop*, fíjate en el significado de la frase: cambia según la forma elegida.$mkd$, '16f5983d-5ae0-4cfe-b3ac-3e334430a714'::uuid, 'draft');
