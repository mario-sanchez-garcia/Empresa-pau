-- Reordena la secuencia pedagógica de Matemáticas CCSS (Curso, borrador) y añade
-- 2 temas puente que faltaban entre Probabilidad y las distribuciones/Inferencia.
--
-- 1) REORDEN: las integrales (creadas después, sort_order/order 40-41) pasan a su
--    posición natural dentro de Análisis (23-24), justo después de Optimización
--    económica y antes de empezar Probabilidad — Probabilidad e Inferencia se
--    desplazan en consecuencia. Verificado antes de tocar nada: ningún
--    camino_calendar/user_learning_queue real de matematicas_ccss referencia
--    valores en el rango afectado (12-41) — los 30+24 registros reales existentes
--    usan la numeración desplazada +1000 de los 6 temas antiguos de
--    PRIVATE_BETA_CURRICULUM_TOPICS (1001-1006) y v2SortOrder 1-2, un espacio de
--    numeración totalmente distinto e independiente. topic_theory_coverage y
--    exam_topics no tienen ninguna fila para matematicas_ccss. topic_id (FK real)
--    no cambia para ningún tema — solo se reordena "order"/sort_order.
--
-- 2) NUEVOS TEMAS (justificación curricular, no hay ejercicio PAU real que los
--    pregunte de forma aislada en los 245 ejercicios/26 exámenes 2018-2026
--    disponibles — comprobado explícitamente antes de crearlos):
--    - "Variable Aleatoria y sus Parámetros": los temas de Binomial/Normal ya
--      usan μ=np, σ²=np(1-p) sin definir nunca qué es una variable aleatoria,
--      esperanza o varianza en general. Puente conceptual necesario, no una
--      pregunta de examen aislada.
--    - "Población, Muestra y Técnicas de Muestreo": los temas de Inferencia
--      (medias/proporciones muestrales) asumen "muestra aleatoria simple" sin
--      introducir nunca qué es población/muestra/representatividad.
--
-- Se insertan con review_status='draft', igual que el resto del borrador.

BEGIN;

-- Paso 1: mover todo a un rango temporal alto para evitar cualquier colisión
-- intermedia con "order"/sort_order ya existentes (no hay UNIQUE constraint,
-- pero así queda explícito y a prueba de reordenamientos futuros del optimizador).
UPDATE curriculum_topics SET "order" = "order" + 500
  WHERE subject = 'matematicas_ccss' AND topic_slug IN ('primitiva-de-una-funcion-y-la-integral-indefinida', 'la-integral-definida-regla-de-barrow-y-areas', 'experimentos-aleatorios-y-espacio-muestral', 'algebra-de-sucesos', 'asignacion-de-probabilidades-regla-de-laplace', 'probabilidad-condicionada-e-independencia', 'diagramas-de-arbol-y-tablas-de-contingencia', 'teorema-de-la-probabilidad-total', 'teorema-de-bayes', 'distribucion-binomial', 'distribucion-normal-y-tipificacion', 'aproximacion-de-la-binomial-a-la-normal', 'distribucion-de-las-medias-muestrales', 'distribucion-de-las-proporciones-muestrales', 'intervalo-de-confianza-para-la-media', 'intervalo-de-confianza-para-la-proporcion', 'determinacion-del-tamano-muestral', 'contraste-de-hipotesis-para-la-media', 'contraste-de-hipotesis-para-la-proporcion');
UPDATE curriculum_content_v2 SET sort_order = sort_order + 500
  WHERE subject = 'matematicas_ccss' AND topic_id IN (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug IN ('primitiva-de-una-funcion-y-la-integral-indefinida', 'la-integral-definida-regla-de-barrow-y-areas', 'experimentos-aleatorios-y-espacio-muestral', 'algebra-de-sucesos', 'asignacion-de-probabilidades-regla-de-laplace', 'probabilidad-condicionada-e-independencia', 'diagramas-de-arbol-y-tablas-de-contingencia', 'teorema-de-la-probabilidad-total', 'teorema-de-bayes', 'distribucion-binomial', 'distribucion-normal-y-tipificacion', 'aproximacion-de-la-binomial-a-la-normal', 'distribucion-de-las-medias-muestrales', 'distribucion-de-las-proporciones-muestrales', 'intervalo-de-confianza-para-la-media', 'intervalo-de-confianza-para-la-proporcion', 'determinacion-del-tamano-muestral', 'contraste-de-hipotesis-para-la-media', 'contraste-de-hipotesis-para-la-proporcion'));

