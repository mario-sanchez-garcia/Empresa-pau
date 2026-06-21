-- Seed: curriculum_flashcards — Matemáticas II · 60 tarjetas editoriales Pausia
-- Generado desde la tabla real de Supabase (project: xgpzedqdlebtruuuommj).
-- Ordenado por sort_order. Safe ante duplicados via ON CONFLICT.

insert into public.curriculum_flashcards
  (subject, region, chapter_number, chapter_title, block_key,
   order_label, sort_order, title, concept_latex,
   alert_title, alert_latex, worked_case_title, worked_case_latex)
values
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '1', 1, 'Dimensión de una Matriz',
   'Indica el tamaño de la tabla mediante el número de filas ($m$) y columnas ($n$), escrito como $m \times n$.',
   NULL, NULL, NULL,
   'Dada la matriz $A = \begin{pmatrix} 2 & -1 & 4 \\ 0 & 5 & -3 \end{pmatrix}$:

- Tiene **2 filas** y **3 columnas** $\rightarrow$ Su dimensión es $2 \times 3$.
- Identificar elementos: $a_{13} = 4$ (fila 1, col 3) y $a_{22} = 5$ (fila 2, col 2).'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '2', 2, 'Suma y Resta de Matrices',
   'Solo se pueden sumar o restar matrices que tengan exactamente la **misma dimensión**. La operación se realiza elemento a elemento en la misma posición.',
   NULL, NULL, NULL,
   'Sean $A = \begin{pmatrix} 1 & 3 \\ -2 & 4 \end{pmatrix}$ y $B = \begin{pmatrix} 5 & 0 \\ 2 & -1 \end{pmatrix}$:

- **Suma:** $A + B = \begin{pmatrix} 1+5 & 3+0 \\ -2+2 & 4+(-1) \end{pmatrix} = \begin{pmatrix} 6 & 3 \\ 0 & 3 \end{pmatrix}$
- **Resta:** $A - B = \begin{pmatrix} 1-5 & 3-0 \\ -2-2 & 4-(-1) \end{pmatrix} = \begin{pmatrix} -4 & 3 \\ -4 & 5 \end{pmatrix}$'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '3', 3, 'Producto por un Escalar (Número $\cdot$ Matriz)',
   'Multiplicar un número real $k$ por una matriz consiste en multiplicar **todos y cada uno** de los elementos de la matriz por ese número.',
   NULL, NULL, NULL,
   'Dado el número $k = -2$ y la matriz $A = \begin{pmatrix} 3 & -1 \\ 0 & 4 \end{pmatrix}$:

$$
-2 \cdot A = \begin{pmatrix} -2 \cdot 3 & -2 \cdot (-1) \\ -2 \cdot 0 & -2 \cdot 4 \end{pmatrix} = \begin{pmatrix} -6 & 2 \\ 0 & -8 \end{pmatrix}
$$'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '4', 4, 'Multiplicación de Matrices ($A \cdot B$)',
   'Solo es posible si el **número de columnas de $A$** es igual al **número de filas de $B$**. Se calcula multiplicando las filas de la primera por las columnas de la segunda.',
   '¡IMPORTANTE!', 'El producto **no es conmutativo**: $A \cdot B \neq B \cdot A$. ¡Respeta siempre el orden!', NULL,
   'Multiplicar $A_{2 \times 3} = \begin{pmatrix} 1 & 2 & 0 \\ 3 & -1 & 4 \end{pmatrix}$ por $B_{3 \times 2} = \begin{pmatrix} 2 & 1 \\ 0 & 3 \\ -1 & 5 \end{pmatrix}$ (El resultado será $2 \times 2$):

$$
A \cdot B = \begin{pmatrix} (1 \cdot 2 + 2 \cdot 0 + 0 \cdot (-1)) & (1 \cdot 1 + 2 \cdot 3 + 0 \cdot 5) \\ (3 \cdot 2 + (-1) \cdot 0 + 4 \cdot (-1)) & (3 \cdot 1 + (-1) \cdot 3 + 4 \cdot 5) \end{pmatrix}
$$

$$
A \cdot B = \begin{pmatrix} 2 + 0 + 0 & 1 + 6 + 0 \\ 6 + 0 - 4 & 3 - 3 + 20 \end{pmatrix} = \begin{pmatrix} 2 & 7 \\ 2 & 20 \end{pmatrix}
$$'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '6b', 5, 'Propiedades de la Matriz Traspuesta ($A^t$)',
   'La traspuesta consiste en cambiar filas por columnas. Cuando se combina con otras operaciones, sigue estas reglas fijas:

1. Múltiple traspuesta: $(A^t)^t = A$ (vuelve a la original).
2. Con la suma: $(A + B)^t = A^t + B^t$
3. Con un número: $(k \cdot A)^t = k \cdot A^t$
4. **¡Peligro con el producto!** $(A \cdot B)^t = B^t \cdot A^t$ (el orden de las matrices **se invierte**).',
   NULL, NULL, 'Caso Práctico: Desarrollar Expresiones con Traspuestas',
   'Simplifica la expresión $(2A + B^t)^t$:

$$
(2A + B^t)^t = (2A)^t + (B^t)^t = 2A^t + B
$$'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '5', 6, 'Potencias de Matrices ($A^n$)',
   'Para hallar potencias elevadas, calcula $A^2$, $A^3$ y busca la regla o patrón numérico que se va repitiendo.',
   NULL, NULL, NULL,
   'Calcula $A^n$ para $A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix}$:

- $A^2 = A \cdot A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix}$
- $A^3 = A^2 \cdot A = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 9 \\ 0 & 1 \end{pmatrix}$

**Patrón detectado:** El elemento superior derecho es $3 \cdot n$. Por tanto: $A^n = \begin{pmatrix} 1 & 3n \\ 0 & 1 \end{pmatrix}$.'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '6', 7, 'Rango de una Matriz (Método de Gauss)',
   'El rango es el número de filas independientes. Usamos el método de Gauss haciendo operaciones entre filas para conseguir que los elementos por debajo de la diagonal principal sean **ceros** (escalonar). El rango es el número de filas finales que no sean por completo ceros.',
   NULL, NULL, NULL,
   'Calcular el rango de $A = \begin{pmatrix} 1 & -2 & 3 \\ 2 & -4 & 7 \\ 3 & -6 & 10 \end{pmatrix}$ mediante Gauss:

1. Hacemos ceros en la primera columna debajo del $1$.
    
- Fila 2: $F_2 \rightarrow F_2 - 2F_1 \quad \rightarrow \begin{pmatrix} 0 & 0 & 1 \end{pmatrix}$
- Fila 3: $F_3 \rightarrow F_3 - 3F_1 \quad \rightarrow \begin{pmatrix} 0 & 0 & 1 \end{pmatrix}$

    La matriz va quedando: $\begin{pmatrix} 1 & -2 & 3 \\ 0 & 0 & 1 \\ 0 & 0 & 1 \end{pmatrix}$.
2. Hacemos cero en la tercera fila usando la segunda: $F_3 \rightarrow F_3 - F_2$:
    
$$
\begin{pmatrix} 1 & -2 & 3 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \end{pmatrix}
$$

Al escalonar, nos quedan **2 filas no nulas**. Por lo tanto, el **Rango($A$) = 2**.'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '7', 8, 'Matriz Inversa por Gauss-Jordan',
   'Para hallar $A^{-1}$, se monta la matriz conjunta con la identidad $(A \mid I)$ y se aplican operaciones de filas hasta lograr que la identidad pase al lado izquierdo: $(I \mid A^{-1})$.',
   NULL, NULL, NULL,
   'Calcular la inversa de $A = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$:

1. Planteamos la matriz inicial: $\left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 3 & 7 & 0 & 1 \end{array}\right)$
2. Hacemos un cero abajo a la izquierda con $F_2 \rightarrow F_2 - 3F_1$: $\left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 0 & 1 & -3 & 1 \end{array}\right)$
3. Hacemos cero arriba en el centro con $F_1 \rightarrow F_1 - 2F_2$: $\left(\begin{array}{cc|cc} 1 & 0 & 7 & -2 \\ 0 & 1 & -3 & 1 \end{array}\right)$

