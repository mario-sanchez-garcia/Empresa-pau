-- Primer borrador del Curso de Matemáticas CCSS (Madrid): 39 temas finos en 4
-- bloques (Álgebra, Análisis, Probabilidad, Inferencia), cubriendo el temario
-- oficial de 2º Bachillerato CCSS. Contenido original, redactado para Kairo —
-- el índice de "Apuntes Marea Verde CCSS II" y el temario real de los 84
-- ejercicios de app/data/matematicas_ccss_madrid.ts se usaron solo como
-- referencia de ALCANCE (qué temas cubrir), nunca como fuente de texto.
--
-- Antes de esta migración, curriculum_topics tenía 10 filas para
-- subject='matematicas_ccss' de dos orígenes distintos (6 de
-- PRIVATE_BETA_CURRICULUM_TOPICS en betaCurriculum.ts, 4 de
-- curriculum_seed.json) que no coincidían entre sí y no tenían ninguna fila
-- correspondiente en curriculum_content_v2 (0 filas, verificado). Ninguna de
-- las 10 tiene referencias en exam_topics ni en topic_theory_coverage
-- (verificado) — se sustituyen enteras por las 39 nuevas, sin fusión.
--
-- review_status en curriculum_content_v2: columna nueva, default 'published'
-- (todas las filas existentes de cualquier asignatura quedan 'published' sin
-- backfill adicional). Las 39 lecciones de este borrador se insertan con
-- review_status='draft' — no deben verse por alumnos reales todavía. Dos
-- puntos de lectura sin filtro (app/lib/onboarding/generateCaminoPlan.ts y
-- app/api/camino/add-subject/route.ts) se actualizan en el mismo commit para
-- respetar 'draft' al sembrar la cola de aprendizaje; sin ese filtro, un
-- alumno real eligiendo Matemáticas CCSS en el onboarding (ya activada,
-- betaStatus:'enabled') vería estas 39 lecciones sin revisar de inmediato.

ALTER TABLE curriculum_content_v2
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'published'
    CHECK (review_status IN ('draft', 'published'));

DELETE FROM curriculum_topics WHERE subject = 'matematicas_ccss';

INSERT INTO curriculum_topics (id, subject, block_key, block_title, topic_slug, title, "order") VALUES
  ('d5292105-abfc-4e21-8c9b-363c78c2dc4f'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'matrices-definicion-y-tipos', 'Matrices: Definición y Tipos', 1),
  ('06c04864-b98d-4a25-a3b1-20cd9c6a9ca8'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'suma-resta-y-producto-por-un-escalar', 'Suma, Resta y Producto por un Escalar', 2),
  ('82880f76-b032-4f8b-b75e-e940e809b882'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'multiplicacion-de-matrices', 'Multiplicación de Matrices', 3),
  ('ace1dce6-0701-4c9a-b6ff-7ef3e818e3dd'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'matriz-traspuesta', 'La Matriz Traspuesta', 4),
  ('4ce08994-cc14-4eb7-affc-dfcdc2a24d46'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'determinante-de-una-matriz', 'El Determinante de una Matriz', 5),
  ('498a4007-ace5-4aea-9bf2-47969e9b9ca6'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'matriz-inversa', 'La Matriz Inversa', 6),
  ('4103ae90-e464-4f8b-a101-f767e6d2a38b'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'rango-de-una-matriz-metodo-de-gauss', 'Rango de una Matriz por el Método de Gauss', 7),
  ('8e937874-5207-4e36-8313-2c9ac9affd50'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'expresion-matricial-de-un-sistema', 'Expresión Matricial de un Sistema', 8),
  ('400b76fb-05c4-4c4f-82c0-573cfa5d5116'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'resolucion-de-sistemas-por-gauss', 'Resolución de Sistemas por el Método de Gauss', 9),
  ('7ff99f20-5f95-4535-a929-444c889ea67b'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'discusion-de-sistemas-rouche-frobenius', 'Discusión de Sistemas: Teorema de Rouché-Frobenius', 10),
  ('d511118b-05f1-4704-ab0d-1f37174d9278'::uuid, 'matematicas_ccss', 'algebra', 'Álgebra', 'programacion-lineal-region-factible-y-optimizacion', 'Programación Lineal: Región Factible y Optimización', 11),
  ('3d5b6e28-1926-4d4b-9bba-e6f573163876'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'dominio-de-una-funcion', 'Dominio de una Función', 12),
  ('6bdaf522-5522-4ee9-9c45-7d7db608710d'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'limites-de-una-funcion-e-indeterminaciones', 'Límites de una Función e Indeterminaciones', 13),
  ('508690b1-5b75-4ade-b9df-807695d357ba'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'asintotas-de-una-funcion', 'Asíntotas de una Función', 14),
  ('cc9ab9c0-38bd-4085-b081-dcbc47044eac'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'continuidad-y-tipos-de-discontinuidad', 'Continuidad y Tipos de Discontinuidad', 15),
  ('3dc505f0-efbc-44a5-ae77-fa5219d1e871'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'concepto-de-derivada-y-recta-tangente', 'Concepto de Derivada y Recta Tangente', 16),
  ('4b2a270c-6ef9-4665-bd27-6dbde099045e'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'calculo-de-derivadas-y-reglas-de-derivacion', 'Cálculo de Derivadas y Reglas de Derivación', 17),
  ('38c16097-3674-4c47-a54a-eff3aab2a550'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'crecimiento-decrecimiento-y-extremos-relativos', 'Crecimiento, Decrecimiento y Extremos Relativos', 18),
  ('ed75d679-c496-42b3-8ecd-23ca2b25faa0'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'concavidad-convexidad-y-puntos-de-inflexion', 'Concavidad, Convexidad y Puntos de Inflexión', 19),
  ('27004f8f-1944-4186-a16f-d4e051bcafbd'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'representacion-grafica-de-funciones', 'Representación Gráfica de Funciones', 20),
  ('bdde80cd-3b4d-4e7a-b49c-621e94375011'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'funciones-de-coste-ingreso-y-beneficio', 'Funciones de Coste, Ingreso y Beneficio', 21),
  ('f0dbdef2-d996-40dd-883e-04611cd077db'::uuid, 'matematicas_ccss', 'analisis', 'Análisis', 'optimizacion-economica-maximo-beneficio-y-minimo-coste', 'Optimización Económica: Máximo Beneficio y Mínimo Coste', 22),
  ('e904f40d-9f34-4ada-8beb-a05cc20e19c4'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'experimentos-aleatorios-y-espacio-muestral', 'Experimentos Aleatorios y Espacio Muestral', 23),
  ('49e438ef-866d-4b44-9a35-81c3c88d8502'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'algebra-de-sucesos', 'Álgebra de Sucesos', 24),
  ('6f01f262-21c0-47f1-a1d9-e0c3cfc25be2'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'asignacion-de-probabilidades-regla-de-laplace', 'Asignación de Probabilidades: Regla de Laplace', 25),
  ('3528cdea-b446-4d20-b688-2fd185b42813'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'probabilidad-condicionada-e-independencia', 'Probabilidad Condicionada e Independencia', 26),
  ('4a1d7d71-d4b3-4d2f-ad82-825e9a7d468e'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'diagramas-de-arbol-y-tablas-de-contingencia', 'Diagramas de Árbol y Tablas de Contingencia', 27),
  ('53ba042d-04e7-4d30-9e13-b12f0d75c0f7'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'teorema-de-la-probabilidad-total', 'Teorema de la Probabilidad Total', 28),
  ('57e2cfee-b3cc-4443-bd6b-bd2331cccb2f'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'teorema-de-bayes', 'Teorema de Bayes', 29),
  ('8f8c72a5-0d4e-4b1d-857d-a1ad22b9ad36'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'distribucion-binomial', 'Distribución Binomial', 30),
  ('b6695a5a-00af-4aa2-b17e-edbad1e13642'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'distribucion-normal-y-tipificacion', 'Distribución Normal y Tipificación', 31),
  ('1413a4c9-8fa2-49bb-be1b-129d11ebc4d5'::uuid, 'matematicas_ccss', 'probabilidad', 'Probabilidad', 'aproximacion-de-la-binomial-a-la-normal', 'Aproximación de la Binomial a la Normal', 32),
  ('c91bfa00-eb22-4add-a5ab-34227a375da4'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'distribucion-de-las-medias-muestrales', 'Distribución de las Medias Muestrales', 33),
  ('f9e4a4de-773d-4e7a-8e8c-9bcb1bc3ffb2'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'distribucion-de-las-proporciones-muestrales', 'Distribución de las Proporciones Muestrales', 34),
  ('2b017a98-d109-4dc2-ba18-4dcc8391877c'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'intervalo-de-confianza-para-la-media', 'Intervalo de Confianza para la Media', 35),
  ('d4c6c356-142c-4fd6-b3d9-86281f9aa3d5'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'intervalo-de-confianza-para-la-proporcion', 'Intervalo de Confianza para la Proporción', 36),
  ('24481e4c-b64f-4732-9f56-0aef8f948645'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'determinacion-del-tamano-muestral', 'Determinación del Tamaño Muestral', 37),
  ('3c286727-291d-4634-b0a4-40bc4b1f6bc1'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'contraste-de-hipotesis-para-la-media', 'Contraste de Hipótesis para la Media', 38),
  ('89d13d47-95e2-4e71-b281-ca45f4a5dc08'::uuid, 'matematicas_ccss', 'inferencia', 'Inferencia', 'contraste-de-hipotesis-para-la-proporcion', 'Contraste de Hipótesis para la Proporción', 39);

