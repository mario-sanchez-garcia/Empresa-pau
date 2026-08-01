-- ══════════════════════════════════════════════════════════════
-- fix_all.sql  —  Pausia · curriculum_content patch completo
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- PARTE 1: Corrección de corrupción LaTeX (3 registros)
-- ─────────────────────────────────────────────────────────────

-- fix_curriculum_content.sql
-- Correcciones de LaTeX corrupto (TAREA 1) + renumeración de headings (TAREA 2)
-- Ejecutar en Supabase SQL Editor. Las dos tareas son idempotentes.
-- Ejecutar TAREA 1 primero, luego TAREA 2.


-- ══════════════════════════════════════════════════════════════════════
-- TAREA 1: Corrección de patrones LaTeX corruptos via REPLACE()
-- Solo modifica los 3 registros afectados. Los demás no se tocan.
-- ══════════════════════════════════════════════════════════════════════

-- algebra-lineal:matrices-operaciones
UPDATE curriculum_content
SET content_markdown = REPLACE(
    content_markdown,
    '**$|A^{-1**|$:}',
    '**$|A^{-1}|$:**')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'matrices-operaciones';

-- algebra-lineal:sistemas-gauss
UPDATE curriculum_content
SET content_markdown = REPLACE(
    content_markdown,
    '\begin{pmatrix** 5 \\ 17 \end{pmatrix}$):}',
    '\begin{pmatrix} 5 \\ 17 \end{pmatrix}$):**')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'sistemas-gauss';

-- geometria-3d:producto-vectorial
UPDATE curriculum_content
SET content_markdown = REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    content_markdown,
    '$\overrightarrow{AB**$:}',
    '$\overrightarrow{AB}$:**'),
    '($||\vec{u**||$):}',
    '($||\vec{u}||$):**'),
    '($\vec{u** \perp \vec{v}$):}',
    '($\vec{u} \perp \vec{v}$):**'),
    '$\vec{u** \times \vec{v}$ por Sarrus:}',
    '$\vec{u} \times \vec{v}$ por Sarrus:**'),
    '($\mathbb{R' || chr(10) || '^2$)}',
    '($\mathbb{R}^2$)'),
    '($\mathbb{R' || chr(10) || '^3$)}',
    '($\mathbb{R}^3$)'),
    '($\vec{u' || chr(10) || ' \cdot \vec{v}$)}',
    '($\vec{u} \cdot \vec{v}$)'),
    '($\vec{u' || chr(10) || ' \times \vec{v}$)}',
    '($\vec{u} \times \vec{v}$)')
WHERE subject = 'matematicas_ii'
  AND block_slug = 'geometria-3d'
  AND topic_slug = 'producto-vectorial';


-- ─────────────────────────────────────────────────────────────
-- PARTE 2: Renumeración de headings ## 1..N (8 registros)
-- Dollar-quoting: $MD$
-- ─────────────────────────────────────────────────────────────

-- fix_renumber_v2.sql
-- Renumeración de headings ## N. para 8 topics
-- Dollar-quoting: $MD$

-- matrices-operaciones
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Dimensión de una Matriz

    Indica el tamaño de la tabla mediante el número de filas ($m$) y columnas ($n$), escrito como $m \times n$.

### Caso Práctico Resuelto

    Dada la matriz $A = \begin{pmatrix} 2 & -1 & 4 \\ 0 & 5 & -3 \end{pmatrix}$:
    
        
- Tiene **2 filas** y **3 columnas** $\rightarrow$ Su dimensión es $2 \times 3$.
        
- Identificar elementos: $a_{13} = 4$ (fila 1, col 3) y $a_{22} = 5$ (fila 2, col 2).
    

## 2. Suma y Resta de Matrices

    Solo se pueden sumar o restar matrices que tengan exactamente la **misma dimensión**. La operación se realiza elemento a elemento en la misma posición.

### Caso Práctico Resuelto

    Sean $A = \begin{pmatrix} 1 & 3 \\ -2 & 4 \end{pmatrix}$ y $B = \begin{pmatrix} 5 & 0 \\ 2 & -1 \end{pmatrix}$:
    
        
- **Suma:** $A + B = \begin{pmatrix} 1+5 & 3+0 \\ -2+2 & 4+(-1) \end{pmatrix} = \begin{pmatrix} 6 & 3 \\ 0 & 3 \end{pmatrix}$
        
- **Resta:** $A - B = \begin{pmatrix} 1-5 & 3-0 \\ -2-2 & 4-(-1) \end{pmatrix} = \begin{pmatrix} -4 & 3 \\ -4 & 5 \end{pmatrix}$
    

## 3. Producto por un Escalar (Número $\cdot$ Matriz)

    Multiplicar un número real $k$ por una matriz consiste en multiplicar **todos y cada uno** de los elementos de la matriz por ese número.

### Caso Práctico Resuelto

    Dado el número $k = -2$ y la matriz $A = \begin{pmatrix} 3 & -1 \\ 0 & 4 \end{pmatrix}$:
    
$$
-2 \cdot A = \begin{pmatrix} -2 \cdot 3 & -2 \cdot (-1) \\ -2 \cdot 0 & -2 \cdot 4 \end{pmatrix} = \begin{pmatrix} -6 & 2 \\ 0 & -8 \end{pmatrix}
$$

## 4. Multiplicación de Matrices ($A \cdot B$)

    Solo es posible si el **número de columnas de $A$** es igual al **número de filas de $B$**. Se calcula multiplicando las filas de la primera por las columnas de la segunda.

> ⚠️ **¡IMPORTANTE!**
El producto **no es conmutativo**: $A \cdot B \neq B \cdot A$. ¡Respeta siempre el orden!

### Caso Práctico Resuelto

    Multiplicar $A_{2 \times 3} = \begin{pmatrix} 1 & 2 & 0 \\ 3 & -1 & 4 \end{pmatrix}$ por $B_{3 \times 2} = \begin{pmatrix} 2 & 1 \\ 0 & 3 \\ -1 & 5 \end{pmatrix}$ (El resultado será $2 \times 2$):
    
$$
A \cdot B = \begin{pmatrix} (1 \cdot 2 + 2 \cdot 0 + 0 \cdot (-1)) & (1 \cdot 1 + 2 \cdot 3 + 0 \cdot 5) \\ (3 \cdot 2 + (-1) \cdot 0 + 4 \cdot (-1)) & (3 \cdot 1 + (-1) \cdot 3 + 4 \cdot 5) \end{pmatrix}
$$

    
$$
A \cdot B = \begin{pmatrix} 2 + 0 + 0 & 1 + 6 + 0 \\ 6 + 0 - 4 & 3 - 3 + 20 \end{pmatrix} = \begin{pmatrix} 2 & 7 \\ 2 & 20 \end{pmatrix}
$$

## 5. Propiedades de la Matriz Traspuesta ($A^t$)

    La traspuesta consiste en cambiar filas por columnas. Cuando se combina con otras operaciones, sigue estas reglas fijas:
    
        
- Múltiple traspuesta: $(A^t)^t = A$ (vuelve a la original).
        
- Con la suma: $(A + B)^t = A^t + B^t$
        
- Con un número: $(k \cdot A)^t = k \cdot A^t$
        
- **¡Peligro con el producto!** $(A \cdot B)^t = B^t \cdot A^t$ (el orden de las matrices **se invierte**).
    

### Caso Práctico: Desarrollar Expresiones con Traspuestas

    Simplifica la expresión matrimonial $(2A + B^t)^t$:
    
$$
(2A + B^t)^t = (2A)^t + (B^t)^t = 2A^t + B
$$

## 6. Potencias de Matrices ($A^n$)

    Para hallar potencias elevadas, calcula $A^2$, $A^3$ y busca la regla o patrón numérico que se va repitiendo.

### Caso Práctico Resuelto

    Calcula $A^n$ para $A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix}$:
    
        
- $A^2 = A \cdot A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1\cdot1+3\cdot0 & 1\cdot3+3\cdot1 \\ 0\cdot1+1\cdot0 & 0\cdot3+1\cdot1 \end{pmatrix} = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix}$
        
- $A^3 = A^2 \cdot A = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 9 \\ 0 & 1 \end{pmatrix}$
    
    **Patrón detectado:** El elemento superior derecho es $3 \cdot n$. Por tanto: $A^n = \begin{pmatrix} 1 & 3n \\ 0 & 1 \end{pmatrix}$.

## 7. Rango de una Matriz (Método de Gauss)

    El rango es el número de filas independientes. Usamos el método de Gauss haciendo operaciones entre filas para conseguir que los elementos por debajo de la diagonal principal sean **ceros** (escalonar). El rango es el número de filas finales que no sean por completo ceros.

### Caso Práctico Resuelto

    Calcular el rango de $A = \begin{pmatrix} 1 & -2 & 3 \\ 2 & -4 & 7 \\ 3 & -6 & 10 \end{pmatrix}$ mediante Gauss:
    
        
- Hacemos ceros en la primera columna debajo del $1$.
        
            
- Fila 2: $F_2 \rightarrow F_2 - 2F_1 \quad \rightarrow \begin{pmatrix} 2-2(1) & -4-2(-2) & 7-2(3) \end{pmatrix} = \begin{pmatrix} 0 & 0 & 1 \end{pmatrix}$
            
- Fila 3: $F_3 \rightarrow F_3 - 3F_1 \quad \rightarrow \begin{pmatrix} 3-3(1) & -6-3(-2) & 10-3(3) \end{pmatrix} = \begin{pmatrix} 0 & 0 & 1 \end{pmatrix}$
        
        La matriz va quedando: $\begin{pmatrix} 1 & -2 & 3 \\ 0 & 0 & 1 \\ 0 & 0 & 1 \end{pmatrix}$.
        
- Hacemos cero en la tercera fila usando la segunda: $F_3 \rightarrow F_3 - F_2$:
        
$$
\begin{pmatrix} 1 & -2 & 3 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \end{pmatrix}
$$

    
    Al escalonar, nos quedan **2 filas no nulas**. Por lo tanto, el **Rango($A$) = 2**.