¡Ya tenemos la identidad a la izquierda! La matriz inversa resultante es: $A^{-1} = \begin{pmatrix} 7 & -2 \\ -3 & 1 \end{pmatrix}$.'),
  ('mates', 'ambas', 1, 'Matrices', 'Álgebra',
   '8', 9, 'Despejar en Ecuaciones Matriciales',
   'Para despejar la incógnita $X$, multiplicamos por la inversa del elemento que le estorbe, manteniendo estrictamente el mismo lado en el que se añade.',
   NULL, NULL, NULL,
   'Resuelve y despeja $X$ en la ecuación $A \cdot X + B = C$:

1. Primero restamos $B$ en ambos lados: $A \cdot X = C - B$
2. Como la matriz $A$ multiplica a la **izquierda** de la $X$, multiplicamos por $A^{-1}$ por la **izquierda** en el otro lado de la igualdad:
    
$$
X = A^{-1} \cdot (C - B)
$$'),
  ('mates', 'ambas', 2, 'Determinantes', 'Álgebra',
   '9', 10, 'Determinantes de Orden 2 y 3 (Regla de Sarrus)',
   'Un determinante es un número real asociado a una matriz cuadrada.

- **Orden $2 \times 2$:** Se multiplica la diagonal principal menos la diagonal secundaria.
- **Orden $3 \times 3$ (Sarrus):** Se suman los productos de la diagonal principal y sus paralelas, y se restan los productos de la diagonal secundaria y sus paralelas.',
   NULL, NULL, 'Caso Práctico: Sarrus de Orden 3',
   'Calcular el determinante de $A = \begin{pmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 2 & 0 & -1 \end{pmatrix}$:

$$
|A| = \begin{vmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 2 & 0 & -1 \end{vmatrix}
$$

- **Términos positivos (+):** $(1 \cdot 1 \cdot (-1)) + (0 \cdot 0 \cdot 3) + (2 \cdot 2 \cdot 4) = -1 + 0 + 16 = 15$
- **Términos negativos (-):** $(3 \cdot 1 \cdot 2) + (4 \cdot 0 \cdot 1) + (-1 \cdot 2 \cdot 0) = 6 + 0 + 0 = 6$

$$
|A| = 15 - 6 = 9
$$'),
  ('mates', 'ambas', 2, 'Determinantes', 'Álgebra',
   '10', 11, 'Propiedades Críticas de los Determinantes',
   'Trucos rápidos que ahorran tiempo en el examen:

1. Si una matriz tiene una **fila o columna de ceros**, su determinante es $0$.
2. Si tiene **dos filas o columnas iguales o proporcionales**, su determinante es $0$.
3. El determinante de la traspuesta es igual al de la original: $|A^t| = |A|$.
4. El determinante de un producto es el producto de determinantes: $|A \cdot B| = |A| \cdot |B|$.
5. El determinante de la inversa es el inverso del determinante: $|A^{-1}| = \frac{1}{|A|}$.',
   NULL, NULL, 'Caso Práctico: Aplicación de Propiedades',
   'Sabiendo que $A$ es una matriz $3 \times 3$ con $|A| = 5$, calcula sin desarrollar:

- **$|A^{-1}|$:** Aplicando la propiedad, $|A^{-1}| = \frac{1}{|A|} = \frac{1}{5}$.
- **$|A \cdot A^t|$:** Aplicando las propiedades, $|A \cdot A^t| = |A| \cdot |A^t| = |A| \cdot |A| = 5 \cdot 5 = 25$.'),
  ('mates', 'ambas', 2, 'Determinantes', 'Álgebra',
   '10b', 12, 'Determinante de Matrices Triangulares (Hacer Ceros)',
   'Si logras que una matriz sea **triangular** (haciendo ceros por debajo de la diagonal mediante el método de Gauss), su determinante es simplemente **multiplicar los números de la diagonal principal**.

**Regla de oro al hacer Gauss en determinantes:**

- Si a una fila le sumas o restas otra fila multiplicada por un número, el determinante **NO cambia**.
- Si intercambias dos filas de posición, el determinante **cambia de signo** (se le pone un menos delante).',
   NULL, NULL, 'Caso Práctico: Determinante por Gauss',
   'Calcular el determinante de $A = \begin{pmatrix} 1 & 3 \\ 2 & 7 \end{pmatrix}$ haciendo ceros:

1. Hacemos un cero en la segunda fila mediante $F_2 \rightarrow F_2 - 2F_1$. El valor del determinante no varía:
    
$$
|A| = \begin{vmatrix} 1 & 3 \\ 2 & 7 \end{vmatrix} = \begin{vmatrix} 1 & 3 \\ 0 & 1 \end{vmatrix}
$$
2. Al ser ya una matriz triangular, multiplicamos su diagonal principal:
    
$$
|A| = 1 \cdot 1 = 1
$$'),
  ('mates', 'ambas', 2, 'Determinantes', 'Álgebra',
   '11', 13, 'Cálculo de la Inversa por Adjuntos',
   'Es el método alternativo a Gauss-Jordan, ideal para matrices $3 \times 3$. La fórmula es:

$$
A^{-1} = \frac{1}{|A|} \cdot (\text{Adj}(A))^t
$$
*¡Cuidado!* Cada elemento del adjunto lleva un signo $(-1)^{i+j}$ que cambia los signos en forma de tablero de ajedrez: $\begin{pmatrix} + & - & + \\ - & + & - \\ + & - & + \end{pmatrix}$.',
   NULL, NULL, 'Caso Práctico: Inversa por Adjuntos',
   'Calcular la inversa de $A = \begin{pmatrix} 1 & 2 \\ 3 & 8 \end{pmatrix}$:

1. **Determinante:** $|A| = (1 \cdot 8) - (2 \cdot 3) = 8 - 6 = 2$. (Como es $\neq 0$, tiene inversa).
2. **Matriz Adjunta:** $\text{Adj}(A) = \begin{pmatrix} 8 & -3 \\ -2 & 1 \end{pmatrix}$
3. **Traspuesta de la Adjunta:** $(\text{Adj}(A))^t = \begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix}$
4. **Dividir entre el determinante ($|A|=2$):**
    
$$
A^{-1} = \frac{1}{2} \begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix} = \begin{pmatrix} 4 & -1 \\ -1.5 & 0.5 \end{pmatrix}
$$'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '12', 14, 'Expresión Matricial de un Sistema',
   'Cualquier sistema de ecuaciones lineales se puede escribir de forma compacta como:

$$
A \cdot X = B
$$
Donde **$A$** es la matriz de coeficientes, **$X$** es el vector de incógnitas $\begin{pmatrix} x \\ y \\ z \end{pmatrix}$ y **$B$** es el vector de términos independientes. La matriz ampliada se denota como **$A^*$** o **$(A|B)$**.',
   NULL, NULL, 'Caso Práctico: Convertir a Matriz',
   'Dado el sistema: $\begin{cases} x + 2y - z = 3 \\ 3x - y = 1 \end{cases}$ su escritura matricial es:

$$
\underbrace{\begin{pmatrix} 1 & 2 & -1 \\ 3 & -1 & 0 \end{pmatrix}}_{A} \cdot \underbrace{\begin{pmatrix} x \\ y \\ z \end{pmatrix}}_{X} = \underbrace{\begin{pmatrix} 3 \\ 1 \end{pmatrix}}_{B} \quad \rightarrow \quad A^* = \left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 3 & -1 & 0 & 1 \end{array}\right)
$$'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '13', 15, 'Teorema de Rouché-Frobenius (Discusión)',
   'Sirve para saber cuántas soluciones tiene un sistema calculando el rango de la matriz normal ($A$) y de la ampliada ($A^*$):

- **Rango($A$) $\neq$ Rango($A^*$)** $\longrightarrow$ **Sistema Incompatible (SI):** No tiene solución.
- **Rango($A$) $=$ Rango($A^*$) $=$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Determinado (SCD):** Solución única.
- **Rango($A$) $=$ Rango($A^*$) $<$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Indeterminado (SCI):** Infinitas soluciones.',
   NULL, NULL, 'Caso Práctico: Discusión de un Sistema',
   'Discutir el sistema cuya matriz ampliada escalonada es $A^* = \left(\begin{array}{cc|c} 1 & 2 & 5 \\ 0 & 0 & 3 \end{array}\right)$ con incógnitas $x, y$:

- Mirando solo la izquierda de la barra: **Rango($A$) = 1**.
- Mirando la matriz completa: **Rango($A^*$) = 2**.
- Como **Rango($A$) $\neq$ Rango($A^*$)** ($1 \neq 2$), el sistema es **Incompatible (SI)**.'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '13b', 16, 'Sistemas Homogéneos',
   'Un sistema es **homogéneo** cuando todos sus términos independientes son cero ($A \cdot X = \mathbf{0}$).

- **¡Ventaja!:** Siempre son **Compatibles** (siempre tienen solución).
- **Solución Trivial:** Siempre admiten la solución $x=0, y=0, z=0$.
- Si es **SCD** (Rango = nº incógnitas) $\rightarrow$ Solo tiene la solución trivial $(0,0,0)$.
- Si es **SCI** (Rango < nº incógnitas) $\rightarrow$ Tiene infinitas soluciones además de la $(0,0,0)$.',
   NULL, NULL, 'Caso Práctico: Sistema Homogéneo',
   'Discute el siguiente sistema sin resolverlo: $\begin{cases} x + 2y = 0 \\ 3x + 6y = 0 \end{cases}$

1. Escribimos su matriz de coeficientes: $A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}$.
2. Calculamos su determinante: $|A| = (1 \cdot 6) - (2 \cdot 3) = 6 - 6 = 0$.
3. Como el determinante da 0, el Rango($A$) no es 2: **Rango($A$) = 1**.
4. Al ser menor que el número de incógnitas ($1 < 2$), el sistema es **Compatible Indeterminado (SCI)**. Tiene infinitas soluciones.'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '14', 17, 'Resolución por la Regla de Cramer',
   'Válido solo para sistemas **Compatibles Determinados (SCD)** con el mismo número de ecuaciones que de incógnitas.

$$
x = \frac{|A_x|}{|A|}, \quad y = \frac{|A_y|}{|A|}, \quad z = \frac{|A_z|}{|A|}
$$
Donde $A_x$ consiste en cambiar la columna de las $x$ por la columna de términos independientes ($B$).',
   NULL, NULL, 'Caso Práctico: Método de Cramer',
   'Resolver el sistema: $\begin{cases} x + 2y = 5 \\ 3x + 7y = 17 \end{cases}$

1. **Determinante principal:** $|A| = \begin{vmatrix} 1 & 2 \\ 3 & 7 \end{vmatrix} = 7 - 6 = 1$.
2. **Calcular $|A_x|$:**
    
$$
|A_x| = \begin{vmatrix} 5 & 2 \\ 17 & 7 \end{vmatrix} = 35 - 34 = 1 \quad \rightarrow \quad x = \frac{1}{1} = 1
$$
3. **Calcular $|A_y|$:**
    
$$
|A_y| = \begin{vmatrix} 1 & 5 \\ 3 & 17 \end{vmatrix} = 17 - 15 = 2 \quad \rightarrow \quad y = \frac{2}{1} = 2
$$

**Solución única:** $x = 1, \ y = 2$.'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '14b', 18, 'El Método de Gauss: Paso a Paso',
   'El objetivo es **escalonar la matriz**: hacer un triángulo de **ceros** por debajo de la diagonal principal.

**El orden obligatorio para hacer los ceros es:**

$$
\begin{pmatrix}
\bullet & \bullet & \bullet \\
\mathbf{1^\circ} & \bullet & \bullet \\
\mathbf{2^\circ} & \mathbf{3^\circ} & \bullet
\end{pmatrix}
$$

**Paso 1:** Hacer cero el $\mathbf{1^\circ}$ (Fila 2, Columna 1) usando la **Fila 1**.
**Paso 2:** Hacer cero el $\mathbf{2^\circ}$ (Fila 3, Columna 1) usando la **Fila 1**.
**Paso 3:** Hacer cero el $\mathbf{3^\circ}$ (Fila 3, Columna 2) usando **SÓLO la Fila 2** (para no romper los ceros anteriores).

**Truco "Multiplicar Cruzado":** Si quieres hacer un cero entre dos filas, multiplica cada fila por el primer número de la otra fila.',
   NULL, NULL, 'Caso Práctico Paso a Paso',
   'Escalonar la matriz $A = \begin{pmatrix} 1 & 2 & -1 \\ 2 & 1 & 3 \\ 3 & 2 & 1 \end{pmatrix}$:

1. **Primer Cero (en el 2):** $F_2 \rightarrow F_2 - 2F_1$.
    
$$
F_2 = (2-2, 1-4, 3+2) = \mathbf{(0, -3, 5)}
$$
2. **Segundo Cero (en el 3):** $F_3 \rightarrow F_3 - 3F_1$.
    
$$
F_3 = (3-3, 2-6, 1+3) = \mathbf{(0, -4, 4)}
$$
    La matriz va quedando: $\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ 0 & -4 & 4 \end{pmatrix}$
3. **Tercer Cero (en el -4):** $F_3 \rightarrow 3F_3 - 4F_2$.
    
$$
3F_3 - 4F_2 = 3(0,-4,4) - 4(0,-3,5) = (0, -12+12, 12-20) = \mathbf{(0, 0, -8)}
$$

**Resultado final (Matriz Escalonada):**

$$
\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ 0 & 0 & -8 \end{pmatrix} \quad \longrightarrow \quad \text{Rango = 3 (hay 3 filas vivas).}
$$'),
  ('mates', 'ambas', 3, 'Sistemas de Ecuaciones', 'Álgebra',
   '14c', 19, 'Análisis de Sistemas por el Método de Gauss',
   'Para analizar y resolver cualquier sistema usando Gauss:

1. **Escribir la matriz ampliada** $(A|B)$.
2. **Hacer ceros (escalonar)** por debajo de la diagonal principal.
3. **Analizar la última fila (Discusión):**
    
- Si queda $(0 \quad 0 \quad 0 \mid \text{Número})$ $\rightarrow$ **Sistema Incompatible (SI)**.
- Si queda $(0 \quad 0 \quad 0 \mid 0)$, esa fila se elimina porque no aporta información.
4. **Resolver de abajo hacia arriba** una vez limpio y escalonado.',
   NULL, NULL, 'Caso Práctico Resuelto (Método de Gauss en Sistemas)',
   'Resuelve por el método de Gauss:

$$
\begin{cases} x + y + z = 2 \\ 2x + 3y + 5z = 11 \\ x - 5y + 6z = 29 \end{cases}
$$

1. **Matriz ampliada inicial:**
    
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 2 & 3 & 5 & 11 \\ 1 & -5 & 6 & 29 \end{array}\right)
$$
2. **Primeros ceros en la columna 1:**
    
- $F_2 \rightarrow F_2 - 2F_1 \quad \rightarrow \quad (0, 1, 3 \mid 7)$
- $F_3 \rightarrow F_3 - F_1 \quad \rightarrow \quad (0, -6, 5 \mid 27)$

    
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & -6 & 5 & 27 \end{array}\right)
$$
3. **Último cero en la columna 2:** $F_3 \rightarrow F_3 + 6F_2$
    
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & 0 & 23 & 69 \end{array}\right)
$$
4. **Resolución de abajo a arriba:**
    