INSERT INTO curriculum_content_v2 (subject, block_key, block_slug, sort_order, title, concept_markdown, worked_example_markdown, practice_prompt, alert_markdown, topic_id, review_status) VALUES
  ('matematicas_ccss', 'Álgebra', 'algebra', 1, 'Matrices: Definición y Tipos', $mkd$Una matriz es una tabla rectangular de números organizada en $m$ filas y $n$ columnas. Se dice que tiene **dimensión** u **orden** $m\times n$. Cada número se llama elemento y se representa como $a_{ij}$, donde $i$ es la fila y $j$ la columna.

Algunos tipos especiales: una matriz es **cuadrada** si $m=n$ (mismo número de filas que de columnas); es **fila** si $m=1$ y **columna** si $n=1$; es **nula** si todos sus elementos son 0; y la **matriz identidad** $I$ es cuadrada, con 1 en la diagonal principal y 0 en el resto.

Dos matrices son **iguales** solo si tienen la misma dimensión y coinciden elemento a elemento.$mkd$, $mkd$Dada la matriz $A=\begin{pmatrix}3&-2&0\\1&4&5\end{pmatrix}$, indica su dimensión y los elementos $a_{12}$ y $a_{23}$.

1. Contamos filas y columnas: 2 filas, 3 columnas $\to$ dimensión $2\times3$.
2. $a_{12}$ es el elemento de la fila 1, columna 2: $a_{12}=-2$.
3. $a_{23}$ es el elemento de la fila 2, columna 3: $a_{23}=5$.$mkd$, $mkd$Dada la matriz $C=\begin{pmatrix}5&0&-1\\2&3&4\end{pmatrix}$, indica su dimensión y los elementos $c_{13}$ y $c_{21}$.$mkd$, NULL, 'd5292105-abfc-4e21-8c9b-363c78c2dc4f'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 2, 'Suma, Resta y Producto por un Escalar', $mkd$Dos matrices solo se pueden **sumar o restar** si tienen la misma dimensión. El resultado se obtiene sumando o restando los elementos que ocupan la misma posición.

El **producto de un número (escalar) por una matriz** se calcula multiplicando cada elemento de la matriz por ese número. Estas operaciones cumplen las propiedades habituales de la suma y el producto: conmutativa en la suma, asociativa, y distributiva del escalar respecto a la suma de matrices.$mkd$, $mkd$Dadas $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$ y $B=\begin{pmatrix}0&-1\\2&1\end{pmatrix}$, calcula $A+B$ y $2A-B$.

1. $A+B=\begin{pmatrix}1+0&2+(-1)\\3+2&4+1\end{pmatrix}=\begin{pmatrix}1&1\\5&5\end{pmatrix}$
2. $2A=\begin{pmatrix}2&4\\6&8\end{pmatrix}$
3. $2A-B=\begin{pmatrix}2-0&4-(-1)\\6-2&8-1\end{pmatrix}=\begin{pmatrix}2&5\\4&7\end{pmatrix}$$mkd$, $mkd$Dadas $A=\begin{pmatrix}2&0\\-1&3\end{pmatrix}$ y $B=\begin{pmatrix}1&2\\4&-2\end{pmatrix}$, calcula $A-2B$.$mkd$, NULL, '06c04864-b98d-4a25-a3b1-20cd9c6a9ca8'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 3, 'Multiplicación de Matrices', $mkd$El producto $A\cdot B$ solo está definido si el número de columnas de $A$ coincide con el número de filas de $B$. Si $A$ es $m\times n$ y $B$ es $n\times p$, el resultado $A\cdot B$ es una matriz $m\times p$.

Cada elemento del resultado se obtiene multiplicando la fila correspondiente de $A$ por la columna correspondiente de $B$, elemento a elemento, y sumando: $(AB)_{ij}=\sum_k a_{ik}b_{kj}$.

**Importante:** el producto de matrices no es conmutativo en general, es decir, $A\cdot B \neq B\cdot A$ salvo casos concretos.$mkd$, $mkd$Calcula $A\cdot B$ siendo $A=\begin{pmatrix}1&2\\0&-1\end{pmatrix}$ y $B=\begin{pmatrix}3&1\\2&4\end{pmatrix}$.

Elemento $(1,1)$: fila 1 de $A$ por columna 1 de $B$: $1\cdot3+2\cdot2=3+4=7$
Elemento $(1,2)$: $1\cdot1+2\cdot4=1+8=9$
Elemento $(2,1)$: $0\cdot3+(-1)\cdot2=0-2=-2$
Elemento $(2,2)$: $0\cdot1+(-1)\cdot4=0-4=-4$

$$A\cdot B=\begin{pmatrix}7&9\\-2&-4\end{pmatrix}$$$mkd$, $mkd$Calcula $A\cdot B$ siendo $A=\begin{pmatrix}2&-1\\1&3\end{pmatrix}$ y $B=\begin{pmatrix}0&2\\1&-1\end{pmatrix}$.$mkd$, $mkd$⚠️ **El orden importa.** $A\cdot B$ y $B\cdot A$ casi nunca coinciden, e incluso puede que solo uno de los dos productos esté definido según las dimensiones. Comprueba siempre las dimensiones antes de multiplicar y respeta el orden que te pidan.$mkd$, '82880f76-b032-4f8b-b75e-e940e809b882'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 4, 'La Matriz Traspuesta', $mkd$La **traspuesta** de una matriz $A$, escrita $A^t$, se obtiene convirtiendo las filas de $A$ en columnas (y viceversa). Si $A$ tiene dimensión $m\times n$, entonces $A^t$ tiene dimensión $n\times m$.

Propiedades: $(A^t)^t=A$, $(A+B)^t=A^t+B^t$, y $(A\cdot B)^t=B^t\cdot A^t$ (el orden se invierte).

Una matriz cuadrada es **simétrica** si coincide con su propia traspuesta, es decir, $A=A^t$.$mkd$, $mkd$Calcula la traspuesta de $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$ y comprueba si $B=\begin{pmatrix}2&5\\5&-1\end{pmatrix}$ es simétrica.

1. Convertimos filas en columnas: $A^t=\begin{pmatrix}1&4\\2&5\\3&6\end{pmatrix}$ (dimensión $3\times2$).
2. Calculamos $B^t=\begin{pmatrix}2&5\\5&-1\end{pmatrix}$. Como $B^t=B$, la matriz $B$ **sí es simétrica**.$mkd$, $mkd$Calcula la traspuesta de $C=\begin{pmatrix}0&-1\\3&2\\4&1\end{pmatrix}$ y comprueba si $D=\begin{pmatrix}1&3\\2&4\end{pmatrix}$ es simétrica.$mkd$, NULL, 'ace1dce6-0701-4c9a-b6ff-7ef3e818e3dd'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 5, 'El Determinante de una Matriz', $mkd$El determinante es un número asociado a una matriz cuadrada, que se escribe $|A|$ o $\det(A)$.

**Orden 2:** $\begin{vmatrix}a&b\\c&d\end{vmatrix}=a\cdot d-b\cdot c$ (producto de la diagonal principal menos el de la secundaria).

**Orden 3 (Regla de Sarrus):** se suman los productos de las tres diagonales paralelas a la principal y se restan los productos de las tres diagonales paralelas a la secundaria (imaginando las dos primeras columnas repetidas a la derecha de la matriz).$mkd$, $mkd$Calcula el determinante de $A=\begin{pmatrix}2&1&0\\-1&3&2\\0&1&-1\end{pmatrix}$.

Diagonales positivas: $2\cdot3\cdot(-1)=-6$, $\quad1\cdot2\cdot0=0$, $\quad0\cdot(-1)\cdot1=0$. Suma: $-6$.

Diagonales negativas: $0\cdot3\cdot0=0$, $\quad2\cdot2\cdot2=8$, $\quad-1\cdot(-1)\cdot1=1$. Suma: $9$.

$$|A|=-6-9=-15$$$mkd$, $mkd$Calcula el determinante de $B=\begin{pmatrix}1&0&2\\3&-1&1\\0&2&1\end{pmatrix}$.$mkd$, $mkd$⚠️ **Los signos son la parte que más falla.** Escribe siempre las dos columnas repetidas antes de multiplicar diagonales, y recuerda: las tres diagonales que van de arriba-izquierda a abajo-derecha suman, las otras tres restan.$mkd$, '4ce08994-cc14-4eb7-affc-dfcdc2a24d46'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 6, 'La Matriz Inversa', $mkd$Una matriz cuadrada $A$ es **invertible** si existe otra matriz $A^{-1}$ tal que $A\cdot A^{-1}=A^{-1}\cdot A=I$. Una matriz solo tiene inversa si su determinante es distinto de 0.

Para una matriz $2\times2$, $A=\begin{pmatrix}a&b\\c&d\end{pmatrix}$, la inversa se calcula directamente:

$$A^{-1}=\dfrac{1}{|A|}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$$

Para matrices más grandes se suele usar el método de Gauss-Jordan, reduciendo $(A|I)$ hasta obtener $(I|A^{-1})$.$mkd$, $mkd$Calcula la inversa de $A=\begin{pmatrix}2&1\\1&1\end{pmatrix}$.

1. Determinante: $|A|=2\cdot1-1\cdot1=1$. Como $|A|\neq0$, $A$ tiene inversa.
2. Aplicamos la fórmula: $A^{-1}=\dfrac{1}{1}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$
3. Comprobación: $A\cdot A^{-1}=\begin{pmatrix}2&1\\1&1\end{pmatrix}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}=\begin{pmatrix}1&0\\0&1\end{pmatrix}=I$ ✓$mkd$, $mkd$Calcula la inversa de $B=\begin{pmatrix}3&2\\1&1\end{pmatrix}$ y comprueba el resultado.$mkd$, NULL, '498a4007-ace5-4aea-9bf2-47969e9b9ca6'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 7, 'Rango de una Matriz por el Método de Gauss', $mkd$El **rango** de una matriz es el número de filas (o columnas) linealmente independientes que tiene. Se calcula transformando la matriz en una matriz escalonada mediante el **método de Gauss** (sumar/restar múltiplos de una fila a otra) y contando cuántas filas no nulas quedan.