## 8. Matriz Inversa por Gauss-Jordan

    Para hallar $A^{-1}$, se monta la matriz conjunta con la identidad $(A \mid I)$ y se aplican operaciones de filas hasta lograr que la identidad pase al lado izquierdo: $(I \mid A^{-1})$.

### Caso Práctico Resuelto

    Calcular la inversa de $A = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$:
    
        
- Planteamos la matriz inicial: 
        $\left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 3 & 7 & 0 & 1 \end{array}\right)$
        
- Hacemos un cero abajo a la izquierda con $F_2 \rightarrow F_2 - 3F_1$:
        $\left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 0 & 1 & -3 & 1 \end{array}\right)$
        
- Hacemos cero arriba en el centro con $F_1 \rightarrow F_1 - 2F_2$:
        $\left(\begin{array}{cc|cc} 1 & 0 & 7 & -2 \\ 0 & 1 & -3 & 1 \end{array}\right)$
    
    ¡Ya tenemos la identidad a la izquierda! La matriz inversa resultante es: $A^{-1} = \begin{pmatrix} 7 & -2 \\ -3 & 1 \end{pmatrix}$.

## 9. Despejar en Ecuaciones Matriciales

    Para despejar la incógnita $X$, multiplicamos por la inversa del elemento que le estorbe, manteniendo estrictamente el mismo lado en el que se añade.

### Caso Práctico Resuelto

    Resuelve y despeja $X$ en la ecuación $A \cdot X + B = C$:
    
        
- Primero restamos $B$ en ambos lados: $A \cdot X = C - B$
        
- Como la matriz $A$ multiplica a la **izquierda** de la $X$, multiplicamos por $A^{-1}$ por la **izquierda** en el otro lado de la igualdad:
        
$$
X = A^{-1} \cdot (C - B)
$$

    

## 10. Determinantes de Orden 2 y 3 (Regla de Sarrus)

    Un determinante es un número real asociado a una matriz cuadrada.
    
        
- **Orden $2 \times 2$:** Se multiplica la diagonal principal menos la diagonal secundaria.
        
- **Orden $3 \times 3$ (Sarrus):** Se suman los productos de la diagonal principal y sus paralelas con sus vértices opuestos, y se restan los productos de la diagonal secundaria y sus respectivas paralelas.
    

### Caso Práctico: Sarrus de Orden 3

    Calcular el determinante de la matriz $A = \begin{pmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 2 & 0 & -1 \end{pmatrix}$:
    
$$
|A| = \begin{vmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 2 & 0 & -1 \end{vmatrix}
$$

    
        
- **Términos positivos (+):** $(1 \cdot 1 \cdot (-1)) + (0 \cdot 0 \cdot 3) + (2 \cdot 2 \cdot 4) = -1 + 0 + 16 = 15$
        
- **Términos negativos (-):** $(3 \cdot 1 \cdot 2) + (4 \cdot 0 \cdot 1) + (-1 \cdot 2 \cdot 0) = 6 + 0 + 0 = 6$
    
    
$$
|A| = 15 - 6 = 9
$$

## 11. Propiedades Críticas de los Determinantes

    Trucos rápidos que ahorran tiempo en el examen:
    
        
- Si una matriz tiene una **fila o columna de ceros**, su determinante es $0$.
        
- Si tiene **dos filas o columnas iguales o proporcionales**, su determinante es $0$.
        
- El determinante de la traspuesta es igual al de la original: $|A^t| = |A|$.
        
- El determinante de un producto es el producto de determinantes: $|A \cdot B| = |A| \cdot |B|$.
        
- El determinante de la inversa es el inverso del determinante: $|A^{-1}| = \frac{1}{|A|}$.
    

### Caso Práctico: Aplicación de Propiedades

    Sabiendo que $A$ es una matriz $3 \times 3$ con $|A| = 5$, calcula sin desarrollar:
    
        
- |A^{-1}|:||A^{-1}|:||A^{-1}|: Aplicando la propiedad, $|A^{-1}| = \frac{1}{|A|} = \frac{1}{5}$.
        
- |A^{-1}|:|A \cdot A^t|$:** Aplicando las propiedades, $|A \cdot A^t| = |A| \cdot |A^t| = |A| \cdot |A| = 5 \cdot 5 = 25$.
    

## 12. Determinante de Matrices Triangulares (Hacer Ceros)

    Si logras que una matriz sea **triangular** (haciendo ceros por debajo de la diagonal mediante el método de Gauss), su determinante es simplemente **multiplicar los números de la diagonal principal**.
    
    **Regla de oro al hacer Gauss en determinantes:**
    
        
- Si a una fila le sumas o restas otra fila multiplicada por un número, el determinante **NO cambia**.
        
- Si intercambias dos filas de posición, el determinante **cambia de signo** (se le pone un menos delante).
    

### Caso Práctico: Determinante por Gauss

    Calcular el determinante de $A = \begin{pmatrix} 1 & 3 \\ 2 & 7 \end{pmatrix}$ haciendo ceros:
    
        
- Hacemos un cero en la segunda fila mediante $F_2 \rightarrow F_2 - 2F_1$. Como es una combinación estándar, el valor del determinante no varía:
        
$$
|A| = \begin{vmatrix} 1 & 3 \\ 2 & 7 \end{vmatrix} = \begin{vmatrix} 1 & 3 \\ 2 - 2(1) & 7 - 2(3) \end{vmatrix} = \begin{vmatrix} \mathbf{1} & 3 \\ 0 & \mathbf{1} \end{vmatrix}
$$

        
- Al ser ya una matriz triangular, multiplicamos su diagonal principal:
        
$$
|A| = 1 \cdot 1 = 1
$$

    

## 13. Cálculo de la Inversa por Adjuntos

    Es el método alternativo a Gauss-Jordan, ideal para matrices $3 \times 3$. La fórmula es:
    
$$
A^{-1} = \frac{1}{|A|} \cdot (\text{Adj}(A))^t
$$

    *¡Cuidado!* Cada elemento del adjunto lleva un signo $(-1)^{i+j}$ que cambia los signos en forma de tablero de ajedrez: $\begin{pmatrix} + & - & + \\ - & + & - \\ + & - & + \end{pmatrix}$.

### Caso Práctico: Inversa por Adjuntos

    Calcular la inversa de $A = \begin{pmatrix} 1 & 2 \\ 3 & 8 \end{pmatrix}$:
    
        
- **Determinante:** $|A| = (1 \cdot 8) - (2 \cdot 3) = 8 - 6 = 2$. (Como es $\neq 0$, tiene inversa).
        
- **Matriz Adjunta (tachar fila y columna de cada elemento):**
        
$$
\text{Adj}(A) = \begin{pmatrix} 8 & -3 \\ -2 & 1 \end{pmatrix}
$$

        
- **Traspuesta de la Adjunta:** $(\text{Adj}(A))^t = \begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix}$
        
- **Dividir entre el determinante ($|A|=2$):**
        
$$
A^{-1} = \frac{1}{2} \begin{pmatrix} 8 & -2 \\ -3 & 1 \end{pmatrix} = \begin{pmatrix} 4 & -1 \\ -1.5 & 0.5 \end{pmatrix}
$$

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'matrices-operaciones';

-- sistemas-gauss
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Expresión Matricial de un Sistema

    Cualquier sistema de ecuaciones lineales se puede escribir de forma compacta como:
    
$$
A \cdot X = B
$$

    Donde |A^{-1}|:A$** es la matriz de coeficientes, |A^{-1}|:X$** es el vector de incógnitas $\begin{pmatrix} x \\ y \\ z \end{pmatrix}$ y |A^{-1}|:B$** es el vector de términos independientes. La matriz ampliada se denota como |A^{-1}|:A^*$** o |A^{-1}|:(A|B)$**.

### Caso Práctico: Convertir a Matriz

    Dado el sistema: $\begin{cases} x + 2y - z = 3 \\ 3x - y = 1 \end{cases}$ su escritura matricial es:
    
$$
\underbrace{\begin{pmatrix} 1 & 2 & -1 \\ 3 & -1 & 0 \end{pmatrix}}_{A} \cdot \underbrace{\begin{pmatrix} x \\ y \\ z \end{pmatrix}}_{X} = \underbrace{\begin{pmatrix} 3 \\ 1 \end{pmatrix}}_{B} \quad \rightarrow \quad A^* = \left(\begin{array}{ccc|c} 1 & 2 & -1 & 3 \\ 3 & -1 & 0 & 1 \end{array}\right)
$$

## 2. Teorema de Rouché-Frobenius (Discusión)

    Sirve para saber cuántas soluciones tiene un sistema calculando el rango de la matriz normal ($A$) y de la ampliada ($A^*$):
    
        
- **Rango($A$) $\neq$ Rango($A^*$)** $\longrightarrow$ **Sistema Incompatible (SI):** No tiene solución.
        
- **Rango($A$) $=$ Rango($A^*$) $=$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Determinado (SCD):** Solución única.
        
- **Rango($A$) $=$ Rango($A^*$) $<$ nº incógnitas** $\longrightarrow$ **Sistema Compatible Indeterminado (SCI):** Infinitas soluciones.
    

### Caso Práctico: Discusión de un Sistema

    Discutir el sistema cuya matriz ampliada escalonada por Gauss es $A^* = \left(\begin{array}{cc|c} 1 & 2 & 5 \\ 0 & 0 & 3 \end{array}\right)$ con incógnitas $x, y$:
    
        
- Mirando solo la izquierda de la barra, la fila de ceros hace que el **Rango($A$) = 1**.
        
- Mirando la matriz completa, el término independiente $3$ cuenta como fila activa, por tanto **Rango($A^*$) = 2**.
        
- Como **Rango($A$) $\neq$ Rango($A^*$)** ($1 \neq 2$), el sistema es **Incompatible (SI)** (no tiene solución).
    

## 3. Sistemas Homogéneos

    Un sistema es **homogéneo** cuando todos sus términos independientes son cero ($A \cdot X = \mathbf{0}$). 
    
        
- **¡Ventaja!:** Siempre son **Compatibles** (siempre tienen solución), ya que el Rango($A$) siempre va a ser igual al Rango($A^*$).
        
- **Solución Trivial:** Siempre admiten la solución $x=0, y=0, z=0$.
        
- Si es **SCD** (Rango = nº incógnitas) $\rightarrow$ Solo tiene la solución trivial ($0,0,0$).
        
- Si es **SCI** (Rango < nº incógnitas) $\rightarrow$ Tiene infinitas soluciones además de la $(0,0,0)$.
    

### Caso Práctico: Sistema Homogéneo

    Discute el siguiente sistema sin resolverlo: $\begin{cases} x + 2y = 0 \\ 3x + 6y = 0 \end{cases}$
    
        
- Escribimos su matriz de coeficientes: $A = \begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}$.
        