- Fila 3: $23z = 69 \rightarrow \mathbf{z = 3}$
- Fila 2: $y + 9 = 7 \rightarrow \mathbf{y = -2}$
- Fila 1: $x + 1 = 2 \rightarrow \mathbf{x = 1}$

**Solución:** $x = 1, \ y = -2, \ z = 3$.'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '1', 20, 'Repaso: Puntos y Vectores en el Plano ($\mathbb{R}^2$)',
   'Un punto representa una posición en el plano. Un vector representa un desplazamiento entre dos puntos.

- **Vector entre dos puntos:** $\overrightarrow{AB} = B - A = (x_2 - x_1, \ y_2 - y_1)$
- **Punto medio:** $M = \left(\frac{x_1+x_2}{2}, \frac{y_1+y_2}{2}\right)$',
   NULL, NULL, 'Caso Práctico: Vector y Punto Medio',
   'Dados $A(-1, 4)$ y $B(3, 2)$:

- **Vector $\overrightarrow{AB}$:** $B - A = (3-(-1), \ 2-4) = \mathbf{(4, \ -2)}$
- **Punto medio $M$:** $M = \left(\frac{-1+3}{2}, \ \frac{4+2}{2}\right) = \mathbf{(1, \ 3)}$'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '2', 21, 'Vectores en el Espacio ($\mathbb{R}^3$)',
   'En el espacio tridimensional trabajamos con tres ejes perpendiculares ($X$, $Y$, $Z$). Un vector $\vec{u} = (u_1, u_2, u_3)$.