El rango de una matriz $m\times n$ nunca puede superar el menor de $m$ y $n$.$mkd$, $mkd$Calcula el rango de $A=\begin{pmatrix}1&2&1\\2&4&3\\0&0&1\end{pmatrix}$.

1. $F_2\to F_2-2F_1$: $\begin{pmatrix}1&2&1\\0&0&1\\0&0&1\end{pmatrix}$
2. $F_3\to F_3-F_2$: $\begin{pmatrix}1&2&1\\0&0&1\\0&0&0\end{pmatrix}$

Quedan 2 filas no nulas, así que $\text{rango}(A)=2$.$mkd$, $mkd$Calcula el rango de $B=\begin{pmatrix}1&1&2\\2&2&4\\1&0&3\end{pmatrix}$.$mkd$, NULL, '4103ae90-e464-4f8b-a101-f767e6d2a38b'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 8, 'Expresión Matricial de un Sistema', $mkd$Todo sistema de ecuaciones lineales se puede escribir en forma matricial $A\cdot X=B$, donde $A$ es la **matriz de coeficientes**, $X$ es la columna de incógnitas y $B$ es la columna de términos independientes.

También se usa la **matriz ampliada** $(A|B)$, que junta los coeficientes y los términos independientes en una sola tabla — es la que se utiliza para aplicar el método de Gauss.$mkd$, $mkd$Escribe en forma matricial el sistema $\begin{cases}2x-y=5\\x+3y=1\end{cases}$.

$$A=\begin{pmatrix}2&-1\\1&3\end{pmatrix},\quad X=\begin{pmatrix}x\\y\end{pmatrix},\quad B=\begin{pmatrix}5\\1\end{pmatrix}$$

$$A\cdot X=B \quad\Longleftrightarrow\quad \begin{pmatrix}2&-1\\1&3\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}5\\1\end{pmatrix}$$

Matriz ampliada: $(A|B)=\left(\begin{array}{cc|c}2&-1&5\\1&3&1\end{array}\right)$$mkd$, $mkd$Escribe en forma matricial (matriz de coeficientes, incógnitas y matriz ampliada) el sistema $\begin{cases}x+2y-z=3\\-x+y+z=0\\2x-y+3z=4\end{cases}$.$mkd$, NULL, '8e937874-5207-4e36-8313-2c9ac9affd50'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 9, 'Resolución de Sistemas por el Método de Gauss', $mkd$El **método de Gauss** consiste en transformar la matriz ampliada $(A|B)$ en una matriz escalonada (con ceros por debajo de la diagonal principal) usando combinaciones de filas, hasta que el sistema sea fácil de resolver por **sustitución hacia atrás**: se despeja primero la última incógnita, y se sustituye en las ecuaciones anteriores.$mkd$, $mkd$Resuelve por Gauss el sistema $\begin{cases}x+y+z=6\\2x-y+z=3\\x+2y-z=2\end{cases}$.

1. $F_2\to F_2-2F_1$: $-3y-z=-9$
2. $F_3\to F_3-F_1$: $\;y-2z=-4$
3. Intercambiamos para escalonar y combinamos $F_3$ con la nueva $F_2$: de $-3y-z=-9$ y $y-2z=-4$, multiplicamos la segunda por 3 y sumamos: $3y-6z=-12$, sumado a $-3y-z=-9$ da $-7z=-21\Rightarrow z=3$.
4. Sustituyendo: $y-2(3)=-4\Rightarrow y=2$. Y $x+2+3=6\Rightarrow x=1$.

Solución: $(x,y,z)=(1,2,3)$.$mkd$, $mkd$Resuelve por Gauss el sistema $\begin{cases}x+y-z=2\\2x-y+z=5\\x+2y+z=4\end{cases}$.$mkd$, NULL, '400b76fb-05c4-4c4f-82c0-573cfa5d5116'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 10, 'Discusión de Sistemas: Teorema de Rouché-Frobenius', $mkd$El **teorema de Rouché-Frobenius** permite clasificar un sistema comparando el rango de la matriz de coeficientes $A$, el rango de la matriz ampliada $(A|B)$, y el número de incógnitas $n$:

- Si $\text{rango}(A)=\text{rango}(A|B)=n$: sistema **compatible determinado** (una única solución).
- Si $\text{rango}(A)=\text{rango}(A|B)<n$: sistema **compatible indeterminado** (infinitas soluciones).
- Si $\text{rango}(A)\neq\text{rango}(A|B)$: sistema **incompatible** (sin solución).

Cuando el sistema depende de un parámetro, primero se busca el valor del parámetro que anula el determinante de $A$, y para ese valor se comparan los rangos.$mkd$, $mkd$Discute según los valores de $m$ el sistema $\begin{cases}x+y=1\\mx+y=m\end{cases}$.

1. $|A|=\begin{vmatrix}1&1\\m&1\end{vmatrix}=1-m$. Se anula si $m=1$.
2. Si $m\neq1$: $\text{rango}(A)=\text{rango}(A|B)=2=n$ $\to$ compatible determinado.
3. Si $m=1$: el sistema queda $\begin{cases}x+y=1\\x+y=1\end{cases}$, las dos ecuaciones son iguales $\to \text{rango}(A)=\text{rango}(A|B)=1<2$ $\to$ compatible indeterminado.$mkd$, $mkd$Discute según los valores de $k$ el sistema $\begin{cases}2x-y=3\\kx-y=6\end{cases}$.$mkd$, $mkd$⚠️ **No basta con calcular el determinante.** Cuando $|A|=0$ para un valor del parámetro, todavía tienes que comparar el rango de $A$ con el rango de $(A|B)$ para saber si el sistema es compatible indeterminado o incompatible — son casos distintos y se confunden mucho.$mkd$, '7ff99f20-5f95-4535-a929-444c889ea67b'::uuid, 'draft'),
  ('matematicas_ccss', 'Álgebra', 'algebra', 11, 'Programación Lineal: Región Factible y Optimización', $mkd$La **programación lineal** busca el valor máximo o mínimo de una función objetivo $z=ax+by$ sujeta a un conjunto de restricciones expresadas como inecuaciones lineales.

Cada restricción define un semiplano; la intersección de todos los semiplanos es la **región factible**, un polígono convexo (o una región no acotada). Un resultado clave: si existe óptimo, este se alcanza siempre en un **vértice** de la región factible. El procedimiento es: representar las restricciones, hallar los vértices de la región factible, y evaluar $z$ en cada uno.$mkd$, $mkd$Una fábrica produce mesas ($x$) y sillas ($y$). Restricciones: $x\geq0$, $y\geq0$, $x+2y\leq 20$ (horas de trabajo), $2x+y\leq 20$ (madera). Se gana 30€ por mesa y 20€ por silla: maximizar $z=30x+20y$.

1. Vértices de la región factible: $(0,0)$, $(10,0)$, $(0,10)$, y la intersección de $x+2y=20$ con $2x+y=20$: resolviendo, $x=y=\frac{20}{3}\approx6{,}67$.
2. Evaluamos $z$ en cada vértice: $z(0,0)=0$; $z(10,0)=300$; $z(0,10)=200$; $z(6{,}67,6{,}67)\approx333{,}3$.
3. El máximo se alcanza en $(6{,}67;\,6{,}67)$, con $z\approx333{,}3$€.$mkd$, $mkd$Una carpintería fabrica armarios ($x$) y estanterías ($y$) con las restricciones $x\geq0$, $y\geq0$, $x+y\leq10$, $2x+y\leq16$. El beneficio es $z=40x+25y$. Halla los vértices de la región factible y determina en cuál se maximiza $z$.$mkd$, NULL, 'd511118b-05f1-4704-ab0d-1f37174d9278'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 12, 'Dominio de una Función', $mkd$El **dominio** de una función es el conjunto de valores de $x$ para los que la función está definida.

Reglas más habituales: en una función **racional** (cociente de polinomios), se excluyen los valores de $x$ que anulan el denominador; en una función con **raíz cuadrada**, el radicando debe ser mayor o igual que 0.$mkd$, $mkd$Calcula el dominio de $f(x)=\dfrac{x+1}{x^2-4}$.

1. El denominador se anula cuando $x^2-4=0 \Rightarrow x=2$ o $x=-2$.
2. Esos valores no pueden formar parte del dominio.

$$\text{Dom}(f)=\mathbb{R}-\{-2,2\}$$$mkd$, $mkd$Calcula el dominio de $g(x)=\dfrac{2x}{x^2-9}$.$mkd$, NULL, '3d5b6e28-1926-4d4b-9bba-e6f573163876'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 13, 'Límites de una Función e Indeterminaciones', $mkd$El límite de $f(x)$ cuando $x$ tiende a un valor $a$ (o a $\infty$) describe hacia qué número se acerca $f(x)$, aunque la función no esté definida exactamente en ese punto.

Al sustituir directamente pueden aparecer **indeterminaciones**: $\frac{0}{0}$ (se resuelve factorizando numerador y denominador y simplificando) o $\frac{\infty}{\infty}$ (se resuelve dividiendo numerador y denominador entre la potencia de $x$ de mayor grado).$mkd$, $mkd$Calcula $\displaystyle\lim_{x\to2}\dfrac{x^2-4}{x-2}$.

Al sustituir $x=2$ obtenemos $\frac{0}{0}$, una indeterminación. Factorizamos: $x^2-4=(x-2)(x+2)$.

$$\lim_{x\to2}\dfrac{(x-2)(x+2)}{x-2}=\lim_{x\to2}(x+2)=4$$$mkd$, $mkd$Calcula $\displaystyle\lim_{x\to\infty}\dfrac{3x^2+1}{x^2-5}$.$mkd$, $mkd$⚠️ **Sustituir sin más casi nunca funciona en $\frac{0}{0}$.** Si al sustituir obtienes $\frac{0}{0}$, es una señal de que hay un factor común que se puede simplificar — no significa que el límite valga 0.$mkd$, '6bdaf522-5522-4ee9-9c45-7d7db608710d'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 14, 'Asíntotas de una Función', $mkd$Una **asíntota vertical** aparece en los valores de $x$ donde el denominador se anula (y el numerador no), y se estudia el signo del límite lateral. Una **asíntota horizontal** es el valor al que tiende $f(x)$ cuando $x\to\pm\infty$: si el grado del numerador es menor que el del denominador, la asíntota es $y=0$; si los grados coinciden, la asíntota es $y=\frac{\text{coeficiente principal del numerador}}{\text{coeficiente principal del denominador}}$.$mkd$, $mkd$Halla las asíntotas de $f(x)=\dfrac{2x+1}{x-3}$.

**Vertical:** el denominador se anula en $x=3$ (y el numerador no se anula ahí) $\to$ asíntota vertical $x=3$.

**Horizontal:** numerador y denominador tienen el mismo grado (1), así que la asíntota horizontal es $y=\dfrac{2}{1}=2$.$mkd$, $mkd$Halla las asíntotas de $g(x)=\dfrac{x-1}{x+2}$.$mkd$, NULL, '508690b1-5b75-4ade-b9df-807695d357ba'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 15, 'Continuidad y Tipos de Discontinuidad', $mkd$Una función es **continua** en $x=a$ si se cumplen tres condiciones: $f(a)$ existe, el límite en $a$ existe, y ambos coinciden. Si falla alguna, hay una **discontinuidad**:

- **Evitable:** el límite existe pero no coincide con $f(a)$ (o $f(a)$ no existe).
- **De salto finito:** los límites laterales existen pero son distintos entre sí.
- **De salto infinito:** al menos uno de los límites laterales es $\pm\infty$.

En funciones definidas a trozos, hay que estudiar la continuidad en los puntos donde cambia la expresión.$mkd$, $mkd$Estudia la continuidad en $x=1$ de $f(x)=\begin{cases}x+1,&x\leq1\\3x-1,&x>1\end{cases}$.

1. Límite por la izquierda: $\lim_{x\to1^-}(x+1)=2$.
2. Límite por la derecha: $\lim_{x\to1^+}(3x-1)=2$.
3. $f(1)=1+1=2$.

Los tres valores coinciden, así que $f$ **es continua** en $x=1$.$mkd$, $mkd$Estudia la continuidad en $x=2$ de $g(x)=\begin{cases}x^2,&x\leq2\\3x-2,&x>2\end{cases}$.$mkd$, NULL, 'cc9ab9c0-38bd-4085-b081-dcbc47044eac'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 16, 'Concepto de Derivada y Recta Tangente', $mkd$La **derivada** de $f$ en $x=a$, $f'(a)$, mide la tasa de variación instantánea de la función en ese punto y coincide con la **pendiente de la recta tangente** a la gráfica en $(a,f(a))$.

La ecuación de la recta tangente es: $y-f(a)=f'(a)\cdot(x-a)$.$mkd$, $mkd$Halla la recta tangente a $f(x)=x^2-3x+2$ en $x=1$.

1. $f(1)=1-3+2=0$. Punto de tangencia: $(1,0)$.
2. $f'(x)=2x-3$, así que $f'(1)=2-3=-1$.
3. Recta tangente: $y-0=-1(x-1) \Rightarrow y=-x+1$.$mkd$, $mkd$Halla la recta tangente a $g(x)=x^2+2x$ en $x=2$.$mkd$, NULL, '3dc505f0-efbc-44a5-ae77-fa5219d1e871'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 17, 'Cálculo de Derivadas y Reglas de Derivación', $mkd$Reglas básicas de derivación: potencia $\big(x^n\big)'=n\,x^{n-1}$, suma/resta $(f\pm g)'=f'\pm g'$, producto $(f\cdot g)'=f'g+fg'$, y cociente $\left(\dfrac{f}{g}\right)'=\dfrac{f'g-fg'}{g^2}$.$mkd$, $mkd$Deriva $f(x)=(x^2+1)(3x-2)$ usando la regla del producto.

Con $u=x^2+1$, $u'=2x$; $v=3x-2$, $v'=3$:

$$f'(x)=u'v+uv'=2x(3x-2)+(x^2+1)\cdot3=6x^2-4x+3x^2+3$$

$$f'(x)=9x^2-4x+3$$$mkd$, $mkd$Deriva $g(x)=\dfrac{2x-1}{x+3}$ usando la regla del cociente.$mkd$, NULL, '4b2a270c-6ef9-4665-bd27-6dbde099045e'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 18, 'Crecimiento, Decrecimiento y Extremos Relativos', $mkd$El signo de $f'(x)$ indica el comportamiento de la función: si $f'(x)>0$ en un intervalo, $f$ es **creciente**; si $f'(x)<0$, es **decreciente**. Los **puntos críticos** (donde $f'(x)=0$) son los candidatos a máximo o mínimo relativo. Para clasificarlos, se estudia cómo cambia el signo de $f'$ a cada lado del punto crítico: de $+$ a $-$ indica máximo, de $-$ a $+$ indica mínimo.$mkd$, $mkd$Estudia el crecimiento y los extremos de $f(x)=x^3-3x$.

1. $f'(x)=3x^2-3=3(x-1)(x+1)$. Puntos críticos: $x=-1$ y $x=1$.
2. Estudiamos el signo de $f'$: en $(-\infty,-1)$ es positivo (creciente), en $(-1,1)$ es negativo (decreciente), en $(1,\infty)$ es positivo (creciente).
3. En $x=-1$ pasa de $+$ a $-$: **máximo relativo**, con $f(-1)=-1+3=2$.
4. En $x=1$ pasa de $-$ a $+$: **mínimo relativo**, con $f(1)=1-3=-2$.$mkd$, $mkd$Estudia el crecimiento y los extremos relativos de $g(x)=x^3-12x$.$mkd$, $mkd$⚠️ **$f'(a)=0$ no siempre es un extremo.** Antes de decir "máximo" o "mínimo", comprueba que el signo de $f'$ realmente cambia a los dos lados del punto — si no cambia (como en $f(x)=x^3$ en $x=0$), es un punto de inflexión, no un extremo.$mkd$, '38c16097-3674-4c47-a54a-eff3aab2a550'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 19, 'Concavidad, Convexidad y Puntos de Inflexión', $mkd$La segunda derivada $f''(x)$ determina la curvatura: si $f''(x)>0$ la gráfica es **cóncava hacia arriba** (convexa), y si $f''(x)<0$ es **cóncava hacia abajo**. Un **punto de inflexión** es un punto donde $f''(x)=0$ y además la curvatura cambia de signo a cada lado.$mkd$, $mkd$Estudia la curvatura de $f(x)=x^3-3x^2$.

1. $f'(x)=3x^2-6x$, y $f''(x)=6x-6=6(x-1)$.
2. $f''(x)=0$ cuando $x=1$.
3. Para $x<1$, $f''(x)<0$ (cóncava hacia abajo); para $x>1$, $f''(x)>0$ (cóncava hacia arriba). El signo cambia, así que $x=1$ es un **punto de inflexión**, con $f(1)=1-3=-2$: el punto $(1,-2)$.$mkd$, $mkd$Estudia la curvatura de $g(x)=x^3-6x^2$ y halla su punto de inflexión.$mkd$, NULL, 'ed75d679-c496-42b3-8ecd-23ca2b25faa0'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 20, 'Representación Gráfica de Funciones', $mkd$Para representar una función de forma completa conviene seguir un orden: 1) hallar el **dominio**; 2) hallar los **cortes con los ejes**; 3) hallar las **asíntotas**; 4) estudiar el **crecimiento y los extremos** con $f'$; 5) estudiar la **curvatura y los puntos de inflexión** con $f''$. Con esta información ya se puede esbozar la gráfica con seguridad.$mkd$, $mkd$Esboza la gráfica de $f(x)=x^3-3x$ siguiendo el procedimiento.