- Calculamos su determinante para ver el rango: $|A| = (1\cdot6) - (2\cdot3) = 6 - 6 = 0$.
        
- Como el determinante da 0, el Rango($A$) no es 2, es **Rango($A$) = 1**.
        
- Al ser menor que el número de incógnitas ($1 < 2$), el sistema es **Compatible Indeterminado (SCI)**. Tiene infinitas soluciones además de la $(0,0)$.
    

## 4. Resolución por la Regla de Cramer

    Válido solo para sistemas **Compatibles Determinados (SCD)** que tengan el mismo número de ecuaciones que de incógnitas.
    Cada incógnita se calcula dividiendo el determinante de una matriz modificada entre el determinante de la matriz general $|A|$:
    
$$
x = \frac{|A_x|}{|A|}, \quad y = \frac{|A_y|}{|A|}, \quad z = \frac{|A_z|}{|A|}
$$

    Donde $A_x$ consiste en cambiar la columna de las $x$ por la columna de términos independientes ($B$).

### Caso Práctico: Método de Cramer

    Resolver el sistema: $\begin{cases} 1x + 2y = 5 \\ 3x + 7y = 17 \end{cases}$
    
        
- **Determinante principal:** $|A| = \begin{vmatrix} 1 & 2 \\ 3 & 7 \end{vmatrix} = (1\cdot7) - (2\cdot3) = 1$.
        
- **Calcular $|A_x|$ (sustituyendo la 1ª columna por $\begin{pmatrix} 5 \\ 17 \end{pmatrix}$):}
        
$$
|A_x| = \begin{vmatrix} \mathbf{5} & 2 \\ \mathbf{17} & 7 \end{vmatrix} = (5\cdot7) - (2\cdot17) = 35 - 34 = 1 \quad \rightarrow \quad x = \frac{|A_x|}{|A|} = \frac{1}{1} = 1
$$

        
- **Calcular $|A_y|$ (sustituyendo la 2ª columna por $\begin{pmatrix} 5 \\ 17 \end{pmatrix}$):}
        
$$
|A_y| = \begin{vmatrix} 1 & \mathbf{5} \\ 3 & \mathbf{17} \end{vmatrix} = (1\cdot17) - (5\cdot3) = 17 - 15 = 2 \quad \rightarrow \quad y = \frac{|A_y|}{|A|} = \frac{2}{1} = 2
$$

    
    **Solución única:** $x = 1, \ y = 2$.

## El Método de Gauss: Paso a Paso

    El objetivo es **escalonar la matriz**: hacer un triángulo de **ceros** por debajo de la diagonal principal.
    
    **El orden obligatorio para hacer los ceros es:**
    
$$
\begin{pmatrix}
    \bullet & \bullet & \bullet \\
    \mathbf{1^\circ} & \bullet & \bullet \\
    \mathbf{2^\circ} & \mathbf{3^\circ} & \bullet
    \end{pmatrix}
$$

    
        
- ****Paso 1:**** Hacer cero el $\mathbf{1^\circ}$ (Fila 2, Columna 1) $\rightarrow$ usando la **Fila 1**.
        
- ****Paso 2:**** Hacer cero el $\mathbf{2^\circ}$ (Fila 3, Columna 1) $\rightarrow$ usando la **Fila 1**.
        
- ****Paso 3:**** Hacer cero el $\mathbf{3^\circ}$ (Fila 3, Columna 2) $\rightarrow$ usando **SÓLO la Fila 2** (para no romper los ceros anteriores).
    

    **Truco "Multiplicar Cruzado":** Si quieres hacer un cero entre dos filas, multiplica cada fila por el primer número de la otra fila.

### Caso Práctico Paso a Paso

    Escalonar la matriz $A = \begin{pmatrix} 1 & 2 & -1 \\ 2 & 1 & 3 \\ 3 & 2 & 1 \end{pmatrix}$:
    
    
        
- **Primer Cero (en el 2):** Hacemos la operación $F_2 \rightarrow F_2 - 2F_1$.
        
$$
F_2 = (2, 1, 3) - 2 \cdot (1, 2, -1) = (2-2, 1-4, 3+2) = \mathbf{(0, -3, 5)}
$$

        
        
- **Segundo Cero (en el 3):** Hacemos la operación $F_3 \rightarrow F_3 - 3F_1$.
        
$$
F_3 = (3, 2, 1) - 3 \cdot (1, 2, -1) = (3-3, 2-6, 1+3) = \mathbf{(0, -4, 4)}
$$

        La matriz va quedando así: $\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ 0 & -4 & 4 \end{pmatrix}$
        
        
- **Tercer Cero (en el -4):** Usamos cruzados los números de $F_2$ ($-3$) y $F_3$ ($-4$). Operación: $F_3 \rightarrow 3F_3 - 4F_2$.
        
$$
3F_3 - 4F_2 = 3 \cdot (0, -4, 4) - 4 \cdot (0, -3, 5) = (0, -12+12, 12-20) = \mathbf{(0, 0, -8)}
$$

    
    
    **Resultado final (Matriz Escalonada):**
    
$$
\begin{pmatrix} 1 & 2 & -1 \\ 0 & -3 & 5 \\ \mathbf{0} & \mathbf{0} & -8 \end{pmatrix} \quad \longrightarrow \quad \text{**Rango** = 3 (hay 3 filas vivas).}
$$

## Análisis de Sistemas por el Método de Gauss

    Para analizar y resolver cualquier sistema (tenga las ecuaciones e incógnitas que tenga) usando Gauss, seguimos estos pasos:
    
        
- **Escribir la matriz ampliada** $(A|B)$ con los coeficientes y los términos independientes.
        
- **Hacer ceros (escalonar)** por debajo de la diagonal principal usando operaciones elementales entre filas (igual que hacíamos en las matrices).
        
- **Analizar la última fila (Discusión):**
        
            
- Si queda una fila del tipo $\mathbf{(0 \quad 0 \quad 0 \mid \text{Número})}$, significa $0 = \text{Número} \rightarrow$ **Sistema Incompatible (SI)**, no tiene solución.
            
- Si queda una fila del tipo $\mathbf{(0 \quad 0 \quad 0 \mid 0)}$, esa fila se elimina porque no aporta información ($0=0$).
        
        
- **Resolver de abajo hacia arriba** una vez que el sistema está limpio y escalonado.
    

### Caso Práctico Resuelto (Método de Gauss en Sistemas)

    Resuelve y analiza por el método de Gauss el siguiente sistema de 3 ecuaciones con 3 incógnitas:
    
$$
\begin{cases} x + y + z = 2 \\ 2x + 3y + 5z = 11 \\ 1x - 5y + 6z = 29 \end{cases}
$$

    
    
        
- **Escribimos la matriz ampliada inicial:**
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 2 & 3 & 5 & 11 \\ 1 & -5 & 6 & 29 \end{array}\right)
$$

        
        
- **Primeros ceros en la columna 1** (usando la Fila 1):
        
            
- Para la fila 2: $F_2 \rightarrow F_2 - 2F_1 \quad \rightarrow \quad (0, \ 1, \ 3 \ \mid \ 7)$
            
- Para la fila 3: $F_3 \rightarrow F_3 - F_1 \quad \rightarrow \quad (0, \ -6, \ 5 \ \mid \ 27)$
        
        La matriz intermedia queda así:
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & -6 & 5 & 27 \end{array}\right)
$$

        
        
- **Último cero en la columna 2** (en el $-6$, usando obligatoriamente la Fila 2):
        
            
- Operación: $F_3 \rightarrow F_3 + 6F_2 \quad \rightarrow \quad (0, \ 0, \ 5+6(3) \ \mid \ 27+6(7)) \rightarrow \mathbf{(0, \ 0, \ 23 \ \mid \ 69)}$
        
        La matriz final escalonada por Gauss es:
        
$$
\left(\begin{array}{ccc|c} 1 & 1 & 1 & 2 \\ 0 & 1 & 3 & 7 \\ 0 & 0 & \mathbf{23} & \mathbf{69} \end{array}\right)
$$

        
        
- **Discusión y Resolución (De abajo a arriba):**
        
            
- Como no hay ninguna fila absurda, el sistema es **Compatible Determinado (SCD)** y tiene una única solución.
            
- **Fila 3:** $23z = 69 \longrightarrow z = \frac{69}{23} \longrightarrow \mathbf{z = 3}$
            
- **Fila 2:** $y + 3z = 7 \longrightarrow y + 3(3) = 7 \longrightarrow y + 9 = 7 \longrightarrow \mathbf{y = -2}$
            
- **Fila 1:** $x + y + z = 2 \longrightarrow x + (-2) + 3 = 2 \longrightarrow x + 1 = 2 \longrightarrow \mathbf{x = 1}$
        
    
    
    **Solución del sistema:** $x = 1, \ y = -2, \ z = 3$.

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'algebra-lineal'
  AND topic_slug = 'sistemas-gauss';

-- producto-vectorial
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Repaso: Puntos y Vectores en el Plano ($\mathbb{R
^2$)}
    Un punto representa una posición en el plano. Un vector representa un desplazamiento (dirección, sentido y longitud) entre dos puntos.
    
        
- **Vector entre dos puntos:** Dados $A(x_1, y_1)$ y $B(x_2, y_2)$, el vector $\overrightarrow{AB}$ se calcula restando el destino menos el origen:
        
$$
\overrightarrow{AB} = B - A = (x_2 - x_1, \ y_2 - y_1)
$$

        
- **Punto medio:** El punto medio $M$ de un segmento $AB$ es la media aritmética de sus coordenadas: $M = \left(\frac{x_1+x_2}{2}, \frac{y_1+y_2}{2}\right)$.
    