- **Módulo:** $||\vec{u}|| = \sqrt{(u_1)^2 + (u_2)^2 + (u_3)^2}$',
   NULL, NULL, 'Caso Práctico: Módulo de un Vector',
   'Calcula el módulo de $\vec{u} = (1, \ -2, \ 2)$: $||\vec{u}|| = \sqrt{1^2 + (-2)^2 + 2^2} = \sqrt{9} = \mathbf{3}$'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '3', 22, 'Operaciones Elementales con Vectores',
   '- **Suma y Resta:** $\vec{u} \pm \vec{v} = (u_1 \pm v_1, \ u_2 \pm v_2, \ u_3 \pm v_3)$
- **Producto por un número:** $k \cdot \vec{u} = (k \cdot u_1, \ k \cdot u_2, \ k \cdot u_3)$
- **Vectores paralelos:** $\frac{u_1}{v_1} = \frac{u_2}{v_2} = \frac{u_3}{v_3} = k$',
   NULL, NULL, 'Caso Práctico: Combinación Lineal',
   'Sean $\vec{u} = (2, \ 0, \ -1)$ y $\vec{v} = (1, \ 3, \ 4)$. Calcula $3\vec{u} - 2\vec{v}$:

$$
3\vec{u} - 2\vec{v} = (6, 0, -3) - (2, 6, 8) = \mathbf{(4, \ -6, \ -11)}
$$'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '4', 23, 'Dependencia Lineal y Rango de Vectores',
   '- **Linealmente Dependientes (L.D.):** Si metemos los vectores en una matriz, su determinante da **cero**.
- **Linealmente Independientes (L.I.):** Su determinante asociado es **distinto de cero**.
- **Rango del conjunto:** Número máximo de vectores L.I. que contiene.',
   NULL, NULL, 'Caso Práctico: Estudiar Independencia Lineal',
   'Estudia si $\vec{u}=(1,0,2)$, $\vec{v}=(0,1,1)$ y $\vec{w}=(1,1,3)$ son L.I. o L.D.:

1. Calculamos el determinante:
    
$$
\begin{vmatrix} 1 & 0 & 2 \\ 0 & 1 & 1 \\ 1 & 1 & 3 \end{vmatrix} = 3 - 3 = \mathbf{0}
$$
2. Como el determinante es **igual a 0**, los vectores son **Linealmente Dependientes (L.D.)**.'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '5', 24, 'Base y Sistema de Referencia en el Espacio',
   '- **Base:** Tres vectores L.I. forman una base. Cualquier otro vector se puede escribir como combinación de ellos.
- **Base Canónica:** $\vec{i}=(1,0,0)$, $\vec{j}=(0,1,0)$, $\vec{k}=(0,0,1)$.
- **Sistema de Referencia ($R$):** Punto origen $O(0,0,0)$ más una base.',
   NULL, NULL, 'Caso Práctico: Expresar en la Base Canónica',
   'Si $\vec{v} = (5, \ -3, \ 8)$, su expresión analítica en la base canónica es: $\vec{v} = 5\vec{i} - 3\vec{j} + 8\vec{k}$'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '6', 25, 'Producto Escalar de dos Vectores ($\vec{u} \cdot \vec{v}$)',
   '**¡Cuidado!:** El resultado del producto escalar es un **NÚMERO**, no un vector.

- **Fórmula analítica:** $\vec{u} \cdot \vec{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$
- **Fórmula geométrica:** $\vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\alpha)$
- **Cálculo del Ángulo:** $\cos(\alpha) = \frac{\vec{u} \cdot \vec{v}}{||\vec{u}|| \cdot ||\vec{v}||}$
- **Perpendicularidad:** $\vec{u} \perp \vec{v}$ si y solo si $\vec{u} \cdot \vec{v} = 0$',
   NULL, NULL, 'Caso Práctico: Producto Escalar y Perpendicularidad',
   'Determina si $\vec{u} = (2, \ 3, \ -1)$ y $\vec{v} = (5, \ -2, \ 4)$ son perpendiculares:

1. $\vec{u} \cdot \vec{v} = 2(5) + 3(-2) + (-1)(4) = 10 - 6 - 4 = \mathbf{0}$
2. Como el resultado es **0**, los vectores son **perpendiculares** ($\vec{u} \perp \vec{v}$).'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '7', 26, 'Producto Vectorial ($\vec{u} \times \vec{v}$)',
   '**¡Cuidado!:** El resultado del producto vectorial es un **VECTOR** perpendicular a la vez a los dos vectores originales.

- **Cómo se calcula:**
    
$$
\vec{u} \times \vec{v} = \begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \end{vmatrix}
$$
- **Área del Paralelogramo:** $||\vec{u} \times \vec{v}||$
- **Área del Triángulo:** $\frac{1}{2} ||\vec{u} \times \vec{v}||$',
   NULL, NULL, 'Caso Práctico: Calcular Producto Vectorial y Área',
   'Halla el área del triángulo determinado por $\vec{u} = (1, 2, 0)$ y $\vec{v} = (0, 3, 1)$:

1. **Cálculo de $\vec{u} \times \vec{v}$:**
    
$$
\begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ 1 & 2 & 0 \\ 0 & 3 & 1 \end{vmatrix} = 2\vec{i} + 0 + 3\vec{k} - (0 + 0 + \vec{j}) = \mathbf{(2, -1, 3)}
$$
2. **Módulo:** $||\vec{u} \times \vec{v}|| = \sqrt{4 + 1 + 9} = \sqrt{14}$
3. **Área del triángulo:** $\frac{\sqrt{14}}{2}$'),
  ('mates', 'ambas', 4, 'Vectores en el Espacio', 'Geometría',
   '8', 27, 'Producto Mixto',
   'Combina el producto escalar y el vectorial de tres vectores. El resultado es un **NÚMERO**.

- **Cómo se calcula:**
    
$$
[\vec{u}, \vec{v}, \vec{w}] = \begin{vmatrix} u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix}
$$
- **Volumen del Paralelepípedo:** $|[\vec{u}, \vec{v}, \vec{w}]|$
- **Volumen del Tetraedro:** $\frac{1}{6} |[\vec{u}, \vec{v}, \vec{w}]|$',
   NULL, NULL, 'Caso Práctico: Volumen de un Tetraedro',
   'Calcula el volumen del tetraedro con $\vec{u}=(1,1,0)$, $\vec{v}=(0,2,1)$ y $\vec{w}=(2,0,3)$:

1. **Producto Mixto:**
    