1. Dominio: $\mathbb{R}$ (polinómica).
2. Corte con los ejes: $f(0)=0$; $f(x)=0 \Rightarrow x(x^2-3)=0 \Rightarrow x=0,\pm\sqrt3$.
3. No tiene asíntotas (es un polinomio).
4. Como vimos antes, crece hasta $x=-1$ (máximo en $(-1,2)$), decrece hasta $x=1$ (mínimo en $(1,-2)$) y vuelve a crecer.
5. $f''(x)=6x$, se anula en $x=0$: cóncava hacia abajo para $x<0$ y hacia arriba para $x>0$ — punto de inflexión en $(0,0)$.

Con estos datos, la curva sube desde la izquierda, alcanza un máximo en $(-1,2)$, baja pasando por el origen (inflexión) hasta un mínimo en $(1,-2)$, y vuelve a subir.$mkd$, $mkd$Aplica el mismo procedimiento (dominio, cortes, extremos y curvatura) a $f(x)=-x^3+3x$.$mkd$, NULL, '27004f8f-1944-4186-a16f-d4e051bcafbd'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 21, 'Funciones de Coste, Ingreso y Beneficio', $mkd$En economía se modelan tres funciones básicas de una empresa: el **coste total** $C(x)$ (suma de costes fijos y costes variables por unidad producida), el **ingreso** $I(x)$ (precio de venta por cantidad vendida), y el **beneficio** $B(x)=I(x)-C(x)$.

El **punto de equilibrio** (o umbral de rentabilidad) es la cantidad $x$ para la que $B(x)=0$, es decir, donde el ingreso iguala al coste.$mkd$, $mkd$Una empresa tiene costes fijos de 800€ y un coste variable de 40€ por unidad. Vende cada unidad a 60€. Halla $B(x)$ y el punto de equilibrio.