### Caso Práctico: Vector y Punto Medio

    Dados los puntos $A(-1, 4)$ y $B(3, 2)$ in el plano:
    
        
- **Vector $\overrightarrow{AB|A^{-1}|::} $B - A = (3 - (-1), \ 2 - 4) = \mathbf{(4, \ -2)}$
        
- **Punto medio $M$:** $M = \left(\frac{-1+3}{2}, \ \frac{4+2}{2}\right) = \left(\frac{2}{2}, \ \frac{6}{2}\right) = \mathbf{(1, \ 3)}$
    

## 2. Vectores en el Espacio ($\mathbb{R
^3$)}
    En el espacio tridimensional trabajamos con tres ejes perpendiculares ($X$, $Y$, $Z$). Un vector en el espacio viene definido por tres componentes: $\vec{u} = (u_1, u_2, u_3)$.
    
        
- **Módulo de un vector ($||\vec{u**||$):} Es la longitud o tamaño del vector. Se calcula con el teorema de Pitágoras tridimensional:
        
$$
||\vec{u}|| = \sqrt{(u_1)^2 + (u_2)^2 + (u_3)^2}
$$

    

### Caso Práctico: Módulo de un Vector

    Calcula la longitud (módulo) del vector en el espacio $\vec{u} = (1, \ -2, \ 2)$:
    
$$
||\vec{u}|| = \sqrt{1^2 + (-2)^2 + 2^2} = \sqrt{1 + 4 + 4} = \sqrt{9} = \mathbf{3}
$$

## 3. Operaciones Elementales con Vectores

    Se realizan de forma intuitiva, componente a componente:
    
        
- **Suma y Resta:** $\vec{u} \pm \vec{v} = (u_1 \pm v_1, \ u_2 \pm v_2, \ u_3 \pm v_3)$
        
- **Producto por un número (Escalar):** $k \cdot \vec{u} = (k \cdot u_1, \ k \cdot u_2, \ k \cdot u_3)$
        
- **Vectores paralelos:** Dos vectores son paralelos (tienen la misma dirección) si sus componentes son proporcionales: $\frac{u_1}{v_1} = \frac{u_2}{v_2} = \frac{u_3}{v_3} = k$.
    

### Caso Práctico: Combinación Lineal y Paralelismo

    Sean $\vec{u} = (2, \ 0, \ -1)$ y $\vec{v} = (1, \ 3, \ 4)$. Calcula la combinación $3\vec{u} - 2\vec{v}$:
    
$$
3\vec{u} - 2\vec{v} = 3(2, \ 0, \ -1) - 2(1, \ 3, \ 4) = (6, \ 0, \ -3) - (2, \ 6, \ 8) = \mathbf{(4, \ -6, \ -11)}
$$

## 4. Dependencia Lineal y Rango de Vectores

    Sirve para saber si un conjunto de vectores aporta información nueva o si están "repetidos" (son paralelos o combinaciones de otros).
    
        
- **Linealmente Dependientes (L.D.):** Uno de ellos se puede escribir como combinación de los demás. Si metemos los vectores en una matriz, su determinante dará **cero**.
        
- **Linealmente Independientes (L.I.):** Ninguno se puede obtener a partir de los otros. Su determinante asociado es **distinto de cero**.
        
- **Rango del conjunto:** Es el número máximo de vectores L.I. que contiene. Se calcula buscando el rango de la matriz que forman.
    

### Caso Práctico: Estudiar Independencia Lineal

    Estudia si los vectores $\vec{u}=(1,0,2)$, $\vec{v}=(0,1,1)$ y $\vec{w}=(1,1,3)$ son L.I. o L.D.:
    
        
- Planteamos el determinante con los vectores colocados por filas:
        
$$
\begin{vmatrix} 1 & 0 & 2 \\ 0 & 1 & 1 \\ 1 & 1 & 3 \end{vmatrix} = (3 + 0 + 0) - (2 + 1 + 0) = 3 - 3 = \mathbf{0}
$$

        
- Como el determinante es **igual a 0**, los vectores son **Linealmente Dependientes (L.D.)**. No forman una base del espacio.
    

## 5. Base y Sistema de Referencia en el Espacio

    
        
- **Base:** Tres vectores cualesquiera del espacio que sean **Linealmente Independientes** forman una base. Esto significa que cualquier otro vector se puede escribir como combinación de ellos de forma única.
        
- **Base Canónica:** Es la base estándar formada por los vectores unitarios y perpendiculares de los ejes coordenados: $\vec{i}=(1,0,0)$, $\vec{j}=(0,1,0)$, $\vec{k}=(0,0,1)$.
        
- **Sistema de Referencia ($R$):** Formado por un punto origen $O(0,0,0)$ y una base. Nos permite localizar cualquier punto del espacio mediante coordenadas.
    

### Caso Práctico: Expresar en la Base Canónica

    Si un vector tiene componentes $\vec{v} = (5, \ -3, \ 8)$, escribir su expresión analítica usando los vectores de la base canónica:
    
$$
\vec{v} = 5\vec{i} - 3\vec{j} + 8\vec{k}
$$

## 6. Producto Escalar de dos Vectores ($\vec{u
 \cdot \vec{v}$)}
    **¡Cuidado!:** El resultado del producto escalar es un **NÚMERO**, no un vector.
    
        
- **Fórmula analítica:** Multiplicar componente a componente y sumar:
        
$$
\vec{u} \cdot \vec{v} = u_1 \cdot v_1 + u_2 \cdot v_2 + u_3 \cdot v_3
$$

        
- **Fórmula geométrica:** $\vec{u} \cdot \vec{v} = ||\vec{u}|| \cdot ||\vec{v}|| \cdot \cos(\alpha)$ (donde $\alpha$ es el ángulo entre ambos).
        
- **Cálculo del Ángulo:** $\cos(\alpha) = \frac{\vec{u} \cdot \vec{v}}{||\vec{u}|| \cdot ||\vec{v}||}$
        
- **Condición de Perpendicularidad ($\vec{u** \perp \vec{v}$):} Dos vectores son perpendiculares si y solo si su producto escalar es **CERO** ($\vec{u} \cdot \vec{v} = 0$).
    

### Caso Práctico: Producto Escalar y Perpendicularidad

    Determina si los vectores $\vec{u} = (2, \ 3, \ -1)$ y $\vec{v} = (5, \ -2, \ 4)$ son perpendiculares:
    
        
- Calculamos el producto escalar:
        
$$
\vec{u} \cdot \vec{v} = 2 \cdot 5 + 3 \cdot (-2) + (-1) \cdot 4 = 10 - 6 - 4 = \mathbf{0}
$$

        
- Como el resultado es **0**, concluimos que los vectores son **perpendiculares** ($\vec{u} \perp \vec{v}$).
    

## 7. Producto Vectorial ($\vec{u
 \times \vec{v}$)}
    **¡Cuidado!:** El resultado del producto vectorial es un **VECTOR**. Este vector resultante tiene la propiedad de ser **perpendicular a la vez** a los dos vectores originales.
    
        
- **Cómo se calcula:** Se resuelve planteando un determinante ficticio donde la primera fila son los vectores de la base canónica $\vec{i}, \vec{j}, \vec{k}$:
        
$$
\vec{u} \times \vec{v} = \begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \end{vmatrix}
$$

        
- **Aplicación geométrica:** El módulo del producto vectorial $||\vec{u} \times \vec{v}||$ mide exactamente el **Área del Paralelogramo** que forman ambos vectores. 
        
- El **Área del Triángulo** será la mitad: $\text{Área} = \frac{1}{2} ||\vec{u} \times \vec{v}||$.
    

### Caso Práctico: Calcular Producto Vectorial y Área

    Halla el área del triángulo determinado por los vectores $\vec{u} = (1, \ 2, \ 0)$ y $\vec{v} = (0, \ 3, \ 1)$:
    
        
- **Cálculo de $\vec{u** \times \vec{v}$ por Sarrus:}
        
$$
\begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ 1 & 2 & 0 \\ 0 & 3 & 1 \end{vmatrix} = (2\vec{i} + 0 + 3\vec{k}) - (0 + 0 + 1\vec{j}) = 2\vec{i} - 1\vec{j} + 3\vec{k} \rightarrow \mathbf{(2, \ -1, \ 3)}
$$

        
- **Módulo del vector resultante (Área del paralelogramo):**
        
$$
||\vec{u} \times \vec{v}|| = \sqrt{2^2 + (-1)^2 + 3^2} = \sqrt{4 + 1 + 9} = \sqrt{14}
$$

        
- **Área del triángulo:** $\frac{\sqrt{14}}{2} \approx \mathbf{1.87}$.
    

## 8. Producto Mixto

    Combina el producto escalar y el vectorial de tres vectores. El resultado es un **NÚMERO**.
    
        
- **Cómo se calcula:** Es sencillamente el determinante de la matriz formada por los tres vectores colocados en filas:
        
$$
[\vec{u}, \vec{v}, \vec{w}] = \begin{vmatrix} u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix}
$$

        
- **Aplicación geométrica:** El valor absoluto del producto mixto representa el **Volumen del Paralelepípedo** (caja tridimensional) que forman los tres vectores.
        
- El **Volumen del Tetraedro** (pirámide triangular) que forman es la sexta parte: $\text{Volumen} = \frac{1}{6} |[\vec{u}, \vec{v}, \vec{w}]|$.
    

### Caso Práctico: Volumen de un Tetraedro

    Calcula el volumen del tetraedro delimitado por los vectores $\vec{u}=(1,1,0)$, $\vec{v}=(0,2,1)$ y $\vec{w}=(2,0,3)$:
    
        
- **Calculamos el determinante del Producto Mixto:**
        
$$
[\vec{u}, \vec{v}, \vec{w}] = \begin{vmatrix} 1 & 1 & 0 \\ 0 & 2 & 1 \\ 2 & 0 & 3 \end{vmatrix} = (6 + 2 + 0) - (0 + 0 + 0) = \mathbf{8}
$$

        
- **Aplicamos la fórmula del volumen del tetraedro:**
        
$$
\text{Volumen} = \frac{1}{6} \cdot |8| = \frac{8}{6} = \mathbf{\frac{4}{3} \approx 1.33}
$$

    