$$
[\vec{u}, \vec{v}, \vec{w}] = \begin{vmatrix} 1 & 1 & 0 \\ 0 & 2 & 1 \\ 2 & 0 & 3 \end{vmatrix} = (6+2+0) - (0+0+0) = \mathbf{8}
$$
2. **Volumen del tetraedro:** $\frac{1}{6} \cdot 8 = \frac{4}{3} \approx 1.33$'),
  ('mates', 'ambas', 5, 'Rectas y Planos en el Espacio', 'Geometría',
   '1', 28, 'La Recta en el Espacio (Ecuaciones)',
   'Una recta se define con un punto $A(x_0, y_0, z_0)$ y un vector director $\vec{v}(v_1, v_2, v_3)$:

- **Vectorial:** $(x, y, z) = (x_0, y_0, z_0) + \lambda(v_1, v_2, v_3)$
- **Paramétricas:** $\begin{cases} x = x_0 + \lambda v_1 \\ y = y_0 + \lambda v_2 \\ z = z_0 + \lambda v_3 \end{cases}$
- **Continua:** $\frac{x - x_0}{v_1} = \frac{y - y_0}{v_2} = \frac{z - z_0}{v_3}$
- **Implícitas:** Intersección de dos planos $\begin{cases} Ax + By + Cz + D = 0 \\ A''x + B''y + C''z + D'' = 0 \end{cases}$',
   NULL, NULL, 'Caso Práctico: Ecuaciones de la Recta',
   'Halla las ecuaciones de la recta por $A(1, -2, 3)$ con dirección $\vec{v}(4, 0, -1)$:

- **Continua:** $\frac{x-1}{4} = \frac{y+2}{0} = \frac{z-3}{-1}$
- **Paramétricas:** $\begin{cases} x = 1 + 4\lambda \\ y = -2 \\ z = 3 - \lambda \end{cases}$'),
  ('mates', 'ambas', 5, 'Rectas y Planos en el Espacio', 'Geometría',
   '2', 29, 'El Plano en el Espacio',
   'Un plano se define mediante un **vector normal** $\vec{n}(A, B, C)$ perpendicular a la superficie.

- **Ecuación General:** $Ax + By + Cz + D = 0$
- Si nos dan tres puntos ($A$, $B$ y $C$), calculamos $\overrightarrow{AB}$ y $\overrightarrow{AC}$:
    
$$
\begin{vmatrix} x - x_0 & y - y_0 & z - z_0 \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \end{vmatrix} = 0
$$',
   NULL, NULL, 'Caso Práctico: Ecuación del Plano',
   'Determina la ecuación del plano por $A(2, 0, 1)$ con vector normal $\vec{n}(1, -3, 2)$:

1. Inicio: $x - 3y + 2z + D = 0$.
2. Sustituimos $A$: $2 + 0 + 2 + D = 0 \rightarrow D = -4$.
3. **Resultado:** $x - 3y + 2z - 4 = 0$.'),
  ('mates', 'ambas', 5, 'Rectas y Planos en el Espacio', 'Geometría',
   '3', 30, 'Posiciones Relativas (Rectas y Planos)',
   '- **Entre dos rectas:** Si sus directores son proporcionales: paralelas o coincidentes. Si no, el determinante con el vector puente $\overrightarrow{AB}$: si da 0 se cortan, si no se cruzan.
- **Entre recta y plano:** Producto escalar $\vec{v} \cdot \vec{n}$. Si es $\neq 0$ son secantes. Si da 0: paralela o contenida.',
   NULL, NULL, 'Caso Práctico: Recta y Plano',
   'Estudia la posición de la recta con $\vec{v}(1, 2, -1)$ y el plano $2x - y + 3z - 1 = 0$:

1. Vector normal del plano: $\vec{n}(2, -1, 3)$.
2. Producto escalar: $\vec{v} \cdot \vec{n} = 2 - 2 - 3 = -3$.
3. Como $-3 \neq 0$, la recta y el plano son **secantes**.'),
  ('mates', 'ambas', 6, 'Geometría Métrica en el Espacio', 'Geometría',
   '4', 31, 'Ángulos en el Espacio',
   'Todos se resuelven con el producto escalar en valor absoluto:

- **Dos rectas o dos planos:**
    
$$
\cos(\alpha) = \frac{|\vec{u} \cdot \vec{v}|}{||\vec{u}|| \cdot ||\vec{v}||}
$$
- **Entre recta y plano** (usa SENO, no coseno):
    
$$
\sin(\alpha) = \frac{|\vec{v} \cdot \vec{n}|}{||\vec{v}|| \cdot ||\vec{n}||}
$$',
   NULL, NULL, 'Caso Práctico: Ángulo Recta-Plano',
   'Halla el ángulo entre la recta con $\vec{v}(1, 0, 1)$ y el plano con $\vec{n}(1, 1, 0)$:

1. $\vec{v} \cdot \vec{n} = 1$; $||\vec{v}|| = \sqrt{2}$; $||\vec{n}|| = \sqrt{2}$
2. $\sin(\alpha) = \frac{1}{\sqrt{2} \cdot \sqrt{2}} = \frac{1}{2}$
3. $\alpha = \arcsin(0.5) = \mathbf{30^\circ}$'),
  ('mates', 'ambas', 6, 'Geometría Métrica en el Espacio', 'Geometría',
   '5', 32, 'Proyecciones Ortogonales y Puntos Simétricos',
   '- **Proyección de $P$ sobre un plano $\pi$:** Punto $M$ donde la recta perpendicular a $\pi$ por $P$ corta al plano.
- **Punto Simétrico $P''''$:** $M$ es el punto medio de $PP''''$, por tanto:
    
$$
P'''' = 2M - P
$$',
   NULL, NULL, 'Caso Práctico: Punto Simétrico respecto a un Plano',
   'Halla el simétrico de $P(1, 0, 3)$ respecto al plano $x + y + z - 1 = 0$:

1. Recta perpendicular: $\begin{cases} x = 1 + \lambda \\ y = \lambda \\ z = 3 + \lambda \end{cases}$
2. Sustituimos en el plano: $(1+\lambda) + \lambda + (3+\lambda) - 1 = 0 \rightarrow \lambda = -1$.
3. $M = (0, -1, 2)$.
4. $P'''' = 2(0,-1,2) - (1,0,3) = \mathbf{(-1, -2, 1)}$.'),
  ('mates', 'ambas', 6, 'Geometría Métrica en el Espacio', 'Geometría',
   '6', 33, 'Distancias en el Espacio',
   '- **De Punto a Plano:** $d(P, \pi) = \frac{|Ax_0 + By_0 + Cz_0 + D|}{\sqrt{A^2 + B^2 + C^2}}$
- **De Punto a Recta:** $d(P, r) = \frac{||\overrightarrow{AP} \times \vec{v}||}{||\vec{v}||}$
- **Entre dos rectas que se cruzan:** $d(r, s) = \frac{|\det(\vec{u}, \vec{v}, \overrightarrow{AB})|}{||\vec{u} \times \vec{v}||}$',
   NULL, NULL, 'Caso Práctico: Distancia de Punto a Plano',
   'Calcula la distancia del origen $O(0,0,0)$ al plano $3x - 4y + 5 = 0$:

$$
d(O, \pi) = \frac{|3(0) - 4(0) + 5|}{\sqrt{9+16}} = \frac{5}{5} = \mathbf{1 \text{ unidad}}
$$'),
  ('mates', 'ambas', 6, 'Geometría Métrica en el Espacio', 'Geometría',
   '7', 34, 'Áreas y Volúmenes',
   '- **Área de un Triángulo:** $\frac{1}{2} ||\vec{u} \times \vec{v}||$
- **Volumen de un Tetraedro:** $\frac{1}{6} |\det(\vec{u}, \vec{v}, \vec{w})|$',
   NULL, NULL, 'Caso Práctico: Área de un Triángulo',
   'Calcula el área del triángulo con $\vec{u}(2, 0, 0)$ y $\vec{v}(0, 3, 0)$:

1. $\vec{u} \times \vec{v} = \begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ 2 & 0 & 0 \\ 0 & 3 & 0 \end{vmatrix} = 6\vec{k} \rightarrow (0, 0, 6)$
2. $||(0,0,6)|| = 6$
3. $\text{Área} = \frac{6}{2} = \mathbf{3 \text{ u}^2}$'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '1', 35, 'Idea Intuitiva de Límite',
   'El límite de $f(x)$ en $x = c$ es el valor $L$ al que se aproximan las imágenes cuando $x$ se acerca a $c$. No importa lo que ocurra exactamente en $x = c$, sino el comportamiento en sus cercanías.',
   NULL, NULL, 'Caso Práctico: Idea Intuitiva',
   'Observa el comportamiento de $f(x) = x + 2$ cuando $x \to 3$:

1. Por la izquierda: $f(2.9) = 4.9$; $f(2.99) = 4.99$.
2. Por la derecha: $f(3.1) = 5.1$; $f(3.01) = 5.01$.
3. En ambos casos las imágenes se acercan a $5$. Por tanto, $\lim_{x \to 3} (x + 2) = \mathbf{5}$.'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '2', 36, 'Definición de Límite y Límites Laterales',
   '- **Límites Laterales:** El límite global existe si y solo si los límites por la izquierda y por la derecha existen y valen lo mismo:
    
$$
\lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = L
$$',
   NULL, NULL, 'Caso Práctico: Límites Laterales en Funciones a Trozos',
   'Determina si existe el límite en $x = 1$ de: $f(x) = \begin{cases} 2x & \text{si } x < 1 \\ 4 - x & \text{si } x \ge 1 \end{cases}$

1. Por la izquierda: $\lim_{x \to 1^-} 2x = 2$.
2. Por la derecha: $\lim_{x \to 1^+} (4 - x) = 3$.
3. Como $2 \neq 3$, el límite global **no existe**.'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '3', 37, 'Operaciones con Límites',
   'Si $\lim_{x \to c} f(x) = L$ y $\lim_{x \to c} g(x) = M$:

- **Suma/Resta:** $\lim [f(x) \pm g(x)] = L \pm M$
- **Producto:** $\lim [f(x) \cdot g(x)] = L \cdot M$
- **Cociente:** $\lim [f(x) / g(x)] = L / M$ (si $M \neq 0$)
- **Potencia:** $\lim [f(x)^{g(x)}] = L^M$ (si $L > 0$)',
   NULL, NULL, 'Caso Práctico: Aplicación de Propiedades',
   'Sabiendo que $\lim_{x \to c} f(x) = 4$ y $\lim_{x \to c} g(x) = 2$, calcula $\lim_{x \to c} \frac{f(x) + 3}{g(x)^2}$:

$$
\frac{4 + 3}{2^2} = \mathbf{\frac{7}{4}}
$$'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '4', 38, 'Límites Infinitos',
   '- **En un punto finito:** $\lim_{x \to c} f(x) = \pm\infty$ indica una asíntota vertical.
- **En el infinito:** $\lim_{x \to \pm\infty} f(x) = L$ indica una asíntota horizontal.',
   NULL, NULL, 'Caso Práctico: Límite Infinito en un Punto',
   'Calcula $\lim_{x \to 2^+} \frac{1}{x - 2}$:

1. Al sustituir, el denominador se aproxima a $0^+$ (ej. $2.01 - 2 = 0.01$).
2. Una constante positiva dividida por un número positivo extremadamente pequeño da: $\mathbf{+\infty}$.'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '5', 39, 'Cálculo de Límites e Indeterminaciones',
   'Al evaluar límites directos podemos encontrar expresiones no determinadas:

- $\frac{0}{0}$ — se resuelve factorizando o usando conjugados.
- $\frac{\infty}{\infty}$ — se resuelve comparando los grados de los términos principales.
- $\infty - \infty$ — se opera combinando fracciones o racionalizando.
- $1^\infty$ — se aplica la fórmula directa basada en el número $e$.',
   NULL, NULL, 'Caso Práctico: Indeterminación $1^\infty$',
   'Calcula $\lim_{x \to \infty} \left(\frac{x + 3}{x + 1}\right)^x$:

1. La base tiende a $1$ y el exponente a $\infty$: forma $1^\infty$.
2. Aplicamos $e^{\lim_{x \to \infty} x \cdot \left(\frac{x+3}{x+1} - 1\right)}$.
3. La fracción interna: $\frac{x+3-(x+1)}{x+1} = \frac{2}{x+1}$.
4. El exponente: $\lim_{x \to \infty} \frac{2x}{x+1} = 2$.
5. Resultado: $\mathbf{e^2}$.'),
  ('mates', 'ambas', 7, 'Límites y Continuidad', 'Análisis',
   '6', 40, 'Continuidad y Tipos de Discontinuidad',
   '$f(x)$ es continua en $x = c$ si: existe $f(c)$, existe $\lim_{x \to c} f(x)$, y ambos coinciden. Si no:

- **Evitable:** Existe el límite finito pero no coincide con el valor de la función.
- **Inevitable de salto finito:** Los límites laterales son finitos pero distintos.
- **Inevitable de salto infinito:** Al menos un límite lateral es $\pm\infty$.',
   NULL, NULL, 'Caso Práctico: Clasificación de una Discontinuidad',
   'Estudia la continuidad de $f(x) = \frac{x^2 - 1}{x - 1}$ en $x = 1$:

1. $f(1) = \frac{0}{0}$: no está definida.
2. $\lim_{x \to 1} \frac{(x-1)(x+1)}{x-1} = \lim_{x \to 1} (x+1) = 2$
3. El límite existe pero la función no: **discontinuidad evitable** en $x = 1$.'),
  ('mates', 'ambas', 8, 'Derivadas', 'Análisis',
   '1', 41, 'Concepto de Derivada e Interpretación Geométrica',
   'La derivada de $f(x)$ en $x = c$ es la tasa de variación instantánea:

$$
f''(c) = \lim_{h \to 0} \frac{f(c + h) - f(c)}{h}
$$

- **Interpretación geométrica:** $f''(c)$ es la **pendiente** de la recta tangente en $(c, f(c))$.
- **Ecuación de la recta tangente:** $y - f(c) = f''(c) \cdot (x - c)$',
   NULL, NULL, 'Caso Práctico: Recta Tangente',
   'Halla la recta tangente a $f(x) = x^2 + 1$ en $x = 2$:

1. $f(2) = 5$. El punto es $(2, 5)$.
2. $f''(x) = 2x \rightarrow m = f''(2) = 4$.
3. Recta: $y - 5 = 4(x - 2) \rightarrow \mathbf{y = 4x - 3}$.'),
  ('mates', 'ambas', 8, 'Derivadas', 'Análisis',
   '2', 42, 'Cálculo de Derivadas y Regla de la Cadena',
   '- **Producto:** $(u \cdot v)'' = u'' \cdot v + u \cdot v''$
- **Cociente:** $\left(\frac{u}{v}\right)'' = \frac{u'' v - u v''}{v^2}$
- **Regla de la Cadena:**
    
$$
[f(g(x))]'' = f''(g(x)) \cdot g''(x)
$$',
   NULL, NULL, 'Caso Práctico: Regla de la Cadena',
   'Calcula la derivada de $f(x) = \sin(5x^2)$:

1. Derivada externa (seno): $\cos(5x^2)$.
2. Derivada interna ($5x^2$): $10x$.
3. $f''(x) = \mathbf{10x \cdot \cos(5x^2)}$.'),
  ('mates', 'ambas', 8, 'Derivadas', 'Análisis',
   '3', 43, 'Teoremas de Rolle y del Valor Medio (Lagrange)',
   '- **Teorema de Rolle:** Si $f$ es continua en $[a,b]$, derivable en $(a,b)$ y $f(a) = f(b)$, entonces $\exists c \in (a,b)$ tal que $f''(c) = 0$.
- **Teorema del Valor Medio:** Bajo las mismas condiciones $\exists c \in (a,b)$ tal que:
    
$$
f''(c) = \frac{f(b) - f(a)}{b - a}
$$',
   NULL, NULL, 'Caso Práctico: Teorema de Rolle',
   'Verifica si $f(x) = x^2 - 2x$ cumple Rolle en $[0,2]$ y halla $c$:

1. Es polinómica: continua y derivable en el intervalo.
2. $f(0) = 0$ y $f(2) = 0$. Se cumple el teorema.
3. $f''(x) = 2x - 2 = 0 \rightarrow \mathbf{c = 1} \in (0,2)$.'),
  ('mates', 'ambas', 9, 'Representación de Funciones', 'Análisis',
   '1', 44, 'Información Extraída de la Propia Función',
   '- **Dominio:** Valores de $x$ para los que existe la función.
- **Cortes con los ejes:** Eje $OX$: hacer $f(x) = 0$; Eje $OY$: hacer $x = 0$.
- **Simetría:** Par si $f(-x) = f(x)$; Impar si $f(-x) = -f(x)$.
- **Asíntotas:** Vertical ($x=k$), horizontal ($y=L$) u oblicua ($y=mx+n$).',
   NULL, NULL, 'Caso Práctico: Asíntota Oblicua',
   'Halla la asíntota oblicua de $f(x) = \frac{x^2 + 1}{x}$:

1. $m = \lim_{x \to \infty} \frac{f(x)}{x} = \lim_{x \to \infty} \frac{x^2+1}{x^2} = 1$
2. $n = \lim_{x \to \infty} \left[\frac{x^2+1}{x} - x\right] = \lim_{x \to \infty} \frac{1}{x} = 0$
3. Asíntota oblicua: $\mathbf{y = x}$.'),
  ('mates', 'ambas', 9, 'Representación de Funciones', 'Análisis',
   '2', 45, 'Información Extraída de la 1ª y 2ª Derivada',
   '- **Primera Derivada ($f''$):** Si $f''(x) > 0$ la función crece; si $f''(x) < 0$ decrece. Los puntos donde $f''(x) = 0$ son puntos críticos.
- **Segunda Derivada ($f''''$):** Si $f''''(x) > 0$ es convexa ($\cup$); si $f''''(x) < 0$ es cóncava ($\cap$). Clasifica los extremos relativos y halla los puntos de inflexión.',
   NULL, NULL, 'Caso Práctico: Máximos y Mínimos',
   'Clasifica los puntos críticos de $f(x) = x^3 - 3x$:

1. $f''(x) = 3x^2 - 3 = 0 \rightarrow x = \pm 1$.
2. $f''''(x) = 6x$.
3. $f''''(1) = 6 > 0 \rightarrow$ **mínimo relativo** en $(1, -2)$.
4. $f''''(-1) = -6 < 0 \rightarrow$ **máximo relativo** en $(-1, 2)$.'),
  ('mates', 'ambas', 10, 'Integrales', 'Análisis',
   '1', 46, 'Primitiva de una Función y la Integral Indefinida',
   '$F(x)$ es primitiva de $f(x)$ si $F''(x) = f(x)$.

- **Integral Indefinida:**
    
$$
\int f(x) \, dx = F(x) + C
$$
- Sigue propiedades de linealidad: permite extraer constantes y separar sumas o restas.',
   NULL, NULL, 'Caso Práctico: Propiedades de Linealidad',
   'Resuelve $\int (3x^2 + 2x) \, dx$:

$$
3 \int x^2 \, dx + 2 \int x \, dx = 3 \cdot \frac{x^3}{3} + 2 \cdot \frac{x^2}{2} + C = \mathbf{x^3 + x^2 + C}
$$'),
  ('mates', 'ambas', 10, 'Integrales', 'Análisis',
   '2', 47, 'Integrales de Funciones Elementales (Inmediatas)',
   '- **Potenciales:** $\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$
- **Logarítmicas:** $\int \frac{1}{x} \, dx = \ln|x| + C$
- **Exponenciales:** $\int e^x \, dx = e^x + C$
- **Trigonométricas:** $\int \cos x \, dx = \sin x + C$',
   NULL, NULL, 'Caso Práctico: Integral Inmediata',
   'Resuelve $\int \frac{5}{x} \, dx$: extraemos la constante y aplicamos la primitiva logarítmica: $\mathbf{5 \ln|x| + C}$.'),
  ('mates', 'ambas', 10, 'Integrales', 'Análisis',
   '3', 48, 'Métodos de Integración',
   '- **Cambio de Variable:** Introducir $t = g(x)$, calcular $dt = g''(x)dx$.
- **Por Partes** (regla mnemotécnica ALPES):
    
$$
\int u \, dv = u \cdot v - \int v \, du
$$
- **Racionales:** Descomponer $\frac{P(x)}{Q(x)}$ en fracciones simples.',
   NULL, NULL, 'Caso Práctico: Integración por Partes',
   'Calcula $\int x \cos x \, dx$:

1. $u = x \rightarrow du = dx$; $\; dv = \cos x \, dx \rightarrow v = \sin x$.
2. $\int x \cos x \, dx = x \sin x - \int \sin x \, dx$
3. Resultado: $\mathbf{x \sin x + \cos x + C}$.'),
  ('mates', 'ambas', 10, 'Integrales', 'Análisis',
   '4', 49, 'La Integral Definida (Regla de Barrow y Áreas)',
   'La integral definida calcula el área neta encerrada por una curva en un intervalo:

- **Regla de Barrow:**
    
$$
\int_{a}^{b} f(x) \, dx = [F(x)]_a^b = F(b) - F(a)
$$
- **Cálculo de Áreas:** Para evitar que áreas por debajo del eje se resten, calcula las raíces en el intervalo e integra por tramos usando valores absolutos.',
   NULL, NULL, 'Caso Práctico: Área con Barrow',
   'Halla el área encerrada por $f(x) = x^2$ entre $x = 0$ y $x = 3$:

1. $\int_{0}^{3} x^2 \, dx$; primitiva: $F(x) = \frac{x^3}{3}$.
2. $\left[\frac{x^3}{3}\right]_0^3 = \frac{27}{3} - 0 = \mathbf{9 \text{ u}^2}$'),
  ('mates', 'ambas', 11, 'Probabilidad y Combinatoria', 'Probabilidad',
   '1', 50, 'Álgebra de Sucesos y Tipos de Experimentos',
   '- **Espacio Muestral ($\Omega$):** Conjunto de todos los resultados posibles.
- **Operaciones:** Unión ($A \cup B$), Intersección ($A \cap B$), Contrario ($\bar{A}$).
- **Leyes de Morgan:** $\overline{A \cup B} = \bar{A} \cap \bar{B}$ y $\overline{A \cap B} = \bar{A} \cup \bar{B}$.',
   NULL, NULL, 'Caso Práctico: Leyes de Morgan',
   'Sabiendo que $P(A \cup B) = 0.7$, halla $P(\bar{A} \cap \bar{B})$:

1. Por Morgan: $\bar{A} \cap \bar{B} = \overline{A \cup B}$.
2. $P(\bar{A} \cap \bar{B}) = 1 - P(A \cup B) = 1 - 0.7 = \mathbf{0.3}$'),
  ('mates', 'ambas', 11, 'Probabilidad y Combinatoria', 'Probabilidad',
   '2', 51, 'Asignación de Probabilidades (Regla de Laplace)',
   'Si todos los resultados son equiprobables:

$$
P(A) = \frac{\text{Número de casos favorables}}{\text{Número de casos posibles}}
$$
La probabilidad es siempre un valor en $[0, 1]$.',
   NULL, NULL, 'Caso Práctico: Regla de Laplace',
   'Calcula la probabilidad de obtener un número par al lanzar un dado de 6 caras:

1. Casos posibles: $\Omega = \{1,2,3,4,5,6\} \rightarrow 6$ casos.
2. Casos favorables: $A = \{2,4,6\} \rightarrow 3$ casos.
3. $P(A) = \frac{3}{6} = \mathbf{0.5}$'),
  ('mates', 'ambas', 11, 'Probabilidad y Combinatoria', 'Probabilidad',
   '3', 52, 'Definición Axiomática de Probabilidad (Kolmogorov)',
   'Tres axiomas fundamentales:

1. $P(A) \ge 0$ para cualquier suceso $A$.
2. $P(\Omega) = 1$.
3. Si $A \cap B = \emptyset$: $P(A \cup B) = P(A) + P(B)$.

Caso general compatible: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.',
   NULL, NULL, 'Caso Práctico: Sucesos Compatibles',
   'Con $P(A) = 0.6$, $P(B) = 0.4$ y $P(A \cap B) = 0.2$:

$$
P(A \cup B) = 0.6 + 0.4 - 0.2 = \mathbf{0.8}
$$'),
  ('mates', 'ambas', 11, 'Probabilidad y Combinatoria', 'Probabilidad',
   '4', 53, 'Diagramas de Árbol y Tablas de Contingencia',
   '- **Diagramas de Árbol:** Se ramifican las opciones secuenciales. La probabilidad de un camino es el producto de sus ramas.
- **Tablas de Contingencia:** Tablas cruzadas para organizar conjuntos con dos características.',
   NULL, NULL, 'Caso Práctico: Tabla de Contingencia',
   'En un grupo de 60 mujeres y 40 hombres, 20 mujeres juegan al tenis y hay 45 tenistas en total. Halla $P(\text{Hombre} \cap \text{Tenis})$:

1. Hombres tenistas: $45 - 20 = 25$.
2. Total: $60 + 40 = 100$.
3. $P(H \cap T) = \frac{25}{100} = \mathbf{0.25}$'),
  ('mates', 'ambas', 11, 'Probabilidad y Combinatoria', 'Probabilidad',
   '5', 54, 'Teoremas de la Probabilidad Total y de Bayes',
   '- **Probabilidad Total:**
    
$$
P(B) = \sum [P(A_i) \cdot P(B | A_i)]
$$
- **Teorema de Bayes:**
    
$$
P(A_i | B) = \frac{P(A_i) \cdot P(B | A_i)}{P(B)}
$$',
   NULL, NULL, 'Caso Práctico: Teorema de Bayes',
   'Enfermedad al $1\%$ de la población. Test positivo en el $95\%$ de enfermos y $2\%$ de falsos positivos. Si alguien da positivo ($+$), ¿cuál es la probabilidad de estar enfermo ($E$)?

1. $P(E)=0.01$, $P(\bar{E})=0.99$, $P(+|E)=0.95$, $P(+|\bar{E})=0.02$.
2. $P(+) = 0.01 \cdot 0.95 + 0.99 \cdot 0.02 = 0.0293$.
3. $P(E|+) = \frac{0.01 \cdot 0.95}{0.0293} \approx \mathbf{0.324}$ (32.4\%)'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '1', 55, 'Parámetros de una Distribución: Media, Varianza y Desviación Típica',
   '- **Media ($\mu$):** Valor esperado: $\mu = \sum [x_i \cdot P(x_i)]$.
- **Varianza ($\sigma^2$):** $\sigma^2 = \sum [x_i^2 \cdot P(x_i)] - \mu^2$.
- **Desviación Típica ($\sigma$):** $\sigma = \sqrt{\sigma^2}$.',
   NULL, NULL, 'Caso Práctico: Cálculo de Parámetros',
   'Variable discreta con valores $1$ y $2$ con probabilidades $0.4$ y $0.6$:

1. $\mu = 1(0.4) + 2(0.6) = \mathbf{1.6}$
2. $\sum x_i^2 P(x_i) = 0.4 + 2.4 = 2.8$
3. $\sigma^2 = 2.8 - (1.6)^2 = 0.24$; $\quad \sigma = \sqrt{0.24} \approx \mathbf{0.49}$'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '2', 56, 'Distribución Binomial (Variable Discreta)',
   'Modela $n$ experimentos independientes con éxito $p$ o fracaso $q = 1-p$. Se expresa $X \sim B(n, p)$.

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot q^{n-k}
$$
Parámetros directos: $\mu = n \cdot p$ y $\sigma = \sqrt{n \cdot p \cdot q}$.',
   NULL, NULL, 'Caso Práctico: Cálculo Binomial',
   'Lanzamos una moneda 4 veces. Calcula $P(\text{exactamente 3 caras})$:

1. $X \sim B(4, 0.5)$.
2. $P(X=3) = \binom{4}{3}(0.5)^3(0.5)^1 = 4 \cdot 0.125 \cdot 0.5 = \mathbf{0.25}$'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '3', 57, 'Desigualdad de Chebycheff',
   'Aplicable a cualquier variable estadística:

$$
P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}
$$
La probabilidad de desviarse más de $k$ desviaciones típicas de la media es como máximo $\frac{1}{k^2}$.',
   NULL, NULL, 'Caso Práctico: Acotación de Chebycheff',
   'Variable con $\mu = 50$ y $\sigma = 5$. Acota $P(X \notin (40, 60))$:

1. Distancia al borde: $|50 - 40| = 10$.
2. $k \cdot \sigma = 10 \rightarrow k = 2$.
3. $P(|X - 50| \ge 10) \le \frac{1}{4} = \mathbf{0.25}$. Como máximo el $25\%$.'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '4', 58, 'Distribuciones de Probabilidad Continuas',
   'Variables que pueden tomar cualquier valor real. $P(X=c) = 0$. La probabilidad de un tramo es el área bajo la función de densidad $f(x)$:

$$
P(a \le X \le b) = \int_{a}^{b} f(x) \, dx
$$',
   NULL, NULL, 'Caso Práctico: Probabilidad en Variables Continuas',
   'Con $f(x) = 0.5$ en $[0, 2]$, calcula $P(1 \le X \le 2)$:

$$
P(1 \le X \le 2) = \int_{1}^{2} 0.5 \, dx = [0.5x]_1^2 = 1 - 0.5 = \mathbf{0.5}
$$'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '5', 59, 'Distribución Normal y Tipificación',
   'La distribución continua más importante, simétrica y con forma de campana. $X \sim N(\mu, \sigma)$. Para usar la tabla estándar $N(0,1)$, se **tipifica**:

$$
Z = \frac{X - \mu}{\sigma}
$$',
   NULL, NULL, 'Caso Práctico: Uso de Tablas Normales',
   'Sea $X \sim N(10, 2)$, calcula $P(X \le 13)$:

1. $P(X \le 13) = P\left(Z \le \frac{13-10}{2}\right) = P(Z \le 1.5)$
2. En la tabla de $N(0,1)$: $P(Z \le 1.50) = \mathbf{0.9332}$ (93.32\%)'),
  ('mates', 'ambas', 12, 'Distribuciones de Probabilidad', 'Probabilidad',
   '6', 60, 'Aproximación de la Binomial a la Normal (Moivre-Gauss)',
   'Si $n$ es suficientemente grande en $X \sim B(n, p)$ y se cumplen $n \cdot p \ge 5$ y $n \cdot q \ge 5$, se puede aproximar:

$$
Y \sim N(n \cdot p, \ \sqrt{n \cdot p \cdot q})
$$',
   NULL, NULL, 'Caso Práctico: Aproximación Binomial → Normal',
   'Aproxima $X \sim B(100, 0.2)$ a una distribución normal:

1. Comprobamos: $100 \cdot 0.2 = 20 \ge 5$ y $100 \cdot 0.8 = 80 \ge 5$. Es válida.
2. $\mu = 100 \cdot 0.2 = 20$.
3. $\sigma = \sqrt{100 \cdot 0.2 \cdot 0.8} = \sqrt{16} = 4$.
4. $\mathbf{Y \sim N(20, 4)}$.')
on conflict (subject, region, sort_order) do nothing;