1. $C(x)=800+40x$
2. $I(x)=60x$
3. $B(x)=I(x)-C(x)=60x-800-40x=20x-800$
4. Punto de equilibrio: $20x-800=0 \Rightarrow x=40$ unidades.$mkd$, $mkd$Una empresa tiene costes fijos de 600€ y coste variable de 25€ por unidad, y vende cada unidad a 45€. Halla $B(x)$ y el punto de equilibrio.$mkd$, NULL, 'bdde80cd-3b4d-4e7a-b49c-621e94375011'::uuid, 'draft'),
  ('matematicas_ccss', 'Análisis', 'analisis', 22, 'Optimización Económica: Máximo Beneficio y Mínimo Coste', $mkd$Cuando la función de beneficio (o de coste) no es lineal, se puede hallar su óptimo con derivadas: se buscan los puntos donde la derivada se anula, y se comprueba con la segunda derivada si es un máximo ($f''<0$) o un mínimo ($f''>0$).$mkd$, $mkd$El beneficio de una empresa viene dado por $B(x)=-x^2+60x-500$. Halla el nivel de producción que maximiza el beneficio y calcúlalo.

1. $B'(x)=-2x+60$. Igualamos a 0: $-2x+60=0 \Rightarrow x=30$.
2. $B''(x)=-2<0$, así que $x=30$ es un **máximo**.
3. $B(30)=-900+1800-500=400$.

El beneficio máximo es de 400€, con una producción de 30 unidades.$mkd$, $mkd$El coste de una empresa viene dado por $C(x)=x^2-40x+700$. Halla el nivel de producción que minimiza el coste y calcula ese coste mínimo.$mkd$, NULL, 'f0dbdef2-d996-40dd-883e-04611cd077db'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 23, 'Experimentos Aleatorios y Espacio Muestral', $mkd$Un **experimento aleatorio** es aquel cuyo resultado no se puede predecir con certeza, aunque se repita en las mismas condiciones. El **espacio muestral** $\Omega$ es el conjunto de todos los resultados posibles. Un **suceso** es cualquier subconjunto de $\Omega$: es **elemental** si tiene un solo resultado, y **compuesto** si tiene varios.$mkd$, $mkd$Se lanzan dos dados. Describe el espacio muestral y el suceso $A$="la suma de las caras es 7".

El espacio muestral $\Omega$ tiene $6\times6=36$ resultados posibles (pares ordenados). El suceso $A$ está formado por los pares cuya suma es 7:

$$A=\{(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)\}$$

$A$ tiene 6 resultados favorables de los 36 posibles.$mkd$, $mkd$Se lanzan dos monedas. Describe el espacio muestral y el suceso "sale al menos una cara".$mkd$, NULL, 'e904f40d-9f34-4ada-8beb-a05cc20e19c4'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 24, 'Álgebra de Sucesos', $mkd$Con los sucesos se pueden hacer operaciones: la **unión** $A\cup B$ ocurre si sucede $A$, $B$, o ambos; la **intersección** $A\cap B$ ocurre si suceden los dos a la vez; y el **suceso contrario** $\overline{A}$ ocurre cuando no ocurre $A$, con $P(\overline{A})=1-P(A)$. Dos sucesos son **incompatibles** si no pueden ocurrir a la vez, es decir, $A\cap B=\emptyset$.

La probabilidad de la unión sigue la regla: $P(A\cup B)=P(A)+P(B)-P(A\cap B)$.$mkd$, $mkd$Sabiendo que $P(A)=0{,}4$, $P(B)=0{,}5$ y $P(A\cap B)=0{,}2$, calcula $P(A\cup B)$ y la probabilidad de que no ocurra ninguno de los dos sucesos.

1. $P(A\cup B)=0{,}4+0{,}5-0{,}2=0{,}7$
2. "Que no ocurra ninguno" es el contrario de la unión: $P(\overline{A\cup B})=1-0{,}7=0{,}3$$mkd$, $mkd$Sabiendo que $P(C)=0{,}6$, $P(D)=0{,}3$ y $P(C\cap D)=0{,}1$, calcula $P(C\cup D)$ y $P(\overline{C}\cap\overline{D})$.$mkd$, NULL, '49e438ef-866d-4b44-9a35-81c3c88d8502'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 25, 'Asignación de Probabilidades: Regla de Laplace', $mkd$Cuando todos los resultados de un experimento son **igualmente probables**, la probabilidad de un suceso $A$ se calcula con la regla de Laplace:

$$P(A)=\dfrac{\text{casos favorables}}{\text{casos posibles}}$$$mkd$, $mkd$De una baraja española de 40 cartas se extrae una al azar. Calcula la probabilidad de que sea de oros.

Hay 10 cartas de oros de un total de 40 cartas, todas igualmente probables:

$$P(\text{oros})=\dfrac{10}{40}=\dfrac{1}{4}=0{,}25$$$mkd$, $mkd$De una urna con 5 bolas rojas, 3 azules y 2 verdes se extrae una bola al azar. Calcula la probabilidad de que sea azul.$mkd$, NULL, '6f01f262-21c0-47f1-a1d9-e0c3cfc25be2'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 26, 'Probabilidad Condicionada e Independencia', $mkd$La **probabilidad condicionada** de $A$ dado $B$ mide la probabilidad de $A$ sabiendo que $B$ ya ha ocurrido: $P(A|B)=\dfrac{P(A\cap B)}{P(B)}$.

Dos sucesos son **independientes** si el hecho de que ocurra uno no cambia la probabilidad del otro, es decir, si $P(A|B)=P(A)$ — lo que equivale a $P(A\cap B)=P(A)\cdot P(B)$.$mkd$, $mkd$Sabiendo que $P(A)=0{,}5$, $P(B)=0{,}4$ y $P(A\cap B)=0{,}2$, estudia si $A$ y $B$ son independientes.

$$P(A|B)=\dfrac{P(A\cap B)}{P(B)}=\dfrac{0{,}2}{0{,}4}=0{,}5$$

Como $P(A|B)=0{,}5=P(A)$, los sucesos **son independientes**.$mkd$, $mkd$Sabiendo que $P(C)=0{,}3$, $P(D)=0{,}6$ y $P(C\cap D)=0{,}1$, calcula $P(C|D)$ y estudia si $C$ y $D$ son independientes.$mkd$, $mkd$⚠️ **Independiente no es lo mismo que incompatible.** Si dos sucesos con probabilidad distinta de 0 son incompatibles ($A\cap B=\emptyset$), en realidad son totalmente **dependientes**: que ocurra uno hace imposible el otro. No confundas ambos conceptos.$mkd$, '3528cdea-b446-4d20-b688-2fd185b42813'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 27, 'Diagramas de Árbol y Tablas de Contingencia', $mkd$Un **diagrama de árbol** organiza experimentos que ocurren en varias etapas: cada rama muestra una probabilidad, y para calcular la probabilidad de un camino completo se **multiplican** las probabilidades de sus ramas; para sumar caminos alternativos, se **suman** sus probabilidades.

Una **tabla de contingencia** organiza dos características de una población en una tabla de doble entrada, mostrando frecuencias o probabilidades conjuntas y marginales — es especialmente útil para leer probabilidades condicionadas directamente.$mkd$, $mkd$Una urna tiene 10 piezas, 2 defectuosas. Se extraen 2 piezas sin reemplazamiento. Calcula la probabilidad de que ambas sean defectuosas.

Con el diagrama de árbol: la primera extracción tiene probabilidad $\frac{2}{10}$ de ser defectuosa; si lo es, quedan 1 defectuosa de 9 piezas para la segunda extracción, con probabilidad $\frac{1}{9}$.

$$P(\text{ambas defectuosas})=\dfrac{2}{10}\cdot\dfrac{1}{9}=\dfrac{2}{90}=\dfrac{1}{45}$$$mkd$, $mkd$En una empresa, el 60% de la plantilla son hombres y el 40% mujeres. El 10% de los hombres y el 20% de las mujeres usan transporte público. Construye el árbol y calcula la probabilidad de que una persona elegida al azar sea mujer y use transporte público.$mkd$, NULL, '4a1d7d71-d4b3-4d2f-ad82-825e9a7d468e'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 28, 'Teorema de la Probabilidad Total', $mkd$Si $B_1, B_2, \ldots, B_n$ forman una **partición** del espacio muestral (son disjuntos entre sí y cubren todos los casos posibles), la probabilidad de cualquier suceso $A$ se puede calcular sumando sus probabilidades a través de cada uno de ellos:

$$P(A)=\sum_{i} P(B_i)\cdot P(A|B_i)$$$mkd$, $mkd$Siguiendo el ejemplo anterior (60% hombres, 10% usan transporte; 40% mujeres, 20% usan transporte), calcula la probabilidad de que una persona elegida al azar use transporte público.

$$P(\text{transporte})=P(\text{hombre})\cdot P(\text{transporte}|\text{hombre})+P(\text{mujer})\cdot P(\text{transporte}|\text{mujer})$$

$$P(\text{transporte})=0{,}6\cdot0{,}1+0{,}4\cdot0{,}2=0{,}06+0{,}08=0{,}14$$$mkd$, $mkd$Una fábrica tiene tres máquinas que producen el 50%, 30% y 20% del total, con tasas de defecto del 2%, 3% y 5% respectivamente. Calcula la probabilidad de que una pieza elegida al azar sea defectuosa.$mkd$, NULL, '53ba042d-04e7-4d30-9e13-b12f0d75c0f7'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 29, 'Teorema de Bayes', $mkd$El **teorema de Bayes** permite "dar la vuelta" a una probabilidad condicionada: si conocemos $P(A|B_i)$ para cada elemento de una partición, podemos calcular $P(B_i|A)$ — es decir, revisar la probabilidad de una causa a partir de un efecto observado:

$$P(B_i|A)=\dfrac{P(B_i)\cdot P(A|B_i)}{P(A)}$$

donde el denominador $P(A)$ se calcula con el teorema de la probabilidad total.$mkd$, $mkd$Siguiendo el ejemplo del transporte ($P(\text{transporte})=0{,}14$), si una persona elegida al azar usa transporte público, calcula la probabilidad de que sea mujer.

$$P(\text{mujer}|\text{transporte})=\dfrac{P(\text{mujer})\cdot P(\text{transporte}|\text{mujer})}{P(\text{transporte})}=\dfrac{0{,}4\cdot0{,}2}{0{,}14}=\dfrac{0{,}08}{0{,}14}\approx0{,}571$$$mkd$, $mkd$Con los datos del ejercicio de la fábrica (máquinas al 50%, 30%, 20%, con defectos del 2%, 3%, 5%, y $P(\text{defectuosa})=0{,}029$), calcula la probabilidad de que una pieza defectuosa proceda de la primera máquina.$mkd$, $mkd$⚠️ **El denominador es la parte que más se olvida.** Para aplicar Bayes necesitas $P(A)$ completo (probabilidad total, sumando por todas las causas), no solo $P(B_i)$ o $P(A|B_i)$ por separado.$mkd$, '57e2cfee-b3cc-4443-bd6b-bd2331cccb2f'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 30, 'Distribución Binomial', $mkd$Una prueba de **Bernoulli** tiene solo dos resultados posibles (éxito o fracaso), con probabilidad de éxito $p$. Si se repite $n$ veces de forma independiente, el número de éxitos $X$ sigue una **distribución binomial** $X\sim B(n,p)$, con:

$$P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}$$