## 9. La Recta en el Espacio (Ecuaciones)

    Según el apartado 1 del PDF, una recta se define con un punto $A(x_0, y_0, z_0)$ y un vector director $\vec{v}(v_1, v_2, v_3)$:
    
        
- **Vectorial:** $(x, y, z) = (x_0, y_0, z_0) + \lambda(v_1, v_2, v_3)$
        
- **Paramétricas:** $\begin{cases} x = x_0 + \lambda v_1 \\ y = y_0 + \lambda v_2 \\ z = z_0 + \lambda v_3 \end{cases}$
        
- **Continua:** $\frac{x - x_0}{v_1} = \frac{y - y_0}{v_2} = \frac{z - z_0}{v_3}$
        
- **Implícitas / Cartesianas:** Intersección de dos planos $\begin{cases} Ax + By + Cz + D = 0 \\ A'x + B'y + C'z + D' = 0 \end{cases}$
    

### Caso Práctico: Ecuaciones de la Recta

    Halla las ecuaciones de la recta que pasa por $A(1, -2, 3)$ con dirección $\vec{v}(4, 0, -1)$:
    
        
- **Continua:** $\frac{x - 1}{4} = \frac{y + 2}{0} = \frac{z - 3}{-1}$
        
- **Paramétricas:** $\begin{cases} x = 1 + 4\lambda \\ y = -2 \\ z = 3 - \lambda \end{cases}$
    

## 10. El Plano en el Espacio

    Según el apartado 2 del PDF, un plano se genera con un punto $A(x_0, y_0, z_0)$ y dos vectores directores, o bien mediante un **vector normal** $\vec{n}(A, B, C)$ perpendicular a la superficie.
    
        
- **Ecuación General o Implícita:** $Ax + By + Cz + D = 0$
        
- Si nos dan tres puntos ($A$, $B$ y $C$), calculamos los vectores $\overrightarrow{AB}$ y $\overrightarrow{AC}$, resolviendo el determinante:
        
$$
\begin{vmatrix} x - x_0 & y - y_0 & z - z_0 \\ u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \end{vmatrix} = 0
$$

    

### Caso Práctico: Ecuación del Plano

    Determina la ecuación del plano que pasa por $A(2, 0, 1)$ y tiene como vector normal $\vec{n}(1, -3, 2)$:
    
        
- Usamos los componentes de $\vec{n}$ para el inicio de la ecuación: $1x - 3y + 2z + D = 0$.
        
- Sustituimos el punto $A$ para despejar $D$: $1(2) - 3(0) + 2(1) + D = 0 \longrightarrow 2 + 2 + D = 0 \longrightarrow D = -4$.
        
- **Resultado:** $x - 3y + 2z - 4 = 0$.
    

## 11. Posiciones Relativas (Apartados 3 y 4 del PDF)

    Estudio de la disposición de los elementos en el espacio analizando sus vectores directores ($\vec{u}, \vec{v}$) o normales ($\vec{n}$):
    
        
- **Entre dos rectas:** Si sus directores son proporcionales, son **paralelas** o **coincidentes**. Si no lo son, calculamos el determinante con el vector puente $\overrightarrow{AB}$: si da cero **se cortan**, si no da cero **se cruzan**.
        
- **Entre recta y plano:** Calculamos el producto escalar $\vec{v} \cdot \vec{n}$. Si es distinto de cero, son **secantes** (se cortan). Si da cero, la recta es **paralela** o está **contenida**.
    

### Caso Práctico: Recta y Plano

    Estudia la posición de la recta con director $\vec{v}(1, 2, -1)$ y el plano de ecuación normal $2x - y + 3z - 1 = 0$:
    
        
- Identificamos el vector normal del plano: $\vec{n}(2, -1, 3)$.
        
- Realizamos el producto escalar: $\vec{v} \cdot \vec{n} = 1(2) + 2(-1) + (-1)(3) = 2 - 2 - 3 = -3$.
        
- Como $-3 \neq 0$, la recta y el plano son **secantes** y se cortan en un único punto.
    

## 12. Ángulos en el Espacio (Apartado 1 del PDF)

    Todos se resuelven con el producto escalar en valor absoluto (para asegurar el ángulo agudo):
    
        
- **Dos rectas o dos planos:** Se aplica la función coseno habitual:
        
$$
\cos(\alpha) = \frac{|\vec{u} \cdot \vec{v}|}{||\vec{u}|| \cdot ||\vec{v}||}
$$

        
- **Entre recta y plano:** Al combinar un vector de dirección con uno normal, la fórmula del ángulo cambia a la función **SENO**:
        
$$
\sin(\alpha) = \frac{|\vec{v} \cdot \vec{n}|}{||\vec{v}|| \cdot ||\vec{n}||}
$$

    

### Caso Práctico: Ángulo Recta-Plano

    Halla el ángulo entre la recta con director $\vec{v}(1, 0, 1)$ y el plano con normal $\vec{n}(1, 1, 0)$:
    
        
- $\vec{v} \cdot \vec{n} = 1(1) + 0(1) + 1(0) = 1$
        
- $||\vec{v}|| = \sqrt{1^2+0^2+1^2} = \sqrt{2}; \quad ||\vec{n}|| = \sqrt{1^2+1^2+0^2} = \sqrt{2}$
        
- Aplicamos la fórmula del seno: $\sin(\alpha) = \frac{1}{\sqrt{2} \cdot \sqrt{2}} = \frac{1}{2}$
        
- Calculamos el arcoseno: $\alpha = \arcsin(0.5) = \mathbf{30^\circ}$.
    

## 13. Proyecciones Ortogonales y Puntos Simétricos (Apartado 2)

    Conceptos clave para resolver figuras simétricas y reflexiones en el espacio:
    
        
- **Proyección de un punto $P$ sobre un plano $\pi$:** Es el punto $M$ donde la recta perpendicular a $\pi$ que pasa por $P$ corta al propio plano.
        
- **Punto Simétrico $P'$ respecto a un plano:** El punto de proyección $M$ actúa como el punto medio exacto del segmento que une $P$ con su simétrico $P'$. Por tanto:
        
$$
P' = 2M - P
$$

    

### Caso Práctico: Punto Simétrico respecto a un Plano

    Halla el punto simétrico de $P(1, 0, 3)$ respecto al plano $\pi: x + y + z - 1 = 0$:
    
        
- Creamos la recta perpendicular a $\pi$ que pasa por $P$: $\begin{cases} x = 1 + \lambda \\ y = \lambda \\ z = 3 + \lambda \end{cases}$
        
- Buscamos la proyección $M$ sustituyendo la recta en el plano: $(1+\lambda) + (\lambda) + (3+\lambda) - 1 = 0 \longrightarrow 3\lambda + 3 = 0 \longrightarrow \lambda = -1$.
        
- Calculamos las coordenadas de $M$: $M(1-1, -1, 3-1) = M(0, -1, 2)$.
        
- Calculamos el punto simétrico $P'$: $P' = 2(0, -1, 2) - (1, 0, 3) = \mathbf{(-1, -2, 1)}$.
    

## 14. Distancias en el Espacio (Apartado 3 del PDF)

    Ecuaciones directas para calcular longitudes mínimas entre elementos métricos:
    
        
- **De Punto a Plano:** $d(P, \pi) = \frac{|Ax_0 + By_0 + Cz_0 + D|}{\sqrt{A^2 + B^2 + C^2}}$
        
- **De Punto a Recta:** Usamos el módulo del producto vectorial:
        
$$
d(P, r) = \frac{||\overrightarrow{AP} \times \vec{v}||}{||\vec{v}||}
$$

        
- **Entre dos rectas que se cruzan:** Dividimos el determinante del producto mixto entre el módulo del vectorial:
        
$$
d(r, s) = \frac{|\det(\vec{u}, \vec{v}, \overrightarrow{AB})|}{||\vec{u} \times \vec{v}||}
$$

    

### Caso Práctico: Distancia de Punto a Plano

    Calcula la distancia desde el origen de coordenadas $O(0, 0, 0)$ al plano $\pi: 3x - 4y + 5 = 0$:
    
        
- Aplicamos los valores en la fórmula correspondiente:
        
$$
d(O, \pi) = \frac{|3(0) - 4(0) + 5|}{\sqrt{3^2 + (-4)^2 + 0^2}}
$$

        
- Resolvemos la expresión: $d(O, \pi) = \frac{5}{\sqrt{9+16}} = \frac{5}{\sqrt{25}} = \frac{5}{5} = \mathbf{1 \text{ unidad}}$.
    

## 15. Áreas y Volúmenes (Apartado 4 del PDF)

    Aplicaciones geométricas definitivas de los productos vectoriales y mixtos:
    
        
- **Área de un Triángulo:** Mitad del módulo del producto vectorial de dos de sus vectores: $\text{Área} = \frac{1}{2} ||\vec{u} \times \vec{v}||$.
        
- **Volumen de un Tetraedro:** La sexta parte del valor absoluto del determinante del producto mixto:
        
$$
\text{Volumen} = \frac{1}{6} |\det(\vec{u}, \vec{v}, \vec{w})|
$$

    

### Caso Práctico: Área de un Triángulo

    Calcula el área del triángulo determinado por los vectores del espacio $\vec{u}(2, 0, 0)$ y $\vec{v}(0, 3, 0)$:
    
        
- Calculamos el producto vectorial de las direcciones:
        
$$
\vec{u} \times \vec{v} = \begin{vmatrix} \vec{i} & \vec{j} & \vec{k} \\ 2 & 0 & 0 \\ 0 & 3 & 0 \end{vmatrix} = 6\vec{k} \longrightarrow (0, 0, 6)
$$

        
- Obtenemos el módulo del vector resultante: $||(0, 0, 6)|| = \sqrt{0^2+0^2+6^2} = 6$.
        
- Dividimos entre dos para hallar el área triangular: $\text{Área} = \frac{6}{2} = \mathbf{3 \text{ u}^2}$.

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'geometria-3d'
  AND topic_slug = 'producto-vectorial';

