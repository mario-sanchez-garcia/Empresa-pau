-- ════════════════════════════════════════
-- algebra-lineal:matrices-operaciones (slug existente)
-- Matrices y Determinantes (Ch1, Ch2)
INSERT INTO curriculum_content (subject, block_slug, topic_slug, content_markdown)
VALUES (
  'matematicas_ii',
  'algebra-lineal',
  'matrices-operaciones',
  $MDDOC$
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

## 6b. Propiedades de la Matriz Traspuesta ($A^t$)

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

## 5. Potencias de Matrices ($A^n$)

    Para hallar potencias elevadas, calcula $A^2$, $A^3$ y busca la regla o patrón numérico que se va repitiendo.

### Caso Práctico Resuelto

    Calcula $A^n$ para $A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix}$:
    
        
- $A^2 = A \cdot A = \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1\cdot1+3\cdot0 & 1\cdot3+3\cdot1 \\ 0\cdot1+1\cdot0 & 0\cdot3+1\cdot1 \end{pmatrix} = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix}$
        
- $A^3 = A^2 \cdot A = \begin{pmatrix} 1 & 6 \\ 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 3 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 9 \\ 0 & 1 \end{pmatrix}$
    
    **Patrón detectado:** El elemento superior derecho es $3 \cdot n$. Por tanto: $A^n = \begin{pmatrix} 1 & 3n \\ 0 & 1 \end{pmatrix}$.

## 6. Rango de una Matriz (Método de Gauss)

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

## 7. Matriz Inversa por Gauss-Jordan

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

## 8. Despejar en Ecuaciones Matriciales

    Para despejar la incógnita $X$, multiplicamos por la inversa del elemento que le estorbe, manteniendo estrictamente el mismo lado en el que se añade.

### Caso Práctico Resuelto

    Resuelve y despeja $X$ en la ecuación $A \cdot X + B = C$:
    
        
- Primero restamos $B$ en ambos lados: $A \cdot X = C - B$
        
- Como la matriz $A$ multiplica a la **izquierda** de la $X$, multiplicamos por $A^{-1}$ por la **izquierda** en el otro lado de la igualdad:
        
$$
X = A^{-1} \cdot (C - B)
$$

    

## 9. Determinantes de Orden 2 y 3 (Regla de Sarrus)

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

## 10. Propiedades Críticas de los Determinantes

    Trucos rápidos que ahorran tiempo en el examen:
    
        
- Si una matriz tiene una **fila o columna de ceros**, su determinante es $0$.
        
- Si tiene **dos filas o columnas iguales o proporcionales**, su determinante es $0$.
        
- El determinante de la traspuesta es igual al de la original: $|A^t| = |A|$.
        
- El determinante de un producto es el producto de determinantes: $|A \cdot B| = |A| \cdot |B|$.
        
- El determinante de la inversa es el inverso del determinante: $|A^{-1}| = \frac{1}{|A|}$.
    

### Caso Práctico: Aplicación de Propiedades

    Sabiendo que $A$ es una matriz $3 \times 3$ con $|A| = 5$, calcula sin desarrollar:
    
        
- **$|A^{-1**|$:} Aplicando la propiedad, $|A^{-1}| = \frac{1}{|A|} = \frac{1}{5}$.
        
- **$|A \cdot A^t|$:** Aplicando las propiedades, $|A \cdot A^t| = |A| \cdot |A^t| = |A| \cdot |A| = 5 \cdot 5 = 25$.
    

## 10b. Determinante de Matrices Triangulares (Hacer Ceros)

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

    

## 11. Cálculo de la Inversa por Adjuntos

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
$MDDOC$
)
ON CONFLICT (subject, block_slug, topic_slug)
DO UPDATE SET content_markdown = EXCLUDED.content_markdown;