La media es $\mu=n\cdot p$ y la varianza $\sigma^2=n\cdot p\cdot(1-p)$.$mkd$, $mkd$Sea $X\sim B(5,\,0{,}3)$. Calcula $P(X=2)$ y la media de $X$.

$$P(X=2)=\binom{5}{2}(0{,}3)^2(0{,}7)^3=10\cdot0{,}09\cdot0{,}343=0{,}3087$$

$$\mu=n\cdot p=5\cdot0{,}3=1{,}5$$$mkd$, $mkd$Sea $X\sim B(4,\,0{,}25)$. Calcula $P(X=1)$.$mkd$, NULL, '8f8c72a5-0d4e-4b1d-857d-a1ad22b9ad36'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 31, 'Distribución Normal y Tipificación', $mkd$La **distribución normal** $N(\mu,\sigma)$ describe muchos fenómenos continuos mediante su característica curva de campana. Para calcular probabilidades se **tipifica**, transformando la variable $X$ en la variable estándar $Z=\dfrac{X-\mu}{\sigma}$, que sigue $N(0,1)$, y se consulta en la tabla de la normal estándar.$mkd$, $mkd$Sea $X\sim N(70,\,10)$. Calcula $P(X<85)$.

$$Z=\dfrac{85-70}{10}=1{,}5$$