-- limites-continuidad
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Idea Intuitiva de Límite

    El límite de una función $f(x)$ en un punto $c$ es el valor $L$ al que se aproximan las imágenes de la función a medida que los valores de $x$ se acercan a $c$. No importa lo que ocurra exactamente en el punto $x = c$ (puede no estar definido), sino el comportamiento en sus cercanías inmediatas.

### Caso Práctico: Idea Intuitiva

    Observa el comportamiento de $f(x) = x + 2$ cuando $x$ se aproxima a $3$.
    
        
- Evaluamos valores próximos por la izquierda: $f(2.9) = 4.9$; $f(2.99) = 4.99$.
        
- Evaluamos valores próximos por la derecha: $f(3.1) = 5.1$; $f(3.01) = 5.01$.
        
- En ambos casos las imágenes se acercan a $5$. Por tanto, $\lim_{x \to 3} (x + 2) = \mathbf{5}$.
    

## 2. Definición Matemática de Límite y Límites Laterales

    Formalmente, $\lim_{x \to c} f(x) = L$ si para todo $\varepsilon > 0$ existe un $\delta > 0$ tal que si $0 < |x - c| < \delta$, entonces $|f(x) - L| < \varepsilon$.
    
        
- **Límites Laterales:** El límite global existe si y solo si los límites por la izquierda y por la derecha existen y valen lo mismo:
        
$$
\lim_{x \to c^-} f(x) = \lim_{x \to c^+} f(x) = L
$$

    

### Caso Práctico: Límites Laterales en Funciones a Trozos

    Determina si existe el límite en $x = 1$ de: $f(x) = \begin{cases} 2x & \text{si } x < 1 \\ 4 - x & \text{si } x \ge 1 \end{cases}$
    
        
- Límite por la izquierda: $\lim_{x \to 1^-} 2x = 2(1) = 2$.
        
- Límite por la derecha: $\lim_{x \to 1^+} (4 - x) = 4 - 1 = 3$.
        
- Como $\lim_{x \to 1^-} f(x) \neq \lim_{x \to 1^+} f(x)$, el límite global **no existe**.
    

## 3. Operaciones con Límites

    Si existen $\lim_{x \to c} f(x) = L$ y $\lim_{x \to c} g(x) = M$, se cumplen las siguientes propiedades algebraicas básicas:
    
        
- **Suma/Resta:** $\lim [f(x) \pm g(x)] = L \pm M$
        
- **Producto:** $\lim [f(x) \cdot g(x)] = L \cdot M$
        
- **Cociente:** $\lim [f(x) / g(x)] = L / M$ (siempre que $M \neq 0$)
        
- **Potencia:** $\lim [f(x)^{g(x)}] = L^M$ (si $L > 0$)
    

### Caso Práctico: Aplicación de Propiedades

    Sabiendo que $\lim_{x \to c} f(x) = 4$ y $\lim_{x \to c} g(x) = 2$, calcula $\lim_{x \to c} \frac{f(x) + 3}{g(x)^2}$.
    
        
- Aplicamos las propiedades de la suma, cociente y potencia de límites:
        
$$
\lim_{x \to c} \frac{f(x) + 3}{g(x)^2} = \frac{\lim f(x) + 3}{(\lim g(x))^2} = \frac{4 + 3}{2^2} = \mathbf{\frac{7}{4}}
$$

    

## 4. Límites Infinitos

    Describe situaciones donde los valores de la función o de la variable crecen o decrecen sin límite:
    
        
- **En un punto finito:** $\lim_{x \to c} f(x) = \pm\infty$ (indica la presencia de una asíntota vertical).
        
- **En el infinito:** $\lim_{x \to \pm\infty} f(x) = L$ (indica una asíntota horizontal) o $\lim_{x \to \pm\infty} f(x) = \pm\infty$ (ramas parabólicas).
    

### Caso Práctico: Límite Infinito en un Punto

    Calcula el límite: $\lim_{x \to 2^+} \frac{1}{x - 2}$.
    
        
- Al sustituir, el denominador se aproxima a $0$ a través de valores positivos (ej. $2.01 - 2 = 0.01$).
        
- Una constante positiva dividida por un número positivo extremadamente pequeño da como resultado: $\mathbf{+\infty}$.
    

## 5. Cálculo de Límites e Indeterminaciones

    Al evaluar límites directos podemos encontrarnos con expresiones matemáticas cuyo resultado no está determinado de forma inmediata. Las principales son:
    
        
- $\frac{0}{0}$ (se resuelve factorizando o usando conjugados).
        
- $\frac{\infty}{\infty}$ (se resuelve comparando los grados de los términos principales).
        
- $\infty - \infty$ (se opera combinando fracciones o racionalizando).
        
- $1^\infty$ (se aplica la fórmula directa basada en el número $e$).
    

### Caso Práctico: Indeterminación Uno elevado a Infinito

    Calcula el límite: $\lim_{x \to \infty} \left(\frac{x + 3}{x + 1}\right)^x$.
    
        
- Al sustituir la base tiende a $1$ y el exponente a $\infty$, generando la forma $1^\infty$.
        
- Aplicamos la fórmula del número $e$: $e^{\lim_{x \to \infty} x \cdot \left(\frac{x + 3}{x + 1} - 1\right)}$.
        
- Operamos la fracción interna: $\frac{x + 3 - (x + 1)}{x + 1} = \frac{2}{x + 1}$.
        
- Resolvemos el límite del exponente: $\lim_{x \to \infty} \frac{2x}{x + 1} = 2$. Resultado final: $\mathbf{e^2}$.
    

## 6. Continuidad de una Función y Tipos de Discontinuidad

    Una función $f(x)$ es continua en un punto $x = c$ si se cumplen tres condiciones: existe $f(c)$, existe $\lim_{x \to c} f(x)$ y ambos valores coinciden. Si no se cumple, la discontinuidad puede ser:
    
        
- **Evitable:** Existe el límite finito pero no coincide con el valor de la función.
        
- **Inevitable de salto finito:** Los límites laterales son finitos pero distintos.
        
- **Inevitable de salto infinito:** Al menos uno de los límites laterales es $\pm\infty$.
    

### Caso Práctico: Clasificación de una Discontinuidad

    Estudia la continuidad de $f(x) = \frac{x^2 - 1}{x - 1}$ en el punto crítico $x = 1$.
    
        
- $f(1) = \frac{0}{0}$, por lo que la función no está definida en ese punto.
        
- Calculamos el límite simplificando la expresión:
        
$$
\lim_{x \to 1} \frac{(x - 1)(x + 1)}{x - 1} = \lim_{x \to 1} (x + 1) = 2
$$

        
- Como el límite es un número real pero la función no existe en el punto, es una **discontinuidad evitable** en $x = 1$.

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'analisis'
  AND topic_slug = 'limites-continuidad';

-- derivadas-optimizacion
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Concepto de Derivada en un Punto e Interpretación Geométrica

    La derivada de $f(x)$ en $x = c$ es la tasa de variación instantánea de la función:
    
$$
f'(c) = \lim_{h \to 0} \frac{f(c + h) - f(c)}{h}
$$

    
        
- **Interpretación Geométrica:** El valor de $f'(c)$ es la **pendiente** ($m$) de la recta tangente a la curva en el punto $(c, f(c))$.
        
- **Ecuación de la recta tangente:** $y - f(c) = f'(c) \cdot (x - c)$.
    

### Caso Práctico: Recta Tangente

    Halla la recta tangente a la curva $f(x) = x^2 + 1$ en el punto de abscisa $x = 2$.
    
        
- Calculamos la ordenada: $f(2) = 2^2 + 1 = 5$. El punto es $(2, 5)$.
        
- Derivamos la función de forma general: $f'(x) = 2x$.
        
- Evaluamos en el punto para hallar la pendiente: $m = f'(2) = 2(2) = 4$.
        
- Aplicamos la fórmula punto-pendiente: $y - 5 = 4(x - 2) \longrightarrow \mathbf{y = 4x - 3}$.
    

## 2. Cálculo de Derivadas y Regla de la Cadena

    Permite calcular derivadas mediante tablas de reglas algebraicas inmediatas:
    
        
- **Producto:** $(u \cdot v)' = u' \cdot v + u \cdot v'$
        
- **Cociente:** $\left(\frac{u}{v}\right)' = \frac{u' \cdot v - u \cdot v'}{v^2}$
        
- **Regla de la Cadena:** Para funciones compuestas $f(g(x))$, la derivada es el producto de la derivada exterior evaluada en la interior por la derivada de la interior:
        
$$
[f(g(x))]' = f'(g(x)) \cdot g'(x)
$$

    

### Caso Práctico: Regla de la Cadena

    Calcula la derivada de la función compuesta: $f(x) = \sin(5x^2)$.
    
        
- Derivada de la función externa (seno): $\cos(5x^2)$.
        
- Derivada de la función interna ($5x^2$): $10x$.
        
- Multiplicamos ambos componentes según la regla: $f'(x) = \mathbf{10x \cdot \cos(5x^2)}$.
    

## 3. Teoremas de Valor Medio (Rolle y del Valor Medio)

    Garantizan la existencia de puntos notables bajo condiciones de continuidad y derivabilidad:
    
        
- **Teorema de Rolle:** Si $f(x)$ es continua en $[a, b]$, derivable en $(a, b)$ y además $f(a) = f(b)$, entonces existe al menos un punto $c \in (a, b)$ tal que $f'(c) = 0$.
        
- **Teorema del Valor Medio (Lagrange):** Bajo las mismas condiciones de continuidad y derivabilidad, existe un punto $c \in (a, b)$ tal que:
        
$$
f'(c) = \frac{f(b) - f(a)}{b - a}
$$

    

### Caso Práctico: Teorema de Rolle

    Verifica si $f(x) = x^2 - 2x$ cumple el Teorema de Rolle en $[0, 2]$ y halla el punto $c$.
    
        
- Al ser polinómica, es continua en $[0, 2]$ y derivable en $(0, 2)$.
        
- Comprobamos los extremos: $f(0) = 0$ y $f(2) = 2^2 - 2(2) = 0$. Al ser iguales, se cumple el teorema.
        
- Derivamos e igualamos a cero: $f'(x) = 2x - 2 \longrightarrow 2c - 2 = 0 \longrightarrow \mathbf{c = 1}$. El punto $1$ pertenece al intervalo abierto $(0, 2)$.
    