-- Paso 2: fijar el "order"/sort_order final por topic_slug
UPDATE curriculum_topics SET "order" = 23 WHERE subject = 'matematicas_ccss' AND topic_slug = 'primitiva-de-una-funcion-y-la-integral-indefinida';
UPDATE curriculum_content_v2 SET sort_order = 23 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'primitiva-de-una-funcion-y-la-integral-indefinida');
UPDATE curriculum_topics SET "order" = 24 WHERE subject = 'matematicas_ccss' AND topic_slug = 'la-integral-definida-regla-de-barrow-y-areas';
UPDATE curriculum_content_v2 SET sort_order = 24 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'la-integral-definida-regla-de-barrow-y-areas');
UPDATE curriculum_topics SET "order" = 25 WHERE subject = 'matematicas_ccss' AND topic_slug = 'experimentos-aleatorios-y-espacio-muestral';
UPDATE curriculum_content_v2 SET sort_order = 25 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'experimentos-aleatorios-y-espacio-muestral');
UPDATE curriculum_topics SET "order" = 26 WHERE subject = 'matematicas_ccss' AND topic_slug = 'algebra-de-sucesos';
UPDATE curriculum_content_v2 SET sort_order = 26 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'algebra-de-sucesos');
UPDATE curriculum_topics SET "order" = 27 WHERE subject = 'matematicas_ccss' AND topic_slug = 'asignacion-de-probabilidades-regla-de-laplace';
UPDATE curriculum_content_v2 SET sort_order = 27 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'asignacion-de-probabilidades-regla-de-laplace');
UPDATE curriculum_topics SET "order" = 28 WHERE subject = 'matematicas_ccss' AND topic_slug = 'probabilidad-condicionada-e-independencia';
UPDATE curriculum_content_v2 SET sort_order = 28 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'probabilidad-condicionada-e-independencia');
UPDATE curriculum_topics SET "order" = 29 WHERE subject = 'matematicas_ccss' AND topic_slug = 'diagramas-de-arbol-y-tablas-de-contingencia';
UPDATE curriculum_content_v2 SET sort_order = 29 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'diagramas-de-arbol-y-tablas-de-contingencia');
UPDATE curriculum_topics SET "order" = 30 WHERE subject = 'matematicas_ccss' AND topic_slug = 'teorema-de-la-probabilidad-total';
UPDATE curriculum_content_v2 SET sort_order = 30 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'teorema-de-la-probabilidad-total');
UPDATE curriculum_topics SET "order" = 31 WHERE subject = 'matematicas_ccss' AND topic_slug = 'teorema-de-bayes';
UPDATE curriculum_content_v2 SET sort_order = 31 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'teorema-de-bayes');
UPDATE curriculum_topics SET "order" = 33 WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-binomial';
UPDATE curriculum_content_v2 SET sort_order = 33 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-binomial');
UPDATE curriculum_topics SET "order" = 34 WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-normal-y-tipificacion';
UPDATE curriculum_content_v2 SET sort_order = 34 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-normal-y-tipificacion');
UPDATE curriculum_topics SET "order" = 35 WHERE subject = 'matematicas_ccss' AND topic_slug = 'aproximacion-de-la-binomial-a-la-normal';
UPDATE curriculum_content_v2 SET sort_order = 35 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'aproximacion-de-la-binomial-a-la-normal');
UPDATE curriculum_topics SET "order" = 37 WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-de-las-medias-muestrales';
UPDATE curriculum_content_v2 SET sort_order = 37 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-de-las-medias-muestrales');
UPDATE curriculum_topics SET "order" = 38 WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-de-las-proporciones-muestrales';
UPDATE curriculum_content_v2 SET sort_order = 38 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'distribucion-de-las-proporciones-muestrales');
UPDATE curriculum_topics SET "order" = 39 WHERE subject = 'matematicas_ccss' AND topic_slug = 'intervalo-de-confianza-para-la-media';
UPDATE curriculum_content_v2 SET sort_order = 39 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'intervalo-de-confianza-para-la-media');
UPDATE curriculum_topics SET "order" = 40 WHERE subject = 'matematicas_ccss' AND topic_slug = 'intervalo-de-confianza-para-la-proporcion';
UPDATE curriculum_content_v2 SET sort_order = 40 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'intervalo-de-confianza-para-la-proporcion');
UPDATE curriculum_topics SET "order" = 41 WHERE subject = 'matematicas_ccss' AND topic_slug = 'determinacion-del-tamano-muestral';
UPDATE curriculum_content_v2 SET sort_order = 41 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'determinacion-del-tamano-muestral');
UPDATE curriculum_topics SET "order" = 42 WHERE subject = 'matematicas_ccss' AND topic_slug = 'contraste-de-hipotesis-para-la-media';
UPDATE curriculum_content_v2 SET sort_order = 42 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'contraste-de-hipotesis-para-la-media');
UPDATE curriculum_topics SET "order" = 43 WHERE subject = 'matematicas_ccss' AND topic_slug = 'contraste-de-hipotesis-para-la-proporcion';
UPDATE curriculum_content_v2 SET sort_order = 43 WHERE subject = 'matematicas_ccss' AND topic_id = (SELECT id FROM curriculum_topics WHERE subject = 'matematicas_ccss' AND topic_slug = 'contraste-de-hipotesis-para-la-proporcion');