Buscando en la tabla de la normal estándar: $P(Z<1{,}5)=0{,}9332$, así que $P(X<85)=0{,}9332$.$mkd$, $mkd$Sea $X\sim N(50,\,8)$. Calcula $P(X<58)$ tipificando y consultando la tabla.$mkd$, NULL, 'b6695a5a-00af-4aa2-b17e-edbad1e13642'::uuid, 'draft'),
  ('matematicas_ccss', 'Probabilidad', 'probabilidad', 32, 'Aproximación de la Binomial a la Normal', $mkd$Cuando $n$ es grande, calcular probabilidades binomiales exactas es muy laborioso. Si $n\cdot p\geq5$ y $n\cdot(1-p)\geq5$, se puede aproximar $B(n,p)$ por una distribución normal $N(\mu,\sigma)$ con $\mu=n\cdot p$ y $\sigma=\sqrt{n\cdot p\cdot(1-p)}$.

Como se pasa de una variable discreta a una continua, se aplica la **corrección de continuidad**: por ejemplo, $P(X\leq k)$ se aproxima como $P(X\leq k+0{,}5)$ en la normal.$mkd$, $mkd$Sea $X\sim B(100,\,0{,}4)$. Aproxima por una normal y calcula $P(X\leq45)$.

1. $\mu=100\cdot0{,}4=40$; $\sigma=\sqrt{100\cdot0{,}4\cdot0{,}6}=\sqrt{24}\approx4{,}90$.
2. Con corrección de continuidad: $P(X\leq45)\approx P(X\leq45{,}5)$.
3. $Z=\dfrac{45{,}5-40}{4{,}90}\approx1{,}12$. Buscando en la tabla: $P(Z\leq1{,}12)\approx0{,}8686$.$mkd$, $mkd$Sea $X\sim B(80,\,0{,}25)$. Halla los parámetros de la aproximación normal y estima $P(X>25)$ aplicando la corrección de continuidad.$mkd$, $mkd$⚠️ **No olvides la corrección de continuidad.** Pasar de una variable discreta ($X$ solo toma valores enteros) a una continua sin ajustar el $\pm0{,}5$ es el error más habitual en este tipo de problemas.$mkd$, '1413a4c9-8fa2-49bb-be1b-129d11ebc4d5'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 33, 'Distribución de las Medias Muestrales', $mkd$Si se toman muestras de tamaño $n$ de una población con media $\mu$ y desviación típica $\sigma$, la media de cada muestra $\overline{X}$ es en sí misma una variable aleatoria, que sigue (o se aproxima mucho a) una distribución normal:

$$\overline{X}\sim N\!\left(\mu,\ \dfrac{\sigma}{\sqrt{n}}\right)$$

A $\dfrac{\sigma}{\sqrt{n}}$ se le llama **error típico** de la media.$mkd$, $mkd$La desviación típica de una población es $\sigma=12$. Para muestras de tamaño $n=36$ con $\mu=80$, calcula $P(\overline{X}>82)$.

1. Error típico: $\dfrac{12}{\sqrt{36}}=\dfrac{12}{6}=2$.
2. $Z=\dfrac{82-80}{2}=1$.
3. $P(\overline{X}>82)=1-P(Z\leq1)=1-0{,}8413=0{,}1587$.$mkd$, $mkd$Con $\sigma=20$ y $n=100$, calcula el error típico de la media y, si $\mu=150$, calcula $P(147<\overline{X}<153)$.$mkd$, NULL, 'c91bfa00-eb22-4add-a5ab-34227a375da4'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 34, 'Distribución de las Proporciones Muestrales', $mkd$Si $p$ es la proporción real de una población, la proporción observada $\hat{p}$ en una muestra de tamaño $n$ se aproxima, para $n$ grande, a una distribución normal:

$$\hat{p}\sim N\!\left(p,\ \sqrt{\dfrac{p(1-p)}{n}}\right)$$$mkd$, $mkd$Sea $p=0{,}3$ y $n=150$. Calcula $P(\hat{p}>0{,}35)$.

1. $\sigma_{\hat{p}}=\sqrt{\dfrac{0{,}3\cdot0{,}7}{150}}=\sqrt{0{,}0014}\approx0{,}0374$.
2. $Z=\dfrac{0{,}35-0{,}3}{0{,}0374}\approx1{,}34$.
3. $P(\hat{p}>0{,}35)=1-P(Z\leq1{,}34)\approx1-0{,}9099=0{,}0901$.$mkd$, $mkd$Sea $p=0{,}6$ y $n=200$. Calcula $\sigma_{\hat{p}}$ y estima $P(\hat{p}<0{,}55)$.$mkd$, NULL, 'f9e4a4de-773d-4e7a-8e8c-9bcb1bc3ffb2'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 35, 'Intervalo de Confianza para la Media', $mkd$Un **intervalo de confianza** para la media poblacional, a partir de una media muestral $\overline{X}$ (con $\sigma$ conocida), se calcula como:

$$\left(\overline{X}-z_{\alpha/2}\cdot\dfrac{\sigma}{\sqrt{n}},\ \ \overline{X}+z_{\alpha/2}\cdot\dfrac{\sigma}{\sqrt{n}}\right)$$

El valor $z_{\alpha/2}$ depende del nivel de confianza: 1,645 para el 90%, 1,96 para el 95%, y 2,575 para el 99%. Al término $z_{\alpha/2}\cdot\frac{\sigma}{\sqrt{n}}$ se le llama **margen de error**.$mkd$, $mkd$Una muestra de $n=64$ da $\overline{X}=50$, con $\sigma=8$. Calcula el intervalo de confianza al 95%.

1. $z_{\alpha/2}=1{,}96$.
2. Margen de error: $1{,}96\cdot\dfrac{8}{\sqrt{64}}=1{,}96\cdot1=1{,}96$.
3. Intervalo: $(50-1{,}96,\ 50+1{,}96)=(48{,}04,\ 51{,}96)$.$mkd$, $mkd$Una muestra de $n=36$ da $\overline{X}=100$, con $\sigma=15$. Calcula el intervalo de confianza al 90%.$mkd$, NULL, '2b017a98-d109-4dc2-ba18-4dcc8391877c'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 36, 'Intervalo de Confianza para la Proporción', $mkd$El intervalo de confianza para una proporción poblacional, a partir de una proporción muestral $\hat{p}$, se calcula de forma análoga al de la media:

$$\left(\hat{p}-z_{\alpha/2}\cdot\sqrt{\dfrac{\hat{p}(1-\hat{p})}{n}},\ \ \hat{p}+z_{\alpha/2}\cdot\sqrt{\dfrac{\hat{p}(1-\hat{p})}{n}}\right)$$$mkd$, $mkd$Una muestra de $n=100$ personas da $\hat{p}=0{,}4$. Calcula el intervalo de confianza al 95%.

1. Margen de error: $1{,}96\cdot\sqrt{\dfrac{0{,}4\cdot0{,}6}{100}}=1{,}96\cdot\sqrt{0{,}0024}\approx1{,}96\cdot0{,}049\approx0{,}096$.
2. Intervalo: $(0{,}4-0{,}096,\ 0{,}4+0{,}096)=(0{,}304,\ 0{,}496)$.$mkd$, $mkd$Una muestra de $n=200$ da $\hat{p}=0{,}25$. Calcula el intervalo de confianza al 90%.$mkd$, NULL, 'd4c6c356-142c-4fd6-b3d9-86281f9aa3d5'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 37, 'Determinación del Tamaño Muestral', $mkd$Si se fija de antemano el **error máximo admisible** $E$ y el nivel de confianza, se puede calcular el tamaño de muestra $n$ necesario despejando de la fórmula del margen de error:

Para la media: $n=\left(\dfrac{z_{\alpha/2}\cdot\sigma}{E}\right)^2$. Para una proporción (usando $p=0{,}5$ si no se conoce, por ser el caso más desfavorable): $n=\dfrac{z_{\alpha/2}^2\cdot p(1-p)}{E^2}$.

El resultado siempre se redondea **hacia arriba**, para garantizar que el error no supere el valor fijado.$mkd$, $mkd$Se quiere estimar una media con $\sigma=10$, un error máximo $E=2$ y un 95% de confianza. Calcula el tamaño de muestra necesario.

$$n=\left(\dfrac{1{,}96\cdot10}{2}\right)^2=(9{,}8)^2=96{,}04$$

Se redondea hacia arriba: $n=97$.$mkd$, $mkd$Se quiere estimar una proporción con un error máximo $E=0{,}04$, al 95% de confianza y sin información previa (usa $p=0{,}5$). Calcula el tamaño de muestra necesario.$mkd$, NULL, '24481e4c-b64f-4732-9f56-0aef8f948645'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 38, 'Contraste de Hipótesis para la Media', $mkd$Un **contraste de hipótesis** plantea una hipótesis nula $H_0:\mu=\mu_0$ frente a una alternativa $H_1:\mu\neq\mu_0$. Se calcula el estadístico de contraste:

$$Z=\dfrac{\overline{X}-\mu_0}{\sigma/\sqrt{n}}$$

y se compara con el valor crítico $z_{\alpha/2}$ del nivel de significación elegido: si $|Z|>z_{\alpha/2}$, se **rechaza** $H_0$; si no, no hay evidencia suficiente para rechazarla.$mkd$, $mkd$Se quiere contrastar $H_0:\mu=50$ frente a $H_1:\mu\neq50$, con una muestra $\overline{X}=53$, $\sigma=9$, $n=36$, y $\alpha=0{,}05$ ($z_{\alpha/2}=1{,}96$).

$$Z=\dfrac{53-50}{9/\sqrt{36}}=\dfrac{3}{1{,}5}=2$$

Como $|Z|=2>1{,}96$, se **rechaza** $H_0$: hay evidencia de que la media es distinta de 50.$mkd$, $mkd$Contrasta $H_0:\mu=100$ frente a $H_1:\mu\neq100$, con $\overline{X}=104$, $\sigma=12$, $n=36$ y $\alpha=0{,}05$.$mkd$, NULL, '3c286727-291d-4634-b0a4-40bc4b1f6bc1'::uuid, 'draft'),
  ('matematicas_ccss', 'Inferencia', 'inferencia', 39, 'Contraste de Hipótesis para la Proporción', $mkd$Igual que con la media, se puede contrastar una hipótesis sobre una proporción $H_0:p=p_0$ frente a $H_1:p\neq p_0$, calculando:

$$Z=\dfrac{\hat{p}-p_0}{\sqrt{p_0(1-p_0)/n}}$$

y comparando con $z_{\alpha/2}$ del mismo modo que en el contraste para la media.$mkd$, $mkd$Contrasta $H_0:p=0{,}5$ frente a $H_1:p\neq0{,}5$, con $\hat{p}=0{,}58$, $n=100$ y $\alpha=0{,}05$ ($z_{\alpha/2}=1{,}96$).

$$Z=\dfrac{0{,}58-0{,}5}{\sqrt{0{,}5\cdot0{,}5/100}}=\dfrac{0{,}08}{0{,}05}=1{,}6$$

Como $|Z|=1{,}6<1{,}96$, **no se rechaza** $H_0$: no hay evidencia suficiente de que la proporción sea distinta de 0,5.$mkd$, $mkd$Contrasta $H_0:p=0{,}3$ frente a $H_1:p\neq0{,}3$, con $\hat{p}=0{,}37$, $n=150$ y $\alpha=0{,}05$.$mkd$, NULL, '89d13d47-95e2-4e71-b281-ca45f4a5dc08'::uuid, 'draft');