## 4. Información Extraída de la Propia Función

    Antes de analizar las derivadas, se estudian los rasgos globales directos de la ecuación de $f(x)$:
    
        
- **Dominio:** Valores de $x$ para los que existe la función.
        
- **Cortes con los ejes:** Eje $OX$ haciendo $f(x) = 0$; Eje $OY$ haciendo $x = 0$.
        
- **Simetría:** Par si $f(-x) = f(x)$; Impar si $f(-x) = -f(x)$.
        
- **Periodicidad:** $f(x + T) = f(x)$.
        
- **Asíntotas:** Líneas de aproximación vertical ($x=k$), horizontal ($y=L$) u oblicua ($y=mx+n$).
    

### Caso Práctico: Asíntota Oblicua

    Halla la asíntota oblicua de la función racional: $f(x) = \frac{x^2 + 1}{x}$.
    
        
- Calculamos la pendiente $m$: $\lim_{x \to \infty} \frac{f(x)}{x} = \lim_{x \to \infty} \frac{x^2 + 1}{x^2} = 1$.
        
- Calculamos la ordenada en el origen $n$: $\lim_{x \to \infty} [f(x) - mx] = \lim_{x \to \infty} \left[\frac{x^2 + 1}{x} - x\right] = \lim_{x \to \infty} \frac{1}{x} = 0$.
        
- La ecuación de la asíntota oblicua es la recta: $\mathbf{y = x}$.
    

## 5. Información Extraída de la Primera y Segunda Derivada

    El signo de las derivadas sucesivas determina las variaciones geométricas locales de la curva:
    
        
- **Primera Derivada ($f'$):** Determina la monotonía. Si $f'(x) > 0$ la función crece; si $f'(x) < 0$ decrece. Los puntos donde $f'(x) = 0$ son puntos críticos.
        
- **Segunda Derivada ($f''$):** Determina la curvatura. Si $f''(x) > 0$ es convexa ($\cup$); si $f''(x) < 0$ es cóncava ($\cap$). Permite clasificar los extremos relativos y hallar los puntos de inflexión (donde $f''(x) = 0$ y cambia el signo de la curvatura).
    

### Caso Práctico: Determinación de Máximos y Mínimos

    Clasifica los puntos críticos de la función $f(x) = x^3 - 3x$.
    
        
- Calculamos la primera derivada e igualamos a cero: $3x^2 - 3 = 0 \longrightarrow x = 1, \ x = -1$.
        
- Calculamos la segunda derivada: $f''(x) = 6x$.
        
- Evaluamos $x = 1$: $f''(1) = 6 > 0 \longrightarrow$ Hay un **mínimo relativo** en $(1, -2)$.
        
- Evaluamos $x = -1$: $f''(-1) = -6 < 0 \longrightarrow$ Hay un **máximo relativo** en $(-1, 2)$.

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'analisis'
  AND topic_slug = 'derivadas-optimizacion';

-- areas-integrales
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Primitiva de una Función y la Integral Indefinida

    Una función $F(x)$ es una primitiva de $f(x)$ si se cumple que $F'(x) = f(x)$. 
    
        
- **Integral Indefinida:** Es el conjunto de todas las funciones primitivas posibles de una función y se expresa añadiendo una constante de integración real $C$:
        
$$
\int f(x) \, dx = F(x) + C
$$

        
- Sigue propiedades de linealidad: permite extraer constantes multiplicativas y separar sumas o restas de funciones.
    

### Caso Práctico: Propiedades de Linealidad

    Resuelve la siguiente integral indefinida combinada: $\int (3x^2 + 2x) \, dx$.
    
        
- Separamos la integral aplicando la suma y extraemos las constantes numéricas:
        
$$
3 \int x^2 \, dx + 2 \int x \, dx = 3 \left(\frac{x^3}{3}\right) + 2 \left(\frac{x^2}{2}\right) + C = \mathbf{x^3 + x^2 + C}
$$

    

## 2. Integrales de Funciones Elementales (Inmediatas)

    Son integrales que se obtienen de forma directa aplicando de manera inversa la tabla estándar de las derivadas de las funciones más sencillas:
    
        
- **Potenciales:** $\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$
        
- **Logarítmicas:** $\int \frac{1}{x} \, dx = \ln|x| + C$
        
- **Exponenciales:** $\int e^x \, dx = e^x + C$
        
- **Trigonométricas:** $\int \cos x \, dx = \sin x + C$
    

### Caso Práctico: Integral Inmediata Compuesta

    Resuelve la integral racional inmediata: $\int \frac{5}{x} \, dx$.
    
        
- Extraemos la constante multiplicativa fuera del símbolo de integración: $5 \int \frac{1}{x} \, dx$.
        
- Aplicamos directamente la regla de la primitiva logarítmica: $\mathbf{5 \ln|x| + C}$.
    

## 3. Métodos de Integración

    Estrategias analíticas algebraicas para transformar integrales complejas en formas inmediatas:
    
        
- **Cambio de Variable:** Se introduce una nueva variable $t = g(x)$, calculando su diferencial $dt = g'(x)dx$.
        
- **Por Partes:** Se emplea para productos de funciones heterogéneas, siguiendo la regla mnemotécnica ALPES para asignar las variables:
        
$$
\int u \, dv = u \cdot v - \int v \, du
$$

        
- **Racionales:** Integración de $\frac{P(x)}{Q(x)}$ mediante descomposición en fracciones simples si el grado de $P(x)$ es menor que el de $Q(x)$.
    

### Caso Práctico: Integración por Partes

    Calcula la integral: $\int x \cdot \cos x \, dx$.
    
        
- Elegimos las variables por prioridad ALPES: $u = x \rightarrow du = dx$; $dv = \cos x \, dx \rightarrow v = \sin x$.
        
- Aplicamos la fórmula fundamental:
        
$$
\int x \cdot \cos x \, dx = x \cdot \sin x - \int \sin x \, dx
$$

        
- Resolvemos la integral restante: $\mathbf{x \cdot \sin x + \cos x + C}$.
    

## 4. La Integral Definida (Regla de Barrow y Áreas)

    La integral definida calcula el valor neto del área encerrada por una curva en un intervalo cerrado:
    
        
- **Regla de Barrow:** Si $F(x)$ es una primitiva de $f(x)$ en el intervalo $[a, b]$, entonces:
        
$$
\int_{a}^{b} f(x) \, dx = [F(x)]_a^b = F(b) - F(a)
$$

        
- **Cálculo de Áreas:** Para evitar que las áreas situadas por debajo del eje horizontal se resten, se calculan las raíces de la función en el intervalo y se integra aplicando valores absolutos por tramos.
    

### Caso Práctico: Cálculo de Área con Barrow

    Halla el área encerrada por $f(x) = x^2$ entre las rectas verticales $x = 0$ y $x = 3$.
    
        
- Planteamos la integral definida: $\int_{0}^{3} x^2 \, dx$.
        
- Hallamos la primitiva de la función: $F(x) = \frac{x^3}{3}$.
        
- Evaluamos los límites aplicando la Regla de Barrow:
        
$$
\int_{0}^{3} x^2 \, dx = \left[ \frac{x^3}{3} \right]_0^3 = \frac{3^3}{3} - \frac{0^3}{3} = 9 - 0 = \mathbf{9 \text{ u}^2}
$$

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'integrales'
  AND topic_slug = 'areas-integrales';

-- probabilidad-combinatoria
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Álgebra de Sucesos y Tipos de Experimentos

    Conceptos básicos de la teoría de conjuntos aplicados a la aleatoriedad:
    
        
- **Espacio Muestral ($\Omega$):** Conjunto de todos los resultados posibles.
        
- **Operaciones:** Unión ($A \cup B$, ocurre al menos uno), Intersección ($A \cap B$, ocurren ambos simultáneamente) y Contrario ($\bar{A}$, no ocurre $A$).
        
- **Leyes de Morgan:** $\overline{A \cup B} = \bar{A} \cap \bar{B}$ y $\overline{A \cap B} = \bar{A} \cup \bar{B}$.
    

### Caso Práctico: Aplicación de las Leyes de Morgan

    Sabiendo que $P(A \cup B) = 0.7$, halla la probabilidad de que no ocurra ni el suceso $A$ ni el suceso $B$, es decir, $P(\bar{A} \cap \bar{B})$.
    
        
- Por la primera Ley de Morgan, sabemos que $\bar{A} \cap \bar{B} = \overline{A \cup B}$.
        
- Aplicamos la propiedad del suceso contrario:
        
$$
P(\bar{A} \cap \bar{B}) = 1 - P(A \cup B) = 1 - 0.7 = \mathbf{0.3}
$$

    

## 2. Asignación de Probabilidades (Regla de Laplace)

    Si todos los resultados de un espacio muestral finito son equiprobables (tienen la misma probabilidad de ocurrir), la probabilidad de un suceso $A$ se calcula mediante la relación directa:
    
$$
P(A) = \frac{\text{Número de casos favorables}}{\text{Número de casos posibles}}
$$

    La probabilidad es siempre un valor numérico acotado en el intervalo $[0, 1]$.

### Caso Práctico: Regla de Laplace

    Calcula la probabilidad de obtener un número par al lanzar un dado regular de 6 caras.
    
        
- Casos posibles: $\Omega = \{1, 2, 3, 4, 5, 6\} \longrightarrow 6$ casos.
        
- Casos favorables (números pares): $A = \{2, 4, 6\} \longrightarrow 3$ casos.
        
- Aplicamos Laplace: $P(A) = \frac{3}{6} = \mathbf{0.5}$ (es decir, un $50\%$).
    

## 3. Definición Axiomática de Probabilidad (Kolmogorov)

    La probabilidad es una función que asigna a cada suceso un número real cumpliendo tres axiomas fundamentales:
    
        
- $P(A) \ge 0$ para cualquier suceso $A$.
        
- $P(\Omega) = 1$ (la probabilidad del suceso seguro es la unidad).
        
- Si $A$ y $B$ son sucesos incompatibles ($A \cap B = \emptyset$), entonces $P(A \cup B) = P(A) + P(B)$.
    
    De aquí se deduce la regla general para sucesos compatibles: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.

### Caso Práctico: Sucesos Compatibles

    Dados dos sucesos con $P(A) = 0.6$, $P(B) = 0.4$ y $P(A \cap B) = 0.2$, calcula $P(A \cup B)$.
    
        
- Aplicamos la fórmula deducida de los axiomas para sucesos con elementos comunes:
        
$$
P(A \cup B) = 0.6 + 0.4 - 0.2 = \mathbf{0.8}
$$

    

## 4. Diagramas de Árbol y Tablas de Contingencia

    Herramientas organizativas para experimentos compuestos de varias etapas:
    
        
- **Diagramas de Árbol:** Se ramifican las opciones secuenciales indicando las probabilidades en cada rama. La probabilidad de un camino es el producto de sus ramas.
        
- **Tablas de Contingencia:** Tablas cruzadas bidimensionales útiles para organizar conjuntos con dos características independientes (ej. género y aficiones).
    

### Caso Práctico: Tabla de Contingencia

    En un grupo de 60 mujeres y 40 hombres, 20 mujeres juegan al tenis. Sabiendo que hay 45 tenistas en total, halla la probabilidad de que un individuo elegido al azar sea un hombre que juega al tenis.
    
        
- Si hay 45 tenistas y 20 son mujeres, el número de hombres tenistas es $45 - 20 = 25$.
        
- El total de personas del experimento es $60 + 40 = 100$.
        
- Casos favorables (Hombres $\cap$ Tenis) = 25. Total de casos = 100.
        
- Probabilidad conjunta: $P(H \cap T) = \frac{25}{100} = \mathbf{0.25}$.
    

## 5. Teoremas de la Probabilidad Total y de Bayes

    Modelan la probabilidad condicionada avanzada en espacios muestrales partidos en sucesos discretos $A_i$:
    
        
- **Probabilidad Total:** Calcula la probabilidad de un suceso final $B$:
        
$$
P(B) = \sum [P(A_i) \cdot P(B | A_i)]
$$

        
- **Teorema de Bayes:** Calcula la probabilidad a posteriori (la causa $A_i$ dado el efecto $B$):
        
$$
P(A_i | B) = \frac{P(A_i) \cdot P(B | A_i)}{P(B)}
$$

    

### Caso Práctico: Teorema de Bayes

    Una enfermedad afecta al $1\%$ de la población. Un test da positivo en el $95\%$ de los enfermos, pero también da un $2\%$ de falsos positivos en personas sanas. Si una persona da positivo ($+$), ¿cuál es la probabilidad de que esté enferma ($E$)?
    
        
- Datos: $P(E) = 0.01$, $P(\bar{E}) = 0.99$, $P(+|E) = 0.95$, $P(+|\bar{E}) = 0.02$.
        
- Probabilidad Total de dar positivo: $P(+) = 0.01 \cdot 0.95 + 0.99 \cdot 0.02 = 0.0095 + 0.0198 = 0.0293$.
        
- Aplicamos el Teorema de Bayes:
        
$$
P(E | +) = \frac{0.01 \cdot 0.95}{0.0293} = \frac{0.0095}{0.0293} \approx \mathbf{0.324} \quad (32.4\%)
$$

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'probabilidad'
  AND topic_slug = 'probabilidad-combinatoria';

-- normal-tipificacion
UPDATE curriculum_content
SET content_markdown = $MD$

## 1. Parámetros de una Distribución: Media, Varianza y Desviación Típica

    Toda distribución de probabilidad queda caracterizada numéricamente por indicadores de centralización y dispersión:
    
        
- **Media ($\mu$):** Valor esperado o centro de gravedad de la distribución.
        
- **Varianza ($\sigma^2$):** Promedio de los cuadrados de las desviaciones respecto a la media.
        
- **Desviación Típica ($\sigma$):** Raíz cuadrada de la varianza. Expresa la dispersión en las mismas unidades que la variable original.
    

### Caso Práctico: Cálculo de Parámetros de una Variable

    Una variable discreta toma los valores $1$ y $2$ con probabilidades $0.4$ y $0.6$ respectivamente. Halla su media y su desviación típica.
    
        
- Calculamos la media: $\mu = \sum [x_i \cdot P(x_i)] = 1(0.4) + 2(0.6) = 0.4 + 1.2 = \mathbf{1.6}$.
        
- Calculamos el valor esperado de los cuadrados: $\sum [x_i^2 \cdot P(x_i)] = 1^2(0.4) + 2^2(0.6) = 0.4 + 2.4 = 2.8$.
        
- Calculamos la varianza: $\sigma^2 = 2.8 - (1.6)^2 = 2.8 - 2.56 = 0.24$.
        
- Desviación típica: $\sigma = \sqrt{0.24} \approx \mathbf{0.49}$.
    

## 2. Distribución Binomial (Variable Discreta)

    Modela experimentos independientes repetidos $n$ veces donde solo hay dos resultados posibles: éxito ($p$) o fracaso ($q = 1-p$). Se expresa como $X \sim B(n, p)$.
    
        
- **Función de probabilidad:** Probabilidad de obtener exactamente $k$ éxitos:
        
$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot q^{n-k}
$$

        
- **Parámetros directos:** $\mu = n \cdot p \quad \text{y} \quad \sigma = \sqrt{n \cdot p \cdot q}$.
    

### Caso Práctico: Cálculo Binomial

    Lanzamos una moneda equilibrada 4 veces. Calcula la probabilidad de obtener exactamente 3 caras.
    
        
- Identificamos los parámetros: $n = 4$, $p = 0.5$, $q = 0.5$. Sigue una ley $X \sim B(4, \ 0.5)$.
        
- Aplicamos la función para $k = 3$:
        
$$
P(X = 3) = \binom{4}{3} \cdot (0.5)^3 \cdot (0.5)^1 = 4 \cdot 0.125 \cdot 0.5 = \mathbf{0.25} \quad (25\%)
$$

    

## 3. Desigualdad de Chebycheff

    Teorema aplicable a cualquier variable estadística (sin importar su forma o distribución) que permite acotar la probabilidad de que los valores queden fuera de un intervalo simétrico alrededor de la media:
    
$$
P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}
$$

    Determina que la probabilidad de desviarse de la media una distancia mayor o igual a $k$ veces la desviación típica es como máximo $1/k^2$.