-- Paso 3: insertar los 2 temas nuevos
INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('03a4fadd-2bc3-4e12-b2c7-4bc5e3e7ff3f'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'variable-aleatoria-y-sus-parametros', 'Variable Aleatoria y sus Parámetros: Esperanza y Varianza', 32),
  ('f58f5520-9b11-47e2-a130-44cb174547f9'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'poblacion-muestra-y-tecnicas-de-muestreo', 'Población, Muestra y Técnicas de Muestreo', 36);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 32, 'Variable Aleatoria y sus Parámetros: Esperanza y Varianza', $mkd$Una **variable aleatoria** $X$ asigna un número a cada resultado posible de un experimento aleatorio. Es **discreta** si solo puede tomar un número finito (o numerable) de valores — por ejemplo, el número de caras al lanzar tres monedas. Es **continua** si puede tomar cualquier valor de un intervalo — por ejemplo, un tiempo o una altura (así son la Normal y otras distribuciones continuas).

Para una variable discreta, la **distribución de probabilidad** es la tabla que asocia a cada valor $x_i$ su probabilidad $P(X=x_i)$, con $\sum P(x_i)=1$.

La **esperanza matemática** (o media) resume el valor "central" esperado: $\displaystyle E(X)=\sum x_i\cdot P(x_i)$.

La **varianza** mide la dispersión respecto a esa media: $\displaystyle Var(X)=\sum (x_i-E(X))^2\cdot P(x_i)$, y la **desviación típica** es $\sigma=\sqrt{Var(X)}$. Estas mismas ideas son la base de las fórmulas $\mu=np$ y $\sigma^2=np(1-p)$ que usarás en la distribución Binomial.$mkd$, $mkd$Una variable aleatoria $X$ tiene esta distribución de probabilidad:

| $x_i$ | 0 | 1 | 2 |
|---|---|---|---|
| $P(X=x_i)$ | 0,2 | 0,5 | 0,3 |

Calcula $E(X)$ y $\sigma$.

1. Esperanza: $E(X)=0\cdot0{,}2+1\cdot0{,}5+2\cdot0{,}3=0{,}5+0{,}6=1{,}1$.
2. Varianza: $Var(X)=(0-1{,}1)^2\cdot0{,}2+(1-1{,}1)^2\cdot0{,}5+(2-1{,}1)^2\cdot0{,}3=0{,}242+0{,}005+0{,}243=0{,}49$.
3. Desviación típica: $\sigma=\sqrt{0{,}49}=0{,}7$.$mkd$, $mkd$Una variable aleatoria $X$ tiene distribución $P(X=1)=0{,}4$, $P(X=2)=0{,}4$, $P(X=3)=0{,}2$. Calcula $E(X)$ y $Var(X)$.$mkd$, NULL, '03a4fadd-2bc3-4e12-b2c7-4bc5e3e7ff3f'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 36, 'Población, Muestra y Técnicas de Muestreo', $mkd$La **población** es el conjunto total de individuos u objetos sobre los que se quiere obtener información (por ejemplo, todos los votantes de un país). Estudiar a toda la población suele ser inviable por coste o tiempo, así que se selecciona una **muestra**: un subconjunto de la población al que sí se puede observar directamente.

Para que las conclusiones obtenidas de la muestra puedan generalizarse a toda la población (esto es lo que hace la **inferencia estadística**), la muestra debe ser **representativa**: debe reflejar la diversidad real de la población, sin sesgos sistemáticos hacia un tipo concreto de individuo.

La técnica más habitual es el **muestreo aleatorio simple**: cada individuo de la población tiene la misma probabilidad de ser elegido, y la selección de cada uno es independiente de las demás. Es la base que se asume en los temas siguientes (distribución de las medias y proporciones muestrales). Existen otras técnicas —como el muestreo estratificado (dividir la población en grupos homogéneos y muestrear dentro de cada uno) o el sistemático (elegir un individuo de cada $k$ de una lista)— que persiguen el mismo objetivo de representatividad con otro procedimiento de selección.$mkd$, $mkd$Un instituto con 800 alumnos matriculados quiere estimar la nota media de Matemáticas sin corregir los 800 exámenes. Un profesor obtiene una lista con los 800 alumnos numerados y, usando un generador de números aleatorios, elige 50 números de la lista para revisar solo esos exámenes.

1. Población: los 800 alumnos matriculados.
2. Muestra: los 50 alumnos seleccionados.
3. Técnica: muestreo aleatorio simple, porque cada alumno tenía la misma probabilidad de ser elegido y la selección no dependía de ningún criterio previo (curso, grupo, nota anterior...).$mkd$, $mkd$Un ayuntamiento quiere conocer el gasto medio mensual en transporte de sus 12.000 habitantes y elige aleatoriamente a 200 de ellos para una encuesta telefónica. Identifica la población y la muestra, y explica si el muestreo descrito es aleatorio simple.$mkd$, NULL, 'f58f5520-9b11-47e2-a130-44cb174547f9'::uuid, 'draft');

COMMIT;