### Caso Práctico: Acotación de Chebycheff

    Una variable tiene $\mu = 50$ y $\sigma = 5$. Acota la probabilidad de que $X$ caiga fuera del rango $(40, 60)$.
    
        
- La distancia de desviación máxima permitida en el rango es de $10$ unidades respecto a $50$.
        
- Expresamos dicha distancia según las desviaciones típicas: $k \cdot \sigma = 10 \longrightarrow k \cdot 5 = 10 \longrightarrow k = 2$.
        
- Aplicamos la desigualdad: $P(|X - 50| \ge 10) \le \frac{1}{2^2} = \mathbf{0.25}$. Como máximo es del $25\%$.
    

## 4. Distribuciones de Probabilidad Continuas

    Son aquellas variables que pueden tomar cualquier valor real dentro de un intervalo. No se pueden asignar probabilidades a puntos aislados ($P(X=c) = 0$). Se definen mediante una **función de densidad** $f(x)$, donde la probabilidad de un tramo corresponde al área bajo la curva obtenida mediante integración:
    
$$
P(a \le X \le b) = \int_{a}^{b} f(x) \, dx
$$

### Caso Práctico: Probabilidad en Variables Continuas

    Dada la función de densidad uniforme $f(x) = 0.5$ definida en el intervalo $[0, 2]$, calcula $P(1 \le X \le 2)$.
    
        
- Planteamos la integral definida en la región solicitada:
        
$$
P(1 \le X \le 2) = \int_{1}^{2} 0.5 \, dx = [0.5x]_1^2 = 0.5(2) - 0.5(1) = \mathbf{0.5} \quad (50\%)
$$

    

## 5. Distribución Normal y Tipificación

    Es la distribución continua más importante, simétrica y con forma de campana de Gauss, denotada como $X \sim N(\mu, \sigma)$. Para calcular sus probabilidades usando la tabla estándar $N(0, 1)$, se aplica el proceso de **tipificación**:
    
$$
Z = \frac{X - \mu}{\sigma}
$$

### Caso Práctico: Uso de Tablas Normales

    Sea $X \sim N(10, 2)$, calcula la probabilidad acumulada $P(X \le 13)$.
    
        
- Tipificamos la variable restando la media y dividiendo por la desviación:
        
$$
P(X \le 13) = P\left(Z \le \frac{13 - 10}{2}\right) = P(Z \le 1.5)
$$

        
- Buscamos el valor $1.50$ en el cuerpo de la tabla estándar de la Normal $N(0,1)$:
        
$$
P(Z \le 1.50) = \mathbf{0.9332} \quad (93.32\%)
$$

    

## 6. Aproximación de la Binomial a la Normal (Moivre-Gauss)

    Si el número de repeticiones $n$ de una distribución binomial $X \sim B(n, p)$ es suficientemente grande, se puede aproximar mediante una curva normal continua si se cumplen los requisitos de control: $n \cdot p \ge 5$ y $n \cdot q \ge 5$.
    
        
- La nueva distribución normal tendrá como parámetros derivados:
        
$$
Y \sim N(n \cdot p, \ \sqrt{n \cdot p \cdot q})
$$

    

### Caso Práctico: Cambio de Parámetros de Control

    Aproxima la distribución binomial $X \sim B(100, \ 0.2)$ a una distribución normal.
    
        
- Comprobamos las restricciones: $100 \cdot 0.2 = 20 \ge 5$ y $100 \cdot 0.8 = 80 \ge 5$. Es válida.
        
- Calculamos la media de la campana: $\mu = n \cdot p = 100 \cdot 0.2 = 20$.
        
- Calculamos la desviación típica: $\sigma = \sqrt{100 \cdot 0.2 \cdot 0.8} = \sqrt{16} = 4$.
        
- La distribución aproximada es la variable continua: $\mathbf{Y \sim N(20, 4)}$.

$MD$
WHERE subject = 'matematicas_ii'
  AND block_slug = 'probabilidad'
  AND topic_slug = 'normal-tipificacion';
